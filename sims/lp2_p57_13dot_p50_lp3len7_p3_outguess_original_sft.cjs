'use strict';

/**
 * Single source-frozen, original-image password candidate:
 * p57 red PARABLE(7 runes) followed by 13 red dots
 * -> p50 32x8 256-byte grid clockwise outside perimeter (76 cells)
 * -> start at one-based index 13, consume seven bytes = "LP3lRA#"
 * -> the initial LP3 plausibly names original LP2 physical p3.
 *
 * Test one historical OutGuess 0.4 keyed receiver on original p3 scan20.jpg
 * with exact existing authentic LP1 default & keyed synthetic positives and
 * explicit empty carrier false-header control. No posthoc key edits.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const grid=read('resources/liber-primus/base60-grid.json');
const corpus=read('resources/liber-primus/lp2-corpus.json');
const ink=read('resources/liber-primus/lp2-ink-annotations.json');
const p57=corpus.pages[57].indices;
const red=ink.pages.find(p=>p.page===57);
assert(red);
assert.deepEqual(red.large_punctuation,[[7,13,'red'],[95,23,'red']]);
assert.equal(red.red_spans.length,1);
const heading=red.red_spans[0];
assert.deepEqual([heading.start,heading.length],[0,7]);
assert.equal(p57.slice(0,7).map(x=>corpus.translit[x]).join(''),'PARABLE');
const r=grid.byte_rows;
assert.equal(r.length,32);
assert(r.every(row=>row.length===8));
const outer=[];
for(let c=0;c<8;c++)outer.push(r[0][c]);
for(let i=1;i<32;i++)outer.push(r[i][7]);
for(let c=6;c>=0;c--)outer.push(r[31][c]);
for(let i=30;i>=1;i--)outer.push(r[i][0]);
assert.equal(outer.length,76);
const start=red.large_punctuation[0][1]-1;
const length=heading.length;
const candidate=Buffer.from(outer.slice(start,start+length)).toString('latin1');
assert.equal(candidate,'LP3lRA#');
assert.deepEqual(outer.slice(start,start+length),[76,80,51,108,82,65,35]);
const targetPage=Number(candidate[2]);
assert.equal(targetPage,3);
const targetJPEG=17+targetPage;
assert.equal(targetJPEG,20);

const program=path.join(root,'sims/outguess_lp2_keyed_probe.cjs');
const call=spawnSync(process.execPath,[program],{
 cwd:root,encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024,
 env:{...process.env,
  LP2_OUTGUESS_PASSWORD:candidate,
  LP2_OUTGUESS_SOURCE_IMAGE:String(targetJPEG)}
});
assert.equal(call.status,0,call.stderr+'\n'+call.stdout);
const results=read('outguess-results-keyed/summary.json');
assert.deepEqual(results.keys,[candidate]);
assert.deepEqual(results.pages,[targetJPEG]);
assert.equal(results.attempts,1);
assert.equal(results.controls.knownKey.exactRecovery,true);
assert.deepEqual(results.controls.authenticDefaultImages,[0,8]);
assert.equal(results.rawCandidates.every(x=>x.page===targetJPEG),true);
console.log(JSON.stringify({
 proof:'source-p57 red PARABLE7 and 13-dot, p50 clockwise outer76 byte13..19, named physical p3 20.jpg',
 key:candidate,sourceGridBytePositions:[47,55,63,71,79,87,95],
 targetJPEG,originalSourceSHA256:grid.sha256||null,
 historicalDefaultKeyControl:results.controls.authenticDefaultImages,
 plantedKeyedOutGuessControl:results.controls.knownKey,
 syntheticEmptyCarrierSameKey:results.controls.syntheticNoPayload,
 sourceOriginal:{attempts:results.attempts,headerMatches:results.headerMatches,
  rawCandidates:results.rawCandidates,plausible:results.plausible,
  rejectedSignals:results.rejectedSignals}
}));
console.log('PASS original 7-character source-selected p57+p50 OutGuess key on physically named p3 with authentic default and keyed synthetic controls');
