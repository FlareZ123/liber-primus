"use strict";

/**
 * Original-source rubric grammar gate for Director #2250.
 * Compares correct LP2 p0 two-word red13 title, two independent contrasting
 * red headings, and authenticated p56/p57 solved-title modes. No conjectural
 * decipherment operation is fitted to an unknown LP2 page.
 * Run: node sims/lp2_red_heading_instruction_grammar_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} source */
const json = (source) => JSON.parse(fs.readFileSync(path.join(root,source),"utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const override = json("resources/liber-primus/lp2-p0-physical-ink-override.json");
const raw = fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8")
  .replace(/\r\n/gu,"\n");
const transcripts = raw.split(/\n%\n/gu);
const indexByRune = new Map(corpus.runes.map((r,i) => [r,i]));
const gp = (indices) => indices.map((i) => corpus.translit[i]).join("");
const runes = (s) => [...s].filter((r) => indexByRune.has(r));
/** @param {string} s */
const splitRuneWords = (s) => s.split(/[^\u16a0-\u16ff]+/u).filter(Boolean);

/** @param {number} page */
function sourcePage(page) {
  // The runeless 256-cell LP2 p50 is absent from the 57-part rune transcript.
  return transcripts[page < 50 ? page : page - 1];
}
/** @param {number} page @param {{start:number,length:number}} span */
function wordsInSpan(page,span) {
  const text = sourcePage(page);
  const offsets = [];
  for (let k=0;k<text.length;k++) if(indexByRune.has(text[k])) offsets.push(k);
  assert.equal(offsets.length,corpus.pages[page].indices.length);
  const first = offsets[span.start];
  const final = offsets[span.start+span.length-1];
  assert(Number.isInteger(first) && Number.isInteger(final));
  const slice = text.slice(first,final+1);
  const words = splitRuneWords(slice);
  assert.equal(runes(slice).length,span.length);
  const expected = corpus.pages[page].indices.slice(span.start,span.start+span.length);
  assert.deepEqual(runes(slice).map((r)=>indexByRune.get(r)),expected);
  return words;
}
const red = [];
for (const annotated of ink.pages) {
  for (const span of annotated.red_spans||[]) {
    const words = wordsInSpan(annotated.page,span);
    red.push({page:annotated.page,start:span.start,length:span.length,
      rawWords:words,transliteratedWords:words.map((w) => gp(runes(w).map((r) => indexByRune.get(r))))});
  }
}
assert.equal(red.length,18); // 16 unknown + 2 solved
assert.equal(red.reduce((n,section)=>n+section.length,0),225);
const unsolved = red.filter((section)=>section.page<56);
assert.equal(unsolved.length,16);
assert.equal(unsolved.reduce((n,section)=>n+section.length,0),213);
const allWords = unsolved.flatMap((section)=>section.rawWords);
assert.equal(new Set(allWords).size,allWords.length,"none of the unknown red words repeat");

/** @param {number} page */
const annotation = (page) => ink.pages.find((p)=>p.page===page);
const p0 = annotation(0),p8=annotation(8),p40=annotation(40);
assert.deepEqual(override.physical_zero_based.red_words.map((w)=>w.length),[8,5]);
assert.deepEqual(override.physical_zero_based.small_punctuation.map((w)=>w.after_runes),[8]);
assert.deepEqual(override.physical_zero_based.large_punctuation.map((w)=>[w.after_runes,w.dots,w.ink]),[[13,13,"red"]]);
assert.deepEqual(red.find((span)=>span.page===0).transliteratedWords,["SHEOGMIAF","SYENGC"]);
assert.equal(p0.red_spans[0].length,13);
assert.deepEqual(red.find((span)=>span.page===8).transliteratedWords,["XIXM","UXMCTHPOB"]);
assert.deepEqual(red.find((span)=>span.page===40).transliteratedWords,["FNM","YGDAEH"]);
assert.equal((p8.large_punctuation || []).length,0);
assert.equal((p40.large_punctuation || []).length,0);

const p56=annotation(56),p57=annotation(57);
assert.deepEqual(p56.large_punctuation[0],[5,13,"red"]);
assert.deepEqual(p57.large_punctuation[0],[7,13,"red"]);
const red56=corpus.pages[56].indices.slice(0,5);
const red57=corpus.pages[57].indices.slice(0,7);
assert.deepEqual(red56,[25,11,22,15,4]);
assert.equal(gp(red56),"AEJOESR");
assert.equal(gp(red57),"PARABLE");
const phi=[1,2,4,6,10]; // first five phi(p)=p-1, p=2,3,5,7,11
const mod29=(n)=>(n%29+29)%29;
const de56=red56.map((v,i)=>mod29(v-phi[i]));
assert.equal(gp(de56),"ANEND"); // authentic solved p56 AN END
assert.deepEqual(de56.map((v,i)=>mod29(v+phi[i])),red56);
const phi57=red57.map((v,i)=>mod29(v-phi[i%phi.length]));
assert.notEqual(gp(phi57),"PARABLE");
assert.notEqual(gp(red56),"ANEND");
assert.equal(gp(red57),"PARABLE");

const full0=corpus.pages.slice(0,3).flatMap((p)=>p.indices);
assert.deepEqual(full0.slice(0,13),corpus.pages[0].indices.slice(0,13));
assert.equal(full0.length,729);
assert.equal(full0.slice(13).length,716);
assert.equal(corpus.pages[8].indices.length-12,243);
assert.equal(corpus.pages[40].indices.length-8,223);

console.log(JSON.stringify({
  source:"original LP2 runes and separately adjudicated red ink, marks and spaces",
  redInventory:{unsolvedRedRunes:213,unsolvedSpans:16,
    completeRedWordTokens:allWords.length,uniqueExactRedWordTokens:new Set(allWords).size},
  contrast:{
    p0:{words:red.find((span)=>span.page===0).transliteratedWords,
      redLengths:[8,5],separatorAfterFirst:8,red13DotAfterRune:13,
      blackOriginalChapterLength:716},
    p8:{words:red.find((span)=>span.page===8).transliteratedWords,
      red12:true,blackRunes:243,largeDotAfterTitle:false},
    p40:{words:red.find((span)=>span.page===40).transliteratedWords,
      red8:true,blackRunes:223,largeDotAfterTitle:false}
  },
  solvedControl:{
    p56:{originalRed:gp(red56),decodedPlain:gp(de56),mode:"prime-totient",
      red13DotAfterTitle:true,redCipherWordCount:1,plaintextWordCount:2,
      exactRedFiveForwardReplay:true},
    p57:{originalRed:gp(red57),decodedPlain:gp(red57),mode:"literal",
      red13DotAfterTitle:true,redCipherWordCount:1,plaintextWordCount:1,
      phiDecodedWouldDiffer:gp(phi57)},
  },
  decision:"red color, word boundaries and a 13-dot title separator do not uniquely specify a finite cipher opcode, clock or key; no source-authored p0 rubric grammar was found",
},null,2));
