"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function core(corpus,signed,solved) {
 const mod=x=>((x%29)+29)%29, inv=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error("inverse")}, check=(x,msg)=>{if(!x)throw Error(msg)}, eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const labels=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n").split(/[^A-Za-z0-9]+/).filter(x=>/^[A-Za-z]+$/.test(x)).map(x=>x.toUpperCase());
 check(labels.length===43,"signed length");
 const words=labels.slice(1).concat(labels.slice(0,1));
 const title=[18,13,10,13,8,24,9,26,15,18,18,5,15], C=corpus.pages.slice(0,3).flatMap(p=>p.indices), K=title.map((p,i)=>mod(C[i]-p));
 check(C.length===729 && eq(K,[26,24,8,19,27,24,18,3,0,8,0,16,19]),"title input");
 check(eq(words.slice(0,13),["THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED","LIBER","PRIMUS","IS","THE","WAY"]),"interval");
 const multiplier=mod((K[6]-K[11])*inv(K[5]-K[10])), the=mod(K[11]-multiplier*K[10]), iv=mod((K[0]-the)*inv(multiplier));
 check(multiplier===17 && the===16 && iv===4 && mod(multiplier*multiplier)===28,"forced recurrence");
 let lookup={}; for(let i=0;i<13;i++){let v=mod(K[i]-multiplier*(i===0?iv:K[i-1]));if(words[i] in lookup)check(lookup[words[i]]===v,"lookup conflict");lookup[words[i]]=v;}
 const unk=[...new Set(words)].filter(w=>!(w in lookup));const d=unk.length+1;
 let x=Array(d).fill(0);x[0]=iv;const expr=[];
 for(let i=0;i<344;i++){const w=words[i%43];x=x.map(v=>mod(v*multiplier));if(w in lookup)x[0]=mod(x[0]+lookup[w]);else x[1+unk.indexOf(w)]=mod(x[1+unk.indexOf(w)]+1);expr.push(x);}
 check(expr.slice(0,13).every((v,i)=>v[0]===K[i]&&v.slice(1).every(y=>y===0)),"title affine expressions");
 check(expr.slice(172).every((v,i)=>eq(v,expr[i])),"172 identity");
 const de=expr[43].map((v,j)=>mod(v-expr[0][j])), pivot=de.findIndex((v,i)=>i>0&&v!==0);check(pivot>0,"nonconstant cycle delta");
 const affine=expr.slice(0,172).map(v=>{let b=mod(v[pivot]*inv(de[pivot]));if(v.slice(1).some((z,j)=>mod(z-b*de[j+1])!==0))return null;return [mod(v[0]-b*de[0]),b];});
 const key=(i,delta)=>{let a=affine[i%172];return a===null?null:mod(a[0]+a[1]*delta);};
 const independent=affine.map((a,i)=>a&&a[1]===0?i:null).filter(i=>i!==null);
 const forced=affine.map((a,i)=>a?i:null).filter(i=>i!==null);
 const rk=new Map(corpus.runes.map((x,i)=>[x,i]));
 const sources=solved.sections.map(s=>({name:s.name,plain:[...s.source_text].filter(x=>rk.has(x)).map(x=>rk.get(x))}));
 const plants=["0_koan_1","0_loss_of_divinity"];
 const counts=Array.from({length:29},()=>Array(29).fill(0.2));for(const s of sources.filter(s=>!plants.includes(s.name)))for(let i=1;i<s.plain.length;i++)counts[s.plain[i-1]][s.plain[i]]++;
 const logp=counts.map(row=>{let sum=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/sum));});
 function readout(cipher,delta){return cipher.map((v,i)=>{let k=key(i,delta);return k===null?null:mod(v-k);});}
 function score(p,lo,hi){let sum=0,n=0;for(let i=lo+1;i<hi;i++)if(p[i]!==null&&p[i-1]!==null){sum+=logp[p[i-1]][p[i]];n++;}return {mean:n?sum/n:null,n};}
 function render(p,lo,hi){let out=[];let start=-1;for(let i=lo;i<=hi;i++){if(i<hi&&p[i]!==null){if(start<0)start=i;}else if(start>=0){out.push({start,end:i,indices:p.slice(start,i),text:p.slice(start,i).map(x=>corpus.translit[x]).join("")});start=-1;}}return out;}
 function fit(cipher){let a=[];for(let delta=0;delta<29;delta++){let p=readout(cipher,delta);a.push({delta,fit:score(p,13,262),hold:score(p,262,729)});}return a.sort((x,y)=>y.fit.mean-x.fit.mean||x.delta-y.delta);}
 function reach(cipher,delta){let states=new Set([13]);for(let i=13;i<cipher.length;i++){let c=cipher[i],next=new Set();for(let q of states){let k=key(q,delta);if(c===0)next.add(q);if(k===null||c!==k)next.add((q+1)%172);}if(!next.size)return {prefix:i,states:0};states=next;}return {prefix:cipher.length,states:states.size};}
 const originalRanks=fit(C), winner=originalRanks[0].delta, originalP=readout(C,winner);
 const originalReach=Array.from({length:29},(_,delta)=>({delta,...reach(C,delta)}));
 const originalIndependent=render(C.map((v,i)=>{let a=affine[i%172];return a&&a[1]===0?mod(v-a[0]):null;}),13,729);
 const controls=plants.map((name,j)=>{const p=title.concat(sources.find(s=>s.name===name).plain.slice(0,716));check(p.length===729,"plant length");
   const vals=unk.map((w,i)=>mod([...w].reduce((a,c)=>a+c.charCodeAt(0),0)+j*(i+1)));
   const evalv=v=>mod(v[0]+v.slice(1).reduce((a,z,i)=>a+z*vals[i],0));
   const stream=Array.from({length:729},(_,i)=>evalv(expr[i%172]));const delta=evalv(de);
   let cc=p.map((v,i)=>mod(v+stream[i]));check(eq(cc.slice(0,13),C.slice(0,13)),"plant title");
   let q=readout(cc,delta);check(q.every((v,i)=>v===null||v===p[i]),"forced-rune plant recovery");
   let ranks=fit(cc), best=ranks[0], truth=ranks.find(x=>x.delta===delta);
   let clock=0;let ff=p.map(v=>v===0?0:mod(v+stream[clock++]));let fr=reach(ff,delta);check(fr.prefix===729,"F truth reachability");
   check(ff.every((c,i)=>i>=13||c===C[i]),"F title");
   let t=0;let back=p.map((v,i)=>v===0?0:mod(ff[i]-stream[t++]));check(eq(back,p),"F replay");
   return {name,delta,rank:ranks.findIndex(x=>x.delta===delta)+1,best,truth,forcedRecovered:q.filter(v=>v!==null).length,Ftruth:fr};
 });
 return {signedLabels:labels,rotatedWords:words,lookup,unknownWords:unk,deltaExpression:de,affine,forcedPhases:forced,independentPhases:independent,sourceLengths:sources.map(s=>[s.name,s.plain.length]),original:{ranks:originalRanks,independent:originalIndependent,bestFragments:render(originalP,13,729),reach:originalReach,forcedBodyCount:originalP.slice(13).filter(x=>x!==null).length},controls};
}
const result=core(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/historical/cicada2016-4gq25-outguess.asc"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))); console.log(JSON.stringify(result,null,2));
