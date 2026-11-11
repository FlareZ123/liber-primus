"use strict";

/**
 * Frozen source-page preimage gate for the solved LP2 p56 "AN END" hash.
 * Uses the original archived seventh-onion index as an exact byte candidate.
 * Run from the repository root: node sims/onion7_index_an_end_digest_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "resources", "cicada2014-onion7-index.html"));
const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const expectedBlob = "303db130705f0ef9be2a738f4336d5cfcebde80c";

/** @param {Buffer} data @param {string} algorithm @returns {string} */
function digest(data, algorithm) {
  return crypto.createHash(algorithm).update(data).digest("hex");
}

/** @param {Buffer} data @returns {string} */
function gitBlobSha(data) {
  return digest(Buffer.concat([
    Buffer.from(`blob ${data.length}\0`, "utf8"), data
  ]), "sha1");
}

assert.equal(source.length, 1640);
assert.equal(gitBlobSha(source), expectedBlob);
assert.match(target, /^[0-9a-f]{128}$/);
const variants = [
  {name:"original-lf", bytes:source},
  {name:"original-crlf", bytes:Buffer.from(source.toString("utf8").replace(/\n/g, "\r\n"))},
  {name:"trailing-whitespace-trim", bytes:Buffer.from(source.toString("utf8").trimEnd())}
];
const algorithms = ["sha512", "sha3-512", "blake2b512"];
const results = variants.flatMap(({name,bytes}) =>
  algorithms.map(algorithm => ({
    variant:name,
    bytes:bytes.length,
    algorithm,
    hash:digest(bytes, algorithm)
  }))
);
assert.equal(results.length, 9);
assert.equal(results.filter(x=>x.hash===target).length, 0);
assert.equal(results[0].hash,
  "83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31");
console.log(JSON.stringify({
  source:"resources/cicada2014-onion7-index.html",
  originalBytes:source.length,
  originalGitBlobSha:gitBlobSha(source),
  target,
  comparisons:results,
  matchingPreimages:0,
  conclusion:"Only the exact archived HTML and two documented newline variants are excluded as direct preimages of the p56 digest under the declared hash algorithms."
},null,2));
