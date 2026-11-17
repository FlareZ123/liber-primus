"use strict";

/**
 * Original p49–51 base59 functional-tree affine-fold known-plaintext gate.
 *
 * The strongest fixed source-native local linear form considered here is
 * y = a*sum(known child values) + b*node byte + c*node address
 *   + d*node degree + e  (mod 29).
 * All 29^5 secret coefficient vectors are handled by GF(29) rank, for
 * 24 source-natural leaf/internal layouts and two original byte readings.
 *
 * The p57 clear 95-rune text labels leaves; p56 contributes only its
 * independently authenticated 84 prime-clock-consuming plaintext runes.
 * All 76 candidate p55 internals and the unique root remain unobserved.
 *
 * Node.js 22, CommonJS, Windows 11:
 *   node sims/lp2_p50_base59_affine_tree_p56_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const here = path.join(__dirname, "..", "resources", "liber-primus");
/** @param {string} name @returns {any} */
const load = name => JSON.parse(fs.readFileSync(path.join(here, name), "utf8"));
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;

const grid = load("base60-grid.json");
const gp = load("lp2-corpus.json");
const cells = grid.rows.flat();
const standard = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const skipF = standard.replace("f", "");
assert.equal(cells.length, 256);
assert.equal(standard.length, 60);
assert.equal(skipF.length, 59);
assert.equal(grid.alphabet, standard);
const printed = cells.join("");
assert(!printed.includes("f"));
const byte60 = cells.map(t => 60 * standard.indexOf(t[0]) + standard.indexOf(t[1]));
const byte59 = cells.map(t => 59 * skipF.indexOf(t[0]) + skipF.indexOf(t[1]));
assert(byte59.every(x => x >= 0 && x < 256));
assert(byte60.every(x => x >= 0 && x < 256));
assert.equal(crypto.createHash("sha256").update(Buffer.from(byte60)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const root = 189;
const children = Array.from({length: 256}, () => []);
const indegree = Array(256).fill(0);
byte59.forEach((v, i) => {
  indegree[v]++;
  if (i !== v) children[v].push(i);
});
assert.deepEqual(byte59.flatMap((v, i) => v === i ? [i] : []), [root]);
const preorder = [];
const postorder = [];
/** @param {number} n */
function dfs(n) {
  preorder.push(n);
  for (const c of children[n]) dfs(c);
  postorder.push(n);
}
dfs(root);
assert.equal(new Set(preorder).size, 256);

const leaves = {
  address: Array.from({length:256}, (_, i) => i).filter(i => indegree[i] === 0),
  dfs: preorder.filter(i => indegree[i] === 0)
};
const internals = {
  address: Array.from({length:256}, (_, i) => i)
    .filter(i => indegree[i] > 0 && i !== root),
  dfs: preorder.filter(i => indegree[i] > 0 && i !== root),
  post: postorder.filter(i => indegree[i] > 0 && i !== root)
};
assert.equal(leaves.address.length, 95);
assert.equal(internals.address.length, 160);
assert.equal(gp.pages[55].indices.length, 76);
assert.equal(gp.pages[56].indices.length, 85);
assert.equal(gp.pages[57].indices.length, 95);

const clearP56 = [];
const phrase =
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const alphabet = gp.translit.map((name, i) => ({name, i}))
  .sort((a, b) => b.name.length - a.name.length);
for (const word of phrase.split(" ")) {
  for (let i = 0; i < word.length;) {
    const token = alphabet.find(t => word.startsWith(t.name, i));
    assert(token, "unencodable authentic plaintext at " + word.slice(i));
    clearP56.push(token.i);
    i += token.name.length;
  }
}
assert.equal(clearP56.length, 85);
assert.deepEqual(clearP56.flatMap((v, i) => v === 0 ? [i] : []), [56]);
const knownP56 = clearP56.filter(x => x !== 0);
assert.equal(knownP56.length, 84);

const primes = [];
for (let n = 2; primes.length < 84; n++) {
  let prime = true;
  for (let k = 2; k*k <= n; k++) if (n % k === 0) {
    prime = false;
    break;
  }
  if (prime) primes.push(n);
}
let clock = 0;
const reencrypted = clearP56.map(p =>
  p === 0 ? 0 : mod(p + primes[clock++] - 1));
assert.equal(clock, 84);
assert.deepEqual(reencrypted, gp.pages[56].indices);

/** @param {number[][]} source @returns {number} */
function rank(source) {
  assert(source.length > 0);
  const a = source.map(row => row.map(mod));
  let r = 0;
  for (let col = 0; col < a[0].length && r < a.length; col++) {
    let pivot = r;
    while (pivot < a.length && a[pivot][col] === 0) pivot++;
    if (pivot === a.length) continue;
    [a[pivot], a[r]] = [a[r], a[pivot]];
    let inverse = 1;
    while (mod(inverse * a[r][col]) !== 1) inverse++;
    assert(inverse < 29);
    for (let j = col; j < a[r].length; j++) {
      a[r][j] = mod(a[r][j] * inverse);
    }
    for (let i = 0; i < a.length; i++) {
      if (i === r) continue;
      const factor = a[i][col];
      for (let j = col; j < a[i].length; j++) {
        a[i][j] = mod(a[i][j] - factor * a[r][j]);
      }
    }
    r++;
  }
  return r;
}

/**
 * @param {number} n
 * @param {number[]} values
 * @param {number[]} salt
 * @returns {number[]}
 */
function features(n, values, salt) {
  const sum = children[n].reduce((s, c) => s + values[c], 0);
  return [mod(sum), mod(salt[n]), n % 29, children[n].length, 1];
}

/** @param {number[]} coefficients @param {number[]} vector @returns {number} */
const dot = (coefficients, vector) =>
  mod(coefficients.reduce((s, a, j) => s + a * vector[j], 0));

const fixedCoefficients = [3, 7, 11, 13, 17];
let cases = 0;
let incompatible = 0;
let plantedPositive = 0;
let minimumObserved = Infinity;
let maximumObserved = 0;
const rankPairs = new Map();
for (const leafOrder of Object.values(leaves)) {
  for (const internalOrder of Object.values(internals)) {
    for (const reverse of [false, true]) {
      for (const weights of ["index", "prime"]) {
        const known = Array(256).fill(-1);
        leafOrder.forEach((n, i) => {
          const rune = gp.pages[57].indices[reverse ? 94 - i : i];
          known[n] = weights === "index" ? rune : gp.prime[rune] % 29;
        });
        internalOrder.slice(76).forEach((n, i) => {
          const rune = knownP56[i];
          known[n] = weights === "index" ? rune : gp.prime[rune] % 29;
        });
        const observedNodes = internalOrder.slice(76).filter(
          n => children[n].every(c => known[c] >= 0));
        minimumObserved = Math.min(minimumObserved, observedNodes.length);
        maximumObserved = Math.max(maximumObserved, observedNodes.length);
        assert(observedNodes.length >= 55);

        for (const salt of [byte59, byte60]) {
          const matrix = observedNodes.map(n => features(n, known, salt));
          const y = observedNodes.map(n => known[n]);
          const r = rank(matrix);
          const augmented = rank(matrix.map((row, i) => [...row, y[i]]));
          const key = String(r) + "/" + String(augmented);
          rankPairs.set(key, (rankPairs.get(key) || 0) + 1);
          cases++;
          if (r !== augmented) incompatible++;

          // Independent planted model: generate all internal labels from the
          // unchanged p57 leaf symbols by the very rule being tested, then
          // re-hide the 76 p55 positions and require the p56-only constraint
          // matrix to accept the unknown planted coefficients.
          const plant = Array(256).fill(-1);
          leafOrder.forEach(n => plant[n] = known[n]);
          /** @param {number} n @returns {number} */
          function make(n) {
            if (plant[n] >= 0) return plant[n];
            for (const child of children[n]) make(child);
            plant[n] = dot(fixedCoefficients, features(n, plant, salt));
            return plant[n];
          }
          make(root);
          assert(plant.every(v => v >= 0 && v < 29));
          const masked = Array(256).fill(-1);
          leafOrder.forEach(n => masked[n] = plant[n]);
          internalOrder.slice(76).forEach(n => masked[n] = plant[n]);
          const positives = observedNodes.map(n => features(n, masked, salt));
          assert(positives.every((row, i) => dot(fixedCoefficients, row) === plant[observedNodes[i]]));
          assert.equal(rank(positives),
            rank(positives.map((row, i) => [...row, plant[observedNodes[i]]])));
          plantedPositive++;
        }
      }
    }
  }
}
assert.equal(cases, 48);
assert.equal(incompatible, 48);
assert.equal(plantedPositive, 48);
assert.deepEqual(Object.fromEntries(rankPairs), {"5/6": 48});
assert.equal(minimumObserved, 55);
assert.equal(maximumObserved, 83);
console.log(JSON.stringify({
  result: "PASS",
  originalSource: "LP2 pp49-51 original 256 table, p56 solved, p57 clear",
  graph: {root, leaves:95, nonrootInternals:160},
  p56: {plaintextRunes:85, consumedKeyRunes:84, literalFIndex:56,
    authenticReencryption:true},
  model: "y=a*childSum+b*originalNodeByte+c*nodeAddress+d*nodeDegree+e mod29",
  sourceLayouts:24, byteSaltReadings:2,
  coefficientKeysPerCase:29**5,
  cases, incompatible, ranks:Object.fromEntries(rankPairs),
  fullKnownParentConstraintsRange:[minimumObserved,maximumObserved],
  positiveControls:plantedPositive,
  unknownP55PlaintextRecovered:false
}, null, 2));
