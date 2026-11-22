"use strict";
/**
 * Exact original-source Blum-Blum-Shub known-interior -> unknown-rim inverse.
 * Historical operands: solved PARABLE prime clause sums 1259, 1031, 1229.
 * This is a deliberately conditional cipher test, not an established Cicada key.
 *
 * Node.js 22, CommonJS; read-only, with exhaustive 1,298,029-state search.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const tokens = corpus.translit.map((name, value) => ({ name, value }))
  .sort((a, b) => b.name.length - a.name.length);
const solvedSentence = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
/** @param {string} sentence */
function asGP(sentence) {
  const output = [];
  for (let word of sentence.split(" ")) {
    while (word.length) {
      const token = tokens.find(t => word.startsWith(t.name));
      assert.ok(token, "invalid known GP text");
      output.push(token.value);
      word = word.slice(token.name.length);
    }
  }
  return output;
}
const solved56 = asGP(solvedSentence);
const printed56 = corpus.pages[56].indices;
const clear57 = corpus.pages[57].indices;
const encrypted55 = corpus.pages[55].indices;
assert.equal(solved56.length, 85);
assert.equal(printed56.length, 85);
assert.equal(clear57.length, 95);
assert.equal(encrypted55.length, 76);
const knownRegisters = [
  { name: "solved-p56", text: solved56.concat(clear57) },
  { name: "printed-p56", text: printed56.concat(clear57) }
];
const rim = [];
for (let c = 0; c < 8; c++) rim.push(c);
for (let r = 1; r < 32; r++) rim.push(8 * r + 7);
for (let c = 6; c >= 0; c--) rim.push(8 * 31 + c);
for (let r = 30; r >= 1; r--) rim.push(8 * r);
const interior = [];
for (let r = 1; r <= 30; r++)
  for (let c = 1; c <= 6; c++) interior.push(8 * r + c);
assert.equal(rim.length, 76);
assert.equal(interior.length, 180);
assert.equal(new Set(rim.concat(interior)).size, 256);
assert.equal(interior[0], 9);
assert.equal(interior.at(-1), 246);
const p = 1031, q = 1259, n = p * q;
assert.equal(n, 1298029);
assert.equal(p % 4, 3);
assert.equal(q % 4, 3);
/** @param {number} value */
const mod29 = value => (value % 29 + 29) % 29;
/** @param {number} state */
const square = state => state * state % n;
/** @param {number} value @param {number} exp @param {number} prime */
function powmod(value, exp, prime) {
  let result = 1, factor = value;
  while (exp > 0) {
    if (exp % 2) result = result * factor % prime;
    factor = factor * factor % prime;
    exp = Math.floor(exp / 2);
  }
  return result;
}
/** @param {number} value */
const isUnitSquare = value =>
  value % p !== 0 && value % q !== 0 &&
  powmod(value % p, (p - 1) / 2, p) === 1 &&
  powmod(value % q, (q - 1) / 2, q) === 1;
/** @param {number} seed */
function stream(seed) {
  const out = [];
  let x = seed;
  for (let i = 0; i < 256; i++) {
    out.push(x);
    x = square(x);
  }
  return out;
}
/** @param {number} value @param {"minus"|"plus"|"xor"} operation */
function project(value, operation) {
  return operation === "xor" ? value & 255 : value % 29;
}
/** @param {number} cipher @param {number} plain @param {"minus"|"plus"|"xor"} operation */
function observedKey(cipher, plain, operation) {
  if (operation === "xor") return cipher ^ plain;
  return mod29(cipher + (operation === "minus" ? -plain : plain));
}
/** @param {number} plain @param {number} key @param {"minus"|"plus"|"xor"} operation */
function encode(plain, key, operation) {
  if (operation === "xor") return plain ^ key;
  return mod29(operation === "minus" ? plain + key : key - plain);
}
/** @param {number} cipher @param {number} key @param {"minus"|"plus"|"xor"} operation */
function decode(cipher, key, operation) {
  if (operation === "xor") return cipher ^ key;
  return mod29(operation === "minus" ? cipher - key : key - cipher);
}
/**
 * Every possible x_0 in [0,n) is checked. A source-state is accepted only
 * if all 180 known interior GP symbols match through all 256 clock positions.
 * Never ranks on the unknown perimeter. The BBS QR requirement is enforced
 * only when interpreting successful seeds as a complete reversible cipher.
 * @param {number[]} grid
 * @param {number[]} plainInterior
 * @param {"minus"|"plus"|"xor"} operation
 */
