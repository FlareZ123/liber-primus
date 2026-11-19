"use strict";

/**
 * SFT: typed READOUT -> p0 page -> READ/OUT p0 span receiver.
 *
 * The whole six-rune READOUT object is consumed under the independently
 * established post-SHED base59 state and selects physical p0.
 * Once p0 is fixed as the receiver, the independently calibrated
 * authenticated-2016 p0 pointer grammar selects conventional base60
 * numeral values and zero-based page-local rune offsets.
 *
 * The split READ / OUT words are then tested under the full natural
 * radix/origin family. Only base60/base60 with zero-based offsets lands
 * exactly on a p0 word start and word end.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/Q/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];

  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((item) =>
      normalized.startsWith(item.symbol, index)
    );
    assert.ok(token, "unmapped GP spelling at " + word + ":" + index);
    out.push(token.value);
    index += token.symbol.length;
  }

  return out;
}

/**
 * @param {string} text
 * @returns {Array<{word:number,start:number,end:number,len:number,values:number[]}>}
 */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      word: words.length + 1,
      start,
      end: offset - 1,
      len: current.length,
      values: current,
    });
    current = [];
  };

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (
      char === "-" ||
      char === "." ||
      char === "$" ||
      char === "&" ||
      char === "§"
    ) {
      flush();
    }
  }

  flush();
  return words;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function numeralValue(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

// -------------------------------------------------------------------------
// Stage 1: whole READOUT under the already selected post-SHED base59 state.
// -------------------------------------------------------------------------

const READ = gp("READ");
const OUT = gp("OUT");
const READOUT = [...READ, ...OUT];

assert.deepEqual(READ, [4, 28, 23]);
assert.deepEqual(OUT, [3, 1, 16]);
assert.deepEqual(READOUT, [4, 28, 23, 3, 1, 16]);
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(gp0(READOUT), 75);
assert.equal(READOUT.length, 6);

// Charge every boundary between the six recovered GP runes against the
// frozen English control corpus. READ / OUT is the sole split into two
// ordinary words, so the component parsing is source-readable rather than a
// free segmentation.
const splitLexiconWords = [];
for (const relative of [
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  splitLexiconWords.push(
    ...(read(relative).toUpperCase().match(/[A-Z]+/gu) || [])
  );
}
const splitLexicon = new Set(splitLexiconWords);
/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}
const splitCandidates = [];
for (let split = 1; split < READOUT.length; split += 1) {
  const left = spell(READOUT.slice(0, split));
  const right = spell(READOUT.slice(split));
  splitCandidates.push({
    split,
    left,
    right,
    bothWords: splitLexicon.has(left) && splitLexicon.has(right),
  });
}
assert.deepEqual(
  splitCandidates.filter((candidate) => candidate.bothWords),
  [{split: 3, left: "READ", right: "OUT", bothWords: true}]
);

const readoutToken = tableTokens[gp0(READOUT)];
assert.equal(readoutToken, "2v");
const readout60 = numeralValue(readoutToken, alphabet60);
const readout59 = numeralValue(readoutToken, alphabet59);

assert.equal(readout60, 177);
assert.equal(readout59, 174);
assert.equal(readout59, READOUT.length * 29);
assert.equal(readout59 % 29, 0);
assert.equal(readout60 % 29, 3);

const selectedPage = readout59 % 29;
assert.equal(selectedPage, 0);

// -------------------------------------------------------------------------
// Stage 2: independently calibrate the typed p0 receiver using the
// authenticated 2016 message, charging both radices and both offset origins.
// -------------------------------------------------------------------------

const p0Words = pageWords(physicalPart(selectedPage));
assert.equal(p0Words.length, 59);
const starts = new Map(p0Words.map((word) => [word.start, word]));
const ends = new Map(p0Words.map((word) => [word.end, word]));

const clearStart = signed2016.indexOf("Hello.");
const clearEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(clearStart >= 0 && clearEnd > clearStart);
const signedWords = (
  signed2016.slice(clearStart, clearEnd).match(/[A-Za-z]+/gu) || []
).map((word, index) => ({
  index,
  word: word.toUpperCase(),
  gp: gp(word),
}));
assert.equal(signedWords.length, 43);

const shapePhrases = new Map();
for (let length = 1; length <= signedWords.length; length += 1) {
  for (let start = 0; start + length <= signedWords.length; start += 1) {
    const phrase = signedWords.slice(start, start + length);
    const shape = phrase.map((word) => word.gp.length).join(",");
    if (!shapePhrases.has(shape)) shapePhrases.set(shape, []);
    shapePhrases.get(shape).push(phrase.map((word) => word.word).join(" "));
  }
}

/**
 * @param {{gp:number[]}} sourceWord
 * @param {"base60"|"base59"} radix
 * @param {"zero"|"one"} origin
 * @returns {number}
 */
function signedPointer(sourceWord, radix, origin) {
  const address = gp0(sourceWord.gp);
  const alphabet = radix === "base60" ? alphabet60 : alphabet59;
  const value = numeralValue(tableTokens[address], alphabet);
  return origin === "zero" ? value : value - 1;
}

const receiverFamily = [];

for (const radix of ["base60", "base59"]) {
  for (const origin of ["zero", "one"]) {
    const boundaryEvents = [];
    const bracketEvents = [];

    for (let index = 0; index + 1 < signedWords.length; index += 1) {
      const first = signedWords[index];
      const second = signedWords[index + 1];
      const firstOutput = signedPointer(first, radix, origin);
      const secondOutput = signedPointer(second, radix, origin);

      // Boundary-shape event: exact p0 word-end / next-word-start crossing,
      // with the target 2-word length shape present in the signed source.
      const endWord = ends.get(firstOutput);
      const startWord = starts.get(secondOutput);
      if (
        endWord &&
        startWord &&
        startWord.word === endWord.word + 1
      ) {
        const shape = [endWord.len, startWord.len].join(",");
        const phrases = shapePhrases.get(shape) || [];
        if (phrases.length) {
          boundaryEvents.push({
            source: [first.word, second.word],
            outputs: [firstOutput, secondOutput],
            targetSpan: [endWord.start, startWord.end],
            shape,
            phrases,
          });
        }
      }

      // Bracket-shape event: both outputs are p0 word ends and the complete
      // words enclosed by those ends have a length vector present in the
      // authenticated signed message.
      const firstEnd = ends.get(firstOutput);
      const secondEnd = ends.get(secondOutput);
      if (firstEnd && secondEnd && firstEnd.word !== secondEnd.word) {
        const lowerWord = Math.min(firstEnd.word, secondEnd.word);
        const upperWord = Math.max(firstEnd.word, secondEnd.word);
        const enclosed = p0Words.filter((word) =>
          word.word > lowerWord && word.word <= upperWord
        );
        if (enclosed.length) {
          const shape = enclosed.map((word) => word.len).join(",");
          const phrases = shapePhrases.get(shape) || [];
          if (phrases.length) {
            bracketEvents.push({
              source: [first.word, second.word],
              outputs: [firstOutput, secondOutput],
              shape,
              phrases,
            });
          }
        }
      }
    }

    receiverFamily.push({
      radix,
      origin,
      boundaryEvents,
      bracketEvents,
    });
  }
}

const boundarySelectedReceiverStates = receiverFamily.filter(
  (state) => state.boundaryEvents.length > 0
);
assert.deepEqual(
  boundarySelectedReceiverStates.map((state) => [state.radix, state.origin]),
  [["base60", "zero"]]
);

// The bracket event class is retained as an independent replication, but is
// unnecessary for selecting the p0 receiver state. This avoids using the
// later THE ROAD shape to choose the state that will eventually decrypt it.
const fullyTypedReceiverStates = receiverFamily.filter((state) =>
  state.boundaryEvents.length > 0 && state.bracketEvents.length > 0
);
assert.deepEqual(
  fullyTypedReceiverStates.map((state) => [state.radix, state.origin]),
  [["base60", "zero"]]
);

const base60Zero = boundarySelectedReceiverStates[0];
assert.deepEqual(base60Zero.boundaryEvents, [{
  source: ["EMPTY", "EPIPHANY"],
  outputs: [236, 237],
  targetSpan: [235, 243],
  shape: "2,7",
  phrases: ["THE DEVOTED"],
}]);
assert.deepEqual(base60Zero.bracketEvents, [{
  source: ["SEEKS", "THE"],
  outputs: [108, 102],
  shape: "2,4",
  phrases: ["THE ROAD"],
}]);

// Keep the strongest natural rival visible: base59 one-based has bracket
// accidents but lacks the independent boundary event class.
const base59One = receiverFamily.find((state) =>
  state.radix === "base59" && state.origin === "one"
);
assert.ok(base59One);
assert.equal(base59One.boundaryEvents.length, 0);
assert.equal(base59One.bracketEvents.length, 2);

// -------------------------------------------------------------------------
// Stage 3: split READ / OUT under the independently calibrated p0 receiver.
// Charge all natural radix-pair and common-origin variants.
// -------------------------------------------------------------------------

const splitLookups = {
  READ: {
    token: tableTokens[gp0(READ)],
    base60: numeralValue(tableTokens[gp0(READ)], alphabet60),
    base59: numeralValue(tableTokens[gp0(READ)], alphabet59),
  },
  OUT: {
    token: tableTokens[gp0(OUT)],
    base60: numeralValue(tableTokens[gp0(OUT)], alphabet60),
    base59: numeralValue(tableTokens[gp0(OUT)], alphabet59),
  },
};

assert.deepEqual(splitLookups, {
  READ: {token: "1K", base60: 80, base59: 79},
  OUT: {token: "1g", base60: 102, base59: 100},
});

const spanVariants = [];

for (const readRadix of ["base60", "base59"]) {
  for (const outRadix of ["base60", "base59"]) {
    for (const origin of ["zero", "one"]) {
      const rawStart = splitLookups.READ[readRadix];
      const rawEnd = splitLookups.OUT[outRadix];
      const start = origin === "zero" ? rawStart : rawStart - 1;
      const end = origin === "zero" ? rawEnd : rawEnd - 1;
      const startWord = starts.get(start) || null;
      const endWord = ends.get(end) || null;
      const completeWordSpan =
        startWord !== null &&
        endWord !== null &&
        startWord.word <= endWord.word &&
        p0Words.filter((word) =>
          word.start >= start && word.end <= end
        ).length === endWord.word - startWord.word + 1;

      spanVariants.push({
        readRadix,
        outRadix,
        origin,
        raw: [rawStart, rawEnd],
        span: [start, end],
        startWord: startWord ? startWord.word : null,
        endWord: endWord ? endWord.word : null,
        completeWordSpan,
      });
    }
  }
}

const exactSpans = spanVariants.filter((variant) => variant.completeWordSpan);
assert.deepEqual(exactSpans, [{
  readRadix: "base60",
  outRadix: "base60",
  origin: "zero",
  raw: [80, 102],
  span: [80, 102],
  startWord: 18,
  endWord: 21,
  completeWordSpan: true,
}]);

const selectedSpan = exactSpans[0].span;
assert.equal(selectedSpan[1] - selectedSpan[0] + 1, 23);
const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const center = (selectedSpan[0] + selectedSpan[1]) / 2;
assert.equal(center, 91);
assert.equal(p0.indices[center], 0);

console.log(JSON.stringify({
  status: "PASS",
  wholeReadoutPageSelector: {
    splitCandidates,
    gp0: gp0(READOUT),
    token: readoutToken,
    base60: readout60,
    base59: readout59,
    runeLength: READOUT.length,
    selectedPage,
  },
  independentP0ReceiverCalibration: receiverFamily,
  splitReceiver: {
    lookups: splitLookups,
    chargedVariants: spanVariants,
    exactSpans,
    selectedLength: 23,
    center,
    centerRune: p0.indices[center],
  },
  classification:
    "typed-stage receiver support: post-SHED whole READOUT selects p0 in base59; independently calibrated authenticated-2016 p0 grammar selects base60 zero-based offsets; split READ/OUT uniquely yields the complete-word span80..102",
}, null, 2));
