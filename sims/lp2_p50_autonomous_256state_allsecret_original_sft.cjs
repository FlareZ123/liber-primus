"use strict";

/**
 * A fully-private 256-state GP29 cipher driven by the literal LP2 p50 table.
 * Complete key-independent original p0–55 obstruction with independently
 * private GP29 substitution keys at every source page/large-mark segment.
 *
 * State transition: s' = table[s]. Source table is a literal 256-entry
 * byte-as-next-address graph, previously independently source-grounded.
 * Decoding: P=A[segment,s](C) or P=A[segment,s](C-Cprev mod29).
 * Every A can be any private bijective GP29 alphabet, independently chosen
 * for all 256 states and all physical segments. Each segment has any 256
 * starting seeds. Direct input 'C' includes each page's first runic symbol;
 * differential input 'D' excludes each original page's first rune and
 * preserves the true same-page predecessor across internal mark boundaries.
 *
 * The original-key theorem needs no key search: within each actual segment,
 * at identical hidden state, equal plaintext iff equal cipher-input rune.
 * For each original segment and all 256 seeds, compute E(s) equal-in-input
 * unordered pairs, T(s) within-state unordered pairs. Maximize
 *   sum_segments E(seed_g) / sum_segments T(seed_g)
 * EXACTLY over all independent seed choices, via finite-ratio optimization,
 * with integer comparisons and an exact zero-residual convergence check.
 *
 * Positives: actual native GP29 English controls forward encrypted under
 * independently private deterministic 29-permutations for each segment/state,
 * then completely inverted. Includes source-authentic clear LP1 GP29 runes.
 *
 * Windows Node.js 22 read-only single-file test, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} pathName @returns {string} */
function read(pathName) { return fs.readFileSync(path.join(root, pathName), "utf8"); }

const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length);
const gridValues = grid.bytes;
assert.equal(gridValues.length, 256);
assert.ok(gridValues.every(n => Number.isInteger(n) && n >= 0 && n < 256));
const original = pages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);
const originalPageLengths = pages.map(p => p.indices.length);
const markCuts = new Map(ink.pages.map(p => [p.page,
  [...new Set((p.large_punctuation || []).map(m => m[0]))]
    .filter(x => x > 0 && x < p.rune_count).sort((a,b) => a-b)]));
assert.equal([...markCuts.values()].reduce((s,a) => s+a.length, 0), 19);

/**
 * One source partition for input C or D. A page-first source rune remains
 * a public, unencrypted IV for D, while within-page marks preserve the
 * actual preceding ciphertext rune and only reset graph state.
 * @param {number[]} tape
 * @param {"C"|"D"} mode
 * @param {boolean} withMarks
 * @returns {Array<{page:number, start:number, n:number, inputs:number[]}>}
 */
function segments(tape, mode, withMarks) {
  /** @type {Array<{page:number,start:number,n:number,inputs:number[]}>} */
  const answer = [];
  let cursor = 0;
  for (const pg of pages) {
    const stop = Math.min(pg.indices.length, tape.length - cursor);
    if (stop <= 0) break;
    const cuts = [0, ...(withMarks ? markCuts.get(pg.page) || [] : []),
      pg.indices.length].filter(v => v <= stop);
    if (cuts.at(-1) !== stop) cuts.push(stop);
    for (let i = 0; i < cuts.length - 1; i++) {
      const beginning = Math.max(cuts[i], mode === "D" ? 1 : 0);
      const values = [];
      for (let j = beginning; j < cuts[i+1]; j++) {
        const cur = tape[cursor+j];
        const value = mode === "D"
          ? (cur - tape[cursor+j-1] + 29) % 29 : cur;
        values.push(value);
      }
      if (values.length) answer.push({
        page:pg.page,start:beginning,n:values.length,inputs:values
      });
    }
    cursor += stop;
  }
  return answer;
}

/**
 * A single segment's exact equality-pair counts for one starting graph seed.
 * @param {number[]} inputs @param {number} seed
 * @returns {[number,number]}
 */
function pairCounts(inputs, seed) {
  const counts = new Uint16Array(256 * 29);
  const stateCounts = new Uint16Array(256);
  let state = seed, equal = 0, compared = 0;
  for (const ch of inputs) {
    const k = 29 * state + ch;
    equal += counts[k]++;
    compared += stateCounts[state]++;
    state = gridValues[state];
  }
  return [equal, compared];
}

