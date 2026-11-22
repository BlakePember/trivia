import React from 'react';
import type { FlagComponent } from 'country-flag-icons/react/3x2';
import {
  AE, AL, AR, AT, AU, BB, BD, BE, BG, BO, BR, BS, BT, BW, CA, CH, CL, CN, CO, CR,
  CU, CY, CZ, DE, DK, DO, DZ, EC, EE, EG, ES, ET, FI, FJ, FR, GB, GE, GH, GR, GT,
  HR, HU, ID, IE, IL, IN, IS, IT, JM, JO, JP, KE, KH, KR, KZ, LK, LT, LU, LV, MA,
  MG, MN, MT, MX, MY, MZ, NA, NG, NL, NO, NP, NZ, PA, PE, PG, PH, PK, PL, PT, PY,
  QA, RO, RS, RU, RW, SA, SC, SE, SG, SI, SK, SN, TH, TN, TO, TR, TZ, UA, UG, US,
  UY, UZ, VE, VN, WS, ZA,
} from 'country-flag-icons/react/3x2';

export const SUPPORTED_FLAGS: Record<string, FlagComponent> = {
  AE, AL, AR, AT, AU, BB, BD, BE, BG, BO, BR, BS, BT, BW, CA, CH, CL, CN, CO, CR,
  CU, CY, CZ, DE, DK, DO, DZ, EC, EE, EG, ES, ET, FI, FJ, FR, GB, GE, GH, GR, GT,
  HR, HU, ID, IE, IL, IN, IS, IT, JM, JO, JP, KE, KH, KR, KZ, LK, LT, LU, LV, MA,
  MG, MN, MT, MX, MY, MZ, NA, NG, NL, NO, NP, NZ, PA, PE, PG, PH, PK, PL, PT, PY,
  QA, RO, RS, RU, RW, SA, SC, SE, SG, SI, SK, SN, TH, TN, TO, TR, TZ, UA, UG, US,
  UY, UZ, VE, VN, WS, ZA,
};

interface CountryFlagProps {
  code: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  title?: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  size = 'md',
  title,
  className = '',
}) => {
  const upper = code.toUpperCase();
  const Icon = SUPPORTED_FLAGS[upper];

  if (!Icon) {
    return (
      <span className={`tv-flag-fallback tv-flag-${size} ${className}`} aria-label={title || upper}>
        {upper}
      </span>
    );
  }

  return (
    <span className={`tv-flag-frame tv-flag-${size} ${className}`}>
      <Icon className="tv-flag-svg" title={title} aria-label={title || `${upper} flag`} />
    </span>
  );
};
