"use strict";
const fs=require("node:fs");
function experiment(c,n,lit){
 const O=3302,mod=x=>(x%29+29)%29,sh=[],id=Array.from({length:29},(_,i)=>i);for(let x=2;sh.length<O+1000;x++){let ok=true;for(let p=2;p*p<=x;p++)if(x%p===0){ok=false;break}if(ok)sh.push((x-1)%29)}
 const bits=sh.map((_,i)=>1n<<BigInt(i)),M=Array(29).fill(0n);for(let j=0;j<sh.length;j++)M[sh[j]]|=bits[j];
 const init=(1n<<BigInt(O))-1n,all=(1n<<BigInt(sh.length))-1n,eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),assert=(x,m)=>{if(!x)throw Error(m)};
 const idx=new Map(c.runes.map((r,i)=>[r,i])),sources=n.sections.map(s=>({name:s.name,P:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 const excluded=["0_koan_1","0_loss_of_divinity","p56_an_end"];
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function latin(raw){const P=[];for(const w of raw.toUpperCase().match(/[A-Z]+/g)||[]){const text=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<text.length;){if(text.startsWith("ING",i)){P.push(21);i+=3}else if(text.startsWith("IO",i)){P.push(27);i+=2}else{const t=tokens.find(x=>text.startsWith(x.s,i));if(!t){i++;continue}P.push(t.i);i+=t.s.length}}}return P}
 const u=new Float64Array(29).fill(.5),bi=new Float64Array(841),tri=new Float64Array(29**3),quad=new Float64Array(29**4),bt=new Float64Array(29),tt=new Float64Array(841),qt=new Float64Array(29**3);
 function train(P,w){for(let i=0;i<P.length;i++){const p=P[i];u[p]+=w;if(i){const a=P[i-1];bi[a*29+p]+=w;bt[a]+=w}if(i>1){const h=P[i-2]*29+P[i-1];tri[h*29+p]+=w;tt[h]+=w}if(i>2){const h=(P[i-3]*29+P[i-2])*29+P[i-1];quad[h*29+p]+=w;qt[h]+=w}}}
 for(const raw of lit)train(latin(raw),1);for(const s of sources)if(!excluded.includes(s.name))train(s.P,24);
 const total=u.reduce((a,b)=>a+b);for(let i=0;i<29;i++)u[i]/=total;
 for(let h=0;h<29;h++)for(let p=0;p<29;p++)bi[h*29+p]=(bi[h*29+p]+20*u[p])/(bt[h]+20);
 for(let h=0;h<841;h++)for(let p=0;p<29;p++)tri[h*29+p]=(tri[h*29+p]+15*bi[(h%29)*29+p])/(tt[h]+15);
 for(let h=0;h<29**3;h++)for(let p=0;p<29;p++)quad[h*29+p]=(quad[h*29+p]+12*tri[(h%841)*29+p])/(qt[h]+12);
 const L=[null,...[u,bi,tri,quad].map(a=>Float64Array.from(a,Math.log))];
 function score(P,context=[]){const q=context.concat(P);let v=0;for(let i=context.length;i<q.length;i++){let k=q[i],pow=29,len=1;for(let j=i-1;j>=0&&j>=i-3;j--){k+=q[j]*pow;pow*=29;len++}v+=L[len][k]}return v}
 function perm(seed){let x=seed>>>0,S=id.slice();for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[S[i],S[j]]=[S[j],S[i]]}return S}
 function encode(P,I,J,start=0){const S=id.map(p=>I.indexOf(p)),T=id.map(z=>J.indexOf(z));let j=start;return P.map(p=>p===0?0:T[mod(S[p]+sh[j++])])}
 const auth=sources.find(x=>x.name==="p56_an_end").P;assert(eq(encode(auth,id,id),c.pages[56].indices),"authentic p56");
 function hungarian(A){const n=29,u=new Float64Array(n+1),v=new Float64Array(n+1),p=new Int16Array(n+1),way=new Int16Array(n+1);for(let i=1;i<=n;i++){p[0]=i;let j0=0,min=new Float64Array(n+1).fill(Infinity),used=new Uint8Array(n+1);do{used[j0]=1;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-A[(i0-1)*n+j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<d){d=min[j];j1=j}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d}else min[j]-=d}j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}const out=new Array(n);for(let j=1;j<=n;j++)out[p[j]-1]=j-1;return out}
 const plainRank=id.filter(p=>p!==0).sort((a,b)=>u[b]-u[a]);
 function em(C,I,J,pen){
  const N=C.length,H=C.filter(x=>x===0).length,W=H+1,A=new Float64Array((N+1)*W),B=new Float64Array((N+1)*W),scale=new Float64Array(N),f=u.map((p,i)=>i===0?p*Math.exp(-pen):p);A[0]=1;let hmax=0,log=0;
  for(let i=0;i<N;i++){const c=C[i],a=i*W,b=a+W;for(let h=0;h<=hmax;h++){const w=A[a+h];if(!w)continue;const z=mod(J[c]-sh[i-h]);A[b+h]+=w*f[I[z]];if(c===0)A[b+h+1]+=w*u[0]}if(c===0)hmax++;let s=0;for(let h=0;h<=hmax;h++)s+=A[b+h];if(!(s>0))return null;scale[i]=s;log+=Math.log(s);for(let h=0;h<=hmax;h++)A[b+h]/=s}
  for(let h=0;h<=H;h++)B[N*W+h]=1;const counts=new Float64Array(841);hmax=H;
  for(let i=N-1;i>=0;i--){const c=C[i],a=i*W,b=a+W;if(c===0)hmax--;for(let h=0;h<=hmax;h++){if(!A[a+h])continue;const k=sh[i-h],w=f[I[mod(J[c]-k)]]*B[b+h];counts[c*29+k]+=A[a+h]*w/scale[i];B[a+h]=(w+(c===0?u[0]*B[b+h+1]:0))/scale[i]}}
  return {counts,log};
 }
 function mstep(N,I,J,pen){
  for(let t=0;t<2;t++){const counts=new Float64Array(29);for(let c=0;c<29;c++)for(let k=0;k<29;k++)counts[mod(J[c]-k)]+=N[c*29+k];const zRank=id.filter(z=>z!==0).sort((a,b)=>counts[b]-counts[a]);I=new Array(29);I[0]=0;zRank.forEach((z,i)=>I[z]=plainRank[i]);const A=new Float64Array(841);for(let c=0;c<29;c++)for(let j=0;j<29;j++){let s=0;for(let k=0;k<29;k++){const p=I[mod(j-k)];s+=N[c*29+k]*(L[1][p]-(p===0?pen:0))}A[c*29+j]=s}J=hungarian(A)}
  return {I,J};
 }
 function viterbi(C,I,J,start=0,context=[],pen=Infinity,order=3){
  const pow=[1,29,841,24389],Lmax=pow[order-1],ctx=context.slice(-(order-1));let initial=0;for(const p of ctx)initial=initial*29+p;let states=new Map([[initial,{h:0,code:initial,s:0,node:null}]]);let len=ctx.length;
  for(let i=0;i<C.length;i++){const next=new Map(),c=C[i],ord=Math.min(order,len+1);for(const st of states.values()){
   function offer(p,h,hold){if(!hold&&p===0&&pen===Infinity)return;const s=st.s+L[ord][st.code*29+p]-(!hold&&p===0?pen:0),code=(st.code*29+p)%Lmax,k=h*Lmax+code;const old=next.get(k);if(!old||s>old.s)next.set(k,{h,code,s,node:{p,hold,prev:st.node}})}
   if(c===0)offer(0,st.h+1,true);offer(I[mod(J[c]-sh[start+i-st.h])],st.h,false)
  }states=next;len=Math.min(order-1,len+1);if(!states.size)return null}
  let best=null;for(const st of states.values())if(!best||st.s>best.s)best=st;const P=[],holds=[];for(let z=best.node;z;z=z.prev){P.push(z.p);holds.push(z.hold)}P.reverse();holds.reverse();return {P,holds,s:best.s,end:start+C.length-best.h,illegal:P.filter((p,i)=>p===0&&!holds[i]).length}
 }
 function fixed(C,holds,I,J,pen){let prev=0,len=0,j=0,s=0;for(let i=0;i<C.length;i++){const p=holds[i]?0:I[mod(J[C[i]]-sh[j++])];s+=L[Math.min(len+1,4)][prev*29+p]-(!holds[i]&&p===0?pen:0);prev=(prev*29+p)%24389;len=Math.min(len+1,3)}return s}
 function refine(C,I,J,seed){
  let rng=seed>>>0;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)/4294967296}I=I.slice();J=J.slice();let best=null;
  for(let e=0;e<4;e++){const path=viterbi(C,I,J,0,[],18,4);let s=fixed(C,path.holds,I,J,18),bi=I.slice(),bj=J.slice(),bs=s;for(let t=0;t<6000;t++){const A=rand()<.55?I:J,low=A===I?1:0,a=low+Math.floor(rand()*(29-low)),b=low+Math.floor(rand()*(29-low));if(a===b)continue;[A[a],A[b]]=[A[b],A[a]];const q=fixed(C,path.holds,I,J,18),T=5*Math.pow(.02,t/5999);if(q>=s||rand()<Math.exp((q-s)/T)){s=q;if(s>bs){bs=s;bi=I.slice();bj=J.slice()}}else [A[a],A[b]]=[A[b],A[a]]}
   I=bi;J=bj;const q=viterbi(C,I,J,0,[],Infinity,4);if(q&&(!best||q.s>best.path.s))best={I:I.slice(),J:J.slice(),path:q};}
  return best;
 }
 function fit(C,seed){const trials=[];for(let i=0;i<16;i++){let I=perm((seed^((i+1)*2654435761))>>>0),J=perm((seed^((i+33)*2246822519))>>>0),z=I.indexOf(0);[I[0],I[z]]=[I[z],I[0]];let log=-Infinity;
  for(let t=0;t<24;t++){const pen=t<8?2:t<16?6:12,e=em(C,I,J,pen);if(!e)break;log=e.log;({I,J}=mstep(e.counts,I,J,pen))}
  const soft=viterbi(C,I,J,0,[],18,4);trials.push({I,J,soft:soft.s,illegal:soft.illegal,log})}
  trials.sort((a,b)=>b.soft-a.soft);let winner=null;const runs=[];for(let i=0;i<4;i++){const a=trials[i],q=refine(C,a.I,a.J,(seed^((i+97)*2654435761))>>>0);runs.push({soft:a.soft,illegal:a.illegal,legal:q?.path.s??null});if(q&&(!winner||q.path.s>winner.path.s))winner=q}return {winner,runs,emBest:trials[0]};
 }
 function trial(name,C,cut,truth=null){const q=fit(C.slice(0,cut),0x51b03301),w=q.winner;let out={name,length:C.length,cut,runs:q.runs,emBest:{soft:q.emBest.soft,illegal:q.emBest.illegal},fit:null,heldout:null,truth:null};
  if(w){assert(eq(encode(w.path.P,w.I,w.J),C.slice(0,cut)),"prefix replay");const h=viterbi(C.slice(cut),w.I,w.J,w.path.end,w.path.P,Infinity,4);if(h)assert(eq(encode(h.P,w.I,w.J,w.path.end),C.slice(cut)),"suffix replay");out.fit={I:w.I,J:w.J,nats:w.path.s/cut,end:w.path.end,readout:w.path.P.map(p=>c.translit[p]).join(" "),P:w.path.P};out.heldout=h?{nats:h.s/(C.length-cut),P:h.P,readout:h.P.map(p=>c.translit[p]).join(" ")}:null;}
  if(truth){const a=viterbi(C,truth.I,truth.J,0,[],Infinity,4);out.truth={key:{I:truth.I,J:truth.J},knownKeyMatches:a?.P.filter((x,i)=>x===truth.P[i]).length??0,nativeNats:score(truth.P)/C.length,innerMatch:w?w.I.filter((x,i)=>x===truth.I[i]).length:0,outerMatch:w?w.J.filter((x,i)=>x===truth.J[i]).length:0,prefixMatch:w?w.path.P.filter((x,i)=>x===truth.P[i]).length:0,heldMatch:out.heldout?out.heldout.P.filter((x,i)=>x===truth.P[cut+i]).length:0}}
  return out;
 }
 function plant(name,seed){const P=sources.find(x=>x.name===name).P,S=perm(seed),m=S[0],I=id.map(z=>S.indexOf(mod(z+m))),J=perm(seed^0x3301).map(z=>mod(z-m));return {P,I,J}}
 const p=plant("0_koan_1",0x70113301);const result=trial("native-first-koan",encode(p.P,p.I,p.J),580,p);return {method:"double alphabet latent-F unigram EM with exact Hungarian coordinate steps, top4 quadgram soft-mask annealing, strict frozen suffix",excluded,authenticReplay:85,trials:[result]};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];const f=paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),JSON.parse(f[1]),f.slice(2)),null,2));
