import { DurableObject } from 'cloudflare:workers';
import {
  MATCHMAKING_QUEUES,
  type MatchmakingStatus,
  type MultiplayerSettings,
  type PublicRoomSummary,
  type RoomVisibility,
} from '../shared/types.js';
import type { LobbyClientMessage, LobbyServerMessage } from '../shared/protocol.js';
import { appendQuestionHistory, mergePlayerQuestionHistories } from '../shared/catalog.js';
import type { Env } from './env.js';

interface LobbyAttachment {
  playerId: string;
  name: string;
  queueId: string | null;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_TTL_MS = 3 * 60 * 60 * 1000;
const HISTORY_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_PLAYER_HISTORY_IDS = 400;
const MAX_MERGED_HISTORY_IDS = 600;

function secureRandomIndex(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function generateSecureRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[secureRandomIndex(CODE_CHARS.length)];
  }
  return code;
}

function sanitizeSettings(partial?: Partial<MultiplayerSettings>): MultiplayerSettings {
  const validCounts = [5, 10, 15, 20];
  const validSeconds = [10, 12, 15, 20, 30];
  const questionCount =
    partial?.questionCount && validCounts.includes(partial.questionCount)
      ? partial.questionCount
      : 10;
  const secondsPerQuestion =
    partial?.secondsPerQuestion && validSeconds.includes(partial.secondsPerQuestion)
      ? partial.secondsPerQuestion
      : 15;
  const maxPlayers = Math.max(2, Math.min(8, Math.round(partial?.maxPlayers ?? 6)));

  return {
    quizId: (partial?.quizId || 'mixed').slice(0, 40),
    difficulty:
      partial?.difficulty === 'easy' ||
      partial?.difficulty === 'medium' ||
      partial?.difficulty === 'hard'
        ? partial.difficulty
        : 'all',
    region:
      partial?.region === 'Europe' ||
      partial?.region === 'Asia' ||
      partial?.region === 'Americas' ||
      partial?.region === 'Africa' ||
      partial?.region === 'Oceania'
        ? partial.region
        : 'all',
    questionCount,
    secondsPerQuestion,
    maxPlayers,
  };
}

