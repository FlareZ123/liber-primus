#!/usr/bin/env node
"use strict";

/**
 * Conditional p27 H8 -> p50 byte-pointer WITHIN closure.
 *
 * Source path:
 *   p27 B=19 word -> shed K=2 -> 8-rune core
 *   canonical H8 -> four adjacent GP29/base29 pairs
 *   prior zero-based n mod256 table address rule
 *   prior canonical base60 byte-pointer next(i)=byte[i]
 *
 * The test charges the resulting [a,a,a,e] arrival signature across all
 * contiguous unknown eight-rune windows and across all complete 12-rune
 * words under natural orientation controls.
 *
 * No unknown plaintext is claimed.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeId = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const pages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const unknownPages = pages.filter((p) => p.page >= 0 && p.page <= 55);
assert.equal(grid.bytes.length, 256);
assert.equal(unknownPages.length, 56);

const mod29 = (n) => ((n % 29) + 29) % 29;
function H(values) {
  const m = Math.floor(values.length / 2);
  const out = [];
  for (let i = 0; i < m; i += 1) {
    out.push(mod29(values[i] - values[values.length - 1 - i]));
  }
  if (values.length % 2) out.push(values[m]);
  for (let i = m - 1; i >= 0; i -= 1) {
    out.push(mod29(values[i] + values[values.length - 1 - i]));
  }
  return out;
}
const page = (n) => {
  const row = pages.find((x) => x.page === n);
  assert.ok(row, `missing p${n}`);
  return row;
};
const segment = (p) => p === 50 ? "" : transcript[p >= 51 ? p - 1 : p];

function pageWords(p) {
  if (p === 50) return [];
  const pg = page(p);
  const raw = segment(p);
  assert.ok(raw, `missing transcription p${p}`);
  const words = [];
  let current = [];
  let runeOffset = 0;
  let start = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, indices: current });
    current = [];
  };

  for (const symbol of raw) {
    if (runeId.has(symbol)) {
      if (!current.length) start = runeOffset;
      assert.equal(pg.indices[runeOffset], runeId.get(symbol), `transcription mismatch p${p}@${runeOffset}`);
      current.push(pg.indices[runeOffset]);
      runeOffset += 1;
    } else if ("-.&$§".includes(symbol)) {
      flush();
    }
  }
  flush();
  assert.equal(runeOffset, pg.indices.length, `rune-count mismatch p${p}`);
  return words;
}

const translit = (v) => v.map((x) => corpus.translit[x]).join("");
const primeSum = (v) => v.reduce((sum, x) => sum + corpus.prime[x], 0);

// Pre-existing canonical byte-pointer graph sanity check.
const cycle = [0];
let cursor = 0;
for (let i = 0; i < 11; i += 1) {
  cursor = grid.bytes[cursor];
  cycle.push(cursor);
}
assert.deepEqual(cycle, [0,203,68,199,47,76,114,197,115,247,192,0]);

// Fixed DH/q state used by the existing p27 receiver.
const state = { K:2, e:3, q:4, g:5, a:6, A:8, b:15, B:19, p:23 };
const stateDepths = [...new Set(Object.values(state))].sort((a,b) => a-b);
assert.deepEqual(stateDepths, [2,3,4,5,6,8,15,19,23]);

const p27Words = pageWords(27);
const selectedWord = p27Words[state.B];
assert.ok(selectedWord);
assert.equal(selectedWord.indices.length, 12);
assert.equal(translit(selectedWord.indices), "EORNSOOCAEYEE");
const core = selectedWord.indices.slice(state.K, selectedWord.indices.length - state.K);
assert.equal(translit(core), "NSOOCAEY");
assert.equal(core.length, 8);

const p57Words = pageWords(57).map((w, index) => ({
  index,
  text: translit(w.indices),
  indices: w.indices,
  prime: primeSum(w.indices),
}));
const divinity = p57Words.find((w) => w.text === "DIUINITY");
const within = p57Words.find((w) => w.text === "WITHIN");
const we = p57Words.find((w) => w.text === "WE");
const must = p57Words.find((w) => w.text === "MUST");
assert.ok(divinity && within && we && must);
assert.equal(primeSum(core), divinity.prime);
assert.equal(divinity.prime, 376);
assert.equal(within.prime, 115);
assert.equal(we.prime, 86);
assert.equal(must.prime, 186);

// Canonical H8 state packet already established by the p27 receiver.
const h = H(core);
assert.deepEqual(h, [12,26,8,27,8,27,4,6]);
assert.deepEqual(h.slice(2,6), [state.A, mod29(-state.K), state.A, mod29(-state.K)]);

// New conditional adjacent-pair BASE29 -> 256-cell address step.
const pairNumbers = Array.from({length:4}, (_, i) => h[2*i] * 29 + h[2*i+1]);
const starts = pairNumbers.map((n) => n % 256);
assert.deepEqual(pairNumbers, [374,259,259,122]);
assert.deepEqual(starts, [118,3,3,122]);

// Secondary one-hop clear-word equalities; not used to select the convergence.
assert.equal(grid.bytes[3], must.prime);
assert.equal(grid.bytes[122], we.prime);

function distanceMap(start) {
  const distances = new Map([[start, 0]]);
  let x = start;
  for (let step = 1; step <= 512; step += 1) {
    x = grid.bytes[x];
    if (distances.has(x)) break;
    distances.set(x, step);
  }
  return distances;
}
const distanceMaps = Array.from({length:256}, (_, i) => distanceMap(i));

function earliestJointConvergence(addresses) {
  let best = null;
  for (let node = 0; node < 256; node += 1) {
    const distances = addresses.map((s) => distanceMaps[s].get(node));
    if (distances.some((d) => d === undefined)) continue;
    const rank = [Math.max(...distances), distances.reduce((a,b) => a+b, 0), node];
    const better = !best
      || rank[0] < best.rank[0]
      || (rank[0] === best.rank[0] && (
        rank[1] < best.rank[1]
        || (rank[1] === best.rank[1] && rank[2] < best.rank[2])
      ));
    if (better) best = { node, distances, rank };
  }
  return best;
}

const selectedConvergence = earliestJointConvergence(starts);
assert.deepEqual(selectedConvergence, {
  node: 115,
  distances: [6,6,6,3],
  rank: [6,21,115],
});
assert.deepEqual(selectedConvergence.distances, [state.a,state.a,state.a,state.e]);
assert.equal(selectedConvergence.node, within.prime);

// Explicit trajectories to the common node.
function pathUntil(start, target) {
  const out = [start];
  let x = start;
  while (x !== target) {
    assert.ok(out.length < 257, "target not reached before pointer cycle");
    x = grid.bytes[x];
    out.push(x);
  }
  return out;
}
assert.deepEqual(pathUntil(118,115), [118,35,39,5,237,32,115]);
assert.deepEqual(pathUntil(3,115), [3,186,19,33,114,197,115]);
assert.deepEqual(pathUntil(122,115), [122,86,111,115]);

// Selected-start finite family: grant every state value independently as
// each depth and every clear p57 word whose prime sum fits a byte.
function walk(start, depth) {
  let x = start;
  for (let i = 0; i < depth; i += 1) x = grid.bytes[x];
  return x;
}
const byteSizedWords = p57Words.filter((w) => w.prime <= 255);
const stateFamilyHits = [];
for (const w of byteSizedWords) {
  for (const d0 of stateDepths) for (const d1 of stateDepths)
  for (const d2 of stateDepths) for (const d3 of stateDepths) {
    const ds = [d0,d1,d2,d3];
    if (starts.every((s,i) => walk(s,ds[i]) === w.prime)) {
      stateFamilyHits.push({ word:w.text, prime:w.prime, depths:ds });
    }
  }
}
assert.deepEqual(stateFamilyHits, [{
  word:"WITHIN",
  prime:115,
  depths:[6,6,6,3],
}]);

// Countercontrol: the clear DIVINITY rune sequence itself does not produce
// any p57 word under the same H/pair/address/state-depth family.
const divH = H(divinity.indices);
const divStarts = Array.from({length:4}, (_, i) => (divH[2*i]*29 + divH[2*i+1]) % 256);
assert.deepEqual(divStarts, [9,69,50,6]);
const divinityControlHits = [];
for (const w of byteSizedWords) {
  for (const d0 of stateDepths) for (const d1 of stateDepths)
  for (const d2 of stateDepths) for (const d3 of stateDepths) {
    const ds=[d0,d1,d2,d3];
    if (divStarts.every((s,i) => walk(s,ds[i]) === w.prime)) {
      divinityControlHits.push({word:w.text,prime:w.prime,depths:ds});
    }
  }
}
assert.deepEqual(divinityControlHits, []);

// Full unknown-corpus charge over every contiguous 8-rune window.
let totalWindows = 0;
let noJoint = 0;
let p57ConvergenceCount = 0;
let node115Count = 0;
const exactStateDistanceHits = [];
const p57PrimeSet = new Set(byteSizedWords.map((w) => w.prime));

for (const pg of unknownPages) {
  for (let offset = 0; offset + 8 <= pg.indices.length; offset += 1) {
    totalWindows += 1;
    const hv = H(pg.indices.slice(offset, offset + 8));
    const address = Array.from({length:4}, (_, i) => (hv[2*i]*29 + hv[2*i+1]) % 256);
    const cv = earliestJointConvergence(address);
    if (!cv) {
      noJoint += 1;
      continue;
    }
    if (p57PrimeSet.has(cv.node)) p57ConvergenceCount += 1;
    if (cv.node === 115) node115Count += 1;
    if (cv.node === 115 && cv.distances.join(",") === "6,6,6,3") {
      exactStateDistanceHits.push({page:pg.page,offset,address});
    }
  }
}
assert.equal(totalWindows, 12571);
assert.equal(noJoint, 740);
assert.equal(p57ConvergenceCount, 9331);
assert.equal(node115Count, 9329);
assert.deepEqual(exactStateDistanceHits, [{
  page:27,
  offset:selectedWord.start + state.K,
  address:[118,3,3,122],
}]);

// Independently selected 12-rune receiver family plus natural orientation
// controls. Deduplicate algebraically identical address vectors.
const variants = [];
for (const useH of [true,false])
for (const reverseAll of [false,true])
for (const swapDigits of [false,true])
for (const reversePairs of [false,true]) {
  variants.push({useH,reverseAll,swapDigits,reversePairs});
}
function addressesFor(v, variant) {
  let x = variant.useH ? H(v) : v.slice();
  if (variant.reverseAll) x = x.slice().reverse();
  const out = [];
  for (let i = 0; i < 4; i += 1) {
    let a = x[2*i], b = x[2*i+1];
    if (variant.swapDigits) [a,b] = [b,a];
    out.push((a*29+b)%256);
  }
  if (variant.reversePairs) out.reverse();
  return out;
}

const twelveWords = [];
for (const pg of unknownPages) {
  for (const w of pageWords(pg.page)) {
    if (w.indices.length === 12) twelveWords.push({page:pg.page,start:w.start,indices:w.indices});
  }
}
assert.equal(twelveWords.length, 18);
const receiverHits = new Map();
for (const w of twelveWords) {
  const c = w.indices.slice(state.K, w.indices.length - state.K);
  for (const variant of variants) {
    const address = addressesFor(c,variant);
    const cv = earliestJointConvergence(address);
    if (cv && cv.node === 115 && cv.distances.join(",") === "6,6,6,3") {
      const key = [w.page,w.start,address.join(",")].join(":");
      receiverHits.set(key,{page:w.page,start:w.start,address});
    }
  }
}
assert.deepEqual([...receiverHits.values()], [{
  page:27,
  start:selectedWord.start,
  address:[118,3,3,122],
}]);

const output = {
  classification:
    "conditional source-constrained p27 semantic/navigation closure; no unknown plaintext",
  receiver: {
    page:27,
    wordIndexZeroBased:state.B,
    shedDepth:state.K,
    word:translit(selectedWord.indices),
    core:translit(core),
    corePrimeSum:primeSum(core),
    semanticPrimeTarget:divinity.text,
  },
  h8:h,
  pairNumbers,
  starts,
  bytePointer: {
    jointNode:selectedConvergence.node,
    distances:selectedConvergence.distances,
    stateTyping:"[a,a,a,e]",
    semanticPrimeTarget:within.text,
    path118:pathUntil(118,115),
    path3:pathUntil(3,115),
    path122:pathUntil(122,115),
  },
  controls: {
    stateFamilyHits,
    divinityControlHits,
    totalWindows,
    noJoint,
    p57ConvergenceCount,
    node115Count,
    exactStateDistanceHits,
    twelveRuneWords:twelveWords.length,
    naturalOrientationReceiverHits:[...receiverHits.values()],
  },
  decision:
    "Preserve the H8 adjacent-BASE29-pair -> mod256 -> canonical byte-pointer route as a strong conditional continuation: the p27 core independently reads as DIVINITY by prime sum and WITHIN by a uniquely state-timed table convergence. The adjacent-pair table-address step remains unauthenticated, and no rune-level inverse is recovered.",
};

const json=JSON.stringify(output,null,2);
console.log(json);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP || process.cwd(),"source-test-output.json"),json+"\n");
