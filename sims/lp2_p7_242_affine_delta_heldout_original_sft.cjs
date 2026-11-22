'use strict';

/**
 * Original LP2, source-selected order-242 clock, arbitrary secret affine
 * difference cipher, and independent held-out key-recovery decision.
 *
 * Model on one continuous p9..p55 GP29 rune stream:
 *   C_i = C_(i-1) + A_(i mod 242) * (P_i - B_(i mod 242)) (mod 29)
 *   A_s belongs to 1..28 and B_s belongs to 0..28.
 * The 242 phase states come from the genuine p7 five-red-word primitive
 * GF(3) period, and 242 physically p8-contained black runes supply one
 * source-derived candidate for A and B. The test nevertheless allows
 * all 812=28*29 possible secret (A,B) pairs INDEPENDENTLY per phase.
 *
 * A chosen affine key perfectly re-encrypts its own decoded ciphertext.
 * Therefore original roundtrip alone does not prove a decipherment.
 * This script trains keys only on p9..p29, holds out p30..p55, tests
 * 241 alternative phase alignments, and plants a fully known GP29 text
 * under independent Shakespeare-calibrated language frequencies.
 *
 * SFT: Node 22 / Windows 11 / CommonJS, no deps, read only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = rel => fs.readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);

const starts = new Map();
let at = 0;
for (const p of pages) { starts.set(p.page, at); at += p.indices.length; }
const START = starts.get(9);
const SPLIT = starts.get(30);
const END = original.length;
const PERIOD = 242;
assert.deepEqual([START, SPLIT, END], [2129, 7307, 12956]);
const register = gp.pages[8].indices.slice(12, 254);
assert.equal(register.length, PERIOD);
const mod = v => ((v % 29) + 29) % 29;
const inv = Array.from({length:29}, (_, n) => {
  if (n === 0) return 0;
  for (let i = 1; i < 29; i++) if (i * n % 29 === 1) return i;
  throw Error('No nonzero inverse mod29');
});

/**
 * Confirm 242 is source-derived, not fitted to ciphertext.
 * The five red p7 words supply products [11,26,8,15,2],
 * whose GF3 residues [2,2,2,0,2] define this primitive register.
 */
const originalP7 = gp.pages[7].indices.slice(-14);
const red = [
  originalP7.slice(0, 2), originalP7.slice(2, 6),
  originalP7.slice(6, 9), originalP7.slice(9, 11),
  originalP7.slice(11, 14)
];
const products = red.map(w => w.reduce((a, b) => mod(a * b), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const taps = products.map(v => v % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);
const initial = taps.slice();
let state = initial.slice();
const visited = new Set();
for (let i = 0; i < PERIOD; i++) {
  const word = state.reduce((n, v) => n * 3 + v, 0);
  assert(word > 0 && !visited.has(word));
  visited.add(word);
  const next = taps.reduce((n, t, j) => n + t * state[j], 0) % 3;
  state = [...state.slice(1), next];
}
assert.equal(visited.size, PERIOD);
assert.deepEqual(state, initial);

/** Cicada's solved LP1 native-English GP29 spelling merges. */
const tokens = gp.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function encodeNativeGp(text) {
  const encoded = [];
  for (const word of text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) { encoded.push(21); i += 3; }
      else if (word.startsWith('IO', i)) { encoded.push(27); i += 2; }
      else {
        const token = tokens.find(t => word.startsWith(t.token, i));
        assert(token, 'native source-orthography failure');
        encoded.push(token.index);
        i += token.token.length;
      }
    }
  }
  return encoded;
}
const calibration = encodeNativeGp(read('resources/control/shakespeare_first300k.txt'));
const positivePlain = encodeNativeGp(read('resources/control/gibran_prophet_58585.txt'));
assert.equal(calibration.length, 217106);
assert.equal(positivePlain.length, 62492);
const freq = Array(29).fill(1);
for (const x of calibration) freq[x]++;
const logProb = freq.map(n => Math.log(n / (calibration.length + 29)));

/**
 * Train 242 secret affine inverse rows on 5,178 original rune positions.
 * No original withheld ciphertext enters parameter selection.
 * Inverse model P_i = m_phase * (C_i-C_previous) + b_phase mod29.
 * @param {number[]} cipher
 */
