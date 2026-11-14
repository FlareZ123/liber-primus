#!/usr/bin/env node
'use strict';

/**
 * Original table/p56 hash XOR-folding obstruction.
 *
 * Source-input theorem: XOR of all 64 output bytes after any lossless
 * partition of the 256 distinct physical input cell positions equals
 * XOR of all 256 original bytes, regardless of permutations/group sizes.
 *
 * Original p50 256 bytes (0x94) and p56 512-bit digest (0x0d) disagree.
 * A synthetic four-by-64-fold plant supplies a successful actual decoder.
 * This excludes only direct XOR pooling, not keyed mixing or missing cells.
 *
 * Node 22 CommonJS, built-in modules only, Windows compatible.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {any} */
const read=name=>JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus',name),'utf8'));
const grid=read('base60-grid.json');
const raw=Buffer.from(grid.byte_rows.flat());
const expectedSourceSha='3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),expectedSourceSha);
assert.equal(raw.length,256);
const target=Buffer.from(
  '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4',
  'hex');
assert.equal(target.length,64);

/** @param {Uint8Array} bytes @returns {number} */
const xorAll=bytes=>bytes.reduce((a,b)=>a^b,0);
assert.equal(xorAll(raw),0x94);
assert.equal(xorAll(target),0x0d);
assert.notEqual(xorAll(raw),xorAll(target));

/**
 * For any output-bin assignment, each input contributes exactly once
 * to one output, irrespective of permutation or bin size.
 * @param {Uint8Array} input
 * @param {number[]} bins - 256 indices in [0, 63]
 * @returns {Uint8Array}
 */
function fold(input,bins){
  assert.equal(input.length,bins.length);
  const out=new Uint8Array(64);
  for(let i=0;i<input.length;i++){
    assert(Number.isInteger(bins[i])&&bins[i]>=0&&bins[i]<64);
    out[bins[i]]^=input[i];
  }
  assert.equal(xorAll(out),xorAll(input));
  return out;
}
// Two natural choices are demonstrations; the proof covers every
// permutation, phase and arbitrary partition with each source used once.
const contiguous=Array.from({length:256},(_,i)=>i%64);
const rowPairs=Array.from({length:256},(_,i)=>Math.floor(i/4));
const negativeFold1=fold(raw,contiguous),negativeFold2=fold(raw,rowPairs);
assert.notDeepEqual(Array.from(negativeFold1),Array.from(target));
assert.notDeepEqual(Array.from(negativeFold2),Array.from(target));

// Positive: give every bin exactly four source bytes, choose three fixed
// payload bytes from deterministic original grid, and solve only the fourth
// under XOR so that each complete output byte is the independently solved
// p56 digest. The decoder is identical for this source-shaped plant.
const planted=Uint8Array.from(raw);
for(let j=0;j<64;j++)
  planted[j+192]=target[j]^planted[j]^planted[j+64]^planted[j+128];
const recovered=fold(planted,contiguous);
assert.deepEqual(Array.from(recovered),Array.from(target));
assert.equal(xorAll(planted),xorAll(target));
const permute=Array.from({length:256},(_,i)=>(i*131+17)%256);
assert.equal(new Set(permute).size,256);
const scrambled=Uint8Array.from(permute.map(i=>planted[i]));
const reindexed=permute.map(i=>contiguous[i]);
assert.deepEqual(Array.from(fold(scrambled,reindexed)),Array.from(target));

console.log(JSON.stringify({
  source:'Original LP2 pp49–51 32x8 numerical bytes',
  source_sha256:expectedSourceSha,
  original_input_bytes:raw.length,target_digest_bytes:target.length,
  original_table_xor:'0x94',solved_p56_digest_xor:'0x0d',
  required_missing_xor:'0x99',
  partition_independent_mismatch:true,
  tested_original_folds:2,
  positive_original_shaped_256byte_plant:true,
  positive_permuted_256byte_plant:true,
  conclusion:'Any unkeyed XOR-only partition of all 256 original table bytes into exactly 64 target digest bytes is impossible'
},null,2));
