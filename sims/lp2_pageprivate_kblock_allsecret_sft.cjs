"use strict";

/**
 * Original LP2 key-independent three- and four-rune block-bijection gate.
 *
 * Any deterministic bijection over k-rune blocks preserves equality of
 * complete blocks inside one page. The gate even permits independently
 * secret bijections and independently selected block phase per page.
 *
 * SFT: node sims/lp2_pageprivate_kblock_allsecret_sft.cjs
 * Node.js 22 CommonJS, standard libraries only. Read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
const lengths = pages.map(p => p.indices.length);
const original = pages.flatMap(p => p.indices);

assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(lengths.reduce((a, b) => a + b, 0), original.length);
assert.deepEqual(original.slice(0, 8), [15, 8, 18, 3, 6, 19, 27, 0]);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Greedy canonical GP conversion with the independently source-attested
 * single-rune ING and IO spellings from solved original LP1 and LP2 p57.
 *
 * @param {string} text
 * @returns {number[]}
 */
function sourceNativeGP(text) {
  const clean = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        result.push(27);
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "unmapped source word: " + word);
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}

/**
 * Number of identical unordered pairs of nonoverlapping aligned block types.
 * Every arbitrary bijection F maps x=y iff F(x)=F(y), regardless of its key.
 *
 * @param {number[]} page
 * @param {number} k
 * @param {number} phase
 * @returns {number}
 */
function collisionPairs(page, k, phase) {
  const seen = new Map();
  let collisions = 0;
  for (let i = phase; i + k <= page.length; i += k) {
    const word = page.slice(i, i + k).join(",");
    const count = seen.get(word) || 0;
    collisions += count;
    seen.set(word, count + 1);
  }
  return collisions;
}

/**
 * Permit all k independent page-local block starts. Lower and upper bounds
 * remain valid even if an adversary selects every page phase after reading
 * the original ciphertext.
 *
 * @param {number[]} sequence
 * @param {number} k
 * @returns {{minimum:number,maximum:number,phaseZero:number}}
 */
function blockEnvelope(sequence, k) {
  assert.equal(sequence.length, original.length);
  let offset = 0;
  let minimum = 0;
  let maximum = 0;
  let phaseZero = 0;
  for (const len of lengths) {
    const page = sequence.slice(offset, offset + len);
    const byPhase = [];
    for (let phase = 0; phase < k; phase++) {
      byPhase.push(collisionPairs(page, k, phase));
    }
    minimum += Math.min(...byPhase);
    maximum += Math.max(...byPhase);
    phaseZero += byPhase[0];
    offset += len;
  }
  assert.equal(offset, sequence.length);
  return {minimum, maximum, phaseZero};
}

/**
 * Encrypt every complete block with independent page and slot affine keys.
 * This is only an implementation plant of a subset of arbitrary k-block
 * bijections. Untouched remainder symbols stay unchanged and are excluded
 * from collision counting.
 *
 * @param {number[]} plaintext
 * @param {number} k
 * @returns {{cipher:number[],restored:number[]}}
 */
function pagePrivateAffinePlant(plaintext, k) {
  const cipher = plaintext.slice();
  const restored = plaintext.slice();
  let offset = 0;
  for (let pageIndex = 0; pageIndex < lengths.length; pageIndex++) {
    const len = lengths[pageIndex];
    const a = 1 + ((7 * pageIndex + 3 * k) % 28);
    const inverse = Array.from({length:28}, (_,i) => i + 1)
      .find(x => (x * a) % 29 === 1);
    assert(inverse);
    for (let i = 0; i + k <= len; i += k) {
      for (let j = 0; j < k; j++) {
        const at = offset + i + j;
        const b = (11 * pageIndex + 5 * j + k) % 29;
        cipher[at] = (a * plaintext[at] + b) % 29;
        restored[at] = (inverse * ((cipher[at] - b + 29) % 29)) % 29;
      }
    }
    offset += len;
  }
  return {cipher, restored};
}

