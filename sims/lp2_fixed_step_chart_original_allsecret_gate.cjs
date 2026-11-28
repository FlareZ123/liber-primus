#!/usr/bin/env node
"use strict";

/*
  All-secret fixed-step-chart gate on the exact LP2 original.
  No guessed key, English dictionary, or original-language model.
  Invoke from repository root:
      node sims/lp2_fixed_step_chart_original_allsecret_gate.cjs
  Source corpus and runic layout are read unchanged from resources/.
  The result is a conditional family exclusion, not recovered plaintext.
*/
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

function ranked(values) {
  const hist = Array(29).fill(0);
  for (const x of values) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    hist[x]++;
  }
  const n = values.length;
  assert(n > 1);
  const sorted = [...hist].sort((a, b) => b - a);
  const top4 = sorted.slice(0, 4).reduce((a, b) => a + b, 0);
  const ioc = hist.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
  return { n, top4, top4_share: top4 / n, ioc, hist, sorted };
}
function sections(txt) { return txt.trim().split(/^%$/m); }

function nearestGP(section, ord) {
  const output = [];
  for (const ch of section) if (ord.has(ch)) output.push(ord.get(ch));
  return output;
}

/* No inferred joins: use only two adjacent rune glyphs inside an original
   printed line, with no separator or line break between them.  Such positions
   cannot be reset by page/line/printed-word boundaries. */
function strictInterior(section, ord, alternativePlain) {
  const delta = [], plain = [];
  let last = null, j = 0;
  for (const ch of section) {
    const cur = ord.get(ch);
    if (cur === undefined) { last = null; continue; }
    if (last !== null) {
      delta.push((cur - last + 29) % 29);
      plain.push(alternativePlain ? alternativePlain[j] : cur);
    }
    last = cur;
    j++;
  }
  if (alternativePlain) assert.equal(j, alternativePlain.length);
  return { delta, plain, runeCount: j };
}

function firstPrimes(n) {
  const primes = [];
  for (let candidate = 2; primes.length < n; candidate++) {
    let yes = true;
    for (const q of primes) {
      if (q * q > candidate) break;
      if (candidate % q === 0) { yes = false; break; }
    }
    if (yes) primes.push(candidate);
  }
  return primes;
}

function nativeP56(corpus) {
  const cipher = corpus.pages.find(p => p.page === 56).indices;
  const primes = firstPrimes(cipher.length);
  const plain = [];
  let keyPos = 0;
  for (let j = 0; j < cipher.length; j++) {
    if (j === 56) {
      assert.equal(cipher[j], 0, "real p56 F interrupter");
      plain.push(0);
    } else {
      plain.push((cipher[j] - (primes[keyPos++] - 1) % 29 + 29) % 29);
    }
  }
  assert.equal(keyPos, 84);
  const latin = plain.map(x => corpus.translit[x]).join("");
  assert.equal(latin,
    "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
  return plain;
}

/* Reproducible blind alphabet chart for a positive plant.  All 29 output
   steps must be distinct.  The chart is not chosen using original text. */
function seededChart() {
  let state = 0x33012014;
  function next() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state;
  }
  const a = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = next() % (i + 1);
    [a[j], a[i]] = [a[i], a[j]];
  }
  assert.equal(new Set(a).size, 29);
  return a;
}

/* Positive control: encrypt actual LP1 native words, resetting an arbitrary
   IV at each uninterrupted rune group, then decrypt using the known chart.
   The statistic itself does not know or fit this chart. */
function plantedNative(nativeSections, ord, chart) {
  const inverse = Array(29);
  chart.forEach((v, i) => { inverse[v] = i; });
  const steps = [], plain = [];
  let total = 0, groups = 0;
  for (const source of nativeSections) {
    let last = null, originalLast = null;
    for (const ch of source) {
      const p = ord.get(ch);
      if (p === undefined) { last = null; originalLast = null; continue; }
      if (last === null) {
        const iv = (17 * groups + 3) % 29;
        last = (iv + chart[p]) % 29;
        groups++;
      } else {
        const c = (last + chart[p]) % 29;
        const step = (c - last + 29) % 29;
        assert.equal(inverse[step], p, "known-key native decrypt");
        assert.equal(step, chart[p], "native feedback positive");
        steps.push(step);
        plain.push(p);
        last = c;
      }
      originalLast = p;
      total++;
    }
  }
  assert.equal(steps.length, plain.length);
  assert.deepEqual(ranked(steps).sorted, ranked(plain).sorted);
  return { totalNativeRunes: total, groups, encodedInterior: steps.length,
           trueKeyDecodes: steps.length, top4_share: ranked(steps).top4_share };
}

