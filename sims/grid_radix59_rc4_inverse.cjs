"use strict";

/**
 * Source-locked original LP2 RC4 inverse under the two genuine numeric-grid
 * readings: conventional base60 and the lowercase-f-free base59 alphabet.
 *
 * Run: node sims/grid_radix59_rc4_inverse.cjs
 *
 * Every key comes from the published 256 printed tokens; no ciphertext-fitted
 * key bytes, permutation, or inserted symbols are allowed.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {encodeGP} = require("./exponent_feedback_lookup_attack.cjs");
const {stream, inverse, encodeStep, rc4} = require("./grid_rc4_field_inverse.cjs");

const root = path.join(__dirname, "..");
const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const grid = readJSON("resources/liber-primus/base60-grid.json");
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const annotations = readJSON("resources/liber-primus/lp2-ink-annotations.json");
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
const original = pages.flatMap((page) => page.indices);
const count = original.length;
const trainCount = pages.slice(0, 28).reduce((n, page) => n + page.indices.length, 0);

/** Decode the source's printed two-glyph numerals under one chosen radix. */
function decodeGrid(radix) {
  const alphabet = radix === 60 ? grid.alphabet : grid.alphabet.replace("f", "");
  const tokens = grid.rows.flat();
  if (alphabet.length !== radix || tokens.length !== 256) throw new Error("invalid source grid");
  const bytes = tokens.map((token) => {
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    if (token.length !== 2 || high < 0 || low < 0) throw new Error("invalid grid token");
    const value = radix * high + low;
    if (value > 255) throw new Error("grid is not byte-representable");
    return value;
  });
  if (radix === 60 && bytes.some((value, index) => value !== grid.byte_rows.flat()[index]))
    throw new Error("source base60 mismatch");
  return bytes;
}


/**
 * Source-locked extension: 32 printed 8-byte rows paired in order with the
 * 32 fragments delimited by the original 13-dot marks. The first 28 fragments
 * cover the 12,956 unsolved runes; the final four cover the solved 180-rune tail.
 */
function sourceFragments() {
  const byPage = new Map(annotations.pages.map((record) => [record.page, record]));
  const markerOffsets = [];
  let totalLength = 0;
  for (const page of corpus.pages) {
    const record = byPage.get(page.page);
    if (record && record.rune_count !== page.indices.length)
      throw new Error("annotation/corpus page length mismatch");
    for (const mark of record?.large_punctuation || [])
      if (mark[1] === 13) markerOffsets.push(totalLength + mark[0]);
    totalLength += page.indices.length;
  }
  markerOffsets.sort((a, b) => a - b);
  const cuts = [0, ...markerOffsets, totalLength];
  const spans = Array.from({length:32}, (_, i) => [cuts[i], cuts[i + 1]]);
  if (markerOffsets.length !== 31 || totalLength !== 13136 ||
      spans[27][1] !== count || spans.filter(([a,b]) => a === b).length !== 2 ||
      spans.slice(0,28).reduce((n, [a,b]) => n + b - a, 0) !== count)
    throw new Error("13-dot source-fragment alignment invariant failed");
  return {spans, markerCount:markerOffsets.length, totalLength};
}
const fragmentSource = sourceFragments();
const modulo29 = (x) => ((x % 29) + 29) % 29;

function iocValues(values) {
  const hist = new Uint32Array(29);
  for (const value of values) hist[value]++;
  let pairs = 0;
  for (const n of hist) pairs += n * (n - 1);
  return pairs / (values.length * (values.length - 1));
}

function fragmentRowDecode(cipher, radix, drop, projection, sign) {
  const bytes = decodeGrid(radix);
  const plain = new Array(count);
  const train = [];
  const hold = [];
  for (let row = 0; row < 28; row++) {
    const [start, end] = fragmentSource.spans[row];
    const key = bytes.slice(row * 8, row * 8 + 8);
    const next = rc4(key);
    for (let d = 0; d < drop; d++) next();
    const splitAt = start + Math.floor((end - start) * 0.45);
    for (let pos = start; pos < end; pos++) {
      const byte = next();
      const pad = projection === "low" ? byte % 29 : byte >>> 3;
      const value = modulo29(cipher[pos] - sign * pad);
      plain[pos] = value;
      if (pos < splitAt) train.push(value);
      else hold.push(value);
    }
  }
  return {
    plain,
    train:iocValues(train),
    hold:iocValues(hold),
    all:iocValues(plain),
    preview:plain.slice(0, 160).map((value) => corpus.translit[value]).join("")
  };
}

