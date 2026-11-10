"use strict";

const fs = require("node:fs");
const path = require("node:path");
const RUNIC = /[\u16A0-\u16FF]/u;

/**
 * Parse the LP2 community transcript as one continuous rune-word stream.
 * Physical page and typographical line boundaries do not terminate words.
 * @param {string} raw Transcript including % page separators.
 * @param {number} [unsolvedPages=55] Number of rune-bearing unsolved pages.
 * @returns {{
 *   words: Array<{runes:string,startPage:number,endPage:number,length:number}>,
 *   byStartPage: Array<Array<{runes:string,startPage:number,endPage:number,length:number}>>,
 *   byContainedPage: Array<Array<{runes:string,startPage:number,endPage:number,length:number}>>,
 *   crossPageWords:number, runeCount:number, originalPageFragments:number
 * }}
 */
function parseLP2Words(raw, unsolvedPages = 55) {
  const pageSegments = raw.split("%").slice(0, unsolvedPages);
  const stream = pageSegments.join("%");
  const byStartPage = Array.from({length: pageSegments.length}, () => []);
  const byContainedPage = Array.from({length: pageSegments.length}, () => []);
  const words = [];
  let current = "";
  let startPage = 0;
  let lastRunePage = 0;
  let page = 0;
  let runeCount = 0;

  function finish() {
    if (!current) return;
    const word = {runes: current, startPage, endPage: lastRunePage,
      length: [...current].length};
    words.push(word);
    byStartPage[startPage].push(word);
    if (startPage === lastRunePage) byContainedPage[startPage].push(word);
    current = "";
  }

  for (const character of stream) {
    if (RUNIC.test(character)) {
      if (!current) startPage = page;
      current += character;
      lastRunePage = page;
      runeCount++;
    } else if (character === "%") {
      page++;
    } else if (character === "/" || /\s/u.test(character)) {
      // Print wrapping is not a word delimiter.
    } else {
      // -, ., &, $, §, and explicit nonrune punctuation delimit words.
      finish();
    }
  }
  finish();
  const originalPageFragments = pageSegments.reduce((n, part) =>
    n + part.replace(/\/\s*/g, "").split(/[\s.%$&§-]+/)
      .filter((word) => /^[\u16A0-\u16FF]+$/u.test(word)).length, 0);
  return {words, byStartPage, byContainedPage,
    crossPageWords: words.filter((word) => word.startPage !== word.endPage).length,
    runeCount, originalPageFragments};
}

/** The numerical-grid-only original LP2 page 50 has no rune transcript. */
function physicalLP2Page(runeBearingIndex) {
  return runeBearingIndex >= 50 ? runeBearingIndex + 1 : runeBearingIndex;
}

function parseSharedCorpus() {
  const raw = fs.readFileSync(
    path.join(__dirname, "..", "resources", "lp2-transcription.txt"), "utf8");
  return parseLP2Words(raw);
}

module.exports = {parseLP2Words, parseSharedCorpus, physicalLP2Page};
