"use strict";

/**
 * Original p53/p55 same-moth additive-pad differential, all secret pad values.
 *
 * Two literal image- and typography-fixed alignments are tested:
 * (a) printed physical page starts, p53[0] with p55[0] (p55's first rune is a
 *     p54 carry, so its plaintext is unconstrained in the word lexicon);
 * (b) starts of the first complete words, p53[0] with p55[1].
 *
 * The exact GP29 difference between equal-key ciphertext positions eliminates
 * the entire secret pad. We solve word-overlap constraints for both English
 * plaintext streams using authenticated source-calibrated GP orthography.
 *
 * Windows Node.js 22 CommonJS SFT; no dependencies, no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const textPages = read("resources/lp2-transcription.txt").split("%");
const p53 = corpus.pages.find(page => page.page === 53).indices;
const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p53.length, 179);
assert.equal(p55.length, 76);
const translit = new Map(corpus.translit.map((s, i) => [s, i]));
const RUNES = new Set(corpus.runes);
const multi = ["ING", "TH", "NG", "EO", "OE", "AE", "EA", "IA", "IO"];

/** @param {number} physicalPage @returns {number[][]} */
function originalWords(physicalPage) {
  const source = textPages[physicalPage <= 49 ? physicalPage : physicalPage - 1];
  return source.replace(/\/\r?\n/gu, "").replace(/\r?\n/gu, "")
    .replace(/[&$]/gu, "-").split(/[-.\s]+/gu)
    .filter(Boolean).map(item => [...item].filter(glyph => RUNES.has(glyph))
      .map(glyph => corpus.runes.indexOf(glyph))).filter(item => item.length);
}
const words53 = originalWords(53);
const words55 = originalWords(55);
assert.deepEqual(words53.flat(), p53);
assert.deepEqual(words55.flat(), p55);
const lengths53 = words53.map(word => word.length);
const lengths55 = words55.map(word => word.length);
assert.deepEqual(lengths53, [
  5,3,7,3,3,4,8,6,4,4,4,2,5,7,2,3,4,10,3,9,7,3,7,
  4,3,3,2,3,5,4,4,11,2,3,2,6,5,5,2,2
]);
assert.deepEqual(lengths55, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);

/**
 * Enumerate all common GP spellings of a Roman word, including the historical
 * 2014 ING=>NG and IO=>IA rune conventions and optional two-letter ligatures.
 * @param {string} sourceWord
 * @param {Set<number>} lengths
 * @returns {number[][]}
 */
function gpForms(sourceWord, lengths) {
  if (!/^[a-z]+$/iu.test(sourceWord)) return [];
  const word = sourceWord.toUpperCase().replace(/QU/gu, "CW")
    .replace(/[KQ]/gu, "C").replace(/V/gu, "U").replace(/Z/gu, "S");
  const maxLength = Math.max(...lengths);
  /** @type {[number,number[]][]} */
  const stack = [[0, []]];
  /** @type {Map<string,number[]>} */
  const result = new Map();
  while (stack.length) {
    const [position, current] = stack.pop();
    if (current.length > maxLength) continue;
    if (position === word.length) {
      if (lengths.has(current.length)) result.set(current.join(","), current);
      continue;
    }
    const single = translit.get(word[position]);
    if (single !== undefined) stack.push([position + 1, [...current, single]]);
    for (const group of multi) {
      if (!word.startsWith(group, position)) continue;
      const rune = translit.get(group === "ING" ? "NG" : group === "IO" ? "IA" : group);
      assert.notEqual(rune, undefined);
      stack.push([position + group.length, [...current, rune]]);
    }
  }
  return [...result.values()];
}
const lengthSet = new Set([...lengths53, ...lengths55]);
const sourceTexts = [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/blake_song_of_liberty_train.txt"
];
/** @type {Map<number,Map<string,number[]>>} */
const formsByLength = new Map([...lengthSet].map(length => [length, new Map()]));
let rawEnglishWords = 0;
for (const file of sourceTexts) {
  const source = read(file);
  const words = file.endsWith("english_wordfreq_textblob.txt")
    ? source.split(/\r?\n/gu).filter(line => !line.startsWith(";")).map(line => line.split(/\s+/u)[0])
    : (source.match(/[A-Za-z]+/gu) || []);
  for (const word of words) {
    if (!/^[A-Za-z]+$/u.test(word)) continue;
    rawEnglishWords++;
    for (const form of gpForms(word, lengthSet)) {
      formsByLength.get(form.length).set(form.join(","), form);
    }
  }
}
const lexicon = new Map([...formsByLength].map(([n,forms]) => [n,[...forms.values()]]));
assert(lexicon.get(13).length > 100, "source-native 13-rune vocabulary absent");
assert(gpForms("CIRCUMFERENCES", new Set([14])).some(
  seq => seq.join(",") === [5,10,4,5,1,19,0,18,4,18,9,5,18,15].join(",")));
