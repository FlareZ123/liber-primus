'use strict';
const fs=require('node:fs'),path=require('node:path');
function run(gp,raw){
 const M=29,S=58,mod=x=>(x+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const p=raw.map(native),U=new Float64Array(M).fill(.5),B=new Float64Array(M*M).fill(.25);
 for(let i=0;i<p[0].length;i++){U[p[0][i]]++;if(i)B[p[0][i-1]*M+p[0][i]]++}
 for(let x=0;x<M;x++){let z=0;for(let y=0;y<M;y++)z+=B[x*M+y];for(let y=0;y<M;y++)B[x*M+y]/=z}
 let pi=Float64Array.from(U,x=>x/U.reduce((a,b)=>a+b));
 for(let k=0;k<100;k++){const t=new Float64Array(M);for(let x=0;x<M;x++)for(let y=0;y<M;y++)t[y]+=pi[x]*B[x*M+y];pi=t}
 const h=pi[0],l=1-h,pA=pi.map((v,i)=>i?v/l:0),active=new Float64Array(M*M),prior=new Float64Array(S);
 for(let x=1;x<M;x++){prior[x]=pi[x];prior[M+x]=pi[x]*B[x*M]/(1-B[0]);for(let y=1;y<M;y++)active[x*M+y]=B[x*M+y]+B[x*M]*B[y]/(1-B[0])}
 assert(Math.abs(prior.reduce((a,b)=>a+b)-1)<1e-9,"stationary prior");
 const shifts=Array.from({length:M},(_,a)=>Float64Array.from({length:M},(_,c)=>pA[mod(c-a)]));
 const ord=Array.from({length:28},(_,i)=>i+1).sort((a,b)=>pi[b]-pi[a]);
 let seed=0x19aef10;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function counts(C){const N=new Uint32Array(M*M);for(let i=1;i<C.length;i++)N[C[i-1]*M+C[i]]++;return N}
 function ll(J,N){let s=0;for(let i=0;i<J.length;i++)if(N[i])s+=N[i]*Math.log(Math.max(J[i],1e-200));return s}
 function pairInit(N){
  const T=N.reduce((a,b)=>a+b),obs=new Float64Array(M);for(let c=0;c<M;c++)for(let d=0;d<M;d++){obs[c]+=N[c*M+d]/(2*T);obs[d]+=N[c*M+d]/(2*T)}
  let u=new Float64Array(M).fill(1/M),v=new Float64Array(M);
  for(let it=0;it<800;it++){v.fill(0);for(let c=0;c<M;c++){let z=c===0?h:0;for(let a=0;a<M;a++)z+=l*u[a]*shifts[a][c];for(let a=0;a<M;a++)v[a]+=obs[c]*l*u[a]*shifts[a][c]/z}let sum=v.reduce((a,b)=>a+b);for(let a=0;a<M;a++)v[a]/=sum;[u,v]=[v,u]}
  const H=new Float64Array(M);for(let a=0;a<M;a++)for(let c=0;c<M;c++)H[c]+=u[a]*shifts[a][c];
  const A=Array.from({length:M},(_,c)=>Float64Array.from({length:M},(_,x)=>l*l*pA[x]*u[mod(c-x)])),w=Array.from({length:M},()=>new Float64Array(M).fill(1/M)),Q=Array.from({length:M},()=>new Float64Array(M)),J=new Float64Array(M*M);
  for(let it=0;it<240;it++){for(let x=1;x<M;x++){Q[x].fill(0);for(let a=0;a<M;a++)for(let d=0;d<M;d++)Q[x][d]+=w[x][a]*shifts[a][d]}
   J.fill(0);for(let c=0;c<M;c++)for(let d=0;d<M;d++){let z=(c===0?h*l*H[d]:0)+(d===0?h*l*H[c]:0)+(c===0&&d===0?h*h:0);for(let x=1;x<M;x++)z+=A[c][x]*Q[x][d];J[c*M+d]=z}
   for(let x=1;x<M;x++){let E=new Float64Array(M);for(let d=0;d<M;d++)for(let c=0;c<M;c++)E[d]+=A[c][x]*N[c*M+d]/Math.max(J[c*M+d],1e-200);let sum=0;for(let a=0;a<M;a++){let z=0;for(let d=0;d<M;d++)z+=E[d]*shifts[a][d];w[x][a]*=z;sum+=w[x][a]}for(let a=0;a<M;a++)w[x][a]=sum?w[x][a]/sum:1/M}}
  return {w,f:w.map(row=>row.indexOf(Math.max(...row)))}
 }
 function pairDist(f){const J=new Float64Array(M*M);J[0]=h*B[0];
  for(let x=1;x<M;x++){const hold=prior[M+x];for(let z=1;z<M;z++)J[mod(z+f[x])]+=hold*B[z];
   for(let y=1;y<M;y++){const c=mod(y+f[x]),weight=pi[x]*active[x*M+y];J[c*M]+=weight*B[y*M];for(let z=1;z<M;z++)J[c*M+mod(z+f[y])]+=weight*B[y*M+z]}}
  return J;
 }
 function pairRefine(N,f0){let f=f0.slice(),score=ll(pairDist(f),N),trace=[score];for(let it=0;it<10;it++){let changed=0;for(const x of ord){const old=f[x];let best=old,bs=score;for(let a=0;a<M;a++)if(a!==old){f[x]=a;const s=ll(pairDist(f),N);if(s>bs+1e-7){bs=s;best=a}}f[x]=best;score=bs;changed+=Number(best!==old)}trace.push(score);if(!changed)break}return {f,trace}}
 const diff=Array.from({length:M},(_,c)=>Array.from({length:M},(_,z)=>mod(c-z)));
 function fb(C,w,doBack=true,initial=prior){
  const n=C.length,aa=doBack?new Float64Array((n+1)*S):null,sc=new Float64Array(n);let a=Float64Array.from(initial),v=new Float64Array(S),score=0;if(aa)aa.set(a);
  for(let i=0;i<n;i++){const c=C[i],d=diff[c];v.fill(0);
   for(let x=1;x<M;x++){const a0=a[x],a1=a[M+x],bx=x*M;if(!a0&&!a1)continue;if(c===0)v[M+x]=a0*B[bx]+a1*B[0];const wx=w[x];for(let z=1;z<M;z++)v[z]+=(a0*B[bx+z]+a1*B[z])*wx[d[z]]}
   let scale=0;for(let j=0;j<S;j++)scale+=v[j];if(!(scale>0))return {score:-Infinity,reach:i};score+=Math.log(scale);sc[i]=scale;for(let j=0;j<S;j++)v[j]/=scale;[a,v]=[v,a];if(aa)aa.set(a,(i+1)*S)
  }
  if(!doBack)return {score,end:a,reach:n};
  const e=Array.from({length:M},()=>new Float64Array(M));let beta=new Float64Array(S).fill(1),next=new Float64Array(S);
  for(let i=n-1;i>=0;i--){const c=C[i],d=diff[c],scale=sc[i],off=i*S;next.fill(0);
   for(let x=1;x<M;x++){let u0=0,u1=0;const a0=aa[off+x],a1=aa[off+M+x],bx=x*M,wx=w[x],ex=e[x];
    if(c===0){u0=B[bx]*beta[M+x];u1=B[0]*beta[M+x]}
    for(let z=1;z<M;z++){const s=d[z],t=wx[s]*beta[z],b0=B[bx+z],b1=B[z];u0+=b0*t;u1+=b1*t;ex[s]+=(a0*b0+a1*b1)*t/scale}
    next[x]=u0/scale;next[M+x]=u1/scale;
   }[beta,next]=[next,beta]
  }return {score,end:a,e,reach:n};
 }
 function hard(f){return f.map(x=>Float64Array.from({length:M},(_,j)=>Number(x===j)))}
 function encode(P,f,iv){let x=iv;return P.map(z=>{if(z===0)return 0;const c=mod(z+f[x]);x=z;return c})}
 function vit(C,f,initial=prior){const n=C.length,back=new Int16Array(n*S).fill(-1);let a=Float64Array.from(initial,x=>x?Math.log(x):-Infinity),v=new Float64Array(S),score=0;
  for(let i=0;i<n;i++){const c=C[i];v.fill(-Infinity);for(let x=1;x<M;x++)for(const s of [x,M+x])if(Number.isFinite(a[s])){const prev=s>=M?0:x;const z=mod(c-f[x]);if(z){const q=a[s]+Math.log(B[prev*M+z]);if(q>v[z]){v[z]=q;back[i*S+z]=s}}if(c===0){const q=a[s]+Math.log(B[prev*M]);if(q>v[M+x]){v[M+x]=q;back[i*S+M+x]=s}}}
   [a,v]=[v,a];if(!a.some(Number.isFinite))return {reach:i,score:-Infinity};
  }let s=a.indexOf(Math.max(...a));score=a[s];const end=s,plain=new Array(n);for(let i=n-1;i>=0;i--){plain[i]=s>=M?0:s;s=back[i*S+s]}assert(s>=0,"viterbi backtrace");const iv=s%M;assert(encode(plain,f,iv).join()===C.join(),"replay");return {reach:n,score,plain,end,iv}
 }
 function fit(C,truth=null,iters=45){const N=counts(C),i=pairInit(N),init=pairRefine(N,i.f);let w=i.w.map((row,x)=>Float64Array.from(row,(v,j)=>.35*v+.64*Number(j===init.f[x])+.01/M));
  const matches=f=>truth?f.slice(1).filter((v,i)=>v===truth[i+1]).length:null;
  const history=[{stage:"pair-iid",matches:matches(i.f),f:i.f},{stage:"pair-Markov",matches:matches(init.f),f:init.f,trace:init.trace}];
  let best=null,longest={reach:0};
  for(let it=0;it<=iters;it++){const f=w.map(row=>row.indexOf(Math.max(...row))),exact=fb(C,hard(f),false);if(exact.reach>longest.reach)longest={reach:exact.reach,f,it};if(it%5===0||it===iters){history.push({it,matches:matches(f),hardReach:exact.reach,hardScore:Number.isFinite(exact.score)?exact.score/C.length:null});}
   if(Number.isFinite(exact.score)&&(!best||exact.score>best.score)){best={f,score:exact.score,it}}
   if(it===iters)break;const r=fb(C,w,true);if(it%5===0)history.at(-1).softScore=r.score/C.length;
   for(let x=1;x<M;x++){let sum=0;const e=r.e[x];for(let a=0;a<M;a++){w[x][a]=Math.pow(e[a]+.02,1.04);sum+=w[x][a]}for(let a=0;a<M;a++)w[x][a]/=sum}
  }
  return {best,longest,history,finalMap:w.map(row=>row.indexOf(Math.max(...row))),softRows:w.map(x=>Array.from(x))};
 }
 const n=10000,results=[];for(let j=0;j<2;j++){const P=p[j+1].slice(10000+j*20000,22956+j*20000),f=Array.from({length:M},()=>rnd()%M),iv=1+rnd()%28,C=encode(P,f,iv),T=C.slice(0,n),V=C.slice(n),oracle=vit(C,f);
  assert(oracle.reach===C.length,"oracle path");const a=fit(T,f);const z={name:["Gibran","Emerson"][j],truth:f,iv,oracleExact:oracle.plain.filter((x,k)=>x===P[k]).length,...a};if(a.best){const v=vit(T,a.best.f),initial=new Float64Array(S);initial[v.end]=1;const held=vit(V,a.best.f,initial);z.fitExact=v.plain.filter((x,k)=>x===P[k]).length;z.heldExact=held.plain?.filter((x,k)=>x===P[n+k]).length??0;z.heldReach=held.reach;z.heldScore=Number.isFinite(held.score)?held.score/V.length:null;}results.push(z);}
 assert(results.every(x=>x.heldReach===2956&&x.heldExact>=.95*2956),"positive gate failed; do not evaluate original");
 const C=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);assert(C.length===12956,"original corpus");const T=C.slice(0,n),V=C.slice(n),a=fit(T);let original={name:"LP2 p0–55",...a};if(a.best){const v=vit(T,a.best.f),initial=new Float64Array(S);initial[v.end]=1;const held=vit(V,a.best.f,initial);original.heldReach=held.reach;original.heldScore=Number.isFinite(held.score)?held.score/V.length:null;original.heldPlain=held.plain;original.heldPreview=held.plain?.slice(0,150).map(x=>gp.translit[x]).join(" ");original.fitPlain=v.plain;}
 return {holdPrior:h,n,results,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1)),null,2));
