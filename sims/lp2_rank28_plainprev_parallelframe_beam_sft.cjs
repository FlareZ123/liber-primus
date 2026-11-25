'use strict';
const fs=require('node:fs'),path=require('node:path');
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,{width=64,count=1,originalTest=false}={}){
const gp=JSON.parse(raw[0]),A=28,alphabet=gp.translit.filter((_,i)=>i!==12),mod=x=>(x+A)%A,assert=(x,m)=>{if(!x)throw Error(m)};
const tokens=alphabet.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:20}:w.startsWith("IO",j)?{t:"IO",i:26}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p;}
const donors=raw.slice(1).map(native),training=donors.map(d=>d.slice(0,d.length-16000));
const unig=new Float64Array(A).fill(.5),bi=new Float64Array(A*A),tri=new Float64Array(A*A*A);
for(const p of training){for(let i=0;i<p.length;i++){unig[p[i]]++;if(i)bi[p[i-1]*A+p[i]]++;if(i>1)tri[(p[i-2]*A+p[i-1])*A+p[i]]++;}}
const sum=a=>a.reduce((x,y)=>x+y,0),total=sum(unig),U=unig.map(n=>n/total),B=new Float64Array(A*A),T=new Float64Array(A*A*A);
for(let q=0;q<A;q++){const n=sum(bi.subarray(q*A,(q+1)*A));for(let p=0;p<A;p++)B[q*A+p]=(bi[q*A+p]+8*U[p])/(n+8);}
for(let a=0;a<A;a++)for(let q=0;q<A;q++){const j=(a*A+q)*A,n=sum(tri.subarray(j,j+A));for(let p=0;p<A;p++)T[j+p]=(tri[j+p]+12*B[q*A+p])/(n+12);}
const L1=U.map(x=>Math.log(A*x)),L2=B.map(x=>Math.log(A*x)),L3=T.map(x=>Math.log(A*x));
const rs=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const original=rs.flatMap(([lo,hi],chapter)=>{const a=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);const out=[];let d=[];for(let i=1;i<a.length;i++){let delta=(a[i]-a[i-1]+29)%29;if(!delta){out.push({chapter,d});d=[];}else d.push(delta-1);}out.push({chapter,d});return out;});assert(original.length===95&&sum(original.map(f=>f.d.length))===12861,"frame geometry");
const isTrain=f=>f.chapter!==0&&f.chapter!==3;
function decode(d,K){const P=[];let q=0;for(const r of d){assert(K[q]>=0,"unassigned held row");q=mod(r-K[q]);P.push(q);}return P;}
function encode(P,K){let q=0;return P.map(p=>{const d=mod(p+K[q]);q=p;return d;});}
function score(P){let s=0;for(let i=0;i<P.length;i++)s+=i===0?L1[P[i]]:i===1?L2[P[i-1]*A+P[i]]:L3[(P[i-2]*A+P[i-1])*A+P[i]];return s;}
function solve(frames,width){const F=frames.map(f=>f.d),N=F.length;let beam=[{K:new Int8Array(A).fill(-1),pos:new Uint16Array(N),q:new Uint8Array(N),prev:new Uint8Array(N),s:0,n:0}];let log=[];
for(let round=0;round<A;round++){
 const next=[];
 for(const old of beam){const occ=new Uint16Array(A);for(let i=0;i<N;i++)if(old.pos[i]<F[i].length)occ[old.q[i]]++;
 let z=0;for(let q=1;q<A;q++)if(occ[q]>occ[z])z=q;
 if(!occ[z]){next.push(old);continue;}assert(old.K[z]<0,"frontier must be unassigned");
 for(let k=0;k<A;k++){const K=old.K.slice();K[z]=k;const pos=old.pos.slice(),q=old.q.slice(),prev=old.prev.slice();let s=old.s,n=old.n;
 for(let i=0;i<N;i++){const d=F[i];let j=pos[i],b=q[i],a=prev[i];while(j<d.length&&K[b]>=0){const p=mod(d[j]-K[b]);s+=j===0?L1[p]:j===1?L2[b*A+p]:L3[(a*A+b)*A+p];j++;n++;a=b;b=p;}pos[i]=j;q[i]=b;prev[i]=a;}
 next.push({K,pos,q,prev,s,n});}
 }
 next.sort((a,b)=>b.s-a.s);beam=next.slice(0,width);log.push({round:round+1,best:beam[0].s,n:beam[0].n,keys:Array.from(beam[0].K).filter(k=>k>=0).length});
}
 return {K:Array.from(beam[0].K).map(k=>Math.max(0,k)),log,score:beam[0].s,decoded:beam[0].n};}
let seed=33012811;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function plant(donor,start,K){let pos=start;return original.map(f=>{const P=donor.slice(pos,pos+f.d.length);pos+=P.length;assert(P.length===f.d.length,"donor too short");return {chapter:f.chapter,P,d:encode(P,K)};});}
function test(frames,K){const train=frames.filter(isTrain),held=frames.filter(f=>!isTrain(f));let res=solve(train,width);function evaluate(ff){let n=0,s=0,correct=0,rows=new Set();for(const f of ff){const P=decode(f.d,res.K);assert(encode(P,res.K).join()==f.d.join(),"replay");s+=score(P);n+=P.length;if(f.P){correct+=P.filter((p,i)=>p===f.P[i]).length;rows.add(0);for(let i=0;i<f.P.length-1;i++)rows.add(f.P[i]);}}return {n,gain:s/n,correct:ff[0].P?correct:null,usedRows:rows.size,keyRows:K?Array.from(rows).filter(q=>K[q]===res.K[q]).length:null,preview:ff.slice(0,2).map(f=>decode(f.d,res.K).slice(0,80).map(p=>alphabet[p]).join(""))};}
 return {key:res.K,truth:K,train:evaluate(train),held:evaluate(held),trace:res.log};
}
const pilots=[];for(let i=0;i<count;i++){const K=Array.from({length:A},()=>rng()%A),d=donors[i%3],f=plant(d,d.length-16000,K);pilots.push(test(f,K));}
return {width,donorLengths:donors.map(d=>d.length),pilots,original:originalTest?test(original,null):null};
}
if(require.main===module)console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8')),{width:64,count:3,originalTest:false}),null,2));
module.exports={experiment,INPUTS};