function scan(grid, plainInterior, operation) {
  const expected = interior.map((pos, i) =>
    observedKey(grid[pos], plainInterior[i], operation));
  const matchedAtLeast = Array(7).fill(0);
  const completeSeeds = [];
  let best = 0;
  for (let seed = 0; seed < n; seed++) {
    let x = seed;
    for (let j = 0; j < interior[0]; j++) x = square(x);
    if (project(x, operation) !== expected[0]) continue;
    matchedAtLeast[1]++;
    let count = 1, lastPosition = interior[0];
    for (let i = 1; i < interior.length; i++) {
      for (let j = lastPosition; j < interior[i]; j++) x = square(x);
      lastPosition = interior[i];
      if (project(x, operation) !== expected[i]) break;
      count++;
      if (count < matchedAtLeast.length) matchedAtLeast[count]++;
    }
    if (count > best) best = count;
    if (count === 180) completeSeeds.push(seed);
  }
  return { best, matchedAtLeast: matchedAtLeast.slice(1), completeSeeds };
}
const original = [];
for (const register of knownRegisters) {
  assert.equal(register.text.length, 180);
  for (const operation of ["minus", "plus", "xor"]) {
    const result = scan(bytes, register.text, operation);
    assert.equal(result.completeSeeds.length, 0);
    original.push({ register: register.name, operation,
      best: result.best, matchedAtLeast: result.matchedAtLeast });
  }
}
const byName = name => original.find(x => x.register + "-" + x.operation === name);
assert.equal(byName("solved-p56-minus").best, 3);
assert.equal(byName("solved-p56-plus").best, 4);
assert.equal(byName("solved-p56-xor").best, 2);
assert.equal(byName("printed-p56-minus").best, 5);
assert.equal(byName("printed-p56-plus").best, 3);
assert.equal(byName("printed-p56-xor").best, 2);
console.log("ORIGINAL FULL-STATE BBS GATE", JSON.stringify(original, null, 2));
// Construct source-shaped real 180 GP-plaintext plus a heldout 76-rune,
// completely hidden perimeter. Recover it from the interior alone.
const sourceSeed = 1229;
const trueInitial = sourceSeed * sourceSeed % n;
assert.equal(trueInitial, 212412);
assert.ok(isUnitSquare(trueInitial));
const plantedPlain = Array(256).fill(0);
for (let i = 0; i < 180; i++) plantedPlain[interior[i]] = knownRegisters[0].text[i];
for (let i = 0; i < 76; i++) plantedPlain[rim[i]] = clear57[i];
for (const operation of ["minus", "xor"]) {
  const key = stream(trueInitial).map(x => project(x, operation));
  const planted = plantedPlain.map((plain, i) => encode(plain, key[i], operation));
  const result = scan(planted, knownRegisters[0].text, operation);
  const valid = result.completeSeeds.filter(isUnitSquare);
  assert.deepEqual(valid, [trueInitial]);
  const recoveredKey = stream(valid[0]).map(x => project(x, operation));
  const recovered = planted.map((cipher, i) => decode(cipher, recoveredKey[i], operation));
  assert.deepEqual(recovered, plantedPlain);
  assert.deepEqual(rim.map(i => recovered[i]), clear57.slice(0, 76));
  assert.deepEqual(recovered.map((plain, i) => encode(plain, recoveredKey[i], operation)), planted);
  console.log("POSITIVE FULL UNKNOWN PERIMETER RECOVERY", JSON.stringify({
    operation, originalRawSeedSolutions: result.completeSeeds.length,
    quadraticResidueSolutions: valid.length, recoveredPerimeterRunes: 76,
    recoveredInteriorRunes: 180, initialState: valid[0]
  }));
}
