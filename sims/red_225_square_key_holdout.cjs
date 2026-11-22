"use strict";
/**
 * A manuscript-source-derived 15x15 red-rune key-square hypothesis.
 *
 * The corrected 58-page ink annotations contain 225 red runes: 15^2.
 * Use them as a literal GP-index or GP-prime-residue 225-digit repeating
 * additive pad. Read the square in manuscript order or by columns.
 * Permit physical-page resets or a globally continuous pointer, with the
 * pointer advancing on all source glyph positions or black glyphs only.
 *
 * Freeze the configuration selected on physical pages 0..27 and score
 * untouched pages 28..55. Matched English-plaintext positive control is
 * generated under an exact candidate source key with 81% collision repair.
 *
 * This is a finite, explicitly bounded original-ciphertext key probe,
 * not evidence that the red runes constitute a real cryptographic key.
 *
 * Node.js 22: node sims/red_225_square_key_holdout.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { encode } = require("./relative_key_english_probe.cjs");

const ROOT = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const rawCorpus = read("resources/liber-primus/lp2-corpus.json");
const rawInk = read("resources/liber-primus/lp2-ink-annotations.json");
const rawEnglish = read("resources/control/shakespeare_first300k.txt");
const corpus = JSON.parse(rawCorpus);
const ink = JSON.parse(rawInk);
const M = 29;
const SIZE = 15;
const TRAIN_END = 28;
const SEED = 0x55a5c033;
const REPAIR = .81;
const mod = value => ((value % M) + M) % M;
const indexByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const annotationByPage = new Map(ink.pages.map(p => [p.page, p]));

const red = ink.pages.flatMap(p => (p.red_spans || [])
  .flatMap(span => [...span.runes].map(rune => indexByRune.get(rune))));
assert.equal(red.length, SIZE * SIZE);
assert.equal(ink.counts.red, red.length);
assert.equal(ink.counts.large, 36);
assert.equal(corpus.pages.filter(p => p.status === "unsolved").length, 56);

/**
 * Every position is physical (including positions occupied by red glyphs).
 * A separate black-only clock ignores red source glyphs.
 * @returns {Array<{page:number,total:number,black:Array<{pos:number,cipher:number}>}>}
 */
function targetPages() {
  const pages = [];
  for (const record of corpus.pages.filter(p => p.status === "unsolved" && p.indices.length)) {
    const marked = new Set();
    const annotations = annotationByPage.get(record.page);
    for (const span of annotations?.red_spans || []) {
      assert.equal(record.indices.slice(span.start, span.start + span.length)
        .map(i => corpus.runes[i]).join(""), span.runes);
      for (let i = 0; i < span.length; i++) marked.add(span.start + i);
    }
    pages.push({page: record.page, total: record.indices.length,
      black: record.indices.flatMap((cipher, pos) =>
        marked.has(pos) ? [] : [{pos, cipher}])});
  }
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((a, page) => a + page.total, 0), 12956);
  assert.equal(pages.reduce((a, page) => a + page.black.length, 0), 12743);
  return pages;
}

/**
 * @typedef {{mode:"row"|"column",mapping:"index"|"prime",
 *   restart:"page"|"continuous",clock:"all"|"black",sign:-1|1}} Candidate
 * @returns {Candidate[]}
 */
function configurations() {
  const configs = [];
  for (const mode of ["row", "column"])
    for (const mapping of ["index", "prime"])
      for (const restart of ["page", "continuous"])
        for (const clock of ["all", "black"])
          for (const sign of [-1, 1])
            configs.push({mode, mapping, restart, clock, sign});
  assert.equal(configs.length, 32);
  return configs;
}

/** @param {Candidate} config */
function keyDigits(config) {
  return Array.from({length: SIZE * SIZE}, (_, i) => {
    const ix = config.mode === "row" ? i :
      (i % SIZE) * SIZE + Math.floor(i / SIZE);
    const x = red[ix];
    return config.mapping === "index" ? x : corpus.prime[x] % M;
  });
}

/**
 * Return ciphertext-to-plaintext outputs, retaining source physical
 * coordinates for the key clock. The inverse is C=P-sign*K mod29.
 * @param {ReturnType<typeof targetPages>} pages
 * @param {Candidate} config
 */
