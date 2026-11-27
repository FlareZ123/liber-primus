'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(data,job){
 const [rawC,emerson,shakespeare,gibran]=data,corpus=JSON.parse(rawC),Q=29,id=Array.from({length:Q},(_,i)=>i),m=x=>(x%Q+Q)%Q;
 const assert=(x,s)=>{if(!x)throw Error(s)},rho=.81;
 const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
 function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}

 const train=gp(emerson),freq=new Float64Array(Q).fill(.5),LM=new Float64Array(Q*Q).fill(.5);
 for(let i=0;i<train.length;i++){freq[train[i]]++;if(i)LM[train[i-1]*Q+train[i]]++}
 let z=freq.reduce((a,b)=>a+b);for(let i=0;i<Q;i++){freq[i]/=z;let s=0;for(let j=0;j<Q;j++)s+=LM[i*Q+j];for(let j=0;j<Q;j++)LM[i*Q+j]=Math.log(LM[i*Q+j]/s)}
 function random(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 function perm(rand,fix0){const a=id.slice();for(let i=28;i>(fix0?1:0);i--){const lo=fix0?1:0,j=lo+Math.floor(rand()*(i+1-lo));[a[i],a[j]]=[a[j],a[i]]}return a}
 function inv(A){const b=new Int8Array(Q);for(let i=0;i<Q;i++)b[A[i]]=i;return b}

 // Dense Hungarian assignment on a 29x29 cost matrix.
 function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);
   for(let i=1;i<=Q;i++){p[0]=i;let j0=0;const min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);
     do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){const cur=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}
       for(let j=0;j<=Q;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta}j0=j1
     }while(p[j0]!==0);
     do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)
   }const out=new Int8Array(Q);for(let j=1;j<=Q;j++)out[p[j]-1]=j-1;return out
 }

 function ranks(G,B){const p=new Float64Array(Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)p[m(B[c]-k)]+=G[c*Q+k];return p}
 function inner(G,B){const p=ranks(G,B),A=new Int8Array(Q),labels=id.slice(1).sort((a,b)=>freq[a]-freq[b]),rs=id.slice(1).sort((a,b)=>p[a]-p[b]);for(let i=0;i<Q-1;i++)A[labels[i]]=rs[i];return A}
 function structured(A,B,eps=0){const IA=inv(A),M=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)M[c*Q+k]=freq[IA[m(B[c]-k)]]*(m(B[c]-k)===0?eps:1);return M}
 function spectralSeeds(G,M){
   const out=[],waves=[];
   out.push({kind:'forbidden',B:assignment(M)});
   for(let f=1;f<=14;f++){
     const re=new Float64Array(Q),im=new Float64Array(Q);let strength=0;
     for(let c=0;c<Q;c++){for(let k=0;k<Q;k++){const t=2*Math.PI*f*k/Q;re[c]+=M[c*Q+k]*Math.cos(t);im[c]-=M[c*Q+k]*Math.sin(t)}strength+=Math.hypot(re[c],im[c])}
     waves.push({f,re,im,strength})
   }
   waves.sort((a,b)=>b.strength-a.strength);
   for(const w of waves.slice(0,3)){
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
     out.push({kind:'fourier'+w.f,B});
   }
   return out
 }

 function refineAlpha(A,P,rand){const rank=P.map(p=>A[p]),M=new Int32Array(Q*Q);for(let i=1;i<rank.length;i++)M[rank[i-1]*Q+rank[i]]++;
   const objective=I=>{let s=0;for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)s+=M[a*Q+b]*LM[I[a]*Q+I[b]];return s};
   let bestI=Array.from(inv(A)),best=objective(bestI);
   for(let r=0;r<6;r++){let I=r===0?bestI.slice():Array.from(inv(perm(rand,true))),score=objective(I);
     for(let t=0;t<3000;t++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;const x=I[a],y=I[b];let delta=0;
       for(let j=0;j<Q;j++)if(j!==a&&j!==b){const z=I[j];delta+=M[a*Q+j]*(LM[y*Q+z]-LM[x*Q+z])+M[b*Q+j]*(LM[x*Q+z]-LM[y*Q+z])+M[j*Q+a]*(LM[z*Q+y]-LM[z*Q+x])+M[j*Q+b]*(LM[z*Q+x]-LM[z*Q+y])}
       delta+=M[a*Q+a]*(LM[y*Q+y]-LM[x*Q+x])+M[b*Q+b]*(LM[x*Q+x]-LM[y*Q+y])+M[a*Q+b]*(LM[y*Q+x]-LM[x*Q+y])+M[b*Q+a]*(LM[x*Q+y]-LM[y*Q+x]);
       const temp=4*Math.pow(.02,t/2999);if(delta>=0||rand()<Math.exp(delta/temp)){[I[a],I[b]]=[I[b],I[a]];score+=delta;if(score>best){best=score;bestI=I.slice()}}
     }
   }return Array.from(inv(bestI))
 }

 const starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],primes=[],origin=job.origin??0;
 for(let i=2;primes.length<origin+3400;i++)if(primes.every(p=>p*p>i||i%p!==0))primes.push(i);
 const K=primes.slice(origin).map(p=>(p-1)%Q);
 function encrypt(P,A,B,rand){let j=0,prev=-1,skip=0,holds=0;const I=inv(B),C=[],moves=[];
   for(const p of P){if(p===0){C.push(0);moves.push(-1);prev=0;holds++;continue}let c=I[m(A[p]+K[j])],d=0;if(c===prev&&rand()<rho){j++;d=1;skip++;c=I[m(A[p]+K[j])]}C.push(c);moves.push(d);prev=c;j++}
   return{C,moves,skip,holds}
 }
 function replay(P,A,B,moves){let j=0,prev=-1;const I=inv(B),C=[];for(let i=0;i<P.length;i++){if(moves[i]===-1){assert(P[i]===0,'illegal F hold');C.push(0);prev=0;continue}assert(P[i]!==0,'illegal F consume');let c=I[m(A[P[i]]+K[j])];if(moves[i]){assert(c===prev,'noncollision retry');j++;c=I[m(A[P[i]]+K[j])]}C.push(c);prev=c;j++}return C}
 function setup(C){const n=C.length,neg=C.filter(c=>c===0).length,pos=Math.min(n,Math.ceil(.08*n)+15),H=neg+pos+1,lo=new Int32Array(n+1),hi=new Int32Array(n+1),sh=new Uint8Array(n*H),diff=new Uint8Array(n*H);
   for(let i=0;i<n;i++){lo[i+1]=lo[i]-(C[i]===0?1:0);hi[i+1]=Math.min(i+1,pos);for(let d=lo[i];d<=hi[i];d++){const j=i+d,h=d+neg;sh[i*H+h]=K[j];diff[i*H+h]=m(K[j+1]-K[j])}}
   return{C,n,H,neg,pos,lo,hi,sh,diff}
 }
 // Three event paths: F hold (-1), ordinary consume (0), collision-only retry (+1).
 // Net displacement is enough for the unigram clock posterior.
 function posterior(S,M,B=null,eps=1,counts=true,pair=false){
   const {C,n,H,neg,lo,hi,sh,diff}=S,F=new Float64Array((n+1)*H),sc=new Float64Array(n);F[neg]=1;let ll=0;
   for(let i=0;i<n;i++){const c=C[i],prev=i?C[i-1]:-1,a=i*H,b=a+H,o=c*Q,same=c===prev,wd=same?1-rho:1;let sum=0;
     for(let d=lo[i];d<=hi[i];d++){const h=d+neg,v=F[a+h];if(!v)continue;const k=sh[a+h],delta=diff[a+h],t=v*wd*M[o+k];F[b+h]+=t;sum+=t;
       if(c===0){const u=v*freq[0];F[b+h-1]+=u;sum+=u}
       if(i&&h+1<H&&(same?delta===0:delta!==0)){const wr=B?(m(B[c]-B[prev])===delta?rho:rho*eps/(Q-1)):(same?rho:rho/(Q-1));if(wr){const u=v*wr*M[o+m(k+delta)];F[b+h+1]+=u;sum+=u}}
     }
     if(!(sum>0))return{ll:-Infinity};sc[i]=sum;ll+=Math.log(sum);for(let d=lo[i+1];d<=hi[i+1];d++)F[b+d+neg]/=sum;
   }
   if(!counts)return{ll};
   const G=new Float64Array(Q*Q),T=pair?new Float64Array(Q*Q*Q):null;let bb=new Float64Array(H),b=new Float64Array(H).fill(1),skips=0,holds=0;
   for(let i=n-1;i>=0;i--){const c=C[i],prev=i?C[i-1]:-1,a=i*H,o=c*Q,same=c===prev,wd=same?1-rho:1,scale=sc[i];
     for(let d=lo[i];d<=hi[i];d++){const h=d+neg,k=sh[a+h],delta=diff[a+h],v=F[a+h]/scale,x=wd*M[o+k]*b[h];let z=x;G[o+k]+=v*x;
       if(c===0){const y=freq[0]*b[h-1];holds+=v*y;z+=y}
       if(i&&h+1<H&&(same?delta===0:delta!==0)){const wr=B?(m(B[c]-B[prev])===delta?rho:rho*eps/(Q-1)):(same?rho:rho/(Q-1));if(wr){const kk=m(k+delta),y=wr*M[o+kk]*b[h+1],post=v*y;G[o+kk]+=post;skips+=post;if(T)T[(c*Q+prev)*Q+delta]+=post;z+=y}}
       bb[h]=z/scale;
     }[b,bb]=[bb,b]
   }
   return{ll,G,T,skips,holds}
 }
 function pooled(S,M,B=null,eps=1,pair=false){const G=new Float64Array(Q*Q),T=pair?new Float64Array(Q*Q*Q):null;let ll=0,skips=0,holds=0;
   for(const s of S){const z=posterior(s,M,B,eps,true,pair);if(!z.G)return{ll:-Infinity};ll+=z.ll;skips+=z.skips;holds+=z.holds;for(let i=0;i<G.length;i++)G[i]+=z.G[i];if(T)for(let i=0;i<T.length;i++)T[i]+=z.T[i]}
   return{ll,G,T,skips,holds}
 }
 function estimate(G,smooth=.7){const M=new Float64Array(Q*Q);for(let k=0;k<Q;k++){let sum=smooth*Q;for(let c=0;c<Q;c++)sum+=G[c*Q+k];for(let c=0;c<Q;c++)M[c*Q+k]=(1-freq[0])*(G[c*Q+k]+smooth)/sum}return M}
 // Given E-step posterior counts, optimize unary emission terms and collision
 // pair rewards; pair-swap hill climb uses exact objective differences.
 function update(A,B,G,T,eps){
   const IA=inv(A),logp=Float64Array.from(IA,r=>Math.log(freq[r])+(r===0?Math.log(eps):0)),U=new Float64Array(Q*Q),lambda=Math.log((Q-1)/eps);
   for(let c=0;c<Q;c++)for(let v=0;v<Q;v++)for(let k=0;k<Q;k++)U[c*Q+v]+=G[c*Q+k]*logp[m(v-k)];
   const pair=(c,d,x,y)=>lambda*(T[(c*Q+d)*Q+m(x-y)]+T[(d*Q+c)*Q+m(y-x)]);
   const score=V=>{let s=0;for(let c=0;c<Q;c++){s+=U[c*Q+V[c]];for(let d=0;d<c;d++)s+=pair(c,d,V[c],V[d])}return s};
   let best=null,bestScore=-Infinity;
   for(const initial of [B,assignment(Float64Array.from(U,v=>-v))]){
     const V=Array.from(initial);
     for(let it=0;it<25;it++){
       let gain=1e-8,aa=-1,bb=-1;
       for(let a=0;a<Q;a++)for(let b=a+1;b<Q;b++){
         const x=V[a],y=V[b];let d=U[a*Q+y]+U[b*Q+x]-U[a*Q+x]-U[b*Q+y]+pair(a,b,y,x)-pair(a,b,x,y);
         for(let c=0;c<Q;c++)if(c!==a&&c!==b){const z=V[c];d+=pair(a,c,y,z)+pair(b,c,x,z)-pair(a,c,x,z)-pair(b,c,y,z)}
         if(d>gain){gain=d;aa=a;bb=b}
       }
       if(aa<0)break;[V[aa],V[bb]]=[V[bb],V[aa]]
     }
     const s=score(V);if(s>bestScore){bestScore=s;best=V}
   }
   return[inner(G,best),best]
 }
 function decode(S,A,B,bigram=true){
   const {C,n,H,neg,lo,hi,sh,diff}=S,IA=inv(A),back=new Int8Array(n*H*2).fill(-1);let v=new Float64Array(H*2).fill(-Infinity),nv=new Float64Array(H*2).fill(-Infinity);v[neg*2]=0;
   for(let i=0;i<n;i++){nv.fill(-Infinity);const c=C[i],prev=i?C[i-1]:-1,same=c===prev,a=i*H;
     for(let d=lo[i];d<=hi[i];d++){const h=d+neg,k=sh[a+h],delta=diff[a+h],p=IA[m(B[c]-k)],q=IA[m(B[c]-m(k+delta))];
       for(let t=0;t<2;t++){const val=v[h*2+t];if(!Number.isFinite(val))continue;const last=i?(t?0:IA[m(B[prev]-K[i-1+d])]):0;
         const weight=p=>bigram&&i?LM[last*Q+p]:Math.log(freq[p]);
         if(p!==0){const z=val+weight(p)+(same?Math.log(1-rho):0),j=h*2;if(z>nv[j]){nv[j]=z;back[a*2+j]=t*3+1}}
         if(c===0){const z=val+weight(0),j=(h-1)*2+1;if(z>nv[j]){nv[j]=z;back[a*2+j]=t*3}}
         if(i&&h+1<H&&q!==0&&m(B[c]-B[prev])===delta){const z=val+weight(q)+Math.log(rho),j=(h+1)*2;if(z>nv[j]){nv[j]=z;back[a*2+j]=t*3+2}}
       }
     }[v,nv]=[nv,v]
   }
   let j=0;for(let k=1;k<H*2;k++)if(v[k]>v[j])j=k;const score=v[j],P=Array(n),moves=Array(n);if(!Number.isFinite(score))return null;
   let skips=0,holds=0;
   for(let i=n-1;i>=0;i--){const code=back[i*H*2+j];assert(code>=0,'backtrack');const ty=code%3-1,t=Math.floor(code/3),d=Math.floor(j/2)-neg;P[i]=ty===-1?0:IA[m(B[C[i]]-K[i+d])];moves[i]=ty;skips+=ty===1;holds+=ty===-1;j=(Math.floor(j/2)-ty)*2+t}
   assert(j===neg*2&&replay(P,A,B,moves).join()===C.join(),'decode replay');
   return{P,moves,score,skips,holds}
 }
 function aligned(A,B,AA,BB){let best=0;for(let g=0;g<Q;g++){const x=A.reduce((s,v,i)=>s+(m(v+g)===AA[i]),0)+B.reduce((s,v,i)=>s+(m(v+g)===BB[i]),0);best=Math.max(x,best)}return best}
 function run(C,truth=null,truthA=null,truthB=null){
   const cuts=C.map(c=>Math.floor(.75*c.length)),prefix=C.map((c,i)=>c.slice(0,cuts[i])),full=prefix.map(setup),stages=[64,128,256,512,1024,10000].map(w=>prefix.map(c=>setup(c.slice(0,w))));
   const rand=random(job.seed??0x330150),records=[],pool=[],init=new Float64Array(Q*Q).fill((1-freq[0])/Q);let M=init;
   for(let s=0;s<stages.length;s++)for(let it=0;it<8;it++){const z=pooled(stages[s],M);M=estimate(z.G,s<2?1:.5)}
   const z=pooled(full,M),base=spectralSeeds(z.G,M),seeds=[],seen=new Set();for(const item of base){const p=ranks(z.G,item.B),lows=id.slice().sort((a,b)=>p[a]-p[b]).slice(0,item.kind==='forbidden'?1:2);for(const low of lows)seeds.push({kind:item.kind+':zero'+low,B:Array.from(item.B,b=>m(b-low))})}
   for(const item of seeds){let B=Array.from(item.B),A=inner(z.G,B);const tag=B.join();if(seen.has(tag))continue;seen.add(tag);
     const initial=truth?aligned(A,B,truthA,truthB):null,trace=[];
     for(let it=0;it<12;it++){
       const eps=10**(-Math.min(5,Math.floor(it/3))),v=pooled(full,structured(A,B,eps),B,eps,true);if(!v.G)break;
       [A,B]=update(A,B,v.G,v.T,eps);if(it%3===0)trace.push({ll:v.ll,skips:v.skips});
     }
     const final=pooled(full,structured(A,B,0),B,0),rec={kind:item.kind,initial,final:truth?aligned(A,B,truthA,truthB):null,ll:final.ll,skips:final.skips,trace};records.push(rec);if(Number.isFinite(final.ll))pool.push({A:Array.from(A),B:Array.from(B),ll:final.ll,rec})
   }
   pool.sort((a,b)=>b.ll-a.ll);let best=null;
   for(const item of pool.slice(0,3)){let {A,B}=item,D=full.map(s=>decode(s,A,B,false));if(D.some(x=>!x))continue;A=refineAlpha(A,D.flatMap(x=>x.P),rand);D=full.map(s=>decode(s,A,B));let score=D.reduce((s,x)=>s+x.score,0);
     for(let it=0;it<2;it++){const a=refineAlpha(A,D.flatMap(x=>x.P),rand),d=full.map(s=>decode(s,a,B)),v=d.reduce((s,x)=>s+x.score,0);if(v>score){A=a;D=d;score=v}else break}
     if(!best||score>best.score)best={A,B,D,score,kind:item.rec.kind}
   }
   function evaluate(A,B){let fit=0,held=0,fitLength=0,heldLength=0,fitScore=0,heldScore=0,skips=0,holds=0,scopes=[];
     for(let i=0;i<C.length;i++){const d=decode(setup(C[i]),A,B);if(!d)return {exactReplay:false,failedScope:i};const cut=cuts[i],n=C[i].length;fitLength+=cut;heldLength+=n-cut;skips+=d.skips;holds+=d.holds;let f=0,h=0;
       for(let j=0;j<n;j++){if(truth&&d.P[j]===truth[i][j]){if(j<cut)f++;else h++}const s=j?LM[d.P[j-1]*Q+d.P[j]]:Math.log(freq[d.P[j]]);if(j<cut)fitScore+=s;else heldScore+=s}
       fit+=f;held+=h;scopes.push({length:n,cut,fit:truth?f:null,held:truth?h:null,skips:d.skips,holds:d.holds,...(!truth?{P:d.P,moves:d.moves}:{})})
     }
     return{A,B,fit:truth?fit:null,held:truth?held:null,fitLength,heldLength,fitScore,heldScore,skips,holds,exactReplay:true,aligned:truth?aligned(A,B,truthA,truthB):null,scopes}
   }
   return{records,best:best?evaluate(best.A,best.B):null,oracle:truth?evaluate(truthA,truthB):null}
 }
 const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices),rows=starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1]));
 if(job.control===undefined)return{job,model:'Known selected prime-origin chapter reset, arbitrary common alpha/beta, optional single collision-only retry with rho=.81; literal F hold',result:run(rows)};
 const j=job.control,P=(j?gp(gibran):gp(shakespeare)).slice(j?5000:60000,(j?12000:80000)+12956),rng=random(0x27112790+j),A=perm(rng,true),B=perm(rng,false),truth=starts.slice(0,-1).map((x,i)=>P.slice(x,starts[i+1]));assert(P.length===12956,'control length');
 const planted=truth.map(p=>encrypt(p,A,B,rng)),C=planted.map(x=>x.C);for(let i=0;i<C.length;i++)assert(replay(truth[i],A,B,planted[i].moves).join()===C[i].join(),'plant replay');
 return{job,model:'Known selected prime-origin chapter reset, arbitrary common alpha/beta, optional single collision-only retry with rho=.81; literal F hold',trueSkips:planted.map(x=>x.skip),trueHolds:planted.map(x=>x.holds),repeats:C.map(x=>x.filter((z,i)=>i&&z===x[i-1]).length),result:run(C,truth,A,B)};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module){const data=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));const controls=[0,1].map(control=>study(data,{control,seed:0x330150+control})),gate=controls.every(x=>x.result.best&&x.result.best.fit>=.9*x.result.best.fitLength&&x.result.best.held>=.9*x.result.best.heldLength);console.log(JSON.stringify({controls,gate,original:gate?study(data,{seed:0x330152}):null},null,2))}
module.exports={study,paths};
