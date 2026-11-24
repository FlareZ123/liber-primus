"use strict";
// Ciphertext-only recovery of an unknown bank of five permutations.
// A soft bigram-HMM fit with one-redraw emissions, followed by feasible
// integer hardening and prefix-only selection. No plaintext word separators.
// Usage: node sims/lp2_blind_five_permutation_em_sft.cjs 0
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(gp,solved,literary,which=0,config={starts:4,iters:35}){
 const Q=29,K=5,D=Q*Q,check=(v,m)=>{if(!v)throw Error(m)},idx=new Map(gp.runes.map((c,i)=>[c,i])),T=gp.translit;
 const tok=T.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){let out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g," ").split(/ +/)){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const a=tok.find(t=>w.startsWith(t.s,i));check(a,"encode");out.push(a.i);i+=a.s.length}}}return out}
 const native=solved.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c))}));
 const lit=literary.map((s,i)=>({name:["Gibran","Shakespeare","Emerson"][i],p:encode(s).slice(4000,44000)}));
 const original=gp.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices).slice(12);check(original.length===1717,"original");
 const hold=true;const plantMode=which<3,donor=plantMode?lit[which]:null;
 const sum=a=>a.reduce((x,y)=>x+y,0);
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/2**32}}
 function perm(r){let a=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function bank(r){const M=new Float64Array(D);for(let k=0;k<K;k++){const a=perm(r);for(let p=0;p<Q;p++)M[p*Q+a[p]]+=1/K}return M}
 function validate(M,integer=false){for(let p=0;p<Q;p++){let a=0,b=0;for(let c=0;c<Q;c++){a+=M[p*Q+c];b+=M[c*Q+p];if(integer)check(Math.abs(K*M[p*Q+c]-Math.round(K*M[p*Q+c]))<1e-7,"integer")}check(Math.abs(a-1)<1e-5&&Math.abs(b-1)<1e-5,"transport")}}
 function sample(P,M,r){const C=[];function draw(p){let u=r();for(let c=0;c<Q;c++){u-=M[p*Q+c];if(u<0)return c}return Q-1}for(let i=0;i<P.length;i++){let p=P[i],c=p===0&&hold?0:draw(p);if(!(p===0&&hold)&&i&&c===C[i-1])c=draw(p);C.push(c)}return C}
 function language(){let u=new Float64Array(Q).fill(.5),b=new Float64Array(D);for(const s of [...native,...lit]){if(s===donor)continue;for(let i=0;i<s.p.length;i++){let p=s.p[i];u[p]++;if(i)b[s.p[i-1]*Q+p]++}}let z=sum(u);for(let p=0;p<Q;p++)u[p]/=z;for(let p=0;p<Q;p++){let z=20;for(let c=0;c<Q;c++)z+=b[p*Q+c];for(let c=0;c<Q;c++)b[p*Q+c]=(b[p*Q+c]+20*u[c])/z}return {u,b}}
 const L=language(),P=plantMode?donor.p.slice(27000,28717):null,truth=plantMode?bank(rng(0x7a79101+which)):null,C=plantMode?sample(P,truth,rng(0x7a79201+which)):original,cut=1024;
 function emission(M,p,c,v){if(hold&&p===0)return c===0?1:0;let a=M[p*Q+c];return v<0?a:c===v?a*a:a*(1+M[p*Q+v])}
 // Exact normalized forward-backward for the bigram model, including the
 // observed previous-ciphertext conditioning. Expected attempted draws include
 // both draws when a repeat survives, and the posterior redraw probability otherwise.
 function filter(M,n,wantCounts=false,wantPath=false){
  const e=new Float64Array(n*Q),f=new Float64Array(n*Q),scale=new Float64Array(n),z0=L.u;
  let ll=0,prefix=0;for(let i=0;i<n;i++){let c=C[i],v=i?C[i-1]:-1,off=i*Q,z=0;for(let p=0;p<Q;p++){let a=emission(M,p,c,v);e[off+p]=a;if(!a)continue;let s=i?0:z0[p];if(i)for(let q=0;q<Q;q++)s+=f[off-Q+q]*L.b[q*Q+p];f[off+p]=s*a;z+=s*a}if(!(z>0))return {ll:-Infinity,prefix:i>=cut?prefix:-Infinity,firstImpossible:i};scale[i]=z;ll+=Math.log(z);if(i+1===cut)prefix=ll;for(let p=0;p<Q;p++)f[off+p]/=z}
  let A=null;if(wantCounts){A=new Float64Array(D).fill(.08);let b=new Float64Array(Q).fill(1),bb=new Float64Array(Q);
   for(let i=n-1;i>=0;i--){let off=i*Q,c=C[i],v=i?C[i-1]:-1;for(let p=0;p<Q;p++){let h=f[off+p]*b[p];if(!h||(hold&&p===0))continue;A[p*Q+c]+=h*(c===v?2:1);if(v>=0&&v!==c){let a=M[p*Q+v];A[p*Q+v]+=h*a/(1+a)}}
    if(i){for(let q=0;q<Q;q++){let s=0;for(let p=0;p<Q;p++)s+=L.b[q*Q+p]*e[off+p]*b[p];bb[q]=s/scale[i]}[b,bb]=[bb,b]}
   }
  }
  let path=null;if(wantPath){let v=new Float64Array(Q),nv=new Float64Array(Q),back=new Uint8Array(n*Q);for(let p=0;p<Q;p++)v[p]=Math.log(L.u[p]*e[p]);for(let i=1;i<n;i++){for(let p=0;p<Q;p++){let best=-Infinity,b=0;for(let q=0;q<Q;q++){let t=v[q]+Math.log(L.b[q*Q+p]);if(t>best){best=t;b=q}}nv[p]=best+Math.log(e[i*Q+p]);back[i*Q+p]=b}[v,nv]=[nv,v]}let j=v.indexOf(Math.max(...v));path=Array(n);for(let i=n-1;i>=0;i--){path[i]=j;j=back[i*Q+j]}check(path.every((p,i)=>emission(M,p,C[i],i?C[i-1]:-1)>0),"path")}
  return {ll,prefix,A,path}
 }
 // Sinkhorn is a feasible approximate M-step, not an exact maximum of Q.
 // Mixing and backtracking keep penalized soft training likelihood nondecreasing.
 function balance(A){let M=Float64Array.from(A),err=1;for(let it=0;it<500&&err>1e-8;it++){for(let p=0;p<Q;p++){let s=0;for(let c=0;c<Q;c++)s+=M[p*Q+c];for(let c=0;c<Q;c++)M[p*Q+c]/=s}for(let c=0;c<Q;c++){let s=0;for(let p=0;p<Q;p++)s+=M[p*Q+c];for(let p=0;p<Q;p++)M[p*Q+c]/=s}err=0;for(let p=0;p<Q;p++){let s=0;for(let c=0;c<Q;c++)s+=M[p*Q+c];err=Math.max(err,Math.abs(s-1))}}validate(M);return M}
 function penalized(M,ll){let s=ll;for(const a of M)s+=.08*Math.log(a);return s}
 // Exact max-weight perfect matching for each of five greedy layers.
 // Every resulting integer matrix has five permutation factors by construction.
 function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);for(let i=1;i<=Q;i++){p[0]=i;let j0=0,min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);do{used[j0]=1;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){let a=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(a<min[j]){min[j]=a;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=Q;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}let a=new Int32Array(Q);for(let j=1;j<=Q;j++)a[p[j]-1]=j-1;return a}
 function harden(M){let H=new Float64Array(D);for(let k=0;k<K;k++){let cost=Float64Array.from(M,(x,i)=>2*K*(H[i]-x)+1);let a=assignment(cost);for(let p=0;p<Q;p++)H[p*Q+a[p]]+=1/K}validate(H,true);return H}
 function report(M){let f=filter(M,C.length,false,true),a=filter(M,cut);return {prefixLLR:(a.ll+cut*Math.log(Q))/cut,heldoutLLR:Number.isFinite(f.ll)?(f.ll-f.prefix+(C.length-cut)*Math.log(Q))/(C.length-cut):null,firstImpossible:f.firstImpossible??null,map:f.path?f.path.map(p=>T[p]).join("").slice(0,300):null,mapCorrect:P&&f.path?f.path.reduce((s,p,i)=>s+(p===P[i]),0):null,heldoutCorrect:P&&f.path?f.path.slice(cut).reduce((s,p,i)=>s+(p===P[cut+i]),0):null,overlap:truth?M.reduce((s,a,i)=>s+(Math.floor(i/Q)>0?Math.min(a,truth[i]):0),0)/(Q-1):null}}
 const starts=[];let selected=null,best=-Infinity;for(let s=0;s<config.starts;s++){let r=rng(0x7a79301+11*which+s),M=Float64Array.from(bank(r),v=>.7*v+.3/Q),ll=filter(M,cut).ll,steps=0;
  for(let it=0;it<config.iters;it++){let old=penalized(M,ll),a=filter(M,cut,true),next=balance(a.A),accept=false;for(let k=0;k<12;k++){let t=2**(-k),X=Float64Array.from(M,(v,i)=>v+t*(next[i]-v)),f=filter(X,cut);if(penalized(X,f.ll)>old+1e-7){M=X;ll=f.ll;steps++;accept=true;break}}if(!accept)break}
  validate(M);let H=harden(M),h=filter(H,cut);starts.push({s,steps,softTrainLLR:(ll+cut*Math.log(Q))/cut,hardTrainLLR:Number.isFinite(h.ll)?(h.ll+cut*Math.log(Q))/cut:null,firstImpossible:h.firstImpossible??null});
  // A soft-trained solution can be diagnostic even if every hardening fails.
  if(h.ll>best){best=h.ll;selected=H}
 }
 return {case:which,source:donor?.name??"original",cut,n:C.length,starts,truth:truth?report(truth):null,selected:selected?report(selected):null,selectedMatrix:selected?Array.from(selected,x=>Math.round(K*x)):null}
}
if(require.main===module){const d=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),JSON.parse(d[1]),d.slice(2),Number(process.argv[2]??0)),null,2))}
module.exports={experiment,files};
