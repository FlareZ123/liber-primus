#!/usr/bin/env node
'use strict';

/**
 * Director Issue #868: exact 512-bit target extraction from the printed
 * 256-cell pp49–51 base60 numeral table.
 *
 * Each cell has a six-bit units digit in two plausible source codecs:
 * native base60 and base59 with the absent lowercase f deleted.
 * Test its three independent nonoverlapping two-bit planes, printed
 * row-major vs clockwise four-shell order, both forward and reverse.
 * Each two-bit value is serialized high bit first, matching standard
 * SHA-512 digest hexadecimal bit order. No ciphertext fit is performed.
 *
 * Windows Node22, built-ins only; run as one SFT from any working dir.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {any} */
const load = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const grid = load('resources/liber-primus/base60-grid.json');
const corpus = load('resources/liber-primus/lp2-corpus.json');
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const digits = grid.alphabet;
const digits59 = digits.replace('f','');
const cells = grid.rows.flat();
assert.equal(target.length,128);
assert(/^[0-9a-f]{128}$/.test(target));
assert.equal(grid.rows.length,32);
assert(grid.rows.every(row=>row.length===8));
assert.equal(cells.length,256);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row=>row.length===8));
assert.equal(corpus.pages.find(p=>p.page===56).runic_count,85);
assert.equal(crypto.createHash('sha256')
  .update(Buffer.from(grid.byte_rows.flat())).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @type {[number,number][]} */
const shellCoordinates = [];
for(let depth=0;depth<4;depth++){
  const top=depth,bottom=31-depth,left=depth,right=7-depth;
  for(let col=left;col<=right;col++)shellCoordinates.push([top,col]);
  for(let row=top+1;row<=bottom;row++)shellCoordinates.push([row,right]);
  for(let col=right-1;col>=left;col--)shellCoordinates.push([bottom,col]);
  for(let row=bottom-1;row>top;row--)shellCoordinates.push([row,left]);
}
assert.equal(shellCoordinates.length,256);
assert.equal(new Set(shellCoordinates.map(([r,c])=>r*8+c)).size,256);
const shellLengths=[76,68,60,52];
assert.equal(shellLengths.reduce((a,b)=>a+b,0),256);
const readOrders = [
  {name:'printed-row-major',coordinates:Array.from({length:256},(_,i)=>[Math.floor(i/8),i%8])},
  {name:'clockwise-shells',coordinates:shellCoordinates}
];
const targetBits=[...target].flatMap(h=>{
  const v=Number.parseInt(h,16);
  return [(v>>>3)&1,(v>>>2)&1,(v>>>1)&1,v&1];
});
assert.equal(targetBits.length,512);

/**
 * Source digit index in a fixed historically published alphabet.
 * @param {string} token
 * @param {60|59} radix
 * @returns {number}
 */
function unitDigit(token,radix){
  const alphabet=radix===60?digits:digits59;
  const hi=alphabet.indexOf(token[0]);
  const lo=alphabet.indexOf(token[1]);
  assert(hi>=0 && lo>=0, 'source glyph outside proposed codec');
  const numeric=hi*radix+lo;
  assert(numeric<256, 'a printed source token is not one byte in this codec');
  return numeric%radix;
}

/**
 * The two bits at the selected six-bit units-digit plane.
 * @param {string[]} tokens
 * @param {60|59} radix
 * @param {number} plane
 * @returns {number[]}
 */
function extract(tokens,radix,plane){
  assert([0,2,4].includes(plane));
  const output=[];
  for(const t of tokens){
    const pair=(unitDigit(t,radix)>>>plane)&3;
    output.push((pair>>>1)&1,pair&1);
  }
  return output;
}

/**
 * Build an original-shaped, full256-token positive plant under one
 * selected transport with the exact independently solved 512-bit digest.
 * @param {number[]} bits
 * @param {60|59} radix
 * @param {number} plane
 * @returns {string[]}
 */
function encodePlant(bits,radix,plane){
  const alphabet=radix===60?digits:digits59;
  const output=[];
  for(let i=0;i<bits.length;i+=2){
    const pair=2*bits[i]+bits[i+1];
    output.push('0'+alphabet[pair<<plane]);
  }
  assert.equal(output.length,256);
  assert.deepEqual(extract(output,radix,plane),bits);
  return output;
}
const cases=[];
for(const order of readOrders){
  for(const reverse of [false,true]){
    const tokens=order.coordinates.map(([row,col])=>grid.rows[row][col]);
    if(reverse)tokens.reverse();
    for(const radix of [60,59]){
      for(const plane of [0,2,4]){
        const extracted=extract(tokens,radix,plane);
        const correct=extracted.filter((v,i)=>v===targetBits[i]).length;
        const mismatches=targetBits.flatMap((v,i)=>v===extracted[i]?[]:[i]);
        const synthetic=encodePlant(targetBits,radix,plane);
        // Apply the same source transport to 256 synthetically authored
        // original-shaped cells and recover every target bit exactly.
        const sourcePlant=Array.from({length:32},()=>Array(8).fill('00'));
        order.coordinates.forEach(([r,c],i)=>{
          sourcePlant[r][c]=synthetic[reverse?255-i:i];
        });
        const selectedPlant=order.coordinates.map(([r,c])=>sourcePlant[r][c]);
        if(reverse)selectedPlant.reverse();
        assert.deepEqual(extract(selectedPlant,radix,plane),targetBits);
        cases.push({
          order:order.name,reverse,radix,units_bit_plane:[plane,plane+1],
          matching_bits:correct,mismatching_bits:mismatches.length,
          first_16_mismatch_bit_offsets:mismatches.slice(0,16)
        });
      }
    }
  }
}
assert.equal(cases.length,24);
assert(cases.every(c=>c.matching_bits<512));
const best=cases.slice().sort((a,b)=>b.matching_bits-a.matching_bits)[0];
assert.deepEqual({
  order:best.order,reverse:best.reverse,radix:best.radix,
  units_bit_plane:best.units_bit_plane,matching_bits:best.matching_bits
},{
  order:'clockwise-shells',reverse:true,radix:60,
  units_bit_plane:[4,5],matching_bits:272
});
console.log(JSON.stringify({
  issue:868,source_cells:256,target_digest_hex_chars:128,
  target_bits:512,shell_lengths:shellLengths,
  serialization:'two bits high-first per six-bit units digit',
  models:cases.length,matched_exact:0,
  native_positive_plants_passed:cases.length,
  best,all_models:cases,
  verdict:'No direct table-two-bit-plane encoding of the solved p56 512-bit digest'
},null,2));
