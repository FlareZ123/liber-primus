'use strict';

/**
 * Lossless H2 clock inference with unknown collision skips and an ORACLE tableau.
 *
 * Synthetic calibration only. The original 12,956-rune LP2 ciphertext does not
 * supply the 29 secret GP29 substitution permutations used here. This file
 * tests whether their hypothetical source-selected prime-totient key clock can
 * be recovered after withholding every per-rune skip and key-row address.
 *
 * All source data read only; no external packages; Windows Node.js 22.
 * Run this file from the repository without command-line arguments.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const text = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(text('resources/liber-primus/lp2-corpus.json'));
const original = gp.pages.filter(p => p.page < 56 && p.indices.length);
const N = 29, LENGTH = 12956, TRIALS = 8, MAX_SKIPS = 5, MAX_EXTRA = 1024;
assert.equal(original.length, 55);
assert.equal(original.reduce((s, p) => s + p.indices.length, 0), LENGTH);
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/**
 * Same independently fixed GP29 historical spelling used by the H2 tableau control.
 * @param {string} word
 * @returns {number[]}
 */
function gpWord(word) {
  const w = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const runes = [];
  for (let i = 0; i < w.length;) {
    if (w.startsWith('ING', i)) { runes.push(21); i += 3; }
    else if (w.startsWith('IO', i)) { runes.push(27); i += 2; }
    else {
      const match = tokens.find(t => w.startsWith(t.s, i));
      assert.ok(match, 'missing GP29 transliteration ' + w.slice(i));
      runes.push(match.i); i += match.s.length;
    }
  }
  return runes;
}

/** @param {string} input @returns {number[]} */
function toRunes(input) {
  return (input.match(/[A-Za-z]+/g) || []).flatMap(gpWord);
}
const source = toRunes(text('resources/control/gibran_prophet_58585.txt'));
const training = toRunes(text('resources/control/shakespeare_first300k.txt'));
assert.equal(source.length, 62492);
assert.equal(training.length, 217106);

// Frozen, independently authored English GP29 bigram scoring model.
// No plaintext from the simulated source is used in the scoring distribution.
const counts = Array.from({length: N}, () => Array(N).fill(3));
const marginals = Array(N).fill(87);
for (let i = 1; i < training.length; i++) {
  counts[training[i - 1]][training[i]]++;
  marginals[training[i - 1]]++;
}
const bigramLog = counts.map((row, i) => row.map(value => Math.log(value / marginals[i])));
const logSkip = Math.log(0.81);
const logStopCollision = Math.log(0.19);

// Known p56 successive-prime-totient clock; its use for original LP2 H2
// remains hypothetical. Prefix length covers all seeded original-sized tests.
const composites = new Uint8Array(650001);
const clock = [];
for (let p = 2; p < composites.length && clock.length < 45000; p++) {
  if (composites[p]) continue;
  clock.push((p - 1) % N);
  if (p * p < composites.length)
    for (let m = p * p; m < composites.length; m += p) composites[m] = 1;
}
assert.equal(clock.length, 45000);

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  const uniform = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return {uniform, int: n => Math.floor(uniform() * n)};
}

