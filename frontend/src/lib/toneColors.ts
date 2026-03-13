/**
 * Tone color mapping for Mandarin Chinese pinyin
 * Tone 1 = red (text-red-500)
 * Tone 2 = orange (text-orange-500)
 * Tone 3 = green (text-green-500)
 * Tone 4 = blue (text-blue-500)
 * Tone 5/neutral = gray (text-gray-500)
 */

export type ToneNumber = 1 | 2 | 3 | 4 | 5;

/**
 * Get the Tailwind CSS class for a given tone number
 * @param tone - The tone number (1-5, where 5 is neutral)
 * @returns The Tailwind text color class
 */
export function getToneColor(tone: ToneNumber): string {
  const toneColors: Record<ToneNumber, string> = {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-green-500',
    4: 'text-blue-500',
    5: 'text-gray-500',
  };
  
  return toneColors[tone] || 'text-gray-500';
}

/**
 * Extract tone number from pinyin syllable with numeric tone
 * @param syllable - A pinyin syllable with numeric tone (e.g., "hàn", "zhi1", "ma5")
 * @returns The tone number (1-5)
 */
export function extractToneFromSyllable(syllable: string): ToneNumber {
  // Check for numeric tone marker at the end of the syllable
  const toneMatch = syllable.match(/([1-5])$/);
  if (toneMatch) {
    return parseInt(toneMatch[1], 10) as ToneNumber;
  }
  
  // If no numeric tone, check for accent marks
  const charWithTone = syllable.toLowerCase();
  
  // Tone 1 vowels: ā, ē, ī, ō, ū, ǖ
  if (/[āēīōūǖ]/.test(charWithTone)) return 1;
  
  // Tone 2 vowels: á, é, í, ó, ú, ǘ
  if (/[áéíóúǘ]/.test(charWithTone)) return 2;
  
  // Tone 3 vowels: ǎ, ě, ǐ, ǒ, ǔ, ǚ
  if (/[ǎěǐǒǔǚ]/.test(charWithTone)) return 3;
  
  // Tone 4 vowels: à, è, ì, ò, ù, ǜ
  if (/[àèìòùǜ]/.test(charWithTone)) return 4;
  
  // Default to neutral tone (5)
  return 5;
}

/**
 * Split pinyin string into syllables
 * @param pinyin - Full pinyin string with tone marks or numbers
 * @returns Array of syllables
 */
export function splitPinyinSyllables(pinyin: string): string[] {
  // Handle space-separated pinyin
  if (pinyin.includes(' ')) {
    return pinyin.split(' ').filter(s => s.length > 0);
  }
  
  // For pinyin without spaces, we need to split by syllable boundaries
  // This is a simplified approach - splits at vowel-consonant boundaries
  const syllables: string[] = [];
  let currentSyllable = '';
  let foundVowel = false;
  
  for (let i = 0; i < pinyin.length; i++) {
    const char = pinyin[i];
    const isVowel = /[aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(char);
    const isToneNumber = /[1-5]/.test(char);
    
    currentSyllable += char;
    
    if (isVowel) {
      foundVowel = true;
    }
    
    // End syllable after tone number or after vowel followed by consonant
    if (isToneNumber || (foundVowel && !isVowel && !isToneNumber)) {
      if (isToneNumber || i === pinyin.length - 1 || /[aeiouüvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i.test(pinyin[i + 1])) {
        syllables.push(currentSyllable);
        currentSyllable = '';
        foundVowel = false;
      }
    }
  }
  
  if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  return syllables.length > 0 ? syllables : [pinyin];
}

/**
 * Get tone colors for each syllable in a pinyin string
 * @param pinyin - Full pinyin string with tone marks or numbers
 * @returns Array of { syllable, toneColor } objects
 */
export function getPinyinToneColors(pinyin: string): Array<{ syllable: string; toneColor: string }> {
  const syllables = splitPinyinSyllables(pinyin);
  
  return syllables.map(syllable => ({
    syllable,
    toneColor: getToneColor(extractToneFromSyllable(syllable)),
  }));
}