export class TriviaLobbyDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS public_rooms (
          code TEXT PRIMARY KEY,
          summary_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS player_question_history (
          player_id TEXT PRIMARY KEY,
          ids_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    });
  }

  // --- RPC methods called by Worker & TriviaRoomDO ---

  async getPublicRooms(): Promise<PublicRoomSummary[]> {
    const cutoff = Date.now() - ROOM_TTL_MS;
    this.ctx.storage.sql.exec('DELETE FROM public_rooms WHERE updated_at < ?', cutoff);

    const rows = this.ctx.storage.sql
      .exec<{ summary_json: string }>('SELECT summary_json FROM public_rooms')
      .toArray();

    const summaries: PublicRoomSummary[] = [];
    for (const row of rows) {
      try {
        summaries.push(JSON.parse(row.summary_json) as PublicRoomSummary);
      } catch {
        // Ignore corrupted row
      }
    }

    return summaries.sort((a, b) => {
      const aJoinable = a.phase === 'waiting' && a.playerCount < a.maxPlayers ? 1 : 0;
      const bJoinable = b.phase === 'waiting' && b.playerCount < b.maxPlayers ? 1 : 0;
      if (aJoinable !== bJoinable) return bJoinable - aJoinable;
      return b.createdAt - a.createdAt;
    });
  }

  async upsertRoomSummary(summary: PublicRoomSummary): Promise<void> {
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO public_rooms (code, summary_json, updated_at) VALUES (?, ?, ?)',
      summary.code,
      JSON.stringify(summary),
      Date.now()
    );
    await this.broadcastPublicRooms();
  }

  async removeRoomSummary(code: string): Promise<void> {
    this.ctx.storage.sql.exec('DELETE FROM public_rooms WHERE code = ?', code);
    await this.broadcastPublicRooms();
  }

  async getRecentQuestionIds(playerIds: string[]): Promise<string[]> {
    const unique = Array.from(
      new Set(playerIds.map((id) => id.trim()).filter((id) => id.length > 0))
    ).slice(0, 16);
    if (unique.length === 0) return [];

    const cutoff = Date.now() - HISTORY_TTL_MS;
    this.ctx.storage.sql.exec(
      'DELETE FROM player_question_history WHERE updated_at < ?',
      cutoff
    );

    const histories: string[][] = [];
    for (const pid of unique) {
      const rows = this.ctx.storage.sql
        .exec<{ ids_json: string }>(
          'SELECT ids_json FROM player_question_history WHERE player_id = ?',
          pid
        )
        .toArray();
      if (rows.length === 0) continue;
      try {
        const parsed = JSON.parse(rows[0].ids_json);
        if (Array.isArray(parsed)) {
          histories.push(parsed.filter((x): x is string => typeof x === 'string'));
        }
      } catch {
        // Ignore corrupted history row
      }
    }

    return mergePlayerQuestionHistories(histories, MAX_MERGED_HISTORY_IDS);
  }

  async recordPlayedQuestions(playerIds: string[], questionIds: string[]): Promise<void> {
    const uniquePlayers = Array.from(
      new Set(playerIds.map((id) => id.trim()).filter((id) => id.length > 0))
    ).slice(0, 16);
    const cleanQuestions = questionIds.map((id) => id.trim()).filter((id) => id.length > 0);
    if (uniquePlayers.length === 0 || cleanQuestions.length === 0) return;

    const now = Date.now();
    for (const pid of uniquePlayers) {
      let existing: string[] = [];
      const rows = this.ctx.storage.sql
        .exec<{ ids_json: string }>(
          'SELECT ids_json FROM player_question_history WHERE player_id = ?',
          pid
        )
        .toArray();
      if (rows.length > 0) {
        try {
          const parsed = JSON.parse(rows[0].ids_json);
          if (Array.isArray(parsed)) {
            existing = parsed.filter((x): x is string => typeof x === 'string');
          }
        } catch {
          existing = [];
        }
      }

      const updated = appendQuestionHistory(existing, cleanQuestions, MAX_PLAYER_HISTORY_IDS);
      this.ctx.storage.sql.exec(
        'INSERT OR REPLACE INTO player_question_history (player_id, ids_json, updated_at) VALUES (?, ?, ?)',
        pid,
        JSON.stringify(updated),
        now
      );
    }
  }

  // --- WebSocket Hibernation lifecycle ---

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const url = new URL(request.url);
    const playerId =
      (url.searchParams.get('playerId') || '').trim().slice(0, 64) || crypto.randomUUID();
    const name = (url.searchParams.get('name') || 'Player').trim().slice(0, 20) || 'Player';

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    const attachment: LobbyAttachment = {
      playerId,
      name,
      queueId: null,
    };
    server.serializeAttachment(attachment);

    const rooms = await this.getPublicRooms();
    this.sendJson(server, { type: 'lobby:rooms', rooms });
    this.broadcastMatchmakingStatus();

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;
    let msg: LobbyClientMessage;
    try {
      msg = JSON.parse(message) as LobbyClientMessage;
    } catch {
      return;
    }

    const att = this.getAttachment(ws);
    if (!att) return;

    if (msg.type === 'ping') {
      this.sendJson(ws, { type: 'pong' });
      return;
    }

    if (msg.type === 'player:identify') {
      const cleanName = (msg.name || '').trim().slice(0, 20);
      if (cleanName) {
        att.name = cleanName;
        ws.serializeAttachment(att);
      }
      return;
    }

    if (msg.type === 'lobby:list') {
      const rooms = await this.getPublicRooms();
      this.sendJson(ws, { type: 'lobby:rooms', rooms });
      if (msg.reqId) {
        this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true, rooms });
      }
      return;
    }

    if (msg.type === 'room:create') {
      const visibility: RoomVisibility = msg.visibility === 'private' ? 'private' : 'public';
      const settings = sanitizeSettings(msg.settings);
      const roomName = (msg.roomName || `${att.name}'s Trivia Room`).trim().slice(0, 36);

      // Generate a unique unused room code
      let code = generateSecureRoomCode();
      for (let attempt = 0; attempt < 6; attempt++) {
        const exists = await this.env.ROOMS.getByName(code).roomExists();
        if (!exists) break;
        code = generateSecureRoomCode();
      }

      try {
        await this.env.ROOMS.getByName(code).initRoom({
          code,
          name: roomName || `${att.name}'s Trivia Room`,
          visibility,
          hostId: att.playerId,
          hostName: att.name,
          settings,
        });

        if (msg.reqId) {
          this.sendJson(ws, { type: 'ack', reqId: msg.reqId, ok: true, code });
        }
      } catch (err) {
        if (msg.reqId) {
          this.sendJson(ws, {
            type: 'ack',
            reqId: msg.reqId,
            ok: false,
            error: err instanceof Error ? err.message : 'Failed to create room.',
          });
        }
      }
      return;
    }

    if (msg.type === 'matchmaking:join') {
      const queueDef = MATCHMAKING_QUEUES.find((q) => q.id === msg.queueId);
      if (!queueDef) return;
      att.queueId = queueDef.id;
      ws.serializeAttachment(att);
      this.broadcastMatchmakingStatus();
      await this.tryFormMatch(queueDef.id);
      return;
    }

    if (msg.type === 'matchmaking:leave') {
      if (att.queueId !== null) {
        att.queueId = null;
        ws.serializeAttachment(att);
        this.broadcastMatchmakingStatus();
      }
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    try {
      ws.close();
    } catch {
      // ignore
    }
    this.broadcastMatchmakingStatus();
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    try {
      ws.close();
    } catch {
      // ignore
    }
    this.broadcastMatchmakingStatus();
  }

  // --- Internal Helpers ---

  private getAttachment(ws: WebSocket): LobbyAttachment | null {
    try {
      return ws.deserializeAttachment() as LobbyAttachment | null;
    } catch {
      return null;
    }
  }

  private sendJson(ws: WebSocket, payload: LobbyServerMessage): void {
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      // Socket closed
    }
  }

  private async broadcastPublicRooms(): Promise<void> {
    const rooms = await this.getPublicRooms();
    const payload = JSON.stringify({ type: 'lobby:rooms', rooms } satisfies LobbyServerMessage);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // Ignore dead socket
      }
    }
  }

  private broadcastMatchmakingStatus(): void {
    const sockets = this.ctx.getWebSockets();
    const uniquePlayers = new Set<string>();
    const queues: Record<string, number> = {};
    for (const q of MATCHMAKING_QUEUES) {
      queues[q.id] = 0;
    }

    const queuedPlayersByQueue = new Map<string, Set<string>>();
    for (const ws of sockets) {
      const att = this.getAttachment(ws);
      if (!att) continue;
      uniquePlayers.add(att.playerId);
      if (att.queueId && att.queueId in queues) {
        let set = queuedPlayersByQueue.get(att.queueId);
        if (!set) {
          set = new Set();
          queuedPlayersByQueue.set(att.queueId, set);
        }
        set.add(att.playerId);
      }
    }

    for (const [qid, set] of queuedPlayersByQueue.entries()) {
      queues[qid] = set.size;
    }

    const status: MatchmakingStatus = {
      onlineCount: uniquePlayers.size,
      queues,
    };

    const payload = JSON.stringify({
      type: 'matchmaking:status',
      status,
    } satisfies LobbyServerMessage);

    for (const ws of sockets) {
      try {
        ws.send(payload);
      } catch {
        // ignore
      }
    }
  }

  private async tryFormMatch(queueId: string): Promise<void> {
    const queueDef = MATCHMAKING_QUEUES.find((q) => q.id === queueId);
    if (!queueDef) return;

    const candidates: { ws: WebSocket; att: LobbyAttachment }[] = [];
    const seenPlayerIds = new Set<string>();

    for (const ws of this.ctx.getWebSockets()) {
      const att = this.getAttachment(ws);
      if (!att || att.queueId !== queueId) continue;
      if (seenPlayerIds.has(att.playerId)) continue;
      seenPlayerIds.add(att.playerId);
      candidates.push({ ws, att });
    }

    if (candidates.length < 2) return;

    const matched = candidates.slice(0, Math.min(6, candidates.length));
    let code = generateSecureRoomCode();
    for (let attempt = 0; attempt < 6; attempt++) {
      const exists = await this.env.ROOMS.getByName(code).roomExists();
      if (!exists) break;
      code = generateSecureRoomCode();
    }

    const host = matched[0].att;
    await this.env.ROOMS.getByName(code).initRoom({
      code,
      name: `Quick Match · ${queueDef.label}`,
      visibility: 'private',
      hostId: host.playerId,
      hostName: host.name,
      settings: {
        quizId: queueDef.quizId,
        difficulty: 'all',
        region: 'all',
        questionCount: queueDef.questionCount,
        secondsPerQuestion: queueDef.secondsPerQuestion,
        maxPlayers: Math.max(2, matched.length),
      },
      autoStartParticipants: matched.map((m) => ({
        playerId: m.att.playerId,
        name: m.att.name,
      })),
    });

    for (const m of matched) {
      m.att.queueId = null;
      m.ws.serializeAttachment(m.att);
      this.sendJson(m.ws, {
        type: 'matchmaking:found',
        roomCode: code,
        queueId,
      });
    }

    this.broadcastMatchmakingStatus();
  }
}
