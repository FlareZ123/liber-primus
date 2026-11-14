'use strict';

/**
 * Original LP2: exact all-secret period-five additive GP29 cipher exclusion.
 * Run on Windows with: node sims/lp2_allsecret_period5_ftransparent_exact_sft.cjs
 *
 * Model: C = P + key[phase] (mod 29) for P != F (index 0), consuming
 * one key phase. Plaintext F emits ciphertext F and consumes no phase.
 * When ciphertext is F, both historically legal interpretations remain.
 * A single secret five-rune key is shared by all pages, while each page
 * independently chooses any starting key phase and any legal F path.
 *
 * No English, known plaintext, fixed key, phase or language scorer is used
 * to reject the original ciphertext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8',
));

const PERIOD = 5;
const ALL_STATES = (1 << PERIOD) - 1;
const pages = corpus.pages.filter(
  (page) => page.page <= 55 && page.indices.length > 0,
);
const original = pages.flatMap((page) => page.indices);

assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(corpus.pages[57].indices.length, 95);
for (const rune of original) assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);

/**
 * Overapproximated necessary condition for key[any phase] = value.
 * Every ciphertext F may freely skip OR consume, even if a real key would
 * forbid one of those options. Every other key position is unconstrained.
 * The tested nonzero value is assigned to phase zero without loss of
 * generality because the initial phase is arbitrary.
 *
 * @param {readonly number[]} ciphertext
 * @param {number} value - Hypothetical nonzero key digit.
 * @returns {number} First impossible source offset, or -1 when feasible.
 */
function failForSingleDigit(ciphertext, value) {
  let states = ALL_STATES;
  for (let i = 0; i < ciphertext.length; i++) {
    const cipher = ciphertext[i];
    let next = 0;
    for (let phase = 0; phase < PERIOD; phase++) {
      if ((states & (1 << phase)) === 0) continue;
      if (cipher === 0) {
        next |= (1 << phase) | (1 << ((phase + 1) % PERIOD));
      } else if (phase !== 0 || cipher !== value) {
        next |= 1 << ((phase + 1) % PERIOD);
      }
    }
    states = next;
    if (states === 0) return i;
  }
  return -1;
}

/**
 * Exact decoder-feasibility DP for the stated historical plaintext-F rule.
 * Phase is key-index at next rune. A source cipher F may be a literal F
 * (clock unchanged); it may also encrypt non-F when key[phase] != 0.
 *
 * @param {readonly number[]} ciphertext
 * @param {readonly number[]} key - Five effective additive GP29 key values.
 * @returns {number} First source offset at which all phases fail, or -1.
 */
function firstImpossible(ciphertext, key) {
  let states = ALL_STATES;
  for (let i = 0; i < ciphertext.length; i++) {
    const cipher = ciphertext[i];
    let next = 0;
    for (let phase = 0; phase < PERIOD; phase++) {
      if ((states & (1 << phase)) === 0) continue;
      const shift = key[phase];
      if (cipher === 0) {
        next |= 1 << phase; // Literal plaintext F: key clock does not move.
        if (shift !== 0) next |= 1 << ((phase + 1) % PERIOD);
      } else if (cipher !== shift) {
        // A non-F ciphertext cannot decode to nontransparent plaintext F.
        next |= 1 << ((phase + 1) % PERIOD);
      }
    }
    states = next;
    if (states === 0) return i;
  }
  return -1;
}

/**
 * Encrypt a known original clear-GP plant under the exact source F policy.
 *
 * @param {readonly number[]} plaintext
 * @param {readonly number[]} key
 * @param {number} startPhase
 * @returns {{ciphertext: number[], usedKeys: number}}
 */
function encryptPlant(plaintext, key, startPhase) {
  let phase = startPhase;
  let usedKeys = 0;
  const ciphertext = plaintext.map((rune) => {
    if (rune === 0) return 0;
    const cipher = (rune + key[phase]) % 29;
    phase = (phase + 1) % PERIOD;
    usedKeys++;
    return cipher;
  });
  return {ciphertext, usedKeys};
}

// Positive model plant uses actual unencrypted LP2 p57 runes and a
// nontrivial key. It must remain admissible with a hidden initial phase.
const clear = corpus.pages[57].indices;
const plantKey = [17, 6, 24, 0, 12];
const plant = encryptPlant(clear, plantKey, 3);
assert.ok(clear.some((rune) => rune === 0), 'Plant must exercise literal F');
assert.ok(plant.usedKeys < clear.length, 'Literal F must skip key positions');
assert.equal(firstImpossible(plant.ciphertext, plantKey), -1);
assert.equal(firstImpossible(clear, [0, 0, 0, 0, 0]), -1);

// Every nonzero value vetoed by even ONE source page is impossible at
// EVERY key phase for a common five-digit key; page phases are free.
const witnessByValue = [];
const choices = [0];
for (let value = 1; value <= 28; value++) {
  let witness = null;
  for (const page of pages) {
    const at = failForSingleDigit(page.indices, value);
    if (at >= 0) {
      witness = {page: page.page, localOffset: at};
      break;
    }
  }
  if (witness) witnessByValue.push({value, ...witness});
  else choices.push(value);
}
assert.deepEqual(choices, [0, 6, 12, 16, 17, 24, 26]);
assert.equal(witnessByValue.length, 22);

// Finish with the EXACT historical F-clock, allowing five initial phases
// independently on EVERY physical page. Only 7^5=16807 keys remain.
const candidates = choices.length ** PERIOD;
const rejectedAtPage = new Map();
const survivors = [];
for (let id = 0; id < candidates; id++) {
  let work = id;
  const key = [];
  for (let slot = 0; slot < PERIOD; slot++) {
    key.push(choices[work % choices.length]);
    work = Math.floor(work / choices.length);
  }
  let failed = false;
  for (const page of pages) {
    if (firstImpossible(page.indices, key) >= 0) {
      rejectedAtPage.set(
        page.page, (rejectedAtPage.get(page.page) ?? 0) + 1,
      );
      failed = true;
      break;
    }
  }
  if (!failed) survivors.push(key);
}
assert.equal(candidates, 16807);
assert.deepEqual(survivors, [[0, 0, 0, 0, 0]]);
assert.equal(
  [...rejectedAtPage.values()].reduce((total, count) => total + count, 0),
  candidates - 1,
);
assert.equal(
  [...rejectedAtPage.keys()].every((page) => page <= 15), true,
  'Original pp0-15 alone must reject every nonzero common five-rune key',
);

const result = {
  model: 'shared period-five GP29 additive key with plaintext-F passthrough',
  originalRunePages: pages.length,
  originalRunes: original.length,
  exclusionsBySingleValueRelaxation: witnessByValue.length,
  remainingPerKeyPosition: choices,
  exactKeysTested: candidates,
  originalKeysRemaining: survivors,
  firstRejectingPageCounts: Object.fromEntries(rejectedAtPage),
  sourceNativePositivePlant: {
    runes: clear.length,
    consumedKeys: plant.usedKeys,
    hiddenInitialPhaseRecovered: true,
  },
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
