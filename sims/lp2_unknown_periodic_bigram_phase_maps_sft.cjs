'use strict';
function study(raw,which=0,restarts=8) {
const [rawC,emerson,shakespeare,gibran]=raw,c=JSON.parse(rawC),Q=29,id=Array.from({length:Q},(_,i)=>i),m=x=>(x%Q+Q)%Q,q=8,W=2*q;
 const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}

const train=gp(emerson),freq=new Float64Array(Q).fill(.5),LM=new Float64Array(Q*Q).fill(.5);
for(let i=0;i<train.length;i++){freq[train[i]]++;if(i)LM[train[i-1]*Q+train[i]]++}
let z=freq.reduce((a,b)=>a+b);for(let i=0;i<Q;i++){freq[i]/=z;let s=0;for(let j=0;j<Q;j++)s+=LM[i*Q+j];for(let j=0;j<Q;j++)LM[i*Q+j]=Math.log(LM[i*Q+j]/s)}
const prob=Float64Array.from(LM,Math.exp),logfreq=Float64Array.from(freq,Math.log);
 function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function perm(rand,fix0){const a=id.slice();for(let i=28;i>(fix0?1:0);i--){const lo=fix0?1:0,j=lo+Math.floor(rand()*(i+1-lo));[a[i],a[j]]=[a[j],a[i]]}return a}
 function inv(A){const b=new Int8Array(Q);for(let i=0;i<Q;i++)b[A[i]]=i;return b}
 function encrypt(P,K,A,B,start=0){let j=start;const I=inv(B);return P.map(p=>p===0?0:I[m(A[p]+K[j++%K.length])])}
 // Dense Hungarian assignment on a 29x29 cost matrix.
 function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);
   for(let i=1;i<=Q;i++){p[0]=i;let j0=0;const min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);
     do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){const cur=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}
       for(let j=0;j<=Q;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta}j0=j1
     }while(p[j0]!==0);
     do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)
   }const out=new Int8Array(Q);for(let j=1;j<=Q;j++)out[p[j]-1]=j-1;return out
 }

const offsets=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const tape=c.pages.slice(0,56).flatMap(p=>p.indices);
let C,truth=null,truthA=null,truthB=null,truthK=null;
if(which<2){const rand=random(0x28112500+which);truthA=perm(rand,true);truthB=perm(rand,false);truthK=[0,...Array.from({length:q-1},()=>Math.floor(rand()*Q))];
const donor=gp(which?gibran:shakespeare).slice(which?1536:4096,(which?1536:4096)+12956);
truth=offsets.slice(0,-1).map((v,i)=>donor.slice(v,offsets[i+1]));C=truth.map(P=>encrypt(P,truthK,truthA,truthB))}
else C=offsets.slice(0,-1).map((v,i)=>tape.slice(v,offsets[i+1]));
const fit=C.slice(0,7),held=C.slice(7);
function pool(rows,M){
 const G=new Float64Array(q*Q);let ll=0;
 for(const C of rows){const n=C.length,F=new Float64Array((n+1)*q),S=new Float64Array(n);F[0]=1;
 for(let i=0;i<n;i++){const a=i*q,b=a+q,c=C[i];let z=0;for(let j=0;j<q;j++){const v=F[a+j];F[b+(j+1)%q]+=v*M[j*Q+c];if(c===0)F[b+j]+=v*freq[0]}for(let j=0;j<q;j++)z+=F[b+j];if(!(z>0))return {ll:-Infinity};S[i]=z;ll+=Math.log(z);for(let j=0;j<q;j++)F[b+j]/=z}
 let B=new Float64Array(q).fill(1),T=new Float64Array(q);
 for(let i=n-1;i>=0;i--){const a=i*q,c=C[i],z=S[i];for(let j=0;j<q;j++){const v=M[j*Q+c]*B[(j+1)%q];G[j*Q+c]+=F[a+j]*v/z;T[j]=(v+(c===0?freq[0]*B[j]:0))/z}[B,T]=[T,B]}
 }return {ll,G}}