function fragmentRowConfigurations(cipher = original) {
  const configs = [];
  for (const radix of [60, 59]) {
    for (const drop of [0, 256]) {
      for (const projection of ["low", "high"]) {
        for (const sign of [-1, 1]) {
          const result = fragmentRowDecode(cipher, radix, drop, projection, sign);
          configs.push({radix, drop, projection, sign, train:result.train,
            hold:result.hold, all:result.all, preview:result.preview});
        }
      }
    }
  }
  return configs.sort((a, b) => b.train - a.train);
}

function fragmentRowEncrypt(plain, radix, drop, projection, sign) {
  const bytes = decodeGrid(radix);
  const cipher = new Array(count);
  for (let row = 0; row < 28; row++) {
    const [start, end] = fragmentSource.spans[row];
    const key = bytes.slice(row * 8, row * 8 + 8);
    const next = rc4(key);
    for (let d = 0; d < drop; d++) next();
    for (let pos = start; pos < end; pos++) {
      const byte = next();
      const pad = projection === "low" ? byte % 29 : byte >>> 3;
      cipher[pos] = modulo29(plain[pos] + sign * pad);
    }
  }
  return cipher;
}

function fragmentRowPositiveControl() {
  const source = encodeGP(fs.readFileSync(
    path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"));
  const split = Math.floor(source.length * 0.78);
  const plain = source.slice(split, split + count);
  if (plain.length !== count) throw new Error("insufficient held-out GP control text");
  const target = {radix:59, drop:256, projection:"high", sign:-1};
  const cipher = fragmentRowEncrypt(plain, target.radix, target.drop, target.projection, target.sign);
  const recoveries = [];
  for (const option of fragmentRowConfigurations(cipher)) {
    const decoded = fragmentRowDecode(cipher, option.radix, option.drop, option.projection, option.sign);
    const matches = decoded.plain.reduce((n, value, i) => n + Number(value === plain[i]), 0);
    recoveries.push({...option, matches});
  }
  const targetResult = recoveries.find((x) =>
    x.radix === target.radix && x.drop === target.drop &&
    x.projection === target.projection && x.sign === target.sign);
  const rank = recoveries.findIndex((x) =>
    x.radix === target.radix && x.drop === target.drop &&
    x.projection === target.projection && x.sign === target.sign) + 1;
  if (!targetResult || targetResult.matches !== count || rank !== 1)
    throw new Error("source-aligned per-fragment RC4 positive control failed");
  return {target, rank, exactRecovery:targetResult.matches, top:recoveries.slice(0,3)};
}

/** Four fixed traversals, each as literal key or SHA256 digest key. */
function sourceKeys(radix) {
  const row = decodeGrid(radix);
  const column = [];
  for (let c = 0; c < 8; c++) for (let r = 0; r < 32; r++) column.push(row[8*r+c]);
  const out = [];
  for (const [direction, bytes] of [["row", row], ["column", column]]) {
    for (const [order, key] of [["forward", bytes], ["reverse", [...bytes].reverse()]]) {
      const id = "base" + radix + "-" + direction + "-" + order;
      out.push({id: id + "-literal", bytes: key});
      out.push({id: id + "-sha256",
        bytes: [...crypto.createHash("sha256").update(Buffer.from(key)).digest()]});
    }
  }
  return out;
}

/** Unbiased 29-symbol index of coincidence in a frozen contiguous interval. */
function ioc(indices, start, end) {
  const hist = new Uint32Array(29);
  for (let i = start; i < end; i++) hist[indices[i]]++;
  let pairs = 0;
  for (const n of hist) pairs += n*(n-1);
  return pairs/((end-start)*(end-start-1));
}

function configurations(keys) {
  const out = [];
  for (const key of keys) for (const drop of [0, 256, 768, 3072])
    for (const reset of [false, true]) {
      const pads = stream(key.bytes, drop, reset);
      for (const family of ["additive", "step"])
        for (const projection of ["low", "high"])
          for (const sign of [-1, 1]) {
            const plain = inverse(original, pads, family, projection, sign);
            out.push({source:key.id, drop, reset, family, projection, sign,
              train:ioc(plain, 0, trainCount),
              hold:ioc(plain, trainCount, count)});
          }
    }
  return out;
}

/** Genuine-language recovery with a radix59 key unannounced to the search. */
function positiveControl(keys, configurationsToCheck) {
  const plainSource = encodeGP(fs.readFileSync(
    path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"));
  const plain = Array.from({length:count}, (_, i) => plainSource[i%plainSource.length]);
  const selected = keys.find((key) => key.id === "base59-row-forward-literal");
  const ciphertext = encodeStep(plain, stream(selected.bytes, 768, true));
  const recoveries = [];
  for (const option of configurationsToCheck) {
    const key = keys.find((item) => item.id === option.source);
    const decoded = inverse(ciphertext, stream(key.bytes, option.drop, option.reset),
      option.family, option.projection, option.sign);
    recoveries.push({...option, plantTrain:ioc(decoded, 0, trainCount),
      plantHold:ioc(decoded, trainCount, count),
      matches:decoded.reduce((s, value, i) => s + Number(value === plain[i]), 0)});
  }
  recoveries.sort((a,b) => b.plantTrain - a.plantTrain);
  const trueSetting = recoveries.find((entry) =>
    entry.source === selected.id && entry.drop === 768 && entry.reset &&
    entry.family === "step" && entry.projection === "low" && entry.sign === 1);
  if (trueSetting.matches !== count || recoveries[0].matches !== count)
    throw new Error("blind source-native radix59 positive recovery failed");
  return {top:recoveries.slice(0, 3),trueSetting};
}

function main() {
  const keys = [...sourceKeys(60), ...sourceKeys(59)];
  const configs = configurations(keys);
  const changedBytes = decodeGrid(60).filter((value, i) => value !== decodeGrid(59)[i]).length;
  const summaries = {};
  for (const radix of [60, 59]) {
    const ranked = configs.filter((candidate) => candidate.source.startsWith("base"+radix+"-"))
      .sort((a,b) => b.train - a.train);
    summaries["base"+radix] = ranked.slice(0, 5);
  }
  const planted = positiveControl(keys, configs);
  const fragmentRows = fragmentRowConfigurations();
  const fragmentPlant = fragmentRowPositiveControl();
  const rowBytes60 = decodeGrid(60);
  const rowBytes59 = decodeGrid(59);
  const fragmentRowSummary = {
    markerCount:fragmentSource.markerCount,
    fragmentLengths:fragmentSource.spans.map(([a,b]) => b-a),
    unknownFragmentCount:28,
    unknownRunes:count,
    solvedTailRunes:fragmentSource.totalLength-count,
    rowByteDifferences:rowBytes60.filter((value,i) => value !== rowBytes59[i]).length,
    originalTests:fragmentRows.length,
    originalTop:fragmentRows.slice(0,5),
    positiveControl:fragmentPlant
  };
  console.log(JSON.stringify({total:count,trainCount,heldoutCount:count-trainCount,
    changedBytes,originalTests:configs.length,originalTop:summaries,
    positiveTop:planted.top,exactPlantRecovery:planted.trueSetting.matches,
    fragmentRowRC4:fragmentRowSummary,
    baselineUniformIoC:1/29},null,2));
}
if (require.main === module) main();
module.exports = {decodeGrid,sourceKeys,ioc,configurations,positiveControl,sourceFragments,fragmentRowDecode,fragmentRowConfigurations,fragmentRowPositiveControl};
