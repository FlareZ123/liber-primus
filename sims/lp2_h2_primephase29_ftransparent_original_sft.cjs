'use strict';

/**
 * Exact all-secret cyclic-H2 source-phase discriminator.
 *
 * Source clue: solved p56 uses consecutive-prime totients; 2013's signed
 * DH example gives small numerical phase candidates (5,6,15).
 * This test grants 29 distinct starting prime ordinals (0..28), one
 * wholly secret GP29 permutation, all lawful collision retries, and the
 * authenticated plaintext-F bypass. It does not claim H2 was historical.
 *
 * Run from repository root, Windows Node.js 22:
 *   node sims/lp2_h2_primephase29_ftransparent_original_sft.cjs
 *
 * No network, package installation, or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const source = gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const parsed = [];
const singleton = new Set();
let wordStart = -1;
for (const ch of transcription) {
  if (parsed.length === source.length) break;
  if (alphabet.has(ch)) {
    if (wordStart < 0) wordStart = parsed.length;
    parsed.push(alphabet.get(ch));
  } else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && wordStart >= 0) {
    if (parsed.length - wordStart === 1) singleton.add(wordStart);
    wordStart = -1;
  }
}
assert.equal(source.length, 12956);
assert.deepEqual(parsed, source);
assert.equal(singleton.size, 83);

const pageStart = [];
let cumulative = 0;
for (const p of gp.pages) {
  pageStart[p.page] = cumulative;
  if (p.page <= 55) cumulative += p.indices.length;
}
assert.equal(cumulative, 12956);
assert.deepEqual(ink.pages.find(p => p.page === 15).red_spans
  .map(x => [x.start, x.length]), [[0, 9], [9, 11]]);
assert.deepEqual([pageStart[15] + 20, pageStart[23]],
  [3623, 5506]);
assert.deepEqual([pageStart[28], pageStart[29]], [6761, 7030]);

const sieve = new Uint8Array(400000);
const key = [];
for (let p = 2; p < sieve.length && key.length < 16000; p++) {
  if (sieve[p]) continue;
  key.push((p - 1) % 29);
  if (p * p < sieve.length) {
    for (let n = p * p; n < sieve.length; n += p) sieve[n] = 1;
  }
}
assert.equal(key.length, 16000);
assert.ok(key.every((v, i) => i + 2 >= key.length ||
  !(v === key[i + 1] && v === key[i + 2])));
const mod = x => ((x % 29) + 29) % 29;
function bitCount(mask) {
  let count = 0;
  for (let x = mask; x; x &= x - 1) count++;
  return count;
}

/**
 * Exhaust all valid ciphertext-equality rejection histories and all
 * possible transparent-F histories. No key, tau, or plaintext is guessed.
 *
 * State: (mask, drift), where mask is the set of <=3 unknown labels
 * tau(A), tau(I), tau(O) at source one-rune words, and drift equals
 * key pointer - startPhase - number of input runes already consumed.
 *
 * @param {number[]} tape - original cipher slice or planted source.
 * @param {number} globalStart - where this slice begins in original LP2.
 * @param {number} startPhase - initial ordinary-prime ordinal, 0..28.
 * @param {{deltas:number[], labels:number[]}|null} oracle
 * @returns {{pass:boolean, firstImpossible:number|null,
 *   terminalStates:number, maxStates:number}}
 */
function inverse(tape, globalStart, startPhase, oracle = null) {
  let states = new Map([[0, new Set([0])]]);
  let oracleMask = 0, maxStates = 1;
  for (let i = 0; i < tape.length; i++) {
    const cipher = tape[i];
    const prior = i ? tape[i - 1] : -1;
    const one = singleton.has(globalStart + i);
    const next = new Map();
    const put = (mask, drift) => {
      let row = next.get(mask);
      if (!row) {
        row = new Set();
        next.set(mask, row);
      }
      row.add(drift);
    };
    if (oracle && one) oracleMask |= 1 << oracle.labels[i];
    for (const [mask, drifts] of states) {
      for (const drift of drifts) {
        const at = startPhase + i + drift;
        if (cipher === 0 && !one) {
          // Literal plaintext F (index 0) is emitted without a key advance.
          put(mask, drift - 1);
        }
        for (let rejected = 0; rejected <= (i ? 2 : 0); rejected++) {
          const candidate = at + rejected;
          if (candidate < 0 || candidate >= key.length) continue;
          const base = mod(cipher - key[candidate]);
          if (rejected >= 1 && mod(base + key[at]) !== prior) continue;
          if (rejected >= 2 && mod(base + key[at + 1]) !== prior) continue;
          const mask2 = one ? (mask | (1 << base)) : mask;
          if (one && bitCount(mask2) > 3) continue;
          put(mask2, drift + rejected);
        }
      }
    }
    states = next;
    const n = [...states.values()].reduce((sum, row) => sum + row.size, 0);
    maxStates = Math.max(maxStates, n);
    if (oracle) {
      assert.ok(states.get(oracleMask)?.has(oracle.deltas[i]),
        'positive hidden-tableau path lost at rune ' + i +
        ', start prime ' + startPhase);
    }
    if (!n) {
      return {pass: false, firstImpossible: globalStart + i,
        terminalStates: 0, maxStates};
    }
  }
  return {pass: true, firstImpossible: null,
    terminalStates: [...states.values()].reduce((s, a) => s + a.size, 0),
    maxStates};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return {
    uniform: () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    }
  };
}

