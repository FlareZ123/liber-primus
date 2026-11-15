"use strict";

/*
 * One frozen global context-adaptive arithmetic / constrained-rune codec.
 *
 * Model:
 *   - Order-2 GP29 PPM counts, with a 29-symbol add-one prior.
 *   - Seed counts from five solved LP1 sections only.
 *   - Counts adapt online as symbols are encoded/decoded.
 *   - Context resets at each original printed word; counts persist across words.
 *
 * Output codebook:
 *   - Preserve every page length and every printed word length.
 *   - Each page head has 29 choices; each within-page transition either
 *     repeats its predecessor (one choice) or selects one of 28 alternatives.
 *   - The whole manuscript has at most 86 repeated transitions, globally.
 *   - Rank order: repeat count, lexicographic repeat mask, then mixed-radix
 *     page-head / nonrepeat symbols.
 *   - The 86-repeat budget is the explicit escape channel; page/word boundaries
 *     are public and preserved, not silently reconstructed.
 *
 * Arithmetic packet:
 *   - Compute one exact rational arithmetic interval for the entire block.
 *   - Canonical code is the smallest equal-width global codebook bin wholly
 *     contained in that interval.
 *   - Decoding uses the bin midpoint and must reproduce the exact canonical
 *     rank. A reversible but noncanonical decode is rejected.
 *
 * This is a deliberately narrow hypothesis, not an author attribution.
 * Reproduce with:
 *   node sims/lp2_context_adaptive_global_rank_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const stage10 = JSON.parse(read("resources/external/cicada2014-onion6-magic-form-and-response.json"));
const runicToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const BOS = 29;
const CONTEXTS = 30 * 30;
const ALPHABET = 29;
const MAX_REPEATS = 86;
const ORIGINAL_TRANSITIONS = 12901;
const ORIGINAL_RUNE_COUNT = 12956;
const ORIGINAL_PAGE_COUNT = 55;

function runeWords(text) {
  return (text.match(/[\u16A0-\u16FF]+/gu) || []).map((word) => {
    const out = [];
    for (const rune of word) {
      const index = runicToIndex.get(rune);
      assert(Number.isInteger(index), "unmapped source rune " + rune);
      out.push(index);
    }
    return out;
  });
}

function flatten(pages) {
  return pages.flat();
}

function newModel() {
  return Array.from({length: CONTEXTS}, () => new Uint32Array(ALPHABET));
}

function cloneModel(model) {
  return model.map((row) => new Uint32Array(row));
}

function contextIndex(prev2, prev1) {
  return prev2 * 30 + prev1;
}

function trainOneWord(model, word) {
  let prev2 = BOS;
  let prev1 = BOS;
  for (const symbol of word) {
    model[contextIndex(prev2, prev1)][symbol]++;
    prev2 = prev1;
    prev1 = symbol;
  }
}

function trainModel(words) {
  const model = newModel();
  for (const word of words) trainOneWord(model, word);
  return model;
}

function ceilDiv(a, b) {
  assert(b > 0n);
  return (a + b - 1n) / b;
}

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i++) {
    value = value * BigInt(n - k + i) / BigInt(i);
  }
  return value;
}

function makeBook(pageLengths, repeatLimit) {
  const pageCount = pageLengths.length;
  const transitions = pageLengths.reduce((sum, n) => sum + n - 1, 0);
  assert(pageCount > 0 && pageLengths.every((n) => n > 0));
  assert(repeatLimit >= 0 && repeatLimit <= transitions);

  const pow29 = 29n ** BigInt(pageCount);
  let pow28 = 28n ** BigInt(transitions);
  const blocks = [];
  let total = 0n;
  for (let repeats = 0; repeats <= repeatLimit; repeats++) {
    if (repeats > 0) pow28 /= 28n;
    const combinations = choose(transitions, repeats);
    const sequenceCount = pow29 * pow28;
    const blockCount = combinations * sequenceCount;
    blocks.push({repeats, combinations, sequenceCount, blockCount});
    total += blockCount;
  }
  return {pageCount, transitions, repeatLimit, blocks, total};
}

/*
 * Lexicographic combinadic rank/unrank. The recurrence updates C(m,r) as m
 * decreases, avoiding a fresh O(r) binomial calculation for every skipped site.
 */
