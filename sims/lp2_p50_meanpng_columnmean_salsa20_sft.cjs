'use strict';
// Agent20, 2026-11-28. A single conditional typed p50 fifth-column key +
// physically columnwise floor-mean nonce into period-authentic Salsa20/20.
// No fitted nonce phase/rounds/byte order/cipher parameter.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-grid-256.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const bytes=grid.pages.flatMap(p=>p.bytes);
assert.equal(bytes.length,256);
const cols=Array.from({length:8},(_,j)=>bytes.filter((_,i)=>i%8===j));
assert.ok(cols.every(a=>a.length===32));
const key=Buffer.from(cols[4]);
const nonce=Buffer.from(cols.map(a=>Math.floor(a.reduce((x,y)=>x+y,0)/32)));
assert.equal(key.toString('hex'),'61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
assert.equal(nonce.toString('hex'),'8b997d75826b8879');
const read32=(buf,i)=>buf.readUInt32LE(i),rot=(a,n)=>((a<<n)|(a>>>(32-n)))>>>0;
function initial(key,iv){
 const c=Buffer.from(key.length===32?'expand 32-byte k':'expand 16-byte k');
 const t=key.length===32?16:0;
 assert.ok(key.length===16||key.length===32);assert.equal(iv.length,8);
 return [read32(c,0),read32(key,0),read32(key,4),read32(key,8),read32(key,12),read32(c,4),read32(iv,0),read32(iv,4),0,0,read32(c,8),read32(key,t),read32(key,t+4),read32(key,t+8),read32(key,t+12),read32(c,12)]
}
function block(initialState,counter) {
 const s=initialState.slice();s[8]=counter>>>0;s[9]=Math.floor(counter/2**32)>>>0;
 const x=s.slice();
 for(let j=0;j<10;j++){
 x[4]^=rot((x[0]+x[12])>>>0,7);x[8]^=rot((x[4]+x[0])>>>0,9);x[12]^=rot((x[8]+x[4])>>>0,13);x[0]^=rot((x[12]+x[8])>>>0,18);
 x[9]^=rot((x[5]+x[1])>>>0,7);x[13]^=rot((x[9]+x[5])>>>0,9);x[1]^=rot((x[13]+x[9])>>>0,13);x[5]^=rot((x[1]+x[13])>>>0,18);
 x[14]^=rot((x[10]+x[6])>>>0,7);x[2]^=rot((x[14]+x[10])>>>0,9);x[6]^=rot((x[2]+x[14])>>>0,13);x[10]^=rot((x[6]+x[2])>>>0,18);
 x[3]^=rot((x[15]+x[11])>>>0,7);x[7]^=rot((x[3]+x[15])>>>0,9);x[11]^=rot((x[7]+x[3])>>>0,13);x[15]^=rot((x[11]+x[7])>>>0,18);
 x[1]^=rot((x[0]+x[3])>>>0,7);x[2]^=rot((x[1]+x[0])>>>0,9);x[3]^=rot((x[2]+x[1])>>>0,13);x[0]^=rot((x[3]+x[2])>>>0,18);
 x[6]^=rot((x[5]+x[4])>>>0,7);x[7]^=rot((x[6]+x[5])>>>0,9);x[4]^=rot((x[7]+x[6])>>>0,13);x[5]^=rot((x[4]+x[7])>>>0,18);
 x[11]^=rot((x[10]+x[9])>>>0,7);x[8]^=rot((x[11]+x[10])>>>0,9);x[9]^=rot((x[8]+x[11])>>>0,13);x[10]^=rot((x[9]+x[8])>>>0,18);
 x[12]^=rot((x[15]+x[14])>>>0,7);x[13]^=rot((x[12]+x[15])>>>0,9);x[14]^=rot((x[13]+x[12])>>>0,13);x[15]^=rot((x[14]+x[13])>>>0,18);
 }
 const out=Buffer.alloc(64);for(let i=0;i<16;i++)out.writeUInt32LE((x[i]+s[i])>>>0,i*4);
 return out;
}

// Official 256-bit-key Salsa20/20 first 64-byte known answer from eSTREAM.
const plantKey=Buffer.from('80'+'00'.repeat(31),'hex');
const official='e3be8fdd8beca2e3ea8ef9475b29a6e7003951e1097a5c38d23b7a5fad9f6844b22c97559e2723c7cbbd3fe4fc8d9a0744652a83e72a9c461876af4d7ef1a117';
assert.equal(block(initial(plantKey,Buffer.alloc(8)),0).toString('hex'),official);
function stream(n){const s=initial(key,nonce);return Buffer.concat(Array.from({length:Math.ceil(n/64)},(_,i)=>block(s,i))).subarray(0,n)}
function inverse(c,k){return c.map((x,i)=>(x-k[i]%29+29)%29)}
function ioc(a){const h=Array(29).fill(0);a.forEach(i=>h[i]++);return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
const pages=corpus.pages.filter(p=>p.page<56&&p.indices?.length),all=pages.flatMap(p=>p.indices);
assert.equal(pages.length,55);assert.equal(all.length,12956);
const known=corpus.pages.find(p=>p.page===56).indices.slice(0,80);
const kKnown=stream(known.length);
assert.deepEqual(inverse(known.map((v,i)=>(v+kKnown[i]%29)%29),kKnown),known);
const kReset=stream(Math.max(...pages.map(p=>p.indices.length)));
const reset=pages.flatMap(p=>inverse(p.indices,kReset));
const continuous=inverse(all,stream(all.length));
const getPage=(n)=>pages.find(p=>p.page===n);
const p55=inverse(getPage(55).indices,kReset),p0=inverse(getPage(0).indices,kReset);
const out={key:key.toString('hex'),nonce:nonce.toString('hex'),nativeRuneControl:known.length,
 originalRuneCount:all.length,rawIoC:ioc(all),pageResetIoC:ioc(reset),continuousIoC:ioc(continuous),
 p0:{count:p0.length,ioc:ioc(p0),first80:p0.slice(0,80).map(i=>corpus.translit[i]).join('')},
 p55:{count:p55.length,ioc:ioc(p55),first80:p55.slice(0,80).map(i=>corpus.translit[i]).join('')}};
assert.equal(out.p0.count,262);assert.equal(out.p55.count,76);
for(const [value,expected] of [[out.rawIoC,0.03447839786450569],[out.pageResetIoC,0.0344842961642344],[out.continuousIoC,0.034477897402710525],[out.p55.ioc,0.03263157894736842]])
 assert.ok(Math.abs(value-expected)<1e-12);
console.log(JSON.stringify(out,null,2));
