'use strict';
const fs = require('fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const translit = corpus.translit;
const runeChars = Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');
const glyphToIndex = new Map(runeChars.map((g, i) => [g, i]));

function assert(ok, message) {
  if (!ok) throw new Error(message);
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  const n = values.length;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
function adjacentEqual(values) {
  let n = 0;
  for (let i = 1; i < values.length; i++) if (values[i] === values[i - 1]) n++;
  return n;
}

const p7 = corpus.pages.find(p => p.page === 7);
const p10 = corpus.pages.find(p => p.page === 10);
const p57 = corpus.pages.find(p => p.page === 57);
const ann7 = ink.pages.find(p => p.page === 7);
const red = ann7.red_spans[0];
assert(red.start === 194 && red.length === 14, 'p7 red span is not the frozen 14-rune interval');
assert(Array.isArray(translit) && translit.length === 29, 'unexpected GP29 transliteration map');
const key = p7.indices.slice(red.start, red.start + red.length);
assert(key.length === 14, 'wrong p7 key length');
assert(Array.from(red.runes).length === 14, 'annotation rune string length mismatch');
assert(Array.from(red.runes).every((g, i) => glyphToIndex.get(g) === key[i]), 'red annotation does not match canonical p7 indices');

const blocks = [];
let current = [];
for (const line of transcription.split(/\r?\n/)) {
  if (line === '%') {
    blocks.push(current);
    current = [];
  } else if (line.length) {
    current.push(line);
  }
}
if (current.length) blocks.push(current);
const p10Lines = blocks[10];
assert(p10Lines && p10Lines.join('\n').includes('-7-'), 'unique standalone p10 7 was not found in physical p10 transcription');
const p10Glyphs = Array.from(p10Lines.join('')).filter(g => glyphToIndex.has(g));
assert(p10Glyphs.length === p10.indices.length, 'p10 transcription/corpus rune count mismatch');
assert(p10Glyphs.every((g, i) => glyphToIndex.get(g) === p10.indices[i]), 'p10 transcription does not match canonical corpus order');

const cipher = p10.indices;
const decoded = [];
const contradictions = [];
let consumed = 0;
for (let i = 0; i < cipher.length; i++) {
  const c = cipher[i];
  if (c === 0) {
    decoded.push(0);
    continue;
  }
  const k = key[consumed % key.length];
  const p = (c - k + 29) % 29;
  if (p === 0) contradictions.push({ offset: i, key_position: consumed % key.length, ciphertext: c, key_value: k });
  decoded.push(p);
  consumed++;
}

const replay = [];
let replayCursor = 0;
for (const p of decoded) {
  if (p === 0) {
    replay.push(0);
  } else {
    replay.push((p + key[replayCursor % key.length]) % 29);
    replayCursor++;
  }
}
const replayMismatches = [];
for (let i = 0; i < cipher.length; i++) {
  if (replay[i] !== cipher[i]) replayMismatches.push({ offset: i, expected: cipher[i], actual: replay[i] });
}

let runeCursor = 0;
const decodedLines = p10Lines.map(line => Array.from(line).map(ch => {
  if (!glyphToIndex.has(ch)) return ch;
  return translit[decoded[runeCursor++]];
}).join(''));
assert(runeCursor === decoded.length, 'decoded transcription cursor mismatch');

// Deterministic positive implementation control: a p57-native stream is filtered
// only when a non-F source rune would encrypt to the transparent F marker.
const plant = [];
let sourceCursor = 0;
let plantKeyCursor = 0;
let sourceSkipsForCollision = 0;
while (plant.length < cipher.length) {
  const p = p57.indices[sourceCursor % p57.indices.length];
  sourceCursor++;
  if (p === 0) {
    plant.push(0);
    continue;
  }
  const c = (p + key[plantKeyCursor % key.length]) % 29;
  if (c === 0) {
    sourceSkipsForCollision++;
    continue;
  }
  plant.push(p);
  plantKeyCursor++;
}
const plantCipher = [];
let plantEncCursor = 0;
for (const p of plant) {
  if (p === 0) plantCipher.push(0);
  else {
    plantCipher.push((p + key[plantEncCursor % key.length]) % 29);
    plantEncCursor++;
  }
}
const plantDecoded = [];
let plantDecCursor = 0;
for (const c of plantCipher) {
  if (c === 0) plantDecoded.push(0);
  else {
    plantDecoded.push((c - key[plantDecCursor % key.length] + 29) % 29);
    plantDecCursor++;
  }
}
const plantRecovered = plantDecoded.length === plant.length && plantDecoded.every((v, i) => v === plant[i]);

const result = {
  hypothesis: 'p10 inline 7 selects p7; p7 red span is a repeating GP29 additive key with transparent plaintext-F hold',
  source: {
    p7_red_start: red.start,
    p7_red_length: red.length,
    p7_red_runes: red.runes,
    p7_red_key_indices: key,
    p10_rune_count: cipher.length,
    p10_inline_7_present: true,
    p10_inline_7_is_not_a_rune: true
  },
  primary_inverse: {
    formula: 'P=(C-K[j mod 14]) mod 29; C=F passes through without advancing j',
    key_advances: consumed,
    ciphertext_F_count: cipher.filter(x => x === 0).length,
    nonzero_ciphertext_to_plaintext_F_contradictions: contradictions,
    exact_forward_replay: replayMismatches.length === 0,
    replay_mismatch_count: replayMismatches.length,
    first_replay_mismatches: replayMismatches.slice(0, 10),
    plaintext_ioc: ioc(decoded),
    plaintext_adjacent_equal: adjacentEqual(decoded),
    plaintext_indices: decoded,
    plaintext_transliteration: decoded.map(x => translit[x]).join(''),
    decoded_transcription: decodedLines.join('\n')
  },
  planted_control: {
    source_native: 'p57 GP29 rune stream, deterministic skip only for non-F symbols that would collide with transparent F',
    output_length: plant.length,
    source_symbols_examined: sourceCursor,
    source_symbols_skipped_for_collision: sourceSkipsForCollision,
    recovered_exactly: plantRecovered,
    mismatches: plantDecoded.reduce((n, v, i) => n + (v !== plant[i] ? 1 : 0), 0)
  }
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
