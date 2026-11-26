// Exact top-support heaps and soft edge marginals.
const fs=require("node:fs");
function softSupports(data){
const n=29,K=4096,out={};
for(const name of ["oracle","independent"]){
const {G,L}=data[name], heaps=Array.from({length:n},()=>({scores:new Float64Array(K).fill(Infinity),masks:new Uint32Array(K)}));
let stack=new Int8Array(8),linear=new Float64Array(n),leaves=0;
function offer(h,z,m){
if(z>=h.scores[0])return;
let i=0;while(true){let c=2*i+1;if(c>=K)break;if(c+1<K&&h.scores[c+1]>h.scores[c])c++;if(h.scores[c]<=z)break;h.scores[i]=h.scores[c];h.masks[i]=h.masks[c];i=c}h.scores[i]=z;h.masks[i]=m;
}
function rec(start,depth,quad,mask){
if(depth===8){leaves++;for(let c=0;c<n;c++)offer(heaps[c],quad+linear[c],mask);return}
for(let p=start;p<=n-(8-depth);p++){let add=G[p][p];for(let j=0;j<depth;j++)add+=2*G[p][stack[j]];for(let c=0;c<n;c++)linear[c]+=L[p][c];stack[depth]=p;rec(p+1,depth+1,quad+add,mask|(1<<p));for(let c=0;c<n;c++)linear[c]-=L[p][c]}
}
rec(0,0,0,0);if(leaves!==4292145)throw Error("coverage");
let truth=Array.from({length:n},(_,c)=>data.key.map(d=>data.ord[(data.ord.indexOf(c)-d+n)%n]));
let ranked=heaps.map(h=>Array.from(h.scores,(score,i)=>({score,mask:h.masks[i]})).sort((a,b)=>a.score-b.score));
let matrices={};for(let k of [64,256,1024,4096]){let A=ranked.map(row=>{let w=new Float64Array(n);for(let {mask} of row.slice(0,k))for(let p=0;p<n;p++)if(mask&(1<<p))w[p]+=1/k;return Array.from(w)});let best=A.map(row=>Array.from({length:n},(_,i)=>i).sort((a,b)=>row[b]-row[a]).slice(0,8));let edges=best.reduce((sum,row,c)=>sum+row.filter(p=>truth[c].includes(p)).length,0);let truthWeight=truth.reduce((sum,row,c)=>sum+row.reduce((s,p)=>s+A[c][p],0),0);matrices[k]={A,edges,truthWeight};}
out[name]={leaves,matrices};
}return out;
}
console.log(JSON.stringify(softSupports(JSON.parse(fs.readFileSync("im-results/lp2-q8-marginal-channel-structured-objective.json","utf8"))),null,2));
