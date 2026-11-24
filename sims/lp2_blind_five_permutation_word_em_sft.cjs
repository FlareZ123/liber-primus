"use strict";
// Unknown five-permutation bank recovery using independent word likelihoods.
// Explicit 5% open-vocabulary iid-letter escape avoids false zero likelihoods.
// Prefix-only soft fit + hardening. Printed groups are hypothesized word cuts.
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function experiment(gp,solved,literary,wordfreq,transcript,which=0,config={starts:4,iters:35,discrete:true}){
 const Q=29,K=5,D=Q*Q,check=(v,m)=>{if(!v)throw Error(m)},idx=new Map(gp.runes.map((c,i)=>[c,i])),T=gp.translit;
 const tok=T.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const a=tok.find(t=>w.startsWith(t.s,i));check(a,"encode");out.push(a.i);i+=a.s.length}}return out}
 function wordList(s){return (s.match(/[A-Za-z]+/g)||[]).map(encode)}
 const native=solved.sections.map(s=>({name:s.name,w:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c)))}));
 function window(words,a,b){let pos=0,out=[];for(const w of words){let end=pos+w.length;if(pos>=a&&end<=b)out.push(w);pos=end;if(pos>=b)break}return out}
 const lit=literary.map((s,i)=>({name:["Gibran","Shakespeare","Emerson"][i],w:window(wordList(s),4000,44000)}));
 const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);let words=[],w=[],offset=0,start=0;
 for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c)){if(!w.length)start=offset;w.push(idx.get(c));offset++}else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push({start,w});w=[]}}if(w.length)words.push({start,w});
 check(words.length===2896&&JSON.stringify(words.flatMap(x=>x.w))===JSON.stringify(original),"original parse");
 const lo=gp.pages.filter(p=>p.page<8).reduce((n,p)=>n+p.indices.length,0)+12,hi=lo+1717;
 const origWords=words.filter(x=>x.start>=lo&&x.start+x.w.length<=hi).map(x=>x.w);
 const hold=true,plantMode=which<3,donor=plantMode?lit[which]:null;
 const sum=a=>a.reduce((x,y)=>x+y,0);
 function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/2**32}}
 function perm(r){let a=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function bank(r){const M=new Float64Array(D);for(let k=0;k<K;k++){const a=perm(r);for(let p=0;p<Q;p++)M[p*Q+a[p]]+=1/K}return M}
 function validate(M,integer=false){for(let p=0;p<Q;p++){let a=0,b=0;for(let c=0;c<Q;c++){a+=M[p*Q+c];b+=M[c*Q+p];if(integer)check(Math.abs(K*M[p*Q+c]-Math.round(K*M[p*Q+c]))<1e-7,"integer")}check(Math.abs(a-1)<1e-5&&Math.abs(b-1)<1e-5,"transport")}}
 function sample(P,M,r){const C=[];function draw(p){let u=r();for(let c=0;c<Q;c++){u-=M[p*Q+c];if(u<0)return c}return Q-1}for(let i=0;i<P.length;i++){let p=P[i],c=p===0&&hold?0:draw(p);if(!(p===0&&hold)&&i&&c===C[i-1])c=draw(p);C.push(c)}return C}
 const pw=plantMode?window(donor.w,27000,28717):null,P=pw?.flat()??null,truth=plantMode?bank(rng(0x7a79101+which)):null;
 const C=plantMode?sample(P,truth,rng(0x7a79201+which)):origWords.flat(),cw=[];let pos=0;
 for(const w of (pw??origWords)){cw.push({start:pos,c:C.slice(pos,pos+w.length)});pos+=w.length}
 const cut=cw.filter(w=>w.start+w.c.length<=1024).at(-1).start+cw.filter(w=>w.start+w.c.length<=1024).at(-1).c.length,wn=cw.filter(w=>w.start<cut).length;
 const lex=new Map(),u=new Float64Array(Q).fill(.5);
 function add(w,f){if(!w.length)return;let key=w.join(","),v=lex.get(key);if(!v)lex.set(key,v={w,f:0});v.f+=f}
 for(const line of wordfreq.split(/\r?\n/)){let a=line.match(/^([A-Za-z]+)\s+(\d+)$/);if(a)add(encode(a[1]),Number(a[2])*.05)}
 for(const s of [...native,...lit])if(s!==donor)for(const w of s.w){add(w,s.name.startsWith("0_")?4:1);for(const p of w)u[p]++}
 let total=sum(u);for(let p=0;p<Q;p++)u[p]/=total;const lists=new Map();
 for(const {w,f} of lex.values()){let d=lists.get(w.length);if(!d)lists.set(w.length,d=[]);d.push({w,f:f+.1})}
 for(const [l,a] of lists){let z=a.reduce((s,v)=>s+v.f,0);for(const v of a)v.f/=z}
 const OOV=.05,escapes=plantMode?pw.filter(w=>!lex.has(w.join(","))).length:null;
 function emission(M,p,c,v){if(p===0)return c===0?1:0;let a=M[p*Q+c];return v<0?a:c===v?a*a:a*(1+M[p*Q+v])}
 // Exact conditional likelihood of each independent dictionary word,
 // mixed with a fixed-probability iid rune escape, given length and
 // observed previous ciphertext. Full lexical posterior + escape marginals.
 function filter(M,n,wantCounts=false,wantPath=false){
  let A=wantCounts?new Float64Array(D).fill(.08):null,ll=0,prefix=0,path=wantPath?[]:null,dictMAP=0;
  for(let wi=0;wi<n;wi++){let g=cw[wi],l=g.c.length,E=new Float64Array(l*Q),U=new Float64Array(l),oov=1,open=[],openP=1;
   for(let j=0;j<l;j++){let c=g.c[j],v=g.start+j?C[g.start+j-1]:-1,z=0,max=-1,mp=0;for(let p=0;p<Q;p++){let e=emission(M,p,c,v);E[j*Q+p]=e;let a=u[p]*e;z+=a;if(a>max){max=a;mp=p}}U[j]=z;oov*=z;open.push(mp);openP*=max}
   const a=lists.get(l)??[],ep=a.length?OOV:1,wp=new Float64Array(a.length);let z=ep*oov,best=ep*openP,bw=open,isDict=false;
   for(let k=0;k<a.length;k++){let x=(1-ep)*a[k].f;const w=a[k].w;for(let j=0;j<l;j++){x*=E[j*Q+w[j]];if(!x)break}wp[k]=x;z+=x;if(x>best){best=x;bw=w;isDict=true}}
   if(!(z>0))return {ll:-Infinity,prefix:wi>=wn?prefix:-Infinity,firstImpossible:g.start};
   ll+=Math.log(z);if(wi+1===wn)prefix=ll;if(path){path.push(...bw);dictMAP+=isDict}
   if(A){function acc(p,j,h){if(!p||!h)return;let c=g.c[j],v=g.start+j?C[g.start+j-1]:-1;A[p*Q+c]+=h*(c===v?2:1);if(v>=0&&v!==c){let a=M[p*Q+v];A[p*Q+v]+=h*a/(1+a)}}
    let h=ep*oov/z;if(h)for(let j=0;j<l;j++)if(U[j])for(let p=1;p<Q;p++)acc(p,j,h*u[p]*E[j*Q+p]/U[j]);
    for(let k=0;k<a.length;k++)if(wp[k]){let h=wp[k]/z,w=a[k].w;for(let j=0;j<l;j++)acc(w[j],j,h)}
   }
  }
  return {ll,prefix,A,path,dictMAP}
 }
 function balance(A){let M=Float64Array.from(A),err=1;for(let it=0;it<500&&err>1e-8;it++){for(let p=0;p<Q;p++){let s=0;for(let c=0;c<Q;c++)s+=M[p*Q+c];for(let c=0;c<Q;c++)M[p*Q+c]/=s}for(let c=0;c<Q;c++){let s=0;for(let p=0;p<Q;p++)s+=M[p*Q+c];for(let p=0;p<Q;p++)M[p*Q+c]/=s}err=0;for(let p=0;p<Q;p++){let s=0;for(let c=0;c<Q;c++)s+=M[p*Q+c];err=Math.max(err,Math.abs(s-1))}}validate(M);return M}
 function penalized(M,ll){let s=ll;for(const a of M)s+=.08*Math.log(a);return s}
 // Exact max-weight perfect matching for each of five greedy layers.
 // Every resulting integer matrix has five permutation factors by construction.
 function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);for(let i=1;i<=Q;i++){p[0]=i;let j0=0,min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);do{used[j0]=1;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){let a=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(a<min[j]){min[j]=a;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=Q;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}let a=new Int32Array(Q);for(let j=1;j<=Q;j++)a[p[j]-1]=j-1;return a}
 function harden(M){let H=new Float64Array(D);for(let k=0;k<K;k++){let cost=Float64Array.from(M,(x,i)=>2*K*(H[i]-x)+1);let a=assignment(cost);for(let p=0;p<Q;p++)H[p*Q+a[p]]+=1/K}validate(H,true);return H}


 // Exact integer M step for a smoothed bank. Min-cost flow of five units
 // per row and column with convex separable costs -A*log(eps/Q+(1-eps)*h/5).
 // Successive shortest augmenting paths include reverse marginal arcs.
 function flow(A,eps){
  const V=2*Q+2,S=2*Q,T=S+1,H=new Uint8Array(D),rs=new Uint8Array(Q),cs=new Uint8Array(Q),a=(1-eps)/K,b=eps/Q;
  const cost=Array.from({length:K},(_,k)=>Float64Array.from(A,v=>-v*Math.log((b+a*(k+1))/(b+a*k))));
  let obj=0;
  for(let unit=0;unit<Q*K;unit++){
   const d=new Float64Array(V).fill(Infinity),prev=new Int16Array(V).fill(-1),inq=new Uint8Array(V),queue=[S];d[S]=0;inq[S]=1;
   function relax(u,v,w){let t=d[u]+w;if(t<d[v]-1e-10){d[v]=t;prev[v]=u;if(!inq[v]){inq[v]=1;queue.push(v)}}}
   for(let j=0;j<queue.length;j++){check(j<100000,"negative cycle");let u=queue[j];inq[u]=0;
    if(u===S){for(let p=0;p<Q;p++)if(rs[p]<K)relax(S,p,0)}
    else if(u<Q){for(let c=0;c<Q;c++){let k=H[u*Q+c];if(k<K)relax(u,Q+c,cost[k][u*Q+c])}}
    else if(u<S){let c=u-Q;if(cs[c]<K)relax(u,T,0);for(let p=0;p<Q;p++){let k=H[p*Q+c];if(k)relax(u,p,-cost[k-1][p*Q+c])}}
   }
   check(Number.isFinite(d[T]),"flow path");obj+=d[T];let v=T,steps=0;
   while(v!==S){check(++steps<=V,"flow predecessor");let u=prev[v];check(u>=0,"predecessor");if(v===T)cs[u-Q]++;else if(u===S)rs[v]++;else if(u<Q&&v>=Q)H[u*Q+v-Q]++;else if(u>=Q&&v<Q)H[v*Q+u-Q]--;else throw Error("arc");v=u}
  }
  let direct=0;for(let j=0;j<D;j++)for(let k=0;k<H[j];k++)direct+=cost[k][j];check(Math.abs(direct-obj)<1e-5,"flow objective");
  const M=Float64Array.from(H,v=>v/K);validate(M,true);return M;
 }
 function smooth(H,eps){return Float64Array.from(H,x=>(1-eps)*x+eps/Q)}
 function discreteRefine(H,wn,steps=8){
  let history=[],best=H,bestLL=filter(H,wn).ll;
  for(const eps of [.10,.03,.01]){
   let M=smooth(H,eps),old=penalized(M,filter(M,wn).ll);
   for(let it=0;it<steps;it++){
    let counts=filter(M,wn,true).A,N=flow(counts,eps),X=smooth(N,eps),ll=filter(X,wn).ll,val=penalized(X,ll);
    check(val>=old-1e-6,"discrete EM decreases");
    const exact=filter(N,wn).ll;if(exact>bestLL){bestLL=exact;best=N}
    history.push({eps,it,smoothedTrainLLR:(ll+cut*Math.log(Q))/cut,exactTrainLLR:Number.isFinite(exact)?(exact+cut*Math.log(Q))/cut:null});
    if(val<old+1e-8)break;H=N;M=X;old=val
   }
  }
  return {H:best,history};
 }

 function report(M){let f=filter(M,cw.length,false,true),a=filter(M,wn);return {prefixLLR:(a.ll+cut*Math.log(Q))/cut,heldoutLLR:Number.isFinite(f.ll)?(f.ll-f.prefix+(C.length-cut)*Math.log(Q))/(C.length-cut):null,firstImpossible:f.firstImpossible??null,map:f.path?f.path.map(p=>T[p]).join("").slice(0,300):null,mapCorrect:P&&f.path?f.path.reduce((s,p,i)=>s+(p===P[i]),0):null,heldoutCorrect:P&&f.path?f.path.slice(cut).reduce((s,p,i)=>s+(p===P[cut+i]),0):null,overlap:truth?M.reduce((s,a,i)=>s+(Math.floor(i/Q)>0?Math.min(a,truth[i]):0),0)/(Q-1):null,dictMAP:f.dictMAP}}
 const starts=[];let selected=null,best=-Infinity;for(let s=0;s<config.starts;s++){let r=rng(0x7a79401+11*which+s),M=Float64Array.from(bank(r),v=>.7*v+.3/Q),ll=filter(M,wn).ll,steps=0;
  for(let it=0;it<config.iters;it++){let old=penalized(M,ll),a=filter(M,wn,true),next=balance(a.A),accept=false;for(let k=0;k<12;k++){let t=2**(-k),X=Float64Array.from(M,(v,i)=>v+t*(next[i]-v)),f=filter(X,wn);if(penalized(X,f.ll)>old+1e-7){M=X;ll=f.ll;steps++;accept=true;break}}if(!accept)break}
  validate(M);let H=harden(M),h=filter(H,wn);const before=h.ll;let refinement=null;if(config.discrete){let rr=discreteRefine(H,wn);H=rr.H;refinement=rr.history;h=filter(H,wn)}starts.push({s,steps,beforeRefinement:Number.isFinite(before)?(before+cut*Math.log(Q))/cut:null,refinement,softTrainLLR:(ll+cut*Math.log(Q))/cut,hardTrainLLR:Number.isFinite(h.ll)?(h.ll+cut*Math.log(Q))/cut:null,firstImpossible:h.firstImpossible??null});
  if(h.ll>best){best=h.ll;selected=H}
 }
 return {case:which,source:donor?.name??"original",cut,n:C.length,words:cw.length,fitWords:wn,lexicon:lex.size,oovPlantWords:escapes,starts,truth:truth?report(truth):null,selected:selected?report(selected):null,selectedMatrix:selected?Array.from(selected,x=>Math.round(K*x)):null}
}
if(require.main===module){const d=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),JSON.parse(d[1]),d.slice(2,5),d[5],d[6],Number(process.argv[2]??0)),null,2))}
module.exports={experiment,files};
