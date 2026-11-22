'use strict';

/**
 * Exact phrase-constraint attack on the p48/p52 same-length bridge.
 * Run: node sims/p48_p52_two_time_pad_word_ac_sft.cjs
 *
 * p48 is 271 runes; its final 8 runes form the terminal printed
 * factor fragment, leaving a 263-rune prefix. p52 contains 263 runes
 * immediately after the 256-byte grid and its enclosing short texts.
 *
 * Hypothesis: the 263 runes in each page encrypt independent GP-English
 * plaintext under the SAME ALIGNED additive mod29 pad; original printed
 * word delimiters are plaintext delimiters. Require both word streams
 * use words attested in stored Shakespeare, Emerson or solved LP1.
 *
 * This original-source test uses *no guessed pad*: it cancels exactly.
 * Arc consistency enforces local GP symbol difference constraints for
 * every pair of overlapping words. It is a bounded exclusion of this
 * explicit source/dictionary/segmentation model, not all OTP reuse.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt').split('%');
const dict = new Map();
const gp = new Map(corpus.translit.map((g, i) => [g, i]));
const symbols = new Map(corpus.runes.map((g, i) => [g, i]));

/** @param {string} str @returns {number[]|null} */
function encodeWord(str) {
  const w = str.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < w.length;) {
    const digraph = gp.get(w.slice(i, i + 2));
    if (digraph !== undefined) {out.push(digraph); i += 2;}
    else {
      const rune = gp.get(w[i]);
      if (rune === undefined) return null;
      out.push(rune);
      i++;
    }
  }
  return out;
}
const wordSources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt'
];
for (const source of wordSources)
  for (const word of read(source).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeWord(word);
    if (!encoded) continue;
    let words = dict.get(encoded.length);
    if (!words) {words = new Map(); dict.set(encoded.length, words);}
    words.set(encoded.join(','), encoded);
  }
/** @param {number} pageIndex Index in uncompressed transcript. */
function pieces(pageIndex) {
  return transcript[pageIndex].replace(/\/\s*/g, '')
    .split(/[-.$&§\s]+/)
    .filter(w => /^[\u16A0-\u16FF]+$/u.test(w))
    .map(w => [...w].map(ch => symbols.get(ch)));
}
const aWords = pieces(48).slice(0,-1);
const bWords = pieces(51); // the original runeless p50 omitted in transcript
const length = p => p.reduce((s,w) => s+w.length, 0);
assert.deepEqual([length(aWords),length(bWords)], [263,263]);
assert.deepEqual([aWords.length,bWords.length], [66,60]);
const aCipher = corpus.pages.find(p => p.page === 48).indices.slice(0,-8);
const bCipher = corpus.pages.find(p => p.page === 52).indices;
assert.deepEqual(aCipher, aWords.flat());
assert.deepEqual(bCipher, bWords.flat());

/** @param {number[][]} words */
function domains(words) {
  let start = 0;
  return words.map((word, i) => {
    const result = {i,start,len:word.length,
      candidates:[...(dict.get(word.length)?.values() || [])]};
    start += word.length;
    return result;
  });
}
const A = domains(aWords), B = domains(bWords);
const edges = [];
for (let i = 1; i < A.length; i++)
  for (let j = 1; j < B.length - 1; j++) {
    // Source-printed p48 first fragment and p52 first/last fragments
    // may continue across external page boundaries, so skip these.
    const a = A[i],b = B[j];
    const start = Math.max(a.start,b.start);
    const end = Math.min(a.start+a.len,b.start+b.len);
    if (end > start) edges.push({i,j,start,end});
  }
assert.equal(edges.length,106);

/** @param {number[][]} left @param {number[][]} right */
function cancellation(left,right) {
  const L = left.flat(),R = right.flat();
  assert.equal(L.length,263);
  assert.equal(R.length,263);
  return L.map((x,i)=>(x-R[i]+29)%29);
}
const observedDelta = cancellation([aCipher],[bCipher]);

