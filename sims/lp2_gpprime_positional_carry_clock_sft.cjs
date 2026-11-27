"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
function experiment(j,native) {
 const mod=x=>(x%29+29)%29, primes=[];
 for(let n=2;primes.length<17000;n++){let yes=true;for(let i=0;i<primes.length&&primes[i]*primes[i]<=n;i++)if(n%primes[i]===0){yes=false;break}if(yes)primes.push(n)}
 const shift=primes.map(p=>(p-1)%29),chart=j.prime;
 assert.equal(chart.length,29);assert.equal(chart[0],2);assert.equal(chart[28],109);
 const tab=Array.from({length:4},(_,h)=>Array.from({length:29},(_,d)=>chart.flatMap((p,i)=>(p+h)%29===d?[[i,Math.floor((p+h)/29)]]:[])));
 const enc=(P,origin,sign,mode,initial)=>{let h=initial,k=origin;const c=[];for(const p of P){if(mode==="plainF"&&p===0){c.push(0);continue}const z=chart[p]+h,d=z%29;h=Math.floor(z/29);if(mode==="digitF"&&d===0)c.push(0);else{c.push(mod(d+sign*shift[k]));k++}}return {c,h,k}};
 function inverse(C,origin,sign,mode,initials,keep=false){let S=new Set(initials.map(h=>4*origin+h));const hist=keep?[new Map([...S].map(s=>[s,null]))]:null;let i=0;
 for(;i<C.length;i++){const c=C[i],T=new Set(),H=keep?new Map():null;
 for(const s of S){const h=s%4,k=(s-h)/4;const add=(next,p)=>{if(!T.has(next)){T.add(next);if(keep)H.set(next,[s,p])}};
 if(mode==="plainF"&&c===0)add(s,0);
 if(mode==="digitF"&&c===0)for(const [p,nh] of tab[h][0])add(4*k+nh,p);
 const d=mod(c-sign*shift[k]);if(mode==="digitF"&&d===0)continue;
 for(const [p,nh] of tab[h][d])if(mode!=="plainF"||p!==0)add(4*(k+1)+nh,p);
 }
 if(!T.size)break;S=T;if(keep)hist.push(H);
 }
 let witness=null;if(keep&&i===C.length){let s=[...S][0];const P=[];for(let t=i;t>0;t--){const [prev,p]=hist[t].get(s);P.push(p);s=prev}P.reverse();witness={P,initial:s%4};assert.deepEqual(enc(P,origin,sign,mode,witness.initial).c,C)}
 return {prefix:i,terminal:i===C.length?S.size:0,witness};}
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],tapes=ranges.map(([a,b])=>j.pages.slice(a,b+1).flatMap(p=>p.indices));
 assert.deepEqual(tapes.map(x=>x.length),[729,1145,1729,1903,1021,1433,1680,3008,308]);
 const clear57=j.pages[57].indices,clear56=j.pages[56].indices.map((c,i)=>i===56?0:mod(c-shift[i-(i>56?1:0)]));
 assert.deepEqual(clear56.slice(0,3),[24,9,18]);assert.equal(j.pages[56].indices[56],0);
 const map=new Map(j.runes.map((r,i)=>[r,i]));
 const nativeWords=[...new Set(native.sections.flatMap(s=>s.source_text.match(/[ᚠ-ᛠ]+/gu)||[]))].map(w=>[...w].map(c=>map.get(c))).filter(w=>w.every(Number.isInteger));
 const original=[],tests=[],wordCollision=[];
 for(const mode of ["ordinary","plainF","digitF"]){
 for(const sign of [1,-1])for(const [di,P] of [clear57,clear56].entries()){
 const origin=di?1033:23,initial=di?3:0,E=enc(P,origin,sign,mode,initial),D=inverse(E.c,origin,sign,mode,[initial],true);assert.ok(D.terminal);
 let h=initial,k=origin;for(let t=0;t<P.length;t++){const p=P[t],c=E.c[t];if(mode==="plainF"&&p===0){assert.equal(c,0);continue}const z=chart[p]+h,d=z%29,nh=Math.floor(z/29);assert.ok(tab[h][d].some(([q,v])=>q===p&&v===nh));if(mode==="digitF"&&d===0)assert.equal(c,0);else{assert.equal(mod(c-sign*shift[k]),d);k++}h=nh}
 tests.push({mode,sign,donor:di?56:57,n:P.length,terminal:D.terminal,oneWitnessCorrect:D.witness.P.filter((p,i)=>p===P[i]).length});}
 for(const [r,C0] of tapes.entries())for(const sign of [1,-1])for(const reverse of [false,true]){
 const C=reverse?[...C0].reverse():C0;let maxPrefix=-1,origins=[],full=[],zero;
 for(let origin=0;origin<=3301;origin++){const D=inverse(C,origin,sign,mode,[0,1,2,3]);if(origin===0)zero=D.prefix;if(D.prefix>maxPrefix){maxPrefix=D.prefix;origins=[origin]}else if(D.prefix===maxPrefix)origins.push(origin);
 if(D.terminal){const E=inverse(C,origin,sign,mode,[0,1,2,3],true);full.push({origin,terminal:E.terminal,initial:E.witness.initial,plaintext:E.witness.P})}}
 original.push({pages:ranges[r],n:C.length,mode,sign,reverse,zero,maxPrefix,origins,full});}
 for(const reverse of [false,true])for(let h0=0;h0<4;h0++){const bins=new Map();for(const P0 of nativeWords){let h=h0,k=0,d=[];for(const p of reverse?[...P0].reverse():P0){if(mode==="plainF"&&p===0){d.push("H");continue}const z=chart[p]+h;h=Math.floor(z/29);const v=z%29;if(mode==="digitF"&&v===0)d.push("H");else{d.push(v);k++}}
 const key=JSON.stringify([d,h,k]);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(P0.map(p=>j.translit[p]).join(""))}wordCollision.push({reverse,mode,h0,collisions:[...bins.values()].filter(x=>x.length>1)});}
 }
 const A=[1,3],B=[17,2],collision=["ordinary","plainF","digitF"].map(mode=>{const x=enc(A,0,1,mode,0),y=enc(B,0,1,mode,0);assert.deepEqual(x,y);return {mode,A,B,output:x}});
 return {tests,original,collision,nativeWords:nativeWords.length,wordCollision};
}
if(require.main===module){
 const j=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
 const native=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
 const result=experiment(j,native);
 assert.equal(result.original.length,108);assert.equal(result.original.reduce((a,x)=>a+x.full.length,0),0);assert.equal(Math.max(...result.original.map(x=>x.maxPrefix)),122);
 console.log(JSON.stringify(result,null,2));
}
module.exports={experiment};
