"use strict";

/**
 * Source-constrained historical ISAAC CSPRNG direct-key test for all 12,956
 * untouched unknown LP2 GP29 runes. Script is a bounded attempted decoder;
 * its near-uniform outputs are not authentic plaintext.
 *
 * Original p50 printed 256 byte table seeds the 256-word ISAAC array as
 * 256 individual unsigned byte words or 64 packed little-endian words
 * zero-padded to 256. Standard ISAAC, no arbitrary passphrase/KDF.
 * At each clock step consume one 32-bit word. Use the whole unsigned word
 * or one of four byte lanes, reduced modulo 29, ± additive GP29 inverse.
 * Three source-divided clock restarts: book, physical page, nine chapters.
 * This bounds 2*5*2*3 = 60 complete reproducible original-source inverses.
 *
 * Authenticates ISAAC against the published Bob Jenkins zero-seed second
 * block first four words, ascending within its 256-word block.
 * All analyses on the unchanged original corpus. Node.js 22, CJS, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const book = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/lp2-grid-256.json");
const pages = book.pages.filter(page => page.page <= 55 && page.indices.length);
const C = pages.flatMap(page => page.indices);
assert.equal(C.length, 12956);
assert.equal(pages.length, 55);
assert.equal(book.pages[50].indices.length, 0);
assert.equal(table.bytes.length, 256);
assert.deepEqual(table.bytes.slice(0, 4), [203,231,167,186]);
const chapters = [729,1145,1729,1903,1021,1433,1680,3008,308];
assert.equal(chapters.reduce((s,n)=>s+n,0), C.length);

/**
 * Exact Jenkins ISAAC 32-bit generator seeded via full 256-word randrsl.
 * The first block is generated in randInit before the first returned value.
 * @param {Uint32Array} seed
 * @returns {()=>number}
 */
function isaac(seed) {
  assert.equal(seed.length,256);
  const mm = new Uint32Array(256);
  const rsl = Uint32Array.from(seed);
  const x = new Uint32Array(8);
  x.fill(0x9e3779b9);
  const u = value => value >>> 0;
  function mix() {
    let [a,b,c,d,e,f,g,h] = x;
    a=u(a^(b<<11));d=u(d+a);b=u(b+c);
    b=u(b^(c>>>2));e=u(e+b);c=u(c+d);
    c=u(c^(d<<8));f=u(f+c);d=u(d+e);
    d=u(d^(e>>>16));g=u(g+d);e=u(e+f);
    e=u(e^(f<<10));h=u(h+e);f=u(f+g);
    f=u(f^(g>>>4));a=u(a+f);g=u(g+h);
    g=u(g^(h<<8));b=u(b+g);h=u(h+a);
    h=u(h^(a>>>9));c=u(c+h);a=u(a+b);
    x.set([a,b,c,d,e,f,g,h]);
  }
  for(let i=0;i<4;i++)mix();
  for(let pass=0;pass<2;pass++) {
    for(let i=0;i<256;i+=8) {
      for(let j=0;j<8;j++) x[j]=u(x[j]+(pass?mm[i+j]:rsl[i+j]));
      mix();
      mm.set(x,i);
    }
  }
  let aa=0,bb=0,cc=0,left=0;
  function refill() {
    cc=u(cc+1);bb=u(bb+cc);
    for(let i=0;i<256;i++) {
      const v=mm[i];
      switch(i&3) {
        case 0:aa^=aa<<13;break;
        case 1:aa^=aa>>>6;break;
        case 2:aa^=aa<<2;break;
        case 3:aa^=aa>>>16;break;
      }
      aa=u(aa+mm[(i+128)&255]);
      const y=u(mm[(v>>>2)&255]+aa+bb);
      mm[i]=y;bb=u(mm[(y>>>10)&255]+v);rsl[i]=bb;
    }
    left=256;
  }
  refill();
  return () => { if(!left)refill();return rsl[--left]; };
}
const zero=isaac(new Uint32Array(256));
const control=Array.from({length:512},()=>zero());
assert.deepEqual(control.slice(508,512).reverse(),
  [0xf650e4c8,0xe448e96d,0x98db2fb4,0xf5fad54f]);

