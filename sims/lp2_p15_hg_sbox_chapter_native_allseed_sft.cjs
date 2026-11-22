"use strict";

/**
 * Original LP2 p15–22 all-secret fourth-order recurrent-state nonlinear S-box
 * attack, with exact A/I/O constraints and three external GP-native controls.
 * Run as one Node.js 22 CommonJS test from the repository root.
 *
 * The scalar recurrent state z[n] obeys one of two source-linked fourth-order
 * characteristic polynomials. Its unknown 29-entry output lookup F[z] has
 * no restricted values at all, including arbitrary nonbijective mappings.
 * The additive plaintext model is P[n]=C[n]-F[z[n]] (mod29).
 * At each preserved one-rune English word, P must be A/I/O; this restricts
 * F[z] to one of three allowed GP29 values. Every one of the 29^4 secret
 * scalar seeds is enumerated, and every surviving seed is checked for a
 * source-native collision invariant across its ENTIRE original chapter.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const read = name => fs.readFileSync(name, "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const native = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 7000],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 50000],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 70000]
];
const mod = x => ((x % 29) + 29) % 29;
const alphabet = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** Source-attested ING and IO spelling from the solved LP1 reference. */
function encodeSourceNativeGP(original) {
  const out = [];
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) { out.push(21); i += 3; }
      else if (word.startsWith("IO", i)) { out.push(27); i += 2; }
      else {
        const token = alphabet.find(t => word.startsWith(t.s, i));
        assert(token, "source-native GP token " + word.slice(i));
        out.push(token.i);
        i += token.s.length;
      }
    }
  }
  return out;
}
assert.deepEqual(encodeSourceNativeGP("THINGS FUNCTION"), [2, 21, 15, 0, 1, 9, 5, 16, 27, 9]);
const full = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(full.length, 12956);
const physical = corpus.pages.filter(p => p.page >= 15 && p.page <= 22)
  .flatMap(p => p.indices);
assert.equal(physical.length, 1903);
const pageBoundary = corpus.pages.filter(p => p.page < 15)
  .reduce((n, p) => n + p.indices.length, 0);
assert.equal(pageBoundary, 3603);
// Original source-visible internal red rubric: p15 local rune offset9.
// Those first nine page runes belong before the chapter's marked reset.
const pageStart = pageBoundary + 9;
const original = physical.slice(9);
assert.equal(pageStart, 3612);
assert.equal(original.length, 1894);
assert.deepEqual(full.slice(pageStart, pageStart + original.length), original);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const raw = read("resources/lp2-transcription.txt").split("%").slice(0, 55).join("%");
const singles = [];
let start = 0, position = 0, word = [];
const flush = () => {
  if (word.length === 1) singles.push({pos: start, cipher: word[0]});
  word = [];
};
for (const ch of raw) {
  const value = runeIndex.get(ch);
  if (value !== undefined) {
    if (!word.length) start = position;
    word.push(value);
    position++;
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Printed line and page wraps do not terminate source rune words.
  } else {
    flush();
  }
}
flush();
assert.equal(position, 12956);
assert.equal(singles.length, 83);
assert(singles.every(e => full[e.pos] === e.cipher));
const chapter = singles.filter(e => e.pos >= pageStart
  && e.pos < pageStart + original.length);
assert.deepEqual(chapter.map(e => [e.pos, e.cipher]), [
  [3738,26], [3783,23], [3881,9], [4006,10], [4142,17],
  [4148,28], [4176,10], [4217,16], [4233,4], [4358,16],
  [4474,13], [4633,7], [4699,4], [4751,2], [4794,17],
  [5253,28], [5319,25], [5336,9]
]);

const controls = native.map(([, path, start]) =>
  encodeSourceNativeGP(read(path)).slice(start, start + original.length));
