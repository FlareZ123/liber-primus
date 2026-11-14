"use strict";

/**
 * Exact original-source p55 terminal words -> p27 -> original table103 ->
 * p32 square -> 2016 prime ordinals -> the same table103/104 numerical cycle.
 * A possible human navigation/checkpoint route, not a decipherment cipher.
 *
 * Windows 11 / Node.js 22 SFT:
 * node sims/lp2_terminal_103_104_p32_58cycle_sft.cjs
 *
 * This is a read-only computation over original manuscript data and the
 * locally archived 2016 signed-message JPEG. No language score or fitted key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const gp = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/base60-grid.json");
const page = i => gp.pages.find(p => p.page === i).indices;
const p27 = page(27), p32 = page(32), p55 = page(55), p56 = page(56);
const mod = (v, n) => (v % n + n) % n;
assert.deepEqual([p27.length, p32.length, p55.length], [234,121,76]);
assert.equal(gp.pages.length, 58);
const footer = p55.slice(-6);
assert.deepEqual(footer, p27.slice(28,34));
assert.equal(footer.map(i => gp.translit[i]).join(""), "DJUBEI");
// Original printed footer has the two exact whole-word groups DJU / BEI.
const wordSums = [footer.slice(0,3),footer.slice(3)].map(a =>
  a.reduce((s,i) => s + gp.prime[i],0));
assert.deepEqual(wordSums,[129,159]);
assert.equal(mod(wordSums[0] + wordSums[1],29),27);
assert.equal(mod(wordSums[0] - wordSums[1],29),28);
assert.equal(mod(wordSums[0] + wordSums[1],58),56);
assert.equal(mod(wordSums[0] - wordSums[1],58),28);
assert.equal(p56[0],p27[34]);
assert.equal(p56[0],25); // AE, the seventh source seam rune

// The next entire printed word on p27 after DJU BEI is AE F.
// Its source-published GP prime values select one-based table cell 103.
assert.deepEqual(p27.slice(34,36),[25,0]);
const followerWordPrimeSum = gp.prime[25] + gp.prime[0];
assert.equal(followerWordPrimeSum,103);
const tokens = grid.rows.flat(), bytes = grid.byte_rows.flat();
assert.equal(tokens.length,256);
assert.equal(bytes.length,256);
assert.deepEqual(tokens.slice(102,104),["0W","3Q"]);
assert.deepEqual(bytes.slice(102,104),[32,206]);

// Authentic January 2016 signed JPEG has source-frame dimensions 563x569.
// SOF0 marker is in the header before the entropy-coded SOS data.
const picture = fs.readFileSync(path.join(root,
  "resources/historical/cicada2016-4gq25.jpg"));
const sof = picture.indexOf(Buffer.from([0xff,0xc0]));
assert(sof > 0);
const height = picture.readUInt16BE(sof+5);
const width = picture.readUInt16BE(sof+7);
assert.deepEqual([width,height],[563,569]);
const isPrime = n => {for(let d=2;d*d<=n;d++)if(n%d===0)return false;return n>=2;};
const primeOrdinal = v => {
  assert(isPrime(v));
  let count=0;
  for(let n=2;n<=v;n++)if(isPrime(n))count++;
  return count;
};
assert.equal(p32.length,11*11);
const firstRowSum = p32.slice(0,11).reduce((s,i)=>s+gp.prime[i],0);
const firstColSum = Array.from({length:11},(_,row)=>p32[11*row])
  .reduce((s,i)=>s+gp.prime[i],0);
assert.deepEqual([firstRowSum,firstColSum],[width,height]);
const ordinals = [primeOrdinal(firstRowSum),primeOrdinal(firstColSum)];
assert.deepEqual(ordinals,[103,104]);

// A new conditional page self-address occurs at BOTH adjacent cells, not
// just byte 32: 206 - 32 = 174 = 3 * 58 = 6 * 29.
const totalPhysicalPages=gp.pages.length;
const selectedBytePageIds=bytes.slice(102,104).map(b=>b%totalPhysicalPages);
assert.deepEqual(selectedBytePageIds,[32,32]);
assert.equal(bytes[103]-bytes[102],3*totalPhysicalPages);
assert.deepEqual(bytes.slice(102,104).map(b=>b%29),[3,3]);
assert.equal(gp.translit[3],"O");

// Test the important original two-digit numeral ambiguity *locally*.
// The first token is radix-independent, 3Q decodes 206 in base60,
// but 203 in a simple base59 positional interpretation; thus base59
// breaks this two-cell page32 self-address in the very same fixed pair.
const digits="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
/** @param {string} token @param {number} radix */
function digitValue(token,radix) {
  assert.equal(token.length,2);
  const a=digits.indexOf(token[0]),b=digits.indexOf(token[1]);
  assert(a>=0 && b>=0 && a<radix && b<radix);
  return radix*a+b;
}
assert.deepEqual(tokens.slice(102,104).map(t=>digitValue(t,60)),[32,206]);
assert.deepEqual(tokens.slice(102,104).map(t=>digitValue(t,59)),[32,203]);
assert.deepEqual(tokens.slice(102,104).map(t=>digitValue(t,59)%58),[32,29]);

// Original adjacency census: 8/255 pairs agree modulo58 with base60,
// precisely one is a *double* reference to p32. No broader search or
// alternative offset was fitted. The source pair 103 is independently
// selected by p32's published image-dimension prime ordinals.
const pairs=[],doubleP32=[];
for(let i=0;i+1<bytes.length;i++) {
  const lhs=bytes[i]%58,rhs=bytes[i+1]%58;
  if(lhs===rhs)pairs.push(i+1);
  if(lhs===32&&rhs===32)doubleP32.push(i+1);
}
assert.deepEqual(pairs,[56,103,140,166,199,216,231,251]);
assert.deepEqual(doubleP32,[103]);

// Already-public Cicada identifier as a *possible* endpoint/checksum,
// with an explicitly conjectural mixed base60-token/GP-rune extraction.
// The source p57 "shed circumferences" does not authenticate that recipe.
const candidate= tokens[103] + gp.translit[bytes[102]%29];
assert.equal(candidate,"3QO");
const base29 = [...candidate].reduce((s,ch)=>{
 const v=digits.indexOf(ch);assert(v>=0&&v<29);return 29*s+v;
},0);
assert.equal(base29,3301);
console.log(JSON.stringify({
  classification:"conditional original-source coordinate loop, not plaintext or key",
  footerWordSums:wordSums,
  footerTarget:{page:27,offset:28},
  followerPrimeSum:followerWordPrimeSum,
  source2016Image:{width,height,originalP32FirstRowAndColumnSums:[firstRowSum,firstColSum]},
  sourceTableOneBasedCells:ordinals,
  sourceTableTokens:tokens.slice(102,104),
  base60Bytes:bytes.slice(102,104),
  mod58PageIds:selectedBytePageIds,
  base59LocalDecoded:tokens.slice(102,104).map(t=>digitValue(t,59)),
  allConsecutiveMod58EqualPairs:pairs,
  doubleP32Pairs:doubleP32,
  conjecturedMixedIdentifier:candidate,
  publicSigned2013Base29Example:base29,
  missingInstruction:"No original cipher/key or author-specified page-modulus/byte-to-page/mixed-token instruction"
},null,2));
