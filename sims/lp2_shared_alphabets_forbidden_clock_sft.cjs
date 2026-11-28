'use strict';
function solve(raw,q=13,maxTests=100000000){
 const c=JSON.parse(raw),t=c.pages.slice(0,56).flatMap(p=>p.indices),cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],rows=cuts.slice(0,-1).map((v,i)=>t.slice(v,cuts[i+1])).sort((a,b)=>b.length-a.length),ALL=(1<<q)-1;
 const seg=[],starts=[],ends=[];
 for(const row of rows){starts.push(seg.length);let s={n:0,seen:new Int32Array(q),zero:false};for(const v of row){if(v===0){s.zero=true;seg.push(s);s={n:0,seen:new Int32Array(q),zero:false}}else{s.seen[s.n%q]|=1<<v;s.n++}}seg.push(s);ends.push(seg.length)}
 const N=seg.length,rot=(x,k)=>((x<<k)|(x>>>(q-k)))&ALL,allowed=Array.from({length:q*29},()=>new Int32Array(N).fill(ALL)),depth=Array.from({length:q+1},()=>new Int32Array(N).fill(ALL)),reach=Array.from({length:q+1},()=>new Int32Array(N)),shift=seg.map(s=>s.n%q);
 for(let j=0;j<q;j++)for(let k=1;k<29;k++)for(let i=0;i<N;i++)for(let a=0;a<q;a++)if(seg[i].seen[(j-a+q)%q]&(1<<k))allowed[j*29+k][i]&=~(1<<a);
 let tests=0,nodes=0,leaves=[],stopped=false;const hist=new Array(q+1).fill(0),K=new Int8Array(q).fill(-1);
 function extend(d,j,k,zero){
  tests++;const a=depth[d],b=depth[d+1],v=allowed[j*29+k],r=reach[d+1];
  for(let f=0;f<rows.length;f++){
   let st=1;const l=starts[f],h=ends[f];for(let i=l;i<h;i++){const x=st&a[i]&v[i];if(!x)return false;r[i]=x;st=rot(x,shift[i]);if(seg[i].zero)st|=rot(st&~zero,1)}
  }
  for(let f=0;f<rows.length;f++){let back=ALL;for(let i=ends[f]-1;i>=starts[f];i--){let x=back;if(seg[i].zero)x|=rot(back,q-1)&~zero;back=r[i]&rot(x,shift[i]?q-shift[i]:0);b[i]=back}}
  return true
 }
 const D=Array.from({length:q},(_,j)=>Array.from({length:29},(_,k)=>k).filter(k=>extend(0,j,k,k===0?1<<j:0))),pairs=Array.from({length:q*29},()=>new Int32Array(q).fill((1<<29)-1));
 for(let j=0;j<q;j++)for(const k of D[j]){
  extend(0,j,k,k===0?1<<j:0);
  for(let l=j+1;l<q;l++){let m=0;for(const v of D[l])if(extend(1,l,v,(k===0?1<<j:0)|(v===0?1<<l:0)))m|=1<<v;else pairs[l*29+v][j]&=~(1<<k);pairs[j*29+k][l]=m}
 }
 const domainMasks=D.map(a=>a.reduce((m,k)=>m|(1<<k),0));
 function dfs(d,zero,used,dm){
  nodes++;hist[d]++;
  if(d===q){leaves.push(Array.from(K));return}
  if(tests>=maxTests){stopped=true;return}
  let j=-1,best=30;for(let l=0;l<q;l++)if(!(used&(1<<l))){let n=0,a=dm[l];while(a){a&=a-1;n++}if(n<best){best=n;j=l}}if(best===0)return;
  const nextUsed=used|(1<<j);
  let vals=dm[j];while(vals&&!stopped){const bit=vals&-vals,k=31-Math.clz32(bit);vals^=bit;let possible=true;const nd=dm.slice();for(let l=0;l<q;l++)if(!(nextUsed&(1<<l))){nd[l]&=pairs[j*29+k][l];if(!nd[l]){possible=false;break}}if(!possible)continue;const z=zero|(k===0?1<<j:0);if(extend(d,j,k,z)){K[j]=k;dfs(d+1,z,nextUsed,nd)}}
  K[j]=-1
 }
 dfs(0,0,0,domainMasks);
 return {q,complete:!stopped,N,tests,nodes,hist,domains:D,leaves};
}
if(typeof module!=="undefined")module.exports={solve};
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(solve(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"),Number(process.argv[2]||13),Number(process.argv[3]||100000000)),null,2))}
