import React from 'react';
import type { FlagComponent } from 'country-flag-icons/react/3x2';
import {
  AD, AE, AL, AM, AR, AT, AU, AZ, BA, BB, BD, BE, BG, BO, BR, BS, BT, BW, BZ, CA,
  CH, CI, CL, CM, CN, CO, CR, CU, CY, CZ, DE, DK, DO, DZ, EC, EE, EG, ES, ET, FI,
  FJ, FR, GB, GE, GH, GR, GT, HN, HR, HU, ID, IE, IL, IN, IS, IT, JM, JO, JP, KE,
  KH, KR, KW, KZ, LA, LB, LK, LT, LU, LV, MA, MC, MD, ME, MG, MK, MN, MT, MV, MX,
  MY, MZ, NA, NG, NI, NL, NO, NP, NZ, OM, PA, PE, PG, PH, PK, PL, PT, PW, PY, QA,
  RO, RS, RU, RW, SA, SC, SE, SG, SI, SK, SN, SV, TH, TN, TO, TR, TT, TZ, UA, UG,
  US, UY, UZ, VE, VN, VU, WS, ZA, ZM, ZW,
} from 'country-flag-icons/react/3x2';

export const SUPPORTED_FLAGS: Record<string, FlagComponent> = {
  AD, AE, AL, AM, AR, AT, AU, AZ, BA, BB, BD, BE, BG, BO, BR, BS, BT, BW, BZ, CA,
  CH, CI, CL, CM, CN, CO, CR, CU, CY, CZ, DE, DK, DO, DZ, EC, EE, EG, ES, ET, FI,
  FJ, FR, GB, GE, GH, GR, GT, HN, HR, HU, ID, IE, IL, IN, IS, IT, JM, JO, JP, KE,
  KH, KR, KW, KZ, LA, LB, LK, LT, LU, LV, MA, MC, MD, ME, MG, MK, MN, MT, MV, MX,
  MY, MZ, NA, NG, NI, NL, NO, NP, NZ, OM, PA, PE, PG, PH, PK, PL, PT, PW, PY, QA,
  RO, RS, RU, RW, SA, SC, SE, SG, SI, SK, SN, SV, TH, TN, TO, TR, TT, TZ, UA, UG,
  US, UY, UZ, VE, VN, VU, WS, ZA, ZM, ZW,
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
