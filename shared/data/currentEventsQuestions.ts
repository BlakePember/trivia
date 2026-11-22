import type { StaticQuestionSeed } from './staticTypes.js';

export interface CurrentEventsMeta {
  updatedAt: string; // YYYY-MM-DD
  weekOf: string;
  headlineSummary: string;
}

/**
 * Weekly Current Events Trivia Edition.
 * Automatically refreshed every Tuesday via the Weekly Current Events Trivia automation
 * and pushed to a review branch (`trivia/current-events-YYYY-MM-DD`).
 */
export const CURRENT_EVENTS_META: CurrentEventsMeta = {
  updatedAt: '2026-11-21',
  weekOf: 'Week of Nov 17–23, 2026',
  headlineSummary:
    'Voyager 1 reaches 1 light-day, COP31 in Antalya, historic ICJ ruling, Brewers’ first World Series title, JWST Andromeda discovery & more.',
};

export const CURRENT_EVENTS_QUESTIONS: StaticQuestionSeed[] = [
  {
    id: 'cur-2026-11-21-01',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'SPACE MILESTONE · NOV 2026',
    prompt:
      'On November 18, 2026, which legendary NASA spacecraft officially crossed the historic 1 light-day distance milestone (~16 billion miles) from Earth?',
    answer: 'Voyager 1',
    distractors: ['Voyager 2', 'New Horizons', 'Pioneer 10'],
    explanation:
      'Nearly 50 years after its 1977 launch, Voyager 1 became the first human-made object to reach 1 light-day from Earth, with landmarks like the Empire State Building glowing gold in celebration.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-02',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'GLOBAL CLIMATE · NOV 2026',
    prompt:
      'Which Turkish coastal city hosted the United Nations COP31 Climate Change Conference in November 2026?',
    answer: 'Antalya',
    distractors: ['Istanbul', 'Ankara', 'Izmir'],
    explanation:
      'World leaders and climate negotiators met in Antalya, Türkiye, from November 9 to 20, 2026, debating climate finance and fossil fuel transition targets.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-03',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'BASEBALL · FALL 2026',
    prompt:
      'Which MLB franchise captured its very first World Series championship in October 2026, defeating the Tampa Bay Rays 4 games to 1?',
    answer: 'Milwaukee Brewers',
    aliases: ['Brewers', 'Milwaukee'],
    distractors: ['Seattle Mariners', 'San Diego Padres', 'Colorado Rockies'],
    explanation:
      'The Milwaukee Brewers clinched their first-ever World Series title in Game 5 with a 4–1 victory, led by World Series MVP catcher William Contreras.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-04',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'INTERNATIONAL LAW · NOV 2026',
    prompt:
      'In a landmark November 19, 2026 ruling, the International Court of Justice (ICJ) held which Southeast Asian nation responsible under the 1948 Genocide Convention?',
    answer: 'Myanmar',
    aliases: ['Burma'],
    distractors: ['Cambodia', 'Thailand', 'Laos'],
    explanation:
      'In a 9–6 decision, the ICJ found Myanmar responsible for committing genocide against the Rohingya Muslim minority in Rakhine State — the first time the court held a state directly responsible under the convention.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-05',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'ASTRONOMY · NOV 2026',
    prompt:
      'In late November 2026, astronomers announced that the James Webb Space Telescope captured the aftermath of a rare star-swallowing merger in which neighboring galaxy?',
    answer: 'Andromeda Galaxy',
    aliases: ['Andromeda', 'M31'],
    distractors: ['Triangulum Galaxy', 'Whirlpool Galaxy', 'Sombrero Galaxy'],
    explanation:
      'JWST observed the fallout of a giant supergiant star engulfing a smaller companion star nicknamed "Bao" inside the Andromeda Galaxy, shedding new light on stellar evolution.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-06',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'WORLD DIPLOMACY · NOV 2026',
    prompt:
      'Which major Chinese tech hub hosted the November 2026 APEC summit and high-profile diplomatic meetings?',
    answer: 'Shenzhen',
    distractors: ['Shanghai', 'Beijing', 'Guangzhou'],
    explanation:
      'Shenzhen hosted Asia-Pacific leaders for the November 2026 APEC summit framework alongside closely watched bilateral and trilateral talks.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-07',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'hard',
    promptLabel: 'NOBEL PRIZE · FALL 2026',
    prompt:
      'Which South African jurist and former UN High Commissioner for Human Rights won the 2026 Nobel Peace Prize?',
    answer: 'Navi Pillay',
    aliases: ['Navanethem Pillay', 'Navanethem "Navi" Pillay'],
    distractors: ['Ngozi Okonjo-Iweala', 'Amina J. Mohammed', 'Mia Mottley'],
    explanation:
      'Navanethem "Navi" Pillay was awarded the 2026 Nobel Peace Prize for her decades-long advocacy for international law and human rights.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-08',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'WORLD FOOTBALL · 2026',
    prompt:
      'Which national team defeated Argentina 1–0 in extra time to win the 2026 FIFA World Cup?',
    answer: 'Spain',
    distractors: ['France', 'Brazil', 'England'],
    explanation:
      'Spain captured its second Men’s FIFA World Cup title in 2026 by edging defending champions Argentina 1–0 in extra time.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-09',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'SPACE MISSIONS · NOV 2026',
    prompt:
      'Which 20+ year NASA gamma-ray burst observatory safely concluded its mission with Earth atmospheric re-entry in November 2026?',
    answer: 'Neil Gehrels Swift Observatory',
    aliases: ['Swift', 'Swift Observatory'],
    distractors: ['Chandra X-ray Observatory', 'Spitzer Space Telescope', 'Kepler Space Telescope'],
    explanation:
      'Originally designed for a two-year mission, NASA’s Neil Gehrels Swift Observatory studied cosmic gamma-ray bursts and transient events for over two decades.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-10',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'SPORTS · NOV 2026',
    prompt:
      'Which international capital city hosted the NFL International Series matchup scheduled for November 22, 2026?',
    answer: 'Mexico City',
    distractors: ['London', 'Madrid', 'São Paulo'],
    explanation:
      'The NFL International Series returned to Mexico City in November 2026 as part of the league’s continuing global regular-season slate.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-11',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'GLOBAL TECH POLICY · NOV 2026',
    prompt:
      'In which Swiss city did November 2026 UN talks seeking a legally binding treaty on AI-powered autonomous weapons stall without a binding pact?',
    answer: 'Geneva',
    distractors: ['Zurich', 'Vienna', 'The Hague'],
    explanation:
      'Delegates at the UN Convention on Certain Conventional Weapons (CCW) in Geneva ended week-long negotiations with only a non-binding mandate.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-21-12',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'ASTRONOMY · NOV 2026',
    prompt:
      'What traditional name is given to November’s full moon — appearing as a bright supermoon on November 24, 2026?',
    answer: 'Beaver Moon',
    aliases: ['Full Beaver Moon', 'Beaver Supermoon', 'Full Beaver Supermoon'],
    distractors: ['Harvest Moon', 'Hunter’s Moon', 'Cold Moon'],
    explanation:
      'Named for the season when beavers finish building their winter lodges and dams, November’s 2026 full moon occurs near perigee as a supermoon.',
    typeable: true,
  },
];
