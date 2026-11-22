"use strict";
/**
 * Exact all-secret GP29 difference / 256-position output-rank capacity.
 *
 * Hypothetical cipher, for each page with plain runes P:
 *   C[0] = P[0] (page initialization);
 *   D[i] = (C[i]-C[i-1]) mod29;
 *   D[i] = 0 if P[i] = 28;
 *   D[i] = K[phase(i)] * 2^P[i] mod29 otherwise.
 * K is any of 28^256 possible nonzero GF29 masks; the full k=1
 * bound also covers *arbitrary* 28! bijections on the nonzero
 * delta alphabet, in each 256-phase state.
 *
 * The canonical p49-p51 table supplies 256 printed byte-valued
 * cells, motivating (but not authenticating) one possible phase key.
 * This executable rules out the entire specified phase model for
 * ordinary solved-Cicada-shaped GP29 English, independently of K.
 *
 * This is no decryption of the unknown Liber Primus pages.
 * SFT: Node 22, Windows 11, from the repository root.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const allPages = corpus.pages.filter(p => p.page <= 55);
const pages = allPages.filter(p => p.indices.length);
const total = pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(total, 12956);
assert.equal(pages.length, 55);
const rawOriginal = pages.flatMap(p => p.indices);
assert.equal(rawOriginal.length, total);
const alphabet = grid.alphabet;
const bytes = grid.pages.flatMap(p => p.tokens)
  .map(s => 60 * alphabet.indexOf(s[0]) + alphabet.indexOf(s[1]));
assert.equal(bytes.length, 256);
assert.ok(bytes.every(n => Number.isInteger(n) && n >= 0 && n <= 255));
const sourceMask = bytes.map(b => (b % 28) + 1);
const mod = n => ((n % 29) + 29) % 29;
const exp = Array(28);
const log = Array(29).fill(-1);
for (let k = 0, v = 1; k < 28; k++, v = (v * 2) % 29) {
  assert.equal(log[v], -1);
  exp[k] = v;
  log[v] = k;
}
assert.equal(new Set(exp).size, 28);
assert.equal(log[0], -1);
/** @param {number} length @param {"global"|"page"} reset
 * @returns {number[][]} phase-tagged nonzero delta rows */
function differenceRows(pieces, length, reset) {
  const rows = Array.from({length}, () => Array(29).fill(0));
  let global = 0;
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++, global++) {
      if (i === 0) continue;
      const delta = mod(piece[i] - piece[i - 1]);
      if (delta !== 0) rows[(reset === "global" ? global : i) % length][delta]++;
    }
  }
  return rows;
}
/** @param {number[][]} pieces */
function sourceInfo(pieces) {
  let transitions = 0, zeros = 0;
  for (const p of pieces) for (let i = 1; i < p.length; i++) {
    transitions++;
    if (p[i] === p[i - 1]) zeros++;
  }
  return {transitions, zeros, nonzero:transitions - zeros};
}
const origPieces = pages.map(p => p.indices);
const source = sourceInfo(origPieces);
assert.deepEqual(source, {transitions:12901,zeros:86,nonzero:12815});
/** @param {number[][]} rows */
function maxOneSymbol(rows) {
  return rows.reduce((n, row) => n + Math.max(...row), 0);
}
const expected = {
  8:{global:579,page:584},
  32:{global:720,page:730},
  64:{global:853,page:836},
  128:{global:1015,page:1010},
  256:{global:1276,page:1279},
  512:{global:1671,page:1310},
};
const bounds = [];
for (const phases of [8,32,64,128,256,512]) {
  for (const reset of ["global","page"]) {
    const rows = differenceRows(origPieces, phases, reset);
    const nonzero = rows.flat().reduce((a, b) => a + b, 0);
    assert.equal(nonzero, 12815);
    const maximum = maxOneSymbol(rows);
    assert.equal(maximum, expected[phases][reset]);
    bounds.push({phases,reset,allSecretMaximum:maximum});
  }
}
// The independently solved-Cicada original-word-length-matched source
// null was already frozen (5,000 books, min 1,468 E on exact page mask)
// by lp2_cprev_secret_table_majorization_original_sft.cjs.
// Draw an additional deterministic native GP positive plant directly
// from its same solved-native source corpus, preserving all 2,896 original
// printed word lengths and the literal 55 physical-page first positions.
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const pattern = new RegExp("[" + corpus.runes.join("") + "]+", "gu");
const nativeWords = solved.sections.flatMap(s =>
  (s.source_text.match(pattern) || [])
    .map(w => [...w].map(r => {
      assert.ok(index.has(r)); return index.get(r);
    })));
assert.equal(nativeWords.length, 740);
assert.equal(nativeWords.flat().length, 2979);
const sourceWords = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\r\n%&$\s]/g,"")
  .split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w))
  .slice(0,2896)
  .map(w => [...w].map(r => index.get(r)));
