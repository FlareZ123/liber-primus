"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const { findFiles } = require("./aggregate_php_mt_crib.cjs");

/**
 * Reconcile exact disjoint PHP-MT-to-grid shards against their historical
 * seed coverage and retain all candidate line proofs.
 * @param {string} root
 * @param {number} start
 * @param {number} end
 * @param {number} shards
 */
function aggregate(root, start, end, shards) {
  assert(Number.isSafeInteger(start) && Number.isSafeInteger(end));
  assert(0 <= start && start < end && end <= 4294967296);
  assert(Number.isInteger(shards) && shards > 0 && shards <= 256);
  const totals = { seeds: 0, match3: 0, match4: 0, match5: 0,
    match6: 0, match7: 0, match8: 0, cpuSeconds: 0 };
  const parts = [], hits = [];
  for (let part = 1; part <= shards; part++) {
    const folder = path.join(root, "php-mt-grid-" + part);
    assert(fs.existsSync(folder), "Missing artifact for shard " + part);
    const files = findFiles(folder, "scan.log");
    assert.equal(files.length, 1, "Missing or duplicated scan.log in shard " + part);
    const buffer = fs.readFileSync(files[0]);
    const lines = buffer.toString("utf8").trim().split(/\r?\n/);
    const summaries = lines.filter(x => x.startsWith("SUMMARY "));
    assert.equal(summaries.length, 1);
    const pattern = /^SUMMARY seeds=(\d+) signatures=2048 orientations=8 offsets=256 reducers=2 match3=(\d+) match4=(\d+) match5=(\d+) match6=(\d+) match7=(\d+) match8=(\d+) cpu_s=([\d.]+)$/;
    const m = pattern.exec(summaries[0]);
    assert(m, "Unexpected grid stream scan contract for shard " + part);
    const from = start + Math.floor((end - start) * (part - 1) / shards);
    const to = start + Math.floor((end - start) * part / shards);
    const d = { part, from, to, seeds: Number(m[1]),
      match3: Number(m[2]), match4: Number(m[3]), match5: Number(m[4]),
      match6: Number(m[5]), match7: Number(m[6]), match8: Number(m[7]),
      cpuSeconds: Number(m[8]),
      logSha256: crypto.createHash("sha256").update(buffer).digest("hex") };
    assert.equal(d.seeds, to - from, "Seed coverage mismatch in shard " + part);
    assert(d.match3 >= d.match4 && d.match4 >= d.match5 &&
      d.match5 >= d.match6 && d.match6 >= d.match7 && d.match7 >= d.match8);
    const linesWithHits = lines.filter(x => x.startsWith("HIT "));
    assert.equal(linesWithHits.length, d.match8, "Mismatch of exact 8-byte hits");
    for (const line of linesWithHits) {
      const hit = /^HIT seed=(\d+) reducer=(high8|low8) traversal=([0-7]) offset=(\d+) bytes=8$/.exec(line);
      assert(hit, "Malformed full-match line");
      const seed = Number(hit[1]), offset = Number(hit[4]);
      assert(from <= seed && seed < to && offset < 256, "Candidate out of range");
      hits.push({ part, seed, reducer: hit[2], traversal: Number(hit[3]), offset, line });
    }
    for (const key of Object.keys(totals)) totals[key] += d[key];
    parts.push(d);
  }
  assert.equal(totals.seeds, end - start, "Incomplete 32-bit seed-domain coverage");
  return { start, end, shards,
    contract: "historical PHP 5.x MT19937 exact 32-bit seed, eight source-grid traversals, 256 cyclic offsets, high/low8 outputs, eight-byte exact prefix",
    totals, hits, parts };
}

/** @param {string} destination @param {object} report */
function atomicWrite(destination, report) {
  const file = path.resolve(destination);
  const lock = file + ".lock", tmp = file + "." + crypto.randomUUID() + ".tmp";
  const fd = fs.openSync(lock, "wx");
  try {
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2) + "\n", {flag:"wx"});
    fs.renameSync(tmp, file);
  } finally {
    fs.closeSync(fd);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.unlinkSync(lock);
  }
}
if (require.main === module) {
  assert.equal(process.argv.length, 7,
    "Usage: node sims/aggregate_php_mt_grid.cjs artifact-dir output.json start end shards");
  const [folder, out, start, end, shards] = process.argv.slice(2);
  const report = aggregate(folder, Number(start), Number(end), Number(shards));
  atomicWrite(out, report);
  process.stdout.write(JSON.stringify({
    start: report.start, end: report.end, shards: report.shards,
    totals: report.totals, hits: report.hits, complete: true
  }, null, 2) + "\n");
}
module.exports = { aggregate };
