'use strict';

/**
 * Original LP2 additive-periodic-key inverse, conditioned on an independently
 * encoded Old English GP29 source. No historical key or plaintext is assumed.
 *
 * Source: resources/control/beowulf_oe_gp_profile.json
 * Original ciphertext: resources/liber-primus/lp2-corpus.json
 *
 * Exact model C_i = (P_i + K_{clock(i) mod period}) mod 29 with arbitrary
 * secret 29-symbol key. The key for each period phase is fitted only to
 * physical pages 0..27 using independently trained source unigrams.
 * Freeze keys and evaluate the entire untouched physical-page remainder.
 *
 * Clock choices: continuous across physical page boundaries or reset at
 * the beginning of every rune-bearing page. All 29 possible key values
 * at every phase are optimized exactly; no gradient approximation.
 *
 * This model is narrower than unknown key skipping, per-page varying keys,
 * transposition, hidden-state alphabets, and plaintext-dependent rewrites.
 *
 * Source construction: original 9700-0.txt Old English Beowulf verse between
 * heading "\nBEÓWULF.\r\n" and "\r\nAPPENDIX\r\n". Split CRLF lines;
 * omit Roman-number heading lines; retain lines matching
 * /^\\s*(\\d+\\s+)?[a-zþæðŵôûÊêÝýÄäÂâÆæÏïúóéáêëþ]/iu and containing
 * two consecutive spaces. Select Unicode letters and combining marks;
 * normalize NFD, remove combining marks, map Ð/Þ->TH, Æ->AE,
 * Œ->OE, ƿ/Ƿ->W, Ȝ/ȝ->G; uppercase and map QU->CW, V->U,
 * K->C, Z->S; greedily encode the canonical GP digraphs and singles.
 * The first 16,000 runes determine the frozen source prior. A disjoint
 * 12,956-rune contiguous sample beginning at source rune 16,000 is
 * preserved in the source fixture for authentic-message positive controls.
 *
 * Runnable with Node 22, CommonJS and built-in libraries only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const source = readJson('resources/control/beowulf_oe_gp_profile.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
  .map(p => p.indices);
const N = 12956;
const TRAIN_PAGES = 28;
const M = 29;
const periods = [15, 16, 28, 29, 32, 41, 79, 164, 225, 256];
const counts = source.trainingCounts;
const sample = [...source.positiveControlGpBase29].map(ch =>
  source.positiveControlAlphabet.indexOf(ch));
const total = counts.reduce((a, b) => a + b, 0);
const logp = counts.map(n => Math.log(M * (n + 0.5) / (total + 0.5 * M)));

assert.equal(pages.length, 55);
assert.equal(pages.flat().length, N);
assert.equal(total, 16000);
assert.equal(source.allSourceGpRunes, 45299);
assert.equal(source.acceptedSourceWords, 10885);
assert.equal(sample.length, N);
assert.ok(sample.every(x => x >= 0 && x < M));
assert.equal(source.positiveControlSourceGpStart, 16000);

/** @param {number} n @returns {number} */
function mod29(n) { return (n % M + M) % M; }

/** @param {number} seed */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Fit every key phase exactly on the source-frozen 29-way unigram objective.
 * @param {number[][]} ciphertext
 * @param {number} period
 * @param {boolean} bookClock
 * @returns {number[]}
 */
function fitKey(ciphertext, period, bookClock) {
  const frequencies = Array.from({ length: period }, () => new Int32Array(M));
  let globalPosition = 0;
  for (let page = 0; page < TRAIN_PAGES; page++) {
    const values = ciphertext[page];
    for (let i = 0; i < values.length; i++) {
      frequencies[(bookClock ? globalPosition : i) % period][values[i]]++;
      globalPosition++;
    }
  }
  return frequencies.map(freq => {
    let best = -Infinity;
    let selected = 0;
    for (let shift = 0; shift < M; shift++) {
      let logLikelihood = 0;
      for (let cipher = 0; cipher < M; cipher++)
        logLikelihood += freq[cipher] * logp[mod29(cipher - shift)];
      if (logLikelihood > best) {
        best = logLikelihood;
        selected = shift;
      }
    }
    return selected;
  });
}

/**
 * @param {number[][]} ciphertext
 * @param {number[]} key
 * @param {boolean} bookClock
 * @returns {{train:number,hold:number,heldoutIoc:number,decoded:number[]}}
 */
