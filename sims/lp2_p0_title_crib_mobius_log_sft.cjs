'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const mod=(x,m)=>((x%m)+m)%m;
 const floor=(a,b)=>{if(b<0n){a=-a;b=-b}const q=a/b;return a<0n&&a%b!==0n?q-1n:q};
 const ceil=(a,b)=>-floor(-a,b),abs=x=>x<0n?-x:x;
 const inv=(a,m)=>{let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){const q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return mod(u,m)};
 const big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n);
 function digits(x,n){const a=[];for(let j=0;j<n;j++){a.push(Number(x%29n));x/=29n}return a}
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)})),train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of train){const x=s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 const logs=t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)});
 function score(P,start,end){let s=0;for(let i=start+2;i<end;i++)s+=logs[(P[i-2]*29+P[i-1])*29+P[i]];return s/(end-start-2)}
 const title=[19,13,10,13,8,25,9,27,15,19,19,5,15],N=729,H=13,L=29n**7n,M=29n**13n,Q=29n**BigInt(N);

 function power(a,e,m){if(e<0n){a=inv(a,m);e=-e}let z=1n;while(e){if(e%2n)z=z*a%m;a=a*a%m;e/=2n}return z}
 const g=m=>423n*inv(121n,m)%m;
 function apply(x,e,m){const h=power(g(m),e,m),u=mod((x+1n)*h,m),v=mod(x-1n,m),d=mod(u-v,m);if(d%29n===0n)return null;return mod((u+v)*inv(d,m),m)}
 function recover(C,Ptitle){
 const x=big(C.slice(0,H)),y=big(Ptitle),u=mod((y+1n)*(x-1n),M),v=mod((y-1n)*(x+1n),M);
 if(u%29n===0n||v%29n===0n)return {status:"nonunit title ratio"};
 const z=mod(u*inv(v,M),M);let e=0n,step=1n,trace=[];
 for(let j=1;j<=H;j++){const m=29n**BigInt(j),found=[];for(let k=0n;k<(j===1?28n:29n);k++){const f=e+k*step;if(power(g(m),f,m)===z%m)found.push(f)}
 if(found.length!==1)throw Error("discrete log uniqueness");e=found[0];step=28n*29n**BigInt(j-1);trace.push(String(e))}
 const E=e>step/2n?e-step:e,XX=big(C),P=digits(apply(XX,E,Q),N),replay=apply(big(P),-E,Q)===XX;if(P.slice(0,H).join()!==Ptitle.join()||!replay)throw Error("crib/replay");
 return {e:String(e),centeredE:String(E),order:String(step),trace,fit:score(P,H,262),held:score(P,262,N),replay,P};
 }
 const C=corpus.pages.slice(0,3).flatMap(p=>p.indices),x=recover(C,title),{P,...rest}=x,out={title,cipherTitle:C.slice(0,H),original:{...rest,sample:P?P.slice(H,H+140).map(v=>corpus.translit[v]).join(" "):null},plants:[]};
 for(const [name,e0] of [["0_koan_1",123456789012345678n],["0_loss_of_divinity",-987654321098765432n]]){
 const D=sections.find(s=>s.name===name).seq.slice(0,N);let E=e0,cc=apply(big(D),-E,Q);while(cc===null){E++;cc=apply(big(D),-E,Q)}
 const r=recover(digits(cc,N),D.slice(0,H)),{P:PP,...rr}=r;
 out.plants.push({name,expectedE:String(E),...rr,fitCorrect:PP?PP.slice(H,262).filter((v,i)=>v===D[i+H]).length:0,heldCorrect:PP?PP.slice(262).filter((v,i)=>v===D[i+262]).length:0});
 }
 return out;
}

console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
