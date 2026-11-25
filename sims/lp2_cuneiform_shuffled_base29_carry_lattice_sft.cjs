"use strict";
function experiment(raw,index){
 const g=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(g.runes.map((x,i)=>[x,i])),tokens=g.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),assert=(x,m)=>{if(!x)throw Error(m)},A=29n**3n;
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),wordruns=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let j=0;j<w.length;){const t=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(t=>w.startsWith(t.t,j));assert(t,"unknown "+w);a.push(t.i);j+=t.t.length;}return a;}
 const hold=new Set(["0_koan_1","0_loss_of_divinity"]),types=new Set();for(const s of gold.sections.filter(s=>!hold.has(s.name)))for(const w of wordruns(s.source_text))types.add(id(w));
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const lex=Array.from({length:30},()=>[]);for(const s of types)if(s.length<30)lex[s.length].push(Array.from(s,x=>x.charCodeAt(0)-65));
 const M=n=>29n**BigInt(n),mod=(x,m)=>(x%m+m)%m;
 const int=(w,be)=>(be?w:w.slice().reverse()).reduce((x,d)=>29n*x+BigInt(d),0n);
 function dig(x,n,be){const out=Array(n);for(let j=0;j<n;j++){out[be?n-1-j:j]=Number(x%29n);x/=29n;}assert(x===0n,"overflow");return out;}
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}assert(r===1n,"unit");return mod(t,m);}
 const floor=(n,d)=>n>=0n?n/d:-((-n+d-1n)/d),ceil=(n,d)=>-floor(-n,d);
 function makeLattice(x,m,cap){
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],nearest=(n,d)=>n<0n?-nearest(-n,d):(2n*n+d)/(2n*d);
  let v=[1n,x],w=[0n,m];for(;;){if(dot(w,w)<dot(v,v))[v,w]=[w,v];const q=nearest(dot(v,w),dot(v,v));if(!q)break;w=[w[0]-q*v[0],w[1]-q*v[1]];}
  let det=v[0]*w[1]-v[1]*w[0];if(det<0n){w=w.map(z=>-z);det=-det;}assert(det===m,"det");
  return (target,visit)=>{
   const lo=target-cap+2n,hi=target,amin=1n,amax=cap-1n;
   function bounds(f){const vals=[f(amin,lo),f(amin,hi),f(amax,lo),f(amax,hi)];let a=vals[0],b=a;for(const v of vals){if(v<a)a=v;if(v>b)b=v;}return [ceil(a,det),floor(b,det)];}
   const [v0,v1]=bounds((x,y)=>x*w[1]-y*w[0]),[w0,w1]=bounds((x,y)=>v[0]*y-v[1]*x);
   function inner(q,f,g,l,h){for(const [o,k,L,H] of [[q*f[0],g[0],amin,amax],[q*f[1],g[1],lo,hi]]){if(!k){if(o<L||o>H)return;continue;}const u=k>0n?ceil(L-o,k):ceil(o-H,-k),v=k>0n?floor(H-o,k):floor(o-L,-k);if(u>l)l=u;if(v<h)h=v;if(l>h)return;}for(let j=l;j<=h;j++){const a=q*f[0]+j*g[0],y=q*f[1]+j*g[1],s=target-y;if(a%29n&&s>=0n&&s<a){assert(mod(a*x+s,m)===target,"witness");visit(Number(a),Number(s));}}}
   if(v1-v0<=w1-w0){for(let q=v0;q<=v1;q++)inner(q,v,w,w0,w1);}else{for(let q=w0;q<=w1;q++)inner(q,w,v,v0,v1);}
  };
 }
 let toy=0;for(let m=3n;m<=29n;m+=2n)for(let x=0n;x<m;x++)for(let t=0n;t<m;t++){let got=[];makeLattice(x,m,6n)(t,(a,s)=>got.push(a*100+s));const exp=[];for(let a=1n;a<6n;a++)for(let s=0n;s<a;s++)if(mod(a*x+s,m)===t)exp.push(Number(a*100n+s));assert(same(got.sort((a,b)=>a-b),exp.sort((a,b)=>a-b)),"toy");toy++;}
 let W=[],w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=g.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(W.length===2896&&same(W.flat(),tape),"source");
 const start=g.pages.filter(p=>p.page<33).reduce((x,p)=>x+p.indices.length,0),end=start+1680,cut=start+1212;
 let pos=0;const rows=W.map(w=>{const s=pos;pos+=w.length;return {w,s};}).filter(q=>q.s>=start&&q.s+q.w.length<=end);
 assert(rows.length>100,"scope");
 const specs=[{section:"0_koan_1",be:true,enc:true,key:1033},{section:"0_loss_of_divinity",be:false,enc:false,key:3301},{section:"0_koan_1",be:false,enc:true,key:19837},{section:"0_loss_of_divinity",be:true,enc:false,key:21421}];
 const original=index>=4,be=original?!!((index-4)&1):specs[index].be,enc=original?!(index>=6):specs[index].enc;
 let groups,truth=null,seed=20261125+index;
 function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
 if(original)groups=rows.map(q=>({c:q.w,fit:q.s+q.w.length<=cut,source:q.s})).filter(q=>q.c.length>=8);
 else{
  const spec=specs[index],words=wordruns(gold.sections.find(s=>s.name===spec.section).source_text),a=BigInt(spec.key);
  const L=be?words.slice().reverse():words,all=[];let carry=0n;
  for(let j=0;j<L.length;j++){const p=L[j],m=M(p.length),pv=int(p,be),s=carry,cv=enc?mod(a*pv+carry,m):mod(inv(a,m)*(pv-carry),m);carry=enc?(a*pv+carry-cv)/m:(a*cv+carry-pv)/m;assert(carry>=0n&&carry<a,"plant carry");all.push({c:dig(cv,p.length,be),p,si:Number(s),so:Number(carry),source:j});}
  for(let j=all.length-1;j>0;j--){const k=rand(j+1);[all[j],all[k]]=[all[k],all[j]];}
  groups=all.map((q,j)=>({...q,fit:j<Math.floor(all.length*.7)})).filter(q=>q.c.length>=8);truth=spec;
 }
 const cache=new Map(),countsFit=new Map(),countsHold=new Map(),local=[];
 for(const q of groups){
  const m=M(q.c.length),c=int(q.c,be),matches=new Map(),dict=lex[q.c.length];let pairs=0;
  const fixed=enc?null:makeLattice(c,m,A);
  for(const p of dict){const pv=int(p,be);let fn=fixed,target=pv;if(enc){const key=q.c.length+":"+pv;fn=cache.get(key);if(!fn){fn=makeLattice(pv,m,A);cache.set(key,fn);}target=c;}
   fn(target,(a,s)=>{pairs++;let list=matches.get(a);if(!list)matches.set(a,list=[]);list.push({p,s});});}
  const totals=q.fit?countsFit:countsHold;for(const a of matches.keys())totals.set(a,(totals.get(a)||0)+1);
  local.push({q,matches,pairs,lex:dict.length,truthLex:q.p?types.has(id(q.p)):null});
 }
 const top=[...countsFit].sort((a,b)=>b[1]-a[1]||a[0]-b[0]),max=top[0]?.[1]||0,best=top[0]?.[0]||null,fitN=groups.filter(q=>q.fit).length,holdN=groups.length-fitN;
 const reportKey=a=>{const detail=local.map(({q,matches,pairs,lex,truthLex})=>{const list=matches.get(a)||[];return {source:q.source,len:q.c.length,fit:q.fit,forms:lex,allKeyPairs:pairs,localKeys:matches.size,choices:list.length,unique:list.length===1?list[0].p.map(x=>g.translit[x]).join(""):null,truthLex,truthIncluded:q.p?list.some(x=>same(x.p,q.p)&&x.s===q.si):null,truthUnique:q.p?list.length===1&&same(list[0].p,q.p)&&list[0].s===q.si:null};});return {a,fit:countsFit.get(a)||0,hold:countsHold.get(a)||0,detail};};
 const bestReport=best?reportKey(best):null,truthReport=truth?reportKey(truth.key):null;
 if(truth){assert(truthReport.detail.every(x=>!x.truthLex||x.truthIncluded),"true lexical anchor lost");}
 return {index,original,be,enc,A:Number(A),sourceStart:start,sourceEnd:end,fitN,holdN,lexicon:types.size,toy,truth,distinctFitKeys:countsFit.size,maxFit:max,ties:top.filter(x=>x[1]===max).length,top10:top.slice(0,10),best:bestReport,sourceKeys:original?[1033,3301].map(reportKey):null,truthReport,truthRank:truth?top.findIndex(x=>x[0]===truth.key)+1:null};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),Number(process.argv[2]||0)),null,2));}
module.exports=experiment;
