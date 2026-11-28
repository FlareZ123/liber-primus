'use strict';

const assert = require('assert');

const MOD = 29;
const INV2 = 15;
const state = Object.freeze({ K: 2, e: 3, q: 4, g: 5, a: 6, A: 8, b: 15, B: 19, p: 23 });
const fields = Object.entries(state);
const mod = (x) => ((x % MOD) + MOD) % MOD;

const reps = Array.from({ length: MOD }, () => []);
for (const [name, value] of fields) reps[value].push(name);
for (let i = 0; i < fields.length; i += 1) {
  for (let j = i; j < fields.length; j += 1) {
    const [aName, aValue] = fields[i];
    const [bName, bValue] = fields[j];
    reps[mod(aValue + bValue)].push(`${aName}+${bName}`);
  }
}
assert.deepStrictEqual(reps.map((x) => x.length > 0), Array(MOD).fill(true));
const canonical = reps.map((xs) => xs[0]);

function hPair(x, y) {
  return [mod(x - y), mod(x + y)];
}

function hPairInverse(difference, sum) {
  return [mod((difference + sum) * INV2), mod((sum - difference) * INV2)];
}

// H is a bijection on every rune pair because 2 is invertible modulo 29.
const hOutputs = new Set();
for (let x = 0; x < MOD; x += 1) {
  for (let y = 0; y < MOD; y += 1) {
    const h = hPair(x, y);
    hOutputs.add(`${h[0]},${h[1]}`);
    assert.deepStrictEqual(hPairInverse(h[0], h[1]), [x, y]);
  }
}
assert.strictEqual(hOutputs.size, MOD * MOD);

// For every scalar ciphertext/plaintext pair, the additive key is uniquely
// forced as C-P and gives exact replay. Vector uniqueness follows coordinatewise.
for (let cipher = 0; cipher < MOD; cipher += 1) {
  for (let plain = 0; plain < MOD; plain += 1) {
    const key = mod(cipher - plain);
    assert.strictEqual(mod(cipher - key), plain);
    assert.strictEqual(mod(plain + key), cipher);
    assert.ok(reps[key].length > 0);
  }
}

const corridor = new Map([
  [32, [2, 0, 4]],
  [33, [0, 27, 5, 12]],
  [34, [2, 2]],
  [35, [26, 3, 5, 2, 24]],
  [36, [25, 19, 27, 26]],
  [37, [19, 0, 2, 5]],
  [38, [16, 24, 23, 20, 0, 14]],
  [39, [14, 24, 10, 14, 19]],
  [40, [20, 20, 12, 6]],
  [41, [4, 10, 23, 8, 7, 19]],
  [42, [18, 25, 28, 3, 28, 25, 23]],
]);
for (const [page, vector] of corridor) {
  for (const value of vector) {
    assert.ok(reps[value].length > 0, `p${page} scalar ${value} lacks weak-grammar representation`);
  }
}

const FULL = (1 << MOD) - 1;
function rot29(mask, shift) {
  if (shift === 0) return mask >>> 0;
  const low = (mask << shift) & FULL;
  const high = mask >>> (MOD - shift);
  return (low | high) >>> 0;
}

const combo = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let totalSubsets = 0;
let saturatingSubsets = 0;
while (true) {
  let mask = 0;
  for (const x of combo) mask |= 1 << x;
  let cover = mask;
  for (const x of combo) cover |= rot29(mask, x);
  totalSubsets += 1;
  if ((cover & FULL) === FULL) saturatingSubsets += 1;

  let i = combo.length - 1;
  while (i >= 0 && combo[i] === MOD - combo.length + i) i -= 1;
  if (i < 0) break;
  combo[i] += 1;
  for (let j = i + 1; j < combo.length; j += 1) combo[j] = combo[j - 1] + 1;
}
assert.strictEqual(totalSubsets, 10015005);
assert.strictEqual(saturatingSubsets, 895083);

console.log('PASS lp2_p6_state_expression_saturation_sft');
console.log('state fields:', fields.map(([k, v]) => `${k}=${v}`).join(' '));
console.log('all 29 residues have a direct-or-pair-sum representation');
console.log('all 841 scalar C/P pairs have a unique exact additive key, and H has 841 distinct pair outputs');
console.log('canonical representations:');
for (let value = 0; value < MOD; value += 1) console.log(`${value}: ${canonical[value]}`);
console.log('corridor scalar coordinates checked:', [...corridor.values()].reduce((n, xs) => n + xs.length, 0));
console.log('9-subset exact baseline:', { totalSubsets, saturatingSubsets, fraction: saturatingSubsets / totalSubsets });
