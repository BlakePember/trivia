import { bindings, defineConfig, exports } from 'cf/config';
import * as entrypoint from './worker/index.ts' with { type: 'cf-worker' };

export default defineConfig({
  accountId: '2a17113e446227ba41f65e35e4669266',
  worker: {
    name: 'trivia-api',
    entrypoint,
    compatibilityDate: '2026-11-21',
    workersDev: true,
    domains: ['trivia.blakepember.net'],
    assets: {
      notFoundHandling: 'single-page-application',
      runWorkerFirst: ['/api/*', '/ws/*'],
    },
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    exports: {
      TriviaLobbyDO: exports.durableObject({ storage: 'sqlite' }),
      TriviaRoomDO: exports.durableObject({ storage: 'sqlite' }),
    },
    env: {
      LOBBY: bindings.durableObject({
        worker: 'trivia-api',
        exportName: 'TriviaLobbyDO',
      }),
      ROOMS: bindings.durableObject({
        worker: 'trivia-api',
        exportName: 'TriviaRoomDO',
      }),
    },
  },
});
