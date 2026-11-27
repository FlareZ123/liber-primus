'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];

function experiment(raw,K=1024,devInitial=null){
 const [c0,n0,...lit]=raw,c=JSON.parse(c0),n=JSON.parse(n0),Q=29,N=11,S=N*Q,M=N*Q,H=128,NEG=-1e9,mod=x=>(x%Q+Q)%Q;
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a})}
 const excluded=["0_loss_of_divinity","0_koan_1","0_welcome"],training=[...n.sections.filter(s=>!excluded.includes(s.name)).map(s=>read(s.source_text)),...lit.map(gp)],n1=new Uint32Array(Q),n2=new Uint32Array(Q*Q),n3=new Uint32Array(Q**3),ctx=new Uint32Array(Q),ctx3=new Uint32Array(Q*Q);let total=0;
 for(const T of training){for(let i=0;i<T.length;i++){const p=T[i];n1[p]++;total++;if(i){n2[T[i-1]*Q+p]++;ctx[T[i-1]]++}if(i>1){const j=T[i-2]*Q+T[i-1];n3[j*Q+p]++;ctx3[j]++}}}
 const U=Int32Array.from(n1,x=>Math.round(H*Math.log((x+1)/(total+Q)))),B=new Int32Array(Q*Q),L=new Int32Array(Q**3);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const p=(n2[a*Q+b]+16*(n1[b]+1)/(total+Q))/(ctx[a]+16);B[a*Q+b]=Math.round(H*Math.log(p));for(let d=0;d<Q;d++){const pNext=(n2[b*Q+d]+16*(n1[d]+1)/(total+Q))/(ctx[b]+16);L[(a*Q+b)*Q+d]=Math.round(H*Math.log((n3[(a*Q+b)*Q+d]+12*pNext)/(ctx3[a*Q+b]+12)))}}
 const exp=Float64Array.from({length:16384},(_,i)=>Math.exp(-i/H)),scratch=new Int32Array(Q);
 function beamSolve(C,truth=null,initial=null){
  const V=Array.from({length:S},(_,a)=>Uint8Array.from({length:M},(_,i)=>mod(C[Math.floor(i/Q)*N+Math.floor(a/Q)]-a%Q-i%Q)));
  function marg(x){let z=0;for(let r=0;r<N;r++){const off=r*Q;let m=NEG;for(let u=0;u<Q;u++)m=Math.max(m,x[off+u]);let sum=0;for(let u=0;u<Q;u++)sum+=exp[m-x[off+u]]||0;z+=m+H*Math.log(sum/Q)}return z}
  let beam=Array.from({length:N},(_,j)=>{const a=j*Q,weight=Int32Array.from(V[a],x=>U[x]);return{s:[a],mask:1<<j,weight,z:marg(weight)}});
  const ranks=[];
  for(let d=1;d<N&&!initial;d++){
   const heap=[];function add(x){if(heap.length<K){let i=heap.length;heap.push(x);while(i){const p=(i-1)>>1;if(heap[p].z<=x.z)break;heap[i]=heap[p];i=p}heap[i]=x;return}
    if(x.z<=heap[0].z)return;let i=0;while(i*2+1<heap.length){let ch=i*2+1;if(ch+1<heap.length&&heap[ch+1].z<heap[ch].z)ch++;if(heap[ch].z>=x.z)break;heap[i]=heap[ch];i=ch}heap[i]=x}
   let bestTruth=NEG,truthFound=false,seen=0;
   for(const p of beam){const prev=V[p.s.at(-1)],v2=d>1?V[p.s.at(-2)]:null,base=p.weight,idx=new Int32Array(M);for(let i=0;i<M;i++)idx[i]=d===1?prev[i]*Q:(v2[i]*Q+prev[i])*Q;const table=d===1?B:L;
    for(let j=0;j<N;j++)if(!(p.mask&(1<<j)))for(let k=0;k<Q;k++){const a=j*Q+k,va=V[a];let z=0;for(let r=0;r<N;r++){let m=NEG;const off=r*Q;for(let u=0;u<Q;u++){const i=off+u,x=base[i]+table[idx[i]+va[i]];scratch[u]=x;if(x>m)m=x}let sum=0;for(let u=0;u<Q;u++)sum+=exp[m-scratch[u]]||0;z+=m+H*Math.log(sum/Q)}
     const isTrue=truth&&a===truth[d]&&p.s.every((v,i)=>v===truth[i]);if(isTrue){bestTruth=z;truthFound=true}
     if(heap.length<K||z>heap[0].z)add({p,a,z});seen++;
    }
   }
   beam=heap.sort((a,b)=>b.z-a.z).map(({p,a,z})=>{const prev=V[p.s.at(-1)],v2=d>1?V[p.s.at(-2)]:null,va=V[a],base=p.weight,table=d===1?B:L,w=new Int32Array(M);for(let i=0;i<M;i++)w[i]=base[i]+table[(d===1?prev[i]*Q:(v2[i]*Q+prev[i])*Q)+va[i]];return{s:[...p.s,a],mask:p.mask|(1<<Math.floor(a/Q)),weight:w,z}});
   ranks.push({depth:d+1,seen,best:beam[0].z,cut:beam.at(-1).z,truth:truthFound?bestTruth:null,truthRank:truth?beam.findIndex(p=>p.s.every((v,i)=>v===truth[i]))+1:null});
  }
  function full(s){const R=N,A=s.map(a=>V[a]),vals=Array.from({length:R},(_,r)=>Array.from({length:Q},(_,u)=>A.map(a=>a[r*Q+u]))),internal=vals.map(rows=>rows.map(p=>{let z=0;for(let j=2;j<N;j++)z+=L[(p[j-2]*Q+p[j-1])*Q+p[j]];return z}));
   let dp=Int32Array.from(internal[0]),back=Array.from({length:R},()=>new Uint8Array(Q));
   for(let r=1;r<R;r++){const next=new Int32Array(Q).fill(NEG);for(let u=0;u<Q;u++){const p=vals[r][u];for(let v=0;v<Q;v++){const q=vals[r-1][v],z=dp[v]+L[(q[N-2]*Q+q[N-1])*Q+p[0]]+L[(q[N-1]*Q+p[0])*Q+p[1]]+internal[r][u];if(z>next[u]){next[u]=z;back[r][u]=v}}}dp=next}
   let u=dp.indexOf(Math.max(...dp)),z=dp[u],row=Array(R);for(let r=R-1;r>=0;r--){row[r]=u;u=back[r][u]}return{row,z,P:row.flatMap((u,r)=>vals[r][u]),s}}
  // Full continuous score rerank; key candidates were derived without row-order information.
  let best=null;for(const p of (initial?[{s:initial}]:beam.slice(0,64))){const z=full(p.s);if(!best||z.z>best.z)best=z}
  const initialScore=best.z/H/(N*N-2);
  const normalize=s=>{const g=s[0]%Q;return s.map(a=>Math.floor(a/Q)*Q+mod(a%Q-g))};
  // Exact full-stream trigram order optimization conditional on fixed per-column and per-row masks.
  // Fix the first two columns, then a second-order subset DP; seam terms only use the first/last pairs.
  function exactOrder(s,row){
   const X=Array.from({length:N},(_,j)=>Uint8Array.from(row,(u,r)=>V[s[j]][r*Q+u])),T=new Int32Array(N**3);
   for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(a!==b)for(let c=0;c<N;c++)if(a!==c&&b!==c){let v=0;for(let r=0;r<N;r++)v+=L[(X[a][r]*Q+X[b][r])*Q+X[c][r]];T[(a*N+b)*N+c]=v}
   const F=(1<<N)-1,NN=N*N,dp=new Int32Array((F+1)*NN),back=new Int8Array((F+1)*NN);
   let bestValue=NEG,selected=null;
   for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(a!==b){
    const base=(1<<a)|(1<<b);dp.fill(NEG);back.fill(-1);dp[base*NN+a*N+b]=0;
    for(let m=base;m<F;m++){if((m&base)!==base)continue;const off=m*NN,remain=F^m;
     for(let x=0;x<N;x++)if(m&(1<<x))for(let y=0;y<N;y++)if(x!==y&&(m&(1<<y))){const v=dp[off+x*N+y];if(v===NEG)continue;
      for(let bits=remain;bits;bits&=bits-1){const bit=bits&-bits,c=31-Math.clz32(bit),ix=(m|bit)*NN+y*N+c,z=v+T[(x*N+y)*N+c];if(z>dp[ix]){dp[ix]=z;back[ix]=x}}
     }
    }
    for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(x!==y){let z=dp[F*NN+x*N+y];if(z===NEG)continue;for(let r=1;r<N;r++)z+=L[(X[x][r-1]*Q+X[y][r-1])*Q+X[a][r]]+L[(X[y][r-1]*Q+X[a][r])*Q+X[b][r]];
     if(z>bestValue){bestValue=z;let m=F,i=x,j=y,path=[y,x];while(m!==base){const q=back[m*NN+i*N+j];if(q<0)throw Error("order backtrace");m^=1<<j;j=i;i=q;path.push(i)}if(path.length!==N)throw Error("order length");selected=path.reverse().map(k=>s[k])}
    }
   }
   if(!selected)throw Error("no exact order");return {s:normalize(selected),z:bestValue};
  }
  const hist=[];
  for(let iter=0;iter<20;iter++){
   let next=best;
   const exact=exactOrder(best.s,best.row),ordered=full(exact.s);if(ordered.z<exact.z)throw Error("conditional order replay");
   if(ordered.z>next.z)next=ordered;
   function test(s){const z=full(normalize(s));if(z.z>next.z)next=z}
   const s=best.s;
   // Exact conditional row Viterbi for each tested order; contiguous relocations also cover rotations.
   for(let a=0;a<N;a++)for(let b=a+1;b<=N;b++){const chunk=s.slice(a,b),rem=s.slice(0,a).concat(s.slice(b));for(let d=0;d<=rem.length;d++)if(d!==a)test(rem.slice(0,d).concat(chunk,rem.slice(d)))}
   for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const t=s.slice();[t[a],t[b]]=[t[b],t[a]];test(t)}
   if(next.z===best.z){for(let j=1;j<N;j++){const t=s.slice(),a=Math.floor(t[j]/Q);for(let k=0;k<Q;k++)if(k!==t[j]%Q){t[j]=a*Q+k;test(t)}}}
   if(next.z===best.z)break;best=next;hist.push(best.z/H/(N*N-2));
  }
  const order=best.s.map(a=>Math.floor(a/Q)),shifts=best.s.map(a=>a%Q);for(let i=0;i<best.P.length;i++){const r=Math.floor(i/N),j=i%N;if(mod(best.P[i]+best.row[r]+shifts[j])!==C[r*N+order[j]])throw Error("replay")}
  return{ranks,initialScore,hist,order,shifts,row:best.row,P:best.P,score:best.z/H/(N*N-2),render:best.P.map(x=>c.translit[x]).join(" ")};
 }
 let seed=33013211;function rand(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 const out=[];
 const D=read(n.sections.find(s=>s.name===excluded[0]).source_text);
 for(let w=0;w<2;w++){const P=D.slice(w*121,(w+1)*121),order=Array.from({length:N},(_,j)=>j);for(let j=N-1;j>0;j--){const a=rand(j+1);[order[j],order[a]]=[order[a],order[j]]}const shifts=[0,...Array.from({length:N-1},()=>rand(Q))],row=Array.from({length:N},()=>rand(Q)),C=Array(N*N);for(let i=0;i<P.length;i++)C[Math.floor(i/N)*N+order[i%N]]=mod(P[i]+shifts[i%N]+row[Math.floor(i/N)]);
 const truth=order.map((a,j)=>a*Q+shifts[j]),z=beamSolve(C,truth,devInitial?devInitial[w].result.order.map((a,j)=>a*Q+devInitial[w].result.shifts[j]):null);out.push({w,correct:P.filter((x,i)=>x===z.P[i]).length,key:order.every((v,i)=>v===z.order[i]&&shifts[i]===z.shifts[i]),truthOrder:order,truthShifts:shifts,result:z})}
 return{K,trainingRunes:total,out};
}

if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),Number(process.argv[2]||1024)),null,2));
module.exports={experiment};
