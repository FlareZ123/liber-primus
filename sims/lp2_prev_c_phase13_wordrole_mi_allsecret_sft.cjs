'use strict';

/**
 * Key-independent word-role mutual-information test for arbitrary secret
 * GP29 substitutions indexed by previous ciphertext and a 13-rune clock.
 * 2014 source rationale: original 13-dot marker; frozen word starts, ends
 * and physical pages. Every mapping is a full, reversible 29-way alphabet.
 *
 * SFT: node sims/lp2_prev_c_phase13_wordrole_mi_allsecret_sft.cjs
 * Windows Node.js 22, CommonJS, read only, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length)
  .map((page) => page.indices);
const ciphertext = pages.flat();
assert.equal(pages.length, 55);
assert.equal(ciphertext.length, 12956);
const parsed = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, ciphertext.length);
assert.equal(parsed.crossPageWords, 32);
const lengths = parsed.words.map((word) => word.length);
const roles = [];
// The four source-visible, disjoint roles: initial, inner, final, singleton.
for (const len of lengths) {
  for (let pos = 0; pos < len; pos++) {
    roles.push(len === 1 ? 3 : pos === 0 ? 0 : pos === len - 1 ? 2 : 1);
  }
}
assert.equal(roles.length, ciphertext.length);
const runeTokens = [
  {rune: 'ING', value: 21},
  {rune: 'IO', value: 27},
  ...corpus.translit.map((rune, value) => ({rune, value})),
].sort((a, b) => b.rune.length - a.rune.length);

/** @param {string} raw @returns {string[]} */
function donorWords(raw) {
  const normalized = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  return normalized.match(/[A-Z]+/g) || [];
}

/** @param {string} word @returns {number[]} */
function nativeGPWord(word) {
  const output = [];
  for (let pos = 0; pos < word.length;) {
    const token = runeTokens.find((part) => word.startsWith(part.rune, pos));
    assert.ok(token, 'every normalized donor letter has GP representation');
    output.push(token.value);
    pos += token.rune.length;
  }
  return output;
}

/** @param {string} raw @returns {number[][][]} */
function sourcePools(raw) {
  const pools = Array.from({length: 15}, () => []);
  for (const word of donorWords(raw)) {
    const gp = nativeGPWord(word);
    if (gp.length <= 14) pools[gp.length].push(gp);
  }
  for (const len of new Set(lengths)) {
    assert.ok(pools[len].length, 'donor covers every original GP word length');
  }
  return pools;
}
const names = ['Gibran', 'Shakespeare', 'Emerson'];
const files = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
];
const donors = files.map((file) => sourcePools(read(file)));
let seed = 0x3301a44;
/** @returns {number} Deterministic xorshift32 bit pattern. */
function draw() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @param {number[][][]} pools @returns {number[]} */
function sampleNativeGP(pools) {
  const output = [];
  for (const len of lengths) {
    const pool = pools[len];
    output.push(...pool[draw() % pool.length]);
  }
  assert.equal(output.length, ciphertext.length);
  return output;
}

/**
 * Secret GP29 substitution row for each public (phase,previous-C) state.
 * @param {number} phases
 * @returns {number[][]}
 */
function makeMaps(phases) {
  const maps = Array.from({length: 29 * phases}, () =>
    Array.from({length: 29}, (_, i) => i));
  for (const row of maps) {
    for (let i = 28; i > 0; i--) {
      const j = draw() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    assert.deepEqual([...row].sort((a, b) => a - b),
      Array.from({length: 29}, (_, i) => i));
  }
  return maps;
}

/**
 * Original page first runes are arbitrary public IVs and have no decoder.
 * @param {number[]} plaintext
 * @param {number} phases
 * @param {number[][]} maps
 * @param {'page'|'global'} clock
 * @returns {number[]}
 */
function encrypt(plaintext, phases, maps, clock) {
  const output = [];
  let offset = 0;
  for (const page of pages) {
    output.push(page[0]);
    for (let i = 1; i < page.length; i++) {
      const t = (clock === 'page' ? i : offset + i) % phases;
      const previous = output[output.length - 1];
      output.push(maps[29 * t + previous][plaintext[offset + i]]);
    }
    offset += page.length;
  }
  return output;
}

/**
 * Empirical I(glyph; printed-word-role | prior ciphertext, phase), nats/rune.
 * Unknown 29! permutations for each row can rearrange symbol-column labels
 * only and therefore preserve this statistic EXACTLY under decryption.
 * @param {number[]} observedCipher State variable for previous ciphertext
 * @param {number} phases
 * @param {'page'|'global'} clock
 * @param {number[]} [payload] Current observed cipher or true GP plaintext
 * @returns {number}
 */
function mutualInfo(observedCipher, phases, clock, payload = observedCipher) {
  const tables = Array.from({length: 29 * phases},
    () => new Uint16Array(4 * 29));
  let offset = 0;
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      const t = (clock === 'page' ? i : offset + i) % phases;
      const state = 29 * t + observedCipher[offset + i - 1];
      tables[state][29 * roles[offset + i] + payload[offset + i]]++;
    }
    offset += page.length;
  }
  let term = 0;
  let totalObserved = 0;
  for (const row of tables) {
    const roleTotals = [0, 0, 0, 0];
    const symbolTotals = new Uint16Array(29);
    let n = 0;
    for (let role = 0; role < 4; role++) {
      for (let symbol = 0; symbol < 29; symbol++) {
        const count = row[role * 29 + symbol];
        roleTotals[role] += count;
        symbolTotals[symbol] += count;
        n += count;
      }
    }
    totalObserved += n;
    for (let role = 0; role < 4; role++) {
      for (let symbol = 0; symbol < 29; symbol++) {
        const count = row[role * 29 + symbol];
        if (count) {
          term += count * Math.log(
            count * n / (roleTotals[role] * symbolTotals[symbol]));
        }
      }
    }
  }
  assert.equal(totalObserved, 12901);
  return term / totalObserved;
}

