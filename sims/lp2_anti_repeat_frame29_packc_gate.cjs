#!/usr/bin/env node
'use strict';

// Source-locked anti-repeat -> base29 digit -> one-byte receiver gate.
// Run from any directory: node sims/lp2_anti_repeat_frame29_packc_gate.cjs

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const mod = (x, m) => ((x % m) + m) % m;

const gp = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/base60-grid.json');
const punctuation = json('resources/liber-primus/lp2-punctuation-identity.json');
const sexagesimal = json('resources/cicada2014-sexagesimal-source.json');
const transcription = read('resources/lp2-transcription.txt');
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const RUNIC = /[\u16A0-\u16FF]/u;
const alphabet29 = '0123456789ABCDEFGHIJKLMNOPQRS';

const pageStarts = new Map();
let totalPageRunes = 0;
for (const page of gp.pages) {
  pageStarts.set(page.page, totalPageRunes);
  totalPageRunes += page.runic_count;
}

// Parse printed word boundaries without resetting at page breaks.
const words = [];
let current = '';
let runeOffset = 0;
let wordStart = 0;
function finishWord() {
  if (!current) return;
  const indices = [...current].map((r) => {
    const ix = runeIndex.get(r);
    if (ix === undefined) throw new Error('Rune outside GP alphabet: ' + r);
    return ix;
  });
  words.push({ start: wordStart, end: runeOffset, indices });
  current = '';
}
for (const ch of transcription) {
  if (RUNIC.test(ch)) {
    if (!current) wordStart = runeOffset;
    current += ch;
    runeOffset++;
  } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
    // Layout only; page carries are preserved.
  } else {
    finishWord();
  }
}
finishWord();

const punctuationOffsets = new Map(
  punctuation.events.map((e) => [e.rune_offset, e.symbol])
);
const wordBoundaries = new Set(words.flatMap((w) => [w.start, w.end]));

function encodeTransitions(runes) {
  if (!runes.length) return [];
  const digits = [runes[0]]; // first rune is the 29-state seed
  for (let i = 1; i < runes.length; i++) {
    const previous = runes[i - 1];
    const currentRune = runes[i];
    digits.push(
      currentRune === previous
        ? 28
        : (currentRune < previous ? currentRune : currentRune - 1)
    );
  }
  return digits;
}
function decodeTransitions(digits) {
  if (!digits.length) return [];
  let previous = digits[0];
  const runes = [previous];
  for (const digit of digits.slice(1)) {
    const currentRune = digit === 28
      ? previous
      : (digit < previous ? digit : digit + 1);
    runes.push(currentRune);
    previous = currentRune;
  }
  return runes;
}
function packC(digits) {
  // 2014 decimaltobyte.pm convention: pack 'C', one decimal value per byte.
  if (digits.some((x) => x < 0 || x > 255)) throw new Error('pack C overflow');
  return Uint8Array.from(digits);
}
function frameLengths(digits) {
  const lengths = [];
  let n = 0;
  for (const digit of digits) {
    if (digit === 28) {
      lengths.push(n);
      n = 0;
    } else {
      n++;
    }
  }
  lengths.push(n);
  return lengths;
}
function byteSummary(bytes) {
  const histogram = new Array(256).fill(0);
  for (const b of bytes) histogram[b]++;
  let validUtf8 = true;
  try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch (_) { validUtf8 = false; }
  const signatures = [
    ['PNG', '89504e47'], ['ZIP', '504b0304'], ['GZIP', '1f8b'],
    ['PDF', '25504446'], ['ELF', '7f454c46'], ['RIFF', '52494646'],
    ['RAR', '52617221'], ['7z', '377abcaf271c'], ['XZ', 'fd377a585a00'],
    ['BZIP2', '425a68'], ['SQLite', '53514c697465'], ['GIF', '47494638'],
    ['JPEG', 'ffd8ff'], ['BMP', '424d'], ['MP4', '0000001866747970'],
    ['PGP', '2d2d2d2d2d424547494e20504750204d4553534147452d2d2d2d2d'],
  ];
  const magic = signatures.filter(([_, hex]) =>
    [...hex.matchAll(/../g)].every((m, i) => bytes[i] === parseInt(m[0], 16))
  ).map(([name]) => name);
  return {
    length: bytes.length,
    first16Hex: [...bytes.slice(0, 16)].map((x) => x.toString(16).padStart(2, '0')).join(''),
    min: Math.min(...bytes),
    max: Math.max(...bytes),
    uniqueByteValues: histogram.filter((x) => x > 0).length,
    printableAsciiRatio: bytes.filter((x) => x >= 32 && x <= 126).length / bytes.length,
    validUtf8,
    magic,
  };
}
function base29Text(digits) {
  return digits.map((d) => alphabet29[d]).join('');
}
function base29String(n) {
  let out = '';
  do {
    out = alphabet29[Number(n % 29n)] + out;
    n /= 29n;
  } while (n > 0n);
  return out;
}
function bytesToBigInt(bytes) {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  return n;
}
function base29Digits(n, width) {
  const out = new Array(width).fill(0);
  for (let i = width - 1; i >= 0; i--) {
    out[i] = Number(n % 29n);
    n /= 29n;
  }
  if (n !== 0n) throw new Error('Base29 plant width too small');
  return out;
}
function base29ToBigInt(digits) {
  let n = 0n;
  for (const d of digits) n = n * 29n + BigInt(d);
  return n;
}
function bigIntToBytes(n, length) {
  const out = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  if (n !== 0n) throw new Error('Binary plant does not fit fixed byte length');
  return out;
}
function binaryPlant(bytes) {
  const width = Math.ceil(bytes.length * 8 / Math.log2(29));
  const digits = base29Digits(bytesToBigInt(bytes), width);
  const runeSequence = decodeTransitions(digits);
  const reencoded = encodeTransitions(runeSequence);
  const recovered = bigIntToBytes(base29ToBigInt(reencoded), bytes.length);
  return {
    sourceBytes: bytes.length,
    fixedBase29Digits: width,
    transitionRoundTrip: JSON.stringify(decodeTransitions(reencoded)) === JSON.stringify(runeSequence),
    exactBytes: JSON.stringify([...recovered]) === JSON.stringify([...bytes]),
  };
}

