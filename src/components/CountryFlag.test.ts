import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../../shared/data/countries.js';
import { SUPPORTED_FLAGS } from './CountryFlag';

describe('CountryFlag SVG Map', () => {
  it('maps every country in COUNTRIES to an offline vector SVG flag component', () => {
    for (const c of COUNTRIES) {
      expect(
        SUPPORTED_FLAGS[c.code],
        `Missing SUPPORTED_FLAGS entry for ${c.code} (${c.name})`
      ).toBeDefined();
    }
  });
});