/** @param {{int:(n:number)=>number}} random */
function permutation(random) {
  const a = Array.from({length: N}, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** @param {number[][]} table */
function inverseTable(table) {
  return table.map(row => {
    const inverse = Array(N).fill(-1);
    row.forEach((cipher, plain) => { inverse[cipher] = plain; });
    assert.ok(inverse.every(v => v >= 0));
    return inverse;
  });
}

/**
 * Exact hidden-path maximum-likelihood decoder in the known-table experiment.
 *
 * State j before rune i = position in the public prime clock. For candidate
 * t skipped clock positions, the SAME unknown plaintext rune y must satisfy
 *    inv[clock[j+u]][C[i-1]] == y, for every u = 0,..,t-1
 *    y = inv[clock[j+t]][C[i]].
 * All t constraints are checked separately, including multiple consecutive
 * skips. A skipped proposed repeated ciphertext incurs log(0.81); stopping
 * on a repeated ciphertext incurs log(0.19). The transition's plain
 * bigram uses the previous FINAL row, clock[j-1], with no oracle path.
 *
 * @param {Uint8Array} cipher
 * @param {number[][]} inverse - secret tableau ORACLE, not original data
 * @returns {{plaintext:Uint8Array,skips:Uint8Array,maxStates:number,transitions:number,score:number}}
 */
function inferClock(cipher, inverse) {
  const length = cipher.length;
  /** @type {Map<number,number>} */
  let previous = new Map([[0, 0]]);
  const backtrace = new Array(length);
  let maxStates = 0, transitions = 0;
  for (let i = 0; i < length; i++) {
    const next = new Map();
    const back = new Uint8Array(MAX_EXTRA).fill(255);
    const prevC = i ? cipher[i - 1] : -1;
    for (const [j, score] of previous) {
      const previousPlain = i ? inverse[clock[j - 1]][prevC] : -1;
      for (let skipped = 0; skipped <= MAX_SKIPS; skipped++) {
        const extra = j - i + skipped;
        if (extra >= MAX_EXTRA) break;
        if (i === 0 && skipped > 0) break;
        const y = inverse[clock[j + skipped]][cipher[i]];
        let legal = true;
        for (let u = 0; u < skipped; u++) {
          if (inverse[clock[j + u]][prevC] !== y) { legal = false; break; }
        }
        if (!legal) continue;
        const candidate = score + (i ? bigramLog[previousPlain][y] : -Math.log(N))
          + skipped * logSkip + ((i && cipher[i] === prevC) ? logStopCollision : 0);
        const jNext = j + skipped + 1;
        if (candidate > (next.get(jNext) ?? -Infinity)) {
          next.set(jNext, candidate);
          back[extra] = skipped;
        }
        transitions++;
      }
    }
    assert.ok(next.size > 0, 'clock path vanished at position ' + i);
    previous = next;
    backtrace[i] = back;
    maxStates = Math.max(maxStates, next.size);
  }
  let state = -1, score = -Infinity;
  for (const [candidate, value] of previous) {
    if (value > score) { score = value; state = candidate; }
  }
  const plaintext = new Uint8Array(length);
  const skips = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    const extra = state - i - 1;
    assert.ok(extra >= 0 && extra < MAX_EXTRA);
    const skipped = backtrace[i][extra];
    assert.notEqual(skipped, 255, 'broken Viterbi backpointer at ' + i);
    plaintext[i] = inverse[clock[state - 1]][cipher[i]];
    skips[i] = skipped;
    state -= skipped + 1;
  }
  assert.equal(state, 0);
  return {plaintext, skips, maxStates, transitions, score};
}

const sites = [
  {start:1107,after:1110,word:'DONT'},
  {start:5136,after:5138,word:'ITS'},
  {start:8513,after:8515,word:'HES'},
  {start:10086,after:10089,word:'CANT'}
];
assert.deepEqual(sites.map(s => s.after), [1110, 5138, 8515, 10089]);
const withheld = [...Array(150)].map((_,i) => 8500 + i);

const tests = [];
for (let trial = 0; trial < TRIALS; trial++) {
  const random = rng((0x3301abcd + trial * 1013904223) >>> 0);
  const start = random.int(source.length - LENGTH);
  const truePlain = source.slice(start, start + LENGTH);
  for (const site of sites) {
    const word = gpWord(site.word);
    truePlain.splice(site.start, word.length, ...word);
  }
  assert.equal(truePlain.length, LENGTH);
  const hiddenTable = Array.from({length: N}, () => permutation(random));
  const inverse = inverseTable(hiddenTable);
  const cipher = new Uint8Array(LENGTH);
  const hiddenFinalRows = new Uint16Array(LENGTH);
  const hiddenSkips = new Uint8Array(LENGTH);
  let pointer = 0, prior = -1, maxTrueSkips = 0;
  for (let i = 0; i < LENGTH; i++) {
    let out = hiddenTable[clock[pointer]][truePlain[i]], skips = 0;
    while (out === prior && random.uniform() < 0.81) {
      pointer++; skips++;
      out = hiddenTable[clock[pointer]][truePlain[i]];
    }
    cipher[i] = out;
    hiddenFinalRows[i] = pointer;
    hiddenSkips[i] = skips;
    maxTrueSkips = Math.max(maxTrueSkips, skips);
    prior = out; pointer++;
  }
  assert.ok(maxTrueSkips <= MAX_SKIPS, 'increase finite exact skip budget');
  const actualDoublets = cipher.slice(1).reduce((n, c, i) => n + Number(c === cipher[i]), 0);
  assert.equal(cipher.reduce((n, c, i) =>
    n + Number(inverse[clock[hiddenFinalRows[i]]][c] === truePlain[i]), 0), LENGTH);

  // ORACLE controls, included only in evaluation: the true hidden clock path
  // decodes every glyph, while the public no-skip clock normally does not.
  let noSkipCorrect = 0;
  for (let i = 0; i < LENGTH; i++)
    noSkipCorrect += Number(inverse[clock[i]][cipher[i]] === truePlain[i]);
  const recovered = inferClock(cipher, inverse);
  let plaintextCorrect = 0, skipsCorrect = 0, withheldCorrect = 0;
  for (let i = 0; i < LENGTH; i++) {
    plaintextCorrect += Number(recovered.plaintext[i] === truePlain[i]);
    skipsCorrect += Number(recovered.skips[i] === hiddenSkips[i]);
  }
  for (const i of withheld)
    withheldCorrect += Number(recovered.plaintext[i] === truePlain[i]);
  const actualSkips = hiddenSkips.reduce((s, v) => s + v, 0);
  const inferredSkips = recovered.skips.reduce((s, v) => s + v, 0);
  assert.ok(plaintextCorrect > noSkipCorrect, 'decoder must improve the public clock');
  tests.push({
    trial,sourceStart:start,actualDoublets,actualSkips,inferredSkips,
    maxTrueSkips,knownTableAndTrueClock:LENGTH,noSkipCorrect,
    hiddenClockViterbiPlaintextCorrect:plaintextCorrect,
    withheld150Correct:withheldCorrect,
    inferredSkipPositionsCorrect:skipsCorrect,
    maxViterbiStates:recovered.maxStates,validTransitions:recovered.transitions,
    score:Number(recovered.score.toFixed(2))
  });
}
console.log(JSON.stringify({
  classification:'synthetic H2 cryptanalysis with secret tableau oracle; NO original unknown LP2 plaintext',
  originalCiphertextRuneCount:LENGTH,
  sourceNativeGP29SourceLength:source.length,
  independentShakespeareGP29ModelLength:training.length,
  publicClock:'successive ordinary-prime totients mod29',
  secretPermutations:'29 independent unknown uniform 29-entry permutations; ORACLE given to Viterbi',
  skipRule:'try key row; if would repeat prior ciphertext, reject with probability .81 and advance until accepted',
  originalPunctuationOffsets:sites.map(s=>s.after),
  decoderSupplied:['ciphertext','the actual 29 secret inverse-table permutations','independent Shakespeare bigram model','known initial prime clock index zero'],
  decoderWithheld:['true plaintext including planted apostrophe words','true key pointers','every skip count and decision'],
  trials:tests
},null,2));
