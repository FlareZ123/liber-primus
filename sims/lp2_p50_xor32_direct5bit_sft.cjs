#!/usr/bin/env node
'use strict';

// Frozen repeating-XOR hypothesis: p50's eight 32-byte base60 columns are
// section keys; each $-terminated GP29 section is packed MSB-first at 5 bits
// per rune and XORed with its corresponding key repeated every 32 bytes.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = [...grid.alphabet];
const digit = new Map(alphabet.map((ch, i) => [ch, i]));
const value = token => digit.get(token[0]) * 60 + digit.get(token[1]);
const keys = Array.from({ length: 8 }, (_, col) => Buffer.from(grid.rows.map(row => value(row[col]))));
assert(keys.every(k => k.length === 32));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcription.split('$').slice(0, 8).map(s =>
  [...s].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch))
);
const expected = [729,1145,1738,1894,1021,1433,1680,3316];
assert.deepEqual(sections.map(s => s.length), expected);
assert.deepEqual(sections.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

function pack5(values) {
  const out=[]; let acc=0,bits=0;
  for (const v of values) {
    assert(v>=0 && v<29);
    acc=(acc<<5)|v; bits+=5;
    while(bits>=8){bits-=8;out.push((acc>>>bits)&255);acc&=(1<<bits)-1;}
  }
  if(bits) out.push((acc<<(8-bits))&255);
  return Buffer.from(out);
}
function unpack5(bytes,n) {
  const out=[];let acc=0,bits=0,at=0;
  while(out.length<n){
    while(bits<5){acc=(acc<<8)|bytes[at++];bits+=8;}
    bits-=5;out.push((acc>>>bits)&31);acc&=(1<<bits)-1;
  }
  return out;
}
function xor(bytes,key) {
  return Buffer.from(bytes.map((b,i)=>b^key[i%key.length]));
}
let seed=0x3301;
function rand29(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29;}
for(let col=0;col<8;col++){
  const plant=Array.from({length:513},rand29);
  assert.deepEqual(unpack5(xor(xor(pack5(plant),keys[col]),keys[col]),plant.length),plant);
}
const results=sections.map((s,col)=>{
  const packed=pack5(s);
  const values=unpack5(xor(packed,keys[col]),s.length);
  return {
    section:col+1,
    rune_count:s.length,
    packed_bytes:packed.length,
    invalid_5bit_symbols:values.filter(v=>v>=29).length,
    prefix:values.slice(0,100).map(v=>v<29?corpus.translit[v]:'['+v+']').join(''),
    key_sha256:crypto.createHash('sha256').update(keys[col]).digest('hex')
  };
});
const total=results.reduce((s,r)=>s+r.invalid_5bit_symbols,0);
console.log(JSON.stringify({
  hypothesis:'repeating XOR of 5-bit GP29 sections with p50 32-byte column keys',
  parameters:{table:'base60-grid.json, 32x8, columns top-to-bottom',section_lengths:expected,
    section_to_key:'left-to-right',key_period_bytes:32,symbol_packing:'MSB-first 5-bit',
    no_extra_nonce_or_offset:true},
  controls:{eight_513_symbol_plants_roundtrip:true},
  decoded_symbols:sections.reduce((s,x)=>s+x.length,0),
  invalid_symbols_29_to_31:total,
  sections:results
},null,2));