const chapterSpecs = [
  { name: 'p0-2', first: 0, last: 2 },
  { name: 'p33-39', first: 33, last: 39 },
  { name: 'p54-55', first: 54, last: 55 },
];
function chapterResult(spec) {
  const pages = gp.pages.filter((p) => p.page >= spec.first && p.page <= spec.last);
  const runes = pages.flatMap((p) => p.indices);
  const digits = encodeTransitions(runes);
  const bytes = packC(digits);
  const back = decodeTransitions(digits);
  let samePageRepeats = 0;
  for (const page of pages) {
    for (let i = 1; i < page.indices.length; i++) {
      if (page.indices[i] === page.indices[i - 1]) samePageRepeats++;
    }
  }
  let crossPageRepeats = 0;
  for (let i = 1; i < pages.length; i++) {
    if (pages[i].indices[0] === pages[i - 1].indices.at(-1)) crossPageRepeats++;
  }
  const globalStart = pageStarts.get(spec.first);
  const repeatPositions = [];
  for (let i = 1; i < runes.length; i++) {
    if (runes[i] === runes[i - 1]) repeatPositions.push(globalStart + i);
  }
  const ascii = base29Text(digits);
  const keywords = ['BASE29', 'NEXT', '3301', 'ONION', 'CICADA', 'HTTP'];
  return {
    name: spec.name,
    runes: runes.length,
    printedWords: words.filter((w) =>
      w.start >= globalStart && w.end <= globalStart + runes.length
    ).length,
    samePageRepeats,
    crossPageRepeats,
    repeatsAtPrintedWordBoundary: repeatPositions.filter((p) => wordBoundaries.has(p)).length,
    repeatsAtOriginalPunctuation: repeatPositions.filter((p) => punctuationOffsets.has(p)).length,
    repeatByte: '0x1c (ASCII File Separator, FS)',
    frameCount: frameLengths(digits).length,
    frameLengths: frameLengths(digits),
    asciiBase29Prefix: ascii.slice(0, 100),
    sourceTokenHits: keywords.filter((k) => ascii.includes(k)),
    byteStream: byteSummary(bytes),
    exactRoundTrip: JSON.stringify(back) === JSON.stringify(runes),
  };
}

