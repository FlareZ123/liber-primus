"use strict";
/**
 * A finite source-led LP2 inverse: 2016 signed image dimensions give the
 * 32x8 grid walker origin; preceding ciphertext-word GP prime sum gives
 * the eight-way direction for the next word. This is a tested hypothesis,
 * never an authenticated historical instruction or plaintext recovery.
 *
 * Node.js 22, CommonJS, no writes or dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
const json = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json").bytes;
const pages = corpus.pages.filter(p => p.page < 56);
const original = pages.flatMap(p => p.indices);
const parse = parseSharedCorpus();
const lookup = new Map(corpus.runes.map((r, i) => [r, i]));
const words = parse.words.map(w => [...w.runes].map(r => lookup.get(r)));
const flattened = words.flat();
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(flattened, original);
assert.equal(grid.length, 256);
assert.equal(corpus.pages[57].indices.length, 95);
const sourceClear = Array.from({length: original.length},
  (_, i) => corpus.pages[57].indices[i % 95]);
const DIR = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const W = 563, H = 569, CUT = 6561;
const mod = (x, n) => ((x % n) + n) % n;
const powers = [], log = new Int8Array(29).fill(-1);
let pow = 1;
for (let i = 0; i < 28; i++) {
  powers.push(pow);
  log[pow] = i;
  pow = pow * 15 % 29;
}
assert.equal(pow, 1);
assert.deepEqual([W % 32, H % 8, (H - W) % 8], [19, 1, 6]);
/** @param {number[]} a */
function ioc(a) {
  const counts = new Uint32Array(29);
  for (const x of a) counts[x]++;
  let matched = 0;
  for (const count of counts) matched += count * (count - 1);
  return matched / (a.length * (a.length - 1));
}
/**
 * Exact causal transform. When encoding, word direction is determined by
 * preceding ENCIPHERED word (not plaintext); original source makes it
 * equally available for inversion. Across each word, read one grid cell
 * per rune by moving in the current eight-way compass direction. The
 * GP28 step/log mode reserves GP rune 28 for ciphertext repeats.
 *
 * @param {number[]} input GP-rune indices of fixed original word lengths
 * @param {{kind:string,reducer:string,sign:number,before:boolean}} setting
 * @param {number[]} bytes 256 grid bytes
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(input, setting, bytes, encrypt) {
  assert.equal(input.length, original.length);
  let r = W % 32, c = H % 8, d = (H - W) % 8, prev = 0, at = 0;
  const out = new Array(input.length);
  for (const word of words) {
    let total = 0;
    for (let j = 0; j < word.length; j++) {
      const [dr, dc] = DIR[d];
      if (setting.before) {
        r = mod(r + dr, 32);
        c = mod(c + dc, 8);
      }
      const byte = bytes[r * 8 + c];
      const raw = setting.reducer === "mod" ? byte % 29 :
        Math.floor(byte * 29 / 256);
      const k = setting.kind === "log" ? raw % 28 : raw;
      const value = input[at];
      let cipher, plain;
      if (encrypt) {
        plain = value;
        if (setting.kind === "log") {
          const diff = plain === 28 ? 0 :
            powers[mod(plain + setting.sign * k, 28)];
          cipher = mod(prev + diff, 29);
        } else {
          cipher = mod(plain + setting.sign * k, 29);
        }
      } else {
        cipher = value;
        if (setting.kind === "log") {
          plain = cipher === prev ? 28 :
            mod(log[mod(cipher - prev, 29)] - setting.sign * k, 28);
        } else {
          plain = mod(cipher - setting.sign * k, 29);
        }
      }
      out[at++] = encrypt ? cipher : plain;
      prev = cipher;
      total += corpus.prime[cipher];
      if (!setting.before) {
        r = mod(r + dr, 32);
        c = mod(c + dc, 8);
      }
    }
    d = total % 8;
  }
  assert.equal(at, input.length);
  return out;
}
const settings = [];
for (const kind of ["direct", "log"])
for (const reducer of ["mod", "scaled"])
for (const sign of [1, -1])
for (const before of [false, true])
  settings.push({ kind, reducer, sign, before });
/** Deterministic original-shape null for grid specificity. */
function shuffledControls(n = 128) {
  let state = 0x3301563;
  const next = () => {
    state ^= state << 13; state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const heldouts = [];
  for (let trial = 0; trial < n; trial++) {
    const bytes = grid.slice();
    for (let i = bytes.length - 1; i > 0; i--) {
      const j = next() % (i + 1);
      [bytes[i], bytes[j]] = [bytes[j], bytes[i]];
    }
    let bestTrain = -Infinity, bestHoldout = null;
    for (const s of settings) {
      const dec = transform(original, s, bytes, false);
      const train = ioc(dec.slice(0, CUT));
      if (train > bestTrain) {
        bestTrain = train;
        bestHoldout = ioc(dec.slice(CUT));
      }
    }
    heldouts.push(bestHoldout);
  }
  return heldouts;
}
function main() {
  const rows = settings.map(setting => {
    const decoded = transform(original, setting, grid, false);
    assert.deepEqual(transform(decoded, setting, grid, true), original);
    const encodedPlant = transform(sourceClear, setting, grid, true);
    assert.deepEqual(transform(encodedPlant, setting, grid, false), sourceClear);
    return {
      setting, trainIoC: ioc(decoded.slice(0, CUT)),
      heldoutIoC: ioc(decoded.slice(CUT)),
      fullIoC: ioc(decoded),
      preview: decoded.slice(0, 60).map(i => corpus.translit[i]).join("")
    };
  }).sort((a, b) => b.trainIoC - a.trainIoC);
  const shuffled = shuffledControls();
  const atLeastOriginal = shuffled.filter(x => x >= rows[0].heldoutIoC).length;
  const result = {
    status: "No authenticated unsolved LP2 plaintext or key",
    clueHypothesis: "2016 source image 563x569 and 32x8 original grid",
    source: {runes: original.length, words: words.length,
      train: CUT, holdout: original.length - CUT,
      startRow: W % 32, startColumn: H % 8, direction: (H - W) % 8},
    models: settings.length,
    exactSourceRoundtrips: settings.length,
    exactSourceMatchedPlantedRoundtrips: settings.length,
    plantedNativeSolvedP57RepeatedIoC: ioc(sourceClear),
    originalCipherIoC: ioc(original),
    bestOriginal: rows[0], second: rows[1],
    wrongGrid: {shuffles: shuffled.length, atLeastOriginal,
      plusOneTail: (atLeastOriginal + 1) / (shuffled.length + 1),
      averageHeldout: shuffled.reduce((a,b)=>a+b,0) / shuffled.length}
  };
  assert.ok(result.bestOriginal.heldoutIoC < 0.036);
  assert.equal(result.wrongGrid.atLeastOriginal, 92);
  assert.ok(result.plantedNativeSolvedP57RepeatedIoC > 0.07);
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) main();
module.exports = {transform, shuffledControls, ioc, main};
