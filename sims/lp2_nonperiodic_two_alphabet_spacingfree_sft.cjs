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
 function decode(S,A,B,prev=-1,bigram=true){const {C,n,H,lim,sh,start}=S,IA=inv(A),N=2*H,back=new Int8Array(n*N).fill(-1),last=new Int8Array(N).fill(-1),nl=new Int8Array(N).fill(-1);let v=new Float64Array(N).fill(-Infinity),nv=new Float64Array(N).fill(-Infinity);v[0]=0;last[0]=prev;
   for(let i=0;i<n;i++){nv.fill(-Infinity);nl.fill(-1);const c=C[i],o=i*H;
     for(let h=0;h<=lim[i];h++)for(let ty=0;ty<2;ty++){const a=h*2+ty,base=v[a];if(!Number.isFinite(base))continue;const lastp=last[a];
       const r=(B[c]+Q-sh[o+h])%Q;if(r!==0){const p=IA[r],b=h*2,score=base+(bigram&&lastp>=0?LM[lastp*Q+p]:Math.log(freq[p]));if(score>nv[b]){nv[b]=score;nl[b]=p;back[i*N+b]=ty}}
       if(c===0){const b=(h+1)*2+1,score=base+(bigram&&lastp>=0?LM[lastp*Q]:Math.log(freq[0]));if(score>nv[b]){nv[b]=score;nl[b]=0;back[i*N+b]=ty}}
     }[v,nv]=[nv,v];last.set(nl);
   }
   let a=0;for(let j=1;j<N;j++)if(v[j]>v[a])a=j;if(!Number.isFinite(v[a]))return null;
   const score=v[a],endH=a>>1,endLast=last[a],P=new Int8Array(n);
   for(let i=n-1;i>=0;i--){const h=a>>1,ty=a&1,pt=back[i*N+a];assert(pt>=0,"backtrack");if(ty){P[i]=0;a=(h-1)*2+pt}else{P[i]=IA[(B[C[i]]+Q-sh[i*H+h])%Q];a=h*2+pt}}
   return {score,P:Array.from(P),end:start+n-endH,last:endLast}
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
 const keys=[corrected,corrected.map(x=>c.prime[x]%Q)],plain=[gp(shakespeare).slice(30000,31903),gp(gibran).slice(10000,11903)],C=c.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices);assert(C.length===1903,"p15–22 count");
 const controls=[];
 for(let i=0;i<2;i++){const rng=random(0x20261129+i),A=perm(rng,true),B=perm(rng,false),E=encrypt(plain[i],keys[i],A,B);const result=run(E,keys[i],0x33a100+i,plain[i],A,B);controls.push({schedule:i,visibleF:E.filter(x=>x===0).length,plainF:plain[i].filter(x=>x===0).length,result})}
 const gate=controls.every(x=>x.result.fit&&x.result.fit.fitCorrect>=1080&&x.result.fit.heldCorrect>=633&&x.result.fit.exactReplay);
 const original=gate?keys.map((K,i)=>run(C,K,0x33b100+i)):null;
 return {model:"known nonperiodic cyclic consuming-index K; literal plaintext F non-consuming; independent arbitrary alpha,beta with alpha(F)=0 gauge and unrestricted beta(F); exact scaled hold-count posterior, Hungarian beta M-step, rank-mass inner M-step, fixed rank bigram annealing and exact heldout Viterbi; original only after >=90% fit and suffix on both controls",restarts,iterations,controls,gate,original}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
