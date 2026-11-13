"use strict";

/**
 * Agent48, 13 November 2026.
 * Known-plaintext obstruction to a fixed full-byte↔GP29 lookup on the terminal
 * 256-rune frame p55(76)+p56(85)+p57(95), paired with the 32x8 grid.
 *
 * SFT: node sims/lp2_grid256_terminal_solved180_lookup_sft.cjs
 * Tests arbitrarily secret lookup maps, not only mod29. No unknown plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const gp = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const {readingOrders, exactLookup} = require("./grid256_terminal_composite_lookup_gate.cjs");
const p55 = gp.pages[55].indices;
const p56 = gp.pages[56].indices;
const p57 = gp.pages[57].indices;
assert.deepEqual([p55.length, p56.length, p57.length], [76,85,95]);
assert.equal(p55.length+p56.length+p57.length, 256);
assert.equal(grid.bytes.length, 256);

/**
 * Source-canonical full solved p56 wording from independent LP2 verification.
 * It retains the GP orthography of V→U and K→C.
 * @param {string} phrase
 * @returns {number[]}
 */
function encodeGp(phrase) {
  const tokens = gp.translit.map((word, index) => ({word,index}))
    .sort((a,b) => b.word.length-a.word.length);
  const output = [];
  for(const word of phrase.split(" ")) {
    for(let i=0;i<word.length;) {
      const token = tokens.find(x=>word.startsWith(x.word,i));
      assert(token,"cannot encode source-word suffix "+word.slice(i));
      output.push(token.index);
      i += token.word.length;
    }
  }
  return output;
}
const p56Words = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const knownP56 = encodeGp(p56Words);
assert.equal(knownP56.length, 85);

/** @param {number} length @returns {number[]} */
function firstPrimes(length) {
  const primes = [];
  for(let n=2;primes.length<length;n++) {
    let ok=true;
    for(let d=2;d*d<=n;d++) if(n%d===0){ok=false;break;}
    if(ok)primes.push(n);
  }
  return primes;
}
const primes=firstPrimes(85);
let clock=0;
const decrypted56=p56.map((cipher,i)=>{
  // Authenticated p56 prime-totient cipher: literal F at offset 56 skips clock.
  if(i===56) { assert.equal(cipher,0);return 0; }
  const prime=primes[clock++];
  return ((cipher-(prime-1))%29+29)%29;
});
assert.deepEqual(decrypted56,knownP56);
const known = [...knownP56,...p57];
assert.equal(known.length,180);
const trials=[];
for (const order of readingOrders(grid.bytes)) {
  for (const glyphDirection of ["forward","reverse"]) {
    // The 76 p55 unknowns are never treated as plaintext.
    const x = glyphDirection === "forward" ?
      order.values.slice(76) : order.values.slice(0,180);
    const y = glyphDirection === "forward" ? known : known.slice().reverse();
    assert.equal(x.length,180);
    assert.equal(y.length,180);
    const byteToRune=exactLookup(x,y);
    const runeToByte=exactLookup(y,x);
    // These controls exercise the exact arbitrary-map obstruction under
    // both mappings for every original reading order.
    const plantedRune=x.map(n=>(n*7+13)%29);
    const plantedByte=y.map(n=>(n*5+39)%256);
    assert.equal(exactLookup(x,plantedRune).errors,0);
    assert.equal(exactLookup(y,plantedByte).errors,0);
    trials.push({order:order.name,byteDirection:order.direction,
      glyphDirection,byteToRune,runeToByte});
  }
}
assert.equal(trials.length,16);
assert(trials.every(x=>x.byteToRune.errors>0 && x.runeToByte.errors>0));
assert.equal(Math.min(...trials.map(x=>x.byteToRune.errors)),39);
assert.equal(Math.min(...trials.map(x=>x.runeToByte.errors)),151);
const rowMajor=trials.find(x=>x.order==="row-major" &&
  x.byteDirection==="forward" && x.glyphDirection==="forward");
assert.equal(rowMajor.byteToRune.errors,47);
assert.equal(rowMajor.runeToByte.errors,153);
console.log(JSON.stringify({
  source:"LP2 p55+p56+p57 = 76+85+95 = 256 exact runes; grid 256 bytes",
  knownOriginalPlaintext:180,
  withheldUnknownP55:76,
  sourceP56PhiDecoderVerified:85,
  sourceP57LiteralVerified:95,
  testedLayouts:trials.length,
  bestByteToRuneErrors:39,
  bestRuneToByteErrors:151,
  rowMajorForward:{byteToRune:47,runeToByte:153},
  positiveArbitrarySecretCodebooks:"all 16 reading orders pass both directions",
  outcomes:trials,
  result:"No static deterministic byte↔GP29 mapping fits the 180 solved terminal runes. No unknown plaintext recovered."
},null,2));
