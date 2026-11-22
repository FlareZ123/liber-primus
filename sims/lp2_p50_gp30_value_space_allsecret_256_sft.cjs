'use strict';

/**
 * Original LP2 p50 256-cell key-clock versus GP30 movable-space cipher.
 * 29 Gematria Primus runes + one interword token = 30 symbols. A printed
 * period is carried as visible punctuation-type metadata of that source mark.
 *
 * The exact M6 bound allows every source table position (or every distinct
 * printed table value) its own UNRESTRICTED SECRET 30! substitution alphabet:
 * for any fixed six plaintext symbols, at most the six most abundant source
 * ciphertext symbols in each state can map to them. Sum those six counts.
 *
 * Clock branches are explicit: original character tokens or source-rune-only,
 * either continuous over physical p0..p55 or reset at each physical page.
 * Source-rune clocks here only establish a conditional all-secret capacity
 * theorem on the actual ciphertext-state register. The fully executable
 * inverses below use token clocks so their source-index timing is symmetric.
 *
 * Windows Node.js 22 single-file read-only test. Use repo-root paths.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');

/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/\r\n/g, '\n');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const glyph = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const TABLE = grid.byte_rows.flat();
assert.equal(TABLE.length, 256);
assert.equal(new Set(TABLE).size, 161);
assert.ok(TABLE.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

const rawPages = transcript.split('%');
assert.equal(rawPages.length, 57);
const headings = transcript.match(/[1-7]-/g) || [];
assert.deepEqual(headings.slice().sort(), ['1-', '2-', '3-', '4-', '5-', '7-']);

/** @param {string} raw @returns {number[]} */
function parseTape(raw) {
  const a = [];
  for (const ch of raw.replace(/[1-7]-/g, '')) {
    if (glyph.has(ch)) a.push(glyph.get(ch));
    else if (ch === '-' || ch === '.') a.push(29);
  }
  return a;
}

const pages = Array.from({length: 56}, (_, p) => ({
  page: p,
  tape: p === 50 ? [] : parseTape(rawPages[p < 50 ? p : p - 1])
}));
for (const part of pages) {
  const original = corpus.pages[part.page].indices;
  assert.deepEqual(part.tape.filter(x => x < 29), original,
    'original rune alignment p' + part.page);
}
const SOURCE = pages.flatMap(part => part.tape);
assert.equal(SOURCE.length, 15852);
assert.equal(SOURCE.filter(x => x < 29).length, 12956);
assert.equal(SOURCE.filter(x => x === 29).length, 2896);

/**
 * Calculate all source table clock positions. The source ciphertext, not
 * a guessed plaintext, defines the rune-only clock. A global page carries
 * across rune-free p50 without advancing.
 * @param {'global-token'|'global-rune'|'page-token'|'page-rune'} clock
 * @returns {number[]}
 */
function sourceIndices(clock, period=256) {
  const indices = [];
  let globalToken = 0, globalRune = 0;
  for (const page of pages) {
    let localToken = 0, localRune = 0;
    for (const sym of page.tape) {
      const n = clock.startsWith('global')
        ? (clock.endsWith('token') ? globalToken : globalRune)
        : (clock.endsWith('token') ? localToken : localRune);
      indices.push(n % period);
      globalToken++;
      localToken++;
      if (sym < 29) {
        globalRune++;
        localRune++;
      }
    }
  }
  assert.equal(indices.length, SOURCE.length);
  return indices;
}

/**
 * Exact universal occupancy ceiling. A single target six-symbol set can
 * receive at most six source classes from each bijective state alphabet.
 * The six classes may differ across states, making this an especially
 * generous full-secret bound. No key optimization is performed.
 *
 * @param {number[]} tape Source ciphertext observations
 * @param {number[]} indices Source-derived cell positions
 * @param {boolean} mergeEqualTableValues Force equal printed p50 values to share a secret alphabet
 * @returns {{M1:number,M5:number,M6:number,M7:number,states:number}}
 */
function capacity(tape, indices, mergeEqualTableValues) {
  assert.equal(tape.length, indices.length);
  const histogram = Array.from({length: mergeEqualTableValues ? 256 : Math.max(...indices)+1}, () => new Uint32Array(30));
  for (let i = 0; i < tape.length; i++) {
    const state = mergeEqualTableValues ? TABLE[indices[i]] : indices[i];
    histogram[state][tape[i]]++;
  }
  const cap = k => histogram.reduce((sum, h) =>
    sum + Array.from(h).sort((a, b) => b-a).slice(0,k)
      .reduce((a,b) => a+b, 0), 0);
  return {
    M1:cap(1), M5:cap(5), M6:cap(6), M7:cap(7),
    states:histogram.filter(h => h.some(Boolean)).length
  };
}

