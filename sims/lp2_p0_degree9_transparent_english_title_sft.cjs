'use strict';
/**
 * LP2 p0 original 8+5 title and succeeding 4+3+3 printed-word inverse.
 *
 * Conditional original-input model:
 *   - P in native Gematria Primus (known LP1/p57 orthography);
 *   - C = a*P + b + K (mod 29), a != 0;
 *   - K is governed by the original p50 GF29 degree-nine polynomial;
 *   - plaintext F (GP index 0) is literally copied and does not consume K;
 *   - C[7] == F is separately tested as literal F or encrypted non-F.
 *
 * No cipher parameters or candidate words are chosen from deciphered prose.
 * Uses entire 29,157-word source lexicon; tests 28*29 affine maps and both
 * polynomial orientations. Each candidate key is fixed by the first nine
 * consumed ciphertext symbols and checked on the rest of the title before
 * touching black body ciphertext. Original printed boundaries are preserved.
 *
 * Reproduce: node sims/lp2_p0_degree9_transparent_english_title_sft.cjs
 * Node.js 22, CommonJS, no packages, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const rawP0 = read('resources/liber-primus/lp2-transcription.txt')
  .split('%')[0].replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
const printedWords = rawP0.split(/[-.]/).filter(Boolean);
const lengths = printedWords.map(w => [...w].length);
const C = gp.pages[0].indices;
const mod = value => (value % 29 + 29) % 29;
const inverse = Array.from({length: 29}, (_, n) => {
  if (n === 0) return 0;
  for (let k = 1; k < 29; k++) if (k * n % 29 === 1) return k;
  throw Error('No inverse');
});
const factor9 = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
assert.equal(gp.runes.length, 29);
assert.equal(C.length, 262);
assert.equal(lengths.length, 59);
assert.deepEqual(lengths.slice(0, 5), [8, 5, 4, 3, 3]);
assert.deepEqual(C.slice(0, 17),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5, 2, 11, 6, 25]);
assert.deepEqual([...printedWords.join('')].map(c => gp.runes.indexOf(c)), C);

/** Convert 2014-era spellings to calibrated native GP rune indices. */
function encode(word) {
  word = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const token = tokens.find(t => word.startsWith(t.s, i));
      if (!token) return null;
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const lexicon = new Map();
const words8 = [], words5 = [];
for (const match of read('resources/control/english_wordfreq_textblob.txt')
  .matchAll(/^([a-z]+) (\d+)$/gm)) {
  const indices = encode(match[1]);
  if (!indices) continue;
  const word = {word: match[1], freq: Number(match[2]), indices};
  const key = indices.join(',');
  if (!lexicon.has(key)) lexicon.set(key, []);
  lexicon.get(key).push(word);
  if (indices.length === 8) words8.push(word);
  if (indices.length === 5) words5.push(word);
}
assert.equal(words8.length, 4331);
assert.equal(words5.length, 3626);
const second = words5.filter(x => x.indices.every(v => v !== 0));
const literalFirst = words8.filter(x => x.indices[7] === 0 &&
  x.indices.slice(0, 7).every(v => v !== 0));
const encryptedFirst = words8.filter(x => x.indices.every(v => v !== 0));
assert.equal(second.length, 3320);
assert.deepEqual(literalFirst.map(x => x.word).sort(),
  ['kerchief', 'mischief', 'peterhof', 'unbelief', 'yourself']);
assert.equal(encryptedFirst.length, 3872);

/** @param {number[]} f @param {number[]} seed @param {number} count */
function extend(f, seed, count) {
  const key = seed.slice();
  while (key.length < count) {
    const t = key.length;
    let sum = 0;
    for (let j = 0; j < 9; j++) sum += f[j] * key[t - 9 + j];
    key.push(mod(-sum * inverse[f[9]]));
  }
  return key;
}
/** @param {number[]} f @param {number[]} seq @param {number} rows */
function residual(f, seq, rows) {
  return Array.from({length: rows}, (_, r) =>
    mod(f.reduce((sum, value, j) => sum + value * seq[r + j], 0)));
}
/** @param {number[]} input */
const numberKey = input => input.reduce((k, x) => k * 29 + x, 0);

/**
 * Native GP dictionary validation of all remaining printed words, allowing
 * a ciphertext F to be literal or a zero-valued encrypted non-F.
 * Each state records only its source-generated running-key clock.
 */
function continueFromThird(cipher, wordSizes, f, key9, a, b, clock0) {
  const K = extend(f, key9, cipher.length + 1);
  let states = [{clock: clock0, words: []}], offset = 17, reached = 3;
  const trail = [];
  for (let wordId = 3; wordId < wordSizes.length; wordId++) {
    const size = wordSizes[wordId], segment = cipher.slice(offset, offset + size);
    offset += size;
    const next = [];
    for (const state of states) {
      let branches = [{clock: state.clock, plain: []}];
      for (const c of segment) {
        const updated = [];
        for (const branch of branches) {
          const p = mod((c - b - K[branch.clock]) * inverse[a]);
          if (c === 0) {
            updated.push({clock: branch.clock, plain: branch.plain.concat(0)});
            if (p !== 0) updated.push({clock: branch.clock + 1,
              plain: branch.plain.concat(p)});
          } else if (p !== 0) {
            updated.push({clock: branch.clock + 1,
              plain: branch.plain.concat(p)});
          }
        }
        branches = updated;
      }
      for (const branch of branches) {
        const accepted = lexicon.get(branch.plain.join(','));
        if (accepted) next.push({clock: branch.clock,
          words: state.words.concat(accepted[0].word)});
      }
    }
    states = next;
    trail.push({word: wordId + 1, survivingClocks: next.length,
      example: next.length ? next[0].words.join(' ') : null});
    if (!next.length) break;
    reached = wordId + 1;
  }
  return {reached, trail: trail.slice(0, 5)};
}
/**
 * Key isolation with GF29 polynomial checks on the red title.
 * Use the source lexicon for every candidate, with no preferred phrase.
 * @param {number[]} cipher
 * @param {number[]} wordSizes
 * @param {number[]} f
 * @param {boolean} literalF
 */
function search(cipher, wordSizes, f, literalF) {
  assert.equal(wordSizes[0], 8);
  assert.equal(wordSizes[1], 5);
  assert.equal(wordSizes[2], 4);
  assert.equal(cipher[7], 0);
  assert(cipher.slice(0, 7).every(v => v !== 0));
  assert(cipher.slice(8, 17).every(v => v !== 0));
  const first = literalF ? literalFirst : encryptedFirst;
  const activeTitleC = literalF
    ? cipher.slice(0, 7).concat(cipher.slice(8, 13))
    : cipher.slice(0, 13);
  const leftLen = literalF ? 7 : 8, n = activeTitleC.length;
  const rows = n - 9, S = mod(f.reduce((sum, x) => sum + x, 0));
  assert.equal(S, 26);
  const dc = residual(f, activeTitleC, rows);
  /** @param {number[]} x @param {number} start @param {number} length */
  const contribution = (x, start, length) => Array.from({length: rows}, (_, r) => {
    let value = 0;
    for (let j = 0; j < length; j++) {
      const abs = start + j;
      if (abs >= r && abs < r + 10) value += f[abs - r] * x[j];
    }
    return mod(value);
  });
  const lhs = first.map(word => ({word,
    r: contribution(word.indices.slice(0, leftLen), 0, leftLen)}));
  const rhs = new Map();
  for (const word of second) {
    const k = numberKey(contribution(word.indices, leftLen, 5));
    const bucket = rhs.get(k) || [];
    bucket.push(word);
    rhs.set(k, bucket);
  }
  let titleFits = 0, blackFits = 0;
  const candidates = [];
  for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
    const goal = dc.map(x => mod((x - b * S) * inverse[a]));
    for (const entry of lhs) {
      const target = goal.map((v, i) => mod(v - entry.r[i]));
      const matched = rhs.get(numberKey(target));
      if (!matched) continue;
      for (const word of matched) {
        const plainTitle = entry.word.indices.slice(0, leftLen)
          .concat(word.indices);
        const key9 = plainTitle.slice(0, 9)
          .map((p, i) => mod(activeTitleC[i] - a * p - b));
        const K = extend(f, key9, n + 4);
        assert(plainTitle.every((p, i) => mod(a * p + b + K[i]) ===
          activeTitleC[i]), 'Original title forward replay');
        titleFits++;
        const black = cipher.slice(13, 17).map((c, i) =>
          mod((c - b - K[n + i]) * inverse[a]));
        if (black.some(x => x === 0)) continue;
        const accepted = lexicon.get(black.join(','));
        if (!accepted) continue;
        blackFits++;
        const future = continueFromThird(cipher, wordSizes, f, key9,
          a, b, n + 4);
        candidates.push({title: entry.word.word + ' ' + word.word,
          affine: [a, b], firstBlack: accepted[0].word,
          wordsVerified: future.reached, following: future.trail,
          titleFrequency: entry.word.freq * word.freq});
      }
    }
  }
  candidates.sort((a, b) => b.wordsVerified - a.wordsVerified ||
    b.titleFrequency - a.titleFrequency);
  return {sourceOrientation: f === factor9 ? 'forward' : 'reciprocal',
    titleF: literalF ? 'literal' : 'encrypted',
    inputRunes: cipher.length,
    firstWordCandidates: first.length,
    secondWordCandidates: second.length,
    titleFits, blackFits,
    fiveWordsSurvive: candidates.filter(c => c.wordsVerified >= 5).length,
    longestLexicalRun: Math.max(0, ...candidates.map(x => x.wordsVerified)),
    best: candidates.slice(0, 6), candidates};
}
/**
 * Independently plant native English across five original-size words,
 * including a forced F at title slot 7. Test both clock interpretations
 * without fitting the planted key on the unknown ciphertext.
 */
