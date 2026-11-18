"use strict";
/**
 * 2013 first-onion historical "primes" omission and LP2 32x8 table.
 * One fixed, reversible, source-driven 76-prime p55 inverse and one
 * 180-prime historical XOR receiver. No tuned offset, clock or password.
 *
 * Source for the 2013 transcript:
 * https://github.com/neuroretransmit/cicada/blob/master/2013/004-first-onion/README.md
 * This is a retrospective archive, NOT independently authenticated as
 * first-party telnet output.
 *
 * Native Windows 11 / Node 22 / CJS; run from any directory. Read-only.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}
const gp = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const table = grid.pages.flatMap(page => page.bytes);
assert.equal(table.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(table)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const page = number => gp.pages.find(p => p.page === number).indices;
/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
}
const first = [];
for (let n = 2; first.length < 256; n++) if (isPrime(n)) first.push(n);
assert.equal(first[19], 71);
assert.equal(first[20], 73);
assert.equal(first[199], 1223);
assert.equal(first[200], 1229);
assert.equal(first[255], 1619);
const omitted = first.slice(20, 200);
const exposed = first.slice(0, 20).concat(first.slice(200, 256));
assert.equal(omitted.length, 180);
assert.equal(exposed.length, 76);
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} xs */
function indexOfCoincidence(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (xs.length * (xs.length - 1));
}
const c55 = page(55), c56 = page(56), p57 = page(57);
assert.equal(c55.length, 76);
assert.equal(c56.length, 85);
assert.equal(p57.length, 95);
let cursor = 0;
const p56 = c56.map((value, i) => i === 56 ? value :
  mod(value - (first[cursor++] - 1)));
assert.equal(cursor, 84);
assert.equal(p56.map(i => gp.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

/* The literal 2013 "number" response marks reverse-primes with '+'. */
const direction = exposed.map(value =>
  isPrime(Number(String(value).split("").reverse().join(""))) ? 1 : -1);
assert.equal(direction.filter(s => s === 1).length, 35);
/** @param {number[]} cipher @param {-1|1} decryptSign */
function decode(cipher, decryptSign) {
  return cipher.map((value, i) =>
    mod(value + decryptSign * direction[i] * (exposed[i] - 1)));
}
/** @param {number[]} plain @param {-1|1} decryptSign */
function encode(plain, decryptSign) {
  return plain.map((value, i) =>
    mod(value - decryptSign * direction[i] * (exposed[i] - 1)));
}
const inverseOutcomes = [-1, 1].map(decryptSign => {
  const candidate = decode(c55, decryptSign);
  assert.deepEqual(encode(candidate, decryptSign), c55);
  const plant = p57.slice(0, 76);
  assert.deepEqual(decode(encode(plant, decryptSign), decryptSign), plant);
  return {
    decryptSign,
    ioc: indexOfCoincidence(candidate),
    first48Transliterated: candidate.slice(0, 48).map(i => gp.translit[i]).join("")
  };
});
assert.ok(Math.abs(inverseOutcomes[0].ioc - 0.03263157894736842) < 1e-12);
assert.ok(Math.abs(inverseOutcomes[1].ioc - 0.03543859649122807) < 1e-12);

/* Historical source operations XOR raw binary bytes with another file. */
const inner = Array.from({length:30}, (_,r) =>
  Array.from({length:6}, (_,c) => table[(r+1)*8+c+1])).flat();
const known = p56.concat(p57);
assert.equal(inner.length, 180);
assert.equal(known.length, 180);
/** @param {number} x */
function bitCount(x) {
  let n = 0;
  for (; x; x &= x - 1) n++;
  return n;
}
/** @param {(i:number)=>number} raw */
function evaluate(raw) {
  let equal = 0, differingBits = 0;
  for (let i = 0; i < inner.length; i++) {
    const d = inner[i] ^ raw(i);
    if (d === 0) equal++;
    differingBits += bitCount(d);
  }
  return {equal, differingBits};
}
const primeWeightXor = evaluate(i => (omitted[i] & 255) ^ gp.prime[known[i]]);
const gpIndexXor = evaluate(i => (omitted[i] & 255) ^ known[i]);
assert.deepEqual(primeWeightXor, {equal:0,differingBits:694});
assert.deepEqual(gpIndexXor, {equal:1,differingBits:745});

// The 2013 resumption prime 1229 independently selects exactly one original
// p50 printed row by its sum. An alternative source-facing consumer of that
// eight-byte row is the 16 complete words on p55 (two passes of 8 words).
// The first p55 rune is an incoming p54 carried-word fragment: preserve it.
const selectedRow = table.slice(29 * 8, 30 * 8);
assert.deepEqual(selectedRow, [106, 234, 196, 121, 238, 32, 129, 173]);
assert.equal(selectedRow.reduce((a, b) => a + b, 0), 1229);
assert.equal(table.filter((_, i) => i % 8 === 0).length, 32);
const p55PhysicalWordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(p55PhysicalWordLengths.reduce((s, n) => s + n, 0), 76);
assert.equal(p55PhysicalWordLengths.length - 1, 16);
/**
 * Literal whole-word keying with the row. Source page carry is untouched.
 * @param {number[]} input
 * @param {-1|1} sign
 * @param {boolean} reversed
 */
function wordRowTransform(input, sign, reversed) {
  let cursor = 1;
  const out = [input[0]];
  const decodedWords = [gp.translit[input[0]]];
  for (let w = 1; w < p55PhysicalWordLengths.length; w++) {
    const keyColumn = reversed ? 7 - (w - 1) % 8 : (w - 1) % 8;
    const key = selectedRow[keyColumn];
    const decoded = input.slice(cursor, cursor + p55PhysicalWordLengths[w])
      .map(v => mod(v + sign * key));
    decodedWords.push(decoded.map(v => gp.translit[v]).join(""));
    out.push(...decoded);
    cursor += p55PhysicalWordLengths[w];
  }
  assert.equal(cursor, 76);
  return {out, decodedWords};
}
const p55Word1229 = [];
for (const sign of [-1, 1]) for (const reversed of [false, true]) {
  const plain = wordRowTransform(c55, sign, reversed);
  assert.deepEqual(wordRowTransform(plain.out, -sign, reversed).out, c55);
  const native = p57.slice(0, 76);
  const fake = wordRowTransform(native, -sign, reversed);
  assert.deepEqual(wordRowTransform(fake.out, sign, reversed).out, native);
  p55Word1229.push({
    sign, reversed,
    ioc: indexOfCoincidence(plain.out),
    firstEightWords: plain.decodedWords.slice(0, 8).join(" ")
  });
}
assert.deepEqual(p55Word1229.map(row => row.ioc), [
  0.03508771929824561, 0.03684210526315789,
  0.036491228070175435, 0.03368421052631579
]);

console.log(JSON.stringify({
  status:"PASS",
  source:"2013 telnet prime omission (retrospective archive) + original LP2",
  omittedPrimes:"prime ordinals 21 through 200: 73 to 1223",
  exposedPrimes:"prime ordinals 1 through 20 and 201 through 256: 76 terms",
  p56AuthenticPhiPrimePositive:true,
  p57Planted76ReversePositive:true,
  p55OriginalIoC:indexOfCoincidence(c55),
  signedPhi76WholePage:inverseOutcomes,
  inner180XorPrimeWeights:primeWeightXor,
  inner180XorGpIndices:gpIndexXor,
  p55Row1229WholeWordKey:p55Word1229,
  result:"No original unknown plaintext or table-key relation; these locked transfers fail."
},null,2));
