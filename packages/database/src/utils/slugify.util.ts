/**
 * Default character map for replacing special characters.
 */
const charMap: Record<string, string> = {
  $: 'dollar',
  '%': 'percent',
  '&': 'and',
  '<': 'less',
  '>': 'greater',
  '|': 'or',
  '¢': 'cent',
  '£': 'pound',
  '¤': 'currency',
  '¥': 'yen',
  '©': '(c)',
  ª: 'a',
  '®': '(r)',
  º: 'o',
  À: 'A',
  Á: 'A',
  Â: 'A',
  Ã: 'A',
  Ä: 'A',
  Å: 'A',
  Æ: 'AE',
  Ç: 'C',
  È: 'E',
  É: 'E',
  Ê: 'E',
  Ë: 'E',
  Ì: 'I',
  Í: 'I',
  Î: 'I',
  Ï: 'I',
  Ð: 'D',
  Ñ: 'N',
  Ò: 'O',
  Ó: 'O',
  Ô: 'O',
  Õ: 'O',
  Ö: 'O',
  Ø: 'O',
  Ù: 'U',
  Ú: 'U',
  Û: 'U',
  Ü: 'U',
  Ý: 'Y',
  Þ: 'TH',
  ß: 'ss',
  à: 'a',
  á: 'a',
  â: 'a',
  ã: 'a',
  ä: 'a',
  å: 'a',
  æ: 'ae',
  ç: 'c',
  è: 'e',
  é: 'e',
  ê: 'e',
  ë: 'e',
  ì: 'i',
  í: 'i',
  î: 'i',
  ï: 'i',
  ð: 'd',
  ñ: 'n',
  ò: 'o',
  ó: 'o',
  ô: 'o',
  õ: 'o',
  ö: 'o',
  ø: 'o',
  ù: 'u',
  ú: 'u',
  û: 'u',
  ü: 'u',
  ý: 'y',
  þ: 'th',
  ÿ: 'y',
  Œ: 'OE',
  œ: 'oe',
  Š: 'S',
  š: 's',
  Ÿ: 'Y',
  Ž: 'Z',
  ž: 'z',
  ƒ: 'f',
  Ơ: 'O',
  ơ: 'o',
  Ư: 'U',
  ư: 'u',
};

/**
 * Locale-based character maps.
 */
const locales: Record<string, Record<string, string>> = {
  de: { Ä: 'AE', ä: 'ae', Ö: 'OE', ö: 'oe', Ü: 'UE', ü: 'ue', ß: 'ss' },
  es: {
    '%': 'por ciento',
    '&': 'y',
    '¢': 'centavos',
    '£': 'libras',
    '€': 'euros',
  },
  fr: { '&': 'et', œ: 'oe', Œ: 'OE', '€': 'euro' },
};

/**
 * Slugify options interface.
 */
export interface SlugifyOptions {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
}

/**
 * Converts a string into a URL-friendly slug.
 *
 * @param input - The string to be slugified.
 * @param options - Custom options for the slug.
 * @returns A slugified string.
 */
export function slugify(input: string, options: SlugifyOptions = {}): string {
  if (typeof input !== 'string') {
    throw new Error('slugify: input must be a string');
  }

  const {
    replacement = '-',
    remove = /[^\w\s$*_+~.()'"!\-:@]+/g,
    lower = true,
    strict = false,
    locale = '',
    trim = true,
  } = options;

  const localeMap = locales[locale] || {};

  let slug = input
    .normalize()
    .split('')
    .map((char) => localeMap[char] || charMap[char] || char)
    .join('');

  // Remove unwanted characters
  slug = slug.replace(remove, '');

  // Strict mode: Allow only alphanumeric and spaces
  if (strict) {
    slug = slug.replace(/[^A-Za-z0-9\s]/g, '');
  }

  // Trim spaces
  if (trim) {
    slug = slug.trim();
  }

  // Replace spaces with the specified replacement character
  slug = slug.replace(/\s+/g, replacement);

  // Convert to lowercase if required
  return lower ? slug.toLowerCase() : slug;
}

/**
 * Extends the character map with custom replacements.
 *
 * @param customMap - Object containing custom character mappings.
 */
export function extendSlugify(customMap: Record<string, string>): void {
  Object.assign(charMap, customMap);
}

export default {
  slugify,
  extendSlugify,
};
