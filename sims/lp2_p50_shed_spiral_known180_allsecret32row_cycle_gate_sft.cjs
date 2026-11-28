#!/usr/bin/env node
'use strict';
// All-secret original p50 32x8 "shed circumference" spiral; 32 arbitrary row
// clock values plus a completely arbitrary stationary GP29 token dictionary.
// Tests true known p56+p57 inner180, unknown p55 outer76 held out.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages=n=>corpus.pages.find(p=>p.page===n).indices;
const cipher56=pages(56),plain57=pages(57),cipher55=pages(55);
assert.deepEqual([cipher55.length,cipher56.length,plain57.length],[76,85,95]);
const wordLine='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const gp=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function fromText(s){
 let out=[];
 for(const word of s.split(' '))for(let j=0;j<word.length;){
  let t=gp.find(x=>word.startsWith(x.s,j));
  assert(t,'missing GP symbol');out.push(t.i);j+=t.s.length;
 }
 return out;
}
const plain56=fromText(wordLine);
assert.equal(plain56.length,85);
const mod=x=>(x%29+29)%29;
let primes=[];for(let n=2;primes.length<85;n++){
 let prime=true;for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break}
 if(prime)primes.push(n);
}
let cursor=0;
for(let i=0;i<85;i++){
 let add=i===56?0:primes[cursor++]-1;
 assert.equal(mod(plain56[i]+add),cipher56[i]);
}
assert.equal(cursor,84);
const table=grid.pages.flatMap(p=>p.tokens);
assert.equal(table.length,256);
const distinct=[...new Set(table)];
assert.equal(distinct.length,161);
const ids=new Map(distinct.map((t,i)=>[t,32+i]));
function ring(t,l,b,r){
 let x=[];
 for(let j=l;j<=r;j++)x.push([t,j]);
 for(let i=t+1;i<=b;i++)x.push([i,r]);
 for(let j=r-1;j>=l;j--)x.push([b,j]);
 for(let i=b-1;i>t;i--)x.push([i,l]);
 return x;
}
function spiral(corner,cw){
 let out=[];
 for(let k=0;k<4;k++){
  let x=ring(k,k,31-k,7-k);
  if(!cw)x=[x[0],...x.slice(1).reverse()];
  let starts={TL:[k,k],TR:[k,7-k],BR:[31-k,7-k],BL:[31-k,k]};
  let s=starts[corner],i=x.findIndex(z=>z[0]===s[0]&&z[1]===s[1]);
  assert(i>=0);out.push(...x.slice(i),...x.slice(0,i));
 }
 assert.equal(new Set(out.map(z=>8*z[0]+z[1])).size,256);
 return {outer:out.slice(0,76),inner:out.slice(76)};
}
function pathBetween(graph,u,v){
 let q=[u],prev=Array(graph.length).fill(null),delta=Array(graph.length).fill(null);
 delta[u]=0;
 for(let j=0;j<q.length;j++){
  let node=q[j];
  if(node===v){
   let chain=[];while(node!==u){let e=prev[node];chain.push(e.source);node=e.from}
   return {delta:delta[v],chain:chain.reverse()};
  }
  for(const e of graph[node]){
   if(delta[e.to]!==null)continue;
   delta[e.to]=mod(delta[node]+e.delta);
   prev[e.to]={from:node,source:e.source};
   q.push(e.to);
  }
 }
 return null;
}
function gate(coords,plaintext){
 assert.deepEqual([coords.length,plaintext.length],[180,180]);
 const graph=Array.from({length:193},()=>[]);
 let first=null,violations=0;
 for(let i=0;i<180;i++){
  let [r,c]=coords[i],token=table[8*r+c],u=r,v=ids.get(token),p=plaintext[i];
  const source={index:i,row:r,col:c,token,knownGP:p};
  const forced=pathBetween(graph,u,v);
  if(forced&&forced.delta!==p){
   violations++;
   if(!first)first={forced:forced.delta,actual:p,
    modulo29_gap:mod(p-forced.delta),cycle:[...forced.chain,source]};
  }
  graph[u].push({to:v,delta:p,source});
  graph[v].push({to:u,delta:mod(-p),source});
 }
 return {feasible:violations===0,conflicting_edges:violations,
  first_original_source_cycle:first};
}
const known=[...plain56,...plain57],results=[];
for(const corner of ['TL','TR','BR','BL'])
 for(const cw of [true,false]){
  let positions=spiral(corner,cw);
  assert.deepEqual([positions.outer.length,positions.inner.length],[76,180]);
  for(const order of ['p56_p57','p57_p56']){
   let truth=order==='p56_p57'?known:[...plain57,...plain56];
   let evidence=gate(positions.inner,truth);
   assert(!evidence.feasible,'source original must not admit stationary token plus 32 row key');
   results.push({corner,cw,order,...evidence});
  }
 }
assert.equal(results.length,16);
// Genuine synthetic positive: the original 256 table, nonlinear secrets,
// arbitrary 32 independent offsets, every source ring correctly recovered.
const p=spiral('TL',true);
const secret=new Map(distinct.map(t=>[t,mod(t.charCodeAt(0)*7+t.charCodeAt(1)*13)]));
const rowShift=Array.from({length:32},(_,r)=>mod(7*r*r+11*r+3));
const plant=positions=>positions.map(([r,c])=>mod(secret.get(table[8*r+c])+rowShift[r]));
assert(gate(p.inner,plant(p.inner)).feasible);
assert.deepEqual([plant(p.inner).length,plant(p.outer).length],[180,76]);
const output={
 method:'exact original 180-known rune GF29 bipartite cycle test',
 model:'arbitrary stationary f(token) + 32 independent arbitrary row offsets h[row]',
 sourceShape:{table:[32,8],outer:76,inner:180,solved:[85,95],distinctTokens:161},
 originalP56Replay:'85/85 prime-minus-one with F hold',
 sourceResults:results,
 syntheticPositive:{known:180,outer:76,nonlinearHiddenRowClock:true,feasible:true},
 conclusion:'All 16 original-source spiral orientations/solved-page orderings inconsistent even with arbitrary per-token GP29 dictionary and 32 completely free row additive shifts; no unknown p55 plaintext claimed'
};
console.log(JSON.stringify(output,null,2));
if(process.env.RUNNER_TEMP)fs.writeFileSync(
 path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(output,null,2)+'\n');
