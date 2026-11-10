"use strict";
/**
 * Source-original quotation-prefix crosslink in LP2.
 * Run: node sims/lp2_quote_length_crosslink.cjs
 * Node 22 / CommonJS. No dependencies or model fitting.
 *
 * Null: rotate the *whole word-length sequence* of each quote-start
 * rune-bearing page independently, preserving order within each page,
 * preserving the quote's word ordinal, and sharing rotations where
 * two quotes begin on the same page. This is a conditional source-layout
 * test; it does NOT give a discovery-wide p-value or recover plaintext.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

/**
 * Parse canonical word starts while joining printed-line and page wraps.
 * Nonrune punctuation is a word delimiter, exactly as in
 * sims/lp2_word_pages.cjs. The printed numeric-only p50 is absent from
 * the rune-bearing transcription's page ordinal.
 * @param {string} transcript
 * @returns {Array<{start:number,end:number,length:number,page:number}>}
 */
function parseWords(transcript) {
  const words = [];
  let text = "", start = 0, firstPage = 0, page = 0, offset = 0;
  function flush() {
    if (!text) return;
    words.push({start, end:offset, length:offset - start, page:firstPage});
    text = "";
  }
  for (const char of transcript) {
    if (/[\u16A0-\u16FF]/u.test(char)) {
      if (!text) {start = offset; firstPage = page;}
      text += char;
      offset++;
    } else if (char === "%") {
      page++;
    } else if (char === "/" || /\s/u.test(char)) {
      // Line and page breaks do not terminate words.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {number} page Rune-bearing source page ordinal. */
function physicalPage(page) {
  return page >= 50 ? page + 1 : page;
}

/**
 * @param {number[]} lengths
 * @param {number} at
 * @returns {string}
 */
function fingerprint(lengths, at) {
  return Array.from({length:5}, (_, k) => lengths[(at + k) % lengths.length]).join(",");
}

function main() {
  const words = parseWords(read("resources/liber-primus/lp2-transcription.txt"));
  const quotes = JSON.parse(
    read("resources/liber-primus/lp2-quote-punctuation-spans.json")
  ).quotes;
  assert.equal(words.length, 2941);
  assert.equal(words.filter(w => w.start < 12956).length, 2896);

  const pageWords = new Map();
  for (const word of words) {
    if (word.start >= 12956) break;
    if (!pageWords.has(word.page)) pageWords.set(word.page, []);
    pageWords.get(word.page).push(word);
  }

  const starts = new Map(words.map((word, k) => [word.start, k]));
  const q = quotes.map(quote => {
    const index = starts.get(quote.start);
    assert.notEqual(index, undefined);
    const contained = words.slice(index).filter(w => (
      w.start >= quote.start && w.end <= quote.end
    ));
    assert.equal(contained.reduce((n, w) => n + w.length, 0), quote.end - quote.start);
    const here = words[index];
    const within = pageWords.get(here.page);
    const slot = within.findIndex(w => w.start === quote.start);
    assert(slot >= 0);
    return {runeStart:quote.start, runeEnd:quote.end,
      sourcePage:here.page, physicalPage:physicalPage(here.page),
      wordCount:contained.length, quoteLengths:contained.map(w => w.length),
      slot, corpusWord:index};
  });
  assert.equal(q.length, 7);
  const eligible = q.filter(x => x.wordCount >= 5);
  assert.equal(eligible.length, 5);

  // Original manuscript-wide frequency of the pair's common fingerprint.
  const sourceWords = words.filter(w => w.start < 12956);
  const target = [5,7,2,3,4].join(",");
  const hits = [];
  for (let i=0; i+5<=sourceWords.length; i++) {
    if (sourceWords.slice(i,i+5).map(w=>w.length).join(",") === target)
      hits.push({word:i,runeOffset:sourceWords[i].start});
  }
  assert.deepEqual(hits.map(h=>h.runeOffset),[9811,12522]);

  const comparisons = [];
  for (let i=0; i<eligible.length; i++) {
    const a = eligible[i], aa = pageWords.get(a.sourcePage);
    const na = aa.length, alens = aa.map(x=>x.length);
    for (let j=i+1; j<eligible.length; j++) {
      const b = eligible[j], bb = pageWords.get(b.sourcePage);
      const nb = bb.length, blens = bb.map(x=>x.length);
      const samePage = a.sourcePage === b.sourcePage;
      const supporting = [];
      for (let ra=0; ra<na; ra++) {
        const af = fingerprint(alens, a.slot+ra);
        for (let rb=0; rb<(samePage?1:nb); rb++) {
          const shift = samePage ? ra : rb;
          if (af === fingerprint(blens, b.slot+shift))
            supporting.push({rotationA:ra,rotationB:shift,wordLengths:af});
        }
      }
      comparisons.push({starts:[a.runeStart,b.runeStart],
        rotations:na*(samePage?1:nb),
        matches:supporting.length, witnesses:supporting});
    }
  }
  const survivors = comparisons.filter(x => x.matches>0);
  assert.equal(survivors.length, 1);
  assert.deepEqual(survivors[0].starts,[9811,12522]);
  assert.equal(survivors[0].matches,2);
  assert.equal(survivors[0].rotations,2145);
  assert.deepEqual(survivors[0].witnesses.map(x=>[x.rotationA,x.rotationB]),
    [[0,0],[40,14]]);

  const out = {
    finding:"Unique five-word length sequence at two independent quote openings",
    source:"Canonical unsolved LP2 words and independent original quote annotations",
    observedWordLengthPrefix:target,
    observedRuneStarts:hits.map(h=>h.runeOffset),
    quotes:q.map(x=>({start:x.runeStart,end:x.runeEnd,page:x.physicalPage,
      words:x.wordCount,prefix:x.quoteLengths.slice(0,5).join(",")})),
    allFiveWordQuotePairs:comparisons,
    exactConditionalFamilyProbability:"2/2145",
    probability:2/2145,
    caution:"Original five-word plaintext equality and cipher key are unproved. Rotations test only this fixed quote-start/page-word null, with no discovery-wide selection correction."
  };
  console.log(JSON.stringify(out,null,2));
}
if (require.main === module) main();
module.exports = {parseWords, physicalPage, fingerprint, main};
