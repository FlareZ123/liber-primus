'use strict';
/**
 * Original LP2 GP29 predecessor-excluding GP28 stream, with an arbitrary
 * 29-rune secret order and independent source-length phase-13 rank shifts.
 *
 * Exact all-key one-letter capacity with six fixed consumption/reset clocks.
 * Self-contained SFT: node sims/lp2_rank28_period13_allsecret_capacity_sft.cjs
 * CommonJS, Node.js 20+, native libraries only, no writes or network.
 *
 * This is a bounded negative cipher-family test, not an LP2 decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55 && p.indices.length > 0);
const Q = 29;
const PERIOD = 13;
const STARTS = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const LENGTH = pages.reduce((s, p) => s + p.indices.length, 0);
assert.equal(corpus.runes.length, Q);
assert.equal(pages.length, 55);
assert.equal(LENGTH, 12956);
for (const p of pages) assert.equal(p.indices.length, p.runic_count);

/** @param {number} x @returns {number} */
function mod28(x) { return (x % 28 + 28) % 28; }
/**
 * For a row-stochastic-free weighted rune transition count T[s][c],
 * exact maximum occupancy of ANY single predecessor-exclusion output
 * rank under every permutation of the q rune identities.
 *
 * For adjacent ordered endpoints a,b, all other predecessor runes
 * independently choose before(a) or after(b). That yields the formula
 * T[a][b]+T[b][a]+sum_s max(T[s][a],T[s][b]).
 *
 * @param {Int32Array[]} T
 * @returns {{maximum:number, pair:number[], order:number[], rank:number}}
 */
function exactOneRank(T) {
  const q = T.length;
  let maximum = -1, pair = [];
  for (let a = 0; a < q; a++) {
    for (let b = a + 1; b < q; b++) {
      let n = T[a][b] + T[b][a];
      for (let s = 0; s < q; s++) {
        if (s !== a && s !== b) n += Math.max(T[s][a], T[s][b]);
      }
      if (n > maximum) { maximum = n; pair = [a, b]; }
    }
  }
  const [a, b] = pair;
  const before = [], after = [];
  for (let s = 0; s < q; s++) {
    if (s === a || s === b) continue;
    if (T[s][b] >= T[s][a]) before.push(s);
    else after.push(s);
  }
  const order = [...before, a, b, ...after];
  const pos = new Int32Array(q);
  order.forEach((r, i) => { pos[r] = i; });
  const rank = before.length;
  let attained = 0;
  for (let s = 0; s < q; s++) {
    for (let c = 0; c < q; c++) {
      if (s === c) continue;
      const out = pos[c] - Number(pos[s] < pos[c]);
      if (out === rank) attained += T[s][c];
    }
  }
  assert.equal(attained, maximum, 'constructive attainment');
  return {maximum, pair, order, rank};
}
/** @param {Int32Array[]} T @returns {number} */
function bruteOneRank(T) {
  const q = T.length, order = Array.from({length:q}, (_, i) => i);
  let best = -1;
  /** @param {number} k */
  function permute(k) {
    if (k === q) {
      const pos = new Int32Array(q), bins = new Int32Array(q - 1);
      order.forEach((r, i) => { pos[r] = i; });
      for (let s = 0; s < q; s++) for (let c = 0; c < q; c++) {
        if (s !== c) bins[pos[c] - Number(pos[s] < pos[c])] += T[s][c];
      }
      best = Math.max(best, ...bins);
      return;
    }
    for (let i = k; i < q; i++) {
      [order[k], order[i]] = [order[i], order[k]];
      permute(k + 1);
      [order[k], order[i]] = [order[i], order[k]];
    }
  }
  permute(0);
  return best;
}
// Independent exhaustive oracle: not a reimplementation of the formula.
let seed = 3301;
/** @returns {number} */
function rnd() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
for (const q of [4, 5, 6]) {
  for (let j = 0; j < 8; j++) {
    const T = Array.from({length:q}, () => Int32Array.from(
      {length:q}, () => rnd() % 17));
    for (let s = 0; s < q; s++) T[s][s] = 0;
    assert.equal(exactOneRank(T).maximum, bruteOneRank(T));
  }
}
/**
 * @param {'book'|'page'|'visual'} reset
 * @param {'all'|'nonrepeat'} consumption
 * @returns {{reset:string,consumption:string,eligible:number,free:number,perPhase:number[],capacity:number,phaseWitnesses:number[][]}}
 */
