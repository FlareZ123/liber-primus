'use strict';

/**
 * Reversible 28-of-29 rank-exclusion cipher experiment.
 * Input: the original 55 rune-bearing LP2 pages. Genuine known-plaintext
 * register: the bundled Shakespeare corpus. All code CommonJS / Node 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const ALPH = new Map([...RUNES].map((r, i) => [r, i]));
const LENGTHS = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
const MAX_PERIOD = 256;
const SEED = 0x330123d3;

/** @returns {() => number} */
function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** @returns {number[][]} */
function sections() {
  const raw = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
  const groups = raw.split('%').slice(0, 55).join('%').split('$')
    .map(part => [...part].filter(c => ALPH.has(c)).map(c => ALPH.get(c)))
    .filter(group => group.length);
  assert.deepEqual(groups.map(group => group.length), LENGTHS);
  assert.equal(groups.flat().length, 12956);
  return groups;
}

/**
 * Strip each predecessor from the sorted 29-symbol alphabet. The omitted
 * value is an erasure on observed adjacent equal runes.
 * @param {number[]} c
 * @returns {number[]}
 */
function decode(c) {
  return c.map((x, i) => i === 0 || x === c[i - 1]
    ? -1 : x - Number(x > c[i - 1]));
}

/**
 * @param {number[]} p 28-alphabet plaintext values
 * @param {number[]} key Repeating mod28 key
 * @param {number} first First emitted literal ciphertext rune
 * @param {Set<number>} [exceptions] Deliberate identical-ciphertext overwrites
 */
function encrypt(p, key, first, exceptions = new Set()) {
  const out = [first];
  for (let i = 1; i < p.length; i++) {
    const y = (p[i] + key[i % key.length]) % 28;
    const v = y + Number(y >= out[i - 1]);
    out.push(exceptions.has(i) ? out[i - 1] : v);
  }
  return out;
}

/**
 * GP-English reference, with the 29th rune reserved as possible escape.
 * Encoding is only a source-language model, not an LP2 plaintext assertion.
 * @param {string} text
 * @param {string[]} spellings
 * @returns {number[]}
 */
function gp28(text, spellings) {
  const tokens = spellings.map((value, index) => [value, index])
    .sort((a, b) => b[0].length - a[0].length);
  const words = (text.toUpperCase().match(/[A-Z]+/g) || [])
    .map(w => w.replaceAll('QU', 'CW').replaceAll('V', 'U')
      .replaceAll('K', 'C').replaceAll('Z', 'S').replaceAll('ING', 'NG'));
  const out = [];
  for (const word of words) {
    for (let pos = 0; pos < word.length;) {
      const token = tokens.find(([term]) => word.startsWith(term, pos));
      assert.ok(token, 'Unknown GP spelling: ' + word.slice(pos));
      if (token[1] < 28) out.push(token[1]);
      pos += token[0].length;
    }
  }
  return out;
}

/** @param {number[]} reference @returns {Float64Array} */
function sourcePrior(reference) {
  const count = new Float64Array(28).fill(0.5);
  for (const x of reference) count[x]++;
  const n = count.reduce((a, b) => a + b, 0);
  return Float64Array.from(count, x => Math.log(x / n));
}

/**
 * Fit the period-p mod28 key exclusively on the first four sections.
 * @param {number[][]} train
 * @param {number} period
 * @param {Float64Array} logq
 * @returns {number[]}
 */
function fit(train, period, logq) {
  const count = Array.from({length: period}, () => new Int32Array(28));
  for (const group of train) for (let i = 1; i < group.length; i++) {
    if (group[i] >= 0) count[i % period][group[i]]++;
  }
  return count.map(bins => {
    let best = -Infinity, key = 0;
    for (let k = 0; k < 28; k++) {
      let score = 0;
      for (let v = 0; v < 28; v++)
        score += bins[v] * logq[(v - k + 28) % 28];
      if (score > best) { best = score; key = k; }
    }
    return key;
  });
}

/**
 * @param {number[][]} heldout
 * @param {number[]} key
 * @param {Float64Array} logq
 * @returns {{llr:number,n:number,perRune:number}}
 */
function score(heldout, key, logq) {
  let llr = 0, n = 0;
  const entropy = Math.log(28);
  for (const group of heldout) for (let i = 1; i < group.length; i++) {
    if (group[i] < 0) continue;
    llr += logq[(group[i] - key[i % key.length] + 28) % 28] + entropy;
    n++;
  }
  return {llr, n, perRune: llr / n};
}

/** @param {number[][]} train @param {number[][]} heldout @param {Float64Array} logq */
function scan(train, heldout, logq) {
  const top = [];
  for (let p = 2; p <= MAX_PERIOD; p++) {
    const key = fit(train, p, logq);
    const evidence = score(heldout, key, logq);
    top.push({period: p, ...evidence, key});
  }
  top.sort((a, b) => b.perRune - a.perRune);
  return top;
}

