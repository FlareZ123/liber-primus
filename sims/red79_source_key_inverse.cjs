'use strict';
/**
 * Exact 79-rune source-derived key, chosen from the three LP2 physical pages
 * identified by their red GP prime sums divisible by 29: 15, 40 and 53.
 *
 * Red ink in these pages covers 20 + 8 + 51 = 79 ORIGINAL ciphertext runes.
 * Test direct additive rune and two reversible predecessor-excluded rank models
 * under three simple key numeric readings, rather than guess free key values.
 * No original LP2 plaintext/key is inferred from the source-length equality.
 *
 * Node 22+ CommonJS, no npm dependencies, manual-only execution.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./word_partition_invariant.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const LENGTH = pages.reduce((n, p) => n + p.indices.length, 0);
const TEST_PAGE = 41;
const CUT = pages.slice(0, TEST_PAGE).reduce((n, p) => n + p.indices.length, 0);
const mod = (x, n) => (x % n + n) % n;
assert.equal(LENGTH, 12956);
assert.equal(CUT, 9871);

const sourcePages = [15, 40, 53];
const selected = sourcePages.map((physical) => {
  const source = ink.pages.find((p) => p.page === physical);
  const page = corpus.pages.find((p) => p.page === physical);
  assert.ok(source && page);
  const values = source.red_spans.flatMap((s) =>
    page.indices.slice(s.start, s.start + s.length));
  assert.equal(values.length,
    {15: 20, 40: 8, 53: 51}[physical]);
  return values;
});
const keyRunes = selected.flat();
assert.equal(keyRunes.length, 79);
const keyVariants = {
  runeIndex: keyRunes,
  primeValue: keyRunes.map((x) => corpus.prime[x]),
  primeOrdinal: keyRunes.map((x) => x + 1)
};
const title15 = selected[0].slice(0, 9)
  .reduce((n, i) => n + corpus.prime[i], 0);
const title40 = selected[1].reduce((n, i) => n + corpus.prime[i], 0);
const stanza53 = selected[2].reduce((n, i) => n + corpus.prime[i], 0);
assert.equal(title15, 638);
assert.equal(title40, 435);
assert.equal(stanza53, 2262);

const GPWORDS = read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g);
const english = GPWORDS.flatMap(encode);
assert.ok(english.length > LENGTH + 1000);

/** @param {number} n @param {number[]} encoded */
function reference(n, encoded) {
  const counts = Array(n).fill(0.5);
  for (const x of encoded) counts[x % n]++;
  const total = encoded.length + n * 0.5;
  return counts.map((x) => Math.log(x / total));
}
const weight = {
  raw: reference(29, english),
  cyclic: reference(28, english),
  sorted: reference(28, english)
};

/** @param {number[][]} ciphertext */
function predecessorRanks(ciphertext) {
  const cyclic = [], sorted = [];
  for (const p of ciphertext) {
    const a = [], b = [];
    for (let i = 0; i < p.length; i++) {
      const x = p[i], previous = p[i - 1];
      if (i === 0 || x === previous) {
        a.push(-1); b.push(-1);
      } else {
        a.push(mod(x - previous, 29) - 1);
        b.push(x - Number(x > previous));
      }
    }
    cyclic.push(a); sorted.push(b);
  }
  return {cyclic, sorted};
}
const ciphertext = pages.map((p) => p.indices);
const originalRank = predecessorRanks(ciphertext);
const rankErased = originalRank.cyclic.flat().filter((x) => x < 0).length;
assert.equal(rankErased, 141);
const cases = {
  raw: ciphertext,
  cyclic: originalRank.cyclic,
  sorted: originalRank.sorted
};

/** @param {{key:string,method:string,sign:number,reverse:boolean,scope:string,phase:number}} config
 *  @param {{raw:number[][],cyclic:number[][],sorted:number[][]}} data
 *  @returns {number[][]}
 */
function decode(config, data) {
  const source = data[config.method], key = keyVariants[config.key];
  const alphabet = config.method === 'raw' ? 29 : 28;
  const out = [];
  let position = 0;
  for (const original of source) {
    const p = [];
    for (let i = 0; i < original.length; i++) {
      const x = original[i];
      const local = config.scope === 'page' ? i : position;
      const kp = mod(local + config.phase, 79);
      const index = config.reverse ? 78 - kp : kp;
      p.push(x < 0 ? -1 : mod(x + config.sign * key[index], alphabet));
      position++;
    }
    out.push(p);
  }
  return out;
}

/** @param {number[][]} pages
 *  @param {string} method
 *  @returns {{train:{n:number,log:number,ioc:number},heldout:{n:number,log:number,ioc:number}}}
 */
