#!/usr/bin/env node
"use strict";

/*
Bounded 3^8-prefix / 6,395-rune suffix pad test.

The first 6,561 = 3^8 runes end at p27 local offsets 28..33, exactly the
repeated DJU-BEI pair. The remaining 6,395 runes begin at p27 local offset 34
and end with the same pair on p55. This is a rune-prefix/suffix split, NOT the
physical 28-page split (p0-27=6,761; p28-55=6,195).

No offset search:
  end alignment selects key = prefix[166..6560] for suffix[0..6394]
  start alignment key = prefix[0..6394] is the control.

Test only direct GP29 addition/subtraction in both signs, plus the solved-p56
F-transparent/no-key-advance variant for the end-aligned key. The latter is
not assumed to be the LP2 cipher; it is a source-motivated variant.
*/

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const englishText = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
const M = 29;
const mod = x => ((x % M) + M) % M;

const SYMBOL = {
  F:0, U:1, TH:2, O:3, R:4, C:5, G:6, W:7, H:8, N:9, I:10,
  J:11, EO:12, P:13, X:14, S:15, T:16, B:17, E:18, M:19,
  L:20, NG:21, OE:22, D:23, A:24, AE:25, Y:26, IA:27, EA:28
};

function encodeEnglish(s) {
  const src = s.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < src.length; i++) {
    if (!/[A-Z]/.test(src[i])) continue;
    let token = src[i], advance = 1;
    if (src.slice(i, i + 3) === "ING") {
      token = "NG";
      advance = 3;
    } else if (Object.prototype.hasOwnProperty.call(SYMBOL, src.slice(i, i + 2))) {
      token = src.slice(i, i + 2);
      advance = 2;
    }
    if (Object.prototype.hasOwnProperty.call(SYMBOL, token)) out.push(SYMBOL[token]);
    i += advance - 1;
  }
  return out;
}

function ioc(a) {
  const counts = Array(M).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}

function makeLanguageModel(english) {
  const train = english.slice(5000, 190000);
  const uni = Array(M).fill(0.5);
  const bi = Array(M * M).fill(0.5);
  const row = Array(M).fill(M * 0.5);
  for (let i = 0; i < train.length; i++) {
    uni[train[i]]++;
    if (i) {
      bi[train[i - 1] * M + train[i]]++;
      row[train[i - 1]]++;
    }
  }
  const total = uni.reduce((a, b) => a + b, 0);
  const uniLog = uni.map(x => Math.log(x / total));
  const biLog = bi.map((x, i) => Math.log(x / row[Math.floor(i / M)]));
  return function score(a) {
    let u = 0, b = 0;
    for (let i = 0; i < a.length; i++) {
      u += uniLog[a[i]];
      if (i) b += biLog[a[i - 1] * M + a[i]];
    }
    return {
      ioc: ioc(a),
      unigramNatsPerRune: u / a.length,
      bigramNatsPerRune: b / (a.length - 1)
    };
  };
}

function decodeDirect(key, ciphertext, sign) {
  return ciphertext.map((c, i) => mod(sign === -1 ? c - key[i] : key[i] - c));
}

function decodeFTransparent(key, ciphertext, sign) {
  let j = 0;
  const plain = [];
  for (const c of ciphertext) {
    assert(j < key.length, "F-transparent key exhausted");
    if (c === key[j]) {
      plain.push(0); // F plaintext: transparent, so the key pointer does not advance
    } else {
      plain.push(mod(sign === -1 ? c - key[j] : key[j] - c));
      j++;
    }
  }
  return { plain, keyConsumed: j, zeroCount: plain.filter(x => x === 0).length };
}

function encryptFTransparent(key, plain) {
  let j = 0;
  const ciphertext = [];
  for (const p of plain) {
    assert(j < key.length, "positive-control key exhausted");
    ciphertext.push(mod(p + key[j]));
    if (p !== 0) j++;
  }
  return { ciphertext, keyConsumed: j };
}

function quantile(sorted, q) {
  return sorted[Math.floor(q * (sorted.length - 1))];
}

function render(a) {
  return a.map(i => corpus.translit[i]).join("");
}