assert(controls.every(x => x.length === original.length));
const MODEL = [
  {label:"p15 signed 4x4", a:[19,2,15,28], count:10052,
    maxOriginal:0.03667697086450727,
    minControls:[0.05998136501281155,0.05736027625015987,0.05813227795113783]},
  {label:"2013 H × p39 G", a:[15,20,16,1], count:10556,
    maxOriginal:0.03674872693068665,
    minControls:[0.06081135575449633,0.05749951175053707,0.058156719447827854]}
];
const masks = chapter.map(e => ({
  offset:e.pos-pageStart,
  allowed:(1 << mod(e.cipher-24)) |
    (1 << mod(e.cipher-10)) | (1 << mod(e.cipher-3))
}));
const totalSeeds = 29 ** 4;

/** Source-selected recurrence without fitting any seed or output map. */
function rowsFor(a) {
  const rows = Array.from({length: original.length}, (_, i) =>
    i < 4 ? Array.from({length:4}, (_, j) => Number(i===j)) : null);
  for(let i=4;i<rows.length;i++){
    const x=rows;
    rows[i]=Array.from({length:4},(_,j)=>mod(
      a[0]*x[i-4][j]+a[1]*x[i-3][j]+
      a[2]*x[i-2][j]+a[3]*x[i-1][j]));
  }
  return rows;
}
function score(hist, denominator) {
  let hits = 0;
  for (const n of hist) hits += n*(n-1);
  return hits/denominator;
}
for (const model of MODEL) {
  const rows = rowsFor(model.a);
  let accepted = 0, maxOriginal = 0;
  const minControls = [1,1,1];
  const minPairedGaps = [1,1,1];
  let winner = null;
  for (let s = 0; s < totalSeeds; s++) {
    const seed = [s%29, Math.floor(s/29)%29,
      Math.floor(s/841)%29, Math.floor(s/24389)%29];
    const assigned = new Int32Array(29).fill((1<<29)-1);
    let compatible = true;
    for (const e of masks) {
      const r=rows[e.offset];
      const z=mod(r[0]*seed[0]+r[1]*seed[1]+
        r[2]*seed[2]+r[3]*seed[3]);
      assigned[z] &= e.allowed;
      if (!assigned[z]) { compatible = false; break; }
    }
    if (!compatible) continue;
    accepted++;
    const count = Array.from({length:4},()=>new Uint16Array(841));
    const bins = new Uint16Array(29);
    for (let i = 0; i < original.length; i++) {
      const r=rows[i];
      const z=mod(r[0]*seed[0]+r[1]*seed[1]+
        r[2]*seed[2]+r[3]*seed[3]);
      bins[z]++;
      count[0][z*29+original[i]]++;
      for (let j=0;j<3;j++) count[j+1][z*29+controls[j][i]]++;
    }
    let pairs=0;
    for (const n of bins) pairs+=n*(n-1);
    const rates=count.map(h=>score(h,pairs));
    if (rates[0] > maxOriginal) {
      maxOriginal=rates[0];
      winner=seed;
    }
    for(let j=0;j<3;j++){
      minControls[j]=Math.min(minControls[j],rates[j+1]);
      minPairedGaps[j]=Math.min(minPairedGaps[j],rates[j+1]-rates[0]);
    }
  }
  assert.equal(accepted,model.count);
  assert(Math.abs(maxOriginal-model.maxOriginal)<1e-12);
  for(let j=0;j<3;j++){
    assert(Math.abs(minControls[j]-model.minControls[j])<1e-12);
    assert(minPairedGaps[j]>0.021);
  }
  console.log(JSON.stringify({
    label:model.label,
    chapter:"original red p15:9 through physical p22", originalSymbols:original.length,
    allSecretSeeds:totalSeeds, AIOCompatibleSeeds:accepted,
    maximumOriginalConditionalIoC:maxOriginal,
    minimumNativeControlIoCs:Object.fromEntries(native.map(([name],j)=>[name,minControls[j]])),
    minimumNativeMinusOriginalPairedIoCs:minPairedGaps,
    originalMaximizingSeed:winner,
    result:"no source-native English control falls within original all-secret collision envelope"
  }, null, 2));
}
