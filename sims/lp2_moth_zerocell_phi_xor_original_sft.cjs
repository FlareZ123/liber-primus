/**
 * Zero-anchored p53/p55 moth vs original p50 byte table.
 * Historical source proposals: LP1 moth/totient and Cicada 2013 XOR.
 * Read-only Node22 SFT. Neither operation is claimed as creator-selected.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8'));
const record=JSON.parse(fs.readFileSync(path.join(root,'lp2-grid-256.json'),'utf8'));
const bytes=record.pages.flatMap(p=>p.bytes);
const p53=corpus.pages.find(p=>p.page===53).indices;
const p55full=corpus.pages.find(p=>p.page===55).indices;
const p55=p55full.slice(1);
assert.equal(p53.length,179); assert.equal(p55full.length,76);
assert.equal(p55full[0],21); assert.equal(bytes.length,256);
assert.deepEqual(bytes.flatMap((v,i)=>v===0?[i]:[]),[192,229]);
const rim=[];
for(let col=0;col<8;col++)rim.push(col);
for(let row=1;row<32;row++)rim.push(row*8+7);
for(let col=6;col>=0;col--)rim.push(31*8+col);
for(let row=30;row>=1;row--)rim.push(row*8);
const core=[];
for(let row=1;row<31;row++)for(let col=1;col<7;col++)core.push(row*8+col);
assert.equal(rim.length,76);assert.equal(core.length,180);
assert.equal(new Set([...core,...rim]).size,256);
/** @param {number} n Natural input >= 1 */
function phi(n){
  assert.ok(Number.isSafeInteger(n)&&n>=1);
  let v=n,q=n;
  for(let p=2;p*p<=q;p++)if(q%p===0){
    while(q%p===0)q/=p;
    v=(v/p)*(p-1);
  }
  if(q>1)v=(v/q)*(q-1);
  return v;
}
const primes=[];
for(let n=2;primes.length<255;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
/** @param {number[]} values */
function ioc(values){
  const counts=Array(29).fill(0);
  for(const v of values){assert.ok(v>=0&&v<29);counts[v]++;}
  return counts.reduce((s,v)=>s+v*(v-1),0)/(values.length*(values.length-1));
}
const keyModes=[
  ['phi-byte',byte=>phi(byte)],
  ['phi-indexed-prime',byte=>phi(primes[byte-1])]
];
const sources=[
  {p:53,runes:p53,zone:core,zero:229},
  {p:55,runes:p55,zone:rim,zero:192}
];
const xorKeys={
  'GP-prime':Array(256).fill(null),
  'GP-ordinal':Array(256).fill(null),
  'GP-prime-totient':Array(256).fill(null)
};
const decoded=[];
for(const source of sources){
  const {p,runes,zone,zero}=source;
  assert.equal(zone.length,runes.length+1);
  const k=zone.indexOf(zero);
  assert.ok(k>=0);
  const addresses=runes.map((_,i)=>zone[(k+1+i)%zone.length]);
  assert.equal(new Set(addresses).size,runes.length);
  assert.ok(addresses.every(cell=>bytes[cell]>0));
  assert.equal(zone[(k+1+runes.length)%zone.length],zero);
  for(const [name,operation] of keyModes)for(const sign of [-1,1]){
    const shift=addresses.map(cell=>operation(bytes[cell])%29);
    const plain=runes.map((value,i)=>(value+sign*shift[i]+29)%29);
    assert.ok(plain.every((v,i)=>(v-sign*shift[i]+29)%29===runes[i]));
    const solved=corpus.pages.find(page=>page.page===57).indices;
    const plant=plain.map((_,i)=>solved[i%solved.length]);
    const encrypted=plant.map((v,i)=>(v-sign*shift[i]+29)%29);
    assert.deepEqual(encrypted.map((v,i)=>(v+sign*shift[i]+29)%29),plant);
    decoded.push({p,name,sign,ioc:ioc(plain),text32:plain.slice(0,32).map(v=>corpus.translit[v]).join(' ')});
  }
  for(let i=0;i<runes.length;i++){
    const cell=addresses[i],rune=runes[i];
    assert.equal(xorKeys['GP-prime'][cell],null);
    xorKeys['GP-prime'][cell]=corpus.prime[rune];
    xorKeys['GP-ordinal'][cell]=rune;
    xorKeys['GP-prime-totient'][cell]=phi(corpus.prime[rune]);
  }
  for(const key of Object.values(xorKeys))key[zero]=-1;
}
assert.ok(Object.values(xorKeys).every(key=>key.every(v=>v!==null)));
const printable=v=>v===9||v===10||v===13||(v>=32&&v<=126);
const xor=[];
for(const [name,source] of Object.entries(xorKeys))for(const mark of [0,13]){
  const key=source.map(v=>v===-1?mark:v);
  const result=bytes.map((value,i)=>value^key[i]);
  assert.ok(result.every((value,i)=>(value^key[i])===bytes[i]));
  xor.push({name,mark,printable:result.filter(printable).length,head20hex:result.slice(0,20).map(v=>v.toString(16).padStart(2,'0')).join('')});
}
const expected=[0.033958947963,0.033394011675,0.032954616785,0.032326909799,0.032792792793,0.031351351351,0.033513513514,0.030990990991];
assert.deepEqual(decoded.map(v=>Number(v.ioc.toFixed(12))),expected);
assert.deepEqual(xor.map(v=>v.printable),[97,99,104,106,97,99]);
console.log(JSON.stringify({originalPrintable:bytes.filter(printable).length,decoded,xor,verified:true},null,2));
