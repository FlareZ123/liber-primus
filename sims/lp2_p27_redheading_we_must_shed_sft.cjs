"use strict";

/** Source-only SFT for the p55 -> p27 red-heading instruction candidate. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8"
);
const rawPages = transcription.split("%");
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
/** @param {number} n */
function primeRank(n) {
  if (!isPrime(n)) return null;
  let rank = 0;
  for (let x = 2; x <= n; x++) if (isPrime(x)) rank++;
  return rank;
}
/** @param {number} n */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result -= result / p;
  }
  if (x > 1) result -= result / x;
  return result;
}
/** @param {number[]} runes */
const primeSum = runes => runes.reduce((sum, rune) => sum + corpus.prime[rune], 0);
/** @param {number[]} runes */
const indexSum = runes => runes.reduce((sum, rune) => sum + rune, 0);
/** @param {number[]} runes */
const translit = runes => runes.map(rune => corpus.translit[rune]).join("");

/** @param {number} physicalPage */
function pageWords(physicalPage) {
  const source = rawPages[physicalPage <= 49 ? physicalPage : physicalPage - 1] || "";
  let offset = 0;
  let start = -1;
  let current = [];
  const words = [];
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: offset, inds: current});
    current = [];
    start = -1;
  };
  for (const ch of source) {
    if (alphabet.has(ch)) {
      if (!current.length) start = offset;
      current = [...current, alphabet.get(ch)];
      offset++;
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Physical line wraps preserve the canonical word.
    } else {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @param {number[][]} parts
 * @returns {{inner:number[][],removed:number[]}}
 */
function shed(parts) {
  const removed = [];
  const inner = parts.map(part => {
    if (!part.length) return [];
    if (part.length === 1) {
      removed.push(part[0]);
      return [];
    }
    removed.push(part[0], part.at(-1));
    return part.slice(1, -1);
  });
  return {inner, removed};
}

const p57 = pageWords(57).map(word => ({
  name: translit(word.inds),
  sum: primeSum(word.inds)
}));
assert.equal(p57.length, 20);
assert.deepEqual(
  p57.slice(8, 11).map(word => [word.name, word.sum]),
  [["WE", 86], ["MUST", 186], ["SHED", 232]]
);
const p57Sums = new Set(p57.map(word => word.sum));

const p27 = annotations.pages.find(page => page.page === 27);
assert(p27);
const span = p27.red_spans[0];
const heading = [...span.runes].map(rune => alphabet.get(rune));
const headingWords = pageWords(27).filter(
  word => word.start >= span.start && word.end <= span.start + span.length
);
const marker = p27.large_punctuation.find(mark => mark[0] === span.start + span.length);
assert.deepEqual(headingWords.map(word => word.inds.length), [3, 12, 4]);
assert.deepEqual(marker, [19, 13, "red"]);
assert.equal(heading.length, 19);
assert.equal(heading[0], 19);

const fullSum = primeSum(heading);
const fullRank = primeRank(fullSum);
assert.equal(fullSum, 1109);
assert.equal(fullRank, 186);
assert.equal(grid.bytes[fullRank], 19);

const first = shed(headingWords.map(word => word.inds));
const interior = first.inner.flat();
assert.equal(interior.length, 13);
assert.equal(interior.length, marker[1]);
assert.equal(translit(interior), "PSOAAEHLEEOIMSC");
assert.equal(primeSum(interior), 673);
assert.equal(primeRank(primeSum(interior)), 122);
assert.equal(grid.bytes[122], 86);

const second = shed(first.inner);
assert.equal(translit(second.removed), "PSMSC");
assert.equal(primeSum(second.removed), 233);
assert.equal(phi(233), 232);

// p27 alone among all 18 red spans satisfies each source-shaped selector.
const rawWordHits = [];
const selfHits = [];
const markerHits = [];
const shedWordHits = [];
for (const page of annotations.pages) {
  const words = pageWords(page.page);
  for (const redSpan of page.red_spans || []) {
    const runes = [...redSpan.runes].map(rune => alphabet.get(rune));
    const rank = primeRank(primeSum(runes));
    const spanWords = words.filter(
      word => word.start >= redSpan.start && word.end <= redSpan.start + redSpan.length
    );
    const inner = shed(spanWords.map(word => word.inds)).inner.flat();
    const mark = (page.large_punctuation || []).find(
      candidate => candidate[0] === redSpan.start + redSpan.length
    );
    if (rank !== null && p57Sums.has(rank)) rawWordHits.push(page.page);
    if (
      rank !== null && rank < 256 &&
      grid.bytes[rank] === redSpan.length &&
      runes[0] === redSpan.length
    ) selfHits.push(page.page);
    if (mark && inner.length === mark[1]) markerHits.push(page.page);
    const innerRank = primeRank(primeSum(inner));
    if (
      innerRank !== null && innerRank < 256 &&
      p57Sums.has(grid.bytes[innerRank])
    ) shedWordHits.push(page.page);
  }
}
assert.deepEqual(rawWordHits, [27]);
assert.deepEqual(selfHits, [27]);
assert.deepEqual(markerHits, [27]);
assert.deepEqual(shedWordHits, [27]);

// The derived 13-rune sequence is not a direct solved-style Vigenere key for
// the black p27 body under plaintext-F transparency.
const body = corpus.pages.find(page => page.page === 27).indices.slice(19);
/** @param {number} sign */
function deadOffset(sign) {
  let keyPos = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === 0) continue;
    const plain = (body[i] + sign * interior[keyPos % interior.length] + 58) % 29;
    if (plain === 0) return i;
    keyPos++;
  }
  return null;
}
assert.equal(deadOffset(-1), 5);
assert.equal(deadOffset(+1), 61);

