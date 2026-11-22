"use strict";

// Narrow test of the derived 256-event red-rune/13-dot tape as a bytewise
// XOR pad for the 256-byte p50 grid. This is a motivated length-alignment
// hypothesis, not an authenticated cross-round instruction. The 225+31
// event inventory and the p50 base60-byte interpretation remain provisional.

const fs = require("node:fs");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

function load(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const annotations = load("resources/liber-primus/lp2-ink-annotations.json");
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const corpusPages = new Map(corpus.pages.map(p => [p.page, p]));
const events = [];

for (const page of [...annotations.pages].sort((a, b) => a.page - b.page)) {
  const source = corpusPages.get(page.page);
  assert(source, \`missing canonical page \${page.page}\`);
  const pageEvents = [];
  let serial = 0;

  // The annotation orientation says punctuation is after the preceding rune.
  // Therefore a marker at offset i is inserted before the rune at offset i.
  for (const [offset, size, color] of page.large_punctuation || []) {
    if (size === 13) {
      pageEvents.push({
        offset, order: 0, serial: serial++,
        type: \`dot13-\${color}\`, value: 13
      });
    }
  }

  for (const span of [...(page.red_spans || [])].sort((a, b) => a.start - b.start)) {
    const markedRunes = [...span.runes];
    assert.equal(markedRunes.length, span.length, \`red span length p\${page.page}\`);
    for (let j = 0; j < span.length; j++) {
      const offset = span.start + j;
      const runeIndex = source.indices[offset];
      const rune = corpus.runes[runeIndex];
      assert.equal(rune, markedRunes[j], \`red span/corpus mismatch p\${page.page} @\${offset}\`);
      pageEvents.push({
        offset, order: 1, serial: serial++,
        type: "red-rune", rune, runeIndex,
        value: corpus.prime[runeIndex]
      });
    }
  }

  pageEvents.sort((a, b) => a.offset - b.offset || a.order - b.order || a.serial - b.serial);
  events.push(...pageEvents.map(e => ({ ...e, page: page.page })));
}

const table = grid.pages.flatMap(p => p.bytes);
assert.equal(annotations.counts.red, 225);
assert.equal(events.filter(e => e.type === "red-rune").length, 225);
assert.equal(events.filter(e => e.type.startsWith("dot13-")).length, 31);
assert.equal(events.length, 256);
assert.equal(table.length, 256);
assert.equal(grid.byte_count, 256);
assert.deepEqual(grid.bytes, table);
assert.deepEqual(grid.pages.map(p => p.page), [49, 50, 51]);

// The Gematria table supplies prime values for red runes; each 13-dot
// punctuation mark contributes its visible count. Test the one natural
// bytewise one-time-pad operation against the printed-order p50 bytes.
const key = events.map(e => e.value);
assert(key.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
const output = table.map((value, i) => value ^ key[i]);
assert.equal(output.length, 256);

const hex = bytes => bytes.map(b => b.toString(16).padStart(2, "0")).join("");
const ascii = bytes => bytes.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("");
const printableRatio = output.filter(b => b >= 32 && b < 127).length / output.length;
const outputSha512 = crypto.createHash("sha512").update(Buffer.from(output)).digest("hex");
const p56Target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";

const signatures = {
  png: hex(output.slice(0, 8)) === "89504e470d0a1a0a",
  jpeg: hex(output.slice(0, 2)) === "ffd8",
  zip: hex(output.slice(0, 4)) === "504b0304",
  pdf: ascii(output.slice(0, 4)) === "%PDF",
  gzip: hex(output.slice(0, 2)) === "1f8b",
  elf: hex(output.slice(0, 4)) === "7f454c46",
  gif87a: ascii(output.slice(0, 6)) === "GIF87a",
  gif89a: ascii(output.slice(0, 6)) === "GIF89a",
  sevenZip: hex(output.slice(0, 6)) === "377abcaf271c"
};

const outputHex = hex(output);
assert.equal(outputSha512, "05d7f54a44bd09c97a5996f43c4279e9019ac9a94f74a6f6ff318522bf0ef65639feae675ce9f0f308d327f22dd0e906d6ca8955dad8a478be26da8b2aa1225a");
assert.equal(outputHex.slice(0, 64), "fef0e4bd70aa15b5699edf91fa09ba9d5ce3186e6b8c003248fd820ead41de88");
assert.equal(outputHex.slice(-64), "493742d28d0d14e825b3af7cc13fc6a09de80f852333cbcd5affa787896dfe5d");
assert.equal(printableRatio, 0.37109375);
assert(Object.values(signatures).every(value => value === false));
assert.notEqual(outputSha512, p56Target);

console.log(JSON.stringify({
  model: "p50_byte[i] XOR red_event[i]",
  eventCount: events.length,
  eventCounts: {
    redRunes: events.filter(e => e.type === "red-rune").length,
    red13Dots: events.filter(e => e.type === "dot13-red").length,
    black13Dots: events.filter(e => e.type === "dot13-black").length
  },
  mapping: "red rune -> GP prime value; 13-dot mark -> 13; page/offset order",
  table: { shape: "32x8", pages: grid.pages.map(p => p.page), bytes: table.length },
  output: {
    length: output.length,
    first32Hex: outputHex.slice(0, 64),
    last32Hex: outputHex.slice(-64),
    first64Ascii: ascii(output.slice(0, 64)),
    printableRatio,
    uniqueByteValues: new Set(output).size,
    min: Math.min(...output),
    max: Math.max(...output),
    sha512: outputSha512,
    matchesP56Target: outputSha512 === p56Target,
    fileSignatures: signatures,
    fullHex: outputHex
  },
  decision: "The exact 256-byte XOR output is neither readable text nor a common file preamble and is not the p56 SHA-512 preimage. This rejects only this direct one-time-pad consumer."
}, null, 2));
