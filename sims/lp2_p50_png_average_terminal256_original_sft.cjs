"use strict";
/**
 * Source-fixed PNG Average filter (PNG method0, scanline filter3)
 * applied to the original LP2 p49-51 32x8 byte grid, with independent
 * p56+p57 180-rune cleartext as a complete exact-match control.
 *
 * Why this operator? The pre-existing, *conditional* p50 missing-L fifth
 * 32-byte column has a reproducible secp256k1 P2PKH address beginning
 * 1Meanpng...; PNG's named Average filter is one concrete historical
 * meaning of "mean PNG" that does NOT require fitting a password/key.
 * No Cicada source instructs this: finite analyst hypothesis, not a solve.
 *
 * Run: node sims/lp2_p50_png_average_terminal256_original_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const gridRaw=fs.readFileSync("resources/liber-primus/base60-grid.json");
const gpRaw=fs.readFileSync("resources/liber-primus/lp2-corpus.json");
const grid=JSON.parse(gridRaw);
const gp=JSON.parse(gpRaw);
assert.equal(grid.alphabet,"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(row=>row.length===8&&row.every(v=>Number.isInteger(v)&&v>=0&&v<=255)));
assert.equal(grid.byte_rows.flat().length,256);
assert.equal(gp.pages[55].runic_count,76);
assert.equal(gp.pages[56].runic_count,85);
assert.equal(gp.pages[57].runic_count,95);

const avg=(a,b)=>Math.floor((a+b)/2);
function pngAverageFilter3(raw) {
  assert.equal(raw.length,32);
  return raw.map((row,y)=>row.map((v,x)=>
    (v - avg(x?row[x-1]:0,y?raw[y-1][x]:0)+256)%256
  ));
}
function pngAverageUnfilter3(filtered) {
  assert.equal(filtered.length,32);
  const reconstructed=[];
  for(let y=0;y<32;y++) {
    const row=[];
    for(let x=0;x<8;x++) {
      const left=x?row[x-1]:0;
      const above=y?reconstructed[y-1][x]:0;
      row.push((filtered[y][x]+avg(left,above))%256);
    }
    reconstructed.push(row);
  }
  return reconstructed;
}
// Locked PNG standard arithmetic including top/left border treatment.
const example=Array.from({length:32},()=>Array(8).fill(0));
example[0][0]=3;example[0][1]=9;example[1][0]=10;example[1][1]=20;
const exampleFiltered=pngAverageFilter3(example);
assert.deepEqual(exampleFiltered[0].slice(0,2),[3,8]);
assert.deepEqual(exampleFiltered[1].slice(0,2),[9,11]);
assert.deepEqual(pngAverageUnfilter3(exampleFiltered),example);

// Synthetic "whole terminal" native GP29 receiver positive: use the 76
// published original p55 ciphertext runes as arbitrary seed bytes and the
// genuine solved p56+p57 GP29 runes as the independent suffix. No plaintext
// or key is inferred from this plant.
const terminal=gp.pages.slice(55,58).flatMap(p=>p.indices);
assert.equal(terminal.length,256);
const terminalRows=Array.from({length:32},(_,y)=>terminal.slice(8*y,8*y+8));
assert.deepEqual(pngAverageUnfilter3(pngAverageFilter3(terminalRows)),terminalRows);
assert.deepEqual(pngAverageFilter3(pngAverageUnfilter3(terminalRows)),terminalRows);

const known=gp.pages[56].indices.concat(gp.pages[57].indices);
assert.equal(known.length,180);
const table=grid.byte_rows;
const rawCandidates=[
  ["source_table_raw",table],
  ["png_filter3_forward_on_source_bytes",pngAverageFilter3(table)],
  ["png_filter3_inverse_on_source_bytes",pngAverageUnfilter3(table)]
];
const converters=[
  ["byte_mod29", v=>v%29],
  ["byte_scaled_to_29",v=>Math.floor(29*v/256)]
];
const candidates=[];
for(const [name,rows] of rawCandidates) {
  const bytes=rows.flat();assert.equal(bytes.length,256);
  for(const [encoding,fn] of converters) {
    const runes=bytes.map(fn);
    assert(runes.every(v=>v>=0&&v<29));
    const matches=known.reduce((sum,c,i)=>sum+(c===runes[76+i]),0);
    candidates.push({input:name,encoding,known_exact_matches:matches,
      known_mismatches:180-matches, full_known_180:matches===180,
      source_output_sha256:crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex")});
  }
}
const actual=[
  ["source_table_raw","byte_mod29",9],
  ["source_table_raw","byte_scaled_to_29",10],
  ["png_filter3_forward_on_source_bytes","byte_mod29",2],
  ["png_filter3_forward_on_source_bytes","byte_scaled_to_29",5],
  ["png_filter3_inverse_on_source_bytes","byte_mod29",10],
  ["png_filter3_inverse_on_source_bytes","byte_scaled_to_29",5]
];
assert.deepEqual(candidates.map(c=>[c.input,c.encoding,c.known_exact_matches]),actual);
assert(candidates.every(c=>!c.full_known_180));
console.log(JSON.stringify({
  candidate:"Original 32x8 byte table under PNG Average filter3",
  note:"Original spelling Meanpng is a conditional pre-existing P2PKH clue, not a signed PNG instruction",
  grid_json_sha256:crypto.createHash("sha256").update(gridRaw).digest("hex"),
  gp_corpus_json_sha256:crypto.createHash("sha256").update(gpRaw).digest("hex"),
  known_suffix:"p56 85 + p57 95 = 180 GP29 runes, exactly after p55 76",
  native_gp_filter_unfilter_control:"256/256 and reverse 256/256 PASS",
  candidates,
  decision:"NO_MATCH: zero of six literal no-secret-byte-translation receivers recover 180 solved GP runes"
},null,2));
console.log("P50_PNG_AVERAGE_TERMINAL256_ORIGINAL_SFT_PASS");
