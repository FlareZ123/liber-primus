'use strict';

/**
 * Original-source GP line-initial width-bias test, with truly held-out pages.
 *
 * The 29 pixel widths are measured only from source JPEG pages selected by an
 * image-band detector, reproduced by physical_line_start_ink_modes.py.
 * Physical pages whose image bands were not identifiable are never used to
 * derive widths. They supply the 178-line ciphertext holdout.
 *
 * Run: node sims/lp2_line_start_size_bias.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const info = JSON.parse(read('resources/liber-primus/lp2-line-start-ink-widths.json'));
const chunks = read('resources/transcriptions/liber_primus_master.txt').split('%');
const symbol = new Map(corpus.runes.map((r, i) => [r, i]));
const widths = info.modeInkRunWidthsPx;
const trained = new Set(info.trainingPages);

/** @returns {Array<{page:number,text:number[],starts:number[],ends:number[],n:number,f:number[],mean:number,weighted:number}>} */
function load() {
  const pages = [];
  for (const entry of corpus.pages) {
    if (entry.page > 55 || !entry.indices.length) continue;
    const lines = chunks[entry.page + 16].split('/').map((part) =>
      [...part].filter((r) => symbol.has(r)).map((r) => symbol.get(r))
    ).filter((line) => line.length);
    assert.deepEqual(lines.flat(), entry.indices);
    const starts = [], ends = [], f = Array(29).fill(0);
    let offset = 0;
    for (const line of lines) {
      starts.push(offset);
      offset += line.length;
      ends.push(offset - 1);
    }
    assert.equal(offset, entry.indices.length);
    for (const x of entry.indices) f[x]++;
    const mean = f.reduce((s, v, i) => s + v * widths[i], 0) / entry.indices.length;
    const weighted = f.reduce((s, v, i) => s + v * widths[i] ** 2, 0) /
      (entry.indices.length * mean);
    pages.push({
      page: entry.page, text: entry.indices, starts, ends,
      n: lines.length, f, mean, weighted,
    });
  }
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, p) => s + p.n, 0), 594);
  assert.equal(pages.reduce((s, p) => s + p.text.length, 0), 12956);
  assert.equal(pages.filter((p) => trained.has(p.page)).length, 35);
  return pages;
}

/** @param {number[]} o @param {number[]} e @returns {number} */
function chi(o, e) {
  return o.reduce((s, v, i) => s + (v - e[i]) ** 2 / e[i], 0);
}

/** @param {ReturnType<typeof load>} pages */
function measure(pages) {
  const o = Array(29).fill(0), uniform = Array(29).fill(0);
  const sized = Array(29).fill(0);
  let n = 0, first = 0, last = 0, base = 0, size = 0, logGain = 0;
  for (const p of pages) {
    n += p.n;
    base += p.n * p.mean;
    size += p.n * p.weighted;
    for (let i = 0; i < 29; i++) {
      uniform[i] += p.n * p.f[i] / p.text.length;
      sized[i] += p.n * p.f[i] * widths[i] / (p.text.length * p.mean);
    }
    for (const index of p.starts) {
      const x = p.text[index];
      o[x]++;
      first += widths[x];
      logGain += Math.log(widths[x] / p.mean);
    }
    for (const index of p.ends) last += widths[p.text[index]];
  }
  return {
    pages: pages.length, n, sumFirst: first, sumLast: last, base,
    excessFirst: first - base, excessLast: last - base,
    firstMean: first / n, lastMean: last / n, nullMean: base / n,
    sizePrediction: size / n, chiUniform: chi(o, uniform),
    chiWidth: chi(o, sized), widthLogGain: logGain,
    expectedByWidth: sized,
  };
}

