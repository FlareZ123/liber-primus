'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const quadText = fs.readFileSync(path.join(ROOT, 'resources/control/dukotah_english_quadgrams.txt'), 'utf8');

const TRANS = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const PRIMES = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const DIGRAPHS = new Set(['TH','NG','OE','AE','IA','EA']);
const PHRASE = 'CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT';

function fail(message) {
  throw new Error(message);
}
function mod(n, m) {
  return ((n % m) + m) % m;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const numerator = counts.reduce((sum, n) => sum + n * (n - 1), 0);
  return numerator / (values.length * (values.length - 1));
}
function transliterate(values) {
  return values.map(value => TRANS[value]).join('');
}
function parseQuadgrams(text) {
  const counts = new Map();
  let total = 0;
  for (const line of text.trim().split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2 || !/^[A-Z]{4}$/.test(parts[0])) continue;
    const count = Number(parts[1]);
    if (!Number.isFinite(count) || count <= 0) continue;
    counts.set(parts[0], count);
    total += count;
  }
  if (!counts.size || total <= 0) fail('quadgram model is empty');
  return { counts, total };
}
const Q = parseQuadgrams(quadText);
function quadgramScore(values) {
  const text = transliterate(values);
  let sum = 0;
  let n = 0;
  for (let i = 0; i + 4 <= text.length; i++) {
    const count = Q.counts.get(text.slice(i, i + 4)) || 0.01;
    sum += Math.log10(count / Q.total);
    n++;
  }
  return { mean: sum / n, chars: text.length, text };
}
function tokenizePhrase() {
  const out = [];
  let letters = 0;
  let spaces = 0;
  for (let i = 0; i < PHRASE.length;) {
    if (PHRASE[i] === ' ') {
      out.push(null);
      spaces++;
      i++;
      continue;
    }
    const pair = PHRASE.slice(i, i + 2);
    if (DIGRAPHS.has(pair)) {
      out.push(TRANS.indexOf(pair));
      letters++;
      i += 2;
      continue;
    }
    const value = TRANS.indexOf(PHRASE[i]);
    if (value < 0) fail('phrase character is outside GP29: ' + PHRASE[i]);
    out.push(value);
    letters++;
    i++;
  }
  return { out, letters, spaces };
}
function makeKey(raw, kind, spaceMode) {
  return raw.map(value => {
    if (value === null) {
      if (spaceMode === 'F') return kind === 'prime' ? (PRIMES[0] % 29) : 0;
      return 0;
    }
    return kind === 'prime' ? (PRIMES[value] % 29) : value;
  });
}
function xorSummary(name, bytes) {
  const printable = bytes.filter(value => value >= 32 && value <= 126).length;
  const ascii = bytes.map(value => value >= 32 && value <= 126 ? String.fromCharCode(value) : '.').join('');
  return {
    name,
    min: Math.min(...bytes),
    max: Math.max(...bytes),
    printable,
    ratio: printable / bytes.length,
    ascii
  };
}

const p55 = corpus.pages.find(page => page.page === 55);
const p57 = corpus.pages.find(page => page.page === 57);
if (!p55 || !p57) fail('required source pages p55/p57 missing');
if (p55.indices.length !== 76 || p55.indices[0] !== 21) fail('p55 carry invariant changed');
const cipher = p55.indices.slice(1);
if (cipher.length !== 75) fail('p55 body must contain 75 runes');

const tokenized = tokenizePhrase();
if (PHRASE.length !== 76 || PHRASE.split(' ').length !== 17) fail('2012 phrase shape changed');
if (tokenized.letters !== 59 || tokenized.spaces !== 16 || tokenized.out.length !== 75) {
  fail('2012 phrase GP29-plus-space tokenization changed');
}

const keyDefs = [
  { name: 'GP29 index; spaces as F/index 0', values: makeKey(tokenized.out, 'index', 'F') },
  { name: '2013 prime values mod 29; spaces as F', values: makeKey(tokenized.out, 'prime', 'F') },
  { name: '2013 prime values mod 29; spaces as numeric 0', values: makeKey(tokenized.out, 'prime', 'zero') }
];
const variants = [];
for (const key of keyDefs) {
  for (const sign of [-1, 1]) {
    const plain = cipher.map((value, i) => mod(value + sign * key.values[i], 29));
    const scored = quadgramScore(plain);
    variants.push({
      key: key.name,
      sign: sign < 0 ? 'subtract' : 'add',
      ioc: ioc(plain),
      mean_quadgram: scored.mean,
      transliteration: scored.text
    });
  }
}
const best = variants.reduce((a, b) => a.mean_quadgram > b.mean_quadgram ? a : b);

const keyIndexF = makeKey(tokenized.out, 'index', 'F');
const keyPrimeF = tokenized.out.map(value => value === null ? PRIMES[0] : PRIMES[value]);
const cipherPrime = cipher.map(value => PRIMES[value]);
const xor = [
  xorSummary('cipher GP29 index XOR key GP29 index', cipher.map((v, i) => v ^ keyIndexF[i])),
  xorSummary('cipher GP29 index XOR key prime value', cipher.map((v, i) => v ^ keyPrimeF[i])),
  xorSummary('cipher prime value XOR key GP29 index', cipherPrime.map((v, i) => v ^ keyIndexF[i])),
  xorSummary('cipher prime value XOR key prime value', cipherPrime.map((v, i) => v ^ keyPrimeF[i]))
];

const controlPlain = p57.indices.slice(0, 75);
const positiveControls = keyDefs.map(key => {
  const syntheticCipher = controlPlain.map((value, i) => mod(value + key.values[i], 29));
  const recovered = syntheticCipher.map((value, i) => mod(value - key.values[i], 29));
  return { key: key.name, exact_round_trip: recovered.every((value, i) => value === controlPlain[i]) };
});
if (!positiveControls.every(result => result.exact_round_trip)) fail('synthetic additive positive control failed');

const p57Score = quadgramScore(p57.indices).mean;
console.log(JSON.stringify({
  test: 'p55 2012 phone-phrase fixed running-key gate',
  source_shape: {
    phrase: PHRASE,
    phrase_characters_including_spaces: PHRASE.length,
    phrase_words: PHRASE.split(' ').length,
    gp29_letter_tokens_after_TH_contraction: tokenized.letters,
    spaces: tokenized.spaces,
    total_key_tokens: tokenized.out.length,
    p55_full_runes: p55.indices.length,
    p55_leading_carry: TRANS[p55.indices[0]],
    p55_body_runes: cipher.length
  },
  controls: {
    positive_additive_round_trips: positiveControls,
    p57_clear_text_mean_quadgram: p57Score
  },
  additive_variants: variants,
  best_additive_variant: best,
  byte_xor_variants: xor
}, null, 2));
