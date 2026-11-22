"use strict";

// Original p23 five-dot, 201×5 post-heading rune/word-boundary readout.
// Run: node sims/lp2_p23_26_wordgap_bacon_sft.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname, "..", "resources", "liber-primus");
/** @type {{runes: string[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const text = fs.readFileSync(path.join(base, "lp2-transcription.txt"), "utf8");
const symbols = new Set(corpus.runes);
const pages = text.split("%");
assert.equal(pages.length, 57); // LP2 physical p50 is rune-free.
const source = pages.slice(23,27).join("\n");
const original = Array.from(source).filter(ch => symbols.has(ch));
const expected = [23,24,25,26].flatMap(p => corpus.pages[p].indices.map(i => corpus.runes[i]));
assert.equal(original.length, 1021);
assert.deepEqual(original, expected);

/** Word-start bit 1 only when a printed word/clause separator precedes the rune.
 * Printed line wraps and page breaks do not introduce a new word.
 * @param {string} sourceText @returns {number[]}
 */
function startBits(sourceText) {
  let boundary = true;
  /** @type {number[]} */
  const bits = [];
  for (const ch of sourceText) {
    if (symbols.has(ch)) { bits.push(boundary ? 1 : 0); boundary = false; }
    else if ("-.&$§".includes(ch)) { boundary = true; }
  }
  return bits;
}

/** @param {readonly number[]} bits @param {boolean} inverseBit @param {boolean} lsbFirst */
function decode(bits, inverseBit, lsbFirst) {
  assert.equal(bits.length % 5, 0);
  /** @type {number[]} */
  const values = [];
  for (let offset = 0; offset < bits.length; offset += 5) {
    let value = 0;
    for (let k = 0; k < 5; k++) {
      const bit = bits[offset+k] ^ (inverseBit ? 1 : 0);
      value = lsbFirst ? value | (bit << k) : (value << 1) | bit;
    }
    values.push(value);
  }
  const letters = values.map(n => n < 26 ? String.fromCharCode(65+n) : "?").join("");
  return {
    values, letters,
    invalid26: values.filter(n => n >= 26).length,
    invalid24: values.filter(n => n >= 24).length,
    distinct: new Set(values).size,
    q: (letters.match(/Q/g) || []).length,
    qu: (letters.match(/QU/g) || []).length
  };
}
const bits = startBits(source).slice(16); // Source-fixed red16 heading.
assert.equal(bits.length, 1005);
assert.equal(bits.reduce((sum,x) => sum+x, 0), 220);
const endBits = bits.map((_,i) => bits[i+1] ?? 1); // Last rune is end-of-chapter.
const outputs = [];
for (const [mode,b] of [["start",bits],["end",endBits]]) {
  for (const inverted of [false,true]) for (const lsb of [false,true]) {
    const d = decode(b,inverted,lsb);
    outputs.push({
      mode, inverted, lsbFirst:lsb,
      invalid26:d.invalid26,invalid24:d.invalid24,
      distinct:d.distinct,q:d.q,qu:d.qu,opening:d.letters.slice(0,60)
    });
  }
}
assert.deepEqual(outputs.map(o => o.invalid26), [0,0,112,115,0,1,109,121]);
assert.deepEqual(outputs.map(o => o.q), [14,14,0,0,24,19,0,0]);
assert.deepEqual(outputs.map(o => o.qu), [0,0,0,0,1,1,0,0]);
assert.deepEqual(outputs.map(o => o.distinct), [15,15,15,15,17,17,17,17]);

// Source-compatible positive: arbitrary printed word breaks convey a planted A-Z message.
const plant = ("FOLLOWTHEPRIMES".repeat(14)).slice(0,201);
const encoded = [...plant].flatMap(ch => [4,3,2,1,0].map(i => (ch.charCodeAt(0)-65) >> i & 1));
let marked = "";
for (const [index,bit] of encoded.entries()) marked += (bit ? "-" : "") + corpus.runes[index%29];
const actual = startBits(corpus.runes[0] + marked).slice(1); // Plant prefix is not part of the encoded message.
assert.deepEqual(actual,encoded);
assert.equal(decode(actual,false,false).letters,plant);
console.log(JSON.stringify({
  pageSpan:"physical p23–26", heading:16, body:1005, quintets:201,
  wordStartBits:220, outputs, plant:{letters:201,match:true},
  decision:"Keyless printed word-gap Bacon readouts do not recover natural English; no post hoc hidden substitutions.",
  status:"PASS"
}, null, 2));
