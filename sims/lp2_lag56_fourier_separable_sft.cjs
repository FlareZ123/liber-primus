"use strict";
const fs=require("node:fs"),path=require("node:path");
function run(gp,nativeSource,literature) {
 const Q=29,mod=x=>(x%Q+Q)%Q, assert=(x,m)=>{if(!x)throw Error(m)};
 let seed=0x7a275623;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const parse=s=>{const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(x=>w.startsWith(x.s));assert(t,"GP token "+w);out.push(t.i);w=w.slice(t.s.length)}}return out};
 const index=new Map(gp.runes.map((s,i)=>[s,i]));
 const sources=nativeSource.sections.map(s=>[...s.source_text].filter(c=>index.has(c)).map(c=>index.get(c)));
 const counts=Array(Q).fill(.5),counts2=Array.from({length:Q},()=>Array(Q).fill(0));
 for(const s of sources)for(let i=0;i<s.length;i++){counts[s[i]]++;if(i)counts2[s[i-1]][s[i]]++}
 const sum=a=>a.reduce((x,y)=>x+y,0), p=counts.map(x=>x/sum(counts)),L=p.map(x=>Math.log(Q*x));
 const L2=counts2.map(a=>a.map((x,j)=>Math.log(Q*(x+12*p[j])/(sum(a)+12))));
 const native=sources.flat();
 const original=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 const cut=gp.pages.filter(p=>p.page<40).reduce((n,p)=>n+p.indices.length,0);
 assert(original.length===12956&&cut===9640,"source geometry");
 const ph=Array.from({length:14},(_,i)=>{const k=i+1,co=p.reduce((a,v,j)=>a+v*Math.cos(2*Math.PI*k*j/Q),0),si=p.reduce((a,v,j)=>a+v*Math.sin(2*Math.PI*k*j/Q),0);return {k,co,si,amp:Math.hypot(co,si)}}).sort((a,b)=>b.amp-a.amp);
 function keynorm(A,B){const b=B[0];return {A:A.map(a=>mod(a+b)),B:B.map(a=>mod(a-b))}}
 function keyrandom(){return keynorm(Array.from({length:Q},()=>Math.floor(Q*rnd())),Array.from({length:Q},()=>Math.floor(Q*rnd())))}
 function encode(P,key,iv){const C=iv.slice();for(let i=6;i<6+P.length;i++)C.push(mod(P[i-6]+key.A[C[i-5]]+key.B[C[i-6]]));return C}
 function decode(C,key){const P=[];for(let i=6;i<C.length;i++)P.push(mod(C[i]-key.A[C[i-5]]-key.B[C[i-6]]));assert(encode(P,key,C.slice(0,6)).every((c,i)=>c===C[i]),"replay");return P}
 function problem(C,start,end){const count=new Uint32Array(Q**3),w=new Float64Array(Q**3),xx=[],yy=[],cc=[];
 for(let i=Math.max(6,start);i<end;i++){const x=C[i-5],y=C[i-6],c=C[i];count[(x*Q+y)*Q+c]++;xx.push(x);yy.push(y);cc.push(c)}
 for(let x=0;x<Q;x++)for(let y=0;y<Q;y++){const base=(x*Q+y)*Q;for(let s=0;s<Q;s++){let z=0;for(let c=0;c<Q;c++)z+=count[base+c]*L[mod(c-s)];w[base+s]=z}}
 return{count,w,xx,yy,cc,n:cc.length}}
 function uni(pr,key){let z=0;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)z+=pr.w[(x*Q+y)*Q+mod(key.A[x]+key.B[y])];return z}
 function refine(pr,key){const A=key.A.slice(),B=key.B.slice();
 for(let t=0;t<30;t++){let change=0;
 for(let side=0;side<2;side++){const u=side?B:A,v=side?A:B;
 for(let i=0;i<Q;i++){let hi=-Infinity,arg=u[i];for(let a=0;a<Q;a++){let val=0;for(let j=0;j<Q;j++)val+=pr.w[(side?j*Q+i:i*Q+j)*Q+((a+v[j])%Q)];if(val>hi+1e-10){hi=val;arg=a}}if(arg!==u[i]){u[i]=arg;change++}}}
 if(!change)break}
 return keynorm(A,B)}
 function spectral(pr,h,rep){const {k,co,si,amp}=h,cr=new Float64Array(Q*Q),ci=new Float64Array(Q*Q),cos=Array.from({length:Q},(_,c)=>Math.cos(2*Math.PI*k*c/Q)),sin=Array.from({length:Q},(_,c)=>Math.sin(2*Math.PI*k*c/Q));
 for(let a=0;a<Q*Q;a++)for(let c=0;c<Q;c++){const n=pr.count[a*Q+c];cr[a]+=n*(cos[c]*co+sin[c]*si)/amp;ci[a]+=n*(sin[c]*co-cos[c]*si)/amp}
 const ar=new Float64Array(Q),ai=new Float64Array(Q),br=new Float64Array(Q),bi=new Float64Array(Q);
 for(let i=0;i<Q;i++){let v=rep===0?0:2*Math.PI*rnd();br[i]=Math.cos(v);bi[i]=Math.sin(v)}
 for(let t=0;t<60;t++)for(let side=0;side<2;side++){const ur=side?br:ar,ui=side?bi:ai,vr=side?ar:br,vi=side?ai:bi;
 for(let i=0;i<Q;i++){let R=0,I=0;for(let j=0;j<Q;j++){const a=side?j*Q+i:i*Q+j;R+=cr[a]*vr[j]+ci[a]*vi[j];I+=ci[a]*vr[j]-cr[a]*vi[j]}const d=Math.hypot(R,I);if(d){ur[i]=R/d;ui[i]=I/d}else{ur[i]=1;ui[i]=0}}}
 const inv=Array.from({length:Q},(_,i)=>i).find(i=>(i*k)%Q===1),theta=Math.atan2(bi[0],br[0]);
 const A=Array.from(ar,(v,i)=>mod(inv*Math.round(Q*(Math.atan2(ai[i],v)+theta)/(2*Math.PI))));
 const B=Array.from(br,(v,i)=>mod(inv*Math.round(Q*(Math.atan2(bi[i],v)-theta)/(2*Math.PI))));
 return keynorm(A,B)}
 function markov(pr,key){let z=0,last=-1;for(let i=0;i<pr.n;i++){const v=mod(pr.cc[i]-key.A[pr.xx[i]]-key.B[pr.yy[i]]);z+=last<0?L[v]:L2[last][v];last=v}return z}
 function markRefine(pr,key){const A=key.A.slice(),B=key.B.slice(),P=pr.cc.map((c,i)=>mod(c-A[pr.xx[i]]-B[pr.yy[i]]));
 const lists=[pr.xx,pr.yy].map(xs=>Array.from({length:Q},(_,u)=>{const positions=[],edges=new Set();for(let i=0;i<xs.length;i++)if(xs[i]===u){positions.push(i);edges.add(i);if(i+1<xs.length)edges.add(i+1)}return{positions,edges:[...edges]}}));
 for(let round=0;round<10;round++){let changed=0;for(let side=0;side<2;side++){const vec=side?B:A,xs=side?pr.yy:pr.xx;
 for(let j=0;j<Q;j++){const {positions,edges}=lists[side][j];const old=vec[j];let best=-Infinity,arg=old;
 for(let d=0;d<Q;d++){let score=0;for(const e of edges){const v=xs[e]===j?mod(P[e]-d):P[e];if(e===0)score+=L[v];else{const u=xs[e-1]===j?mod(P[e-1]-d):P[e-1];score+=L2[u][v]}}if(score>best+1e-9){best=score;arg=mod(old+d)}}
 if(arg!==old){changed++;const d=mod(arg-old);vec[j]=arg;for(const i of positions)P[i]=mod(P[i]-d)}}}if(!changed)break}
 const k=keynorm(A,B);assert(P.every((v,i)=>v===mod(pr.cc[i]-k.A[pr.xx[i]]-k.B[pr.yy[i]])),"incremental decode");return k}
 function fit(pr){const pool=[],push=(k,tag)=>{const z=refine(pr,k);pool.push({key:z,tag,uni:uni(pr,z),initial:uni(pr,k)})};
 push({A:Array(Q).fill(0),B:Array(Q).fill(0)},"zero");
 for(const h of ph.slice(0,6))for(let j=0;j<4;j++)push(spectral(pr,h,j),`fourier${h.k}/${j}`);
 for(let j=0;j<16;j++)push(keyrandom(),`random${j}`);
 pool.sort((a,b)=>b.uni-a.uni);const unique=new Set(),top=[];
 for(const k of pool){const code=JSON.stringify(k.key);if(unique.has(code))continue;unique.add(code);const f=markRefine(pr,k.key);top.push({...k,markov:markov(pr,f),key:f,finalUni:uni(pr,f)});if(top.length===5)break}
 top.sort((a,b)=>b.markov-a.markov);
 return {...top[0],distinct:unique.size,top:top.map(x=>({tag:x.tag,uni:x.uni,markov:x.markov,finalUni:x.finalUni})),bestFourier:Math.max(...pool.filter(x=>x.tag.startsWith("fourier")).map(x=>x.uni)),bestRandom:Math.max(...pool.filter(x=>x.tag.startsWith("random")).map(x=>x.uni)),bestFourierInitial:Math.max(...pool.filter(x=>x.tag.startsWith("fourier")).map(x=>x.initial))}}
 function upper(pr,g,transpose){let total=0;const blocks=[];for(let off=0;off<Q;off+=g){const m=Math.min(g,Q-off),shifts=Array(m).fill(0),ts=Array.from({length:m},(_,j)=>Array.from({length:Q},(_,x)=>pr.w.slice((transpose?(off+j)*Q+x:x*Q+off+j)*Q,(transpose?(off+j)*Q+x:x*Q+off+j)*Q+Q)));let best=-Infinity;
 for(let code=0;code<Q**(m-1);code++){let n=code;for(let j=1;j<m;j++){shifts[j]=n%Q;n=Math.floor(n/Q)}let val=0;for(let x=0;x<Q;x++){let hi=-Infinity;for(let a=0;a<Q;a++){let v=ts[0][x][a];for(let j=1;j<m;j++)v+=ts[j][x][(a+shifts[j])%Q];if(v>hi)hi=v}val+=hi}if(val>best)best=val}
 blocks.push(best);total+=best}return{g,transpose,total,blocks}}
 function inspect(C,truth,keyTruth,label){const tr=problem(C,6,cut),te=problem(C,cut,C.length);const f=fit(tr),D=decode(C,f.key),held=D.slice(cut-6);const out={label,fit:f,trainN:tr.n,heldN:te.n,heldUni:uni(te,f.key),heldMarkov:markov(te,f.key),heldPreview:held.slice(0,100).map(x=>gp.translit[x]).join(" "),doublets:C.slice(1).filter((c,i)=>c===C[i]).length};
 if(truth){out.heldHits=held.reduce((n,x,i)=>n+(x===truth[cut-6+i]),0);out.trainHits=D.slice(0,cut-6).reduce((n,x,i)=>n+(x===truth[i]),0);out.keyHits=f.key.A.reduce((n,x,i)=>n+(x===keyTruth.A[i]),0)+f.key.B.reduce((n,x,i)=>n+(x===keyTruth.B[i]),0);out.trueTrainUni=uni(tr,keyTruth);out.trueTrainMarkov=markov(tr,keyTruth);out.trueHeldMarkov=markov(te,keyTruth)}
 return out}
 const controls=literature.map((t,i)=>{const s=parse(t),P=s.slice(10000,10000+original.length-6);assert(P.length===original.length-6,"control length");const K=keyrandom(),C=encode(P,K,original.slice(0,6));return inspect(C,P,K,`native${i}`)});
 const o=inspect(original,null,null,"LP2");const full=problem(original,6,original.length);
 const bound=[upper(full,1,false),upper(full,2,false),upper(full,2,true),upper(full,3,false),upper(full,3,true)];
 assert(bound.every(x=>x.total>=uni(full,o.fit.key)-1e-6),"upper bound");
 return{nativeN:native.length,harmonics:ph,cut,controls,original:o,bound,uniformLLR:0};
}
const root=path.resolve(__dirname,"..");
const names=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const vals=names.map(n=>fs.readFileSync(path.join(root,n),"utf8"));
console.log(JSON.stringify(run(JSON.parse(vals[0]),JSON.parse(vals[1]),vals.slice(2)),null,2));
