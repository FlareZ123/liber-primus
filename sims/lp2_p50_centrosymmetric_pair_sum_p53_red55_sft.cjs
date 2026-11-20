#!/usr/bin/env node
"use strict";

// Antipodal pair-sum companion to the existing p50/p53 XOR gate.
// Run: node sims/lp2_p50_centrosymmetric_pair_sum_p53_red55_sft.cjs

const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const fail = m => { throw new Error(m); };
const mod = x => ((x % 29) + 29) % 29;

function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  const n = values.length;
  return counts.reduce((s, f) => s + f * (f - 1), 0) / (n * (n - 1));
}
function directDecode(cipher, key, sign) {
  if (cipher.length > key.length) fail("Pair-sum key shorter than receiver");
  return cipher.map((x, i) => mod(x + sign * key[i]));
}
function decodeTransparentF(cipher, key, sign) {
  // p56-style rule: plaintext F=0 is transparent and consumes no key.
  // Ciphertext F may alternatively decrypt to a non-F consuming symbol.
  let states = new Map([[0, [[]]]]);
  for (const c of cipher) {
    const next = new Map();
    const push = (j, a) => {
      if (!next.has(j)) next.set(j, []);
      next.get(j).push(a);
    };
    for (const [j, paths] of states) {
      for (const pth of paths) {
        if (c === 0) push(j, pth.concat(0));
        if (j < key.length) {
          const p = mod(c + sign * key[j]);
          if (p !== 0) push(j + 1, pth.concat(p));
        }
      }
    }
    states = next;
    if (!states.size) break;
  }
  return [...states.values()].flat();
}
function encodeTransparentF(plain, key, sign) {
  let j = 0;
  const out = [];
  for (const p of plain) {
    if (p === 0) out.push(0);
    else {
      if (j >= key.length) fail("Key exhausted in p57 positive control");
      out.push(mod(p - sign * key[j]));
      j++;
    }
  }
  return out;
}
function includesExact(paths, target) {
  return paths.some(p => p.length === target.length &&
    p.every((x, i) => x === target[i]));
}
function runeString(values, translit) {
  return values.map(x => translit[x]).join("");
}

function main() {
  const grid = readJson("resources/liber-primus/lp2-grid-256.json");
  const corpus = readJson("resources/liber-primus/lp2-corpus.json");
  const redMeta = readJson("resources/liber-primus/lp2-page53-red-span.json");
  const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
  const p53 = pages.get(53);
  const p55 = pages.get(55);
  const p57 = pages.get(57);
  const black = p53.slice(0, 128);
  const red = p53.slice(redMeta.red_text.start_rune_inclusive,
                        redMeta.red_text.end_rune_exclusive);
  const redThen55 = red.concat(p55);
  const bytes = grid.bytes;

  if (bytes.length !== 256 || grid.byte_count !== 256) fail("Expected 256 table bytes");
  if (black.length !== 128 || red.length !== 51 || p55.length !== 76 ||
      redThen55.length !== 127 || p57.length !== 95) fail("Source receiver lengths changed");
  if (redMeta.visual_method.indexOf("not a separate direction arrow") < 0) {
    fail("p53 rune-vs-arrow source annotation changed");
  }

  // 128 physical antipodal pairs under a 180-degree rotation of the 32x8
  // printed table. Test pairwise sum as a companion to historical XOR.
  const sumKeyFull = Array.from({ length: 128 }, (_, i) =>
    mod(bytes[i] + bytes[255 - i])
  );
  const xorKeyFull = Array.from({ length: 128 }, (_, i) =>
    mod(bytes[i] ^ bytes[255 - i])
  );

  // A source-indexed one-cell omission: the first p53 red rune is GP29 T
  // (index 16). Since the red+p55 receiver is 127 runes versus 128 pairs,
  // test the one key omission selected by that rune index, without a scan.
  const firstRedRune = redMeta.red_text.runes[0];
  const omittedPairIndex = corpus.runes.indexOf(firstRedRune);
  if (firstRedRune !== "ᛏ" || omittedPairIndex !== 16) {
    fail("p53 first red rune no longer selects GP29 index 16");
  }
  const sumKeyOmitT = sumKeyFull.filter((_, i) => i !== omittedPairIndex);
  const xorKeyOmitT = xorKeyFull.filter((_, i) => i !== omittedPairIndex);

  const cases = [
    { keyName: "antipodal pair-sum full128", key: sumKeyFull,
      receiver: "p53 black128", cipher: black },
    { keyName: "antipodal pair-sum full128", key: sumKeyFull,
      receiver: "p53 red51 + p55 76", cipher: redThen55 },
    { keyName: "antipodal pair-sum omit T-index16", key: sumKeyOmitT,
      receiver: "p53 red51 + p55 76", cipher: redThen55 },
    { keyName: "antipodal XOR omit T-index16", key: xorKeyOmitT,
      receiver: "p53 red51 + p55 76", cipher: redThen55 }
  ];

  const receivers = [];
  for (const item of cases) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(item.cipher, item.key, sign);
      const transparent = decodeTransparentF(item.cipher, item.key, sign);
      const planted = encodeTransparentF(p57, item.key, sign);
      if (!includesExact(decodeTransparentF(planted, item.key, sign), p57)) {
        fail("p57 planted positive control failed for " + item.keyName);
      }
      receivers.push({
        keyName: item.keyName,
        receiver: item.receiver,
        keyLength: item.key.length,
        runeCount: item.cipher.length,
        ciphertextFCount: item.cipher.filter(x => x === 0).length,
        inverse: sign < 0 ? "C-K" : "C+K",
        directIoC: ioc(direct),
        directText: runeString(direct, corpus.translit),
        transparentFullPathCount: transparent.length,
        transparentBestIoC: transparent.length
          ? Math.max(...transparent.map(ioc)) : null,
        p57SyntheticControl: true
      });
    }
  }

  console.log(JSON.stringify({
    classification: "bounded negative; no unknown plaintext or key recovered",
    sourceFiles: [
      "resources/liber-primus/lp2-grid-256.json",
      "resources/liber-primus/lp2-corpus.json",
      "resources/liber-primus/lp2-page53-red-span.json"
    ],
    sourceFacts: {
      gridShape: grid.shape,
      tableBytes: bytes.length,
      antipodalPairs: sumKeyFull.length,
      p53BlackRunes: black.length,
      p53RedRunes: red.length,
      p55Runes: p55.length,
      redThen55Runes: redThen55.length,
      p53RedStart: redMeta.red_text.start_rune_inclusive,
      p53RedEndExclusive: redMeta.red_text.end_rune_exclusive,
      p53FirstRedRune: firstRedRune,
      p53FirstRedRuneGP29Index: omittedPairIndex,
      p53ArrowShapedGlyphIsNotSeparateDirectionMarker: true,
      p57ControlRunes: p57.length,
      p57IoC: ioc(p57)
    },
    keyRules: {
      pairSumFull128: "(B[i] + B[255-i]) mod29, i=0..127",
      pairSumOmitT: "pairSumFull128 with index 16 removed",
      xorOmitT: "((B[i] XOR B[255-i]) mod29) with index 16 removed",
      omittedPairIndex: omittedPairIndex
    },
    keyValues: {
      pairSumFull128: sumKeyFull,
      pairSumOmitT: sumKeyOmitT,
      xorOmitT: xorKeyOmitT
    },
    receivers
  }, null, 2));
}
main();
