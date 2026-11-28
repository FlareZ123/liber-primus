/**
 * LP2 mixed printed-mark / equal-adjacent 256-event clock.
 * Read-only original-cipher SFT, Node.js 22. No key or plaintext claim.
 * Coordinates: an event at rune offset k is the boundary before rune k
 * (large/stop glyph after rune k-1, or repeated rune at k).
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const punct = load('resources/liber-primus/lp2-punctuation-identity.json');
const cells = grid.pages.flatMap(p => p.tokens);
const bytes = Buffer.from(grid.bytes);
assert.equal(cells.length, 256);
assert.equal(bytes.length, 256);
const absent = new Set([57, 58, 59, 60, 125]);
const physical = punct.events.filter(e => !absent.has(e.index));
assert.equal(physical.length, 175);
const comma = physical.filter(e => e.symbol === '⁚' || e.index === 127);
assert.equal(comma.length, 5);
const printed = physical.filter(e => e.symbol === '⁜' || (e.symbol === '⁘' && e.index !== 127));
assert.equal(printed.length, 170);
assert.equal(printed.filter(e => e.symbol === '⁜').length, 31);
assert.equal(printed.filter(e => e.symbol === '⁘').length, 139);
const marks = printed.map(e => ({offset: e.rune_offset, kind: 'mark', source_id: e.index}));
const pages = corpus.pages.filter(p => p.page <= 55);
const tape = [];
const repeats = [];
let global = 0;
let sourcePageCount = 0;
for (const p of pages) {
  if (!p.indices.length) continue;
  sourcePageCount++;
  tape.push(...p.indices);
  for (let i = 1; i < p.indices.length; i++) {
    if (p.indices[i] === p.indices[i-1]) {
      repeats.push({offset: global+i, kind:'repeat', page:p.page, local:i});
    }
  }
  global += p.indices.length;
}
assert.equal(sourcePageCount, 55);
assert.equal(tape.length, 12956);
assert.equal(repeats.length, 86);
const events = [...marks, ...repeats].sort((a,b) =>
  a.offset-b.offset || a.kind.localeCompare(b.kind) || (a.source_id ?? 0) - (b.source_id ?? 0));
assert.equal(events.length, 256);
assert.equal(events[0].offset, 13);
assert.equal(events[255].offset, 12956);
const dup = events.map((e,i) => (i>0 && e.offset===events[i-1].offset) ? e.offset : -1).filter(x=>x>=0);
assert.deepEqual(dup, [1860, 3603, 8385, 9358]);
const keyBits = events.map(e => e.kind === 'repeat' ? '1' : '0').join('');
const key = Buffer.alloc(32);
for(let i=0;i<32;i++) key[i] = parseInt(keyBits.slice(8*i,8*i+8),2);
assert.equal(key.toString('hex'),'5052740402cd0901000805b590f8d69720ae08143323e802026095d29182120e');
assert.equal(key.reduce((s,b)=>s+b.toString(2).split('1').length-1,0),86);
const segments=[];
let start=0;
for(let i=0;i<256;i++){
  const end=events[i].offset;
  assert.ok(end>=start);
  segments.push({start,end,key:bytes[i]%29});
  start=end;
}
assert.equal(segments.reduce((s,x)=>s+x.end-x.start,0),12956);
assert.equal(segments.filter(x=>x.end===x.start).length,4);
assert.equal(segments[0].end-segments[0].start,13);
const gaps = segments.map(x=>x.end-x.start);
const hist60 = xs => Array.from({length:6},(_,i)=>xs.filter(x=>Math.floor(x/60)===i).length);
assert.deepEqual(hist60(gaps),[171,62,16,5,2,0]);
assert.deepEqual(hist60([...bytes]),[60,58,65,56,17,0]);
assert.equal(Math.max(...gaps),292);
assert.equal(Math.max(...bytes),255);
assert.equal(bytes.filter(x=>x===0).length,2);
const decode = input => {
  const out=Array(input.length);
  for(const {start,end,key} of segments)for(let i=start;i<end;i++)out[i]=(input[i]-key+29)%29;
  return out;
};
const encode = input => {
  const out=Array(input.length);
  for(const {start,end,key} of segments)for(let i=start;i<end;i++)out[i]=(input[i]+key)%29;
  return out;
};
const plain=decode(tape);
assert.deepEqual(encode(plain),tape);
const ioc=a=>{const hist=Array(29).fill(0);for(const x of a)hist[x]++;return hist.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));};
const origIoC=ioc(tape), decIoC=ioc(plain);
assert.ok(Math.abs(origIoC-0.03447839786450569)<1e-12);
assert.ok(Math.abs(decIoC-0.03449838058904115)<1e-12);
const aes=crypto.createDecipheriv('aes-256-ecb',key,null);
aes.setAutoPadding(false);
const aesPlain=Buffer.concat([aes.update(bytes),aes.final()]);
assert.equal(aesPlain.length,256);
assert.equal(aesPlain.subarray(0,16).toString('hex'),'c61df7223788fd6e7d94fa917890e3a5');
const printable = b => [...b].filter(x=>x>=32&&x<=126).length;
assert.equal(printable(aesPlain),86);
assert.equal(printable(bytes),103);
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha256(key),'37598a19ad33640000b73c62e01a0b76358e43418f56b876108185a2f97e23a5');
assert.equal(sha256(aesPlain),'a86357e6320bc2cd06ac43db3e67478d2901b028b0c12b0a7e4583ad3639a158');
const output={
  source_events:{repeats:repeats.length,four_dots:139,large:31,commas_excluded:5,total:events.length,distinct_boundaries:new Set(events.map(x=>x.offset)).size,empty_intervals:dup},
  event_mask_hex:key.toString('hex'),
  gap_source_exclusion:{max_gap:292,max_panel_byte:255,zero_gap_count:4,zero_panel_byte_count:2,gap_base60_high_hist:hist60(gaps),panel_base60_high_hist:hist60([...bytes])},
  interval_GP29_subtractive:{original_ioc:origIoC,decoded_ioc:decIoC,forward_exact:true,first_32:plain.slice(0,32).map(x=>corpus.translit[x]).join('')},
  aes256_ecb_base60_grid:{first_16_hex:aesPlain.subarray(0,16).toString('hex'),printable_octets:printable(aesPlain),sha256:sha256(aesPlain)}
};
console.log(JSON.stringify(output,null,2));
