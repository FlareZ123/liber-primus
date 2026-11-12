"use strict";
/**
 * Agent48, 2026-11-12. Original-word boustrophedon and line-permutation gate.
 * Single runnable test (Node.js >=22, CommonJS; no dependencies or network).
 *
 * node sims/lp2_boustrophedon_wordlength_allsecret_sft.cjs
 *
 * Original complete-word within-line unordered adjacency is unchanged by
 * arbitrary independently chosen reversals of whole printed lines or a
 * permutation of complete original lines. Reversal of glyphs INSIDE an
 * original word and resegmentation are outside this finite model.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const source = read("resources/liber-primus/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeSet = new Set(corpus.runes);
const original = [];
let page = 0, line = 0, startPage = 0, startLine = 0;
let current = "", crossesLine = false;

/** @returns {void} */
function flush() {
  if (!current) return;
  original.push({
    length: [...current].length,
    page: startPage >= 50 ? startPage + 1 : startPage,
    line: startLine,
    crossesLine
  });
  current = "";
  crossesLine = false;
}
// The rune-only transcription omits the rune-free numeric physical p50.
// Source % is a physical page delimiter; / is a wrap and MAY split a word.
for (const c of source.split("%").slice(0, 55).join("%")) {
  if (runeSet.has(c)) {
    if (!current) { startPage = page; startLine = line; }
    current += c;
  } else if (c === "/") {
    if (current) crossesLine = true;
    line++;
  } else if (c === "%") {
    if (current) crossesLine = true;
    page++;
    line = 0;
  } else if ("-.$&".includes(c)) {
    flush();
  } else if (!/\s/u.test(c)) {
    flush(); // numeric and other non-GP source material is not a rune word
  }
}
flush();
assert.equal(original.length, 2896);
assert.equal(original.filter(w => w.crossesLine).length, 452);
assert.equal(new Set(original.map(w => w.page)).size, 55);

const edges = [];
for (let i = 0; i + 1 < original.length; i++) {
  const a = original[i], b = original[i + 1];
  if (!a.crossesLine && !b.crossesLine
      && a.page === b.page && a.line === b.line) edges.push(i);
}
assert.equal(edges.length, 1852);

const chapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const groups = chapters.map(([first, last]) =>
  original.flatMap((w, i) => w.page >= first && w.page <= last ? [i] : []));
assert.deepEqual(groups.map(g => g.length),[158,255,383,437,224,326,378,669,66]);

/**
 * Symmetric mutual information of adjacent 1...8/9+ length bins.
 * Swapping either member of any pair changes no count.
 * @param {number[]} lengths @returns {number}
 */
function unorderedMI(lengths) {
  assert.equal(lengths.length, original.length);
  const pairs = new Float64Array(100), marg = new Float64Array(10);
  let total = 0;
  for (const i of edges) {
    const a = Math.min(9, lengths[i]), b = Math.min(9, lengths[i + 1]);
    pairs[a*10+b]++;
    pairs[b*10+a]++;
    marg[a]++;
    marg[b]++;
    total += 2;
  }
  let mi = 0;
  for (let a=1; a<=9; a++) for (let b=1; b<=9; b++) {
    const count = pairs[a*10+b];
    if (count) mi += count/total*Math.log(count*total/(marg[a]*marg[b]));
  }
  return mi;
}

const edgeSet = new Set(edges);
/**
 * Reverse every other original complete-word line component.
 * This is a planted subset of the much wider unknown-per-line reversal
 * family. Invariance holds for ALL possible line-direction choices.
 * @param {number[]} a @returns {{values:number[],components:number}}
 */
function reverseAlternating(a) {
  const out = a.slice();
  let components=0;
  for (let start=0;start<original.length;) {
    let end=start;
    while (edgeSet.has(end)) end++;
    if (end-start >= 2 && original[start].line % 2 === 1) {
      for (let i=start,j=end;i<j;i++,j--) [out[i],out[j]]=[out[j],out[i]];
      components++;
    }
    start=end+1;
  }
  return {values:out, components};
}

const wordLengths = original.map(w => w.length);
const observed = unorderedMI(wordLengths);
const inverted = reverseAlternating(wordLengths);
assert.equal(inverted.components,265);
assert.equal(unorderedMI(inverted.values),observed);

/** @param {number[]} a @returns {{mean:number,sd:number,min:number,max:number}} */
function stats(a) {
  const mean=a.reduce((s,x)=>s+x,0)/a.length;
  const sd=Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/a.length);
  return {mean,sd,min:Math.min(...a),max:Math.max(...a)};
}
let rngState=0x33015;
/** @returns {number} */
function random() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
/** @param {number[]} a @returns {number[]} */
function chapterShuffle(a) {
  const out=a.slice();
  for (const group of groups) for (let i=group.length-1;i>0;i--) {
    const j=random()%(i+1), x=group[i],y=group[j];
    [out[x],out[y]]=[out[y],out[x]];
  }
  return out;
}
/**
 * @param {number[]} a @param {number} trials
 * @returns {{observed:number,z:number,upperP:number,nullMean:number,nullSd:number}}
 */
