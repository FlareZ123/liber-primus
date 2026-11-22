"use strict";
/**
 * Exact constructive witness that an unknown previous-rune-dependent 28-choice
 * alphabet can encode the original LP2 runes as valid fixed 5:3 byte packets.
 * This is a compatibility/capacity demonstration, never a plaintext claim.
 * Run with Node.js 22 from any working directory.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const M = 29;
const CAP = 256n ** 3n;
// For each preceding rune 0..28, the outgoing rune assigned digit 27.
const MAX_GLYPH = [8,5,21,25,18,23,15,21,17,7,28,7,18,2,17,26,21,10,25,15,0,18,0,2,0,26,17,7,0];

/** @returns {number[][]} */
function readPages() {
  const filename = path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json");
  const corpus = JSON.parse(fs.readFileSync(filename, "utf8"));
  const pages = corpus.pages.filter(p => p.status === "unsolved" && p.indices.length > 0).map(p => p.indices);
  assert.equal(pages.length, 55);
  assert.equal(pages.flat().length, 12956);
  return pages;
}

/**
 * Packet positions begin at rune index 1 within each physical page, so
 * index 0 is the first previous-rune state. Any packet touching a repeated
 * glyph is ignored in this conservative marker policy.
 * @param {number[][]} pages
 * @returns {number[][]}
 */
function cleanPackets(pages) {
  const packets = [];
  for (const page of pages) {
    for (let i = 1; i + 5 <= page.length; i += 5) {
      const packet = page.slice(i - 1, i + 5);
      if (packet.some((c, j) => j > 0 && c === packet[j - 1])) continue;
      packets.push(packet);
    }
  }
  return packets;
}

/**
 * Build outgoing rank rows. The most significant base-28 digit may be 27
 * only when the next digit <=8. Each chosen maximum outgoing edge imposes
 * explicit low-rank successor constraints on its target row.
 * @param {number[][]} packets
 * @returns {number[][]}
 */
function witnessRows(packets) {
  const requiredLow = Array.from({length:M}, () => new Set());
  for (const q of packets) {
    const [prior, head, next] = q;
    if (MAX_GLYPH[prior] === head) requiredLow[head].add(next);
  }
  const rows = Array.from({length:M}, (_, prior) => {
    const low = [...requiredLow[prior]].sort((a,b) => a-b);
    assert(low.length <= 9);
    assert(!low.includes(prior));
    assert(!low.includes(MAX_GLYPH[prior]));
    const rest = Array.from({length:M}, (_,i) => i)
      .filter(c => c !== prior && c !== MAX_GLYPH[prior] && !requiredLow[prior].has(c));
    const row = [...low, ...rest, MAX_GLYPH[prior]];
    assert.equal(row.length, 28);
    assert.equal(new Set(row).size, 28);
    assert(!row.includes(prior));
    return row;
  });
  return rows;
}

/**
 * @param {number[]} packet Six ciphertext runes, including previous state.
 * @param {number[][]} rows
 * @returns {{digits:number[],value:bigint}}
 */
function decode(packet, rows) {
  let value = 0n;
  const digits = [];
  for (let i = 1; i < packet.length; i++) {
    const d = rows[packet[i-1]].indexOf(packet[i]);
    assert(d >= 0 && d < 28);
    digits.push(d);
    value = value * 28n + BigInt(d);
  }
  return {digits,value};
}

/**
 * @param {number} state Prior ciphertext glyph
 * @param {number[]} digits
 * @param {number[][]} rows
 * @returns {number[]}
 */
function encode(state, digits, rows) {
  const out = [state];
  for (const d of digits) out.push(rows[out[out.length-1]][d]);
  return out;
}

/** @param {bigint} n */
function bytes3(n) {
  assert(n >= 0n && n < CAP);
  return [Number((n >> 16n) & 255n), Number((n >> 8n) & 255n), Number(n & 255n)];
}

function main() {
  const pages = readPages();
  const packets = cleanPackets(pages);
  const rows = witnessRows(packets);
  let maxFirst = 0, leading27 = 0, overflow = 0;
  const bytes = [];
  for (const p of packets) {
    const d = decode(p, rows);
    assert.deepEqual(encode(p[0], d.digits, rows), p);
    const first = d.digits[0];
    if (first > maxFirst) maxFirst = first;
    if (first === 27) {
      leading27++;
      assert(d.digits[1] <= 8);
    }
    if (d.value >= CAP) overflow++;
    else bytes.push(...bytes3(d.value));
  }
  assert.equal(packets.length, 2476);
  assert.equal(overflow, 0);
  // Independent positive controls: arbitrary bytes -> exactly five base-28
  // digits -> state-dependent rune encoder -> exact byte and glyph recovery.
  let positives = 0;
  for (let k = 0; k < 1000; k++) {
    const value = BigInt((k * 9973) % 16777216);
    let left = value;
    const digits = Array(5).fill(0);
    for (let i = 4; i >= 0; i--) {
      digits[i] = Number(left % 28n);
      left /= 28n;
    }
    assert.equal(left, 0n);
    const ciphertext = encode(k % 29, digits, rows);
    const recovered = decode(ciphertext, rows);
    assert.equal(recovered.value, value);
    assert.deepEqual(bytes3(recovered.value), bytes3(value));
    positives++;
  }
  const report = {
    source:"resources/liber-primus/lp2-corpus.json",
    model:"29 independent previous-ciphertext-glyph rows, each a permutation of the other 28 glyphs",
    packet:"page-local phase0; first rune state; 5 digits encode 3 bytes; discard complete packet if touching a doublet",
    ignoredPackets:pages.reduce((sum,page) => sum + Math.floor((page.length-1)/5),0)-packets.length,
    validPackets:packets.length,
    exactByteCapacityOverflows:overflow,
    leadingDigit27Packets:leading27,
    maxLeadingDigit:maxFirst,
    decodedByteCount:bytes.length,
    decodedByteSha256:crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
    rowTableSha256:crypto.createHash("sha256").update(JSON.stringify(rows)).digest("hex"),
    exactReencodings:packets.length,
    plantedByteRoundtrips:positives,
    highestRunePerRow:MAX_GLYPH,
    rows
  };
  console.log(JSON.stringify(report,null,2));
}
if (require.main === module) main();
module.exports = {readPages,cleanPackets,witnessRows,decode,encode,bytes3,MAX_GLYPH};
