#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { Readable } = require("node:stream");

const TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const CDX = "https://web.archive.org/cdx/search/cdx";
const ALL_DOMAINS = ["onion.to", "tor2web.org", "onion.link", "onion.city", "onion.cab", "onion.nu"];
const DOMAIN = process.env.DOMAIN;
const FROM_YEAR = process.env.FROM_YEAR || "2014";
const TO_YEAR = process.env.TO_YEAR || "2021";
const SHARD_COUNT = Number.parseInt(process.env.SHARD_COUNT || "1", 10);
const SHARD_INDEX = Number.parseInt(process.env.SHARD_INDEX || "0", 10);
const REQUEST_GAP_MS = Number.parseInt(process.env.REQUEST_GAP_MS || "800", 10);
const OUTPUT_PATH = process.env.OUTPUT_PATH || "p56-wayback-tor2web-body-preimage.json";
const HASH_ALGORITHMS = ["sha512", "sha3-512", "blake2b512"];

if (!ALL_DOMAINS.includes(DOMAIN)) throw new Error("DOMAIN must be one supported Tor2web gateway");
if (!Number.isInteger(SHARD_COUNT) || SHARD_COUNT < 1) throw new Error("SHARD_COUNT must be >= 1");
if (!Number.isInteger(SHARD_INDEX) || SHARD_INDEX < 0 || SHARD_INDEX >= SHARD_COUNT) throw new Error("SHARD_INDEX out of range");

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {Buffer} bytes */
function base32NoPadding(bytes) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
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
 * @param {boolean} json
 * @returns {Promise<any>}
 */
async function cdxFetch(params, json) {
  const url = CDX + "?" + params.toString();
  return fetchWithRetry(url, json ? "json" : "text", 90000);
}

/**
 * @param {string} url
 * @param {"json"|"text"|"response"} mode
 * @param {number} timeoutMs
 * @returns {Promise<any>}
 */
async function fetchWithRetry(url, mode, timeoutMs) {
  const waits = [0, 2000, 5000, 10000, 30000];
  let lastError = null;
  for (const wait of waits) {
    if (wait) await sleep(wait);
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "liber-primus-research/1.0 (public archival research)" },
        signal: AbortSignal.timeout(timeoutMs),
        redirect: "follow",
      });
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error("HTTP " + response.status + " for " + url);
        continue;
      }
      if (!response.ok) throw new Error("HTTP " + response.status + " for " + url);
      if (mode === "response") return response;
      const body = await response.text();
      await sleep(REQUEST_GAP_MS);
      return mode === "json" ? JSON.parse(body) : body.trim();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Request failed");
}

/** @returns {string} */
function visibleV2Regex() {
  const escaped = DOMAIN.replaceAll(".", "\\.");
  return DOMAIN === "tor2web.org"
    ? "(?i)^https?://(?:[^./]+\\.)*([a-z2-7]{16})\\." + escaped + "(?::[0-9]+)?(?:/|$).*"
    : "(?i)^https?://(?:[^./]+\\.)*([a-z2-7]{16})\\.onion\\." + escaped + "(?::[0-9]+)?(?:/|$).*";
}

/** @returns {URLSearchParams} */
function pageParams() {
  const params = new URLSearchParams();
  params.set("url", DOMAIN);
  params.set("matchType", "domain");
  params.set("from", FROM_YEAR);
  params.set("to", TO_YEAR);
  params.append("filter", "statuscode:200");
  params.append("filter", "original:" + visibleV2Regex());
  params.set("fl", "timestamp,original,mimetype,statuscode,digest,length");
  params.set("collapse", "digest");
  return params;
}

/** @param {string[]} header @param {unknown[]} row */
function rowObject(header, row) {
  const out = {};
  for (let i = 0; i < header.length; i += 1) out[header[i]] = String(row[i] ?? "");
  return out;
}

/** @param {string} digest */
function shardFor(digest) {
  const h = crypto.createHash("sha256").update(digest, "utf8").digest();
  return h.readUInt32BE(0) % SHARD_COUNT;
}

/**
 * @param {{timestamp:string, original:string, digest:string}} record
 * @returns {Promise<{bytes:number, replay_url:string, cdx_sha1_verified:boolean, digests:Record<string,string>}>}
 */
async function replayAndHash(record) {
  const replayUrl = "https://web.archive.org/web/" + record.timestamp + "id_/" + record.original;
  const response = await fetchWithRetry(replayUrl, "response", 120000);
  const sha1 = crypto.createHash("sha1");
  const hashes = Object.fromEntries(HASH_ALGORITHMS.map((name) => [name, crypto.createHash(name)]));
  let bytes = 0;
  for await (const chunk of Readable.fromWeb(response.body)) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    sha1.update(buffer);
    for (const hash of Object.values(hashes)) hash.update(buffer);
  }
  await sleep(REQUEST_GAP_MS);
  const sha1Base32 = base32NoPadding(sha1.digest());
  const digests = {};
  for (const [name, hash] of Object.entries(hashes)) digests[name] = hash.digest("hex");
  return {
    bytes,
    replay_url: replayUrl,
    cdx_sha1_verified: sha1Base32 === record.digest.toUpperCase(),
    digests,
  };
}

