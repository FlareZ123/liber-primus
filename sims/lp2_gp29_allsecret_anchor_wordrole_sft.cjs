'use strict';

/**
 * Source-native all-841-anchor test for the secret per-rune multiplicative
 * GP29 cipher C[i] = y + a[i]*(P[i] - x) mod 29, with EVERY a[i] any
 * independently secret nonzero value. x,y are fixed GP29 anchor symbols.
 *
 * Necessary and sufficient for a hypothetical secret multiplier per rune:
 *   C[i] === y iff P[i] === x.
 * Thus the entire 2,896 printed-word position mask for rune y must be
 * consistent with the native-English positional profile for rune x.
 *
 * Read-only CommonJS SFT, Windows Node22:
 * node sims/lp2_gp29_allsecret_anchor_wordrole_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const latin = new Map(gp.translit.map((r, i) => [r, i]));
const transcript = read('resources/liber-primus/lp2-transcription.txt')
  .split(/^\s*%\s*$/m).slice(0, 55).join('')
  .replace(/[/\r\n%$&]/g, '');
const originalWords = (transcript.match(/[\u16a0-\u16ff]+/gu) || [])
  .map((word) => [...word].map((r) => glyph.get(r)));
assert.equal(originalWords.length, 2896);
assert.equal(originalWords.flat().length, 12956);
assert.deepEqual(originalWords.flat(), gp.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices));
const maxLength = Math.max(...originalWords.map((w) => w.length));
assert.equal(maxLength, 14);
const lengthCount = new Uint16Array(maxLength + 1);
for (const w of originalWords) lengthCount[w.length]++;

/** The native Cicada TH/NG/ING/IO/EA rune spellings (not ASCII letters).
 * @param {string} token
 * @returns {number[]}
 */
function nativeGP(token) {
  const s = token.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const multis = ['ING', 'TH', 'EO', 'NG', 'OE', 'AE', 'EA', 'IO', 'IA'];
  const out = [];
  for (let j = 0; j < s.length;) {
    const m = multis.find((x) => s.startsWith(x, j));
    const symbol = m === 'ING' ? 'NG' : m === 'IO' ? 'IA' : m || s[j];
    assert.ok(latin.has(symbol), 'unsupported native character ' + symbol);
    out.push(latin.get(symbol));
    j += m ? m.length : 1;
  }
  return out;
}
assert.deepEqual(nativeGP('SING'), [15, 21]);
assert.deepEqual(nativeGP('VISION'), [1, 10, 15, 27, 9]); // UI -> U, IO -> IA
assert.deepEqual(nativeGP('AREA'), [24, 4, 28]);

// Feature[0] total glyph count. [1] at word starts, including singletons.
// [2] at final positions of multisymbol words; [3] internal positions.
// [4] two-or-more in the same word; [5] three-or-more; [6] singleton words.
/** @param {number[]} word @param {number} rune @returns {number[]} */
function wordFeature(word, rune) {
  const out = [0, 0, 0, 0, 0, 0, 0];
  for (let j = 0; j < word.length; j++) {
    if (word[j] !== rune) continue;
    out[0]++;
    if (j === 0) out[1]++;
    else if (j === word.length - 1) out[2]++;
    else out[3]++;
  }
  out[4] = Number(out[0] >= 2);
  out[5] = Number(out[0] >= 3);
  out[6] = word.length === 1 ? out[0] : 0;
  return out;
}
/** @param {number[][]} words */
function corpusFeatures(words) {
  const features = Array.from({length: 29}, () => new Float64Array(7));
  for (const w of words) for (let rune = 0; rune < 29; rune++) {
    const t = wordFeature(w, rune);
    for (let k = 0; k < 7; k++) features[rune][k] += t[k];
  }
  return features;
}
/** @type {{name:string,pools:number[][][],means:Float64Array[],variances:Float64Array[]}[]} */
const references = [];
for (const [name, filename] of [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt']
]) {
  const pools = Array.from({length: maxLength + 1}, () => []);
  for (const raw of read(filename).match(/[A-Za-z]+/g) || []) {
    const codes = nativeGP(raw);
    if (codes.length > 0 && codes.length <= maxLength) pools[codes.length].push(codes);
  }
  const means = Array.from({length: 29}, () => new Float64Array(7));
  const variances = Array.from({length: 29}, () => new Float64Array(7));
  for (let L = 1; L <= maxLength; L++) {
    const pool = pools[L], frequency = lengthCount[L];
    if (!frequency) continue;
    assert.ok(pool.length, name + ' missing GP length ' + L);
    const sum = Array.from({length: 29}, () => new Float64Array(7));
    const sq = Array.from({length: 29}, () => new Float64Array(7));
    for (const word of pool) for (let rune = 0; rune < 29; rune++) {
      const f = wordFeature(word, rune);
      for (let k = 0; k < 7; k++) { sum[rune][k] += f[k]; sq[rune][k] += f[k]*f[k]; }
    }
    for (let rune = 0; rune < 29; rune++) for (let k = 0; k < 7; k++) {
      const expected = sum[rune][k] / pool.length;
      means[rune][k] += frequency * expected;
      variances[rune][k] += frequency * Math.max(0, sq[rune][k]/pool.length-expected*expected);
    }
  }
  references.push({name, pools, means, variances});
}
function scan(words) {
  const observed = corpusFeatures(words);
  const ranked = [];
  for (let x = 0; x < 29; x++) for (let y = 0; y < 29; y++) {
    let minMaxAbsZ = Infinity, bestSource = '', perSource = [];
    for (const ref of references) {
      const z = Array.from({length: 7}, (_, i) =>
        (observed[y][i] - ref.means[x][i]) /
        Math.sqrt(ref.variances[x][i] || 1e-16));
      const maxAbsZ = Math.max(...z.map(Math.abs));
      perSource.push({name: ref.name, maxAbsZ});
      if (maxAbsZ < minMaxAbsZ) { minMaxAbsZ = maxAbsZ; bestSource = ref.name; }
    }
    ranked.push({x, y, minMaxAbsZ, bestSource, perSource});
  }
  ranked.sort((a, b) => a.minMaxAbsZ - b.minMaxAbsZ);
  return ranked;
}
const original = scan(originalWords);
let seed = 0x33015665;
/** @returns {number} uint32 */
function rng() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return seed >>> 0;
}
const mod = (x) => (x % 29 + 29) % 29;
const inverse = Array(29).fill(0);
for (let a = 1; a < 29; a++) for (let inv = 1; inv < 29; inv++)
  if ((a*inv) % 29 === 1) inverse[a] = inv;
