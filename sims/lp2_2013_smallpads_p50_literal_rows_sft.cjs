"use strict";

/**
 * Native original-input exact-source-motif gate.
 *
 * Compare the 32 printed eight-cell rows, eight printed 32-cell columns,
 * and complete pp49-51 256-cell table against three independent period-era
 * binary source objects: 2013 CicadaOS _560.00 / 560.17 and 2013 761.MP3.
 *
 * Test direct literal motifs and source-era bytewise XOR or additive
 * masks repeating across eight physically printed columns. All masks are
 * unknown and recovered from each hypothetical source location. No KDF,
 * arbitrary permutation, phase fit, or language-model search.
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

/** Full-table physical 32×8 readouts, without arbitrary cell permutations. */
const orientations = [];
for (const major of ["row","column"])
for (const reflectRows of [false,true])
for (const reflectColumns of [false,true]) {
  const oriented = Buffer.from(Array.from({length:256}, (_,i) => {
    const row = major==="row" ? Math.floor(i/8) : i%32;
    const col = major==="row" ? i%8 : Math.floor(i/32);
    const rr = reflectRows ? 31-row : row;
    const cc = reflectColumns ? 7-col : col;
    return table[rr*8+cc];
  }));
  orientations.push({
    name:`${major}-major${reflectRows?"-flip-rows":""}${reflectColumns?"-flip-columns":""}`,
    bytes:oriented
  });
}
assert.equal(orientations.length,8);

/**
 * Find source offsets yielding exactly the 256 printed table values under
 * an arbitrary unknown, repeating 8-element mask, recovered from first row.
 * Every source offset is examined. No known key or clock is fitted.
 *
 * @param {Buffer} source
 * @param {Buffer} target
 * @param {"xor8"|"add8"|"gp29add8"} model
 * @returns {number[]}
 */
function findPeriod8(source, target, model) {
  assert.equal(target.length,256);
  /** @type {number[]} */
  const hits=[];
  const modulus=model==="gp29add8"?29:256;
  const transform=(b)=>model==="gp29add8"?b%29:b;
  for(let at=0;at<=source.length-256;at++) {
    const t0=transform(target[0]),s0=transform(source[at]);
    const t8=transform(target[8]),s8=transform(source[at+8]);
    if(model==="xor8" ? (t0^s0)!==(t8^s8) :
      ((t0-s0+modulus)%modulus)!==((t8-s8+modulus)%modulus))continue;
    const t1=transform(target[1]),s1=transform(source[at+1]);
    const t9=transform(target[9]),s9=transform(source[at+9]);
    if(model==="xor8" ? (t1^s1)!==(t9^s9) :
      ((t1-s1+modulus)%modulus)!==((t9-s9+modulus)%modulus))continue;
    let success=true;
    for(let i=8;i<256;i++) {
      const t=transform(target[i]),s=transform(source[at+i]);
      const baseT=transform(target[i%8]),baseS=transform(source[at+(i%8)]);
      if(model==="xor8" ? (t^s)!==(baseT^baseS) :
        ((t-s+modulus)%modulus)!==((baseT-baseS+modulus)%modulus)) {
        success=false;break;
      }
    }
    if(success)hits.push(at);
  }
  return hits;
}

// Secret masks are recovered from each artificial source excerpt, not given
// to the scanner. Both full 256-byte source and receiver are asserted.
for(const model of ["xor8","add8","gp29add8"]) {
  const target=orientations[0].bytes;
  const fake=Buffer.alloc(270,247);
  const salt=[7,19,53,88,111,161,212,233];
  for(let i=0;i<256;i++) {
    const t=model==="gp29add8"?target[i]%29:target[i];
    fake[6+i]=model==="xor8"?(t^salt[i%8]):
      model==="add8"?(t-salt[i%8]+256)%256:
      (t-(salt[i%8]%29)+29)%29;
  }
  assert.ok(findPeriod8(fake,target,model).includes(6),
    model+" planted original-length source excerpt was not found");
}
const maskModels=["xor8","add8","gp29add8"];
/** @type {{source:string,bytes:number,verifiedHash:string,hits:{motif:string,length:number,positions:number[]}[],eightPositionMaskHits:{orientation:string,model:string,positions:number[]}[]}[]} */
const report = [];
for (let i=0;i<sources.length;i++) {
  const source = sources[i];
  const data = fs.readFileSync(process.argv[i+2]);
  assert.equal(data.length,source.size,source.name+" length");
  assert.equal(sha256(data),source.hash,source.name+" digest");
  const hits = motifs.map(m=>({
    motif:m.name,length:m.bytes.length,positions:findAll(data,m.bytes)
  })).filter(m=>m.positions.length>0);
  /** Exact 256-cell source excerpts under all eight physical grid reads. */
  const maskHits=[];
  for(const orientation of orientations) {
    for(const model of maskModels) {
      const offsets=findPeriod8(data,orientation.bytes,model);
      if(offsets.length)maskHits.push({orientation:orientation.name,model,positions:offsets});
    }
  }
  report.push({
    source:source.name,bytes:data.length,verifiedHash:source.hash,hits,
    eightPositionMaskHits:maskHits
  });
}
console.log("LP2_SOURCE_MOTIF_RESULT "+JSON.stringify({
  target:"LP2 pp49-51 original 256 cells, conventional base60 bytes",
  originalGridSHA256:sha256(table),
  candidatesPerSource:motifs.length,
  fullTableMaskModelsPerSource:orientations.length*maskModels.length,
  checkedBytes:sources.reduce((a,b)=>a+b.size,0),
  perSource:report,
  anyHit:report.some(s=>s.hits.length>0 || s.eightPositionMaskHits.length>0),
  note:"If no hits, exact source copies and complete 256-cell period8 unknown XOR/additive masks on these three archived originals are excluded. Other transforms, keys and non-GP encodings remain possible."
}));