async function main() {
  if (base32NoPadding(crypto.createHash("sha1").update("abc").digest()) !== "VGMT4NSHA2AWVOR6EVYXQUGCNSONBWE5") {
    throw new Error("Base32/SHA-1 fidelity control failed");
  }
  const expectedEmptySha512 =
    "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce" +
    "47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
  if (crypto.createHash("sha512").update("").digest("hex") !== expectedEmptySha512) {
    throw new Error("SHA-512 control failed");
  }

  const count = new URLSearchParams();
  count.set("url", DOMAIN);
  count.set("matchType", "domain");
  count.set("showNumPages", "true");
  const pageCount = Number.parseInt(await cdxFetch(count, false), 10);
  if (!Number.isInteger(pageCount) || pageCount < 0) throw new Error("Invalid CDX page count");

  /** @type {Map<string, Record<string,string>>} */
  const representatives = new Map();
  let rows = 0;
  for (let page = 0; page < pageCount; page += 1) {
    const params = pageParams();
    params.set("output", "json");
    params.set("page", String(page));
    const data = await cdxFetch(params, true);
    if (Array.isArray(data) && data.length > 0) {
      const header = data[0].map(String);
      for (let i = 1; i < data.length; i += 1) {
        if (!Array.isArray(data[i])) continue;
        const record = rowObject(header, data[i]);
        rows += 1;
        if (record.digest && record.digest !== "-" && !representatives.has(record.digest)) {
          representatives.set(record.digest, record);
        }
      }
    }
    console.log(JSON.stringify({ phase: "index", domain: DOMAIN, page: page + 1, pages: pageCount, rows, unique_payload_digests: representatives.size }));
  }

  const selected = [...representatives.entries()]
    .filter(([digest]) => shardFor(digest) === SHARD_INDEX)
    .map(([, record]) => record);

  const hits = [];
  const failures = [];
  const fidelityMismatches = [];
  let covered = 0;
  for (let i = 0; i < selected.length; i += 1) {
    const record = selected[i];
    try {
      const replay = await replayAndHash(record);
      if (!replay.cdx_sha1_verified) {
        fidelityMismatches.push({ cdx: record, replay_url: replay.replay_url, bytes: replay.bytes, digests: replay.digests });
      } else {
        covered += 1;
      }
      for (const [algorithm, digest] of Object.entries(replay.digests)) {
        if (digest === TARGET) hits.push({ algorithm, cdx: record, replay });
      }
    } catch (error) {
      failures.push({ cdx: record, error: error instanceof Error ? error.message : String(error) });
    }
    if ((i + 1) % 25 === 0 || i + 1 === selected.length) {
      console.log(JSON.stringify({ phase: "replay", domain: DOMAIN, shard: SHARD_INDEX + "/" + SHARD_COUNT, completed: i + 1, selected: selected.length, fidelity_verified: covered, failures: failures.length, mismatches: fidelityMismatches.length, hits: hits.length }));
    }
  }

  const result = {
    experiment: "LP2 p56 AN END Wayback Tor2web archived-body preimage gate",
    target_hex: TARGET,
    domain: DOMAIN,
    date_range: { from: FROM_YEAR, to: TO_YEAR },
    shard: { index: SHARD_INDEX, count: SHARD_COUNT },
    algorithms: HASH_ALGORITHMS,
    controls: { sha1_base32: "PASS", sha512_empty_vector: "PASS" },
    cdx: {
      page_count: pageCount,
      filtered_rows: rows,
      distinct_payload_digests: representatives.size,
      selected_distinct_payload_digests: selected.length,
      collapse: "digest",
      visible_v2_filter: visibleV2Regex(),
    },
    replay: {
      fidelity_verified_payloads: covered,
      fidelity_mismatch_count: fidelityMismatches.length,
      fetch_failure_count: failures.length,
      exact_hit_count: hits.length,
    },
    hits,
    fidelity_mismatches: fidelityMismatches,
    failures,
    interpretation: hits.length > 0
      ? "Exact target hit found; verify the archived source and raw payload independently before promotion."
      : failures.length === 0 && fidelityMismatches.length === 0
        ? "This shard is exhaustively negative for fidelity-verified archived payloads under the tested 512-bit families."
        : "No hit in covered payloads; unresolved replay failures or fidelity mismatches prevent an exhaustive negative.",
  };
  atomicLockedWriteJson(OUTPUT_PATH, result);
  console.log(JSON.stringify(result, null, 2));
  if (hits.length > 0) process.exitCode = 2;
  else if (failures.length > 0 || fidelityMismatches.length > 0) process.exitCode = 3;
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exitCode = 1;
});
