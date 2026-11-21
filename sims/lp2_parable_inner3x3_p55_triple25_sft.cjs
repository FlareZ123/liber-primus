"use strict";

/**
 * Original-source LP2 p50 PARABLE-selected inner-3x3 tile -> p55
 * three 5x5 GP29 rune matrices deconvolution. The solved p57 "shed circumferences" wording,
 * original 5x5 corners and p55 75-full-word body divided into three 25-rune clauses selects this
 * specific key shape. Four fixed radix/orientation cases, no key search.
 *
 * Windows Node.js 22, CommonJS, no packages, read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(base, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens = grid.pages.flatMap(page => page.tokens);
const text = read("resources/liber-primus/lp2-transcription.txt").split("%");
const modulus = 29;
/** @param {number} n */
const mod = n => ((n % modulus) + modulus) % modulus;

/** @param {number} a */
function inverse(a) {
  a = mod(a);
  assert.notEqual(a, 0);
  for (let j = 1; j < modulus; j++) if (mod(j*a) === 1) return j;
  throw new Error("unreachable inverse");
}
/** @param {number} n */
function primeRank(n) {
  let total = 0;
  for (let value = 2; value <= n; value++) {
    let prime = true;
    for (let d = 2; d*d <= value; d++) if (value%d === 0) {prime=false;break;}
    if (prime) total++;
  }
  return total;
}
const p57 = gp.pages[57].indices;
const sums = [p57.slice(7,37),p57.slice(37,67),p57.slice(67,95)]
  .map(xs => xs.reduce((acc,i)=>acc+gp.prime[i],0));
assert.deepEqual(sums,[1259,1031,1229]);
const roots=sums.map(primeRank);
assert.deepEqual(roots,[205,173,201]);
assert.deepEqual(roots.map(i=>[Math.floor(i/8),i%8]),[[25,5],[21,5],[25,1]]);
const corner=roots[1]+roots[2]-roots[0];
assert.equal(corner,169);
const tile=Array.from({length:5},(_,r)=>
  Array.from({length:5},(_,c)=>tokens[(21+r)*8+1+c]));
assert.deepEqual(tile[0],["3m","4E","0s","2S","1v"]);
assert.deepEqual(tile[4],["1E","3T","18","3E","1G"]);
const inner=tile.slice(1,4).map(row=>row.slice(1,4));
assert.deepEqual(inner,[["2k","2t","2O"],["0J","1L","0c"],["2d","1T","2u"]]);
const digitSets={60:grid.alphabet,59:grid.alphabet.replace("f","")};
/**
 * @param {string} token
 * @param {number} radix
 */
function number(token,radix) {
  const digits=digitSets[radix];
  const a=digits.indexOf(token[0]),b=digits.indexOf(token[1]);
  assert(a>=0&&b>=0);
  return radix*a+b;
}

/** @param {number} radix */
function key(radix) {
  const raw=inner.map(row=>row.map(token=>number(token,radix)));
  const total=raw.flat().reduce((a,b)=>a+b,0);
  const normalizer=mod(total);
  assert.notEqual(normalizer,0);
  return {raw,total,normalizer,values:raw.map(row=>row.map(mod))};
}
assert.equal(key(59).total,1032);
assert.equal(key(60).total,1047);
assert.equal(number(tokens[169],59),224);
assert.equal(number(tokens[169],60),228);
assert.equal(gp.pages[55].indices.length,76);
const C=gp.pages[55].indices.slice(1);
assert.equal(C.length,75);
const N=5, NN=N*N;
/**
 * @param {number[][]} kernel
 * @param {"convolution"|"correlation"} sense
 * @returns {Int32Array[]}
 */
function makeMatrix(kernel,sense) {
  const A=Array.from({length:NN},()=>new Int32Array(NN));
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    const dst=r*N+c;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const sr=r+dy,sc=c+dx;
      if(sr<0||sr>=N||sc<0||sc>=N)continue;
      const kr=sense==="correlation"?dy+1:1-dy;
      const kc=sense==="correlation"?dx+1:1-dx;
      A[dst][sr*N+sc]=kernel[kr][kc];
    }
  }
  return A;
}
/**
 * Exact finite-field inverse on a fully specified image kernel.
 * @param {Int32Array[]} A
 * @param {number[]} B
 * @returns {number[]|null}
 */
function solve(A,B) {
  const w=A.length;
  const aug=Array.from({length:w},(_,r)=>{
    const row=new Int32Array(w+1);
    row.set(A[r]);
    row[w]=mod(B[r]);
    return row;
  });
  for(let c=0;c<w;c++) {
    let pivot=c;
    while(pivot<w&&aug[pivot][c]===0)pivot++;
    if(pivot>=w)return null;
    if(pivot!==c){const tmp=aug[c];aug[c]=aug[pivot];aug[pivot]=tmp;}
    const inv=inverse(aug[c][c]);
    for(let j=c;j<=w;j++)aug[c][j]=mod(aug[c][j]*inv);
    for(let r=0;r<w;r++){
      if(r===c||aug[r][c]===0)continue;
      const scale=aug[r][c];
      for(let j=c;j<=w;j++)aug[r][j]=mod(aug[r][j]-scale*aug[c][j]);
    }
  }
  return aug.map(row=>row[w]);
}
/**
 * Forward encryption defined by the same source tile, normalized like a
 * conventional image-blur filter.
 * @param {Int32Array[]} A
 * @param {number[]} P
 * @param {number} norm
 */
