"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r\n/g, "\n");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

const clearStart = signed.indexOf("Hash: SHA1");
const signatureStart = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(clearStart >= 0 && signatureStart > clearStart);
const sourceWords = (signed.slice(clearStart + "Hash: SHA1".length, signatureStart)
  .replace(/\b7A35090F\b/g, "").match(/[A-Za-z]+/g) || []).map(w => w.toUpperCase());
assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(19, 25), ["THEIR", "MEANING", "IS", "THE", "ROAD", "AND"]);
assert.deepEqual(sourceWords.slice(25, 30), ["THEIR", "NUMBERS", "ARE", "THE", "DIRECTION"]);

function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left++, right--) {
    out.push(((values[left] - values[right]) % 29 + 29) % 29);
    out.push((values[left] + values[right]) % 29);
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}
function finishWord(current, breaks, page, out) {
  if (!current.length) return;
  const physicalPage = page < 50 ? page : page + 1;
  const internalOneSplit = breaks.length === 1 &&
    breaks[0] > 0 && breaks[0] < current.length;
  if (physicalPage <= 55 && current.length >= 5 && current.length <= 14 &&
      (breaks.length === 0 || internalOneSplit)) {
    const values = current.map(x => x.value);
    const components = [H(values)];
    if (internalOneSplit) {
      components.push(H(values.slice(0, breaks[0])));
      components.push(H(values.slice(breaks[0])));
    }
    out.push({
      page: physicalPage,
      start: current[0].offset,
      length: values.length,
      split: breaks.slice(),
      values,
      components,
      union: [...new Set(components.flat())].sort((a,b)=>a-b)
    });
  }
}
const candidates = [];
let page = 0;
const offsets = Array(58).fill(0);
let current = [], breaks = [];
function flush() {
  finishWord(current, breaks, page, candidates);
  current = []; breaks = [];
}
for (const ch of transcription) {
  if (ch === "%") {
    flush();
    page++;
  } else if (runeIndex.has(ch)) {
    current.push({ page, offset: offsets[page], value: runeIndex.get(ch) });
    offsets[page]++;
  } else if (ch === "/") {
    if (current.length) breaks.push(current.length);
  } else if (/\s/u.test(ch)) {
    // Layout whitespace does not end a printed word.
  } else {
    flush();
  }
}
flush();
assert.equal(candidates.length, 1098);
const byLength = Object.fromEntries(Array.from({length:10},(_,i)=>[
  i+5, candidates.filter(w=>w.length===i+5).length
]));
assert.deepEqual(byLength, {5:306,6:249,7:211,8:154,9:76,10:49,11:28,12:18,13:4,14:3});

const sourceInterval = [19,20,21,22,23,24];
const nextInterval = [25,26,27,28,29];
const intervalHits = [];
for (let start = 0; start + 5 < sourceWords.length; start++) {
  const interval = Array.from({length:6},(_,i)=>start+i);
  const hits = candidates.filter(w => interval.every(v=>w.union.includes(v)));
  if (hits.length) intervalHits.push({
    start, end:start+5, phrase:sourceWords.slice(start,start+6).join(" "),
    hits:hits.map(w=>({page:w.page,start:w.start,length:w.length,split:w.split,unionSize:w.union.length}))
  });
}
assert.equal(intervalHits.length,17);
const p0 = candidates.find(w=>w.page===0&&w.start===237);
const p55 = candidates.find(w=>w.page===55&&w.start===23);
assert.ok(p0 && p55);
assert.deepEqual(p0.values,[15,22,16,22,21,1,4]);
assert.deepEqual(p0.split,[2]);
assert.deepEqual(p0.components[0],[11,19,21,23,24,8,22]);
assert.deepEqual(p0.components[0].filter((_,i)=>i%2===1),[19,23,8]);
assert.equal(p0.union.length,9);
assert.deepEqual(p55.values,[17,28,0,14,10,19,1,5,13,8,21,20,12]);
assert.deepEqual(p55.split,[1]);
assert.deepEqual(p55.components[0],[5,0,8,19,8,21,6,22,26,23,14,24,1]);
assert.deepEqual(p55.components[0].filter((_,i)=>i%2===1),[0,19,21,22,23,24]);
assert.equal(p55.union.length,21);
const sourceHits = candidates.filter(w=>sourceInterval.every(v=>w.union.includes(v)));
assert.deepEqual(sourceHits.map(w=>({page:w.page,start:w.start,length:w.length,split:w.split})),[
  {page:0,start:237,length:7,split:[2]},
  {page:55,start:23,length:13,split:[1]}
]);
const orderedHits = candidates.filter(w=>{
  const even = w.components[0].filter((_,i)=>i%2===1);
  return even.length>=3 && even[0]===19 && even[1]===23 && even[2]===8;
});
assert.deepEqual(orderedHits.map(w=>({page:w.page,start:w.start})),[{page:0,start:237}]);
const nextHits = candidates.filter(w=>nextInterval.every(v=>w.union.includes(v)));
assert.equal(nextHits.length,0);
const p55Starts = intervalHits.filter(row=>row.hits.some(h=>h.page===55&&h.start===23)).map(row=>row.start);
assert.deepEqual(p55Starts,[16,17,18,19,20,21]);
const p0Starts = intervalHits.filter(row=>row.hits.some(h=>h.page===0&&h.start===237)).map(row=>row.start);
assert.deepEqual(p0Starts,[19]);
const subsetProbability = (k, n, r) => {
  let value = 1;
  for (let i=0;i<r;i++) value *= (k-i)/(n-i);
  return value;
};
const output = {
  source: {
    word_count: sourceWords.length,
    interval_19_24: sourceWords.slice(19,25),
    predicted_continuation_25_29: sourceWords.slice(25,30)
  },
  candidate_family: {
    pages: "physical p0-p55 (p50 is non-rune table material)",
    rule: "complete 5-14 rune words with zero or exactly one internal physical line break; H(whole), plus H(prefix)/H(suffix) for one-split words",
    count: candidates.length,
    by_length: byLength
  },
  p0_selective_hit: {
    page:0,start:237,length:7,split:[2],cipher:p0.values,
    H_whole:p0.components[0],even_one_based_positions:p0.components[0].filter((_,i)=>i%2===1),
    H_union:p0.union,union_size:p0.union.length
  },
  p55_broad_set_hit: {
    page:55,start:23,length:13,split:[1],cipher:p55.values,
    H_whole:p55.components[0],even_one_based_positions:p55.components[0].filter((_,i)=>i%2===1),
    H_union:p55.union,union_size:p55.union.length,
    overlapping_six_word_interval_starts:p55Starts,
    fixed_six_value_interval_uniform_subset_reference:subsetProbability(21,29,6)
  },
  ordered_B_p_A_triple_hits: orderedHits.map(w=>({page:w.page,start:w.start})),
  source_interval_19_24_set_hits: sourceHits.map(w=>({page:w.page,start:w.start,length:w.length,split:w.split,union_size:w.union.length})),
  predicted_continuation_25_29_hits: nextHits.length,
  six_word_intervals_with_any_hit: intervalHits,
  decision: "The ordered [19,23,8] H triple remains unique at p0:237 among 1,098 eligible words. The p55 set-level overlap is broad (21/29 values, six overlapping intervals) and is not independent confirmation. No word exposes the predicted source continuation 25-29."
};
console.log(JSON.stringify(output,null,2));
