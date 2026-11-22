'use strict';

/**
 * Test source-printed p50 eight 32-byte columns as standard 2014-era
 * AES256CTR/ChaCha20 zero-IV keys for the reversible GP29/DH28 nonzero-step
 * cipher, across all nine original whole chapters (unshifted source order).
 * Explicitly non-authenticated primitive and IV. Native GP planted inverse.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/base60-grid.json'));
assert.equal(table.byte_rows.length,32);
assert(table.byte_rows.every(row=>row.length===8));
const keys=Array.from({length:8},(_,column)=>
  Buffer.from(table.byte_rows.map(row=>row[column])));
assert(keys.every(x=>x.length===32));
const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]].map(([a,b])=>({
    label:a+'-'+b,
    indices:gp.pages.filter(p=>p.page>=a&&p.page<=b)
      .flatMap(p=>p.indices)
  }));
assert.equal(sections.reduce((s,x)=>s+x.indices.length,0),12956);
const mod=(x,m)=>(x%m+m)%m;
const exponent=new Uint8Array(28),log=new Int8Array(29).fill(-1);
let power=1;
for(let i=0;i<28;i++){
  assert.equal(log[power],-1);
  exponent[i]=power;log[power]=i;power=power*2%29;
}
assert.equal(power,1);
const algorithms=['aes-256-ctr','chacha20'];
for(const a of algorithms)assert(crypto.getCiphers().includes(a));
const stream=(a,key,n)=>{
  const c=crypto.createCipheriv(a,key,Buffer.alloc(16));
  return Buffer.concat([c.update(Buffer.alloc(n)),c.final()]);
};
const ioc=(hist,total)=>
  hist.reduce((n,x)=>n+x*(x-1),0)/(total*(total-1));
function trial(c,keyStream,sign){
  const frequencies=new Uint16Array(29);
  let n=0,exception=0;
  for(let i=1;i<c.length;i++){
    const delta=mod(c[i]-c[i-1],29);
    if(delta===0){frequencies[28]++;exception++;n++;continue}
    const value=mod(log[delta]+sign*(keyStream[i]%28),28);
    frequencies[value]++;n++;
  }
  return {score:ioc(frequencies,n),
    zeroSteps:exception,
    major:Math.max(...frequencies),
    first100SourceNative:undefined};
}
const results=[];
for(let section=0;section<sections.length;section++){
  const original=sections[section];
  const values=[];
  for(let column=0;column<8;column++)
  for(const algorithm of algorithms){
    const k=stream(algorithm,keys[column],original.indices.length);
    for(const sign of [-1,1]){
      const stats=trial(original.indices,k,sign);
      values.push({column,algorithm,sign,...stats});
    }
  }
  values.sort((a,b)=>b.score-a.score);
  results.push({pages:original.label,runes:original.indices.length,
    tested:values.length,best:values.slice(0,3)});
}
assert.equal(results.reduce((s,x)=>s+x.tested,0),288);

const clear=gp.pages.find(p=>p.page===57).indices;
assert.equal(clear.length,95);
const positiveSampleLength=1903;
const plain=Array.from({length:positiveSampleLength},(_,i)=>clear[i%95]);
for(let i=151;i<plain.length;i+=151)plain[i]=28;
let positive=0;
const controlScores=[];
for(const algorithm of algorithms)
for(let column=0;column<8;column++)
for(const sign of [-1,1]){
  const k=stream(algorithm,keys[column],positiveSampleLength);
  const ciphertext=new Uint8Array(plain.length);
  ciphertext[0]=13;
  for(let i=1;i<plain.length;i++){
    const step=plain[i]===28?0:
      exponent[mod(11*plain[i]+3-sign*(k[i]%28),28)];
    ciphertext[i]=(ciphertext[i-1]+step)%29;
  }
  const freq=new Uint16Array(29);
  for(let i=1;i<ciphertext.length;i++){
    const delta=mod(ciphertext[i]-ciphertext[i-1],29);
    const actual=delta===0?28:
      mod(23*(mod(log[delta]+sign*(k[i]%28),28)-3),28);
    assert.equal(actual,plain[i]);
    freq[actual]++;
  }
  const estimate=trial(ciphertext,k,sign);
  assert(estimate.score>0.05);
  controlScores.push(estimate.score);
  positive++;
}
assert.equal(positive,32);
const all=results.flatMap(x=>x.best.map(y=>({
  pages:x.pages,runes:x.runes,...y
})));
const strongest=all.slice().sort((a,b)=>b.score-a.score);
console.log(JSON.stringify({
  status:'Exact original 9-section DH28 exponent-chain AES/ChaCha column source test',
  source:'p50 32x8 original byte cells; eight 32byte keys; IV16 all-zero',
  originalTrials:288,
  sourceNativePositiveExact:positive,
  minPositiveIoC:Math.min(...controlScores),
  p15Original:results.find(x=>x.pages==='15-22'),
  p40Original:results.find(x=>x.pages==='40-53'),
  bestPerSection:results.map(x=>({pages:x.pages,runes:x.runes,best:x.best[0]})),
  globalTop:strongest.slice(0,4)
},null,2));
