"use strict";
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
function main(inputs){
 const c=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),R=c.runes;
 const mod=(x,n)=>(x%n+n)%n,assert=(v,m)=>{if(!v)throw Error(m)};
 function encode(p,k,N,mode="mixed"){
  k=k.slice();let n=0;return p.map(x=>{if(x===0)return 0;let j=n++%k.length,v=mod(x+k[j],N);if(mode==="mixed")k[j]=j%2?v:x;else if(mode==="plain")k[j]=x;else if(mode==="cipher")k[j]=v;return v});
 }
 function domain(ct,mask,q,N){
  const a=Array(q).fill(1),b=Array(q).fill(0),dom=Array.from({length:q},()=>Array(N).fill(true)),last=Array(q).fill(-1);
  let n=0,z=0;
  for(let i=0;i<ct.length;i++){
   const v=ct[i];if(v===0&&mask[z++])continue;
   const j=n++%q;
   if(a[j]===0){
    if(mod(v-b[j],N)===0)return {bad:{i,j,previous:last[j],value:v,type:"fixedCipherFeedback"},domains:null};
   }else{
    dom[j][mod(a[j]*(v-b[j]),N)]=false;
    if(!dom[j].some(Boolean))return {bad:{i,j,type:"emptyPrimerDomain"},domains:null};
   }
   if(j%2){a[j]=0;b[j]=v}else{a[j]=-a[j];b[j]=mod(v-b[j],N)}
   last[j]=i;
  }
  return {bad:null,domains:dom.map(d=>d.flatMap((ok,k)=>ok?[k]:[]))};
 }
 function decode(ct,k,mask,N){
  k=k.slice();let n=0,z=0;const p=[];
  for(const v of ct){if(v===0&&mask[z++]){p.push(0);continue}const j=n++%k.length,x=mod(v-k[j],N);if(!x)return null;p.push(x);k[j]=j%2?v:x}return p;
 }
 function allMasks(ct,q,N){
  const z=ct.filter(x=>x===0).length;assert(z<=20,"mask cap");
  const records=[];
  for(let h=0;h<2**z;h++){const mask=Array.from({length:z},(_,i)=>!!(h&(1<<i))),d=domain(ct,mask,q,N);
   if(!d.bad){const k=d.domains.map(v=>v[0]),p=decode(ct,k,mask,N);assert(p&&String(encode(p,k,N))===String(ct),"replay")}
   records.push({mask:h,...d});
  }
  return {n:ct.length,z,legal:records.filter(x=>!x.bad).length,records};
 }
 let seed=0xb24e7219;
 function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 const toy=[];
 for(let t=0;t<100;t++){
  const N=5,q=2,ct=Array.from({length:6+t%8},()=>rand(N)),e=allMasks(ct,q,N);
  for(const row of e.records){
   const mask=Array.from({length:e.z},(_,i)=>!!(row.mask&(1<<i))),keys=[];
   for(let i=0;i<N;i++)for(let j=0;j<N;j++)if(decode(ct,[i,j],mask,N))keys.push([i,j]);
   assert(!!keys.length===!row.bad,"toy legality");
   if(!row.bad){
    const possible=row.domains[0].flatMap(a=>row.domains[1].map(b=>[a,b]));
    assert(String(possible)===String(keys),"toy exact domains");
   }
  }
  toy.push({masks:e.records.length,legal:e.legal});
 }
 const orig54=c.pages.find(p=>p.page===54).indices.slice(9),orig55=c.pages.find(p=>p.page===55).indices;
 assert(orig54.length===223&&orig55.length===76,"geometry");
 function stats(x){return {n:x.length,zeros:x.filter(v=>v===0).length,repeats:x.slice(1).filter((v,i)=>v===x[i]).length}}
 const original=allMasks(orig54,8,29),full=allMasks(orig54.concat(orig55),8,29);
 assert(original.legal===0&&full.legal===0,"original exact gate");
 assert(original.records.every(r=>r.bad.i===11&&r.bad.previous===3&&r.bad.j===3),"common witness");
 assert(orig54.slice(0,12).every(v=>v!==0),"zero-free witness");
 const controls=[],distributions=[];
 for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity"]){
  const s=native.sections.find(x=>x.name===name),p=[...s.source_text].filter(x=>R.includes(x)).map(x=>R.indexOf(x)).slice(0,299);
  assert(p.length===299,"plant length");
  const k=Array.from({length:8},()=>rand(29)),ct=encode(p,k,29),mask=ct.flatMap((v,i)=>v===0?[p[i]===0]:[]),d=domain(ct,mask,8,29);
  assert(!d.bad&&k.every((v,j)=>d.domains[j].includes(v)),"plant truth membership");
  const w=d.domains.map(a=>a[0]),p2=decode(ct,w,mask,29);
  assert(p2&&String(encode(p2,w,29))===String(ct),"plant witness");
  assert(String(decode(ct,k,mask,29))===String(p),"plant truth replay");
  const prefix=ct.slice(0,223),prefixMask=prefix.flatMap((v,i)=>v===0?[p[i]===0]:[]),dp=domain(prefix,prefixMask,8,29);
  assert(!dp.bad&&k.every((v,j)=>dp.domains[j].includes(v)),"prefix plant");
  // Odd-lane primer changes only first-cycle plaintext; it is overwritten by observed C.
  let ka=k.slice();for(let j=1;j<8;j+=2)ka[j]=dp.domains[j].find(v=>v!==k[j]);
  const pa=decode(ct,ka,mask,29);assert(pa&&String(pa.slice(223))===String(p.slice(223))&&String(encode(pa,ka,29))===String(ct),"odd primer equivalence");
  controls.push({name,key:k,alternateKey:ka,truthMask:mask.map(Number).join(""),fullDomains:d.domains.map(a=>a.length),prefixDomains:dp.domains.map(a=>a.length),stats:stats(ct),generatedZero:mask.filter(v=>!v).length,knownMaskExact:true,alternateHeldout:76});
  for(const mode of ["mixed","periodic","plain","cipher"]){
   const samples=[];
   for(let i=0;i<128;i++)samples.push(stats(encode(p,Array.from({length:8},()=>rand(29)),29,mode)));
   const summary=k=>({min:Math.min(...samples.map(s=>s[k])),max:Math.max(...samples.map(s=>s[k])),mean:samples.reduce((a,s)=>a+s[k],0)/samples.length});
   const o=stats(orig54.concat(orig55));
   distributions.push({name,mode,n:samples.length,zeros:summary("zeros"),repeats:summary("repeats"),zerosAtMostOriginal:samples.filter(s=>s.zeros<=o.zeros).length,repeatsAtMostOriginal:samples.filter(s=>s.repeats<=o.repeats).length,both:samples.filter(s=>s.zeros<=o.zeros&&s.repeats<=o.repeats).length});
  }
 }
 return {toy:{cases:toy.length,masks:toy.reduce((s,x)=>s+x.masks,0),legalMasks:toy.reduce((s,x)=>s+x.legal,0)},controls,distributions,original:{prefixStats:stats(orig54),fullStats:stats(orig54.concat(orig55)),zeroFreeWitness:orig54.slice(0,12),firstBad:original.records[0].bad,prefix:original,full}};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2))}
