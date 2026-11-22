'use strict';

/**
 * Exact all-secret GP29 word-interior top-nine concentration capacity
 * for previous-ciphertext feedback plus a public phase clock.
 *
 * The author-visible word boundaries and native-GP spellings are fixed.
 * Any secret statewise bijection is covered, including non-affine 29! rows.
 * Windows Node 22 CommonJS SFT, read-only, no third-party packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
/** @param {string} rel @returns {string} */
const read = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length)
  .map((p) => p.indices);
const ciphertext = originalPages.flat();
const parsed = parseLP2Words(read('resources/liber-primus/lp2-transcription.txt'));
assert.equal(originalPages.length, 55);
assert.equal(ciphertext.length, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, 12956);
const lengths = parsed.words.map((word) => word.length);
const roles = [];
for (const len of lengths) {
  for (let pos = 0; pos < len; pos++) {
    roles.push(len === 1 ? 3 : pos === 0 ? 0 : pos === len - 1 ? 2 : 1);
  }
}
assert.deepEqual([0, 1, 2, 3].map((r) =>
  roles.filter((x) => x === r).length), [2813, 7247, 2813, 83]);

/**
 * Exact max top-nine frequency among source-word-interior plaintext runes,
 * for arbitrary secret GP29 permutation at each (phase,previous-C) state.
 * Each original physical page's first glyph is an unconstrained IV.
 * @param {number[]} originalCipher
 * @param {number} period
 * @param {'page'|'global'} clock
 * @returns {{maximum:number,free:number,analyzed:number,rows:number,
 *   histograms:Uint16Array[]}}
 */
function capacity(originalCipher, period, clock) {
  const histograms = Array.from({length: period * 29},
    () => new Uint16Array(29));
  let free = 0;
  let analyzed = 0;
  let offset = 0;
  for (const page of originalPages) {
    free += Number(roles[offset] === 1);
    for (let i = 1; i < page.length; i++) {
      if (roles[offset + i] !== 1) continue;
      const phase = (clock === 'page' ? i : offset + i) % period;
      const state = 29 * phase + originalCipher[offset + i - 1];
      histograms[state][originalCipher[offset + i]]++;
      analyzed++;
    }
    offset += page.length;
  }
  let maximum = free;
  for (const row of histograms) {
    const ordered = [...row].sort((a, b) => b - a);
    for (let r = 0; r < 9; r++) maximum += ordered[r];
  }
  assert.equal(free, 23);
  assert.equal(analyzed, 7224);
  return {maximum, free, analyzed,
    rows: histograms.filter((row) => row.some((n) => n)).length,
    histograms};
}

/**
 * Rebuild the maximum-attaining all-secret GP29 inverse. A state row
 * maps its nine most frequent observed interior glyphs to 0..8,
 * and all remaining glyphs bijectively to 9..28. The code replays
 * the entire ORIGINAL ciphertext, not only its interior subset.
 * @param {number} period
 * @param {'page'|'global'} clock
 * @param {ReturnType<typeof capacity>} model
 */
function checkAchievableOriginal(period, clock, model) {
  const inverseRows = model.histograms.map((row) => {
    const order = Array.from({length: 29}, (_, i) => i)
      .sort((a, b) => row[b] - row[a] || a - b);
    const inverse = new Uint8Array(29);
    order.forEach((glyph, rank) => { inverse[glyph] = rank; });
    assert.deepEqual([...inverse].sort((a, b) => a - b),
      Array.from({length: 29}, (_, i) => i));
    return inverse;
  });
  const plaintext = [];
  let offset = 0;
  for (const page of originalPages) {
    // Page initial ciphertext is a public unmodeled IV; set its plaintext
    // to top-ranked glyph zero only to obtain a generous exact bound.
    plaintext.push(0);
    for (let i = 1; i < page.length; i++) {
      const phase = (clock === 'page' ? i : offset + i) % period;
      const state = 29 * phase + ciphertext[offset + i - 1];
      const p = inverseRows[state][ciphertext[offset + i]];
      plaintext.push(p);
      const forward = inverseRows[state].indexOf(p);
      assert.equal(forward, ciphertext[offset + i]);
    }
    offset += page.length;
  }
  assert.equal(plaintext.length, 12956);
  const topNine = new Array(29).fill(0);
  for (let i = 0; i < plaintext.length; i++) {
    if (roles[i] === 1) topNine[plaintext[i]]++;
  }
  const observedMax = topNine.sort((a, b) => b - a)
    .slice(0, 9).reduce((a, b) => a + b, 0);
  assert.equal(observedMax, model.maximum,
    'maximum attained by a full original ciphertext inverse');
}

/** @type {{rune:string,value:number}[]} */
const runeTokens = [
  {rune: 'ING', value: 21},
  {rune: 'IO', value: 27},
  ...corpus.translit.map((rune, value) => ({rune, value})),
].sort((a, b) => b.rune.length - a.rune.length);

/** @param {string} word @returns {number[]} */
function nativeGP(word) {
  const out = [];
  for (let pos = 0; pos < word.length;) {
    const t = runeTokens.find((x) => word.startsWith(x.rune, pos));
    assert.ok(t, 'source-native GP orthography must cover every letter');
    out.push(t.value);
    pos += t.rune.length;
  }
  return out;
}

