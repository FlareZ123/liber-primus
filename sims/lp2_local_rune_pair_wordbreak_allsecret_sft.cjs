'use strict';

/**
 * Original LP2 ciphertext-only word-break generation challenge.
 * Can a secret local rune pair/triple lookup recover all printed gaps?
 * Exact all-key oracle, held-out predictive control and positive plants.
 *
 * Run on Windows / Node.js >= 20:
 *   node sims/lp2_local_rune_pair_wordbreak_allsecret_sft.cjs
 *
 * No files are written and no network, third-party packages, CLI options,
 * guessed keys or plaintext-language scoring are involved.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
/** @type {{runes:string[],pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
/** @typedef {{c:number,p:number,sep:string}} Glyph */
/** @type {Glyph[]} */
const glyphs = [];
let segment = 0, separator = '';
for (const ch of text) {
  if (alphabet.has(ch)) {
    if (glyphs.length === 12956) break; // source-solved p56–57 are held out of unknown source
    glyphs.push({
      c:/** @type {number} */(alphabet.get(ch)),
      p:segment < 50 ? segment : segment + 1, // original p50 has no GP rune
      sep:separator
    });
    separator = '';
  } else {
    separator += ch;
    if (ch === '%') segment++;
  }
}
assert.equal(glyphs.length, 12956);
assert.equal(corpus.runes.length, 29);
for (let p = 0; p < 56; p++) {
  const actual = glyphs.filter(g => g.p === p).map(g => g.c);
  assert.deepEqual(actual, corpus.pages[p].indices, 'original physical page ' + p);
}
/** @typedef {{p:number,ch:number,i:number,y:number,one:number,two:number,three:number}} Row */
/** @type {Row[]} */
const rows = [];
const chapterEnds = [729,1874,3603,5506,6527,7960,9640,12648,12956];
let bookBreaks = 0, outsidePage = 0;
for (let i = 1; i < glyphs.length; i++) {
  const a = glyphs[i - 1], b = glyphs[i];
  const y = Number(/[.\-&$]/.test(b.sep)); // exact manuscript printed word separators
  bookBreaks += y;
  if (a.p !== b.p) {
    outsidePage++;
    continue; // local mapping reset, no fictitious within-page adjacent pair
  }
  const ch = chapterEnds.findIndex(end => i - 1 < end);
  const two = a.c * 29 + b.c;
  const three = i > 1 && glyphs[i-2].p === a.p ?
    glyphs[i-2].c * 29 * 29 + two : -1; // distinct physical-page start sentinel
  rows.push({p:a.p,ch,i,y,one:a.c,two,three});
}
assert.equal(rows.length,12901);
assert.equal(outsidePage,54);
assert.equal(bookBreaks,2895);
assert.equal(rows.reduce((s,r)=>s+r.y,0),2873);
assert.equal(rows.reduce((s,r)=>s+1-r.y,0),10028);

/**
 * An exact all-secret oracle for any deterministic Boolean lookup.
 * Every position in a shared equivalence class must share its break label,
 * independently of how the key table is chosen.
 *
 * @param {Row[]} data
 * @param {'global'|'chapter'|'page'} scope
 * @param {'one'|'two'|'three'} symbol
 */
function oracle(data,scope,symbol) {
  /** @type {Map<string,[number,number]>} */
  const bins = new Map();
  for (const r of data) {
    const unit = scope === 'global' ? '' : (scope === 'chapter' ? r.ch : r.p) + ':';
    const id = unit + r[symbol];
    const v = bins.get(id) || [0,0];
    v[r.y]++;
    bins.set(id,v);
  }
  let errors=0,contradictory=0,used=0;
  for (const [_,a] of bins) {
    errors += Math.min(a[0],a[1]);
    contradictory += Number(a[0]>0&&a[1]>0);
    used += a[0]+a[1];
  }
  assert.equal(used,data.length);
  return {minErrors:errors,lookupEntriesUsed:bins.size,contradictoryEntries:contradictory};
}
const exact = Object.fromEntries(/** @type {const} */(['global','chapter','page']).map(scope=>[
  scope, Object.fromEntries(/** @type {const} */(['one','two','three']).map(symbol=>[
    symbol,oracle(rows,scope,symbol)
  ]))
]));
assert.equal(exact.global.one.minErrors,2873);
assert.equal(exact.global.two.minErrors,2863);
assert.equal(exact.global.three.minErrors,944);
assert.equal(exact.chapter.two.minErrors,2043);
assert.equal(exact.page.two.minErrors,589);
assert.equal(exact.page.three.minErrors,18);
// A page-specific all-secret table nearly memorizes the original three-rune
// stream, but still cannot represent all breaks without error; it uses
// 12,846 of its available 55*29^3 possible entries, an enormous hidden key.
assert.equal(exact.page.three.lookupEntriesUsed,12846);

