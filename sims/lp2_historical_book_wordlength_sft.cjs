"use strict";
/**
 * Source-frozen 2012/2013 Cicada book-code text crib gate for the original
 * 55 rune-bearing unsolved LP2 pages. No external dependencies or network.
 * Run from repository root: node sims/lp2_historical_book_wordlength_sft.cjs
 * This checks prose reuse while leaving the unknown cipher unchanged.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const sourceRoot = "resources/external/";
const files = [
  ["2013 Book of the Law I", "2013-book-of-law-I.txt"],
  ["2013 Book of the Law II", "2013-book-of-law-II.txt"],
  ["2013 Book of the Law III", "2013-book-of-law-III.txt"],
  ["2012 Blake second-chance page", "2012-marriage-of-heaven-and-hell-page.txt"]
];

/** @param {string} s @returns {string} */
function removeVerseNumbers(s) {
  return s.replace(/^\s*\d{1,3}\.\s*/gmu, "");
}

/** @param {string} s @returns {string[]} */
function latinWords(s) {
  return s.toUpperCase().match(/[A-Z]+/gu) || [];
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  return (word.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/gu) || []).length;
}

/**
 * Exact longest common contiguous GP-word-length sequence.
 * @param {number[]} target @param {number[]} source
 * @returns {{span:number,at:number,word:number}}
 */
function maxExact(target, source) {
  let prior = new Uint16Array(source.length + 1);
  let next = new Uint16Array(source.length + 1);
  let best = {span:0, at:0, word:0};
  for (let i=0; i<target.length; i++) {
    next.fill(0);
    for (let j=0; j<source.length; j++) {
      if (target[i] !== source[j]) continue;
      const span = prior[j] + 1;
      next[j+1] = span;
      if (span > best.span) best = {span,at:j-span+1,word:i-span+1};
    }
    [prior,next] = [next,prior];
  }
  return best;
}

/**
 * Exact six-word start followed by at most two rune-length errors.
 * Return the longest match excluding its third error.
 * @param {number[]} target @param {number[]} source
 * @returns {{span:number,errors:number,at:number,word:number}[]}
 */
function fuzzy(target, source) {
  const seed = 6, limit = 40;
  /** @type {Map<string,number[]>} */
  const index = new Map();
  for (let j=0; j+seed<=source.length; j++) {
    const k = source.slice(j,j+seed).join(",");
    const pos = index.get(k) || [];
    pos.push(j);
    index.set(k,pos);
  }
  const hits = [];
  for (let i=0; i+seed<=target.length; i++) {
    const k = target.slice(i,i+seed).join(",");
    for (const j of index.get(k) || []) {
      let span=seed, errors=0;
      while (span<limit && i+span<target.length && j+span<source.length) {
        if (target[i+span] !== source[j+span]) {
          if (errors === 2) break;
          errors++;
        }
        span++;
      }
      if (span >= 11) hits.push({span,errors,at:j,word:i});
    }
  }
  hits.sort((a,b)=>b.span-a.span || a.errors-b.errors || a.word-b.word || a.at-b.at);
  return hits;
}

const original = parseSharedCorpus();
assert.equal(original.words.length,2896);
assert.equal(original.runeCount,12956);
const target = original.words.map(w=>w.length);

const rawRunes = fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8").split("%");
const solvedPage = (rawRunes[56].match(/[\u16A0-\u16FF]+/gu) || []).join("");
const solvedLengths = [];
let count=0;
for(const c of rawRunes[56]) {
  if (/[\u16A0-\u16FF]/u.test(c)) count++;
  else if (c==="/" || c==="%" || /\s/u.test(c)) {}
  else if (count) {solvedLengths.push(count);count=0;}
}
if(count) solvedLengths.push(count);
const known = latinWords("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").map(gpLength);
assert.equal(solvedLengths.length,20);
assert.deepEqual(solvedLengths.flatMap((x,i)=>x===known[i]?[]:[i]),[4]);
assert.equal([...solvedPage].length,solvedLengths.reduce((s,n)=>s+n,0));

const books = files.map(([label,file])=>{
  let s=fs.readFileSync(path.join(root,sourceRoot,file),"utf8");
  s=removeVerseNumbers(s);
  if (label.startsWith("2012 ")) s=s.replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/gu,"$1$2");
  const words=latinWords(s);
  return {label,file,words,lengths:words.map(gpLength)};
});

const planted = books[0].lengths.slice(100,140);
const mismatched=planted.slice();
mismatched[12]++; mismatched[29]++;
assert(fuzzy(mismatched,books[0].lengths).some(h=>h.word===0&&h.at===100&&h.span===40&&h.errors===2));

console.log("Positive controls: solved p57 19/20 GP words exact (one known spelling difference); a hidden 40-word historical passage recovered through two planted word-length errors.");
console.log("Original unsolved LP2:",original.words.length,"words,",original.runeCount,"runes.");
for(const book of books) {
  const exact=maxExact(target,book.lengths);
  const hits=fuzzy(target,book.lengths);
  const first=hits[0] || null;
  const evidence = first ? book.words.slice(first.at,first.at+first.span).join(" ") : null;
  console.log(JSON.stringify({source:book.label,referenceWords:book.words.length,
    exactLongest:exact.span,exactLP2Word:exact.word,exactReferenceWord:exact.at,
    fuzzyLongest:first?.span ?? 0,fuzzyErrors:first?.errors ?? 0,
    fuzzyOriginalWord:first?.word ?? null,fuzzySourceWord:first?.at ?? null,
    fuzzyMatchedPassage:evidence,qualifiedFuzzyCandidates:hits.length}));
}
const combined=books.slice(0,3).flatMap(b=>b.words);
const combinedLengths=combined.map(gpLength);
const allExact=maxExact(target,combinedLengths);
const allFuzzy=fuzzy(target,combinedLengths);
assert.equal(allExact.span,8);
assert.equal(allFuzzy[0].span,13);
assert.equal(allFuzzy[0].errors,2);
console.log("Combined authentic 2013-source result:",JSON.stringify({
  sourceWords:combined.length,exactLongest:allExact.span,
  fuzzyLongest:allFuzzy[0].span,errors:allFuzzy[0].errors,
  originalWord:allFuzzy[0].word,sourceWord:allFuzzy[0].at,
  passage:combined.slice(allFuzzy[0].at,allFuzzy[0].at+allFuzzy[0].span).join(" ")
}));
console.log("Decision: no independently identifiable original LP2 plaintext crib from these exact historical book-code source passages.");
