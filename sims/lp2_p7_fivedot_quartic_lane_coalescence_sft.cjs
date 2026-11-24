'use strict';
// Source p7 quartic feedback in five independent physical columns.
// Run from repo root: node sims/lp2_p7_fivedot_quartic_lane_coalescence_sft.cjs
const fs=require('node:fs');
function experiment(data,g,donors){
 const A=29,N=1729,q=[2,4,0,3,1],seed=[11,26,8,15,2],m=x=>((x%29)+29)%29,poly=x=>m(11+x*(26+x*(8+x*(15+2*x)))),allKeys=Array.from({length:A},(_,i)=>i);
 const C=data.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 if(C.length!==N||poly(3)!==3||poly(4)!==4||poly(19)!==12||poly(10)!==24)throw Error("source");
 function split(x){let t=x.slice();t.splice(692,0,-1);return Array.from({length:5},(_,i)=>t.slice(i*346,(i+1)*346).filter(v=>v>=0))}
 function unweave(p){const l=Array.from({length:5},()=>[]);for(let i=0;i<N;i++)l[q[(i+1)%5]].push(p[i]);return l}
 function weave(l){let j=Array(5).fill(0);return Array.from({length:N},(_,i)=>{const k=q[(i+1)%5];return l[k][j[k]++]})}
 function enc(p,k,hold=false){return p.map(x=>{if(hold&&x===0)return 0;const c=m(x+k);k=poly(x);return c})}
 function dec(c,k){return c.map(x=>{const p=m(x-k);k=poly(p);return p})}
 function reach(c){let s=new Set(allKeys);for(let i=0;i<c.length;i++){const t=new Set();for(const k of s){if(c[i]===0)t.add(k);const p=m(c[i]-k);if(p!==0)t.add(poly(p))}if(!t.size)return {dead:i};s=t}return {dead:null,end:s.size}}
 function envelope(c){let s=new Set(allKeys),hist=[],first=null;for(let i=0;i<c.length;i++){s=new Set([...s].map(k=>poly(m(c[i]-k))));hist.push(s.size);if(s.size===1&&first===null)first=i}return {first,states:hist,final:s.size}}
 const ix=new Map(g.runes.map((x,i)=>[x,i])),S=g.sections.map(s=>Array.from(s.source_text).filter(x=>ix.has(x)).map(x=>ix.get(x))),u=new Float64Array(A).fill(.5),b=new Float64Array(A*A),bt=new Float64Array(A),t=new Float64Array(A**3),tt=new Float64Array(A*A);
 S.forEach((s,h)=>{if(h===1||h===5)return;s.forEach((x,i)=>{u[x]++;if(i){const y=s[i-1];b[y*A+x]++;bt[y]++;if(i>1){const a=s[i-2]*A+y;t[a*A+x]++;tt[a]++}}})});
 const n=u.reduce((x,y)=>x+y,0);function score(p){let ll=0,h=new Uint32Array(A);p.forEach((x,i)=>{h[x]++;if(i<2)return;const y=p[i-1],a=p[i-2]*A+y,p1=u[x]/n,p2=(b[y*A+x]+4*p1)/(bt[y]+4),p3=(t[a*A+x]+8*p2)/(tt[a]+8);ll+=Math.log(p3)});return {tri:ll/(p.length-2),ioc:h.reduce((s,v)=>s+v*(v-1),0)/(p.length*(p.length-1))}}
 const tokens=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let p=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const a=tokens.find(a=>w.startsWith(a.s));if(!a)throw Error(w);p.push(a.i);w=w.slice(a.s.length)}}return p}
 const L=split(C);if(!eq(unweave(weave(L)),L))throw Error("geometry");
 function analyze(L){const env=L.map(envelope),all=L.map(reach),P=weave(L.map((l,i)=>dec(l,seed[i])));if(!eq(unweave(P).map((l,i)=>enc(l,seed[i])),L))throw Error("replay");
  const firstRow=Math.max(...env.map((e,i)=>e.first===null?346:e.first+(i===2?1:0)))+1,forcedStart=firstRow*5-1,tail=P.slice(forcedStart);
  if(tail.length<3)throw Error("no forced suffix");
  for(let i=0;i<5;i++){const start=firstRow-(i===2?1:0);for(const k of allKeys)if(!eq(dec(L[i],k).slice(start),dec(L[i],seed[i]).slice(start)))throw Error("lane seed independence")}
  return {env,all,firstRow,forcedStart,tailLength:tail.length,tailScore:score(tail),wholeScore:score(P),P};
 }
 const controls=[];for(let i=0;i<2;i++){const p=native(donors[i]).slice(18000+i*2000,18000+i*2000+N),l=unweave(p),k=seed.map((s,j)=>m(s+7*i+3*j+1)),o=l.map((x,j)=>enc(x,k[j])),h=l.map((x,j)=>enc(x,k[j],true)),a=analyze(o);
  if(!eq(weave(o.map((x,j)=>dec(x,k[j]))),p)||!eq(a.P.slice(a.forcedStart),p.slice(a.forcedStart)))throw Error("control");
  const holds=h.map(reach);if(holds.some(x=>x.dead!==null))throw Error("hold plant");
  controls.push({i,k,forcedStart:a.forcedStart,tailLength:a.tailLength,tailScore:a.tailScore,fullKnownSeedReplay:true,allSeedTailExact:a.tailLength,holds})
 }
 const orig=analyze(L);return {polyImage:new Set(allKeys.map(poly)).size,controls,original:{...orig,P:orig.P.map(i=>g.runes[i]).join("")}};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
const inputs=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(inputs[0]),JSON.parse(inputs[1]),inputs.slice(2)),null,2));
