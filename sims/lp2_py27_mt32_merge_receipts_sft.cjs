'use strict';

/**
 * Source-pinned receipt merge for the LP2 32-bit MT19937 S2 exact split.
 * Run after actions/download-artifact@v4 places one artifact per named shard.
 * Partial mode reports finished shards; strict mode requires all 96.
 *
 * Node.js CommonJS, standard library only. All published aggregate values
 * are recalculated from the individually retained engine status and candidates.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {BANDS, SHARDS, range, testRanges, UPSTREAM} =
  require('./lp2_py27_mt32_uncovered_shards_sft.cjs');

const TOTAL = testRanges();
const PANEL_SHA = 'e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928';
const SOURCE_SHA = '1aa529444548e3e1f3add420936ddfd40ee9b9fe4cb6d25b74c197a2e070c2ba';
const CLAIM_BAR = 7.6341931878728095;
const ROOT = path.join(process.cwd(), 'artifacts');
const OUT = path.join(process.cwd(), 'summary');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function run() {
  const mode = process.argv[2];
  assert(mode === 'partial' || mode === 'strict', 'mode partial|strict');
  const runId = String(process.argv[3] || '');
  assert.match(runId, /^[0-9]{6,18}$/, 'numeric source workflow run id required');
  const completed = [];
  const missing = [];
  const flagged = [];
  const top = [];
  let candidateTotal = 0;
  let seedTotal = 0;
  let zeroCandidateShards = 0;

  for (let band = 0; band < BANDS.length; band++) {
    for (let shard = 0; shard < SHARDS; shard++) {
      const artifact = path.join(ROOT, 'exact-full-b' + band + '-s' + shard);
      const receiptFile = path.join(artifact, 'receipt.json');
      if (!fs.existsSync(receiptFile)) {
        missing.push({band, shard});
        continue;
      }

      const receipt = readJson(receiptFile);
      const status = readJson(path.join(artifact, 'STATUS.json'));
      const actual = range(band, shard);
      assert.equal(receipt.completed, true);
      assert.equal(receipt.mode, 'full');
      assert.equal(receipt.upstream_commit, UPSTREAM);
      assert.equal(receipt.panel_r36_f32_sha256, PANEL_SHA);
      assert.equal(receipt.external_frozen_status_sha256, SOURCE_SHA);
      assert.equal(receipt.band, band);
      assert.equal(receipt.shard, shard);
      assert.deepEqual(receipt.requested, {
        from: actual.from,
        to: actual.to,
        seeds: actual.to - actual.from
      });
      assert.equal(status.current_lane, 'S2');
      assert.equal(status.relation, 'exact');
      assert.equal(status.final_flush, true);
      assert.equal(status.aggregate.seeds_done, actual.to - actual.from);
      assert.equal(status.aggregate.lane_words_covered, actual.to - actual.from);
      assert.equal(status.aggregate.best_pmax, receipt.best_pmax);
      assert.equal(status.aggregate.best_word, receipt.best_seed);
      assert(status.workers.every(w => w.done && w.cursor === w.band_end));

      const candidateFile = fs.readFileSync(path.join(artifact, 'candidates.jsonl'), 'utf8');
      const candidates = candidateFile.trim().split('\n').filter(Boolean)
        .map(line => JSON.parse(line));
      assert.equal(candidates.length, receipt.candidates);
      assert.equal(candidates.length, status.aggregate.n_candidates);
      assert.equal(receipt.flagged_for_oracle.length, status.aggregate.n_claim_bar_hits);
      const flaggedIds = new Set(receipt.flagged_for_oracle.map(x => x.seed));
      for (const c of candidates) {
        assert(c.seed >= actual.from && c.seed < actual.to);
        assert(c.pmax >= 5);
        assert.equal(flaggedIds.has(c.seed), c.pmax >= CLAIM_BAR);
      }

      completed.push({band, shard, from: actual.from, to: actual.to,
        seeds: receipt.requested.seeds, candidates: receipt.candidates,
        best_seed: receipt.best_seed, best_pmax: receipt.best_pmax,
        candidate_file_sha256: crypto.createHash('sha256').update(candidateFile).digest('hex')});
      for (const f of receipt.flagged_for_oracle) {
        flagged.push({seed: f.seed, pmax: f.pmax, band, shard});
      }
      top.push({seed: receipt.best_seed, pmax: receipt.best_pmax, band, shard});
      candidateTotal += receipt.candidates;
      seedTotal += receipt.requested.seeds;
      if (!receipt.candidates) zeroCandidateShards++;
    }
  }

  assert.equal(completed.length + missing.length, TOTAL.shards);
  assert(seedTotal <= TOTAL.remaining);
  if (mode === 'strict') {
    assert.equal(missing.length, 0, 'incomplete: some shard artifacts or receipts are missing');
    assert.equal(seedTotal, TOTAL.remaining);
  }
  top.sort((a, b) => b.pmax - a.pmax);
  flagged.sort((a, b) => b.pmax - a.pmax);
  const allComplete = !missing.length;
  const result = {
    upstream_source_commit: UPSTREAM, panel_sha256: PANEL_SHA,
    frozen_original_coverage_sha256: SOURCE_SHA,
    source_workflow_run_id: runId,
    mode, original_covered: TOTAL.covered,
    newly_covered: seedTotal,
    total_documented_coverage: TOTAL.covered + seedTotal,
    keyspace: TOTAL.total, unfinished_from_source: TOTAL.remaining,
    complete_shards: completed.length, total_shards: TOTAL.shards,
    missing_shards: missing, newly_screened_candidates: candidateTotal,
    flagged_for_oracle: flagged, top_ten_shard_winners: top.slice(0, 10),
    zero_candidate_shards: zeroCandidateShards, complete: allComplete,
    shards: completed
  };

  fs.mkdirSync(OUT, {recursive: true});
  const temp = path.join(OUT, 'combined.json.' + process.pid + '.tmp');
  fs.writeFileSync(temp, JSON.stringify(result, null, 2) + '\n');
  fs.renameSync(temp, path.join(OUT, 'combined.json'));

  const lines = [
    '# LP2 S2 exact 32-bit-key aggregate',
    '',
    'Upstream source: Dukotah/cicada3301 @ ' + UPSTREAM + '.',
    'GitHub Actions source run: https://github.com/FlareZ123/liber-primus/actions/runs/' + runId + '.',
    'Scorer: 12-register panel-R36, sha256 ' + PANEL_SHA + '.',
    'Method: CPython 2.7 MT19937 init_by_array([w]), random29, offset 0, keyskip1/exact',
    'with a beam width 64 over the first 120 original unsolved LP2 runes.',
    '',
    '| Measurement | Result |',
    '| --- | ---: |',
    '| Validated new seed evaluations | ' + seedTotal.toLocaleString('en-US') + ' |',
    '| Recovered historical evaluations | ' + TOTAL.covered.toLocaleString('en-US') + ' |',
    '| Total documentary coverage (mixed old/R36 score gates) | ' + (TOTAL.covered + seedTotal).toLocaleString('en-US') + ' / ' + TOTAL.total.toLocaleString('en-US') + ' |',
    '| Complete shard receipts | ' + completed.length + ' / ' + TOTAL.shards + ' |',
    '| Raw candidates >= 5.0 in new shards | ' + candidateTotal + ' |',
    '| New candidates at or above original 7.634 claim bar | ' + flagged.length + ' |',
    '| Top new pmax | ' + (top[0] ? top[0].pmax.toFixed(6) + ' (seed ' + top[0].seed + ')' : 'none') + ' |',
    '',
    'An above-bar score is a request for independent stage-B/oracle adjudication, never a plaintext recovery.',
    'A complete null excludes only the exact enumerated generator/reducer/clock/scorer class;',
    'the original and current 12-register thresholds are from different calibration eras.',
    'Reported historical coverage comes from the frozen external source and is retained as a',
    'mixed-instrument count. The newly covered seeds are all assessed under panel-R36.',
    '',
    'Artifacts preserve per-shard JSON status, candidate JSONL, and binary histograms.'
  ];
  const md = path.join(OUT, 'README.md');
  fs.writeFileSync(md + '.tmp', lines.join('\n') + '\n');
  fs.renameSync(md + '.tmp', md);
  process.stdout.write(JSON.stringify({
    complete_shards: completed.length, missing: missing.length,
    new_seeds: seedTotal, candidate_total: candidateTotal,
    flagged_for_oracle: flagged, best: top[0] || null, all_complete: allComplete
  }) + '\n');
}

run();
