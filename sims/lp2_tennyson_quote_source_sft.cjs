"use strict";
/**
 * Agent48: source-locked 1842 Lady of Shalott quotation crib test (#635).
 * Run from repository root: node sims/lp2_tennyson_quote_source_sft.cjs
 * Node.js 22 CommonJS; no external modules, network, or broad book search.
 *
 * Original text witness:
 *   https://github.com/GITenberg/The-Early-Poems-of-Alfred-Lord-Tennyson_8601/blob/master/8601.txt
 *   SHA-1 Git blob f8b91a01e538f0d5c6400a4da728a27a46b4aff7
 *   poem substring UTF-16 indices [135593,141652), including footnote tags.
 * Source edition 1842 (Collins's early-poems notes preserve 1833 variants).
 * Compare the original seven runic quote windows without fitting a key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const sha256 = s => createHash("sha256").update(s, "utf8").digest("hex");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const quotes = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json")).quotes;
const originalSource = read("resources/liber-primus/lp2-transcription.txt");
const runes = new Set(corpus.runes);

/** @returns {{start:number,end:number,glyphs:string,length:number}[]} */
function originalWords() {
  let runeOffset = 0;
  let start = 0;
  let current = "";
  const words = [];
  function flush() {
    if (!current) return;
    words.push({start, end:runeOffset, glyphs:current, length:[...current].length});
    current = "";
  }
  for (const char of originalSource.split("%").slice(0,55).join("%")) {
    if (runes.has(char)) {
      if (!current) start = runeOffset;
      current += char;
      runeOffset++;
    } else if (char === "%" || char === "/" || /\s/u.test(char)) {
      // Original page and line wraps preserve continued printed words.
    } else flush();
  }
  flush();
  assert.equal(runeOffset,12956);
  assert.equal(words.length,2896);
  return words;
}

/**
 * Source graphemes as alphabetic runs. The editorial [n] markers and
 * PART headings were outside the poem itself, and are stripped first.
 * @param {string} s
 * @returns {string[]}
 */
function poemWords(s) {
  return (s.replace(/\[\d{1,2}\]/gu,"")
    .replace(/^\s*PART\s+(?:I|II|III|IV)\s*$/gmu,"")
    .toUpperCase().match(/[A-Z]+/gu) || []);
}

const tokens = corpus.translit.slice().sort((a,b)=>b.length-a.length);
/** @param {string} raw @param {boolean} foldIng @returns {number} */
function gpLength(raw,foldIng) {
  let w=raw.replace(/QU/gu,"CW").replace(/V/gu,"U")
    .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
  if(foldIng) w=w.replace(/ING/gu,"NG");
  let length=0;
  for(let i=0;i<w.length;) {
    const token=tokens.find(t=>w.startsWith(t,i));
    assert(token,"unknown GP token at "+i+" in "+w);
    i+=token.length;
    length++;
  }
  return length;
}

/**
 * Longest exact contiguous source/quotation word-length run.
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{complete:number,n:number,s:number,q:number,runes:number}}
 */
function match(source,target) {
  const dp=new Uint16Array(target.length);
  const prefix=[0];
  for(const len of target) prefix.push(prefix.at(-1)+len);
  let complete=0;
  let best={complete:0,n:0,s:-1,q:-1,runes:0};
  for(let i=0;i<source.length;i++) {
    for(let j=target.length-1;j>=0;j--) {
      dp[j]=source[i]===target[j] ? (j===0 ? 1 : dp[j-1]+1) : 0;
      const n=dp[j];
      if(!n)continue;
      const runes=prefix[j+1]-prefix[j+1-n];
      if(n>best.n || (n===best.n && runes>best.runes)) {
        best={complete:0,n,s:i-n+1,q:j-n+1,runes};
      }
    }
    if(dp[target.length-1]===target.length) complete++;
  }
  return {...best,complete};
}

/** Stable wrong-order control. @param {number[]} a @param {number} seed */
function shuffle(a,seed) {
  const result=a.slice();
  let x=seed>>>0;
  for(let i=result.length-1;i>0;i--) {
    x^=x<<13;x^=x>>>17;x^=x<<5;
    const j=(x>>>0)%(i+1);
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

assert.equal(quotes.length,7);
const original=originalWords();
const expectedCounts=[4,5,2,14,13,34,14];
const expectedSha=[
  "63fc17007006c722d4499193d3a99e7e21e8a917390b84b650e49effcb1d5897",
  "4f6afe50dd170c5f13fd7ac120084a6660396bead790e11bbf36a2919e58dcd0",
  "5c4a5c8b3d46f45ef5d6defcd70913c30036ed6e5240e67850ae9c922a3b57b4",
  "bdde0efb32e5411684c5b6ab9344fc16376485e7e1d0defdf4adb30e06250148",
  "5396834f1468f0efde79621ad13fcb02a8f5f31909552ed9db904e96c8b8ba88",
  "910ed2b11ffad802b8d269297296731a486a98c1fc17a232fa03bcf92d9c2a7e",
  "9601a31e0197eb30af7e03bc41c57ed18f964b9c3cb3ce010eb1f439ebf57e6c"
];
const tape=quotes.map((q,i)=>{
  const selected=original.filter(w=>w.start>=q.start && w.end<=q.end);
  assert.equal(selected[0]?.start,q.start);
  assert.equal(selected.at(-1)?.end,q.end);
  assert.equal(selected.length,expectedCounts[i]);
  assert.equal(selected.reduce((s,w)=>s+w.length,0),q.end-q.start);
  assert.equal(sha256(selected.map(w=>w.glyphs).join("")),expectedSha[i]);
  return selected.map(w=>w.length);
});
assert.equal(tape.reduce((s,a)=>s+a.reduce((n,x)=>n+x,0),0),405);

const raw=read("resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt");
assert(raw.startsWith("PART I\r\n"));
assert(raw.includes("The Lady of Shalott"));
const sourceWords=poemWords(raw);
assert.equal(sourceWords.length,1003);
const rows=[];
for(const foldIng of [true,false]) {
  const lengths=sourceWords.map(word=>gpLength(word,foldIng));
  // Planted 34-word exact source witness. This is algorithm validation only.
  const seed=lengths.slice(200,234);
  const control=match(lengths,seed);
  assert.equal(control.n,34);
  assert(control.complete>=1);
  for(let quote=0;quote<7;quote++) {
    const observed=match(lengths,tape[quote]);
    const nullMatch=match(shuffle(lengths,0x33012012),tape[quote]);
    assert.equal(observed.complete,quote===2?3:0);
    assert.equal(observed.n,[3,3,2,4,4,5,4][quote]);
    rows.push({
      source:"Tennyson 1842",
      foldIng,quote,sourceWords:sourceWords.length,
      quoteWords:tape[quote].length,quoteRunes:tape[quote].reduce((a,b)=>a+b,0),
      ...observed,wrongOrderLongest:nullMatch.n,
      sourceExcerpt:sourceWords.slice(observed.s,observed.s+observed.n).join(" ")
    });
  }
}
console.log(JSON.stringify({
  sourceEdition:"1842 (GITenberg 8601 poem body)",sourceSha256:sha256(raw),
  sourceWords:sourceWords.length,originalWords:original.length,
  originalRuneCount:12956,positivePlant:"source-native 34-word recovered",
  matches:rows,
  conclusion:"No 12-word, 40-rune exact source quotation match. Only this source edition is tested."
},null,2));
