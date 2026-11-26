// Rotation-free label exchanges, followed by F canonicalization.
const fs=require("node:fs");
function refine(data,previous){
 const n=29,mod=x=>(x+n)%n;const out={};let st=0x7eac19cf;const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return(st>>>0)/4294967296};
 const canon=o=>{const i=o.indexOf(0);return o.slice(i).concat(o.slice(0,i))};
 const gauges=Array.from({length:28},(_,k)=>data.ord.map((_,i)=>data.ord[i*(k+1)%29]).join(","));
 for(const [name,old] of Object.entries(previous)){
 const [ref,mode]=name.split(":"),known=mode==="true",{G,L}=data[ref];
 const corr=o=>{let g=new Float64Array(n),l=new Float64Array(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++){let d=mod(i-j);g[d]+=G[o[j]][o[i]];l[d]+=L[o[j]][o[i]]}return {g,l}};
 const cost=(c,k)=>{let v=0;for(const d of k){v+=c.l[d];for(const e of k)v+=c.g[mod(d-e)]}return v};
 const optK=(c,k)=>{let v=cost(c,k);while(true){let b=v,bi=-1,bd=-1;for(let i=0;i<8;i++){let d0=k[i];for(let d=0;d<n;d++){if(k.includes(d))continue;k[i]=d;let z=cost(c,k);if(z<b-1e-9){b=z;bi=i;bd=d}}k[i]=d0}if(bi<0)return v;k[bi]=bd;v=b}};
 let best=Infinity,bo,bk,exact=0;
 const runs=20,steps=20000,dg=new Float64Array(n),dl=new Float64Array(n);
 for(let rep=0;rep<runs;rep++){
 let o=old.bestOrd.slice(),k=old.bestShift.slice();if(rep){for(let j=0;j<rep%5;j++){let a=Math.floor(rng()*n),b=Math.floor(rng()*n);[o[a],o[b]]=[o[b],o[a]]}}
 let c=corr(o),v=known?cost(c,k):optK(c,k);
 for(let t=0;t<steps;t++){
 let T=0.14*Math.pow(0.005,t/steps),a,b,nv;
 if(!known&&rng()<0.12){a=Math.floor(rng()*8);b=Math.floor(rng()*n);if(k.includes(b))continue;let old=k[a];k[a]=b;nv=cost(c,k);if(nv<=v||rng()<Math.exp((v-nv)/T))v=nv;else k[a]=old}
 else {
 a=Math.floor(rng()*n);b=Math.floor(rng()*n);if(a===b)continue;let x=o[a],y=o[b];dg.fill(0);dl.fill(0);
 for(let j=0;j<n;j++){if(j===a||j===b)continue;let z=o[j],u=mod(a-j),w=mod(b-j);dg[u]+=G[z][y]-G[z][x];dg[w]+=G[z][x]-G[z][y];dg[mod(j-a)]+=G[y][z]-G[x][z];dg[mod(j-b)]+=G[x][z]-G[y][z];dl[u]+=L[z][y]-L[z][x];dl[w]+=L[z][x]-L[z][y];dl[mod(j-a)]+=L[y][z]-L[x][z];dl[mod(j-b)]+=L[x][z]-L[y][z]}
 let u=mod(a-b),w=mod(b-a);dg[u]+=G[x][y]-G[y][x];dg[w]+=G[y][x]-G[x][y];dl[u]+=L[x][y]-L[y][x];dl[w]+=L[y][x]-L[x][y];for(let d=0;d<n;d++){c.g[d]+=dg[d];c.l[d]+=dl[d]}
 nv=cost(c,k);if(nv<=v||rng()<Math.exp((v-nv)/T)){[o[a],o[b]]=[y,x];v=nv}else for(let d=0;d<n;d++){c.g[d]-=dg[d];c.l[d]-=dl[d]}
 }
 if(v<best){best=v;bo=canon(o);bk=k.slice()}
 }
 if(Math.abs(v-cost(corr(o),k))>1e-7)throw Error("drift");
 if(gauges.includes(canon(o).join(",")))exact++;
 }
 let rank=bo.map(x=>data.ord.indexOf(x)),step=rank[1];let shiftExact=step!==0&&bk.map(d=>mod(d*step%29)).sort((a,b)=>a-b).join(",")===data.key.slice().sort((a,b)=>a-b).join(",");
 out[name]={before:old.best,best,trueCost:old.trueCost,cycleExact:gauges.includes(bo.join(",")),shiftExact,exact,runs,steps,bestOrd:bo,bestShift:bk};
 }
 return out;
}
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(refine(read("im-results/lp2-q8-marginal-channel-structured-objective.json"),read("im-results/lp2-q8-marginal-channel-structured-search-output.json")),null,2));
