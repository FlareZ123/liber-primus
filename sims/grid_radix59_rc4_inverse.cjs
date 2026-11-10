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
const {stream, inverse, encodeStep} = require("./grid_rc4_field_inverse.cjs");

const root = path.join(__dirname, "..");
const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const grid = readJSON("resources/liber-primus/base60-grid.json");
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
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
  console.log(JSON.stringify({total:count,trainCount,heldoutCount:count-trainCount,
    changedBytes,originalTests:configs.length,originalTop:summaries,
    positiveTop:planted.top,exactPlantRecovery:planted.trueSetting.matches,
    baselineUniformIoC:1/29},null,2));
}
if (require.main === module) main();
module.exports = {decodeGrid,sourceKeys,ioc,configurations,positiveControl};