assert(gpForms("TUNNELING", new Set([7])).some(
  seq => seq.join(",") === [16,1,9,9,18,20,21].join(",")));

/** @param {number[]} lengths @returns {{i:number,start:number,end:number}[]} */
function intervals(lengths) {
  let start = 0;
  return lengths.map((length,i) => {
    const result = {i, start, end:start+length};
    start += length;
    return result;
  });
}

/**
 * Arc-consistency is exact for the overlapping interval-partition forest:
 * every original printed word is a variable, every intersecting pair is a
 * constraint, and the unknown pad cancels locally.
 * @param {number[]} cipher53
 * @param {number[]} cipher55
 * @param {"page-start"|"complete-word-start"} alignment
 */
function solve(cipher53, cipher55, alignment) {
  const complete = alignment === "complete-word-start";
  const bytes55 = complete ? cipher55.slice(1) : cipher55;
  const l55 = complete ? lengths55.slice(1) : lengths55;
  const count = complete ? 75 : 76;
  /** @type {{a:number,b:number,lo:number,hi:number,aOffset:number,bOffset:number}[]} */
  const edges = [];
  for (const a of intervals(lengths53)) {
    for (const b of intervals(l55)) {
      const lo = Math.max(a.start,b.start);
      const hi = Math.min(a.end,b.end,count);
      if (lo < hi) edges.push({
        a:a.i,b:b.i,lo,hi,aOffset:lo-a.start,bOffset:lo-b.start
      });
    }
  }
  /** @type {Map<number,number[][]>} */
  const aDomain = new Map();
  /** @type {Map<number,number[][]>} */
  const bDomain = new Map();
  for (const edge of edges) {
    if (!aDomain.has(edge.a)) aDomain.set(edge.a,lexicon.get(lengths53[edge.a]).slice());
    if (!bDomain.has(edge.b)) {
      const allowCarry = !complete && edge.b === 0;
      const values = allowCarry
        ? Array.from({length:29},(_,i)=>[i])
        : lexicon.get(l55[edge.b]).slice();
      bDomain.set(edge.b,values);
    }
  }
  const initial = [...aDomain.values(), ...bDomain.values()]
    .reduce((sum,list)=>sum+list.length,0);
  const trace = [];
  for(let iteration=0;iteration<20;iteration++){
    let removed=0;
    for(const edge of edges) {
      const {a,b,lo,hi,aOffset,bOffset}=edge;
      const delta = [];
      for(let index=lo;index<hi;index++) {
        delta.push((cipher53[index]-bytes55[index]+29)%29);
      }
      const left = aDomain.get(a), right = bDomain.get(b);
      const signaturesLeft = left.map(word => {
        const key=[];
        for(let k=0;k<delta.length;k++)key.push((word[aOffset+k]-delta[k]+29)%29);
        return key.join(",");
      });
      const signaturesRight = right.map(word =>
        word.slice(bOffset,bOffset+delta.length).join(","));
      const leftSet=new Set(signaturesLeft), rightSet=new Set(signaturesRight);
      const intersection=new Set([...leftSet].filter(key=>rightSet.has(key)));
      const nextLeft=left.filter((_,index)=>intersection.has(signaturesLeft[index]));
      const nextRight=right.filter((_,index)=>intersection.has(signaturesRight[index]));
      removed+=left.length-nextLeft.length+right.length-nextRight.length;
      aDomain.set(a,nextLeft);
      bDomain.set(b,nextRight);
    }
    trace.push(removed);
    if(!removed)break;
    if([...aDomain.values(),...bDomain.values()].some(values=>!values.length))break;
  }
  return {
    alignment, count, edges:edges.length, initial, trace,
    empty53:[...aDomain].filter(([,x])=>!x.length).map(([i])=>i),
    empty55:[...bDomain].filter(([,x])=>!x.length).map(([i])=>i),
    domain53:aDomain, domain55:bDomain
  };
}
const originalPageStart=solve(p53,p55,"page-start");
const originalCompleteStart=solve(p53,p55,"complete-word-start");
assert(originalPageStart.empty53.length && originalPageStart.empty55.length);
assert(originalCompleteStart.empty53.length && originalCompleteStart.empty55.length);

