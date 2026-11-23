"use strict";
/**
 * Bounded source-led test:
 *   p15 red-start Fibonacci-prime spiral integers -> byte offsets into the
 *   historical 761.MP3 selected by the p15/p50 ID3 marker -> 16-byte AES-128
 *   key -> original 256-byte p49-51 grid.
 *
 * Only the exact spiral order and zero-/one-based byte-offset conventions are
 * tested. AES ECB, CBC-zero-IV, and CTR-zero-counter are conventional bounded
 * consumers, not claimed source-authored operations.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const audioPath = process.argv[2] || "/tmp/761.MP3";
const audio = fs.readFileSync(audioPath);
const audioSha = crypto.createHash("sha256").update(audio).digest("hex");
assert.equal(audio.length, 4010732, "unexpected 761.MP3 byte length");
assert.equal(
  audioSha,
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460",
  "pinned 761.MP3 source bytes changed"
);

const offsets = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"
));
const ciphertext = Buffer.from(grid.bytes);
assert.equal(ciphertext.length, 256);
assert.deepEqual(ciphertext.subarray(0, 8), Buffer.from([203,231,167,186,97,237,126,183]));

function decrypt(mode, key, input) {
  const iv = mode === "ecb" ? null : Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-128-" + mode, key, iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(input), decipher.final()]);
}
function encrypt(mode, key, input) {
  const iv = mode === "ecb" ? null : Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-128-" + mode, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}
function metrics(bytes) {
  const printable = bytes.filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)).length;
  const gp29 = bytes.filter(b => b < 29).length;
  const ascii = bytes.toString("latin1");
  const signatures = ["ID3", "PK\\x03\\x04", "%PDF", "\\x89PNG", "GIF8", "RIFF", "OggS", "fLaC", "BZh", "\\x1f\\x8b", "7z\\xbc\\xaf\\x27\\x1c"];
  const found = signatures.filter(sig => {
    const raw = sig.replace(/\\\\x([0-9a-fA-F]{2})/g, (_,h) => String.fromCharCode(parseInt(h,16)));
    return ascii.startsWith(raw);
  });
  return {
    printable,
    printableShare: +(printable / bytes.length).toFixed(5),
    gp29,
    gp29Share: +(gp29 / bytes.length).toFixed(5),
    first32Hex: bytes.subarray(0,32).toString("hex"),
    first32Latin1: bytes.subarray(0,32).toString("latin1").replace(/[^\\x20-\\x7e]/g, "."),
    signaturesAtStart: found
  };
}

const variants = [
  ["zero-based-offsets", offsets],
  ["one-based-offsets", offsets.map(n => n - 1)]
];
const modes = ["ecb", "cbc", "ctr"];
const results = [];
for (const [variant, positions] of variants) {
  const key = Buffer.from(positions.map(p => {
    assert(p >= 0 && p < audio.length);
    return audio[p];
  }));
  assert.equal(key.length, 16);
  const plant = Buffer.from(("LIBER PRIMUS THE WORDS ARE THE MAP THEIR MEANING IS THE ROAD " +
    "AND THEIR NUMBERS THE DIRECTION 3301 ").repeat(4).slice(0,256), "ascii");
  assert.equal(plant.length, 256);
  for (const mode of modes) {
    const recoveredPlant = decrypt(mode, key, encrypt(mode, key, plant));
    assert.deepEqual(recoveredPlant, plant, "AES positive control failed");
    const recovered = decrypt(mode, key, ciphertext);
    results.push({
      offsetConvention: variant,
      mode,
      keyHex: key.toString("hex"),
      keyLatin1: key.toString("latin1").replace(/[^\\x20-\\x7e]/g, "."),
      ...metrics(recovered)
    });
  }
}
const best = results.slice().sort((a,b) => b.printableShare - a.printableShare);
console.log(JSON.stringify({
  hypothesis: "p15 Fibonacci-prime spiral values are byte offsets into the ID3-selected 2013 761.MP3; sampled 16 bytes form AES128 key for original 256-byte p49-51 grid",
  audioBytes: audio.length,
  audioSha256: audioSha,
  spiralOffsets: offsets,
  p50GridBytes: ciphertext.length,
  offsetConventions: variants.length,
  aesModes: modes,
  allSixAESPositiveControlsPass: true,
  best: best[0],
  allResults: results,
  directPlaintextRecovered: results.some(r => r.printable === 256 || r.gp29 === 256),
  conclusion: "Bounded test only; no source-authored offset convention or AES mode is established."
}, null, 2));
console.log("PASS p15→761.MP3 raw-offset AES128 bounded source probe");
