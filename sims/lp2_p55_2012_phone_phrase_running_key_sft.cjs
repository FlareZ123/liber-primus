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
const PHONE_DIGITS = '2143909608';
const HTML_SELECTORS = [133, 331];

function fail(message) { throw new Error(message); }
function mod(n, m) { return ((n % m) + m) % m; }
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function transliterate(values) { return values.map(value => TRANS[value]).join(''); }
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
function makeTotientKey(raw, spaceMode) {
  return raw.map(value => {
    if (value === null) return spaceMode === 'F' ? ((PRIMES[0] - 1) % 29) : 0;
    return (PRIMES[value] - 1) % 29;
  });
}
function decodeTotient(cipher, key, sign, transparentF) {
  let pointer = 0;
  const plain = [];
  for (const value of cipher) {
    if (transparentF && value === 0) {
      plain.push(0);
      continue;
    }
    if (pointer >= key.length) fail('totient key exhausted');
    plain.push(mod(value + sign * key[pointer], 29));
    pointer++;
  }
  return { plain, consumed: pointer, unused: key.length - pointer };
}
function eulerPhi(value) {
  let n = value;
  let result = value;
  for (let p = 2; p * p <= n; p++) {
    if (n % p !== 0) continue;
    while (n % p === 0) n /= p;
    result -= result / p;
  }
  if (n > 1) result -= result / n;
  return result;
}
function primesUpTo(limit) {
  const composite = new Uint8Array(limit + 1);
  const out = [];
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    out.push(p);
    for (let k = p * p; k <= limit; k += p) composite[k] = 1;
  }
  return out;
}
function xorSummary(name, bytes) {
  const printable = bytes.filter(value => value >= 32 && value <= 126).length;
  const ascii = bytes.map(value => value >= 32 && value <= 126 ? String.fromCharCode(value) : '.').join('');
  return { name, min: Math.min(...bytes), max: Math.max(...bytes), printable, ratio: printable / bytes.length, ascii };
}

const p55 = corpus.pages.find(page => page.page === 55);
const p57 = corpus.pages.find(page => page.page === 57);
if (!p55 || !p57) fail('required source pages p55/p57 missing');
if (p55.indices.length !== 76 || p55.indices[0] !== 21) fail('p55 carry invariant changed');
const cipher = p55.indices.slice(1);
if (cipher.length !== 75) fail('p55 body must contain 75 runes');

const tokenized = tokenizePhrase();
if (PHRASE.length !== 76 || PHRASE.split(' ').length !== 17) fail('2012 phrase shape changed');
if (tokenized.letters !== 59 || tokenized.spaces !== 16 || tokenized.out.length !== 75) fail('2012 phrase tokenization changed');

const letterIndices = tokenized.out.filter(value => value !== null);
const primeSum = letterIndices.reduce((sum, value) => sum + PRIMES[value], 0);
const totientSum = letterIndices.reduce((sum, value) => sum + PRIMES[value] - 1, 0);
const primeSumQuotient = primeSum / 29;
const phiOfPrimeSum = eulerPhi(primeSum);
const phoneDigitSum = [...PHONE_DIGITS].reduce((sum, digit) => sum + Number(digit), 0);
const selectorSum = HTML_SELECTORS.reduce((sum, value) => sum + value, 0);
const fPositions = cipher.map((value, index) => value === 0 ? index : -1).filter(index => index >= 0);
const arithmetic = {
  phrase_letter_tokens: tokenized.letters,
  phrase_spaces: tokenized.spaces,
  phrase_total_tokens: tokenized.out.length,
  phrase_prime_sum_excluding_spaces: primeSum,
  prime_sum_divided_by_29: primeSumQuotient,
  phrase_totient_sum_excluding_spaces: totientSum,
  totient_sum_minus_76_times_29: totientSum - 76 * 29,
  euler_phi_of_prime_sum: phiOfPrimeSum,
  phi_factorized_by_phrase_spaces_and_phone_digit_sum: tokenized.spaces * phoneDigitSum,
  phone_number_digit_sum: phoneDigitSum,
  html_selectors: HTML_SELECTORS,
  html_selector_sum: selectorSum,
  html_selector_sum_divided_by_29: selectorSum / 29,
  p55_full_runes: p55.indices.length,
  p55_leading_carry: TRANS[p55.indices[0]],
  p55_body_runes: cipher.length,
  p55_body_F_positions_zero_based: fPositions,
  p55_body_F_count: fPositions.length,
  p55_body_length_plus_F_count: cipher.length + fPositions.length,
  letter_count_as_2_times_29_plus_1: tokenized.letters === 2 * 29 + 1
};
if (primeSum !== 2262 || primeSumQuotient !== 78 || phiOfPrimeSum !== 672 ||
    phoneDigitSum !== 42 || selectorSum !== 464 || selectorSum / 29 !== 16 ||
    fPositions.length !== 3 || cipher.length + fPositions.length !== 78) {
  fail('source arithmetic alignment changed');
}

