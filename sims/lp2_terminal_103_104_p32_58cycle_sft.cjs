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
// A second, disjoint, *whole printed* p27 word independently sums 104.
// Its first rune starts 32 physical p27 runes after the AEF 103-word,
// exactly the destination page number pointed to by source table cell103.
const follower104 = p27.slice(66, 68);
assert.equal(follower104.map(i => gp.translit[i]).join(""), "PB");
assert.equal(follower104.reduce((sum,i) => sum + gp.prime[i], 0), 104);
assert.equal(66-34, 32);

// Use the manuscript's original physical *word separators*, instead of
// treating a postselected two-rune substring as a complete printed word.
const physicalP27 = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"),"utf8").split("%")[27];
const pageWords=[];
let runesInWord=[],startWord=0,offset=0;
const finishWord=() => {
  if(!runesInWord.length)return;
  const sum=runesInWord.reduce((a,v)=>a+gp.prime[v],0);
  pageWords.push({start:startWord, sum, text:runesInWord.map(i=>
    gp.translit[i]).join(".")});
  runesInWord=[];
};
for(const glyph of physicalP27) {
  const val=gp.runes.indexOf(glyph);
  if(val!==-1) {
    if(!runesInWord.length)startWord=offset;
    runesInWord.push(val);
    offset++;
  } else if(glyph==="-" || glyph===".")finishWord();
}
finishWord();
assert.equal(offset,234);
const source103Words=pageWords.filter(w=>w.sum===103);
const source104Words=pageWords.filter(w=>w.sum===104);
assert.deepEqual(source103Words,[{start:34,sum:103,text:"AE.F"}]);
assert.deepEqual(source104Words,[{start:66,sum:104,text:"P.B"}]);
assert.equal(source104Words[0].start-source103Words[0].start,32);

const tokens = grid.rows.flat(), bytes = grid.byte_rows.flat();
assert.equal(tokens.length,256);
assert.equal(bytes.length,256);
assert.deepEqual(tokens.slice(102,104),["0W","3Q"]);
assert.deepEqual(bytes.slice(102,104),[32,206]);

// Exhaust all original p27 whole-word pairs whose prime sums are
// consecutive in [1,256]; require two table values address same page and
// the rune-start gap equal that page. The selected pair is unique.
const pairedP27=[];
for(let i=0;i<pageWords.length;i++)for(let j=i+1;j<pageWords.length;j++){
  const a=pageWords[i],b=pageWords[j],lo=Math.min(a.sum,b.sum),
    hi=Math.max(a.sum,b.sum);
  if(hi-lo!==1 ||lo<1 ||hi>256)continue;
  const pa=bytes[lo-1]%58,pb=bytes[hi-1]%58,
    gap=b.start-a.start;
  pairedP27.push({starts:[a.start,b.start],cells:[lo,hi],
    gap,pa,pb,fullMatch:pa===pb&&pa===gap});
}
assert.equal(pairedP27.length,7);
assert.deepEqual(pairedP27.filter(x=>x.fullMatch),[{
  starts:[34,66],cells:[103,104],gap:32,pa:32,pb:32,fullMatch:true
}]);

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

// Next prime-bearing rows and columns jointly choose the separate p15 square.
// The entire extraction policy is frozen: take EACH sum-prime row/column
// of the original 11x11 p32 square in printed axis order, convert the
// sum's prime ordinal to a one-based table cell, then byte mod58.
// The first TWO row targets and first TWO column targets agree: p32,p15.
// Remaining targets diverge; no other row/column matches are selected.
function axisPrimeCells(axis) {
  const matches=[];
  for(let i=0;i<11;i++) {
    let sum=0;
    for(let j=0;j<11;j++) {
      const rune=axis==="row"?p32[11*i+j]:p32[11*j+i];
      sum+=gp.prime[rune];
    }
    if(!isPrime(sum))continue;
    const cell=primeOrdinal(sum);
    const token=tokens[cell-1];
    const byte=bytes[cell-1];
    matches.push({axis,at:i,sum,cell,token,byte,page:byte%58});
  }
  return matches;
}
const rows=axisPrimeCells("row"),columns=axisPrimeCells("column");
assert.deepEqual(rows.map(x=>[x.at,x.sum,x.cell,x.byte,x.page]),[
  [0,563,103,32,32],
  [1,617,113,73,15],
  [4,743,132,120,4],
  [6,577,106,63,5]
]);
assert.deepEqual(columns.map(x=>[x.at,x.sum,x.cell,x.byte,x.page]),[
  [0,569,104,206,32],
  [2,641,116,247,15],
  [6,463,90,220,46],
  [10,499,95,56,56]
]);
assert.deepEqual(rows.slice(0,2).map(x=>x.page),[32,15]);
assert.deepEqual(columns.slice(0,2).map(x=>x.page),[32,15]);
assert.equal(columns[1].byte-rows[1].byte,174);
assert.deepEqual(rows.slice(0,2).map(x=>digitValue(x.token,59)%58),[32,14]);
assert.deepEqual(columns.slice(0,2).map(x=>digitValue(x.token,59)%58),[29,11]);

// The selected p15 original numeric square is known independently to
// encode 3301 via all sixteen absolute differences to Fibonacci-rank
// primes. This is a public identifier/checkpoint, not unknown plaintext.
const {readSquare,primeList,uniqueFibonacciPrimeRanks,clockwiseSpiral} =
  require("./fibonacci_prime_spiral.cjs");
const p15Grid=readSquare();
const order=clockwiseSpiral();
const ranks=uniqueFibonacciPrimeRanks();
const primes=primeList(Math.max(...ranks));
const spiral=order.map(([row,col])=>p15Grid[row][col]);
assert.deepEqual(spiral,ranks.map(rank=>Math.abs(3301-primes[rank-1])));
assert.equal(new Set(spiral).size,16);

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
  independentOriginalP27PrimeOrdinalWords:{first:source103Words,second:source104Words,positionDifference:32},
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
  allP27ConsecutiveWordSumPairs:pairedP27,
  originalP32AllPrimeRows:rows,
  originalP32AllPrimeColumns:columns,
  repeatedPrimeAxisPagePair:[32,15],
  p15FibonacciPrimeSpiralRecoversKnown3301:spiral.every((v,i)=>
    v===Math.abs(3301-primes[ranks[i]-1])),
  conjecturedMixedIdentifier:candidate,
  publicSigned2013Base29Example:base29,
  missingInstruction:"No original cipher/key or author-specified page-modulus/byte-to-page/mixed-token instruction"
},null,2));
