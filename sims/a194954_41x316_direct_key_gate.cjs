'use strict';

/*
 * Bounded direct-key tests for the A194954 / p57 / 2014-square / 2016-prefix
 * cross-round hypothesis.
 *
 * Run from repository root:
 *   node sims/a194954_41x316_direct_key_gate.cjs
 *
 * Tests only source-shaped models:
 *   1. 41 x 316 row-wise constant GP shifts using the 41-letter p57 phrase;
 *   2. the same row shifts using the 2014 square's 41 active symbols;
 *   3. period-41 GP Vigenere using the p57 phrase, phase zero.
 *
 * No key/phase fitting. Deterministic shuffled-key-order controls are included.
 * A score improvement is not a decryption; inspect the full score and controls.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const mod = x => ((x % 29) + 29) % 29;

const corp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const message2016 = read('resources/historical/cicada2016-4gq25-outguess.asc');

const runeMap = new Map(corp.runes.map((r, i) => [r, i]));
const translit = corp.translit;
const translitMap = new Map(translit.map((r, i) => [r, i]));

// Original unknown LP2 stream: physical pages 0..55, including runeless p50.
const unknownPages = corp.pages.filter(p => p.page <= 55).sort((a, b) => a.page - b.page);
const cipher = unknownPages.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);

// The external transcription omits runeless p50: physical pages 51+ map to
// transcription segment page-1. Printed punctuation terminates words.
const segments = transcription.split('%');
const starts = [], ends = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  const segmentIndex = page >= 51 ? page - 1 : page;
  let active = false;
  for (const ch of segments[segmentIndex] || '') {
    if (runeMap.has(ch)) {
      starts.push(!active);
      ends.push(false);
      active = true;
    } else if ('-.$&§'.includes(ch)) {
      if (ends.length) ends[ends.length - 1] = true;
      active = false;
    }
  }
  if (active && ends.length) ends[ends.length - 1] = true;
}
assert.equal(starts.length, cipher.length);
assert.equal(ends.length, cipher.length);

function encodeWord(word) {
  const s = word.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (translitMap.has(pair)) {
      out.push(translitMap.get(pair));
      i += 2;
    } else {
      assert.notEqual(translitMap.get(s[i]), undefined, 'unmapped letter ' + s[i]);
      out.push(translitMap.get(s[i]));
      i++;
    }
  }
  return out;
}

function stream(words, limit = Infinity) {
  const xs = [], wordStarts = [], wordEnds = [];
  for (const word of words) {
    for (let j = 0; j < word.length && xs.length < limit; j++) {
      xs.push(word[j]);
      wordStarts.push(j === 0);
      wordEnds.push(j === word.length - 1);
    }
    if (xs.length >= limit) break;
  }
  return { xs, starts: wordStarts, ends: wordEnds };
}

// Word-aware GP trigram model; first 240k Shakespeare characters train it.
const trainingWords = (shakespeare.slice(0, 240000).match(/[A-Za-z]+/g) || [])
  .map(encodeWord);
const N = 31, START = 29, END = 30;
const tri = (a, b, c) => (a * N + b) * N + c;
const h3 = new Float64Array(N * N * N);
const h2 = new Float64Array(N * N);
const h1 = new Float64Array(N);
const ctx3 = new Float64Array(N * N);
const ctx2 = new Float64Array(N);
for (const word of trainingWords) {
  let u = START, v = START;
  for (const c of [...word, END]) {
    h3[tri(u, v, c)]++;
    ctx3[u * N + v]++;
    h2[v * N + c]++;
    ctx2[v]++;
    h1[c]++;
    u = v;
    v = c;
  }
}
const unigramTotal = h1.reduce((a, b) => a + b, 0);
const p1 = Float64Array.from(h1, x => (x + 1) / (unigramTotal + N));
const p2 = new Float64Array(N * N);
for (let b = 0; b < N; b++) {
  for (let c = 0; c < N; c++) {
    p2[b * N + c] = (h2[b * N + c] + 10 * p1[c]) / (ctx2[b] + 10);
  }
}
const lm = new Float64Array(N * N * N);
for (let a = 0; a < N; a++) {
  for (let b = 0; b < N; b++) {
    for (let c = 0; c < N; c++) {
      lm[tri(a, b, c)] =
        Math.log((h3[tri(a, b, c)] + 5 * p2[b * N + c]) / (ctx3[a * N + b] + 5));
    }
  }
}

function languageScore(xs, wordStarts, wordEnds) {
  let score = 0, u = START, v = START;
  for (let i = 0; i < xs.length; i++) {
    if (wordStarts[i]) { u = START; v = START; }
    const c = xs[i];
    score += lm[tri(u, v, c)];
    u = v;
    v = c;
    if (wordEnds[i]) {
      score += lm[tri(u, v, END)];
      u = START;
      v = START;
    }
  }
  return score;
}
function ioc(xs) {
  const counts = new Uint32Array(29);
  for (const x of xs) counts[x]++;
  let numerator = 0;
  for (const x of counts) numerator += x * (x - 1);
  return numerator / (xs.length * (xs.length - 1));
}
function rowShift(key, sign) {
  assert.equal(key.length, 41);
  const out = new Uint8Array(cipher.length);
  for (let row = 0; row < 41; row++) {
    for (let col = 0; col < 316; col++) {
      const i = row * 316 + col;
      out[i] = mod(cipher[i] + sign * key[row]);
    }
  }
  return out;
}
function periodic(key, sign) {
  const out = new Uint8Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) out[i] = mod(cipher[i] + sign * key[i % key.length]);
  return out;
}
const scoreCipher = xs => languageScore(xs, starts, ends);
const rawScore = scoreCipher(cipher);

const selectedWords = ['THE', 'INSTAR', 'TO', 'SURFACE', 'OUR', 'CIRCUMFERENCES', 'WITHIN'];
const phrase = selectedWords.join('');
const phraseKey = Array.from(phrase, ch => translitMap.get(ch));
assert.equal(phrase.length, 41);
assert.equal(phraseKey.length, 41);
assert.equal(selectedWords.reduce((n, w) => n + encodeWord(w).length, 0), 39);

const squareKeys = {
  centerOut: 'IORHUORHUFWNJOJOOFWNJOJOOOFHGOTNUOFHGOTNU',
  outerToCenter: 'UNTOGHFOUNTOGHFOOOJOJNWFOOJOJNWFUHROUHROI'
};
for (const key of Object.values(squareKeys)) assert.equal(key.length, 41);
const keyValues = {
  phrase: phraseKey,
  squareCenterOut: Array.from(squareKeys.centerOut, ch => translitMap.get(ch)),
  squareOuterToCenter: Array.from(squareKeys.outerToCenter, ch => translitMap.get(ch))
};

function shuffledControl(key, scoreForKey, observed, samples, seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const vals = new Float64Array(samples);
  let sum = 0, atLeast = 0;
  for (let sample = 0; sample < samples; sample++) {
    const shuffled = key.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const value = scoreForKey(shuffled);
    vals[sample] = value;
    sum += value;
    if (value >= observed) atLeast++;
  }
  const mean = sum / samples;
  let variance = 0;
  for (const x of vals) variance += (x - mean) ** 2;
  variance /= samples;
  return {
    samples, mean, sd: Math.sqrt(variance),
    z: (observed - mean) / Math.sqrt(variance),
    empiricalUpperTail: (atLeast + 1) / (samples + 1),
    rank: 1 + samples - atLeast,
    min: Math.min(...vals), max: Math.max(...vals)
  };
}

const candidateRows = [];
for (const [name, key] of Object.entries(keyValues)) {
  for (const sign of [-1, 1]) {
    const xs = rowShift(key, sign);
    const score = scoreCipher(xs);
    candidateRows.push({
      name, operation: sign < 0 ? 'C-K[row]' : 'C+K[row]',
      score, delta: score - rawScore, perRune: score / cipher.length,
      ioc: ioc(xs), preview: Array.from(xs.slice(0, 100), x => translit[x]).join('')
    });
  }
}
const phraseRowMinus = candidateRows.find(x =>
  x.name === 'phrase' && x.operation === 'C-K[row]');
const squareRowMinus = candidateRows.find(x =>
  x.name === 'squareCenterOut' && x.operation === 'C-K[row]');

const periodicCandidates = [-1, 1].map(sign => {
  const xs = periodic(phraseKey, sign);
  const score = scoreCipher(xs);
  return {
    operation: sign < 0 ? 'C-K[i mod 41]' : 'C+K[i mod 41]',
    score, delta: score - rawScore, perRune: score / cipher.length,
    ioc: ioc(xs), preview: Array.from(xs.slice(0, 100), x => translit[x]).join('')
  };
});
const periodBest = periodicCandidates.reduce((a, b) => a.score > b.score ? a : b);

const rowPhraseNull = shuffledControl(
  phraseKey, k => scoreCipher(rowShift(k, -1)), phraseRowMinus.score, 2000, 3301);
const rowSquareNull = shuffledControl(
  keyValues.squareCenterOut, k => scoreCipher(rowShift(k, -1)), squareRowMinus.score, 2000, 3302);
const periodNull = shuffledControl(
  phraseKey,
  k => Math.max(scoreCipher(periodic(k, -1)), scoreCipher(periodic(k, 1))),
  periodBest.score, 2000, 3301);

// Same-length held-out English control under the same trained model.
const heldoutWords = (shakespeare.slice(240000).match(/[A-Za-z]+/g) || []).map(encodeWord);
const heldout = stream(heldoutWords, cipher.length);
assert.equal(heldout.xs.length, cipher.length);
const heldoutScore = languageScore(heldout.xs, heldout.starts, heldout.ends);

// Short native plaintext control: solved p57 body, source word order.
const p57Words = [
  'LIKE', 'THE', 'INSTAR', 'TUNNELING', 'TO', 'THE', 'SURFACE', 'WE',
  'MUST', 'SHED', 'OUR', 'OWN', 'CIRCUMFERENCES', 'FIND', 'THE',
  'DIVINITY', 'WITHIN', 'AND', 'EMERGE'
];
const p57 = stream(p57Words);
const p57Score = languageScore(p57.xs, p57.starts, p57.ends);

// The signature marker starts at index 317; the preceding LF is the separator,
// leaving 316 bytes before that separator in this ASCII source.
const signatureOffset = message2016.indexOf('-----BEGIN PGP SIGNATURE-----');
assert.equal(signatureOffset, 317);
assert.equal(message2016[signatureOffset - 1], '\n');
const signedPrefixBytes = signatureOffset - 1;
assert.equal(signedPrefixBytes, 316);

const result = {
  model: 'Shakespeare first 240,000 characters; word-aware GP trigram model',
  corpus: {
    unknownRunes: cipher.length, pages: 'physical p0-p55; p50 runeless',
    rows: 41, columns: 316, trainingWords: trainingWords.length
  },
  crossRoundInputs: {
    p57SelectedWords: selectedWords.join(' '),
    phraseLatinLetters: phrase.length,
    phraseCanonicalGPRunes: 39,
    squareKeys,
    message2016SignatureMarkerIndex: signatureOffset,
    signedPrefixBytesBeforeSeparator: signedPrefixBytes
  },
  controls: {
    unknown: { score: rawScore, perRune: rawScore / cipher.length, ioc: ioc(cipher) },
    heldoutEnglish: { score: heldoutScore, perRune: heldoutScore / cipher.length, ioc: ioc(heldout.xs) },
    solvedP57: { runes: p57.xs.length, score: p57Score, perRune: p57Score / p57.xs.length }
  },
  rowShiftCandidates: candidateRows,
  period41PhraseCandidates: periodicCandidates,
  shuffledOrderControls: {
    phraseRowMinus: rowPhraseNull,
    squareCenterOutRowMinus: rowSquareNull,
    period41PhraseBestSign: periodNull
  },
  interpretation: 'No tested direct additive/row-shift model recovers plaintext. These negatives do not reject A194954 as a navigation clue or other non-additive routes.'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