function rankCombination(n, positions) {
  const k = positions.length;
  let rank = 0n;
  let next = 0;
  for (let i = 0; i < k; i++) {
    const remaining = k - i - 1;
    let m = n - next - 1;
    let count = choose(m, remaining);
    for (let candidate = next; candidate < positions[i]; candidate++) {
      rank += count;
      if (m > remaining) {
        count = count * BigInt(m - remaining) / BigInt(m);
      } else {
        count = 0n;
      }
      m--;
    }
    next = positions[i] + 1;
  }
  return rank;
}

function unrankCombination(n, k, rank) {
  assert(rank >= 0n && rank < choose(n, k));
  const positions = [];
  let next = 0;
  for (let i = 0; i < k; i++) {
    const remaining = k - i - 1;
    let m = n - next - 1;
    let count = choose(m, remaining);
    let selected = false;
    for (let candidate = next; candidate <= n - (k - i); candidate++) {
      if (rank < count) {
        positions.push(candidate);
        next = candidate + 1;
        selected = true;
        break;
      }
      rank -= count;
      if (m > remaining) {
        count = count * BigInt(m - remaining) / BigInt(m);
      } else {
        count = 0n;
      }
      m--;
    }
    assert(selected, "combinadic unrank exhausted candidates");
  }
  assert.equal(rank, 0n);
  return positions;
}

function rankGlobal(pages, repeatLimit) {
  const pageLengths = pages.map((p) => p.length);
  const book = makeBook(pageLengths, repeatLimit);
  const repeatPositions = [];
  let transition = 0;
  let sequenceRank = 0n;

  for (const page of pages) {
    assert(page.length > 0);
    sequenceRank = sequenceRank * 29n + BigInt(page[0]);
    for (let i = 1; i < page.length; i++) {
      const previous = page[i - 1];
      const current = page[i];
      if (current === previous) {
        repeatPositions.push(transition);
      } else {
        const digit = current < previous ? current : current - 1;
        sequenceRank = sequenceRank * 28n + BigInt(digit);
      }
      transition++;
    }
  }

  const repeats = repeatPositions.length;
  if (repeats > repeatLimit) return null;
  const block = book.blocks[repeats];
  assert(sequenceRank < block.sequenceCount);
  const maskRank = rankCombination(book.transitions, repeatPositions);
  let offset = 0n;
  for (let r = 0; r < repeats; r++) offset += book.blocks[r].blockCount;
  const rank = offset + maskRank * block.sequenceCount + sequenceRank;
  assert(rank >= 0n && rank < book.total);
  return {rank, book, repeats, repeatPositions, maskRank, sequenceRank};
}

function unrankGlobal(pageLengths, repeatLimit, rank) {
  const book = makeBook(pageLengths, repeatLimit);
  assert(rank >= 0n && rank < book.total);

  let remainder = rank;
  let chosen = null;
  let offset = 0n;
  for (const block of book.blocks) {
    if (remainder < block.blockCount) {
      chosen = block;
      break;
    }
    remainder -= block.blockCount;
    offset += block.blockCount;
  }
  assert(chosen);
  const maskRank = remainder / chosen.sequenceCount;
  let sequenceRank = remainder % chosen.sequenceCount;
  const repeatPositions = unrankCombination(
    book.transitions, chosen.repeats, maskRank);
  const repeatSet = new Set(repeatPositions);

  const radices = [];
  for (let p = 0; p < pageLengths.length; p++) {
    radices.push(29);
    for (let i = 1; i < pageLengths[p]; i++) {
      const globalTransition = pageLengths.slice(0, p)
        .reduce((sum, n) => sum + n - 1, 0) + i - 1;
      if (!repeatSet.has(globalTransition)) radices.push(28);
    }
  }

  const digits = new Array(radices.length);
  for (let i = radices.length - 1; i >= 0; i--) {
    const radix = BigInt(radices[i]);
    digits[i] = Number(sequenceRank % radix);
    sequenceRank /= radix;
  }
  assert.equal(sequenceRank, 0n);

  const pages = [];
  let digitIndex = 0;
  let globalTransition = 0;
  for (const length of pageLengths) {
    const page = [digits[digitIndex++]];
    for (let i = 1; i < length; i++) {
      if (repeatSet.has(globalTransition)) {
        page.push(page[page.length - 1]);
      } else {
        const digit = digits[digitIndex++];
        const previous = page[page.length - 1];
        page.push(digit >= previous ? digit + 1 : digit);
      }
      globalTransition++;
    }
    pages.push(page);
  }
  assert.equal(digitIndex, digits.length);
  assert.equal(globalTransition, book.transitions);
  const check = rankGlobal(pages, repeatLimit);
  assert(check && check.rank === rank);
  return pages;
}

