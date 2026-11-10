"use strict";
/**
 * LP2 13-dot-delimited red-rune lengths as a single base60 AES-192 key.
 * This is an explicitly finite, source-derived original-input inverse test,
 * not an authenticated encryption method or a claimed LP2 decipherment.
 *
 * Run: node sims/red32_base60_aes192_inverse.cjs
 * Node.js 22, no nonstandard dependencies, no file modifications.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {events, transform, ioc} = require("./red_256_event_key_inverse.cjs");

const ROOT = path.resolve(__dirname, "..");
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const gridRows = read("resources/liber-primus/base60-grid.json").byte_rows;
const grid = Buffer.from(gridRows.flat());
assert.equal(grid.length, 256);

/** @returns {number[]} Original red-rune run lengths between all 31 authentic 13-dot stencils. */
function redRunLengths() {
  const lengths = [];
  let count = 0;
  for (const event of events()) {
    if (event.kind === 1) count++;
    else {
      lengths.push(count);
      count = 0;
    }
  }
  lengths.push(count);
  assert.equal(lengths.length, 32);
  assert.equal(lengths.reduce((a,b) => a+b, 0), 225);
  assert.ok(lengths.every(v => v >= 0 && v < 60));
  return lengths;
}

/** @param {number[]} digits
 * @returns {Buffer} Fixed-width 192-bit big-endian integer from base60 digits.
 */
function integerKey(digits) {
  let value = 0n;
  for (const digit of digits) value = 60n * value + BigInt(digit);
  assert.ok(value < (1n << 192n));
  return Buffer.from(value.toString(16).padStart(48, "0"), "hex");
}
const lengths = redRunLengths();
const keyText = lengths.map(v => ALPHABET[v]).join("");
assert.equal(keyText, "D0G030B00EC09B0G0J0A08030x905070");
const forwardKey = integerKey(lengths);
const reverseKey = integerKey(lengths.slice().reverse());
assert.equal(forwardKey.toString("hex"),
  "0708f2dc76072a5a0f18c0858c4f7deddc78acb448284864");
assert.equal(reverseKey.toString("hex"),
  "001028f89b17653749d531825d08721c7984fb7de568d40d");

const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length > 0);
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
const pageBlocks = pages.map(p => p.indices.length);
const sectionBlocks = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
assert.equal(sectionBlocks.reduce((a,b)=>a+b,0),original.length);

