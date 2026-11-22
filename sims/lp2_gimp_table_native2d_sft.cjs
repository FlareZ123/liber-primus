"use strict";
/** LP2 table as GIMP 2.8 native two-dimensional random field.
 * Single runnable test: node sims/lp2_gimp_table_native2d_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const data = JSON.parse(fs.readFileSync(path.join(__dirname,
  "..", "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
assert.deepEqual(data.pages.map((p) => p.rows), [10, 13, 9]);
assert.equal(data.bytes.length, 256);
assert.deepEqual(data.pages.flatMap((p) => p.bytes), data.bytes);
assert.equal(crypto.createHash("sha256").update(Buffer.from(data.bytes))
  .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} seed @returns {() => number} */
function mt19937(seed) {
  const state = new Uint32Array(624);
  state[0] = seed >>> 0;
  for (let i = 1; i < 624; i++)
    state[i] = (Math.imul(1812433253,
      state[i - 1] ^ (state[i - 1] >>> 30)) + i) >>> 0;
  let at = 624;
  return () => {
    if (at === 624) {
      for (let j = 0; j < 624; j++) {
        const y = ((state[j] & 0x80000000) |
          (state[(j + 1) % 624] & 0x7fffffff)) >>> 0;
        state[j] = (state[(j + 397) % 624] ^
          (y >>> 1) ^ ((y & 1) ? 0x9908b0df : 0)) >>> 0;
      }
      at = 0;
    }
    let v = state[at++];
    v ^= v >>> 11;
    v ^= (v << 7) & 0x9d2c5680;
    v ^= (v << 15) & 0xefc60000;
    v ^= v >>> 18;
    return v >>> 0;
  };
}
const master = mt19937(314159265);
const seeds = Array.from({length:4096}, () => master());
assert.deepEqual(seeds.slice(0, 8), [
  3721122731, 618219707, 807213306, 3144837749,
  3447982176, 3230631767, 755972506, 1398685501
]);
const firstRow = mt19937(seeds[0]);
assert.deepEqual(Array.from({length:8}, () => firstRow()), [
  505524582, 4277517655, 1702989131, 912900261,
  1432505218, 4108960502, 2270003630, 316039421
]);
const field = Array.from({length:32}, (_, row) => {
  const next = mt19937(seeds[row]);
  return Array.from({length:32}, () => next());
});
/** @param {number} x @param {string} mode @returns {number} */
function byte(x, mode) {
  switch (mode) {
    case "low": return x & 255;
    case "middle": return (x >>> 16) & 255;
    case "high": return x >>> 24;
    case "range255": return x % 255;
    default: throw new Error("unknown projection");
  }
}
/** @param {string} axes @param {string} mode @returns {number[]} */
function predicted(axes, mode) {
  return data.bytes.map((_, i) => {
    const row = Math.floor(i / 8), col = i % 8;
    return byte(axes === "row=y" ? field[row][col] : field[col][row], mode);
  });
}
const modes = ["low", "middle", "high", "range255"];
const expected = {"row=y":[1,1,1,2], "row=x":[0,2,0,0]};
for (const axes of ["row=y","row=x"]) for (let j = 0; j < modes.length; j++) {
  const model = predicted(axes,modes[j]);
  const matches = model.flatMap((v,i) => v === data.bytes[i] ? [i] : []);
  assert.equal(matches.length, expected[axes][j]);
  assert.equal(model.filter((v,i) => v === predicted(axes,modes[j])[i]).length, 256);
  console.log(JSON.stringify({axes, byteMode:modes[j], matches,
    originalCount:matches.length, positiveGridCount:256}));
}
assert(data.bytes.includes(255));
console.log("Original field matches chance; no original key or plaintext.");