function evaluate(pages, method) {
  const alphabet = method === 'raw' ? 29 : 28;
  const scores = [
    {sum: 0, n: 0, counts: new Int32Array(alphabet)},
    {sum: 0, n: 0, counts: new Int32Array(alphabet)}
  ];
  let index = 0;
  for (const p of pages) for (const x of p) {
    const s = scores[index < CUT ? 0 : 1];
    if (x >= 0) {
      s.sum += weight[method][x]; s.n++;
      s.counts[x]++;
    }
    index++;
  }
  assert.equal(index, LENGTH);
  const score = (s) => ({
    n: s.n, log: s.sum / s.n,
    ioc: s.counts.reduce((n, k) => n + k * (k - 1), 0) / (s.n * (s.n - 1))
  });
  return {train: score(scores[0]), heldout: score(scores[1])};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** Exact positive controls using the *actual* marked 79-rune key. */
function positives() {
  const plain = english.slice(1000, LENGTH + 1000);
  assert.equal(plain.length, LENGTH);
  const settings = [
    {key: 'runeIndex', method: 'raw', sign: -1,
      reverse: false, scope: 'continuous', phase: 0},
    {key: 'primeValue', method: 'cyclic', sign: -1,
      reverse: false, scope: 'continuous', phase: 0}
  ];
  const random = rng(0x79515179), out = [];
  for (const config of settings) {
    const ciphertext = [];
    let absolute = 0;
    for (const p of pages) {
      const c = [];
      let previous = random() % 29;
      for (let j = 0; j < p.indices.length; j++) {
        const n = plain[absolute], kval = keyVariants[config.key][absolute % 79];
        if (config.method === 'raw') c.push(mod(n + kval, 29));
        else {
          if (j) previous = mod(previous + 1 + n % 28 + kval, 29);
          c.push(previous);
        }
        absolute++;
      }
      ciphertext.push(c);
    }
    const ranks = predecessorRanks(ciphertext);
    const decoded = decode(config, {raw: ciphertext, ...ranks});
    let matched = 0, valid = 0, offset = 0;
    for (const p of decoded) for (const r of p) {
      if (r >= 0) {
        matched += Number(r === plain[offset] % (config.method === 'raw' ? 29 : 28));
        valid++;
      }
      offset++;
    }
    assert.equal(matched, valid);
    assert.equal(valid, config.method === 'raw' ? LENGTH : LENGTH - pages.length);
    const language = evaluate(decoded, config.method);
    assert.ok(language.train.log > -3.2);
    assert.ok(language.heldout.log > -3.2);
    assert.ok(language.heldout.ioc > 0.05);
    out.push({method: config.method, exactRecovery: matched,
      eligible: valid, trueSettings: config,
      train: language.train, heldout: language.heldout});
  }
  return out;
}

/** Freeze fit on first 41 physical rune-bearing pages; score last 14 pages. */
function main() {
  const candidates = [];
  for (const key of Object.keys(keyVariants))
    for (const method of ['raw', 'cyclic', 'sorted'])
      for (const sign of [-1, 1])
        for (const reverse of [false, true])
          for (const scope of ['continuous', 'page'])
            for (let phase = 0; phase < 79; phase++) {
              const config = {key, method, sign, reverse, scope, phase};
              const evaluation = evaluate(decode(config, cases), method);
              candidates.push({...config, ...evaluation});
            }
  assert.equal(candidates.length, 5688);
  candidates.sort((a, b) => b.train.log - a.train.log);
  const positive = positives();
  const result = {
    sourcePages, redRuneLengths: selected.map((x) => x.length),
    keyRunes: keyRunes.length, primes: {title15, title40, stanza53},
    originalUnsolvedRunes: LENGTH, originalRankErasures: rankErased,
    scanned: candidates.length, trainRunes: CUT,
    heldoutRunes: LENGTH - CUT,
    GPEnglishReference: {
      raw: evaluate([english.slice(0, CUT), english.slice(CUT, LENGTH)], 'raw'),
      rank28: evaluate([
        english.slice(0, CUT).map((x) => x % 28),
        english.slice(CUT, LENGTH).map((x) => x % 28)
      ], 'cyclic')
    },
    bestTrain: candidates.slice(0, 8),
    sourceKeyExactPositiveControls: positive,
    interpretation: 'No original LP2 plaintext in direct 79-rune red-key additive or predecessor-excluded rank models.'
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}
if (require.main === module) main();
module.exports = {
  keyRunes, keyVariants, title15, title40, stanza53,
  predecessorRanks, decode, evaluate, positives, main
};
