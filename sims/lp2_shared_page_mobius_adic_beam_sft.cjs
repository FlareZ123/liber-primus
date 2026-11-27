'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)})),N=20,W=16,M=29n**BigInt(N),mod=(x,m)=>((x%m)+m)%m,big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n);
 function inv(a,m){let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){const q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return mod(u,m)}
 function power(a,e,m){if(e<0n){a=inv(a,m);e=-e}let z=1n;while(e){if(e%2n)z=z*a%m;a=a*a%m;e/=2n}return z}
 const g=m=>423n*inv(121n,m)%m;
 function apply(x,h,m){const u=mod((x+1n)*h,m),v=mod(x-1n,m),d=mod(u-v,m);if(d%29n===0n)return null;return mod((u+v)*inv(d,m),m)}
 function digits(x,n=N){const d=[];for(let j=0;j<n;j++){d.push(Number(x%29n));x/=29n}return d}
 function model(rev){
 const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name))){const x=rev?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 return {u:u.map(v=>Math.log(v/us)),b:b.map((v,i)=>Math.log(.8*v/bs[Math.floor(i/29)]+.2*u[i%29]/us)),t:t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)})}
 }
 function score(P,l){let sum=0,count=0;for(const p of P)for(let j=0;j<p.length;j++){sum+=j===0?l.u[p[j]]:j===1?l.b[p[j-1]*29+p[j]]:l.t[(p[j-2]*29+p[j-1])*29+p[j]];count++}return sum/count}
 function recover(C,rev,truth){
 const X=C.map(big),fit=X.filter((_,i)=>i%4!==3),held=X.filter((_,i)=>i%4===3),l=model(rev),trace=[];let beam=[{e:0n,s:0}],step=1n;
 const admissible=[];
 for(let e=0n;e<28n;e++){const h=power(g(29n),e,29n);if(X.every(x=>apply(x,h,29n)!==null))admissible.push(Number(e))}
 // Finite output is a ciphertext-only structural restriction, evaluated on fit and held without language scoring.
 for(let j=1;j<=N;j++){
 const m=29n**BigInt(j),base=g(m),next=[],hs=power(base,step,m),ranges=j===1?admissible:Array.from({length:29},(_,i)=>i);
 for(const s of beam){const h0=power(base,s.e,m);for(const k of ranges){const e=s.e+BigInt(k)*step,h=h0*power(hs,BigInt(k),m)%m,ys=fit.map(x=>apply(x,h,m));if(ys.some(y=>y===null))continue;next.push({e,s:score(ys.map(x=>digits(x,j)),l)})}}
 next.sort((a,b)=>b.s-a.s);beam=next.slice(0,W);const order=28n*29n**BigInt(j-1);trace.push({j,score:beam[0].s,truthRetained:truth===null?null:beam.some(s=>s.e===mod(truth,order))});step=order;
 }
 const e=beam[0].e,h=power(g(M),e,M),P=X.map(x=>digits(apply(x,h,M))),Pfit=P.filter((_,i)=>i%4!==3),Pheld=P.filter((_,i)=>i%4===3),hi=power(g(M),-e,M),replay=P.every((p,i)=>apply(big(p),hi,M)===X[i]);
 return {e:String(e),admissible,fit:score(Pfit,l),held:score(Pheld,l),fitN:fit.length,heldN:held.length,replay,trace,P};
 }
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length>=N),donors=sections.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name)).flatMap(s=>Array.from({length:Math.floor(s.seq.length/N)},(_,i)=>s.seq.slice(i*N,(i+1)*N))).slice(0,pages.length),out={N,W,domain:"all exponents mod 28*29^19 via top16 beam, finite output",original:[],plants:[]};
 for(const rev of [false,true]){
 const C=pages.map(p=>(rev?[...p.indices].reverse():p.indices).slice(0,N)),x=recover(C,rev,null),{P,...rest}=x;out.original.push({rev,...rest,sample:P.slice(0,5).map((p,i)=>({page:pages[i].page,text:(rev?[...p].reverse():p).map(v=>corpus.translit[v]).join(" ")}))});
 const D=donors.map(p=>rev?[...p].reverse():p),e=(rev?123456789876543210123456789n:9876543212345678987654321n)*28n,hi=power(g(M),-e,M),plant=D.map(p=>digits(apply(big(p),hi,M))),y=recover(plant,rev,e),{P:PP,...rr}=y;
 out.plants.push({rev,expectedE:String(mod(e,28n*29n**19n)),...rr,correct:PP.map((p,i)=>p.filter((v,j)=>v===D[i][j]).length).reduce((a,b)=>a+b),total:D.length*N})
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
