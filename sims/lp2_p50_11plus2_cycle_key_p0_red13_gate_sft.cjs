#!/usr/bin/env node
"use strict";

// Test the source-shaped 11+2 p50 functional-graph cycles as a 13-symbol
// receiver for the 13-rune p0 red heading. The 2016 signed-message coda is
// 11 words + 2 verification words; p0 carries a 13-dot marker.
const fs = require("node:fs");
const path = require("node:path");
const root = process.cwd();
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const signed = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");
const T = grid.bytes;
if (!Array.isArray(T) || T.length !== 256) throw new Error("Expected original 256-byte p50 table");

const codaStart = signed.indexOf("Seek and you will be found");
const verifyEnd = signed.indexOf("Verify OpenPGP", codaStart);
if (codaStart < 0 || verifyEnd < 0) throw new Error("Could not isolate signed-message coda");
const codaText = signed.slice(codaStart, verifyEnd + "Verify OpenPGP".length);
const codaWords = codaText.match(/[A-Za-z]+/g) || [];
if (codaWords.length !== 13) throw new Error("Expected 13 coda words; got " + codaWords.length);

function cycle(start) {
  const out = [start];
  let x = T[start];
  while (x !== start && out.length <= 256) {
    if (out.includes(x)) throw new Error("Unexpected non-simple cycle from " + start);
    out.push(x);
    x = T[x];
  }
  if (x !== start) throw new Error("Cycle did not close from " + start);
  return out;
}
const cycle11 = cycle(0);
const cycle2a = cycle(158);
const cycle2b = cycle(249);
if (cycle11.length !== 11 || cycle2a.length !== 2 || cycle2b.length !== 2) {
  throw new Error("Expected p50 cycles of lengths 11 and 2");
}
const p0 = corpus.pages.find(p => p.page === 0);
if (!p0 || p0.indices.length < 13) throw new Error("Missing p0 corpus");
const redCipher = p0.indices.slice(0, 13);
if (redCipher.length !== 13) throw new Error("Expected 13 p0 red-title runes");

const mod29 = x => ((x % 29) + 29) % 29;
const transliterate = xs => xs.map(x => corpus.translit[x]).join("");
const variants = [];
for (const cycle2 of [cycle2a, cycle2b]) {
  const nodes = cycle11.concat(cycle2);
  for (const projection of ["mod29", "quotient29"]) {
    const key = nodes.map(x => projection === "mod29" ? x % 29 : Math.floor(x / 29));
    for (const sign of [-1, 1]) {
      const direct = redCipher.map((c, i) => mod29(c + sign * key[i]));
      variants.push({
        type: "direct-additive",
        cycle2: cycle2.join("->"),
        projection,
        sign,
        key,
        output: direct,
        text: transliterate(direct)
      });
      let phase = 0;
      const fLiteral = redCipher.map(c => {
        if (c === 0) return 0;
        const value = mod29(c + sign * key[phase]);
        phase++;
        return value;
      });
      variants.push({
        type: "literal-F-no-consumption",
        cycle2: cycle2.join("->"),
        projection,
        sign,
        key,
        output: fLiteral,
        text: transliterate(fLiteral)
      });
    }
  }

  const sorted = nodes.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const rankToSource = sorted.map(x => x.index);
  const sourceToRank = Array(13);
  rankToSource.forEach((sourceIndex, rank) => { sourceToRank[sourceIndex] = rank; });
  for (const [mapping, base] of [["rank-to-source", rankToSource], ["source-to-rank", sourceToRank]]) {
    for (const direction of ["ascending", "descending"]) {
      const order = direction === "ascending" ? base : base.slice().reverse();
      const output = order.map(i => redCipher[i]);
      variants.push({
        type: "rank-transposition",
        cycle2: cycle2.join("->"),
        mapping,
        direction,
        order,
        output,
        text: transliterate(output)
      });
    }
  }
}
console.log(JSON.stringify({
  codaWords,
  codaSplit: { first11: codaWords.slice(0, 11), final2: codaWords.slice(11) },
  cycle11,
  cycle2a,
  cycle2b,
  cycleNodes13: cycle11.concat(cycle2a),
  redCipher,
  redCipherText: transliterate(redCipher),
  variants
}, null, 2));