function estimate(G,s=.6){const M=new Float64Array(q*Q);for(let j=0;j<q;j++){let sum=s*Q;for(let c=0;c<Q;c++)sum+=G[j*Q+c];for(let c=0;c<Q;c++)M[j*Q+c]=(1-freq[0])*(G[j*Q+c]+s)/sum}return M}
const G0=new Float64Array(q*Q);for(const C of fit)for(let i=0;i<C.length&&C[i]!==0;i++)G0[(i%q)*Q+C[i]]++;
let M=estimate(G0,2),G;
for(const n of [64,128,256,512,1024,10000])for(let it=0;it<12;it++){const z=pool(fit.map(C=>C.slice(0,n)),M);G=z.G;M=estimate(G)}
G=pool(fit,M).G;
const mapTruth=truth?Array.from({length:q},(_,j)=>truthB.map(v=>inv(truthA)[m(v-truthK[j])])):null;
function accuracy(T){return mapTruth?T.reduce((s,row,j)=>s+row.reduce((a,v,c)=>a+(v===mapTruth[j][c]),0),0):null}
function seedMaps(rand,jitter){return Array.from({length:q},(_,j)=>{
 const counts=id.map(c=>G[j*Q+c]+jitter*Math.sqrt(G[j*Q+c]+1)*(rand()-.5));
 const cs=id.slice().sort((a,b)=>counts[a]-counts[b]),ps=[0,...id.slice(1).sort((a,b)=>freq[a]-freq[b])],T=new Int8Array(Q);
 for(let i=0;i<Q;i++)T[cs[i]]=ps[i];return T})}
function structured(T,eps){const M=new Float64Array(q*Q);for(let j=0;j<q;j++)for(let c=0;c<Q;c++){const p=T[j][c];M[j*Q+c]=freq[p]*(p===0?eps:1)}return M}
function posterior(rows,T,eps,counts=true){
 const CC=new Float64Array(q*Q*Q),HC=new Float64Array(q*Q),CH=new Float64Array(q*Q),ST=new Float64Array(q*Q),CT=new Float64Array(q*Q);
 let ll=0;
 for(const C of rows){const n=C.length,F=new Float64Array((n+1)*W),sc=new Float64Array(n);F[0]=1;
 for(let i=0;i<n;i++){const a=i*W,b=a+W,c=C[i],prev=C[i-1];let z=0;
  for(let j=0;j<q;j++){const j0=(j+q-1)%q,j1=(j+1)%q,p=T[j][c],p0=i?T[j0][prev]:0,e=p===0?eps:1,vc=F[a+2*j],vh=F[a+2*j+1];
   const u=(i?prob[p0*Q+p]:freq[p])*e,v=(i?prob[p]:freq[p])*e;
   F[b+2*j1]+=vc*u+vh*v;
   if(c===0)F[b+2*j+1]+=vc*(i?prob[p0*Q]:freq[0])+vh*(i?prob[0]:freq[0]);
  }for(let j=0;j<W;j++)z+=F[b+j];if(!(z>0))return {ll:-Infinity};sc[i]=z;ll+=Math.log(z);for(let j=0;j<W;j++)F[b+j]/=z}
 if(!counts)continue;
 let B=new Float64Array(W).fill(1),D=new Float64Array(W);
 for(let i=n-1;i>=0;i--){const a=i*W,c=C[i],prev=C[i-1],z=sc[i];
  for(let j=0;j<q;j++){const j0=(j+q-1)%q,j1=(j+1)%q,p=T[j][c],p0=i?T[j0][prev]:0,e=p===0?eps:1,vc=F[a+2*j],vh=F[a+2*j+1];
   const u=(i?prob[p0*Q+p]:freq[p])*e*B[2*j1],v=(i?prob[p]:freq[p])*e*B[2*j1];
   const x=vc*u/z,y=vh*v/z;CT[j*Q+c]+=x+y;
   if(i){CC[j*Q*Q+prev*Q+c]+=x;HC[j*Q+c]+=y}else ST[j*Q+c]+=x+y;
   let h=0,g=0;if(c===0){h=(i?prob[p0*Q]:freq[0])*B[2*j+1];g=(i?prob[0]:freq[0])*B[2*j+1];if(i)CH[j0*Q+prev]+=vc*h/z}
   D[2*j]=(u+h)/z;D[2*j+1]=(v+g)/z;
  }[B,D]=[D,B]
 }
 }return {ll,CC,HC,CH,ST,CT}
}
function update(T,S,eps,rand,passes=2){const {CC,HC,CH,ST,CT}=S,pen=Math.log(eps);
 for(let pass=0;pass<passes;pass++){const order=Array.from({length:q},(_,j)=>j);if(rand)for(let j=q-1;j>0;j--){const k=Math.floor(rand()*(j+1));[order[j],order[k]]=[order[k],order[j]]}
 for(const j of order){const j0=(j+q-1)%q,j1=(j+1)%q,cost=new Float64Array(Q*Q),a=j*Q*Q,b=j1*Q*Q;
  for(let c=0;c<Q;c++)for(let p=0;p<Q;p++){let s=ST[j*Q+c]*logfreq[p]+HC[j*Q+c]*LM[p]+CH[j*Q+c]*LM[p*Q]+(p===0?CT[j*Q+c]*pen:0);
   for(let d=0;d<Q;d++)s+=CC[a+d*Q+c]*LM[T[j0][d]*Q+p]+CC[b+c*Q+d]*LM[p*Q+T[j1][d]];
   cost[c*Q+p]=-s
  }T[j]=assignment(cost)
 }}return T}
