import { DurableObject } from 'cloudflare:workers';
import {
  type ChatMessage,
  type MultiplayerSettings,
  type PublicRoomSummary,
  type RoomPlayer,
  type RoomState,
  type RoomVisibility,
  type RoundReveal,
  type TriviaQuestion,
} from '../shared/types.js';
import type { RoomClientMessage, RoomServerMessage } from '../shared/protocol.js';
import { generateQuizQuestions, getQuizDisplayTitle, toPublicQuestion } from '../shared/catalog.js';
import { calculateAnswerScore } from '../shared/scoring.js';
import type { Env } from './env.js';

interface RoomSocketAttachment {
  playerId: string;
  name: string;
}

interface StoredAnswer {
  playerId: string;
  choiceIndex: number;
  responseMs: number;
}

interface ScheduledBotAnswer {
  botId: string;
  fireAt: number;
  choiceIndex: number;
  answered: boolean;
}

export interface InitRoomInput {
  code: string;
  name: string;
  visibility: RoomVisibility;
  hostId: string;
  hostName: string;
  settings: MultiplayerSettings;
  autoStartParticipants?: { playerId: string; name: string }[];
}

const COUNTDOWN_MS = 3200;
const REVEAL_MS = 5000;
const IDLE_CLEANUP_MS = 30 * 60 * 1000;

const AVATAR_PALETTE = [
  '#a78bfa',
  '#38bdf8',
  '#34d399',
  '#f59e0b',
  '#f472b6',
  '#fb7185',
  '#60a5fa',
  '#c084fc',
];

const BOT_NAMES = [
  'Atlas Bot',
  'Meridian AI',
  'Vexilla Bot',
  'QuizSpark',
  'GeoWhiz AI',
  'Nova Bot',
];

