'use strict';
const fs=require('node:fs'),path=require('node:path');
function search(edges,q=8,width=50000,finalKeep=256){
 const Q=29,mod=x=>(x%Q+Q)%Q,delta=(a,b)=>Math.min(mod(a-b),mod(b-a)),n=edges.length,dist=new Float64Array(n*n),idx=Array.from({length:q},()=>new Int16Array(q).fill(-1));
 for(let i=0;i<n;i++){const {t,u,f}=edges[i];idx[t][u]=idx[u][t]=i;for(let j=0;j<i;j++){const g=edges[j].f;let d=0;for(let z=0;z<f.length;z++)d+=(f[z]-g[z])**2;dist[i*n+j]=dist[j*n+i]=d/f.length}}
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function update(groups,sums,cost,e,d){const mask=groups[d],count=pop(mask);let add=0,bits=mask;while(bits){const j=31-Math.clz32(bits&-bits);bits&=bits-1;add+=dist[e*n+j]}
   const old=sums[d];sums[d]+=add;groups[d]|=1<<e;
   return cost+(old+add)/(count+1)-(count?old/count:0)
 }
 function evaluate(K){const groups=new Uint32Array(15),sums=new Float64Array(15);let cost=0;for(let t=1;t<K.length;t++)for(let u=0;u<t;u++)cost=update(groups,sums,cost,idx[t][u],delta(K[t],K[u]));return cost}
 function push(heap,v,k){if(heap.length<k){let i=heap.length;heap.push(v);while(i){const p=(i-1)>>1;if(heap[p].score>=v.score)break;heap[i]=heap[p];i=p}heap[i]=v;return}
   if(v.score>=heap[0].score)return;let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&heap[j+1].score>heap[j].score)j++;if(heap[j].score<=v.score)break;heap[i]=heap[j];i=j}heap[i]=v
 }
 let beam=[{K:[0,1],score:0}],visited=0,trace=[];
 for(let t=2;t<q;t++){const heap=[],keep=t===q-1?finalKeep:width;
   for(const parent of beam){
     const K=parent.K,groups=new Uint32Array(15),sums=new Float64Array(15),used=K.reduce((s,v)=>s|(1<<v),0);let base=0;
     for(let a=1;a<t;a++)for(let b=0;b<a;b++)base=update(groups,sums,base,idx[a][b],delta(K[a],K[b]));
     for(let v=2;v<Q;v++){
       if(used&(1<<v))continue;
       let score=base;const undo=[];
       for(let u=0;u<t;u++){const d=delta(v,K[u]);undo.push([d,groups[d],sums[d]]);score=update(groups,sums,score,idx[t][u],d)}
       visited++;if(heap.length<keep||score<heap[0].score)push(heap,{K:K.concat(v),score},keep);
       for(let i=undo.length-1;i>=0;i--){const [d,mask,sum]=undo[i];groups[d]=mask;sums[d]=sum}
     }
   }
   beam=heap.sort((a,b)=>a.score-b.score);trace.push({depth:t+1,retained:beam.length,best:beam[0].score,worst:beam.at(-1).score,visited})
 }
 return {candidates:beam,trace,visited,evaluate}
}
function run(data){const out=[];for(const c of data.controls){const q=c.truthK.length,K=c.truthK,scale=Array.from({length:29},(_,i)=>i).find(i=>(K[1]*i)%29===1),truth=K.map(v=>v*scale%29),r=search(c.result.edges,q);out.push({j:c.j,truth,truthScore:r.evaluate(truth),rank:r.candidates.findIndex(x=>x.K.join()===truth.join())+1,trace:r.trace,visited:r.visited,candidates:r.candidates})}return {model:'distinct q8 shifts, affine gauge K0=0,K1=1; monotone within-absolute-difference SSE; width50000 beam; top256 final',controls:out}}
if(require.main===module){const input=JSON.parse(fs.readFileSync(path.join(__dirname,'../im-results/lp2-unknown-periodic-shift-invariant-output.json'),'utf8'));console.log(JSON.stringify(run(input),null,2))}
module.exports={search,run};