const keyDefs = [
  { name: 'GP29 index; spaces as F/index 0', values: makeKey(tokenized.out, 'index', 'F') },
  { name: '2013 prime values mod 29; spaces as F', values: makeKey(tokenized.out, 'prime', 'F') },
  { name: '2013 prime values mod 29; spaces as numeric 0', values: makeKey(tokenized.out, 'prime', 'zero') }
];
const additiveVariants = [];
for (const key of keyDefs) {
  for (const sign of [-1, 1]) {
    const plain = cipher.map((value, i) => mod(value + sign * key.values[i], 29));
    additiveVariants.push({
      key: key.name,
      sign: sign < 0 ? 'subtract' : 'add',
      ioc: ioc(plain),
      mean_quadgram: quadgramScore(plain).mean,
      transliteration: quadgramScore(plain).text
    });
  }
}
const bestAdditive = additiveVariants.reduce((a, b) => a.mean_quadgram > b.mean_quadgram ? a : b);

const totientVariants = [];
for (const spaceMode of ['F', 'zero']) {
  const key = makeTotientKey(tokenized.out, spaceMode);
  for (const transparentF of [true, false]) {
    for (const sign of [-1, 1]) {
      const decoded = decodeTotient(cipher, key, sign, transparentF);
      const scored = quadgramScore(decoded.plain);
      totientVariants.push({
        key_space_value: spaceMode,
        ciphertext_F_transparent: transparentF,
        sign: sign < 0 ? 'subtract' : 'add',
        key_symbols_consumed: decoded.consumed,
        key_symbols_unused: decoded.unused,
        ioc: ioc(decoded.plain),
        mean_quadgram: scored.mean,
        transliteration: scored.text
      });
    }
  }
}
const bestTotient = totientVariants.reduce((a, b) => a.mean_quadgram > b.mean_quadgram ? a : b);

const keyIndexF = makeKey(tokenized.out, 'index', 'F');
const keyPrimeF = tokenized.out.map(value => value === null ? PRIMES[0] : PRIMES[value]);
const cipherPrime = cipher.map(value => PRIMES[value]);
const byteXorVariants = [
  xorSummary('cipher GP29 index XOR key GP29 index', cipher.map((v, i) => v ^ keyIndexF[i])),
  xorSummary('cipher GP29 index XOR key prime value', cipher.map((v, i) => v ^ keyPrimeF[i])),
  xorSummary('cipher prime value XOR key GP29 index', cipherPrime.map((v, i) => v ^ keyIndexF[i])),
  xorSummary('cipher prime value XOR key prime value', cipherPrime.map((v, i) => v ^ keyPrimeF[i]))
];

const primeList = primesUpTo(10000);
const primeStreamStarts = [];
for (const startOneBased of [78, 672]) {
  const key = primeList.slice(startOneBased - 1, startOneBased - 1 + cipher.length).map(value => (value - 1) % 29);
  const decoded = decodeTotient(cipher, key, -1, true);
  const scored = quadgramScore(decoded.plain);
  primeStreamStarts.push({
    prime_index_one_based: startOneBased,
    first_prime: primeList[startOneBased - 1],
    key_symbols_consumed: decoded.consumed,
    key_symbols_unused: decoded.unused,
    ioc: ioc(decoded.plain),
    mean_quadgram: scored.mean,
    transliteration: scored.text
  });
}

const controlPlain = p57.indices.slice(0, 75);
const additiveControls = keyDefs.map(key => {
  const syntheticCipher = controlPlain.map((value, i) => mod(value + key.values[i], 29));
  const recovered = syntheticCipher.map((value, i) => mod(value - key.values[i], 29));
  return { key: key.name, exact_round_trip: recovered.every((value, i) => value === controlPlain[i]) };
});
const totientControlKey = makeTotientKey(tokenized.out, 'F');
let controlPointer = 0;
const syntheticTotientCipher = controlPlain.map(value => {
  if (value === 0) return 0;
  return mod(value + totientControlKey[controlPointer++], 29);
});
const totientRecovered = decodeTotient(syntheticTotientCipher, totientControlKey, -1, true);
const positiveControls = {
  additive: additiveControls,
  p56_style_F_transparent_totient: {
    exact_round_trip: totientRecovered.plain.every((value, i) => value === controlPlain[i]),
    key_symbols_consumed: totientRecovered.consumed
  }
};
if (!additiveControls.every(result => result.exact_round_trip) ||
    !positiveControls.p56_style_F_transparent_totient.exact_round_trip) {
  fail('synthetic positive control failed');
}

console.log(JSON.stringify({
  test: 'p55 2012 phone phrase, Gematria arithmetic and source-constrained key gates',
  source_shape: {
    phrase: PHRASE,
    phrase_characters_including_spaces: PHRASE.length,
    phrase_words: PHRASE.split(' ').length,
    p55_body_runes: cipher.length
  },
  arithmetic_alignments: arithmetic,
  controls: {
    positive_controls: positiveControls,
    p57_clear_text_mean_quadgram: quadgramScore(p57.indices).mean
  },
  direct_additive_variants: additiveVariants,
  best_direct_additive_variant: bestAdditive,
  p56_style_totient_running_key_variants: totientVariants,
  best_p56_style_totient_variant: bestTotient,
  byte_xor_variants: byteXorVariants,
  totient_prime_stream_start_tests: primeStreamStarts
}, null, 2));
