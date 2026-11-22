"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

/**
 * Find files of one name under an extracted Actions artifact.
 * @param {string} directory
 * @param {string} filename
 * @returns {string[]}
 */
function findFiles(directory, filename) {
  const out = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) out.push(...findFiles(full, filename));
    else if (entry.isFile() && entry.name === filename) out.push(full);
  }
  return out;
}

/**
 * Aggregate a complete contiguous manual-dispatch seed campaign.
 * @param {string} root Directory populated by gh run download.
 * @param {number} start Inclusive seed.
 * @param {number} end Exclusive seed.
 * @param {number} shards Expected shard count.
 */
function aggregate(root, start, end, shards) {
  assert(Number.isSafeInteger(start) && Number.isSafeInteger(end));
  assert(0 <= start && start < end && end <= 4294967296);
  assert(Number.isInteger(shards) && 1 <= shards && shards <= 256);
  const observed = { seeds: 0, word1: 0, word2: 0, word3: 0, cpuSeconds: 0 };
  const details = [];
  const candidates = [];
  for (let part = 1; part <= shards; part++) {
    const location = path.join(root, "php-mt-crib-" + part);
    assert(fs.existsSync(location), "Missing artifact for shard " + part);
    const logs = findFiles(location, "scan.log");
    assert.equal(logs.length, 1, "Exactly one scan log required for shard " + part);
    const data = fs.readFileSync(logs[0], "utf8");
    const rows = data.trim().split(/\r?\n/);
    const summaries = rows.filter(line => line.startsWith("SUMMARY "));
    assert.equal(summaries.length, 1, "Exactly one SUMMARY required at shard " + part);
    const match = /^SUMMARY seeds=(\d+) word1=(\d+) word2=(\d+) word3=(\d+) cpu_s=([\d.]+)$/.exec(summaries[0]);
    assert(match, "Malformed SUMMARY in shard " + part);
    const expectedStart = start + Math.floor((end - start) * (part - 1) / shards);
    const expectedEnd = start + Math.floor((end - start) * part / shards);
    const parsed = {
      part, start: expectedStart, end: expectedEnd,
      seeds: Number(match[1]), word1: Number(match[2]), word2: Number(match[3]),
      word3: Number(match[4]), cpuSeconds: Number(match[5]),
      logSha256: crypto.createHash("sha256").update(data).digest("hex")
    };
    assert.equal(parsed.seeds, expectedEnd - expectedStart, "Seed span mismatch in shard " + part);
    for (const key of Object.keys(observed)) observed[key] += parsed[key];
    const rowsWithCandidates = rows.filter(line => line.startsWith("PAIR ") || line.startsWith("HIT "));
    assert.equal(rowsWithCandidates.filter(line => line.startsWith("PAIR ")).length, parsed.word2);
    assert.equal(rowsWithCandidates.filter(line => line.startsWith("HIT ")).length, parsed.word3);
    for (const line of rowsWithCandidates) {
      const hit = /seed=(\d+)/.exec(line);
      assert(hit, "Candidate missing seed in shard " + part);
      const seed = Number(hit[1]);
      assert(seed >= expectedStart && seed < expectedEnd, "Candidate seed outside shard bounds");
      candidates.push({ part, seed, line });
    }
    details.push(parsed);
  }
  assert.equal(observed.seeds, end - start, "Incomplete search-domain coverage");
  const result = {
    model: "PHP legacy MT integer seed, five output reducers, chained/direct mod29, two signs, English 8/5/4-word crib",
    start, end, shards, observed, candidates, details
  };
  return result;
}

/**
 * Atomically replace a JSON report with a short-lived exclusive filesystem lock.
 * @param {string} filename
 * @param {object} result
 */
function writeReport(filename, result) {
  const absolute = path.resolve(filename);
  const lock = absolute + ".lock";
  const temporary = absolute + "." + crypto.randomUUID() + ".tmp";
  const handle = fs.openSync(lock, "wx");
  try {
    fs.writeFileSync(temporary, JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
    fs.renameSync(temporary, absolute);
  } finally {
    fs.closeSync(handle);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.unlinkSync(lock);
  }
}

if (require.main === module) {
  assert.equal(process.argv.length, 7,
    "Usage: node sims/aggregate_php_mt_crib.cjs artifact-dir output.json start end shards");
  const [root, output, from, to, partitions] = process.argv.slice(2);
  const result = aggregate(root, Number(from), Number(to), Number(partitions));
  writeReport(output, result);
  process.stdout.write(JSON.stringify({
    start: result.start, end: result.end, shards: result.shards, observed: result.observed,
    candidateCount: result.candidates.length, hits: result.candidates.filter(x => x.line.startsWith("HIT ")),
    complete: true
  }, null, 2) + "\n");
}

module.exports = { aggregate, findFiles };
