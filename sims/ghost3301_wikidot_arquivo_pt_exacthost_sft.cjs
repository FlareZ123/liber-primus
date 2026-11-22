/**
 * Independent public archive backend for the exact alleged gHOST3301
 * pre-encryption-rune-PDF Wikidot source. Director issue #1886.
 *
 * Source scope: only howwillyoutelltheworld.wikidot.com and directly
 * indexed binaries/links. Never infer a PDF from an unavailable server.
 * Run with Node.js 22 on the existing manual Node22 SFT workflow.
 */
"use strict";

const { createHash } = require("node:crypto");

const host = "howwillyoutelltheworld.wikidot.com";
const checks = [
  { label: "root-http", target: "http://" + host + "/", matchType: "exact" },
  { label: "prefix-http", target: "http://" + host + "/*", matchType: "prefix" },
  { label: "prefix-https", target: "https://" + host + "/*", matchType: "prefix" },
];

/** @param {Uint8Array} data @returns {string} */
function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}

/** @param {string} url */
async function get(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(26000),
    headers: { "User-Agent": "LP2-exact-Wikidot-public-archive/1.0" },
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  return { status: response.status, bytes, mime: response.headers.get("content-type") };
}

/** @param {{label:string,target:string,matchType:string}} check */
async function query(check) {
  const url = new URL("https://arquivo.pt/wayback/cdx");
  url.searchParams.set("url", check.target);
  url.searchParams.set("matchType", check.matchType);
  url.searchParams.set("output", "json");
  url.searchParams.set("from", "2012");
  url.searchParams.set("to", "2020");
  url.searchParams.set("limit", "2000");
  try {
    const reply = await get(url.toString());
    const body = reply.bytes.toString("utf8");
    const rows = [];
    for (const line of body.split(/\r?\n/u)) {
      if (!line) continue;
      try {
        const data = JSON.parse(line);
        if (typeof data?.url !== "string") continue;
        const original = new URL(data.url);
        if (original.hostname.toLowerCase() !== host) continue;
        rows.push(data);
      } catch { /* A non-JSON error body is reported as statusBody. */ }
    }
    const ok = rows.filter(row => String(row.statuscode ?? row.status ?? "") === "200");
    const files = ok.filter(row => /\.(?:pdf|zip|doc|docx|txt|rune)(?:\?|$)/iu.test(row.url) ||
      /pdf|application\/zip|application\/octet-stream/iu.test(String(row.mimetype ?? row.mime ?? "")));
    const root = ok.filter(row => /^https?:\/\/howwillyoutelltheworld\.wikidot\.com\/?(?:\?.*)?$/iu.test(row.url));
    const sortedRoot = [...root].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
    const uniqueRoot = [];
    const digests = new Set();
    for (const item of sortedRoot) {
      const d = String(item.digest ?? "");
      if (digests.has(d)) continue;
      digests.add(d);
      uniqueRoot.push(item);
    }
    console.log("ARQUIVO_INDEX", JSON.stringify({
      check: check.label, url: url.toString(), status: reply.status,
      bytes: reply.bytes.length, sha256: sha(reply.bytes), rows: rows.length,
      successfulCaptures: ok.length, rootCaptures: root.length,
      uniqueRootDigests: uniqueRoot.length, fileCaptures: files.length,
      errorBody: reply.status === 200 ? null : body.slice(0, 400),
    }));
    console.log("ARQUIVO_FILES", JSON.stringify(files.slice(0, 30).map(item => ({
      url: item.url, timestamp: item.timestamp, mime: item.mimetype ?? item.mime,
      digest: item.digest, status: item.statuscode ?? item.status,
    }))));
    if (check.label !== "root-http" || !uniqueRoot.length) return;

    for (const item of [uniqueRoot[0], uniqueRoot[uniqueRoot.length - 1]].filter(
      (v, i, a) => i === 0 || String(v.digest) !== String(a[0].digest))) {
      const replay = "https://arquivo.pt/noFrame/replay/" + item.timestamp +
        "id_/" + item.url;
      try {
        const body = await get(replay);
        const text = body.bytes.toString("utf8");
        const links = [...text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']{1,500})["']/giu)]
          .map(m => m[1]).filter(u => /\.(pdf|zip|rune|docx?)\b|wdfiles\.com/iu.test(u));
        console.log("ARQUIVO_EXACT_ROOT", JSON.stringify({
          source: item.url, timestamp: item.timestamp, indexDigest: item.digest,
          replay, status: body.status, mime: body.mime, bytes: body.bytes.length,
          sha256: sha(body.bytes), candidateLinks: [...new Set(links)].slice(0, 50),
          snippet: text.slice(0, 950),
        }));
      } catch (error) {
        console.log("ARQUIVO_REPLAY_ERROR", JSON.stringify({
          replay, error: String(error),
        }));
      }
    }
  } catch (error) {
    console.log("ARQUIVO_INDEX_UNAVAILABLE", JSON.stringify({
      check: check.label, url: url.toString(), error: String(error),
    }));
  }
}

(async () => {
  console.log("ARCHIVE_SCOPE", JSON.stringify({ host, checks, node: process.version }));
  await Promise.all(checks.map(query));
  console.log("DECISION: Only an exact preserved binary with pre-2014 source custody qualifies as a possible new crib.");
})().catch(error => {
  console.error("FATAL", error);
  process.exitCode = 1;
});
