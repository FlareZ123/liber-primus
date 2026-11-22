"use strict";

/**
 * Director #1693: verify what the pinned May 2014 participant archive actually
 * establishes about the p49-p51 numeral alphabet.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

const transcriptions = readJson(
  "resources/external/cicada2014-stage11-original-transcriptions.json"
);
const source = readJson("resources/cicada2014-sexagesimal-source.json");

const alphabet60 =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";

/** @param {string} token */
function decode60(token) {
  return alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
}

/** @param {string} raw */
function tokenBlock(raw) {
  const beforeBlank = raw.split(/\r?\n\r?\n/, 1)[0];
  return beforeBlank.trim().split(/\s+/);
}

const tokens = transcriptions.files.flatMap((file) => tokenBlock(file.raw_text));
assert.equal(tokens.length, 256);
assert.equal(source.decimal_values.length, 256);

const decoded = tokens.map(decode60);
assert.deepEqual(decoded, source.decimal_values);

assert.equal(tokens[0], "3N");
assert.equal(decoded[0], 203);
assert.equal(tokens[22], "0x");
assert.equal(decoded[22], 59);
assert.ok(tokens.includes("4F"));
assert.equal(decode60("4F"), 255);
assert.ok(tokens.includes("0g"));
assert.equal(decode60("0g"), 42);
assert.ok(tokens.includes("1O"));
assert.equal(decode60("1O"), 84);

const used = new Set(tokens.join(""));
assert.equal(used.has("f"), false);
assert.equal(
  [...alphabet60].filter((digit) => !used.has(digit)).join(""),
  "f"
);

assert.equal(
  source.upstream_2014_source.first_observed_commit,
  undefined
);
assert.equal(
  source.upstream_2014_source.archived_commit,
  "19d68fbb9cff1c06d52cc0add30285199c936282"
);
assert.equal(
  source.first_observed_commit,
  "a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462"
);
assert.equal(
  source.converter_source.includes("pack 'C'"),
  true
);

console.log("#1693 author-era p50 alphabet source audit");
console.log("2014 raw token count:", tokens.length);
console.log("all 256 raw tokens reproduce archived decimal values under conventional base60");
console.log("sample mappings:", {
  "3N": decode60("3N"),
  "0x": decode60("0x"),
  "4F": decode60("4F"),
  "0g": decode60("0g"),
  "1O": decode60("1O"),
});
console.log("sole unused conventional digit:", [...alphabet60].filter((d) => !used.has(d)));
console.log("earliest paired-source commit:", source.upstream_2014_source.archived_commit);
console.log("later byte-string commit:", source.first_observed_commit);
console.log(
  "PASS: conventional base60 is demonstrably a May-2014 participant interpretation; the archived converter only packs precomputed decimal lines and supplies no drop-f/base59 rule."
);
