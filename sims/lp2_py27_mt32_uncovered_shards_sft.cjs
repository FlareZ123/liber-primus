'use strict';

/**
 * One-file original-cipher SFT, plus exact range/receipt utility for the
 * unfinished 2016 LP2 Python-2.7 MT19937 keyskip1 search.
 *
 * The independent frozen recovery is pinned to Dukotah/cicada3301 commit
 * 9087dc36b5aa64c1786428e32180261ab9420c29. No previously swept seed
 * is sent to the runner. Node.js 22, CommonJS, no third-party dependencies.
 *
 * Invocation within a checked-out FlareZ123/liber-primus workspace:
 *   node sims/lp2_py27_mt32_uncovered_shards_sft.cjs test
 *   node sims/lp2_py27_mt32_uncovered_shards_sft.cjs matrix full
 *   node sims/lp2_py27_mt32_uncovered_shards_sft.cjs plan 0 0 smoke
 *   node sims/lp2_py27_mt32_uncovered_shards_sft.cjs verify
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const UPSTREAM = '9087dc36b5aa64c1786428e32180261ab9420c29';
const SOURCE = path.join('upstream', 'liber-primus', 'analysis', 'round42',
  'S1-s2-recovery', 'state_recovered', 'STATUS.json');
const DIR = path.join(process.cwd(), 'run');
const SHARDS = 16;
const SPACE = 2 ** 32;
const CAND_BAR = 5;
const CLAIM_BAR = 7.6341931878728095;
const BANDS = [
  [0,          715827882,  371757563],
  [715827882,  1431655764, 1090732453],
  [1431655764, 2147483646, 1806229583],
  [2147483646, 2863311528, 2519684857],
  [2863311528, 3579139410, 3231257507],
  [3579139410, 4294967296, 3953451853]
];

function integer(s, max, field) {
  assert.match(String(s), /^(0|[1-9][0-9]*)$/, field);
  const n = Number(s);
  assert(Number.isSafeInteger(n) && n >= 0 && n < max, field);
  return n;
}

function range(band, shard) {
  const [low, high, cursor] = BANDS[band];
  assert(low <= cursor && cursor <= high);
  const from = cursor + Math.floor((high - cursor) * shard / SHARDS);
  const to = cursor + Math.floor((high - cursor) * (shard + 1) / SHARDS);
  assert(from >= cursor && to <= high && to > from);
  return {from, to};
}

/** No two shards overlap; their union is precisely the six frozen unswept bands. */
function testRanges() {
  let covered = 0;
  let remaining = 0;
  for (let b = 0; b < BANDS.length; b++) {
    const [low, high, cursor] = BANDS[b];
    assert.equal(low, b ? BANDS[b - 1][1] : 0);
    covered += cursor - low;
    remaining += high - cursor;
    let previous = cursor;
    for (let i = 0; i < SHARDS; i++) {
      const {from, to} = range(b, i);
      assert.equal(from, previous);
      previous = to;
    }
    assert.equal(previous, high);
  }
  assert.equal(BANDS[BANDS.length - 1][1], SPACE);
  assert.equal(covered, 2235695586);
  assert.equal(remaining, 2059271710);
  assert.equal(covered + remaining, SPACE);
  return {covered, remaining, total: SPACE, shards: BANDS.length * SHARDS};
}

