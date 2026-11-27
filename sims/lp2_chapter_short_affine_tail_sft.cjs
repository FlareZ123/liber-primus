'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const Q=29**3, mod=(a)=>((a%29)+29)%29;
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(c=>native.runes.indexOf(c)).filter(x=>x>=0)}));
 const train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 function model(reverse){
  const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
  for(const s of train){const x=reverse?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++;}}
  const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);
  for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
  return t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,prev=a%29;return Math.log(.6*v/ts[a]+.3*b[prev*29+c]/bs[prev]+.1*u[c]/us)});
 }
 function encode(P,A,B){
  const m=29n**BigInt(P.length),a=BigInt(A),b=BigInt(B);let x=0n;for(let i=P.length-1;i>=0;i--)x=x*29n+BigInt(P[i]);
  let [v,w,s,t]=[a,m,1n,0n];while(w){const q=v/w;[v,w]=[w,v-q*w];[s,t]=[t,s-q*t]};if(v===-1n)s=-s;
  let y=((s*(x-b))%m+m)%m;const C=[];for(let i=0;i<P.length;i++){C.push(Number(y%29n));y/=29n;}return C;
 }
 function decode(C,A,B){let carry=B;return C.map(c=>{const n=A*c+carry,p=mod(n);carry=(n-p)/29;return p})}
 function search(C,fit,reverse){
  const logs=model(reverse);const score=(x,start,end)=>{let s=0;for(let i=start+2;i<end;i++)s+=logs[(x[i-2]*29+x[i-1])*29+x[i]];return s/(end-start-2)};
  const low=C[0]+29*C[1]+841*C[2];let best=null,runner=null,count=0;
  for(let A=-Q+1;A<Q;A++){if(A%29===0)continue;const S=A*low,h=Math.floor(S/Q),threshold=(h+1)*Q-S;
   for(let k=0;k<2;k++){const lo=k?threshold:0,hi=k?Q-1:threshold-1;if(lo>hi)continue;count++;let carry=h+k,sum=0,x=0,y=0;
    for(let i=3;i<fit;i++){const n=A*C[i]+carry,z=mod(n);carry=(n-z)/29;if(i>=5)sum+=logs[(x*29+y)*29+z];x=y;y=z;}
    const v={A,lo,hi,carryBranch:k,fit:sum/(fit-5)};
    if(!best||v.fit>best.fit){runner=best;best=v;}else if(!runner||v.fit>runner.fit)runner=v;
   }
  }
  const P=decode(C,best.A,best.lo);const replay=encode(P,best.A,best.lo).every((v,i)=>v===C[i]);return {...best,runner,count,held:score(P,fit,P.length),replay,P};
 }
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13);const out={Q,domain:"signed unit A with abs(A)<29^3; 0<=B<29^3",original:[],plants:[]};
 for(const [reverse,fit] of [[false,249],[true,201]]){
  const C=reverse?[...opening].reverse():opening;
  const p=search(C,fit,reverse);const {P,...rest}=p;
  out.original.push({reverse,fit,...rest,rendered:(reverse?[...P].reverse():P).slice(0,180).map(x=>corpus.translit[x]).join(" ")});
  const donor=sections.find(x=>x.name===(reverse?"0_loss_of_divinity":"0_koan_1")).seq.slice(0,opening.length);const D=reverse?[...donor].reverse():donor;
  const A=reverse?-3301:1033,B=reverse?22001:17659;const plant=encode(D,A,B),p2=search(plant,fit,reverse);const {P:P2,...rest2}=p2;
  out.plants.push({reverse,fit,expectedA:A,expectedB:B,...rest2,containsB:p2.lo<=B&&B<=p2.hi,fitCorrect:P2.slice(3,fit).filter((x,i)=>x===D[i+3]).length,heldCorrect:P2.slice(fit).filter((x,i)=>x===D[i+fit]).length,heldN:D.length-fit});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
