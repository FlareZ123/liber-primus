"use strict";

/**
 * Source-pinned LP2 p0–2 red-title/body boundary experiment.
 * Original p0 has two RED heading words of 8 and 5 runes and an exact
 * 13-dot chapter mark after source rune offset 13. Extract the 716-rune
 * black-body continuation and print the original historical layer-two
 * W/R/L input with either continuing previous ciphertext or mark reset.
 *
 * node sims/agent30_p0_red13_body716_source_sft.cjs continuity
 * node sims/agent30_p0_red13_body716_source_sft.cjs reset
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @typedef {{ indices: number[] }} RunePage */
/**
 * @param {RunePage[]} pages
 * @param {"continuity" | "reset"} mode
 * @returns {{n: number, prev: number, sha256: string, input: string}}
 */
function sourceWindow(pages, mode) {
  assert.ok(mode === "continuity" || mode === "reset");
  assert.deepEqual(pages.slice(0, 3).map((page) => page.indices.length), [262, 266, 201]);
  const chapter = pages.slice(0, 3).flatMap((page) => page.indices);
  assert.deepEqual(chapter.slice(0, 13), [15,8,18,3,6,19,27,0,15,26,18,21,5]);
  const body = chapter.slice(13);
  assert.equal(body.length, 716);
  const digest = crypto.createHash("sha256").update(Buffer.from(body)).digest("hex");
  assert.equal(digest, "3e6191f2f5ab96359d9dbc27b223bd17d565f0e2978254e4b63041b61b2ed689");
  const prev = mode === "continuity" ? chapter[12] : -1;
  return {
    n: body.length,
    prev,
    sha256: digest,
    input: "W body716_" + mode + " " + prev + "\nR " + body.join(" ") + "\nL \n",
  };
}

if (require.main === module) {
  const corpus = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
    "utf8"
  ));
  process.stdout.write(sourceWindow(corpus.pages, process.argv[2] || "continuity").input);
}

module.exports = { sourceWindow };
