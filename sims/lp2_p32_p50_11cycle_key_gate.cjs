"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const chunks = read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(chunks.length, 57);
const pageText = chunks[32];
const bytes = grid.bytes;

// The 11-cycle is an already-reported feature of the original 256-byte map.
// Assert its exact successor order; do not search for new cycles here.
const cycle = [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192];
assert.equal(cycle.length, 11);
for (let i = 0; i < cycle.length; i++) {
  assert.equal(bytes[cycle[i]], cycle[(i + 1) % cycle.length]);
}

// The first word of the 11-word 2016 coda is SEEK. Its GP0 value selects
// the unique cycle phase whose state is congruent to that value mod 29.
const gp = ["F", "U", "TH", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "EO", "P", "X", "S", "T", "B", "E", "M", "L", "NG", "OE", "D", "A",
  "AE", "Y", "IA", "EA"];
const gpIndex = new Map(gp.map((s, i) => [s, i]));
gpIndex.set("K", gpIndex.get("C"));
gpIndex.set("V", gpIndex.get("U"));
const digraphs = new Set(gp.filter((s) => s.length === 2));
function gp0(word) {
  const s = word.toUpperCase().replaceAll("K", "C").replaceAll("V", "U");
  let sum = 0;
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    const token = digraphs.has(pair) ? pair : s[i];
    assert.ok(gpIndex.has(token), `Unknown GP token ${token}`);
    sum += gpIndex.get(token);
    i += token.length;
  }
  return sum % 29;
}
const seek = gp0("SEEK");
const phaseHits = cycle.map((state, index) => ({ state, index }))
  .filter(({ state }) => state % 29 === seek);
assert.equal(seek, 27);
assert.deepEqual(phaseHits, [{ state: 114, index: 6 }]);
const phase = phaseHits[0].index;
const orderedCycle = cycle.slice(phase).concat(cycle.slice(0, phase));
const key = orderedCycle.map((state) => state % 29);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const runeToTranslit = new Map(corpus.runes.map((r, i) => [r, corpus.translit[i]]));
const cipher = [...pageText].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch));
assert.equal(key.length, 11);
assert.equal(cipher.length, 121);
assert.equal(corpus.pages.find((p) => p.page === 32).runic_count, 121);
assert.equal(key.length * 11, cipher.length);

function decrypt(kind) {
  let i = 0, output = "";
  for (const ch of pageText) {
    if (!runeIndex.has(ch)) { output += ch; continue; }
    const c = runeIndex.get(ch), k = key[i % key.length];
    const p = kind === "vigenere-minus" ? (c - k + 29) % 29
      : kind === "vigenere-plus" ? (c + k) % 29
      : kind === "beaufort" ? (k - c + 29) % 29
      : (() => { throw new Error(`Unknown mode ${kind}`); })();
    output += corpus.runes[p];
    i++;
  }
  assert.equal(i, 121);
  return [...output].map((ch) => runeToTranslit.get(ch) ?? ch).join("");
}
const outputs = {
  vigenereMinus: decrypt("vigenere-minus"),
  vigenerePlus: decrypt("vigenere-plus"),
  beaufort: decrypt("beaufort"),
};
console.log(JSON.stringify({
  cycle,
  seekGP0: seek,
  uniquePhase: phaseHits[0],
  orderedCycle,
  key,
  keyRepeatedLength: key.length * 11,
  p32RuneCount: cipher.length,
  keySha256: crypto.createHash("sha256").update(Buffer.from(key)).digest("hex"),
  p32IndexSha256: crypto.createHash("sha256").update(Buffer.from(cipher)).digest("hex"),
  outputs,
  decision: "No readable plaintext under the three standard additive orientations; this exact 11-cycle key hypothesis is negative."
}, null, 2));
