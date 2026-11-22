"use strict";

const fs = require("node:fs");

/**
 * Locate repeated rune substrings inside a precisely delimited corpus.
 * Physical page boundaries may interrupt a word, so all unresolved pages
 * are concatenated. The solved AN END and PARABLE pages are never included.
 *
 * @param {string} source Raw LP2 master transcription.
 * @param {number} k Substring length in runes.
 * @returns {{corpusLength:number, pageLengths:number[], repeats:{runes:string, first:number, second:number}[]}}
 */
function scanRepeats(source, k) {
  const pages = source.split("%").map((chunk) =>
    Array.from(chunk).filter((c) => /^[\u16A0-\u16FF]$/u.test(c)).join("")
  );
  const pageLengths = pages.map((page) => page.length);
  const corpus = pages.slice(0, 55).join("");
  const firstSeen = new Map();
  const repeats = [];
  for (let i = 0; i <= corpus.length - k; i += 1) {
    const runes = corpus.slice(i, i + k);
    const first = firstSeen.get(runes);
    if (first === undefined) firstSeen.set(runes, i);
    else repeats.push({ runes, first, second: i });
  }
  return { corpusLength: corpus.length, pageLengths, repeats };
}

/**
 * @param {string} source
 * @returns {{lastSix:string, solvedInitial:string, falseSeven:string, page27Seven:string}}
 */
function boundaryWitness(source) {
  const pages = source.split("%").map((chunk) =>
    Array.from(chunk).filter((c) => /^[\u16A0-\u16FF]$/u.test(c)).join("")
  );
  return {
    lastSix: pages[54].slice(-6),
    solvedInitial: pages[55].slice(0, 1),
    falseSeven: pages[54].slice(-6) + pages[55].slice(0, 1),
    page27Seven: pages[27].slice(28, 35),
  };
}

function main() {
  const source = fs.readFileSync(process.argv[2] || "resources/lp2-transcription.txt", "utf8");
  const six = scanRepeats(source, 6);
  const seven = scanRepeats(source, 7);
  const witness = boundaryWitness(source);
  if (six.corpusLength !== 12956 || six.pageLengths.length !== 57) {
    throw new Error("Unexpected corpus segmentation");
  }
  if (six.pageLengths[54] !== 76 || six.pageLengths[55] !== 85 ||
      six.pageLengths[56] !== 95) {
    throw new Error("End-page structure changed");
  }
  if (six.repeats.length !== 1 ||
      six.repeats[0].runes !== "ᛞᛄᚢᛒᛖᛁ" ||
      six.repeats[0].first !== 6555 || six.repeats[0].second !== 12950) {
    throw new Error("Six-rune duplicate invariant failed");
  }
  if (seven.repeats.length !== 0 || witness.falseSeven !== witness.page27Seven) {
    throw new Error("The alleged seven-rune duplicate is not a solved-page boundary splice");
  }
  process.stdout.write(JSON.stringify({
    source: "resources/lp2-transcription.txt",
    cipherLength: six.corpusLength,
    pages: six.pageLengths.length,
    unsolvedPages: 55,
    solvedPageLengths: six.pageLengths.slice(55),
    repeats6: six.repeats,
    repeats7: seven.repeats,
    boundaryWitness: witness,
  }, null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { scanRepeats, boundaryWitness };
