"use strict";

// Transfer only the authenticated p56 prime-totient cipher to p55's
// p57-selected strict word interiors. No prime start, sign or key is fitted.
// Run from repository root: node sims/p55_phi_prime_43_interior_gate.cjs

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(__dirname, "..", "resources/lp2-transcription.txt"), "utf8");

function firstPrimes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) out.push(x);
  }
  return out;
}
function parseWords(raw, pageCount = 55) {
  const segments = raw.split("%").slice(0, pageCount);
  const byStartPage = Array.from({length: segments.length}, () => []);
  let current = "", startPage = 0, page = 0;
  function finish() {
    if (current) {
      byStartPage[startPage].push([...current].map(r => corpus.runes.indexOf(r)));
      current = "";
    }
  }
  for (const ch of segments.join("%")) {
    if (/[\u16A0-\u16FF]/u.test(ch)) {
      if (!current) startPage = page;
      current += ch;
    } else if (ch === "%") page++;
    else if (ch === "/" || /\s/u.test(ch)) {
      // Line wraps preserve a word.
    } else finish();
  }
  finish();
  return byStartPage;
}
function toGpRunes(words) {
  const tokens = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(" ")) {
    for (let i = 0; i < word.length;) {
      const hit = tokens.find(({token}) => word.startsWith(token, i));
      assert.ok(hit, "No GP spelling at " + word.slice(i));
      out.push(hit.index);
      i += hit.token.length;
    }
  }
  return out;
}
function ioc(seq) {
  const h = Array(29).fill(0);
  for (const x of seq) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
function decode(cipher, fPositions, mask, primes, start = 0) {
  let k = start;
  return cipher.map((c, pos) => {
    const f = fPositions.indexOf(pos);
    if (f !== -1 && (mask & (1 << f))) return 0;
    const shift = primes[k++] - 1;
    return ((c - shift) % 29 + 29) % 29;
  });
}
function encode(plain, fPositions, mask, primes, start = 0) {
  let k = start;
  return plain.map((p, pos) => {
    const f = fPositions.indexOf(pos);
    if (f !== -1 && (mask & (1 << f))) return p;
    const shift = primes[k++] - 1;
    return (p + shift) % 29;
  });
}
function runeText(seq) { return seq.map(x => corpus.translit[x]).join(" "); }

const primes = firstPrimes(256);

// Positive control: exact known p56 plaintext, including its one genuine
// non-consuming literal-F at ciphertext offset 56 (mask bit 3).
const p56 = corpus.pages.find(p => p.page === 56).indices;
const p56F = p56.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(p56F, [35, 47, 51, 56, 74]);
const p56Expected = toGpRunes("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56.length, 85);
assert.deepEqual(decode(p56, p56F, 8, primes), p56Expected);
assert.deepEqual(encode(p56Expected, p56F, 8, primes), p56);

// p55: one incoming carry from p54, followed by 16 complete words.
const byStartPage = parseWords(transcription);
const words = byStartPage[54];
assert.equal(words.length, 16);
assert.deepEqual(words.map(w => w.length), [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const page55 = corpus.pages.find(p => p.page === 55).indices;
assert.equal(page55.length, 76);
const wordRunes = words.flat();
assert.equal(wordRunes.length, 75);
assert.deepEqual(wordRunes, page55.slice(1));

const inner = words.flatMap(w => w.slice(1, -1));
assert.equal(inner.length, 43);
const innerF = inner.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(innerF, [11]);
const pageF = page55.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(pageF, [15,25,41]);

// Map each selected interior back to its original p55 page-local position.
// Page index 0 is the one-rune carry from p54.
const innerLocal = [];
let offset = 1;
for (const word of words) {
  for (let j = 1; j < word.length - 1; j++) innerLocal.push(offset + j);
  offset += word.length;
}
assert.equal(offset, page55.length);
assert.equal(innerLocal.length, 43);

const compacted = [];
for (let mask = 0; mask < 2; mask++) {
  const plain = decode(inner, innerF, mask, primes);
  assert.deepEqual(encode(plain, innerF, mask, primes), inner);
  compacted.push({
    mask,
    literalF: mask === 1 ? [11] : [],
    keySymbolsConsumed: 43 - (mask === 1 ? 1 : 0),
    ioc: ioc(plain),
    output: runeText(plain)
  });
}

const pageClock = [];
for (let mask = 0; mask < (1 << pageF.length); mask++) {
  const decodedPage = decode(page55, pageF, mask, primes);
  assert.deepEqual(encode(decodedPage, pageF, mask, primes), page55);
  const selected = innerLocal.map(i => decodedPage[i]);
  pageClock.push({
    mask,
    literalFPagePositions: pageF.filter((_, bit) => mask & (1 << bit)),
    keySymbolsConsumed: 76 - pageF.filter((_, bit) => mask & (1 << bit)).length,
    ioc: ioc(selected),
    output: runeText(selected)
  });
}

const p57Control = corpus.pages.find(p => p.page === 57).indices.slice(7, 50);
assert.equal(p57Control.length, 43);
const summary = {
  operation: "P = C - (prime_i - 1) mod 29; selected literal-F symbols do not consume key",
  keyStart: "prime index 0 (prime 2), exactly as the solved p56 regression",
  positiveControl: "p56 recovers all 85/85 known plaintext runes with F mask 8",
  p55PageRunes: page55.length,
  p55IncomingCarryRunes: 1,
  p55CompleteWords: words.length,
  p55CompleteWordRunes: wordRunes.length,
  p55StrictInteriors: inner.length,
  p55InteriorFPositions: innerF,
  p55FullPageFPositions: pageF,
  rawP55InteriorIoC: ioc(inner),
  solvedP57SameLengthControlIoC: ioc(p57Control),
  compactedInteriorClock: compacted,
  pageStartClockPreservingCircumferenceConsumption: pageClock,
  decision: "The authenticated p56 prime-totient operation, fixed at its genuine first-prime start, yields no recognizable p55 interior plaintext under either compacted-interior or page-start clock, for every literal-F mask."
};
console.log(JSON.stringify(summary, null, 2));
