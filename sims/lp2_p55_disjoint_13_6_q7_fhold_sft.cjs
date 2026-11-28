'use strict';
/*
 * LP2 original p55: source-linked p56 literal-plaintext-F hold extension
 * to the independently solved 13-crib + six-symbol end q7 inverse.
 * Physical C=F in the unfit bridge only at local offset41, so both
 * possible exact clock paths are covered. No authentication of cribs.
 */
const assert=require('node:assert/strict');
const {p55,donor,plain,terminal,solveAffine,knownKey,encrypt,mod,norm,C}=
 require('./lp2_p55_disjoint_13_6_crib_lfsr7_sft.cjs');
const known=[
 {word:'ENLIGHTENMENT',P:plain('ENLIGHTENMENT'),source:'2014 witness'},
 {word:'MULTIBRANCHED',P:plain('MULTIBRANCHED'),source:'2014 witness'},
 {word:'CIRCUMFERENCE',P:plain('CIRCUMFERENCE'),source:'thematic only'}
];
const laws=['direct','feedback','beaufort'];
assert.deepEqual(p55.flatMap((v,i)=>v===0?[i]:[]),[15,25,41]);
function decodeAt(cipher,i,k,law) {
 if(law==='direct')return norm(cipher[i]-k);
 if(law==='feedback')return norm(cipher[i]-(i?cipher[i-1]:0)-k);
 if(law==='beaufort')return norm(k-cipher[i]);
 throw Error('law');
}
function calc(cipher,P,law,skipAt41){
 assert.equal(P.length,13);
 if(P.some((p,j)=>p===0&&cipher[23+j]!==0))
  return{invalidTransparentF:true,keysTried:0,validModels:0,bestOfSix:-1,fullMatches:[]};
 if(skipAt41)assert.equal(cipher[41],0);
 const init=P.map((p,i)=>knownKey(cipher,p,23+i,law));
 const sol=solveAffine(init);
 if(!sol||sol.rank!==6||sol.free.length!==1)
  return{insufficientRank:true,keysTried:0,validModels:0,bestOfSix:-1,fullMatches:[]};
 const out={keysTried:29,validModels:0,bestOfSix:-1,fullMatches:[]};
 for(let t=0;t<29;t++){
  const coeff=sol.a.map((a,i)=>norm(a+t*sol.v[i]));
  const K=init.slice();
  for(let i=13;i<76;i++)
   K[i]=norm(coeff.reduce((sum,a,j)=>sum+a*K[i-j-1],0));
  let cursor=13,legal=true;const decoded=[];
  for(let i=36;i<76;i++){
   if(i===41&&skipAt41){decoded.push(0);continue;}
   const p=decodeAt(cipher,i,K[cursor++],law);
   // Historical transparent-F: a plaintext F must be emitted as cipher F
   // WITHOUT consuming the key. It is illegal on any consuming branch.
   if(p===0)legal=false;
   decoded.push(p);
  }
  if(!legal)continue;
  out.validModels++;
  const last=decoded.slice(-6);
  const hits=last.filter((p,i)=>p===terminal[i]).length;
  out.bestOfSix=Math.max(out.bestOfSix,hits);
  if(hits===6)out.fullMatches.push({t,coeff,unfittedContinuation:decoded});
 }
 return out;
}
const original=[];
for(const {word,P,source} of known)for(const law of laws)for(const skipAt41 of [false,true]){
 const result=calc(p55,P,law,skipAt41);
 assert.equal(result.fullMatches?.length||0,0);
 if(word==='CIRCUMFERENCE')assert(result.invalidTransparentF);
 else assert(result.bestOfSix<=2);
 original.push({word,source,law,skipAt41,
  invalidTransparentF:!!result.invalidTransparentF,keysTried:result.keysTried,
  legalModels:result.validModels,bestOfSix:result.bestOfSix,
  completeHits:result.fullMatches?.length||0});
}
function encryptF(P,K,law){
 let cursor=0;const out=[];
 for(let i=0;i<P.length;i++){
  const p=P[i];
  if(p===0){out.push(0);continue;}
  const k=K[cursor++];
  if(law==='direct')out.push(norm(p+k));
  if(law==='feedback')out.push(norm(p+k+(i?out[i-1]:0)));
  if(law==='beaufort')out.push(norm(k-p));
 }
 return out;
}
const seed=[2,3,5,7,11,13,17],coef=[1,4,2,3,8,6,9],K=seed.slice();
for(let i=7;i<100;i++)K[i]=norm(coef.reduce((s,x,j)=>s+x*K[i-j-1],0));
const plants=[];
for(const skipAt41 of [false,true])for(const law of laws){
 const P=donor.slice().map(x=>x===0?1:x);
 P.splice(23,13,...known[0].P);P.splice(70,6,...terminal);
 P[41]=skipAt41?0:1;
 const cipher=encryptF(P,K,law);
 const result=calc(cipher,known[0].P,law,skipAt41);
 assert.equal(result.fullMatches.length,1);
 assert.deepEqual(result.fullMatches[0].coeff,coef);
 assert.deepEqual(result.fullMatches[0].unfittedContinuation,P.slice(36));
 plants.push({law,skipAt41,
  sourceNativePatchedUnfitRunes:40,matchingFullTerminalKeys:1,
  recoveredContinuationRings:40,exactSixTerminal:6});
}
console.log(JSON.stringify({
 scope:'physical source p55, word7 indices23..35, last6 indices70..75',
 sourceCipherFPositions:[15,25,41],
 hypothesis:'page-anchored consumed-key-order q7 with p56 literal plaintext F bypass',
 original,positivePlants:plants,
 limitation:'Original phrase cribs, GP single-letter rendering, homogeneous q7 recurrence, and p56 F hold transfer are not authenticated for p55'
},null,2));