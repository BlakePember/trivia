import type { StaticQuestionSeed } from './staticTypes.js';

/**
 * 2026 Headlines & Major Milestones — permanent companion bank to Weekly Current Events
 * so the Current Events category stays deep and varied across multiplayer matches.
 */
export const RECENT_HEADLINES_QUESTIONS: StaticQuestionSeed[] = [
  {
    id: 'cur-2026-yr-01',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'WORLD CUP · 2026',
    prompt:
      'The 2026 FIFA World Cup made history as the first men’s World Cup jointly hosted by three nations — which three countries?',
    answer: 'United States, Canada, and Mexico',
    aliases: ['US, Canada, and Mexico', 'USA, Canada, and Mexico'],
    distractors: [
      'Spain, Portugal, and Morocco',
      'United States, Mexico, and Brazil',
      'France, Germany, and Italy',
    ],
    explanation:
      'Sixteen host cities across the United States, Canada, and Mexico staged 104 matches from June 11 to July 19, 2026.',
    typeable: false,
  },
  {
    id: 'cur-2026-yr-02',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'WORLD CUP · 2026',
    prompt:
      'Which national team defeated defending champions Argentina 1–0 in extra time to win the 2026 FIFA World Cup?',
    answer: 'Spain',
    distractors: ['France', 'Brazil', 'England'],
    explanation:
      'Spain captured its second Men’s FIFA World Cup title in July 2026 by edging Argentina 1–0 in extra time.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-03',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'WORLD CUP · 2026',
    prompt:
      'Expanding from the previous 32-nation format, how many national teams competed in the 2026 FIFA World Cup?',
    answer: '48',
    aliases: ['Forty-eight'],
    distractors: ['36', '40', '64'],
    explanation:
      'The expanded 48-team format boosted the tournament from 64 to 104 total matches across North America.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-04',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'WINTER OLYMPICS · 2026',
    prompt:
      'Which European country hosted the 25th Olympic Winter Games in February 2026 across Milan and Cortina d’Ampezzo?',
    answer: 'Italy',
    distractors: ['Switzerland', 'Austria', 'France'],
    explanation:
      'Milano Cortina 2026 marked Italy’s third time hosting the Winter Olympics, following Cortina d’Ampezzo (1956) and Turin (2006).',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-05',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'SUPER BOWL LX · 2026',
    prompt:
      'Which NFL franchise defeated the New England Patriots 29–13 in February 2026 to capture Super Bowl LX?',
    answer: 'Seattle Seahawks',
    aliases: ['Seahawks', 'Seattle'],
    distractors: ['Kansas City Chiefs', 'Philadelphia Eagles', 'Buffalo Bills'],
    explanation:
      'Eleven years after losing Super Bowl XLIX to New England, the Seattle Seahawks turned the tables with a commanding 29–13 win in Super Bowl LX.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-06',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'NBA FINALS · 2026',
    prompt:
      'Ending a championship drought dating back to 1973, which NBA team defeated the San Antonio Spurs 4–1 to win the 2026 NBA Finals?',
    answer: 'New York Knicks',
    aliases: ['Knicks', 'New York'],
    distractors: ['Boston Celtics', 'Oklahoma City Thunder', 'Denver Nuggets'],
    explanation:
      'The New York Knicks captured their third NBA title — and first in 53 years — by taking the 2026 Finals in five games over San Antonio.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-07',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'NHL · 2026',
    prompt:
      'Which NHL franchise defeated the Vegas Golden Knights 4 games to 2 to lift the 2026 Stanley Cup?',
    answer: 'Carolina Hurricanes',
    aliases: ['Hurricanes', 'Carolina'],
    distractors: ['Florida Panthers', 'Edmonton Oilers', 'Dallas Stars'],
    explanation:
      'The Carolina Hurricanes secured their second Stanley Cup championship (and first since 2006) by topping Vegas in six games.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-08',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'WORLD SERIES · 2026',
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
    id: 'cur-2026-yr-09',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: '98TH OSCARS · 2026',
    prompt:
      'Directed by Paul Thomas Anderson, which film took home Best Picture at the 98th Academy Awards in 2026?',
    answer: 'One Battle After Another',
    distractors: ['Sinners', 'Hamnet', 'Marty Supreme'],
    explanation:
      'Paul Thomas Anderson’s sweeping drama "One Battle After Another" captured the night’s top honor at the 98th Oscars.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-10',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'GRAMMY AWARDS · 2026',
    prompt:
      'Making history as the first Spanish-language album to win Grammy Album of the Year in 2026, "DeBÍ TiRAR MáS FOToS" was recorded by which Puerto Rican superstar?',
    answer: 'Bad Bunny',
    distractors: ['Karol G', 'Rosalía', 'Peso Pluma'],
    explanation:
      'Bad Bunny’s critically acclaimed tribute to Puerto Rican culture became the first all-Spanish-language release to capture Album of the Year at the Grammys.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-11',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'CYCLING · 2026',
    prompt:
      'Joining cycling’s most exclusive five-time champions club, which Slovenian rider won his fifth career Tour de France title in July 2026?',
    answer: 'Tadej Pogačar',
    aliases: ['Tadej Pogacar', 'Pogacar', 'Pogačar'],
    distractors: ['Jonas Vingegaard', 'Remco Evenepoel', 'Primož Roglič'],
    explanation:
      'With his fifth yellow jersey in 2026, Tadej Pogačar tied legends Jacques Anquetil, Eddy Merckx, Bernard Hinault, and Miguel Induráin.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-12',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'WIMBLEDON · 2026',
    prompt:
      'Which Italian tennis star defeated Alexander Zverev to win the 2026 Wimbledon Men’s Singles championship?',
    answer: 'Jannik Sinner',
    aliases: ['Sinner'],
    distractors: ['Carlos Alcaraz', 'Novak Djokovic', 'Taylor Fritz'],
    explanation:
      'Jannik Sinner triumphed on the grass courts of the All England Club in July 2026, defeating Germany’s Alexander Zverev in the final.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-13',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'WIMBLEDON · 2026',
    prompt:
      'In an all-Czech final against Karolína Muchová, who won the 2026 Wimbledon Women’s Singles title?',
    answer: 'Linda Nosková',
    aliases: ['Linda Noskova', 'Noskova', 'Nosková'],
    distractors: ['Iga Świątek', 'Aryna Sabalenka', 'Coco Gauff'],
    explanation:
      'Linda Nosková captured her maiden Grand Slam singles crown on Centre Court by defeating fellow Czech player Karolína Muchová.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-14',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'EUROVISION · 2026',
    prompt:
      'Represented by singer Dara with the track "Bangaranga," which country won the 2026 Eurovision Song Contest?',
    answer: 'Bulgaria',
    distractors: ['Sweden', 'Switzerland', 'Italy'],
    explanation:
      'Dara delivered Bulgaria’s breakthrough Eurovision triumph in May 2026 with "Bangaranga."',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-15',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'easy',
    promptLabel: 'HUMAN SPACEFLIGHT · 2026',
    prompt:
      'Sending four astronauts around the Moon for the first time since Apollo 17 in 1972, what was the name of NASA’s historic 2026 crewed lunar flyby mission?',
    answer: 'Artemis II',
    aliases: ['Artemis 2'],
    distractors: ['Artemis I', 'Apollo 18', 'Orion IV'],
    explanation:
      'Artemis II carried Reid Wiseman, Victor Glover, Christina Koch, and Jeremy Hansen on humanity’s long-awaited return to deep space beyond low-Earth orbit.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-16',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'SPACE EXPLORATION · 2026',
    prompt:
      'Flying alongside three NASA crewmates aboard Artemis II in 2026, astronaut Jeremy Hansen made history as the first citizen of which country to journey to the Moon?',
    answer: 'Canada',
    distractors: ['Japan', 'United Kingdom', 'Germany'],
    explanation:
      'Canadian Space Agency astronaut Jeremy Hansen became the first non-American ever to travel beyond low-Earth orbit on a lunar mission.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-17',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Karl Deisseroth, Peter Hegemann, and Georg Nagel won the 2026 Nobel Prize in Physiology or Medicine for pioneering which technique that controls neurons using pulses of light?',
    answer: 'Optogenetics',
    distractors: ['CRISPR gene editing', 'mRNA therapeutics', 'Connectomics'],
    explanation:
      'By inserting light-sensitive algal proteins (channelrhodopsins) into specific nerve cells, optogenetics revolutionized modern neuroscience.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-18',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Francis Halzen won the 2026 Nobel Prize in Physics for high-energy neutrino astrophysics discoveries made at which giant South Pole observatory buried in Antarctic ice?',
    answer: 'IceCube Neutrino Observatory',
    aliases: ['IceCube', 'IceCube Observatory'],
    distractors: ['LIGO', 'Super-Kamiokande', 'Large Hadron Collider'],
    explanation:
      'Suspended deep inside a cubic kilometer of crystal-clear Antarctic ice, IceCube opened an entirely new window onto cosmic particle accelerators.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-19',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Henri B. Kagan and Kenso Soai won the 2026 Nobel Prize in Chemistry for breakthroughs in asymmetric synthesis involving what mirror-image molecular property ("handedness")?',
    answer: 'Chirality',
    aliases: ['Molecular chirality'],
    distractors: ['Superconductivity', 'Allotropy', 'Polymerization'],
    explanation:
      'Understanding why biological molecules overwhelmingly prefer one mirror-image form ("chirality") is crucial to pharmaceuticals and origin-of-life chemistry.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-20',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Which Canadian poet, essayist, and classicist — celebrated for works like "Autobiography of Red" — won the 2026 Nobel Prize in Literature?',
    answer: 'Anne Carson',
    aliases: ['Carson'],
    distractors: ['Margaret Atwood', 'Salman Rushdie', 'Haruki Murakami'],
    explanation:
      'The Swedish Academy honored Anne Carson for her inventive, genre-blurring body of work bridging ancient Greek classics and contemporary poetry.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-21',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Which South African jurist and former UN High Commissioner for Human Rights won the 2026 Nobel Peace Prize?',
    answer: 'Navi Pillay',
    aliases: ['Navanethem Pillay', 'Navanethem "Navi" Pillay'],
    distractors: ['Ngozi Okonjo-Iweala', 'Amina J. Mohammed', 'Mia Mottley'],
    explanation:
      'Navanethem "Navi" Pillay received the 2026 Nobel Peace Prize for her decades-long advocacy for international justice and human rights.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-22',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'WORLD CUP · 2026',
    prompt:
      'In which US stadium — located in East Rutherford, New Jersey — was the 2026 FIFA World Cup Final played?',
    answer: 'MetLife Stadium',
    aliases: ['MetLife'],
    distractors: ['SoFi Stadium', 'AT&T Stadium', 'Estadio Azteca'],
    explanation:
      'Home to the NFL’s Giants and Jets just across the Hudson River from New York City, MetLife Stadium hosted the tournament’s decisive final on July 19, 2026.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-23',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'hard',
    promptLabel: 'SPACE SCIENCE · 2026',
    prompt:
      'Launched in January 2026 to help separate starspot interference from planetary spectra, what is the name of NASA’s small space telescope studying exoplanet atmospheres?',
    answer: 'Pandora',
    aliases: ['NASA Pandora'],
    distractors: ['Roman', 'TESS', 'Kepler'],
    explanation:
      'NASA’s Pandora mission observes host stars and their transiting exoplanets simultaneously in visible and infrared light to sharpen searches for water-rich worlds.',
    typeable: true,
  },
  {
    id: 'cur-2026-yr-24',
    category: 'current-events',
    quizId: 'cur-2026',
    difficulty: 'medium',
    promptLabel: 'NOBEL PRIZE · 2026',
    prompt:
      'Robert E. Hall and Michael Woodford shared the 2026 Nobel Memorial Prize in Economic Sciences for reshaping frameworks around which branch of economics?',
    answer: 'Macroeconomics & stabilization policy',
    aliases: ['Macroeconomics', 'Monetary policy'],
    distractors: ['Behavioral game theory', 'Auction theory', 'Agricultural development'],
    explanation:
      'Hall and Woodford’s work transformed how central banks and economists understand business-cycle fluctuations, inflation expectations, and monetary stabilization.',
    typeable: false,
  },
];
