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
  // Receiver entry point: each printed scope has a supplied consuming-shift array.
  // A separate source gate must establish the array before using original ciphertext.
  if (request) {
    const { rows, fitWords, seed = 0x44112710 } = request;
    assert(Array.isArray(rows) && Number.isInteger(fitWords) && fitWords > 0 && fitWords < rows.length, "fit split");
    const R = rows.map(({ C, K }) => {
      assert(Array.isArray(C) && C.length > 0 && Array.isArray(K) && K.length >= C.length &&
        C.every(x => Number.isInteger(x) && x >= 0 && x < Q) &&
        K.every(x => Number.isInteger(x) && x >= 0 && x < Q), "word-local GP29 arrays");
      return setup(C,K);
    });
    const rec = recover(R,fitWords,seed);
    if (!rec.best) return {seeds:rec.seeds,legal:rec.legal,best:null};
    const {A,B}=rec.best;
    const decoded=R.map(row=>{const d=decode(row,A,B);return d?{P:d.p,score:d.s,replay:encrypt(d.p,row.K,A,B).join()===row.C.join()}:null});
    return {seeds:rec.seeds,legal:rec.legal,A,B,fit:decoded.slice(0,fitWords),held:decoded.slice(fitWords)};
  }
  const pools=[words(shakespeare),words(gibran)].map(xs=>{const out=Array.from({length:30},()=>[]);for(const w of xs)if(w.length<out.length)out[w.length].push(w);return out});
  const cut=Math.floor(.75*original.length);
  function run(j){const random=rng(0x27112710+j),A=perm(random,true),B=perm(random,false),P=[],rows=[],fallback={};for(let i=0;i<original.length;i++){const n=original[i].length,own=pools[j%2][n],pool=own.length?own:pools[1-j%2][n];assert(pool.length,"donor length "+n);if(!own.length)fallback[n]=(fallback[n]||0)+1;const p=pool[Math.floor(random()*pool.length)].slice(),K=Array.from({length:n},(_,k)=>tape[(i+k)%tape.length]);P.push(p);rows.push(setup(encrypt(p,K,A,B),K))}
    const rec=recover(rows,cut,0x44112710+j);
    function evaluate(a,b){if(!a||!b)return null;let fit=0,held=0,fitWords=0,heldWords=0,fitN=0,heldN=0,replay=true,illegal=0;for(let i=0;i<rows.length;i++){const w=P[i],row=rows[i],d=decode(row,a,b);if(!d){illegal++;replay=false;if(i<cut)fitN+=w.length;else heldN+=w.length;continue}const n=d.p.filter((x,k)=>x===w[k]).length;if(i<cut){fit+=n;fitN+=w.length;fitWords+=n===w.length}else{held+=n;heldN+=w.length;heldWords+=n===w.length}replay=replay&&encrypt(d.p,row.K,a,b).join()===row.C.join()}return {fit,fitN,held,heldN,fitWords,heldWords,replay,illegal,inner:a.filter((x,i)=>x===A[i]).length,outer:b.filter((x,i)=>x===B[i]).length}}
    const observed=[...new Set(P.flat())].sort((a,b)=>a-b), missing=id.filter(x=>!observed.includes(x));const gauge=rec.best?id.map(d=>({d,outer:rec.best.B.filter((x,i)=>m(x-B[i])===d).length,inner:observed.filter(p=>p!==0&&m(rec.best.A[p]-A[p])===d).length})).sort((a,b)=>b.outer+b.inner-a.outer-a.inner)[0]:null;
    return {control:j,donor:j%2?"Gibran":"Shakespeare",fallback,observed,missing,gauge,visibleF:rows.flatMap(r=>r.C).filter(x=>x===0).length,literalF:P.flat().filter(x=>x===0).length,seeds:rec.seeds,legal:rec.legal,recovered:rec.best?evaluate(rec.best.A,rec.best.B):null,oracle:evaluate(A,B),key:rec.best?{A:rec.best.A,B:rec.best.B}:null,truthKey:{A,B}}
  }
  const controls=[run(0),run(1)];
  return {model:"Fixed independently supplied per-word nonperiodic key arrays; word-local cursor resets; shared arbitrary GP29 alphabets; literal F holds; synthetic LP1 ordinal key offset i, not a historical selector. Exact printed length inventory, independent donor sampling by length, word-local first/bigram/last model trained on Emerson; 75% words fit; frozen keys on held words.",words:original.length,fitWords:cut,heldWords:original.length-cut,runicCount:original.flat().length,controls,gate:controls.every(x=>x.recovered&&x.recovered.fit>=.9*x.recovered.fitN&&x.recovered.held>=.9*x.recovered.heldN&&x.recovered.replay),original:null};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={study,paths};