function forward(A,P,norm) {
  const inv=inverse(norm);
  return A.map(row=>{
    let total=0;
    for(let j=0;j<NN;j++)total+=row[j]*P[j];
    return mod(total*inv);
  });
}
/** @param {number[]} P */
function ioc(P) {
  const n=new Int32Array(29);
  for(const x of P)n[x]++;
  return n.reduce((sum,x)=>sum+x*(x-1),0)/(P.length*(P.length-1));
}
const rx=new RegExp("["+gp.runes.join("")+"]+","gu");
const sourceText=text[54].replace(/[/\r\n]/gu,"");
const physicalWords=[...sourceText.matchAll(rx)].map(m=>[...m[0]].map(r=>gp.runes.indexOf(r)));
assert.equal(physicalWords.flat().length,76);
assert.equal(physicalWords[0].length,1);
const latin=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const lexicon=new Set();
for(const hit of read("resources/control/english_wordfreq_textblob.txt").matchAll(/^[A-Za-z]+/gmu)){
  const english=hit[0].toUpperCase()
    .replace(/ING/gu,"NG").replace(/K|Q/gu,"C")
    .replace(/V/gu,"U").replace(/Z/gu,"S");
  let n=0,letters=[];
  while(n<english.length){
    const token=latin.find(t=>english.startsWith(t.s,n));
    if(!token){letters=[];break;}
    letters.push(token.i);n+=token.s.length;
  }
  if(letters.length)lexicon.add(letters.map(x=>String.fromCharCode(65+x)).join(""));
}
assert(lexicon.size>20000);
const lengths=physicalWords.slice(1).map(w=>w.length);
assert.equal(lengths.reduce((a,b)=>a+b,0),75);
function matchCount(P) {
  let hits=0,long=0,pos=0;
  for(const n of lengths){
    if(n>=4){
      long++;
      if(lexicon.has(P.slice(pos,pos+n).map(x=>String.fromCharCode(65+x)).join("")))hits++;
    }
    pos+=n;
  }
  return {long,hits};
}
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const sourceRunes=[
  solved.sections.find(s=>s.name==="p56_an_end").source_text,
  solved.sections.find(s=>s.name==="p57_parable").source_text
].join("");
const control=[...sourceRunes].filter(r=>gp.runes.includes(r))
  .map(r=>gp.runes.indexOf(r)).slice(0,75);
assert.equal(control.length,75);

const results=[];
for(const radix of [59,60]){
  const k=key(radix);
  for(const sense of ["convolution","correlation"]){
    const A=makeMatrix(k.values,sense);
    const originalBlocks=[];
    const plaintextBlocks=[];
    const positiveBlocks=[];
    let singular=false;
    for(let block=0;block<3;block++){
      const actualCipher=C.slice(block*NN,(block+1)*NN);
      const decoded=solve(A,actualCipher.map(x=>mod(x*k.normalizer)));
      if(decoded===null) {singular=true;break;}
      assert.deepEqual(forward(A,decoded,k.normalizer),actualCipher);
      const truePlain=control.slice(block*NN,(block+1)*NN);
      const encryptedPlant=forward(A,truePlain,k.normalizer);
      const recoveredPlant=solve(A,encryptedPlant.map(x=>mod(x*k.normalizer)));
      assert.deepEqual(recoveredPlant,truePlain);
      originalBlocks.push(actualCipher);
      plaintextBlocks.push(decoded);
      positiveBlocks.push(recoveredPlant);
    }
    if(singular){
      results.push({radix,sense,sourceStatus:"singular"});
      continue;
    }
    const original=originalBlocks.flat();
    const decoded=plaintextBlocks.flat();
    assert.equal(decoded.length,75);
    assert.deepEqual(original,C);
    assert.deepEqual(positiveBlocks.flat(),control);
    results.push({
      radix,sense,kernel:k.values,sum:k.total,normalizedMod29:k.normalizer,
      originalReencrypted:75,plantedSolvedRecovered:75,
      originalIoC:ioc(C),decodedIoC:ioc(decoded),
      printedLongWordHits:matchCount(decoded),
      displayBlocks:plaintextBlocks.map(xs=>xs.map(x=>gp.translit[x]).join(" ")),
      nativeAlphabetIndices:decoded
    });
  }
}
assert.equal(results.length,4);
console.log(JSON.stringify({
  status:"PASS",
  source:"p57 PARABLE prime rank selected p50 rectangle and inner3x3 kernel",
  receiver:"p55 original 75 post-carry intact-word ciphertext runes; three 25-rune matrices",
  readouts:results,
  caution:"one zero-padded normalized convolution family; no optimized parameters"
},null,2));
