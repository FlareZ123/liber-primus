"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const master = fs.readFileSync(path.join(root,
  "resources/transcriptions/liber_primus_master.txt"), "utf8").replace(/\r\n/g, "\n");
const mod = x => ((x % 29) + 29) % 29;
const T6 = x => mod(24 - 2 * x);
const ioc = values => {
  const f = Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
const profile = values => {
  const f = Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.sort((a, b) => b - a);
};
const agreement = (a, b) => {
  assert.equal(a.length, b.length);
  return a.reduce((n, x, i) => n + Number(x === b[i]), 0);
};
const tokenizeGP = text => {
  const tokens = corpus.translit.map((token, value) => ({ token, value }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] === " ") { i++; continue; }
    const match = tokens.find(x => text.startsWith(x.token, i));
    assert.ok(match, "Unknown GP token at " + text.slice(i));
    out.push(match.value);
    i += match.token.length;
  }
  return out;
};
const firstPrimes = count => {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (prime) out.push(n);
  }
  return out;
};

// Canonical 2,896-word stream. Normalize Windows CRLF before finding the
// header break; the GitHub Windows runner otherwise shifts the parser.
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sectionText = master.slice(master.indexOf("\n\n") + 2).split("$").slice(7, 16);
assert.equal(sectionText.length, 9);
const printedWords = sectionText.flatMap(section => section
  .split(/[-.&§]/u)
  .map(part => Array.from(part).filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)))
  .filter(word => word.length));
assert.equal(printedWords.length, 2896);
const physicalPages = corpus.pages.slice(0, 56);
const symbols = physicalPages.flatMap(page => page.indices);
assert.equal(symbols.length, 12956);
const pageStarts = new Set();
let cursor = 0;
for (const page of physicalPages) { pageStarts.add(cursor); cursor += page.indices.length; }
assert.equal(cursor, symbols.length);

let position = 0;
const eventWords = [];
const eventSites = [];
for (let wordId = 0; wordId < printedWords.length; wordId++) {
  const hits = [];
  for (let j = 0; j < printedWords[wordId].length; j++) {
    const site = position + j;
    if (site > 0 && !pageStarts.has(site) && symbols[site] === symbols[site - 1]) {
      hits.push({ site, rune: symbols[site] });
      eventSites.push(site);
    }
  }
  if (hits.length) eventWords.push({ wordId, hits });
  position += printedWords[wordId].length;
}
assert.equal(position, 12956);
assert.equal(eventSites.length, 86);
assert.equal(eventWords.length, 85);
assert.deepEqual(eventWords.filter(w => w.hits.length > 1), [{
  wordId: 1476,
  hits: [{ site: 6611, rune: 3 }, { site: 6617, rune: 18 }]
}]);

const firstPerWord = eventWords.map(w => w.hits[0].rune);
const everyEvent = eventWords.flatMap(w => w.hits.map(h => h.rune));
assert.equal(firstPerWord.length, 85);
assert.equal(everyEvent.length, 86);

// Frozen source-selected model: p2's six limb-pairs suggest lag six; the
// signed 2013 DH6 bridge supplies T6(x)=24-2x mod29. The first six symbols
// of each candidate carrier are fixed as its seed.
const decryptT6 = carrier => carrier.map((c, i) =>
  i < 6 ? c : mod(c - T6(carrier[i - 6]))
);
const decoded85 = decryptT6(firstPerWord);
const decoded86 = decryptT6(everyEvent);
const p56Cipher = corpus.pages[56].indices;
const p57Cipher = corpus.pages[57].indices.slice(0, 85);
const p56Plain = tokenizeGP(
  "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE"
);
assert.equal(p56Cipher.length, 85);
assert.equal(p56Plain.length, 85);

// Authentic solved p56 prime-totient positive control; it uses a literal-F
// key-clock interruption at original p56 rune position 56, not T6 feedback.
const primes = firstPrimes(85);
let keyClock = 0;
const shifts = p56Cipher.map((_, i) => i === 56 ? 0 : (primes[keyClock++] - 1) % 29);
assert.equal(keyClock, 84);
const authenticPlain = p56Cipher.map((x, i) => i === 56 ? 0 : mod(x - shifts[i]));
assert.deepEqual(authenticPlain, p56Plain);

// Synthetic T6-feedback round-trip validates the implementation only.
const syntheticPlain = Array.from({ length: 85 }, (_, i) => mod(7 * i + 3));
const syntheticCipher = [];
for (let i = 0; i < syntheticPlain.length; i++) {
  syntheticCipher.push(i < 6 ? syntheticPlain[i] : mod(syntheticPlain[i] + T6(syntheticCipher[i - 6])));
}
assert.deepEqual(decryptT6(syntheticCipher), syntheticPlain);

const translit = values => values.map(x => corpus.translit[x]).join("·");
const first85 = decoded86.slice(0, 85);
console.log(JSON.stringify({
  source: { words: printedWords.length, runes: symbols.length, adjacentEvents: eventSites.length, eventWords: eventWords.length },
  model: "P[i] = C[i] - (24 - 2*C[i-6]) mod 29; first six carrier symbols are the seed",
  firstPerWord: {
    length: firstPerWord.length,
    carrier: translit(firstPerWord),
    decrypted: translit(decoded85),
    carrierIoC: ioc(firstPerWord),
    decryptedIoC: ioc(decoded85),
    topFrequencyCount: profile(decoded85)[0],
    matches: {
      p56Cipher: agreement(decoded85, p56Cipher),
      p56Plain: agreement(decoded85, p56Plain),
      p57CipherFirst85: agreement(decoded85, p57Cipher)
    }
  },
  everyEvent: {
    length: everyEvent.length,
    carrier: translit(everyEvent),
    decrypted: translit(decoded86),
    decryptedIoC: ioc(decoded86),
    topFrequencyCount: profile(decoded86)[0],
    first85Matches: {
      p56Cipher: agreement(first85, p56Cipher),
      p56Plain: agreement(first85, p56Plain),
      p57CipherFirst85: agreement(first85, p57Cipher)
    }
  },
  syntheticRoundTripPositiveControl: true,
  authenticP56PrimeTotientPositiveControl: true,
  result: "Neither the 85 first-per-word carrier nor the 86 all-event carrier yields plaintext under the frozen T6 feedback inverse."
}, null, 2));
