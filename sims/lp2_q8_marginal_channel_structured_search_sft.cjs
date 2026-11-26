// Exact structured context cost via cyclic correlations.
const fs=require("node:fs");
function search(data,graph){
 const n=29,mod=x=>(x+n)%n;let st=0xb74023f1;
 const rng=()=>{st^=st<<13;st^=st>>>17;st^=st<<5;return(st>>>0)/4294967296};
 const output={};const shuffle=()=>{let o=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>1;i--){let j=1+Math.floor(rng()*i);[o[i],o[j]]=[o[j],o[i]]}return o};
 const gauges=Array.from({length:28},(_,k)=>data.ord.map((_,i)=>data.ord[i*(k+1)%29]).join(","));
 for(const name of ["oracle","independent"]){
 const {G,L}=data[name]; // row scores L[p][c], pair G[p][q]
 const corr=(o)=>{let g=new Float64Array(n),l=new Float64Array(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const d=mod(i-j);g[d]+=G[o[j]][o[i]];l[d]+=L[o[j]][o[i]]}return {g,l}};
 const score=(c,k)=>{let z=0;for(const d of k){z+=c.l[d];for(const e of k)z+=c.g[mod(d-e)]}return z};
 const full=(o,k)=>{let z=0;for(let i=0;i<n;i++){const c=o[i];for(let d of k){const p=o[mod(i-d)];z+=L[p][c];for(let e of k)z+=G[p][o[mod(i-e)]]}}return z};
 const optimizeK=(c,k)=>{let val=score(c,k);for(let pass=0;pass<20;pass++){let best=val,bi=-1,bv=-1;for(let i=0;i<8;i++){let old=k[i];for(let d=0;d<n;d++){if(k.includes(d))continue;k[i]=d;let v=score(c,k);k[i]=old;if(v<best-1e-10){best=v;bi=i;bv=d}}}if(bi<0)break;k[bi]=bv;val=best}return val};
 const trueCost=full(data.ord,data.key),verify=score(corr(data.ord),data.key);if(Math.abs(trueCost-verify)>1e-8)throw Error("correlation formula");
 for(const known of [true,false]){
 let best=Infinity,bo,bk,exact=0,stepCount=0;const runs=72,steps=24000;
 const dg=new Float64Array(n),dl=new Float64Array(n);
 for(let rep=0;rep<runs;rep++){
 let seed=graph[name+":"+known];let o=rep<24?seed.bestOrd.slice():shuffle();
 if(rep>0&&rep<24){for(let m=0;m<1+rep%8;m++){let i=1+Math.floor(rng()*28),j=1+Math.floor(rng()*28);[o[i],o[j]]=[o[j],o[i]]}}
 let k=known?data.key.slice():rep<24?Array.from({length:n},(_,i)=>i).sort((a,b)=>seed.edges[b]-seed.edges[a]).slice(0,8):Array.from({length:n},(_,i)=>i).sort((a,b)=>Math.sin(a*100+rep*17)-Math.sin(b*100+rep*17)).slice(0,8);
 let c=corr(o),v=known?score(c,k):optimizeK(c,k);
 for(let t=0;t<steps;t++){
 const T=0.22*Math.pow(0.006,t/steps);let a,b,old,nv;
 if(!known&&rng()<0.2){
 a=Math.floor(rng()*8);old=k[a];b=Math.floor(rng()*n);if(k.includes(b))continue;k[a]=b;nv=score(c,k);
 if(nv<=v||rng()<Math.exp((v-nv)/T))v=nv;else k[a]=old;
 }else{
 a=1+Math.floor(rng()*28);b=1+Math.floor(rng()*28);if(a===b)continue;
 let x=o[a],y=o[b];dg.fill(0);dl.fill(0);
 for(let j=0;j<n;j++){if(j===a||j===b)continue;let z=o[j],u=mod(a-j),w=mod(b-j);
 dg[u]+=G[z][y]-G[z][x];dg[w]+=G[z][x]-G[z][y];dg[mod(j-a)]+=G[y][z]-G[x][z];dg[mod(j-b)]+=G[x][z]-G[y][z];
 dl[u]+=L[z][y]-L[z][x];dl[w]+=L[z][x]-L[z][y];dl[mod(j-a)]+=L[y][z]-L[x][z];dl[mod(j-b)]+=L[x][z]-L[y][z];
 }
 let u=mod(a-b),w=mod(b-a);
 dg[u]+=G[x][y]-G[y][x];dg[w]+=G[y][x]-G[x][y];dl[u]+=L[x][y]-L[y][x];dl[w]+=L[y][x]-L[x][y];
 for(let d=0;d<n;d++){c.g[d]+=dg[d];c.l[d]+=dl[d]}
 nv=score(c,k);
 if(nv<=v||rng()<Math.exp((v-nv)/T)){[o[a],o[b]]=[y,x];v=nv}else for(let d=0;d<n;d++){c.g[d]-=dg[d];c.l[d]-=dl[d]}
 }
 if(v<best){best=v;bo=o.slice();bk=k.slice()}
 stepCount++;
 }
 if(Math.abs(full(o,k)-v)>1e-7)throw Error("incremental mismatch");
 if(gauges.includes(o.join(",")))exact++;
 }
 const actual=full(bo,bk);if(Math.abs(best-actual)>1e-7)throw Error("best mismatch");
 output[name+":"+known]={trueCost,best,exact,cycleBest:gauges.includes(bo.join(",")),bestOrd:bo,bestShift:bk,stepCount,runs,steps};
 }
 }return output;
}
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(search(read("im-results/lp2-q8-marginal-channel-structured-objective.json"),read("im-results/lp2-q8-marginal-channel-graph-alignment-output.json")),null,2));
