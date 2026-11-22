"use strict";

/**
 * LP2 source-directed shell-Josephus known-plaintext gate (Director #627).
 * Node.js 22 / CommonJS. Read-only, no external dependencies.
 *
 * Human-visible selectors:
 * - p49-51: 32x8 base60 numerals and four concentric rectangular shells
 * - 2016 signed "its numbers are the direction"
 * - solved p57: "SHED OUR OWN CIRCUMFERENCES ... EMERGE"
 * Use each CURRENT printed cell's integer as the clockwise step within
 * the surviving cells of that shell. Emit/remove the landing cell and resume
 * at its clockwise successor. Begin NW on each shell, do not fit offsets.
 *
 * This creates a source-keyed nonlinear Josephus permutation J_B of 256 cells.
 * Candidate decipherment P[i] = C[J_B[i]], with the authentic p55/56/57
 * original printed GP29 runes C; no symbol substitutions or secret offsets.
 * The known 180 p56/p57 GP29 plaintext runes are a completely blind gate.
 *
 * Run: node sims/lp2_terminal256_josephus_ring_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {createHash}=require("node:crypto");
const root=path.resolve(__dirname,"..");
/** @param {string} filename */
const read=filename=>JSON.parse(fs.readFileSync(path.join(root,filename),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json");
const b=read("resources/liber-primus/lp2-grid-256.json").bytes;
assert.equal(b.length,256);
assert.equal(createHash("sha256").update(Buffer.from(b)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const original=[55,56,57].flatMap(p=>gp.pages[p].indices);
assert.deepEqual([55,56,57].map(p=>gp.pages[p].indices.length),[76,85,95]);
assert.equal(original.length,256);
const mod=x=>(x%29+29)%29;

/** @param {number} n @returns {number[]} */
function primes(n) {
  const result=[];
  for(let i=2;result.length<n;i++){
    let prime=true;
    for(let d=2;d*d<=i;d++)if(i%d===0){prime=false;break;}
    if(prime)result.push(i);
  }
  return result;
}
/** @param {string} words @returns {number[]} */
function gpEncode(words) {
  const tokens=gp.translit.map((token,index)=>({token,index}))
    .sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for(const word of words.split(" "))for(let i=0;i<word.length;) {
    const match=tokens.find(t=>word.startsWith(t.token,i));
    assert(match,word.slice(i));
    out.push(match.index);
    i+=match.token.length;
  }
  return out;
}
const ps=primes(100);
let clock=0;
const solved56=gp.pages[56].indices.map((rune,i)=>
  i===56?0:mod(rune-(ps[clock++]-1)));
const expected56=gpEncode(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO "+
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.deepEqual(solved56,expected56);
assert.equal(clock,84);
const known=solved56.concat(gp.pages[57].indices);
assert.equal(known.length,180);
assert.deepEqual(known.slice(-52),gp.pages[57].indices.slice(43));

/** @returns {number[][]} Four NW-clockwise original rectangle rings. */
function rectangularRings() {
  const all=[];
  for(let depth=0;depth<4;depth++){
    const r=[],top=depth,bottom=31-depth,left=depth,right=7-depth;
    for(let x=left;x<=right;x++)r.push(top*8+x);
    for(let y=top+1;y<=bottom;y++)r.push(y*8+right);
    for(let x=right-1;x>=left;x--)r.push(bottom*8+x);
    for(let y=bottom-1;y>top;y--)r.push(y*8+left);
    all.push(r);
  }
  return all;
}
const rings=rectangularRings();
assert.deepEqual(rings.map(x=>x.length),[76,68,60,52]);
/**
 * Calculate a variable-step elimination permutation from the original
 * immutable cell numbers. The table is a separate source-derived key.
 * @param {number[]} numerals
 * @returns {number[]}
 */
function josephus(numerals) {
  const output=[];
  for(const ring of rings){
    const remaining=ring.slice();
    let cursor=0;
    while(remaining.length) {
      const skip=numerals[remaining[cursor]];
      const landing=(cursor+skip)%remaining.length;
      output.push(remaining.splice(landing,1)[0]);
      cursor=remaining.length?landing%remaining.length:0;
    }
  }
  assert.equal(output.length,256);
  assert.equal(new Set(output).size,256);
  return output;
}
/** @param {number[]} stream @param {number[]} permutation */
function decode(stream,permutation) {
  return permutation.map(i=>stream[i]);
}
/** @param {number[]} stream @param {number[]} permutation */
function encode(stream,permutation) {
  const output=new Array(stream.length);
  permutation.forEach((i,j)=>{output[i]=stream[j];});
  return output;
}
const ringPath=josephus(b);
const nativePlant=known.concat(known.slice(0,76));
assert.equal(nativePlant.length,256);
const cipherPlant=encode(nativePlant,ringPath);
assert.deepEqual(decode(cipherPlant,ringPath),nativePlant);
assert.deepEqual(encode(decode(original,ringPath),ringPath),original);
const wrongRing=josephus(b.slice().reverse());
const wrongMatches=decode(cipherPlant,wrongRing)
  .filter((v,i)=>v===nativePlant[i]).length;
assert(wrongMatches<256);

const candidate=decode(original,ringPath).slice(76);
const matching=known.map((v,i)=>Number(v===candidate[i]));
const ringMatches=[matching.slice(0,68).reduce((a,v)=>a+v,0),
  matching.slice(68,128).reduce((a,v)=>a+v,0),
  matching.slice(128).reduce((a,v)=>a+v,0)];
assert.deepEqual(ringMatches,[4,2,1]);
assert.equal(matching.reduce((a,v)=>a+v,0),7);
console.log(JSON.stringify({
  source:"p49-51 original base60 grid -> source-keyed clockwise shell Josephus",
  rule:"step = current original numeral; emit/remove landed cell; continue from successor",
  ringSizes:rings.map(x=>x.length),
  originalRunes:original.length,
  exactKnownTotal:180,
  knownMatches:7,
  knownMismatches:173,
  byInnerRing:ringMatches,
  deepest52Matches:ringMatches[2],
  nativeGpPlantRecovered:"256/256",
  wrongKeyPlantMatches:wrongMatches,
  originalRoundTrip:"256/256",
  verdict:"REJECT this one literal nonlinear shell transposition; no p55 plaintext"
},null,2));
