'use strict';
/**
 * LP2 p0 independent source H*G GF29 quartic: exact multiplicative cipher
 * inversion on the ORIGINAL red 8|5 title, without any phrase crib.
 *
 * Model C[t] = b + P[t] * K[s] (mod29), with arbitrary b∈[0,28]
 * and 4 independent K seed symbols; scale a cancels in homogeneous
 * recurrence, so this covers C=b+a*P*K for every a≠0.
 * Source K quartic f(X)=14+9X+13X²+28X³+X⁴ or reciprocal.
 * Only original plaintext F passes literally and consumes no key.
 * The eighth red ciphertext F is tested as literal and encrypted non-F.
 *
 * All 8/5 native GP English source words are checked with a GF29 residual
 * hash join. For each 29-value b, ∑ f_i (C-b)/P must be identically 0
 * over the last 8/9 title positions. No optimized lexical score,
 * guessed finite seed or source-external initial offset is introduced.
 *
 * Four planted two-word original-layout native-GP ciphertext positives
 * prove the inverse can recover exact title and b in both F readings.
 *
 * Reproduce: node sims/lp2_p0_hg_quartic_multiplicative_title_sft.cjs
 * Windows Node.js 22, CommonJS, read-only, no packages.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source=gp.pages.find(p=>p.page===0).indices.slice(0,13);
const mod=x=>(x%29+29)%29;
const inverse=Array.from({length:29},(_,a)=>{
 if(a===0)return 0;
 for(let b=1;b<29;b++)if(a*b%29===1)return b;
 throw Error('No inverse');
});
const tokens=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} word @returns {number[]|null} */
function encode(word) {
 word=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const result=[];
 for(let i=0;i<word.length;){
  if(word.startsWith('ING',i)){result.push(21);i+=3;continue;}
  if(word.startsWith('IO',i)){result.push(27);i+=2;continue;}
  const token=tokens.find(t=>word.startsWith(t.s,i));
  if(!token)return null;
  result.push(token.i);i+=token.s.length;
 }
 return result;
}
const first8=[],second5=[];
for(const m of read('resources/control/english_wordfreq_textblob.txt')
 .matchAll(/^([a-z]+) (\d+)$/gm)){
 const values=encode(m[1]);
 if(!values)continue;
 const candidate={word:m[1],values,freq:Number(m[2])};
 if(values.length===8)first8.push(candidate);
 if(values.length===5&&values.every(x=>x!==0))second5.push(candidate);
}
assert.equal(first8.length,4331);
assert.equal(second5.length,3320);
const literalFirst=first8.filter(u=>u.values[7]===0 &&
 u.values.slice(0,7).every(v=>v!==0));