function nativePlant(alignment) {
  const complete=alignment==="complete-word-start";
  const length55=complete?lengths55.slice(1):lengths55;
  /** @param {number} length @param {number} index */
  const choose=(length,index)=>lexicon.get(length)[(index*11+7)%lexicon.get(length).length];
  const plain53=lengths53.flatMap((length,index)=>choose(length,index));
  const plain55=length55.flatMap((length,index)=>
    (!complete && index===0) ? [15] : choose(length,index+17));
  const total=complete?75:76;
  const pad=Array.from({length:total},(_,index)=>(13*index+7)%29);
  const encrypted53=plain53.map((v,index)=>index<total?(v+pad[index])%29:v);
  const encrypted55=complete
    ? [21, ...plain55.map((v,index)=>(v+pad[index])%29)]
    : plain55.map((v,index)=>(v+pad[index])%29);
  const result=solve(encrypted53,encrypted55,alignment);
  assert.equal(result.empty53.length,0,"planted page53 must have candidates");
  assert.equal(result.empty55.length,0,"planted page55 must have candidates");
  assert(result.domain53.get(0).some(w=>w.join(",")===choose(lengths53[0],0).join(",")),
    "must preserve exact planted first p53 word");
  return {alignment,edgeCount:result.edges,trace:result.trace,
    survivor53:[...result.domain53.values()].map(x=>x.length),
    survivor55:[...result.domain55.values()].map(x=>x.length)};
}
const controlA=nativePlant("page-start");
const controlB=nativePlant("complete-word-start");

const summary=caseResult=>({
  alignment:caseResult.alignment, originalRuneCount:caseResult.count,
  overlapEdges:caseResult.edges, lexicalInitialCandidates:caseResult.initial,
  eliminatedPerPass:caseResult.trace, emptyPage53Words:caseResult.empty53,
  emptyPage55Words:caseResult.empty55,
  conclusion:"NO dual English word assignment under the same arbitrary GP29 additive pad"
});
console.log(JSON.stringify({
  source:"unchanged original LP2 p53/p55, p55 first rune is real p54 continuation",
  dictionarySources:sourceTexts, rawEnglishWords, classesByGPWordLength:
    Object.fromEntries([...lexicon].map(([length,forms])=>[length,forms.length])),
  original:[summary(originalPageStart),summary(originalCompleteStart)],
  genuineNativeGPSharedPadPlantedControls:[controlA,controlB],
  status:"PASS: both source-natural alignments exclude a shared additive GP29 pad within a finite lexicon; planted positives survive"
},null,2));