// Discovery-aware null. Preserve p27's independently selected 3/12/4 geometry,
// shuffle the exact 225 red rune identities, allow all six object orders, and
// allow prime sum, index sum, phi(prime sum), prime rank, plus one p50 lookup.
const allRed = [];
for (const page of annotations.pages) {
  for (const redSpan of page.red_spans || []) {
    for (const rune of [...redSpan.runes]) allRed.push(alphabet.get(rune));
  }
}
assert.equal(allRed.length, 225);

const permutations = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
/** @param {number[]} object */
function features(object) {
  const ps = primeSum(object);
  const ix = indexSum(object);
  const ph = phi(ps);
  const pr = primeRank(ps);
  const values = [ps, ix, ph, pr];
  for (const address of [ps, ix, ph, pr]) {
    if (address !== null && address >= 0 && address < 256) {
      values.push(grid.bytes[address]);
    }
  }
  return new Set(values.filter(value => value !== null));
}
/** @param {number[]} sample */
function objects(sample) {
  const parts = [sample.slice(0, 3), sample.slice(3, 15), sample.slice(15, 19)];
  const layer1 = shed(parts);
  const layer2 = shed(layer1.inner);
  return [sample, layer1.inner.flat(), layer2.removed];
}
/** @param {number[]} sample */
function broadTripleMatch(sample) {
  const sets = objects(sample).map(features);
  for (let i = 0; i + 2 < p57.length; i++) {
    const triple = [p57[i].sum, p57[i + 1].sum, p57[i + 2].sum];
    for (const order of permutations) {
      if (
        sets[order[0]].has(triple[0]) &&
        sets[order[1]].has(triple[1]) &&
        sets[order[2]].has(triple[2])
      ) return true;
    }
  }
  return false;
}
assert.equal(broadTripleMatch(heading), true);

let state = 0x6d2b79f5;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const trials = 200000;
let broadHits = 0;
let broadSelfHits = 0;
for (let trial = 0; trial < trials; trial++) {
  const indices = Array.from({length: allRed.length}, (_, i) => i);
  const sample = [];
  for (let j = 0; j < 19; j++) {
    const k = j + (random32() % (indices.length - j));
    [indices[j], indices[k]] = [indices[k], indices[j]];
    sample.push(allRed[indices[j]]);
  }
  if (!broadTripleMatch(sample)) continue;
  broadHits++;
  const rank = primeRank(primeSum(sample));
  if (
    rank !== null && rank < 256 &&
    grid.bytes[rank] === 19 &&
    sample[0] === 19
  ) broadSelfHits++;
}
assert.equal(broadHits, 10);
assert.equal(broadSelfHits, 0);


// Fixed nested-word parser. The p27 middle and third heading words map to
// consecutive p57 text under source-authenticated GP prime sums and phi.
const middle = headingWords[1].inds;
const third = headingWords[2].inds;
const middleInterior = middle.slice(1, -1);
const middleShell = [middle[0], middle.at(-1)];
assert.deepEqual(
  [phi(primeSum(middleInterior)), phi(primeSum(middleShell)), phi(primeSum(middle))],
  [184, 72, 280]
);
assert.deepEqual(
  p57.slice(1, 4).map(word => word.sum),
  [184, 72, 280]
);
assert.deepEqual(
  [primeSum(third.slice(1, -1)), phi(primeSum(third))],
  [66, 72]
);
assert.deepEqual(
  p57.slice(5, 7).map(word => word.sum),
  [66, 72]
);

