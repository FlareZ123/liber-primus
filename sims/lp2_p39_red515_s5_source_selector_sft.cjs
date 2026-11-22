'use strict';

/**
 * Original p39 red GP29 triad as a visual selector of the preexisting
 * strongest lag-and-rune autocorrelation (5,S GP29 index15).
 *
 * Test *all* adjacent red-rune pairs across all 18 authentic red spans.
 * Interpret the first GP29 index literally as lag in the already motivated
 * finite range 2..7, second as a rune being echoed at that lag.
 * No plaintext, key, new probability or second search is inferred.
 *
 * Source regression: Node 22 CommonJS, no args.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseUnsolved} = require('./lag6_conditioned_echo.cjs');
const {scanCounts} = require('./short_lag_rune_identity_scan.cjs');

const root = path.join(__dirname, '..', 'resources');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'liber-primus','lp2-corpus.json'),'utf8'));
const annotations = JSON.parse(fs.readFileSync(path.join(root,'liber-primus','lp2-ink-annotations.json'),'utf8'));
const original = fs.readFileSync(path.join(root,'lp2-transcription.txt'),'utf8');
assert.equal(corpus.runes.length, 29);
const index = new Map(corpus.runes.map((rune, i) => [rune,i]));
const words = parseUnsolved(original);
assert.equal(words.length,2896);
assert.equal(words.reduce((n,w)=>n+w.length,0),12956);
const count = scanCounts(words.filter(w=>w.length>=3));
assert.equal(count.length,174);

const sourceCandidates=[];
let redSpans=0;
for (const page of annotations.pages) for (let si=0;si<(page.red_spans||[]).length;si++) {
  const span=page.red_spans[si];
  redSpans++;
  const red=[...span.runes].map(rune=>{
    const result=index.get(rune);
    assert.ok(result!==undefined);
    return result;
  });
  const sourcePage=corpus.pages.find(p=>p.page===page.page);
  assert.ok(sourcePage);
  assert.deepEqual(sourcePage.indices.slice(span.start,span.start+span.length),red);
  for(let j=0;j<red.length-1;j++){
    const [lag,symbol]=red.slice(j,j+2);
    if(lag<2||lag>7)continue;
    sourceCandidates.push({page:page.page,span:si,redOffset:j,lag,
      symbol,sourcePosition:span.start+j,
      originalMatches:count[(lag-2)*29+symbol]});
  }
}
assert.equal(redSpans,18);
assert.equal(sourceCandidates.length,41);
const selected=sourceCandidates.filter(x=>x.lag===5&&x.symbol===15);
assert.deepEqual(selected,[{
  page:39,span:0,redOffset:1,lag:5,symbol:15,
  sourcePosition:120,originalMatches:11
}]);
const ink39=annotations.pages.find(x=>x.page===39);
assert.deepEqual([...ink39.red_spans[0].runes].map(x=>index.get(x)),[27,5,15]);
const fifthSymbol=corpus.runes[15];
assert.equal(fifthSymbol,'ᛋ');

// Historic conditional S5 174-model scan is established elsewhere in the
// repository. This SFT asserts the raw original evidence and source ranking,
// and does not rerun/claim fresh familywise significance from original text.
const observedTop11=sourceCandidates.filter(x=>x.originalMatches>=11);
assert.equal(observedTop11.length,4);
assert.ok(observedTop11.some(x=>x.page===39&&x.lag===5&&x.symbol===15));

console.log(JSON.stringify({
  status:'PASS: in-book p39 red 5,15 is unique among all red lag-symbol pairs',
  source:{originalInkRedSpans:redSpans,eligibleAdjacentRedPairs:sourceCandidates.length,
    sourceRule:'first adjacent GP29 index 2..7 = word-local lag, second = repeated rune'},
  original:{words:2896,runes:12956,unsolvedPages:56,
    strongestPublished174Hypothesis:'lag5 symbol15 = S→S 11 matches, prior null z6.82, no discovery-wide p',
    selected: selected[0],
    otherRawCount11Candidates:observedTop11.filter(x=>x.page!==39)},
  sourceContext:'signed 2013 toy DH generator5 and recoverable client exponent15; p39 red factor earlier known',
  limitation:'operational red-pair interpretation is post-selected after S5 discovery; no plaintext or cipher'
},null,2));
