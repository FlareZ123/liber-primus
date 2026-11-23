'use strict';
/**
 * One-file original-source SFT for 2016 image prime ranks to LP2 table/p32.
 * Exact visible dimensions and printed page-15/p32 material. No cipher claim.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, '../resources/liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(dir, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(dir, 'base60-grid.json'), 'utf8'));
const C = gp.pages.find(page => page.page === 32).indices;
const tokens = grid.rows.flat();
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f','');
/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if(n < 2) return false;
  for(let d=2;d*d<=n;d++) if(n%d===0) return false;
  return true;
}
/** @param {number} n @returns {number} */
function ordinal(n) {
  let k=0;
  for(let x=2;x<=n;x++) if(isPrime(x)) k++;
  assert.ok(isPrime(n),'given image dimension is prime');
  return k;
}
/** @param {string} token @param {string} digits @returns {number} */
function decode(token,digits) {
  assert.equal(token.length,2);
  const hi=digits.indexOf(token[0]),lo=digits.indexOf(token[1]);
  assert.ok(hi>=0 && lo>=0);
  return hi*digits.length+lo;
}
/** @param {number} n @returns {number} */
function phi(n) {
  let count=0;
  for(let k=1;k<=n;k++) {
    let a=k,b=n;
    while(b) [a,b]=[b,a%b];
    if(a===1) count++;
  }
  return count;
}
assert.equal(C.length,121);
assert.equal(tokens.length,256);
assert.equal(alphabet60.length,60);
assert.equal(alphabet59.length,59);
const axis0=C.slice(0,11).reduce((s,v)=>s+gp.prime[v],0);
const axis1=C.filter((_,i)=>i%11===0).reduce((s,v)=>s+gp.prime[v],0);
assert.deepEqual([axis0,axis1],[563,569]);
const widthRank=ordinal(axis0),heightRank=ordinal(axis1);
assert.deepEqual([widthRank,heightRank],[103,104]);
const cells=[widthRank-1,heightRank-1];
const twoTokens=cells.map(i=>tokens[i]);
assert.deepEqual(twoTokens,['0W','3Q']);
const base60=cells.map(i=>decode(tokens[i],alphabet60));
const base59=cells.map(i=>decode(tokens[i],alphabet59));
assert.deepEqual(base60,[32,206]);
assert.deepEqual(base59,[32,203]);
const BUDS=[17,1,23,15];
assert.deepEqual(C.slice(93,97),BUDS);
assert.equal(BUDS.map(i=>gp.translit[i]).join(''),'BUDS');
const budPrime=BUDS.reduce((s,v)=>s+gp.prime[v],0);
assert.equal(budPrime,206);
assert.deepEqual(C.slice(102,104),[18,9]);
assert.equal(phi(gp.prime[18]+gp.prime[9]),32);
assert.equal(phi(budPrime),102);
assert.equal(base60[0],32);
assert.equal(base60[1],budPrime);
const base60Bytes=tokens.map(v=>decode(v,alphabet60));
const c206=base60Bytes.filter(v=>v===206).length;
const c32=base60Bytes.filter(v=>v===32).length;
assert.deepEqual([c206,c32],[1,3]);
const originalP32FourPositions=C.flatMap((_,i)=>
  i+4<=C.length && C.slice(i,i+4).reduce((s,v)=>s+gp.prime[v],0)===206?[i]:[]);
assert.deepEqual(originalP32FourPositions,[93,94]);
const decoded59Candidate=decode(tokens[103],alphabet59);
assert.equal(decoded59Candidate,203);
assert.notEqual(decoded59Candidate,budPrime);
console.log(JSON.stringify({
  signed2016Dimensions:[axis0,axis1],
  oneBasedPrimeRanks:[widthRank,heightRank],
  p50Addresses:cells,
  sourceTokens:twoTokens,
  base60Values:base60,
  base59Values:base59,
  p32WordAtPrimeRanks:'EN',
  p32EnPrimeSum:96,
  phi96:phi(96),
  p32BudOffset:93,
  p32BudGPPrime:budPrime,
  phi206:phi(budPrime),
  byte206Multiplicity:c206,
  byte32Multiplicity:c32,
  p32FourRuneSum206Starts:originalP32FourPositions,
  conditionalKnownAddressNull:'1/255 for value206 at cell103 after fixing cell102=32, under exact multiset position shuffle; selection-conditioned only',
  status:'Source-side navigational correspondence. No new plaintext, key or cipher.'
},null,2));