const literary = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 33],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 133]
].map(([name, file, expectedWindows]) => {
  const runes = sourceNativeGP(read(file));
  assert(runes.length >= original.length);
  return {name, runes, expectedWindows};
});

/** @type {Record<string, number>} */
const expected = {
  "3:Gibran": 226, "3:Shakespeare": 108,
  "4:Gibran": 40, "4:Shakespeare": 11
};

for (const k of [3, 4]) {
  const observed = blockEnvelope(original, k);
  assert.deepEqual(observed, k === 3
    ? {minimum: 0, maximum: 17, phaseZero: 4}
    : {minimum: 0, maximum: 0, phaseZero: 0});
  for (const {name, runes, expectedWindows} of literary) {
    const windows = [];
    for (let start = 0; start + original.length <= runes.length; start += 1536) {
      windows.push(blockEnvelope(runes.slice(start, start + original.length), k));
    }
    assert.equal(windows.length, expectedWindows);
    const smallest = Math.min(...windows.map(w => w.minimum));
    assert.equal(smallest, expected[String(k) + ":" + name]);
    assert(observed.maximum < smallest,
      "an all-secret k-block family unexpectedly overlaps the control");
    const plaintext = runes.slice(0, original.length);
    const plant = pagePrivateAffinePlant(plaintext, k);
    assert.deepEqual(plant.restored, plaintext);
    assert.equal(blockEnvelope(plaintext, k).phaseZero,
      blockEnvelope(plant.cipher, k).phaseZero);
    console.log(JSON.stringify({
      k, nativeSource: name, windows: windows.length,
      originalMaximumAllPhases: observed.maximum,
      nativeMinimumAllPhases: smallest,
      nativeMedianMinimum: windows.map(w => w.minimum)
        .sort((a, b) => a - b)[Math.floor(windows.length / 2)],
      plantLength: plant.restored.length,
      plantExact: true
    }));
  }
}

// Source-authentic independently solved LP2 p57 rather than simulated prose.
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE";
assert(sourceNativeGP(p57Words).every((v, i) => p57[i] === v),
  "original source-authentic PARABLE prefix");

/**
 * The additive-postfeedback block family is different from CBC prewhitening:
 *
 *    C_block[t] = F_page(P_block[t]) + C_block[t-1] mod 29
 *
 * Since D_block[t] = C_block[t]-C_block[t-1] = F_page(P_block[t]),
 * equality of complete noninitial D blocks is a key-independent invariant
 * for EVERY unknown per-page k-block bijection F_page, even nonlinear ones.
 * This works with an unknown initial block IV; the first block is skipped.
 *
 * @param {number[]} sequence
 * @param {number} k
 * @param {number} phase
 * @returns {number}
 */
function feedbackPairs(sequence, k, phase) {
  let previous = null;
  const seen = new Map();
  let pairs = 0;
  for (let i = phase; i + k <= sequence.length; i += k) {
    const current = sequence.slice(i, i + k);
    if (previous) {
      const key = current.map((v, j) => (v - previous[j] + 29) % 29)
        .join(",");
      const n = seen.get(key) || 0;
      pairs += n;
      seen.set(key, n + 1);
    }
    previous = current;
  }
  return pairs;
}

/**
 * @param {number[]} sequence
 * @param {number} k
 * @returns {{minimum:number,maximum:number,phaseZero:number}}
 */
function feedbackEnvelope(sequence, k) {
  assert.equal(sequence.length, original.length);
  let offset = 0;
  let minimum = 0;
  let maximum = 0;
  let phaseZero = 0;
  for (const length of lengths) {
    const page = sequence.slice(offset, offset + length);
    const scores = Array.from({length:k}, (_,phase) => feedbackPairs(page,k,phase));
    minimum += Math.min(...scores);
    maximum += Math.max(...scores);
    phaseZero += scores[0];
    offset += length;
  }
  assert.equal(offset, original.length);
  return {minimum,maximum,phaseZero};
}

