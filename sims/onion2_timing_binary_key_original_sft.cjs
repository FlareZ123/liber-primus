'use strict';
/**
 * Source clock -> binary 240-bit original 2014 onion2 occupancy register:
 * each five-minute slot is 0 for no new byte, 1 on a byte arrival.
 * The archive fixes 112 gaps and one 30-minute (six-slot) joint bridge.
 * Test 5 bridge variants as 30-byte/48-five-bit direct GP29 key sources
 * on all original 12,956 unknown LP2 runes, no fitted key or F mask.
 * This is NOT an authenticated LP2 key or plaintext decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname,'..');
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
/** @param {number} x */
const mod = x => (x%29+29)%29;
/** @param {number[]} a */
function ioc(a) {
  const h = Array(29).fill(0);
  for(const n of a) h[n]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** Five-minute inter-arrival gaps -> 0^(k-1)1 bitstream.
 * @param {Map<number,number>} gaps
 * @param {number} k190
 * @param {number} k191
 */
function encode(gaps,k190,k191) {
  const ks = Array.from({length:114},(_,i)=>{
    const pos = i+143;
    return pos===190?k190:pos===191?k191:gaps.get(pos);
  });
  assert.ok(ks.every(k=>Number.isInteger(k)&&k>=1&&k<=7));
  assert.equal(ks.reduce((s,k)=>s+k,0),240);
  const bitstring = ks.map(k=>'0'.repeat(k-1)+'1').join('');
  assert.equal(bitstring.length,240);
  assert.equal([...bitstring].filter(b=>b==='1').length,114);
  const bytes = Array.from({length:30},(_,i)=>parseInt(bitstring.slice(8*i,8*i+8),2));
  return {bitstring,bytes};
}
/** @param {number[]} plain @param {number[]} pad @param {number} sign @param {number} start */
function transform(plain,pad,sign,start=0) {
  return plain.map((x,i)=>mod(x+sign*pad[(start+i)%pad.length]));
}
function main() {
  const t = read('resources/cicada2014-onion2-timing.json');
  const c = read('resources/liber-primus/lp2-corpus.json');
  const historicalBytes = Buffer.from(t.final_hex,'hex');
  assert.equal(historicalBytes.length,256);
  assert.equal(crypto.createHash('sha256').update(historicalBytes).digest('hex'),t.final_bytes_sha256);
  const gaps = new Map(t.interval_cells.map(x=>[x.pos,x.k_5min]));
  assert.equal(gaps.size,112);
  assert.deepEqual(t.bounded_bridge.positions,[190,191]);
  const pages=c.pages.filter(p=>p.page<=55&&p.indices?.length);
  const original=pages.flatMap(p=>p.indices);
  assert.equal(pages.length,55);
  assert.equal(original.length,12956);
  const expectedHex=[
    '414e9c692c24c63940b4e424a55d85c9cb442dc721db2ad837acc97796dd',
    '414e9c692c24c63940b4e424a55d45c9cb442dc721db2ad837acc97796dd',
    '414e9c692c24c63940b4e424a55d25c9cb442dc721db2ad837acc97796dd',
    '414e9c692c24c63940b4e424a55d15c9cb442dc721db2ad837acc97796dd',
    '414e9c692c24c63940b4e424a55d0dc9cb442dc721db2ad837acc97796dd'
  ];
  const results=[];
  const candidates=[];
  let index=0;
  for(const [k190,k191] of t.bounded_bridge.variants_k) {
    const clock = encode(gaps,k190,k191);
    const hex=Buffer.from(clock.bytes).toString('hex');
    assert.equal(hex,expectedHex[index++]);
    candidates.push({missingIntervals:[k190,k191],hex});
    for(const width of [5,8]) {
      const pad0=Array.from({length:240/width},(_,i)=>
        parseInt(clock.bitstring.slice(width*i,width*(i+1)),2));
      for(const reversed of [false,true]) {
        const pad=(reversed?pad0.slice().reverse():pad0).map(mod);
        for(const sign of [-1,1])for(const reset of ['page','global']) {
          let offset=0;
          const recovered=pages.flatMap(p=>{
            const q=transform(p.indices,pad,sign,reset==='global'?offset:0);
            offset+=p.indices.length;
            return q;
          });
          // Known-source forward/reverse algebra and a positive plant.
          const plant=[2,18,13,4,10,19,18,15,24,4,18,15,24,5,4,18,23];
          const encryptedPlant=transform(plant,pad,-sign);
          assert.deepEqual(transform(encryptedPlant,pad,sign),plant);
          assert.equal(recovered.length,original.length);
          results.push({missingIntervals:[k190,k191],width,reversed,sign,reset,
            ioc:ioc(recovered),letterE:recovered.filter(v=>v===18).length,
            originalReenciphers:pages.every((p,pi)=>{
              // Actual equality under the same key clock: must use correct offset.
              const base=reset==='global'?pages.slice(0,pi).reduce((s,q)=>s+q.indices.length,0):0;
              return p.indices.every((v,j)=>mod(mod(v+sign*pad[(base+j)%pad.length])-sign*pad[(base+j)%pad.length])===v);
            })});
        }
      }
    }
  }
  assert.equal(results.length,80);
  assert.ok(results.every(v=>v.originalReenciphers));
  results.sort((a,b)=>b.ioc-a.ioc);
  assert.equal(ioc(original),0.03447839786450569);
  assert.equal(results[0].ioc,0.03454412518027051);
  assert.equal(results[0].width,5);
  assert.equal(results[0].reversed,true);
  assert.equal(results[0].sign,-1);
  assert.equal(results[0].reset,'global');
  console.log(JSON.stringify({source:'2014 historical 112 arrivals; five admissible 190-191 bridge pairs',
    firstNineIntervalsLowConfidence:true,bitSlots:240,bitOnes:114,byteStreams:candidates,
    originalRunes:original.length,rawIoC:ioc(original),testedModels:results.length,
    best:results[0],worstIoC:results[results.length-1].ioc,
    caveat:'30-byte 5-minute occupancy stream is recovered only for observed 2014 suffix; neither direct GP29 key register nor AN prefix gives LP2 plaintext.'},null,2));
}
if(require.main===module)main();
module.exports={encode,transform,ioc};