function evaluate(ciphertext, key, bookClock) {
  let globalPosition = 0;
  let trainLog = 0;
  let holdLog = 0;
  let trainN = 0;
  let holdN = 0;
  const decoded = [];
  const heldoutCounts = Array(M).fill(0);
  for (let page = 0; page < ciphertext.length; page++) {
    for (let i = 0; i < ciphertext[page].length; i++) {
      const p = mod29(ciphertext[page][i] -
        key[(bookClock ? globalPosition : i) % key.length]);
      decoded.push(p);
      if (page < TRAIN_PAGES) {
        trainLog += logp[p];
        trainN++;
      } else {
        holdLog += logp[p];
        holdN++;
        heldoutCounts[p]++;
      }
      globalPosition++;
    }
  }
  const iocNumerator = heldoutCounts.reduce((sum, count) =>
    sum + count * (count - 1), 0);
  return {
    train: trainLog / trainN,
    hold: holdLog / holdN,
    heldoutIoc: iocNumerator / (holdN * (holdN - 1)),
    decoded
  };
}

/**
 * Independent known-plaintext positive, source-disjoint from the trained
 * frequencies. The key is hidden from fitKey and chosen by a seeded PRNG.
 * @param {number} period
 * @param {boolean} bookClock
 * @param {number} seed
 */
function planted(period, bookClock, seed) {
  const random = seededRandom(seed);
  const secret = Array.from({ length: period }, () => random() % M);
  let globalPosition = 0;
  const cipher = pages.map(page => page.map((_, i) => {
    const c = mod29(sample[globalPosition] +
      secret[(bookClock ? globalPosition : i) % period]);
    globalPosition++;
    return c;
  }));
  const recoveredKey = fitKey(cipher, period, bookClock);
  const stats = evaluate(cipher, recoveredKey, bookClock);
  const frozenHold = pages.slice(TRAIN_PAGES)
    .reduce((sum, page) => sum + page.length, 0);
  const firstHold = N - frozenHold;
  let correct = 0;
  for (let i = firstHold; i < N; i++)
    correct += Number(stats.decoded[i] === sample[i]);
  const exactKey = recoveredKey.filter((k, i) => k === secret[i]).length;
  assert.ok(correct / frozenHold > 0.98,
    'Planted source register should be recoverable on truly heldout pages');
  assert.ok(exactKey / period > 0.98,
    'Most actual planted key digits must be recovered');
  for (let p = 0, offset = 0; p < pages.length; p++) {
    for (let i = 0; i < pages[p].length; i++) {
      const forward = mod29(stats.decoded[offset] +
        recoveredKey[(bookClock ? offset : i) % period]);
      assert.equal(forward, cipher[p][i], 'Exact roundtrip at ' + offset);
      offset++;
    }
  }
  return {
    period,
    clock: bookClock ? 'book' : 'page',
    frozenHeldoutRunes: frozenHold,
    heldoutPlaintextRecovered: correct,
    hiddenKeyDigitsRecovered: exactKey,
    keyLength: period,
    heldoutLogExcess: stats.hold
  };
}

const results = [];
for (const period of periods) {
  for (const bookClock of [true, false]) {
    const fit = fitKey(pages, period, bookClock);
    const stats = evaluate(pages, fit, bookClock);
    results.push({
      period,
      clock: bookClock ? 'book' : 'page',
      trainLogExcess: stats.train,
      heldoutLogExcess: stats.hold,
      heldoutIoc: stats.heldoutIoc
    });
  }
}
results.sort((a, b) => b.heldoutLogExcess - a.heldoutLogExcess);
assert.equal(results.length, 20);
assert.ok(results[0].heldoutLogExcess < 0,
  'No original positive Old English-source evidence');
const controls = [
  planted(79, true, 0x715a3301),
  planted(225, false, 0x715a3302),
  planted(225, true, 0x715a3303)
];
console.log(JSON.stringify({
  status: 'Bounded negative of simple periodic GP29 additive keys on original',
  source: 'Harrison-Sharp Old English Beowulf, 16k GP rune training register',
  originalCiphertextRunes: N,
  originalPhysicalPages: pages.length,
  sourceTrainingGpRunes: total,
  disjointPositiveControlGpRunes: sample.length,
  keyPeriods: periods,
  bestOriginalHeldout: results[0],
  originalAllCandidates: results,
  sourceDisjointPlantedControls: controls,
  conclusion: 'No LP2 Old English decryption; model excludes only fixed-period ' +
    'additive GP29 keys under this source and continuous/page-local clocks.'
}, null, 2));
