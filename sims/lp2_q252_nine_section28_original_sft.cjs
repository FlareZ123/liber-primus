'use strict';
/**
 * LP2 original-source H×G polynomial quotient as nine 28-value section keys.
 *
 * Authenticated source operands:
 * - signed 2013 BASE29 example 3301 -> 3QO gives H=[3,26,24];
 * - three original red p39 rune indices give G=[27,5,15];
 * - the original p49-51 base60 grid supplies 256 coefficients.
 *
 * The quotient's exact length 252 = 9 unknown printed sections × 28 non-F
 * GP rune indices suggests one 28-value circular key per section. This
 * hypothesis does not assume it was actually the historical use of the table.
 *
 * Reproducer: node sims/lp2_q252_nine_section28_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
/** @param {string} name */
const read=name=>JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus',name),'utf8'));
const corpus=read('lp2-corpus.json');
const grid=read('lp2-grid-256.json');
/** @param {number} n */
const mod=n=>(n%29+29)%29;
/** @param {number[]} a @param {number[]} b */
function mul(a,b){
 const out=Array(a.length+b.length-1).fill(0);
 for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
  out[i+j]=mod(out[i+j]+a[i]*b[j]);
 return out;
}
const ascending=mul([3,26,24],[27,5,15]);
assert.deepEqual(ascending,[23,21,11,17,12]);
const divisor=ascending.slice().reverse();
assert.deepEqual(divisor,[12,17,11,21,23]);
assert.equal(mod(17*divisor[0]),1);
assert.equal(grid.bytes.length,256);
const remainder=grid.bytes.map(mod);
const q=[];
for(let i=0;i<252;i++){
 const value=mod(remainder[i]*17);
 q.push(value);
 for(let j=0;j<divisor.length;j++)
  remainder[i+j]=mod(remainder[i+j]-value*divisor[j]);
}
assert.deepEqual(remainder.slice(252),[0,0,0,0]);
assert.equal(q.length,252);
assert.deepEqual(q.slice(0,20),[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]);
const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expectedLengths=[729,1145,1729,1903,1021,1433,1680,3008,308];
assert.equal(expectedLengths.reduce((a,b)=>a+b,0),12956);
/**
 * Exact non-consuming-plaintext-F inverse over all legal key pointers.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign P=(C + sign * K) mod29
 * @returns {{firstDead:number|null,peak:number,final:number}}
 */
function exactInverse(cipher,key,sign){
 let paths=new Set([0]),peak=1;
 for(let i=0;i<cipher.length;i++){
  const next=new Set();
  for(const used of paths){
   if(cipher[i]===0)next.add(used);
   const p=mod(cipher[i]+sign*key[used%key.length]);
   if(p!==0)next.add(used+1);
  }
  paths=next;
  peak=Math.max(peak,paths.size);
  if(paths.size===0)return {firstDead:i,peak,final:0};
 }
 return {firstDead:null,peak,final:paths.size};
}
/**
 * Independent plant that applies the authentic F bypass rule to a hypothetical key.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function plant(plain,key,sign){
 let used=0;
 return plain.map(p=>{
  if(p===0)return 0;
  const c=mod(p-sign*key[used%key.length]);
  used++;
  return c;
 });
}
/** @param {number[]} xs */
function ioc29(xs){
 const counts=Array(29).fill(0);
 for(const x of xs)counts[x]++;
 return 29*counts.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
const known=corpus.pages.find(p=>p.page===57);
assert(known);
assert.equal(known.indices.length,95);
const expectedFirstDead=[
 [40,39],[142,19],[0,13],[60,113],[37,24],
 [8,2],[43,67],[18,40],[0,36]
];
const outcomes=[];
for(let i=0;i<sections.length;i++){
 const [first,last]=sections[i];
 const ciphertext=corpus.pages.filter(
  p=>p.page>=first&&p.page<=last).flatMap(p=>p.indices);
 const key=q.slice(28*i,28*(i+1));
 assert.equal(ciphertext.length,expectedLengths[i]);
 assert.equal(key.length,28);
 const tests=[];
 for(const sign of /** @type {const} */ ([-1,1])){
  const decoded=ciphertext.map((x,j)=>mod(x+sign*key[j%28]));
  const rebuilt=decoded.map((x,j)=>mod(x-sign*key[j%28]));
  assert.deepEqual(rebuilt,ciphertext);
  const exact=exactInverse(ciphertext,key,sign);
  assert.equal(exact.firstDead,expectedFirstDead[i][sign===-1?0:1]);
  const positive=plant(known.indices,key,sign);
  const positiveInverse=exactInverse(positive,key,sign);
  assert.equal(positiveInverse.firstDead,null);
  tests.push({sign,uniformClockIoC29:ioc29(decoded),legalFInverse:exact,
   positiveRUnes:known.indices.length});
 }
 outcomes.push({section:[first,last],runes:ciphertext.length,
  keyUnique:new Set(key).size,tests});
}
console.log(JSON.stringify({status:'PASS',source:'signed 2013 H × original p39 G; p49-51 grid',
 originalInputRunes:12956,quotientLength:q.length,sectionCount:sections.length,
 keyLengthPerSection:28,remainder:remainder.slice(252),
 outcomes,unknownPlaintextRecovered:0},null,2));