assert.ok(inverse.slice(1).every((x) => x !== 0));
/**
 * @param {number[]} plain
 * @param {number} x
 * @param {number} y
 */
function plant(plain, x, y) {
  const multiplier = plain.map(() => 1 + rng() % 28);
  const cipher = plain.map((p, i) => mod(y + multiplier[i]*(p-x)));
  const decoded = cipher.map((c, i) => mod(x + inverse[multiplier[i]] * (c-y)));
  assert.deepEqual(decoded, plain);
  assert.ok(cipher.every((c, i) => (c === y) === (plain[i] === x)));
  return cipher;
}
function nativeWordPlant(ref, x, y) {
  const clear = originalWords.map((w) =>
    ref.pools[w.length][rng() % ref.pools[w.length].length]);
  const restored = plant(clear.flat(), x, y);
  let off = 0;
  return clear.map((w) => {const slice = restored.slice(off, off + w.length); off += w.length; return slice;});
}
const plants = [];
for (const ref of references) for (let x = 0; x < 29; x++) {
  const y = (7*x + 6) % 29;
  const ranks = scan(nativeWordPlant(ref, x, y));
  const trueRank = 1 + ranks.findIndex((r) => r.x === x && r.y === y);
  plants.push({source: ref.name, x: gp.translit[x], y: gp.translit[y],
    rank: trueRank, trueScore: ranks[trueRank-1].minMaxAbsZ,
    bestScore: ranks[0].minMaxAbsZ});
}
const plantedUnder3 = plants.filter((x) => x.trueScore < 3).length;
const plantedRankOne = plants.filter((x) => x.rank === 1).length;
// An iid-flat encryption control has no fixed plaintext anchor; compare
// its accidental best fit after all 841 anchor hypotheses and three corpora.
const negatives = [];
for (let rep = 0; rep < 24; rep++) {
  const nullWords = originalWords.map((w) => Array.from({length:w.length}, () => rng() % 29));
  negatives.push(scan(nullWords)[0].minMaxAbsZ);
}
negatives.sort((a,b) => a-b);
const compact = (r) => ({
  plaintextAnchor: gp.translit[r.x], ciphertextAnchor: gp.translit[r.y],
  minMaxAbsZ: r.minMaxAbsZ, bestSource: r.bestSource,
  perSource: r.perSource
});
assert.equal(originalWords.flat().length, 12956);
assert.ok(original[0].minMaxAbsZ > 3);
assert.equal(original.filter((x) => x.minMaxAbsZ < 3).length, 0);
console.log(JSON.stringify({
  hypothesis: 'C=y+a[i]*(P-x) mod29; a[i] in 1..28 completely arbitrary; anchor (x,y) shared',
  source: {runes:12956,words:2896,crossPageWords:32,wordMax:maxLength,
    sourceNativeSingletonCount:lengthCount[1],sourceGlyphCount:29},
  allSecretOriginal: {allAnchorPairs:841,
    best:original.slice(0, 8).map(compact),
    belowThreshold3:original.filter((x) => x.minMaxAbsZ < 3).length,
    bestScore:original[0].minMaxAbsZ},
  control: {plants: plants.length, plantedUnder3, plantedRankOne,
    trueScoreMedian:plants.map((p) => p.trueScore).sort((a,b)=>a-b)[Math.floor(plants.length/2)],
    trueScoreMax:Math.max(...plants.map((p)=>p.trueScore)),
    trueRankMax:Math.max(...plants.map((p)=>p.rank)),
    topPlants:plants.slice(0,6), outliers:plants.filter((p)=>p.trueScore >=3),
    flatNullDraws:negatives.length,minBestScore:negatives[0],
    medianBestScore:negatives[Math.floor(negatives.length/2)],
    maxBestScore:negatives.at(-1)},
  exactInverse: 'verified for all source-authentic 12956-rune language plants, all 29 plaintext anchors'
},null,2));
