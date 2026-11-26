"use strict";
const fs=require("node:fs");
function experiment(carrier,solved,corpus){
 const {runes,translit}=corpus; const parse=s=>Array.from(s).map(x=>runes.indexOf(x)).filter(x=>x>=0);
 const tape=parse(carrier), n=tape.length; if(new Set(tape).size!==29) throw Error("incomplete carrier");
 const controls=solved.sections.map(s=>({name:s.name,p:parse(s.source_text)}));
 const next=new Uint16Array(n*29), sym=new Uint8Array(n*29), rank=new Uint8Array(n*29);
 for(let s=0;s<n;s++){let seen=0,k=0;for(let j=0;k<29;j++){const t=(s+j)%n,p=tape[t],b=1<<p;if(seen&b)continue;seen|=b;sym[29*s+k]=p;next[29*s+k]=(t+1)%n;rank[29*s+p]=k++;}}
 function decode(c,s){const p=[];for(const x of c){const a=29*s+x;p.push(sym[a]);s=next[a];}return {p,s};}
 function encode(p,s){const c=[];for(const x of p){const r=rank[29*s+x];c.push(r);s=next[29*s+r];}return {c,s};}
 const u=new Uint32Array(29),b=new Uint32Array(841),t=new Uint32Array(24389), bc=new Uint32Array(29),tc=new Uint32Array(841);let total=0;
 for(const {p} of controls.slice(0,5))for(let i=0;i<p.length;i++){u[p[i]]++;total++;if(i){b[p[i-1]*29+p[i]]++;bc[p[i-1]]++;}if(i>1){t[(p[i-2]*29+p[i-1])*29+p[i]]++;tc[p[i-2]*29+p[i-1]]++;}}
 function score(p){let sum=0;for(let i=0;i<p.length;i++){const x=p[i];let q=(u[x]+.5)/(total+14.5);if(i){const a=p[i-1];q=(b[a*29+x]+10*q)/(bc[a]+10);}if(i>1){const a=p[i-2]*29+p[i-1];q=(t[a*29+x]+10*q)/(tc[a]+10);}sum+=Math.log(q);}return sum/p.length;}
 function stats(a){let cnt=Array(29).fill(0),eq=0;for(let i=0;i<a.length;i++){cnt[a[i]]++;if(i&&a[i]===a[i-1])eq++;}return {n:a.length,eq,ioc:cnt.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};}
 function solve(c,cut){let best=null, ends=new Map();for(let s=0;s<n;s++){const a=decode(c.slice(0,cut),s),v=score(a.p);ends.set(a.s,(ends.get(a.s)||0)+1);if(best===null||v>best.fit)best={s,fit:v};}const a=decode(c,best.s);if(encode(a.p,best.s).c.some((x,i)=>x!==c[i]))throw Error("replay");const continuations=[...ends].map(([state,starts])=>{const p=decode(c.slice(cut),state).p;return{state,starts,score:score(p),preview:p.slice(0,80).map(i=>translit[i]).join("")}});return {...best,held:score(a.p.slice(cut)),endStates:ends.size,continuations,preview:a.p.slice(0,100).map(i=>translit[i]).join(""),p:a.p,stats:stats(a.p)};}
 const original=corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13); const o=solve(original,249);const planted=[];
 for(const {name,p} of controls.slice(5)){const s=1033%n,{c}=encode(p,s),a=solve(c,Math.floor(c.length/2));planted.push({name,trueStart:s,foundStart:a.s,fit:a.fit,held:a.held,knownScore:score(p),correct:a.p.filter((v,i)=>v===p[i]).length,heldCorrect:a.p.slice(Math.floor(c.length/2)).filter((v,i)=>v===p[i+Math.floor(c.length/2)]).length,endStates:a.endStates,cipher:stats(c)});}
 const solvedTape=controls.slice(0,7).flatMap(x=>x.p);
 return {carrierLength:n,carrierSymbols:new Set(tape).size,solvedCarrierLength:solvedTape.length,solvedCarrierMissing:runes.filter((x,i)=>!solvedTape.includes(i)),originalCipher:stats(original),original:{...o,p:undefined},planted};
}
console.log(JSON.stringify(experiment(fs.readFileSync("resources/transcriptions/lp1_wulfic_canonical.txt","utf8"),JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8")),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"))),null,2));
