"use strict";
/**
 * Frozen source-led nonlinear 32x8 terminal-ring peel, a falsifiable
 * independent known-plaintext check rather than a claimed Cicada decoder.
 *
 * Original physical pages p55+p56+p57 contain 76+85+95=256 runes.
 * The source printed table has concentric clockwise ring sizes 76/68/60/52.
 * The final 52 source runes are the unencrypted p57 SHED...EMERGE command.
 * Signed 2013 Cicada's DH example uses the base 5; hypothesize a minimal
 * nonlinear inside-to-out ring coupling using 5^inner_rune modulo GP29.
 *
 * Precisely one model, fixed before checking unknown plaintext:
 *   P[core] = C[core]
 *   P[r,j] = C[r,j] -
 *       ((B[original_cell(r,j)] mod29) * 5^P[r+1,j mod next_len]) mod29
 * Other direction uses addition and identical key, from core to outer ring.
 *
 * This model has no secret fitted coefficients, phase, direction or offsets.
 * Its top-left clockwise ring ordering, modulo29 table-byte representation,
 * inner-index j mod next_len and core identity are HYPOTHESES, not an
 * authenticated cipher instruction. Do not vary them to rescue a failure.
 *
 * Reproduce with Node22 from repo root:
 *   node sims/lp2_terminal256_dh5_nested_peel_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const B = JSON.parse(read("resources/liber-primus/base60-grid.json"))
  .byte_rows.flat();
const M = 29;
const mod = value => ((value % M) + M) % M;
assert.equal(B.length, 256);
assert(B.every(b => Number.isInteger(b) && b >= 0 && b <= 255));

/** Get printed 32x8 cell indices in clockwise perimeter order. */
function ring(number) {
  const top = number, bottom = 31-number;
  const left = number, right = 7-number, out = [];
  for (let c = left; c <= right; c++) out.push(top*8+c);
  for (let r = top+1; r <= bottom; r++) out.push(r*8+right);
  for (let c = right-1; c >= left; c--) out.push(bottom*8+c);
  for (let r = bottom-1; r > top; r--) out.push(r*8+left);
  return out;
}
const rings = [0,1,2,3].map(ring);
const sizes = rings.map(x => x.length);
const START = [0,76,144,204];
assert.deepEqual(sizes, [76,68,60,52]);
assert.equal(new Set(rings.flat()).size, 256);
assert.deepEqual(rings.flat().slice().sort((a,b) => a-b),
  Array.from({length:256},(_,i) => i));

/** @param {number} n @returns {number[]} */
function primes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d*d <= x; d++) if (x%d === 0) {
      prime = false;
      break;
    }
    if (prime) out.push(x);
  }
  return out;
}

/**
 * Literal GP transliteration of independently solved p56 wording.
 * @param {string} words @returns {number[]}
 */
function gpWords(words) {
  const tokens = corpus.translit.map((token,index) => ({token,index}))
    .sort((a,b) => b.token.length-a.token.length);
  const out = [];
  for (const word of words.split(" ")) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find(item => word.startsWith(item.token,i));
      assert(found, "Unrepresentable original GP spelling");
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}
const page = number => corpus.pages.find(p => p.page === number).indices;
const ciphertext = [55,56,57].flatMap(page);
assert.deepEqual([page(55).length,page(56).length,page(57).length],
  [76,85,95]);
