'use strict';
const fs=require('node:fs');
function experiment(corpus,native){
 const sections=native.sections.map(s=>({name:s.name,seq:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
 const N=20,W=16,mod=x=>((x%29)+29)%29,big=x=>x.reduceRight((a,b)=>a*29n+BigInt(b),0n),M=29n**BigInt(N);
 function digits(x){const d=[];for(let j=0;j<N;j++){d.push(Number(x%29n));x/=29n}return d}
 function inv(a){let [x,y,u,v]=[a,M,1n,0n];while(y){let q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit");return (u%M+M)%M}
 function model(rev){
 const u=Array(29).fill(1),b=Array(841).fill(.5),t=Array(24389).fill(.25);
 for(const s of sections.filter(s=>!["0_koan_1","0_loss_of_divinity"].includes(s.name))){const x=rev?[...s.seq].reverse():s.seq;for(let i=0;i<x.length;i++){u[x[i]]++;if(i)b[x[i-1]*29+x[i]]++;if(i>1)t[(x[i-2]*29+x[i-1])*29+x[i]]++}}
 const us=u.reduce((a,b)=>a+b),bs=Array(29).fill(0),ts=Array(841).fill(0);for(let i=0;i<841;i++)bs[Math.floor(i/29)]+=b[i];for(let i=0;i<24389;i++)ts[Math.floor(i/29)]+=t[i];
 return {u:u.map(v=>Math.log(v/us)),b:b.map((v,i)=>Math.log(.8*v/bs[Math.floor(i/29)]+.2*u[i%29]/us)),t:t.map((v,i)=>{const a=Math.floor(i/29),c=i%29,p=a%29;return Math.log(.6*v/ts[a]+.3*b[p*29+c]/bs[p]+.1*u[c]/us)})}
 }
 function evaluate(P,l){let sum=0,count=0;for(const p of P)for(let j=0;j<p.length;j++){sum+=j===0?l.u[p[j]]:j===1?l.b[p[j-1]*29+p[j]]:l.t[(p[j-2]*29+p[j-1])*29+p[j]];count++}return sum/count}
 function decode(C,A,B){return C.map(p=>digits((big(A)*big(p)+big(B))%M))}
 function recover(C,rev,truth){
 const fit=C.filter((_,i)=>i%4!==3),held=C.filter((_,i)=>i%4===3),K=fit.length,l=model(rev);
 let beam=[{A:[],B:[],carry:Array(K).fill(0),prev:Array(K).fill(0),prev2:Array(K).fill(0),score:0}];const trace=[];
 for(let j=0;j<N;j++){
 let next=[];
 for(const s of beam){
 const base=fit.map((c,i)=>{let x=s.carry[i];for(let k=0;k<j;k++)x+=s.A[k]*c[j-k];return x});
 const row=fit.map((c,i)=>j===0?l.u:j===1?l.b.slice(s.prev[i]*29,s.prev[i]*29+29):l.t.slice((s.prev2[i]*29+s.prev[i])*29,(s.prev2[i]*29+s.prev[i])*29+29));
 for(let a=j===0?1:0;a<29;a++)for(let b=0;b<29;b++){
 let score=s.score;for(let i=0;i<K;i++)score+=row[i][(base[i]+a*fit[i][0]+b)%29];
 if(next.length===W&&score<=next[W-1].score)continue;
 const v={A:[...s.A,a],B:[...s.B,b],score,carry:base.map((x,i)=>Math.floor((x+a*fit[i][0]+b)/29)),prev:base.map((x,i)=>(x+a*fit[i][0]+b)%29),prev2:s.prev};
 next.push(v);next.sort((a,b)=>b.score-a.score);if(next.length>W)next.pop();
 }
 }
 beam=next;trace.push({j:j+1,score:beam[0].score/(K*(j+1)),truthRetained:truth?beam.some(x=>x.A.every((v,i)=>v===truth.A[i])&&x.B.every((v,i)=>v===truth.B[i])):null});
 }
 const best=beam[0],P=decode(C,best.A,best.B),Pfit=P.filter((_,i)=>i%4!==3),Pheld=P.filter((_,i)=>i%4===3),a=big(best.A),b=big(best.B),ai=inv(a);
 const replay=P.every((p,i)=>((big(p)-b)*ai%M+M)%M===big(C[i]));
 return {A:best.A,B:best.B,fit: evaluate(Pfit,l),held:evaluate(Pheld,l),replay,trace,P,fitN:K,heldN:held.length};
 }
 const out={N,W,domain:"shared arbitrary 20-digit unit multiplier and offset; digitwise top16 beam; held index mod4=3",original:[],plants:[]};
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length>=N);
 const donors=sections.filter(s=>["0_koan_1","0_loss_of_divinity"].includes(s.name)).flatMap(s=>Array.from({length:Math.floor(s.seq.length/N)},(_,i)=>s.seq.slice(i*N,(i+1)*N))).slice(0,pages.length);
 for(const rev of [false,true]){
 const C=pages.map(p=>(rev?[...p.indices].reverse():p.indices).slice(0,N)),p=recover(C,rev,null),{P,...rest}=p;out.original.push({rev,...rest,sample:P.slice(0,8).map((x,i)=>({page:pages[i].page,text:(rev?[...x].reverse():x).map(y=>corpus.translit[y]).join(" ")}))});
 const D=donors.map(p=>rev?[...p].reverse():p),A=Array.from({length:N},(_,i)=>(13*i*i+7*i+11+(rev?3:0))%29),B=Array.from({length:N},(_,i)=>(23*i*i+5*i+19+(rev?2:0))%29),ai=inv(big(A)),b=big(B),plant=D.map(p=>digits(((big(p)-b)*ai%M+M)%M)),x=recover(plant,rev,{A,B}),{P:PP,...rr}=x;
 out.plants.push({rev,expectedA:A,expectedB:B,...rr,correct:PP.map((p,i)=>p.filter((v,j)=>v===D[i][j]).length).reduce((a,b)=>a+b),total:D.length*N});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
