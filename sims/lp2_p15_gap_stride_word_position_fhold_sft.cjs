'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(data, request = null) {
  const [rawCorpus,rawText,rawNative,lp1,emerson,shakespeare,gibran]=data;
  const c=JSON.parse(rawCorpus),native=JSON.parse(rawNative),Q=29,id=Array.from({length:Q},(_,i)=>i),m=x=>(x%Q+Q)%Q;
  const assert=(x,msg)=>{if(!x)throw Error(msg)};
  const rune=new Map(c.runes.map((v,i)=>[v,i])),tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const extract=s=>[...s].filter(x=>rune.has(x)).map(x=>rune.get(x));
  function word(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)return null;out.push(t.i);i+=t.s.length}}return out}
  const words=s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).map(word).filter(x=>x?.length);
  const original=rawText.split("%").slice(0,55).join("%").replace(/[/\s%]/g,"").split(/[^\u16a0-\u16ff]+/g).filter(Boolean).map(extract);
  assert(original.length===2896&&original.flat().join()===c.pages.slice(0,56).flatMap(p=>p.indices).join(),"canonical parse");
  const ss=native.sections.slice(0,7).map(s=>extract(s.source_text));
  const tape=ss.map((s,i)=>i===3?extract(lp1.split("%").slice(4,8).join("")).map(x=>m(31-x)):s).flat();
  assert(tape.length===2797,"LP1 tape length");
  const train=words(emerson),freq=new Float64Array(Q).fill(.5),LM=new Float64Array(Q*Q).fill(.5),first=new Float64Array(Q).fill(.5),last=new Float64Array(Q).fill(.5);
  for(const w of train){first[w[0]]++;last[w.at(-1)]++;for(let i=0;i<w.length;i++){freq[w[i]]++;if(i)LM[w[i-1]*Q+w[i]]++}}
  const norm=(a,log)=>{const z=a.reduce((s,x)=>s+x,0);for(let i=0;i<a.length;i++)a[i]=log?Math.log(a[i]/z):a[i]/z};
  norm(freq,false);norm(first,true);norm(last,true);for(let i=0;i<Q;i++)norm(LM.subarray(i*Q,(i+1)*Q),true);
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function perm(rand,fix0){const a=id.slice(),lo=fix0?1:0;for(let i=Q-1;i>lo;i--){const j=lo+Math.floor(rand()*(i-lo+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function inv(a){const b=new Int8Array(Q);for(let i=0;i<Q;i++)b[a[i]]=i;return b}
  function assignment(cost){const u=new Float64Array(Q+1),v=new Float64Array(Q+1),p=new Int32Array(Q+1),way=new Int32Array(Q+1);for(let i=1;i<=Q;i++){p[0]=i;let j0=0;const min=new Float64Array(Q+1).fill(Infinity),used=new Uint8Array(Q+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=Q;j++)if(!used[j]){const z=cost[(i0-1)*Q+j-1]-u[i0]-v[j];if(z<min[j]){min[j]=z;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=Q;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}const out=new Int8Array(Q);for(let j=1;j<=Q;j++)out[p[j]-1]=j-1;return out}
  function encrypt(P,K,A,B){const I=inv(B);let j=0;return P.map(p=>p===0?0:I[m(A[p]+K[j++])])}
  function setup(C,K){const n=C.length,lim=[0];for(const x of C)lim.push(lim.at(-1)+(x===0));const H=lim[n]+1,sh=new Uint8Array(n*H);for(let i=0;i<n;i++)for(let h=0;h<=lim[i];h++)sh[i*H+h]=K[i-h];return {C,K,n,lim,H,sh}}
  function pool(rows,emit){const G=new Float64Array(Q*Q);let ll=0;
    for(const {C,n,H,lim,sh} of rows){const F=new Float64Array((n+1)*H);F[0]=1;for(let i=0;i<n;i++){const a=i*H,b=a+H,c=C[i];for(let h=0;h<=lim[i];h++){const w=F[a+h];F[b+h]+=w*emit[c*Q+sh[a+h]];if(c===0)F[b+h+1]+=w*freq[0]}}let z=0;for(let h=0;h<H;h++)z+=F[n*H+h];if(!(z>0))return {ll:-Infinity};ll+=Math.log(z);
      let B=new Float64Array(H).fill(1),N=new Float64Array(H);for(let i=n-1;i>=0;i--){const a=i*H,c=C[i];for(let h=0;h<=lim[i];h++){const k=sh[a+h],x=emit[c*Q+k]*B[h];G[c*Q+k]+=F[a+h]*x/z;N[h]=x+(c===0?freq[0]*B[h+1]:0)}[B,N]=[N,B]}}
    return {ll,G}}
  function estimate(G,s=.5){const out=new Float64Array(Q*Q);for(let k=0;k<Q;k++){let z=s*Q;for(let c=0;c<Q;c++)z+=G[c*Q+k];for(let c=0;c<Q;c++)out[c*Q+k]=(1-freq[0])*(G[c*Q+k]+s)/z}return out}
  function mass(G,B){const p=new Float64Array(Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)p[m(B[c]-k)]+=G[c*Q+k];return p}
  function inner(G,B){const p=mass(G,B),A=new Int8Array(Q),labels=id.slice(1).sort((a,b)=>freq[a]-freq[b]),r=id.slice(1).sort((a,b)=>p[a]-p[b]);for(let i=0;i<28;i++)A[labels[i]]=r[i];return A}
  function structured(A,B,eps){const I=inv(A),M=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const r=m(B[c]-k);M[c*Q+k]=freq[I[r]]*(r===0?eps:1)}return M}
  function mstep(A,G,eps){const log=Float64Array.from(inv(A),p=>Math.log(freq[p]));log[0]+=Math.log(eps);const cost=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let z=0;for(let k=0;k<Q;k++)z+=G[c*Q+k]*log[m(v-k)];cost[c*Q+v]=-z}const B=assignment(cost);return [inner(G,B),B]}
  function seedBetas(G,M){const out=[assignment(M)],waves=[];for(let f=1;f<=14;f++){const re=new Float64Array(Q),im=new Float64Array(Q);let strength=0;for(let c=0;c<Q;c++){for(let k=0;k<Q;k++){const t=2*Math.PI*f*k/Q;re[c]+=M[c*Q+k]*Math.cos(t);im[c]-=M[c*Q+k]*Math.sin(t)}strength+=Math.hypot(re[c],im[c])}waves.push({f,re,im,strength})}
    waves.sort((a,b)=>b.strength-a.strength);for(const w of waves.slice(0,5)){let best=null;for(let ph=0;ph<7;ph++){const cost=new Float64Array(Q*Q),base=ph*2*Math.PI/(7*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){const t=2*Math.PI*w.f*v/Q+base;cost[c*Q+v]=-(w.re[c]*Math.cos(t)-w.im[c]*Math.sin(t))}const B=assignment(cost),score=B.reduce((s,v,c)=>s-cost[c*Q+v],0);if(!best||score>best.score)best={B,score}}
      let B=best.B;for(let i=0;i<12;i++){const log=Array.from(mass(G,B),x=>Math.log(x+.5)),cost=new Float64Array(Q*Q);for(let c=0;c<Q;c++)for(let v=0;v<Q;v++){let z=0;for(let k=0;k<Q;k++)z+=G[c*Q+k]*log[m(v-k)];cost[c*Q+v]=-z}const b=assignment(cost);if(b.every((x,j)=>x===B[j]))break;B=b}const p=mass(G,B),r=id.slice().sort((a,b)=>p[a]-p[b]);for(let j=0;j<2;j++)out.push(Int8Array.from(B,x=>m(x-r[j])))}
    return [...new Map(out.map(x=>[x.join(),x])).values()]}
  function decode(row,A,B,unigram=false){const I=inv(A),{C,K}=row;let states=[{h:0,p:[],s:0}];for(let i=0;i<C.length;i++){const next=new Map();for(const st of states){function add(p,h){const score=st.s+(unigram?Math.log(freq[p]):(i?LM[st.p.at(-1)*Q+p]:first[p]));const k=h*Q+p;if(!next.has(k)||score>next.get(k).s)next.set(k,{h,p:st.p.concat(p),s:score})}if(C[i]===0)add(0,st.h+1);const p=I[m(B[C[i]]-K[i-st.h])];if(p!==0)add(p,st.h)}states=[...next.values()];if(!states.length)return null}for(const s of states)if(!unigram)s.s+=last[s.p.at(-1)];return states.sort((a,b)=>b.s-a.s)[0]}
  function refine(A,decoded,rand){const M=new Int32Array(Q*Q),S=new Int32Array(Q),E=new Int32Array(Q);for(const d of decoded){const w=d.p.map(p=>A[p]);S[w[0]]++;E[w.at(-1)]++;for(let i=1;i<w.length;i++)M[w[i-1]*Q+w[i]]++}
    function objective(I){let z=0;for(let a=0;a<Q;a++){z+=S[a]*first[I[a]]+E[a]*last[I[a]];for(let b=0;b<Q;b++)z+=M[a*Q+b]*LM[I[a]*Q+I[b]]}return z}
    let bestI=Array.from(inv(A)),best=objective(bestI);
    for(let r=0;r<12;r++){const I=r===0?bestI.slice():Array.from(inv(perm(rand,true)));let score=objective(I);for(let t=0;t<4000;t++){const a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;const x=I[a],y=I[b];let d=(S[a]-S[b])*(first[y]-first[x])+(E[a]-E[b])*(last[y]-last[x]);for(let j=0;j<Q;j++)if(j!==a&&j!==b){const z=I[j];d+=M[a*Q+j]*(LM[y*Q+z]-LM[x*Q+z])+M[b*Q+j]*(LM[x*Q+z]-LM[y*Q+z])+M[j*Q+a]*(LM[z*Q+y]-LM[z*Q+x])+M[j*Q+b]*(LM[z*Q+x]-LM[z*Q+y])}d+=(M[a*Q+a]-M[b*Q+b])*(LM[y*Q+y]-LM[x*Q+x])+(M[a*Q+b]-M[b*Q+a])*(LM[y*Q+x]-LM[x*Q+y]);const temp=5*Math.pow(.02,t/3999);if(d>=0||rand()<Math.exp(d/temp)){[I[a],I[b]]=[I[b],I[a]];score+=d;if(score>best){best=score;bestI=I.slice()}}}}
    return Array.from(inv(bestI))}
  function recover(rows,cut,seed){const fit=rows.slice(0,cut),rand=rng(seed),G0=new Float64Array(Q*Q);for(const {C,K} of fit)for(let j=0;j<C.length&&C[j]!==0;j++)G0[C[j]*Q+K[j]]++;
    let M=estimate(G0,2),G=G0;for(let it=0;it<15;it++){const x=pool(fit,M);assert(x.G,"relaxed EM");G=x.G;M=estimate(G,.6)}
    const seeds=seedBetas(G,M),legal=[];for(let B of seeds){let A=inner(G,B);for(let t=0;t<24;t++){const eps=10**(-Math.min(8,1+Math.floor(t/3))),x=pool(fit,structured(A,B,eps));if(!x.G)break;[A,B]=mstep(A,x.G,eps)}const x=pool(fit,structured(A,B,0));if(x.G)legal.push({A:Array.from(A),B:Array.from(B),ll:x.ll})}
    legal.sort((a,b)=>b.ll-a.ll);const uniq=[...new Map(legal.map(x=>[x.A.join()+":"+x.B.join(),x])).values()].sort((a,b)=>b.ll-a.ll).slice(0,4);let best=null;
    for(const z of uniq){let A=z.A,B=z.B,D=fit.map(row=>decode(row,A,B,true));if(D.some(x=>!x))continue;A=refine(A,D,rand);D=fit.map(row=>decode(row,A,B));if(D.some(x=>!x))continue;let score=D.reduce((s,x)=>s+x.s,0);for(let it=0;it<2;it++){const a=refine(A,D,rand),d=fit.map(row=>decode(row,a,B));if(d.some(x=>!x))break;const q=d.reduce((s,x)=>s+x.s,0);if(q<=score)break;A=a;D=d;score=q}if(!best||score>best.score)best={A,B,score}}
    return {seeds:seeds.length,legal:legal.length,best}}

  // Continuous consuming clock, with word-position-conditioned plaintext emissions.
  const startOffset=c.pages.slice(0,15).reduce((s,p)=>s+p.indices.length,0)+20,endOffset=c.pages.slice(0,23).reduce((s,p)=>s+p.indices.length,0);
  let off=0;const groupRows=original.map(P=>{const from=off;off+=P.length;return {P,from,to:off}});
  const originalWords=request?request.CWords:groupRows.filter(w=>w.from>=startOffset&&w.to<=endOffset).map(w=>w.P);
  assert(Array.isArray(originalWords)&&originalWords.length>=2&&originalWords.every(w=>Array.isArray(w)&&w.length>0&&w.every(v=>Number.isInteger(v)&&v>=0&&v<Q)),"nonempty GP29 ciphertext words");
  const originalC=originalWords.flat();
  if(!request)assert(originalC.length===1883&&originalC.join()===c.pages.slice(15,23).flatMap((p,i)=>i?p.indices:p.indices.slice(20)).join(),"p15 body shape");
  const lens=originalWords.map(w=>w.length),N=originalC.length,E=15;
  function cls(n,i){if(n<=4)return n*(n-1)/2+i;return i===0?10:i===1?11:i===n-2?13:i===n-1?14:12}
  const classes=lens.flatMap(n=>Array.from({length:n},(_,i)=>cls(n,i)));
  const isStart=lens.flatMap(n=>Array.from({length:n},(_,i)=>i===0));
  const isEnd=lens.flatMap(n=>Array.from({length:n},(_,i)=>i===n-1));
  const counts=Array.from({length:E},()=>new Float64Array(Q));for(const w of train)for(let i=0;i<w.length;i++)counts[cls(w.length,i)][w[i]]++;
  const Freq=counts.map(row=>{const sum=row.reduce((a,b)=>a+b);return Float64Array.from(row,(x,p)=>(x+100*freq[p])/(sum+100))});
  const logF=Freq.map(row=>Float64Array.from(row,Math.log));
  function defaultSchedule(){
  const rank=[],gaps=[1,1,1,2,3,5,8,13,21,34,55,89,144,233,377];let rankNow=1;
  for(let j=0;j<N;j++){rank.push(rankNow);rankNow+=gaps[j%15]}
  const sieve=new Uint8Array(2500000),pr=[0];for(let p=2;pr.length<=rank.at(-1);p++){assert(p<sieve.length,"sieve");if(!sieve[p]){pr.push(p);if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1}}
  return rank.map(i=>m(pr[i]-1));

  }
  const K=request?request.K:defaultSchedule();
  assert(Array.isArray(K)&&K.length>=N&&K.every(v=>Number.isInteger(v)&&v>=0&&v<Q),"GP29 schedule must cover every possible consuming index");
  let cut=0,cutWords=0;
  if(request){cutWords=request.fitWords;assert(Number.isInteger(cutWords)&&cutWords>0&&cutWords<lens.length,"fitWords must select a nonempty strict word prefix");cut=lens.slice(0,cutWords).reduce((a,b)=>a+b,0);}
  else while(cut+lens[cutWords]<=Math.floor(.75*N)){cut+=lens[cutWords++]}
  function seq(C,from,to){const n=C.length,Hlim=[0];for(const x of C)Hlim.push(Hlim.at(-1)+(x===0));const H=Hlim[n]+1;return {C,n,H,lim:Hlim,classes:classes.slice(from,to),start:isStart.slice(from,to),end:isEnd.slice(from,to)}}
  function schedule(S,origin){const sh=new Uint8Array(S.n*S.H);for(let i=0;i<S.n;i++)for(let h=0;h<=S.lim[i];h++)sh[i*S.H+h]=K[origin+i-h];return sh}
  function emissions(A,B,eps){const I=inv(A),M=new Float64Array(E*Q*Q);for(let e=0;e<E;e++)for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const r=m(B[c]-k);M[(e*Q+c)*Q+k]=Freq[e][I[r]]*(r===0?eps:1)}return M}
  function stats(S,sh,M,needG=true){const {C,n,H,lim,classes}=S,F=new Float64Array((n+1)*H),scale=new Float64Array(n);F[0]=1;let ll=0;
    for(let i=0;i<n;i++){const a=i*H,b=a+H,e=classes[i],c=C[i],o=(e*Q+c)*Q;let z=0;for(let h=0;h<=lim[i];h++){const v=F[a+h],x=v*M[o+sh[a+h]];F[b+h]+=x;z+=x;if(c===0){const y=v*Freq[e][0];F[b+h+1]+=y;z+=y}}if(!(z>0))return {ll:-Infinity};scale[i]=z;ll+=Math.log(z);for(let h=0;h<=lim[i+1];h++)F[b+h]/=z}
    if(!needG)return {ll};const G=new Float64Array(E*Q*Q);let b=new Float64Array(H).fill(1),bb=new Float64Array(H);
    for(let i=n-1;i>=0;i--){const a=i*H,c=C[i],e=classes[i],o=(e*Q+c)*Q,z=scale[i];for(let h=0;h<=lim[i];h++){const k=sh[a+h],x=M[o+k]*b[h];G[o+k]+=F[a+h]*x/z;bb[h]=(x+(c===0?Freq[e][0]*b[h+1]:0))/z}[b,bb]=[bb,b]}return {ll,G}}
  function alphaFit(G,B){const R=new Float64Array(E*Q);for(let e=0;e<E;e++)for(let c=0;c<Q;c++)for(let k=0;k<Q;k++)R[e*Q+m(B[c]-k)]+=G[(e*Q+c)*Q+k];
    const cost=new Float64Array(Q*Q);for(let p=0;p<Q;p++)for(let a=0;a<Q;a++){if((p===0)!==(a===0)){cost[p*Q+a]=1e9;continue}let s=0;for(let e=0;e<E;e++)s+=R[e*Q+a]*logF[e][p];cost[p*Q+a]=-s}return assignment(cost)}
  function update(G,A,eps){const I=inv(A),log=Array.from({length:E},(_,e)=>Float64Array.from(I,(p,r)=>logF[e][p]+(r===0?Math.log(eps):0))),cost=new Float64Array(Q*Q);
    for(let e=0;e<E;e++){const g=e*Q*Q,l=log[e];for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const x=G[g+c*Q+k];if(x===0)continue;for(let v=0;v<Q;v++)cost[c*Q+v]-=x*l[(v+Q-k)%Q]}}
    const B=assignment(cost);return [alphaFit(G,B),B]}
  // Same collapsed global clock beam as previous calibrated receiver. It supplies
  // candidate hold histories only; position-class profiles enter the new EM.
  function beam(S,sh){const {C,n,lim,H,classes}=S,ends=C.flatMap((c,i)=>c===0?[i]:[]),all=(1<<29)-1,log=Array.from({length:n+1},(_,i)=>Math.log(i+.7)),den=Array.from({length:n+1},(_,i)=>Math.log(i+20.3));
    const init={hist:new Uint16Array(Q*Q),tot:new Uint16Array(Q),mask:new Int32Array(Q).fill(all),h:0,score:0,path:0n};
    function ext(b,lo,hi,hold,bit){const q={hist:b.hist.slice(),tot:b.tot.slice(),mask:b.mask.slice(),h:b.h,score:b.score,path:b.path};if(hold){q.score+=Math.log(Freq[classes[lo]][0]);q.h++;q.path|=1n<<BigInt(bit);lo++}for(let i=lo;i<hi;i++){const c=C[i],k=sh[i*H+q.h],j=c*Q+k;q.score+=Math.log(1-Freq[classes[i]][0])+log[q.hist[j]++]-den[q.tot[k]++];q.mask[c]&=~(1<<k);if(!q.mask[c])return null}return q}
    let groups=[[ext(init,0,ends[0]??n,false,0)]];for(let j=0;j<ends.length;j++){const lo=ends[j],hi=ends[j+1]??n,next=Array.from({length:j+2},()=>[]);for(const g of groups)for(const b of g)if(b)for(let h=0;h<2;h++){const q=ext(b,lo,hi,h,j);if(q)next[q.h].push(q)}for(const g of next){g.sort((a,b)=>b.score-a.score);if(g.length>32)g.length=32}groups=next}
    const best=groups.flat().filter(Boolean).sort((a,b)=>b.score-a.score),out=[],seen=new Set();for(const b of best){if(seen.has(b.h))continue;seen.add(b.h);const G=new Float64Array(E*Q*Q);let j=0,h=0;for(let i=0;i<n;i++){if(C[i]===0){const hold=(b.path>>BigInt(j++))&1n;if(hold){h++;continue}}G[(classes[i]*Q+C[i])*Q+sh[i*H+h]]++}out.push({G,H:b.hist,holds:b.h});if(out.length===3)break}return out}
  function decodeSeq(S,origin,A,B,unigram=false,allEnds=false){const {C,n,H,lim,classes,start,end}=S,sh=schedule(S,origin),I=inv(A),W=2*H,back=new Int8Array(n*W).fill(-1);let v=new Float64Array(W).fill(-Infinity),nv=new Float64Array(W),prev=new Int8Array(W).fill(-1),np=new Int8Array(W);v[0]=0;
    for(let i=0;i<n;i++){nv.fill(-Infinity);np.fill(-1);const c=C[i],e=classes[i];for(let h=0;h<=lim[i];h++)for(let ty=0;ty<2;ty++){const a=2*h+ty;if(!Number.isFinite(v[a]))continue;function add(p,b){const s=v[a]+(unigram?logF[e][p]:(start[i]?first[p]:LM[prev[a]*Q+p])+(end[i]?last[p]:0));if(s>nv[b]){nv[b]=s;np[b]=p;back[i*W+b]=ty}}const p=I[m(B[c]-sh[i*H+h])];if(p!==0)add(p,2*h);if(c===0)add(0,2*(h+1)+1)}[v,nv]=[nv,v];[prev,np]=[np,prev]}
    const states=[];for(let a=0;a<W;a++)if(Number.isFinite(v[a]))states.push(a);states.sort((a,b)=>v[b]-v[a]);if(!states.length)return allEnds?[]:null;
    function trace(a){const score=v[a],end=origin+n-(a>>1),P=new Int8Array(n);for(let i=n-1;i>=0;i--){const h=a>>1,ty=a&1,pt=back[i*W+a];if(ty){P[i]=0;a=2*(h-1)+pt}else{P[i]=I[m(B[C[i]]-sh[i*H+h])];a=2*h+pt}}return {score,P:Array.from(P),end}}
    return allEnds?states.map(trace):trace(states[0])}
  function split(P){const out=[];let i=0;for(let j=0;j<cutWords;j++){out.push({p:P.slice(i,i+lens[j])});i+=lens[j]}return out}
  function enc(P,A,B){let j=0;const I=inv(B);return P.map(p=>p===0?0:I[m(A[p]+K[j++])])}
  function fit(C,seed,truth=null,TA=null,TB=null){const S=seq(C.slice(0,cut),0,cut),H=seq(C.slice(cut),cut,N),sh=schedule(S,0),hist=beam(S,sh),candidates=[],records=[],rand=rng(seed),seen=new Set();
    for(const q of hist){const G=q.G,seeds=seedBetas(q.H,estimate(q.H,.6));for(let B of seeds){if(seen.has(B.join()))continue;seen.add(B.join());let A=alphaFit(G,B);for(let t=0;t<24;t++){const eps=10**(-Math.min(8,1+Math.floor(t/3))),z=stats(S,sh,emissions(A,B,eps));if(!z.G)break;[A,B]=update(z.G,A,eps)}const z=stats(S,sh,emissions(A,B,0),false);records.push({holds:q.holds,ll:Number.isFinite(z.ll)?z.ll:null});if(Number.isFinite(z.ll))candidates.push({A:Array.from(A),B:Array.from(B),ll:z.ll})}}
    candidates.sort((a,b)=>b.ll-a.ll);const unique=[...new Map(candidates.map(x=>[x.A.join()+":"+x.B.join(),x])).values()].sort((a,b)=>b.ll-a.ll).slice(0,4);let best=null;
    for(const q of unique){let A=q.A,B=q.B,d=decodeSeq(S,0,A,B,true);if(!d)continue;A=refine(A,split(d.P),rand);d=decodeSeq(S,0,A,B);if(!d)continue;for(let j=0;j<2;j++){const a=refine(A,split(d.P),rand),e=decodeSeq(S,0,a,B);if(!e||e.score<=d.score)break;A=a;d=e}if(!best||d.score>best.d.score)best={A,B,d}}
    function evaluate(A,B){const ends=decodeSeq(S,0,A,B,false,true);let joint=null;for(const e of ends){const h=decodeSeq(H,e.end,A,B);if(h&&(!joint||e.score+h.score>joint.e.score+joint.h.score))joint={e,h}}if(!joint)return null;const {e,h}=joint,P=e.P.concat(h.P);return {fit:truth?e.P.filter((v,i)=>v===truth[i]).length:null,fitLength:cut,held:truth?h.P.filter((v,i)=>v===truth[cut+i]).length:null,heldLength:N-cut,fitScore:e.score,heldScore:h.score,replay:enc(P,A,B).join()===C.join(),A,B,...(!truth?{P}:{}),possibleFitEnds:ends.length}}
    return {records,best:best?evaluate(best.A,best.B):null,oracle:truth?evaluate(TA,TB):null}}
  if(request){
    const seed=request.seed??0x27f15a2;assert(Number.isInteger(seed)&&seed>0&&seed<=0xffffffff,"seed must be a positive uint32");
    return {model:"supplied continuous consuming schedule with literal F holds and within-word emissions",words:lens.length,fitWords:cutWords,cut,result:fit(originalC,seed)};
  }
  const pds=[words(shakespeare),words(gibran)].map(ws=>{const p=Array.from({length:30},()=>[]);for(const w of ws)if(w.length<p.length)p[w.length].push(w);return p});
  const controls=[];
  for(let j=0;j<2;j++){const rand=rng(0x27f1510+j),A=perm(rand,true),B=perm(rand,false),P=lens.flatMap(n=>{const p=pds[j][n];assert(p.length,"control length "+n);return p[Math.floor(rand()*p.length)]}),C=enc(P,A,B);controls.push({donor:j?"Gibran":"Shakespeare",visibleF:C.filter(x=>x===0).length,literalF:P.filter(x=>x===0).length,result:fit(C,0x27f15a0+j,P,A,B)})}
  const gate=controls.every(x=>x.result.best&&x.result.best.fit>=.9*cut&&x.result.best.held>=.9*(N-cut)&&x.result.best.replay);
  const target=gate?fit(originalC,0x27f15a2):null;
  return {model:"source-literal p15 rank1 phase0 Fibonacci-gap continuous clock; printed-word-position-conditioned emissions and within-word language objective; arbitrary shared GP29 alphabets and literal F holds; length-conditioned donor controls with no inter-word grammar; fit whole-word prefix, frozen alphabets on continuation",range:[startOffset,endOffset],words:lens.length,fitWords:cutWords,cut,controls,gate,original:target};

}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={study,paths};
