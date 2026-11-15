#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const { logLikelihood } = require("./keyskip_transducer.cjs");

const read = (p) => fs.readFileSync(p, "utf8");
const mod = (x, n = 29) => ((x % n) + n) % n;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1Reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1Canonical = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const lp1Pages = lp1Canonical.split("%");
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
const p57Plain = corpus.pages.find((p) => p.page === 57).indices;
const translit = corpus.translit;
const tokens = translit.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));

function encodeWord(word) {
  word = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
  const out = [];
  for (let i = 0; i < word.length;) {
    const token = tokens.find(([t]) => word.startsWith(t, i));
    if (!token) {
      i++;
      continue;
    }
    out.push(token[1]);
    i += token[0].length;
  }
  return out;
}

function parseRuneWords(raw) {
  const words = [];
  let current = [];
  for (const ch of raw) {
    if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
    else if (ch === "/" || /\s/u.test(ch)) continue;
    else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

function interiors(words) {
  return words.flatMap((word) => word.length > 2 ? word.slice(1, -1) : []);
}

const p3Text = lp1Reference.split("### 3")[1].split("### 4")[0];
const p3Words = (p3Text.toUpperCase().match(/[A-Z]+/g) || []).map(encodeWord);
const p10to13Words = lp1Pages.slice(8, 12).flatMap(parseRuneWords);
const p3Interior = interiors(p3Words);
const p10to13Interior = interiors(p10to13Words);
const key = p3Interior.concat(p10to13Interior);
const p10to13Translit = p10to13Words.map((w) => w.map((i) => translit[i]).join(" ")).join(" ");
const p3Head = p3Text.toUpperCase().includes("INSTAR");
if (!p3Head || !p10to13Translit.includes("CIRCUMFERENCE") || !p10to13Translit.includes("DIVINITY")) {
  throw new Error("The LP1 p3/p10–13 source selectors did not parse as expected.");
}

function sieve(limit) {
  const composite = new Uint8Array(limit + 1);
  const out = [];
  for (let p = 2; p <= limit; p++) {
    if (composite[p]) continue;
    out.push(p);
    if (p * p <= limit) for (let n = p * p; n <= limit; n += p) composite[n] = 1;
  }
  return out;
}
const primes = sieve(600000);
const p56Plain = [];
let primeIndex = 0;
for (let i = 0; i < p56Cipher.length; i++) {
  if (i === 56) {
    p56Plain.push(p56Cipher[i]); // transparent F marker in the known p56 decoder
    continue;
  }
  const p = primes[primeIndex++];
  p56Plain.push(mod(p56Cipher[i] - (p - 1)));
}
const p56Head = p56Plain.slice(0, 13).map((i) => translit[i]).join("");
if (!p56Head.startsWith("ANENDWITHIN")) throw new Error("p56 positive-control decode failed.");

const qCounts = Array(29).fill(0.5);
for (const pageIndex of [3, 8, 9, 10, 11, 14]) {
  for (const ch of lp1Pages[pageIndex]) {
    if (runeIndex.has(ch)) qCounts[runeIndex.get(ch)]++;
  }
}
for (const p of p56Plain.concat(p57Plain)) qCounts[p]++;
const qTotal = qCounts.reduce((a, b) => a + b, 0);
const q = qCounts.map((x) => x / qTotal);
const inverseSigma = Array.from({ length: 29 }, (_, i) => i);
const cipherPages = pages.map((p) => p.indices);
const flatCipher = cipherPages.flat();

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}
function shuffled(source, seed) {
  const out = source.slice();
  const random = xorshift(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const options = {
  rejectRepeat: 0.81,
  maxTotalSkips: 512,
  maxSkippedPerOutput: 4,
  inverseSigma
};
function scoreKey(candidateKey, reset) {
  const model = { ...options, key: candidateKey, q };
  if (reset === "global") return logLikelihood(flatCipher, model);
  return cipherPages.reduce((sum, page) => sum + logLikelihood(page, model), 0);
}
function summarize(actual, controls) {
  const mean = controls.reduce((a, b) => a + b, 0) / controls.length;
  const variance = controls.reduce((s, x) => s + (x - mean) ** 2, 0) / controls.length;
  const sd = Math.sqrt(variance);
  const rank = 1 + controls.filter((x) => x > actual).length;
  const empiricalP = (1 + controls.filter((x) => x >= actual).length) / (controls.length + 1);
  return { actual, controls, mean, sd, z: sd ? (actual - mean) / sd : null, rank, empiricalP };
}

const withinPageDoublets = cipherPages.reduce((n, page) =>
  n + page.slice(1).filter((x, i) => x === page[i]).length, 0);
if (pages.length !== 55 || flatCipher.length !== 12956 || withinPageDoublets !== 86) {
  throw new Error("Unexpected LP2 corpus dimensions or doublet count.");
}
if (p3Interior.length + p10to13Interior.length !== key.length || key.length !== 663) {
  throw new Error("Unexpected LP1 interior-key length.");
}

const results = [];
for (const sign of [1, -1]) {
  const signedKey = key.map((x) => mod(sign * x));
  for (const reset of ["global", "page"]) {
    const actual = scoreKey(signedKey, reset);
    const controls = [];
    for (let i = 0; i < 8; i++) {
      const seed = 0x51a7c0de ^ (sign < 0 ? 0x9e3779b9 : 0) ^
        (reset === "page" ? 0x85ebca6b : 0) ^ i;
      controls.push(scoreKey(shuffled(signedKey, seed), reset));
    }
    results.push({ sign, reset, ...summarize(actual, controls) });
  }
}

const result = {
  hypothesis: "LP1 p3 plus p10–13 word interiors as a repeating key for the Campaign XVIII key-skip transducer",
  selectors: ["LP1 p3 decoded text: INSTAR", "LP1 p10–13 canonical plaintext: CIRCUMFERENCE and DIVINITY"],
  extraction: "Encode p3 words in GP29; parse p10–13 original GP runes; remove first and last rune of every word; concatenate p3 then p10–13.",
  sourceCounts: {
    p3Words: p3Words.length,
    p3Interior: p3Interior.length,
    p10to13Words: p10to13Words.length,
    p10to13Interior: p10to13Interior.length,
    keyLength: key.length,
    keySha256: crypto.createHash("sha256").update(Buffer.from(key)).digest("hex"),
    p56Head,
    p56Length: p56Plain.length,
    p57Length: p57Plain.length,
    lp2Pages: pages.length,
    lp2Runes: flatCipher.length,
    withinPageDoublets
  },
  model: {
    family: "C=sigma((P+K_j) mod29); if C repeats previous ciphertext, reject key position with probability r while holding P fixed",
    rejectRepeat: options.rejectRepeat,
    maxTotalSkips: options.maxTotalSkips,
    maxSkippedPerOutput: options.maxSkippedPerOutput,
    controlsPerCondition: 8,
    control: "Fisher–Yates shuffles preserve the source key's symbol multiset and length"
  },
  results
};
fs.writeFileSync("lp1-p3-p10-keyskip-result.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
