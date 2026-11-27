'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const mod=(x,m)=>((x%m)+m)%m;
 const floor=(a,b)=>{if(b<0n){a=-a;b=-b}const q=a/b;return a<0n&&a%b!==0n?q-1n:q};
 const ceil=(a,b)=>-floor(-a,b),abs=x=>x<0n?-x:x;
 const inv=(a,m)=>{let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){const q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return mod(u,m)};
 const big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n);
 function digits(x,n){const a=[];for(let j=0;j<n;j++){a.push(Number(x%29n));x/=29n}return a}
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
 function enumerate(b1,b2,t,lo,hi){
  let u=b1,v=b2;for(;;){if(dot(v,v)<dot(u,u))[u,v]=[v,u];const q=floor(2n*dot(u,v)+dot(u,u),2n*dot(u,u));if(q===0n)break;v=[v[0]-q*u[0],v[1]-q*u[1]]}
  if(cross(u,v)<0n)[u,v]=[v,u];const d=cross(u,v);
  const corners=[lo,[lo[0],hi[1]],[hi[0],lo[1]],hi].map(p=>[p[0]-t[0],p[1]-t[1]]);
  const aa=corners.map(p=>cross(p,v)),bb=corners.map(p=>cross(u,p)),min=a=>a.reduce((x,y)=>x<y?x:y),max=a=>a.reduce((x,y)=>x>y?x:y);
  const amin=ceil(min(aa),d),amax=floor(max(aa),d),bmin=ceil(min(bb),d),bmax=floor(max(bb),d),out=[];
  for(let i=amin;i<=amax;i++)for(let j=bmin;j<=bmax;j++){const p=[t[0]+i*u[0]+j*v[0],t[1]+i*u[1]+j*v[1]];if(p.every((z,k)=>z>=lo[k]&&z<=hi[k]))out.push(p)}
  return {points:out,visited:String((amax<amin?0n:amax-amin+1n)*(bmax<bmin?0n:bmax-bmin+1n))};
 }
 function toy(){
 let checks=0;for(let m of [11n,29n,49n])for(let x=0n;x<m;x++)for(let y=0n;y<m;y+=3n){const lo=-7n,hi=7n,a=enumerate([1n,-x],[0n,m],[0n,y],[lo,lo],[hi,hi]).points.map(p=>p.join(",")).sort(),b=[];for(let A=lo;A<=hi;A++)for(let B=lo;B<=hi;B++)if(mod(A*x+B-y,m)===0n)b.push([A,B].join(","));b.sort();if(a.join(";")!==b.join(";"))throw Error("lattice mismatch");checks++}
 return checks;
 }
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)})),train=sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name));
 const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of train){const x=s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 const logs=t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)});
 function score(P,start,end){let s=0;for(let i=start+2;i<end;i++)s+=logs[(P[i-2]*29+P[i-1])*29+P[i]];return s/(end-start-2)}
 const title=[19,13,10,13,8,25,9,27,15,19,19,5,15],N=729,H=13,L=29n**7n,M=29n**13n,Q=29n**BigInt(N);
 function enc(P,A,B,forward){const x=big(P);return digits(forward?mod(A*x+B,Q):mod((x-B)*inv(A,Q),Q),N)}
 function dec(C,A,B,forward){const x=big(C);return digits(forward?mod((x-B)*inv(A,Q),Q):mod(A*x+B,Q),N)}
 function search(C,Ptitle,forward){
 const X=big(forward?Ptitle:C.slice(0,H)),Y=big(forward?C.slice(0,H):Ptitle);
 const E=enumerate([1n,-X],[0n,M],[0n,Y],[-L+1n,-L+1n],[L-1n,L-1n]),keys=E.points.filter(([A,B])=>A%29n!==0n);
 const ranked=keys.map(([A,B])=>{const P=dec(C,A,B,forward);if(P.slice(0,H).join()!==Ptitle.join())throw Error("crib mismatch");return {A:String(A),B:String(B),fit:score(P,H,262),P}}).sort((a,b)=>b.fit-a.fit);
 const best=ranked[0];if(!best)return {visited:E.visited,count:0,keys:[]};
 const replay=enc(best.P,BigInt(best.A),BigInt(best.B),forward).join()===C.join();
 return {visited:E.visited,count:keys.length,keys:ranked.map(({A,B,fit})=>({A,B,fit})),winner:{A:best.A,B:best.B,fit:best.fit,held:score(best.P,262,N),replay},P:best.P};
 }
 const C=corpus.pages.slice(0,3).flatMap(p=>p.indices),out={title,cipherTitle:C.slice(0,H),domain:"signed unit A, signed B, abs(A),abs(B)<29^7",toyChecks:toy(),original:[],plants:[]};
 for(const forward of [false,true]){
 const x=search(C,title,forward),{P,...rest}=x;out.original.push({forward,...rest,sample:P?P.slice(H,H+140).map(v=>corpus.translit[v]).join(" "):null});
 const D=sections.find(s=>s.name===(forward?"0_loss_of_divinity":"0_koan_1")).seq.slice(0,N),A=forward?-9876543211n:12345678901n,B=forward?1234567890n:-8765432109n;if(A%29n===0n||abs(A)>=L||abs(B)>=L)throw Error("bad control key");
 const z=search(enc(D,A,B,forward),D.slice(0,H),forward),{P:PP,...rr}=z;out.plants.push({forward,expectedA:String(A),expectedB:String(B),...rr,fitCorrect:PP?PP.slice(H,262).filter((v,i)=>v===D[i+H]).length:0,heldCorrect:PP?PP.slice(262).filter((v,i)=>v===D[i+262]).length:0});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
