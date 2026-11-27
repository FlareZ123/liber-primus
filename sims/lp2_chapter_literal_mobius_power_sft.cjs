'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const mod=(a,m)=>((a%m)+m)%m;
 function inv(a,m){let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){const q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return mod(u,m)}
 const power=(a,e,m)=>{if(e<0){a=inv(a,m);e=-e}let z=1n;while(e){if(e%2)z=z*a%m;a=a*a%m;e=Math.floor(e/2)}return z};
 const big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n);
 function digits(x,n){const a=[];for(let i=0;i<n;i++){a.push(Number(x%29n));x/=29n}return a}
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 function model(reverse){
  const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
  for(const s of train){const x=reverse?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++;}}
  const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);
  for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
  return t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,prev=a%29;return Math.log(.6*v/ts[a]+.3*b[prev*29+c]/bs[prev]+.1*u[c]/us)});
 }

 const g=m=>423n*inv(121n,m)%m;
 function apply(x,h,m){const u=mod((x+1n)*h,m),v=mod(x-1n,m),d=mod(u-v,m);if(d%29n===0n)return null;return mod((u+v)*inv(d,m),m)}
 function search(C,fit,reverse){
 const logs=model(reverse),score=(x,start,end)=>{let s=0;for(let i=start+2;i<end;i++)s+=logs[(x[i-2]*29+x[i-1])*29+x[i]];return s/(end-start-2)};
 const m=29n**BigInt(fit),M=29n**BigInt(C.length),base=g(m),x=big(C.slice(0,fit)),X=big(C),limit=3301;let h=power(base,-limit,m),best=null,runner=null,count=0;
 for(let e=-limit;e<=limit;e++,h=h*base%m){const y=apply(x,h,m);if(y===null)continue;count++;const P=digits(y,fit),v={e,fitScore:score(P,0,fit)};if(!best||v.fitScore>best.fitScore){runner=best;best=v}else if(!runner||v.fitScore>runner.fitScore)runner=v}
 const P=digits(apply(X,power(g(M),best.e,M),M),C.length);const replay=apply(big(P),power(g(M),-best.e,M),M)===X;return {...best,runner,count,held:score(P,fit,P.length),replay,P};
 }
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13),out={matrix:[[272,151],[151,272]],ratio:"423/121",order29:Array.from({length:28},(_,i)=>i+1).find(e=>power(g(29n),e,29n)===1n),power28mod841:String(power(g(841n),28,841n)),domain:"all integer e in [-3301,3301] with finite output",original:[],plants:[]};
 for(const [reverse,fit] of [[false,249],[true,201]]){
 const C=reverse?[...opening].reverse():opening,orig=search(C,fit,reverse),{P,...rest}=orig;out.original.push({reverse,fit,...rest,rendered:(reverse?[...P].reverse():P).slice(0,180).map(x=>corpus.translit[x]).join(" ")});
 const donor=sections.find(x=>x.name===(reverse?"0_loss_of_divinity":"0_koan_1")).seq.slice(0,opening.length),D=reverse?[...donor].reverse():donor,M=29n**BigInt(D.length);let e=reverse?-3301:1033,y=apply(big(D),power(g(M),-e,M),M);while(y===null){e++;y=apply(big(D),power(g(M),-e,M),M)}
 const plant=search(digits(y,D.length),fit,reverse),{P:pp,...p}=plant;out.plants.push({reverse,fit,expectedE:e,...p,fitCorrect:pp.slice(0,fit).filter((v,i)=>v===D[i]).length,heldCorrect:pp.slice(fit).filter((v,i)=>v===D[i+fit]).length,heldN:D.length-fit});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