const pages = corpus.pages.slice(0, 56);
const pageLengths = pages.map(p => p.indices.length);
const ciphertext = pages.flatMap(p => p.indices);
const prefix = ciphertext.slice(0, 6561);
const suffix = ciphertext.slice(6561);
const difference = prefix.length - suffix.length;
const p27 = pages.find(p => p.page === 27);
const p55 = pages.find(p => p.page === 55);
const p0to26 = pageLengths.slice(0, 27).reduce((a, b) => a + b, 0);
const physicalP0to27 = p0to26 + p27.indices.length;
const physicalP28to55 = pageLengths.slice(28, 56).reduce((a, b) => a + b, 0);
const p27Echo = p27.indices.slice(28, 34);
const p55Echo = p55.indices.slice(-6);

assert.strictEqual(ciphertext.length, 12956);
assert.strictEqual(prefix.length, 6561);
assert.strictEqual(suffix.length, 6395);
assert.strictEqual(difference, 166);
assert.strictEqual(p0to26, 6527);
assert.strictEqual(p27.indices.length, 234);
assert.strictEqual(p0to26 + 34, 6561, "the 3^8 boundary must fall after p27 local offset 33");
assert.strictEqual(physicalP0to27, 6761);
assert.strictEqual(physicalP28to55, 6195);
assert.strictEqual(pageLengths.slice(0, 3).reduce((a, b) => a + b, 0), 729);
assert(p27Echo.every((x, i) => x === prefix[prefix.length - 6 + i]),
  "the prefix must end with p27 local runes 28..33");
assert(p55Echo.every((x, i) => x === suffix[suffix.length - 6 + i]),
  "the suffix must end with the p55 terminal pair");
assert(p27Echo.every((x, i) => x === p55Echo[i]),
  "the repeated DJU-BEI pair must be exact");

const english = encodeEnglish(englishText);
const score = makeLanguageModel(english);
const variants = [];

for (const [alignment, key] of [
  ["end", prefix.slice(difference)],
  ["start-control", prefix.slice(0, suffix.length)]
]) {
  for (const sign of [-1, 1]) {
    const plain = decodeDirect(key, suffix, sign);
    variants.push({
      alignment, mode:"direct", sign, ...score(plain),
      first120:render(plain.slice(0, 120)),
      last20:render(plain.slice(-20))
    });
  }
}

for (const sign of [-1, 1]) {
  const decoded = decodeFTransparent(prefix.slice(difference), suffix, sign);
  variants.push({
    alignment:"end", mode:"F-transparent", sign,
    keyConsumed:decoded.keyConsumed, zeroCount:decoded.zeroCount,
    ...score(decoded.plain),
    first120:render(decoded.plain.slice(0, 120)),
    last20:render(decoded.plain.slice(-20))
  });
}

const reference = [];
for (let start = 0; start + suffix.length <= english.length; start += 97) {
  reference.push(score(english.slice(start, start + suffix.length)));
}
reference.sort((a, b) => a.bigramNatsPerRune - b.bigramNatsPerRune);

const positivePlain = english.slice(50000, 56395);
const positiveKey = english.slice(10000, 16395);
const positiveCipher = positivePlain.map((p, i) => mod(p + positiveKey[i]));
const positiveDirect = decodeDirect(positiveKey, positiveCipher, -1);
const positiveFEncrypted = encryptFTransparent(positiveKey, positivePlain);
const positiveFDecoded = decodeFTransparent(positiveKey, positiveFEncrypted.ciphertext, -1);

const result = {
  lengths: {
    total:ciphertext.length, prefix:prefix.length, suffix:suffix.length,
    difference, openingPages0to2:729, prefixIs3pow8:prefix.length === 3 ** 8,
    physicalPageFold:{p0to27:physicalP0to27,p28to55:physicalP28to55},
    p27PrefixBoundary:{localOffsetAfter:34,echoRunes:render(p27Echo),firstSuffixRune:render(suffix.slice(0, 1))}
  },
  terminalEcho: {
    equal:prefix.slice(-6).every((x, i) => x === suffix[suffix.length - 6 + i]),
    runes:render(prefix.slice(-6))
  },
  variants,
  englishReference: {
    encodedRunes:english.length, windows:reference.length,
    q01:quantile(reference, 0.01), q05:quantile(reference, 0.05),
    median:quantile(reference, 0.50), q95:quantile(reference, 0.95)
  },
  positiveControls: {
    directExact:positiveDirect.every((x, i) => x === positivePlain[i]),
    directScore:score(positiveDirect),
    fTransparentExact:positiveFDecoded.plain.every((x, i) => x === positivePlain[i]),
    fTransparentKeyConsumed:positiveFDecoded.keyConsumed,
    fTransparentScore:score(positiveFDecoded.plain)
  }
};

console.log(JSON.stringify(result, null, 2));
