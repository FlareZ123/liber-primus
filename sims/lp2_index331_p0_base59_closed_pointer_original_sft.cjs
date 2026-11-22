'use strict';

/**
 * Original 2014 index + LP2 p0 red title + 256-cell base59 pointer trail.
 *
 * Pinned primary index:
 * https://github.com/micheloosterhof/cicada-2014/blob/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion/index.html
 *
 * Original LP2 JPEGs: resources/liber-primus/17.jpg, 66.jpg, 67.jpg, 68.jpg.
 * Two addressed cells independently read on originals: 67.jpg p50 seventh
 * numeric row first cell "3L", 68.jpg p51 third numeric row fourth "18".
 *
 * The trail is a speculative clue path, not recovered original LP2 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-corpus.json'),'utf8'));
const tableSource = JSON.parse(fs.readFileSync(
  path.join(root, 'base60-grid.json'),'utf8'));
const tableCross = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-grid-256.json'),'utf8'));

const pub = 133;
const modulus = 331;
const redTitle = corpus.pages.find(x => x.page === 0).indices.slice(0, 13);
/** @param {number[]} seq @returns {number} */
const gpSum = seq => seq.reduce((sum, i) => sum + corpus.prime[i],0);
const left = gpSum(redTitle.slice(0,8));
const right = gpSum(redTitle.slice(8));
assert.equal(left, 347);
assert.equal(right, 315);
assert.equal(left + right, 2 * modulus);
assert.equal(redTitle[0],redTitle[8]);
assert.equal(redTitle[0] + 1, 16);
assert.equal(left - modulus,redTitle[0] + 1);
assert.equal(modulus - right,redTitle[8] + 1);
assert.equal(redTitle[2],18);
assert.equal(redTitle[10],18);

/** @param {number} a @param {number} e @param {number} n */
function modPow(a,e,n) {
  let out = 1;
  let b = ((a % n)+n)%n;
  for (let k=e;k>0;k=Math.floor(k/2)) {
    if (k%2) out=(out*b)%n;
    b=(b*b)%n;
  }
  return out;
}
assert.equal(pub*67 % (modulus-1),1);
assert.equal(corpus.prime[redTitle[2]],67);
const addrA=modPow(left,pub,modulus);
const addrB=modPow(right,pub,modulus);
assert.equal(addrA,203);
assert.equal(addrB,128);
assert.equal(addrA+addrB,modulus);

const fullAlphabet=tableSource.alphabet;
assert.equal(fullAlphabet,'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
const rows=tableSource.rows;
assert.equal(rows.length,32);
assert.ok(rows.every(row=>row.length===8));
const tokens=rows.flat();
assert.equal(tokens.length,256);
const present=new Set(tokens.join(''));
assert.equal(present.has('f'),false,'Original absent lowercase f');
const alphabet=fullAlphabet.replace('f','');
assert.equal(alphabet.length,59);
assert.equal([...alphabet].every(x=>present.has(x)),true,
  'All other base60 characters occur in printed table');
const read=(token,alphabet,basis) =>
  basis*alphabet.indexOf(token[0])+alphabet.indexOf(token[1]);
const values=tokens.map(t=>read(t,alphabet,59));
const conventional=tokens.map(t=>read(t,fullAlphabet,60));
assert.ok(values.every(v=>v>=0&&v<256));
assert.equal(tableCross.pages.flatMap(p=>p.tokens).length,256);
assert.deepEqual(tokens,tableCross.pages.flatMap(p=>p.tokens));
assert.deepEqual(conventional,tableCross.pages.flatMap(p=>p.bytes));
assert.equal(tokens[addrA],'18');
assert.equal(tokens[addrB],'3L');
assert.equal(values[addrA],67,'First source-computed address returns inverse exponent');
assert.equal(values[addrB],198,'Second source-computed address returns modulus - public');
assert.equal(values[addrB],modulus-pub);
assert.equal(conventional[addrA],68);
assert.equal(conventional[addrB],201);

const completeTrail=[128,198,103,203,67,189,189];
const expectedTokens=['3L','1j','3Q','18','3C','3C'];
for(let i=0;i<completeTrail.length-1;i++) {
  const at=completeTrail[i];
  assert.equal(tokens[at],expectedTokens[i]);
  assert.equal(values[at],completeTrail[i+1]);
}
assert.equal(values[189],189,'Terminal original base59 self-loop');
const candidateDigits=[203,128,67,198,103,189].map(index=>({
  index,
  row:Math.floor(index/8)+1,
  col:index%8+1,
  token:tokens[index],
  radix59:values[index],
  radix60:conventional[index]
}));

// Exact conditional random-multiset probability of seeing both selected
// table outputs. This comparison presumes those two target values had
// already been specified; it is NOT a postselection-corrected p-value.
const count=value=>values.filter(v=>v===value).length;
assert.equal(count(67),2);
assert.equal(count(198),2);
const exactPairNull=count(67)*count(198)/(256*255);
assert.equal(exactPairNull,1/16320);

/**
 * Conditional *matched* shuffle: keep the two observed table cells fixed,
 * uniformly shuffle the remaining original 254 values, and count how often
 * the source-chosen B address eventually reaches A, or reaches in exactly
 * three pointer moves. Reproduces the source multiset and the two-level
 * conditioning; the ancestral relation itself was discovered post hoc.
 */
let randomSeed=0x9e3779b9 >>> 0;
function randomInt(n) {
  randomSeed ^= randomSeed << 13;
  randomSeed ^= randomSeed >>> 17;
  randomSeed ^= randomSeed << 5;
  return (randomSeed >>> 0) % n;
}
const free=Array.from({length:256},(_,i)=>i)
  .filter(i=>i!==addrA&&i!==addrB);
const samples=30000;
let reachesThree=0;
let reachesEver=0;
for(let trial=0;trial<samples;trial++){
  const perm=values.slice();
  for(let i=free.length-1;i>0;i--){
    const j=randomInt(i+1);
    [perm[free[i]],perm[free[j]]] =
      [perm[free[j]],perm[free[i]]];
  }
  let node=perm[addrB]; // 128 -> 198 is one fixed step
  const seen=new Set([addrB,node]);
  for(let depth=2;depth<=256;depth++){
    node=perm[node];
    if(node===addrA){
      reachesEver++;
      if(depth===3)reachesThree++;
      break;
    }
    if(seen.has(node))break;
    seen.add(node);
  }
}
// This sample is descriptive; self-assert the seeded result exactly for drift.
assert.equal(reachesThree,131);
assert.equal(reachesEver,2228);

console.log('INDEX red pair GP sums:',left,right,
  'shared S ordinal',redTitle[0]+1);
console.log('INDEX 2014 source literal (e,p)=',pub,modulus,
  'derived reciprocal exponent 67 = prime ordinal(331) = GP(E)');
console.log('INDEX exponent-produced addresses=',addrA,addrB);
console.log('ORIGINAL addressed table cells and cross-radix:',JSON.stringify(candidateDigits));
console.log('ORIGINAL base59 directed trail:',completeTrail.join(' -> '));
console.log('PAIR exact matched-multiset probability=',exactPairNull,
  ' (descriptive conditional, not author-intent significance)');
console.log('CONDITIONAL matched 30000 original-value shuffles:',
  'B reaches A in exactly3=',reachesThree,
  'in any positive number of hops=',reachesEver);
console.log('PASS: first-party metadata, unchanged rune and table values,' +
  ' both source-addressed cells, cross-physical-page pointer trail and null.');
