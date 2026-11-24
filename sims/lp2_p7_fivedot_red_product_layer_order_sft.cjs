"use strict";
// Exact source-fixed q5 and p7 geometry, both layer orders; Node22/CommonJS.
const fs=require("node:fs");const path=require("node:path");
function experiment(inputs){
  const [json,nativeJSON,transcript]=inputs, c=JSON.parse(json),native=JSON.parse(nativeJSON);
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
  const index=new Map(c.runes.map((x,i)=>[x,i])),tape=s=>[...s].filter(x=>index.has(x)).map(x=>index.get(x));
  const raw=c.pages.filter(x=>x.page>=8&&x.page<=14).flatMap(x=>x.indices);
  const rawMixed=Array.from(transcript.split("%").slice(8,15).join("%")).filter(x=>index.has(x)||x==="7").map(x=>x==="7"?-1:index.get(x));
  assert(raw.length===1729&&rawMixed.length===1730&&rawMixed[692]===-1&&eq(raw,rawMixed.filter(x=>x!==-1)),"literal seven and exact tape");
  const q=[2,4,0,3,1],height=346,marker=-1;
  function inverse(mixed){assert(mixed.length===1730,"size");const out=Array.from({length:1730},(_,i)=>mixed[height*q[i%5]+Math.floor(i/5)]);assert(out[0]===marker,"header");return out.slice(1);}
  function forward(p){const d=[marker,...p],out=Array(1730);for(let i=0;i<d.length;i++)out[height*q[i%5]+Math.floor(i/5)]=d[i];return out;}
  function insert(p){return [...p.slice(0,692),marker,...p.slice(692)];}
  const natural=inverse(rawMixed);
  assert(eq(forward(natural),rawMixed),"geometry roundtrip");
  const red=c.pages.find(x=>x.page===7).indices.slice(194,208),lengths=[2,4,3,2,3];let k=0;
  const K=lengths.map(n=>{const w=red.slice(k,k+n);k+=n;return mod(w.reduce((v,x)=>v*x,1));});
  assert(eq(K,[11,26,8,15,2]),"key");
  const train=native.sections.filter(x=>!x.name.includes("welcome")&&!x.name.includes("p57")).map(x=>tape(x.source_text));
  const big=new Float64Array(29**2),tri=new Float64Array(29**3);
  for(const p of train)for(let i=2;i<p.length;i++){const b=p[i-2]*29+p[i-1];big[b]++;tri[b*29+p[i]]++;}
  const log=Float64Array.from(tri,(v,i)=>Math.log((v+0.5)/(big[Math.floor(i/29)]+14.5)));
  function score(p){let v=0;for(let i=2;i<p.length;i++)v+=log[(p[i-2]*29+p[i-1])*29+p[i]];return v/(p.length-2);}
  /** @param {number[]} p @param {number[]} key @param {number} start @param {boolean} hold */
  function enc(p,key,start,hold){let k=start;return p.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key[k]);k=(k+1)%5;return y;});}
  function reach(c,key,start){let n=Array(5).fill(0n);n[start]=1n;for(let i=0;i<c.length;i++){const x=c[i],r=Array(5).fill(0n);for(let q=0;q<5;q++)if(n[q]){if(x===0)r[q]+=n[q];if(mod(x-key[q])!==0)r[(q+1)%5]+=n[q];}n=r;if(n.every(x=>x===0n))return {dead:i,paths:"0"};}return {dead:null,paths:n.reduce((a,b)=>a+b,0n).toString()};}
  function ordinary(c,key,phase){return c.map((x,i)=>mod(x-key[(phase+i)%5]));}
  const cases=[];
  for(const [keyOrder,base] of [["red-word order",K],["dot order",q.map(i=>K[i])]])for(const sign of [1,-1])for(let phase=0;phase<5;phase++)for(const layer of ["ciphertext transpose last","plaintext transpose first"]){
    const key=base.map(x=>mod(sign*x)),input=layer==="ciphertext transpose last"?natural:raw;
    const direct=ordinary(input,key,phase),p=layer==="ciphertext transpose last"?direct:inverse(insert(direct));
    assert(eq(enc(direct,key,phase,false),input),"ordinary replay");
    cases.push({keyOrder,sign,phase,layer,score:score(p),hold:reach(input,key,phase),first32:p.slice(0,32).map(i=>c.translit[i]).join(" ")});
  }
  const p57=tape(native.sections.find(x=>x.name.includes("p57")).source_text),welcome=tape(native.sections.find(x=>x.name.includes("welcome")).source_text);
  assert(eq(p57,c.pages.find(x=>x.page===57).indices),"native p57");
  const P=Array.from({length:1729},(_,i)=>welcome[i%welcome.length]);
  const controls=[];
  for(const [keyOrder,key] of [["red-word order",K],["dot order",q.map(i=>K[i])]])for(const layer of ["ciphertext transpose last","plaintext transpose first"])for(const hold of [false,true]){
    const input=layer==="ciphertext transpose last"?P:forward(P).filter(x=>x!==marker),encrypted=enc(input,key,0,hold),printed=layer==="ciphertext transpose last"?forward(encrypted):insert(encrypted);
    const recoveredInput=layer==="ciphertext transpose last"?inverse(printed):printed.filter(x=>x!==marker);
    assert(eq(recoveredInput,encrypted),"plant inverse geometry");
    const r=hold?reach(recoveredInput,key,0):{dead:null,paths:"1"};
    assert(r.dead===null,"planted hold path");
    if(!hold){const d=ordinary(recoveredInput,key,0),p=layer==="ciphertext transpose last"?d:inverse(insert(d));assert(eq(p,P),"ordinary recovered all");}
    controls.push({keyOrder,layer,hold,...r});
  }
  return {K,geometry:q,sourceLength:raw.length,originalDoublets:raw.filter((x,i)=>i>0&&x===raw[i-1]).length,restoredDoublets:natural.filter((x,i)=>i>0&&x===natural[i-1]).length,trainRunes:train.flat().length,reference:{p57:score(p57),welcome:score(welcome),plant:score(P),raw:score(raw),restored:score(natural)},cases,controls};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/liber-primus/lp2-transcription.txt"
];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
