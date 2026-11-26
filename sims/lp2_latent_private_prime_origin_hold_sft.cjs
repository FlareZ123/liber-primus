'use strict';

// Reuse the frozen exact private-prime inverse, invoking its existing literal-F
// mode on the original p40-p53 tape. This wrapper only reduces console output.
const {spawnSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const run = spawnSync(process.execPath,
  ['sims/lp2_latent_private_prime_origin_sft.cjs', 'p40', 'hold'],
  {encoding: 'utf8', maxBuffer: 128 * 1024 * 1024});
if (run.error) throw run.error;
if (run.status !== 0) {
  process.stderr.write(run.stderr || '');
  process.exit(run.status || 1);
}
let result;
try {
  result = JSON.parse(run.stdout);
} catch (error) {
  process.stderr.write(run.stdout.slice(-12000));
  throw new Error('Could not parse frozen SFT JSON: ' + error.message);
}
const summary = {
  model: 'Agent5 fixed private prime-origin word inverse; literal plaintext-F hold; ciphertext-zero may also be a consuming non-F output',
  which: result.which,
  hold: result.hold,
  n: result.n,
  comparisons: result.comparisons,
  compatible: result.compatible,
  uniqueIntervals: result.uniqueIntervals,
  anchorByLength: result.anchorByLength,
  counts: result.counts,
  thresholds: [7, 8, 9, 10, 11],
  bounds: result.bounds,
  indexSize: result.indexSize,
  routes: result.routes,
  candidateCount: result.candidates && result.candidates.length,
  firstLongAnchors: (result.candidates || []).slice(0, 12).map(x => ({
    start: x.start, end: x.end, text: x.text, active: x.active,
    origin: x.origin, direction: x.d, primeSign: x.sign,
    plaintextSign: x.plainSign, offset: x.b
  }))
};
const rendered = JSON.stringify(summary, null, 2) + '\n';
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), rendered);
}
process.stdout.write(rendered);
