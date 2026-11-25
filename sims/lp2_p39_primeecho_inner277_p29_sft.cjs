'use strict';
const fs = require('fs');

const primeEcho = fs.readFileSync('resources/historical/cicada2013-os-original-prime-echo.sh', 'utf8');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const ink = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-ink-annotations.json', 'utf8'));
const transcription = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const translit = corpus.translit;
const runeChars = Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');
const glyphToIndex = new Map(runeChars.map((g, i) => [g, i]));

function assert(ok, message) {
  if (!ok) throw new Error(message);
}
function base29Digits(n) {
  const digits = [];
  do {
    digits.unshift(n % 29);
    n = Math.floor(n / 29);
  } while (n > 0);
  return digits;
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

const primeValues = [...primeEcho.matchAll(/echo\s+(?:-n\s+)?"(\d+)\t"/g)].map(m => Number(m[1]));
assert(primeValues.length === 464, 'prime_echo source must yield all 464 printed prime values');
assert(primeValues[0] === 2 && primeValues[463] === 3301, 'prime_echo endpoint mismatch');
assert(primeValues[173] === 1033 && primeValues[463] === 3301, 'cuneiform prime ranks mismatch');

const interval = primeValues.filter(p => p >= 1033 && p <= 3301);
assert(interval.length === 291 && interval[0] === 1033 && interval[290] === 3301, 'inclusive cuneiform interval mismatch');
const interior = interval.slice(7, -7);
assert(interior.length === 277 && interior[0] === 1087 && interior[276] === 3229, '7+7 trim does not produce the frozen 277-prime interval');
const keyDigits = interior.map(p => {
  const d = base29Digits(p);
  assert(d.length === 3, 'retained prime is not a three-digit BASE29 number');
  return d[1];
});

const p7 = corpus.pages.find(p => p.page === 7);
const p10 = corpus.pages.find(p => p.page === 10);
const p29 = corpus.pages.find(p => p.page === 29);
const p57 = corpus.pages.find(p => p.page === 57);
const ann7 = ink.pages.find(p => p.page === 7);
const red7 = ann7.red_spans[0];
assert(red7.length === 14, 'p7 red span is not 14 runes');
assert(Array.isArray(translit) && translit.length === 29, 'unexpected GP29 transliteration map');

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
const p10Text = blocks[10].join('\n');
assert(p10Text.includes('-7-'), 'p10 inline 7 selector not found');
const p57Plain = p57.indices.map(x => translit[x]).join('');
assert(p57Plain.includes('WEMUSTSHEDOUROWNCIRCUMFERENCESFINDTHEDIUINITYWITHIN'), 'p57 circumference/within wording mismatch');

const p29Lines = blocks[29];
const p29Glyphs = Array.from(p29Lines.join('')).filter(g => glyphToIndex.has(g));
assert(p29.indices.length === 277 && keyDigits.length === 277, 'p29/key length mismatch');
assert(p29Glyphs.length === p29.indices.length, 'p29 transcription/corpus rune count mismatch');
assert(p29Glyphs.every((g, i) => glyphToIndex.get(g) === p29.indices[i]), 'p29 transcription does not match canonical corpus order');

const cipher = p29.indices;
const plaintext = cipher.map((c, i) => (c - keyDigits[i] + 29) % 29);
const replay = plaintext.map((p, i) => (p + keyDigits[i]) % 29);
const replayMismatches = [];
for (let i = 0; i < cipher.length; i++) if (replay[i] !== cipher[i]) replayMismatches.push(i);

let runeCursor = 0;
const decodedLines = p29Lines.map(line => Array.from(line).map(ch => {
  if (!glyphToIndex.has(ch)) return ch;
  return translit[plaintext[runeCursor++]];
}).join(''));
assert(runeCursor === plaintext.length, 'decoded p29 transcription cursor mismatch');

// Source-native implementation control: encrypt/decrypt a p57-derived 277-rune plant.
const plant = Array.from({ length: cipher.length }, (_, i) => p57.indices[i % p57.indices.length]);
const plantCipher = plant.map((p, i) => (p + keyDigits[i]) % 29);
const plantDecoded = plantCipher.map((c, i) => (c - keyDigits[i] + 29) % 29);
const plantMismatches = plantDecoded.reduce((n, p, i) => n + (p !== plant[i] ? 1 : 0), 0);

const result = {
  hypothesis: 'p39 cuneiform 1033..3301 selects prime_echo interval; p57 circumferences/within plus p10 7 and p7 red14 select 7+7 trim and middle BASE29 digit; p29 receives a 277-symbol one-time additive pad',
  source: {
    prime_echo_values: primeValues.length,
    first_prime: primeValues[0],
    last_prime: primeValues[primeValues.length - 1],
    prime_1033_rank_1based: primeValues.indexOf(1033) + 1,
    prime_3301_rank_1based: primeValues.indexOf(3301) + 1,
    inclusive_interval_count: interval.length,
    inclusive_interval_first: interval[0],
    inclusive_interval_last: interval[interval.length - 1],
    trim_each_end: 7,
    retained_prime_count: interior.length,
    retained_first_prime: interior[0],
    retained_last_prime: interior[interior.length - 1],
    all_retained_primes_have_three_base29_digits: true,
    p7_red_span_length: red7.length,
    p10_inline_7_present: true,
    p57_instruction: p57Plain,
    p29_ciphertext_length: cipher.length
  },
  key: {
    rule: 'middle digit d1 of the three-digit BASE29 representation of each retained prime',
    values: keyDigits,
    transliteration: keyDigits.map(x => translit[x]).join(''),
    histogram: Array.from({ length: 29 }, (_, i) => keyDigits.filter(x => x === i).length)
  },
  primary_inverse: {
    formula: 'P_i=(C_i-K_i) mod 29; one-time key, every rune consumes exactly one key symbol',
    exact_forward_replay: replayMismatches.length === 0,
    replay_mismatch_count: replayMismatches.length,
    plaintext_ioc: ioc(plaintext),
    plaintext_adjacent_equal: adjacentEqual(plaintext),
    plaintext_indices: plaintext,
    plaintext_transliteration: plaintext.map(x => translit[x]).join(''),
    decoded_transcription: decodedLines.join('\n')
  },
  planted_control: {
    source_native: 'p57 GP29 rune stream repeated to 277 symbols',
    recovered_exactly: plantMismatches === 0,
    mismatches: plantMismatches
  }
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
