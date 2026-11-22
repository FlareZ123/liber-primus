"use strict";
/**
 * Original-cipher, all-secret 256-entry word-key × five-phase gate.
 * Source inputs: original LP2 text and GP29 runes, printed p49–51 table.
 * Every byte/table-address keyed phase may use an arbitrary GP29 bijection.
 *
 * Run: node sims/lp2_p50_wordkey256_fivephase_allsecret_sft.cjs
 * Windows Node22/CommonJS, deterministic, zero external dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const sourcePaths = [
  ["SHAKESPEARE", "resources/control/shakespeare_first300k.txt"],
  ["GIBRAN", "resources/control/gibran_prophet_58585.txt"]
];
const runeIndex = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const re = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const sourceBody = transcript.split("%").slice(0, 55).join("%")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const original = (sourceBody.match(re) || [])
  .map(w => Array.from(w, r => runeIndex.get(r)));
assert.equal(original.length, 2896);
assert.equal(original.reduce((sum, w) => sum + w.length, 0), 12956);
assert.equal(grid.bytes.length, 256);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]} */
function encodeNative(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (s.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => s.startsWith(t.s, i));
      assert(token, "no GP transcription token");
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
/** @param {string} text @returns {number[][][]} */
function referencePools(text) {
  const pools = Array.from({length: 64}, () => []);
  for (const token of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = encodeNative(token);
    if (word.length < pools.length) pools[word.length].push(word);
  }
  for (const w of original) assert(pools[w.length].length > 0);
  return pools;
}
let state = 0x6c43aa57 >>> 0;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
/** @param {number[][][]} pools @returns {number[][]} */
function sampleNative(pools) {
  return original.map(w => {
    const pool = pools[w.length];
    return pool[random32() % pool.length];
  });
}
/** @param {number} ordinal @param {"position"|"value"} mode @returns {number} */
function keyId(ordinal, mode) {
  const address = ordinal % 256;
  return mode === "position" ? address : grid.bytes[address];
}
/**
 * An arbitrary secret GP29 bijection under each (key ID, word-relative phase).
 * Collision counts of the output MUST equal those of the plaintext inside
 * every class, regardless of the unknown alphabet permutations.
 *
 * @param {number[][]} words
 * @param {"position"|"value"} mode
 * @param {"direct"|"delta"|"laterPlain"} kind
 * @returns {{matches:number,pairs:number,rate:number,classes:number}}
 */
function collision(words, mode, kind) {
  const classes = new Map();
  for (let w = 0; w < words.length; w++) {
    const key = keyId(w, mode);
    const symbols = words[w];
    for (let j = kind === "direct" ? 0 : 1; j < symbols.length; j++) {
      const value = kind === "direct" || kind === "laterPlain" ? symbols[j]
        : (symbols[j] - symbols[j - 1] + 29) % 29;
      const classId = key * 5 + (j % 5);
      const hist = classes.get(classId) || Array(29).fill(0);
      hist[value]++;
      classes.set(classId, hist);
    }
  }
  let matches = 0, pairs = 0;
  for (const hist of classes.values()) {
    const count = hist.reduce((a, b) => a + b, 0);
    pairs += count * (count - 1) / 2;
    for (const n of hist) matches += n * (n - 1) / 2;
  }
  return {matches, pairs, rate: matches / pairs, classes: classes.size};
}
/**
 * Reversible independently secret bijection positive control, including an
 * unknown first-rune transform for ciphertext-difference feedback.
 *
 * @param {number[][]} plain
 * @param {"position"|"value"} mode
 * @param {"direct"|"delta"|"laterPlain"} kind
 * @returns {number[][]}
 */
function plant(plain, mode, kind) {
  const permutations = new Map(), inverse = new Map();
  function secret(id) {
    if (!permutations.has(id)) {
      const p = Array.from({length: 29}, (_, i) => i);
      for (let i = 28; i > 0; i--) {
        const j = random32() % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
      }
      const inv = Array(29);
      for (let i = 0; i < 29; i++) inv[p[i]] = i;
      permutations.set(id, p);
      inverse.set(id, inv);
    }
    return permutations.get(id);
  }
  const cipher = plain.map((w, wi) => w.map((x, j) => {
    const id = keyId(wi, mode) * 5 + (j % 5);
    const mapped = secret(id)[x];
    if (kind === "direct" || j === 0) return mapped;
    return mapped;
  }));
  if (kind === "delta") {
    for (const w of cipher) {
      for (let j = 1; j < w.length; j++) w[j] = (w[j] + w[j-1]) % 29;
    }
  }
  const decoded = cipher.map((w, wi) => w.map((x, j) => {
    const id = keyId(wi, mode) * 5 + (j % 5);
    const encoded = kind === "direct" || j === 0 ? x
      : (x - w[j-1] + 29) % 29;
    return inverse.get(id)[encoded];
  }));
  assert.deepEqual(decoded, plain, "positive ciphertext failed full exact inverse");
  const directOriginal = collision(plain, mode, "direct");
  const mapped = collision(cipher, mode, kind);
  if (kind === "direct") assert.equal(mapped.matches, directOriginal.matches);
  else {
    const deltaPlain = collision(plain, mode, "direct");
    // j=0 is mapped directly, but is intentionally omitted by delta collision.
    const sourceExcludingFirst = plain.map(w => w.slice());
    const native = new Map();
    for (let wi=0; wi<sourceExcludingFirst.length; wi++) {
      const w=sourceExcludingFirst[wi];
      for (let j=1;j<w.length;j++) {
        const id=keyId(wi,mode)*5+j%5;
        const h=native.get(id)||Array(29).fill(0); h[w[j]]++; native.set(id,h);
      }
    }
    let expected=0;
    for(const h of native.values())for(const n of h)expected+=n*(n-1)/2;
    assert.equal(mapped.matches, expected, "feedback collision invariant failed");
    assert(deltaPlain.pairs > mapped.pairs);
  }
  return cipher;
}
const modes = [
  ["position", "direct"], ["position", "delta"],
  ["value", "direct"], ["value", "delta"]
];
const observed = modes.map(([mode,kind]) =>
  ({mode,kind,...collision(original,mode,kind)}));
assert.deepEqual(observed.map(x=>[x.matches,x.pairs,x.classes]), [
  [2452,70030,1278], [1568,45191,1274],
  [5037,143500,805], [3237,92845,803]
]);
const summaries = [];
for (const [name, file] of sourcePaths) {
  const pools = referencePools(read(file));
  const n = 200;
  const stats = modes.map(() => ({minimum:Infinity,maximum:-Infinity,sum:0,below:0}));
  for (let rep=0;rep<n;rep++) {
    const plain=sampleNative(pools);
    for (let m=0;m<modes.length;m++) {
      const [mode,kind]=modes[m];
      const rate=collision(plain,mode,kind === "delta" ? "laterPlain" : "direct").rate;
      const s=stats[m]; s.minimum=Math.min(s.minimum,rate);
      s.maximum=Math.max(s.maximum,rate);s.sum+=rate;
      if(rate<=observed[m].rate)s.below++;
    }
    if (rep === 0) {
      for (let m=0;m<modes.length;m++) {
        const [mode,kind]=modes[m];
        const planted=plant(plain,mode,kind);
        assert.equal(collision(planted,mode,kind).matches,
          collision(plain,mode,kind==="direct"?"direct":"laterPlain").matches);
      }
    }
  }
  summaries.push({reference:name,replicates:n,comparisons:stats.map((s,i)=>({
    mode:modes[i].join("/"),minimum:s.minimum,mean:s.sum/n,
    maximum:s.maximum,originalAtOrAboveReference:s.below
  }))});
}
for (const summary of summaries)for(const row of summary.comparisons)
  assert.equal(row.originalAtOrAboveReference,0,"model not excluded");
console.log(JSON.stringify({
  premise:"256-entry p49-51 table reused per printed word; word-relative five-phase arbitrary secret GP29 bijections",
  originalWordCount:2896, originalRuneCount:12956,observed,summaries,
  positive:"four fully reversible secret GP29 positive plants per register",
  conclusion:"conditional source-native English exclusions only; no unknown plaintext or key"
},null,2));
