"use strict";
// Usage: node sims/lp2_will_paths_affine_score.cjs /tmp/affine.stdout
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference=read("resources/liber-primus/lp1-plaintext-reference.txt");
const {buildSourceNativeTrigramModel}=require("./lp1_source_native_trigram_model.cjs");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const model=buildSourceNativeTrigramModel({corpus,referenceText:reference});
const c=corpus.pages.slice(33,41).flatMap(p=>p.indices).slice(132);
const mod=x=>(x%29+29)%29;
const stdout=fs.readFileSync(process.argv[2],"utf8");
const taps=stdout.split("PLANT")[0].split(/\r?\n/).filter(x=>x.startsWith("O ")).map(x=>x.slice(2).split(" ").map(Number));
assert.equal(taps.length,33);
const ioc=a=>{const n=Array(29).fill(0);for(const x of a)n[x]++;return n.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));};
const rows=taps.map(coeff=>{
  const [a,b,d,e,v]=coeff,k=[25,5,26,2];
  for(let i=4;i<c.length;i++)k.push(mod(v+a*k[i-1]+b*k[i-2]+d*k[i-3]+e*k[i-4]));
  const p=c.map((x,i)=>mod(x-k[i]));
  assert.deepEqual(p.slice(0,4),[7,10,20,20]);
  assert.deepEqual(p.slice(1619,1623),[13,24,2,15]);
  assert(p.every((x,i)=>mod(x+k[i])===c[i]));
  return {coeff,fit:model.scoreStream(p.slice(4,1619)).mean,hold:model.scoreStream(p.slice(1623)).mean,ioc:ioc(p),preview:p.slice(1623,1683).map(x=>corpus.translit[x]).join(""),plain:p.map(x=>x.toString(29)).join("")};
}).sort((a,b)=>b.fit-a.fit);
const donor=encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt"));
const minima={},pref=[0,0,0];for(let i=2;i<donor.length;i++)pref.push(pref.at(-1)+model.scoreStream(donor.slice(i-2,i+1)).mean);
for(const n of [1615,156]){let min=Infinity,max=-Infinity,count=0;for(let i=0;i+n<=donor.length;i++){const s=(pref[i+n]-pref[i+2])/(n-2);min=Math.min(min,s);max=Math.max(max,s);count++;}minima[n]={min,max,count};}
console.log(JSON.stringify({p57Score:model.p57Score,trainScore:model.trainingScore,donorLength:donor.length,minima,rows},null,2));