/**
 * Independent hidden per-page, per-slot invertible affine GP29 maps F.
 * Each ciphertext block uses the preceding OUTPUT block, including
 * the opening block's source-independent zero IV. A planted ciphertext
 * must preserve the plaintext's noninitial delta-block collisions.
 *
 * @param {number[]} plain
 * @param {number} k
 * @returns {{cipher:number[],restored:number[]}}
 */
function pagePrivatePostfeedbackPlant(plain,k) {
  const cipher=plain.slice();
  const restored=plain.slice();
  let offset=0;
  for (let pageIndex=0;pageIndex<lengths.length;pageIndex++) {
    const length=lengths[pageIndex];
    const a=1+((7*pageIndex+3*k)%28);
    const inverse=Array.from({length:28},(_,i)=>i+1)
      .find(x=>(x*a)%29===1);
    assert(inverse);
    let priorC=Array(k).fill(0);
    for (let j=0;j+k<=length;j+=k) {
      const current=[];
      for (let slot=0;slot<k;slot++) {
        const at=offset+j+slot;
        const bias=(11*pageIndex+5*slot+k)%29;
        const f=(a*plain[at]+bias)%29;
        const c=(f+priorC[slot])%29;
        current.push(c);
        cipher[at]=c;
        restored[at]=(inverse*((c-priorC[slot]-bias+58)%29))%29;
      }
      priorC=current;
    }
    offset+=length;
  }
  return {cipher,restored};
}

const feedbackControls = [...literary,{name:"Emerson",runes:sourceNativeGP(
  read("resources/control/emerson_essays_2944.txt")),expectedWindows:201}];
const feedbackMinimum = {
 "2:Gibran":761, "2:Shakespeare":608, "2:Emerson":564,
 "3:Gibran":46, "3:Shakespeare":20, "3:Emerson":12,
 "4:Gibran":7, "4:Shakespeare":1, "4:Emerson":0
};
const feedbackExpected = {
 2:{minimum:392,maximum:526,phaseZero:447},
 3:{minimum:0,maximum:23,phaseZero:7},
 4:{minimum:0,maximum:0,phaseZero:0}
};

for(const k of [2,3,4]) {
 const source=feedbackEnvelope(original,k);
 assert.deepEqual(source,feedbackExpected[k]);
 for(const {name,runes,expectedWindows} of feedbackControls) {
   const windows=[];
   for(let start=0;start+original.length<=runes.length;start+=1536) {
     windows.push(feedbackEnvelope(runes.slice(start,start+original.length),k));
   }
   assert.equal(windows.length,expectedWindows);
   const minFixed=Math.min(...windows.map(v=>v.phaseZero));
   assert.equal(minFixed,feedbackMinimum[String(k)+":"+name]);
   if(k<=3)assert(source.phaseZero<minFixed,
     "page-start block feedback unexpectedly overlaps original English control");
   if(name==="Gibran")assert(source.maximum<
     Math.min(...windows.map(v=>v.minimum)),
     "arbitrary page-phase feedback unexpectedly overlaps Gibran control");
   const planted=pagePrivatePostfeedbackPlant(runes.slice(0,original.length),k);
   assert.deepEqual(planted.restored,runes.slice(0,original.length));
   assert.equal(feedbackEnvelope(planted.cipher,k).phaseZero,
     feedbackEnvelope(runes.slice(0,original.length),k).phaseZero);
   console.log(JSON.stringify({
     family:"page-private-additive-postfeedback",blockRunes:k,
     source: name, windows:windows.length,
     originalPhaseZero:source.phaseZero,originalAllPhasesMax:source.maximum,
     minimumEnglishPhaseZero:minFixed,
     minimumEnglishAllPhases:Math.min(...windows.map(v=>v.minimum)),
     fullLengthPositiveRoundtrip:true
   }));
 }
}

console.log("Original 12956 source runes and first 37 runes of solved p57 verified.");