// Prospective check: if one global table truly generated source separators,
// the first 40 physical pages should predict held-out p40–55.
// One fixed Beta prior equivalent to 64 sites at the training-wide rate.
// Larger context models are not allowed to fit the held-out target.
const train=rows.filter(r=>r.p<40),hold=rows.filter(r=>r.p>=40);
assert.deepEqual([train.length,hold.length],[9600,3301]);
assert.deepEqual([train.reduce((s,r)=>s+r.y,0),hold.reduce((s,r)=>s+r.y,0)],[2141,732]);
const base=train.reduce((s,r)=>s+r.y,0)/train.length;
const priorCount=64;
/** @param {Row[]} data @param {(r:Row)=>number} prediction */
function score(data,prediction) {
  let logScore=0,expectedBreaks=0;
  for(const r of data) {
    const p=prediction(r);
    assert.ok(p>0&&p<1);
    logScore += r.y*Math.log(p)+(1-r.y)*Math.log1p(-p);
    expectedBreaks+=p;
  }
  return {n:data.length,breaks:data.reduce((s,r)=>s+r.y,0),
    predictedBreaks:expectedBreaks,logScore};
}
const stationary=score(hold,()=>base);
const prospective={stationary};
for(const symbol of /** @type {const} */(['one','two','three'])) {
  /** @type {Map<number,[number,number]>} */
  const bins=new Map();
  for(const r of train) {
    const a=bins.get(r[symbol]) || [0,0];
    a[r.y]++;bins.set(r[symbol],a);
  }
  const tested=score(hold,r=>{
    const a=bins.get(r[symbol])||[0,0];
    return (a[1]+priorCount*base)/(a[0]+a[1]+priorCount);
  });
  prospective[symbol]={...tested,logGainAgainstStationary:tested.logScore-stationary.logScore,
    heldoutSitesSeenInTraining:hold.filter(r=>bins.has(r[symbol])).length};
}
assert.ok(Math.abs(stationary.logScore+1746.6246789655)<1e-7);
assert.ok(Math.abs(prospective.two.logScore+1753.5497449204)<1e-7);
assert.ok(Math.abs(prospective.three.logScore+1748.5571237797)<1e-7);

// Two constructive exact positive controls on the original unchanged rune
// stream and unchanged physical page layout. A true global keyed pair rule
// and a true independently keyed per-page pair rule are representable with
// ZERO oracle error, unlike the original manuscript.
const globalSynthetic=rows.map(r=>({...r,y:Number((r.one+2*(r.two%29))%5===0)}));
const pageSynthetic=rows.map(r=>({...r,y:Number((r.one+2*(r.two%29)+r.p)%5===0)}));
assert.equal(oracle(globalSynthetic,'global','two').minErrors,0);
assert.equal(oracle(pageSynthetic,'page','two').minErrors,0);
assert.ok(oracle(pageSynthetic,'global','two').minErrors>0);
const results={
  source:{unknownRunes:glyphs.length,unknownWords:bookBreaks+1,
    eligibleSamePagePairs:rows.length,samePagePrintedBreaks:2873,
    trueBookPrintedBreaks:2895,physicalPageTransitions:outsidePage,
    runeAlphabetSize:29,nativeSource:'lp2-corpus.json + lp2-transcription.txt'},
  test:'all-secret exact minimum-error lookup of source glyph context to printed word-break bit',
  candidateKeys:{one:'previous GP rune',two:'previous+next GP rune',
    three:'previous-previous+previous+next GP rune, page-start sentinel'},
  scopes:{global:'one common secret table',chapter:'nine independent visual chapter tables',
    page:'55 independently secret rune-bearing page tables'},
  exact,prospective:{trainPages:'p0–39',holdPages:'p40–55',
    fixedBetaEquivalentPrior:priorCount,stationaryRate:base,scores:prospective},
  controls:{sourceShapedGlobalPairMinErrors:oracle(globalSynthetic,'global','two').minErrors,
    sourceShapedPageVaryingPairMinErrors:oracle(pageSynthetic,'page','two').minErrors},
  decision:'Direct static local GP-pair/triple lookup cannot recover all original printed breaks; requires extra state, a separate key/input or a changed plaintext boundary framing.',
  boundary:'Source-visible punctuation controls word splits; quoted apostrophes in the original transcription are not independent word breaks.',
  plaintextRecovered:0,pass:true
};
console.log(JSON.stringify(results,null,2));