function plantedControl(f, literalF) {
  const words = literalF
    ? ['YOURSELF', 'SEEKS', 'ROAD', 'AND', 'YOU']
    : ['EPIPHANY', 'SEEKS', 'ROAD', 'AND', 'YOU'];
  const runs = words.map(encode);
  assert.deepEqual(runs.map(x => x.length), [8, 5, 4, 3, 3]);
  const plaintext = runs.flat();
  const a = 7, b = 3, n = plaintext.length;
  for (let nonce = 0; nonce < 10000; nonce++) {
    const seed = Array.from({length: 9}, (_, i) => mod(5 + i * 13 +
      nonce * (i + 1)));
    if (!literalF) seed[7] = mod(-a * plaintext[7] - b);
    const K = extend(f, seed, n);
    const cipher = [], skip = [];
    let clock = 0;
    for (const p of plaintext) {
      if (literalF && p === 0) {cipher.push(0); skip.push(true);}
      else {cipher.push(mod(a * p + b + K[clock++])); skip.push(false);}
    }
    const zeroes = cipher.flatMap((x, i) => x === 0 ? [i] : []);
    if (zeroes.length !== 1 || zeroes[0] !== 7) continue;
    assert.equal(skip[7], literalF);
    const output = search(cipher, runs.map(x => x.length), f, literalF);
    const found = output.candidates.find(x =>
      x.title === words[0].toLowerCase() + ' seeks' &&
      x.firstBlack === 'road' &&
      x.affine[0] === a && x.affine[1] === b &&
      x.wordsVerified >= 5);
    assert(found, 'Planted native five-word English must recover exactly');
    return {title: words.slice(0, 2).join(' '), a, b, nonce,
      ciphertext: cipher, recoveredWords: found.wordsVerified};
  }
  throw Error('Unable to build planted source-native control');
}
const orientations = [['forward', factor9],
  ['reciprocal', factor9.slice().reverse()]];
const results = [];
for (const [orientation, f] of orientations) {
  for (const literalF of [true, false]) {
    const positive = plantedControl(f, literalF);
    const original = search(C, lengths, f, literalF);
    assert.equal(original.fiveWordsSurvive, 0);
    results.push({orientation, titleF: original.titleF, positive,
      ...Object.fromEntries(Object.entries(original)
        .filter(([k]) => k !== 'candidates'))});
  }
}
assert.deepEqual(results.map(x => x.blackFits), [4, 42, 2, 29]);
console.log(JSON.stringify({source: 'canonical LP2 p0 + native TextBlob GP lexicon',
  model: 'p50 GF29 degree-nine affine running key, F-transparent',
  conclusion: 'No dictionary-based five-word p0 continuation in either F branch or factor orientation',
  results}, null, 2));
