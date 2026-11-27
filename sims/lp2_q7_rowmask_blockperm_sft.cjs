'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];

function experiment(raw) {
 const [c0,n0,...lit]=raw,c=JSON.parse(c0),n=JSON.parse(n0),Q=29,N=7,F=(1<<N)-1,NEG=-1e12,mod=x=>(x%Q+Q)%Q;
 const read=s=>[...s].filter(x=>c.runes.includes(x)).map(x=>c.runes.indexOf(x));
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){return(s.match(/[a-z]+/gi)||[]).flatMap(w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}return a})}
 const T=lit.map(gp),n1=new Uint32Array(Q),n2=new Uint32Array(Q*Q),n3=new Uint32Array(Q**3),ctx=new Uint32Array(Q),ctx3=new Uint32Array(Q*Q),diff=new Uint32Array(Q);let total=0;
 // All native solved sections and Gibran are excluded from training for this test.
 for(const t of T.slice(1)){for(let i=0;i<t.length;i++){const p=t[i];n1[p]++;total++;if(i){n2[t[i-1]*Q+p]++;ctx[t[i-1]]++;diff[mod(p-t[i-1])]++}if(i>1){const j=t[i-2]*Q+t[i-1];n3[j*Q+p]++;ctx3[j]++}}}
 const U=Float64Array.from(n1,x=>Math.log((x+1)/(total+Q))),B=new Float64Array(Q*Q),L=new Float64Array(Q**3),D=Float64Array.from(diff,x=>Math.log((x+1)/(total-2+Q)));
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)B[a*Q+b]=Math.log((n2[a*Q+b]+16*Math.exp(U[b]))/(ctx[a]+16));
 for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let d=0;d<Q;d++)L[(a*Q+b)*Q+d]=Math.log((n3[(a*Q+b)*Q+d]+12*Math.exp(B[b*Q+d]))/(ctx3[a*Q+b]+12));
 function score(p){let s=0;for(let i=2;i<p.length;i++)s+=L[(p[i-2]*Q+p[i-1])*Q+p[i]];return s/(p.length-2)}
 function initializer(C){
  const R=C.length/N;if(!Number.isInteger(R))throw Error("blocks");
  const E=Array.from({length:N},()=>Array(N).fill(null));
  for(let a=0;a<N;a++)for(let b=0;b<N;b++)if(a!==b){const h=new Uint32Array(Q);for(let r=0;r<R;r++)h[mod(C[r*N+b]-C[r*N+a])]++;let v=NEG,k=0;for(let d=0;d<Q;d++){let s=0;for(let j=0;j<Q;j++)s+=h[j]*D[mod(j-d)];if(s>v){v=s;k=d}}E[a][b]={v,k}}
  // Enumerate only 7! orderings; for each all 29^6 difference shifts are optimized independently.
  const all=[];function walk(o,mask,k,s){if(mask===F){all.push({o,k,s});return}for(let j=0;j<N;j++)if(!(mask&(1<<j))){const e=o.length?E[o.at(-1)][j]:null;walk([...o,j],mask|(1<<j),[...k,e?mod(k.at(-1)+e.k):0],s+(e?e.v:0))}}
  walk([],0,[],0);all.sort((a,b)=>b.s-a.s);return all;
 }
 function solve(C, frozen=null){
  const R=C.length/N, V=Array.from({length:N*Q},(_,a)=>Uint8Array.from({length:R*Q},(_,i)=>mod(C[Math.floor(i/Q)*N+Math.floor(a/Q)]-a%Q-i%Q)));
  const normalize=s=>{const g=s[0]%Q;return s.map(a=>Math.floor(a/Q)*Q+mod(a%Q-g))};
  function objective(s){let z=0;const a=s.map(j=>V[j]);for(let r=0;r<R;r++){let m=NEG,ss=0;for(let u=0;u<Q;u++){const i=r*Q+u,p0=a[0][i],p1=a[1][i],p2=a[2][i],p3=a[3][i],p4=a[4][i],p5=a[5][i],p6=a[6][i];
    const v=U[p0]+B[p0*Q+p1]+L[(p0*Q+p1)*Q+p2]+L[(p1*Q+p2)*Q+p3]+L[(p2*Q+p3)*Q+p4]+L[(p3*Q+p4)*Q+p5]+L[(p4*Q+p5)*Q+p6];
    if(v>m){ss=ss*Math.exp(m-v)+1;m=v}else ss+=Math.exp(v-m)
   }z+=m+Math.log(ss/Q)}return z}
  let selected, initRank=null, optimum=null;
  if(frozen){selected=frozen.order.map((a,j)=>a*Q+frozen.shifts[j]);}
  else {
   const all=initializer(C);optimum=all[0].s/((N-1)*R);let best=NEG;
   // Rerank 32 difference-optimal paths by the row-offset-marginalized native trigram likelihood.
   const candidates=all.slice(0,32).map((p,i)=>{const s=p.o.map((a,j)=>a*Q+p.k[j]);return{s,rank:i,z:objective(s)}}).sort((a,b)=>b.z-a.z);
   for(const q of candidates.slice(0,2)){
    let s=q.s,z=q.z;
    for(let iter=0;iter<12;iter++){let next=null,high=z;const test=t=>{const score=objective(t);if(score>high+1e-7){next=t.slice();high=score}};
     for(let j=1;j<N;j++){const t=s.slice(),a=Math.floor(t[j]/Q);for(let k=0;k<Q;k++)if(k!==t[j]%Q){t[j]=a*Q+k;test(t)}}
     for(let a=0;a<N;a++)for(let b=a+1;b<N;b++){const t=s.slice();[t[a],t[b]]=[t[b],t[a]];test(t)}
     if(!next)break;s=normalize(next);z=high;
    }if(z>best){best=z;selected=s;initRank=q.rank}
   }
  }
  const order=selected.map(a=>Math.floor(a/Q)),shifts=selected.map(a=>a%Q),A=selected.map(a=>V[a]);
  // Exact Viterbi over all row offsets, under continuous trigram score including cross-row seams.
  const vals=Array.from({length:R},(_,r)=>Array.from({length:Q},(_,u)=>A.map(a=>a[r*Q+u])));
  const internal=vals.map(rows=>rows.map(p=>{let z=0;for(let j=2;j<N;j++)z+=L[(p[j-2]*Q+p[j-1])*Q+p[j]];return z}));
  let dp=Float64Array.from(internal[0]),back=Array.from({length:R},()=>new Uint8Array(Q));
  for(let r=1;r<R;r++){const next=new Float64Array(Q).fill(NEG);for(let u=0;u<Q;u++){const p=vals[r][u];for(let v=0;v<Q;v++){const q=vals[r-1][v],z=dp[v]+L[(q[N-2]*Q+q[N-1])*Q+p[0]]+L[(q[N-1]*Q+p[0])*Q+p[1]]+internal[r][u];if(z>next[u]){next[u]=z;back[r][u]=v}}}dp=next}
  let u=dp.indexOf(Math.max(...dp)),row=Array(R);for(let r=R-1;r>=0;r--){row[r]=u;u=back[r][u]}
  const P=row.flatMap((u,r)=>vals[r][u]);for(let i=0;i<P.length;i++){let r=Math.floor(i/N),j=i%N;if(mod(P[i]+row[r]+shifts[j])!==C[r*N+order[j]])throw Error("replay")}
  return {order,shifts,row,P,score:score(P),marginal:objective(selected)/R,exactDifferenceMaximum:optimum,initializerRank:initRank,render:P.slice(0,140).map(x=>c.translit[x]).join(" ")};
 }
 let seed=0x33010607;function random(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
 function plant(P,key=null){let order=Array.from({length:N},(_,j)=>j);for(let j=N-1;j>0;j--){const a=random(j+1);[order[j],order[a]]=[order[a],order[j]]}if(key)order=key.order.slice();const shifts=key?key.shifts.slice():[0,...Array.from({length:N-1},()=>random(Q))],row=Array.from({length:P.length/N},()=>random(Q)),C=Array(P.length);for(let i=0;i<P.length;i++)C[Math.floor(i/N)*N+order[i%N]]=mod(P[i]+row[Math.floor(i/N)]+shifts[i%N]);return {order,shifts,row,C}}

 const control=[];
 for(const offset of [0,1729,3458,5187,8813,12440]){const P=T[0].slice(offset,offset+1729),p=plant(P),z=solve(p.C),held=[];if(offset>=5187){for(const [off,len] of [[offset+1729,1589],[offset+3318,308]]){const H=T[0].slice(off,off+len),h=plant(H,p),v=solve(h.C,z);held.push({offset:off,length:len,truthScore:score(H),correct:H.filter((x,i)=>x===v.P[i]).length,result:v})}}
 control.push({offset,truthScore:score(P),correct:P.filter((x,i)=>x===z.P[i]).length,orderCorrect:p.order.every((x,i)=>x===z.order[i]),shiftCorrect:p.shifts.every((x,i)=>x===z.shifts[i]),truthOrder:p.order,truthShifts:p.shifts,result:z,held})}
 const original=[];
 if(control.slice(3).every(z=>z.orderCorrect&&z.shiftCorrect&&z.correct>=1643&&z.held.every(h=>h.correct>=0.9*h.length))){
 const spans=[[8,14,0],[33,39,91],[54,55,0]],C=spans.map(([a,b,k])=>c.pages.slice(a,b+1).flatMap(p=>p.indices).slice(k));if(C.map(t=>t.length).join()!=="1729,1589,308")throw Error("span length");const fit=solve(C[0]);original.push(fit,...C.slice(1).map(t=>solve(t,fit)));
 }
 return {trainingRunes:total,control,original};
}

if(require.main===module)console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
module.exports={experiment};