function intervalForWords(words, model) {
  let lo = 0n;
  let hi = 1n;
  let den = 1n;
  let symbolCount = 0;

  for (const word of words) {
    let prev2 = BOS;
    let prev1 = BOS;
    for (const symbol of word) {
      const row = model[contextIndex(prev2, prev1)];
      let total = ALPHABET;
      let prefix = 0;
      for (let i = 0; i < ALPHABET; i++) {
        total += row[i];
        if (i < symbol) prefix += row[i];
      }
      const T = BigInt(total);
      const cumulative = BigInt(symbol + prefix);
      const frequency = BigInt(row[symbol] + 1);
      const span = hi - lo;
      const nextLo = lo * T + span * cumulative;
      const nextHi = lo * T + span * (cumulative + frequency);
      den *= T;
      lo = nextLo;
      hi = nextHi;
      row[symbol]++;
      prev2 = prev1;
      prev1 = symbol;
      symbolCount++;
    }
  }
  return {lo, hi, den, symbolCount};
}

function decodeFromCodePages(codePages, wordLengths, modelSeed, repeatLimit) {
  const ranked = rankGlobal(codePages, repeatLimit);
  if (!ranked) return {ok: false, reason: "repeat-budget-exceeded"};
  const book = ranked.book;
  const rank = ranked.rank;
  const M = book.total;
  const xNumerator = 2n * rank + 1n;
  const xDenominator = 2n * M;

  const model = cloneModel(modelSeed);
  let lo = 0n;
  let hi = 1n;
  let den = 1n;
  const decodedWords = [];
  let symbolCount = 0;

  for (const length of wordLengths) {
    let prev2 = BOS;
    let prev1 = BOS;
    const word = [];
    for (let position = 0; position < length; position++) {
      const row = model[contextIndex(prev2, prev1)];
      let total = ALPHABET;
      for (let i = 0; i < ALPHABET; i++) total += row[i];
      const T = BigInt(total);
      const span = hi - lo;
      const delta = xNumerator * den - xDenominator * lo;
      if (delta < 0n || span <= 0n) {
        return {ok: false, reason: "arithmetic-point-outside-interval",
          decodedWords, rank, book};
      }
      const target = delta * T / (xDenominator * span);
      let prefix = 0;
      let selected = -1;
      for (let symbol = 0; symbol < ALPHABET; symbol++) {
        const frequency = row[symbol] + 1;
        if (target < BigInt(prefix + frequency)) {
          selected = symbol;
          break;
        }
        prefix += frequency;
      }
      if (selected < 0) {
        return {ok: false, reason: "no-symbol-for-arithmetic-point",
          decodedWords, rank, book};
      }

      const cumulative = BigInt(prefix);
      const frequency = BigInt(row[selected] + 1);
      const nextLo = lo * T + span * cumulative;
      const nextHi = nextLo + span * frequency;
      den *= T;
      lo = nextLo;
      hi = nextHi;
      row[selected]++;
      word.push(selected);
      prev2 = prev1;
      prev1 = selected;
      symbolCount++;
    }
    decodedWords.push(word);
  }

  const canonicalRank = ceilDiv(lo * M, den);
  const wholeBinFits = (rank + 1n) * den <= hi * M;
  const ok = canonicalRank === rank && wholeBinFits;
  return {
    ok, reason: ok ? null : "decoded-but-not-canonical",
    rank, canonicalRank, wholeBinFits, book, decodedWords, symbolCount,
    intervalBits: log2BigInt(den) - log2BigInt(hi - lo),
    codebookBits: log2BigInt(M)
  };
}