function decode(C,T,eps=0){const n=C.length,back=new Int8Array(n*W).fill(-1);let F=new Float64Array(W).fill(-Infinity),D=new Float64Array(W);F[0]=0;
for(let i=0;i<n;i++){D.fill(-Infinity);const c=C[i];for(let a=0;a<W;a++){if(!Number.isFinite(F[a]))continue;const j=a>>1,p=T[j][c],p0=i?((a&1)?0:T[(j+q-1)%q][C[i-1]]):0;
 if(p||eps){const b=2*((j+1)%q),s=F[a]+(i?LM[p0*Q+p]:logfreq[p])+(p===0?Math.log(eps):0);if(s>D[b]){D[b]=s;back[i*W+b]=a}}
 if(c===0){const b=2*j+1,s=F[a]+(i?LM[p0*Q]:logfreq[0]);if(s>D[b]){D[b]=s;back[i*W+b]=a}}
 }[F,D]=[D,F]}
 let a=-1,score=-Infinity;for(let j=0;j<W;j++)if(F[j]>score){score=F[j];a=j}if(a<0)return null;const P=new Int8Array(n);for(let i=n-1;i>=0;i--){P[i]=(a&1)?0:T[((a>>1)+q-1)%q][C[i]];a=back[i*W+a]}return {P:Array.from(P),score}}
function evaluate(T){const D=C.map(row=>decode(row,T)),count=D.map((d,i)=>d&&truth?d.P.reduce((s,p,j)=>s+(p===truth[i][j]),0):0);return {fit:truth?count.slice(0,7).reduce((a,b)=>a+b,0):null,held:truth?count.slice(7).reduce((a,b)=>a+b,0):null,fitN:9640,heldN:3316,legal:D.filter(Boolean).length,fitScore:D.slice(0,7).every(Boolean)?D.slice(0,7).reduce((s,d)=>s+d.score,0):null,heldScore:D.slice(7).every(Boolean)?D.slice(7).reduce((s,d)=>s+d.score,0):null}}
const rand=random(0x28112600+which),records=[],candidates=[];
for(let r=0;r<restarts;r++){
 let T=seedMaps(rand,r===0?0:r<4?1.2:2.5),initAcc=accuracy(T),trace=[];
 for(let it=0;it<24;it++){const eps=10**(-Math.min(6,1+Math.floor(it/5))),s=posterior(fit,T,eps);if(!s.CC)break;T=update(T,s,eps,rand,2);if(it%6===5)trace.push({it,ll:s.ll,acc:accuracy(T)})}
 const soft=posterior(fit,T,1e-8,false),strict=posterior(fit,T,0,false);
 const z={r,initAcc,trace,soft:Number.isFinite(soft.ll)?soft.ll:null,strict:Number.isFinite(strict.ll)?strict.ll:null,acc:accuracy(T),T:T.map(x=>Array.from(x))};records.push(z);candidates.push(z)
}
candidates.sort((a,b)=>(b.strict??-1e100)-(a.strict??-1e100)||(b.soft??-1e100)-(a.soft??-1e100));

