"use strict";

/**
 * Original-source 729-rune-only positive-control gate for the existing
 * fixed 20-stream GP29 layer-two period-2..14 screen.
 *
 * This does not authorize the independent 272-rune p42 screen.
 * Run as a single test on Windows 11:
 * node sims/agent30_layer2_periodic_opening_control_gate.cjs controls.json
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const bytes = fs.readFileSync(process.argv[2]);
const digest = crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(
  digest,
  "56f38482d2a47fd88cbbef88a8f142c8d1fde553695476914567738e96a634a6",
  "control file must be from pinned original run 44062412799"
);
const controls = JSON.parse(bytes.toString("utf8"));
assert.equal(controls.periodic_litf0_pass, false);
assert.equal(controls.periodic_litf1_pass, false);
assert.deepEqual(controls.positive_control_lengths, [729, 272]);

const accepted = [];
for (const litf of [0, 1]) {
  const entries = controls["periodic_litf" + litf];
  assert.equal(entries.length, 2);
  for (const period of [6, 9]) {
    const entry = entries.find(x => x.label === "periodic_litf" + litf + "_m" + period);
    assert.ok(entry, "missing prespecified m" + period + " plant");
    const originalOpeningPlant = entry.checks.find(x => x.window === "plant_0");
    assert.ok(originalOpeningPlant);
    assert.equal(originalOpeningPlant.period, period);
    assert.equal(originalOpeningPlant.pass, true,
      "full 729-rune source-native plant must recover the injected stream/offset");
    assert.equal(originalOpeningPlant.candidate, true);
    assert.equal(originalOpeningPlant.best.item, "primes");
    assert.equal(originalOpeningPlant.best.inner, "m=" + period + " litf=" + litf);
    accepted.push({litf, period, score: originalOpeningPlant.best.score,
      actual_offset: originalOpeningPlant.best.offset});
  }
}
assert.equal(accepted.length, 4);
process.stdout.write(JSON.stringify({
  source_run_id: 44062412799,
  controls_sha256: digest,
  scope: "Original p0-p2 only, 729 GP29 runes; periods 2..14, source-fixed 20 streams",
  independently_planted_opening_controls: accepted,
  blocked_window: "p42 272-rune period search: no uniform m6/m9 power",
}, null, 2) + "\n");
