"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const M = 29;
const TRAIN_PAGES_END = 27;
const PLANT_OFFSET = 1234;
const EXPLICIT_OFFSETS = [0, 8, 56, 61, 80, 418];

function encode(source, corpus) {
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const codes = new Map(corpus.translit.map((token, i) => [token, i]));
  const text = source.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text[i] < "A" || text[i] > "Z") { i++; continue; }
    let matched = false;
    for (const token of tokens) {
      if (text.startsWith(token, i)) {
        out.push(codes.get(token));
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) throw new Error("Unencodable source at " + i + ": " + text.slice(i, i + 12));
  }
  return out;
}

function scoreRange(cipher, key, offset, sign, logp, first, last) {
  let score = 0;
  for (let i = first; i < last; i++) {
    score += logp[(cipher[i] + sign * key[offset + i] + M * 2) % M];
  }
  return score / (last - first);
}

function scan(cipher, key, trainLength, logp, sign) {
  const usable = key.length - cipher.length + 1;
  const candidates = [];
  for (let offset = 0; offset < usable; offset++) {
    candidates.push({
      offset,
      train: scoreRange(cipher, key, offset, sign, logp, 0, trainLength)
    });
  }
  candidates.sort((a, b) => b.train - a.train);
  return candidates.slice(0, 20).map(candidate => ({
    offset: candidate.offset,
    train: candidate.train,
    holdout: scoreRange(cipher, key, candidate.offset, sign, logp,
      trainLength, cipher.length),
    full: (
      candidate.train * trainLength +
      scoreRange(cipher, key, candidate.offset, sign, logp,
        trainLength, cipher.length) * (cipher.length - trainLength)
    ) / cipher.length
  }));
}

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const shakespeare = fs.readFileSync(
  path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8"
);
const bookParts = ["I", "II", "III"].map(part =>
  fs.readFileSync(path.join(ROOT,
    `resources/external/2013-book-of-law-${part}.txt`), "utf8")
);
const bookText = bookParts.join("\n");
const key = encode(bookText, corpus);
const referenceTrain = encode(shakespeare.slice(0, 240000), corpus);
const referenceHeldout = encode(shakespeare.slice(240000), corpus);
const frequency = Array(M).fill(1);
for (const symbol of referenceTrain) frequency[symbol]++;
const total = frequency.reduce((a, b) => a + b, 0);
const logp = frequency.map(x => Math.log(x / total));

const pages = corpus.pages
  .filter(p => p.page >= 0 && p.page <= 55 && p.indices.length)
  .sort((a, b) => a.page - b.page);
const cipher = pages.flatMap(p => p.indices);
const trainLength = pages
  .filter(p => p.page <= TRAIN_PAGES_END)
  .reduce((sum, p) => sum + p.indices.length, 0);
const usable = key.length - cipher.length + 1;
if (usable <= 0) throw new Error("Book of the Law key is shorter than the LP2 stream");

const original = [];
for (const sign of [-1, 1]) {
  const top20 = scan(cipher, key, trainLength, logp, sign);
  const explicit = EXPLICIT_OFFSETS.map(offset => ({
    offset,
    train: scoreRange(cipher, key, offset, sign, logp, 0, trainLength),
    holdout: scoreRange(cipher, key, offset, sign, logp, trainLength, cipher.length),
    full: scoreRange(cipher, key, offset, sign, logp, 0, cipher.length)
  }));
  original.push({ sign, top20, explicit });
}

// Positive control: held-out Shakespeare plaintext encrypted by the same
// Book-of-the-Law stream at a hidden, fixed offset. Correct decryption sign is -1.
const plantPlain = referenceHeldout.slice(0, cipher.length);
if (plantPlain.length !== cipher.length) throw new Error("Held-out Shakespeare plant too short");
const plantCipher = plantPlain.map((p, i) => (p + key[PLANT_OFFSET + i]) % M);
const plantTop = scan(plantCipher, key, trainLength, logp, -1);
const plantTrue = plantTop.find(x => x.offset === PLANT_OFFSET);
const plantRank = 1 + plantTop.filter(x => x.train > scoreRange(
  plantCipher, key, PLANT_OFFSET, -1, logp, 0, trainLength
)).length;

const heldoutMean = referenceHeldout.reduce((s, x) => s + logp[x], 0) /
  referenceHeldout.length;

console.log(JSON.stringify({
  objective: "Direct continuous GP29 additive/subtractive running key from the 2013 Cicada Book of the Law",
  source: {
    files: [
      "resources/external/2013-book-of-law-I.txt",
      "resources/external/2013-book-of-law-II.txt",
      "resources/external/2013-book-of-law-III.txt"
    ],
    rawCharacters: bookText.length,
    gpSymbols: key.length
  },
  corpus: {
    unknownPhysicalPages: "p0-p55; numeric-only p50 contributes zero runes",
    runeBearingPages: pages.length,
    runes: cipher.length,
    trainPhysicalPages: "p0-p27",
    trainRunes: trainLength,
    holdoutPhysicalPages: "p28-p55",
    holdoutRunes: cipher.length - trainLength
  },
  search: {
    legalOffsets: usable,
    signs: [-1, 1],
    clock: "one global continuous key stream, no page or line resets",
    explicitOffsets: EXPLICIT_OFFSETS,
    plaintextPrior: "Shakespeare first 240,000 characters; GP29 unigram with add-one smoothing",
    englishHeldoutMeanLogLikelihood: heldoutMean,
    uniformMeanLogLikelihood: -Math.log(M)
  },
  original,
  positiveControl: {
    plaintext: "Shakespeare heldout GP29",
    encryption: "C = P + K mod 29",
    hiddenOffset: PLANT_OFFSET,
    correctDecodeSign: -1,
    recoveredRank: plantRank,
    trainScore: scoreRange(plantCipher, key, PLANT_OFFSET, -1, logp, 0, trainLength),
    holdoutScore: scoreRange(plantCipher, key, PLANT_OFFSET, -1, logp, trainLength, cipher.length),
    fullScore: scoreRange(plantCipher, key, PLANT_OFFSET, -1, logp, 0, cipher.length),
    top20: plantTop
  }
}, null, 2));
