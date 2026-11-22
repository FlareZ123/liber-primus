"use strict";

/**
 * Source-exact seven-tree-page common additive GP29 pad test.
 * Shared botanical tree drawing on physical LP2 p8..p14 motivates a
 * possible same-position key reuse. If C_j[i]=(P_j[i]+K[i]) mod29 on
 * each page, every difference C_a[i]-C_b[i] equals P_a[i]-P_b[i].
 * This is a key-INDEPENDENT necessary observable; failure does not
 * exclude unaligned, changing, nonadditive or non-native plaintext.
 *
 * SFT: node sims/lp2_tree7_sharedpad_original_sft.cjs
 * Windows 11; Node.js >=20; CommonJS; no packages or network required.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** Exact solved-source-calibrated whole-word GP spelling; ING=21 and IO=27.
 * @param {string} input @returns {number[]} */
function nativeGP(input) {
  const cleaned = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (const word of cleaned.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        output.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        output.push(27);
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "missing original GP token");
        output.push(token.i);
        i += token.s.length;
      }
    }
  }
  return output;
}

const solvedIndices = solved.sections.flatMap(s =>
  [...s.source_text].map(c => gp.runes.indexOf(c)).filter(i => i >= 0));
assert.equal(solvedIndices.length, 2979);
const counts = new Int32Array(29);
for (const i of solvedIndices) counts[i]++;
const frequency = Array.from(counts, n => n / solvedIndices.length);
const differenceProbability = Array.from({ length: 29 }, (_, delta) =>
  frequency.reduce((sum, p, i) =>
    sum + p * frequency[(i - delta + 29) % 29], 0));
const logOdds = differenceProbability.map(p => Math.log(29 * p));
assert(logOdds.every(x => Number.isFinite(x)));

/** @param {number[][]} pages
 * @returns {{llr:number,hits:number,n:number,zeroRate:number}} */
function score(pages) {
  let llr = 0, hits = 0, n = 0;
  for (let a = 0; a < pages.length; a++) {
    for (let b = a + 1; b < pages.length; b++) {
      const length = Math.min(pages[a].length, pages[b].length);
      for (let i = 0; i < length; i++) {
        const difference = (pages[a][i] - pages[b][i] + 29) % 29;
        llr += logOdds[difference];
        hits += Number(difference === 0);
        n++;
      }
    }
  }
  return { llr, hits, n, zeroRate: hits / n };
}

const donors = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 62492],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 217106],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 321327]
].map(([name, filename, expected]) => {
  const values = nativeGP(read(filename));
  assert.equal(values.length, expected, name);
  return { name, values };
});
const originalNumbers = [8, 9, 10, 11, 12, 13, 14];
const original = originalNumbers.map(page => gp.pages[page].indices);
assert.deepEqual(original.map(p => p.length),
  [255, 268, 263, 273, 261, 272, 137]);

const setups = [
  {name: "all-seven-page-starts", pages: [8,9,10,11,12,13,14],
    offsets: [0,0,0,0,0,0,0], hits:178, n:4738,
    llr:-115.68162880802703},
  {name: "p8-after-12-red", pages: [8,9,10,11,12,13,14],
    offsets: [12,0,0,0,0,0,0], hits:159, n:4678,
    llr:-92.53476735524015},
  {name: "five-long-continuation-pages", pages: [9,10,11,12,13],
    offsets: [0,0,0,0,0], hits:93, n:2641,
    llr:-58.216372453116705},
  {name: "six-continuation-pages", pages: [9,10,11,12,13,14],
    offsets: [0,0,0,0,0,0], hits:119, n:3326,
    llr:-69.05152630110967}
];

/** Deterministic xorshift for test generation (not an encryption PRNG).
 * @param {number} seed @returns {()=>number} */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

const summaries = [];
for (const setup of setups) {
  const source = setup.pages.map((page, i) =>
    gp.pages[page].indices.slice(setup.offsets[i]));
  const measured = score(source);
  assert.deepEqual([measured.hits, measured.n], [setup.hits, setup.n]);
  assert(Math.abs(measured.llr - setup.llr) < 1e-8);
  const trial = [];
  for (let t = 0; t < 300; t++) {
    // No page within one trial repeats a donor region. These placements
    // overlap between trials; 300 is empirical sensitivity, not 300
    // independent hypothesis tests or a formal p-value.
    const native = setup.pages.map((_, i) => {
      const values = donors[i % 3].values;
      const length = source[i].length;
      const start = (t * 301 + i * 1703) % (values.length - length - 1);
      return values.slice(start, start + length);
    });
    trial.push(score(native).llr);
  }
  trial.sort((a, b) => a - b);
  assert(trial[0] > measured.llr, setup.name);
  summaries.push({name:setup.name, original:measured,
    controlCount:trial.length, controlMinimum:trial[0],
    controlMedian:trial[150], controlsAtOrBelowOriginal:
      trial.filter(v => v <= measured.llr).length});
}
// Entire 95-rune clear p57 is an authentic orthographic positive.
// The original p56 (85 runes) is encrypted, and is not misused as text.
const p57 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("### 57\n")[1].trim();
assert.deepEqual(nativeGP(p57), gp.pages[57].indices);

// Same-pad planted construction, with seven independent native-English
// plaintexts and one COMMON secret key. The delta statistic must match.
const plant = original.map((page, i) => {
  const values = donors[i % 3].values;
  return values.slice(i * 1703, i * 1703 + page.length);
});
const seed = random(3301);
const pad = Array.from({length: 273}, () => Math.floor(seed() * 29));
const encrypted = plant.map(row => row.map((x, i) => (x + pad[i]) % 29));
assert.deepEqual(encrypted.map(row => row.map((x, i) =>
  (x - pad[i] + 29) % 29)), plant);
assert.deepEqual(score(encrypted), score(plant));
assert(score(encrypted).llr > summaries[0].original.llr);

console.log(JSON.stringify({
  status: "Aligned seven-tree-page additive shared GP29 stream rejected for source-native English; no unknown plaintext or key recovered",
  originalPhysicalPages: originalNumbers,
  printedPageRuneCounts: original.map(v => v.length),
  nativeGPProfileRunes: solvedIndices.length,
  independentSolvedP57PositiveRunes: gp.pages[57].indices.length,
  nativeDonorRunes: donors.map(d => [d.name, d.values.length]),
  setups: summaries,
  plantedCommonPadPass: true
}, null, 2));
