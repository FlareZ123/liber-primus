'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
function experiment(raw, mode="all"){
 const [c0,n0,...lit]=raw,c=JSON.parse(c0),n=JSON.parse(n0),Q=29,N=11,S=N*Q,F=(1<<N)-1,NEG=-1e9,mod=x=>(x+Q)%Q;
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a})}
 const donor=n.sections.find(s=>s.name==="0_loss_of_divinity"),D=read(donor.source_text),training=[...n.sections.filter(s=>s!==donor).map(s=>read(s.source_text)),...lit.map(gp)];
 const n1=new Uint32Array(Q),n2=new Uint32Array(Q*Q),ctx=new Uint32Array(Q);let total=0;
 for(const T of training){for(let i=0;i<T.length;i++){const p=T[i];n1[p]++;total++;if(i){n2[T[i-1]*Q+p]++;ctx[T[i-1]]++}}}
 const U=Int32Array.from(n1,x=>Math.round(1024*Math.log((x+1)/(total+Q)))),B=new Int32Array(Q*Q);
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)B[a*Q+b]=Math.round(1024*Math.log((n2[a*Q+b]+16*(n1[b]+1)/(total+Q))/(ctx[a]+16)));
 function score(P){let train=0,seam=0;for(let r=0;r<N;r++){train+=U[P[r*N]];for(let j=1;j<N;j++)train+=B[P[r*N+j-1]*Q+P[r*N+j]];if(r)seam+=B[P[r*N-1]*Q+P[r*N]]}return{train:train/1024/(N*N),seam:seam/1024/(N-1),rawTrain:train}}
 function attack(C){
  const v=Array.from({length:S},(_,s)=>Uint8Array.from({length:N},(_,r)=>mod(C[r*N+Math.floor(s/Q)]-s%Q))),start=new Int32Array(S),edge=new Int32Array(S*S);
  for(let a=0;a<S;a++){for(let r=0;r<N;r++)start[a]+=U[v[a][r]];for(let b=0;b<S;b++){let z=0;for(let r=0;r<N;r++)z+=B[v[a][r]*Q+v[b][r]];edge[a*S+b]=z}}
  const dp=new Int32Array((F+1)*S).fill(NEG),back=new Int16Array((F+1)*S).fill(-1);
  for(let a=0;a<S;a++)dp[(1<<Math.floor(a/Q))*S+a]=start[a];
  for(let m=1;m<F;m++){const base=m*S;for(let j=0;j<N;j++)if(m&(1<<j)){for(let a=j*Q;a<(j+1)*Q;a++){const d=dp[base+a];if(d===NEG)continue;const e=a*S;for(let k=0;k<N;k++)if(!(m&(1<<k))){const nb=(m|(1<<k))*S;for(let b=k*Q;b<(k+1)*Q;b++){const s=d+edge[e+b];if(s>dp[nb+b]){dp[nb+b]=s;back[nb+b]=a}}}}}}
  let end=0;for(let a=1;a<S;a++)if(dp[F*S+a]>dp[F*S+end])end=a;const optimum=dp[F*S+end],states=[];let m=F;
  while(end>=0){states.unshift(end);const prev=back[m*S+end];m^=1<<Math.floor(end/Q);end=prev}
  if(states.length!==N||m)throw Error("bad backtrace");const order=states.map(a=>Math.floor(a/Q)),shifts=states.map(a=>a%Q),P=Array.from({length:N*N},(_,i)=>v[states[i%N]][Math.floor(i/N)]);
  if(score(P).rawTrain!==optimum)throw Error("objective");const replay=Array(N*N);for(let i=0;i<P.length;i++)replay[Math.floor(i/N)*N+order[i%N]]=(P[i]+shifts[i%N])%Q;if(replay.some((x,i)=>x!==C[i]))throw Error("replay");
  return{order,shifts,P,score:score(P),render:P.map(x=>c.translit[x]).join(" ")};
 }
 let seed=3301;function random(n){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%n}
 const controls=[];
 for(let k=0;k<6;k++){const P=D.slice(k*121,(k+1)*121);if(P.length!==121)throw Error("donor");const order=Array.from({length:N},(_,j)=>j);for(let j=N-1;j>0;j--){const a=random(j+1);[order[j],order[a]]=[order[a],order[j]]}const shifts=Array.from({length:N},()=>random(Q)),C=Array(N*N);for(let i=0;i<P.length;i++)C[Math.floor(i/N)*N+order[i%N]]=(P[i]+shifts[i%N])%Q;const z=attack(C);controls.push({k,truth:score(P),correct:z.P.filter((x,i)=>x===P[i]).length,orderCorrect:z.order.every((x,i)=>x===order[i]),shiftCorrect:z.shifts.every((x,i)=>x===shifts[i]),result:z,truthOrder:order,truthShifts:shifts})}
 const out={trainingRunes:total,controls,original:null};
 if(mode==="all"&&controls.every(x=>x.correct>=115)){const P=c.pages[32].indices;if(P.length!==121)throw Error("p32");out.original=attack(P)}
 return out;
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
