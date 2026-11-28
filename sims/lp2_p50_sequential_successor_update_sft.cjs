'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,grid){
 const mod=x=>(x%29+29)%29, assert=(b,m)=>{if(!b)throw Error(m)}, inv=a=>{for(let b=1;b<29;b++)if(mod(a*b)===1)return b;throw Error("noninvertible")};
 const [c55,c56,p57]=corpus.pages.slice(-3).map(p=>p.indices);assert(c55.length===76&&c56.length===85&&p57.length===95,"lengths");
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 let k=0;const p56=c56.map((c,i)=>i===56?0:mod(c-primes[k++]+1));
 k=0;assert(p56.every((p,i)=>p===0?i===56&&c56[i]===0:mod(p+primes[k++]-1)===c56[i])&&k===84,"p56 native");
 const row=Array.from({length:256},(_,i)=>i),rim=[...Array.from({length:8},(_,i)=>i),...Array.from({length:30},(_,i)=>8*(i+1)+7),...Array.from({length:8},(_,i)=>255-i),...Array.from({length:30},(_,i)=>8*(30-i))],layouts={row,rim:[...rim,...row.filter(i=>!rim.includes(i))]};
 const out=[];
 for(const radix of [59,60]){
  const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
  const f=grid.pages.flatMap(p=>p.tokens).map(t=>radix*alpha.indexOf(t[0])+alpha.indexOf(t[1]));assert(f.length===256&&f.every(x=>x>=0&&x<256),"table");
  for(const [layout,order] of Object.entries(layouts))for(const direction of ["ascending","descending"]){
   const sweep=direction==="ascending"?row:[...row].reverse(),step=Array(256),pos=Array(256);sweep.forEach((x,i)=>step[x]=i);order.forEach((x,i)=>pos[x]=i);
   const scatter=xs=>{const a=Array(256);order.forEach((x,i)=>a[x]=xs[i]);return a};
   const C=scatter([...c55,...c56,...p57]),P=scatter([...Array(76).fill(null),...p56,...Array(95).fill(null)]);
   const state=(i,C,P)=>{const j=f[i];if(step[j]>=step[i])return {v:C[j],id:"v:"+C[j],kind:"raw"};if(P[j]!==null)return {v:P[j],id:"v:"+P[j],kind:"decoded"};return {v:null,id:"addr:"+j,kind:"unknown"}};
   function train(C,P){return order.slice(76,161).map(i=>({i,offset:pos[i]-76,target:f[i],c:C[i],p:P[i],...state(i,C,P)}))};
   function check(rs,split=false){const pc=new Map(),cp=new Map();let functionConflicts=0,injectionConflicts=0;const witnesses=[];for(const r of rs){if(r.i===r.target)continue;const prefix=(split?(r.kind==="unknown"?"decoded":r.kind)+":":"")+r.id;const a=prefix+":"+r.c,b=prefix+":"+r.p;
    if(pc.has(a)&&pc.get(a).p!==r.p){functionConflicts++;witnesses.push({type:"function",a:pc.get(a),b:r})}
    if(cp.has(b)&&cp.get(b).c!==r.c){injectionConflicts++;witnesses.push({type:"injection",a:cp.get(b),b:r})}
    if(!pc.has(a))pc.set(a,r);if(!cp.has(b))cp.set(b,r)
   }return {functionConflicts,injectionConflicts,witnesses}};
   // For self-pointers combine the two coefficients, requiring a+b !=0.
   function legal(a,b){return a!==0&&(!f.some((j,i)=>i===j)||mod(a+b)!==0)}
   function fit(rs){let tested=0;const keys=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)if(legal(a,b))for(let d=0;d<29;d++){tested++;if(rs.every(r=>r.v===null||mod(a*r.c+b*r.v+d)===r.p))keys.push([a,b,d])}return {tested,keys}}
   function dec(C,a,b,d){const P=C.slice();for(const i of sweep)P[i]=mod(a*P[i]+b*P[f[i]]+d);return P}
   function enc(P,a,b,d){const C=P.slice();for(const i of [...sweep].reverse()){const j=f[i];C[i]=j===i?mod((C[i]-d)*inv(mod(a+b))):mod((C[i]-b*C[j]-d)*inv(a))}return C}
   const rs=train(C,P),conflicts=check(rs),splitConflicts=check(rs,true),fit56=fit(rs);
   assert(conflicts.witnesses.length>0&&splitConflicts.witnesses.length>0&&fit56.keys.length===0,"original rejection");
   const candidates=fit56.keys.map(key=>{const X=dec(C,...key);assert(enc(X,...key).every((v,i)=>v===C[i]),"original roundtrip");return {key,train:order.slice(76,161).filter((i,j)=>X[i]===p56[j]).length,held:order.slice(161).filter((i,j)=>X[i]===p57[j]).length,p55:order.slice(0,76).map(i=>X[i])}});
   const truth=scatter([...p57.slice(0,76),...p56,...p57]), plantKey=[3,2,7];assert(legal(3,2),"plant legal");
   const cp=enc(truth,...plantKey),pp=scatter([...Array(76).fill(null),...p56,...Array(95).fill(null)]),prs=train(cp,pp),pf=fit(prs);
   assert(pf.keys.length===1&&pf.keys[0].every((x,i)=>x===plantKey[i])&&check(prs).witnesses.length===0&&check(prs,true).witnesses.length===0,"blind key");
   const recovered=dec(cp,...pf.keys[0]);const held=order.filter((i,j)=>j<76||j>=161).filter(i=>recovered[i]===truth[i]).length;assert(held===171&&recovered.every((v,i)=>v===truth[i])&&enc(recovered,...plantKey).every((v,i)=>v===cp[i]),"plant held");
   out.push({radix,layout,direction,selfPointers:f.filter((j,i)=>j===i).length,train:{records:rs.length,known:rs.filter(r=>r.v!==null).length,raw:rs.filter(r=>r.kind==="raw").length,decoded:rs.filter(r=>r.kind==="decoded").length,unknown:rs.filter(r=>r.kind==="unknown").length},conflicts,splitConflicts,fit56,candidates,plant:{key:plantKey,known:prs.filter(r=>r.v!==null).length,held}});
  }
 }
 return {p56Replay:85,primeTerms:84,source:{corpus:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",grid:"2550eae357442912220e05dc51147523a61dd75a"},results:out};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
console.log(JSON.stringify(experiment(read('lp2-corpus.json'),read('lp2-grid-256.json')),null,2));