function secureRandomFloat(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

function pickAvatarColor(index: number): string {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

function createPlayer(params: {
  playerId: string;
  name: string;
  avatarIndex: number;
  isHost: boolean;
  isBot?: boolean;
  botSkill?: 'casual' | 'pro';
  connected?: boolean;
}): RoomPlayer {
  return {
    playerId: params.playerId,
    name: params.name,
    avatarColor: pickAvatarColor(params.avatarIndex),
    isBot: Boolean(params.isBot),
    botSkill: params.botSkill,
    connected: params.connected ?? true,
    isHost: params.isHost,
    ready: params.isHost || Boolean(params.isBot),
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    totalAnswered: 0,
    totalResponseMs: 0,
    hasAnsweredCurrent: false,
    lastPointsEarned: 0,
    lastCorrect: null,
    lastChoiceIndex: null,
  };
}

export class TriviaRoomDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS kv (
          k TEXT PRIMARY KEY,
          v TEXT NOT NULL
        )
      `);
    });
  }

  // --- SQLite KV helpers (persist-first) ---

  private readJson<T>(key: string): T | null {
    const rows = this.ctx.storage.sql
      .exec<{ v: string }>('SELECT v FROM kv WHERE k = ?', key)
      .toArray();
    if (rows.length === 0) return null;
    try {
      return JSON.parse(rows[0].v) as T;
    } catch {
      return null;
    }
  }

  private writeJson(key: string, value: unknown): void {
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)',
      key,
      JSON.stringify(value)
    );
  }

  private clearAllStorage(): void {
    this.ctx.storage.sql.exec('DELETE FROM kv');
  }

  // --- RPC Methods ---

  async roomExists(): Promise<boolean> {
    return this.readJson<RoomState>('room') !== null;
  }

  async initRoom(input: InitRoomInput): Promise<RoomState> {
    const now = Date.now();
    const players: RoomPlayer[] = [];

    if (input.autoStartParticipants && input.autoStartParticipants.length > 0) {
      input.autoStartParticipants.forEach((p, idx) => {
        players.push(
          createPlayer({
            playerId: p.playerId,
            name: p.name,
            avatarIndex: idx,
            isHost: idx === 0,
            connected: false,
          })
        );
      });
    } else {
      players.push(
        createPlayer({
          playerId: input.hostId,
          name: input.hostName,
          avatarIndex: 0,
          isHost: true,
          connected: false,
        })
      );
    }

    const room: RoomState = {
      code: input.code,
      name: input.name,
      visibility: input.visibility,
      hostId: input.hostId,
      createdAt: now,
      phase: 'waiting',
      settings: input.settings,
      players,
      currentQuestionIndex: -1,
      totalQuestions: input.settings.questionCount,
      phaseEndsAt: null,
      questionStartedAt: null,
      currentQuestion: null,
      reveal: null,
      history: [],
      chat: [
        {
          id: crypto.randomUUID(),
          playerId: 'system',
          senderName: 'System',
          text: `Room ${input.code} created! Share the code or invite link so friends can join.`,
          timestamp: now,
          system: true,
        },
      ],
    };

    this.writeJson('room', room);
    this.writeJson('questions', []);
    this.writeJson('answers', []);
    this.writeJson('botPlan', []);

    if (input.autoStartParticipants && input.autoStartParticipants.length >= 2) {
      await this.startMatchInternal(room);
    } else {
      await this.ctx.storage.setAlarm(now + IDLE_CLEANUP_MS);
      await this.syncLobbySummary(room);
    }

    return room;
  }

  // --- WebSocket Hibernation Handlers ---

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const room = this.readJson<RoomState>('room');
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    if (!room) {
      this.ctx.acceptWebSocket(server);
      this.sendJson(server, { type: 'room:error', error: 'Room not found or expired.' });
      server.close(4004, 'Room not found');
      return new Response(null, { status: 101, webSocket: client });
    }

    const url = new URL(request.url);
    const playerId =
      (url.searchParams.get('playerId') || '').trim().slice(0, 64) || crypto.randomUUID();
    const name = (url.searchParams.get('name') || 'Player').trim().slice(0, 20) || 'Player';

    let existing = room.players.find((p) => p.playerId === playerId);
    if (!existing) {
      if (room.players.length >= room.settings.maxPlayers) {
        this.ctx.acceptWebSocket(server);
        this.sendJson(server, {
          type: 'room:error',
          error: `Room ${room.code} is full (${room.settings.maxPlayers}/${room.settings.maxPlayers} players).`,
        });
        server.close(4004, 'Room full');
        return new Response(null, { status: 101, webSocket: client });
      }

      const newPlayer = createPlayer({
        playerId,
        name,
        avatarIndex: room.players.length,
        isHost: room.players.filter((p) => !p.isBot).length === 0,
        connected: true,
      });
      if (newPlayer.isHost) {
        room.hostId = playerId;
      }
      room.players.push(newPlayer);
      existing = newPlayer;
      this.appendSystemChat(room, `${name} joined the room.`);
    } else {
      existing.connected = true;
      existing.name = name;
    }

    // Close duplicate sockets for the same playerId
    for (const other of this.ctx.getWebSockets()) {
      const att = this.getAttachment(other);
      if (att && att.playerId === playerId) {
        try {
          other.close(1000, 'Replaced by new connection');
        } catch {
          // ignore
        }
      }
    }

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ playerId, name } satisfies RoomSocketAttachment);

    this.writeJson('room', room);
    await this.syncLobbySummary(room);
    this.broadcastState(room);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;
    let msg: RoomClientMessage;
    try {
      msg = JSON.parse(message) as RoomClientMessage;
    } catch {
      return;
    }

    const att = this.getAttachment(ws);
    if (!att) return;

    if (msg.type === 'ping') {
      this.sendJson(ws, { type: 'pong' });
      return;
    }

    const room = this.readJson<RoomState>('room');
    if (!room) {
      this.sendJson(ws, { type: 'room:error', error: 'Room has expired.' });
      return;
    }

    const player = room.players.find((p) => p.playerId === att.playerId);
    if (!player) return;

    if (msg.type === 'player:identify') {
      const cleanName = (msg.name || '').trim().slice(0, 20);
      if (cleanName && cleanName !== player.name) {
        player.name = cleanName;
        att.name = cleanName;
        ws.serializeAttachment(att);
        this.writeJson('room', room);
        await this.syncLobbySummary(room);
        this.broadcastState(room);
      }
      return;
    }

    if (msg.type === 'room:chat') {
      const text = (msg.text || '').trim().slice(0, 220);
      if (!text) return;
      const chatMsg: ChatMessage = {
        id: crypto.randomUUID(),
        playerId: player.playerId,
        senderName: player.name,
        text,
        timestamp: Date.now(),
      };
      room.chat = [...room.chat.slice(-49), chatMsg];
      this.writeJson('room', room);
      this.broadcastJson({ type: 'room:chat', message: chatMsg });
      return;
    }

    if (msg.type === 'room:ready') {
      if (room.phase !== 'waiting') return;
      player.ready = Boolean(msg.ready);
      this.writeJson('room', room);
      this.broadcastState(room);
      return;
    }

    if (msg.type === 'room:settings') {
      if (room.hostId !== player.playerId || room.phase !== 'waiting') {
        if (msg.reqId) {
          this.sendJson(ws, {
            type: 'ack',
            reqId: msg.reqId,
            ok: false,
            error: 'Only the host can change settings before the match starts.',
          });
        }
        return;
      }

      const next = msg.settings;
      if (typeof next.quizId === 'string' && next.quizId.trim()) {
        room.settings.quizId = next.quizId.trim().slice(0, 40);
      }
      if (
        next.difficulty === 'all' ||
        next.difficulty === 'easy' ||
        next.difficulty === 'medium' ||
        next.difficulty === 'hard'
      ) {
        room.settings.difficulty = next.difficulty;
      }
      if (
        next.region === 'all' ||
        next.region === 'Europe' ||
        next.region === 'Asia' ||
        next.region === 'Americas' ||
        next.region === 'Africa' ||
        next.region === 'Oceania'
      ) {
        room.settings.region = next.region;
      }
      if (next.questionCount && [5, 10, 15, 20].includes(next.questionCount)) {
        room.settings.questionCount = next.questionCount;
        room.totalQuestions = next.questionCount;
      }
      if (next.secondsPerQuestion && [10, 12, 15, 20, 30].includes(next.secondsPerQuestion)) {
        room.settings.secondsPerQuestion = next.secondsPerQuestion;
      }
      if (typeof next.maxPlayers === 'number') {
        room.settings.maxPlayers = Math.max(
          Math.max(2, room.players.length),
          Math.min(8, Math.round(next.maxPlayers))
        );
      }

      this.writeJson('room', room);
      await this.syncLobbySummary(room);
      this.broadcastState(room);
      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });
      return;
    }

    if (msg.type === 'room:bot:add') {
      if (room.hostId !== player.playerId || room.phase !== 'waiting') {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Only the host can add bots.' });
        }
        return;
      }
      if (room.players.length >= room.settings.maxPlayers) {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Room is full.' });
        }
        return;
      }

      const existingBots = room.players.filter((p) => p.isBot).length;
      const skill = msg.skill === 'pro' ? 'pro' : 'casual';
      const baseName = BOT_NAMES[existingBots % BOT_NAMES.length];
      const botName = skill === 'pro' ? `${baseName} ★` : baseName;
      const bot = createPlayer({
        playerId: `bot_${crypto.randomUUID().slice(0, 8)}`,
        name: botName,
        avatarIndex: room.players.length,
        isHost: false,
        isBot: true,
        botSkill: skill,
        connected: true,
      });
      room.players.push(bot);
      this.appendSystemChat(room, `${bot.name} (${skill === 'pro' ? 'Pro AI' : 'Casual AI'}) joined.`);
      this.writeJson('room', room);
      await this.syncLobbySummary(room);
      this.broadcastState(room);
      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });
      return;
    }

    if (msg.type === 'room:bot:remove') {
      if (room.hostId !== player.playerId || room.phase !== 'waiting') {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Only the host can remove bots.' });
        }
        return;
      }
      room.players = room.players.filter((p) => !(p.isBot && p.playerId === msg.botId));
      this.writeJson('room', room);
      await this.syncLobbySummary(room);
      this.broadcastState(room);
      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });
      return;
    }

    if (msg.type === 'room:kick') {
      if (room.hostId !== player.playerId || msg.targetPlayerId === player.playerId) return;
      const target = room.players.find((p) => p.playerId === msg.targetPlayerId);
      if (!target) return;

      room.players = room.players.filter((p) => p.playerId !== msg.targetPlayerId);
      this.appendSystemChat(room, `${target.name} was removed by the host.`);
      for (const s of this.ctx.getWebSockets()) {
        const satt = this.getAttachment(s);
        if (satt?.playerId === msg.targetPlayerId) {
          this.sendJson(s, { type: 'room:error', error: 'You were removed from the room by the host.' });
          try {
            s.close(4004, 'Kicked');
          } catch {
            // ignore
          }
        }
      }
      this.writeJson('room', room);
      await this.syncLobbySummary(room);
      this.broadcastState(room);
      return;
    }

    if (msg.type === 'room:start') {
      if (room.hostId !== player.playerId) {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Only the host can start the match.' });
        }
        return;
      }
      if (room.phase !== 'waiting' && room.phase !== 'finished') {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Match already in progress.' });
        }
        return;
      }
      if (room.players.length < 2) {
        if (msg.reqId) {
          this.sendJson(ws, {
            type: 'ack',
            reqId: msg.reqId,
            ok: false,
            error: 'Need at least 2 players to start (invite a friend or add an AI bot!).',
          });
        }
        return;
      }

      await this.startMatchInternal(room);
      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });
      return;
    }

    if (msg.type === 'game:rematch') {
      if (room.hostId !== player.playerId || room.phase !== 'finished') {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Only the host can reset to lobby.' });
        }
        return;
      }

      room.phase = 'waiting';
      room.currentQuestionIndex = -1;
      room.phaseEndsAt = null;
      room.questionStartedAt = null;
      room.currentQuestion = null;
      room.reveal = null;
      room.history = [];
      for (const p of room.players) {
        p.score = 0;
        p.streak = 0;
        p.bestStreak = 0;
        p.correctCount = 0;
        p.totalAnswered = 0;
        p.totalResponseMs = 0;
        p.hasAnsweredCurrent = false;
        p.lastPointsEarned = 0;
        p.lastCorrect = null;
        p.lastChoiceIndex = null;
        p.ready = p.isHost || p.isBot;
      }

      this.writeJson('room', room);
      this.writeJson('questions', []);
      this.writeJson('answers', []);
      this.writeJson('botPlan', []);
      await this.ctx.storage.setAlarm(Date.now() + IDLE_CLEANUP_MS);
      await this.syncLobbySummary(room);
      this.broadcastState(room);
      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });
      return;
    }

    if (msg.type === 'game:answer') {
      if (room.phase !== 'question' || !room.questionStartedAt) {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Not currently accepting answers.' });
        }
        return;
      }
      if (player.hasAnsweredCurrent) {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Already answered.' });
        }
        return;
      }

      const choice = Math.floor(msg.choiceIndex);
      if (choice < 0 || choice > 3) {
        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: false, error: 'Invalid option.' });
        }
        return;
      }

      const responseMs = Math.max(50, Date.now() - room.questionStartedAt);
      const answers = this.readJson<StoredAnswer[]>('answers') ?? [];
      answers.push({ playerId: player.playerId, choiceIndex: choice, responseMs });
      player.hasAnsweredCurrent = true;
      player.lastChoiceIndex = choice;

      this.writeJson('answers', answers);
      this.writeJson('room', room);

      if (msg.reqId) this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true });

      if (this.allActivePlayersAnswered(room)) {
        await this.resolveCurrentQuestion(room);
      } else {
        this.broadcastState(room);
      }
      return;
    }

    if (msg.type === 'room:leave') {
      await this.handlePlayerLeave(room, player.playerId, true);
      try {
        ws.close(1000, 'Left room');
      } catch {
        // ignore
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const att = this.getAttachment(ws);
    if (!att) return;
    const room = this.readJson<RoomState>('room');
    if (!room) return;

    // Check if player still has another open socket
    const stillConnected = this.ctx
      .getWebSockets()
      .some((other) => other !== ws && this.getAttachment(other)?.playerId === att.playerId);
    if (stillConnected) return;

    await this.handlePlayerLeave(room, att.playerId, false);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws);
  }

  // --- Durable Object Alarm State Machine ---

  async alarm(): Promise<void> {
    const room = this.readJson<RoomState>('room');
    if (!room) return;

    const now = Date.now();

    // Idle cleanup when in waiting/finished with no connected humans
    if (room.phase === 'waiting' || room.phase === 'finished') {
      const anyConnectedHuman = room.players.some((p) => !p.isBot && p.connected);
      if (!anyConnectedHuman) {
        await this.destroyRoom(room.code);
        return;
      }
      await this.ctx.storage.setAlarm(now + IDLE_CLEANUP_MS);
      return;
    }

    if (room.phase === 'countdown') {
      await this.startQuestion(room, 0);
      return;
    }

    if (room.phase === 'question') {
      // Process any due bot answers first
      const botPlan = this.readJson<ScheduledBotAnswer[]>('botPlan') ?? [];
      const answers = this.readJson<StoredAnswer[]>('answers') ?? [];
      let changed = false;

      for (const plan of botPlan) {
        if (!plan.answered && plan.fireAt <= now + 80) {
          plan.answered = true;
          const botPlayer = room.players.find((p) => p.playerId === plan.botId);
          if (botPlayer && !botPlayer.hasAnsweredCurrent && room.questionStartedAt) {
            botPlayer.hasAnsweredCurrent = true;
            botPlayer.lastChoiceIndex = plan.choiceIndex;
            answers.push({
              playerId: botPlayer.playerId,
              choiceIndex: plan.choiceIndex,
              responseMs: Math.max(500, plan.fireAt - room.questionStartedAt),
            });
            changed = true;
          }
        }
      }

      if (changed) {
        this.writeJson('botPlan', botPlan);
        this.writeJson('answers', answers);
        this.writeJson('room', room);
      }

      const timerExpired = room.phaseEndsAt !== null && now >= room.phaseEndsAt - 50;
      if (timerExpired || this.allActivePlayersAnswered(room)) {
        await this.resolveCurrentQuestion(room);
        return;
      }

      if (changed) {
        this.broadcastState(room);
      }
      await this.scheduleNextQuestionAlarm(room, botPlan);
      return;
    }

    if (room.phase === 'reveal') {
      const questions = this.readJson<TriviaQuestion[]>('questions') ?? [];
      const nextIdx = room.currentQuestionIndex + 1;
      if (nextIdx < questions.length) {
        await this.startQuestion(room, nextIdx);
      } else {
        await this.finishMatch(room);
      }
    }
  }

  // --- Match Progression Helpers ---

  private async startMatchInternal(room: RoomState): Promise<void> {
    const questions = generateQuizQuestions({
      quizId: room.settings.quizId,
      count: room.settings.questionCount,
      difficulty: room.settings.difficulty,
      region: room.settings.region,
      direction: 'mixed',
    });

    const now = Date.now();
    room.phase = 'countdown';
    room.totalQuestions = questions.length;
    room.currentQuestionIndex = -1;
    room.currentQuestion = null;
    room.reveal = null;
    room.history = [];
    room.questionStartedAt = null;
    room.phaseEndsAt = now + COUNTDOWN_MS;

    for (const p of room.players) {
      p.score = 0;
      p.streak = 0;
      p.bestStreak = 0;
      p.correctCount = 0;
      p.totalAnswered = 0;
      p.totalResponseMs = 0;
      p.hasAnsweredCurrent = false;
      p.lastPointsEarned = 0;
      p.lastCorrect = null;
      p.lastChoiceIndex = null;
    }

    this.appendSystemChat(
      room,
      `Match starting: ${getQuizDisplayTitle(room.settings.quizId)} (${questions.length} questions · ${room.settings.secondsPerQuestion}s each)!`
    );

    this.writeJson('questions', questions);
    this.writeJson('answers', []);
    this.writeJson('botPlan', []);
    this.writeJson('room', room);

    await this.ctx.storage.setAlarm(room.phaseEndsAt);
    await this.syncLobbySummary(room);
    this.broadcastState(room);
  }

  private async startQuestion(room: RoomState, index: number): Promise<void> {
    const questions = this.readJson<TriviaQuestion[]>('questions') ?? [];
    const q = questions[index];
    if (!q) {
      await this.finishMatch(room);
      return;
    }

    const now = Date.now();
    const durationMs = room.settings.secondsPerQuestion * 1000;
    room.phase = 'question';
    room.currentQuestionIndex = index;
    room.questionStartedAt = now;
    room.phaseEndsAt = now + durationMs;
    room.currentQuestion = toPublicQuestion(q);
    room.reveal = null;

    for (const p of room.players) {
      p.hasAnsweredCurrent = false;
      p.lastPointsEarned = 0;
      p.lastCorrect = null;
      p.lastChoiceIndex = null;
    }

    // Plan realistic AI bot responses
    const botPlan: ScheduledBotAnswer[] = [];
    for (const p of room.players) {
      if (!p.isBot) continue;
      const isPro = p.botSkill === 'pro';
      const accuracy = isPro ? 0.84 : 0.58;
      const willBeRight = secureRandomFloat() < accuracy;
      let choiceIndex = q.correctIndex;
      if (!willBeRight) {
        const wrongChoices = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);
        choiceIndex = wrongChoices[Math.floor(secureRandomFloat() * wrongChoices.length)];
      }
      const minDelay = isPro ? 1600 : 3200;
      const maxDelay = Math.min(durationMs - 1000, isPro ? 6200 : 10500);
      const safeMax = Math.max(minDelay + 500, maxDelay);
      const delay = Math.round(minDelay + secureRandomFloat() * (safeMax - minDelay));

      botPlan.push({
        botId: p.playerId,
        fireAt: now + delay,
        choiceIndex,
        answered: false,
      });
    }

    this.writeJson('answers', []);
    this.writeJson('botPlan', botPlan);
    this.writeJson('room', room);

    await this.scheduleNextQuestionAlarm(room, botPlan);
    this.broadcastState(room);
  }

  private async scheduleNextQuestionAlarm(
    room: RoomState,
    botPlan: ScheduledBotAnswer[]
  ): Promise<void> {
    if (!room.phaseEndsAt) return;
    let nextTime = room.phaseEndsAt;
    for (const b of botPlan) {
      if (!b.answered && b.fireAt < nextTime) {
        nextTime = b.fireAt;
      }
    }
    await this.ctx.storage.setAlarm(Math.max(Date.now() + 150, nextTime));
  }

  private allActivePlayersAnswered(room: RoomState): boolean {
    const activePlayers = room.players.filter((p) => p.isBot || p.connected);
    if (activePlayers.length === 0) return true;
    return activePlayers.every((p) => p.hasAnsweredCurrent);
  }

  private async resolveCurrentQuestion(room: RoomState): Promise<void> {
    const questions = this.readJson<TriviaQuestion[]>('questions') ?? [];
    const q = questions[room.currentQuestionIndex];
    if (!q) {
      await this.finishMatch(room);
      return;
    }

    const answers = this.readJson<StoredAnswer[]>('answers') ?? [];
    const answerByPlayer = new Map<string, StoredAnswer>();
    for (const a of answers) {
      answerByPlayer.set(a.playerId, a);
    }

    const optionCounts = [0, 0, 0, 0];
    const timeLimitMs = room.settings.secondsPerQuestion * 1000;
    let fastestPlayerId: string | null = null;
    let fastestPlayerName: string | null = null;
    let fastestMs: number | null = null;
    let correctPlayersCount = 0;

    for (const p of room.players) {
      const ans = answerByPlayer.get(p.playerId);
      if (ans && ans.choiceIndex >= 0 && ans.choiceIndex < 4) {
        optionCounts[ans.choiceIndex]++;
        p.totalAnswered++;
        p.totalResponseMs += ans.responseMs;

        const isCorrect = ans.choiceIndex === q.correctIndex;
        if (isCorrect) {
          correctPlayersCount++;
          p.streak++;
          if (p.streak > p.bestStreak) p.bestStreak = p.streak;
          p.correctCount++;

          const scored = calculateAnswerScore({
            correct: true,
            responseMs: ans.responseMs,
            timeLimitMs,
            newStreak: p.streak,
          });
          p.score += scored.points;
          p.lastPointsEarned = scored.points;
          p.lastCorrect = true;

          if (fastestMs === null || ans.responseMs < fastestMs) {
            fastestMs = ans.responseMs;
            fastestPlayerId = p.playerId;
            fastestPlayerName = p.name;
          }
        } else {
          p.streak = 0;
          p.lastPointsEarned = 0;
          p.lastCorrect = false;
        }
      } else {
        p.streak = 0;
        p.lastPointsEarned = 0;
        p.lastCorrect = false;
      }
    }

    const reveal: RoundReveal = {
      questionIndex: room.currentQuestionIndex,
      correctIndex: q.correctIndex,
      correctText: q.options[q.correctIndex].text,
      explanation: q.explanation,
      optionCounts,
      fastestPlayerId,
      fastestPlayerName,
      fastestMs,
    };

    room.phase = 'reveal';
    room.reveal = reveal;
    room.phaseEndsAt = Date.now() + REVEAL_MS;
    room.history.push({
      questionIndex: room.currentQuestionIndex,
      prompt: q.prompt,
      quizTitle: q.quizTitle,
      media: q.media,
      correctText: reveal.correctText,
      explanation: q.explanation,
      correctRate: room.players.length > 0 ? correctPlayersCount / room.players.length : 0,
    });

    this.writeJson('room', room);
    await this.ctx.storage.setAlarm(room.phaseEndsAt);
    this.broadcastState(room);
  }

  private async finishMatch(room: RoomState): Promise<void> {
    room.phase = 'finished';
    room.phaseEndsAt = null;
    room.questionStartedAt = null;

    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    if (winner) {
      this.appendSystemChat(
        room,
        `Match complete! ${winner.name} takes 1st place with ${winner.score.toLocaleString()} pts!`
      );
    }

    this.writeJson('room', room);
    await this.ctx.storage.setAlarm(Date.now() + IDLE_CLEANUP_MS);
    await this.syncLobbySummary(room);
    this.broadcastState(room);
  }

  private async handlePlayerLeave(
    room: RoomState,
    playerId: string,
    explicitLeave: boolean
  ): Promise<void> {
    const idx = room.players.findIndex((p) => p.playerId === playerId);
    if (idx === -1) return;
    const player = room.players[idx];

    if (explicitLeave || room.phase === 'waiting') {
      room.players.splice(idx, 1);
      this.appendSystemChat(room, `${player.name} left the room.`);
    } else {
      player.connected = false;
    }

    // Reassign host if needed
    if (room.hostId === playerId) {
      const nextHost =
        room.players.find((p) => !p.isBot && p.connected) ??
        room.players.find((p) => !p.isBot);
      if (nextHost) {
        room.hostId = nextHost.playerId;
        for (const p of room.players) {
          p.isHost = p.playerId === nextHost.playerId;
        }
        this.appendSystemChat(room, `${nextHost.name} is now the room host.`);
      }
    }

    const remainingConnectedHumans = room.players.filter((p) => !p.isBot && p.connected);
    if (remainingConnectedHumans.length === 0 && room.phase === 'waiting') {
      await this.destroyRoom(room.code);
      return;
    }

    this.writeJson('room', room);
    await this.syncLobbySummary(room);

    if (room.phase === 'question' && this.allActivePlayersAnswered(room)) {
      await this.resolveCurrentQuestion(room);
    } else {
      this.broadcastState(room);
    }
  }

  private async destroyRoom(code: string): Promise<void> {
    this.clearAllStorage();
    await this.ctx.storage.deleteAlarm();
    try {
      await this.env.LOBBY.getByName('global').removeRoomSummary(code);
    } catch {
      // ignore
    }
  }

  private async syncLobbySummary(room: RoomState): Promise<void> {
    try {
      if (room.visibility !== 'public') {
        await this.env.LOBBY.getByName('global').removeRoomSummary(room.code);
        return;
      }
      const host = room.players.find((p) => p.playerId === room.hostId);
      const summary: PublicRoomSummary = {
        code: room.code,
        name: room.name,
        hostName: host?.name ?? 'Host',
        quizId: room.settings.quizId,
        quizTitle: getQuizDisplayTitle(room.settings.quizId),
        difficulty: room.settings.difficulty,
        phase: room.phase,
        playerCount: room.players.length,
        maxPlayers: room.settings.maxPlayers,
        questionCount: room.settings.questionCount,
        secondsPerQuestion: room.settings.secondsPerQuestion,
        createdAt: room.createdAt,
      };
      await this.env.LOBBY.getByName('global').upsertRoomSummary(summary);
    } catch {
      // Best-effort lobby sync
    }
  }

  private appendSystemChat(room: RoomState, text: string): void {
    room.chat = [
      ...room.chat.slice(-49),
      {
        id: crypto.randomUUID(),
        playerId: 'system',
        senderName: 'System',
        text,
        timestamp: Date.now(),
        system: true,
      },
    ];
  }

  private getAttachment(ws: WebSocket): RoomSocketAttachment | null {
    try {
      return ws.deserializeAttachment() as RoomSocketAttachment | null;
    } catch {
      return null;
    }
  }

  private sendJson(ws: WebSocket, payload: RoomServerMessage): void {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  private broadcastJson(payload: RoomServerMessage): void {
    const raw = JSON.stringify(payload);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(raw);
      } catch {
        // ignore
      }
    }
  }

  private broadcastState(room: RoomState): void {
    this.broadcastJson({
      type: 'room:state',
      room,
      serverTime: Date.now(),
    });
  }
}