function encodeBlock(words, pageLengths, modelSeed, repeatLimit) {
  const model = cloneModel(modelSeed);
  const interval = intervalForWords(words, model);
  const book = makeBook(pageLengths, repeatLimit);
  const rank = ceilDiv(interval.lo * book.total, interval.den);
  const fits = rank < book.total &&
    (rank + 1n) * interval.den <= interval.hi * book.total;
  if (!fits) {
    return {
      ok: false, reason: "no-full-codebook-bin-inside-plaintext-interval",
      intervalBits: log2BigInt(interval.den) - log2BigInt(interval.hi - interval.lo),
      codebookBits: log2BigInt(book.total), symbolCount: interval.symbolCount
    };
  }

  const codePages = unrankGlobal(pageLengths, repeatLimit, rank);
  const ranked = rankGlobal(codePages, repeatLimit);
  assert(ranked && ranked.rank === rank);
  const decoded = decodeFromCodePages(
    codePages, words.map((word) => word.length), modelSeed, repeatLimit);
  const exact = decoded.ok && decoded.decodedWords.length === words.length &&
    decoded.decodedWords.every((word, i) =>
      word.length === words[i].length &&
      word.every((symbol, j) => symbol === words[i][j]));
  return {
    ok: exact, reason: exact ? null : (decoded.reason || "roundtrip-mismatch"),
    rank, book, codePages, decoded,
    intervalBits: log2BigInt(interval.den) - log2BigInt(interval.hi - interval.lo),
    codebookBits: log2BigInt(book.total),
    slackBits: log2BigInt(book.total) -
      (log2BigInt(interval.den) - log2BigInt(interval.hi - interval.lo)),
    symbolCount: interval.symbolCount
  };
}

function log2BigInt(value) {
  assert(value > 0n);
  const bits = value.toString(2);
  const head = bits.slice(0, 53);
  const mantissa = Number.parseInt(head, 2) / Math.pow(2, head.length - 1);
  return bits.length - 1 + Math.log2(mantissa);
}

function equalWords(a, b) {
  return a.length === b.length && a.every((word, i) =>
    word.length === b[i].length &&
    word.every((symbol, j) => symbol === b[i][j]));
}

function wordStats(words) {
  let runes = 0;
  let adjacent = 0;
  let lag5 = 0;
  let lag5Sites = 0;
  const repeatWords = [0, 0, 0, 0];
  for (const word of words) {
    runes += word.length;
    let repeats = 0;
    for (let i = 1; i < word.length; i++) {
      if (word[i] === word[i - 1]) {
        adjacent++;
        repeats++;
      }
    }
    repeatWords[Math.min(repeats, 3)]++;
    for (let i = 5; i < word.length; i++) {
      lag5Sites++;
      if (word[i] === word[i - 5]) lag5++;
    }
  }
  return {words: words.length, runes, adjacent, lag5, lag5Sites, repeatWords};
}

function pageTransitionStats(pages) {
  let transitions = 0;
  let adjacent = 0;
  for (const page of pages) {
    for (let i = 1; i < page.length; i++) {
      transitions++;
      if (page[i] === page[i - 1]) adjacent++;
    }
  }
  return {pages: pages.length, runes: pages.reduce((s, p) => s + p.length, 0),
    transitions, adjacent};
}

function englishToGP(word) {
  let text = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/Q/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/ING/g, "NG")
    .replace(/IO/g, "IA");
  const tokens = gp.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    const found = tokens.find((item) => text.startsWith(item.token, i));
    if (!found) return null;
    out.push(found.index);
    i += found.token.length;
  }
  return out;
}

