'use strict';
/**
 * Source-frozen OutGuess test of exact p57→p50 perimeter key on original LP1 03.jpg.
 * Run: node sims/lp2_p57_lp3_lp1p03_outguess_source_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const grid=read('resources/liber-primus/base60-grid.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const p57=ink.pages.find(p=>p.page===57);
assert(p57);
assert.deepEqual(p57.large_punctuation,[[7,13,'red'],[95,23,'red']]);
assert.deepEqual(p57.red_spans.map(s=>[s.start,s.length]),[[0,7]]);
assert.equal(corpus.pages[57].indices.slice(0,7).map(i=>corpus.translit[i]).join(''),'PARABLE');
assert.deepEqual(grid.page_row_counts,[10,13,9]);
const rows=grid.byte_rows;
assert.equal(rows.length,32);
assert(rows.every(row=>row.length===8));
const ring=[...rows[0],
 ...Array.from({length:31},(_,i)=>rows[i+1][7]),
 ...rows[31].slice(0,7).reverse(),
 ...Array.from({length:30},(_,i)=>rows[30-i][0])];
assert.equal(ring.length,76);
assert.deepEqual(ring.slice(12,19),[76,80,51,108,82,65,35]);
const key=Buffer.from(ring.slice(12,19)).toString('latin1');
assert.equal(key,'LP3lRA#');
assert.equal(Number(key[2]),3);
assert(fs.statSync(path.join(root,'resources/liber-primus/03.jpg')).size>10000);
const probe=spawnSync(process.execPath,[path.join(root,'sims/outguess_lp2_keyed_probe.cjs')],{
 cwd:root,encoding:'utf8',timeout:240000,maxBuffer:16*1024*1024,
 env:{...process.env,LP2_OUTGUESS_PASSWORD:key,LP2_OUTGUESS_SOURCE_IMAGE:'3'}
});
assert.equal(probe.status,0,probe.stderr+'\n'+probe.stdout);
const report=read('outguess-results-keyed/summary.json');
assert.deepEqual(report.keys,[key]);
assert.deepEqual(report.pages,[3]);
assert.equal(report.attempts,1);
assert.equal(report.controls.knownKey.exactRecovery,true);
assert.deepEqual(report.controls.authenticDefaultImages,[0,8]);
assert(report.rawCandidates.every(x=>x.page===3));
console.log(JSON.stringify({
 target:'original LP1 03.jpg',key,sourceOuterIndices:[47,55,63,71,79,87,95],
 headerMatches:report.headerMatches,plausible:report.plausible,
 rawCandidates:report.rawCandidates,
 syntheticNoPayload:report.controls.syntheticNoPayload,
 rejectedSignals:report.rejectedSignals,rejectedExitCodes:report.rejectedExitCodes
},null,2));
console.log('PASS: source exact LP1 03.jpg single-password OutGuess with original solved controls');
