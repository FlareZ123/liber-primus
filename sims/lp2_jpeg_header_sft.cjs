'use strict';
/** Reproducible original LP2 JPEG non-entropy carrier census; Node 22, read only. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
/**
 * Read a baseline JPEG's source-visible headers and terminal EOI.
 * @param {Buffer} bytes
 * @returns {{sections:Array<{id:number,sha:string,bytes:Buffer}>,tail:number}}
 */
function inspect(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  const sections = [];
  let k=2;
  while(k<bytes.length) {
    assert.equal(bytes[k++],255);
    while(bytes[k]===255) k++;
    const id=bytes[k++];
    assert(id!==0xd8 && id!==0xd9 && id!==0);
    const len=bytes.readUInt16BE(k);
    assert(len>=2 && k+len<=bytes.length);
    const chunk=bytes.subarray(k+2,k+len);
    sections.push({id,bytes:chunk,sha:crypto.createHash('sha256').update(chunk).digest('hex')});
    k+=len;
    if(id!==0xda) continue;
    while(k<bytes.length-1) {
      if(bytes[k]!==255){k++;continue;}
      const next=bytes[k+1];
      if(next===0 || (next>=0xd0 && next<=0xd7)){k+=2;continue;}
      assert.equal(next,0xd9,'single-scan JPEG EOI');
      return {sections,tail:bytes.length-(k+2)};
    }
    throw Error('missing EOI');
  }
  throw Error('missing SOS');
}
/** Exact input: the original 58 LP2 JPEGs corresponding to physical pp0-57. */
function main() {
  const root=path.join(__dirname,'..','resources','liber-primus');
  const owner=new Map();
  let rgb=0, mono=0, sample;
  const markerCounts=new Map();
  for(let n=17;n<=74;n++) {
    const file=String(n).padStart(2,'0')+'.jpg';
    const raw=fs.readFileSync(path.join(root,file));
    if(!sample)sample=raw;
    const parsed=inspect(raw);
    assert.equal(parsed.tail,0,file+' trailer');
    const ids=parsed.sections.map(s=>s.id);
    const apps=ids.filter(x=>x>=0xe0 && x<=0xef);
    assert.deepEqual(apps,[0xe0,0xe2],file+' APP inventory');
    assert(!ids.includes(0xfe),file+' COM inventory');
    const sof=parsed.sections.find(s=>s.id===0xc0);
    assert(sof,file+' SOF0');
    assert.equal(sof.bytes.readUInt16BE(1),3600);
    assert.equal(sof.bytes.readUInt16BE(3),2400);
    const channels=sof.bytes[5];
    assert(channels===1 || channels===3);
    if(channels===1)mono++;else rgb++;
    assert.equal(ids.filter(x=>x===0xdb).length,channels===1?1:2);
    assert.equal(ids.filter(x=>x===0xc4).length,channels===1?2:4);
    assert.equal(ids.filter(x=>x===0xda).length,1);
    for(const seg of parsed.sections){
      markerCounts.set(seg.id,(markerCounts.get(seg.id)||0)+1);
      if(![0xe0,0xe2,0xdb].includes(seg.id))continue;
      const key=seg.id.toString(16)+':'+seg.sha;
      owner.set(key,(owner.get(key)||0)+1);
    }
  }
  assert.deepEqual([rgb,mono],[35,23]);
  const fixed=Array.from(owner.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.equal(fixed.filter(x=>x[0].startsWith('e0:')).length,1);
  assert.equal(fixed.filter(x=>x[0].startsWith('e2:')).length,1);
  assert.deepEqual(fixed.filter(x=>x[0].startsWith('db:')).map(x=>x[1]).sort((a,b)=>a-b),[35,58]);
  assert.equal(fixed.find(x=>x[0].startsWith('e0:'))[1],58);
  assert.equal(fixed.find(x=>x[0].startsWith('e2:'))[1],58);
  const sentinel=Buffer.from([255,254,0,4,65,66]);
  assert(inspect(Buffer.concat([sample.subarray(0,2),sentinel,sample.subarray(2)])).sections.some(s=>s.id===0xfe),'synthetic COM positive');
  const icc=inspect(sample).sections.find(s=>s.id===0xe2);
  assert(icc.bytes.includes(Buffer.from('Artifex Software sRGB ICC Profile')));
  console.log(JSON.stringify({
    source:'58 source JPEGs 17.jpg–74.jpg',frames:{rgb,grayscale:mono},
    sharedNonEntropyHeaders:fixed.map(([sha,count])=>({sha,count})),
    markerCounts:Object.fromEntries(Array.from(markerCounts.entries()).sort((a,b)=>a[0]-b[0]).map(([k,v])=>[k.toString(16),v])),
    missingPageSpecificAPPandCOM:true,trailingBytes:0,singleScans:58,
    limitation:'Image-dependent optimized DHT and entropy-coded pixels are not excluded as payload carriers.'
  },null,2));
}
if(require.main===module)main();
module.exports={inspect};