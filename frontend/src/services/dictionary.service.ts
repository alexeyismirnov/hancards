import { api } from '@/lib/api';

export interface DictionaryEntry {
  id: string;
  traditional: string;
  simplified: string;
  pinyin: string;        // With tone marks
  pinyinNumeric: string; // With tone numbers
  definitions: string[];
  hskLevel: number | null;
  frequencyRank: number | null;
}

export interface DictionaryLookupResponse {
  entries: DictionaryEntry[];
}

/**
 * Lookup a Chinese character in the dictionary
 * @param character - The Chinese character to look up
 * @param variant - Optional variant type: 'simplified' or 'traditional'
 * @returns Array of dictionary entries matching the character
 */
export const lookupCharacter = async (
  character: string,
  variant?: 'simplified' | 'traditional'
): Promise<DictionaryEntry[]> => {
  let endpoint = `/api/dictionary/lookup?character=${encodeURIComponent(character)}`;
  
  if (variant) {
    endpoint += `&variant=${variant}`;
  }
  
  const response = await api.get<DictionaryLookupResponse>(endpoint);
  return response.entries;
};

export const dictionaryService = {
  lookupCharacter,
};