/** @param {string} content @returns {number[][][]} */
function donorPools(content) {
  const normalized = content.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const pools = Array.from({length: 15}, () => []);
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    const w = nativeGP(word);
    if (w.length <= 14) pools[w.length].push(w);
  }
  for (const len of new Set(lengths)) assert.ok(pools[len].length);
  return pools;
}
const sourceNames = ['Gibran', 'Shakespeare', 'Emerson'];
const sourceFiles = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
];
const sources = sourceFiles.map((f) => donorPools(read(f)));
let seed = 0x3301b11;
/** @returns {number} Fixed xorshift32 stream. */
function draw() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

/** @param {number[][][]} pools @returns {number[]} */
function sourceBook(pools) {
  return lengths.flatMap((len) => {
    const pool = pools[len];
    return pool[draw() % pool.length];
  });
}

/** @param {number[]} plain @returns {number} */
function topNineInterior(plain) {
  assert.equal(plain.length, 12956);
  const histogram = new Uint16Array(29);
  for (let i = 0; i < plain.length; i++) {
    if (roles[i] === 1) histogram[plain[i]]++;
  }
  return [...histogram].sort((a, b) => b - a).slice(0, 9)
    .reduce((a, b) => a + b, 0);
}

/**
 * Sample native GP whole words with source-preserved positions, without any
 * model-dependent secret selection. This is a finite donor-register survey.
 * @returns {{name:string,min:number,max:number,atMost:number[]}[]}
 */
function sourceSurvey() {
  return sources.map((pools, i) => {
    let minimum = Infinity;
    let maximum = -Infinity;
    const eligible = [0, 0, 0];
    const benchmarks = [5170, 5246, 5261];
    for (let sample = 0; sample < 6000; sample++) {
      const count = new Uint16Array(29);
      for (const len of lengths) {
        const pool = pools[len];
        const w = pool[draw() % pool.length];
        for (let pos = 1; pos < len - 1; pos++) count[w[pos]]++;
      }
      const top = [...count].sort((a, b) => b - a).slice(0, 9)
        .reduce((a, b) => a + b, 0);
      minimum = Math.min(minimum, top);
      maximum = Math.max(maximum, top);
      benchmarks.forEach((bound, b) => { eligible[b] += Number(top <= bound); });
    }
    return {name: sourceNames[i], samples: 6000, min: minimum, max: maximum,
      atMostPhase11Page5170: eligible[0],
      atMostPhase12Page5246: eligible[1],
      atMostPhase12Global5261: eligible[2]};
  });
}

/** @param {number} period @returns {number[][]} */
function randomSecret(period) {
  const map = Array.from({length: 29 * period},
    () => Array.from({length: 29}, (_, i) => i));
  for (const row of map) {
    for (let i = 28; i > 0; i--) {
      const j = draw() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    assert.deepEqual([...row].sort((a, b) => a - b),
      Array.from({length: 29}, (_, i) => i));
  }
  return map;
}

/**
 * Test real invertible cipher behavior on authentic source-GP planted words.
 * @param {number[]} plain
 * @param {number} period
 * @param {'page'|'global'} clock
 * @param {number[][]} mapping
 * @returns {number[]}
 */
function encryptPlant(plain, period, clock, mapping) {
  const output = [];
  let offset = 0;
  for (const page of originalPages) {
    output.push(page[0]);
    for (let i = 1; i < page.length; i++) {
      const t = (clock === 'page' ? i : offset + i) % period;
      const row = mapping[29 * t + output[output.length - 1]];
      const p = plain[offset + i];
      const c = row[p];
      assert.equal(row.indexOf(c), p, 'true plaintext inverse');
      output.push(c);
    }
    offset += page.length;
  }
  assert.equal(output.length, 12956);
  return output;
}
const scenarios = [];
for (const period of [11, 12, 13]) {
  for (const clock of ['page', 'global']) {
    const model = capacity(ciphertext, period, clock);
    const frozenMax = {
      11: {page: 5170, global: 5104},
      12: {page: 5246, global: 5261},
      13: {page: 5380, global: 5439},
    }[period][clock];
    assert.equal(model.maximum, frozenMax);
    checkAchievableOriginal(period, clock, model);
    scenarios.push({period, clock, interior: 7247, publicStateRows: 29 * period,
      observedRows: model.rows, exactAllSecretTopNineMaximum: model.maximum});
  }
}
const donors = sourceSurvey();
assert.ok(donors.every((x) => x.atMostPhase11Page5170 === 0));
assert.ok(donors.every((x) => x.atMostPhase12Page5246 === 0));
for (const period of [11, 12, 13]) {
  for (const clock of ['page', 'global']) {
    const secret = randomSecret(period);
    for (let source = 0; source < sources.length; source++) {
      const plain = sourceBook(sources[source]);
      const encrypted = encryptPlant(plain, period, clock, secret);
      const limit = capacity(encrypted, period, clock);
      assert.ok(topNineInterior(plain) <= limit.maximum,
        'all-secret capacity must accept genuine reversible GP29 plants');
    }
  }
}
console.log(JSON.stringify({
  status: 'Source-original complete all-secret word-interior top-nine bound',
  original: {runes: ciphertext.length, words: lengths.length,
    joinedCrossPageWords: 32, strictInteriorPositions: 7247,
    sourceNativeGrammar: 'ING->NG, IO->IA, QU->CW, V->U'},
  sourceDonorSamplesEach: 6000,
  sourceDonors: donors,
  scenarios,
  originalAttainment: 'full 12,956-rune inverse and forward replay certified',
  nativeCipherPositives: 18,
  limitations: 'conditional on printed-word preservation and source-GP English register',
}, null, 2));
