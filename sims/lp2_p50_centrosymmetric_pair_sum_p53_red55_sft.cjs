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
  // printed table. Pairwise sum is the simple additive companion to the
  // historically motivated XOR operation. Reduce the sum into GP29.
  const key = Array.from({ length: 128 }, (_, i) =>
    mod(bytes[i] + bytes[255 - i])
  );

  const receivers = [];
  for (const receiver of [
    { name: "p53 black128", cipher: black },
    { name: "p53 red51 + p55 76", cipher: redThen55 }
  ]) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(receiver.cipher, key, sign);
      const transparent = decodeTransparentF(receiver.cipher, key, sign);
      const planted = encodeTransparentF(p57, key, sign);
      if (!includesExact(decodeTransparentF(planted, key, sign), p57)) {
        fail("p57 planted positive control failed");
      }
      receivers.push({
        receiver: receiver.name,
        runeCount: receiver.cipher.length,
        ciphertextFCount: receiver.cipher.filter(x => x === 0).length,
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
      antipodalPairs: key.length,
      p53BlackRunes: black.length,
      p53RedRunes: red.length,
      p55Runes: p55.length,
      redThen55Runes: redThen55.length,
      p53RedStart: redMeta.red_text.start_rune_inclusive,
      p53RedEndExclusive: redMeta.red_text.end_rune_exclusive,
      p53ArrowShapedGlyphIsRune: "ᛏ",
      p53ArrowShapedGlyphIsNotSeparateDirectionMarker: true,
      p57ControlRunes: p57.length,
      p57IoC: ioc(p57)
    },
    keyRule: "K[i] = (B[i] + B[255-i]) mod29, i=0..127; printed row-major bytes",
    keyValues: key,
    receivers
  }, null, 2));
}
main();