/**
 * Rescan all 255 periods in each null using independently rotated held-out
 * section streams, retaining the fitted keys and reference-language register.
 * @param {number[][]} train
 * @param {number[][]} heldout
 * @param {Float64Array} logq
 * @param {number} trials
 * @param {number} observed
 */
function nullTest(train, heldout, logq, trials, observed) {
  const random = prng(SEED ^ 0xd033001);
  const keys = Array.from({length: MAX_PERIOD + 1},
    (_, p) => p < 2 ? null : fit(train, p, logq));
  const maxima = [];
  for (let trial = 0; trial < trials; trial++) {
    const rotated = heldout.map(group => {
      const offset = 1 + Math.floor(random() * (group.length - 1));
      return group.slice(offset).concat(group.slice(0, offset));
    });
    let top = -Infinity;
    for (let p = 2; p <= MAX_PERIOD; p++) {
      const result = score(rotated, keys[p], logq).perRune;
      if (result > top) top = result;
    }
    maxima.push(top);
  }
  return {
    trials, seed: SEED ^ 0xd033001,
    meanMax: maxima.reduce((a, b) => a + b, 0) / trials,
    largestMax: Math.max(...maxima),
    exceeding: maxima.filter(x => x >= observed).length,
    upperP: (maxima.filter(x => x >= observed).length + 1) / (trials + 1)
  };
}

/** @returns {object} */
function run() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const english = fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const gp = gp28(english, corpus.translit);
  assert.ok(gp.length > 50000);
  const prior = sourcePrior(gp.slice(0, 30000));
  const cipher = sections();
  const inverse = cipher.map(decode);
  assert.equal(inverse.flat().filter(x => x < 0).length, 8 + 86);
  for (let s = 0; s < cipher.length; s++) {
    const reencoded = cipher[s].map((x, i) => i === 0 || x === cipher[s][i-1]
      ? x : inverse[s][i] + Number(inverse[s][i] >= cipher[s][i-1]));
    assert.deepEqual(reencoded, cipher[s]);
  }
  // Independent GP-English plant, seeded key, 86/12901 chance of forcing
  // an adjacent repeated rune. Every plaintext symbol consumes key phase.
  const random = prng(SEED), period = 31;
  const trueKey = Array.from({length: period}, () => Math.floor(random() * 28));
  const plaintext = gp.slice(32000, 32000 + 12956);
  assert.equal(plaintext.length, 12956);
  let index = 0, exceptions = 0;
  const planted = cipher.map(group => {
    const plain = plaintext.slice(index, index + group.length);
    index += group.length;
    const overwrite = new Set();
    for (let j = 1; j < group.length; j++) {
      if (random() < 86 / 12901) overwrite.add(j);
    }
    exceptions += overwrite.size;
    return encrypt(plain, trueKey, Math.floor(random() * 29), overwrite);
  }).map(decode);
  const plant = scan(planted.slice(0,4), planted.slice(4), prior);
  const trueCandidate = plant.find(x => x.period === period);
  assert.ok(trueCandidate);
  const recoveredKey = trueCandidate.key.filter((k, i) => k === trueKey[i]).length;
  assert.ok(recoveredKey >= 27, 'True key recovery weak in planted control');
  assert.ok(plant[0].period === 31 || plant[0].period % 31 === 0,
    'True period not top in planted control');
  const real = scan(inverse.slice(0,4), inverse.slice(4), prior);
  const trialCount = Number(process.env.NULL_TRIALS || 60);
  const nulls = nullTest(inverse.slice(0,4), inverse.slice(4), prior,
    trialCount, real[0].perRune);
  const output = {
    model: 'Order-preserving 28-of-29 predecessor exclusion; mod28 periodic additive key',
    eightSectionLengths: LENGTHS, ciphertextRunes: 12956,
    inverseObservableRunes: inverse.flat().filter(v => v >= 0).length,
    erasures: 94, trainingSourceGP28Runes: 30000,
    searchedPeriods: [2, MAX_PERIOD], trainingSections: [0,1,2,3],
    heldoutSections: [4,5,6,7],
    positive: {period: 31, exceptions, keyMatches: recoveredKey,
      topPeriod: plant[0].period, truePeriodHeldout: trueCandidate.perRune,
      topHeldout: plant[0].perRune},
    actualTop: real.slice(0, 8).map(({period,llr,n,perRune}) =>
      ({period,llr,n,perRune})),
    null: nulls, status: 'No LP2 plaintext or key claimed'
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) run();
module.exports = {decode, encrypt, fit, score, scan, run};
