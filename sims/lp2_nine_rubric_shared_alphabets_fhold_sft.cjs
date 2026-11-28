'use strict';

function study(data,which=0) {
const [rawCorpus,emerson,shakespeare,gibran]=data,c=JSON.parse(rawCorpus),Q=29,id=Array.from({length:Q},(_,i)=>i),m=x=>(x%Q+Q)%Q;
const assert=(x,msg)=>{if(!x)throw Error(msg)};
const starts=[0,3,8,15,23,27,33,40,54,56],lens=[13,16,12,20,16,19,10,8,9];
const scopes=lens.map((n,i)=>{const t=c.pages.slice(starts[i],starts[i+1]).flatMap(p=>p.indices);return {K:t.slice(0,n),C:t.slice(n)}});
const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function word(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)return null;out.push(t.i);i+=t.s.length}}return out}
  const words=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).map(word).filter(x=>x?.length);

const tape=s=>words(s).flat(),train=tape(emerson),freq=new Float64Array(Q).fill(.5),LM=new Float64Array(Q*Q).fill(.5);
for(let i=0;i<train.length;i++){freq[train[i]]++;if(i)LM[train[i-1]*Q+train[i]]++}
const norm=(a,log)=>{const z=a.reduce((s,x)=>s+x,0);for(let i=0;i<a.length;i++)a[i]=log?Math.log(a[i]/z):a[i]/z};
norm(freq,false);for(let i=0;i<Q;i++)norm(LM.subarray(i*Q,(i+1)*Q),true);
const first=Float64Array.from(freq,Math.log),last=new Float64Array(Q);
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function perm(rand,fix0){const a=id.slice(),lo=fix0?1:0;for(let i=Q-1;i>lo;i--){const j=lo+Math.floor(rand()*(i-lo+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function inv(a){const b=new Int8Array(Q);for(let i=0;i<Q;i++)b[a[i]]=i;return b}
  function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);for(let i=1;i<=Q;i++){p[0]=i;let j0=0;const min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){const z=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(z<min[j]){min[j]=z;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=Q;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}const out=new Int8Array(Q);for(let j=1;j<=Q;j++)out[p[j]-1]=j-1;return out}
  function encrypt(P,K,A,B){const I=inv(B);let j=0;return P.map(p=>p===0?0:I[m(A[p]+K[(j++)%K.length])])}

function setup(C,K){return {C,K,n:C.length,L:K.length}}
function pool(rows,emit){
 const G=new Float64Array(Q*Q);let ll=0;
 for(const {C,K,n,L} of rows){
  const F=new Float64Array((n+1)*L),S=new Float64Array(n);F[0]=1;
  for(let i=0;i<n;i++){const a=i*L,b=a+L,c=C[i],off=c*Q;let z=0;
   for(let j=0;j<L;j++){const w=F[a+j],j1=(j+1)%L;F[b+j1]+=w*emit[off+K[j]];if(c===0)F[b+j]+=w*freq[0]}
   for(let j=0;j<L;j++)z+=F[b+j];if(!(z>0))return {ll:-Infinity};S[i]=z;ll+=Math.log(z);for(let j=0;j<L;j++)F[b+j]/=z}
  let B=new Float64Array(L).fill(1),T=new Float64Array(L);
  for(let i=n-1;i>=0;i--){const a=i*L,c=C[i],off=c*Q,z=S[i];for(let j=0;j<L;j++){const j1=(j+1)%L,x=emit[off+K[j]]*B[j1];G[off+K[j]]+=F[a+j]*x/z;T[j]=(x+(c===0?freq[0]*B[j]:0))/z}[B,T]=[T,B]}
 }return {ll,G}}
function decode(row,A,B,unigram=false){
 const I=inv(A),{C,K,n,L}=row,W=2*L;let v=new Float64Array(W).fill(-Infinity),nv=new Float64Array(W);const back=new Int8Array(n*W).fill(-1);v[0]=0;
 for(let i=0;i<n;i++){nv.fill(-Infinity);const c=C[i];for(let a=0;a<W;a++){if(!Number.isFinite(v[a]))continue;const j=a>>1,ty=a&1,prev=i?(ty?0:I[m(B[C[i-1]]-K[(j+L-1)%L])]):0;
  const p=I[m(B[c]-K[j])];if(p){const b=2*((j+1)%L),score=v[a]+(unigram?Math.log(freq[p]):i?LM[prev*Q+p]:first[p]);if(score>nv[b]){nv[b]=score;back[i*W+b]=a}}
  if(c===0){const b=2*j+1,score=v[a]+(unigram?Math.log(freq[0]):i?LM[prev*Q]:first[0]);if(score>nv[b]){nv[b]=score;back[i*W+b]=a}}
 }[v,nv]=[nv,v]}
 let a=-1,s=-Infinity;for(let j=0;j<W;j++){const p=(j&1)?0:I[m(B[C[n-1]]-K[((j>>1)+L-1)%L])],z=v[j]+(unigram?0:last[p]);if(z>s){s=z;a=j}}
 if(a<0)return null;const p=new Int8Array(n);for(let i=n-1;i>=0;i--){p[i]=(a&1)?0:I[m(B[C[i]]-K[((a>>1)+L-1)%L])];a=back[i*W+a]}
 return {p:Array.from(p),s}}
  function estimate(G,s=.5){const out=new Float64Array(Q*Q);for(let k=0;k<Q;k++){let z=s*Q;for(let c=0;c<Q;c++)z+=G[c*Q+k];for(let c=0;c<Q;c++)out[c*Q+k]=(1-freq[0])*(G[c*Q+k]+s)/z}return out}
  function mass(G,B){const p=new Float64Array(Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)p[m(B[c]-k)]+=G[c*Q+k];return p}
  function inner(G,B){const p=mass(G,B),A=new Int8Array(Q),labels=id.slice(1).sort((a,b)=>freq[a]-freq[b]),r=id.slice(1).sort((a,b)=>p[a]-p[b]);for(let i=0;i<28;i++)A[labels[i]]=r[i];return A}
  function structured(A,B,eps){const I=inv(A),M=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const r=m(B[c]-k);M[c*Q+k]=freq[I[r]]*(r===0?eps:1)}return M}
  function mstep(A,G,eps){const log=Float64Array.from(inv(A),p=>Math.log(freq[p]));log[0]+=Math.log(eps);const cost=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let z=0;for(let k=0;k<Q;k++)z+=G[c*Q+k]*log[m(v-k)];cost[c*Q+v]=-z}const B=assignment(cost);return [inner(G,B),B]}
  function seedBetas(G,M){const out=[assignment(M)],waves=[];for(let f=1;f<=14;f++){const re=new Float64Array(Q),im=new Float64Array(Q);let strength=0;for(let c=0;c<Q;c++){for(let k=0;k<Q;k++){const t=2*Math.PI*f*k/Q;re[c]+=M[c*Q+k]*Math.cos(t);im[c]-=M[c*Q+k]*Math.sin(t)}strength+=Math.hypot(re[c],im[c])}waves.push({f,re,im,strength})}
    waves.sort((a,b)=>b.strength-a.strength);for(const w of waves.slice(0,5)){let best=null;for(let ph=0;ph<7;ph++){const cost=new Float64Array(Q*Q),base=ph*2*Math.PI/(7*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){const t=2*Math.PI*w.f*v/Q+base;cost[c*Q+v]=-(w.re[c]*Math.cos(t)-w.im[c]*Math.sin(t))}const B=assignment(cost),score=B.reduce((s,v,c)=>s-cost[c*Q+v],0);if(!best||score>best.score)best={B,score}}
      let B=best.B;for(let i=0;i<12;i++){const log=Array.from(mass(G,B),x=>Math.log(x+.5)),cost=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let z=0;for(let k=0;k<Q;k++)z+=G[c*Q+k]*log[m(v-k)];cost[c*Q+v]=-z}const b=assignment(cost);if(b.every((x,j)=>x===B[j]))break;B=b}const p=mass(G,B),r=id.slice().sort((a,b)=>p[a]-p[b]);for(let j=0;j<2;j++)out.push(Int8Array.from(B,x=>m(x-r[j])))}
    return [...new Map(out.map(x=>[x.join(),x])).values()]}
  function refine(A,decoded,rand){const M=new Int32Array(Q*Q),S=new Int32Array(Q),E=new Int32Array(Q);for(const d of decoded){const w=d.p.map(p=>A[p]);S[w[0]]++;E[w.at(-1)]++;for(let i=1;i<w.length;i++)M[w[i-1]*Q+w[i]]++}
    function objective(I){let z=0;for(let a=0;a<Q;a++){z+=S[a]*first[I[a]]+E[a]*last[I[a]];for(let b=0;b<Q;b++)z+=M[a*Q+b]*LM[I[a]*Q+I[b]]}return z}
    let bestI=Array.from(inv(A)),best=objective(bestI);
    for(let r=0;r<12;r++){const I=r===0?bestI.slice():Array.from(inv(perm(rand,true)));let score=objective(I);for(let t=0;t<4000;t++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;const x=I[a],y=I[b];let d=(S[a]-S[b])*(first[y]-first[x])+(E[a]-E[b])*(last[y]-last[x]);for(let j=0;j<Q;j++)if(j!==a&&j!==b){const z=I[j];d+=M[a*Q+j]*(LM[y*Q+z]-LM[x*Q+z])+M[b*Q+j]*(LM[x*Q+z]-LM[y*Q+z])+M[j*Q+a]*(LM[z*Q+y]-LM[z*Q+x])+M[j*Q+b]*(LM[z*Q+x]-LM[z*Q+y])}d+=(M[a*Q+a]-M[b*Q+b])*(LM[y*Q+y]-LM[x*Q+x])+(M[a*Q+b]-M[b*Q+a])*(LM[y*Q+x]-LM[x*Q+y]);const temp=5*Math.pow(.02,t/3999);if(d>=0||rand()<Math.exp(d/temp)){[I[a],I[b]]=[I[b],I[a]];score+=d;if(score>best){best=score;bestI=I.slice()}}}}
    return Array.from(inv(bestI))}
  function recover(rows,cut,seed){const fit=rows.slice(0,cut),rand=rng(seed),G0=new Float64Array(Q*Q);for(const {C,K} of fit)for(let j=0;j<C.length&&C[j]!==0;j++)G0[C[j]*Q+K[j%K.length]]++;
    let M=estimate(G0,2),G=G0;for(let it=0;it<15;it++){const x=pool(fit,M);assert(x.G,"relaxed EM");G=x.G;M=estimate(G,.6)}
    const seeds=seedBetas(G,M),legal=[];for(let B of seeds){let A=inner(G,B);for(let t=0;t<21;t++){const eps=10**(-Math.min(8,1+Math.floor(t/3))),x=pool(fit,structured(A,B,eps));if(!x.G)break;[A,B]=mstep(A,x.G,eps)}const x=pool(fit,structured(A,B,0));if(x.G)legal.push({A:Array.from(A),B:Array.from(B),ll:x.ll})}
    legal.sort((a,b)=>b.ll-a.ll);const uniq=[...new Map(legal.map(x=>[x.A.join()+":"+x.B.join(),x])).values()].sort((a,b)=>b.ll-a.ll).slice(0,4);let best=null;
    for(const z of uniq){let A=z.A,B=z.B,D=fit.map(row=>decode(row,A,B,true));if(D.some(x=>!x))continue;A=refine(A,D,rand);D=fit.map(row=>decode(row,A,B));if(D.some(x=>!x))continue;let score=D.reduce((s,x)=>s+x.s,0);for(let it=0;it<2;it++){const a=refine(A,D,rand),d=fit.map(row=>decode(row,a,B));if(d.some(x=>!x))break;const q=d.reduce((s,x)=>s+x.s,0);if(q<=score)break;A=a;D=d;score=q}if(!best||score>best.score)best={A,B,score}}
    return {seeds:seeds.length,legal:legal.length,best}}

