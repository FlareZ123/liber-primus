'use strict';
/**
 * LP2 solved-p57 13-dot / PARABLE seven-rune readout of p49-51 rim:
 * LP3lRA# -> independently solved LP1 source scan 03.jpg (WELCOME).
 * Attempt ONE unchanged historical OutGuess 0.4 keyed receiver, rather than
 * the already-excluded original LP2 p3 (20.jpg) receiver.
 *
 * This is a source-led candidate, not an authenticating plaintext claim.
 * Requires pinned OutGuess 0.4 available as "outguess" on PATH.
 * Windows GitHub Actions SFT with the accompanying pinned workflow.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');

/** @param {string} p @returns {any} */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const grid = json('resources/liber-primus/base60-grid.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const ink = json('resources/liber-primus/lp2-ink-annotations.json');
const ref = fs.readFileSync(path.join(root,
  'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
const sourceJpeg = path.join(root, 'resources/liber-primus/03.jpg');
assert.ok(fs.statSync(sourceJpeg).size > 100000);
const welcome = ref.split('### 3')[1].split('### 4')[0];
assert.ok(welcome.includes('WELCOME'));
assert.ok(welcome.includes('LIKE THE INSTAR, IT IS ONLY THROUGH GOING WITHIN'));
const parable = ref.split('### 57')[1];
assert.ok(parable.includes('LIKE THE INSTAR TUNNELING'));
assert.ok(parable.includes('WE MUST SHED OUR OWN CIRCUMFERENCES'));
const page = ink.pages.find(p => p.page === 57);
assert.ok(page);
assert.deepEqual(page.large_punctuation, [[7,13,'red'],[95,23,'red']]);
assert.deepEqual(page.red_spans.map(x=>x.length), [7]);
assert.equal(corpus.pages[57].indices.slice(0,7)
  .map(i=>corpus.translit[i]).join(''), 'PARABLE');

const rows = grid.byte_rows;
assert.equal(rows.length,32);
assert.ok(rows.every(row=>row.length===8));
const clockwise = [
  ...rows[0],
  ...rows.slice(1).map(row=>row[7]),
  ...rows[31].slice(0,7).reverse(),
  ...rows.slice(1,31).reverse().map(row=>row[0])
];
assert.equal(clockwise.length,76);
const at = page.large_punctuation[0][1]-1;
const n = page.red_spans[0].length;
const candidate = Buffer.from(clockwise.slice(at,at+n)).toString('latin1');
assert.equal(candidate,'LP3lRA#');
assert.deepEqual(clockwise.slice(at,at+n),[76,80,51,108,82,65,35]);
assert.equal(Number(candidate[2]),3);
assert.equal(Number(candidate[2]),3); // Original first-release physical scan 03.jpg

const cmd = path.join(root, 'sims/outguess_lp2_keyed_probe.cjs');
const extraction = spawnSync(process.execPath, [cmd], {
  cwd:root, encoding:'utf8', timeout:240000, maxBuffer:8*1024*1024,
  env:{...process.env, LP2_OUTGUESS_PASSWORD:candidate,
    LP2_OUTGUESS_SOURCE_IMAGE:'3'}
});
assert.equal(extraction.status,0,extraction.stderr+'\n'+extraction.stdout);
const out = json('outguess-results-keyed/summary.json');
assert.deepEqual(out.keys,[candidate]);
assert.deepEqual(out.pages,[3]);
assert.equal(out.attempts,1);
assert.deepEqual(out.controls.authenticDefaultImages,[0,8]);
assert.equal(out.controls.knownKey.exactRecovery,true);
assert.ok(out.rawCandidates.every(x=>x.page===3));
console.log(JSON.stringify({
  intent:'LP3 source means first-release LP1 physical 03.jpg WELCOME, not LP2 p3 20.jpg',
  sourceClue:'p57 PARABLE7, 13 red dots -> clockwise 32x8 rim position13',
  authorPlaintextEcho:'LIKE THE INSTAR occurs in LP1 WELCOME and solved LP2 PARABLE',
  candidatePassword:candidate, target:'resources/liber-primus/03.jpg',
  originalImageBytes:fs.statSync(sourceJpeg).size,
  attempts:out.attempts, controls:out.controls,
  extracted:out.rawCandidates,
  plausible:out.plausible, rejectedSignals:out.rejectedSignals,
  verdict:'An actual authenticated plaintext/key requires a valid recognizable payload; OutGuess header alone is never evidence'
},null,2));
console.log('PASS frozen LP1 original p03 keyed OutGuess experiment and controls');
