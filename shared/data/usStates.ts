import type { Difficulty } from '../types.js';

export interface USStateEntry {
  name: string;
  abbr: string;
  capital: string;
  nickname: string;
  usRegion: 'Northeast' | 'South' | 'Midwest' | 'West';
  difficulty: Difficulty;
}

export const US_STATES: USStateEntry[] = [
  { name: 'Alabama', abbr: 'AL', capital: 'Montgomery', nickname: 'Yellowhammer State', usRegion: 'South', difficulty: 'medium' },
  { name: 'Alaska', abbr: 'AK', capital: 'Juneau', nickname: 'The Last Frontier', usRegion: 'West', difficulty: 'medium' },
  { name: 'Arizona', abbr: 'AZ', capital: 'Phoenix', nickname: 'Grand Canyon State', usRegion: 'West', difficulty: 'easy' },
  { name: 'Arkansas', abbr: 'AR', capital: 'Little Rock', nickname: 'The Natural State', usRegion: 'South', difficulty: 'medium' },
  { name: 'California', abbr: 'CA', capital: 'Sacramento', nickname: 'The Golden State', usRegion: 'West', difficulty: 'easy' },
  { name: 'Colorado', abbr: 'CO', capital: 'Denver', nickname: 'The Centennial State', usRegion: 'West', difficulty: 'easy' },
  { name: 'Connecticut', abbr: 'CT', capital: 'Hartford', nickname: 'The Constitution State', usRegion: 'Northeast', difficulty: 'medium' },
  { name: 'Delaware', abbr: 'DE', capital: 'Dover', nickname: 'The First State', usRegion: 'South', difficulty: 'medium' },
  { name: 'Florida', abbr: 'FL', capital: 'Tallahassee', nickname: 'The Sunshine State', usRegion: 'South', difficulty: 'easy' },
  { name: 'Georgia', abbr: 'GA', capital: 'Atlanta', nickname: 'The Peach State', usRegion: 'South', difficulty: 'easy' },
  { name: 'Hawaii', abbr: 'HI', capital: 'Honolulu', nickname: 'The Aloha State', usRegion: 'West', difficulty: 'easy' },
  { name: 'Idaho', abbr: 'ID', capital: 'Boise', nickname: 'The Gem State', usRegion: 'West', difficulty: 'medium' },
  { name: 'Illinois', abbr: 'IL', capital: 'Springfield', nickname: 'Prairie State', usRegion: 'Midwest', difficulty: 'easy' },
  { name: 'Indiana', abbr: 'IN', capital: 'Indianapolis', nickname: 'The Hoosier State', usRegion: 'Midwest', difficulty: 'easy' },
  { name: 'Iowa', abbr: 'IA', capital: 'Des Moines', nickname: 'The Hawkeye State', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Kansas', abbr: 'KS', capital: 'Topeka', nickname: 'The Sunflower State', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Kentucky', abbr: 'KY', capital: 'Frankfort', nickname: 'The Bluegrass State', usRegion: 'South', difficulty: 'hard' },
  { name: 'Louisiana', abbr: 'LA', capital: 'Baton Rouge', nickname: 'The Pelican State', usRegion: 'South', difficulty: 'medium' },
  { name: 'Maine', abbr: 'ME', capital: 'Augusta', nickname: 'The Pine Tree State', usRegion: 'Northeast', difficulty: 'medium' },
  { name: 'Maryland', abbr: 'MD', capital: 'Annapolis', nickname: 'The Old Line State', usRegion: 'South', difficulty: 'medium' },
  { name: 'Massachusetts', abbr: 'MA', capital: 'Boston', nickname: 'The Bay State', usRegion: 'Northeast', difficulty: 'easy' },
  { name: 'Michigan', abbr: 'MI', capital: 'Lansing', nickname: 'The Great Lakes State', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Minnesota', abbr: 'MN', capital: 'Saint Paul', nickname: 'Land of 10,000 Lakes', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Mississippi', abbr: 'MS', capital: 'Jackson', nickname: 'The Magnolia State', usRegion: 'South', difficulty: 'medium' },
  { name: 'Missouri', abbr: 'MO', capital: 'Jefferson City', nickname: 'The Show-Me State', usRegion: 'Midwest', difficulty: 'hard' },
  { name: 'Montana', abbr: 'MT', capital: 'Helena', nickname: 'The Treasure State', usRegion: 'West', difficulty: 'hard' },
  { name: 'Nebraska', abbr: 'NE', capital: 'Lincoln', nickname: 'The Cornhusker State', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Nevada', abbr: 'NV', capital: 'Carson City', nickname: 'The Silver State', usRegion: 'West', difficulty: 'hard' },
  { name: 'New Hampshire', abbr: 'NH', capital: 'Concord', nickname: 'The Granite State', usRegion: 'Northeast', difficulty: 'hard' },
  { name: 'New Jersey', abbr: 'NJ', capital: 'Trenton', nickname: 'The Garden State', usRegion: 'Northeast', difficulty: 'medium' },
  { name: 'New Mexico', abbr: 'NM', capital: 'Santa Fe', nickname: 'Land of Enchantment', usRegion: 'West', difficulty: 'medium' },
  { name: 'New York', abbr: 'NY', capital: 'Albany', nickname: 'The Empire State', usRegion: 'Northeast', difficulty: 'easy' },
  { name: 'North Carolina', abbr: 'NC', capital: 'Raleigh', nickname: 'The Tar Heel State', usRegion: 'South', difficulty: 'medium' },
  { name: 'North Dakota', abbr: 'ND', capital: 'Bismarck', nickname: 'The Peace Garden State', usRegion: 'Midwest', difficulty: 'hard' },
  { name: 'Ohio', abbr: 'OH', capital: 'Columbus', nickname: 'The Buckeye State', usRegion: 'Midwest', difficulty: 'easy' },
  { name: 'Oklahoma', abbr: 'OK', capital: 'Oklahoma City', nickname: 'The Sooner State', usRegion: 'South', difficulty: 'easy' },
  { name: 'Oregon', abbr: 'OR', capital: 'Salem', nickname: 'The Beaver State', usRegion: 'West', difficulty: 'medium' },
  { name: 'Pennsylvania', abbr: 'PA', capital: 'Harrisburg', nickname: 'The Keystone State', usRegion: 'Northeast', difficulty: 'medium' },
  { name: 'Rhode Island', abbr: 'RI', capital: 'Providence', nickname: 'The Ocean State', usRegion: 'Northeast', difficulty: 'medium' },
  { name: 'South Carolina', abbr: 'SC', capital: 'Columbia', nickname: 'The Palmetto State', usRegion: 'South', difficulty: 'medium' },
  { name: 'South Dakota', abbr: 'SD', capital: 'Pierre', nickname: 'Mount Rushmore State', usRegion: 'Midwest', difficulty: 'hard' },
  { name: 'Tennessee', abbr: 'TN', capital: 'Nashville', nickname: 'The Volunteer State', usRegion: 'South', difficulty: 'easy' },
  { name: 'Texas', abbr: 'TX', capital: 'Austin', nickname: 'The Lone Star State', usRegion: 'South', difficulty: 'easy' },
  { name: 'Utah', abbr: 'UT', capital: 'Salt Lake City', nickname: 'The Beehive State', usRegion: 'West', difficulty: 'easy' },
  { name: 'Vermont', abbr: 'VT', capital: 'Montpelier', nickname: 'The Green Mountain State', usRegion: 'Northeast', difficulty: 'hard' },
  { name: 'Virginia', abbr: 'VA', capital: 'Richmond', nickname: 'Old Dominion', usRegion: 'South', difficulty: 'medium' },
  { name: 'Washington', abbr: 'WA', capital: 'Olympia', nickname: 'The Evergreen State', usRegion: 'West', difficulty: 'medium' },
  { name: 'West Virginia', abbr: 'WV', capital: 'Charleston', nickname: 'The Mountain State', usRegion: 'South', difficulty: 'hard' },
  { name: 'Wisconsin', abbr: 'WI', capital: 'Madison', nickname: 'The Badger State', usRegion: 'Midwest', difficulty: 'medium' },
  { name: 'Wyoming', abbr: 'WY', capital: 'Cheyenne', nickname: 'The Equality State', usRegion: 'West', difficulty: 'hard' },
];
