'use strict';
function solveRows(input,q=13,maxTests=100000000,free=false){
 const rows=input.slice().sort((a,b)=>b.length-a.length),ALL=(1<<q)-1;
 const seg=[],starts=[],ends=[];
 for(const row of rows){starts.push(seg.length);let s={n:0,seen:new Int32Array(q),zero:false};for(const v of row){if(v===0){s.zero=true;seg.push(s);s={n:0,seen:new Int32Array(q),zero:false}}else{s.seen[s.n%q]|=1<<v;s.n++}}seg.push(s);ends.push(seg.length)}
 const N=seg.length,rot=(x,k)=>((x<<k)|(x>>>(q-k)))&ALL,allowed=Array.from({length:q*29},()=>new Int32Array(N).fill(ALL)),depth=Array.from({length:q+1},()=>new Int32Array(N).fill(ALL)),reach=Array.from({length:q+1},()=>new Int32Array(N)),shift=seg.map(s=>s.n%q);
 for(let j=0;j<q;j++)for(let k=1;k<29;k++)for(let i=0;i<N;i++)for(let a=0;a<q;a++)if(seg[i].seen[(j-a+q)%q]&(1<<k))allowed[j*29+k][i]&=~(1<<a);
 let tests=0,nodes=0,leaves=[],stopped=false;const hist=new Array(q+1).fill(0),K=new Int8Array(q).fill(-1);
 function extend(d,j,k,zero){
  tests++;const a=depth[d],b=depth[d+1],v=allowed[j*29+k],r=reach[d+1];
  for(let f=0;f<rows.length;f++){
   let st=free&&f>0?ALL:1;const l=starts[f],h=ends[f];for(let i=l;i<h;i++){const x=st&a[i]&v[i];if(!x)return false;r[i]=x;st=rot(x,shift[i]);if(seg[i].zero)st|=rot(st&~zero,1)}
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
 return {q,free,complete:!stopped,N,tests,nodes,hist,domains:D,leaves};
}
function solve(raw,q=13,maxTests=100000000,free=false,body=false){
 const c=JSON.parse(raw),t=c.pages.slice(0,56).flatMap(p=>p.indices),cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],head=[13,16,12,20,16,19,10,8,9];
 return solveRows(cuts.slice(0,-1).map((v,i)=>t.slice(v+(body?head[i]:0),cuts[i+1])),q,maxTests,free);
}
function legal(row,K,free=false){
 const q=K.length,ALL=(1<<q)-1,B=new Int32Array(29);K.forEach((v,j)=>{B[v]|=1<<j});
 let s=free?ALL:1;for(const c of row){const a=s&~B[c];s=(((a<<1)|(a>>>(q-1)))&ALL)|(c===0?s:0);if(!s)return false}return true;
}
function selfTest(){
 let seed=0x28112700;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};
 const tests=[];
 for(const q of [2,3])for(const free of [false,true]){
  const rows=Array.from({length:3},()=>Array.from({length:37},()=>rnd()<.17?0:1+Math.floor(rnd()*28))).sort((a,b)=>b.length-a.length);
  const z=solveRows(rows,q,1e7,free),K=new Array(q).fill(0),out=[];
  function dfs(j){if(j===q){if(rows.every((row,i)=>legal(row,K,free&&i>0)))out.push(K.join());return}for(let k=0;k<29;k++){K[j]=k;dfs(j+1)}}
  dfs(0);if(!z.complete||z.leaves.map(x=>x.join()).sort().join(";")!==out.sort().join(";"))throw Error("exhaustive control mismatch");
  tests.push({q,free,keys:out.length});
 }
 const native=Array.from({length:240},(_,i)=>i%11===0?0:1+Math.floor(rnd()*28));
 for(const q of [8,13]){
  const id=Array.from({length:29},(_,i)=>i),perm=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},A=[0,...perm(id.slice(1))],B=perm(id.slice()),K=Array.from({length:q},()=>Math.floor(rnd()*29)),I=new Array(29);B.forEach((v,i)=>I[v]=i);
  const Z=K.map(k=>I[k]);let j=0;const C=native.map(p=>p===0?0:I[(A[p]+K[j++%q])%29]);
  if(!legal(C,Z))throw Error("secret-alphabet plant rejected");
  tests.push({q,secretAlphabetPlant:true,consuming:j,forbidden:Z});
 }
 return tests;
}
if(typeof module!=="undefined")module.exports={solve,solveRows,legal,selfTest};
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(solve(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"),Number(process.argv[2]||13),Number(process.argv[3]||100000000),process.argv[4]==="free",process.argv[5]==="body"),null,2))}
