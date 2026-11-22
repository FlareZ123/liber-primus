"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyphIndex = new Map(gp.runes.map((r, i) => [r, i]));
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

function parseLP2(raw) {
  const parts = raw.split("%").slice(0, 55);
  const pages = parts.map((part) => [...part].filter(ch => glyphIndex.has(ch)).map(ch => glyphIndex.get(ch)));
  const words = [];
  let current = [];
  const finish = () => { if (current.length) { words.push(current); current = []; } };
  for (const ch of parts.join("%")) {
    if (glyphIndex.has(ch)) current.push(glyphIndex.get(ch));
    else if (ch === "/" || /\s/u.test(ch) || ch === "%") {}
    else finish();
  }
  finish();
  const lines = parts.join("%").split("/")
    .map(part => [...part].filter(ch => glyphIndex.has(ch)).map(ch => glyphIndex.get(ch)))
    .filter(line => line.length);
  return {pages, words, lines, stream: pages.flat()};
}

function nativeWords(text) {
  const out = [];
  for (const original of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const s = original.replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    const word = [];
    for (let i = 0; i < s.length;) {
      const token = tokens.find(candidate => s.startsWith(candidate.s, i));
      assert(token, "unmapped native GP token: " + s.slice(i));
      word.push(token.i);
      i += token.s.length;
    }
    out.push(word);
  }
  return out;
}

function pairHistogram(segments, phase) {
  const counts = new Int32Array(841);
  let pairs = 0;
  for (const segment of segments) {
    for (let i = phase; i + 1 < segment.length; i += 2) {
      counts[segment[i] * 29 + segment[i + 1]]++;
      pairs++;
    }
  }
  return {counts, pairs, distinct: [...counts].filter(n => n > 0).length, maxCount: Math.max(...counts)};
}

function sortedCounts(histogram) { return [...histogram.counts].sort((a, b) => b - a); }
function profileTV(a, b) {
  assert(a.pairs > 0 && b.pairs > 0);
  const x = sortedCounts(a), y = sortedCounts(b);
  let distance = 0;
  for (let i = 0; i < x.length; i++) distance += Math.abs(x[i] / a.pairs - y[i] / b.pairs);
  return distance / 2;
}
function splitByLengths(stream, lengths) {
  const segments = [];
  let offset = 0;
  for (const length of lengths) { segments.push(stream.slice(offset, offset + length)); offset += length; }
  assert.equal(offset, stream.length);
  return segments;
}
function percentile(sorted, q) { return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * q))]; }

function controlSamples(words, layout, phase, targetPairs, segmentLengths) {
  const stream = words.flat(), samples = [];
  if (layout === "word") {
    for (let startWord = 0; startWord < words.length; startWord += 10) {
      const selected = [];
      let pairs = 0;
      for (let j = startWord; j < words.length && pairs < targetPairs; j++) {
        const word = words[j], available = Math.max(0, Math.floor((word.length - phase) / 2));
        if (!available) continue;
        const take = Math.min(available, targetPairs - pairs);
        selected.push(word.slice(0, phase + 2 * take));
        pairs += take;
      }
      if (pairs === targetPairs) samples.push(pairHistogram(selected, phase));
    }
  } else {
    const neededRunes = segmentLengths.reduce((sum, n) => sum + n, 0);
    for (let start = 0; start + neededRunes <= stream.length; start += 120) {
      const segments = splitByLengths(stream.slice(start, start + neededRunes), segmentLengths);
      const sample = pairHistogram(segments, phase);
      assert.equal(sample.pairs, targetPairs);
      samples.push(sample);
    }
  }
  return samples;
}

function summarize(samples, original) {
  const tv = samples.map(sample => profileTV(original, sample)).sort((a, b) => a - b);
  const distinct = samples.map(sample => sample.distinct).sort((a, b) => a - b);
  const maxima = samples.map(sample => sample.maxCount).sort((a, b) => a - b);
  return {
    windows: samples.length,
    distinctMin: distinct[0], distinctMedian: percentile(distinct, 0.5), distinctMax: distinct.at(-1),
    maxCountMin: maxima[0], maxCountMedian: percentile(maxima, 0.5), maxCountMax: maxima.at(-1),
    sortedProfileTVMin: tv[0], sortedProfileTVMedian: percentile(tv, 0.5)
  };
}

const lp2 = parseLP2(read("resources/liber-primus/lp2-transcription.txt"));
assert.equal(lp2.stream.length, 12956);
assert.equal(lp2.words.length, 2896);
assert.equal(lp2.pages.length, 55);
assert.equal(lp2.lines.length, 594);
assert.equal(lp2.lines.reduce((n, line) => n + line.length, 0), 12956);

const layouts = {global: [lp2.stream], page: lp2.pages, line: lp2.lines, word: lp2.words};
const controls = [
  ["Shakespeare300k", "resources/control/shakespeare_first300k.txt"],
  ["GibranProphet", "resources/control/gibran_prophet_58585.txt"],
  ["EmersonEssays", "resources/control/emerson_essays_2944.txt"]
];
const results = {input: {unknownRunes: lp2.stream.length, words: lp2.words.length, pages: lp2.pages.length, lines: lp2.lines.length, alphabet: 29, pairAlphabet: 841}, original: {}, controls: {}};

for (const [layout, segments] of Object.entries(layouts)) {
  const lengths = segments.map(segment => segment.length);
  for (const phase of [0, 1]) {
    const key = layout + "_phase" + phase;
    const original = pairHistogram(segments, phase);
    results.original[key] = {pairs: original.pairs, distinct: original.distinct, maxCount: original.maxCount};
    results.controls[key] = {};
    for (const [name, file] of controls) {
      const words = nativeWords(read(file));
      const samples = controlSamples(words, layout, phase, original.pairs, lengths);
      assert(samples.length > 0, "no control windows for " + key + " / " + name);
      results.controls[key][name] = summarize(samples, original);
    }
  }
}
console.log(JSON.stringify(results, null, 2));
