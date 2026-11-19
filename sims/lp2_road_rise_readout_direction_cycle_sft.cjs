"use strict";

/**
 * SFT: compose the independently tested ROAD -> RISE -> READ OUT ->
 * DIRECTION -> SEEK/AND -> ROAD route and assert its state closure.
 *
 * Each prerequisite remains responsible for its own local mechanism. This
 * file fails if any prerequisite regresses, then verifies the cross-route
 * authenticated-source indices and q + B = p center transition.
 */

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

const prerequisites = [
  "sims/lp2_p23_one_rise_plus2_p25_convergence_sft.cjs",
  "sims/lp2_2013_goodluck_p25_cube_route_sft.cjs",
  "sims/lp2_their_rise_h_rectangle_selector_sft.cjs",
  "sims/lp2_p28_numbers_direction_readout_sft.cjs",
  "sims/lp2_direction_seek_you_numbered_route_sft.cjs",
];

/**
 * @param {string} relativePath
 * @returns {string}
 */
function runPrerequisite(relativePath) {
  return childProcess.execFileSync(
    process.execPath,
    [path.join(root, relativePath)],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    }
  );
}

const prerequisiteOutputs = new Map();
for (const script of prerequisites) {
  prerequisiteOutputs.set(script, runPrerequisite(script));
}

const signed2016 = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({index, word: word.toUpperCase()}));

assert.equal(source.length, 43);

const indexOf = (word) => {
  const row = source.find((candidate) => candidate.word === word);
  assert.ok(row, "missing authenticated source word " + word);
  return row.index;
};
const indicesOf = (word) =>
  source.filter((candidate) => candidate.word === word).map((row) => row.index);

const their = indicesOf("THEIR");
assert.deepEqual(their, [19, 25]);

const state = Object.freeze({
  p: indexOf("ROAD"),
  q: indexOf("EMPTY"),
  B: their[0],
  a: their[1] - their[0],
});

assert.deepEqual(state, {p: 23, q: 4, B: 19, a: 6});
assert.equal((state.q + state.B) % 29, state.p);

// The authenticated source corridor consumed by the p28 readout and the
// numbered DIRECTION/SEEK/AND route.
assert.deepEqual(
  source.slice(25, 33).map((row) => row.word),
  ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION", "SEEK", "AND", "YOU"]
);

// Route nodes are project-page/source-index coordinates. The p25 cube
// prerequisite proves 25 -> 28; the p28 readout prerequisites prove the
// 28 -> source-DIRECTION continuation; the corrected numbered-route
// prerequisite proves the SEEK/AND center transition back to ROAD23.
const route = Object.freeze({
  road: state.p,
  oneRiseDestination: state.p + 2,
  cubeDestination: 28,
  the: 28,
  direction: 29,
  seek: 30,
  and: 31,
  missingYou: 32,
  returnedRoad: (state.q + state.B) % 29,
});

assert.deepEqual(route, {
  road: 23,
  oneRiseDestination: 25,
  cubeDestination: 28,
  the: 28,
  direction: 29,
  seek: 30,
  and: 31,
  missingYou: 32,
  returnedRoad: 23,
});
assert.equal(route.returnedRoad, route.road);
assert.ok(route.returnedRoad < route.missingYou);

// The p28 readout is contiguous in authenticated source order.
assert.deepEqual(
  source.slice(route.the, route.and + 1).map((row) => row.word),
  ["THE", "DIRECTION", "SEEK", "AND"]
);

console.log("PASS ROAD23 -> ONE RISE -> p25 -> p28 READ OUT -> DIRECTION -> SEEK/AND -> ROAD23");
console.log(JSON.stringify({
  state,
  route,
  sourceCorridor: source.slice(25, 33).map((row) => row.word),
  stateClosure: "q + B = p",
  prerequisites: prerequisites.map((script) => ({
    script,
    outputBytes: Buffer.byteLength(prerequisiteOutputs.get(script), "utf8"),
  })),
}, null, 2));
