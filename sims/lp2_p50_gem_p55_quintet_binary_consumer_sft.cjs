"use strict";
/**
 * Source-route GEM cycle and the newly proposed p55 45-byte self-framing
 * packet, tested as one complete byte-oriented key-to-cipher consumer.
 *
 * All settings are fixed by historical 2016 dimensions and previously
 * established original sources before inspecting plaintext output.
 * No arbitrary key search. Node.js 22 / CommonJS / Windows-compatible.
 *
 * @module lp2_p50_gem_p55_quintet_binary_consumer_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceGrid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
assert.match(signed, /Its words are the map, their\s+meaning is the road, and their numbers are the direction/u);
const grid = sourceGrid.byte_rows.flat();
assert.equal(grid.length, 256);
const dims = [563, 569];

/** @param {number} n */
function primeOrdinal(n) {
  let count = 0;
  for (let k = 2; k <= n; k++) {
    let prime = true;
    for (let d = 2; d*d <= k; d++) {
      if (k % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return count;
}
assert.deepEqual(dims.map(primeOrdinal), [103, 104]);
const directions = [
  [1, -1], [1, 0], [1, 1],
  [0, -1], [0, 0], [0, 1],
  [-1, -1], [-1, 0], [-1, 1]
];

/**
 * Fixed B=29q+r on physical 32x8 cells, q+1 standard keypad direction.
 * @param {number} first One-based source-prime ordinal
 */
function walk(first) {
  let pos = first - 1;
  const seen = new Map(), values = [], cells = [];
  while (pos >= 0 && !seen.has(pos)) {
    seen.set(pos, values.length);
    const value = grid[pos], quotient = Math.floor(value/29);
    const remainder = value % 29;
    values.push(remainder);
    cells.push(pos+1);
    const row = Math.floor(pos / 8), col = pos % 8;
    const [dr, dc] = directions[quotient];
    if (row+dr < 0 || row+dr >= 32 ||
        col+dc < 0 || col+dc >= 8)
      return {cells, values, cycle: [], terminated: "edge"};
    pos = 8*(row+dr) + col+dc;
  }
  return {
    cells, values,
    cycle: values.slice(seen.get(pos)),
    cycleCells: cells.slice(seen.get(pos)),
    terminated: "repeat"
  };
}
const pathWidth = walk(103), pathHeight = walk(104), pathEndpoint=walk(81);
assert.deepEqual(pathWidth.cells, [103,111,119,127,128]);
assert.deepEqual(pathWidth.cycleCells, [119,127,128]);
assert.equal(pathWidth.cycle.map(x=>gp.translit[x]).join(""), "GEM");
assert.equal(pathWidth.values.map(x=>gp.translit[x]).join(""), "OOGEM");
assert.equal(pathHeight.values.map(x=>gp.translit[x]).join(""), "OG");
assert.deepEqual(pathEndpoint.cells, [81]);
assert.equal(gp.translit[pathEndpoint.values[0]], "Y");

// p55 first rune is carried from prior physical page. Fifteen five-rune
// groups follow, each split exactly to one high/overflow bit + 3 bytes.
// The proposed byte framing is exploratory and is NOT an authenticated
// Cicada file format or cipher transport.
const terminal = gp.pages.find(p=>p.page===55).indices;
assert.equal(terminal.length,76);
const body = terminal.slice(1);
const packet = [],flags=[];
for (let at=0;at<body.length;at+=5) {
  let n=0;
  for(const v of body.slice(at,at+5))n=29*n+v;
  const overflow = Number(n >= 2**24);
  flags.push(overflow);
  const lower = n-overflow*2**24;
  packet.push(lower>>>16, lower>>>8 & 255, lower & 255);
}
assert.equal(packet.length,45);
assert.equal(flags.join(""),"100100000000000");
assert.equal(terminal[0],21);
assert.equal(packet[0],21);
assert.equal(packet.at(-1),45);
const middle = packet.slice(1,-1);
assert.equal(middle.length,43);

// Source-fixed candidate key interpretations. Native GP indices, GP
// prime weights, and literal ASCII transliterations all have a plausible
// independently visible reading; test each only in whole-key repeating
// XOR and additive orientations, matching the historical XOR/Vigenere
// precedents without a fitted nonce, shift or mode.
const gem = pathWidth.cycle;
const y = pathEndpoint.cycle;
assert.deepEqual(gem,[6,18,19]);
assert.deepEqual(y,[26]);
const sourceKeys = [
  {name:"GEM-ASCII", bytes:[71,69,77]},
  {name:"GEM-GP", bytes:gem},
  {name:"GEM-GP-prime", bytes:gem.map(x=>gp.prime[x])},
  {name:"GEM-onebased-GP", bytes:gem.map(x=>x+1)},
  {name:"Y-ASCII", bytes:[89]},
  {name:"Y-GP", bytes:y},
  {name:"Y-GP-prime", bytes:y.map(x=>gp.prime[x])}
];
const opcodes=["xor","sub","add"];
/** @param {number[]} input @param {number[]} key @param {string} op */
function process(input,key,op) {
  return input.map((v,i)=>op==="xor"?v^key[i%key.length]:
    op==="sub"?(v-key[i%key.length]+256)%256:
    (v+key[i%key.length])%256);
}
const hex = bytes=>bytes.map(x=>x.toString(16).padStart(2,"0")).join("");
const isPrintable=x=>x>=32&&x<127;
const magic = [
  [0x1f,0x8b], [0x50,0x4b,0x03,0x04],
  [0x89,0x50,0x4e,0x47], [0x25,0x50,0x44,0x46],
  [0x42,0x5a,0x68], [0xfd,0x37,0x7a,0x58,0x5a,0x00],
  [0x7b,0x22], [0x68,0x74,0x74,0x70]
];
const candidate = [];
for(const key of sourceKeys)for(const op of opcodes) {
  const plain=process(middle,key.bytes,op);
  const count=plain.filter(isPrintable).length;
  const signature=magic.find(prefix=>prefix.every((v,i)=>plain[i]===v));
  candidate.push({
    key:key.name, op, printable:count,
    recognizedHeader:Boolean(signature),
    prefixHex:hex(plain.slice(0,16))
  });
}
assert.equal(candidate.length,21);
const max = Math.max(...candidate.map(x=>x.printable));
assert.equal(max,20);
assert.ok(candidate.every(x=>!x.recognizedHeader));
// Positive full-length planted original-like payload using the exact
// first source-derived key and one selected historical XOR opcode.
const englishText="LIBER PRIMUS HOLDS A SECRET. SEEK THE RIGHT KEY.";
const planted=Array.from(englishText,c=>c.charCodeAt(0)).slice(0,43);
assert.equal(planted.length,43);
const encrypted=process(planted,sourceKeys[0].bytes,"xor");
assert.deepEqual(process(encrypted,sourceKeys[0].bytes,"xor"),planted);
assert.equal(planted.filter(isPrintable).length,43);

process.stdout.write(JSON.stringify({
  source: "2016 signed dimensions 563x569, source 256-cell base60 grid",
  graph: {
    widthPath:pathWidth.cells,
    widthOutput:pathWidth.values.map(i=>gp.translit[i]).join(""),
    widthCycle:pathWidth.cycle.map(i=>gp.translit[i]).join(""),
    heightOutput:pathHeight.values.map(i=>gp.translit[i]).join(""),
    endpoint81Output:pathEndpoint.values.map(i=>gp.translit[i]).join("")
  },
  packet: {
    page:55, runeBody:body.length, flags:flags.join(""),
    packetBytes:packet.length, middleBytes:middle.length,
    middleHex:hex(middle)
  },
  original: {
    models:candidate.length, bestPrintable:max,
    englishLikePrintableThreshold:"at least 32 of 43",
    aboveThreshold:candidate.filter(x=>x.printable>=32).length,
    recognizedFileHeaders:candidate.filter(x=>x.recognizedHeader).length,
    sorted:candidate.sort((a,b)=>b.printable-a.printable)
  },
  planted: {
    recovered:planted.length, total:43, asciiPrintable:43
  },
  conclusion:"No direct XOR or additive ASCII/file plaintext from any of these 21 source-derived consumers. No LP2 plaintext, authentic key, or source-selected packet format recovered."
},null,2)+"\n");