function factor(T){
 const I=T.map(inv),labels=id.slice(1).sort((a,b)=>freq[b]-freq[a]),w=Float64Array.from(freq,x=>Math.sqrt(x)),total=labels.reduce((s,p)=>s+w[p],0)*q,top=[],seen=new Set(),deltas=new Float64Array(Q);let cycles=0,scored=0;
 function offer(B,a){scored++;const K=new Int8Array(q);let score=0;
  for(let j=0;j<q;j++){deltas.fill(0);for(const p of labels)deltas[m(B[I[j][p]]-B[I[a][p]])]+=w[p];let k=0;for(let d=1;d<Q;d++)if(deltas[d]>deltas[k])k=d;score+=deltas[k];K[j]=k}
  if(top.length>=10&&score<=top.at(-1).score+1e-12)return;
  const k0=K[0];for(let j=0;j<q;j++)K[j]=m(K[j]-k0);
  const first=K.find(x=>x!==0);if(!first)return;const scale=id.find(x=>m(x*first)===1),b0=B[0],b=Array.from(B,x=>m((x-b0)*scale)),k=Array.from(K,x=>m(x*scale)),key=b.join()+":"+k.join();if(seen.has(key))return;seen.add(key);
  top.push({B:b,K:k,score,agreement:score/total});top.sort((a,b)=>b.score-a.score);if(top.length>10)top.pop()
 }
 for(let a=0;a<q;a++)for(let b=a+1;b<q;b++)for(const count of [23,22,21]){
  const next=new Int8Array(Q).fill(-1),prev=new Int8Array(Q).fill(-1);
  for(const p of labels.slice(0,count)){const x=I[a][p],y=I[b][p];next[x]=y;prev[y]=x}
  const parts=[],visited=new Uint8Array(Q);for(let x=0;x<Q;x++)if(prev[x]<0){const part=[];let y=x;while(y>=0&&!visited[y]){visited[y]=1;part.push(y);y=next[y]}parts.push(part)}
  if(visited.some(v=>!v)||parts.length!==Q-count)continue;
  cycles++;const B=new Int8Array(Q);let pos=0;for(const c of parts[0])B[c]=pos++;const remaining=parts.slice(1);
  function permute(depth,at){if(depth===remaining.length){offer(B,a);return}for(let i=depth;i<remaining.length;i++){[remaining[depth],remaining[i]]=[remaining[i],remaining[depth]];let n=at;for(const c of remaining[depth])B[c]=n++;permute(depth+1,n);[remaining[depth],remaining[i]]=[remaining[i],remaining[depth]]}}
  permute(0,pos)
 }
 return {cycles,scored,top}
}
function fromKey(A,B,K){const I=inv(A);return Array.from({length:q},(_,j)=>B.map(v=>I[m(v-K[j])]))}
function initialAlpha(T,B,K,f){const I=T.map(inv),cost=new Float64Array(Q*Q);for(let p=0;p<Q;p++){for(let v=0;v<Q;v++)if((p===0)!==(v===f))cost[p*Q+v]=1e6;for(let j=0;j<q;j++){const v=m(B[I[j][p]]-K[j]);cost[p*Q+v]-=Math.sqrt(freq[p])}}return Array.from(assignment(cost))}
function improveA(A,B,K,T,rand){
 const z=posterior(fit,T,0);if(!z.CC)return A;const H=new Float64Array(Q*Q),S=new Float64Array(Q);
 for(let j=0;j<q;j++){const prev=(j+q-1)%q;for(let c=0;c<Q;c++){const r=m(B[c]-K[j]);S[r]+=z.ST[j*Q+c];H[r]+=z.HC[j*Q+c];H[r*Q]+=z.CH[j*Q+c];for(let d=0;d<Q;d++){const u=m(B[d]-K[prev]);H[u*Q+r]+=z.CC[j*Q*Q+d*Q+c]}}}
 function objective(I){let s=0;for(let a=0;a<Q;a++){s+=S[a]*logfreq[I[a]];for(let b=0;b<Q;b++)s+=H[a*Q+b]*LM[I[a]*Q+I[b]]}return s}
 let bestI=Array.from(inv(A)),best=objective(bestI);
 for(let rep=0;rep<5;rep++){const I=rep===0?bestI.slice():bestI.slice();if(rep)for(let k=0;k<rep*2;k++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);[I[a],I[b]]=[I[b],I[a]]}let score=objective(I);
  for(let t=0;t<4500;t++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;const x=I[a],y=I[b];let d=(S[a]-S[b])*(logfreq[y]-logfreq[x]);
   for(let j=0;j<Q;j++)if(j!==a&&j!==b){const p=I[j];d+=H[a*Q+j]*(LM[y*Q+p]-LM[x*Q+p])+H[b*Q+j]*(LM[x*Q+p]-LM[y*Q+p])+H[j*Q+a]*(LM[p*Q+y]-LM[p*Q+x])+H[j*Q+b]*(LM[p*Q+x]-LM[p*Q+y])}
   d+=(H[a*Q+a]-H[b*Q+b])*(LM[y*Q+y]-LM[x*Q+x])+(H[a*Q+b]-H[b*Q+a])*(LM[y*Q+x]-LM[x*Q+y]);const temp=5*Math.pow(.015,t/4499);if(d>=0||rand()<Math.exp(d/temp)){[I[a],I[b]]=[I[b],I[a]];score+=d;if(score>best){best=score;bestI=I.slice()}}
  }
 }return Array.from(inv(bestI))
}
const factoring=factor(candidates[0].T),legalKeys=[];
for(const item of factoring.top)for(let f=0;f<Q;f++){
 const A=initialAlpha(candidates[0].T,item.B,item.K,f).map(v=>m(v-f)),B=item.B.map(v=>m(v-f)),K=item.K.slice(),T=fromKey(A,B,K),s=posterior(fit,T,0,false);if(Number.isFinite(s.ll))legalKeys.push({A,B,K,ll:s.ll,agreement:item.agreement})
}
legalKeys.sort((a,b)=>b.ll-a.ll);
let bestFactor=null;
for(const item of legalKeys.slice(0,5)){let {A,B,K}=item,T=fromKey(A,B,K),ll=item.ll;
 for(let it=0;it<3;it++){const a=improveA(A,B,K,T,rand),t=fromKey(a,B,K),s=posterior(fit,t,0,false);if(s.ll<=ll+1e-9)break;A=a;T=t;ll=s.ll}
 const ds=fit.map(C=>decode(C,T));if(ds.some(x=>!x))continue;const score=ds.reduce((s,x)=>s+x.score,0);
 if(!bestFactor||score>bestFactor.score)bestFactor={A,B,K,T,ll,score,agreement:item.agreement}
}
if(bestFactor){const {A,B,K,T}=bestFactor;bestFactor.evaluation=evaluate(T);bestFactor.evaluation.replay=C.every((row,i)=>{const d=decode(row,T);return !!d&&encrypt(d.P,K,A,B).join()===row.join()});bestFactor.effectiveCorrect=accuracy(T);if(!truth)bestFactor.P=C.map(row=>decode(row,T)?.P??null)}

return {which,truthK,truthMaps:mapTruth,oracle:truth?evaluate(mapTruth):null,records,best:candidates[0]?{...candidates[0],evaluation:evaluate(candidates[0].T)}:null,factoring,legalFactorKeys:legalKeys.length,bestFactor};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(typeof require!=="undefined"&&require.main===module){const fs=require('node:fs'),path=require('node:path');console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),Number(process.argv[2]||0),Number(process.argv[3]||8)),null,2))}
if(typeof module!=="undefined")module.exports={study,paths};