function fitAffine(cipher) {
  const deltas = Array.from({length:END-START}, (_, i) =>
    mod(cipher[START+i] - cipher[START+i-1]));
  const key = [];
  for (let ph = 0; ph < PERIOD; ph++) {
    let best = -Infinity;
    let selected = [1, 0];
    for (let m = 1; m < 29; m++) {
      for (let b = 0; b < 29; b++) {
        let score = 0;
        for (let i = ph; i < SPLIT-START; i += PERIOD)
          score += logProb[mod(m * deltas[i] + b)];
        if (score > best) { best = score; selected = [m, b]; }
      }
    }
    key.push(selected);
  }

  /**
   * @param {number} first
   * @param {number} last
   * @param {number} shift
   */
  function metrics(first, last, shift=0) {
    const hist = Array(29).fill(0);
    let ll = 0;
    let prev = cipher[first-1];
    for (let i = first; i < last; i++) {
      const [m, b] = key[(i-START+shift)%PERIOD];
      const p = mod(m * mod(cipher[i] - prev) + b);
      const reencrypted = mod(prev + inv[m] * mod(p - b));
      assert.equal(reencrypted, cipher[i], 'exact original-cipher forward replay');
      prev = cipher[i];
      hist[p]++;
      ll += logProb[p];
    }
    const count = last-first;
    return {
      n:count,
      logLikelihoodPerRune:ll/count,
      ioc:hist.reduce((n,v)=>n+v*(v-1),0)/(count*(count-1)),
      topFiveShare:hist.slice().sort((a,b)=>b-a).slice(0,5)
        .reduce((a,b)=>a+b,0)/count,
      eShare:hist[18]/count
    };
  }
  const train=metrics(START,SPLIT);
  const holdout=metrics(SPLIT,END);
  const phaseShifts=Array.from({length:PERIOD},(_,i)=>
    metrics(SPLIT,END,i).logLikelihoodPerRune);
  const shuffled=phaseShifts.slice(1);
  const shiftMean=shuffled.reduce((a,b)=>a+b,0)/shuffled.length;
  const shiftSd=Math.sqrt(shuffled.reduce((a,v)=>a+(v-shiftMean)**2,0)
    /(shuffled.length-1));
  return {
    key,train,holdout,
    phaseRank:phaseShifts.filter(x=>x>=phaseShifts[0]).length,
    phaseMean:shiftMean,phaseStdDev:shiftSd,
    phaseZ:(phaseShifts[0]-shiftMean)/shiftSd
  };
}
const observed=fitAffine(original);

/** Independent genuine-native-GP positive under the physical 242-rune key. */
const planted=original.slice();
for(let i=START;i<END;i++){
  const phase=(i-START)%PERIOD;
  const a=register[phase]%28+1;
  const b=register[phase];
  planted[i]=mod(planted[i-1]+a*mod(positivePlain[i-START]-b));
}
const positive=fitAffine(planted);
const keyRecovered=positive.key.reduce((n,[m,b],phase)=>n+Number(
  m===inv[register[phase]%28+1]&&b===register[phase]),0);
const nativeHeldout=positivePlain.slice(SPLIT-START,END-START);
const nativeLogScore=nativeHeldout.reduce((a,b)=>a+logProb[b],0)
  /nativeHeldout.length;

assert.equal(observed.phaseRank,12);
assert.equal(positive.phaseRank,1);
assert.equal(keyRecovered,182);
assert(Math.abs(observed.holdout.logLikelihoodPerRune+4.151462740295035)<1e-10);
assert(Math.abs(positive.holdout.logLikelihoodPerRune+3.1723362869521328)<1e-10);
assert(observed.holdout.ioc<0.04);
assert(positive.holdout.ioc>0.05);
assert.equal(positive.train.n,5178);
assert.equal(positive.holdout.n,5649);

console.log(JSON.stringify({
  source:'original physical LP2 p9..p55, source p7 GF3 period and p8 242 runes',
  cipher:'C_i=C_prev+A[phase]*(P_i-B[phase]) mod29',
  unrestrictedSecretPerPhase:28*29,
  physicalPagesTrain:'p9..p29',physicalPagesHoldout:'p30..p55',
  calibration:'Shakespeare GP29, independent of Gibran plant',
  calibrationRunes:calibration.length,positiveNativeRimes:positivePlain.length,
  original:{train:observed.train,holdout:observed.holdout,
    phaseShiftRank:observed.phaseRank,phaseShiftTotal:PERIOD,
    phaseShiftZ:observed.phaseZ},
  positive:{train:positive.train,holdout:positive.holdout,
    phaseShiftRank:positive.phaseRank,phaseShiftZ:positive.phaseZ,
    exactAffinePairsRecovered:keyRecovered,nativeHoldoutLogScore:nativeLogScore},
  interpretation:'Original does not reproduce native-GP heldout under this 242-state stationary affine-delta architecture. A fully recoverable native-source plant does. No original plaintext or authentic opcode established.'
},null,2));
