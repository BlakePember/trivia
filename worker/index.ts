import type { Env } from './env.js';
export { TriviaLobbyDO } from './lobbyDO.js';
export { TriviaRoomDO } from './roomDO.js';

function corsHeaders(env: Env, request: Request): Record<string, string> {
  const configured = env.CORS_ORIGIN || '*';
  const reqOrigin = request.headers.get('Origin');
  const allowOrigin =
    configured === '*' ? '*' : reqOrigin === configured ? reqOrigin : configured;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cors = corsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/health') {
      return Response.json(
        {
          ok: true,
          service: 'trivia-cloudflare-do',
          timestamp: Date.now(),
        },
        { headers: cors }
      );
    }

    if (url.pathname === '/api/rooms') {
      const rooms = await env.LOBBY.getByName('global').getPublicRooms();
      return Response.json({ rooms }, { headers: cors });
    }

    const roomCheckMatch = url.pathname.match(/^\/api\/rooms\/([A-Za-z0-9]{4,10})$/);
    if (roomCheckMatch) {
      const code = roomCheckMatch[1].toUpperCase();
      const exists = await env.ROOMS.getByName(code).roomExists();
      return Response.json({ exists, code }, { headers: cors });
    }

    if (url.pathname === '/ws/lobby') {
      return env.LOBBY.getByName('global').fetch(request);
    }

    const roomWsMatch = url.pathname.match(/^\/ws\/room\/([A-Za-z0-9]{4,10})$/);
    if (roomWsMatch) {
      const code = roomWsMatch[1].toUpperCase();
      return env.ROOMS.getByName(code).fetch(request);
    }

    return Response.json(
      {
        service: 'trivia-cloudflare-do',
        endpoints: ['/api/health', '/api/rooms', '/api/rooms/:code', '/ws/lobby', '/ws/room/:code'],
      },
      { status: 404, headers: cors }
    );
  },
} satisfies ExportedHandler<Env>;
