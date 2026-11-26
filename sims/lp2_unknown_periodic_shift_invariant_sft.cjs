'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(data, restarts=48, iterations=42){
 const [rawC,rawN,lp1,emerson,shakespeare,gibran]=data,c=JSON.parse(rawC),native=JSON.parse(rawN),Q=29,id=Array.from({length:Q},(_,i)=>i),m=x=>(x%Q+Q)%Q;
 const assert=(x,s)=>{if(!x)throw Error(s)},idx=new Map(c.runes.map((r,i)=>[r,i])),extract=s=>[...s].filter(r=>idx.has(r)).map(r=>idx.get(r));
 const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}
 const ss=native.sections.slice(0,7).map(s=>extract(s.source_text));
 const corrected=ss.map((s,i)=>i===3?extract(lp1.split("%").slice(4,8).join("")).map(x=>m(31-x)):s).flat();assert(corrected.length===2797,"LP1 key length");
 const train=gp(emerson);assert(train.length===321327,"GP training normalization");
 const freq=new Float64Array(Q).fill(.5), LM=new Float64Array(Q*Q).fill(.5);
 for(let i=0;i<train.length;i++){freq[train[i]]++;if(i)LM[train[i-1]*Q+train[i]]++}
 let z=freq.reduce((a,b)=>a+b);for(let i=0;i<Q;i++){freq[i]/=z;let s=0;for(let j=0;j<Q;j++)s+=LM[i*Q+j];for(let j=0;j<Q;j++)LM[i*Q+j]=Math.log(LM[i*Q+j]/s)}
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
 function setup(C,K,start=0){const n=C.length,lim=new Int16Array(n+1);for(let i=0;i<n;i++)lim[i+1]=lim[i]+(C[i]===0);const H=lim[n]+1,sh=new Uint8Array(n*H);
   for(let i=0;i<n;i++)for(let h=0;h<=lim[i];h++)sh[i*H+h]=K[(start+i-h)%K.length];
   return {C,K,n,H,lim,sh,start}
 }
 // Scaled exact posterior for the cumulative number of plaintext-F holds.
 function stats(S,A,B,eps,counts=true){const {C,n,H,lim,sh}=S,IA=inv(A),p=Float64Array.from(IA,x=>freq[x]),emit=new Float64Array(Q*Q);
   for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const r=(B[c]+Q-k)%Q;emit[c*Q+k]=p[r]*(r===0?eps:1)}
   const F=new Float64Array((n+1)*H),sc=new Float64Array(n);F[0]=1;let ll=0;
   for(let i=0;i<n;i++){const a=i*H,b=a+H,c=C[i],o=c*Q;let z=0;
     for(let h=0;h<=lim[i];h++){const v=F[a+h];if(v===0)continue;const e=v*emit[o+sh[a+h]];F[b+h]+=e;z+=e;if(c===0){const f=v*freq[0];F[b+h+1]+=f;z+=f}}
     if(!(z>0))return {ll:-Infinity};sc[i]=z;ll+=Math.log(z);for(let h=0;h<=lim[i+1];h++)F[b+h]/=z
   }
   if(!counts)return {ll};
   const G=new Float64Array(Q*Q);let b=new Float64Array(H).fill(1),bb=new Float64Array(H),holds=0;
   for(let i=n-1;i>=0;i--){const a=i*H,c=C[i],o=c*Q,scale=sc[i];for(let h=0;h<=lim[i];h++){
       const k=sh[a+h],x=emit[o+k]*b[h],f=F[a+h]/scale;G[o+k]+=f*x;let z=x;
       if(c===0){const y=freq[0]*b[h+1];holds+=f*y;z+=y}bb[h]=z/scale
     }[b,bb]=[bb,b]
   }
   return {ll,G,holds}
 }
 function mstep(A,B,G,eps){const IA=inv(A),logp=Float64Array.from(IA,r=>Math.log(freq[r]));logp[0]+=Math.log(eps);const cost=new Float64Array(Q*Q);
   for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let s=0;for(let k=0;k<Q;k++)s+=G[c*Q+k]*logp[(v+Q-k)%Q];cost[c*Q+v]=-s}
   const beta=assignment(cost),mass=new Float64Array(Q);
   for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)mass[(beta[c]+Q-k)%Q]+=G[c*Q+k];
   const labels=id.slice(1).sort((x,y)=>freq[x]-freq[y]),ranks=id.slice(1).sort((x,y)=>mass[x]-mass[y]);const alpha=new Int8Array(Q);for(let i=0;i<28;i++)alpha[labels[i]]=ranks[i];
   return [alpha,beta]
 }
 // Exact Viterbi: at a fixed emitted position and hold count, last rune is
 // determined by whether the last event consumed or held. Two state types suffice.
 function decode(S,A,B,prev=-1,bigram=true,allEnds=false){const {C,n,H,lim,sh,start}=S,IA=inv(A),N=2*H,back=new Int8Array(n*N).fill(-1),last=new Int8Array(N).fill(-1),nl=new Int8Array(N).fill(-1);let v=new Float64Array(N).fill(-Infinity),nv=new Float64Array(N).fill(-Infinity);v[0]=0;last[0]=prev;
   for(let i=0;i<n;i++){nv.fill(-Infinity);nl.fill(-1);const c=C[i],o=i*H;
     for(let h=0;h<=lim[i];h++)for(let ty=0;ty<2;ty++){const a=h*2+ty,base=v[a];if(!Number.isFinite(base))continue;const lastp=last[a];
       const r=(B[c]+Q-sh[o+h])%Q;if(r!==0){const p=IA[r],b=h*2,score=base+(bigram&&lastp>=0?LM[lastp*Q+p]:Math.log(freq[p]));if(score>nv[b]){nv[b]=score;nl[b]=p;back[i*N+b]=ty}}
       if(c===0){const b=(h+1)*2+1,score=base+(bigram&&lastp>=0?LM[lastp*Q]:Math.log(freq[0]));if(score>nv[b]){nv[b]=score;nl[b]=0;back[i*N+b]=ty}}
     }[v,nv]=[nv,v];last.set(nl);
   }
   function trace(a){const score=v[a],endH=a>>1,endLast=last[a],P=new Int8Array(n);
     for(let i=n-1;i>=0;i--){const h=a>>1,ty=a&1,pt=back[i*N+a];assert(pt>=0,"backtrack");if(ty){P[i]=0;a=(h-1)*2+pt}else{P[i]=IA[(B[C[i]]+Q-sh[i*H+h])%Q];a=h*2+pt}}
     return {score,P:Array.from(P),end:start+n-endH,last:endLast}
   }
   if(allEnds){const out=[];for(let a=0;a<N;a++)if(Number.isFinite(v[a]))out.push(trace(a));return out.sort((a,b)=>b.score-a.score)}
   let a=0;for(let j=1;j<N;j++)if(v[j]>v[a])a=j;if(!Number.isFinite(v[a]))return null;return trace(a);
 }
 // Maximize a fixed rank tape's bigram objective over the unknown inner alphabet.
 function refineAlpha(A,P,rand){const rank=P.map(p=>A[p]),M=new Int32Array(Q*Q);for(let i=1;i<rank.length;i++)M[rank[i-1]*Q+rank[i]]++;
   const objective=I=>{let s=0;for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)s+=M[a*Q+b]*LM[I[a]*Q+I[b]];return s};
   let bestI=Array.from(inv(A)),best=objective(bestI);
   for(let r=0;r<12;r++){let I=r===0?bestI.slice():Array.from(inv(perm(rand,true))),score=objective(I);
     for(let t=0;t<4000;t++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;const x=I[a],y=I[b];let delta=0;
       for(let j=0;j<Q;j++)if(j!==a&&j!==b){const z=I[j];delta+=M[a*Q+j]*(LM[y*Q+z]-LM[x*Q+z])+M[b*Q+j]*(LM[x*Q+z]-LM[y*Q+z])+M[j*Q+a]*(LM[z*Q+y]-LM[z*Q+x])+M[j*Q+b]*(LM[z*Q+x]-LM[z*Q+y])}
       delta+=M[a*Q+a]*(LM[y*Q+y]-LM[x*Q+x])+M[b*Q+b]*(LM[x*Q+x]-LM[y*Q+y])+M[a*Q+b]*(LM[y*Q+x]-LM[x*Q+y])+M[b*Q+a]*(LM[x*Q+y]-LM[y*Q+x]);
       const temp=4*Math.pow(.02,t/3999);if(delta>=0||rand()<Math.exp(delta/temp)){[I[a],I[b]]=[I[b],I[a]];score+=delta;if(score>best){best=score;bestI=I.slice()}}
     }
   }return Array.from(inv(bestI))
 }
 function run(C,K,seed,truth=null,truthA=null,truthB=null){const cut=1200,S=setup(C.slice(0,cut),K),rand=random(seed),top=[];let finite=0;
   for(let r=0;r<restarts;r++){let A=perm(rand,true),B=perm(rand,false),stable=0;
     for(let t=0;t<iterations;t++){const eps=10**(-Math.min(10,1+Math.floor(t/4))),s=stats(S,A,B,eps);if(!Number.isFinite(s.ll))break;const [a,b]=mstep(A,B,s.G,eps);stable=(a.every((v,i)=>v===A[i])&&b.every((v,i)=>v===B[i]))?stable+1:0;A=a;B=b;if(stable>=4&&eps<=1e-8)break}
     const s=stats(S,A,B,0,false);if(Number.isFinite(s.ll)){finite++;top.push({ll:s.ll,A:Array.from(A),B:Array.from(B)});top.sort((a,b)=>b.ll-a.ll);if(top.length>5)top.pop()}
   }
   let best=null;
   for(const q of top){let A=q.A,B=q.B,d=decode(S,A,B,-1,false);if(!d)continue;A=refineAlpha(A,d.P,rand);d=decode(S,A,B);if(!d)continue;
     for(let j=0;j<2;j++){const a=refineAlpha(A,d.P,rand),e=decode(S,a,B);if(e&&e.score>d.score){A=a;d=e}else break}
     if(!best||d.score>best.d.score)best={A,B,d,ll:q.ll}
   }
   function evaluate(A,B,d){if(!d)return null;const H=decode(setup(C.slice(cut),K,d.end),A,B,d.last);const replay=H&&encrypt(d.P.concat(H.P),K,A,B).join()===C.join();
     return {fitScore:d.score,heldScore:H?H.score:null,legalHeld:!!H,exactReplay:!!replay,fitCorrect:truth?d.P.filter((x,i)=>x===truth[i]).length:null,heldCorrect:truth&&H?H.P.filter((x,i)=>x===truth[cut+i]).length:null,fitEnd:d.end,A,B,fitP:d.P,heldP:H?H.P:null,betaCorrect:truthB?B.filter((x,i)=>x===truthB[i]).length:null,alphaCorrect:truthA?A.filter((x,i)=>x===truthA[i]).length:null}}
   const result={finiteRestarts:finite,restarts,iterations,fit:best?evaluate(best.A,best.B,best.d):null};
   if(truth){const oracle=decode(S,truthA,truthB);result.oracle=evaluate(truthA,truthB,oracle);result.trueEnd=truth.slice(0,cut).filter(p=>p!==0).length}
   return result
 }
 function posterior(S,emit,counts=true){const {C,n,H,lim,sh}=S;
   const F=new Float64Array((n+1)*H),sc=new Float64Array(n);F[0]=1;let ll=0;
   for(let i=0;i<n;i++){const a=i*H,b=a+H,c=C[i],o=c*Q;let z=0;
     for(let h=0;h<=lim[i];h++){const v=F[a+h];if(v===0)continue;const e=v*emit[o+sh[a+h]];F[b+h]+=e;z+=e;if(c===0){const f=v*freq[0];F[b+h+1]+=f;z+=f}}
     if(!(z>0))return {ll:-Infinity};sc[i]=z;ll+=Math.log(z);for(let h=0;h<=lim[i+1];h++)F[b+h]/=z
   }
   if(!counts)return {ll};
   const G=new Float64Array(Q*Q);let b=new Float64Array(H).fill(1),bb=new Float64Array(H),holds=0;
   for(let i=n-1;i>=0;i--){const a=i*H,c=C[i],o=c*Q,scale=sc[i];for(let h=0;h<=lim[i];h++){
       const k=sh[a+h],x=emit[o+k]*b[h],f=F[a+h]/scale;G[o+k]+=f*x;let z=x;
       if(c===0){const y=freq[0]*b[h+1];holds+=f*y;z+=y}bb[h]=z/scale
     }[b,bb]=[bb,b]
   }
   return {ll,G,holds}
 }

 function pooled(S,emit){const G=new Float64Array(Q*Q);let ll=0,holds=0;for(const s of S){const z=posterior(s,emit);if(!z.G)return {ll:-Infinity};ll+=z.ll;holds+=z.holds;for(let j=0;j<G.length;j++)G[j]+=z.G[j]}return {ll,G,holds}}
 function estimate(G,smooth=.8){const M=new Float64Array(Q*Q);for(let k=0;k<Q;k++){let sum=smooth*Q;for(let c=0;c<Q;c++)sum+=G[c*Q+k];for(let c=0;c<Q;c++)M[c*Q+k]=(1-freq[0])*(G[c*Q+k]+smooth)/sum}return M}
 function ranks(G,B){const p=new Float64Array(Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)p[m(B[c]-k)]+=G[c*Q+k];return p}
 function inner(G,B){const p=ranks(G,B),A=new Int8Array(Q),labels=id.slice(1).sort((a,b)=>freq[a]-freq[b]),rs=id.slice(1).sort((a,b)=>p[a]-p[b]);for(let i=0;i<28;i++)A[labels[i]]=rs[i];return A}
 function structured(A,B,eps){const IA=inv(A),M=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const r=m(B[c]-k);M[c*Q+k]=freq[IA[r]]*(r===0?eps:1)}return M}
 function spectralSeeds(G,M){
   const out=[],waves=[];
   out.push({kind:'forbidden',B:assignment(M)});
   for(let f=1;f<=14;f++){
     const re=new Float64Array(Q),im=new Float64Array(Q);let strength=0;
     for(let c=0;c<Q;c++){for(let k=0;k<Q;k++){const t=2*Math.PI*f*k/Q;re[c]+=M[c*Q+k]*Math.cos(t);im[c]-=M[c*Q+k]*Math.sin(t)}strength+=Math.hypot(re[c],im[c])}
     waves.push({f,re,im,strength})
   }
   waves.sort((a,b)=>b.strength-a.strength);
   for(const w of waves.slice(0,5)){
     let best=null;
     for(let phase=0;phase<7;phase++){
       const cost=new Float64Array(Q*Q),base=phase*2*Math.PI/(7*Q);
       for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){const t=2*Math.PI*w.f*v/Q+base;cost[c*Q+v]=-(w.re[c]*Math.cos(t)-w.im[c]*Math.sin(t))}
       const B=assignment(cost),score=B.reduce((s,v,c)=>s-cost[c*Q+v],0);
       if(!best||score>best.score)best={B,score}
     }
     // Profile fit is independent of global rank translation.
     let B=best.B;
     for(let it=0;it<12;it++){
       const p=ranks(G,B),cost=new Float64Array(Q*Q),log=Array.from(p,x=>Math.log(x+.5));
       for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let s=0;for(let k=0;k<Q;k++)s+=G[c*Q+k]*log[m(v-k)];cost[c*Q+v]=-s}
       const b=assignment(cost);if(b.every((v,i)=>v===B[i]))break;B=b
     }
     const p=ranks(G,B),min=id.slice().sort((a,b)=>p[a]-p[b]);
     for(let q=0;q<2;q++)out.push({kind:'fourier'+w.f+'g'+q,B:Int8Array.from(B,x=>m(x-min[q]))})
   }
   return out
 }
 function curriculum(C,K,seed,truth=null,truthA=null,truthB=null){
   const rand=random(seed),cuts=C.map(c=>Math.floor(.75*c.length)),full=C.map((c,i)=>setup(c.slice(0,cuts[i]),K)),stages=[64,128,256,512,1024,10000].map(n=>C.map((c,i)=>setup(c.slice(0,Math.min(n,cuts[i])),K)));
   const poolLength=cuts.reduce((a,b)=>a+b,0),G0=new Float64Array(Q*Q);
   for(const S of full){for(let i=0;i<S.n&&S.C[i]!==0;i++)G0[S.C[i]*Q+S.sh[i*S.H]]++}
   const initial=estimate(G0,2),records=[],candidates=[];
   for(let start=0;start<2;start++){
     let M=start===0?initial.slice():Float64Array.from(initial,x=>x*(.6+.8*rand()));
     for(let k=0;k<Q;k++){let sum=0;for(let c=0;c<Q;c++)sum+=M[c*Q+k];for(let c=0;c<Q;c++)M[c*Q+k]*=(1-freq[0])/sum}
     let result;
     const trace=[];
     for(let s=0;s<stages.length;s++){
       for(let it=0;it<12;it++){result=pooled(stages[s],M);M=estimate(result.G,s<2?1:.6)}
       trace.push(result.ll)
     }
     result=pooled(full,M);
     const seeds=spectralSeeds(result.G,M);
     for(const item of seeds){
       let B=item.B,A=inner(result.G,B),trace2=[];
       const initBeta=truthB?B.reduce((s,v,i)=>s+(v===truthB[i]),0):null;
       // Start from inferred full profile, then anneal the forbidden cell softly on the full prefix.
       for(let it=0;it<25;it++){const eps=10**(-Math.min(8,1+Math.floor(it/3))),z=pooled(full,structured(A,B,eps));if(!z.G)break;
         const [aa,bb]=mstep(A,B,z.G,eps);A=aa;B=bb;if(it%5===0)trace2.push(z.ll)
       }
       const final=pooled(full,structured(A,B,0));
       const record={start,kind:item.kind,initBeta,fitBeta:truthB?B.reduce((s,v,i)=>s+(v===truthB[i]),0):null,strictLL:Number.isFinite(final.ll)?final.ll:null};
       records.push(record);
       if(Number.isFinite(final.ll)){const q={ll:final.ll,A:Array.from(A),B:Array.from(B),record};if(!candidates.some(x=>x.A.join()===q.A.join()&&x.B.join()===q.B.join())){candidates.push(q);candidates.sort((a,b)=>b.ll-a.ll);if(candidates.length>4)candidates.pop()}}
     }
   }
   let best=null;
   for(const item of candidates){
     let A=item.A,B=item.B;
     let D=full.map(s=>decode(s,A,B,-1,false));if(D.some(x=>!x))continue;
     A=refineAlpha(A,D.flatMap(x=>x.P),rand);D=full.map(s=>decode(s,A,B));if(D.some(x=>!x))continue;
     let score=D.reduce((s,x)=>s+x.score,0);
     for(let it=0;it<2;it++){const a=refineAlpha(A,D.flatMap(x=>x.P),rand),d=full.map(s=>decode(s,a,B));if(d.some(x=>!x))break;const q=d.reduce((s,x)=>s+x.score,0);if(q>score){A=a;D=d;score=q}else break}
     if(!best||score>best.score)best={A,B,D,score,record:item.record}
   }
   function evaluate(A,B,D){if(D.some(x=>!x))return null;let fit=0,held=0,nheld=0,ok=true,legal=true,fitScore=0,heldScore=0,scopes=[];
     for(let i=0;i<C.length;i++){
       const d=D[i],cut=cuts[i],ends=decode(full[i],A,B,-1,true,true);let joint=null;
       for(const e of ends){const h=decode(setup(C[i].slice(cut),K,e.end),A,B,e.last);if(h&&(!joint||e.score+h.score>joint.e.score+joint.h.score))joint={e,h}}
       const h=joint?joint.h:null;
       const fitCorrect=truth?d.P.reduce((s,v,j)=>s+(v===truth[i][j]),0):null,heldCorrect=truth&&h?h.P.reduce((s,v,j)=>s+(v===truth[i][cut+j]),0):null;
       const replay=!!h&&encrypt(joint.e.P.concat(h.P),K,A,B).join()===C[i].join();
       fit+=fitCorrect||0;held+=heldCorrect||0;nheld+=C[i].length-cut;fitScore+=d.score;heldScore+=h?h.score:0;ok=ok&&replay;legal=legal&&!!h;scopes.push({fit:cut,fitCorrect,held:C[i].length-cut,heldCorrect,replay,fitEnd:d.end,continuationEnd:joint?joint.e.end:null,possibleFitEnds:ends.length,fitScore:d.score,heldScore:h?h.score:null,...(!truth?{fitP:joint?joint.e.P:d.P,heldP:h?h.P:null}:{} )})
     }
     return {fit:truth?fit:null,fitLength:poolLength,held:truth?held:null,heldLength:nheld,fitScore,heldScore:legal?heldScore:null,legal,exactReplay:ok,A,B,betaCorrect:truthB?B.reduce((s,v,i)=>s+(v===truthB[i]),0):null,alphaCorrect:truthA?A.reduce((s,v,i)=>s+(v===truthA[i]),0):null,scopes}
   }
   return {records,best:best?evaluate(best.A,best.B,best.D):null,oracle:truth?evaluate(truthA,truthB,full.map(s=>decode(s,truthA,truthB))):null}
 }

 function unknownPeriodic(C,q,seed,truth=null,truthA=null,truthB=null,truthK=null,steps=70000,restarts=22){
   const rand=random(seed),cuts=C.map(c=>Math.floor(.75*c.length)),phaseKey=Array.from({length:q},(_,i)=>i),phaseFull=C.map((c,i)=>setup(c.slice(0,cuts[i]),phaseKey));
   const stages=[64,128,256,512,1024,10000].map(n=>C.map((c,i)=>setup(c.slice(0,Math.min(n,cuts[i])),phaseKey)));
   const G0=new Float64Array(Q*Q);for(const S of phaseFull)for(let i=0;i<S.n&&S.C[i]!==0;i++)G0[S.C[i]*Q+S.sh[i*S.H]]++;
   let M=estimate(G0,2);
   for(const scope of stages)for(let i=0;i<16;i++){const z=pooled(scope,M);M=estimate(z.G,.6)}
   const E=pooled(phaseFull,M),G=E.G,columns=Array.from({length:q},(_,t)=>id.map(c=>G[c*Q+t])),tot=columns.map(a=>a.reduce((x,y)=>x+y,0));
   const sortedLog=[Math.log(freq[0]*.025),...id.slice(1).map(i=>Math.log(freq[i])).sort((a,b)=>a-b)].sort((a,b)=>a-b);
   // In this initializer the additive gauge is free, so assign the soft
   // zero mass to the least-supported rank only after the factorization.
   const sorted=new Float64Array(Q);
   function profileScore(mass){sorted.set(mass);sorted.sort();let s=0;for(let r=0;r<Q;r++)s+=sorted[r]*sortedLog[r];return s}
   function rankMass(B,K){const mass=new Float64Array(Q);for(let c=0;c<Q;c++)for(let t=0;t<q;t++)mass[m(B[c]-K[t])]+=columns[t][c];return mass}
   function cycleProposal(t,jitter){
     const normalized=columns.map((col,u)=>col.map(v=>v/tot[u]));
     function order(u){const noise=id.map(c=>normalized[u][c]+jitter*(rand()-.5)*Math.sqrt((columns[u][c]+1))/tot[u]);return id.slice().sort((a,b)=>noise[b]-noise[a])}
     const a=order(0),b=order(t),P=new Int8Array(Q);for(let i=0;i<Q;i++)P[a[i]]=b[i];
     function components(){const comp=new Int8Array(Q).fill(-1);let n=0;for(let c=0;c<Q;c++)if(comp[c]<0){let d=c;while(comp[d]<0){comp[d]=n;d=P[d]}n++}return {comp,n}}
     for(;;){const {comp,n}=components();if(n===1)break;let best=Infinity,x=-1,y=-1;for(let a=0;a<Q;a++)for(let b=a+1;b<Q;b++)if(comp[a]!==comp[b]){
       const u=normalized[0][a],v=normalized[0][b],r=normalized[t][P[a]],s=normalized[t][P[b]],cost=(u-s)**2+(v-r)**2-(u-r)**2-(v-s)**2;
       if(cost<best){best=cost;x=a;y=b}
     }[P[x],P[y]]=[P[y],P[x]]}
     const B=new Int8Array(Q);let c=0;for(let r=0;r<Q;r++){B[c]=r;c=P[c]}return B
   }
   function initK(B){const K=new Int8Array(q),mass=new Float64Array(Q);
     for(let c=0;c<Q;c++)mass[B[c]]=columns[0][c];
     const invB=inv(B);
     for(let t=1;t<q;t++){let best=-Infinity,bk=0;for(let k=0;k<Q;k++){let v=0;for(let r=0;r<Q;r++)v+=mass[r]*columns[t][invB[m(r+k)]];if(v>best){best=v;bk=k}}
       K[t]=bk;for(let c=0;c<Q;c++)mass[m(B[c]-bk)]+=columns[t][c]
     }return K
   }
   function norm(B,K){const mass=rankMass(B,K),zero=id.slice().sort((a,b)=>mass[a]-mass[b])[0];let f=K.find(x=>x!==0)||1,scale=id.find(x=>(f*x)%Q===1);return {B:Int8Array.from(B,x=>m((x-zero)*scale)),K:Int8Array.from(K,x=>m(x*scale))}}


   // Pair signatures are invariant to the unknown ciphertext-alphabet
   // permutation. A shared absolute shift difference implies the same
   // symmetrized joint distribution of two conditional-emission columns.
   const functions=[x=>x,x=>x*x,x=>Math.sqrt(x),x=>Math.tanh(x),x=>Math.exp(-x),x=>Math.max(0,x-1.8)];
   const V=Array.from({length:q},(_,t)=>functions.map(f=>{
     const a=id.map(c=>f(M[c*Q+t]*Q)),mean=a.reduce((s,v)=>s+v,0)/Q,norm=Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0));return a.map(v=>(v-mean)/Math.max(norm,1e-10))
   }));
   const edges=[];
   for(let t=0;t<q;t++)for(let u=t+1;u<q;u++){const f=[];for(let i=0;i<functions.length;i++)for(let j=i;j<functions.length;j++){
     let v=0;for(let c=0;c<Q;c++)v+=(V[t][i][c]*V[u][j][c]+V[t][j][c]*V[u][i][c])*.5;f.push(v)
   }const d=m(truthK[t]-truthK[u]);edges.push({t,u,delta:Math.min(d,Q-d),f})}
   const n=edges[0].f.length;
   for(let i=0;i<n;i++){const mean=edges.reduce((s,e)=>s+e.f[i],0)/edges.length,sd=Math.sqrt(edges.reduce((s,e)=>s+(e.f[i]-mean)**2,0)/edges.length);for(const e of edges)e.f[i]=(e.f[i]-mean)/Math.max(sd,.03)}
   const pairs=[];for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){let d=0;for(let f=0;f<n;f++)d+=(edges[i].f[f]-edges[j].f[f])**2;pairs.push({same:edges[i].delta===edges[j].delta,d:d/n})}
   const same=pairs.filter(x=>x.same),different=pairs.filter(x=>!x.same),auc=same.reduce((s,e)=>s+different.reduce((t,f)=>t+(e.d<f.d?1:e.d===f.d?.5:0),0),0)/(same.length*different.length);
   const summary=a=>({count:a.length,mean:a.reduce((s,x)=>s+x.d,0)/a.length,min:Math.min(...a.map(x=>x.d)),max:Math.max(...a.map(x=>x.d))});
   return {edges,auc,same:summary(same),different:summary(different),unstructuredLL:E.ll}

 }
 function multi(){
   const starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],P=[gp(shakespeare).slice(70000,82956),gp(gibran).slice(10000,22956)],q=8,controls=[];
   for(let j=0;j<2;j++){
     const rng=random(0x26260501+j),A=perm(rng,true),B=perm(rng,false),K=[0,...Array.from({length:q-1},()=>Math.floor(rng()*Q))],truth=starts.slice(0,-1).map((x,i)=>P[j].slice(x,starts[i+1])),C=truth.map(t=>encrypt(t,K,A,B));
     const result=unknownPeriodic(C,q,0x44f501+j,truth,A,B,K);controls.push({j,visibleF:C.reduce((n,row)=>n+row.filter(x=>x===0).length,0),repeats:C.reduce((n,row)=>n+row.filter((x,i)=>i>0&&x===row[i-1]).length,0),truthK:K,result})
   }
   const gate=false;
   const original=null;
   return {model:'pairwise column-profile invariant signature diagnostic, unknown periodic shifts; two frozen previous controls only',controls,gate,original}
 }
 return multi();

}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
