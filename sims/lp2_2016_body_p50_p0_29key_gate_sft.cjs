#!/usr/bin/env node
"use strict";

// Source-derived 29-symbol key candidate:
// 2016 signed 29-word core -> GP0 sum -> p50 byte -> p0 rune offset -> p0 rune value.
// The p0 page is the key source; pages p1-p55 (except the empty p50 table page)
// are held out as receivers.
const fs = require("node:fs");
const path = require("node:path");
const root = process.cwd();
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const signed = fs.readFileSync(path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8");

const coreText = signed.split("The path lies empty")[1]?.split("Seek and you will be found.")[0];
if (!coreText) throw new Error("Could not isolate the 2016 signed-message 29-word core");
const sourceWords = coreText.match(/[A-Za-z]+/g) || [];
if (sourceWords.length !== 29) throw new Error("Expected 29 core words; got " + sourceWords.length);

const gp = {
  F: 0, U: 1, TH: 2, O: 3, R: 4, C: 5, G: 6, W: 7, H: 8, N: 9,
  I: 10, J: 11, EO: 12, P: 13, X: 14, S: 15, T: 16, B: 17, E: 18,
  M: 19, L: 20, NG: 21, OE: 22, D: 23, A: 24, AE: 25, Y: 26, IA: 27, EA: 28
};
function gp0(word) {
  const s = word.toUpperCase().replace(/[KQ]/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    const digraph = s.slice(i, i + 2);
    if (Object.prototype.hasOwnProperty.call(gp, digraph)) {
      out.push(gp[digraph]);
      i += 2;
    } else {
      const ch = s[i];
      if (!Object.prototype.hasOwnProperty.call(gp, ch)) throw new Error("Unmapped character " + ch + " in " + word);
      out.push(gp[ch]);
      i += 1;
    }
  }
  return out.reduce((a, b) => a + b, 0);
}
const p0 = corpus.pages.find(p => p.page === 0);
if (!p0 || p0.indices.length !== 262) throw new Error("Unexpected p0 corpus shape");
if (!Array.isArray(grid.bytes) || grid.bytes.length !== 256) throw new Error("Unexpected p50 grid shape");

const derivation = sourceWords.map((word, i) => {
  const address = gp0(word);
  const offset = grid.bytes[address];
  if (!Number.isInteger(offset) || offset < 0 || offset >= p0.indices.length) {
    throw new Error("Invalid p0 pointer for " + word + ": address=" + address + ", offset=" + offset);
  }
  return { i, word, address, offset, keyValue: p0.indices[offset] };
});
const key = derivation.map(x => x.keyValue);
if (key.length !== 29 || key.some(x => !Number.isInteger(x) || x < 0 || x >= 29)) {
  throw new Error("Derived key is not a 29-symbol GP29 stream");
}

const holdoutPages = corpus.pages.filter(p => p.page >= 1 && p.page <= 55 && p.indices.length > 0);
const holdoutRunes = holdoutPages.reduce((n, p) => n + p.indices.length, 0);
if (holdoutPages.length !== 54 || holdoutRunes !== 12694) {
  throw new Error("Unexpected holdout: " + holdoutPages.length + " pages, " + holdoutRunes + " runes");
}
const mod29 = x => ((x % 29) + 29) % 29;
function ioc(xs) {
  const n = xs.length;
  if (n < 2) return 0;
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((s, c) => s + c * (c - 1), 0) / (n * (n - 1));
}
function transliterate(xs) {
  return xs.map(x => corpus.translit[x]).join("");
}
function evaluate(label, build) {
  const out = build();
  return { label, n: out.length, ioc: ioc(out), prefix: transliterate(out.slice(0, 180)) };
}

const models = [];
for (const phaseReset of [false, true]) {
  for (const sign of [-1, 1]) {
    models.push(evaluate("direct " + (sign < 0 ? "-K" : "+K") + " phase=" + (phaseReset ? "page" : "global"), () => {
      const out = [];
      let globalPhase = 0;
      for (const page of holdoutPages) {
        let phase = phaseReset ? 0 : globalPhase;
        for (const c of page.indices) {
          out.push(mod29(c + sign * key[phase % 29]));
          phase++;
        }
        if (!phaseReset) globalPhase = phase;
      }
      return out;
    }));
  }
}

for (const phaseReset of [false, true]) {
  for (const sign of [-1, 1]) {
    models.push(evaluate("direct-F-literal " + (sign < 0 ? "-K" : "+K") + " phase=" + (phaseReset ? "page" : "global"), () => {
      const out = [];
      let globalPhase = 0;
      for (const page of holdoutPages) {
        let phase = phaseReset ? 0 : globalPhase;
        for (const c of page.indices) {
          if (c === 0) {
            out.push(0);
          } else {
            out.push(mod29(c + sign * key[phase % 29]));
            phase++;
          }
        }
        if (!phaseReset) globalPhase = phase;
      }
      return out;
    }));
  }
}

for (const stateReset of [false, true]) {
  for (const phaseReset of [false, true]) {
    for (const sign of [-1, 1]) {
      models.push(evaluate("chain " + (sign < 0 ? "-K" : "+K") + " state=" + (stateReset ? "page" : "global") + " phase=" + (phaseReset ? "page" : "global"), () => {
        const out = [];
        let previous = null;
        let globalPhase = 0;
        for (const page of holdoutPages) {
          if (stateReset) previous = null;
          let phase = phaseReset ? 0 : globalPhase;
          for (const c of page.indices) {
            if (previous !== null) {
              const delta = mod29(c - previous);
              out.push(mod29(delta + sign * key[phase % 29]));
              phase++;
            }
            previous = c;
          }
          if (!phaseReset) globalPhase = phase;
        }
        return out;
      }));
    }
  }
}

const raw = holdoutPages.flatMap(p => p.indices);
const p57 = corpus.pages.find(p => p.page === 57);
const keyCounts = Array(29).fill(0);
for (const x of key) keyCounts[x]++;
console.log(JSON.stringify({
  sourceWords,
  derivation,
  key,
  keyTransliteration: transliterate(key),
  keyDistinctSymbols: keyCounts.filter(Boolean).length,
  keyCounts,
  holdout: { pages: holdoutPages.length, runes: holdoutRunes, rawIoc: ioc(raw) },
  p57PlaintextIoc: p57 ? ioc(p57.indices) : null,
  models
}, null, 2));