function decode(pages, config) {
  const key = keyDigits(config);
  let total = 0, blackTotal = 0;
  const train = [], test = [];
  for (const page of pages) {
    const out = page.page < TRAIN_END ? train : test;
    for (let j = 0; j < page.black.length; j++) {
      const glyph = page.black[j];
      const clock = config.restart === "page" ?
        (config.clock === "all" ? glyph.pos : j) :
        (config.clock === "all" ? total + glyph.pos : blackTotal + j);
      out.push(mod(glyph.cipher + config.sign * key[clock % key.length]));
    }
    total += page.total;
    blackTotal += page.black.length;
  }
  return {train, test};
}

/** @param {number[]} array @returns {number} */
function ioc(array) {
  const counts = new Uint32Array(M);
  for (const x of array) counts[x]++;
  let equal = 0;
  for (const count of counts) equal += count * (count - 1);
  return equal / (array.length * (array.length - 1));
}

/** @param {ReturnType<typeof targetPages>} pages */
function screen(pages) {
  const rows = configurations().map(config => {
    const {train, test} = decode(pages, config);
    return {...config, trainIoC: ioc(train), holdoutIoC: ioc(test)};
  });
  rows.sort((a, b) => b.trainIoC - a.trainIoC);
  return {winner: rows[0], top: rows.slice(0, 5),
    maxHoldout: Math.max(...rows.map(row => row.holdoutIoC)),
    trainCount: decode(pages, rows[0]).train.length,
    holdoutCount: decode(pages, rows[0]).test.length};
}

/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Independent Shakespeare English source encrypted with one authentic
 * source-key configuration. The only ciphertext correction is that
 * immediate duplicates are replaced with a uniformly different GP rune
 * with probability .81.
 *
 * @param {ReturnType<typeof targetPages>} pages
 * @param {Candidate} config
 */
function plant(pages, config) {
  const required = pages.reduce((sum, page) => sum + page.black.length, 0);
  const english = (rawEnglish.slice(240000).match(/[A-Za-z]+/g) || [])
    .flatMap(encode);
  assert.ok(english.length >= required);
  const next = rng(SEED);
  const key = keyDigits(config);
  let source = 0, continuousAll = 0, continuousBlack = 0, repairs = 0;
  const output = pages.map(page => {
    const black = [];
    let previous = -1;
    for (let j = 0; j < page.black.length; j++) {
      const glyph = page.black[j];
      const clock = config.restart === "page" ?
        (config.clock === "all" ? glyph.pos : j) :
        (config.clock === "all" ? continuousAll + glyph.pos : continuousBlack + j);
      let cipher = mod(english[source++] - config.sign * key[clock % 225]);
      if (cipher === previous && next() < REPAIR) {
        const alternative = Math.floor(next() * (M - 1));
        cipher = alternative >= previous ? alternative + 1 : alternative;
        repairs++;
      }
      black.push({...glyph, cipher});
      previous = cipher;
    }
    continuousAll += page.total;
    continuousBlack += page.black.length;
    return {...page, black};
  });
  assert.equal(source, required);
  return {pages: output, repairs, sourceIoC: ioc(english.slice(0, required))};
}

function main() {
  const pages = targetPages();
  const real = screen(pages);
  const config = {mode:"column", mapping:"prime",
    restart:"page", clock:"all", sign: 1};
  const positive = plant(pages, config);
  const recovered = screen(positive.pages);
  const same = Object.keys(config).every(k => config[k] === recovered.winner[k]);
  assert.ok(same, "The source-defined planted key was not ranked first");
  assert.ok(recovered.winner.holdoutIoC > .05,
    "Genuine planted GP-English key must survive held-out correction");
  assert.ok(real.winner.holdoutIoC < .045);
  console.log(JSON.stringify({
    experiment:"225 red runes -> exact 15x15 pad, 32 finite models",
    source:{corpusSHA256:crypto.createHash("sha256").update(rawCorpus).digest("hex"),
      inkSHA256:crypto.createHash("sha256").update(rawInk).digest("hex"),
      englishSHA256:crypto.createHash("sha256").update(rawEnglish).digest("hex")},
    original:{sourceRed:225,blackCipher:12743,trainingPages:"0..27",
      heldoutPages:"28..55 (physical 50 runeless)",...real},
    positive:{seed:"0x"+SEED.toString(16),
      trueKey:config,sourceIoC:positive.sourceIoC,repairs:positive.repairs,
      exactKeyRankOne:same,winning:recovered.winner},
    conclusion:"Finite direct repeating additive-pad family fails the original GP-English holdout. Other key schedules and language registers remain untested.",
    noRecoveredOriginalPlaintext:true
  }, null, 2));
}

if (require.main === module) main();
module.exports = {targetPages, configurations, keyDigits, decode, ioc, screen, plant, main};
