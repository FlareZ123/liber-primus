"use strict";

/**
 * SFT: frozen p29 -> p30-p33 third-derivative signed-initials gate.
 * Original precommit: workplace/agent5-2059-third-derivative-consecutive-pages-precommit.md
 *
 * Node.js 22 / CommonJS. Read-only. No third-party dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;

/**
 * Formal derivative of high-first polynomial over F29, then Horner evaluation.
 * @param {number[]} coefficients
 * @param {number} order
 * @param {number} root
 * @returns {number}
 */
function derivativeAt(coefficients, order, root) {
  let values = coefficients.slice();
  for (let k = 0; k < order; k += 1) {
    const degree = values.length - 1;
    values = values.slice(0, -1).map((c, i) => mod(c * (degree - i)));
  }
  return values.reduce((v, c) => mod(v * root + c), 0);
}

const root = 24;
const order = 3;
const pages = [29, 30, 31, 32, 33];
const results = pages.map((page) => {
  const record = corpus.pages.find((row) => row.page === page);
  assert.ok(record && record.indices.length === record.runic_count);
  const derivatives = [0, 1, 2, 3].map((k) =>
    derivativeAt(record.indices, k, root)
  );
  return {
    page,
    runes:record.indices.length,
    derivatives,
    thirdRune:corpus.translit[derivatives[order]]
  };
});

assert.deepEqual(results[0].derivatives, [0, 0, 25, 7]);
assert.deepEqual(results.slice(1).map((row) => row.derivatives[3]), [17, 27, 12, 19]);

const frozenPrediction = [15, 24, 26, 7]; // signed SEEK AND YOU WILL initials
const observed = results.slice(1).map((row) => row.derivatives[3]);
assert.notDeepEqual(observed, frozenPrediction);

console.log(JSON.stringify({
  status:"PASS",
  testedHypothesis:"FAILED",
  sourceRoot:root,
  sourceOrder:order,
  coefficients:"all original page GP29 indices, in printed order, high-first",
  frozenPrediction,
  observed,
  results
}, null, 2));
