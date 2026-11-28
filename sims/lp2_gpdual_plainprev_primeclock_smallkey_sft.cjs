"use strict";
/*
 * Issue #3284: algebraically small GP index/prime-label plaintext-feedback cipher,
 * original p0-p2 receiver with an independent native text/calibration.
 *
 * Model:  C_i = P_i + a*prime(P_{i-1}) + b*P_{i-1} + (q_i-1)  (mod29),
 *   q_i = (i+1)th ordinary prime, first q_0=2;
 *   P_-1 = secret predecessor, one source-visible chapter reset.
 * This is *not* a claim Cicada wrote this rule. No word boundaries, chosen
 * plaintext cribs, page-specific keys, clock phase, unknown runes, or F holds
 * are used to optimize the family.
 *
 * All 29^3 candidate triples (a,b,P_-1) are covered. A fixed predecessor
 * makes every next-glyph encryption an exact permutation. The single-symbol
 * prime map is NOT in general injective and is never inverted in isolation.
 *
 * Runs under Node 22 from repo root:
 *   node sims/lp2_gpdual_plainprev_primeclock_smallkey_sft.cjs
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const N=29,mod=x=>((x%N)+N)%N,primes=gp.prime;
assert.equal(primes.length,29);
const pS=primes.map(x=>x%29);
const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpRunes(txt){
 let out=[];
 for(const v of txt.toUpperCase().match(/[A-Z]+/g)||[]){
  const s=v.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  for(let j=0;j<s.length;){
   const r=tok.find(x=>s.startsWith(x.s,j));
   assert(r,"Bad GP letter "+s.slice(j));
   out.push(r.i);j+=r.s.length;
  }
 }
 return out;
}
function nthPrimes(n) {
 const out=[];for(let x=2;out.length<n;x++){
   let prime=true;for(let d=2;d*d<=x;d++)if(x%d===0){prime=false;break}
   if(prime)out.push(x);
 }return out;
}
const S=nthPrimes(729).map(q=>(q-1)%29);
function enc(P,a,b,prev){
 const C=[];for(let i=0;i<P.length;i++){
   const p=P[i];C.push(mod(p+a*pS[prev]+b*prev+S[i]));prev=p;
 }return C;
}
function dec(C,a,b,prev){
 const P=[];for(let i=0;i<C.length;i++){
   const p=mod(C[i]-a*pS[prev]-b*prev-S[i]);P.push(p);prev=p;
 }return P;
}
const data=gp.pages.filter(p=>[0,1,2].includes(p.page));
assert.deepEqual(data.map(p=>p.indices.length),[262,266,201]);
const O=data.flatMap(p=>p.indices),cut=528;
assert.equal(O.length,729);

const train=gpRunes(read("resources/control/shakespeare_first300k.txt"));
const counts1=new Float64Array(29), counts2=new Float64Array(29*29),
      counts3=new Float64Array(29*29*29);
for(let i=0;i<train.length;i++){counts1[train[i]]++;
 if(i)counts2[29*train[i-1]+train[i]]++;
 if(i>1)counts3[841*train[i-2]+29*train[i-1]+train[i]]++;
}
const prob1=Array.from(counts1,x=>(x+1)/(train.length+29));
const prob2=new Float64Array(841),logp=new Float64Array(24389);
for(let a=0;a<29;a++)for(let b=0;b<29;b++){
 prob2[29*a+b]=(counts2[29*a+b]+25*prob1[b])/(counts1[a]+25);
}
for(let a=0;a<29;a++)for(let b=0;b<29;b++)
 for(let c=0;c<29;c++){
  logp[841*a+29*b+c]=Math.log((counts3[841*a+29*b+c]+15*prob2[29*b+c])/(counts2[29*a+b]+15));
 }
function lang(P,l=0,r=P.length){
 let t=0,n=0;
 for(let i=Math.max(2,l);i<r;i++){t+=logp[841*P[i-2]+29*P[i-1]+P[i]];n++;}
 return t/Math.max(1,n);
}
const opening=(P,n=130)=>P.slice(0,n).map(i=>gp.translit[i]).join("");
const suffix=(P,n=120)=>P.slice(-n).map(i=>gp.translit[i]).join("");
function test(C,ref,mode){
 const top=[];
 // select strictly by training prefix, not heldout
 for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let prev=0;prev<29;prev++){
  const P=dec(C,a,b,prev);
  const score=lang(P,0,cut);
  if(top.length<10||score>top[top.length-1].train){
   const row={a,b,prev,train:score,P};
   top.push(row);top.sort((x,y)=>y.train-x.train);
   if(top.length>10)top.pop();
  }
 }
 const ranked=top.map((c,i)=>{
  const {a,b,prev,P}=c;
  const replay=enc(P,a,b,prev);
  assert.deepEqual(replay,C);
  return {rank:i+1,key:[a,b,prev],train:c.train,held:lang(P,cut),
     all:lang(P),opening:opening(P),closing:suffix(P),
     allIndices:i===0?P:undefined};
 });
 const ret={mode,length:C.length,cut,top:ranked,rawIOC:(()=>{const v=Array(29).fill(0);for(const x of C)v[x]++;return v.reduce((s,x)=>s+x*(x-1),0)/(C.length*(C.length-1));})()};
 if(ref){
  ret.truth=ref.key;
  const encoded=enc(ref.P,...ref.key);
  assert.deepEqual(encoded,C);
  const first=ranked[0].allIndices;
  ret.correctBestFirst=first.reduce((s,x,i)=>s+(x===ref.P[i]),0);
  ret.correctBestHeld=first.slice(cut).reduce((s,x,i)=>s+(x===ref.P[cut+i]),0);
  ret.plainTrain=lang(ref.P,0,cut);
  ret.plainHeld=lang(ref.P,cut);
  ret.trueKeyPosition=ranked.findIndex(c=>c.key.join()==ref.key.join())+1;
  // Seed degeneracy may mean truth has a different but observationally
  // equivalent predecessor; report output/key class, not fake uniqueness.
  let first729=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let prev=0;prev<29;prev++){
    const P=dec(C,a,b,prev);
    if(P.every((x,i)=>x===ref.P[i]))first729++;
  }
  ret.fullPlaintextEquivalentKeys=first729;
 }
 return ret;
}
const donorPaths=["resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const donors=donorPaths.map(p=>gpRunes(read(p)).slice(12000,12729));
assert(donors.every(p=>p.length===729));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const gpGlyph=new Map(gp.runes.map((r,i)=>[r,i]));
const solvedText=["0_welcome","0_koan_1"].map(name=>{
 const section=solved.sections.find(s=>s.name===name);assert(section);return section.source_text;
}).join("\n");
const solvedNative=Array.from(solvedText).filter(c=>gpGlyph.has(c)).map(c=>gpGlyph.get(c)).slice(0,729);
assert.equal(solvedNative.length,729,"Authentic native LP1 text cannot fill chapter-length plant");
const plants=[
 {mode:"Gibran-body-independent-native-plant",P:donors[0],key:[7,11,5]},
 {mode:"Emerson-body-independent-native-plant",P:donors[1],key:[3,19,17]},
 {mode:"LP1-authentic-solved-native-plant",P:solvedNative,key:[11,7,3]}
];
const out={
 hypothesis:"C_i=P_i+a*GPprime(P_i-1)+b*P_i-1+(prime(i+1)-1) mod29",
 section:"original physical p0-p2 729 runes, fit 528, untouched physical p2 201",
 infer:"29^3 exhaustive a,b,unknown predecessor, locked prime2 origin, no F holds",
 nativeModel:"Shakespeare first300k, GP orthography; separate Gibran/Emerson body and source-solved LP1 plants",
 primeResidueSupport:(()=>{let max=0,valid=[],res={};for(let e=1;e<=28;e++){
  let best=0;for(let t=0;t<29;t++){
   const v=pS.map((p,i)=>mod(t*i+Number((BigInt(p)**BigInt(e))%29n)));
   const n=new Set(v).size;if(n>best)best=n;
   if(n===29)valid.push([e,t]);
  }res[e]=best;
 }return {valid,maximumByExponent:res};})(),
 results:[]
};
for(const p of plants)out.results.push(test(enc(p.P,...p.key),p,p.mode));
out.results.push(test(O,null,"original-p0-p2"));
console.log(JSON.stringify(out,null,2));
