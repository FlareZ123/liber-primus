'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Five-fold source-locked inverse for an 11-phase ciphertext-autokey
 * additive GP29 cipher with fully secret predecessor-dependent shifts.
 *
 * node sims/lp2_11phase_cprev_additive_holdout_sft.cjs
 *
 * Hypothetical cipher C[i]=(P[i]+K[phase][C[i-1]]) mod29.
 * K has 319 totally secret GP29 values, independently inferred using
 * 80% source pages and never tuned on the 20% held-out pages.
 * Prior for selecting K is native GP English from Kahlil Gibran.
 * Positive synthetic cipher plaintext is held-out Emerson, not Gibran.
 */
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const pages = [];
let offset = 0;
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length === 0) continue;
  pages.push({ page: page.page, offset, c: page.indices });
  offset += page.indices.length;
}
assert.equal(pages.length, 55);
assert.equal(offset, 12956);
const gpTokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const result = [];
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let at = 0; at < word.length;) {
      const match = gpTokens.find(t => word.startsWith(t.s, at));
      assert(match, 'Every letter has a GP rune mapping');
      result.push(match.i);
      at += match.s.length;
    }
  }
  return result;
}
const gibran = gpEncode(fs.readFileSync('resources/control/gibran_prophet_58585.txt', 'utf8'));
const emerson = gpEncode(fs.readFileSync('resources/control/emerson_essays_2944.txt', 'utf8'));
assert.equal(gibran.length, 63114);
assert.ok(emerson.length > 250000);
const prior = Array(29).fill(0.5);
for (const rune of gibran) prior[rune]++;
const nPrior = prior.reduce((a, b) => a + b, 0);
const logPrior = prior.map(n => Math.log(n / nPrior));

const plantedPlain = Array.from({length: 12956}, (_, i) => emerson[(4096 + i) % emerson.length]);

/**
 * True 11-clock GP29 cipher with 319 preexisting fixed secret shifts.
 * All page-initial values are carried literally as decoder initial state.
 * @param {boolean} pageClock
 * @returns {{ page:number, offset:number, c:number[] }[]}
 */
function encryptedPlant(pageClock) {
  return pages.map(p => {
    const c = [plantedPlain[p.offset]];
    for (let j = 1; j < p.c.length; j++) {
      const phase = (pageClock ? j : p.offset + j) % 11;
      const old = c[j - 1];
      const secret = (7 + phase * 13 + old * 17 + phase * old * 3) % 29;
      c.push((plantedPlain[p.offset + j] + secret) % 29);
    }
    assert.equal(c.length, p.c.length);
    return {...p, c};
  });
}

/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const v of values) freq[v]++;
  const n = values.length;
  return freq.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

/**
 * Train 11×29 source-state keys only on pages outside one held-out fold,
 * score full original page ciphertext and independently planted control.
 *
 * @param {{ page:number,offset:number,c:number[] }[]} sourcePages
 * @param {boolean} pageClock
 * @param {number} heldFold
 */
function scoreFold(sourcePages, pageClock, heldFold) {
  const counts = Array.from({ length: 319 }, () => new Int32Array(29));
  for (let i = 0; i < sourcePages.length; i++) {
    const p = sourcePages[i];
    if (i % 5 === heldFold) continue;
    for (let j = 1; j < p.c.length; j++) {
      const phase = (pageClock ? j : p.offset + j) % 11;
      counts[phase * 29 + p.c[j - 1]][p.c[j]]++;
    }
  }
  // Each secret shift is learned as a direct maximum-likelihood
  // cyclic GP alphabet shift. No secret is fitted to held-out runes.
  const keys = counts.map(freq => {
    let best = -Infinity, bestShift = 0;
    for (let shift = 0; shift < 29; shift++) {
      let s = 0;
      for (let cipher = 0; cipher < 29; cipher++) {
        s += freq[cipher] * logPrior[(cipher - shift + 29) % 29];
      }
      if (s > best) {
        best = s;
        bestShift = shift;
      }
    }
    return bestShift;
  });
  const recovered = [];
  const expected = [];
  const unchanged = [];
  let matches = 0;
  let held = 0;
  for (let i = 0; i < sourcePages.length; i++) {
    if (i % 5 !== heldFold) continue;
    const p = sourcePages[i];
    for (let j = 1; j < p.c.length; j++) {
      const phase = (pageClock ? j : p.offset + j) % 11;
      const c = p.c[j];
      const clear = (c - keys[phase * 29 + p.c[j - 1]] + 29) % 29;
      const target = plantedPlain[p.offset + j];
      recovered.push(clear);
      expected.push(target);
      unchanged.push(c);
      if (clear === target) matches++;
      held++;
    }
  }
  const logMean = values => values.reduce((s, v) => s + logPrior[v], 0) / values.length;
  return { n: held,
    decodedIoC: ioc(recovered),
    decodedLog: logMean(recovered),
    ciphertextIoC: ioc(unchanged),
    ciphertextLog: logMean(unchanged),
    expectedIoC: ioc(expected),
    expectedLog: logMean(expected),
    plantExact: matches,
    populatedStates: counts.filter(c => c.some(x => x !== 0)).length,
    firstDecoded: recovered.slice(0, 28).map(x => corpus.translit[x]).join('-')
  };
}