// The deepest even-length center of the 12-rune middle word is HL.
// Its phi value addresses p50 byte 115, equal to p57 WITHIN.
let deepest = middle.slice();
while (deepest.length > 2) deepest = deepest.slice(1, -1);
assert.equal(translit(deepest), "HL");
assert.equal(phi(primeSum(deepest)), 32);
assert.equal(grid.bytes[32], 115);
assert.equal(p57.find(word => word.name === "WITHIN").sum, 115);

// Canonical complete-word census across p0-p55. Percent page breaks, slash
// line breaks, and whitespace preserve a word; punctuation terminates it.
const unknownSource = rawPages.slice(0, 55).join("%");
const completeWords = [];
let complete = [];
const finishComplete = () => {
  if (!complete.length) return;
  completeWords.push(complete);
  complete = [];
};
for (const ch of unknownSource) {
  if (alphabet.has(ch)) {
    complete = [...complete, alphabet.get(ch)];
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Preserve cross-page, cross-line and whitespace-separated canonical words.
  } else {
    finishComplete();
  }
}
finishComplete();
assert.equal(completeWords.length, 2896);

const p57Triples = new Set(
  p57.slice(0, -2).map((_, i) =>
    [p57[i].sum, p57[i + 1].sum, p57[i + 2].sum].join(",")
  )
);
const p57Pairs = new Set(
  p57.slice(0, -1).map((_, i) =>
    [p57[i].sum, p57[i + 1].sum].join(",")
  )
);

const twelve = completeWords.filter(word => word.length === 12);
const twelveHits = twelve.filter(word => {
  const values = [
    phi(primeSum(word.slice(1, -1))),
    phi(primeSum([word[0], word.at(-1)])),
    phi(primeSum(word)),
  ];
  return p57Triples.has(values.join(","));
});
assert.equal(twelve.length, 18);
assert.equal(twelveHits.length, 1);
assert.equal(translit(twelveHits[0]), translit(middle));

const four = completeWords.filter(word => word.length === 4);
const fourHits = four.filter(word => {
  const values = [
    primeSum(word.slice(1, -1)),
    phi(primeSum(word)),
  ];
  return p57Pairs.has(values.join(","));
});
assert.equal(four.length, 513);
assert.equal(fourHits.length, 1);
assert.equal(translit(fourHits[0]), translit(third));

// The selected red heading leaves a 215-rune black body. Among all LP2 pages
// with an initial red span, p27 alone has that body length. p57 AND sums to 215.
assert.equal(body.length, 215);
assert.equal(p57.find(word => word.name === "AND").sum, 215);
const initialRedBody215 = annotations.pages
  .filter(page => page.page <= 55)
  .filter(page => (page.red_spans || []).some(red => red.start === 0))
  .filter(page => {
    const red = page.red_spans.find(candidate => candidate.start === 0);
    const sourcePage = corpus.pages.find(candidate => candidate.page === page.page);
    return sourcePage.indices.length - red.length === 215;
  })
  .map(page => page.page);
assert.deepEqual(initialRedBody215, [27]);

// The upstream p55 route independently lands at boundary 300. This SFT does
// not recompute that historical exhaustion, but it locks the clear p57 checksum.
assert.equal(p57.find(word => word.name === "EMERGE").sum, 300);


// Literal FIND THE DIVINITY WITHIN chain in the p27 black body.
// Repeatedly shed every printed body word five times. Only four rune-centers
// remain; their GP prime sum is THE=72.
const bodyWordsForFind = pageWords(27).filter(word => word.start >= 19);
let bodyLayers = bodyWordsForFind.map(word => word.inds.slice());
for (let depth = 0; depth < 5; depth++) {
  bodyLayers = shed(bodyLayers).inner;
}
const deepestBody = bodyLayers.flat();
assert.equal(translit(deepestBody), "OCEOR");
assert.equal(primeSum(deepestBody), 72);
assert.equal(p57.find(word => word.name === "THE").sum, 72);

