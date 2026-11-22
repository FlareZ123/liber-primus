"use strict";
/**
 * All-secret stationary post-EA successor-row gate for the original LP2.
 * Every unknown plaintext-symbol row may be an independent secret 28-way
 * bijection. Only the row immediately following a proposed zero-step GP EA
 * anchor is tested; no secret key, Caesar offset, or rune label is fitted.
 *
 * Reproduce: node sims/ea_successor_allsecret_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n,p) => n + p.indices.length, 0), 12956);
const TOKENS = corpus.translit.map((name,i) => ({name,i}))
  .sort((a,b) => b.name.length - a.name.length);

/** @param {string} text Plain English Latin lettering. @returns {number[]} */
function encode(text) {
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/Q/g, "C");
    for (let i=0; i<word.length;) {
      const token = TOKENS.find(x => word.startsWith(x.name, i));
      assert(token, "Unsupported GP spelling: " + word.slice(i));
      output.push(token.i);
      i += token.name.length;
    }
  }
  return output;
}
/** @param {number[]} a Nonzero successor symbols. */
function stats(a) {
  const counts = Array(29).fill(0);
  for (const x of a) {
    assert(Number.isInteger(x) && x >= 0 && x <= 28);
    counts[x]++;
  }
  const sorted = counts.slice().sort((x,y) => y-x);
  return {
    n:a.length, maximum:sorted[0],
    distinct:counts.filter(x => x > 0).length,
    equalOrderedPairs:counts.reduce((n,c) => n+c*(c-1), 0),
    possibleOrderedPairs:a.length*(a.length-1),
    topEight:sorted.slice(0,8).reduce((n,v) => n+v, 0)
  };
}
/** @param {{indices:number[]}[]} originalPages */
function markerSuccessors(originalPages) {
  const steps = [];
  let markers = 0;
  for (const page of originalPages) {
    const c = page.indices;
    for (let i=1; i<c.length; i++) {
      if (c[i] !== c[i-1]) continue;
      markers++;
      if (i+1 < c.length) steps.push((c[i+1]-c[i]+29)%29);
    }
  }
  return {markers, steps};
}
/** @param {number[]} letters GP-coded corpus. */
function afterEA(letters) {
  const out = [];
  for (let i=1; i<letters.length; i++)
    if (letters[i-1] === 28 && letters[i] !== 28) out.push(letters[i]);
  return out;
}
/** @param {number[]} source @param {number} n */
function exactWindows(source,n) {
  assert(source.length >= n);
  let minimumMaximum=Infinity, maximumDistinct=0;
  let minimumEqualPairs=Infinity, countMaxAtMostEight=0;
  let countDistinctAtLeast28=0, scanned=0;
  const counts = new Int32Array(29);
  for (let i=0; i<n; i++) counts[source[i]]++;
  for (let start=0; start+n<=source.length; start++) {
    let mx=0, distinct=0, pairs=0;
    for (const c of counts) {
      mx=Math.max(mx,c);
      distinct+=Number(c>0);
      pairs+=c*(c-1);
    }
    minimumMaximum=Math.min(minimumMaximum,mx);
    maximumDistinct=Math.max(maximumDistinct,distinct);
    minimumEqualPairs=Math.min(minimumEqualPairs,pairs);
    countMaxAtMostEight+=Number(mx<=8);
    countDistinctAtLeast28+=Number(distinct>=28);
    scanned++;
    if (start+n<source.length) {
      counts[source[start]]--;
      counts[source[start+n]]++;
    }
  }
  return {
    windows:scanned, minimumMaximum,maximumDistinct,minimumEqualPairs,
    countMaxAtMostEight,countDistinctAtLeast28
  };
}
/** Deterministic source-independent pseudo-random secret row generation. */
function rowTables() {
  let state=0x1991ea28;
  const random=() => {
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return state>>>0;
  };
  const rows = Array.from({length:29}, () => {
    const p=Array.from({length:28}, (_,i) => i+1);
    for (let i=27;i>0;i--) {
      const j=random()%(i+1);
      [p[i],p[j]]=[p[j],p[i]];
    }
    assert.equal(new Set(p).size,28);
    return p;
  });
  const inverse=rows.map(p => {
    const row=new Int8Array(29).fill(-1);
    for (let i=0;i<28;i++) row[p[i]]=i;
    return row;
  });
  return {rows,inverse};
}
/**
 * Each previous-plaintext rune owns an independent unknown 28-permutation.
 * Every GP-EA source symbol emits zero; every other source symbol emits one
 * nonzero step. This is fully invertible given the transmitted first symbol.
 * @param {number[]} source @param {number} offset
 * @param {ReturnType<typeof rowTables>} secret
 */
