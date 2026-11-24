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
  updatedAt: '2026-11-24',
  weekOf: 'Week of Nov 17–24, 2026',
  headlineSummary:
    'Euclid spots the farthest quasar yet, COP31 ends without a pact, Sunrise on the Reaping tops the box office, Signal blocks OS AI screen-scraping, Verstappen wins in Vegas & more.',
};

export const CURRENT_EVENTS_QUESTIONS: StaticQuestionSeed[] = [
  {
    id: 'cur-2026-11-24-01',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'ASTRONOMY · NOV 2026',
    prompt:
      'Announced on November 24, 2026, astronomers used which European Space Agency telescope to discover "Dún Aonghasa," the most distant quasar ever observed?',
    answer: 'Euclid',
    aliases: ['Euclid space telescope', 'ESA Euclid'],
    distractors: ['Gaia', 'Herschel', 'Planck'],
    explanation:
      'Using ESA’s Euclid space telescope with follow-ups from JWST and Hubble, astronomers observed Dún Aonghasa as it existed just 630 million years after the Big Bang.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-02',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'GLOBAL CLIMATE · NOV 2026',
    prompt:
      'When COP31 concluded in Antalya on November 22, 2026 without a final overarching consensus agreement, it became the first UN climate summit to end that way since which 2009 host city?',
    answer: 'Copenhagen',
    distractors: ['Cancún', 'Durban', 'Poznań'],
    explanation:
      'Deadlocked over explicit fossil-fuel transition language, COP31 failed to adopt a final cover decision after two days of overtime—the first such collapse since COP15 in Copenhagen in 2009.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-03',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'BOX OFFICE · NOV 2026',
    prompt:
      'Which prequel blockbuster dominated the November 20–22, 2026 weekend box office with a $120 million domestic and $225 million global debut?',
    answer: 'The Hunger Games: Sunrise on the Reaping',
    aliases: ['Sunrise on the Reaping', 'Hunger Games: Sunrise on the Reaping'],
    distractors: ['Dune: Messiah', 'Toy Story 5', 'Avatar: Fire and Ash'],
    explanation:
      'Lionsgate’s return to Panem, The Hunger Games: Sunrise on the Reaping, accounted for roughly three-quarters of top-ten domestic ticket sales in its opening weekend.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-04',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'FORMULA 1 · NOV 2026',
    prompt:
      'Which Red Bull Racing driver edged McLaren’s Lando Norris by 0.639 seconds to win the November 2026 Las Vegas Grand Prix?',
    answer: 'Max Verstappen',
    aliases: ['Verstappen'],
    distractors: ['Charles Leclerc', 'Lewis Hamilton', 'George Russell'],
    explanation:
      'Max Verstappen mastered the cool desert conditions on the Las Vegas Strip Circuit to claim victory ahead of McLaren teammates Lando Norris in second and Oscar Piastri in third.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-05',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'TECH & PRIVACY · NOV 2026',
    prompt:
      'Which encrypted messaging app rolled out default screen-blocking protections in November 2026 to stop Apple’s Siri AI and Google’s Gemini from scanning private chats?',
    answer: 'Signal',
    distractors: ['Telegram', 'WhatsApp', 'Discord'],
    explanation:
      'Calling OS-level screen-scanning AI agents an "existential threat" to privacy, Signal enabled default protections blocking Siri AI on iOS 27 and activating Screen security on Android.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-06',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'EUROPEAN POLITICS · NOV 2026',
    prompt:
      'Which Spanish Prime Minister is campaigning ahead of a November 29, 2026 snap general election called after parliamentary gridlock and nationwide protests over a housing crisis?',
    answer: 'Pedro Sánchez',
    aliases: ['Pedro Sanchez', 'Sanchez', 'Sánchez'],
    distractors: ['Alberto Núñez Feijóo', 'Mariano Rajoy', 'Santiago Abascal'],
    explanation:
      'Following Spain’s first general strike in 14 years and the defeat of emergency rental-cap decrees, Socialist Prime Minister Pedro Sánchez framed the snap vote as a referendum on housing.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-07',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'hard',
    promptLabel: 'GOLF · NOV 2026',
    prompt:
      'With her third straight CME Group Tour Championship win and $4 million payout in November 2026, Thai golfer Jeeno Thitikul passed which legend to top the LPGA all-time career money list?',
    answer: 'Annika Sorenstam',
    aliases: ['Annika Sörenstam', 'Sorenstam', 'Sörenstam'],
    distractors: ['Karrie Webb', 'Lorena Ochoa', 'Inbee Park'],
    explanation:
      'Jeeno Thitikul shot 24-under 264 at Tiburón Golf Club for a historic LPGA three-peat, surpassing Annika Sorenstam as the tour’s all-time career earnings leader.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-08',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'COUNTRY MUSIC · NOV 2026',
    prompt:
      'Who won Entertainer of the Year at the 60th Annual CMA Awards in Nashville on November 18, 2026?',
    answer: 'Ella Langley',
    aliases: ['Langley'],
    distractors: ['Lainey Wilson', 'Luke Combs', 'Chris Stapleton'],
    explanation:
      'Ella Langley claimed the night’s top honor—Entertainer of the Year—at the 60th Annual CMA Awards, topping fellow nominees Luke Combs, Cody Johnson, Chris Stapleton, and Lainey Wilson.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-09',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'hard',
    promptLabel: 'CYBERSECURITY · NOV 2026',
    prompt:
      'In a November 2026 report, Google and Mandiant exposed "exploit_agent"—a fully autonomous AI cyberattack framework spotted targeting web servers primarily in which European country?',
    answer: 'France',
    distractors: ['Germany', 'Poland', 'United Kingdom'],
    explanation:
      'Mandiant researchers uncovered an exposed staging server running the LLM-powered exploit_agent framework against French media, entertainment, and education targets.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-10',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'PLANETARY SCIENCE · NOV 2026',
    prompt:
      'Using stratospheric dust grains collected by an ER-2 aircraft, NASA and UCLA scientists announced in November 2026 evidence of an ancient water-ice reservoir originating from which outer solar system region?',
    answer: 'Kuiper Belt',
    aliases: ['The Kuiper Belt'],
    distractors: ['Asteroid Belt', 'Oort Cloud', 'Saturn’s rings'],
    explanation:
      'Solar energetic particle tracks and heavy-oxygen isotopes in 12 microscopic dust grains traced the ancient hydrated minerals back to the Kuiper Belt beyond Neptune.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-11',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'NFL · NOV 2026',
    prompt:
      'Which NFL team defeated the Minnesota Vikings 35–10 at Estadio Banorte in Mexico City on November 22, 2026, to improve to 9–1?',
    answer: 'San Francisco 49ers',
    aliases: ['49ers', 'San Francisco', 'Niners'],
    distractors: ['Dallas Cowboys', 'Los Angeles Rams', 'Kansas City Chiefs'],
    explanation:
      'Fueled by a 21-point second quarter, the San Francisco 49ers cruised past the Vikings 35–10 in Mexico City to stay atop the NFC standings.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-12',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'MUSIC · NOV 2026',
    prompt:
      'Leading all artists for the 69th Annual Grammy Awards, which British singer-songwriter earned 11 nominations in November 2026—tying Beyoncé’s single-year female record?',
    answer: 'RAYE',
    aliases: ['Raye'],
    distractors: ['Dua Lipa', 'Adele', 'Charli XCX'],
    explanation:
      'RAYE’s album This Music May Contain Hope and hit single "WHERE IS MY HUSBAND!" propelled her to 11 Grammy nods, ahead of Rosalía’s nine.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-13',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'medium',
    promptLabel: 'WORLD DIPLOMACY · NOV 2026',
    prompt:
      'During the November 19, 2026 APEC summit in Shenzhen, U.S. President Donald Trump and Chinese President Xi Jinping held a rare trilateral meeting with which third world leader?',
    answer: 'Vladimir Putin',
    aliases: ['Putin'],
    distractors: ['Narendra Modi', 'Emmanuel Macron', 'Benjamin Netanyahu'],
    explanation:
      'On the sidelines of APEC in Shenzhen, Trump, Xi, and Russian President Vladimir Putin held a trilateral summit and issued a joint four-point declaration on strategic stability.',
    typeable: true,
  },
  {
    id: 'cur-2026-11-24-14',
    category: 'current-events',
    quizId: 'cur-weekly',
    difficulty: 'easy',
    promptLabel: 'POP CULTURE · NOV 2026',
    prompt:
      'Which pop star celebrated her 34th birthday on November 23, 2026, by sharing photos from her surprise Palm Springs wedding to musician Maxx Morando two days earlier?',
    answer: 'Miley Cyrus',
    aliases: ['Cyrus'],
    distractors: ['Sabrina Carpenter', 'Selena Gomez', 'Katy Perry'],
    explanation:
      'Miley Cyrus and Maxx Morando married on November 21, 2026 at Frank Sinatra’s historic Twin Palms Estate in Palm Springs, with Flaming Lips frontman Wayne Coyne officiating.',
    typeable: true,
  },
];