function toText(word) {
  return word.map((symbol) => gp.translit[symbol]).join("");
}

function lexicalStats(words, dictionary) {
  let matches = 0;
  for (const word of words) {
    if (dictionary.has(word.join(","))) matches++;
  }
  return {matches, total: words.length,
    fraction: words.length ? matches / words.length : 0};
}

function controlBudget(pageLengths) {
  const transitions = pageLengths.reduce((sum, n) => sum + n - 1, 0);
  return Math.floor(transitions * MAX_REPEATS / ORIGINAL_TRANSITIONS);
}

// --- Frozen public training model: five solved LP1 sections only.
const trainingNames = new Set([
  "0_warning", "0_welcome", "0_wisdom", "0_koan_1", "0_loss_of_divinity"
]);
const trainingSections = solved.sections.filter((section) =>
  trainingNames.has(section.name));
assert.equal(trainingSections.length, 5);
const trainingWords = trainingSections.flatMap((section) =>
  runeWords(section.source_text));
assert(trainingWords.length > 100);
const seedModel = trainModel(trainingWords);

// Held-out solved LP1 segments are kept separate from the training model.
const heldSections = solved.sections.filter((section) =>
  section.name === "jpg107-167" || section.name === "jpg229");
const heldPages = heldSections.map((section) =>
  flatten(runeWords(section.source_text)));
const heldWords = heldSections.flatMap((section) =>
  runeWords(section.source_text));

// The 2014 Stage-10 Cicada message is PGP-signed inside the archived source HTML.
const signedHtml = stage10.files.find((file) =>
  file.archived_path.endsWith("/post/index.html")).raw_html;
const signedMatch = signedHtml.match(
  /-----BEGIN PGP SIGNED MESSAGE-----\s*([\s\S]*?)-----BEGIN PGP SIGNATURE-----/);
assert(signedMatch, "missing signed 2014 message body");
const signedLines = signedMatch[1].split(/\r?\n/).slice(1); // omit "Hash: SHA1"
const signedBody = signedLines.join(" ").replace(/\b3301\b/g, " ");
const signedTokens = signedBody.match(/[A-Za-z]+/g) || [];
const cicada2014Words = signedTokens.map(englishToGP);
assert(cicada2014Words.every(Boolean), "2014 signed prose has unhandled spelling");
assert(cicada2014Words.length >= 25);

// Solved LP2 terminal controls, excluded from the LP1 training model.
const p56Words = runeWords(
  solved.sections.find((section) => section.name === "p56_an_end").source_text);
const p57Words = runeWords(
  solved.sections.find((section) => section.name === "p57_parable").source_text);

// Wrong-model control: a public Latin Vulgate GP29 corpus, not English Cicada prose.
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/)
  .map((line) => line.trim().toUpperCase())
  .filter((line) => /^[0-9A-S]+$/.test(line))
  .map((line) => [...line].map((character) =>
    character >= "0" && character <= "9"
      ? character.charCodeAt(0) - 48
      : character.charCodeAt(0) - 65 + 10));
assert(latinWords.length > 1000);
const latinModel = trainModel(latinWords);

// Independent generic English lexicon used only for diagnostic word coverage.
const dictionary = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const token = line.trim().split(/\s+/)[0];
  if (!token || token.startsWith(";")) continue;
  const encoded = englishToGP(token);
  if (encoded) dictionary.add(encoded.join(","));
}

// --- Original 55-page LP2 source and its exact word register.
const parsed = parseSharedCorpus();
const originalPages = gp.pages
  .filter((page) => page.page <= 55 && page.indices.length)
  .sort((a, b) => a.page - b.page)
  .map((page) => page.indices.slice());
const originalWords = parsed.words.map((word) =>
  [...word.runes].map((rune) => runicToIndex.get(rune)));