/**
 * AC-3 style bipartite constraint propagation.
 * A word candidate survives an overlap if a B candidate exists at the
 * same positions with the exact required modular letter difference.
 * @param {number[]} delta
 * @param {number} maxPasses
 */
function arcConsistent(delta, maxPasses = 30) {
  const a = domains(aWords),b = domains(bWords);
  const originalCounts = [a,b].map(page =>
    page.reduce((sum,word)=>sum+word.candidates.length,0));
  let removed = 0;
  for(let pass = 0; pass < maxPasses; pass++) {
    let changed = 0;
    for (const edge of edges) {
      const x = a[edge.i], y = b[edge.j], width = edge.end-edge.start;
      const aStart = edge.start-x.start,bStart=edge.start-y.start;
      const bKeys = new Set(y.candidates.map(w =>
        String.fromCharCode(...w.slice(bStart,bStart+width))));
      const supportB = new Set(),filteredA = [];
      for (const w of x.candidates) {
        const needed = [];
        for (let j=0;j<width;j++)
          needed.push((w[aStart+j]-delta[edge.start+j]+29)%29);
        const signature=String.fromCharCode(...needed);
        if (bKeys.has(signature)) {
          filteredA.push(w);
          supportB.add(signature);
        }
      }
      const filteredB = y.candidates.filter(w =>
        supportB.has(String.fromCharCode(...w.slice(bStart,bStart+width))));
      changed += x.candidates.length-filteredA.length +
        y.candidates.length-filteredB.length;
      x.candidates=filteredA;
      y.candidates=filteredB;
      if (!filteredA.length || !filteredB.length)
        return {feasible:false,pass,unsatEdge:edge,overlapRunes:width,
          removed:removed+changed,originalCounts};
    }
    removed += changed;
    if (!changed)
      return {feasible:true,pass,removed,originalCounts,
        remaining:[a,b].map(page=>page.reduce((s,w)=>s+w.candidates.length,0))};
  }
  return {feasible:true,incomplete:true,removed,originalCounts};
}
const original = arcConsistent(observedDelta);
assert.equal(original.feasible,false);

// Independent positive: choose one attested dictionary GP word for each
// printed fragment. Encrypt BOTH assembled streams under one identical,
// completely secret generated 263-rune random pad. This must satisfy
// every local constraint despite no knowledge of the pad.
let state=0x15033017;
function random() {
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
}
const plantA = aWords.map(word=> {
  const list = [...dict.get(word.length).values()];
  return list[random()%list.length];
});
const plantB = bWords.map(word=> {
  const list = [...dict.get(word.length).values()];
  return list[random()%list.length];
});
const pad=Array.from({length:263},()=>random()%29);
const encryptedA=plantA.flat().map((v,i)=>(v+pad[i])%29);
const encryptedB=plantB.flat().map((v,i)=>(v+pad[i])%29);
const plantDelta=encryptedA.map((v,i)=>(v-encryptedB[i]+29)%29);
assert.deepEqual(plantDelta,cancellation(plantA,plantB));
const positive=arcConsistent(plantDelta);
assert.equal(positive.feasible,true);
console.log(JSON.stringify({
  originalPageLengths:{p48:271,p48Prefix:263,p48Tail8:8,p52:263},
  sourceWordFragments:[aWords.length,bWords.length],
  vocabularySources:wordSources,
  vocabularyByLength:[...dict].map(([len,list])=>[len,list.size])
    .sort((a,b)=>a[0]-b[0]),
  observedSameKeyCancellation:{
    runeCount:observedDelta.length,
    constrainedWordOverlapEdges:edges.length,
    originalSourceVocabResult:original
  },
  plantedSharedPadPositive:{
    sameOriginalWordLayouts:true,hiddenPadLength:pad.length,
    originalDifferenceEliminatesPad:true,arcConsistency:positive
  },
  conclusion:'No exact two-time-pad English pair in the fixed 3-source dictionary with the original segment boundaries. Key equality without word preservation or a different lexicon is not excluded.'
},null,2));
