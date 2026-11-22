"use strict";

/**
 * Fixed historical 2013 raw-XOR transfer to an independently proposed
 * LP2 p55 15x5 GP29/24-bit packet.
 *
 * node sims/lp2_p55_quintet_audio761_xor_sft.cjs path\to\761.MP3
 *
 * The original source source used complete 761.MP3 from byte zero as
 * a 2013 XOR pad. No free offset, secret key or fitted alignment.
 * This candidate is unverified; a native plaintext requires readable
 * output, and the 24-bit p55 packet itself is hypothetical.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const p55 = source.pages[55].indices;
assert.equal(p55.length, 76);
assert.equal(p55[0], 21);
const flags = [];
const values = [];
const output = [];
for (let i = 1; i < 76; i += 5) {
  const n = p55.slice(i, i + 5).reduce((acc, d) => {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 29);
    return acc * 29 + d;
  }, 0);
  assert.ok(n < 29 ** 5);
  const flag = Number(n >= 2 ** 24);
  const low = n - flag * 2 ** 24;
  flags.push(flag);
  values.push(n);
  output.push((low >>> 16) & 255, (low >>> 8) & 255, low & 255);
}
assert.equal(flags.join(""), "100100000000000");
const packet = Buffer.from(output);
assert.equal(packet.toString("hex"),
  "15023cbcedd14959802c8aee4d43d09b0ead8f8e12d2f139066f3e" +
  "8892b6460c27a66059a2e9bc73106377502d"
);
assert.equal(packet[0], p55[0]);
assert.equal(packet.at(-1), packet.length);
assert.equal(packet.subarray(1, -1).length, 43);

assert.equal(process.argv.length, 3, "Exactly one original audio file path is required");
const audio = fs.readFileSync(process.argv[2]);
assert.equal(audio.length, 4010732);
assert.equal(crypto.createHash("sha256").update(audio).digest("hex"),
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"
);

/**
 * @param {Buffer} x
 * @returns {Buffer}
 */
function historicalXor(x) {
  const out = Buffer.alloc(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] ^ audio[i];
  return out;
}

/**
 * @param {Buffer} x
 * @returns {{count:number,longest:number,escaped:string}}
 */
function printableSummary(x) {
  let count = 0;
  let longest = 0;
  let run = 0;
  for (const b of x) {
    if (b >= 32 && b <= 126 || b === 9 || b === 10 || b === 13) {
      count++;
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }
  const escaped = [...x].map(b =>
    (b >= 32 && b <= 126 ? String.fromCharCode(b)
      : b === 10 ? "\\n" : b === 13 ? "\\r" : b === 9 ? "\\t"
        : "\\x" + b.toString(16).padStart(2,"0"))
  ).join("");
  return { count, longest, escaped };
}

const control = Buffer.from(
  "THERE EXISTS A PAGE THAT HASHES TO A SECRET", "ascii"
);
assert.deepEqual(historicalXor(historicalXor(control)), control);
console.log("SOURCE p55 bytes", packet.length,
  "header", packet[0], "footer", packet.at(-1),
  "flags", flags.join(""));
console.log("SOURCE 2013 MP3 size", audio.length,
  "sha256", crypto.createHash("sha256").update(audio).digest("hex"));
for (const [name, src] of [
  ["all45", packet],
  ["strict43", packet.subarray(1, -1)]
]) {
  const out = historicalXor(src);
  const summary = printableSummary(out);
  console.log(JSON.stringify({
    name, length: out.length, decodedHex: out.toString("hex"),
    printable: summary.count, longestPrintable: summary.longest,
    escaped: summary.escaped,
    recoveredSource: historicalXor(out).equals(src)
  }));
}
console.log("Fixed source-aligned p55/2013 audio XOR complete");
