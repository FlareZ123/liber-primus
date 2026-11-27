'use strict';
const fs=require('node:fs');
function run(g,donors){
const q=29,Q=q*q,mod=x=>((x%q)+q)%q;
const am=new Map(g.translit.map((x,i)=>[x,i]));am.set("ING",21);am.set("IO",27);
function norm(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){let ok=false;for(const n of [3,2,1])if(w.length>=n&&am.has(w.slice(0,n))){out.push(am.get(w.slice(0,n)));w=w.slice(n);ok=true;break}if(!ok)throw Error(w)}}return out}
const streams=donors.map(norm),f=Array(q).fill(0.5);for(let x of streams[2])f[x]++;let sum=f.reduce((a,b)=>a+b);for(let i=0;i<q;i++)f[i]/=sum;const log=f.map(Math.log),h=Array.from({length:q},(_,d)=>Math.log(q*f.reduce((s,x,i)=>s+x*f[(i+d)%q],0)));
const pages=g.pages.filter(x=>x.page<56&&x.indices.length),lens=pages.map(p=>p.indices.length),m=Math.max(...lens),fit=pages.map((p,i)=>p.page%5!==4?i:-1).filter(i=>i>=0),hold=pages.map((p,i)=>p.page%5===4?i:-1).filter(i=>i>=0);
const shift=Array.from({length:q},(_,u)=>Uint8Array.from({length:Q},(_,x)=>mod(u*Math.floor(x/q)+x%q)));
const lk=Array.from({length:q},(_,c)=>Float64Array.from({length:q},(_,k)=>f[mod(c-k)]));
let seed=3243;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
function solve(C){const pairs=[];for(let i of fit)for(let k of fit)if(k>i){let s=0;for(let j=0;j<Math.min(lens[i],lens[k]);j++)s+=h[mod(C[i][j]-C[k][j])];pairs.push({i,k,s})}pairs.sort((a,b)=>b.s-a.s);
const a=pairs[0],b=pairs.find(x=>x.i!==a.i&&x.k!==a.i&&x.i!==a.k&&x.k!==a.k),u=Array(lens.length).fill(-1),post=Array.from({length:m},()=>Float64Array.from({length:Q},()=>1/Q));
function add(i,z){u[i]=z;const sh=shift[z];for(let j=0;j<lens[i];j++){const p=post[j],l=lk[C[i][j]];let s=0;for(let k=0;k<Q;k++){p[k]*=l[sh[k]];s+=p[k]}for(let k=0;k<Q;k++)p[k]/=s}}
add(a.i,0);add(a.k,0);add(b.i,1);add(b.k,1);const order=[];
for(let step=4;step<fit.length;step++){let pred=new Float64Array(m*Q),tmp=new Float64Array(q);for(let j=0;j<m;j++){let p=post[j];for(let z=0;z<q;z++){let sh=shift[z],base=j*Q+z*q;tmp.fill(0);for(let k=0;k<Q;k++)tmp[sh[k]]+=p[k];for(let c=0;c<q;c++){let v=0,l=lk[c];for(let k=0;k<q;k++)v+=tmp[k]*l[k];pred[base+c]=Math.log(v)}}}let best=null;for(let i of fit)if(u[i]<0){let scores=Array(q).fill(0);for(let j=0;j<lens[i];j++){let base=j*Q+C[i][j];for(let z=0;z<q;z++)scores[z]+=pred[base+z*q]}let ix=Array.from({length:q},(_,i)=>i).sort((a,b)=>scores[b]-scores[a]);let gap=scores[ix[0]]-scores[ix[1]];if(!best||gap>best.gap)best={i,z:ix[0],gap}}add(best.i,best.z);order.push(best)}
const v=[],w=[];for(let j=0;j<m;j++){let p=post[j],k=0;for(let z=1;z<Q;z++)if(p[z]>p[k])k=z;v.push(Math.floor(k/q));w.push(k%q)}
let held=[];for(let i of hold){let best=-Infinity,bu=-1;for(let z=0;z<q;z++){let s=0;for(let j=0;j<48;j++)s+=log[mod(C[i][j]-z*v[j]-w[j])];if(s>best){best=s;bu=z}}u[i]=bu;let P=C[i].map((c,j)=>mod(c-bu*v[j]-w[j]));held.push({i,P})}return{u,v,w,a,b,order,held}}
let trials=[];for(let t=0;t<2;t++){let offset=18000,P=lens.map(n=>{let a=streams[t].slice(offset,offset+n);offset+=n;return a}),u=lens.map(()=>rnd(q)),v=Array.from({length:m},()=>rnd(q)),w=Array.from({length:m},()=>rnd(q)),C=P.map((p,i)=>p.map((x,j)=>mod(x+u[i]*v[j]+w[j])));let result=solve(C), gaugeU=0;for(let aa=1;aa<q;aa++)for(let bb=0;bb<q;bb++)gaugeU=Math.max(gaugeU,fit.filter(i=>result.u[i]===mod(aa*u[i]+bb)).length);
trials.push({t,anchorTruth:[u[result.a.i],u[result.a.k],u[result.b.i],u[result.b.k]],gaugeU,fitN:fit.length,fitCorrect:fit.reduce((s,i)=>s+C[i].filter((c,j)=>mod(c-result.u[i]*result.v[j]-result.w[j])===P[i][j]).length,0),heldCorrect:result.held.reduce((s,x)=>s+x.P.slice(48).filter((c,j)=>c===P[x.i][j+48]).length,0),heldN:result.held.reduce((s,x)=>s+x.P.length-48,0),order:result.order.map(x=>[pages[x.i].page,x.z,+x.gap.toFixed(2)]),heldPreview:result.held[0].P.slice(48,100).map(x=>g.translit[x]).join(""),truePreview:P[result.held[0].i].slice(48,100).map(x=>g.translit[x]).join("")})}return trials}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const data=paths.map(x=>fs.readFileSync(x,'utf8'));
console.log(JSON.stringify(run(JSON.parse(data[0]),data.slice(1)),null,2));