// Full p0–55 anti-repeat and framing statistics, with page carries.
const unknownPages = gp.pages.filter((p) => p.page <= 55);
const unknownRunes = unknownPages.flatMap((p) => p.indices);
const unknownDigits = encodeTransitions(unknownRunes);
let samePageOpportunities = 0;
let samePageRepeats = 0;
let crossPageOpportunities = 0;
let crossPageRepeats = 0;
const unknownRepeatPositions = [];
let pageBase = 0;
for (const page of unknownPages) {
  samePageOpportunities += Math.max(0, page.indices.length - 1);
  for (let i = 1; i < page.indices.length; i++) {
    if (page.indices[i] === page.indices[i - 1]) {
      samePageRepeats++;
      unknownRepeatPositions.push(pageBase + i);
    }
  }
  pageBase += page.runic_count;
}
const runeBearingPages = unknownPages.filter((p) => p.indices.length > 0);
for (let i = 1; i < runeBearingPages.length; i++) {
  crossPageOpportunities++;
  if (runeBearingPages[i].indices[0] === runeBearingPages[i - 1].indices.at(-1)) {
    crossPageRepeats++;
  }
}
const unknownFrameLengths = frameLengths(unknownDigits).sort((a, b) => a - b);
const unknownRepeatAtWordBoundary = unknownRepeatPositions.filter((p) => wordBoundaries.has(p)).length;
const unknownRepeatAtPunctuation = unknownRepeatPositions.filter((p) => punctuationOffsets.has(p)).length;
const unknownRepeatByPunctuation = {
  large: unknownRepeatPositions.filter((p) => punctuationOffsets.get(p) === '⁜').length,
  small: unknownRepeatPositions.filter((p) => punctuationOffsets.get(p) === '⁘').length,
  other: unknownRepeatPositions.filter((p) => punctuationOffsets.get(p) === '⁚').length,
};

// Native GP-English controls for a fixed 16-signature false-positive check.
const tokens = gp.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
function encodeEnglish(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const token = tokens.find((t) => word.startsWith(t.token, i));
      if (!token) throw new Error('Unencodable GP-English control: ' + word.slice(i));
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}
const controlPaths = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
];
let controlWindows = 0;
let falsePositives = 0;
for (const p of controlPaths) {
  const indices = encodeEnglish(read(p));
  for (let i = 0; i + 40 <= indices.length; i += 40) {
    controlWindows++;
    const bytes = packC(encodeTransitions(indices.slice(i, i + 40)));
    if (byteSummary(bytes).magic.length) falsePositives++;
  }
}

// Source-native prose and binary plants.
const p57 = gp.pages.find((p) => p.page === 57).indices;
const p57Digits = encodeTransitions(p57);
const p57RoundTrip = JSON.stringify(decodeTransitions(p57Digits)) === JSON.stringify(p57);
const p50Bytes = grid.byte_rows.flat();
const p50Plant = binaryPlant(p50Bytes);
const sexagesimalPlant = binaryPlant(sexagesimal.decimal_values);
const base29Example = base29String(3301n);

const result = {
  source: {
    base29Example3301: base29Example,
    packCConvention: sexagesimal.converter_source.includes("pack 'C'"),
    unknownRunes: unknownRunes.length,
    samePageOpportunities,
    samePageRepeats,
    crossPageOpportunities,
    crossPageRepeats,
    repeatsAtPrintedWordBoundary: unknownRepeatAtWordBoundary,
    repeatsInsidePrintedWords: samePageRepeats - unknownRepeatAtWordBoundary,
    repeatsAtOriginalPunctuation: unknownRepeatAtPunctuation,
    repeatPunctuationBreakdown: unknownRepeatByPunctuation,
    frameCount: frameLengths(unknownDigits).length,
    frameLengthMin: unknownFrameLengths[0],
    frameLengthMedian: unknownFrameLengths[Math.floor(unknownFrameLengths.length / 2)],
    frameLengthMax: unknownFrameLengths.at(-1),
    repeatByte: 'decimal 28 = 0x1c = ASCII FS',
  },
  chapterOutputs: chapterSpecs.map(chapterResult),
  controls: {
    p57ProseRunes: p57.length,
    p57ExactRoundTrip: p57RoundTrip,
    p50OriginalTableBinaryPlant: p50Plant,
    historical2014SexagesimalBinaryPlant: sexagesimalPlant,
    magicSignatures: 16,
    nativeGpEnglish40RuneWindows: controlWindows,
    falsePositives: falsePositives,
    falsePositiveRate: falsePositives / controlWindows,
  },
  interpretation: {
    mapping: 'first rune is seed; each different successor maps to its rank among the 28 alternatives; an equal successor maps to digit 28',
    bytePacking: 'one decimal digit per byte, following the 2014 pack C convention',
    repeatSemantics: 'digit 28 becomes ASCII FS (0x1c) and marks a record boundary; next transition is ranked from the repeated rune',
    pageBoundaries: 'carry state; no page reset',
    chapterBoundaries: 'each selected chapter starts with its own 29-state seed',
  },
};
if (base29Example !== '3QO') throw new Error('BASE29 historical example mismatch');
if (!p57RoundTrip || !p50Plant.exactBytes || !sexagesimalPlant.exactBytes) {
  throw new Error('A source-native positive plant failed');
}
if (samePageRepeats !== 86 || crossPageRepeats !== 0 || unknownRunes.length !== 12956) {
  throw new Error('Anti-repeat source counts changed');
}
console.log(JSON.stringify(result, null, 2));
