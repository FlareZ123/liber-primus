"use strict";

/**
 * Native original-input exact-source-motif gate.
 *
 * Compare the 32 printed eight-cell rows, eight printed 32-cell columns,
 * and complete pp49-51 256-cell table against three independent period-era
 * binary source objects: 2013 CicadaOS _560.00 / 560.17 and 2013 761.MP3.
 *
 * This tests unchanged literal byte reuse at ANY source offset, with no
 * invented XOR, KDF, phase, alphabet or byte rearrangement.
 *
 * Node.js 22 CommonJS:
 * node sims/lp2_2013_smallpads_p50_literal_rows_sft.cjs <_560.00> <560.17> <761.MP3>
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/** @param {Buffer} data @returns {string} */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * @param {Buffer} haystack
 * @param {Buffer} needle
 * @returns {number[]}
 */
function findAll(haystack, needle) {
  const offsets = [];
  for (let at = haystack.indexOf(needle); at !== -1;
    at = haystack.indexOf(needle, at + 1)) offsets.push(at);
  return offsets;
}

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
const table = Buffer.from(grid.bytes);
assert.equal(table.length, 256);
assert.equal(sha256(table),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @type {{name:string,bytes:Buffer}[]} */
const motifs = [];
const columnMajor = Buffer.from(Array.from({length: 256},
  (_, i) => table[(i % 32) * 8 + Math.floor(i / 32)]));
for (const [label, arr] of [["table row-major",table], ["table column-major",columnMajor]]) {
  motifs.push({name:label, bytes:arr});
  motifs.push({name:label + " reversed", bytes:Buffer.from(arr).reverse()});
}
for (let i = 0; i < 32; i++) {
  const row = Buffer.from(table.subarray(i * 8, (i + 1) * 8));
  motifs.push({name:"printed row " + i, bytes:row});
  motifs.push({name:"printed row " + i + " reversed", bytes:Buffer.from(row).reverse()});
}
for (let i = 0; i < 8; i++) {
  const col = Buffer.from(Array.from({length:32}, (_, j) => table[j*8+i]));
  motifs.push({name:"printed column " + i, bytes:col});
  motifs.push({name:"printed column " + i + " reversed", bytes:Buffer.from(col).reverse()});
}
assert.equal(motifs.length,84);

// Both byte lengths and cryptographic digests are pinned to independently
// archived source records, rejecting silent HTTP error pages and wrong revisions.
const sources = [
  {name:"2013 CicadaOS _560.00", size:3992970,
   hash:"a24051a87f0eb25ca21accbd3158fdf7b4911243e5ee1b9778b81182f0d36573"},
  {name:"2013 CicadaOS 560.17", size:1183811,
   hash:"d5676b1e01fd371cb13415b59b2eca4336e96f7bb05e789198b8d6baab580c19"},
  {name:"2013 761.MP3", size:4010732,
   hash:"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"}
];
assert.equal(process.argv.length, 5, "Three complete historical binary source paths are required.");
const positives = Buffer.alloc(2000,0);
motifs[0].bytes.copy(positives,11);
motifs.find(x=>x.name==="printed row 0").bytes.copy(positives,333);
motifs.find(x=>x.name==="printed column 0").bytes.copy(positives,777);
assert.deepEqual(findAll(positives,motifs[0].bytes),[11]);
assert.deepEqual(findAll(positives,motifs.find(x=>x.name==="printed row 0").bytes),[11,333]);
assert.deepEqual(findAll(positives,motifs.find(x=>x.name==="printed column 0").bytes),[777]);

/** @type {{source:string,bytes:number,verifiedHash:string,hits:{motif:string,length:number,positions:number[]}[]}[]} */
const report = [];
for (let i=0;i<sources.length;i++) {
  const source = sources[i];
  const data = fs.readFileSync(process.argv[i+2]);
  assert.equal(data.length,source.size,source.name+" length");
  assert.equal(sha256(data),source.hash,source.name+" digest");
  const hits = motifs.map(m=>({
    motif:m.name,length:m.bytes.length,positions:findAll(data,m.bytes)
  })).filter(m=>m.positions.length>0);
  report.push({
    source:source.name,bytes:data.length,verifiedHash:source.hash,hits
  });
}
console.log("LP2_SOURCE_MOTIF_RESULT "+JSON.stringify({
  target:"LP2 pp49-51 original 256 cells, conventional base60 bytes",
  originalGridSHA256:sha256(table),
  candidatesPerSource:motifs.length,
  checkedBytes:sources.reduce((a,b)=>a+b.size,0),
  perSource:report,
  anyHit:report.some(s=>s.hits.length>0),
  note:"If no hits, only unchanged contiguous 8/32/256-byte source copies under the exact listed physical orientations are excluded; not unknown keys or transformations."
}));
