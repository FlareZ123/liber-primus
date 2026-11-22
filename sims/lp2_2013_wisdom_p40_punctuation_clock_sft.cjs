/** Original 2013 wisdom 3368B as eight-byte header and 3316 GP+44 punctuation clock. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const punctuation=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-punctuation-identity.json'),'utf8'));
const bytes=Buffer.from(fs.readFileSync(path.join(root,'resources/historical/cicada-2013-os-wisdom-folly.bin.b64'),'utf8').trim(),'base64');
assert.equal(bytes.length,3368);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');
const base=corpus.pages.slice(0,40).reduce((s,p)=>s+p.indices.length,0);
assert.equal(base,9640);
const cipher=corpus.pages.slice(40,56).flatMap(p=>p.indices);
const events=punctuation.events.filter(e=>e.page>=40&&e.page<=55);
assert.equal(cipher.length,3316);
assert.equal(events.length,44);
assert.equal(8+cipher.length+events.length,bytes.length);
const offsets=events.map(e=>e.rune_offset-base);
assert(offsets.every(n=>n>=0&&n<=cipher.length));
const index=[];
let clock=8,event=0;
for(let pos=0;pos<=cipher.length;pos++){
 while(event<offsets.length&&offsets[event]===pos){clock++;event++;}
 if(pos===cipher.length)break;
 index.push(clock++);
}
assert.equal(clock,bytes.length);
assert.equal(event,events.length);
const mod29=x=>((x%29)+29)%29;
const ioc=a=>{const f=Array(29).fill(0);a.forEach(x=>f[x]++);return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1));};
const control=corpus.pages[57].indices;
assert.equal(control.length,95);
const plant=Array.from({length:cipher.length},(_,i)=>control[i%control.length]);
const results=[];
for(const mode of ['mod','scale'])for(const sign of [-1,1]){
 const key=i=>mode==='mod'?bytes[index[i]]%29:Math.floor(bytes[index[i]]*29/256);
 const decode=a=>a.map((x,i)=>mod29(x+sign*key(i)));
 const encode=a=>a.map((x,i)=>mod29(x-sign*key(i)));
 const p=decode(cipher);
 assert.deepEqual(encode(p),cipher);
 assert.deepEqual(decode(encode(plant)),plant);
 results.push({mode,sign,ioc:ioc(p),head:p.slice(0,24).map(i=>corpus.translit[i]).join(' ')});
}
const expected=[0.03462111577488006,0.03431035957112733,0.034534875470091535,0.034407334428621594];
results.forEach((r,i)=>assert(Math.abs(r.ioc-expected[i])<1e-13));
console.log(JSON.stringify({source:'original 2013 ISO wisdom/folly bytes and LP2 pp40-55',bytes:bytes.length,
 runes:cipher.length,punctuation:events.length,header:8,clock,
 results,positivePlant:'3316/3316 in all modes, original ciphertext reconstructed exactly'},null,2));
