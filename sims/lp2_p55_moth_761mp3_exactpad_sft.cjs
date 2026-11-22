"use strict";

/**
 * P55 provisional p5-moth 30-rune known-plaintext pad versus authenticated
 * 2013 Cicada 761.MP3 bytes, historically used as an XOR key source.
 *
 * Three exact named input transports, no free hand-picked key candidate:
 *   1. Original 8-bit MP3 bytes reduced mod29 -> Vigenere K = C-P.
 *   2. Same original bytes reduced mod29 -> Beaufort K = C+P.
 *   3. Original bytes literally XOR original GP29 index bytes -> K=C xor P.
 *
 * Also test the source-authenticated BASE29 high/low byte digits as a
 * source-running pad; this is an independent conditional interpretation.
 * Search ALL possible contiguous source starts. Preserve source byte order.
 * An exact 30-key-symbol match is a decisive necessary condition.
 *
 * No external dependencies, no file writes. Node.js 22, Windows11 or CI.
 * SFT: node sims/lp2_p55_moth_761mp3_exactpad_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const cipher = corpus.pages.find(p => p.page === 55).indices.slice(46);
assert.deepEqual(cipher, [
  12, 18, 28, 18, 10, 6, 14, 6, 15, 18, 15, 12, 2, 2, 18,
  15, 2, 22, 5, 28, 10, 19, 5, 14, 23, 11, 1, 17, 18, 10
]);
const words = [
  ["TH", "E"], ["T", "O", "T", "I", "E", "N", "T"],
  ["F", "U", "N", "C", "T", "IA", "N"], ["I", "S"],
  ["S", "A", "C", "R", "E", "D"], ["A", "L", "L"], ["TH", "NG", "S"]
];
assert.deepEqual(words.map(x => x.length), [2, 7, 7, 2, 6, 3, 3]);
const plain = words.flat().map(s => corpus.translit.indexOf(s));
assert.equal(plain.length, 30);
assert(plain.every(n => n >= 0));
const mod29 = n => ((n % 29) + 29) % 29;
const needles = {
  additive: cipher.map((c, i) => mod29(c - plain[i])),
  beaufort: cipher.map((c, i) => mod29(c + plain[i])),
  xor: cipher.map((c, i) => c ^ plain[i])
};

const pinnedUrl =
  "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3";
const pinnedSha256 =
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";

/**
 * Search every phase for an exact complete contiguous thirty-value pad.
 * The reported longest common PREFIX is a diagnostics only. The complete
 * exact key is the only positive criterion.
 *
 * @param {number[]} wanted
 * @param {number} length
 * @param {(at:number) => number} symbol
 * @returns {{longestPrefix:number,bestSourceStart:number,fullMatches:number}}
 */
function searchPad(wanted, length, symbol) {
  const n = wanted.length;
  let best = {longestPrefix: 0, bestSourceStart: -1, fullMatches: 0};
  for (let at = 0; at <= length - n; at++) {
    let j = 0;
    while (j < n && wanted[j] === symbol(at + j)) j++;
    if (j > best.longestPrefix) {
      best.longestPrefix = j;
      best.bestSourceStart = at;
    }
    if (j === n) best.fullMatches++;
  }
  return best;
}

async function main() {
  const answer = await fetch(pinnedUrl);
  assert(answer.ok, "original MP3 archive fetch failed with HTTP " + answer.status);
  const original = Buffer.from(await answer.arrayBuffer());
  const sha = crypto.createHash("sha256").update(original).digest("hex");
  assert.equal(original.length, 4010732);
  assert.equal(sha, pinnedSha256, "immutable original 2013 archive checksum");
  assert.deepEqual([...original.subarray(0, 3)], [0x49, 0x44, 0x33]);
  assert.deepEqual([...original.subarray(206, 210)], [0xff, 0xfb, 0xb0, 0x64]);

  const modValue = at => original[at] % 29;
  const byteValue = at => original[at];
  const base29ByteDigit = at => {
    const b = original[at >>> 1];
    return (at & 1) ? b % 29 : Math.floor(b / 29);
  };

  const gates = {
    additive_byte_reduction: searchPad(needles.additive, original.length, modValue),
    beaufort_byte_reduction: searchPad(needles.beaufort, original.length, modValue),
    xor_literal_byte: searchPad(needles.xor, original.length, byteValue),
    additive_base29_pairs: searchPad(needles.additive, original.length * 2, base29ByteDigit),
    beaufort_base29_pairs: searchPad(needles.beaufort, original.length * 2, base29ByteDigit)
  };

  // Positive plant uses an ACTUAL 30-byte MP3 substring starting at a
  // fixed, reproducible offset; recover its source position and plaintext.
  const plantStart = 761;
  const plantedCipher = plain.map((p, i) => mod29(p + modValue(plantStart + i)));
  const plantedPad = plantedCipher.map((c, i) => mod29(c - plain[i]));
  assert.deepEqual(plantedPad,
    Array.from({length: 30}, (_, i) => modValue(plantStart + i)));
  assert.equal(searchPad(plantedPad, original.length, modValue).longestPrefix, 30);
  assert.deepEqual(plantedCipher.map((c, i) =>
    mod29(c - plantedPad[i])), plain);
  // Same authentic source can also act as the XOR operand.
  const plantedXor = plain.map((p, i) => p ^ byteValue(plantStart + i));
  const plantedXorKey = plantedXor.map((c, i) => c ^ plain[i]);
  assert.equal(searchPad(plantedXorKey, original.length, byteValue).longestPrefix, 30);
  assert.deepEqual(plantedXor.map((c, i) => c ^ plantedXorKey[i]), plain);

  console.log(JSON.stringify({
    status: Object.values(gates).every(x => x.fullMatches === 0) ?
      "PASS; no complete historical audio pad recovered" :
      "POTENTIAL EXACT FULL-PAD MATCH: investigate before claiming discovery",
    pinnedOriginal: {sizeBytes: original.length, sha256: sha},
    p55UnchangedCipherRunes: cipher.length,
    provisionalPlaintextRunes: plain.length,
    sourceOffsetsTestedPerByteModel: original.length - plain.length + 1,
    sourceOffsetsTestedPerBase29PairModel: 2 * original.length - plain.length + 1,
    gates,
    positivePlants: {vigenereExact30: true, xorExact30: true},
    sourceClaim: "Only raw 2013 MP3 reuse; provisional source-crib and no keyed plaintext"
  }, null, 2));
  if (Object.values(gates).some(x => x.fullMatches > 0)) {
    throw Error("Source pad has full original match requiring independent adjudication");
  }
}

if (require.main === module) main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
module.exports = {searchPad};