function originalCapacity(reset, consumption) {
  const T = Array.from({length:PERIOD},
    () => Array.from({length:Q}, () => new Int32Array(Q)));
  let phaseClock = 0, prevChapter = -1, eligible = 0, free = 0;
  for (const p of pages) {
    const chapter = STARTS.filter(x => x <= p.page).length - 1;
    if (reset === 'page' || (reset === 'visual' && chapter !== prevChapter)) {
      phaseClock = 0;
    }
    prevChapter = chapter;
    for (let i = 0; i < p.indices.length; i++) {
      const isFree = i === 0 || p.indices[i] === p.indices[i - 1];
      if (isFree) free++;
      else {
        const s = p.indices[i - 1], c = p.indices[i];
        T[phaseClock % PERIOD][s][c]++;
        eligible++;
      }
      if (consumption === 'all' || !isFree) phaseClock++;
    }
  }
  const witnesses = T.map(exactOneRank);
  const perPhase = witnesses.map(w => w.maximum);
  assert.equal(eligible, 12815);
  assert.equal(free, 141);
  return {
    reset, consumption, eligible, free, perPhase,
    capacity: perPhase.reduce((s, v) => s + v, 0) + free,
    phaseWitnesses: witnesses.map(w => w.pair)
  };
}
// Expected results were independently obtained from canonical source rows,
// not learned by fitting any natural-language target.
const expected = {
  'book/all': 1021,
  'book/nonrepeat': 1010,
  'page/all': 1035,
  'page/nonrepeat': 1019,
  'visual/all': 1016,
  'visual/nonrepeat': 1011
};
const capacity = [];
for (const reset of ['book', 'page', 'visual']) {
  for (const consumption of ['all', 'nonrepeat']) {
    const r = originalCapacity(reset, consumption);
    assert.equal(r.capacity, expected[reset + '/' + consumption]);
    capacity.push(r);
  }
}
const upper = Math.max(...capacity.map(x => x.capacity));
assert.equal(upper, 1035);

// The exact source-attested GP spelling of common English uses single
// symbols ING -> rune21, IO -> rune27 (beside the inventory labels NG, IA).
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} source @param {boolean} calibrated @returns {number[]} */
function nativeGP(source, calibrated) {
  const cleaned = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (calibrated && word.startsWith('ING', i)) {
        out.push(21); i += 3; continue;
      }
      if (calibrated && word.startsWith('IO', i)) {
        out.push(27); i += 2; continue;
      }
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, 'Missing GP symbol for source word');
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const literalLP1 = read('resources/transcriptions/lp1_wulfic_canonical.txt');
for (const [word, rune] of [
  ['FUNCTION', 'ᚠᚢᚾᚳᛏᛡᚾ'],
  ['THINGS', 'ᚦᛝᛋ'],
  ['FOLLOWING', 'ᚠᚩᛚᛚᚩᚹᛝ']
]) {
  assert(literalLP1.includes(rune));
  assert.equal(nativeGP(word, true).map(x => corpus.runes[x]).join(''), rune);
}
assert.deepEqual(nativeGP('PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE', true), corpus.pages[57].indices);
const controls = [];
for (const [name, file, expectedLength, expectedCorrected] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 63114, 62492],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 218800, 217106],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 324630, 321327]
]) {
  const source = read(file);
  for (const calibrated of [false, true]) {
    const gp = nativeGP(source, calibrated);
    assert.equal(gp.length, calibrated ? expectedCorrected : expectedLength);
    let E = 0, minimum = Infinity, minimumAt = -1;
    for (let i = 0; i < LENGTH; i++) E += Number(gp[i] === 18);
    for (let start = 0; start + LENGTH <= gp.length; start++) {
      if (start) {
        E -= Number(gp[start - 1] === 18);
        E += Number(gp[start + LENGTH - 1] === 18);
      }
      if (E < minimum) { minimum = E; minimumAt = start; }
    }
    assert(minimum > upper, name + ' all-window rank bound');
    controls.push({
      name, calibrated, windows: gp.length - LENGTH + 1,
      minERunes: minimum, atRuneOffset: minimumAt,
      marginOverMostGenerousModel: minimum - upper
    });
  }
}
// Synthetic fully reversible 29-symbol predecessor-excluding encoder with
// 28-symbol plaintext, arbitrary source order and a 13-key schedule.
const order = Array.from({length:Q}, (_, i) => (i * 11 + 3) % Q);
const pos = new Int32Array(Q);
order.forEach((r, i) => {pos[r] = i;});
const key = Array.from({length:PERIOD}, (_, i) => (i * 7 + 3) % 28);
const plain = Array.from({length:500}, (_, i) => i % 5 === 0 ? 18 : (i * 17) % 28);
const cipher = [order[4]];
const inverse = [];
for (let i = 0; i < plain.length; i++) {
  const encodedRank = mod28(plain[i] + key[i % PERIOD]);
  const excludedIndex = pos[cipher[i]];
  const rune = order[encodedRank + Number(encodedRank >= excludedIndex)];
  cipher.push(rune);
  const gotRank = pos[rune] - Number(excludedIndex < pos[rune]);
  inverse.push(mod28(gotRank - key[i % PERIOD]));
}
assert.deepEqual(inverse, plain);
assert.equal(cipher.length, plain.length + 1);
assert(cipher.slice(1).every((v, i) => v !== cipher[i]));
console.log(JSON.stringify({
  evidence: 'finite original-cipher exclusion; no unknown plaintext recovered',
  model: 'predecessor-excluding GP28 rank, secret order per phase13, secret phase13 output relabeling',
  original: {runes: LENGTH, eligible: 12815, exceptionSites: 141},
  assumptions: 'one repeated phase13 map across all pages; six source-visible clock choices',
  capacity, mostGenerousSinglePlaintextRune: upper, controls,
  oracle: '8 exhaustive q4/q5/q6 weighted permutation tests each',
  plantedInverseRunes: plain.length
}, null, 2));
