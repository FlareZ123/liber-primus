"use strict";
/** Relaxed prime clock: consuming, literal-F hold, or literal-F hold with direction reversal. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(g,donor,raw){
const Q=29,mod=x=>(x%Q+Q)%Q,runeMap=new Map(g.runes.map((r,i)=>[r,i]));
const S=donor.sections.map(s=>[...s.source_text].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)));
const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
const tr=[native(raw),...[0,2,4,6,8].map(i=>S[i])],un=new Float64Array(Q),bi=new Float64Array(30*Q),btot=new Float64Array(30),tri=new Float64Array(900*Q),ttot=new Float64Array(900);let N=0;
for(const seq of tr){let a=29,b=29;for(const p of seq){un[p]++;N++;bi[b*Q+p]++;btot[b]++;tri[(a*30+b)*Q+p]++;ttot[a*30+b]++;a=b;b=p}}
const log=new Float64Array(900*Q);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<Q;p++){const u=(un[p]+0.5)/(N+0.5*Q),v=(bi[b*Q+p]+5*u)/(btot[b]+5),w=(tri[(a*30+b)*Q+p]+8*v)/(ttot[a*30+b]+8);log[(a*30+b)*Q+p]=Math.log(w)}
const primes=[];for(let p=2;primes.length<1100;p++){if(primes.every(q=>q*q>p||p%q!==0))primes.push(p)}const K=primes.map(p=>mod(p-1));
function encode(P,origin,dir,actions){let j=origin,d=dir;return P.map((p,i)=>{const a=actions[i];if(a){if(p!==0)throw Error("non-F hold");if(a===2)d=-d;return 0}if(j<0||j>=K.length)throw Error("out of bounds");const c=mod(p+K[j]);j+=d;return c})}
function decode(C,start,initial){let cur=[initial];for(let i=start;i<C.length;i++){const c=C[i],next=new Map();for(const v of cur){const put=(p,j,d,action)=>{const score=v.s+log[(v.a*30+v.b)*Q+p],id=((j+1)*2+(d===1?1:0))*900+v.b*30+p,old=next.get(id);if(!old||score>old.s)next.set(id,{j,d,a:v.b,b:p,s:score,prev:v,p,action})};if(v.j>=0&&v.j<K.length)put(mod(c-K[v.j]),v.j+v.d,v.d,0);if(c===0){put(0,v.j,v.d,1);put(0,v.j,-v.d,2)}}cur=[...next.values()];if(!cur.length)return null}return cur.reduce((a,b)=>a.s>=b.s?a:b)}
function path(n){let p=[],actions=[];while(n.prev){p.push(n.p);actions.push(n.action);n=n.prev}return {p:p.reverse(),actions:actions.reverse()}}
function run(C,n,truth=null,origin=null,dir=null,truthActions=null){let best=null,rank=[];const pre=C.slice(0,n);for(let o=0;o<464;o++)for(const d of [1,-1]){const v=decode(pre,0,{j:o,d,a:29,b:29,s:0,prev:null});if(!v)continue;rank.push({o,d,s:v.s});if(!best||v.s>best.v.s)best={o,d,v}}rank.sort((a,b)=>b.s-a.s);if(!best)throw Error("no prefix");const end=decode(C,n,best.v);const pref=path(best.v),out={length:C.length,fit:n,bestOrigin:best.o,bestDirection:best.d,fitNats:best.v.s/n,prefix:pref,top3:rank.slice(0,3),legalStarts:rank.length,fitEndPointer:best.v.j,fitEndDirection:best.v.d};if(!end){out.heldNats=null;return out}const res=path(end),rr=encode(res.p,best.o,best.d,res.actions);if(rr.some((x,i)=>x!==C[i]))throw Error("replay");Object.assign(out,{heldNats:(end.s-best.v.s)/(C.length-n),full:res,replay:true,preview:res.p.slice(0,100).map(x=>g.translit[x]).join(" ")});if(truth){const acc=(x,y)=>x.reduce((s,v,i)=>s+(v===y[i]),0);Object.assign(out,{trueOrigin:origin,trueDirection:dir,rank:rank.findIndex(x=>x.o===origin&&x.d===dir)+1,fitCorrect:acc(pref.p,truth.slice(0,n)),heldCorrect:acc(res.p.slice(n),truth.slice(n)),actionCorrect:acc(res.actions,truthActions)})}return out}
function actions(P,fn){let f=0;return P.map(p=>p===0?fn(f++):0)}
const p1=S[1].slice(0,308),a1=actions(p1,()=>2),p2=S[3].slice(0,308),a2=actions(p2,i=>i%3);
const plants=[run(encode(p1,173,1,a1),232,p1,173,1,a1),run(encode(p2,289,-1,a2),232,p2,289,-1,a2)];
const P7=S[7],a7=actions(P7,()=>1),C7=g.pages[56].indices;if(P7.length!==C7.length||encode(P7,0,1,a7).some((x,i)=>x!==C7[i]))throw Error("p56 mismatch");
const control=run(C7,60,P7,0,1,a7);
const terminal=g.pages[54].indices.concat(g.pages[55].indices);
const orig=[run(terminal,232),run(terminal.slice(9),223)];
return {trainingRunes:N,plants,control,orig};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/shakespeare_first300k.txt")),null,2));