/** @param {number[]} a */
function metrics(a) {
  const hist = Array(29).fill(0);
  for (const x of a) if (x !== 29) hist[x]++;
  const runes = hist.reduce((a,b) => a+b,0);
  const spaces = a.length-runes;
  const top5 = hist.slice().sort((a,b) => b-a).slice(0,5)
    .reduce((a,b) => a+b,0);
  const ioc = hist.reduce((sum,n) => sum+n*(n-1),0)/(runes*(runes-1));
  let longest = 0, current = 0;
  for (const x of a) {
    if (x === 29) {longest = Math.max(longest,current);current=0;}
    else current++;
  }
  return {
    tokens:a.length,runes,spaces,top5,combined6:top5+spaces,
    combinedShare:(top5+spaces)/a.length,
    runeTop5:top5/runes, ioc,
    longestWord:Math.max(longest,current)
  };
}

/** @param {number} first @param {number} last @returns {[number,number]} */
function physicalOffsets(first,last) {
  assert.ok(first >= 0 && last < pages.length && first <= last);
  const a = pages.slice(0,first).reduce((n,p) => n+p.tape.length,0);
  const len = pages.slice(first,last+1).reduce((n,p) => n+p.tape.length,0);
  return [a,a+len];
}

/**
 * Natural direct p50 integer modulo 30 GP30-Vigenere inverse, with no
 * discovered missing key. The printed table entries are 0..255; the exact
 * ordinal cell clock is source-fixed once the reset convention is chosen.
 * @param {number[]} input @param {number[]} indices @param {number} direction
 * @param {boolean} reverseTable Deliberately wrong-source order control
 */
function shift(input,indices,direction,reverseTable=false) {
  return input.map((x,i) => {
    const cell = reverseTable ? TABLE[255-indices[i]] : TABLE[indices[i]];
    return (x + direction*(cell%30) + 3000)%30;
  });
}

/** @param {number[]} tape @param {number} n */
function preview(tape,n=110) {
  return tape.slice(0,n).map(x => x===29?' ':corpus.translit[x]).join('');
}

/** @param {string} source @returns {number[]} */
function nativeGP30(source) {
  const alphabet = new Map(corpus.translit.map((x,i)=>[x,i]));
  const out = [];
  for (const word0 of source.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = word0.replace(/QU/g,'CW').replace(/V/g,'U')
      .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
    for (let i = 0; i < word.length;) {
      const two = alphabet.get(word.slice(i,i+2));
      if (two !== undefined) {out.push(two);i+=2;continue;}
      const one = alphabet.get(word[i]);
      assert.notEqual(one,undefined);
      out.push(one);
      i++;
    }
    out.push(29);
  }
  if (out.length) out.pop();
  return out;
}

/** @returns {number} deterministic uint32 */
function randFactory() {
  let seed=0x3301a57d;
  return function next() {
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return seed>>>0;
  };
}

function positivePlant(native, indices) {
  const next=randFactory();
  const enc=Array.from({length:256},()=>Array.from({length:30},(_,i)=>i));
  for(const key of enc)
    for(let i=29;i>0;i--){
      const j=next()%(i+1);
      [key[i],key[j]]=[key[j],key[i]];
    }
  const dec=enc.map(p=>{
    const inv=Array(30);
    p.forEach((x,i)=>{inv[x]=i;});
    return inv;
  });
  // Same printed table VALUE, even at different cells, uses one alphabet.
  const encrypted=native.map((x,i)=>enc[TABLE[indices[i]]][x]);
  const decrypted=encrypted.map((x,i)=>dec[TABLE[indices[i]]][x]);
  assert.deepEqual(decrypted,native);
  return {ciphertext:encrypted,combined6:metrics(native).combined6};
}

const controlsText=read('resources/control/gibran_prophet_58585.txt');
const beginning=controlsText.indexOf('*** START OF');
const ending=controlsText.indexOf('*** END OF',beginning+1);
assert.ok(beginning>=0 && ending>beginning);
const native=nativeGP30(controlsText.slice(beginning,ending));
assert.ok(native.length>15852+35000);
const windowStarts=[0,5000,10000,15000,20000,25000,30000,35000];
const controls=windowStarts.map(start=>({start,...metrics(native.slice(start,start+SOURCE.length))}));
const nativeMinimum=Math.min(...controls.map(x=>x.combinedShare));
const p57=metrics(parseTape(rawPages[56]));
assert.equal(p57.runes,95);
assert.equal(p57.spaces,20);
assert.equal(p57.top5,46);
const capacities=[];
for(const clock of ['global-token','global-rune','page-token','page-rune']){
  const indices=sourceIndices(clock);
  for(const merge of [false,true]){
    const data=capacity(SOURCE,indices,merge);
    assert.ok(data.M6 < nativeMinimum*SOURCE.length,
      'Gibran native combined-six minimum should exceed all-source cap');
    assert.ok(data.M6/SOURCE.length < p57.combinedShare);
    capacities.push({
      clock,secretRowKey:merge?'p50-printed-value':'p50-cell-position',
      ...data,cap6Share:data.M6/SOURCE.length
    });
  }
}

