"use strict";
/** Optional literal-F holds on the authentic p56 prime clock. Exact trigram DP over every hold branch, all origins 0..463. */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(g,donor,raw) {
 const Q=29, mod=x=>(x%Q+Q)%Q, runeMap=new Map(g.runes.map((r,i)=>[r,i]));
 const S=donor.sections.map(s=>[...s.source_text].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)));
 const tok=g.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const tr=[native(raw),...[0,2,4,6,8].map(i=>S[i])], un=new Float64Array(Q), bi=new Float64Array(30*Q), btot=new Float64Array(30), tri=new Float64Array(900*Q), ttot=new Float64Array(900);let N=0;
 for(const seq of tr){let a=29,b=29;for(const p of seq){un[p]++;N++;bi[b*Q+p]++;btot[b]++;tri[(a*30+b)*Q+p]++;ttot[a*30+b]++;a=b;b=p}}
 const log=new Float64Array(900*Q);for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let p=0;p<Q;p++){const u=(un[p]+0.5)/(N+0.5*Q),v=(bi[b*Q+p]+5*u)/(btot[b]+5),w=(tri[(a*30+b)*Q+p]+8*v)/(ttot[a*30+b]+8);log[(a*30+b)*Q+p]=Math.log(w)}
 const primes=[];for(let p=2;primes.length<900;p++){if(primes.every(q=>q*q>p||p%q!==0))primes.push(p)} const K=primes.map(p=>mod(p-1));
 function encode(P,origin,choose){let h=0,fi=0;return P.map((p,i)=>{if(p===0&&choose(fi++)){h++;return 0}return mod(p+K[origin+i-h])})}
 function decode(C,origin,start=0,initial={h:0,a:29,b:29,s:0,prev:null,p:null}){let cur=new Map([[initial.h*900+initial.a*30+initial.b,initial]]);
  for(let i=start;i<C.length;i++){const c=C[i],next=new Map();for(const v of cur.values()){
   const put=(p,h)=>{const s=v.s+log[(v.a*30+v.b)*Q+p],id=h*900+v.b*30+p,old=next.get(id);if(!old||s>old.s)next.set(id,{h,a:v.b,b:p,s,prev:v,p,held:h>v.h})};
   put(mod(c-K[origin+i-v.h]),v.h);if(c===0)put(0,v.h+1);
  }cur=next}
  return [...cur.values()].reduce((a,b)=>a.s>=b.s?a:b);
 }
 function path(n){const p=[],held=[];while(n.prev){p.push(n.p);held.push(n.held);n=n.prev}return {p:p.reverse(),held:held.reverse()}}
 function fit(C,len){let best=null,rank=[];for(let o=0;o<464;o++){const n=decode(C.slice(0,len),o);rank.push({o,s:n.s});if(!best||n.s>best.n.s)best={o,n}}rank.sort((a,b)=>b.s-a.s);return {best,rank}}
 function run(C,n,truth=null,origin=null){const {best,rank}=fit(C,n);const end=decode(C,best.o,n,best.n),res=path(end),pre=path(best.n);const rr=encode(res.p,best.o,(()=>{let k=0;const f=res.held.filter((_,i)=>res.p[i]===0);return ()=>f[k++]})()); if(rr.some((x,i)=>x!==C[i]))throw Error("replay");
  const acc=(x,y)=>x.reduce((n,v,i)=>n+(v===y[i]),0), z={length:C.length,fit:n,bestOrigin:best.o,fitNats:best.n.s/n,heldNats:(end.s-best.n.s)/(C.length-n),holdsFit:best.n.h,holdsTotal:end.h,fitPath:pre.p,fullPath:res.p,held:res.held,top3:rank.slice(0,3),replay:true};
  if(truth)Object.assign(z,{trueOrigin:origin,trueOriginRank:rank.findIndex(x=>x.o===origin)+1,fitCorrect:acc(pre.p,truth.slice(0,n)),holdoutCorrect:acc(res.p.slice(n),truth.slice(n))});return z
 }
 const P7=S[7],C7=g.pages[56].indices;if(encode(P7,0,()=>true).some((x,i)=>x!==C7[i])||P7.length!==C7.length)throw Error("actual p56 mismatch");
 const plant1=S[1].slice(0,308),plant2=S[3].slice(0,308);
 const plants=[run(encode(plant1,173,i=>i%2===0),232,plant1,173),run(encode(plant2,289,i=>i%3!==0),232,plant2,289)];
 const control=run(C7,60,P7,0);
 const original=g.pages.filter(p=>p.page===54||p.page===55).flatMap(p=>p.indices);
 const result=run(original,232);
 return {trainingRunes:N,plants,control,result};
}
const g=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),d=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),raw=read("resources/control/shakespeare_first300k.txt");
console.log(JSON.stringify(experiment(g,d,raw),null,2));