/** @returns {number[]} Source-independent native GP text, used only for cipher positive controls and likelihood. */
function nativeGP() {
  const text = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const tokens = corpus.translit.map((s,i) => ({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const output = [];
  const normalized = (text.toUpperCase().match(/[A-Z]+/g) || []);
  for (let word of normalized) {
    word = word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    const values = [];
    for (let i=0;i<word.length;) {
      const t=tokens.find(t=>word.startsWith(t.s,i));
      if (!t) { values.length=0; break; }
      values.push(t.i);
      i+=t.s.length;
    }
    output.push(...values);
  }
  assert.ok(output.length > original.length + 3000);
  return output;
}
const native = nativeGP();
const control = native.slice(3000, 3000 + original.length);
assert.ok(ioc(control) > 0.045);
const counts = new Array(29).fill(1);
for (const c of native) counts[c]++;
const total = native.length + 29;
const logs = counts.map(c=>Math.log(c/total));

/** @param {number[]} text */
function score(text) {
  return {ioc:ioc(text), e:text.filter(x=>x===18).length,
    unigramLogMean:text.reduce((s,c)=>s+logs[c],0)/text.length,
    preview:text.slice(0,60).map(v=>corpus.translit[v]).join("")};
}

/** @param {Buffer} key
 * @param {Buffer} iv
 * @param {number[]} blocks
 * @returns {number[]} AES-192-CTR bytes; counter reset at each specified block.
 */
function stream(key,iv,blocks) {
  const bytes = [];
  for (const length of blocks) {
    const encoder = crypto.createCipheriv("aes-192-ctr",key,iv);
    bytes.push(...encoder.update(Buffer.alloc(length)));
    bytes.push(...encoder.final());
  }
  assert.equal(bytes.length, original.length);
  return bytes;
}

/** @param {number[]} input
 * @param {number[]} pad
 * @param {number} sign
 * @param {boolean} encode
 */
function additive(input,pad,sign,encode) {
  assert.equal(input.length,pad.length);
  return input.map((v,i) => (v + (encode?1:-1)*sign*(pad[i]%29)+29*29)%29);
}

/** @param {Buffer} data
 * @param {Buffer} key
 * @param {string} mode
 * @param {Buffer} iv
 * @returns {Buffer}
 */
function aesDecrypt(data,key,mode,iv) {
  const dec = crypto.createDecipheriv("aes-192-"+mode,key,
    mode==="ecb"?null:iv);
  dec.setAutoPadding(false);
  return Buffer.concat([dec.update(data),dec.final()]);
}
const order = [6,5,3,0,2,4,7,1];
const layouts = {
  row:grid,
  column:Buffer.from(Array.from({length:256},(_,i)=>gridRows[i%32][Math.floor(i/32)])),
  patienceRow:Buffer.from(gridRows.flatMap(row=>order.map(c=>row[c]))),
  patienceColumn:Buffer.from(Array.from({length:256},(_,i)=>
    gridRows[i%32][order[Math.floor(i/32)]]))
};

/** @param {Buffer} a */
function asciiCount(a) {
  return Array.from(a).filter(v => (v>=32&&v<=126)||v===9||v===10||v===13).length;
}
/** Source-table direct AES192 original-input test and native plaintext plant. */
function testTable() {
  const modes = [
    ["ecb",null],["cbc",Buffer.alloc(16)],["ctr",Buffer.alloc(16)],
    ["cfb",Buffer.alloc(16)],["ofb",Buffer.alloc(16)],
    ["cbc",true],["ctr",true]
  ];
  const rows=[];
  for (const [orientation,key] of [["forward",forwardKey],["reverse",reverseKey]]) {
    for (const [layoutName,bytes] of Object.entries(layouts)) {
      for (const [mode,ivSource] of modes) {
        const iv = ivSource===true?bytes.subarray(0,16):ivSource;
        const dec=aesDecrypt(bytes,key,mode,iv);
        rows.push({orientation,layout:layoutName,mode,
          iv:ivSource===true?"gridFirst16":ivSource?"zero":"none",
          printable:asciiCount(dec),
          first16hex:dec.subarray(0,16).toString("hex")});
      }
    }
  }
  assert.equal(rows.length,56);
  const plantText=Buffer.alloc(256);
  for(let i=0;i<256;i++)plantText[i]=
    "LIBERPRIMUSSOURCEFIXEDAES192POSITIVE".charCodeAt(i%34);
  const enc=crypto.createCipheriv("aes-192-cbc",forwardKey,Buffer.alloc(16));
  enc.setAutoPadding(false);
  const plant=Buffer.concat([enc.update(plantText),enc.final()]);
  assert.deepEqual(aesDecrypt(plant,forwardKey,"cbc",Buffer.alloc(16)),plantText);
  return {variants:rows.length,printableRange:[Math.min(...rows.map(r=>r.printable)),
    Math.max(...rows.map(r=>r.printable))],
    best:rows.sort((a,b)=>b.printable-a.printable).slice(0,6),
    plantedBytesRecovered:256};
}

/** Direct AES192-generated-rune-pad original inversion, 48 independent source-fixed settings. */
function testRunes() {
  const modes=[];
  const iva=Buffer.alloc(16),ivb=grid.subarray(0,16);
  for(const [orientation,key] of [["forward",forwardKey],["reverse",reverseKey]]) {
    for(const [ivName,iv] of [["zero",iva],["gridFirst16",ivb]]) {
      for(const [clock,blocks] of [
        ["book",[original.length]],["section",sectionBlocks],["page",pageBlocks]
      ]) {
        const pad=stream(key,iv,blocks);
        for(const sign of [-1,1]) {
          const addDecoded=additive(original,pad,sign,false);
          assert.deepEqual(additive(addDecoded,pad,sign,true),original);
          const addPlant=additive(control,pad,sign,true);
          assert.deepEqual(additive(addPlant,pad,sign,false),control);
          modes.push({orientation,iv:ivName,clock,sign,family:"additive",
            ...score(addDecoded)});
          const config={family:"ea",sign,reset:"book"};
          const decoded=transform(original,pad,config,false);
          assert.deepEqual(transform(decoded,pad,config,true),original);
          const planted=transform(control,pad,config,true);
          assert.deepEqual(transform(planted,pad,config,false),control);
          modes.push({orientation,iv:ivName,clock,sign,family:"GP28-EA",
            ...score(decoded)});
        }
      }
    }
  }
  assert.equal(modes.length,48);
  modes.sort((a,b)=>b.unigramLogMean-a.unigramLogMean);
  return {variants:modes.length,baselineOriginal:score(original),
    plantedNative:score(control),
    best:modes.slice(0,8),
    worst:modes.slice(-2).map(({preview,...rest})=>rest),
    allPlantedPositionsRecovered:48*original.length};
}
function run() {
  return {classification:"source-selected original-input AES192 family negative; no authentic LP2 plaintext",
    source:"225 original red GP runes delimited by 31 original 13-dot stencils",
    sourceRedLengths:lengths,keyText,
    aes192Keys:{forward:forwardKey.toString("hex"),reverse:reverseKey.toString("hex")},
    gridTable:testTable(),runeCiphertext:testRunes()};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={redRunLengths,integerKey,additive,stream,testTable,testRunes,run};