const originalPageStats = pageTransitionStats(originalPages);
const originalWordStats = wordStats(originalWords);
assert.equal(originalPages.length, ORIGINAL_PAGE_COUNT);
assert.equal(originalPageStats.runes, ORIGINAL_RUNE_COUNT);
assert.equal(originalPageStats.transitions, ORIGINAL_TRANSITIONS);
assert.equal(originalPageStats.adjacent, 86);
assert.equal(originalWordStats.words, 2896);
assert.equal(originalWordStats.runes, ORIGINAL_RUNE_COUNT);
assert.equal(originalWordStats.adjacent, 86);
assert.equal(originalWordStats.lag5, 104);
assert.equal(originalWordStats.lag5Sites, 2105);
assert.deepEqual(originalWordStats.repeatWords.slice(0, 3), [2834, 61, 1]);
assert.deepEqual(flatten(originalPages), flatten(originalWords));

const originalPageLengths = originalPages.map((page) => page.length);
const originalBook = makeBook(originalPageLengths, MAX_REPEATS);
const originalRanked = rankGlobal(originalPages, MAX_REPEATS);
assert(originalRanked && originalRanked.repeats === 86);
const originalUnranked = unrankGlobal(
  originalPageLengths, MAX_REPEATS, originalRanked.rank);
assert.deepEqual(originalUnranked, originalPages);

// Native control runner: one fixed model, one rate rule, no per-control tuning.
function runControl(name, words, pages) {
  const pageLengths = pages.map((page) => page.length);
  const K = controlBudget(pageLengths);
  const encoded = encodeBlock(words, pageLengths, seedModel, K);
  const result = {
    name, words: words.length, runes: words.reduce((s, w) => s + w.length, 0),
    pages: pageLengths.length, pageLengths, repeatLimit: K,
    encoder_ok: encoded.ok, encoder_reason: encoded.reason,
    interval_bits: encoded.intervalBits,
    codebook_bits: encoded.codebookBits,
    slack_bits: encoded.slackBits
  };
  if (encoded.codePages) {
    result.planted_exact_roundtrip = encoded.ok;
    result.code_repeat_count = rankGlobal(encoded.codePages, K).repeats;
    result.decoded_lexicon = lexicalStats(encoded.decoded.decodedWords, dictionary);
    result.preview = encoded.decoded.decodedWords.slice(0, 12).map(toText);
    result.codePages = encoded.codePages;
    result.rank = encoded.rank;
  }
  return {result, encoded};
}

const heldControl = runControl("held-out LP1 sections jpg107-167 + jpg229",
  heldWords, heldPages);
const cicada2014Control = runControl("2014 PGP-signed Cicada Stage-10 prose",
  cicada2014Words, [flatten(cicada2014Words)]);
const p56Control = runControl("solved LP2 p56 AN END plaintext",
  p56Words, [flatten(p56Words)]);
const p57Control = runControl("solved LP2 p57 PARABLE plaintext",
  p57Words, [flatten(p57Words)]);

// A mismatched, independently sourced model must not silently decode the same
// 2014 planted codeword as the LP1-seeded model.
let wrongModelResult = null;
if (cicada2014Control.encoded.codePages) {
  const wrong = decodeFromCodePages(
    cicada2014Control.encoded.codePages,
    cicada2014Words.map((word) => word.length),
    latinModel,
    controlBudget([flatten(cicada2014Words).length]));
  wrongModelResult = {
    ok: wrong.ok, reason: wrong.reason,
    exact_plaintext_match: wrong.ok &&
      equalWords(wrong.decodedWords, cicada2014Words),
    preview: (wrong.decodedWords || []).slice(0, 8).map(toText)
  };
}

// --- One frozen attempt on the untouched full original block.
// The first 158 words are p0-2; p3-7 are reported separately as a blind segment.
const originalDecode = decodeFromCodePages(
  originalPages, originalWords.map((word) => word.length),
  seedModel, MAX_REPEATS);
const p02Indices = originalWords
  .map((word, i) => ({word, i, page: parsed.words[i].startPage}))
  .filter((item) => item.page <= 2)
  .map((item) => item.i);
const p37Indices = originalWords
  .map((word, i) => ({word, i, page: parsed.words[i].startPage}))
  .filter((item) => item.page >= 3 && item.page <= 7)
  .map((item) => item.i);

