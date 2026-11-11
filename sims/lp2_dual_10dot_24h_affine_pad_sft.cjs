#!/usr/bin/env node
"use strict";

// Source-locked test of the two 10-dot interval lengths as an affine
// permutation of the 256-byte LP2 table. Also records the exact marker
// arithmetic that motivates the one tested pad. No parameter fitting.

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const gridData = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const quadText = read("resources/control/duko_round27_english_quadgrams.txt");

const pageStart = new Map();
let totalRunes = 0;
for (const page of corpus.pages) {
  pageStart.set(page.page, totalRunes);
  totalRunes += page.indices.length;
}
const marks = annotations.pages.flatMap(page =>
  (page.large_punctuation || []).map(([offset, dots, color]) => ({
    page: page.page, offset, dots, color,
    global: pageStart.get(page.page) + offset
  }))
);
const m13 = marks.filter(m => m.dots === 13);
const m10 = marks.filter(m => m.dots === 10).sort((a,b) => a.global-b.global);
const m23 = marks.filter(m => m.dots === 23);
assert.equal(m13.length, 31);
assert.equal(m10.length, 4);
assert.equal(m23.length, 1);
assert.equal(totalRunes, 13136);
assert.equal(m13.filter(m => m.page === 7 && m.offset === 194).length, 2); // distinct black/red events, same rune offset

const tenPositions = m10.map(m => m.global);
assert.deepEqual(tenPositions, [8805, 9358, 12114, 13001]);
const terminal = m23[0];
assert.equal(terminal.global, totalRunes);
const pairLengths = [tenPositions[1]-tenPositions[0], tenPositions[3]-tenPositions[2]];
assert.deepEqual(pairLengths, [553, 887]);
const hhmm = pairLengths.map(n => [Math.floor(n/60), n%60]);
assert.deepEqual(hhmm, [[9,13],[14,47]]);
assert.equal(pairLengths[0] + pairLengths[1], 1440);
assert.deepEqual([0, ...tenPositions, terminal.global].slice(1).map((x,i)=>x-[0,...tenPositions,terminal.global][i]),
  [8805,553,2756,887,135]);

// Normalized stencil templates from the original-image marker inventory.
// The 23-dot stencil contains the 13-dot template plus ten additional cells.
const stencil13 = [".#.", "###", "###", "###", "###"];
const stencil23 = [".###.", "#####", "#####", "#####", "#####"];
let coreCount = 0, extraCount = 0;
for (let r=0; r<5; r++) {
  for (let c=0; c<3; c++) {
    if (stencil13[r][c] === "#") {
      assert.equal(stencil23[r][c+1], "#");
      coreCount++;
    }
  }
  for (let c=0; c<5; c++) {
    const inCore = c>=1 && c<=3 && stencil13[r][c-1] === "#";
    if (stencil23[r][c] === "#" && !inCore) extraCount++;
  }
}
assert.equal(coreCount, 13);
assert.equal(extraCount, 10);
const dotTotal = 31*13 + 4*10 + 23;
assert.equal(dotTotal, 466);
assert.equal(dotTotal, 32*13 + 5*10);

const unknownPages = corpus.pages.filter(p => p.page <= 55);
const unknown = unknownPages.flatMap(p => p.indices);
assert.equal(unknown.length, 12956);
const alphabet = gridData.alphabet;
const grid = gridData.pages.flatMap(p => p.tokens).map(token =>
  60*alphabet.indexOf(token[0]) + alphabet.indexOf(token[1])
);
assert.equal(grid.length, 256);
assert.equal(Math.min(...grid), 0);
assert.equal(Math.max(...grid), 255);

function gcd(a,b) { while (b) [a,b] = [b,a%b]; return a; }
const offset = pairLengths[0];
const stride = pairLengths[1];
assert.equal(gcd(stride % 256, 256), 1);
const keyBytes = Array.from({length:256}, (_,i) => grid[(offset + stride*i) % 256]);

