"use strict";
/**
 * Source-natural 32x8 table -> eight unmodified AES-256-CTR keys.
 *
 * Two original layouts, with no key search: each printed column (32 bytes),
 * and each consecutive row-major 32-byte group. Both yield eight raw keys,
 * one per original eight-section text clock. Zero IV, phase zero.
 * Check direct GP29 additive and GP28 no-repeat differential inverses.
 * The full-length original-cipher output is compared to native GP English,
 * with matching encryption/decryption plants for each mapping.
 *
 * SFT: node sims/p50_eight_columns_aes256_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createCipheriv, createHash } = require("node:crypto");
const {encode, train} = require("./grid_keyskip_viterbi.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
/** @param {string} name @returns {any} */
const json = name => JSON.parse(read(name));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/base60-grid.json").byte_rows;
assert.deepEqual([table.length, ...new Set(table.map(row=>row.length))], [32,8]);
const sourceBytes = table.flat();
assert.equal(createHash("sha256").update(Buffer.from(sourceBytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const runes = new Map(corpus.runes.map((r,i)=>[r,i]));
const mod = (x,n) => (x%n+n)%n;
const raw = read("resources/transcriptions/liber_primus_master.txt");
const start = raw.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ");
assert(start>=0);
const groups = raw.slice(start).split("%").slice(0,56).join("%")
  .split("$").map(s=>[...s].filter(c=>runes.has(c)).map(c=>runes.get(c)))
  .filter(g=>g.length);
assert.deepEqual(groups.map(g=>g.length),
  [729,1145,1729,9,1894,1021,1524,1589,3316]);
const segmentations = {
  nine_with_previous:[groups[0],groups[1],groups[2].concat(groups[3]),
    groups[4],groups[5],groups[6],groups[7],groups[8]],
  nine_with_following:[groups[0],groups[1],groups[2],
    groups[3].concat(groups[4]),groups[5],groups[6],groups[7],groups[8]]
};
assert.deepEqual(segmentations.nine_with_previous.map(g=>g.length),
  [729,1145,1738,1894,1021,1524,1589,3316]);
assert.deepEqual(segmentations.nine_with_following.map(g=>g.length),
  [729,1145,1729,1903,1021,1524,1589,3316]);
const full = corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
for(const eight of Object.values(segmentations))assert.deepEqual(eight.flat(),full);
const layouts = {
  columns: Array.from({length:8},(_,c)=>Buffer.from(table.map(row=>row[c]))),
  row_major: Array.from({length:8},(_,c)=>
    Buffer.from(sourceBytes.slice(c*32,(c+1)*32))),
};
const model = train(read("resources/control/shakespeare_first300k.txt"));
const native = encode(read("resources/control/shakespeare_first300k.txt"));
assert(native.length >= 12956);
function pad(key,length) {
  assert.equal(key.length,32);
  const cipher = createCipheriv("aes-256-ctr",key,Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(length)),cipher.final()]);
}
function ioc(plain) {
  const count=Array(29).fill(0);
  for (const x of plain) count[x]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/(plain.length*(plain.length-1));
}
function score(plain) {
  let v=0;
  for (let i=2;i<plain.length;i++)
    v += model.trigram[(plain[i-2]*29+plain[i-1])*29+plain[i]];
  return v/(plain.length-2);
}
const pow = [],log=Array(29).fill(-1);
for(let k=0,x=1;k<28;k++,x=x*15%29) {
  assert.equal(log[x],-1);
  log[x]=k;
  pow.push(x);
}
assert.equal(pow.length,28);
const transforms={
  /** @param {number[]} c @param {Buffer} stream @param {number} sign */
  gp29(c,stream,sign) {return c.map((v,i)=>mod(v+sign*(stream[i]%29),29));},
  /** @param {number[]} c @param {Buffer} stream @param {number} sign */
  gp28(c,stream,sign) {
    let prev=0;
    return c.map((v,i)=>{
      const delta=mod(v-prev,29);
      prev=v;
      return delta===0?28:mod(log[delta]+sign*(stream[i]%28),28);
    });
  },
};
function encrypt28(plain,stream,sign) {
  let prev=0;
  return plain.map((p,i)=>{
    if(p!==28) prev=mod(prev+pow[mod(p-sign*(stream[i]%28),28)],29);
    return prev;
  });
}
const results=[];
for(const [segmentation,eight] of Object.entries(segmentations)){
for(const [layout,keys] of Object.entries(layouts)){
  const pads=eight.map((g,i)=>pad(keys[i],g.length));
  for(const [algorithm,fn] of Object.entries(transforms))
    for(const sign of [-1,1]){
      const dec=eight.map((g,i)=>fn(g,pads[i],sign));
      const original=dec.flat();
      const sample=native.slice(0,eight[0].length);
      const plantCipher=algorithm==="gp29"
        ?fn(sample,pads[0],-sign)
        :encrypt28(sample,pads[0],sign);
      assert.deepEqual(fn(plantCipher,pads[0],sign),sample);
      if(algorithm==="gp28")
        for(let i=0;i<eight.length;i++)
          assert.deepEqual(encrypt28(dec[i],pads[i],sign),eight[i]);
      const item={segmentation,layout,algorithm,sign,ioc:ioc(original),score:score(original),
        excerpt:dec[0].slice(0,52).map(x=>corpus.translit[x]).join("")};
      results.push(item);
    }
}
}
results.sort((a,b)=>b.score-a.score);
console.log(JSON.stringify({
  source:"Original p49-51 32x8 base60 byte table and both p15 title-attachment conventions",
  hypothesis:"Direct unmodified 32-byte AES-256-CTR key per section, all-zero IV, zero phase",
  originalCipherLength:full.length,keys:8,
  scope:"2 p15 title attachments x 2 table layouts x 2 reversible GP encodings x 2 signs = 16",
  native:{ioc:ioc(native.slice(0,full.length)),score:score(native.slice(0,full.length))},
  raw:{ioc:ioc(full),score:score(full)},
  original:results,
  plant:"16/16 AES256 plant checks and every GP28 forward reencryption passed",
  conclusion:"No original-cipher plaintext claim without a source-native full-book language score"
},null,2));