let originalCandidate = null;
if (originalDecode.decodedWords) {
  const p02Words = p02Indices.map((i) => originalDecode.decodedWords[i]);
  const p37Words = p37Indices.map((i) => originalDecode.decodedWords[i]);
  originalCandidate = {
    p0_2_words: p02Words.length,
    p0_2_runes: p02Words.reduce((s, w) => s + w.length, 0),
    p0_2_lexicon: lexicalStats(p02Words, dictionary),
    p0_2_preview: p02Words.slice(0, 30).map(toText),
    p3_7_words: p37Words.length,
    p3_7_runes: p37Words.reduce((s, w) => s + w.length, 0),
    p3_7_lexicon: lexicalStats(p37Words, dictionary),
    p3_7_preview: p37Words.slice(0, 20).map(toText)
  };
}

const report = {
  model: {
    family: "order-2 adaptive GP29 PPM arithmetic coder",
    contexts: CONTEXTS,
    counters: CONTEXTS * ALPHABET,
    counter_bytes: CONTEXTS * ALPHABET * 4,
    smoothing: "add-one per GP29 symbol",
    training_sections: [...trainingNames],
    training_words: trainingWords.length,
    training_runes: trainingWords.reduce((s, w) => s + w.length, 0),
    update_rule: "increment selected context/symbol after every symbol",
    reset_rule: "reset two-symbol context at each printed word; retain counts",
    canonical_packet: "smallest whole global codebook bin contained in exact arithmetic interval",
    no_hidden_key_or_fitted_parameter: true
  },
  codebook: {
    order: "repeat count; lexicographic repeat mask; mixed-radix page heads and nonrepeat successors",
    repeat_limit_original: MAX_REPEATS,
    original_page_heads: ORIGINAL_PAGE_COUNT,
    original_transitions: ORIGINAL_TRANSITIONS,
    original_repeat_positions: originalRanked.repeatPositions.length,
    original_codebook_bits: log2BigInt(originalBook.total),
    unrestricted_gp29_bits: ORIGINAL_RUNE_COUNT * Math.log2(29),
    capacity_deficit_bits: ORIGINAL_RUNE_COUNT * Math.log2(29) -
      log2BigInt(originalBook.total),
    explicit_escape: "at most 86 repeated transitions globally; no uncounted sidecar",
    public_boundaries: "55 page starts and all 2,896 printed word boundaries/lengths"
  },
  original_source_statistics: {
    pages: originalPageStats,
    words: originalWordStats,
    lag5_rate: originalWordStats.lag5 / originalWordStats.lag5Sites
  },
  controls: {
    held_out_lp1: heldControl.result,
    cicada_2014_signed_prose: cicada2014Control.result,
    solved_lp2_p56: p56Control.result,
    solved_lp2_p57: p57Control.result,
    wrong_latin_model_on_2014_codeword: wrongModelResult
  },
  original_attempt: {
    canonical: originalDecode.ok,
    reason: originalDecode.reason,
    rank_bits: log2BigInt(originalRanked.rank + 1n),
    codebook_bits: log2BigInt(originalBook.total),
    canonical_rank_matches: originalDecode.canonicalRank === originalRanked.rank,
    whole_bin_fits: originalDecode.wholeBinFits,
    decoded_words: originalDecode.decodedWords?.length || 0,
    decoded_runes: originalDecode.symbolCount || 0,
    decoded_interval_bits: originalDecode.intervalBits,
    candidate_is_diagnostic_only_unless_canonical: true,
    candidate: originalCandidate
  },
  interpretation: [
    "A positive planted round trip validates the implementation, not the historical use of this codec.",
    "The original is compatible only if its exact global rank is the canonical arithmetic packet under the frozen LP1 model.",
    "A noncanonical decode is not recovered plaintext, even if isolated output words look English.",
    "The 86-repeat escape budget is global and exact; the original 104/2105 within-word lag-five echoes are measured but not separately encoded."
  ]
};

console.log(JSON.stringify(report, null, 2));
