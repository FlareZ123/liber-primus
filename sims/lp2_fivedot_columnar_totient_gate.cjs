"use strict";

/** Five-dot original-image columnar transposition + authentic prime-totient gate.
 * Run from repository root with Node.js 22:
 * node sims/lp2_fivedot_columnar_totient_gate.cjs
 *
 * The height-derived order is independently source-fixed by the black-dot image
 * census. This tests a historically motivated five-column reading and the known
 * p56 cipher; neither mechanism is asserted to be intended for unknown pages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
const GP = new Map(corpus.translit.map((s, i) => [s, i]));

/**
 * @param {string} text Native Shakespeare control
 * @returns {number[]} 29-symbol Gematria Primus indices
 */
function toGP(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (GP.has(pair)) {
        out.push(GP.get(pair));
        i += 2;
      } else {
        if (GP.has(word[i])) out.push(GP.get(word[i]));
        i++;
      }
    }
  }
  return out;
}

const shakespeare = toGP(reference);
assert.equal(shakespeare.length, 218800);
const bi = new Int32Array(29 * 29);
const tri = new Int32Array(29 * 29 * 29);
for (let i = 2; i < shakespeare.length; i++) {
  const p = 29 * shakespeare[i - 2] + shakespeare[i - 1];
  bi[p]++;
  tri[p * 29 + shakespeare[i]]++;
}

/** @param {number[]} a @returns {number} */
function score(a) {
  let sum = 0;
  for (let i = 2; i < a.length; i++) {
    const p = 29 * a[i - 2] + a[i - 1];
    sum += Math.log((tri[p * 29 + a[i]] + .5) / (bi[p] + 14.5));
  }
  return sum / (a.length - 2);
}

const primes = [];
for (let n = 2; primes.length < 500; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(n);
}

/**
 * @param {number[]} source 29-rune ciphertext
 * @param {number} literalMask Masks only positions where source cipher is F
 * @returns {number[]} Decrypted rune stream
 */
function totientDecode(source, literalMask) {
  let k = 0, f = 0;
  return source.map((v) => {
    if (v === 0 && ((literalMask >>> f++) & 1)) return 0;
    return ((v - (primes[k++] - 1)) % 29 + 29) % 29;
  });
}

/**
 * @param {number[]} source GP native plaintext
 * @returns {number[]} Prime-totient encrypted ciphertext, F always clocked
 */
function totientEncode(source) {
  return source.map((v, i) => (v + primes[i] - 1) % 29);
}

/** @param {number[]} a @param {number[]} order @returns {number[]} */
function columnarEncrypt(a, order) {
  const columns = Array.from({length: 5}, () => []);
  for (let i = 0; i < a.length; i++) columns[i % 5].push(a[i]);
  return order.flatMap((c) => columns[c]);
}

/** @param {number[]} a @param {number[]} order @returns {number[]} */
function columnarDecrypt(a, order) {
  const lengths = Array.from({length: 5},
    (_, c) => Math.floor(a.length / 5) + Number(c < a.length % 5));
  const cols = Array.from({length: 5}, () => []);
  let offset = 0;
  for (const c of order) {
    cols[c] = a.slice(offset, offset + lengths[c]);
    offset += lengths[c];
  }
  assert.equal(offset, a.length);
  const output = [];
  for (let r = 0; r < Math.ceil(a.length / 5); r++) {
    for (let c = 0; c < 5; c++) if (r < cols[c].length) output.push(cols[c][r]);
  }
  return output;
}

/** @param {number[]} source @returns {number[][]} */
function permutations(source) {
  if (source.length === 1) return [source];
  const out = [];
  for (let i = 0; i < source.length; i++) {
    for (const suffix of permutations(source.filter((_, j) => i !== j))) {
      out.push([source[i], ...suffix]);
    }
  }
  return out;
}

const orders = permutations([0, 1, 2, 3, 4]);
assert.equal(orders.length, 120);
const observations = [
  // Native image black-circle centroids in left-to-right x-order,
  // from the independent JPEG census, im-results/black-dot-template-reflections.md
  {page: 7, y: [3105.773, 3166.637, 2866.789, 3127.500, 2936.153],
    key: [2, 4, 0, 3, 1]},
  {page: 23, y: [568.227, 507.363, 807.211, 546.500, 737.939],
    key: [1, 3, 0, 4, 2]}
];

/**
 * @param {number[]} ciphertext
 * @param {"decrypt"|"encrypt"} operation
 * @param {number[]} order
 * @returns {{mask:number,score:number,plaintext:number[]}}
 */
function bestLiteralF(ciphertext, operation, order) {
  const shifted = operation === "decrypt"
    ? columnarDecrypt(ciphertext, order) : columnarEncrypt(ciphertext, order);
  const Fcount = shifted.filter((v) => v === 0).length;
  assert.ok(Fcount < 16, "Original scope requires a finite F mask budget");
  let best = {mask: 0, score: -Infinity, plaintext: []};
  for (let mask = 0; mask < 2 ** Fcount; mask++) {
    const plaintext = totientDecode(shifted, mask);
    const measure = score(plaintext);
    if (measure > best.score) best = {mask, score: measure, plaintext};
  }
  return best;
}

/** @param {number[]} a @returns {string} */
const translit = (a) => a.map((v) => corpus.translit[v]).join("");

function main() {
  for (const observation of observations) {
    const {page, y, key} = observation;
    const derived = [0, 1, 2, 3, 4].sort((a, b) => y[a] - y[b]);
    assert.deepEqual(derived, key, "height key must be image-selected");
    const ciphertext = corpus.pages[page].indices;
    for (const operation of ["decrypt", "encrypt"]) {
      const fitted = orders.map((order) => ({
        order: order.join(","), ...bestLiteralF(ciphertext, operation, order)
      })).sort((a, b) => b.score - a.score);
      const source = fitted.find((z) => z.order === key.join(","));
      const rank = fitted.indexOf(source) + 1;
      const reverse = operation === "decrypt" ? columnarEncrypt : columnarDecrypt;
      const forward = operation === "decrypt" ? columnarDecrypt : columnarEncrypt;
      assert.deepEqual(reverse(forward(ciphertext, key), key), ciphertext,
        "original transposition must be exact");
      console.log(JSON.stringify({
        page, operation, length: ciphertext.length, key, rank, total: orders.length,
        sourceScore: source.score, sourceLiteralFMask: source.mask,
        bestScore: fitted[0].score, sourceText: translit(source.plaintext).slice(0, 150)
      }));

      // Genuine-GP source text is withheld from the language-model training
      // interval, and the correct image-derived key is never fit to the plant.
      const original = shakespeare.slice(205000 + page * 200, 205000 + page * 200 + ciphertext.length);
      assert.equal(original.length, ciphertext.length);
      const innerCipher = totientEncode(original);
      const planted = reverse(innerCipher, key);
      const recovered = forward(planted, key);
      assert.deepEqual(totientDecode(recovered, 0), original,
        "independent native-GP plant must recover all plaintext symbols");
      assert.deepEqual(reverse(totientEncode(original), key), planted,
        "forward reencryption must recover exact planted ciphertext");
      const ranked = orders.map((order) => ({
        key: order.join(","), value: bestLiteralF(planted, operation, order).score
      })).sort((a, b) => b.value - a.value);
      console.log(JSON.stringify({
        plantPage: page, operation, plantSymbolsRecovered: original.length,
        expectedSourceKeyRank: ranked.findIndex((z) => z.key === key.join(",")) + 1,
        sourcePlantScore: score(original), bestPlantScore: ranked[0].value
      }));
    }
  }
}
if (require.main === module) main();
