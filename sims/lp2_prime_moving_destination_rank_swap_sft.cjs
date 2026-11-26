'use strict';
const fs=require('node:fs'),path=require('node:path');
function common(corpus){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const Q=29,gp=Array.from({length:Q},(_,i)=>i);
 const primes=[];for(let n=2;primes.length<13000;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)primes.push(n)}
 const affine=[];for(let a=1;a<Q;a++)for(let b=0;b<Q;b++)affine.push({a,b,D:Uint8Array.from(primes,p=>(a*((p-1)%Q)+b)%Q)});
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const idx=new Map(corpus.runes.map((s,i)=>[s,i]));
 function tokenize(s){const p=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));assert(t,"token "+w);p.push(t.i);w=w.slice(t.s.length)}}return p}
 function hist(p,q=Q){const f=new Int32Array(q);for(const x of p)f[x]++;return f}
 function swap(A,j,d){const x=A[j];A[j]=A[d];A[d]=x}
 function encode(p,D,A,clock,hold){const c=[],mask=[];let h=0;A=A.slice();for(let i=0;i<p.length;i++){const y=p[i];if(hold&&y===0){c.push(0);mask.push(true);h++;continue}const j=A.indexOf(y);assert(j>=0,"symbol absent");c.push(j);mask.push(false);swap(A,j,D[clock==="active"?i-h:i])}return {c,mask}}
 function decode(c,D,A,clock,mask,transparent=false){const p=[];let h=0;A=A.slice();for(let i=0;i<c.length;i++){if(mask?.[i]){if(c[i]!==0)return null;p.push(0);h++;continue}const y=A[c[i]];if(transparent&&y===0)return null;p.push(y);swap(A,c[i],D[clock==="active"?i-h:i])}return p}
 function reach(c,D,clock,q=Q){let s=new Uint32Array(c.filter(x=>x===0).length+1);s[0]=(1<<q)-1;let z=0;for(let i=0;i<c.length;i++){const y=c[i],b=1<<y;let any=0;for(let h=z;h>=0;h--){const d=D[clock==="active"?i-h:i],old=s[h];let v=old&~b;if(d!==y&&(v&(1<<d)))v=(v&~(1<<d))|b;s[h]=v;if(y===0){s[h+1]|=old;any|=s[h+1]}any|=v}if(y===0)z++;if(!any)return null}const hh=Array.from(s,(v,i)=>v?i:-1).filter(x=>x>=0);return {minF:hh[0],maxF:hh.at(-1),counts:hh}}
 function maxToken(c,D,clock,q=Q){let s=new Map();for(let f=0;f<q;f++){const row=new Int16Array(q);row[f]=-30000;s.set(f,row)}let peak=q;for(let i=0;i<c.length;i++){const y=c[i],next=new Map();const put=(k,row,from=-1,to=-1,inc=false)=>{let t=next.get(k);if(!t){t=new Int16Array(q);t.fill(-30000);next.set(k,t)}for(let j=0;j<q;j++){if(row[j]<0)continue;const jj=j===from?to:j===to?from:j,v=row[j]+(inc&&j===from?1:0);if(v>t[jj])t[jj]=v}};for(const [k,row] of s){const h=Math.floor(k/q),f=k%q,d=D[clock==="active"?i-h:i];if(y===0)put(k+q,row);if(f!==y)put(h*q+(f===d?y:f),row,y,d,true)}s=next;peak=Math.max(peak,s.size);if(!s.size)return null}let maxNonF=0,minF=Infinity,maxF=0;for(const [k,row] of s){maxNonF=Math.max(maxNonF,...row);minF=Math.min(minF,Math.floor(k/q));maxF=Math.max(maxF,Math.floor(k/q))}return {maxNonF,minF,maxF,peak}}
 const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
 const full=pages.flat();assert(full.length===12956&&pages.length===55&&chapters.flat().join()===full.join(),"corpus framing");
 return {assert,Q,gp,affine,tokenize,idx,hist,encode,decode,reach,maxToken,pages,chapters,full};
}
function control(corpus,native,donors){
 const {assert,Q,gp,affine,tokenize,idx,hist,encode,decode,reach,maxToken,full}=common(corpus);
 const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 let toyCases=0;
 for(let n=0;n<=5;n++)for(let code=0;code<3**n;code++){
  let v=code,c=[];for(let i=0;i<n;i++){c.push(v%3);v=Math.floor(v/3)}
  const zeros=c.flatMap((x,i)=>x===0?[i]:[]);
  for(const D of [Array.from({length:n},(_,i)=>(i+1)%3),Array.from({length:n},(_,i)=>(i*i+2)%3)])for(const clock of ["active","physical"]){
   const counts=new Set();let mx=-1;
   for(const A of perms)for(let m=0;m<2**zeros.length;m++){const mask=c.map((x,i)=>x===0&&!!(m&(1<<zeros.indexOf(i))));const p=decode(c,D,A,clock,mask,true);if(!p)continue;const f=hist(p,3);counts.add(f[0]);mx=Math.max(mx,f[1],f[2])}
   const r=reach(c,D,clock,3),t=maxToken(c,D,clock,3);assert(!!r===!!t&&!!r===(counts.size>0),"toy existence");
   if(r){assert(r.counts.join()===Array.from(counts).sort((a,b)=>a-b).join(),"toy count set");assert(t.maxNonF===mx&&t.minF===r.minF&&t.maxF===r.maxF,"toy max-count projection")}
   toyCases++;
  }
 }
 const donorRunes=donors.map(tokenize),N=full.length;
 const comparison=donorRunes.map(p=>{let minMax=Infinity,minF=Infinity,maxF=0,windows=0;for(let off=0;off+N<=p.length;off+=Math.floor(N/8)){const f=hist(p.slice(off,off+N));minMax=Math.min(minMax,Math.max(...f));minF=Math.min(minF,f[0]);maxF=Math.max(maxF,f[0]);windows++}return {nativeRunes:p.length,windows,minMax,minF,maxF}});
 const nativeP=native.sections.flatMap(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
 const controls=[];
 for(let u=0;u<3;u++){
  const p=nativeP.concat(donorRunes[u].slice(5000,6500)),fit=nativeP.length;
  const a=7+u*3,b=12+u*4,D=affine.find(k=>k.a===a&&k.b===b).D,A=gp.map(x=>((11+2*u)*x+3+u)%Q);
  const ordinary=encode(p,D,A,"active",false);assert(decode(ordinary.c,D,A,"active",null).join()===p.join(),"ordinary plant replay");
  const candidates=[];
  for(const key of affine){
   const abstract=decode(ordinary.c.slice(0,fit),key.D,gp,"active",null),map=new Int16Array(Q).fill(-1),inv=new Int16Array(Q).fill(-1);let ok=true;
   for(let i=0;i<fit;i++){const x=abstract[i],y=p[i];if((map[x]!==-1&&map[x]!==y)||(inv[y]!==-1&&inv[y]!==x)){ok=false;break}map[x]=y;inv[y]=x}
   if(!ok)continue;
   const pred=decode(ordinary.c,key.D,gp,"active",null).slice(fit).map(x=>map[x]);
   candidates.push({a:key.a,b:key.b,mapped:Array.from(map).filter(x=>x>=0).length,heldKnown:pred.filter(x=>x>=0).length,heldCorrect:pred.filter((x,i)=>x===p[fit+i]).length});
  }
  assert(candidates.length===1&&candidates[0].a===a&&candidates[0].b===b,"plant affine recovery");assert(candidates[0].heldCorrect===candidates[0].heldKnown,"plant held-out prediction");
  const held=[];
  for(const clock of ["active","physical"]){const P=p.slice(0,1000),plant=encode(P,D,A,clock,true),back=decode(plant.c,D,A,clock,plant.mask,true),f=hist(P),r=reach(plant.c,D,clock),t=maxToken(plant.c,D,clock);assert(back&&back.join()===P.join(),"F plant replay");assert(r&&r.counts.includes(f[0])&&t&&t.maxNonF>=Math.max(...f.slice(1)),"F plant path retained");held.push({clock,runes:P.length,holds:f[0],consumingZeros:plant.c.filter((x,i)=>x===0&&!plant.mask[i]).length,actualMaxNonF:Math.max(...f.slice(1)),exactMaxNonF:t.maxNonF})}
  controls.push({fit,holdout:p.length-fit,actual:{a,b},candidates,held});
 }
 return {N,affineKeys:affine.length,toyCases,comparison,controls};
}
function original(corpus,frame,reverse,clock){
 const {assert,gp,affine,hist,decode,reach,maxToken,pages,chapters,full}=common(corpus);
 const base=({book:[full],chapter:chapters,page:pages})[frame];assert(base,"frame name");
 const frames=base.map(x=>reverse?x.slice().reverse():x);
 if(clock==="ordinary"){
  const rows=frames.map(c=>{let best=0;for(const k of affine){const p=decode(c,k.D,gp,"active",null);best=Math.max(best,Math.max(...hist(p)))}return best});
  return {frame,reverse,clock,ordinaryMaxPrivate:rows.reduce((s,x)=>s+x,0),perFrame:rows};
 }
 assert(clock==="active"||clock==="physical","clock name");
 const rs=[];
 for(const c of frames){let legal=0,maxNonF=0,minF=Infinity,maxF=0,peak=0;
  for(const k of affine){const r=reach(c,k.D,clock);if(!r)continue;legal++;const t=maxToken(c,k.D,clock);assert(t&&t.minF===r.minF&&t.maxF===r.maxF,"projection agreement");maxNonF=Math.max(maxNonF,t.maxNonF);minF=Math.min(minF,r.minF);maxF=Math.max(maxF,r.maxF);peak=Math.max(peak,t.peak)}
  rs.push({legal,maxNonF,minF:legal?minF:null,maxF:legal?maxF:null,peak});
 }
 const dead=rs.flatMap((v,i)=>v.legal?[]:[i]);
 return {frame,reverse,clock,dead,legalKeyFrames:rs.reduce((s,x)=>s+x.legal,0),maxNonF:dead.length?null:rs.reduce((s,x)=>s+x.maxNonF,0),minF:dead.length?null:rs.reduce((s,x)=>s+x.minF,0),maxF:dead.length?null:rs.reduce((s,x)=>s+x.maxF,0),perFrame:rs};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');const corpus=JSON.parse(read(paths[0]));const [mode,frame,dir,clock]=process.argv.slice(2);const result=mode==='original'?original(corpus,frame,dir==='reverse',clock):control(corpus,JSON.parse(read(paths[1])),paths.slice(2).map(read));console.log(JSON.stringify(result,null,2));}
module.exports={common,control,original};
