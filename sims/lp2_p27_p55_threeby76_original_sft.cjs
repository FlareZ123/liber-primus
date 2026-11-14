"use strict";

/**
 * A source-addressed 3x76 test using the p27/p55 repeated six-rune
 * footer. Original page27 length234 minus exact copied 6 = 3*76,
 * the full p55 length. Test a historic Shamir 3-share GP29 consumer
 * and direct additive combination without guessing any original key.
 *
 * SFT: node sims/lp2_p27_p55_threeby76_original_sft.cjs
 * Windows/Node22, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const c27 = source.pages.find(p => p.page === 27).indices;
const c55 = source.pages.find(p => p.page === 55).indices;
const mod = x => (x % 29 + 29) % 29;
assert.equal(c27.length, 234);
assert.equal(c55.length, 76);

const anchor = c27.slice(28, 34);
assert.deepEqual(anchor, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(anchor, c55.slice(70));
const stripped = c27.slice(0, 28).concat(c27.slice(34));
assert.equal(stripped.length, 228);

// Unique original-source page-pair census: find every ordered pair of
// distinct rune-bearing unsolved physical pages whose exact lengths
// satisfy long = 3*short + 6. Then independently check a verbatim
// six-rune copy of the shorter page's complete terminal footer.
const runePages = source.pages.filter(p =>
  p.page < 56 && p.indices.length > 0);
const threeTapes = [];
for (const longer of runePages) {
  for (const shorter of runePages) {
    if (longer.page === shorter.page ||
        longer.indices.length !== 3 * shorter.indices.length + 6) continue;
    const footer = shorter.indices.slice(-6).join(",");
    const starts = [];
    for (let i = 0; i <= longer.indices.length - 6; i++) {
      if (longer.indices.slice(i, i + 6).join(",") === footer) starts.push(i);
    }
    threeTapes.push({
      longer: longer.page,
      shorter: shorter.page,
      longerLength: longer.indices.length,
      shorterLength: shorter.indices.length,
      footerCopyStarts: starts
    });
  }
}
assert.deepEqual(threeTapes, [{
  longer: 27, shorter: 55,
  longerLength: 234, shorterLength: 76,
  footerCopyStarts: [28]
}]);

const layouts = [
  {name: "three consecutive 76-rune shares",
    shares: [stripped.slice(0, 76),
      stripped.slice(76, 152), stripped.slice(152, 228)]},
  {name: "76 consecutive 3-rune shares",
    shares: [0, 1, 2].map(phase =>
      Array.from({length: 76}, (_, i) => stripped[3 * i + phase]))},
  // Independently solved p57 explicitly mentions shedding circumferences.
  // p27 has 234 = 3*78 source runes; shedding BOTH boundary runes
  // of each of three 78-rune source lines yields exactly 3*76.
  // No original graphic authenticates these particular 78-wide rows.
  {name: "three 78-rune strips; discard two outside runes per strip",
    shares: [0, 1, 2].map(row =>
      c27.slice(78 * row + 1, 78 * row + 77))},
  {name: "78 triples as rows; discard first/last triple",
    shares: [0, 1, 2].map(phase =>
      Array.from({length: 76}, (_, i) => c27[3 * (i + 1) + phase]))}
];

const operators = [
  {name: "Shamir degree2 f(0) from samples x1,x2,x3",
    fn: (a, b, c) => mod(3 * a - 3 * b + c)},
  {name: "Shamir degree2 f(4) from samples x1,x2,x3",
    fn: (a, b, c) => mod(a - 3 * b + 3 * c)},
  {name: "three-share direct GF29 addition",
    fn: (a, b, c) => mod(a + b + c)}
];

/** @param {number[]} runes */
function ioc(runes) {
  const hist = Array(29).fill(0);
  for (const r of runes) hist[r]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (runes.length * (runes.length - 1));
}

/** @param {number[]} runes */
const latin = runes => runes.map(x => source.translit[x]).join(" ");
const records = [];
for (const layout of layouts) {
  for (const operator of operators) {
    const [a, b, c] = layout.shares;
    const key = c55.map((_, i) => operator.fn(a[i], b[i], c[i]));
    const directExactMatches = key.reduce((n, val, i) =>
      n + Number(val === c55[i]), 0);
    const reverseExactMatches = key.reduce((n, val, i) =>
      n + Number(mod(-val) === c55[i]), 0);
    const keys = [];
    for (const sign of [-1, 1]) {
      const decoded = c55.map((v, i) => mod(v + sign * key[i]));
      assert.deepEqual(decoded.map((v, i) => mod(v - sign * key[i])), c55,
        "re-encryption must recover exact source glyphs");
      keys.push({
        sign,
        ioc: Number(ioc(decoded).toFixed(12)),
        opening: latin(decoded.slice(0, 24)),
        alphabetFPositions: decoded.flatMap((v, i) => v === 0 ? [i] : [])
      });
    }
    records.push({
      layout: layout.name, operator: operator.name,
      exactSecret0OrShare4Matches: directExactMatches,
      negatedMatches: reverseExactMatches,
      keys
    });
  }
}

