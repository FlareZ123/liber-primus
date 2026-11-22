"use strict";

/**
 * Original LP2 nonrepeat rune transitions as a direct binary transport.
 * Run: node sims/lp2_gp28_direct_byte_transport_sft.cjs
 * Node.js 20+ CommonJS; no external packages.
 *
 * No key hunt, shifted headers or inferred page permutations. The two
 * predecessor-excluding rank rules are checked against the physical pages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const units = [{label:"whole", pages}, ...chapters.map(([lo,hi]) =>
  ({label:"p"+lo+"-"+hi,pages:pages.filter(p => p.page>=lo&&p.page<=hi)}))];
assert.equal(units.slice(1).flatMap(u=>u.pages).length, 55);

/**
 * @param {number[]} input
 * @param {"sorted"|"cyclic"} order
 * @param {"discard"|"zero"|"escape"} duplicates
 */
function rankStream(input, order, duplicates) {
  const out=[];
  for(let i=1;i<input.length;i++) {
    const c=input[i],p=input[i-1];
    if(c===p) {
      if(duplicates==="zero") out.push(0);
      if(duplicates==="escape") out.push(28);
    } else {
      out.push(order==="sorted"?(c>p?c-1:c):(c-p+28)%29);
    }
  }
  return out;
}

/**
 * @param {number} seed
 * @param {number[]} code
 * @param {"sorted"|"cyclic"} order
 */
function invertEscape(seed,code,order) {
  const out=[seed];
  for(const d of code) {
    const p=out[out.length-1];
    out.push(d===28?p:order==="sorted"?(d>=p?d+1:d):(p+d+1)%29);
  }
  return out;
}

/** @param {number[]} digits @param {number} base @param {boolean} fixed */
function asBytes(digits,base,fixed) {
  let v=0n;
  for(const d of digits) {
    assert(d>=0 && d<base);
    v=v*BigInt(base)+BigInt(d);
  }
  const n=fixed?Math.ceil(digits.length*Math.log2(base)/8):0;
  let hex=v.toString(16).padStart(2*n,"0");
  if(hex.length%2)hex="0"+hex;
  return Buffer.from(hex,"hex");
}

/** @param {Buffer} b */
function fileSignatures(b) {
  const h=b.subarray(0,10).toString("hex");
  return [
    ["gzip","1f8b08"],["bzip2","425a68"],["xz","fd377a585a00"],
    ["png","89504e470d0a1a0a"],["zip","504b0304"],["pdf","25504446"]
  ].filter(([,sig])=>h.startsWith(sig)).map(([name])=>name);
}

// The conversion finds a genuine source-independent gzip header and data.
const plant=zlib.gzipSync(Buffer.from("Liber Primus GP28 positive plant"));
let v=BigInt("0x"+plant.toString("hex"));
const d=[];
while(v>0n){d.push(Number(v%28n));v/=28n;}
d.reverse();
assert.deepEqual(asBytes(d,28,false),plant);
assert.deepEqual(fileSignatures(asBytes(d,28,false)),["gzip"]);
assert.match(zlib.gunzipSync(asBytes(d,28,false)).toString(),/positive plant/);

let doublets=0;
for(const p of pages) {
  for(let i=1;i<p.indices.length;i++)
    if(p.indices[i]===p.indices[i-1])doublets++;
  for(const order of ["sorted","cyclic"])
    assert.deepEqual(invertEscape(p.indices[0],
      rankStream(p.indices,order,"escape"),order),p.indices);
}
assert.equal(doublets,86);
assert.equal(pages.reduce((n,p)=>n+p.indices.length-1,0),12901);

const cases=[];
for(const order of ["sorted","cyclic"])
  for(const duplicates of ["discard","zero","escape"])
    for(const unit of units)
      for(const fixed of [false,true]){
        const digits=unit.pages.flatMap(p=>
          rankStream(p.indices,order,duplicates));
        const base=duplicates==="escape"?29:28;
        const bytes=asBytes(digits,base,fixed);
        const matches=fileSignatures(bytes);
        cases.push({unit:unit.label,order,duplicates,fixed,
          digitCount:digits.length,byteCount:bytes.length,
          prefix:bytes.subarray(0,8).toString("hex"),matches});
        assert.deepEqual(matches,[]);
      }
assert.equal(cases.length,120);
console.log(JSON.stringify({originalPages:55,originalRunes:12956,
  withinPageTransitions:12901,doublets,
  chapters:chapters.length,serializations:cases.length,
  recognizedHeaders:0,positiveGzipPlant:true,
  examples:cases.filter(c=>c.unit==="whole")},null,2));