/** @param {number[]} values @param {number} original @returns {object} */
function summary(values, original) {
  values.sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    min: Number(values[0].toFixed(9)),
    mean: Number(mean.toFixed(9)),
    max: Number(values[values.length - 1].toFixed(9)),
    below_or_equal_original: values.filter((x) => x <= original).length,
    above_or_equal_original: values.filter((x) => x >= original).length,
    samples: values.length,
  };
}
const phases = 13;
const output = [];
for (const clock of ['page', 'global']) {
  const original = mutualInfo(ciphertext, phases, clock);
  const expected = clock === 'page'
    ? 0.6074199338130647 : 0.611926555;
  assert.ok(Math.abs(original - expected) < 1e-9,
    'canonical original roles and cipher length unchanged');
  const maps = makeMaps(phases);
  const nativeResults = [];
  for (let source = 0; source < donors.length; source++) {
    const nativeValues = [];
    for (let trial = 0; trial < 125; trial++) {
      const plaintext = sampleNativeGP(donors[source]);
      const encrypted = encrypt(plaintext, phases, maps, clock);
      // The statewise unknown 29! tables are EXACTLY bijective, so their
      // word-role MI is invariant, including all author-defined exceptions.
      const ciphertextMI = mutualInfo(encrypted, phases, clock);
      const plaintextMI = mutualInfo(encrypted, phases, clock, plaintext);
      assert.ok(Math.abs(ciphertextMI - plaintextMI) < 1e-11);
      // Exact original-length inverse and forward replay at all 12,901
      // non-IV sites, using true seeded permutation tables for the plant.
      let offset = 0;
      for (const page of pages) {
        for (let i = 1; i < page.length; i++) {
          const t = (clock === 'page' ? i : offset + i) % phases;
          const row = maps[29 * t + encrypted[offset + i - 1]];
          const cipher = encrypted[offset + i];
          assert.equal(row[plaintext[offset + i]], cipher);
          assert.equal(row.indexOf(cipher), plaintext[offset + i]);
        }
        offset += page.length;
      }
      nativeValues.push(ciphertextMI);
    }
    nativeResults.push({donor: names[source],
      ...summary(nativeValues, original)});
    assert.ok(Math.max(...nativeValues) < original,
      'original excludes every source-native positive control');
  }
  // This null retains the source's per-page ciphertext multisets and almost
  // all original adjacent ciphertext transitions. It only rotates each
  // original page relative to its printed word boundaries/phase.
  const nullValues = [];
  for (let trial = 0; trial < 375; trial++) {
    const rotated = pages.flatMap((page) => {
      const shift = draw() % page.length;
      return [...page.slice(shift), ...page.slice(0, shift)];
    });
    nullValues.push(mutualInfo(rotated, phases, clock));
  }
  output.push({
    period: phases,
    clock,
    original_MI_nats_per_rune: Number(original.toFixed(9)),
    nativeControls: nativeResults,
    pageRotationNull: summary(nullValues, original),
  });
}
console.log(JSON.stringify({
  counts: {runes: ciphertext.length, words: parsed.words.length,
    carriedWords: parsed.crossPageWords, analyzedPositions: 12901},
  invariant: 'I(C;word-role|previous-C,phase) == I(P;word-role|previous-C,phase)',
  evidence: 'source-language-conditional negative, not historical cipher attribution',
  results: output,
}, null, 2));