function experiment(a,trials) {
  const measured=unorderedMI(a), draws=[];
  for(let t=0;t<trials;t++)draws.push(unorderedMI(chapterShuffle(a)));
  const m=stats(draws);
  return {observed:measured,z:(measured-m.mean)/m.sd,
    upperP:(1+draws.filter(x=>x>=measured).length)/(1+trials),
    nullMean:m.mean,nullSd:m.sd};
}

const sourceResult=experiment(wordLengths,1500);
assert(Math.abs(sourceResult.observed - 0.009558482483259929)<1e-12);
assert(sourceResult.z>-2 && sourceResult.z<2);
assert(sourceResult.upperP>0.1 && sourceResult.upperP<0.9);

const tokens=corpus.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} text @param {boolean} ing @returns {number} */
function gpWordLength(text,ing) {
  let w=text.replace(/QU/gu,"CW").replace(/V/gu,"U")
    .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  if(ing) w=w.replace(/ING/gu,"NG");
  let n=0;
  for(let i=0;i<w.length;) {
    const token=tokens.find(x=>w.startsWith(x,i));
    assert(token,"unknown GP token in "+w);
    i+=token.length;n++;
  }
  return n;
}

const nativeControls=[
  {
    name:"Emerson Essays First Series #2944",
    source:"resources/control/emerson_essays_2944.txt",
    kind:"english", folds:[true,false], expectedWords:77932,
    expectedWindows:26, nullTrials:100
  },
  {
    name:"Shakespeare first300k",
    source:"resources/control/shakespeare_first300k.txt",
    kind:"english", folds:[true,false], expectedWords:55407,
    expectedWindows:19, nullTrials:100
  },
  {
    name:"Gibran Prophet #58585",
    source:"resources/control/gibran_prophet_58585.txt",
    kind:"english", folds:[true,false], expectedWords:15733,
    expectedWindows:5, nullTrials:100
  },
  {
    name:"Latin Vulgate GP wholewords",
    source:"resources/control/latin-vulgate-gp-wholewords.txt",
    kind:"gpwords", folds:[false], expectedWords:39835,
    expectedWindows:13, nullTrials:150
  },
  {
    name:"Beowulf corrected Old English GP",
    source:"resources/control/beowulf_oe_gp_profile_corrected.json",
    kind:"jsonlengths", folds:[false], expectedWords:10885,
    expectedWindows:3, nullTrials:150
  }
];
const controlResults=[];
for(const source of nativeControls) {
  let words=[];
  if(source.kind==="english") words=read(source.source).toUpperCase().match(/[A-Z]+/gu)||[];
  else if(source.kind==="gpwords") words=read(source.source).split(/\r?\n/u)
    .filter(s=>/^[0-9A-S]+$/u.test(s));
  else words=JSON.parse(read(source.source)).allSourceGpWordLengths;
  assert.equal(words.length,source.expectedWords);
  for(const ing of source.folds) {
    const lengths = source.kind==="english"
      ? words.map(w=>gpWordLength(w,ing))
      : words.map(w=>typeof w==="number"?w:w.length);
    const windowCount=Math.floor(lengths.length/wordLengths.length);
    assert.equal(windowCount,source.expectedWindows);
    const samples=[];
    for(let j=0;j<windowCount;j++) {
      const a=lengths.slice(j*wordLengths.length,(j+1)*wordLengths.length);
      // This is a planted line-reversal positive in actual ordered prose.
      if(j===0)assert.equal(unorderedMI(reverseAlternating(a).values),unorderedMI(a));
      samples.push(experiment(a,source.nullTrials));
    }
    controlResults.push({
      source:source.name,ing,windows:windowCount,
      minMI:Math.min(...samples.map(x=>x.observed)),
      maxMI:Math.max(...samples.map(x=>x.observed)),
      minZ:Math.min(...samples.map(x=>x.z)),
      medianZ:samples.map(x=>x.z).sort((a,b)=>a-b)[Math.floor(samples.length/2)],
      detectedZ2:samples.filter(x=>x.z>=2).length,
      detectedZ3:samples.filter(x=>x.z>=3).length
    });
  }
}
assert.equal(controlResults.reduce((s,x)=>s+x.windows,0),116);
assert(controlResults.every(x=>x.minMI>sourceResult.observed));
const detected=controlResults.reduce((s,x)=>s+x.detectedZ2,0);
assert(detected>=105);

console.log(JSON.stringify({
  originalWords:original.length,originalRuneCount:12956,
  originalPhysicalPages:55,sourceCrossLineWords:452,
  withinLineUnorderedEdges:edges.length,chapterWordCounts:groups.map(g=>g.length),
  lineReversalPlant:{components:inverted.components,
    observedMI:observed,afterMI:unorderedMI(inverted.values)},
  sourceResult,controlWindows:116,detectableControlWindowsZ2:detected,
  controlResults,
  decision:"Pure page/line reorder or reversal of intact original complete-word units cannot restore natural line-internal word-length pair grammar; no plaintext/key."
},null,2));
