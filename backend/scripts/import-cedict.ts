#!/usr/bin/env tsx
/**
 * CC-CEDICT Dictionary Import Script
 * 
 * This script parses CC-CEDICT format data and imports it into the database.
 * 
 * Usage: npm run import:cedict -- <path-to-cedict-file>
 * 
 * CC-CEDICT format: Traditional Simplified [pin1 yin1] /definition 1/definition 2/.../
 * 
 * Example: 中文 中文 [zhong1 wen2] /Chinese language/CL:門|门[men2]/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { randomUUID } from 'crypto';

// Prisma client setup - need to import from compiled path or setup ts-node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tone mark mapping for converting pinyin with tone numbers to pinyin with tone marks
const TONE_MARKS: Record<string, Record<number, string>> = {
  a: { 1: 'ā', 2: 'á', 3: 'ǎ', 4: 'à', 5: 'a' },
  e: { 1: 'ē', 2: 'é', 3: 'ě', 4: 'è', 5: 'e' },
  i: { 1: 'ī', 2: 'í', 3: 'ǐ', 4: 'ì', 5: 'i' },
  o: { 1: 'ō', 2: 'ó', 3: 'ǒ', 4: 'ò', 5: 'o' },
  u: { 1: 'ū', 2: 'ú', 3: 'ǔ', 4: 'ù', 5: 'u' },
  ü: { 1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ', 5: 'ü' },
  v: { 1: 'ǖ', 2: 'ǘ', 3: 'ǚ', 4: 'ǜ', 5: 'ü' },
};

// Vowel priority for tone placement
const VOWEL_PRIORITY = ['a', 'o', 'e', 'i', 'u', 'ü', 'v'];

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
Usage: npm run import:cedict -- <path-to-cedict-file>

Downloads and imports CC-CEDICT dictionary data.

Arguments:
  <path-to-cedict-file>  Path to the CC-CEDICT text file (can be relative or absolute)

Options:
  --help                 Show this help message

Examples:
  npm run import:cedict -- ./cedict.txt
  npm run import:cedict -- /home/user/Downloads/cedict_1_0_ts_utf-8_mdbg.txt
  npm run import:cedict -- ../scripts/cedict_ts.u8
`);
}

/**
 * Convert a single pinyin syllable with tone number to pinyin with tone mark
 */
function convertSyllable(syllable: string): string {
  // Handle special case for u: (ü representation in CC-CEDICT)
  const normalizedSyllable = syllable.replace(/u:/gi, (match) => 
    match === 'U:' ? 'Ü' : 'ü'
  );
  
  // Extract tone number from the end
  const match = normalizedSyllable.match(/^([a-zA-ZüÜ]+?)(\d)?$/);
  if (!match) return syllable;

  const [, base, toneStr] = match;
  const tone = toneStr ? parseInt(toneStr, 10) : 5;

  // Handle special case for ü/v
  const baseWithUmlaut = base.replace(/v/gi, (match) => 
    match === 'V' ? 'Ü' : 'ü'
  );

  // Find the vowel to apply tone mark to based on priority
  for (const vowel of VOWEL_PRIORITY) {
    const lowerVowel = vowel.toLowerCase();
    if (baseWithUmlaut.toLowerCase().includes(lowerVowel)) {
      // Find the position of the vowel
      const pos = baseWithUmlaut.toLowerCase().indexOf(lowerVowel);
      const originalChar = baseWithUmlaut[pos];
      const isUpper = originalChar === originalChar.toUpperCase();
      const toneMark = TONE_MARKS[vowel][tone];
      const replacement = isUpper ? toneMark.toUpperCase() : toneMark;
      
      return baseWithUmlaut.slice(0, pos) + replacement + baseWithUmlaut.slice(pos + 1);
    }
  }

  return baseWithUmlaut;
}

/**
 * Convert full pinyin string with tone numbers to pinyin with tone marks
 * Example: "zhong1 wen2" -> "zhōng wén"
 */
function convertPinyinToMarks(pinyinNumeric: string): string {
  return pinyinNumeric
    .split(/\s+/)
    .map((syllable) => convertSyllable(syllable))
    .join(' ');
}

/**
 * Parse a single CC-CEDICT line
 * Format: Traditional Simplified [pin1 yin1] /definition 1/definition 2/.../
 */
interface ParsedEntry {
  traditional: string;
  simplified: string;
  pinyinNumeric: string;
  pinyin: string;
  definitions: string[];
}

