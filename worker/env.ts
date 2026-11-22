import type { TriviaLobbyDO } from './lobbyDO.js';
import type { TriviaRoomDO } from './roomDO.js';

export interface Env {
  LOBBY: DurableObjectNamespace<TriviaLobbyDO>;
  ROOMS: DurableObjectNamespace<TriviaRoomDO>;
  CORS_ORIGIN?: string;
}
