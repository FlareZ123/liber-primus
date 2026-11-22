/**
 * Source-native SFT: 31 printed 13-dot separators, 32 red-rune runs, 32×8 grid.
 * Independent original-cipher consumer; read-only; Node.js 22/CommonJS.
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name */
const load = name => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const ink = load('lp2-ink-annotations.json');
const gridSource = load('lp2-grid-256.json');

/** @type {{page:number,offset:number,isMarker:boolean}[]} */
const events = [];
for (const page of ink.pages) {
  /** @type {{page:number,offset:number,isMarker:boolean}[]} */
  const current = [];
  for (const span of page.red_spans || []) {
    assert.equal(Array.from(span.runes).length, span.length);
    for (let k = 0; k < span.length; k++) current.push({page:page.page,offset:span.start+k,isMarker:false});
  }
  for (const [offset,dots] of page.large_punctuation || []) {
    if (dots === 13) current.push({page:page.page,offset,isMarker:true});
  }
  current.sort((a,b)=>a.offset-b.offset || Number(b.isMarker)-Number(a.isMarker));
  events.push(...current);
}
assert.equal(events.length, 256);
assert.equal(events.filter(e=>e.isMarker).length, 31);
assert.equal(events.filter(e=>!e.isMarker).length, 225);

/** Number of red runes between consecutive dot markers; initial and terminal slots retained. */
const lengths = [0];
for (const event of events) {
  if (event.isMarker) lengths.push(0);
  else lengths[lengths.length - 1]++;
}
assert.equal(lengths.length, 32);
assert.deepEqual(lengths,[13,0,16,0,3,0,11,0,0,14,12,0,9,11,0,16,0,19,0,10,0,8,0,3,0,59,9,0,5,0,7,0]);

const grid = gridSource.pages.flatMap(page=>page.bytes);
assert.equal(grid.length, 256);
for (const b of grid) assert.ok(Number.isInteger(b) && b>=0 && b<=255);
// Source-defined row width eight; proposed column is field length modulo eight.
const key = Buffer.from(lengths.map((length,row)=>grid[row*8+(length%8)]));
assert.equal(key.length, 32);
assert.equal(key.toString('hex'),'ed5c796d27503bfe7a2eadd396da492ac90d7d0ee9f0eb510044af8e006ac071');

/** @param {string} algorithm @param {Buffer} keyMaterial @param {Buffer | null} iv @param {Buffer} data */
function decrypt(algorithm,keyMaterial,iv,data) {
  const d = crypto.createDecipheriv(algorithm,keyMaterial,iv);
  d.setAutoPadding(false);
  return Buffer.concat([d.update(data),d.final()]);
}
/** @param {Buffer} data */
function printable(data) { return [...data].filter(x=>x>=0x20&&x<=0x7E).length; }
const data = Buffer.from(grid);
const selected = Buffer.from(lengths.map((length,row)=>grid[row*8+(length%8)]));
assert.equal(printable(selected),15);
const ecb = decrypt('aes-256-ecb',key,null,data);
const cbc = decrypt('aes-256-cbc',key,Buffer.alloc(16),data);
assert.equal(ecb.length,256);
assert.equal(cbc.length,256);
assert.equal(printable(ecb),84);
assert.equal(printable(cbc),90);

// Native AES-256 positive: a real English plaintext encrypted under a known control key recovers exactly.
const controlPlain = Buffer.from('THE WORDS ARE THE MAP. '.repeat(11).padEnd(256,' '),'utf8');
assert.equal(controlPlain.length,256);
const controlKey = Buffer.alloc(32,0x55);
const enc = crypto.createCipheriv('aes-256-ecb',controlKey,null);
enc.setAutoPadding(false);
const controlCipher = Buffer.concat([enc.update(controlPlain),enc.final()]);
assert.deepEqual(decrypt('aes-256-ecb',controlKey,null,controlCipher),controlPlain);

console.log('PASS original source: 225 red runes + 31 thirteen-dot markers = 256 ordered events');
console.log('PASS 32 delimited red-rune counts:',lengths.join(','));
console.log('SOURCE-HYPOTHESIS 32 row-selected bytes / AES-256 key:',key.toString('hex'));
console.log('Original directly selected bytes printable:',printable(selected),'/32');
console.log('Original AES-256-ECB: printable',printable(ecb),'/256; hex prefix',ecb.subarray(0,32).toString('hex'));
console.log('Original AES-256-CBC zero IV: printable',printable(cbc),'/256; hex prefix',cbc.subarray(0,32).toString('hex'));
console.log('PASS independent AES-256 English positive 256/256; no LP2 plaintext or authenticated key');