assert.equal(sourceWords.length,2896);
assert.deepEqual(sourceWords.flat(),rawOriginal);
const pools = new Map();
for(const word of nativeWords){
  if (!pools.has(word.length)) pools.set(word.length,[]);
  pools.get(word.length).push(word);
}
let seed = 0x29a13301;
/** @returns {number} */
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plantWords = sourceWords.map(w => {
  const pool = pools.get(w.length);
  assert.ok(pool && pool.length);
  return pool[next() % pool.length];
});
const plant = plantWords.flat();
assert.equal(plant.length,total);
let ofs = 0;
const plantPages = pages.map(p => {
  const part = plant.slice(ofs, ofs+p.indices.length);
  ofs += p.indices.length;
  return part;
});
assert.equal(ofs,total);
const countPageNoninitialE = pgs => pgs.reduce((n, p) =>
  n + p.slice(1).filter(x => x === 18).length,0);
const nativeE = countPageNoninitialE(plantPages);
assert.ok(nativeE >= 1400, "source-native positive is strongly E-rich");
/** @param {number[][]} clear @param {"global"|"page"} clock */
function encrypt(clear, clock, mask=sourceMask) {
  let abs = 0;
  const out = [];
  for(const p of clear) {
    const c = [p[0]];
    abs++;
    for(let i=1;i<p.length;i++,abs++){
      const phase = (clock === "global" ? abs : i) % mask.length;
      const delta = p[i] === 28 ? 0 : mask[phase] * exp[p[i]] % 29;
      c.push(mod(c[i-1]+delta));
    }
    out.push(c);
  }
  return out;
}
/** @param {number[][]} cipher @param {"global"|"page"} clock */
function decrypt(cipher,clock,mask=sourceMask){
  let abs = 0;
  const out = [];
  for(const c of cipher){
    const p = [c[0]];
    abs++;
    for(let i=1;i<c.length;i++,abs++){
      const phase = (clock === "global" ? abs : i) % mask.length;
      const delta = mod(c[i]-c[i-1]);
      p.push(delta === 0 ? 28 :
        (log[delta]-log[mask[phase]]+28)%28);
    }
    out.push(p);
  }
  return out;
}
const positives = [];
for (const reset of ["global","page"]) {
  const c = encrypt(plantPages,reset);
  const p = decrypt(c,reset);
  assert.deepEqual(p,plantPages);
  assert.deepEqual(encrypt(p,reset),c);
  const cap = maxOneSymbol(differenceRows(c,256,reset));
  assert.ok(cap>=nativeE);
  const decodedUnknown = decrypt(origPieces,reset);
  assert.deepEqual(encrypt(decodedUnknown,reset),origPieces);
  const tentativeE = countPageNoninitialE(decodedUnknown);
  assert.ok(tentativeE <= expected[256][reset]);
  positives.push({reset,plaintextRunes:total,nativeE,
    syntheticCipherEUpperBound:cap,sourceTableKeyE:tentativeE,
    exactNativeRecovery:true,exactOriginalReencryption:true});
}
assert.ok(expected[256].global < 1468 && expected[256].page < 1468);
assert.ok(expected[512].global > 1591 && expected[512].page < 1468);
const printedDigits = grid.pages.flatMap(p => p.tokens)
  .flatMap(t => [alphabet.indexOf(t[0]), alphabet.indexOf(t[1])]);
assert.equal(printedDigits.length,512);
const digitMasks = [
  {name:"digit-as-nonzero-residue",mask:printedDigits.map(n => 1+n%28)},
  {name:"digit-as-unit-exponent",mask:printedDigits.map(n => exp[n%28])}
];
const digitResults=[];
for(const {name,mask} of digitMasks){
  for(const reset of ["global","page"]){
    const decoded=decrypt(origPieces,reset,mask);
    assert.deepEqual(encrypt(decoded,reset,mask),origPieces);
    const E=countPageNoninitialE(decoded);
    const all=decoded.flat();
    const f=Array(29).fill(0);
    for(const v of all)f[v]++;
    const ioc=f.reduce((n,k)=>n+k*(k-1),0)/(all.length*(all.length-1));
    assert.ok(E < 650 && ioc < 0.04);
    const synthetic=encrypt(plantPages,reset,mask);
    assert.deepEqual(decrypt(synthetic,reset,mask),plantPages);
    digitResults.push({name,reset,E,ioc,exactOriginalReencryption:true,
      exactNativePositive:true});
  }
}

console.log(JSON.stringify({
  source,
  sourceTableDigits:256,
  sourceTableDistinctBytes:new Set(bytes).size,
  primitiveRoot:2,
  sourceOriginalAbsoluteAllSecretBounds:bounds,
  independentlyPublishedNativeGPMinimumE:1468,
  nativeLengthMatchedPositive:positives,
  direct512DigitSourceKeys:digitResults,
  decision:"Reject <=256-phase single-layer GP29 difference decoder with fixed zero and 28 bijective nonzero outputs; also reject page-reset 512-phase under native GP English. Global 512-phase capacity remains possible, though two literal printed-digit keys fail. No authentic unknown plaintext.",
},null,2));
console.log("PASS: original all-secret 256-phase finite-field difference bound and native-GP positive inverses");
