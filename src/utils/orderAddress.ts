import { BANGLADESH_DISTRICT_THANAS, IThana } from '@/data/bangladeshLocations';

export interface IShippingAddressInput {
  addressLine?: string;
  thana?: string;
  district?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface IFormattedOrderAddress {
  fullText: string;
  street: string;
  thana: string;
  district: string;
}

function normalizeLocationString(str?: string): string {
  return (str || '').toLowerCase().replace(/[\s\-_,()]/g, '');
}

function getConsonantSkeleton(str: string): string {
  return str
    .toLowerCase()
    .replace(/(gonj|ganj|gojg|goj|gong|hat|bazar|pur|nagar|para)$/, '')
    .replace(/[aeiouy\s\-_]/g, '');
}

export function isThanaMatch(candidate: string, thana: IThana): boolean {
  const c = normalizeLocationString(candidate);
  const en = normalizeLocationString(thana.en);
  const bn = normalizeLocationString(thana.bn);
  if (!c) return false;
  if (c === en || c === bn) return true;
  if (en.includes(c) || c.includes(en)) return true;
  if (bn.includes(c) || c.includes(bn)) return true;

  const cCons = getConsonantSkeleton(c);
  const enCons = getConsonantSkeleton(en);
  if (cCons.length >= 3 && enCons.length >= 3 && (cCons === enCons || cCons.includes(enCons) || enCons.includes(cCons))) {
    return true;
  }
  return false;
}

export function findMatchingThana(candidate: string, district?: string): IThana | null {
  if (!candidate || candidate.trim().length < 3) return null;
  const cleanCandidate = candidate.trim();

  // 1. Search in matching district first for higher precision
  if (district) {
    const normDist = normalizeLocationString(district);
    for (const [distKey, thanas] of Object.entries(BANGLADESH_DISTRICT_THANAS)) {
      const normKey = normalizeLocationString(distKey);
      if (normKey.includes(normDist) || normDist.includes(normKey)) {
        const found = thanas.find(th => isThanaMatch(cleanCandidate, th));
        if (found) return found;
      }
    }
  }

  // 2. Fallback search across all Bangladesh thanas
  for (const thanas of Object.values(BANGLADESH_DISTRICT_THANAS)) {
    const found = thanas.find(th => isThanaMatch(cleanCandidate, th));
    if (found) return found;
  }
  return null;
}

/**
 * Formats shipping address to guarantee: [Full Delivery Address], [Thana / Upazila], [District]
 * Automatically fixes inverted thana/street stored in past orders.
 */
export function parseAndFormatOrderAddress(shippingAddress?: IShippingAddressInput): IFormattedOrderAddress {
  if (!shippingAddress) {
    return { fullText: '', street: '', thana: '', district: '' };
  }

  const rawLine = (shippingAddress.addressLine || '').trim();
  const rawThana = (shippingAddress.thana || '').trim();
  const rawDistrict = (shippingAddress.district || '').trim();

  if (!rawLine) {
    const parts = [rawThana, rawDistrict].filter(Boolean);
    return {
      fullText: parts.join(', '),
      street: '',
      thana: rawThana,
      district: rawDistrict,
    };
  }

  let street = rawLine;
  let detectedThana = rawThana;

  // Detect comma separated parts
  if (rawLine.includes(',')) {
    const parts = rawLine.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      const part0 = parts[0];
      const part1 = parts[1];

      // If rawThana exists and matches part0 -> [Thana, Street] inverted order detected
      if (
        rawThana &&
        (isThanaMatch(part0, { en: rawThana, bn: rawThana }) || part0.toLowerCase() === rawThana.toLowerCase())
      ) {
        street = part1;
        detectedThana = part0;
      } else if (
        rawThana &&
        (isThanaMatch(part1, { en: rawThana, bn: rawThana }) || part1.toLowerCase() === rawThana.toLowerCase())
      ) {
        street = part0;
        detectedThana = part1;
      } else {
        // Use Bangladesh thana dictionary lookup
        const match0 = findMatchingThana(part0, rawDistrict);
        const match1 = findMatchingThana(part1, rawDistrict);

        if (match0 && !match1) {
          // part0 is thana, part1 is detailed street address (e.g. "Monhorgojg, burprist")
          street = part1;
          detectedThana = part0;
        } else if (match1 && !match0) {
          // part0 is street, part1 is thana (e.g. "burprist, Monhorgojg")
          street = part0;
          detectedThana = part1;
        }
      }
    }
  }

  // Remove thana suffix from street if it got repeated
  if (detectedThana) {
    const lowerThana = detectedThana.toLowerCase();
    if (street.toLowerCase().endsWith(',' + lowerThana)) {
      street = street.slice(0, -(detectedThana.length + 1)).trim();
    } else if (street.toLowerCase().endsWith(', ' + lowerThana)) {
      street = street.slice(0, -(detectedThana.length + 2)).trim();
    }
  }

  // Build ordered full text: [Street], [Thana], [District]
  const fullParts: string[] = [];
  if (street) fullParts.push(street);
  if (detectedThana && !street.toLowerCase().includes(detectedThana.toLowerCase())) {
    fullParts.push(detectedThana);
  }
  if (
    rawDistrict &&
    !street.toLowerCase().includes(rawDistrict.toLowerCase()) &&
    (!detectedThana || !detectedThana.toLowerCase().includes(rawDistrict.toLowerCase()))
  ) {
    fullParts.push(rawDistrict);
  }

  return {
    fullText: fullParts.join(', '),
    street,
    thana: detectedThana,
    district: rawDistrict,
  };
}

export function formatOrderDisplayAddress(shippingAddress?: IShippingAddressInput): string {
  return parseAndFormatOrderAddress(shippingAddress).fullText;
}
