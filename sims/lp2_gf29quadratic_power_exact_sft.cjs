"use strict";
// Canonical GF(29^2) exponent inverse. Run: node sims/lp2_gf29quadratic_power_exact_sft.cjs
// Reproduces the substantive fields in im-results/lp2_gf29quadratic_power_exact_original_output.json.
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const R=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const gp=JSON.parse(R("resources/liber-primus/lp2-corpus.json"));
const donor=R("resources/control/gibran_prophet_58585.txt");
const M=840, A=29, Q=2;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const mod=(x,n)=>((x%n)+n)%n;
const inv=(a,n)=>{for(let i=1;i<n;i++)if(a*i%n===1)return i;throw Error("nonunit exponent");};
const units=Array.from({length:M},(_,i)=>i).filter(i=>gcd(i,M)===1);
const mul=(x,y)=>[(x[0]*y[0]+Q*x[1]*y[1])%A,(x[0]*y[1]+x[1]*y[0])%A];
const pow=(a,e)=>{let r=[1,0],b=a;while(e){if(e&1)r=mul(r,b);b=mul(b,b);e=Math.floor(e/2);}return r;};
const perm=e=>{
  const p=Array(841);
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){const y=pow([a,b],e);p[29*a+b]=29*y[0]+y[1];}
  assert.equal(new Set(p).size,841,"power is not bijective");
  return p;
};
const transform=(input,map)=>{
  assert.equal(input.length%2,0,"requires complete even GP29 digraph stream");
  const out=Array(input.length);
  for(let i=0;i<input.length;i+=2){
    const k=map[input[i]*29+input[i+1]];
    out[i]=Math.floor(k/29);out[i+1]=k%29;
  }
  return out;
};
const translit=s=>{
  const tok=gp.translit.map((t,i)=>({t,i})).sort((x,y)=>y.t.length-x.t.length);
  const ns=(s.toUpperCase().match(/[A-Z]+/g)||[]).join(" ").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let k=0;k<ns.length;){
    if(ns[k]===" "){k++;continue;}
    const t=tok.find(x=>ns.startsWith(x.t,k));assert(t,"unmapped native GP token at "+k);
    out.push(t.i);k+=t.t.length;
  }
  return out;
};
const ng=translit(donor), train=ng.slice(2200,14500), plant=ng.slice(16100,17780);
const maps=[new Map(),new Map(),new Map(),new Map()];
for(let i=0;i<train.length;i++)for(let n=1;n<=4;n++)if(i>=n-1){
  const key=train.slice(i-n+1,i+1).join(",");
  maps[n-1].set(key,(maps[n-1].get(key)||0)+1);
}
const p=arr=>{
  const k=arr.length,v=maps[k-1].get(arr.join(","))||0;
  if(k===1)return (v+0.2)/(train.length+29*0.2);
  const c=maps[k-2].get(arr.slice(0,-1).join(","))||0;
  const w=k===4?8:k===3?4:2;
  return (v+w*p(arr.slice(1)))/(c+w);
};
const score=arr=>{
  let sum=0;
  for(let i=3;i<arr.length;i++)sum+=Math.log(p(arr.slice(i-3,i+1)));
  return sum/(arr.length-3);
};
const chapter=gp.pages.filter(x=>x.page>=33&&x.page<=39).flatMap(x=>x.indices);
const continuation=gp.pages.filter(x=>x.page>=40&&x.page<=53).flatMap(x=>x.indices);
assert.equal(chapter.length,1680);
assert.equal(continuation.length,3008);
assert.equal(plant.length,1680);
const candidates=units.map(e=>{
  const m=perm(inv(e,840));
  const decoded=transform(chapter,m);
  assert.deepEqual(transform(decoded,perm(e)),chapter);
  return {e,inv:inv(e,840),score:score(decoded),decoded,continuation:transform(continuation,m)};
}).sort((a,b)=>b.score-a.score);
const controls=units.filter((_,i)=>i%24===7).map(e=>{
  const cipher=transform(plant,perm(e));
  const ranking=units.map(z=>({e:z,s:score(transform(cipher,perm(inv(z,840))))})).sort((a,b)=>b.s-a.s);
  assert.deepEqual(transform(cipher,perm(inv(e,840))),plant);
  return {e,rank:ranking.findIndex(x=>x.e===e)+1,trueScore:score(plant),best:ranking[0]};
});
assert(controls.every(c=>c.rank===1),"blind planted exponent was not identified");
const wrong=plant.map((v,i)=>(v+((i%27)+1))%29);
const wrongScores=units.map(e=>({e,score:score(transform(wrong,perm(inv(e,840))))})).sort((a,b)=>b.score-a.score);
const axisInvariance=units.every(e=>{
  const f=perm(e);
  return f.every((y,k)=>((k%29===0)===(y%29===0))&&((Math.floor(k/29)===0)===(Math.floor(y/29)===0)));
});
assert(axisInvariance);
const axisStats=src=>({
  F0:src.filter((v,i)=>i%2===0&&v===0).length,
  F1:src.filter((v,i)=>i%2===1&&v===0).length,
  distinct:new Set(Array.from({length:src.length/2},(_,i)=>src[2*i]*29+src[2*i+1])).size
});
const select=s=>({
  e:s.e,inverseExponent:s.inv,trainingScore:s.score,
  completeTrainingGP:s.decoded.join(","),completeHeldGP:s.continuation.join(","),
  trainingTranslit:s.decoded.map(i=>gp.translit[i]).join(" "),
  heldTranslit:s.continuation.map(i=>gp.translit[i]).join(" ")
});
const out={
  metadata:{
    schema:1,alphabet:"canonical GP29",pairBasis:"a + b*t, t^2=2 in GF(29²)",
    exponents:units.length,source:"resources/liber-primus/lp2-corpus.json",
    train:"p33–p39",hold:"p40–p53",
    donor:"resources/control/gibran_prophet_58585.txt, tokenize and train GP positions 2200:14500, plant 16100:17780",
    score:"recursive interpolated order-4 GP29 LM, simple no spaces; inspect script for exact implementation",
    axisInvariance
  },
  original:{
    train:axisStats(chapter),hold:axisStats(continuation),nativePlant:axisStats(plant),
    topComplete:candidates.slice(0,4).map(select),
    allExponentScores:candidates.map(s=>({e:s.e,inverseExponent:s.inv,meanLogLikelihood:s.score}))
  },
  controls:{
    sampledKnownExponents:controls,allExactRecovered:controls.every(c=>c.rank===1),
    wrongFamilyBest:wrongScores[0],unmodifiedNativeHeldScore:score(plant),
    rawOriginalScore:score(chapter),nativeHeldAverage:score(plant)
  }
};
const artifact=path.resolve(__dirname,"..","im-results","lp2_gf29quadratic_power_exact_original_output.json");
const pinned=JSON.parse(fs.readFileSync(artifact,"utf8"));
function firstDiff(a,b,p="root"){
  if(Object.is(a,b))return null;
  if(a===null||b===null||typeof a!==typeof b||typeof a!=="object")return {path:p,left:a,right:b};
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const k of keys){const d=firstDiff(a[k],b[k],p+"."+k);if(d)return d;}
  return null;
}
const mismatch=firstDiff(out,pinned);
assert.equal(mismatch,null,"committed result mismatch: "+JSON.stringify(mismatch));
console.log(JSON.stringify({
  passed:true,
  eCount:units.length,axisInvariance,
  originalTrain:axisStats(chapter),nativePlant:axisStats(plant),
  originalTop:candidates.slice(0,4).map(x=>({e:x.e,score:x.score,heldScore:score(x.continuation)})),
  nativeControlCount:controls.length,nativeRecovered:controls.filter(x=>x.rank===1).length,
  nativeScore:score(plant),wrongFamilyBest:wrongScores[0]
},null,2));
