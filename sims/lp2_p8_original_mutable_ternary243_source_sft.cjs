"use strict";
/**
 * Original-source p7 -> p8 mutable five-trit table decoder SFT.
 * The 2014 p7 five-red-word GP29 index products define a 242-cycle GF(3)
 * sequence; p8's original black punctuation favors its zero splice at 208.
 * Test a genuinely writable 243-state table on untouched p9-p14 runes.
 * Node.js 22, CommonJS, Windows 11: standalone repository-relative test file.
 * This is a bounded experimental receiver, not an authenticated Cicada cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-transcription.txt"), "utf8").split("%");
const p7 = source.pages[7].indices;
const p8 = source.pages[8].indices;
const p9 = source.pages[9].indices;
const black = p8.slice(12);
const target = source.pages.slice(9, 15).flatMap(p => p.indices);
const p13Start = source.pages.slice(9, 13).reduce((s, p) => s + p.indices.length, 0);
const positive = source.pages[57].indices;
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(black.length, 243);
assert.equal(target.length, 1474);
assert.equal(positive.length, 95);
assert.deepEqual(p8.slice(-1), [12]);
assert.deepEqual(p9.slice(0, 5), [26, 7, 25, 6, 11]);
assert.equal(p13Start, 1065);

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), redWords.flat());
const products = redWords.map(w => w.reduce((a, v) => a * v % 29, 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const taps = products.map(v => v % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

const runeSet = new Set(source.runes);
const stops = [];
const hyphens = new Set();
let runePosition = 0;
for (const glyph of transcript[8]) {
  if (runeSet.has(glyph)) runePosition++;
  else if (runePosition > 12 && runePosition < 255) {
    if (glyph === ".") stops.push(runePosition - 12);
    if (glyph === "-") hyphens.add(runePosition - 12);
  }
}
assert.equal(runePosition, 255);
assert.deepEqual(stops, [28, 122, 208]);
assert(hyphens.has(87));

/** @param {number[]} key @returns {number[]} */
function primitiveSequence(key) {
  const output = [];
  let state = key.slice();
  for (let i = 0; i < 242; i++) {
    output.push(state[0]);
    state = state.slice(1).concat([taps.reduce((v, x, j) => v + x * state[j], 0) % 3]);
  }
  assert.deepEqual(state, key);
  return output;
}
const seq = primitiveSequence(taps);
const zeroInsertions = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => seq[(i + j) % 242] === 0)) {
    zeroInsertions.push((i + 4) % 242);
  }
}
assert.deepEqual(zeroInsertions, [87, 208]);

/** @param {number} insertion @returns {number[]} */
function sourceAddressedTable(insertion) {
  const trits = [...seq.slice(0, insertion), 0, ...seq.slice(insertion)];
  const table = Array(243);
  for (let i = 0; i < 243; i++) {
    let address = 0;
    for (let j = 0; j < 5; j++) address = 3 * address + trits[(i + j) % 243];
    assert.equal(table[address], undefined);
    table[address] = black[i];
  }
  assert(table.every(Number.isInteger));
  return table;
}

/** @param {number[]} xs @returns {number} */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}
/**
 * @param {number[]} xs Plaintext when encrypt is true, ciphertext otherwise.
 * @param {number[]} table Original p8 black243 placed at source GF3 state addresses.
 * @param {"cube"|"overwriteC"|"overwriteP"} update Writable table transition.
 * @param {1|-1} sign Encryption sign: C = P + sign*T[address] modulo29.
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(xs, table, update, sign, encrypt) {
  const mutable = table.slice();
  const history = p8.slice(-5);
  const out = [];
  for (const x of xs) {
    const address = history.slice(-5).reduce((v, rune) => 3 * v + rune % 3, 0);
    const key = mutable[address];
    const y = (x + (encrypt ? sign : -sign) * key + 29) % 29;
    out.push(y);
    const cipher = encrypt ? y : x;
    const plain = encrypt ? x : y;
    if (update === "cube") mutable[address] = key * key * key % 29;
    else if (update === "overwriteC") mutable[address] = cipher;
    else mutable[address] = plain;
    history.push(cipher);
  }
  return out;
}

const result = [];
for (const splice of [208, 87]) {
  const table = sourceAddressedTable(splice);
  for (const update of ["cube", "overwriteC", "overwriteP"]) {
    for (const sign of [1, -1]) {
      const recovered = transform(target, table, update, sign, false);
      const reconstructed = transform(recovered, table, update, sign, true);
      assert.deepEqual(reconstructed, target);
      const planted = transform(positive, table, update, sign, true);
      assert.deepEqual(transform(planted, table, update, sign, false), positive);
      const whole = ioc(recovered);
      const first300 = ioc(recovered.slice(0, 300));
      const heldP13 = ioc(recovered.slice(p13Start, p13Start + 200));
      result.push({
        splice, update, sign,
        wholeIoC: Number(whole.toFixed(8)),
        first300IoC: Number(first300.toFixed(8)),
        untouchedP13First200IoC: Number(heldP13.toFixed(8)),
        first30GP: recovered.slice(0, 30).map(x => source.translit[x]).join("."),
        originalForwardReplay: reconstructed.length,
        nativeSolvedP57Plant: positive.length
      });
    }
  }
}
assert.equal(result.length, 12);
assert(result.every(x => x.wholeIoC >= 0.033 && x.wholeIoC <= 0.036));
console.log(JSON.stringify({
  source: "2014 p7 red14 + p8 red12/black243; p8 last one-rune fragment continues with first 5 p9 runes",
  redWordIndexProducts: products,
  primitiveGF3Taps: taps,
  sourcePunctuation: { blackSentenceStops: stops, blackHyphenAt: 87 },
  zeroSplices: zeroInsertions,
  selectedSplice: 208,
  original: {
    p9ToP14Runes: target.length,
    IoC: ioc(target),
    first300IoC: ioc(target.slice(0, 300)),
    separateP13First200IoC: ioc(source.pages[13].indices.slice(0, 200))
  },
  result,
  decision: "No original native-GP plaintext recovered under these twelve fixed, exactly reversible mutable-source-table variants"
}, null, 2));
