import type {
  LobbyClientMessage,
  LobbyServerMessage,
  RoomClientMessage,
  RoomServerMessage,
} from '../../shared/protocol';

const RAW_SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').trim().replace(/\/+$/, '');

export function getHttpBaseUrl(): string {
  return RAW_SERVER_URL || window.location.origin;
}

export function getWsBaseUrl(): string {
  const base = getHttpBaseUrl();
  if (base.startsWith('https://')) return `wss://${base.slice('https://'.length)}`;
  if (base.startsWith('http://')) return `ws://${base.slice('http://'.length)}`;
  return base;
}

interface PendingReq {
  resolve: (data: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface TriviaRealtimeHandlers {
  onLobbyConnectionChange: (connected: boolean) => void;
  onLobbyMessage: (msg: LobbyServerMessage) => void;
  onRoomMessage: (msg: RoomServerMessage) => void;
  onRoomError: (error: string) => void;
}

export class TriviaRealtimeClient {
  private playerId: string;
  private playerName: string;
  private handlers: TriviaRealtimeHandlers;

  private lobbyWs: WebSocket | null = null;
  private lobbyReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lobbyRetryMs = 1000;
  private lobbyPending = new Map<string, PendingReq>();

  private roomWs: WebSocket | null = null;
  private currentRoomCode: string | null = null;
  private roomReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private roomRetryMs = 1000;
  private roomPending = new Map<string, PendingReq>();
  private intentionalRoomClose = false;

  private destroyed = false;
  private reqSeq = 0;

  constructor(playerId: string, playerName: string, handlers: TriviaRealtimeHandlers) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.handlers = handlers;
  }

  public connectLobby(): void {
    if (this.destroyed) return;
    if (
      this.lobbyWs &&
      (this.lobbyWs.readyState === WebSocket.OPEN ||
        this.lobbyWs.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const params = new URLSearchParams({
      playerId: this.playerId,
      name: this.playerName,
    });
    const ws = new WebSocket(`${getWsBaseUrl()}/ws/lobby?${params.toString()}`);
    this.lobbyWs = ws;

    ws.onopen = () => {
      if (this.lobbyWs !== ws) return;
      this.lobbyRetryMs = 1000;
      this.handlers.onLobbyConnectionChange(true);
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      let msg: LobbyServerMessage;
      try {
        msg = JSON.parse(event.data) as LobbyServerMessage;
      } catch {
        return;
      }
      if (msg.type === 'ack' && msg.reqId) {
        const pending = this.lobbyPending.get(msg.reqId);
        if (pending) {
          clearTimeout(pending.timer);
          this.lobbyPending.delete(msg.reqId);
          pending.resolve(msg);
        }
        return;
      }
      this.handlers.onLobbyMessage(msg);
    };

    ws.onclose = () => {
      if (this.lobbyWs !== ws) return;
      this.lobbyWs = null;
      this.handlers.onLobbyConnectionChange(false);
      this.rejectAllPending(this.lobbyPending, 'Connection lost.');
      if (!this.destroyed) {
        const delay = this.lobbyRetryMs;
        this.lobbyRetryMs = Math.min(6000, Math.round(this.lobbyRetryMs * 1.5));
        this.lobbyReconnectTimer = setTimeout(() => this.connectLobby(), delay);
      }
    };

    ws.onerror = () => {
      // handled by onclose
    };
  }

  public setPlayerName(name: string): void {
    this.playerName = name;
    this.sendLobby({ type: 'player:identify', name });
    this.sendRoom({ type: 'player:identify', name });
  }

  public sendLobby(msg: LobbyClientMessage): void {
    if (this.lobbyWs?.readyState === WebSocket.OPEN) {
      this.lobbyWs.send(JSON.stringify(msg));
    }
  }

  public requestLobby<T = { ok: boolean; error?: string; code?: string }>(
    msg: Extract<LobbyClientMessage, { type: 'room:create' | 'lobby:list' }>
  ): Promise<T> {
    return new Promise((resolve) => {
      if (this.lobbyWs?.readyState !== WebSocket.OPEN) {
        resolve({ ok: false, error: 'Not connected to the Trivia multiplayer server.' } as T);
        return;
      }
      const reqId = `l_${++this.reqSeq}`;
      const timer = setTimeout(() => {
        this.lobbyPending.delete(reqId);
        resolve({ ok: false, error: 'Server request timed out.' } as T);
      }, 10_000);
      this.lobbyPending.set(reqId, { resolve: resolve as (d: unknown) => void, timer });
      this.lobbyWs.send(JSON.stringify({ ...msg, reqId }));
    });
  }

  public async connectRoom(codeRaw: string): Promise<{ ok: boolean; error?: string }> {
    const code = codeRaw.trim().toUpperCase();
    if (!code) return { ok: false, error: 'Enter a valid room code.' };

    try {
      const resp = await fetch(`${getHttpBaseUrl()}/api/rooms/${encodeURIComponent(code)}`);
      if (resp.ok) {
        const data = (await resp.json()) as { exists?: boolean };
        if (!data.exists) {
          return { ok: false, error: `Room "${code}" was not found.` };
        }
      }
    } catch {
      return { ok: false, error: 'Unable to reach Trivia multiplayer server.' };
    }

    this.disconnectRoom(false);
    this.currentRoomCode = code;
    this.intentionalRoomClose = false;
    this.openRoomSocket(code);
    return { ok: true };
  }

  private openRoomSocket(code: string): void {
    if (this.destroyed || this.currentRoomCode !== code) return;

    const params = new URLSearchParams({
      playerId: this.playerId,
      name: this.playerName,
    });
    const ws = new WebSocket(
      `${getWsBaseUrl()}/ws/room/${encodeURIComponent(code)}?${params.toString()}`
    );
    this.roomWs = ws;

    ws.onopen = () => {
      if (this.roomWs !== ws) return;
      this.roomRetryMs = 1000;
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      let msg: RoomServerMessage;
      try {
        msg = JSON.parse(event.data) as RoomServerMessage;
      } catch {
        return;
      }
      if (msg.type === 'ack' && msg.reqId) {
        const pending = this.roomPending.get(msg.reqId);
        if (pending) {
          clearTimeout(pending.timer);
          this.roomPending.delete(msg.reqId);
          pending.resolve(msg);
        }
        return;
      }
      if (msg.type === 'room:error') {
        this.intentionalRoomClose = true;
        this.handlers.onRoomError(msg.error);
        return;
      }
      this.handlers.onRoomMessage(msg);
    };

    ws.onclose = (ev) => {
      if (this.roomWs !== ws) return;
      this.roomWs = null;
      this.rejectAllPending(this.roomPending, 'Disconnected from room.');
      if (ev.code === 4004) {
        this.intentionalRoomClose = true;
        this.currentRoomCode = null;
        return;
      }
      if (!this.destroyed && !this.intentionalRoomClose && this.currentRoomCode === code) {
        const delay = this.roomRetryMs;
        this.roomRetryMs = Math.min(5000, Math.round(this.roomRetryMs * 1.5));
        this.roomReconnectTimer = setTimeout(() => this.openRoomSocket(code), delay);
      }
    };

    ws.onerror = () => {
      // handled by onclose
    };
  }

  public disconnectRoom(sendLeave = true): void {
    this.intentionalRoomClose = true;
    this.currentRoomCode = null;
    if (this.roomReconnectTimer) {
      clearTimeout(this.roomReconnectTimer);
      this.roomReconnectTimer = null;
    }
    this.rejectAllPending(this.roomPending, 'Left room.');
    if (this.roomWs) {
      if (sendLeave && this.roomWs.readyState === WebSocket.OPEN) {
        try {
          this.roomWs.send(JSON.stringify({ type: 'room:leave' } satisfies RoomClientMessage));
        } catch {
          // ignore
        }
      }
      try {
        this.roomWs.close(1000, 'Client left room');
      } catch {
        // ignore
      }
      this.roomWs = null;
    }
  }

  public sendRoom(msg: RoomClientMessage): void {
    if (this.roomWs?.readyState === WebSocket.OPEN) {
      this.roomWs.send(JSON.stringify(msg));
    }
  }

  public requestRoom<T = { ok: boolean; error?: string }>(
    msg: Extract<
      RoomClientMessage,
      {
        type:
          | 'room:settings'
          | 'room:bot:add'
          | 'room:bot:remove'
          | 'room:start'
          | 'game:answer'
          | 'game:rematch';
      }
    >
  ): Promise<T> {
    return new Promise((resolve) => {
      if (this.roomWs?.readyState !== WebSocket.OPEN) {
        resolve({ ok: false, error: 'Not connected to room.' } as T);
        return;
      }
      const reqId = `r_${++this.reqSeq}`;
      const timer = setTimeout(() => {
        this.roomPending.delete(reqId);
        resolve({ ok: false, error: 'Room action timed out.' } as T);
      }, 10_000);
      this.roomPending.set(reqId, { resolve: resolve as (d: unknown) => void, timer });
      this.roomWs.send(JSON.stringify({ ...msg, reqId }));
    });
  }

  public destroy(): void {
    this.destroyed = true;
    if (this.lobbyReconnectTimer) clearTimeout(this.lobbyReconnectTimer);
    this.disconnectRoom(false);
    this.rejectAllPending(this.lobbyPending, 'Client destroyed.');
    if (this.lobbyWs) {
      try {
        this.lobbyWs.close(1000, 'Unmount');
      } catch {
        // ignore
      }
      this.lobbyWs = null;
    }
  }

  private rejectAllPending(map: Map<string, PendingReq>, error: string): void {
    for (const [id, entry] of map.entries()) {
      clearTimeout(entry.timer);
      entry.resolve({ ok: false, error });
      map.delete(id);
    }
  }
}
