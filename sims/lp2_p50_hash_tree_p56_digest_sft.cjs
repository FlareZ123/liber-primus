#!/usr/bin/env node
'use strict';

// Source-selected hash-tree gate:
// p50 is a 32x8 byte panel (eight 32-byte columns); the unknown text has
// eight $-terminated sections; p56 prints a 128-hex-character digest.
// Test only direct SHA-256 section commitments and canonical SHA-512
// concatenation / binary-tree roots. No permutations, salts or prefixes.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const p56Digest = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
assert.equal(p56Digest.length, 128);

const alphabet = [...grid.alphabet];
const digit = new Map(alphabet.map((ch, i) => [ch, i]));
const value = token => digit.get(token[0]) * 60 + digit.get(token[1]);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
const rowMajor = Buffer.from(grid.rows.flatMap(row => row.map(value)));
const columns = Array.from({ length: 8 }, (_, col) =>
  Buffer.from(grid.rows.map(row => value(row[col])))
);
assert(columns.every(x => x.length === 32));

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sections = transcription.split('$').slice(0, 8).map(s =>
  [...s].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch))
);
const expected = [729,1145,1738,1894,1021,1433,1680,3316];
assert.deepEqual(sections.map(s => s.length), expected);
assert.deepEqual(sections.flat(), corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

function hash(alg, bytes) {
  return crypto.createHash(alg).update(bytes).digest();
}
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
function merkle(leaves, alg) {
  let level = leaves.map(x => Buffer.from(x));
  while(level.length > 1) {
    const next=[];
    for(let i=0;i<level.length;i+=2) next.push(hash(alg,Buffer.concat([level[i],level[i+1]])));
    level=next;
  }
  return level[0];
}
const variants = sections.map((s,i)=>({
  raw_gp29: Buffer.from(s),
  packed5: pack5(s),
  unicode_utf8: Buffer.from(s.map(x=>corpus.runes[x]).join(''),'utf8'),
  translit_ascii: Buffer.from(s.map(x=>corpus.translit[x]).join(''),'ascii')
}));
const sectionHashMatches = {};
for(const name of Object.keys(variants[0])) {
  sectionHashMatches[name] = variants.map((v,i)=>hash('sha256',v[name]).equals(columns[i]));
}
const allHashes = {};
for(const name of Object.keys(variants[0])) {
  const hashes = variants.map(v=>hash('sha256',v[name]));
  allHashes[name] = {
    sha256_section_matches_same_column: sectionHashMatches[name].filter(Boolean).length,
    sha512_of_concatenated_sections: hash('sha512',Buffer.concat(sections.map((_,i)=>variants[i][name]))).toString('hex'),
    sha512_of_concatenated_sha256_hashes: hash('sha512',Buffer.concat(hashes)).toString('hex')
  };
}
const candidates = {
  sha512_table_row_major: hash('sha512',rowMajor).toString('hex'),
  sha512_table_column_major: hash('sha512',Buffer.concat(columns)).toString('hex'),
  sha512_binary_merkle_root_of_eight_32byte_columns: merkle(columns,'sha512').toString('hex'),
  sha512_of_sha256_binary_merkle_root_of_eight_columns: hash('sha512',merkle(columns,'sha256')).toString('hex')
};
const matches = Object.entries(candidates).filter(([,v])=>v===p56Digest).map(([k])=>k);
for(const [name,v] of Object.entries(allHashes)) {
  if(v.sha512_of_concatenated_sections===p56Digest) matches.push('sha512_section_concat_'+name);
  if(v.sha512_of_concatenated_sha256_hashes===p56Digest) matches.push('sha512_section_sha256_concat_'+name);
}
console.log(JSON.stringify({
  hypothesis:'p50 eight 32-byte columns are SHA-256 section commitments / leaves; p56 printed digest is a SHA-512 root',
  source_parameters:{
    p50:'32x8 base60 byte panel; columns are 32 bytes',
    sections:expected,
    p56_sha512_hex:p56Digest,
    section_to_column:'left-to-right, no permutation',
    section_encodings:['one byte per GP29 index','MSB-first 5-bit GP29 packing','UTF-8 rune glyphs','ASCII transliteration'],
    hash_families:['SHA-256 per section','SHA-512 concatenation','binary Merkle SHA-512 parent','SHA-256 Merkle then SHA-512']
  },
  table_column_sha256:columns.map(x=>hash('sha256',x).toString('hex')),
  section_hash_tests:allHashes,
  p56_candidates:candidates,
  exact_p56_matches:matches
},null,2));
