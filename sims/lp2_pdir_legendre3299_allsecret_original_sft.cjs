"use strict";
const assert=require("node:assert/strict");
const {originalWords,trace,GP,N,Q,KEY_STATES}=require("./lp2_pdir_cyclic256_allsecret_capacity_sft.cjs");

const P=3299, HALF=(P-1)/2;
const mod=(x,n)=>(x%n+n)%n;
function powMod(x,e,n){let r=1,b=mod(x,n);for(;e>0;e=Math.floor(e/2)){if(e%2)r=r*b%n;b=b*b%n;}return r;}
function isPrime(n){if(n<2)return false;for(let p=2;p*p<=n;p++)if(n%p===0)return false;return true;}
assert.equal(isPrime(P),true);
assert.equal(HALF,1649);
assert.equal(1649,17*97);
assert.equal(powMod(2,P-1,P),1);
assert.equal(powMod(2,HALF,P),P-1); // 2 is a non-residue; Euler criterion check.
function symbol3299(sum,zeroSign){
 const r=mod(sum,P);
 if(r===0)return zeroSign;
 const x=powMod(r,HALF,P);
 assert(x===1||x===P-1);
 return x===1?1:-1;
}
function wordDirections(sections,source,zeroSign){
 return sections.map(words=>words.map((word,i)=>
  symbol3299(source==="previous"?(i?words[i-1].G:0):word.G,zeroSign)));
}
function positivePlant(original){
 const control=GP.pages.find(p=>p.page===57).indices;
 assert.equal(control.length,95);
 const key=Array.from({length:KEY_STATES},(_,i)=>mod(7*i+11,Q));
 let j=0,previous=-1;
 const planted=original.map(section=>{
  let pointer=0,old=null,lastBackward=previous,prevSum=0;
  return section.map((word,wi)=>{
   const dir=symbol3299(wi?prevSum:0,1);
   const r=word.r.map(()=>{
    const plain=control[j++%control.length];
    const cipher=mod(plain+key[mod(pointer,KEY_STATES)],Q);
    pointer+=dir;
    return cipher;
   });
   prevSum=r.reduce((sum,v)=>sum+GP.prime[v],0);
   previous=r[r.length-1];
   return {...word,r,G:prevSum};
  });
 });
 assert.equal(j,N);
 const dirs=wordDirections(planted,"previous",1);
 const actual=trace(planted,dirs,{h:0,m:0,c:0,flip:0,skip:0},true);
 const cipherFlat=planted.flatMap(s=>s.flatMap(w=>w.r));
 const expected=Array.from({length:N},(_,i)=>control[i%control.length]);
 const got=cipherFlat.map((c,i)=>mod(c-key[actual.phases[i]],Q));
 assert.deepEqual(got,expected);
 return {symbols:N,exactInverse:true,exactReencryption:true,maximumSecretIoC:actual.maximumIoC};
}
function main(){
 const original=originalWords(),rows=[],zeroCounts={};
 for(const source of ["previous","current"]){
  for(const zeroSign of [-1,1]){
   const dirs=wordDirections(original,source,zeroSign);
   zeroCounts[source+":"+zeroSign]=original.flat().filter(w=>w.G%P===0).length;
   for(const flip of [0,1])for(const h of [0,1])for(const m of [0,1,2])
    for(const c of [0,1,2])for(const skip of [0,1]){
     const config={h,m,c,flip,skip},stat=trace(original,dirs,config);
     rows.push({source,zeroSign,...config,maxOne:stat.maxOne,maxTwo:stat.maxTwo,
       maximumIoC:stat.maximumIoC,maximumIoCNumerator:stat.maximumIoCNumerator,active:stat.active});
    }
  }
 }
 assert.equal(rows.length,288);
 rows.sort((a,b)=>b.maximumIoC-a.maximumIoC);
 const highest=rows[0],highestE=rows.reduce((m,r)=>Math.max(m,r.maxOne),0);
 const nativeIoCFloor=0.057816420842613,nativeEFloor=1397;
 const plant=positivePlant(original);
 const report={
  originalRunes:N,originalWords:original.flat().length,originalSections:original.map(s=>s.reduce((n,w)=>n+w.n,0)),
  source:"p15 red prime 3299; p15/floral register length 3299; T7 void span 1649=(3299-1)/2; 2016 word-number-direction hint",
  arithmetic:{modulus:P,prime:true,quadraticResidueSubgroupOrder:HALF,subgroupOrderFactorization:"17*97",zeroWordSums:zeroCounts},
  direction:"Legendre symbol of current or previous word GP-prime-value sum modulo 3299; zero maps to either sign",
  candidateModels:rows.length,highestPossibleAllSecretIoC:highest,highestPossibleE:highestE,
  nativeReferenceMinimumIoC:nativeIoCFloor,nativeReferenceMinimumE:nativeEFloor,
  frequencyGatePass:highest.maximumIoC>=nativeIoCFloor,eGatePass:highestE>=nativeEFloor,
  positivePlant:plant,recoveredOriginalUnknownPlaintext:false,
  scope:"Same cyclic-256 source-section-reset pointer family as the p=23 gate; 288 exact models, no hidden retries or secret chapter phases"
 };
 console.log(JSON.stringify(report,null,2));return report;
}
if(require.main===module)main();
module.exports={main,symbol3299,wordDirections};
