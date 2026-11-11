"use strict";

/**
 * Exact 2014 signed-handoff whitespace / Onion7-HTML source gate.
 * Original signed armor and a May-2014 pinned archival HTML index.
 * Source relationship only: this does not identify an LP2 decipherment.
 *
 * Run: node sims/cicada2014_signed19_onion7_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8");
}

/** @param {string} contents */
function gitBlobSha(contents) {
  const bytes = Buffer.from(contents, "utf8");
  const head = Buffer.from("blob " + bytes.length + "\0", "ascii");
  return crypto.createHash("sha1").update(head).update(bytes).digest("hex");
}

const signed = read("resources/historical/cicada2014-stage11-message.asc");
const html = read("resources/external/cicada2014-stage11-onion7-original-index.html");

assert.equal(gitBlobSha(signed), "e2b7382ac2cfb0adfe028cc063fc6048e0ad718e");
assert.equal(gitBlobSha(html), "303db130705f0ef9be2a738f4336d5cfcebde80c");
assert.match(signed, /^-----BEGIN PGP SIGNED MESSAGE-----\r?\nHash: SHA1/m);
assert.ok(signed.includes("ky2khlqdf7qdznac.onion"));

/**
 * Each nonblank line can carry leading and trailing runs separately.
 * Entirely blank lines carry one run, counted once.
 *
 * @param {string} message
 * @returns {number[]}
 */
function whitespaceRuns(message) {
  const contentStart = message.indexOf("\n\n");
  const contentEnd = message.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.ok(contentStart > 0 && contentEnd > contentStart);
  const lines = message.slice(contentStart + 2, contentEnd).split(/\r?\n/);
  const result = [];
  for (const line of lines) {
    const leading = (line.match(/^ */) || [""])[0].length;
    const trailing = (line.match(/ *$/) || [""])[0].length;
    if (line.trim() === "") {
      if (leading) result.push(leading);
    } else {
      if (leading) result.push(leading);
      if (trailing) result.push(trailing);
    }
  }
  return result;
}

const found = whitespaceRuns(signed);
assert.deepEqual(found, [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37]);
const first12Primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
const missing = first12Primes.filter((value) => !found.includes(value));
assert.deepEqual(missing, [19]);

const titleMatch = html.match(/<title>(\d+)<\/title>/);
const divMatch = html.match(/<div id="(\d+)"/);
assert.ok(titleMatch && divMatch);
const title = Number(titleMatch[1]);
const divId = Number(divMatch[1]);
const images = [...html.matchAll(/src="(\d+)\.jpg"/g)].map((m) => Number(m[1]));
assert.equal(images.length, 58);
assert.deepEqual(images, Array.from({length: 58}, (_, i) => i));
assert.equal(title, 133);
assert.equal(divId, 331);
assert.equal(Number(String(title).split("").reverse().join("")), divId);
assert.equal(title, 7 * missing[0]);

/**
 * OpenPGP cleartext signatures strip trailing whitespace before hashing,
 * per RFC 4880 section 7.1. An all-space line is therefore an unsigned
 * presentation channel even when the armored signature verifies.
 * @param {string} armored
 */
function canonicalBody(armored) {
  const start = armored.indexOf("\n\n");
  const end = armored.indexOf("-----BEGIN PGP SIGNATURE-----");
  return armored.slice(start + 2, end).split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+$/g, "")).join("\r\n");
}

// Altering a whitespace-only line can introduce "19" while preserving
// the exact signed canonical content. This bounds the evidence strength.
const unsignedWhitespaceMutation = signed.replace("\n   \n", "\n                   \n");
assert.notEqual(unsignedWhitespaceMutation, signed);
assert.notDeepEqual(whitespaceRuns(unsignedWhitespaceMutation), found);
assert.equal(canonicalBody(unsignedWhitespaceMutation), canonicalBody(signed));

// Changing the five-space INDENT before the address changes signed content.
const wrong = signed.replace(/     ky2khlqdf7qdznac\.onion/, "    ky2khlqdf7qdznac.onion");
assert.notDeepEqual(whitespaceRuns(wrong), found);
assert.notEqual(canonicalBody(wrong), canonicalBody(signed));

console.log(JSON.stringify({
  status: "PASS",
  signedSourceGitBlob: gitBlobSha(signed),
  indexSourceGitBlob: gitBlobSha(html),
  whitespaceRunLengths: found,
  uniqueOmittedPrime: missing[0],
  historicalOnion7Title: title,
  historicalOnion7DivId: divId,
  titleFactorization: "7 * 19",
  historicalImageCount: images.length,
  selectedCandidateImage: missing[0] + ".jpg",
  signatureBindsWhitespaceRunList: false,
  unsignedSpaceMutationPreservesCanonicalSignedBody: true,
  interpretation: "Exact cross-artifact number relation; no decoder or recovered LP2 plaintext",
}, null, 2));
