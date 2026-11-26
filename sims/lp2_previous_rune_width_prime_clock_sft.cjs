'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(C,S){
  const assert=(v,msg)=>{if(!v)throw Error(msg)};
  const mod=x=>(x%29+29)%29,width=C.translit.map(x=>x.length);
  const primes=[];for(let x=2;primes.length<2*13000+5;x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
  const shift=primes.map(x=>(x-1)%29);
  const byRune=new Map(C.runes.map((s,i)=>[s,i]));
  const sections=new Map(S.sections.map(x=>[x.name,[...x.source_text].filter(s=>byRune.has(s)).map(s=>byRune.get(s))]));
  const plants=[["0_welcome",0],["0_koan_1",0],["0_koan_1",350],["0_loss_of_divinity",0]];
  const omit=new Set(plants.map(x=>x[0]));
  const uni=new Float64Array(29),bi=new Float64Array(30*29),tri=new Float64Array(900*29),bt=new Float64Array(30),tt=new Float64Array(900);
  for(const [name,a] of sections){if(omit.has(name))continue;let h=899;for(const p of a){let q=h%30;uni[p]++;bi[q*29+p]++;bt[q]++;tri[h*29+p]++;tt[h]++;h=q*30+p}}
  const sum=uni.reduce((a,b)=>a+b,0),log=new Float64Array(900*29);for(let h=0;h<900;h++)for(let p=0;p<29;p++){const q=h%30,u=(uni[p]+.5)/(sum+14.5),b=(bi[q*29+p]+10*u)/(bt[q]+10),v=(tri[h*29+p]+4*b)/(tt[h]+4);log[h*29+p]=Math.log(v)}
  /** @param {number[]} P @param {number} [t] @param {number} [w] @param {"delayed"|"current"|"ordinary"} [mode] */
  function enc(P,t=0,w=1,mode="delayed"){const out=[];for(const p of P){if(p===0){out.push(0);continue}out.push(mod(p+shift[t]));t+=mode==="delayed"?w:mode==="current"?width[p]:1;w=width[p]}return {out,t,w}}
  /** @param {number} c @param {number} t @param {number} w */
  function step(c,t,w){const a=[];if(c===0)a.push([0,t,w]);const p=mod(c-shift[t]);if(p!==0)a.push([p,t+w,width[p]]);return a}
  /** @param {number[]} cipher @param {number} [t] @param {number} [w] */
  function count(cipher,t=0,w=1){let m=new Map([[t*3+w,1n]]),peak=1;const checkpoints=[];for(let i=0;i<cipher.length;i++){let n=new Map();for(const [k,v] of m)for(const [,t,w] of step(cipher[i],Math.floor(k/3),k%3)){let q=t*3+w;n.set(q,(n.get(q)??0n)+v)}m=n;peak=Math.max(peak,m.size);if(i<30||!m.size)checkpoints.push([i+1,m.size]);if(!m.size)return {paths:"0",endStates:0,dead:i+1,peak,checkpoints}}return {paths:String([...m.values()].reduce((a,b)=>a+b,0n)),endStates:m.size,dead:null,peak,checkpoints}}
  /** @param {number[]} cipher @param {number} [t] @param {number} [w] @param {number} [h] */
  function best(cipher,t=0,w=1,h=899){let states=new Map([[(t*3+w)*900+h,{t,w,h,s:0,prev:null,p:-1}]]);for(const c of cipher){const n=new Map();for(const o of states.values())for(const [p,t,w] of step(c,o.t,o.w)){const h=o.h%30*30+p,k=(t*3+w)*900+h,s=o.s+log[o.h*29+p];if(!n.has(k)||n.get(k).s<s)n.set(k,{t,w,h,s,prev:o,p})}states=n;if(!n.size)return null}let o=[...states.values()].reduce((a,b)=>a.s>=b.s?a:b);let x=o,p=[];while(x.prev){p.push(x.p);x=x.prev}return {p:p.reverse(),t:o.t,w:o.w,h:o.h,score:o.s/cipher.length}}
  const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const matches=(a,b)=>a.filter((v,i)=>v===b[i]).length;
  /** @param {number[]} c @param {number} split */
  function evaluate(c,split){let fit=c.slice(0,split),hold=c.slice(split),fitCount=count(fit),fullCount=count(c),a=best(fit);if(!a)return {fitCount,fullCount,fit:null,hold:null};assert(same(enc(a.p).out,fit),"fit replay");const holdCount=count(hold,a.t,a.w),b=best(hold,a.t,a.w,a.h);if(b)assert(same(enc(b.p,a.t,a.w).out,hold),"hold replay");return {fitCount,fullCount,holdCount,fit:a,hold:b}}
  const control=plants.map(([name,off])=>{let P=sections.get(name).slice(off,off+299);assert(P.length===299,"short control");let c=enc(P).out,e=evaluate(c,223);assert(e.fullCount.paths!=="0","positive path missing");return {name,off,fitExact:e.fit?matches(e.fit.p,P.slice(0,223)):0,holdExact:e.hold?matches(e.hold.p,P.slice(223)):0,fitScore:e.fit?.score,holdScore:e.hold?.score,fitCount:e.fitCount,fullCount:e.fullCount,holdCount:e.holdCount,rivals:["current","ordinary"].map(mode=>({mode,...count(enc(P,0,1,mode).out)}))}});
  const p56=sections.get("p56_an_end"),c56=C.pages.find(x=>x.page===56).indices;assert(same(enc(p56,0,1,"ordinary").out,c56),"authentic p56 replay");
  const p56Rival={length:c56.length,knownPlaintextMatches:matches(enc(p56).out,c56),count:count(c56)};
  const chapter=C.pages.filter(x=>x.page>=40&&x.page<=53),c=chapter.flatMap(x=>x.indices),split=chapter.filter(x=>x.page<53).flatMap(x=>x.indices).length;
  const result=evaluate(c,split),dead=result.fullCount.dead;
  let deadPage=null,deadOffset=null;if(dead!==null){let i=dead-1;for(const page of chapter){if(i<page.indices.length){deadPage=page.page;deadOffset=i;break}i-=page.indices.length}}
  let live=new Map([[1,1n]]), certificate=null;
  for(let i=0;i<c.length;i++){
    const next=new Map();
    for(const [key,n] of live){const t=Math.floor(key/3),w=key%3;for(const [,u,v] of step(c[i],t,w)){const k=u*3+v;next.set(k,(next.get(k)??0n)+n)}}
    if(!next.size){certificate={runeIndex:i,cipher:c[i],entering:[...live].map(([k,n])=>({cursor:Math.floor(k/3),previousWidth:k%3,shift:shift[Math.floor(k/3)],paths:String(n)}))};break}
    live=next;
  }
  const original={n:c.length,split,holdLength:c.length-split,deadPage,deadOffset,certificate,...result};
  return {width,control,p56Rival,original};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
