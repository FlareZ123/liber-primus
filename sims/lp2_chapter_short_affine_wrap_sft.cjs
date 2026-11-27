'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const M=29**3,MAX=3301,L=32,K=512;
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(c=>native.runes.indexOf(c)).filter(x=>x>=0)}));
 const train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const big=x=>x.reduce((v,c)=>v*29n+BigInt(c),0n);
 const digits=(x,N)=>{const p=Array(N);for(let i=N-1;i>=0;i--){p[i]=Number(x%29n);x/=29n}if(x!==0n)throw Error("digit overflow");return p};
 function model(reverse){
  const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
  for(const s of train){const x=reverse?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++;}}
  const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);
  for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
  return t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,prev=a%29;return Math.log(.6*v/ts[a]+.3*b[prev*29+c]/bs[prev]+.1*u[c]/us)});
 }
 function solve(C,fit,reverse,plantInfo=null){
  const N=C.length,Q=29n**BigInt(N),Cn=big(C),logs=model(reverse);
  if(Cn<=BigInt(M+MAX)||big(C.slice(fit))<=BigInt(M+MAX))throw Error("prefix offset independence not established");
  const comp=logs.map((_,i)=>logs[24388-i]),score=(x,l,h)=>{let s=0;for(let i=l+2;i<h;i++)s+=logs[(x[i-2]*29+x[i-1])*29+x[i]];return s/(h-l-2)};
  const heap=[];let count=0;
  function push(a,k,sign,v){
   if(heap.length===K&&v<=heap[0].v)return;
   const x={a,k,sign,v};
   if(heap.length<K){let i=heap.length;heap.push(x);while(i){const p=(i-1)>>1;if(heap[p].v<=x.v)break;heap[i]=heap[p];i=p;}heap[i]=x;}
   else{let i=0;while(true){let j=2*i+1;if(j>=heap.length)break;if(j+1<heap.length&&heap[j+1].v<heap[j].v)j++;if(heap[j].v>=x.v)break;heap[i]=heap[j];i=j;}heap[i]=x;}
  }
  function prefix(a,k,n,sign){let rem=k,x=0,y=0,s=0;const lm=sign===1?logs:comp;for(let i=0;i<n;i++){const z=29*rem+C[i],p=Math.floor(z/a);rem=z-p*a;if(i>=2)s+=lm[(x*29+y)*29+p];x=y;y=p;}return s;}
  let trueRank=null,truthScore=null,truthK=null;
  if(plantInfo){const {A,B,P}=plantInfo;const a=Math.abs(A);const pp=big(P);const numerator=BigInt(a)*(A>0?pp:Q-1n-pp)+BigInt(A>0?B:a+B)-Cn;truthK=Number(numerator/Q);if(numerator%Q!==0n)throw Error("plant wrap");truthScore=prefix(a,truthK,L,Math.sign(A));trueRank=1;}
  for(let a=1;a<=MAX;a++){if(a%29===0)continue;for(let k=0;k<a;k++){
   let rem=k,x=0,y=0,s=0,t=0;
   for(let i=0;i<L;i++){const z=29*rem+C[i],p=Math.floor(z/a);rem=z-p*a;if(i>=2){const h=(x*29+y)*29+p;s+=logs[h];t+=comp[h];}x=y;y=p;}
   if(truthScore!==null){if(s>truthScore)trueRank++;if(t>truthScore)trueRank++}
   push(a,k,1,s);push(a,k,-1,t);count+=2;
  }}
  const ranked=heap.map(x=>({...x,fit:prefix(x.a,x.k,fit,x.sign)/(fit-2)})).sort((x,y)=>y.fit-x.fit||y.v-x.v||x.a-y.a||x.k-y.k||y.sign-x.sign);
  const w=ranked[0],a=BigInt(w.a),S=Cn+BigInt(w.k)*Q,D=S/a,rem=S%a,jmax=(BigInt(M-1)-rem)/a,P0=w.sign===1?D:Q-D;
  const threshold=w.sign===1?P0%BigInt(M)+1n:BigInt(M)-P0%BigInt(M);
  const ranges=[[0n,jmax<threshold?jmax:threshold-1n]];if(threshold<=jmax)ranges.push([threshold,jmax]);
  const branches=ranges.filter(([l,h])=>l<=h).map(([l,h])=>{
   const Pn=P0-BigInt(w.sign)*l,P=digits(Pn,N),B=rem+a*l,Bhi=rem+a*h;
   const A=BigInt(w.sign*w.a),replay=((A*Pn+B)%Q+Q)%Q===Cn;
   return {Bmin:Number(B),Bmax:Number(Bhi),Bstep:w.a,held:score(P,fit,N-3),replay,fitAgreement:plantInfo?P.slice(0,fit).filter((x,i)=>x===plantInfo.P[i]).length:null,heldAgreement:plantInfo?P.slice(fit,N-3).filter((x,i)=>x===plantInfo.P[fit+i]).length:null,containsTrueB:plantInfo?BigInt(plantInfo.B)>=B&&BigInt(plantInfo.B)<=Bhi&&(BigInt(plantInfo.B)-B)%a===0n:null,rendered:(reverse?[...P].reverse():P).slice(0,120).map(x=>corpus.translit[x]).join(" ")};
  });
  return {count,prefixLength:L,retained:K,fit,reverse,winner:w,runner:ranked[1],trueRank,truthK,truthScore,truthInHeap:plantInfo?heap.some(x=>x.a===Math.abs(plantInfo.A)&&x.k===truthK&&x.sign===Math.sign(plantInfo.A)):null,heldN:N-fit-3,branches};
 }
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),out={domain:"1<=abs(A)<=3301, 29∤A; 0<=B<29^3; encryption C=A*P+B mod 29^716",original:[],plants:[]};
 for(const [reverse,fit] of [[false,249],[true,201]]){
  const C=reverse?[...opening].reverse():opening;
  out.original.push(solve(C,fit,reverse));
  const donor=sections.find(x=>x.name===(reverse?"0_loss_of_divinity":"0_koan_1")).seq.slice(0,opening.length),P=reverse?[...donor].reverse():donor;
  const A=reverse?-3301:1033,B=reverse?22001:17659,Q=29n**BigInt(P.length),Cn=((BigInt(A)*big(P)+BigInt(B))%Q+Q)%Q,plant=digits(Cn,P.length);
  out.plants.push({A,B,...solve(plant,fit,reverse,{A,B,P})});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
