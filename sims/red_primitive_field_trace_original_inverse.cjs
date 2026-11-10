"use strict";
/**
 * Original LP2 source-defined GF(29^2) primitive-trace additive inverse.
 * Source: exactly marked p3 red trinomial 13+23u+2u^2, giving u^2=3u+8,
 * primitive element u of order 840. Trace(a+bu)=2a+3b in F29.
 *
 * Exhaust the complete 840 phase orbit in both sequence directions, with
 * page-reset and book-continuous rune clocks. The opposite additive sign
 * is included automatically by a phase shift of 420. A constant GP shift
 * cannot change IoC and therefore need not be searched.
 *
 * This is a finite source-motivated hypothesis test, not an identified cipher.
 * Run with Node 22. No dependencies beyond this repository's corpus fixtures.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const m = x => ((x % 29) + 29) % 29;
const unknown = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const known = corpus.pages.find(p => p.page === 57).indices;

function traceCycle() {
  const triads = ink.pages.flatMap(p => (p.red_spans || [])
    .filter(s => s.length === 3)
    .map(s => [p.page, s.start, [...s.runes].map(r => corpus.runes.indexOf(r))]));
  assert.deepEqual(triads, [[3,119,[13,23,2]],[39,119,[27,5,15]]]);
  assert.equal(corpus.pages.find(p => p.page === 54).indices[0], 24);
  const sequence = [];
  const distinct = new Set();
  let a = 1, b = 0;
  for (let n = 0; n < 840; n++) {
    const state = a + "," + b;
    assert(!distinct.has(state), "p3 root must have primitive order 840");
    distinct.add(state);
    sequence.push(m(2*a + 3*b));
    [a,b] = [m(8*b),m(a + 3*b)];
  }
  assert.deepEqual([a,b],[1,0]);
  assert.equal(distinct.size, 840);
  for (let i = 0; i < 840; i++)
    assert.equal(sequence[(i+420)%840],m(-sequence[i]));
  return sequence;
}

const trace = traceCycle();

/** @param {number[]} values */
function ioc(values) {
  const n = values.reduce((s,v) => s+v, 0);
  return values.reduce((s,v) => s+v*(v-1), 0)/(n*(n-1));
}

/**
 * @param {number} phase
 * @param {1|-1} direction
 * @param {"book"|"page"} clock
 * @returns {{train:number,heldout:number}}
 */
function evaluate(phase,direction,clock) {
  const freq = [Array(29).fill(0),Array(29).fill(0)];
  let globalClock = 0;
  for (const page of unknown) {
    const bins = freq[page.page < 28 ? 0 : 1];
    for (let j = 0; j < page.indices.length; j++) {
      const tick = clock === "page" ? j : globalClock + j;
      const phaseTick = ((phase + direction*(tick%840))%840 + 840)%840;
      bins[m(page.indices[j] - trace[phaseTick])]++;
    }
    globalClock += page.indices.length;
  }
  return {train:ioc(freq[0]),heldout:ioc(freq[1])};
}

/**
 * @param {number[]} input
 * @param {number} phase
 * @param {1|-1} direction
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function translateBook(input,phase,direction,encrypt) {
  return input.map((symbol,index) => {
    const tick = ((phase + direction*(index%840))%840 + 840)%840;
    return m(symbol + (encrypt ? trace[tick] : -trace[tick]));
  });
}

function main() {
  assert.equal(unknown.reduce((s,p) => s+p.indices.length,0),12956);
  const source = unknown.flatMap(p => p.indices);
  const results = [];
  for (const clock of ["book","page"])
    for (const direction of [1,-1])
      for (let phase = 0; phase < 840; phase++)
        results.push({clock,direction,phase,...evaluate(phase,direction,clock)});
  assert.equal(results.length,3360);
  results.sort((a,b) => b.train-a.train);
  const best = results[0];
  const heldoutMax = results.reduce((a,b) => b.heldout>a.heldout?b:a);
  const frozen = [0,24,119].map(phase => ({
    phase,book:evaluate(phase,1,"book"),page:evaluate(phase,1,"page")
  }));

  // All keys can mechanically re-encrypt. This invariance is essential
  // for correct code but never identifies an authentic key.
  const decoded = translateBook(source,best.phase,best.direction,false);
  assert.deepEqual(translateBook(decoded,best.phase,best.direction,true),source);
  const planted = source.map((_,i) => known[i%known.length]);
  const plantedCipher = translateBook(planted,24,1,true);
  const recovered = translateBook(plantedCipher,24,1,false);
  assert.deepEqual(recovered,planted);
  const wrong = translateBook(plantedCipher,25,1,false);
  const freq = input => {
    const counts=Array(29).fill(0);
    for(const x of input)counts[x]++;
    return counts;
  };
  const originalIoc = ioc(freq(source));
  console.log(JSON.stringify({
    classification:"Finite source-defined direct-GP additive exclusion; no LP2 plaintext or key",
    source:"p3 red primitive GF29 quadratic; p39 red double-root and p54 Ac are independent context, not fitted key",
    originalPages:55,originalRunes:source.length,
    trainRunes:unknown.filter(p=>p.page<28).reduce((s,p)=>s+p.indices.length,0),
    heldoutRunes:unknown.filter(p=>p.page>=28).reduce((s,p)=>s+p.indices.length,0),
    primitivePeriod:trace.length,signsAbsorbedByPhase420:true,
    familySize:results.length,uniformGp29Ioc:1/29,originalIoc,
    frozen,bestTraining:best,bestHeldoutPostselected:heldoutMax,
    topTraining:results.slice(0,5),
    fullOriginalRoundtrip:source.length+"/"+source.length,
    positiveControl:{register:"historical solved p57 runes repeated to manuscript length",
      plantedPhase:24,plantedRecovered:recovered.length+"/"+planted.length,
      plantedIoc:ioc(freq(planted)),wrongPhaseIoc:ioc(freq(wrong))},
    conclusion:"All 3360 phase-direction-clock models remain near GP-uniform IoC. The primitive field trace is not a direct additive GP plaintext decoder under the two stated clocks."
  },null,2));
}
if (require.main === module) main();
module.exports = {traceCycle,evaluate,translateBook};
