"use strict";
const fs=require("node:fs");
function experiment(carrier,solved,corpus){
 const {runes,translit}=corpus;
 const parse=s=>Array.from(s).map(x=>runes.indexOf(x)).filter(x=>x>=0);
 const lines=carrier.split(/\r?\n/).map(parse).filter(l=>l.length);
 const n=lines.length,tape=lines.flat();
 if(new Set(tape).size!==29)throw Error("carrier missing symbols");
 const row=lines.map((_,s)=>{const symbols=[],dest=[],seen=new Set();for(let j=0;j<n&&symbols.length<29;j++){const k=(s+j)%n;for(const p of lines[k])if(!seen.has(p)){seen.add(p);symbols.push(p);dest.push((k+1)%n);}}if(symbols.length!==29)throw Error("rank row");return {symbols,dest,rank:runes.map((_,p)=>symbols.indexOf(p))};});
 const controls=solved.sections.map(s=>({name:s.name,p:parse(s.source_text)}));
 const u=new Uint32Array(29),b=new Uint32Array(841),t=new Uint32Array(24389),bc=new Uint32Array(29),tc=new Uint32Array(841);let total=0;
 for(const {p} of controls.slice(0,5))for(let i=0;i<p.length;i++){u[p[i]]++;total++;if(i){b[p[i-1]*29+p[i]]++;bc[p[i-1]]++;}if(i>1){t[(p[i-2]*29+p[i-1])*29+p[i]]++;tc[p[i-2]*29+p[i-1]]++;}}
 function score(p){let sum=0;for(let i=0;i<p.length;i++){const x=p[i];let q=(u[x]+.5)/(total+14.5);if(i){const a=p[i-1];q=(b[a*29+x]+10*q)/(bc[a]+10);}if(i>1){const a=p[i-2]*29+p[i-1];q=(t[a*29+x]+10*q)/(tc[a]+10);}sum+=Math.log(q);}return sum/p.length;}
 const equal=(x,y)=>x.length===y.length&&x.every((v,i)=>v===y[i]);
 const text=p=>p.map(v=>translit[v]).join("");
 function stats(a){let cnt=Array(29).fill(0),eq=0;for(let i=0;i<a.length;i++){cnt[a[i]]++;if(i&&a[i]===a[i-1])eq++;}return {length:a.length,repeats:eq,ioc:cnt.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};}
 function run(mode){
  const step=(s,r)=>mode==="greedyLine"?row[s].dest[r]:(s+1)%n;
  function enc(p,s){let c=[];for(const x of p){const r=row[s].rank[x];c.push(r);s=step(s,r);}return {c,s};}
  function dec(c,s){let p=[];for(const r of c){p.push(row[s].symbols[r]);s=step(s,r);}return {p,s};}
  for(let s=0;s<n;s++)for(let x=0;x<29;x++){const e=enc([x],s),d=dec(e.c,s);if(d.p[0]!==x||e.s!==d.s)throw Error("local inverse");}
  function solve(c,cut){const fits=[],states=new Set();let best=null;for(let s=0;s<n;s++){const d=dec(c.slice(0,cut),s);states.add(d.s);const f={start:s,fit:score(d.p),end:d.s};fits.push(f);if(!best||f.fit>best.fit)best=f;}const p=dec(c,best.start).p;if(!equal(enc(p,best.start).c,c))throw Error("replay");const all=[...states].map(state=>{const p=dec(c.slice(cut),state).p;return {state,score:score(p),preview:text(p.slice(0,80))};}).sort((a,b)=>b.score-a.score);return {best,heldScore:score(p.slice(cut)),oracleMax:all[0],endStates:states.size,fitTies:fits.filter(x=>x.fit===best.fit).length,preview:text(p.slice(0,100)),plainStats:stats(p),p,all};}
  const original=corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13),cut=249;
  if(original.length!==716||corpus.pages[0].indices.length!==262)throw Error("opening framing");
  const o=solve(original,cut);
  const planted=controls.slice(5).map(({name,p},i)=>{const start=[0,33,57,89][i]%n, c=enc(p,start).c,k=Math.floor(p.length/2),r=solve(c,k);return {name,trueStart:start,selected:r.best,fitTies:r.fitTies,heldScore:r.heldScore,knownHeldScore:score(p.slice(k)),correct:r.p.filter((v,j)=>v===p[j]).length,total:p.length,heldCorrect:r.p.slice(k).filter((v,j)=>v===p[k+j]).length,heldTotal:p.length-k,endStates:r.endStates,cipherStats:stats(c)};});
  return {mode,localInverseCases:n*29,original:{...o,p:undefined},planted};
 }
 return {carrierLength:tape.length,carrierLines:n,originalCipher:stats(corpus.pages.slice(0,3).flatMap(x=>x.indices).slice(13)),models:["greedyLine","nextLine"].map(run)};
}
const paths=["resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-corpus.json"];
console.log(JSON.stringify(experiment(fs.readFileSync(paths[0],"utf8"),JSON.parse(fs.readFileSync(paths[1],"utf8")),JSON.parse(fs.readFileSync(paths[2],"utf8"))),null,2));
