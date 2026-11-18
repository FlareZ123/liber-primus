"use strict";

/**
 * Exact-byte 2014 IRC scan for p56 hash-family / target-URL evidence.
 *
 * Downloads the three preserved original IRC blobs, validates their Git blob
 * SHA-1 and byte count, then scans only 2014 lines for p56 / digest-family
 * terms and nearby onion mentions. This is a historical-source gate, not a
 * claim that participant discussion is Cicada-authored evidence.
 *
 * Run:
 *   node sims/lp2_2014_irc_p56_hash_family_scan_sft.cjs
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const https = require("node:https");

const sources = [
  {
    name: "#cicadasolvers.freenode.log",
    encodedName: "%23cicadasolvers.freenode.log",
    size: 18487233,
    gitBlob: "bdd277c14f94c34b5ae714cd00c238065beeed4e"
  },
  {
    name: "#cicadasolvers.freenode.2.log",
    encodedName: "%23cicadasolvers.freenode.2.log",
    size: 27234234,
    gitBlob: "72634a9d071d32af767edbffc0493d810e88cd0d"
  },
  {
    name: "#33012014.freenode.log",
    encodedName: "%2333012014.freenode.log",
    size: 8629610,
    gitBlob: "a2880b1db31ce523599ef30ca2e55291bf295900"
  }
];

/**
 * @param {Buffer} body
 * @returns {string}
 */
function gitBlobHash(body) {
  return crypto.createHash("sha1")
    .update(`blob ${body.length}\0`, "ascii")
    .update(body)
    .digest("hex");
}

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "liber-primus-research",
        "Accept": "application/octet-stream"
      }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(response.headers.location).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        response.resume();
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

/**
 * @param {string[]} lines
 * @param {number} index
 * @param {number} radius
 * @returns {Array<{line:number,text:string}>}
 */
function context(lines, index, radius) {
  const start = Math.max(0, index - radius);
  const end = Math.min(lines.length, index + radius + 1);
  return lines.slice(start, end).map((text, offset) => ({
    line: start + offset + 1,
    text: text.slice(0, 650)
  }));
}

(async () => {
  const familyPattern = /whirlpool|sha[- ]?512|sha2(?:24|56|384|512)?\\b|sha[- ]?3|blake2|blake[- ]?512|skein|streebog|digest/i;
  const p56Pattern = /page\s*56\b|page56\b|\bp56\b|36367763ab73783c|hashes\s+to|deep[- ]?web/i;
  const onionPattern = /[a-z2-7]{16}\.onion|[a-z2-7]{56}\.onion/i;

  const all = [];

  for (const source of sources) {
    const url = `https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/${source.encodedName}`;
    const body = await download(url);

    assert.equal(body.length, source.size, `${source.name} byte count changed`);
    assert.equal(gitBlobHash(body), source.gitBlob, `${source.name} Git blob changed`);

    const lines = body.toString("latin1").split(/\r?\n/);
    const family = [];
    const p56 = [];
    const p56OnionContexts = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const date = line.match(/^2014 ([A-Z][a-z]{2}) \\d\\d /);
      if (!date) continue;
      if (!["May", "Jun", "Jul", "Aug", "Sep"].includes(date[1])) continue;

      if (familyPattern.test(line)) {
        family.push({ line: i + 1, text: line.slice(0, 650) });
      }
      if (p56Pattern.test(line)) {
        p56.push({ line: i + 1, text: line.slice(0, 650) });
        const nearby = context(lines, i, 30);
        const onions = nearby.filter((item) => onionPattern.test(item.text));
        const families = nearby.filter((item) => familyPattern.test(item.text));
        if (onions.length || families.length) {
          p56OnionContexts.push({
            trigger: { line: i + 1, text: line.slice(0, 650) },
            onions,
            families
          });
        }
      }
    }

    all.push({
      source: source.name,
      bytes: body.length,
      gitBlob: source.gitBlob,
      familyMatches: family,
      p56Matches: p56,
      p56NearbyOnionOrFamily: p56OnionContexts
    });
  }

  const aggregate = {
    familyMatchCount: all.reduce((sum, item) => sum + item.familyMatches.length, 0),
    p56MatchCount: all.reduce((sum, item) => sum + item.p56Matches.length, 0),
    p56ContextWithOnionOrFamilyCount: all.reduce(
      (sum, item) => sum + item.p56NearbyOnionOrFamily.length, 0
    )
  };

  console.log(JSON.stringify({ aggregate, sources: all }, null, 2));
  console.log("PASS: exact preserved 2014 IRC blobs scanned for p56 hash-family and nearby onion evidence.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