function evaluate(rows,truth,A,B){let fit=0,held=0,fitN=0,heldN=0,illegal=0,replay=true,scoreFit=0,scoreHeld=0;const chapters=[];
for(let i=0;i<rows.length;i++){const r=rows[i],d=decode(r,A,B),N=r.n;const count=d&&truth?d.p.filter((v,j)=>v===truth[i][j]).length:0;
 if(i<7){fit+=count;fitN+=N;scoreFit+=d?.s??-Infinity}else{held+=count;heldN+=N;scoreHeld+=d?.s??-Infinity}
 const ok=!!d&&encrypt(d.p,r.K,A,B).join()===r.C.join();replay&&=ok;illegal+=!d;
 chapters.push({N,correct:truth?count:null,score:d?.s??null,replay:ok,...(!truth?{P:d?.p??null}:{})})}
return {fit:truth?fit:null,held:truth?held:null,fitN,heldN,illegal,replay,scoreFit:Number.isFinite(scoreFit)?scoreFit:null,scoreHeld:Number.isFinite(scoreHeld)?scoreHeld:null,chapters}}
let rows,truth=null,truthKey=null;
if(which<2){const rand=rng(0x281110+which),A=perm(rand,true),B=perm(rand,false),T=tape(which?gibran:shakespeare);let offset=512+which*1024;truth=scopes.map(({C})=>{const p=T.slice(offset,offset+C.length);offset+=C.length;return p});rows=scopes.map(({K},i)=>setup(encrypt(truth[i],K,A,B),K));truthKey={A,B}}else rows=scopes.map(({C,K})=>setup(C,K));
const rec=recover(rows,7,0x281120+which),best=rec.best?evaluate(rows,truth,rec.best.A,rec.best.B):null;
const oracle=truthKey?evaluate(rows,truth,truthKey.A,truthKey.B):null;
return {which,seeds:rec.seeds,legal:rec.legal,best,oracle,key:rec.best?{A:rec.best.A,B:rec.best.B}:null,truthKey};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path"),raw=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));const a=study(raw,0),b=study(raw,1),gate=[a,b].every(x=>x.best&&x.best.replay&&x.best.fit>=.9*x.best.fitN&&x.best.held>=.9*x.best.heldN);console.log(JSON.stringify({controls:[a,b],gate,original:gate?study(raw,2):null},null,2))}
if(typeof module!=="undefined")module.exports={study,paths};
