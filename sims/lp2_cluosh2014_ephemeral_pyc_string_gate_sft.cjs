"use strict";
/**
 * Reproduce a finite original-2014 uninspected Python 3.4 bytecode source gate.
 * Acquires only immutable 2014 Git objects, verifies Git blob hashes, and
 * identifies readable bytecode strings absent from the adjacent source.
 * Node.js 22 CommonJS. Run on GitHub Actions with network.
 */
const assert = require("node:assert/strict");
const https = require("node:https");
const crypto = require("node:crypto");

const repo = "kenorb-contrib/cicada_toolset";
const sourceSha = "07986e6af873925974c339ba4feef720a54189f3";
const bytecodeSha = "06d8c0ae1d178a596b21268f0d33934ad76d4ef3";
const endpoint = (sha) => "https://api.github.com/repos/" + repo + "/git/blobs/" + sha;

/** @param {string} url @returns {Promise<object>} */
function retrieve(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {"User-Agent": "lp2-2014-source-blob-gate",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"}
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const bytes = Buffer.concat(chunks);
        if (response.statusCode !== 200) {
          reject(new Error("GitHub API " + response.statusCode +
            " " + bytes.toString("utf8").slice(0, 250)));
          return;
        }
        resolve(JSON.parse(bytes.toString("utf8")));
      });
    }).on("error", reject);
  });
}

/** @param {string} sha @returns {Promise<Buffer>} */
async function exactGitBlob(sha) {
  const obj = await retrieve(endpoint(sha));
  assert.equal(obj.sha, sha);
  assert.equal(obj.encoding, "base64");
  const buf = Buffer.from(obj.content.replace(/\s/g, ""), "base64");
  assert.equal(buf.length, obj.size);
  const gitHash = crypto.createHash("sha1")
    .update(Buffer.from("blob " + buf.length + "\0", "ascii"))
    .update(buf).digest("hex");
  assert.equal(gitHash, sha);
  return buf;
}

/**
 * @param {Buffer} bytes
 * @returns {string[]}
 */
function asciiRuns(bytes) {
  const strings = bytes.toString("latin1").match(/[\x20-\x7e]{4,}/g) || [];
  return [...new Set(strings)].sort();
}

async function main() {
  const [originalPy, originalPyc] = await Promise.all([
    exactGitBlob(sourceSha), exactGitBlob(bytecodeSha)]);
  assert.equal(originalPyc.length, 7145);
  const source = originalPy.toString("utf8");
  const strings = asciiRuns(originalPyc);
  const unmatched = strings.filter((s) => !source.includes(s));
  console.log(JSON.stringify({
    provenance: "unchanged source and ephemeral one-commit 2014 Python 3.4 bytecode",
    commit: "f51794424f",
    sourceSha,
    sourceBytes: originalPy.length,
    bytecodeSha,
    pycBytes: originalPyc.length,
    pycMagicHex: originalPyc.subarray(0, 4).toString("hex"),
    printableStringsUnique: strings.length,
    stringsNotLiteralSourceSubstrings: unmatched,
    bytesAfterPycHeader: originalPyc.length - 12,
    recoveredUnknownLP2Key: false,
    interpretation: "Unmatched strings may be generated identifiers or code-object metadata; require genuine original decoder before asserting a key"
  }, null, 2));
}
main().catch((err) => {console.error(err); process.exitCode = 1;});
