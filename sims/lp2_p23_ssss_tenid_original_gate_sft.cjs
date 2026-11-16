"use strict";
/**
 * Exhaust the historical ten-share ID choices for a fixed, earlier-defined,
 * lossless LP2 p23–26 five-strand SSSS candidate. This tests the missing
 * five-of-ten ID uncertainty only. The 122-byte codec is conjectural.
 * @module lp2_p23_ssss_tenid_original_gate_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { pack, unpack, gf, decodeDiffusion, main: priorControl } =
  require("./lp2_p23_201_122byte_ssss_codec_sft.cjs");

const GP = 29;
const FIELD_BYTES = 122;
const P56_HASH = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources",
  "liber-primus", "lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page >= 23 && p.page <= 26);
assert.deepEqual(pages.map(p => p.indices.length), [213,270,273,265]);
const raw = pages.flatMap(p => p.indices);
assert.equal(raw.length, 1021);
assert.deepEqual(raw.slice(0, 16),
  [1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]);
const body = raw.slice(16);
assert.equal(body.length, 1005);
const sourceStrands = Array.from({ length: 5 },
  (_, i) => body.slice(i * 201, (i + 1) * 201));
const repeatCounts = sourceStrands.map(s =>
  s.slice(1).reduce((n, x, i) => n + Number(x === s[i]), 0));
assert.deepEqual(repeatCounts, [1,4,3,2,1]);
const field = gf(976, [17,10,6]);
const IDs = Array.from({ length: 10 }, (_, i) => BigInt(i + 1));
const invert = new Map();
const id5 = new Map();
for (let j = 1; j <= 15; j++) invert.set(BigInt(j).toString(), field.inv(BigInt(j)));
for (const id of IDs) {
  let p = 1n;
  for (let j = 0; j < 5; j++) p = field.mul(p, id);
  id5.set(id.toString(), p);
}

/**
 * Evaluate five source strands at arbitrary five increasing 2013-style
 * share IDs. Precomputed inverses make exhaustive ten-choose-five cheap.
 * @param {bigint[]} ids
 * @param {bigint[]} shares
 * @returns {bigint}
 */
function restoreFast(ids, shares) {
  let out = 0n;
  for (let i = 0; i < 5; i++) {
    let weight = 1n;
    for (let j = 0; j < 5; j++) {
      if (i === j) continue;
      const delta = ids[i] ^ ids[j];
      weight = field.mul(weight, field.mul(ids[j], invert.get(delta.toString())));
    }
    out ^= field.mul(shares[i] ^ id5.get(ids[i].toString()), weight);
  }
  return out;
}

/**
 * Typed-output diagnostics, deliberately independent of any fitted plaintext.
 * @param {Buffer} plain
 * @returns {{printable:number,gpIndex:number,longestPrintable:number,sha512:string,onion:string|null,first16Hex:string}}
 */
function inspect(plain) {
  let printable = 0, gpIndex = 0, longestPrintable = 0, run = 0;
  for (const b of plain) {
    const okay = (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13;
    printable += Number(okay);
    gpIndex += Number(b < GP);
    run = okay ? run + 1 : 0;
    longestPrintable = Math.max(longestPrintable, run);
  }
  const text = plain.toString("latin1");
  const onion = text.match(/[a-z2-7]{16,56}\.onion/);
  return {
    printable, gpIndex, longestPrintable,
    sha512: crypto.createHash("sha512").update(plain).digest("hex"),
    onion: onion ? onion[0] : null,
    first16Hex: plain.subarray(0, 16).toString("hex")
  };
}

/**
 * Select every ordered-increasing five-share ID subset from 01..10.
 * @returns {bigint[][]}
 */
function combinations() {
  const result = [];
  for (let a = 0; a < 6; a++)
  for (let b = a + 1; b < 7; b++)
  for (let c = b + 1; c < 8; c++)
  for (let d = c + 1; d < 9; d++)
  for (let e = d + 1; e < 10; e++)
    result.push([IDs[a], IDs[b], IDs[c], IDs[d], IDs[e]]);
  assert.equal(result.length, 252);
  return result;
}

function main() {
  // The preceding original-input SFT independently checks the original
  // 2013 solved onion output and 201-rune codec round trip.
  priorControl();
  const candidates = [];
  const allIds = combinations();
  for (const direction of ["forward", "reversed"]) {
    const strands = direction === "forward"
      ? sourceStrands : sourceStrands.map(s => [...s].reverse());
    const values = strands.map(s => {
      const p = pack(s);
      assert.deepEqual(unpack(p.value), s);
      return p.value;
    });
    for (const ids of allIds) {
      const encoded = restoreFast(ids, values);
      const plain = decodeDiffusion(encoded, FIELD_BYTES);
      const result = inspect(plain);
      if (ids.join(",") === "2,3,5,7,8") {
        assert.equal(plain.subarray(0, 32).toString("hex"),
          direction === "forward"
            ? "839dc666c476dd982cb521b25fe3c94494031769673e9f90cfe3f69100aa8297"
            : "f34c85f94532b8b77de2ccbbd37d920f6329a149224ca4cf38e9c145ace2dcc5");
      }
      candidates.push({ direction, ids: ids.map(Number), ...result });
    }
  }
  assert.equal(candidates.length, 504);
  const topPrintable = [...candidates].sort((a,b) =>
    b.printable - a.printable || b.longestPrintable - a.longestPrintable).slice(0,10);
  const topGp = [...candidates].sort((a,b) => b.gpIndex - a.gpIndex).slice(0,5);
  const uniqueOnions = candidates.filter(x => x.onion);
  const digestMatches = candidates.filter(x => x.sha512 === P56_HASH);
  const completeText = candidates.filter(x => x.printable === FIELD_BYTES);
  const completeGp = candidates.filter(x => x.gpIndex === FIELD_BYTES);
  const maxPrintable = Math.max(...candidates.map(x => x.printable));
  const minPrintable = Math.min(...candidates.map(x => x.printable));
  const output = {
    sourcePages: [23,24,25,26],
    sourceRunes: 1021,
    encryptedBodyRunes: 1005,
    fixedFiveStrandRepeats: repeatCounts,
    candidateCodec: "GP29 201-rune <=7-repeat enumerative rank into SSSS GF(2^976), conjectural",
    shareLabels: "five increasing IDs from integer 1..10, no runic evidence selects IDs",
    idAssignments: allIds.length,
    orientationCount: 2,
    testedSecrets: candidates.length,
    secretBytes: FIELD_BYTES,
    minPrintable, maxPrintable,
    p56HashMatches: digestMatches.length,
    matchedOnionStrings: uniqueOnions.length,
    completelyPrintableSecrets: completeText.length,
    completelyGpIndexSecrets: completeGp.length,
    topPrintable, topGp,
    decision: "Only this fixed speculative codec plus finite increasing five-of-ten ID family; no assertion about other parsings, label permutations or true 2013 share source"
  };
  console.log("TEN_ID_DECISION_JSON=" + JSON.stringify(output, null, 2));
  return output;
}
if (require.main === module) main();
module.exports = { main, restoreFast, inspect };