assert.deepEqual(records.map(row => row.exactSecret0OrShare4Matches),
  [3, 3, 4, 3, 3, 4, 3, 0, 1, 4, 2, 3]);
assert.deepEqual(records.map(row => row.negatedMatches),
  [4, 2, 3, 4, 2, 3, 3, 2, 5, 4, 3, 5]);
assert(Math.max(...records.flatMap(row => row.keys.map(x => x.ioc)))
  < 0.043, "original GP direct three-share consumers remain flat");

// An independently period-authentic rival: 2014 Cicada actually XORed
// three byte shares (not modulo29). Literal bitwise XOR of THREE GP29
// ordinal-valued lanes is reversible over the 5-bit register 0..31,
// but GP29 ciphertext/plaintext can only represent 0..28. Check both
// original direct-share identity and whole-p55 one-time XOR inverse.
const xorRecords = layouts.map(layout => {
  const [a, b, c] = layout.shares;
  const key = c55.map((_, i) => a[i] ^ b[i] ^ c[i]);
  const decoded = c55.map((v, i) => v ^ key[i]);
  assert.deepEqual(decoded.map((v, i) => v ^ key[i]), c55);
  return {
    layout: layout.name,
    originalMatches: key.filter((v, i) => v === c55[i]).length,
    keyOutsideGP29: key.flatMap((v, i) => v >= 29 ? [i] : []),
    plaintextOutsideGP29: decoded.flatMap((v, i) => v >= 29 ? [i] : [])
  };
});
assert.deepEqual(xorRecords.map(x => x.originalMatches), [0, 3, 2, 4]);
assert.deepEqual(xorRecords.map(x => x.keyOutsideGP29.length), [4, 3, 9, 3]);
assert.deepEqual(xorRecords.map(x => x.plaintextOutsideGP29.length),
  [10, 6, 6, 8]);

// Independent, genuine solved-LP2 page57 source-native rune plaintext
// under an intentionally planted unknown 76-rune Shamir GP29 key.
// This checks the full source-length circuit and exact inverse.
const solved = source.pages.find(p => p.page === 57).indices.slice(0, 76);
assert.equal(solved.length, 76);
const plantedShares = [
  Array.from({length: 76}, (_, i) => mod(17 * i + 9)),
  Array.from({length: 76}, (_, i) => mod(23 * i + 11))
];
const trueKey = Array.from({length: 76}, (_, i) => mod(i * 5 + 13));
plantedShares.push(trueKey.map((v, i) =>
  mod(v - 3 * plantedShares[0][i] + 3 * plantedShares[1][i])));
const recoveredKey = plantedShares[0].map((a, i) =>
  operators[0].fn(a, plantedShares[1][i], plantedShares[2][i]));
assert.deepEqual(recoveredKey, trueKey);
const plantedCipher = solved.map((p, i) => mod(p + trueKey[i]));
const recovered = plantedCipher.map((c, i) => mod(c - recoveredKey[i]));
assert.deepEqual(recovered, solved);
assert.deepEqual(recovered.map((p, i) => mod(p + recoveredKey[i])),
  plantedCipher);

// Construct a true full-length 2014-style three-share XOR cipher using
// only GP29-valued shares and 29-valued ciphertext. Its source-native
// solved-p57 input is NEVER used for any original ciphertext key fit.
const xorShares = [[], [], []];
const xorCipher = [];
for (let i = 0; i < solved.length; i++) {
  const cipher = mod(solved[i] + 1);
  const requiredKey = solved[i] ^ cipher;
  const first = (i * 7 + 5) % 29;
  const second = Array.from({length: 29}, (_, j) => j).find(
    j => (requiredKey ^ first ^ j) < 29);
  assert.notEqual(second, undefined);
  const third = requiredKey ^ first ^ second;
  assert(third >= 0 && third < 29);
  xorShares[0].push(first);
  xorShares[1].push(second);
  xorShares[2].push(third);
  xorCipher.push(cipher);
}
assert.deepEqual(xorCipher.map((v, i) =>
  v ^ xorShares[0][i] ^ xorShares[1][i] ^ xorShares[2][i]), solved);
assert.deepEqual(solved.map((v, i) =>
  v ^ xorShares[0][i] ^ xorShares[1][i] ^ xorShares[2][i]), xorCipher);

console.log(JSON.stringify({
  status: "source-selected three-by-76 direct GF29 key gate; no original plaintext",
  originalPage27Runes: c27.length,
  originalPage55Runes: c55.length,
  uniqueFullCorpusThreeTapePair: threeTapes,
  duplicatedAnchor: {p27Start: 28, p55Start: 70, len: 6},
  strippedPage27Runes: stripped.length,
  sourceNativeShamirPlant: {length: solved.length,
    inverseExact: true, forwardExact: true, plainIoC: ioc(solved)},
  sourceNativeXorPlant: {length: solved.length,
    inverseExact: true, forwardExact: true},
  sourceOriginalXor: xorRecords,
  records
}, null, 2));