/** @param {number} seed @returns {() => number} */
function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {ReturnType<typeof load>} pages @param {number} trials */
function rotationNull(pages, trials) {
  const real = measure(pages), random = xorshift(0x2a7198f3);
  const target = [real.excessFirst, real.excessLast, real.sumFirst - real.sumLast];
  const exceed = [0, 0, 0], sums = [0, 0, 0], squares = [0, 0, 0];
  for (let t = 0; t < trials; t++) {
    let start = 0, end = 0;
    for (const page of pages) {
      const shift = random() % page.text.length;
      for (const i of page.starts)
        start += widths[page.text[(i + shift) % page.text.length]];
      for (const i of page.ends)
        end += widths[page.text[(i + shift) % page.text.length]];
    }
    const v = [start - real.base, end - real.base, start - end];
    for (let i = 0; i < 3; i++) {
      exceed[i] += Number(v[i] >= target[i]);
      sums[i] += v[i];
      squares[i] += v[i] ** 2;
    }
  }
  return {
    trials, observed: target,
    upperTail: exceed.map((x) => (x + 1) / (trials + 1)),
    exceed, nullMean: sums.map((s) => s / trials),
    nullSD: squares.map((s, i) =>
      Math.sqrt(s / trials - (sums[i] / trials) ** 2)),
  };
}

/** @param {ReturnType<typeof load>} pages @param {number} trials */
function widthModelNull(pages, trials) {
  const real = measure(pages);
  const random = xorshift(0x4ff57e80);
  const cdf = pages.map((p) => {
    const a = [];
    let s = 0;
    for (let i = 0; i < 29; i++) {
      s += p.f[i] * widths[i] / (p.text.length * p.mean);
      a.push(s);
    }
    return a;
  });
  const counts = Array(29).fill(0);
  let exceed = 0, sum = 0;
  for (let t = 0; t < trials; t++) {
    counts.fill(0);
    for (let j = 0; j < pages.length; j++) {
      for (let q = 0; q < pages[j].n; q++) {
        const u = random() / 4294967296;
        let i = 0;
        while (i < 28 && u >= cdf[j][i]) i++;
        counts[i]++;
      }
    }
    const score = chi(counts, real.expectedByWidth);
    exceed += Number(score >= real.chiWidth);
    sum += score;
  }
  return { trials, meanChi: sum / trials, exceed, upperTail: (exceed + 1) / (trials + 1) };
}

/**
 * An intentionally simple, key-free synthetic text-wrapper check.
 * One allowed line budget is computed only from manuscript rune count/width
 * and observed line count, never from observed first-rune identities.
 * @param {ReturnType<typeof load>} pages
 */
function greedyControl(pages) {
  let n = 0, widthTotal = 0;
  for (const page of pages) {
    const budget = page.text.reduce((s, i) => s + widths[i], 0) / page.n;
    let filled = 0;
    for (const x of page.text) {
      const width = widths[x];
      if (filled > 0 && filled + width > budget) filled = 0;
      if (filled === 0) {
        n++;
        widthTotal += width;
      }
      filled += width;
    }
  }
  assert.equal(n, 649);
  return { totalGreedyLines: n, initialWidthMean: widthTotal / n };
}

function main() {
  assert.equal(widths.length, 29);
  assert.equal(info.usableGlyphObservations, 415);
  const pages = load();
  const trainPages = pages.filter((p) => trained.has(p.page));
  const heldoutPages = pages.filter((p) => !trained.has(p.page));
  assert.deepEqual(heldoutPages.map((p) => p.page), info.untouchedPages);
  const training = measure(trainPages);
  const holdout = measure(heldoutPages);
  const all = measure(pages);
  assert.equal(training.n, 416);
  assert.equal(holdout.n, 178);
  assert(Math.abs(all.chiUniform - 78.29749431962246) < 1e-9);
  assert(Math.abs(all.chiWidth - 36.615406414805236) < 1e-9);
  assert(Math.abs(holdout.excessFirst - 655.3359176552228) < 1e-8);
  const evidence = {
    source: '55 unsolved rune pages, 594 real printed lines, 35 image-trained and 20 untouched pages',
    training, holdout, all,
    trainedPageRotations: rotationNull(trainPages, 25000),
    untouchedPageRotations: rotationNull(heldoutPages, 100000),
    widthModelNull: widthModelNull(pages, 30000),
    pureWidthGreedyWrapControl: greedyControl(pages),
  };
  assert.equal(evidence.untouchedPageRotations.exceed[0], 12);
  console.log(JSON.stringify(evidence, null, 2));
}

if (require.main === module) main();
module.exports = { load, measure, rotationNull, widthModelNull, greedyControl, main };