const quadgrams = new Map();
let quadTotal = 0;
for (const line of quadText.trim().split(/\r?\n/)) {
  const [gram, countText] = line.trim().split(/\s+/);
  const count = Number(countText);
  if (gram && Number.isFinite(count)) {
    quadgrams.set(gram, count);
    quadTotal += count;
  }
}
const translit = corpus.translit;
function metrics(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  const ioc = counts.reduce((sum,n) => sum+n*(n-1), 0) / (indices.length*(indices.length-1));
  const text = indices.map(x => translit[x]).join("");
  let score = 0, ngrams = 0;
  for (let i=0; i+3<text.length; i++) {
    score += Math.log((quadgrams.get(text.slice(i,i+4)) || 0.01) / quadTotal);
    ngrams++;
  }
  return { ioc, quadgram: score/ngrams, preview: text.slice(0,80) };
}
const raw = metrics(unknown);
const candidates = [];
for (const mapping of ["mod29", "scale29"]) {
  const key = keyBytes.map(b => mapping === "mod29" ? b%29 : Math.floor(29*b/256));
  for (const sign of [-1,1]) {
    for (const reset of ["global","page"]) {
      const output = [];
      if (reset === "global") {
        for (let i=0; i<unknown.length; i++) output.push((unknown[i] + sign*key[i%256] + 29*29)%29);
      } else {
        for (const page of unknownPages) {
          for (let i=0; i<page.indices.length; i++) output.push((page.indices[i] + sign*key[i%256] + 29*29)%29);
        }
      }
      candidates.push({mapping, sign, reset, ...metrics(output)});
    }
  }
}
candidates.sort((a,b) => b.quadgram-a.quadgram);
const bestIoC = [...candidates].sort((a,b)=>b.ioc-a.ioc)[0];

const clockVigenere = [];
const vigenereKeys = [
  {name:"time-digits-period8", key:[0,9,1,3,1,4,4,7]},
  {name:"time-fields-period4", key:[9,13,14,47%29]}
];
for (const item of vigenereKeys) {
  for (const sign of [-1,1]) {
    for (const reset of ["global","page"]) {
      const output = [];
      if (reset === "global") {
        for (let i=0; i<unknown.length; i++) output.push((unknown[i] + sign*item.key[i%item.key.length] + 29*29)%29);
      } else {
        for (const page of unknownPages) {
          for (let i=0; i<page.indices.length; i++) output.push((page.indices[i] + sign*item.key[i%item.key.length] + 29*29)%29);
        }
      }
      clockVigenere.push({key:item.name, sign, reset, ...metrics(output)});
    }
  }
}
const tableRows = Array.from({length:32}, (_,r) => grid.slice(r*8, r*8+8));
const clockRowPermPad = [];
for (const clock of [
  {name:"09:13", start:9, step:13},
  {name:"14:47", start:14, step:15}
]) {
  const bytes = Array.from({length:32}, (_,i) => tableRows[(clock.start+clock.step*i)%32]).flat();
  for (const mapping of ["mod29","scale29"]) {
    const key = bytes.map(b => mapping === "mod29" ? b%29 : Math.floor(29*b/256));
    for (const sign of [-1,1]) {
      for (const reset of ["global","page"]) {
        const output = [];
        if (reset === "global") {
          for (let i=0; i<unknown.length; i++) output.push((unknown[i] + sign*key[i%256] + 29*29)%29);
        } else {
          for (const page of unknownPages) {
            for (let i=0; i<page.indices.length; i++) output.push((page.indices[i] + sign*key[i%256] + 29*29)%29);
          }
        }
        clockRowPermPad.push({clock:clock.name, mapping, sign, reset, ...metrics(output)});
      }
    }
  }
}
const bestVigenere = [...clockVigenere].sort((a,b)=>b.quadgram-a.quadgram)[0];
const bestRowPerm = [...clockRowPermPad].sort((a,b)=>b.quadgram-a.quadgram)[0];

console.log(JSON.stringify({
  totalRunes, unknownRunes: unknown.length,
  markerCounts: {thirteen: m13.length, ten: m10.length, twentyThree: m23.length},
  tenPositions, pairLengths, hhmm, pairSum: pairLengths[0]+pairLengths[1],
  terminal23: {page: terminal.page, offset: terminal.offset, global: terminal.global},
  sectionLengths: [8805,553,2756,887,135],
  stencilDecomposition: {core13: coreCount, extra10: extraCount, dotTotal, identity: "31*13+4*10+23 = 32*13+5*10 = 466"},
  affinePad: {offset, stride, strideMod256: stride%256, gcd: gcd(stride%256,256), keyPrefix: keyBytes.slice(0,16)},
  raw, candidateRange: {
    minIoC: Math.min(...candidates.map(x=>x.ioc)),
    maxIoC: Math.max(...candidates.map(x=>x.ioc)),
    minQuadgram: Math.min(...candidates.map(x=>x.quadgram)),
    maxQuadgram: Math.max(...candidates.map(x=>x.quadgram))
  },
  bestQuadgram: candidates[0],
  bestIoC,
  candidates,
  clockVigenere: {bestQuadgram: bestVigenere, candidates: clockVigenere},
  clockRowPermPad: {
    bestQuadgram: bestRowPerm,
    minIoC: Math.min(...clockRowPermPad.map(x=>x.ioc)),
    maxIoC: Math.max(...clockRowPermPad.map(x=>x.ioc)),
    candidates: clockRowPermPad
  }
}, null, 2));