/** @param {Array<{n:number,decodedIoC:number,decodedLog:number,ciphertextIoC:number,ciphertextLog:number,expectedIoC:number,expectedLog:number,plantExact:number,populatedStates:number}>} folds */
function aggregate(folds) {
  const n = folds.reduce((s, v) => s + v.n, 0);
  const weighted = field => folds.reduce((s, v) => s + v.n * v[field], 0) / n;
  return {
    runeCount: n,
    decodedIoC: weighted('decodedIoC'),
    decodedLog: weighted('decodedLog'),
    ciphertextIoC: weighted('ciphertextIoC'),
    ciphertextLog: weighted('ciphertextLog'),
    controlTargetIoC: weighted('expectedIoC'),
    controlTargetLog: weighted('expectedLog'),
    plantRecovery: folds.reduce((s, v) => s + v.plantExact, 0) / n,
    minimumPopulatedStates: Math.min(...folds.map(v => v.populatedStates))
  };
}
const models = [];
for (const pageClock of [true, false]) {
  const control = encryptedPlant(pageClock);
  const originalFolds = Array.from({length: 5}, (_, fold) => scoreFold(pages, pageClock, fold));
  const controlFolds = Array.from({length: 5}, (_, fold) => scoreFold(control, pageClock, fold));
  const original = aggregate(originalFolds);
  const plant = aggregate(controlFolds);
  assert.equal(original.runeCount, 12901);
  assert.equal(plant.runeCount, 12901);
  assert.ok(plant.plantRecovery > 0.90, 'Independent English plaintext must recover under authentic planted cipher');
  assert.ok(plant.decodedIoC > 0.055);
  assert.ok(original.decodedIoC < 0.042);
  assert.ok(original.decodedLog < -3.8);
  models.push({phase: pageClock ? 'page-reset' : 'global', original, positiveControl: plant, originalFolds, controlFolds});
}
// Separate source-byte direct consumer: the original table's exact
// row-major zero-address orbit supplies the key, without fitted secrets.
// Source-key variants: 11 addresses / 11 successor bytes, direct/feedback,
// both signs, local/global 11-phase clocks (16 frozen inverse models).
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-grid-256.json', 'utf8'))
  .pages.flatMap(p => p.bytes);
assert.equal(grid.length, 256);
const orbit = [0];
while (!orbit.includes(grid[orbit.at(-1)])) orbit.push(grid[orbit.at(-1)]);
assert.deepEqual(orbit, [0,203,68,199,47,76,114,197,115,247,192]);
assert.equal(grid[orbit.at(-1)], 0);
const directVariants = [];
for (const keyType of ['address','value']) {
  for (const previous of [false,true]) {
    for (const sign of [1,-1]) {
      for (const pageClock of [true,false]) {
        const decoded = [];
        let plantCorrect = 0;
        for (const p of pages) {
          let oldPlant = plantedPlain[p.offset];
          for (let j = 1; j < p.c.length; j++) {
            const phase = (pageClock ? j : p.offset + j) % 11;
            const sourceKey = (keyType === 'address' ? orbit[phase] : grid[orbit[phase]]) % 29;
            const correction = (previous ? p.c[j - 1] : 0) + sign * sourceKey;
            decoded.push((p.c[j] - correction + 87) % 29);
            // Native-plaintext source-keys can be encrypted and recovered.
            const plantKey = (previous ? oldPlant : 0) + sign * sourceKey;
            const encrypted = (plantedPlain[p.offset + j] + plantKey + 87) % 29;
            const recovered = (encrypted - plantKey + 87) % 29;
            if (recovered === plantedPlain[p.offset + j]) plantCorrect++;
            oldPlant = encrypted;
          }
        }
        const score = ioc(decoded);
        assert.equal(plantCorrect, 12901);
        assert.ok(score < 0.04);
        directVariants.push({keyType,feedback:previous,sign,pageClock,decodedIoC:score});
      }
    }
  }
}
assert.equal(directVariants.length, 16);
const maximumDirectIoC = Math.max(...directVariants.map(x => x.decodedIoC));
assert.ok(Math.abs(maximumDirectIoC - 0.03467984273798858) < 1e-12);

console.log(JSON.stringify({
  source: {originalRunes: 12956, eligibleTransitions: 12901, pageCount:55, period:11, secretStates:319},
  language: {prior: 'Gibran Prophet native GP; independent planted plaintext Emerson essays',
    gibranRunes:gibran.length, emersonRunes:emerson.length},
  models,
  directSource11: {maximumIoC: maximumDirectIoC, variants: directVariants}
}, null, 2));
