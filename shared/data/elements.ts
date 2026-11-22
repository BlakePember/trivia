import type { Difficulty } from '../types.js';

export interface ElementEntry {
  number: number;
  symbol: string;
  name: string;
  group: string;
  difficulty: Difficulty;
  fact: string;
}

export const ELEMENTS: ElementEntry[] = [
  { number: 1, symbol: 'H', name: 'Hydrogen', group: 'Nonmetal', difficulty: 'easy', fact: 'Hydrogen makes up roughly 75% of all normal matter in the universe by mass.' },
  { number: 2, symbol: 'He', name: 'Helium', group: 'Noble Gas', difficulty: 'easy', fact: 'Helium was first detected in the Sun’s spectrum in 1868 before it was ever found on Earth.' },
  { number: 3, symbol: 'Li', name: 'Lithium', group: 'Alkali Metal', difficulty: 'easy', fact: 'Lithium is the lightest of all metals and powers modern rechargeable batteries.' },
  { number: 6, symbol: 'C', name: 'Carbon', group: 'Nonmetal', difficulty: 'easy', fact: 'Carbon forms both the soft graphite in pencils and the hardest natural mineral, diamond.' },
  { number: 7, symbol: 'N', name: 'Nitrogen', group: 'Nonmetal', difficulty: 'easy', fact: 'Nitrogen accounts for about 78% of Earth’s dry atmosphere.' },
  { number: 8, symbol: 'O', name: 'Oxygen', group: 'Nonmetal', difficulty: 'easy', fact: 'Oxygen makes up nearly half of the Earth’s crust by mass, mostly bound in silicate minerals.' },
  { number: 9, symbol: 'F', name: 'Fluorine', group: 'Halogen', difficulty: 'medium', fact: 'Fluorine is the most electronegative and chemically reactive of all elements.' },
  { number: 10, symbol: 'Ne', name: 'Neon', group: 'Noble Gas', difficulty: 'easy', fact: 'Neon emits a signature bright reddish-orange glow inside high-voltage discharge signs.' },
  { number: 11, symbol: 'Na', name: 'Sodium', group: 'Alkali Metal', difficulty: 'easy', fact: 'Its symbol Na derives from the Latin name "natrium." Pure sodium fizzes violently in water.' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', group: 'Alkaline Earth', difficulty: 'medium', fact: 'Magnesium sits at the center of every chlorophyll molecule, making photosynthesis possible.' },
  { number: 13, symbol: 'Al', name: 'Aluminum', group: 'Post-Transition Metal', difficulty: 'easy', fact: 'Aluminum (or aluminium) is the most abundant metal in Earth’s crust.' },
  { number: 14, symbol: 'Si', name: 'Silicon', group: 'Metalloid', difficulty: 'easy', fact: 'Ultra-pure silicon crystals form the foundation of modern microchips and solar panels.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', group: 'Nonmetal', difficulty: 'medium', fact: 'Phosphorus means "light-bearer" in Greek and is essential to DNA and ATP energy transfer.' },
  { number: 16, symbol: 'S', name: 'Sulfur', group: 'Nonmetal', difficulty: 'easy', fact: 'Known historically as brimstone, sulfur is bright yellow in crystalline form.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', group: 'Halogen', difficulty: 'easy', fact: 'Chlorine pairs with sodium to make ordinary table salt (NaCl).' },
  { number: 18, symbol: 'Ar', name: 'Argon', group: 'Noble Gas', difficulty: 'medium', fact: 'Argon is the third most abundant gas in Earth’s atmosphere at roughly 0.93%.' },
  { number: 19, symbol: 'K', name: 'Potassium', group: 'Alkali Metal', difficulty: 'easy', fact: 'Its symbol K comes from "kalium," derived from the Arabic word for plant ashes (alkali).' },
  { number: 20, symbol: 'Ca', name: 'Calcium', group: 'Alkaline Earth', difficulty: 'easy', fact: 'Calcium is vital for human bones, teeth, muscle contraction, and limestone cliffs.' },
  { number: 22, symbol: 'Ti', name: 'Titanium', group: 'Transition Metal', difficulty: 'medium', fact: 'Named after the Titans of Greek mythology, titanium is as strong as steel yet ~45% lighter.' },
  { number: 24, symbol: 'Cr', name: 'Chromium', group: 'Transition Metal', difficulty: 'medium', fact: 'Chromium gives stainless steel its corrosion resistance and rubies their deep red color.' },
  { number: 25, symbol: 'Mn', name: 'Manganese', group: 'Transition Metal', difficulty: 'hard', fact: 'Manganese is essential to steelmaking and is frequently confused with magnesium.' },
  { number: 26, symbol: 'Fe', name: 'Iron', group: 'Transition Metal', difficulty: 'easy', fact: 'Its symbol Fe comes from Latin "ferrum." Iron dominates Earth’s core and carries oxygen in hemoglobin.' },
  { number: 27, symbol: 'Co', name: 'Cobalt', group: 'Transition Metal', difficulty: 'medium', fact: 'Cobalt has been prized for millennia for producing brilliant cobalt-blue glass and ceramics.' },
  { number: 28, symbol: 'Ni', name: 'Nickel', group: 'Transition Metal', difficulty: 'medium', fact: 'Surprisingly, a modern US five-cent nickel coin is 75% copper and only 25% nickel.' },
  { number: 29, symbol: 'Cu', name: 'Copper', group: 'Transition Metal', difficulty: 'easy', fact: 'Its symbol Cu derives from Latin "cuprum," referencing the island of Cyprus where Romans mined it.' },
  { number: 30, symbol: 'Zn', name: 'Zinc', group: 'Transition Metal', difficulty: 'medium', fact: 'US pennies minted after 1982 have a 97.5% zinc core coated in thin copper.' },
  { number: 31, symbol: 'Ga', name: 'Gallium', group: 'Post-Transition Metal', difficulty: 'hard', fact: 'Gallium melts at 29.76 °C — solid at room temperature, yet it melts right in the palm of your hand.' },
  { number: 33, symbol: 'As', name: 'Arsenic', group: 'Metalloid', difficulty: 'medium', fact: 'Famous in mystery novels, arsenic is also used in high-speed gallium arsenide semiconductors.' },
  { number: 35, symbol: 'Br', name: 'Bromine', group: 'Halogen', difficulty: 'medium', fact: 'Bromine is one of only two elements that are liquid at standard room temperature (alongside mercury).' },
  { number: 36, symbol: 'Kr', name: 'Krypton', group: 'Noble Gas', difficulty: 'medium', fact: 'Its name means "the hidden one" in Greek, and it predates Superman’s fictional planet by 40 years.' },
  { number: 47, symbol: 'Ag', name: 'Silver', group: 'Transition Metal', difficulty: 'easy', fact: 'Its symbol Ag comes from Latin "argentum." Silver has the highest electrical conductivity of any element.' },
  { number: 50, symbol: 'Sn', name: 'Tin', group: 'Post-Transition Metal', difficulty: 'medium', fact: 'Its symbol Sn comes from Latin "stannum." Alloyed with copper, tin ushered in the Bronze Age.' },
  { number: 51, symbol: 'Sb', name: 'Antimony', group: 'Metalloid', difficulty: 'hard', fact: 'Its symbol Sb comes from the historic mineral name "stibium."' },
  { number: 53, symbol: 'I', name: 'Iodine', group: 'Halogen', difficulty: 'medium', fact: 'Iodine sublimes directly into a vivid violet vapor, inspiring its name from the Greek "ioeides" (violet).' },
  { number: 54, symbol: 'Xe', name: 'Xenon', group: 'Noble Gas', difficulty: 'medium', fact: 'Xenon powers ultra-efficient ion thrusters on deep-space probes like NASA’s Dawn spacecraft.' },
  { number: 55, symbol: 'Cs', name: 'Cesium', group: 'Alkali Metal', difficulty: 'hard', fact: 'The official SI second is defined using microwave transitions of the cesium-133 atom in atomic clocks.' },
  { number: 56, symbol: 'Ba', name: 'Barium', group: 'Alkaline Earth', difficulty: 'hard', fact: 'Barium compounds create vivid emerald-green bursts in fireworks.' },
  { number: 74, symbol: 'W', name: 'Tungsten', group: 'Transition Metal', difficulty: 'hard', fact: 'Its symbol W honors "wolfram." Tungsten has the highest melting point of any pure metal at 3,422 °C.' },
  { number: 78, symbol: 'Pt', name: 'Platinum', group: 'Transition Metal', difficulty: 'medium', fact: 'Platinum is so unreactive and dense that it is considered one of the noble metals.' },
  { number: 79, symbol: 'Au', name: 'Gold', group: 'Transition Metal', difficulty: 'easy', fact: 'Its symbol Au derives from Latin "aurum," meaning "shining dawn."' },
  { number: 80, symbol: 'Hg', name: 'Mercury', group: 'Transition Metal', difficulty: 'easy', fact: 'Its symbol Hg comes from Greek "hydrargyrum" ("liquid silver"). It is the only metal liquid at room temperature.' },
  { number: 82, symbol: 'Pb', name: 'Lead', group: 'Post-Transition Metal', difficulty: 'easy', fact: 'Its symbol Pb comes from Latin "plumbum," which also gave English the word "plumbing."' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', group: 'Post-Transition Metal', difficulty: 'hard', fact: 'Pure bismuth forms iridescent staircase-shaped hopper crystals and is the active ingredient in Pepto-Bismol.' },
  { number: 86, symbol: 'Rn', name: 'Radon', group: 'Noble Gas', difficulty: 'hard', fact: 'Radon is a dense, colorless radioactive noble gas formed from the natural decay of uranium in rock.' },
  { number: 88, symbol: 'Ra', name: 'Radium', group: 'Alkaline Earth', difficulty: 'medium', fact: 'Discovered by Marie and Pierre Curie in 1898, radium glows with a faint blue radioluminescence.' },
  { number: 92, symbol: 'U', name: 'Uranium', group: 'Actinide', difficulty: 'easy', fact: 'Named after the planet Uranus, uranium is the heaviest naturally occurring element found in substantial amounts.' },
];
