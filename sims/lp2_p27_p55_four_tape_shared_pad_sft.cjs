"use strict";
/**
 * Four-tape exact shared GP29 additive-pad recovery, source-selected p27/p55 layouts.
 * All printed word boundaries ignored. No tuning of layout, phase, alphabet, or pad.
 * Exact trigram and tetragram Viterbi over shared key states, with held-out native controls.
 */
const R=29,N=76,mod=x=>(x%R+R)%R;
function tokenize(corpus,text){
 const ix=new Map(corpus.translit.map((v,i)=>[v,i]));
 const words=text.toUpperCase().match(/[A-Z]+/g)||[],out=[];
 for(const raw of words){
  const s=raw.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  for(let i=0;i<s.length;i++){const q=s.slice(i,i+2);if(q.length===2&&ix.has(q)){out.push(ix.get(q));i++}else if(ix.has(s[i]))out.push(ix.get(s[i]));}
 }
 return out;
}
function train(tapes){
 const counts=Array.from({length:4},(_,o)=>new Uint32Array(R**(o+1)));
 for(const t of tapes)for(let i=0;i<t.length;i++){
  let n=t[i],p=R;counts[0][n]++;
  for(let o=1;o<4&&o<=i;o++){n+=t[i-o]*p;p*=R;counts[o][n]++;}
 }
 const total=counts[0].reduce((a,b)=>a+b,0);
 const probs=[Float64Array.from(counts[0],v=>(v+.05)/(total+R*.05))];
 const smoothing=[.05,1,4,10];
 for(let o=1;o<4;o++){
  const v=counts[o],l=probs[o-1],p=new Float64Array(v.length),back=R**o;
  for(let a=0;a<v.length;a+=R){let denom=0;for(let b=0;b<R;b++)denom+=v[a+b];denom+=smoothing[o];
   for(let b=0;b<R;b++)p[a+b]=(v[a+b]+smoothing[o]*l[(a+b)%back])/denom;
  }
  probs.push(p);
 }
 return probs.map(p=>Float64Array.from(p,Math.log));
}
function score(model,p,order=4){let s=0;for(let i=0;i<p.length;i++){let o=Math.min(i+1,order),j=0;for(let k=i-o+1;k<=i;k++)j=j*R+p[k];s+=model[o-1][j];}return s;}
function exact(model,ct,order=4){
 if(ct.length!==4||ct.some(t=>t.length!==N))throw Error("four length-76 tapes required");
 if(order!==3&&order!==4)throw Error("order");
 const m=order-1,states=R**m,tail=R**(m-1),map=ct.map(t=>t.map(c=>Int8Array.from({length:R},(_,k)=>mod(c-k))));
 let dp=new Float64Array(states),next=new Float64Array(states);
 const pred=Array.from({length:N},()=>new Uint8Array(states)),key=new Uint8Array(N);
 // Initialize complete first m key digits, exact prefix likelihood.
 for(let state=0;state<states;state++){let x=state,k=new Uint8Array(m);for(let j=m-1;j>=0;j--){k[j]=x%R;x=Math.floor(x/R);}
  let s=0;for(let t=0;t<4;t++){let p=0;for(let j=0;j<m;j++){p=p*R+map[t][j][k[j]];s+=model[j][p];}}dp[state]=s;
 }
 const l=model[m],base=Array.from({length:4},()=>new Int32Array(states));
 for(let i=m;i<N;i++){
  // Map each shared-key history to four plaintext histories.
  for(let t=0;t<4;t++){
   const p=map[t];let a=0;
   if(m===2){const x=p[i-2],y=p[i-1];for(let k=0;k<R;k++)for(let j=0;j<R;j++)base[t][a++]=(x[k]*R+y[j])*R;}
   else {const x=p[i-3],y=p[i-2],z=p[i-1];for(let k=0;k<R;k++)for(let j=0;j<R;j++)for(let h=0;h<R;h++)base[t][a++]=((x[k]*R+y[j])*R+z[h])*R;}
  }
  const a0=base[0],a1=base[1],a2=base[2],a3=base[3],z0=map[0][i],z1=map[1][i],z2=map[2][i],z3=map[3][i],bt=pred[i];
  next.fill(-Infinity);
  for(let state=0;state<states;state++){
   const u=dp[state],s0=a0[state],s1=a1[state],s2=a2[state],s3=a3[state],out=(state%tail)*R,old=Math.floor(state/tail);
   for(let k=0;k<R;k++){const q=out+k,v=u+l[s0+z0[k]]+l[s1+z1[k]]+l[s2+z2[k]]+l[s3+z3[k]];if(v>next[q]){next[q]=v;bt[q]=old;}}
  }
  [dp,next]=[next,dp];
 }
 let best=0;for(let j=1;j<states;j++)if(dp[j]>dp[best])best=j;
 const total=dp[best];let s=best;
 for(let i=N-1;i>=m;i--){key[i]=s%R;s=pred[i][s]*tail+Math.floor(s/R);}
 for(let i=m-1;i>=0;i--){key[i]=s%R;s=Math.floor(s/R);}
 const p=ct.map(t=>t.map((c,i)=>mod(c-key[i]))),replay=p.every((t,j)=>t.every((v,i)=>mod(v+key[i])===ct[j][i]));
 const check=p.reduce((a,t)=>a+score(model,t,order),0);
 if(!replay||Math.abs(total-check)>1e-8)throw Error("exact traceback mismatch");
 return {score:total,mean:total/(N*4),key:[...key],p};
}
function layouts(corpus){
 const p27=corpus.pages.find(p=>p.page===27).indices,p55=corpus.pages.find(p=>p.page===55).indices;
 if(p27.length!==234||p55.length!==76||String(p27.slice(28,34))!==String(p55.slice(70)))throw Error("source geometry");
 const rest=p27.slice(34).concat(p27.slice(0,28)),I=Array.from({length:N},(_,i)=>i);
 return [
  ["marker-contiguous",[rest.slice(0,N),rest.slice(N,2*N),rest.slice(2*N),p55]],
  ["marker-interleaved",[0,1,2].map(j=>I.map(i=>rest[3*i+j])).concat([p55])],
  ["row-outer-trim",[0,1,2].map(j=>I.map(i=>p27[78*j+i+1])).concat([p55])],
  ["triple-outer-trim",[0,1,2].map(j=>I.map(i=>p27[3*(i+1)+j])).concat([p55])]
 ];
}
function experiment(corpus,raw,mode="all",order=4){
 const donors=raw.map(t=>tokenize(corpus,t)),cuts=donors.map(t=>Math.floor(t.length*.67));
 const model=train(donors.map((t,i)=>t.slice(0,cuts[i])));
 const fmt=v=>v.map(t=>t.map(i=>corpus.translit[i]).join(""));
 const base={trainLengths:cuts,testLengths:donors.map((t,i)=>t.length-cuts[i]),order};
 const result={...base,controls:[],original:[],nulls:[]};
 let state=0x9127a55;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};
 const enc=(p,k)=>p.map((v,i)=>mod(v+k[i]));
 function control(j){
  // Fixed source-excluded contiguous windows, different authors and disjoint passages.
  const p=Array.from({length:4},(_,t)=>{const d=(j+t)%donors.length,off=cuts[d]+1000+j*1500+t*350;return donors[d].slice(off,off+N);});
  const key=Array.from({length:N},()=>rnd(R));
  const ct=p.map(t=>enc(t,key));
  const hit=exact(model,ct,order);
  const wrong=ct.map((t,k)=>k===0?t:t.map((v,i)=>t[(i+13*k)%N]));
  const ng=exact(model,wrong,order);
  const exactKey=hit.key.filter((v,i)=>v===key[i]).length;
  if(hit.score+1e-9<p.reduce((a,t)=>a+score(model,t,order),0))throw Error("MAP lower than truth");
  return {j,exactKey,exactRunes:4*exactKey,truth:fmt(p),recovered:fmt(hit.p),mean:hit.mean,wrongAlignmentMean:ng.mean,truthMean:p.reduce((a,t)=>a+score(model,t,order),0)/(4*N)};
 }
 if(mode==="all"||mode==="controls")for(let j=0;j<4;j++)result.controls.push(control(j));
 if(mode==="all"||mode==="original")for(const [layout,ct] of layouts(corpus)){
  const hit=exact(model,ct,order);
  result.original.push({layout,mean:hit.mean,score:hit.score,key:hit.key,plaintext:fmt(hit.p),indices:hit.p});
  // Frozen matched original null: rotate individual lanes, preserving their marginal runes.
  const wrong=ct.map((t,k)=>k===0?t:t.map((v,i)=>t[(i+13*k)%N]));
  result.nulls.push({layout,mean:exact(model,wrong,order).mean});
 }
 return result;
}
module.exports={tokenize,train,score,exact,layouts,experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(x=>read("resources/control/"+x)),process.argv[2]||"all",Number(process.argv[3]||4)),null,2));}
