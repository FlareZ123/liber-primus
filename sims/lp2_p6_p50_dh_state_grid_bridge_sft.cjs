'use strict';

// Agent11, 28 Nov 2026 — p6 <-> p50 state-grid bridge.
// Structural/cross-artifact census only. No unknown plaintext or fitted key.

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const M=x=>((x%29)+29)%29;
const H4=x=>[M(x[0]-x[3]),M(x[1]-x[2]),M(x[1]+x[2]),M(x[0]+x[3])];

// Reconstruct the p6 state fields from the printed title rather than hardcode
// the final state packet.
const p6=corpus.pages[6].indices;
const W1=p6.slice(71,75),W2=p6.slice(75,76),W3=p6.slice(76,80),W4=p6.slice(80,82);
const lengths=[W1.length,W2.length,W3.length,W4.length];
assert.deepEqual(lengths,[4,1,4,2]);
const titleH=H4(lengths);
assert.deepEqual(titleH,[2,26,5,6]);

const K=titleH[0];
const e=M(-titleH[1]);
const g=titleH[2];
const a=titleH[3];
const q=Math.max(...lengths);
const A=M(q+q);
const p=M(-a);
const b=W3[2];
const B=W2[0];
assert.deepEqual({p,g,a,b,A,B,K,e,q},{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});

const rows=32,cols=8,cells=grid.pages.reduce((n,page)=>n+page.tokens.length,0);
assert.equal(cells,256);
assert.equal(cols,2**e);
assert.equal(cols,A);
assert.equal(rows,2**g);
assert.equal(cells,2**A);
assert.equal(cells,rows*cols);

const tokens=grid.pages.flatMap(page=>page.tokens);
const A59=grid.alphabet.replace('f','');
function b59(token){const x=A59.indexOf(token[0]),y=A59.indexOf(token[1]);assert.ok(x>=0&&y>=0);return 59*x+y;}
function cell(row,col){
  const index=A*row+col,token=tokens[index],v60=grid.bytes[index],v59=b59(token);
  return {row,col,index,token,v60,v59};
}

const bridge={
  a:cell(M(-e),K),
  b:cell(K,K),
  B:cell(p,K),
};
assert.deepEqual(bridge.a,{row:26,col:2,index:210,token:'06',v60:6,v59:6});
assert.deepEqual(bridge.b,{row:2,col:2,index:18,token:'0F',v60:15,v59:15});
assert.deepEqual(bridge.B,{row:23,col:2,index:186,token:'0J',v60:19,v59:19});
assert.equal(bridge.a.v60,a);assert.equal(bridge.b.v60,b);assert.equal(bridge.B.v60,B);

// Charge the simple zero-based state-address family: every primitive p6 state
// field may be a row, and every primitive field that fits 0..7 may be a col.
const state={K,e,q,g,a,A,b,B,p};
const stateByValue=new Map(Object.entries(state).map(([name,value])=>[value,name]));
const legal=[],hits=[];
for(const [rowField,row] of Object.entries(state)){
  if(row<0||row>=rows)continue;
  for(const [colField,col] of Object.entries(state)){
    if(col<0||col>=cols)continue;
    const c=cell(row,col);
    const hit60=stateByValue.get(c.v60)||null,hit59=stateByValue.get(c.v59)||null;
    const rec={rowField,colField,...c,hit60,hit59};legal.push(rec);
    if(hit60||hit59)hits.push(rec);
  }
}
assert.equal(legal.length,45);
assert.deepEqual(hits.map(x=>[x.rowField,x.colField,x.token,x.hit60,x.hit59]),[
  ['K','K','0F','b','b'],
  ['p','K','0J','B','B'],
]);

// State values present as literal base60 bytes are sparse and unique.
const frequencies={};
for(const [name,value] of Object.entries(state))frequencies[name]=grid.bytes.filter(x=>x===value).length;
assert.deepEqual(frequencies,{K:0,e:0,q:1,g:1,a:1,A:0,b:1,B:1,p:0});

console.log(JSON.stringify({
  status:'PASS',
  classification:'post-discovery cross-artifact structural bridge; no plaintext/key claim',
  p6State:state,
  title:{W1,W2,W3,W4,lengths,H:titleH},
  p50Shape:{rows,cols,cells,relations:['cols=2^e=A','rows=2^g','cells=2^A']},
  exactKColumnBridge:bridge,
  primitiveStateAddressCharge:{legal:legal.length,hits:hits.length,hitRows:hits},
  stateValueFrequencies:frequencies,
  note:'The role choice {-e,K,p}-> {a,b,B} was recognized after p50/p6 work; preserve as a compact hypothesis, not a calibrated probability or decoder.'
},null,2));
