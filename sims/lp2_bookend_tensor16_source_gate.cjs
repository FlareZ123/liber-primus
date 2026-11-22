"use strict";
/**
 * Source-frozen 16-rune bookend/tensor-square inverse on original LP2.
 *
 * The only repeated six-rune two-word string occurs twice, at original
 * bookend offsets 6555 and 12950. Removing those two exact source motifs
 * leaves 12944 = 809 x 16 runes. Each proposed sixteen-rune packet is
 * reshaped into a 4x4 array and transformed by the independently printed
 * physical-p15 Fibonacci-distance square on BOTH axes over GF(29).
 *
 * This is an explicitly provisional source interpretation. Exact forward
 * reencryption checks implementation correctness, not historical key choice.
 * This test differs from the continuous four-symbol Hill and word-reset
 * four-symbol Hill tests already in this repository.
 *
 * SFT / Windows 11 / Node.js 22: node sims/lp2_bookend_tensor16_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {mod, matrixInverse, stats, encodeEnglishWord} =
  require("./fibonacci_square_hill4_gate.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(root,
  "resources", "control", "shakespeare_first300k.txt"), "utf8");
const ciphertext = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
const signature = [23, 11, 1, 17, 18, 10];
const offsets = [6555, 12950];

/** @param {number[]} input @returns {number[]} */
function removeSourceTags(input) {
  const copy = input.slice();
  for (const offset of offsets.slice().reverse()) {
    assert.deepEqual(input.slice(offset, offset + signature.length), signature);
    copy.splice(offset, signature.length);
  }
  return copy;
}

/** @param {number[]} payload @returns {number[]} */
function restoreSourceTags(payload) {
  const copy = payload.slice();
  for (const offset of offsets)
    copy.splice(offset, 0, ...signature);
  return copy;
}

/** @param {number[][]} m @param {number[]} x @returns {number[]} */
function transformTile(m, x) {
  assert.equal(m.length, 4);
  assert.equal(x.length, 16);
  const output = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let a = 0; a < 4; a++)
        for (let b = 0; b < 4; b++)
          sum += m[i][a] * x[4*a+b] * m[j][b];
      output.push(mod(sum));
    }
  }
  return output;
}

/** @param {number[]} input @param {number[][]} matrix */
function transform(input, matrix) {
  assert.equal(input.length % 16, 0);
  const out = [];
  for (let i = 0; i < input.length; i += 16)
    out.push(...transformTile(matrix, input.slice(i, i + 16)));
  return out;
}

/** @param {number[]} values @returns {string} */
function toGP(values) {
  return values.map(v => corpus.translit[v]).join(" ");
}

/** @returns {void} */
function run() {
  assert.equal(ciphertext.length, 12956);
  // The six-rune bookend occurs exactly twice even before word annotation.
  const allMatches = [];
  for (let i = 0; i <= ciphertext.length - signature.length; i++)
    if (signature.every((v, j) => ciphertext[i + j] === v))
      allMatches.push(i);
  assert.deepEqual(allMatches, offsets);
  const payload = removeSourceTags(ciphertext);
  assert.equal(payload.length, 12944);
  assert.equal(payload.length / 16, 809);
  assert.deepEqual(restoreSourceTags(payload), ciphertext);

  const matrix = [
    [3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820]
  ].map(row => row.map(mod));
  const inverse = matrixInverse(matrix);
  assert.ok(inverse, "printed p15 matrix is invertible modulo29");

  const english = (source.match(/[A-Za-z]+/g) || [])
    .flatMap(encodeEnglishWord).slice(0, payload.length);
  assert.equal(english.length, payload.length);
  const controlCipher = transform(english, matrix);
  assert.deepEqual(transform(controlCipher, inverse), english);
  const wrongSourceMatrix = [
    [14, 22, 35, 56], [9, 1, 2, 90],
    [6, 4, 3, 145], [988, 611, 378, 234]
  ].map(row => row.map(mod));
  const wrongInverse = matrixInverse(wrongSourceMatrix);
  assert.ok(wrongInverse);
  const wrongSourceRecovered = transform(controlCipher, wrongInverse);

  const variants = [
    {name:"M-inverse both axes",decoding:inverse,encoding:matrix},
    {name:"M-forward both axes",decoding:matrix,encoding:inverse}
  ];
  const outcomes = variants.map(({name,decoding,encoding}) => {
    const candidate = transform(payload, decoding);
    assert.deepEqual(transform(candidate, encoding), payload);
    assert.deepEqual(restoreSourceTags(
      transform(candidate, encoding)), ciphertext);
    const score=stats(candidate);
    return {
      name, decryptedRunes:candidate.length,
      exactForwardReencryption:true, ioc:score.ioc,
      top12:score.top12, first96GP:toGP(candidate.slice(0,96))
    };
  });

  const result = {
    source:"Original LP2 0-55, two repeated DJU BEI bookends, printed p15 square",
    tagOffsets:offsets, tagRunes:signature, totalRunes:ciphertext.length,
    retainedBookends:12, payloadRunes:payload.length, blockSize:16,
    fullBlocks:payload.length/16, matrix, inverse,
    originalCipherIoC:stats(ciphertext).ioc,
    englishControl:{length:english.length,ioc:stats(english).ioc,
      encryptDecryptExact:true,wrongSourceIoC:stats(wrongSourceRecovered).ioc},
    outcomes,
    conclusion:"Both fixed 4x4 tensor-square inverses round-trip but produce " +
      "no detectable GP-English original plaintext. The 16-block framing " +
      "is retrospective and lacks an authenticated marker instruction."
  };
  console.log(JSON.stringify(result,null,2));
}
if (require.main === module) run();
module.exports = {run,removeSourceTags,restoreSourceTags,transformTile,transform};