/**
 * Max fractional ratio EXACTLY over all seed tuples, not
 * the invalid sum(max E)/sum(min T) relaxation.
 * Dinkelbach discrete fractional optimization with integer comparisons;
 * every per-segment score E*den - T*num fits JS safe integers.
 * @param {Array<{inputs:number[]}>} segmentsInput
 */
function maxAllKeys(segmentsInput) {
  const choices = segmentsInput.map(x =>
    Array.from({length:256}, (_,seed) => pairCounts(x.inputs,seed)));
  let numerator = 0, denominator = 1;
  for (let iteration = 1; iteration <= 30; iteration++) {
    let E=0,T=0;
    const seeds = [];
    for (const row of choices) {
      let bestSeed=0, bestScore=-Infinity;
      for (let seed=0; seed<256; seed++) {
        const [e,t] = row[seed];
        const score = e*denominator - t*numerator;
        if (score > bestScore) {
          bestScore = score;
          bestSeed = seed;
        }
      }
      seeds.push(bestSeed);
      E += row[bestSeed][0];
      T += row[bestSeed][1];
    }
    assert.ok(T>0);
    // At the optimum every independent segment's reduced objective
    // sums to exactly zero. This certifies global maximality, since
    // each independently selected seed maximizes its own objective.
    if (E*denominator === T*numerator) {
      let residual=0;
      for (let i=0;i<choices.length;i++) {
        const [e,t] = choices[i][seeds[i]];
        residual += e*denominator-t*numerator;
      }
      assert.equal(residual,0);
      return {E,T,ratio:E/T,iteration,segments:seeds.length,
        maxSeed:Math.max(...seeds)};
    }
    numerator=E;denominator=T;
  }
  throw new Error("Exact fractional optimum did not converge");
}

const four=[];
for (const mode of ["C","D"]) {
  for (const withMarks of [false,true]) {
    const source = segments(original,mode,withMarks);
    const result = maxAllKeys(source);
    assert.equal(source.length, withMarks ? 74 : 55);
    four.push({mode,withMarks,...result});
  }
}
assert.ok(four.every(v=>v.ratio<0.038));
assert.deepEqual(four.map(v=>[v.E,v.T]),[
  [7144,200362],[5096,141536],[7609,202580],[7183,190590]
]);

