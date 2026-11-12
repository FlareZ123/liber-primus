"use strict";
/**
 * SFT: prior Cicada-cited book texts against the original p42 quotation tapes.
 *
 * Reproducible offline with Node.js 22 and repository data only.
 * Inputs are GP-length fingerprints derived from five pinned historical-text
 * witnesses. No copyrighted literary text is redistributed in this test.
 * Original printed runes and word boundaries are independently re-parsed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
const library = JSON.parse(read("im-results/quote2012-source-length-fingerprints.json"));
const runes = new Set(corpus.runes);
const sha = s => createHash("sha256").update(s, "utf8").digest("hex");

/**
 * @param {string} raw original transcribed book, '%' page and '/' wrap
 * @returns {{length:number,start:number,end:number,glyphs:string}[]}
 */
function sourceWords(raw) {
  const words = [];
  let runeOffset = 0;
  let start = 0;
  let word = "";
  function flush() {
    if (!word) return;
    words.push({length:[...word].length,start,end:runeOffset,glyphs:word});
    word = "";
  }
  for (const ch of raw.split("%").slice(0,55).join("%")) {
    if (runes.has(ch)) {
      if (!word) start = runeOffset;
      runeOffset++;
      word += ch;
    } else if (ch === "%" || ch === "/" || /\\s/u.test(ch)) {
      // Physical line/page wraps do not end words in the original source.
    } else {
      flush();
    }
  }
  flush();
  assert.equal(runeOffset, 12956);
  assert.equal(words.length, 2896);
  return words;
}

/**
 * Longest consecutive common word-length run under a frozen source register.
 * Reports arbitrary partial overlaps as a diagnostic, and whole-span matches
 * as the actual plaintext-crib gate.
 * @param {string} tape character-coded source length tape
 * @param {number[]} target original GP rune counts per printed word
 * @param {string} alphabet characters representing lengths 0..63
 */
function match(tape, target, alphabet) {
  const pattern = target.map(n => alphabet[n]).join("");
  const dp = Array(target.length).fill(0);
  let best = {length:0,sourceOffset:-1,quoteOffset:-1};
  for (let i=0;i<tape.length;i++) {
    for (let j=target.length-1;j>=0;j--) {
      dp[j] = tape[i] === pattern[j] ? (j ? dp[j-1]+1 : 1) : 0;
      if (dp[j] > best.length) {
        const length = dp[j];
        best = {length,sourceOffset:i-length+1,quoteOffset:j-length+1};
      }
    }
  }
  let full=0, cursor=0;
  while ((cursor=tape.indexOf(pattern,cursor)) !== -1) {
    full++;
    cursor++;
  }
  return {...best,completeMatches:full};
}

/**
 * @param {string} s source length tape
 * @param {number} seed fixed seed for one wrong-order control
 * @returns {string} independently shuffled source lengths
 */
function shuffle(s,seed) {
  const v=[...s];
  let x=seed>>>0;
  for(let i=v.length-1;i>0;i--) {
    x^=x<<13; x^=x>>>17; x^=x<<5;
    const j=(x>>>0)%(i+1);
    [v[i],v[j]]=[v[j],v[i]];
  }
  return v.join("");
}

assert.equal(library.schema,1);
assert.equal(library.alphabet.length,64);
assert.equal(new Set(library.alphabet).size,64);
assert.equal(library.sources.length,5);
const original = sourceWords(read("resources/lp2-transcription.txt"));
const flat = corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(flat.length,12956);
const focus=[4,5].map(index=>{
  const quote=annotations.quotes[index];
  const words=original.filter(w=>w.start>=quote.start && w.end<=quote.end);
  assert.equal(words[0].start,quote.start);
  assert.equal(words.at(-1).end,quote.end);
  assert.equal(words.reduce((s,w)=>s+w.length,0),quote.end-quote.start);
  const indices=words.flatMap(w=>[...w.glyphs].map(g=>corpus.runes.indexOf(g)));
  assert.deepEqual(indices,flat.slice(quote.start,quote.end));
  return {index,offsets:[quote.start,quote.end],
    lengths:words.map(w=>w.length),sha256:sha(words.map(w=>w.glyphs).join(""))};
});
assert.deepEqual(focus.map(q=>q.lengths),[
  [9,8,3,4,6,3,10,2,4,7,6,2,4],
  [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5]
]);
assert.deepEqual(focus.map(q=>q.sha256),[
  "5396834f1468f0efde79621ad13fcb02a8f5f31909552ed9db904e96c8b8ba88",
  "910ed2b11ffad802b8d269297296731a486a98c1fc17a232fa03bcf92d9c2a7e"
]);
console.log("ORIGINAL",JSON.stringify(focus.map(({index,offsets,lengths,sha256})=>
 ({index,offsets,words:lengths.length,runes:lengths.reduce((s,n)=>s+n,0),sha256}))));
let globalMax=0, fullTotal=0;
for (const source of library.sources) {
  assert.equal(source.gp.length,source.word_count);
  assert.equal(source.raw.length,source.word_count);
  for (const conv of ["gp","raw"]) {
    const tape=source[conv];
    assert.ok([...tape].every(ch=>library.alphabet.includes(ch)));
    const plant=tape.slice(200,234);
    assert.equal(plant.length,34);
    const plantL=[...plant].map(ch=>library.alphabet.indexOf(ch));
    assert.equal(match(tape,plantL,library.alphabet).length,34);
    for(const quote of focus) {
      const originalMatch=match(tape,quote.lengths,library.alphabet);
      const shuffledMatch=match(shuffle(tape,0x33012012),quote.lengths,library.alphabet);
      assert.equal(originalMatch.completeMatches,0);
      assert.ok(shuffledMatch.length < 12);
      globalMax=Math.max(globalMax,originalMatch.length);
      fullTotal+=originalMatch.completeMatches;
      console.log("ORIGINAL-SOURCE",JSON.stringify({
        id:source.id,blob:source.git_blob_sha,words:source.word_count,
        convention:conv,originalQuote:quote.index,
        ...originalMatch,wrongOrderMaximum:shuffledMatch.length,
        sourceNative34WordPlant:"recovered"
      }));
    }
  }
}
assert.ok(globalMax<12);
assert.equal(fullTotal,0);
console.log("DECISION",JSON.stringify({
  uniqueSourceFamilies:3,sourceWitnesses:5,conventions:2,originalSpans:2,
  maximumConsecutiveOriginalWordLengths:globalMax,
  completeLongQuotationMatches:fullTotal,
  authenticatedPlaintextOrKeyRecovered:false
}));