const encryptedFirst=first8.filter(u=>u.values.every(v=>v!==0));
assert.equal(literalFirst.length,5);
assert.equal(encryptedFirst.length,3872);
assert.deepEqual(source,
 [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const H=[3,26,24],G=[27,5,15],product=Array(5).fill(0);
for(let i=0;i<3;i++)for(let j=0;j<3;j++)
 product[i+j]=mod(product[i+j]+H[i]*G[j]);
assert.deepEqual(product,[23,21,11,17,12]);
const forward=product.map(x=>mod(x*inverse[product[4]]));
assert.deepEqual(forward,[14,9,13,28,1]);
/** @param {number[]} f @param {number[]} initial @param {number} n */
function extend(f,initial,n){
 const out=initial.slice();
 while(out.length<n){
  const t=out.length;let sum=0;
  for(let j=0;j<4;j++)sum+=f[j]*out[t-4+j];
  out.push(mod(-sum*inverse[f[4]]));
 }
 return out;
}
/** @param {number[]} a */
const mapKey=a=>a.join(',');
/** Exact residual inverse, without arbitrary seed search. */
function search(C,f,literal){
 assert.equal(C.length,13);
 assert.equal(C[7],0);
 assert(C.slice(0,7).every(x=>x!==0));
 assert(C.slice(8).every(x=>x!==0));
 const ct=literal?C.slice(0,7).concat(C.slice(8)):C.slice();
 const left=literal?7:8;
 const first=literal?literalFirst:encryptedFirst;
 const count=ct.length-4;
 const mat=Array.from({length:count},(_,r)=>
  Array.from({length:ct.length},(_,j)=>
   j>=r&&j<r+5?f[j-r]:0));
 /**
  * Contribution to the recurrence of a word's values, with no guessing
  * of its neighboring word.
  * @param {number[]} word @param {number} start @param {number} b
  */
 function projection(word,start,b){
  return mat.map(row=>mod(word.reduce((sum,p,j)=>
   sum+row[start+j]*mod((ct[start+j]-b)*inverse[p]),0)));
 }
 const candidates=[];
 let tried=0;
 for(let b=0;b<29;b++){
  const rhs=new Map();
  for(const w of second5){
   const key=mapKey(projection(w.values,left,b));
   const a=rhs.get(key)||[];a.push(w);rhs.set(key,a);
  }
  for(const u of first){
   const lhs=projection(u.values.slice(0,left),0,b);
   const need=mapKey(lhs.map(x=>mod(-x)));
   const bucket=rhs.get(need);
   if(!bucket)continue;
   for(const v of bucket){
    const P=u.values.slice(0,left).concat(v.values);
    const initial=P.slice(0,4).map((x,i)=>
     mod((ct[i]-b)*inverse[x]));
    const K=extend(f,initial,ct.length);
    assert(P.every((x,i)=>mod(b+x*K[i])===ct[i]),
     'Exact original ciphertext forward replay');
    tried++;
    candidates.push({title:u.word+' '+v.word,b,seed:initial,
     frequency:u.freq*v.freq});
   }
  }
 }
 candidates.sort((a,b)=>b.frequency-a.frequency);
 return {role:literal?'literalF':'encryptedNonF',
  originalTitleRuneCount:C.length,activeRunes:ct.length,
  searchedFirstWords:first.length,secondWords:second5.length,
  freeParameters:{offsetB:29,initialState:'all 29^4 values implicitly'},
  count:tried,top:candidates.slice(0,8),candidates};
}
/** Plant a source-authentic synthetic title with a fixed original F role. */
function positive(f,literal){
 const words=literal?['YOURSELF','SEEKS']:['EPIPHANY','SEEKS'];
 const P=words.flatMap(encode),b=7;
 assert.equal(P.length,13);
 for(let nonce=0;nonce<10000;nonce++){
  const initial=Array.from({length:4},(_,i)=>
   mod(3+11*i+nonce*(i+3)));
  if(!literal){
   const basis=Array.from({length:4},(_,j)=>{
    const t=Array(4).fill(0);t[j]=1;
    return extend(f,t,8)[7];
   });
   const target=basis.findIndex(x=>x!==0);
   assert(target>=0);
   const old=extend(f,initial,8)[7];
   const wanted=mod(-b*inverse[P[7]]);
   initial[target]=mod(initial[target]+mod(wanted-old)*inverse[basis[target]]);
  }
  const K=extend(f,initial,13);
  const cipher=[];let clock=0;
  for(const p of P){
   if(literal&&p===0)cipher.push(0);
   else cipher.push(mod(b+p*K[clock++]));
  }
  if(cipher.filter(x=>x===0).length!==1||cipher[7]!==0)continue;
  const found=search(cipher,f,literal);
  assert(found.candidates.some(c=>c.title===words.join(' ').toLowerCase()
   &&c.b===b),'Planted original-width GP29 title must be recovered');
  return {title:words.join(' '),b,seed:initial,
   syntheticCipher:cipher,recovered:true};
 }
 throw Error('No proper synthetic F-role calibration sample');
}
const output=[];
for(const [orientation,f] of [['forward',forward],
 ['reciprocal',forward.slice().reverse()]]){
 for(const literal of [true,false]){
  const planted=positive(f,literal);
  const original=search(source,f,literal);
  assert.equal(original.count,0,'No source English native titles for this model');
  output.push({orientation,role:original.role,planted,
   sourceCount:original.count,firstWords:original.searchedFirstWords,
   secondWords:original.secondWords});
 }
}
console.log(JSON.stringify({status:'PASS',
 source:'original LP2 p0 title and original 2013/p39/p50 GF29 quartic',
 method:'exhaustive native-English GP29 polynomial-residual multiplicative inverse',
 conclusion:'No two-word English p0 title under this source-multiplicative quartic model',
 fourPlantedPositiveControls:output.length,
 output},null,2));
