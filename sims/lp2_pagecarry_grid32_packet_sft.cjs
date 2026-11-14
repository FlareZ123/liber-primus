"use strict";
/**
 * Source-shaped 32 carried-word packet selector into original 32x8 table.
 * Bounded direct-output and GP-prime-consumer test, no LP2 plaintext claim.
 * Run: node sims/lp2_pagecarry_grid32_packet_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex = new Map(corpus.runes.map((r,i) => [r,i]));
const cells = grid.pages.flatMap(p => p.tokens);
const values = grid.pages.flatMap(p => p.bytes);
assert.equal(cells.length,256);
assert.equal(values.length,256);
assert.ok(values.every(x => Number.isInteger(x) && x >= 0 && x < 256));
const words = [];
let page = 0, start = 0, buffer = "", fragments = [];
const flush = () => {
  if (buffer) words.push({start,word:buffer,parts:fragments.slice()});
  buffer = ""; fragments = [];
};
for (const ch of read("resources/liber-primus/lp2-transcription.txt")) {
  if (runeIndex.has(ch)) {
    if (!buffer) { start = page; fragments = [0]; }
    buffer += ch;
    fragments[fragments.length-1]++;
  } else if (ch === "%") {
    page++;
    if (buffer) fragments.push(0);
  } else if (ch !== "/" && !/\s/u.test(ch)) {
    flush();
  }
}
flush();
const unknown = words.filter(x => x.start < 55);
assert.equal(unknown.length,2896);
assert.equal(unknown.reduce((s,x) => s + x.word.length,0),12956);
// Two page-edge fragments have no rune on the new page and are not carries.
const carries = unknown.filter(x => x.parts.length > 1 && x.parts.at(-1)>0);
const falseCarries = unknown.filter(x => x.parts.length > 1 && x.parts.at(-1)===0);
assert.equal(falseCarries.length,2);
assert.equal(carries.length,32);
assert.ok(carries.every(x => x.parts.length===2));
assert.ok(carries.every(x => x.parts[1]>=1 && x.parts[1]<=7));
const gpPrime = word => [...word].reduce((a,r) =>
  a + corpus.prime[runeIndex.get(r)],0);
const records = carries.map((x,i) => {
  const right = x.parts[1];
  const col = right-1;
  const cell = cells[i*8+col], byte = values[i*8+col];
  return {packet:i+1,page:x.start>=50?x.start+1:x.start,
    left:x.parts[0],right,word:x.word,cell,byte,prime:gpPrime(x.word)};
});
const raw = records.map(x => x.byte);
const mapped = {
  table:raw,
  xor:records.map(x => x.byte ^ (x.prime & 255)),
  subtract:records.map(x => (x.byte - x.prime % 256 + 256) % 256),
  add:records.map(x => (x.byte + x.prime) % 256)
};
/** @param {number[]} a @returns {{hex:string,visible:string,printable:number}} */
function format(a) {
  return {
    hex:a.map(x => x.toString(16).padStart(2,"0")).join(""),
    visible:a.map(x => x>=32 && x<=126 ? String.fromCharCode(x):".").join(""),
    printable:a.filter(x => x>=32 && x<=126).length
  };
}
assert.equal(format(raw).hex,
"61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671");
// A planted, independently chosen printable 32-byte record roundtrips the
// same fixed 32 row/column lookup, proving no overwritten index or off-by-one.
const planted = Buffer.from("CICADA 3301 PAGE-CARRY GRID TEST","ascii");
assert.equal(planted.length,32);
const toy = values.slice();
for (const x of records) toy[(x.packet-1)*8+(x.right-1)] =
  planted[x.packet-1];
const recovered = records.map(x => toy[(x.packet-1)*8+(x.right-1)]);
assert.deepEqual(Buffer.from(recovered),planted);
// One historical cipher family (repeating Vigenere), with a deliberately
// disclosed speculative byte->GP-index reduction. Zero phase, no key fitting.
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const histogram = Array(29).fill(0);
  for (const x of a) histogram[x]++;
  return histogram.reduce((sum,n) => sum+n*(n-1), 0)/(a.length*(a.length-1));
}
const candidateGPKey = raw.map(x => x%29);
const terminal = corpus.pages.filter(p => p.page===54 || p.page===55);
/** @param {number[]} c @param {number} sign @returns {number[]} */
const decrypt = (c,sign) => c.map((v,i) =>
  (v + sign*candidateGPKey[i%32] + 29)%29);
const terminalResults = terminal.map(p => {
  const minus = decrypt(p.indices,-1), plus=decrypt(p.indices,1);
  assert.deepEqual(decrypt(minus,1),p.indices);
  assert.deepEqual(decrypt(plus,-1),p.indices);
  return {page:p.page,originalIoC:ioc(p.indices),
    minusIoC:ioc(minus),plusIoC:ioc(plus),
    minusFirst30:minus.slice(0,30).map(x => corpus.translit[x]).join(""),
    plusFirst30:plus.slice(0,30).map(x => corpus.translit[x]).join("")};
});
assert.ok(Math.abs(terminalResults[0].minusIoC-0.03735632183908046)<1e-14);
assert.ok(Math.abs(terminalResults[1].minusIoC-0.03333333333333333)<1e-14);

const result = {
  totalUnknownRunes:12956, completeWords:2896,
  genuinelySplitWords:32, precedingPageSeparators:2,
  gridDimensions:[32,8], rightFragmentLengths:records.map(x => x.right),
  originalSourceCells:records.map(x => x.cell),
  selected: Object.fromEntries(Object.entries(mapped).map(
    ([key,a]) => [key,format(a)])),
  exploratoryRepeatVigenere:{keyIndices:candidateGPKey,terminal:terminalResults},
  positive:"32/32 planted bytes recovered without changing the source selector",
  conclusion:"No direct typed/plaintext sequence from this 32-row packet mapping"
};
console.log(JSON.stringify(result,null,2));