function report() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const lp2 = sections(read("resources/transcriptions/lp2-image-corrected.txt"));
  const lp1 = sections(read("resources/transcriptions/lp1_wulfic_canonical.txt"));
  const ord = new Map(corpus.runes.map((ch, i) => [ch, i]));
  assert.equal(ord.size, 29);
  assert.equal(lp2.length, 57, "one rune-free physical p50 is not in transcription");
  const pages = corpus.pages.filter(p => p.page !== 50);
  assert.equal(pages.length, 57);
  assert.equal(lp1.length, 16);

  const original = [], training = [], held = [];
  for (let j = 0; j < lp2.length; j++) {
    const page = pages[j];
    const indices = nearestGP(lp2[j], ord);
    assert.deepEqual(indices, page.indices, "canon/page rune mismatch p" + page.page);
    if (page.page >= 56) continue;
    const interior = strictInterior(lp2[j], ord).delta;
    original.push(...interior);
    if (page.page < 40) training.push(...interior);
    else held.push(...interior);
  }
  assert.equal(original.length, 9640);
  assert.equal(training.length, 7174);
  assert.equal(held.length, 2466);

  /* Six independently readable, genuine GP-native source sections.  They are
     identified by their original uninterrupted rune text, not by Latin OCR.
     No parsed numeric magic-square cells enter the language comparison. */
  const clearSourceSections = [3, 8, 9, 10, 11, 14];
  const clear = clearSourceSections.map(i => lp1[i]);
  assert(nearestGP(clear[0], ord).length > 150);
  assert(nearestGP(clear[1], ord).length > 180);
  assert(nearestGP(clear[5], ord).length > 80);
  const nativeLP1 = clear.flatMap(section => strictInterior(section, ord).plain);
  assert.equal(nativeLP1.length, 750);

  const page56 = pages.findIndex(p => p.page === 56);
  const page57 = pages.findIndex(p => p.page === 57);
  const native56 = strictInterior(lp2[page56], ord, nativeP56(corpus)).plain;
  const native57 = strictInterior(lp2[page57], ord,
      corpus.pages.find(p => p.page === 57).indices).plain;
  assert.equal(native56.length, 57);
  assert.equal(native57.length, 72);

  const chart = seededChart();
  const positive = plantedNative(clear, ord, chart);
  assert.equal(positive.encodedInterior, 750);
  const figures = {
    "LP1 clear source sections 3,8,9,10,11,14": ranked(nativeLP1),
    "LP2 p56 original-prime/F decoded native": ranked(native56),
    "LP2 p57 literal native": ranked(native57),
    "original p0-55 strict interior delta": ranked(original),
    "original p0-39 strict interior delta": ranked(training),
    "original p40-55 strict interior delta": ranked(held),
  };

  /* Count mismatch lower bounds are CONDITIONAL: the unknown's plaintext
     distribution must resemble the selected authentic native corpus.
     For a fixed alphabet bijection, no key can change the sorted histogram.
     Changes at r positions can change any one top-k count by at most r. */
  const observed = ranked(original);
  const output = {schema:1, contract:
    "C[i]=(C[i-1]+f(P[i])) mod 29, with any fixed bijection f; page/line/printed-word initial states arbitrary; statistics use only physically adjacent runes",
    source:"resources/liber-primus/lp2-corpus.json + lp2-image-corrected.txt; LP1 native source and recovered p56/p57",
    nativePositive:positive, ranks:{}, nativeConditionalBounds:{}};
  for (const [name, value] of Object.entries(figures)) {
    output.ranks[name] = {n:value.n,top4:value.top4,top4_share:value.top4_share,
      ioc:value.ioc,sorted:value.sorted};
    if (name.startsWith("LP1 ") || name.startsWith("LP2 ")) {
      const minExceptionFraction = Math.max(0, value.top4_share-observed.top4_share);
      const o = observed.sorted, p = value.sorted;
      const totalVariationMin = p.reduce((sum, n, i) =>
          sum + Math.abs(n/value.n - o[i]/observed.n), 0) / 2;
      output.nativeConditionalBounds[name] = {
        top4_min_exception_fraction:minExceptionFraction,
        top4_min_exception_count_for_original:Math.ceil(minExceptionFraction*observed.n),
        sorted_hist_min_total_variation:totalVariationMin,
        sorted_hist_min_exception_count_for_original:Math.ceil(totalVariationMin*observed.n),
      };
    }
  }
  assert.equal(output.ranks["original p0-55 strict interior delta"].top4,1492);
  assert.equal(output.ranks["LP1 clear source sections 3,8,9,10,11,14"].top4,311);
  return output;
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(report(), null, 2) + "\n");
}
module.exports = {report,ranked,seededChart,plantedNative};