// Exactly two p27 body words survive to that fifth layer. Of those, one is
// itself an INSTAR checksum and contains DIVINITY exactly two layers within.
const bodyLength12 = bodyWordsForFind.filter(word => word.inds.length === 12);
assert.equal(bodyLength12.length, 2);
const divinityWordHits = bodyLength12.filter(word =>
  phi(primeSum(word.inds)) === 280 &&
  primeSum(word.inds.slice(2, -2)) === 376
);
assert.equal(divinityWordHits.length, 1);
const divinityWord = divinityWordHits[0];
const divinityWithin = divinityWord.inds.slice(2, -2);
assert.equal(translit(divinityWord.inds), "EORNSOOCAEYEE");
assert.equal(translit(divinityWithin), "NSOOCAEY");
assert.equal(primeSum(divinityWithin), 376);
assert.equal(p57.find(word => word.name === "DIUINITY").sum, 376);
assert.equal(phi(primeSum(divinityWord.inds)), 280);
assert.equal(p57.find(word => word.name === "INSTAR").sum, 280);

// The outermost circumference of the same word supplies 36, the prime ordinal
// of FIND=151. This is supporting structure; the literal FIND verb already
// selects the search for the unique 376-sum interior.
const divinityOuterShell = [divinityWord.inds[0], divinityWord.inds.at(-1)];
assert.equal(primeSum(divinityOuterShell), 108);
assert.equal(phi(primeSum(divinityOuterShell)), 36);
assert.equal(p57.find(word => word.name === "FIND").sum, 151);
assert.equal(primeRank(151), 36);

// Manuscript-wide control: only one of all 18 complete 12-rune p0-p55 words
// has a twice-shed eight-rune interior summing to DIVINITY=376.
const manuscriptDivinityHits = twelve.filter(
  word => primeSum(word.slice(2, -2)) === 376
);
assert.equal(manuscriptDivinityHits.length, 1);
assert.equal(translit(manuscriptDivinityHits[0]), translit(divinityWord.inds));


// Printed-line controls. The actual p55->p27 handoff pair DJU/BEI lands on
// p27 line2, which independently supplies WE/MUST in sentence order.
function printedLines() {
  const rows = [];
  for (let rawPage = 0; rawPage < 55; rawPage++) {
    const physicalPage = rawPage >= 50 ? rawPage + 1 : rawPage;
    const sourceLines = (rawPages[rawPage] || "").split("/");
    for (let lineIndex = 0; lineIndex < sourceLines.length; lineIndex++) {
      let current = [];
      const words = [];
      const flush = () => {
        if (!current.length) return;
        words.push(current);
        current = [];
      };
      for (const ch of sourceLines[lineIndex]) {
        if (alphabet.has(ch)) {
          current = [...current, alphabet.get(ch)];
        } else if (/\s/u.test(ch)) {
          // Whitespace inside the transcription does not terminate a rune word.
        } else {
          flush();
        }
      }
      flush();
      const flat = words.flat();
      if (!flat.length) continue;
      const shell = words.flatMap(word =>
        word.length === 1 ? word : [word[0], word.at(-1)]
      );
      const sum = primeSum(flat);
      const rank = primeRank(sum);
      rows.push({
        page: physicalPage,
        line: lineIndex + 1,
        words,
        flat,
        shell,
        primeSum: sum,
        indexSum: indexSum(flat),
        primeRank: rank,
        tableAtRank: rank !== null && rank < 256 ? grid.bytes[rank] : null,
        shellIndexSum: indexSum(shell),
      });
    }
  }
  return rows;
}
const lines = printedLines();
assert.equal(lines.length, 594);

const p27Line2 = lines.find(row => row.page === 27 && row.line === 2);
assert(p27Line2);
assert.equal(p27Line2.primeSum, 673);
assert.equal(p27Line2.primeRank, 122);
assert.equal(p27Line2.tableAtRank, 86);
assert.equal(p27Line2.indexSum, 186);
assert.equal(p27Line2.shellIndexSum, 115);
assert.deepEqual(
  lines.filter(row => row.indexSum === 186).map(row => [row.page, row.line]),
  [[27, 2]]
);
assert.deepEqual(
  lines.filter(row => row.tableAtRank === 86).map(row => [row.page, row.line]),
  [[27, 2]]
);

// The line containing the manuscript-unique DIVINITY-within word also carries
// OUR/FIND on direct line/circumference statistics.
const p27Line5 = lines.find(row => row.page === 27 && row.line === 5);
assert(p27Line5);
assert.equal(p27Line5.flat.length, 21);
assert.equal(p57.find(word => word.name === "OUR").sum, 21);
assert.equal(p27Line5.shellIndexSum, 151);
assert.equal(p57.find(word => word.name === "FIND").sum, 151);
const ourFindLines = lines.filter(
  row => row.flat.length === 21 && row.shellIndexSum === 151
);
assert.deepEqual(
  ourFindLines.map(row => [row.page, row.line]),
  [[27, 5], [46, 7]]
);
const ourFindDivinityLines = ourFindLines.filter(row =>
  row.words.some(word =>
    word.length === 12 && primeSum(word.slice(2, -2)) === 376
  )
);
assert.deepEqual(
  ourFindDivinityLines.map(row => [row.page, row.line]),
  [[27, 5]]
);