function positivePlant(source, offset, secret) {
  const plain=source.slice(offset,offset+12956);
  assert.equal(plain.length,12956);
  let from=0,verified=0;
  const ciphertext=[];
  for (const page of pages) {
    const original=plain.slice(from,from+page.indices.length);
    let previousCipher=original[0];
    const emitted=[previousCipher], recovered=[original[0]];
    for (let i=1;i<original.length;i++) {
      const next=original[i];
      const difference=next===28?0:secret.rows[original[i-1]][next];
      previousCipher=(previousCipher+difference)%29;
      emitted.push(previousCipher);
      const observed=(emitted[i]-emitted[i-1]+29)%29;
      const decoded=observed===0?28:secret.inverse[recovered[i-1]][observed];
      assert.equal(decoded,next);
      recovered.push(decoded);
    }
    assert.deepEqual(recovered,original);
    for (let i=1;i<recovered.length;i++) {
      const expected=recovered[i]===28?0:
        secret.rows[recovered[i-1]][recovered[i]];
      assert.equal((emitted[i]-emitted[i-1]+29)%29,expected);
    }
    verified+=recovered.length;
    from+=original.length;
    ciphertext.push({indices:emitted});
  }
  assert.equal(verified,12956);
  const pairs=markerSuccessors(ciphertext);
  const after=stats(pairs.steps);
  return {sourceOffset:offset,verifiedPlaintextRunes:verified,
    forwardRoundTripRunes:verified,markedPairs:pairs.markers,
    usablePostMarker:after.n,maximum:after.maximum,distinct:after.distinct};
}
function run() {
  const original=markerSuccessors(pages);
  assert.equal(original.markers,86);
  const all=stats(original.steps);
  assert.equal(all.n,85);
  assert.equal(all.maximum,8);
  assert.equal(all.distinct,28);
  assert.equal(original.steps.includes(0),false);
  const texts=[
    ["Shakespeare","resources/control/shakespeare_first300k.txt",218800],
    ["Gibran","resources/control/gibran_prophet_58585.txt",63114],
    ["Emerson","resources/control/emerson_essays_2944.txt",324630]
  ];
  const controls=[],sources=new Map();
  for (const [name,file,expected] of texts) {
    const source=encode(read(file));
    assert.equal(source.length,expected);
    sources.set(name,source);
    const followers=afterEA(source);
    const profile=stats(followers);
    const windows=exactWindows(followers,85);
    assert.equal(windows.countMaxAtMostEight,0);
    assert.equal(windows.countDistinctAtLeast28,0);
    controls.push({name,sourceRunes:source.length,EA:source.filter(x=>x===28).length,
      postEA:profile.n,fullProfile:{maximum:profile.maximum,distinct:profile.distinct,
      equalOrderedPairs:profile.equalOrderedPairs},
      exact85EventWindows:windows});
  }
  assert.deepEqual(controls.map(x=>x.exact85EventWindows.minimumMaximum),[17,20,13]);
  assert.deepEqual(controls.map(x=>x.exact85EventWindows.maximumDistinct),[15,16,15]);
  const secret=rowTables();
  const positive=[
    {name:"Shakespeare",...positivePlant(sources.get("Shakespeare"),25000,secret)},
    {name:"Gibran",...positivePlant(sources.get("Gibran"),10000,secret)}
  ];
  assert.deepEqual(positive.map(x=>x.maximum),[39,45]);
  assert.deepEqual(positive.map(x=>x.distinct),[11,13]);
  const result={
    classification:"Conditional all-secret exact successor-row obstruction; no unknown plaintext recovered",
    model:"Each GP-EA plaintext rune generates a zero output step; otherwise a stationary, arbitrary 28-way secret output permutation indexed by preceding plaintext rune maps current GP rune to one of the 28 nonzero mod29 differences",
    original:{markerEvents:original.markers,postMarkerSteps:all},
    independentNativeControls:controls,
    fullCipherPositivePlants:positive,
    consequences:"The original 85 post-zero difference values have max multiplicity 8 and use all 28 nonzero symbols. A single fixed secret EA-predecessor row can only relabel these values. No contiguous 85-event window of the three GP-native English references fits their relabeling-invariant maximum or distinctness.",
    limitations:"Conditional on zero steps exposing one fixed GP-EA plaintext symbol, a stationary previous-plaintext-symbol row, published GP29 arithmetic, and GP-native unmodified prose. A different word encoding or language, ciphertext-state row, outer alphabet, page/position/marker-dependent row or nonlinear side channel is outside this gate."
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if (require.main===module)run();
module.exports={encode,stats,markerSuccessors,afterEA,exactWindows,rowTables,positivePlant,run};
