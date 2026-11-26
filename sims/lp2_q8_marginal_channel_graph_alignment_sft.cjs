// Sparse row-support cycle graph alignment, deterministic control only.
const fs=require("node:fs");
function solve(raw){
 let seed=37410419;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 const n=29,mod=x=>(x+29)%29;const out={};
 for(const name of ["oracle","independent"]){
 const A=raw[name].bestRows.map(a=>Array.from({length:n},(_,i)=>+a.includes(i))), key=raw.key;
 const hist=o=>{const h=new Int16Array(n);for(let i=0;i<n;i++)for(let j=0;j<n;j++)h[mod(i-j)]+=A[o[i]][o[j]];return h};
 const val=(h,known)=>known?key.reduce((s,d)=>s+h[d],0):Array.from(h).sort((a,b)=>b-a).slice(0,8).reduce((a,b)=>a+b,0);
 const gauges=Array.from({length:28},(_,k)=>raw.ord.map((_,i)=>raw.ord[i*(k+1)%29]).join(","));
 for(const known of [true,false]){
 let best=-1, bestOrd=null, exact=0;const restarts=160, steps=16000;
 const delta=new Int16Array(n);
 for(let rep=0;rep<restarts;rep++){
 let o=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>1;i--){let j=1+Math.floor(rand()*i);[o[i],o[j]]=[o[j],o[i]]}
 let h=hist(o),v=val(h,known);
 for(let t=0;t<steps;t++){
 let a=1+Math.floor(rand()*28),b=1+Math.floor(rand()*28);if(a===b)continue;let x=o[a],y=o[b];delta.fill(0);
 for(let j=0;j<n;j++){if(j===a||j===b)continue;let z=o[j];delta[mod(a-j)]+=A[y][z]-A[x][z];delta[mod(b-j)]+=A[x][z]-A[y][z];delta[mod(j-a)]+=A[z][y]-A[z][x];delta[mod(j-b)]+=A[z][x]-A[z][y]}
 delta[mod(a-b)]+=A[y][x]-A[x][y];delta[mod(b-a)]+=A[x][y]-A[y][x];
 for(let d=0;d<n;d++)h[d]+=delta[d];
 let nv=val(h,known),T=3.5*Math.pow(0.08,t/steps);
 if(nv>=v||rand()<Math.exp((nv-v)/T)){[o[a],o[b]]=[y,x];v=nv;if(v>best){best=v;bestOrd=o.slice()}}else for(let d=0;d<n;d++)h[d]-=delta[d];
 }
 if(gauges.includes(o.join(",")))exact++;
 }
 out[name+":"+known]={best,truth:val(hist(raw.ord),known),exact,cycleBest:gauges.includes(bestOrd.join(",")),bestOrd,edges:Array.from(hist(bestOrd)),restarts,steps};
 }
 }return out;
}
const raw=JSON.parse(fs.readFileSync(process.argv[2]||"im-results/lp2-q8-marginal-channel-all-row-support-output.json","utf8"));
console.log(JSON.stringify(solve(raw),null,2));