const seeds = {
  bytewords: Uint32Array.from(table.bytes),
  packedLE: new Uint32Array(256)
};
for(let i=0;i<64;i++)
  seeds.packedLE[i] = (
    table.bytes[i*4] |
    (table.bytes[i*4+1]<<8) |
    (table.bytes[i*4+2]<<16) |
    (table.bytes[i*4+3]<<24)
  ) >>> 0;

/** @param {number[]} input @returns {number} */
function coincidence(input) {
  const counts=new Uint32Array(29);
  for(const val of input)counts[val]++;
  return counts.reduce((s,c)=>s+c*(c-1),0)/(input.length*(input.length-1));
}

/** @param {"book"|"page"|"chapter"} clock @returns {number[]} */
function starts(clock) {
  const lengths=clock==="book"?[C.length]:
    clock==="page"?pages.map(page=>page.indices.length):chapters;
  const ret=[0];
  for(const len of lengths)ret.push(ret.at(-1)+len);
  assert.equal(ret.at(-1), C.length);
  return ret.slice(0,-1);
}

/** @param {Uint32Array} seed @param {"book"|"page"|"chapter"} clock */
function keyStream(seed,clock) {
  const boundaries=starts(clock);
  const words=new Uint32Array(C.length);
  let block=0,currentStart=-1,rng=null;
  for(let i=0;i<C.length;i++) {
    if(block+1<boundaries.length&&i===boundaries[block+1])block++;
    const here=boundaries[block];
    if(here!==currentStart){rng=isaac(seed);currentStart=here}
    words[i]=rng();
  }
  return words;
}
function value(word,lane){
  if(lane==="word32")return word>>>0;
  if(lane==="b0")return word&255;
  if(lane==="b1")return(word>>>8)&255;
  if(lane==="b2")return(word>>>16)&255;
  return(word>>>24)&255;
}
function md(v){return ((v%29)+29)%29;}

const results=[];
const p57=book.pages[57].indices;
assert.equal(p57.length,95);
for(const [seedName,seed] of Object.entries(seeds))
for(const clock of ["book","page","chapter"]) {
  const words=keyStream(seed,clock);
  for(const lane of ["word32","b0","b1","b2","b3"])
  for(const sign of [-1,1]) {
    const P=C.map((c,i)=>md(c+sign*(value(words[i],lane)%29)));
    const cipher=P.map((p,i)=>md(p-sign*(value(words[i],lane)%29)));
    assert.deepEqual(cipher,C,"every source ciphertext rune reproduces exactly");
    const test=p57.map((p,i)=>md(p-sign*(value(words[i],lane)%29)))
      .map((c,i)=>md(c+sign*(value(words[i],lane)%29)));
    assert.deepEqual(test,p57,"solved-page 95-rune synthetic roundtrip");
    results.push({seed:seedName,clock,lane,sign,
      ioc:coincidence(P),
      first20:P.slice(0,20).map(v=>book.translit[v]).join("")});
  }
}
assert.equal(results.length,60);
const rank=results.toSorted((a,b)=>b.ioc-a.ioc);
assert.equal(Number(rank[0].ioc.toFixed(12)),Number(0.034546603657732274.toFixed(12)));
console.log(JSON.stringify({
  classification:"negative bounded p50-seeded ISAAC direct-output test; no LP2 plaintext",
  originalRunes:C.length,
  originalIoC:coincidence(C),
  officialISAACSecondBlockControl:"f650e4c8 e448e96d 98db2fb4 f5fad54f",
  keySeedings:2,
  clocks:3,
  outputMaps:5,
  arithmeticSigns:2,
  originalFullDecodeVariants:results.length,
  best:rank.slice(0,5),
  worst:rank.at(-1),
  knownNativeP57Coincidence:coincidence(p57),
  sourceSelected:"p50's 256 exact printed bytes, GP29 output alphabet, physical pages/chapters",
  hypothesesUnselected:"ISAAC algorithm, seed width, byte lane, key clock and additive use"
},null,2));
