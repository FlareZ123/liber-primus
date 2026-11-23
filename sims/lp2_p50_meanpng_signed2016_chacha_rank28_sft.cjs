'use strict';

/**
 * Locked historical-source anti-repeat stream-cipher receiver.
 * Original fifth-column p50 key, January 2016 563x569 signed-image
 * dimensions as the 64-bit ChaCha20 nonce, GP29 predecessor-excluded
 * rank28 alphabet with a literal-F self-repeat escape.
 *
 * Source, not cipher text, chooses all nonces, keys and clocks.
 * Does not assert the actual Cicada author used ChaCha20.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const bytes = grid.pages.flatMap((page) => page.bytes);
assert.equal(bytes.length, 256);
const key = Buffer.from(Array.from({length:32}, (_,r) => bytes[r*8+4]));
assert.equal(key.toString('hex'), '61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4');
const iv = Buffer.alloc(16); // original ChaCha20: 64-bit LE block counter, then 64-bit LE nonce
iv.writeUInt32LE(563, 8);
iv.writeUInt32LE(569, 12);
const pages = corpus.pages.filter((page) => page.page<=55 && page.indices.length>0);
assert.equal(pages.length,55);
assert.equal(pages.reduce((s,p)=>s+p.indices.length,0),12956);
const GP=29;
const mod=(n,m)=>((n%m)+m)%m;

/** @param {number} count @returns {Buffer} */
function stream(count) {
  const cipher = createCipheriv('chacha20', key, iv);
  return Buffer.concat([cipher.update(Buffer.alloc(count)), cipher.final()]);
}

/**
 * Exact inverse of a nonrepeat alphabet with a literal-F zero escape.
 * No arbitrary IV per page. Ciphertext's first GP rune is a clear starter.
 * @param {number[]} values @param {Buffer} pad @param {number} sign
 * @returns {number[]}
 */
function decode(values,pad,sign){
  const out=[];
  for(let i=0;i<values.length;i++){
    if(i===0){out.push(values[0]);continue;}
    const d=mod(values[i]-values[i-1],GP);
    if(d===0) out.push(0);
    else out.push(1+mod((d-1)+sign*(pad[i]%28),28));
  }
  return out;
}

/**
 * Re-encodes source GP29 under precisely the inverse.
 * @param {number[]} plain @param {Buffer} pad @param {number} sign
 * @returns {number[]}
 */
function encode(plain,pad,sign){
  const out=[plain[0]];
  for(let i=1;i<plain.length;i++){
    if(plain[i]===0)out.push(out[i-1]);
    else out.push(mod(out[i-1]+1+mod(plain[i]-1-sign*(pad[i]%28),28),GP));
  }
  return out;
}

function ioc(seq){
  const h=Array(29).fill(0);
  for(const x of seq)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}

const sourcePage=corpus.pages.find(p=>p.page===57).indices;
assert.equal(sourcePage.length,95);
const truth=[];
for(const page of pages) truth.push(Array.from({length:page.indices.length},(_,i)=>sourcePage[i%sourcePage.length]));

const summaries=[];
for(const clock of ['continuous','page-reset']) {
  for(const sign of [-1,1]){
    const outputs=[];
    const onePad=clock==='continuous'?stream(12956):null;
    let offset=0;
    for(let pageNum=0;pageNum<pages.length;pageNum++){
      const page=pages[pageNum];
      const pad=clock==='continuous'?onePad.subarray(offset,offset+page.indices.length):stream(page.indices.length);
      const source=page.indices;
      const decoded=decode(source,pad,sign);
      const restored=encode(decoded,pad,sign);
      assert.deepEqual(restored,source);
      const plant=encode(truth[pageNum],pad,sign);
      assert.deepEqual(decode(plant,pad,sign),truth[pageNum]);
      outputs.push({page:page.page,values:decoded});
      offset+=page.indices.length;
    }
    const select=(start,end)=>outputs.filter(x=>x.page>=start&&x.page<=end).flatMap(x=>x.values);
    const sample1=select(16,21), sample2=select(40,53);
    summaries.push({
      clock,sign,
      training:'p16-21',
      trainingIoC:ioc(sample1),
      trainingFirst100:sample1.slice(0,100).map(x=>corpus.translit[x]).join(' '),
      heldout:'p40-53',
      heldoutIoC:ioc(sample2),
      heldoutFirst100:sample2.slice(0,100).map(x=>corpus.translit[x]).join(' '),
      syntheticFullNativeRoundtrip:true,
      originalExactRoundtrip:true
    });
  }
}
assert.equal(summaries.length,4);
assert.ok(summaries.every(x=>x.trainingIoC<0.041&&x.heldoutIoC<0.041));
console.log(JSON.stringify({key:key.toString('hex'),nonce:iv.toString('hex'),sourceRunes:12956, repeatRule:'F=0 as same predecessor, others modulo28 successor rank',positiveControl:'authentic p57 GP plaintext repeated to source page lengths, 4 exact round trips',original:summaries},null,2));
console.log('PASS: four original source-fixed rank28-ChaCha20 nonce variants nonprose, native plants exact.');