// A further independent model decision: replace the 256 p50 clock with
// ANY secret stationary GP30 alphabet at each position of a periodic
// source tape. The table is a motivated special case, but an unknown
// period does not rescue all finite periods. This checks every period
// through the first native-possible continuous-clock period. Page-local
// resets saturate above the maximum physical page length, proving an
// all-positive-period conditional gate for a SHARED key per page offset.
const nativeTarget=Math.min((181+320)/(755+181),
  p57.combinedShare, nativeMinimum);
const nativeTargetCount=nativeTarget*SOURCE.length;
const periodFrontier=[];
const periodTests=[
  {clock:'global-token',maxExcluded:404,firstPossiblyFeasible:405},
  {clock:'global-rune',maxExcluded:413,firstPossiblyFeasible:414},
  {clock:'page-token',maxExcluded:347,saturatedAt:347},
  {clock:'page-rune',maxExcluded:278,saturatedAt:278}
];
for(const spec of periodTests) {
  let maxM6=0,highestAt=0;
  for(let period=1;period<=spec.maxExcluded;period++) {
    const M6=capacity(SOURCE,sourceIndices(spec.clock,period),false).M6;
    if(M6>maxM6){maxM6=M6;highestAt=period;}
    assert.ok(M6<nativeTargetCount,
      'unexpected native-possible M6 at '+spec.clock+' period '+period);
  }
  const next=spec.firstPossiblyFeasible
    ? capacity(SOURCE,sourceIndices(spec.clock,spec.firstPossiblyFeasible),false).M6
    : null;
  if(next!==null) assert.ok(next>=nativeTargetCount,
    'first native-possible period must cross control threshold');
  let saturation=null;
  if(spec.saturatedAt) {
    const at=capacity(SOURCE,sourceIndices(spec.clock,spec.saturatedAt),false).M6;
    const far=capacity(SOURCE,sourceIndices(spec.clock,800),false).M6;
    assert.equal(at,far,'page-offset clock did not saturate');
    saturation={period:spec.saturatedAt,M6:at,
      share:at/SOURCE.length,
      reason:'all larger periods have identical source page-offset states'};
  }
  periodFrontier.push({
    clock:spec.clock,allExcludedThrough:spec.maxExcluded,
    largestObservedM6:maxM6,atPeriod:highestAt,
    firstPossiblyFeasible:spec.firstPossiblyFeasible||null,
    firstPossiblyFeasibleM6:next,saturation
  });
}

// Independently check a full-length native-GP ciphertext plant under 161
// arbitrary source-value keyed substitutions and its exact GP30 inverse.
const index=sourceIndices('global-token');
const nativeWindow=native.slice(15000,15000+SOURCE.length);
const planted=positivePlant(nativeWindow,index);
const plantedBound=capacity(planted.ciphertext,index,true);
assert.ok(plantedBound.M6>=planted.combined6);
const direct=[];
for(const clock of ['global-token','page-token']){
  const indices=sourceIndices(clock);
  for(const sign of [-1,1]){
    for(const wrongSource of [false,true]){
      const candidate=shift(SOURCE,indices,sign,wrongSource);
      assert.deepEqual(shift(candidate,indices,-sign,wrongSource),SOURCE);
      const [a,b]=physicalOffsets(16,21);
      const [c,d]=physicalOffsets(40,53);
      direct.push({
        clock,sign,wrongSource,
        full:metrics(candidate),
        p16to21:metrics(candidate.slice(a,b)),
        p40to53:metrics(candidate.slice(c,d)),
        first110:preview(candidate.slice(a,b))
      });
    }
  }
}
console.log(JSON.stringify({
  test:'LP2 original p50 GP30 space-changing 256-period all-secret gate',
  source:{tokens:SOURCE.length,runes:12956,marks:2896,
    actualTableValues:new Set(TABLE).size,
    range16to21:metrics(SOURCE.slice(...physicalOffsets(16,21))),
    range40to53:metrics(SOURCE.slice(...physicalOffsets(40,53)))},
  genuineSolvedP57:p57,
  authenticLP1KnownReference:{runes:755,marks:181,topFiveRunes:320,
    combinedShare:(181+320)/(755+181)},
  nativeGibranControl:{windowCount:controls.length,
    minCombinedShare:nativeMinimum,
    maxCombinedShare:Math.max(...controls.map(x=>x.combinedShare)),
    firstWindow:controls[0]},
  capacities,periodFrontier,positivePlant:{nativeCombinedSix:planted.combined6,
    cipherAllSecretCeiling:plantedBound.M6,exactRoundTrip:true},
  direct
},null,2));