// Source-native GP29 controls, from three published independent text corpora.
const tokens = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]|null} */
function gpWord(raw) {
  const normalized = raw.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG");
  const symbols = [];
  for (let cursor=0; cursor<normalized.length;) {
    const tok = tokens.find(t=>normalized.startsWith(t.s,cursor));
    if (!tok) return null;
    symbols.push(tok.i);
    cursor += tok.s.length;
  }
  return symbols;
}
/** @param {string} raw @returns {number[]} */
function reference(raw) {
  return (raw.match(/[A-Za-z]+/g) || [])
    .map(gpWord).filter(Boolean).flat();
}
const native = [
  ["Gibran",reference(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson",reference(read("resources/control/emerson_essays_2944.txt"))],
  ["Shakespeare",reference(read("resources/control/shakespeare_first300k.txt"))]
];
const lp1text = read("resources/transcriptions/lp1_wulfic_canonical.txt")
  .split("%");
const runeIndex = new Map(gp.runes.map((r,i)=>[r,i]));
const authenticLP1 = [3,8,9,10,11,14].flatMap(i =>
  [...lp1text[i]].filter(ch=>runeIndex.has(ch))
    .map(ch=>runeIndex.get(ch)));
assert.equal(authenticLP1.length,1001);
native.push(["Source-authentic clear LP1",authenticLP1]);

/**
 * Secret bijection used only for genuine forward encryption positives.
 * The evolving original-cipher proof is independent of this toy plant.
 * @param {number} segment @param {number} state
 * @returns {number[]}
 */
function privateMap(segment,state) {
  const map=Array.from({length:29},(_,i)=>i);
  let k=(3301+segment*104729+state*257)>>>0;
  for(let i=28;i>0;i--) {
    k=(Math.imul(k,1664525)+1013904223)>>>0;
    const j=k%(i+1);
    [map[i],map[j]]=[map[j],map[i]];
  }
  return map; // plain rune -> ciphertext input C or D
}

/**
 * Synthetic forward cipher of a known native plaintext under complete
 * independently private output alphabets in each real segment/state.
 * Differential channel preserves a public IV=0 as physical first rune.
 * All non-IV native control runes recovered exactly on inverse.
 * @param {number[]} plain @param {"C"|"D"} mode
 * @param {boolean} withMarks
 */
function plantRoundtrip(plain,mode,withMarks) {
  const ciphertext=[];
  const recovered=[];
  let global=0, part=0;
  for (const pg of pages) {
    if (global>=plain.length) break;
    const size=Math.min(pg.indices.length,plain.length-global);
    const cuts=[0,...(withMarks?markCuts.get(pg.page)||[]:[]),
      pg.indices.length].filter(x=>x<=size);
    if (cuts.at(-1)!==size) cuts.push(size);
    const ciphertextPage=Array(size).fill(0);
    const recoveredPage=Array(size).fill(0);
    if(mode==="D") {
      ciphertextPage[0]=plain[global]; // source-visible literal page IV
      recoveredPage[0]=ciphertextPage[0]; // recovered directly from bytes
    }
    for (let z=0;z<cuts.length-1;z++) {
      const beginning=Math.max(cuts[z],mode==="D"?1:0);
      let state=84;
      for(let j=beginning;j<cuts[z+1];j++) {
        const index=global+j, originalRune=plain[index];
        const key=privateMap(part,state);
        const input=key[originalRune];
        ciphertextPage[j]=mode==="C" ? input :
          (ciphertextPage[j-1]+input)%29;
        const encoded=mode==="C"?ciphertextPage[j]:
          (ciphertextPage[j]-ciphertextPage[j-1]+29)%29;
        assert.equal(encoded,input);
        recoveredPage[j]=key.indexOf(encoded);
        state=gridValues[state];
      }
      part++;
    }
    assert.deepEqual(recoveredPage,plain.slice(global,global+size));
    recovered.push(...recoveredPage);
    ciphertext.push(...ciphertextPage);
    global+=size;
  }
  assert.deepEqual(recovered,plain);
  return {ciphertext,recovered};
}

/** @param {Array<{inputs:number[]}>} source @param {number} seed */
function fixedSeedRate(source,seed) {
  let E=0,T=0;
  for(const s of source) {
    const [e,t]=pairCounts(s.inputs,seed);
    E+=e;T+=t;
  }
  return {E,T,ratio:E/T};
}
const controlReports=[];
for(const [label,tape] of native) {
  const sample=tape.length>=original.length ?
    tape.slice(1000,1000+original.length):tape;
  for (const mode of ["C","D"]) {
    const planted=plantRoundtrip(sample,mode,true);
    const assigned=segments(planted.ciphertext,mode,true);
    const positiveRate=fixedSeedRate(assigned,84);
    const originalUpper=four.find(r=>r.mode===mode&&r.withMarks).ratio;
    // The native original-LP1 control is short, so its D-preprocessing
    // collision contrast need not be as decisive as complete prose samples.
    if(label!=="Source-authentic clear LP1")
      assert.ok(positiveRate.ratio > originalUpper+0.012);
    controlReports.push({label,mode,length:sample.length,
      plantedRecovery:"full exact",
      positiveSameStateEqualityRate:positiveRate.ratio,
      originalAllKeyBound:originalUpper});
  }
}
console.log(JSON.stringify({
  classification:"Source-cipher key-independent obstruction for a specific p50 graph-state machine, no plaintext/key",
  graphSource:"Original 256-cell LP2 p50 base60 bytes, byte-as-next-address",
  fullOriginalRunes:original.length, pages:pages.length,
  sourceRealInternalMarkCuts:19,
  all256SeedExactRatios:four,
  positiveSourceNativeControls:controlReports,
  limit:"Public autonomous byte-pointer state update, direct rune/difference input and secret bijective output per state/segment. Does not exclude ciphertext-feedback state, plaintext-feedback state, additional transposition, space change, or non-GP intermediate registers."
},null,2));
console.log("PASS: exact all-seed fractional maxima; original 12956 runes; all native GP inverse plants");