// Terminal-prime serializer candidate. The documented 2013 server protocol
// explicitly gives BASE29 3301 -> 3QO. The selected DIVINITY interior has
// index-sum103, and p50 cell103 literally prints 3Q. The independently
// reconstructed DH server secret is headingLength-markerDots = 6; the sixth
// rune of the DIVINITY interior has GP index24, which is digit O in BASE29.
const p50Tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(p50Tokens.length, 256);
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const dhServerSecret = heading.length - marker[1];
assert.equal(dhServerSecret, 6);
assert.equal(indexSum(divinityWithin), 103);
assert.equal(p50Tokens[103], "3Q");
assert.equal(divinityWithin[dhServerSecret - 1], 24);
assert.equal(base29Alphabet[24], "O");
const terminalSerialized =
  p50Tokens[indexSum(divinityWithin)] +
  base29Alphabet[divinityWithin[dhServerSecret - 1]];
assert.equal(terminalSerialized, "3QO");
/** @param {string} encoded */
function decodeBase29(encoded) {
  let value = 0;
  for (const ch of encoded) {
    const digit = base29Alphabet.indexOf(ch);
    assert.ok(digit >= 0);
    value = value * 29 + digit;
  }
  return value;
}
assert.equal(decodeBase29(terminalSerialized), 3301);

// Discovery-width control: under this exact serializer, NSOOCAEY is the sole
// hit across every contiguous eight-rune window inside all 2,896 complete
// unknown words.
let eightWindows = 0;
const terminalHits = [];
for (const word of completeWords) {
  for (let start = 0; start + 8 <= word.length; start++) {
    const window = word.slice(start, start + 8);
    eightWindows++;
    const address = indexSum(window);
    if (address >= 256) continue;
    const encoded =
      p50Tokens[address] + base29Alphabet[window[dhServerSecret - 1]];
    if (encoded === "3QO") terminalHits.push(translit(window));
  }
}
assert.equal(eightWindows, 731);
assert.deepEqual(terminalHits, ["NSOOCAEY"]);

// The p27/DH EMERGE table circuit lands on p55/p56. A literal transfer of the
// solved p56 cipher to p55 beginning at the recovered prime 3301 is impossible
// after 11 runes, so 3301 is not a p56 clock under that direct reading.
function firstPrimes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(candidate);
  }
  return result;
}
const receiverPrimes = firstPrimes(600);
assert.equal(receiverPrimes[463], 3301);
assert.equal(receiverPrimes[173], 1033);
const receiverKeys = receiverPrimes.map(prime => (prime - 1) % 29);
/** @param {number[]} cipher @param {number} start */
function p56Reach(cipher, start) {
  let states = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const ciphertext = cipher[i];
    const next = new Set();
    for (const used of states) {
      const plain =
        (ciphertext - receiverKeys[start + used] + 58) % 29;
      if (plain !== 0) next.add(used + 1);
      if (ciphertext === 0) next.add(used);
    }
    if (!next.size) return i;
    states = next;
  }
  return cipher.length;
}
const p55Cipher = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p55Cipher.length, 76);
assert.equal(p56Reach(p55Cipher, 463), 11);
assert.equal(p56Reach(p55Cipher, 173), 59);

console.log(JSON.stringify({
  status: "candidate instruction chain only; no unknown plaintext",
  heading: {fullSum, fullRank, tableByte: grid.bytes[fullRank], firstIndex: heading[0]},
  firstShed: {
    translit: translit(interior),
    length: interior.length,
    markerDots: marker[1],
    primeSum: primeSum(interior),
    primeRank: primeRank(primeSum(interior)),
    tableByte: grid.bytes[primeRank(primeSum(interior))]
  },
  secondShell: {
    translit: translit(second.removed),
    primeSum: primeSum(second.removed),
    phi: phi(primeSum(second.removed))
  },
  p57CandidateValues: [86, 186, 232],
  census: {rawWordHits, selfHits, markerHits, shedWordHits},
  directReceiver: {minusDeadOffset: deadOffset(-1), plusDeadOffset: deadOffset(+1)},
  broadNull: {seed: "0x6d2b79f5", trials, broadHits, broadSelfHits}
}, null, 2));
