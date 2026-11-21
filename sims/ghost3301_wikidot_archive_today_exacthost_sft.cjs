/**
 * Narrow independent archive.today/archive.ph gate for the historical alleged
 * pre-encryption Liber Primus rune PDFs. Director #1886. Read-only, no broad
 * site scans, no guessed binary paths, only exact-host search results.
 * Node.js 22, Windows-compatible, GitHub Actions.
 */
"use strict";

const { createHash } = require("node:crypto");
const HOST = "howwillyoutelltheworld.wikidot.com";
const URLS = [
  "https://archive.ph/search/?q=" + encodeURIComponent(HOST),
  "https://archive.is/search/?q=" + encodeURIComponent(HOST),
  "https://archive.today/search/?q=" + encodeURIComponent(HOST),
  "https://archive.ph/https://" + HOST + "/",
  "https://archive.is/https://" + HOST + "/"
];

/** @param {string} input @returns {string} */
function checksum(input) {
  return createHash("sha256").update(input).digest("hex");
}

/** @param {string} target @returns {Promise<void>} */
async function check(target) {
  try {
    const response = await fetch(target, {
      redirect: "follow",
      signal: AbortSignal.timeout(18000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LP2-public-historical-document-review/1.0)"
      }
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    const body = bytes.toString("utf8");
    const found = [...body.matchAll(/(?:href|src)\s*=\s*["']([^"'<>]{1,400})["']/giu)]
      .map(hit => hit[1])
      .filter(href => href.toLowerCase().includes(HOST));
    const binaries = found.filter(href => /\.(?:pdf|zip|txt|rune)(?:[#?]|$)/iu.test(href));
    console.log("ARCHIVE_TODAY_GATE", JSON.stringify({
      request: target,
      finalUrl: response.url,
      status: response.status,
      contentType: response.headers.get("content-type"),
      bytes: bytes.length,
      sha256: checksum(bytes),
      hostReferences: [...new Set(found)].slice(0, 30),
      sourceBinaryLinks: [...new Set(binaries)].slice(0, 30),
      textExcerpt: body.slice(0, 2400)
    }));
  } catch (error) {
    console.log("ARCHIVE_TODAY_BLOCKED", JSON.stringify({
      request: target,
      error: String(error)
    }));
  }
}

Promise.all(URLS.map(check)).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
