import type {
  ChatMessage,
  MatchmakingStatus,
  MultiplayerSettings,
  PublicRoomSummary,
  RoomState,
  RoomVisibility,
} from './types.js';

export type LobbyClientMessage =
  | { type: 'ping' }
  | { type: 'player:identify'; name: string }
  | { type: 'lobby:list'; reqId?: string }
  | {
      type: 'room:create';
      reqId?: string;
      roomName?: string;
      visibility?: RoomVisibility;
      settings?: Partial<MultiplayerSettings>;
    }
  | { type: 'matchmaking:join'; queueId: string }
  | { type: 'matchmaking:leave' };

export type LobbyServerMessage =
  | { type: 'pong' }
  | { type: 'lobby:rooms'; rooms: PublicRoomSummary[] }
  | { type: 'matchmaking:status'; status: MatchmakingStatus }
  | { type: 'matchmaking:found'; roomCode: string; queueId: string }
  | {
      type: 'ack';
      reqId: string;
      ok: boolean;
      error?: string;
      code?: string;
      rooms?: PublicRoomSummary[];
    };

export type RoomClientMessage =
  | { type: 'ping' }
  | { type: 'player:identify'; name: string }
  | { type: 'room:ready'; ready: boolean }
  | { type: 'room:settings'; settings: Partial<MultiplayerSettings>; reqId?: string }
  | { type: 'room:bot:add'; skill?: 'casual' | 'pro'; reqId?: string }
  | { type: 'room:bot:remove'; botId: string; reqId?: string }
  | { type: 'room:kick'; targetPlayerId: string }
  | { type: 'room:start'; reqId?: string }
  | { type: 'game:answer'; choiceIndex: number; reqId?: string }
  | { type: 'game:rematch'; reqId?: string }
  | { type: 'room:chat'; text: string }
  | { type: 'room:leave' };

export type RoomServerMessage =
  | { type: 'pong' }
  | { type: 'room:state'; room: RoomState; serverTime: number }
  | { type: 'room:chat'; message: ChatMessage }
  | { type: 'room:error'; error: string }
  | {
      type: 'ack';
      reqId: string;
      ok: boolean;
      error?: string;
    };
