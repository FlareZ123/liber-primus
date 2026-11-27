'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,training,donor,opt={}){
 const Q=29,K=812,T=Q*Q*Q,W=Q*K,fit=9640,N=12956,mod=x=>(x%Q+Q)%Q;
 const tok=new Map(corpus.translit.map((x,i)=>[x,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){const n=tok.has(w.slice(0,2))?2:1,v=tok.get(w.slice(0,n));if(v===undefined)throw Error(w);out.push(v);w=w.slice(n);}}return out;}
 const tr=gp(training),counts=new Float64Array(Q*Q).fill(.2),B=new Float64Array(Q*Q),pi=new Float64Array(Q).fill(1/Q);
 for(let i=1;i<tr.length;i++)counts[tr[i-1]*Q+tr[i]]++;
 for(let p=0;p<Q;p++){let s=0;for(let q=0;q<Q;q++)s+=counts[p*Q+q];for(let q=0;q<Q;q++)B[p*Q+q]=counts[p*Q+q]/s;}
 for(let i=0;i<500;i++){const next=new Float64Array(Q);for(let p=0;p<Q;p++)for(let q=0;q<Q;q++)next[q]+=pi[p]*B[p*Q+q];pi.set(next);}
 const F=new Uint8Array(K*Q),inv=new Uint8Array(Q);for(let a=1;a<Q;a++)for(let b=1;b<Q;b++)if(a*b%Q===1)inv[a]=b;
 for(let k=0;k<K;k++){const a=(k/Q|0)+1,b=k%Q;for(let d=0;d<Q;d++)F[k*Q+d]=(a*d+b)%Q;}
 let seed=opt.seed??0x241127;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;}
 const orig=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 if(orig.length!==N||corpus.pages.filter(p=>p.page<40).flatMap(p=>p.indices).length!==fit)throw Error("geometry");
 let C=orig,P=null,trueKey=null,repeatGoal=orig.slice(1).filter((x,i)=>x===orig[i]).length;
 if(!opt.original){P=gp(donor).slice(opt.offset??10000,(opt.offset??10000)+N);if(P.length!==N)throw Error("donor");
  // Sample a low-repeat key exactly conditional on total adjacent C equality count.
  const hist=Array.from({length:Q},()=>new Uint16Array(Q));for(let i=1;i<N;i++)hist[P[i-1]][P[i]]++;
  const dp=Array.from({length:Q+1},()=>new Float64Array(repeatGoal+1));dp[Q][0]=1;
  for(let p=Q-1;p>=0;p--)for(let s=0;s<=repeatGoal;s++)for(let b=0;b<Q;b++){const h=hist[p][b];if(h<=s)dp[p][s]+=dp[p+1][s-h];}
  if(!dp[0][repeatGoal])throw Error("no repeat-matched key");
  let remain=repeatGoal;trueKey=new Int16Array(Q);
  for(let p=0;p<Q;p++){let z=rnd()*dp[p][remain],b=0;for(;b<Q;b++){const h=hist[p][b];if(h>remain)continue;z-=dp[p+1][remain-h];if(z<0)break;}if(b===Q)throw Error("key draw");remain-=hist[p][b];trueKey[p]=(rnd()*28|0)*Q+b;}
  C=[rnd()*Q|0];for(let i=1;i<N;i++){const k=trueKey[P[i-1]],a=(k/Q|0)+1,b=k%Q;C.push(mod(C[i-1]+mod(P[i]-b)*inv[a]));}
  if(C.slice(1).filter((x,i)=>x===C[i]).length!==repeatGoal)throw Error("repeat mismatch");
 }
 const D=Uint8Array.from(C.slice(1),(x,i)=>mod(x-C[i]));
 const pairCount=new Float64Array(Q*Q);for(let i=1;i<fit-1;i++)pairCount[D[i-1]*Q+D[i]]++;
 const R=new Float64Array(T),M=new Float64Array(T),G=new Float64Array(T),w=new Float64Array(W);
 function init(){for(let p=0;p<Q;p++){let s=0;for(let k=0;k<K;k++){const x=.05+rnd();w[p*K+k]=x;s+=x;}for(let k=0;k<K;k++)w[p*K+k]/=s;}}
 function build(){R.fill(0);for(let p=0;p<Q;p++)for(let k=0;k<K;k++){const v=w[p*K+k],base=k*Q;for(let d=0;d<Q;d++)R[d*Q*Q+p*Q+F[base+d]]+=v;}for(let d=0;d<Q;d++)for(let j=0;j<Q*Q;j++)M[d*Q*Q+j]=R[d*Q*Q+j]*B[j];}
 function update(sharp=1,pseudo=.0005){for(let p=0;p<Q;p++){let s=0;for(let k=0;k<K;k++){let g=0;const base=k*Q;for(let d=0;d<Q;d++)g+=G[d*Q*Q+p*Q+F[base+d]];let v=w[p*K+k]*g+pseudo;if(sharp!==1)v=Math.pow(v,sharp);w[p*K+k]=v;s+=v;}for(let k=0;k<K;k++)w[p*K+k]/=s;}}
 const L=new Float64Array(Q*Q),right=new Float64Array(Q*Q),Z=new Float64Array(Q*Q),S1=new Float64Array(Q*Q),S2=new Float64Array(Q*Q);
 function pairEM(sharp){build();L.fill(0);right.fill(0);for(let d=0;d<Q;d++)for(let p=0;p<Q;p++)for(let q=0;q<Q;q++){const v=M[d*Q*Q+p*Q+q];L[d*Q+q]+=pi[p]*v;right[d*Q+p]+=v;}let ll=0;for(let d=0;d<Q;d++)for(let e=0;e<Q;e++){let j=0;for(let q=0;q<Q;q++)j+=L[d*Q+q]*right[e*Q+q];const c=pairCount[d*Q+e];Z[d*Q+e]=c/j;if(c)ll+=c*Math.log(j);}
  S1.fill(0);S2.fill(0);for(let d=0;d<Q;d++)for(let e=0;e<Q;e++){const z=Z[d*Q+e];if(z)for(let q=0;q<Q;q++){S1[d*Q+q]+=z*right[e*Q+q];S2[e*Q+q]+=z*L[d*Q+q];}}
  for(let d=0;d<Q;d++)for(let p=0;p<Q;p++)for(let q=0;q<Q;q++)G[d*Q*Q+p*Q+q]=B[p*Q+q]*(pi[p]*S1[d*Q+q]+S2[d*Q+p]);
  update(sharp);return ll/(fit-2);
 }
 const alpha=new Float64Array(fit*Q),scales=new Float64Array(fit-1),beta1=new Float64Array(Q),beta2=new Float64Array(Q),br=new Float64Array(Q);
 function sequenceEM(sharp){build();alpha.fill(0);alpha.set(pi);let ll=0;
  for(let i=0;i<fit-1;i++){const d=D[i]*Q*Q,u=i*Q,v=u+Q;for(let p=0;p<Q;p++){const a=alpha[u+p],j=d+p*Q;for(let q=0;q<Q;q++)alpha[v+q]+=a*M[j+q];}let s=0;for(let q=0;q<Q;q++)s+=alpha[v+q];if(!(s>0))throw Error("zero forward");scales[i]=s;ll+=Math.log(s);for(let q=0;q<Q;q++)alpha[v+q]/=s;}
  G.fill(0);let b=beta1,c=beta2;b.fill(1);
  for(let i=fit-2;i>=0;i--){const d=D[i]*Q*Q,u=i*Q;for(let q=0;q<Q;q++)br[q]=b[q]/scales[i];for(let p=0;p<Q;p++){const j=d+p*Q,h=p*Q,a=alpha[u+p];let s=0;for(let q=0;q<Q;q++){const t=br[q];s+=M[j+q]*t;G[j+q]+=a*B[h+q]*t;}c[p]=s;}const tmp=b;b=c;c=tmp;}
  update(sharp);return ll/(fit-1);
 }
 const logB=Float64Array.from(B,Math.log),logPi=Float64Array.from(pi,Math.log);
 function hard(){const key=new Int16Array(Q);for(let p=0;p<Q;p++){let best=0;for(let k=1;k<K;k++)if(w[p*K+k]>w[p*K+best])best=k;key[p]=best;}return key;}
 function decode(key){let best=-Infinity,p0=0;for(let s=0;s<Q;s++){let ll=logPi[s],p=s;for(let i=0;i<fit-1;i++){const q=F[key[p]*Q+D[i]];ll+=logB[p*Q+q];p=q;}if(ll>best){best=ll;p0=s;}}
  const plain=[p0];let held=0;for(let i=0;i<D.length;i++){const p=plain[i],q=F[key[p]*Q+D[i]];plain.push(q);if(i>=fit-1)held+=logB[p*Q+q];}
  const truthRows=trueKey?Array.from(key).filter((k,p)=>k===trueKey[p]).length:null,fitAccuracy=P?plain.slice(0,fit).filter((q,i)=>q===P[i]).length/fit:null,heldAccuracy=P?plain.slice(fit).filter((q,i)=>q===P[fit+i]).length/(N-fit):null;
  return {key:Array.from(key),p0,fit:best/fit,held:held/(N-fit),truthRows,fitAccuracy,heldAccuracy,head:plain.slice(0,100).map(x=>corpus.translit[x]).join(""),heldHead:plain.slice(fit,fit+100).map(x=>corpus.translit[x]).join(""),plain};
 }
 const start=Date.now(),trace=[],pairSteps=opt.pairSteps??100,seqSteps=opt.seqSteps??60,sharp=opt.sharp??1.03;
 init();let best=null;
 function evaluate(stage,i,ll){const a=decode(hard());if(!best||a.fit>best.fit)best={...a,stage,i,ll};trace.push({stage,i,ll,fit:a.fit,held:a.held,truthRows:a.truthRows,fitAccuracy:a.fitAccuracy,heldAccuracy:a.heldAccuracy});}
 for(let i=0;i<pairSteps;i++){const ll=pairEM(i<20?1:sharp);if(i%10===9||i===pairSteps-1)evaluate("pair",i+1,ll);}
 for(let i=0;i<seqSteps;i++){const ll=sequenceEM(i<10?1:sharp);if(i%5===4||i===seqSteps-1)evaluate("sequence",i+1,ll);}
 const final=decode(hard());
 return {schema:1,model:"D_i=C_i-C_(i-1), P_i=a[Pprev]*D_i+b[Pprev] mod29, independently arbitrary nonzero slope and intercept per prior plaintext, ordinary consuming continuous tape.",seed:opt.seed??0x241127,fit,N,trainRunes:tr.length,repeatGoal,controlOffset:opt.original?null:opt.offset??10000,trueKey:trueKey?Array.from(trueKey):null,trace,best,final,elapsedMs:Date.now()-start};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const args=JSON.parse(process.argv[2]||'{}');
console.log(JSON.stringify(experiment(JSON.parse(read(paths[0])),read(paths[1]),read(paths[args.donorIndex||2]),args),null,2));
