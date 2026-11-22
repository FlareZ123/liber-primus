"use strict";

/**
 * SFT: compose the two independently established p23 return routes and
 * identify their shared checkpoints.
 */

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const prerequisites = [
  "sims/lp2_road_rise_readout_direction_cycle_sft.cjs",
  "sims/lp2_p23_origin_state_p33_handoff_sft.cjs",
  "sims/lp2_p33_p35_found_road_map_sft.cjs",
];

/**
 * @param {string} relativePath
 */
function run(relativePath) {
  const result = childProcess.spawnSync(
    process.execPath,
    [path.join(root, relativePath)],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 16 * 1024 * 1024,
    }
  );
  if (result.status !== 0) {
    process.stderr.write("\nFAILED PREREQUISITE: " + relativePath + "\n");
    process.stderr.write(result.stdout || "");
    process.stderr.write(result.stderr || "");
  }
  assert.equal(result.status, 0, "prerequisite failed: " + relativePath);
}

for (const script of prerequisites) run(script);

// ONE RISE / READ OUT branch.
const riseReadoutLoop = [23, 25, 28, 23];

// ORIGINAL / THEIR RISE / FOUND direction branch.
const originalFoundLoop = [23, 33, 35, 28, 0, 18, 23];

assert.equal(riseReadoutLoop[0], riseReadoutLoop.at(-1));
assert.equal(originalFoundLoop[0], originalFoundLoop.at(-1));

const shared = [...new Set(riseReadoutLoop)]
  .filter((page) => new Set(originalFoundLoop).has(page))
  .sort((a, b) => a - b);

assert.deepEqual(shared, [23, 28]);
assert.ok(!riseReadoutLoop.includes(32));
assert.ok(!originalFoundLoop.includes(32));

// Both routes are source-selected before the missing YOU word coordinate is
// needed. Their first moves out of p23 are distinct.
assert.equal(riseReadoutLoop[1], 25);
assert.equal(originalFoundLoop[1], 33);
assert.notEqual(riseReadoutLoop[1], originalFoundLoop[1]);

console.log("PASS p23/p28 two-checkpoint navigation core");
console.log(JSON.stringify({
  riseReadoutLoop,
  originalFoundLoop,
  shared,
  firstDestinations: [25, 33],
  missingYouPageUsed: false,
  prerequisites,
}, null, 2));