interface ParseResult {
  entry: ParsedEntry | null;
  error: string | null;
  lineNumber: number;
}

function parseCedictLine(line: string, lineNumber: number): ParseResult {
  // Skip comments and empty lines
  if (line.startsWith('#') || line.trim() === '') {
    return { entry: null, error: null, lineNumber };
  }

  // Parse the line using regex
  // Format: Traditional Simplified [pinyin] /definition1/definition2/.../
  // Allow for multiple spaces between fields
  const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/);
  
  if (!match) {
    return { 
      entry: null, 
      error: `Malformed line format: ${line.substring(0, 100)}...`, 
      lineNumber 
    };
  }

  const [, traditional, simplified, pinyinNumeric, definitionsStr] = match;
  
  // Handle empty definitions
  const definitions = definitionsStr.split('/').filter((d) => d.trim() !== '');
  
  if (definitions.length === 0) {
    return { 
      entry: null, 
      error: `No definitions found: ${line.substring(0, 100)}...`, 
      lineNumber 
    };
  }

  const pinyin = convertPinyinToMarks(pinyinNumeric);

  return {
    entry: {
      traditional,
      simplified,
      pinyinNumeric,
      pinyin,
      definitions,
    },
    error: null,
    lineNumber,
  };
}

/**
 * Main import function
 */
async function importCedict(filePath: string): Promise<void> {
  const absolutePath = path.resolve(filePath);
  
  console.log(`Starting CC-CEDICT import`);
  console.log(`Resolved path: ${absolutePath}`);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}\nPlease verify the file path and try again.`);
  }

  const stats = fs.statSync(absolutePath);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  console.log('\nClearing existing dictionary entries...');
  await prisma.dictionaryEntry.deleteMany({});
  console.log('Existing entries cleared.');

  console.log('\nStarting import...\n');

  // Read entire file into memory first to avoid stream issues
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);

  const BATCH_SIZE = 1000;
  const batch: ParsedEntry[] = [];
  let lineNumber = 0;
  let totalProcessed = 0;
  let totalImported = 0;
  let totalErrors = 0;
  const errors: string[] = [];

  for (const line of lines) {
    lineNumber++;
    const result = parseCedictLine(line, lineNumber);
    
    if (result.error) {
      totalErrors++;
      if (errors.length < 10) {
        errors.push(`Line ${result.lineNumber}: ${result.error}`);
      }
      continue;
    }
    
    if (!result.entry) continue;

    batch.push(result.entry);
    totalProcessed++;

    if (batch.length >= BATCH_SIZE) {
      try {
        await insertBatch(batch);
        totalImported += batch.length;
        console.log(`Imported ${totalImported} entries...`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Batch insert failed at line ${lineNumber}: ${errorMsg}`);
        totalErrors += batch.length;
      }
      batch.length = 0;
    }
  }

  // Insert remaining entries
  if (batch.length > 0) {
    try {
      await insertBatch(batch);
      totalImported += batch.length;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Final batch insert failed: ${errorMsg}`);
      totalErrors += batch.length;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('                    IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total lines read:        ${lineNumber}`);
  console.log(`Entries processed:       ${totalProcessed}`);
  console.log(`Entries imported:        ${totalImported}`);
  console.log(`Parse errors:            ${totalErrors}`);
  
  if (errors.length > 0) {
    console.log('\nFirst 10 errors:');
    errors.forEach((err) => console.log(`  - ${err}`));
    if (totalErrors > 10) {
      console.log(`  ... and ${totalErrors - 10} more errors`);
    }
  }
  console.log('='.repeat(60));
}

/**
 * Insert a batch of entries into the database
 */
async function insertBatch(entries: ParsedEntry[]): Promise<void> {
  const now = new Date();
  await prisma.dictionaryEntry.createMany({
    data: entries.map((entry) => ({
      id: randomUUID(),
      traditional: entry.traditional,
      simplified: entry.simplified,
      pinyin: entry.pinyin,
      pinyinNumeric: entry.pinyinNumeric,
      definitions: entry.definitions,
      updatedAt: now,
    })),
    skipDuplicates: true,
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (args.length === 0) {
    console.error('Error: Missing required argument <path-to-cedict-file>\n');
    showHelp();
    process.exit(1);
  }

  const filePath = args[0];

  try {
    await importCedict(filePath);
  } catch (error) {
    console.error('\nImport failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
