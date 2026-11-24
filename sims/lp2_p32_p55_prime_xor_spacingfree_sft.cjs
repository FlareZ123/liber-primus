"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function spacingFree(corpus,training,donorA,donorB){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109], idx=new Map(code.map((p,i)=>[p,i]));
 const N=29,S=N*N, tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const encode=text=>{const out=[];for(const word of text.match(/[a-z]+/gi)||[]){let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const q=tokens.find(([t])=>w.startsWith(t,i));if(!q)throw Error("unencoded");out.push(q[1]);i+=q[0].length;}}return out};
 const stream=encode(training), u=new Float64Array(N).fill(.25), b=new Float64Array(S).fill(.25), t=new Float64Array(S*N).fill(.25);
 for(let i=0;i<stream.length;i++){const x=stream[i];u[x]++;if(i)b[stream[i-1]*N+x]++;if(i>1)t[(stream[i-2]*N+stream[i-1])*N+x]++;}
 const norm=(arr,n)=>{for(let k=0;k<arr.length;k+=n){let z=0;for(let x=0;x<n;x++)z+=arr[k+x];for(let x=0;x<n;x++)arr[k+x]/=z;}};
 norm(u,N);norm(b,N);norm(t,N);
 const lu=u.map(Math.log),lb=b.map(Math.log),lt=t.map(Math.log);
 const partner=Array.from({length:128},(_,d)=>code.map(x=>idx.get(x^d)??-1));
 const valid=partner.map(a=>a.flatMap((x,i)=>x>=0?[i]:[]));
 function decode(ds,cut=48,wantViterbi=false){
  let cur=new Float64Array(S),next=new Float64Array(S),v=new Float64Array(S).fill(-Infinity),vn=new Float64Array(S), back=wantViterbi?[]:null, logZ=0, pre=0;
  const a=ds[0],d=ds[1];let z=0;
  for(const x of valid[a])for(const y of valid[d]){const k=x*N+y, kb=partner[a][x]*N+partner[d][y];cur[k]=u[x]*u[partner[a][x]]*b[k]*b[kb];z+=cur[k];if(wantViterbi)v[k]=lu[x]+lu[partner[a][x]]+lb[k]+lb[kb];}
  logZ=Math.log(z);for(let i=0;i<S;i++)cur[i]/=z;
  for(let i=2;i<ds.length;i++){const d0=ds[i-2],d1=ds[i-1],d2=ds[i];next.fill(0);if(wantViterbi)vn.fill(-Infinity);const bp=wantViterbi?new Int16Array(S).fill(-1):null;
   for(const x of valid[d0])for(const y of valid[d1]){const k=x*N+y,kb=partner[d0][x]*N+partner[d1][y],p=cur[k];for(const w of valid[d2]){const j=y*N+w,h=k*N+w,hb=kb*N+partner[d2][w];next[j]+=p*t[h]*t[hb];if(wantViterbi){const q=v[k]+lt[h]+lt[hb];if(q>vn[j]){vn[j]=q;bp[j]=x;}}}}
   z=0;for(let k=0;k<S;k++)z+=next[k];logZ+=Math.log(z);for(let k=0;k<S;k++)next[k]/=z;[cur,next]=[next,cur];if(wantViterbi){[v,vn]=[vn,v];back[i]=bp;}if(i+1===cut)pre=logZ;
  }
  if(!wantViterbi)return {logZ,pre};
  let k=0;for(let i=1;i<S;i++)if(v[i]>v[k])k=i;
  const p=new Array(ds.length);p[p.length-2]=Math.floor(k/N);p[p.length-1]=k%N;
  for(let i=p.length-1;i>=2;i--)p[i-2]=back[i][p[i-1]*N+p[i]];
  return {logZ,pre,viterbi:v[k],p,q:p.map((x,i)=>partner[ds[i]][x])};
 }
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 const penalty=D=>D.reduce((s,d)=>s+Math.log(valid[d].length),0);
 const rank=(A,B,trueOffset=null)=>{const cut=48,choices=[];for(let off=0;off<=A.length-B.length;off++){const D=B.map((x,i)=>code[x]^code[A[i+off]]);const r=decode(D.slice(0,cut),cut);choices.push({off,train:r.logZ-penalty(D.slice(0,cut))});}choices.sort((a,b)=>b.train-a.train);const off=choices[0].off,D=B.map((x,i)=>code[x]^code[A[i+off]]);const r=decode(D,cut,true);const result={off,train:(r.pre-penalty(D.slice(0,cut)))/cut,heldout:(r.logZ-r.pre-penalty(D.slice(cut)))/(B.length-cut),bestScore:r.viterbi/(2*B.length),rankTrue:trueOffset===null?null:choices.findIndex(x=>x.off===trueOffset)+1,margin:choices[0].train-choices[1].train,A:render(r.p),B:render(r.q),p:r.p,q:r.q};
  if(trueOffset!==null){const trueD=B.map((x,i)=>code[x]^code[A[i+trueOffset]]);const q=decode(trueD,cut,true);result.trueTrain=(q.pre-penalty(trueD.slice(0,cut)))/cut;result.trueHeldout=(q.logZ-q.pre-penalty(trueD.slice(cut)))/(B.length-cut);}
  return result;};
 let seed=0x6c696265;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n};
 const aa=encode(donorA),bb=encode(donorB),original=null;
 const plant=(P,Q,off)=>{const A=[],B=[];for(let i=0;i<P.length;i++){const j=i-off,keys=Array.from({length:128},(_,k)=>k).filter(k=>idx.has(k^code[P[i]])&&(j<0||j>=Q.length||idx.has(k^code[Q[j]])));const k=keys[rand(keys.length)];A[i]=idx.get(code[P[i]]^k);if(j>=0&&j<Q.length)B[j]=idx.get(code[Q[j]]^k);}const r=rank(A,B,off);return {...r,actualOffset:off,matchedA:r.p.filter((x,i)=>x===P[i+off]).length,matchedB:r.q.filter((x,i)=>x===Q[i]).length,correctAlignment:r.off===off};};
 const controls=[];for(let i=0;i<4;i++)controls.push(plant(aa.slice(2000+i*1000,2121+i*1000),bb.slice(4000+i*1500,4076+i*1500),[7,19,31,43][i]));
 const pass=controls.filter(c=>c.correctAlignment).length>=3&&controls.filter(c=>c.correctAlignment&&c.matchedA>=38&&c.matchedB>=38).length>=3;
 const nulls=[];const candidate=pass?rank(corpus.pages[32].indices,corpus.pages[55].indices):null;for(let i=0;pass&&i<4;i++){const B=corpus.pages[55].indices.slice();for(let j=B.length-1;j>0;j--){const k=rand(j+1);[B[j],B[k]]=[B[k],B[j]];}nulls.push(rank(corpus.pages[32].indices,B));}
 const clean=({p,q,...x})=>x;return {model:"GP chart prime-code XOR; independent trigram forward marginal, subtract log legal pair count; prefix48/suffix28; 46 offsets; original gated on >=3/4 true alignments and >=3/4 half-plaintext recoveries",trainRunes:stream.length,gatePassed:pass,original:candidate?clean(candidate):null,controls:controls.map(clean),nulls:nulls.map(clean)};
}
console.log(JSON.stringify(spacingFree(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
