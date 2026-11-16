"use strict";

/**
 * LP2 256-event alternate source-class original-input gate.
 *
 * Reads only canonical source assets; no writes, searched marker value,
 * secret cipher key, fitted phase, or plaintext guess. Node.js 22, CommonJS.
 *
 * Source variants:
 * A: all 31 thirteen-dot marks (including the single black mark).
 * B: 31 red prime-count marks (30 thirteen-dot and final twenty-three-dot).
 * The latter excludes the lone black thirteen-dot mark.
 *
 * The observed single GF29 root belongs to B with zero-valued marks,
 * and only to the literal forward-GP-index polynomial representation.
 * The following RC4 uses a historically motivated but unselected key use.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} relative */
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const ink = read("resources/liber-primus/lp2-ink-annotations.json");
const grid = read("resources/liber-primus/base60-grid.json");
const table = grid.byte_rows.flat();
assert.equal(table.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(table)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.deepEqual([
  ink.counts.red, ink.counts.red13, ink.counts.black13, ink.counts.red23
], [225,30,1,1]);

/** @typedef {{page:number,offset:number,kind:0|1,index:number,dots?:number}} Event */
/**
 * Rebuild one complete physical page/offset ordered event tape.
 * Punctuation is at the boundary before a rune with the same offset.
 * @param {"A"|"B"} selector
 * @returns {Event[]}
 */
function collect(selector) {
  /** @type {Event[]} */
  const events=[];
  for (const page of ink.pages) {
    for (const span of page.red_spans||[]) {
      const glyphs=[...span.runes];
      assert.equal(glyphs.length,span.length);
      for(let i=0;i<glyphs.length;i++) {
        const offset=span.start+i;
        const index=corpus.runes.indexOf(glyphs[i]);
        assert.ok(index>=0);
        assert.equal(corpus.pages[page.page].indices[offset],index);
        events.push({page:page.page,offset,kind:1,index});
      }
    }
    for(const [offset,dots,color] of page.large_punctuation||[]) {
      const use=selector==="A" ? dots===13 : color==="red"&&(dots===13||dots===23);
      if(use)events.push({page:page.page,offset,kind:0,index:0,dots});
    }
  }
  events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
  assert.equal(events.length,256);
  assert.equal(events.filter(e=>e.kind===1).length,225);
  assert.equal(events.filter(e=>e.kind===0).length,31);
  return events;
}

const A=collect("A");
const B=collect("B");
assert.deepEqual(A.map(e=>e.index).slice(0,13),
  [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(A.filter(e=>e.kind===0&&e.dots===13).length,31);
assert.equal(B.filter(e=>e.kind===0&&e.dots===13).length,30);
assert.equal(B.filter(e=>e.kind===0&&e.dots===23).length,1);

/** @param {number} v */
const mod = v => ((v%29)+29)%29;
/**
 * Evaluate a source-ordered high-to-low-coefficient GF(29) polynomial.
 * @param {number[]} coefficients
 * @param {number} x
 */
const evaluate = (coefficients,x) => coefficients.reduce((v,c)=>mod(v*x+c),0);
/** @param {number[]} coefficients @param {number} x */
const derivative = (coefficients,x) => coefficients.slice(0,-1).reduce(
  (v,c,i)=>mod(v*x+(coefficients.length-i-1)*c),0);
/**
 * Literal event encoding, not an asserted cipher register.
 * @param {Event[]} events
 * @param {"index"|"prime"} runeRegister
 * @param {"zero"|"count"} markerRegister
 */
function encode(events,runeRegister,markerRegister) {
  return events.map(e=>e.kind===1 ?
    runeRegister==="index" ? e.index : corpus.prime[e.index] :
    markerRegister==="zero" ? 0 : e.dots);
}

const a0=encode(A,"index","zero");
const b0=encode(B,"index","zero");
const ac=encode(A,"index","count");
const bc=encode(B,"index","count");
assert.deepEqual([
  evaluate(table,24),derivative(table,24),
  evaluate(a0,24),derivative(a0,24),
  evaluate(b0,24),derivative(b0,24),
  evaluate(ac,24),evaluate(bc,24)
], [0,0,27,5,0,7,28,18]);

const roots = a=>Array.from({length:29},(_,x)=>x)
  .filter(x=>evaluate(a,x)===0);
assert.deepEqual(roots(table),[24]);
assert.deepEqual(roots(a0),[0,1]);
assert.deepEqual(roots(b0),[0,1,24]);
assert.deepEqual(roots(ac),[22,26]);
assert.deepEqual(roots(bc),[]);
assert.ok(derivative(b0,24)!==0);
// The p50 source polynomial has a double root, the B tape a simple one.
// The shared root is not evidence of a complete common-codeword decoder.

/**
 * Standard RC4 KSA/PRGA, first keystream byte at position zero.
 * Historical Cicada OutGuess used ARC4-type randomization; neither
 * password handling nor this literal event-byte transfer is authenticated.
 * @param {number[]} key
 * @param {number[]} source
 * @returns {number[]}
 */
function rc4(key,source) {
  const S=Array.from({length:256},(_,i)=>i);
  let j=0;
  for(let i=0;i<256;i++) {
    j=(j+S[i]+key[i%key.length])&255;
    [S[i],S[j]]=[S[j],S[i]];
  }
  let i=0;
  j=0;
  return source.map(value=>{
    i=(i+1)&255;
    j=(j+S[i])&255;
    [S[i],S[j]]=[S[j],S[i]];
    return value^S[(S[i]+S[j])&255];
  });
}

const candidates=[
  {name:"B/index/zero",key:b0,header:"9433448a26b4a364bbc7183fc84638fe2e9fa9851e8089d2",printable:93},
  {name:"B/prime/zero",key:encode(B,"prime","zero"),header:"5e1353c6a4ce55b57a0cf4e7904e0cc5f044deb3a7558697",printable:97},
  {name:"B/prime/count",key:encode(B,"prime","count"),header:"9f5734ea064560358161d65cdfde308336a653f633dbaaa0",printable:114}
];
for(const candidate of candidates) {
  const decoded=rc4(candidate.key,table);
  assert.deepEqual(rc4(candidate.key,decoded),table);
  assert.equal(Buffer.from(decoded.slice(0,24)).toString("hex"),candidate.header);
  const printable=decoded.filter(c=>c>=32&&c<=126||c===9||c===10||c===13).length;
  assert.equal(printable,candidate.printable);
  assert.ok(!Buffer.from(decoded).includes(Buffer.from("-----BEGIN PGP")));
  assert.ok(!Buffer.from(decoded).includes(Buffer.from("Liber Primus")));
  const sample=Array.from(Buffer.from("CICADA3301SOURCEPOSITIVE"));
  assert.deepEqual(rc4(candidate.key,rc4(candidate.key,sample)),sample);
  console.log(candidate.name,{
    sourceBytes:256,plaintextHead24:Buffer.from(decoded.slice(0,24)).toString("hex"),
    printableBytes:printable,typedText:false,exactReplay:true
  });
}
console.log("PASS original source tapes A and B (225+31), indexed GP/JPEG concordance");
console.log("PASS table double root24, B/index/zero single root24, A/index/zero no root24");
console.log("PASS three source-readable B RC4 original inputs and independent planted inverses");
console.log("No unknown GP plaintext, first-party key, validated typed p50 payload, or destination recovered.");