function verifyPinnedSource() {
  const raw = fs.readFileSync(SOURCE);
  const source = JSON.parse(raw.toString('utf8'));
  assert.equal(source.engine, 'grind27');
  assert.equal(source.relation, 'exact');
  assert.equal(source.reducer_id, 0);
  assert.equal(source.offset, 0);
  assert.equal(source.aggregate.seeds_done, 2235695586);
  assert.equal(source.aggregate.n_claim_bar_hits, 0);
  assert.equal(source.workers.length, BANDS.length);
  for (let b = 0; b < BANDS.length; b++) {
    const worker = source.workers[b];
    assert.deepEqual([worker.band_start, worker.band_end, worker.cursor], BANDS[b]);
    assert.equal(worker.seeds_done, worker.cursor - worker.band_start);
  }
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function writeAtomicJson(name, value) {
  fs.mkdirSync(DIR, {recursive: true});
  const dest = path.join(DIR, name);
  const lock = dest + '.lock';
  const handle = fs.openSync(lock, 'wx');
  const temp = dest + '.' + process.pid + '.tmp';
  try {
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n');
    fs.renameSync(temp, dest);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(handle);
    fs.unlinkSync(lock);
  }
}

function prepare(band, shard, mode) {
  assert(mode === 'smoke' || mode === 'full');
  const sourceSha = verifyPinnedSource();
  const original = range(band, shard);
  const from = original.from;
  const to = mode === 'smoke' ? Math.min(from + 250000, original.to) : original.to;
  const lane = {lane: 'S2', reducer: 'random29', relation: 'exact', offset: 0,
    from, to, cand_bar: CAND_BAR, claim_bar: CLAIM_BAR};
  const manifest = {
    upstream_commit: UPSTREAM,
    external_frozen_status_sha256: sourceSha,
    source: SOURCE,
    mode, band, shard, shard_count_per_band: SHARDS,
    original_full_shard: original,
    requested: {from, to, seeds: to - from},
    model: 'CPython 2.7 MT19937 init_by_array([w]), random29, keyskip1/exact, 9-register panel'
  };
  writeAtomicJson('plan.json', [lane]);
  writeAtomicJson('manifest.json', manifest);
  process.stdout.write(JSON.stringify(manifest) + '\n');
}

function verifyRun() {
  const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'manifest.json'), 'utf8'));
  const status = JSON.parse(fs.readFileSync(path.join(DIR, 'STATUS.json'), 'utf8'));
  const {from, to, seeds} = manifest.requested;
  assert.equal(status.from, from);
  assert.equal(status.to, to);
  assert.equal(status.current_lane, 'S2');
  assert.equal(status.relation, 'exact');
  assert.equal(status.reducer_id, 0);
  assert.equal(status.offset, 0);
  assert.equal(status.cand_bar, CAND_BAR);
  assert.equal(status.claim_bar, CLAIM_BAR);
  assert.equal(status.final_flush, true);
  assert.equal(status.aggregate.seeds_done, seeds);
  assert.equal(status.aggregate.lane_words_covered, seeds);
  assert(status.workers.every(w => w.done && w.cursor === w.band_end));
  assert(status.lanes_completed.includes('S2'));

  const cands = fs.readFileSync(path.join(DIR, 'candidates.jsonl'), 'utf8')
    .trim().split('\n').filter(Boolean).map(s => JSON.parse(s));
  assert.equal(cands.length, status.aggregate.n_candidates);
  for (const candidate of cands) {
    assert(candidate.seed >= from && candidate.seed < to);
    assert(candidate.pmax >= CAND_BAR);
  }
  const elevated = cands.filter(c => c.pmax >= CLAIM_BAR);
  assert.equal(elevated.length, status.aggregate.n_claim_bar_hits);
  if (elevated.length) {
    const hits = JSON.parse(fs.readFileSync(path.join(DIR, 'HIT-CANDIDATE.json'), 'utf8'));
    assert.deepEqual(hits.hits.map(x => x.seed).sort((a,b) => a-b),
      elevated.map(x => x.seed).sort((a,b) => a-b));
  }
  const receipt = {
    ...manifest,
    completed: true,
    candidates: cands.length,
    flagged_for_oracle: elevated,
    best_seed: status.aggregate.best_word,
    best_pmax: status.aggregate.best_pmax
  };
  writeAtomicJson('receipt.json', receipt);
  process.stdout.write(JSON.stringify(receipt) + '\n');
}

function matrix(mode) {
  assert(mode === 'smoke' || mode === 'full');
  const include = [];
  for (let b = 0; b < BANDS.length; b++) {
    for (let shard = 0; shard < SHARDS; shard++) {
      if (mode === 'smoke' && (b !== 0 || shard !== 0)) continue;
      include.push({band: b, shard});
    }
  }
  process.stdout.write(JSON.stringify({include}) + '\n');
}

function main() {
  const [action, a, b, c] = process.argv.slice(2);
  if (action === 'test') {
    process.stdout.write(JSON.stringify(testRanges()) + '\n');
  } else if (action === 'matrix') {
    testRanges();
    matrix(a);
  } else if (action === 'plan') {
    testRanges();
    prepare(integer(a, BANDS.length, 'band'), integer(b, SHARDS, 'shard'), c);
  } else if (action === 'verify') {
    verifyRun();
  } else {
    throw new Error('Unknown action');
  }
}

main();
