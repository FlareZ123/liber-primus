'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const M=29,mod=x=>((x%M)+M)%M,ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const mul=(x,y)=>[mod(x[0]*y[0]+8*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+3*x[1]*y[1])];
function fpow(x,n){let a=[1,0],b=x;while(n){if(n&1)a=mul(a,b);b=mul(b,b);n=Math.floor(n/2)}return a}
function evalp(cs){let a=[0,0],p=[1,0];for(const z of cs){a=[mod(a[0]+z*p[0]),mod(a[1]+z*p[1])];p=mul(p,[0,1])}return a}
function span(page,start){const p=ink.pages.find(x=>x.page===page);assert(p);const s=(p.red_spans||[]).find(x=>x.start===start);assert(s);return s}
function residue(s){return evalp([...s.runes].map(r=>{const v=ri.get(r);assert.notEqual(v,undefined);return v}))}
const H=(a,b)=>[mod(a-b),mod(a+b)];
function tree(v){const r23=H(v[0],v[1]),r8=H(v[2],v[3]);return {row23:r23,row8:r8,col0:H(r23[0],r8[0]),col1:H(r23[1],r8[1])}}
function ipow(b,n,m){let a=1,x=b%m;while(n){if(n&1)a=a*x%m;x=x*x%m;n=Math.floor(n/2)}return a}
function ioc(a){const c=Array(29).fill(0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
const Q=evalp([5,5,14,9,10,4,27,17,25]);assert.deepEqual(Q,[17,24]);assert.deepEqual(fpow(Q,840),[1,0]);
const r23=residue(span(23,0)),r8=residue(span(8,0)),o23=mul(Q,r23),o8=mul(Q,r8);
assert.deepEqual(o23,[17,19]);assert.deepEqual(o8,[10,16]);
const directed=[...o23,...o8],counts=directed.map(p=>corpus.pages[p].runic_count),leaves=counts.map(n=>n%29);
assert.deepEqual(directed,[17,19,10,16]);assert.deepEqual(counts,[273,271,263,267]);assert.deepEqual(leaves,[12,10,2,6]);
const expected={row23:[2,22],row8:[25,8],col0:[6,27],col1:[14,1]},t=tree(leaves);assert.deepEqual(t,expected);
const min=Math.min(...counts),tails=counts.map(n=>n-min),tt=tree(tails);
assert.equal(min,263);assert.deepEqual(tails,[10,8,0,4]);assert.deepEqual(tt,{row23:[2,18],row8:[25,4],col0:[6,27],col1:[14,22]});
const K=t.row23[0],p=t.row23[1]+1,q=mod(-t.row8[0]),A=t.row8[1],a=t.col0[0],b=mod(-t.col1[0]),B=o23[1];
assert.deepEqual({K,p,q,A,a,b,B},{K:2,p:23,q:4,A:8,a:6,b:15,B:19});assert.equal(mod(B-o23[0]),K);
const gs=[];for(let g=1;g<p;g++)if(ipow(g,b,p)===B)gs.push(g);assert.deepEqual(gs,[5]);const g=gs[0];assert.equal(ipow(g,a,p),A);assert.equal(ipow(B,a,p),K);
const internal=[];
for(let e=0;e<840;e++){const s=fpow(Q,e),x23=mul(s,r23),x8=mul(s,r8),ps=[...x23,...x8],cs=ps.map(pn=>corpus.pages[pn].runic_count),tr=tree(cs.map(n=>n%29));
 if(mod(tr.row23[1]+1)===23&&tr.row8[1]===8&&tr.col0[1]===mod(-tr.row23[0])&&tr.col1[1]===1)internal.push(e)}
assert.deepEqual(internal,[1]);
const orientation=[];
for(let e=0;e<840;e++){const s=fpow(Q,e),x23=mul(s,r23),x8=mul(s,r8);
 for(const rev23 of [false,true])for(const rev8 of [false,true]){
  const p23=rev23?[x23[1],x23[0]]:x23,p8=rev8?[x8[1],x8[0]]:x8,ps=[...p23,...p8],cs=ps.map(pn=>corpus.pages[pn].runic_count),tr=tree(cs.map(n=>n%29));
  if(JSON.stringify(tr)===JSON.stringify(expected)){const mn=Math.min(...cs),ts=cs.map(n=>n-mn);orientation.push({e,rev23,rev8,ps,cs,tr,mn,ts,tailTree:tree(ts)})}
 }}
assert.equal(orientation.length,1);assert.deepEqual([orientation[0].e,orientation[0].rev23,orientation[0].rev8],[1,false,false]);assert.deepEqual(orientation[0].ts,[10,8,0,4]);assert.deepEqual(orientation[0].tailTree,tt);
const bodies=directed.map(pn=>corpus.pages[pn].indices),common=Math.min(...bodies.map(x=>x.length));assert.equal(common,263);
const channels=Array.from({length:4},()=>[]);
for(let i=0;i<common;i++){const tr=tree(bodies.map(x=>x[i])),v=[tr.col0[0],tr.col0[1],tr.col1[0],tr.col1[1]];for(let j=0;j<4;j++)channels[j].push(v[j])}
const inv4=22,inverse=channels.map(a=>a.map(x=>mod(inv4*x))),inverseIoc=inverse.map(ioc),solved57Ioc=ioc(corpus.pages[57].indices);
assert(inverseIoc.every(v=>v<0.036));assert(inverseIoc.every(v=>v<solved57Ioc));
const prefixes=inverse.map(a=>a.slice(0,120).map(x=>corpus.translit[x]).join(''));
const out={status:'PASS',classification:'Q-directed page-length H-tree reconstructs DH state; direct common-prefix H-body inverse negative',Q,directedPages:directed,counts,mod29Leaves:leaves,hTree:t,commonPrefix:common,tails,tailTree:tt,recovered:{p,g,a,b,A,B,K,q},charge:{scalars:840,withinPairOrders:4,presentations:3360,internalScalarHits:internal,fullPacketSurvivors:orientation},bodyGate:{inverseIoc,solved57Ioc,prefixes},boundary:'post-discovery state receiver; no unknown plaintext; no phase/order/key rescue of negative body gate'};
console.log(JSON.stringify(out,null,2));if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,'source-test-output.json'),JSON.stringify(out,null,2));
