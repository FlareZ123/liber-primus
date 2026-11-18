"use strict";

/**
 * Director #1610: exact-host historical search for the frozen candidate
 * nz77w2upkfkyj4rh.onion.
 *
 * The workflow supplies:
 *   1) a liber-primus checkout fixed before Agent15 derived the candidate;
 *   2) the pinned neuroretransmit contemporaneous archive.
 *
 * Search is exact and case-insensitive. No neighboring labels are generated.
 * Node.js 22, CommonJS, standard library only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const {TextDecoder} = require("node:util");

const needle = "nz77w2upkfkyj4rh.onion";
const roots = process.argv.slice(2).map(value => path.resolve(value));
assert.ok(roots.length >= 2);
const decoder = new TextDecoder("utf-8", {fatal: true});

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** @param {string} root */
function exactMatches(root) {
  const matches = [];
  let scannedFiles = 0;
  let decodedTextFiles = 0;
  for (const file of walk(root)) {
    scannedFiles++;
    let text;
    try {
      text = decoder.decode(fs.readFileSync(file));
    } catch {
      continue;
    }
    decodedTextFiles++;
    const lower = text.toLowerCase();
    let at = lower.indexOf(needle);
    while (at >= 0) {
      const prefix = text.slice(0, at);
      const line = prefix.split(/\r?\n/u).length;
      matches.push({
        path: path.relative(root, file).replaceAll("\\", "/"),
        line,
        excerpt: text.slice(Math.max(0, at - 90), Math.min(text.length, at + needle.length + 90))
          .replace(/[\r\n]+/gu, " ")
      });
      at = lower.indexOf(needle, at + 1);
    }
  }
  return {root, scannedFiles, decodedTextFiles, matches};
}

/**
 * Query the Internet Archive CDX index for the exact host and subpaths.
 * Failure is recorded as an archival limitation rather than converted to a hit.
 * @returns {Promise<object>}
 */
function waybackCdx() {
  const url = "https://web.archive.org/cdx/search/cdx?url=" +
    encodeURIComponent(needle + "/*") +
    "&output=json&fl=timestamp,original,statuscode,mimetype,digest&filter=statuscode:200";
  return new Promise(resolve => {
    const request = https.get(url, {
      headers: {"User-Agent": "liber-primus-research exact-host audit"}
    }, response => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => {
        if (body.length < 2_000_000) body += chunk;
      });
      response.on("end", () => {
        let rows = null;
        try {
          rows = JSON.parse(body);
        } catch {}
        const historicalRows = Array.isArray(rows)
          ? rows.slice(1).filter(row => String(row[0] || "") <= "20161231235959")
          : [];
        resolve({
          requestedUrl: url,
          statusCode: response.statusCode,
          parsedJson: Array.isArray(rows),
          allRows: Array.isArray(rows) ? Math.max(0, rows.length - 1) : null,
          through2016Rows: historicalRows
        });
      });
    });
    request.setTimeout(20_000, () => request.destroy(new Error("timeout")));
    request.on("error", error => resolve({
      requestedUrl: url,
      error: String(error.message || error)
    }));
  });
}

(async () => {
  const corpora = roots.map(exactMatches);
  const cdx = await waybackCdx();
  const totalMatches = corpora.reduce((sum, corpus) => sum + corpus.matches.length, 0);
  assert.equal(totalMatches, 0, "pre-2026 exact host occurrence found in bounded local corpora");
  console.log(JSON.stringify({
    needle,
    corpora,
    internetArchiveCdx: cdx,
    decision: totalMatches === 0
      ? "NO EXACT MATCH in bounded pre-candidate/pinned corpora"
      : "EXACT MATCH REQUIRES SOURCE-LINEAGE REVIEW"
  }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
