'use strict';
const fs=require('node:fs');
/** Exact lexical inverse of the GP-prime plaintext-driven rank insertion model. */
function experiment(inputs){
const g=JSON.parse(inputs[0]),alpha=new Map(g.translit.map((x,i)=>[x,i])),glyph=new Map(g.runes.map((x,i)=>[x,i])),R=g.prime.map(x=>(x-1)%29);
function words(s){let out=[];for(const raw of s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]){const w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,""),p=[];for(let i=0;i<w.length;){let found=false;for(const n of [3,2,1]){const a=w.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?21:undefined):a==="IO"?27:alpha.get(a);if(v!==undefined){p.push(v);i+=n;found=true;break}}if(!found)throw Error("unknown token")}if(p.length&&p.length<19)out.push(p)}return out}
const dict=new Map(),key=w=>String.fromCharCode(...w.map(x=>65+x));function add(w,f){let k=key(w);dict.set(k,{w,f:(dict.get(k)?.f||0)+f})}
for(const w of inputs.slice(2,9).flatMap(words))add(w,1);
for(const l of inputs[9].split("\n")){let m=l.match(/^([a-z]+)\s+(\d+)$/);if(m)for(const w of words(m[1]))add(w,+m[2])}
function tries(reverse){const roots=Array.from({length:19},()=>({e:[],m:Array(29).fill(null),f:0}));for(const {w,f} of dict.values()){let a=roots[w.length];for(const p of reverse?w.slice().reverse():w){if(!a.m[p]){let b={e:[],m:Array(29).fill(null),f:0};a.m[p]=b;a.e.push([p,b])}a=a.m[p];a.f+=f}}function order(a){a.e.sort((x,y)=>y[1].f-x[1].f);for(const [p,b] of a.e)order(b)}for(const a of roots)order(a);return roots}
const T=[tries(false),tries(true)],src=(inputs[1].replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/gu)||[]).slice(0,2896).map(w=>Array.from(w,x=>glyph.get(x)));if(String(src.flat())!==String(g.pages.slice(0,56).flatMap(p=>p.indices)))throw Error("source");
let seed=3301;const rng=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};const perm=()=>{let a=Array.from({length:29},(_,i)=>i);for(let i=28;i;i--){let j=rng(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const chart=(a,b)=>Array.from({length:29},(_,p)=>(a*p+b)%29);
function encode(P,S,A,hold){A=A.slice();return P.map(p=>{if(hold&&p===0)return 0;let j=S[p],c=A[j];A.splice(j,1);A.splice(R[p],0,c);return c})}
function search(C,lens,S,hold,rev,cap,truth,first=true){
const forwardTruth=truth;if(rev){C=C.slice().reverse();lens=lens.slice().reverse();if(truth)truth=truth.slice().reverse()}
const roots=T[+rev],A=Array(29).fill(-1),P=Array(C.length),inv=Array(29);S.forEach((j,p)=>inv[j]=p);
let nodes=0,complete=0,deep=0,capped=false,truthHit=false,best=null,bestScore=-Infinity;
const breaks=new Int16Array(C.length+1);let k=0;for(const L of lens){breaks[k]=L;k+=L}if(k!==C.length)throw Error("length");
function stop(){return capped||(first&&complete>0)}
function walk(i,node,score){if(++nodes>cap){capped=true;return}deep=Math.max(deep,i);if(i===C.length){complete++;if(score>bestScore){bestScore=score;best=P.slice()}if(truth&&P.every((p,j)=>p===truth[j]))truthHit=true;return}
if(breaks[i])node=roots[breaks[i]];
const c=C[i],seen=A.indexOf(c);
function take(p,child,from,to){P[i]=p;let end=i+1===C.length||breaks[i+1]>0;let q=score+(end?Math.log(child.f):0);if(from<0){walk(i+1,child,q);return}
let v=A[from];A.splice(from,1);A.splice(to,0,c);walk(i+1,child,q);A.splice(to,1);A.splice(from,0,v);
}
if(hold&&c===0){let child=node.m[0];if(child)take(0,child,-1,-1);if(stop())return}
if(!rev&&seen>=0){let p=inv[seen],child=node.m[p];if(child&&(!hold||p!==0))take(p,child,seen,R[p]);return}
for(const [p,child] of node.e){if(hold&&p===0)continue;const from=rev?R[p]:S[p],to=rev?S[p]:R[p];if(seen>=0?from!==seen:A[from]>=0)continue;take(p,child,from,to);if(stop())return}
}
walk(0,null,0);
if(rev&&best)best.reverse();
return {n:C.length,nodes,deep,capped,complete,truthHit,bestAccuracy:forwardTruth&&best?forwardTruth.reduce((s,p,i)=>s+(p===best[i]),0):null,best:best?best.map(p=>g.translit[p]).join(""):null,bestScore:Number.isFinite(bestScore)?bestScore:null};
}
const candidates=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)candidates.push({a,b});
function gate(frames,hold,cap,truthKey){let active=candidates.slice(),stages=[];for(const frame of frames){let next=[],nodes=0,found=0,capped=0,deep=0,truthResult=null;const lens=frame.ws.map(w=>w.length),C=frame.ws.flat();for(const k of active){const z=search(C,lens,chart(k.a,k.b),hold,frame.rev,cap,null,true);nodes+=z.nodes;deep=Math.max(deep,z.deep);if(z.complete||z.capped){next.push(k);if(z.complete)found++;if(z.capped)capped++}if(truthKey&&k.a===truthKey.a&&k.b===truthKey.b)truthResult=z}stages.push({start:frame.start,rev:frame.rev,n:C.length,lens,entered:active.length,remaining:next.length,found,capped,nodes,deep,truthResult});active=next;if(!active.length)break}return {active,stages}}
const bylen=Array.from({length:19},()=>[]);for(const {w} of dict.values())bylen[w.length].push(w);
// Fixed source geometry; only printed group lengths choose these three windows.
const geom=[{start:1353,rev:false,ws:src.slice(1353,1364)},{start:622,rev:true,ws:src.slice(622,632)},{start:1215,rev:false,ws:src.slice(1215,1226)}];
const controls=[];for(let tr=0;tr<2;tr++){let a=[7,17][tr],b=[13,4][tr],S=chart(a,b),hold=!!tr;let frames=geom.map(f=>{let P=f.ws.map(w=>{let a=bylen[w.length];return a[rng(a.length)]}),C=encode(P.flat(),S,perm(),hold),at=0;return {...f,ws:P.map(w=>{let z=C.slice(at,at+w.length);at+=w.length;return z}),truth:P.flat()}});let z=gate(frames,hold,100000,{a,b});if(z.active.length!==1||z.active[0].a!==a||z.active[0].b!==b)throw Error("blind chart recovery");
const held=frames.map(f=>search(f.ws.flat(),f.ws.map(w=>w.length),S,hold,f.rev,1000000,f.truth,false));if(held.some(h=>!h.truthHit))throw Error("truth lost");
controls.push({a,b,hold,...z,held})}
const donor=words(inputs[4]),native=[];for(let tr=0;tr<2;tr++){let start=200+tr*500;while(donor[start].length<7||donor[start+1].length<3)start++;let ws=[],n=0;for(let k=start;n<130;k++){ws.push(donor[k]);n+=donor[k].length}let P=ws.flat(),S=perm(),hold=!!tr,C=encode(P,S,perm(),hold);let z=search(C,ws.map(w=>w.length),S,hold,true,4000000,P,false);native.push({tr,start,hold,...z});}
const original=[false,true].map(hold=>({hold,...gate(geom,hold,100000,null)}));
return {forms:dict.size,bylen:bylen.map(a=>a.length),controls,native,original,geometry:geom.map(f=>({start:f.start,rev:f.rev,lens:f.ws.map(w=>w.length)}))};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt","resources/control/english_wordfreq_textblob.txt"];
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(f,'utf8'))),null,2));
