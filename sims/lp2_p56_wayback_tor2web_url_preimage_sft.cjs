#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const CDX = "https://web.archive.org/cdx/search/cdx";
const ALL_DOMAINS = ["onion.to", "tor2web.org", "onion.link", "onion.city", "onion.cab", "onion.nu"];
const DOMAINS = process.env.DOMAIN ? [process.env.DOMAIN] : ALL_DOMAINS;
if (DOMAINS.some((domain) => !ALL_DOMAINS.includes(domain))) {
  throw new Error("Unsupported DOMAIN: " + process.env.DOMAIN);
}
const ALGORITHMS = ["sha512", "sha3-512", "blake2b512"];
const FROM_YEAR = process.env.FROM_YEAR || "2014";
const TO_YEAR = process.env.TO_YEAR || "2021";
const REQUEST_GAP_MS = Number.parseInt(process.env.REQUEST_GAP_MS || "1200", 10);
const OUTPUT_PATH = process.env.OUTPUT_PATH || "p56-wayback-tor2web-url-preimage.json";

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} algorithm @param {string} text */
function digestHex(algorithm, text) {
  return crypto.createHash(algorithm).update(Buffer.from(text, "utf8")).digest("hex");
}

/** @param {string} outputPath @param {unknown} value */
function atomicLockedWriteJson(outputPath, value) {
  const absolute = path.resolve(outputPath);
  const lockPath = absolute + ".lock";
  const tempPath = absolute + ".tmp-" + process.pid;
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const lockFd = fs.openSync(lockPath, "wx");
  try {
    fs.writeFileSync(tempPath, JSON.stringify(value, null, 2) + "\n", { encoding: "utf8", flag: "wx" });
    fs.renameSync(tempPath, absolute);
  } finally {
    fs.closeSync(lockFd);
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

/**
 * @param {URLSearchParams} params
 * @param {boolean} expectJson
 * @returns {Promise<any>}
 */
async function cdxFetch(params, expectJson) {
  const url = CDX + "?" + params.toString();
  const waits = [0, 2000, 5000, 10000, 30000];
  let lastError = null;
  for (const wait of waits) {
    if (wait) await sleep(wait);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "liber-primus-research/1.0 (public archival research)" },
        signal: AbortSignal.timeout(90000),
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error("CDX HTTP " + response.status + " for " + url);
        continue;
      }
      if (!response.ok) throw new Error("CDX HTTP " + response.status + " for " + url);
      const body = await response.text();
      await sleep(REQUEST_GAP_MS);
      return expectJson ? JSON.parse(body) : body.trim();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("CDX request failed");
}

/** @param {string} domain */
function baseParams(domain) {
  const params = new URLSearchParams();
  params.set("url", domain);
  params.set("matchType", "domain");
  params.set("from", FROM_YEAR);
  params.set("to", TO_YEAR);
  params.append("filter", "statuscode:200");
  const escaped = domain.replaceAll(".", "\\.");
  const visibleV2 = domain === "tor2web.org"
    ? "(?i)^https?://(?:[^./]+\\.)*([a-z2-7]{16})\\." + escaped + "(?::[0-9]+)?(?:/|$).*"
    : "(?i)^https?://(?:[^./]+\\.)*([a-z2-7]{16})\\.onion\\." + escaped + "(?::[0-9]+)?(?:/|$).*";
  params.append("filter", "original:" + visibleV2);
  params.set("fl", "timestamp,original,mimetype,statuscode,digest,length");
  params.set("collapse", "urlkey");
  return params;
}

/**
 * @param {string} original
 * @returns {{kind: string, value: string}[]}
 */
function candidateStrings(original) {
  const out = [{ kind: "archived_original_url", value: original }];
  let parsed;
  try {
    parsed = new URL(original);
  } catch {
    return out;
  }

  const host = parsed.hostname.toLowerCase();
  let label = null;
  let proxyKind = null;
  let match = host.match(/^(?:[^.]+\.)*([a-z2-7]{16})\.onion\.(to|link|city|cab|nu)$/);
  if (match) {
    label = match[1];
    proxyKind = "dot_onion_gateway";
  } else {
    match = host.match(/^(?:[^.]+\.)*([a-z2-7]{16})\.tor2web\.org$/);
    if (match) {
      label = match[1];
      proxyKind = "tor2web_subdomain";
    }
  }
  if (!label) return out;

  const suffix = parsed.pathname + parsed.search;
  const onionHost = label + ".onion";
  out.push(
    { kind: proxyKind + "_bare_label", value: label },
    { kind: proxyKind + "_onion_host", value: onionHost },
    { kind: proxyKind + "_onion_host_path", value: onionHost + suffix },
    { kind: proxyKind + "_http_onion_url", value: "http://" + onionHost + suffix },
    { kind: proxyKind + "_https_onion_url", value: "https://" + onionHost + suffix },
  );
  return out;
}

/** @param {string[]} header @param {unknown[]} row */
function rowObject(header, row) {
  const record = {};
  for (let i = 0; i < header.length; i += 1) record[header[i]] = String(row[i] ?? "");
  return record;
}

async function main() {
  const expectedEmptySha512 =
    "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce" +
    "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
  if (digestHex("sha512", "") !== expectedEmptySha512) throw new Error("SHA-512 control failed");

  const planted = "http://abcdefghijklmnop.onion.to/probe?q=1";
  const plantCandidates = candidateStrings(planted);
  const expectedPlant = "http://abcdefghijklmnop.onion/probe?q=1";
  const plantTarget = digestHex("sha512", expectedPlant);
  if (!plantCandidates.some((item) => item.value === expectedPlant)) throw new Error("Tor2web reconstruction control failed");
  if (!plantCandidates.some((item) => digestHex("sha512", item.value) === plantTarget)) throw new Error("Hash match plant failed");

  const hits = [];
  const domainStats = {};
  const uniqueDigests = new Set();
  const uniqueOnionLabels = new Set();
  let totalRows = 0;
  let totalCandidates = 0;
  let reconstructableRows = 0;

  for (const domain of DOMAINS) {
    // Wayback's production endpoint returns placeholder dashes when the
    // pagination-count request includes a projected field/filter set. Use the
    // bare domain index for the page count, then apply the frozen filters to
    // each numbered page. This is a safe superset of the filtered page range.
    const countParams = new URLSearchParams();
    countParams.set("url", domain);
    countParams.set("matchType", "domain");
    countParams.set("showNumPages", "true");
    const pageCountText = await cdxFetch(countParams, false);
    const pageCount = Number.parseInt(pageCountText, 10);
    if (!Number.isInteger(pageCount) || pageCount < 0) throw new Error("Invalid page count for " + domain + ": " + pageCountText);

    const stats = { page_count: pageCount, pages_completed: 0, rows: 0, reconstructed_rows: 0, candidate_strings_hashed: 0 };
    domainStats[domain] = stats;

    for (let page = 0; page < pageCount; page += 1) {
      const params = baseParams(domain);
      params.set("output", "json");
      params.set("page", String(page));
      const json = await cdxFetch(params, true);
      if (!Array.isArray(json) || json.length === 0) {
        stats.pages_completed += 1;
        continue;
      }
      const header = json[0].map(String);
      for (let i = 1; i < json.length; i += 1) {
        if (!Array.isArray(json[i])) continue;
        const record = rowObject(header, json[i]);
        const original = record.original;
        if (!original) continue;

        totalRows += 1;
        stats.rows += 1;
        if (record.digest && record.digest !== "-") uniqueDigests.add(record.digest);

        const candidates = candidateStrings(original);
        if (candidates.length > 1) {
          reconstructableRows += 1;
          stats.reconstructed_rows += 1;
          try {
            const host = new URL(original).hostname.toLowerCase();
            const m = host.match(/^(?:[^.]+\.)*([a-z2-7]{16})\.(?:onion\.(?:to|link|city|cab|nu)|tor2web\.org)$/);
            if (m) uniqueOnionLabels.add(m[1]);
          } catch {}
        }

        for (const candidate of candidates) {
          totalCandidates += 1;
          stats.candidate_strings_hashed += 1;
          for (const algorithm of ALGORITHMS) {
            if (digestHex(algorithm, candidate.value) === TARGET) {
              hits.push({ algorithm, candidate_kind: candidate.kind, candidate_value: candidate.value, cdx: record });
            }
          }
        }
      }
      stats.pages_completed += 1;
      console.log(JSON.stringify({ domain, page: page + 1, pages: pageCount, rows: stats.rows, reconstructed_rows: stats.reconstructed_rows, hits: hits.length }));
    }
  }

  const result = {
    experiment: "LP2 p56 AN END Wayback Tor2web URL-preimage gate",
    target_hex: TARGET,
    date_range: { from: FROM_YEAR, to: TO_YEAR },
    cdx_query: {
      domains: DOMAINS,
      match_type: "domain",
      status_filter: "200",
      collapse: "urlkey",
      fields: ["timestamp", "original", "mimetype", "statuscode", "digest", "length"],
      pagination: "Wayback showNumPages=true then page=0..N-1",
    },
    algorithms: ALGORITHMS,
    deterministic_candidate_family: [
      "exact archived original URL",
      "visible 16-char v2 label from Tor2web hostname",
      "label.onion",
      "label.onion + exact archived path/query",
      "http://label.onion + exact archived path/query",
      "https://label.onion + exact archived path/query",
    ],
    controls: { sha512_empty_vector: "PASS", tor2web_reconstruction: "PASS", planted_exact_hash_match: "PASS" },
    totals: {
      cdx_rows: totalRows,
      reconstructable_tor2web_rows: reconstructableRows,
      candidate_strings_hashed: totalCandidates,
      digest_comparisons: totalCandidates * ALGORITHMS.length,
      distinct_cdx_payload_digests: uniqueDigests.size,
      distinct_visible_v2_onion_labels: uniqueOnionLabels.size,
      exact_hits: hits.length,
    },
    domains: domainStats,
    hits,
    interpretation: hits.length === 0
      ? "No archived URL or deterministic visible-v2 reconstruction in this frozen family equals the p56 target under the three built-in 512-bit digest families. CDX payload-digest cardinality only sizes a possible body-replay follow-up."
      : "At least one exact digest hit exists. Re-verify the source capture and exact bytes before any solution claim.",
  };

  atomicLockedWriteJson(OUTPUT_PATH, result);
  console.log(JSON.stringify(result, null, 2));
  if (hits.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exitCode = 1;
});
