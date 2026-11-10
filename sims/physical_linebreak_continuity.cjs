'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const master = fs.readFileSync(path.join(root, 'resources/transcriptions/liber_primus_master.txt'), 'utf8');
const runeSet = new Set(corpus.runes);
const chunks = master.split('%');

/** @returns {Array<{page:number, lines:Array<{source:string, runes:string[]}>}>} */
function loadLines() {
  const pages = [];
  let glyphs = 0;
  for (let page = 0; page <= 55; page += 1) {
    const entry = corpus.pages.find((item) => item.page === page);
    assert(entry, 'Missing physical LP2 page ' + page);
    if (!entry.indices.length) continue;
    const lines = chunks[page + 16].split('/').map((source) => ({
      source,
      runes: Array.from(source).filter((rune) => runeSet.has(rune)),
    })).filter((line) => line.runes.length > 0);
    assert.equal(lines.flatMap((line) => line.runes).join(''),
      entry.indices.map((index) => corpus.runes[index]).join(''),
      'Transcription/canonical mismatch for physical page ' + page);
    glyphs += entry.indices.length;
    pages.push({ page, lines });
  }
  assert.equal(pages.length, 55);
  assert.equal(glyphs, 12956);
  return pages;
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {ReturnType<typeof loadLines>} pages */
function observed(pages) {
  const counts = {
    withinLine: { equal: 0, total: 0 },
    acrossLine: { equal: 0, total: 0 },
    continuingWord: { equal: 0, total: 0 },
    explicitSeparator: { equal: 0, total: 0 },
    equalLinePages: [],
  };
  let exactNullExpectation = 0;
  for (const page of pages) {
    const lines = page.lines;
    let pageEqual = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const chars = lines[i].runes;
      for (let j = 1; j < chars.length; j += 1) {
        counts.withinLine.total += 1;
        counts.withinLine.equal += Number(chars[j - 1] === chars[j]);
      }
      if (i === 0) continue;
      const previous = lines[i - 1];
      const equal = Number(previous.runes.at(-1) === chars[0]);
      counts.acrossLine.total += 1;
      counts.acrossLine.equal += equal;
      pageEqual += equal;
      const tail = previous.source.trimEnd().at(-1);
      const kind = runeSet.has(tail) ? 'continuingWord' : 'explicitSeparator';
      assert(runeSet.has(tail) || tail === '-' || tail === '.', 
        'Unexpected line-final delimiter: page ' + page.page);
      counts[kind].total += 1;
      counts[kind].equal += equal;
    }
    if (pageEqual) counts.equalLinePages.push({ page: page.page, equal: pageEqual });
    let possible = 0;
    for (let i = 0; i < lines.length; i += 1) {
      for (let j = 0; j < lines.length; j += 1) {
        if (i !== j && lines[i].runes.at(-1) === lines[j].runes[0]) possible += 1;
      }
    }
    exactNullExpectation += possible / lines.length;
  }
  assert.deepEqual(counts.withinLine, { equal: 82, total: 12362 });
  assert.deepEqual(counts.acrossLine, { equal: 4, total: 539 });
  assert.deepEqual(counts.continuingWord, { equal: 4, total: 418 });
  assert.deepEqual(counts.explicitSeparator, { equal: 0, total: 121 });
  return { counts, exactNullExpectation };
}

/** @param {ReturnType<typeof loadLines>} pages @param {number} trials */
function lineOrderNull(pages, trials = 50000) {
  const random = xorshift32(0x31e26c9d);
  const scores = [];
  let leftTail = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    let count = 0;
    for (const page of pages) {
      const lines = page.lines;
      const order = Array.from({ length: lines.length }, (_, i) => i);
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = random() % (i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (let i = 1; i < order.length; i += 1) {
        count += Number(lines[order[i - 1]].runes.at(-1) === lines[order[i]].runes[0]);
      }
    }
    scores.push(count);
    if (count <= 4) leftTail += 1;
  }
  scores.sort((a, b) => a - b);
  return {
    trials,
    leftTail,
    empiricalP: (leftTail + 1) / (trials + 1),
    mean: scores.reduce((sum, count) => sum + count, 0) / trials,
    min: scores[0],
    max: scores.at(-1),
    quantiles: Object.fromEntries([0.01, 0.05, 0.5, 0.95, 0.99].map((p) =>
      [p.toString(), scores[Math.floor(p * trials)]])),
  };
}

/** @param {ReturnType<typeof loadLines>} pages @param {boolean} resetAtLine @param {() => number} random @param {number} trials */
function plantedControls(pages, resetAtLine, random, trials = 1000) {
  let total = 0;
  let atMostFour = 0;
  for (let t = 0; t < trials; t += 1) {
    let count = 0;
    for (const page of pages) {
      let previous = null;
      let lastOfLine = null;
      for (let i = 0; i < page.lines.length; i += 1) {
        if (resetAtLine) previous = null;
        let first = null;
        for (let j = 0; j < page.lines[i].runes.length; j += 1) {
          let x = random() % 29;
          if (previous !== null && x === previous && random() % 10000 < 8100) {
            x = (previous + 1 + random() % 28) % 29;
          }
          if (j === 0) first = x;
          previous = x;
        }
        if (i > 0) count += Number(lastOfLine === first);
        lastOfLine = previous;
      }
    }
    total += count;
    atMostFour += Number(count <= 4);
  }
  return { trials, mean: total / trials, atMostFour };
}

function main() {
  const pages = loadLines();
  const result = observed(pages);
  result.lineOrderPermutation = lineOrderNull(pages);
  const random = xorshift32(0x1a2b3c4d);
  result.syntheticLineReset = plantedControls(pages, true, random);
  result.syntheticContinuous = plantedControls(pages, false, random);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { loadLines, observed, lineOrderNull, plantedControls };