/**
 * Test reversibility on a native GP-language positive, after withholding
 * the complete secret alphabet and all actual prime-pointer movements.
 * @param {number} startPhase
 */
function plantedPositive(startPhase) {
  const random = rng((0x330143af ^ (startPhase * 0x9e3779b9)) >>> 0);
  const shuffle = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = Math.floor(random.uniform() * (i + 1));
    [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
  }
  const plain57 = gp.pages.find(p => p.page === 57).indices;
  assert.equal(plain57.length, 95);
  const text = Array.from({length: 269}, (_, i) =>
    plain57[i % plain57.length]);
  const singletonLocal = [32, 163, 229, 233];
  for (let i = 0; i < singletonLocal.length; i++)
    text[singletonLocal[i]] = [24, 10, 3, 24][i];
  const cipher = [];
  const trueDrift = [];
  const trueLabels = text.map(v => shuffle[v]);
  let pointer = startPhase, previous = -1, literalF = 0, retries = 0;
  for (let i = 0; i < text.length; i++) {
    const plain = text[i];
    let value;
    if (plain === 0) {
      value = 0;
      literalF++;
    } else {
      value = mod(shuffle[plain] + key[pointer]);
      let skips = 0;
      while (value === previous && random.uniform() < 0.81) {
        pointer++;
        skips++;
        retries++;
        assert.ok(skips <= 2, 'three consecutive prime residues identical');
        value = mod(shuffle[plain] + key[pointer]);
      }
      pointer++;
    }
    cipher.push(value);
    trueDrift.push(pointer - startPhase - (i + 1));
    previous = value;
  }
  assert.ok(literalF > 0);
  const decoded = inverse(cipher, pageStart[28], startPhase,
    {deltas: trueDrift, labels: trueLabels});
  assert.equal(decoded.pass, true);
  return {startPhase, literalF, retries,
    terminalStates: decoded.terminalStates,
    trueTableauAndFullHiddenPathRetained: true};
}

const phases = Array.from({length: 29}, (_, i) => i);
const original = phases.map(startPhase => ({
  phase: startPhase,
  blackP15to22: inverse(source.slice(3623, 5506), 3623, startPhase),
  blackP16to22: inverse(source.slice(pageStart[16], 5506),
    pageStart[16], startPhase),
  blackP17to21: inverse(source.slice(pageStart[17], pageStart[22]),
    pageStart[17], startPhase),
  independentP28: inverse(source.slice(pageStart[28], pageStart[29]),
    pageStart[28], startPhase)
}));
for (const row of original) {
  const p = row.phase;
  assert.equal(row.blackP15to22.pass, false);
  assert.equal(row.blackP15to22.firstImpossible,
    p <= 15 ? 4176 : p <= 21 ? 4217 : 4233);
  assert.equal(row.blackP16to22.pass, false);
  assert.equal(row.independentP28.pass, true);
  assert.equal(row.blackP17to21.pass, p >= 6 && p <= 14);
}
assert.equal(original[0].blackP15to22.firstImpossible, 4176);
const positives = [0, 5, 6, 15, 28].map(plantedPositive);

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'Finite 29-prime-phase source-original all-secret model gate; NO original plaintext/key',
  originalSource: '12956 GP29 runes, 2896 source words, 83 singleton words',
  model: 'unknown globally fixed GP29 permutation plus successive-prime-totient additive key, optional legal collision rejects, and authentic literal-plaintext-F bypass',
  phasesTested: 'all starting prime ordinals 0..28 inclusive (prime2 through prime109)',
  startPhaseRejectedAll: {blackP15to22: 29, blackP16to22: 29},
  blackP15to22FirstImpossibleAt: original.map(x =>
    x.blackP15to22.firstImpossible),
  blackP16to22FirstImpossibleAt: original.map(x =>
    x.blackP16to22.firstImpossible),
  independentP17to21SurvivingPhases: original.filter(x =>
    x.blackP17to21.pass).map(x => x.phase),
  independentP28SurvivingPhases: original.filter(x =>
    x.independentP28.pass).map(x => x.phase),
  plantedTrueTableauAndSkipControls: positives,
  scopeLimit: 'Only initial 29 prime ordinals, fixed one secret tau, source singleton A/I/O, original source segmentation; other key origins or architectures remain open'
}, null, 2));