const expected56 = gpWords(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
const expected57 = page(57).slice();
assert.deepEqual([expected56.length,expected57.length],[85,95]);
// Independent p56 positive known-decryption regression, single literal F56.
const primeKey = primes(100);
let keyIndex = 0;
const actual56 = page(56).map((c,i) => {
  if (i === 56) {
    assert.equal(c,0);
    return c;
  }
  return mod(c-(primeKey[keyIndex++]-1));
});
assert.deepEqual(actual56,expected56);
const known = [...expected56,...expected57];
assert.equal(known.length,180);

/** @param {number} exponent @returns {number} */
function dh5(exponent) {
  let result=1, base=5;
  for (let e=exponent;e>0;e>>=1) {
    if (e&1) result=result*base%M;
    base=base*base%M;
  }
  return result;
}

/**
 * Exact full256 inside-out terminal decryption.
 * @param {number[]} C @returns {number[]}
 */
function decrypt(C) {
  assert.equal(C.length,256);
  const P = Array(256);
  for (let i=204;i<256;i++) P[i]=C[i]; // authentic p57 clear core
  for (let r=2;r>=0;r--) for (let j=0;j<sizes[r];j++) {
    const p=START[r]+j, next=START[r+1]+j%sizes[r+1];
    const weight=B[rings[r][j]]%M;
    P[p]=mod(C[p]-weight*dh5(P[next]));
  }
  return P;
}

/**
 * Complete inverse ciphertext construction from any planted plaintext.
 * @param {number[]} P @returns {number[]}
 */
function encrypt(P) {
  assert.equal(P.length,256);
  const C = Array(256);
  for (let i=204;i<256;i++) C[i]=P[i];
  for (let r=2;r>=0;r--) for (let j=0;j<sizes[r];j++) {
    const p=START[r]+j, next=START[r+1]+j%sizes[r+1];
    const weight=B[rings[r][j]]%M;
    C[p]=mod(P[p]+weight*dh5(P[next]));
  }
  return C;
}
const decoded = decrypt(ciphertext);
assert.deepEqual(encrypt(decoded),ciphertext);

const byRing=[1,2,3].map(r => {
  const local=START[r],length=sizes[r];
  const errors=[];
  for(let j=0;j<length;j++) {
    const index=local+j;
    if(decoded[index]!==known[index-76]) errors.push(index);
  }
  return {ring:r,length,matches:length-errors.length,
    errors:errors.length,firstMismatchGlobal:errors[0]??null};
});
const matches=byRing.reduce((s,r)=>s+r.matches,0);
assert.deepEqual(byRing.map(r=>r.matches),[0,3,52]);
assert.equal(matches,55);

// Plant real GP-native content to prove entire 256-symbol reversible path.
const words=read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g).slice(300,390).join(" ")
  .toUpperCase().replace(/V/g,"U").replace(/K/g,"C").replace(/Q/g,"C")
  .replace(/Z/g,"S");
const nativeTokens=corpus.translit;
const GP=Object.fromEntries(nativeTokens.map((t,i)=>[t,i]));
const plainPlant=[];
for(let i=0;i<words.length && plainPlant.length<256;i++) {
  if(!/[A-Z]/.test(words[i]))continue;
  if(words.slice(i,i+3)==="ING") {
    plainPlant.push(GP.NG);i+=2;continue;
  }
  const pair=words.slice(i,i+2);
  if(Object.hasOwn(GP,pair)) {
    plainPlant.push(GP[pair]);i++;continue;
  }
  if(Object.hasOwn(GP,words[i])) plainPlant.push(GP[words[i]]);
}
assert.equal(plainPlant.length,256);
assert.deepEqual(decrypt(encrypt(plainPlant)),plainPlant);

const report={
  interpretation:"Single frozen nonlinear clockwise inner-to-outer DH5 peel",
  input:{runes:256,knownPlaintext:180,unknown:76,
    ringSizes:sizes,originalTableCells:256},
  knownByRing:byRing,
  totalKnownMatches:matches,
  requiredKnownMatches:180,
  genuineOriginalDecryption:false,
  firstContradiction:byRing[0].firstMismatchGlobal,
  nontrivialKnownMatches:byRing[0].matches+byRing[1].matches,
  exactOriginalRoundTrip:encrypt(decoded).length,
  syntheticNativeGPPlantRecovered:256,
  outer76CandidateNotPromoted:true
};
console.log(JSON.stringify(report,null,2));
