"use strict";

/**
 * Full original-LP2 predecessor-excluding 28-rank prime-totient cipher gate.
 *
 * The established solved p56 prime-totient stream is applied to the
 * 28 nonrepeating rune-successor choices. Each physical page and clock
 * residue may have its own completely unknown 28-symbol bijection.
 * The repeated-rune sites are treated as reserved markers, not as
 * independently recovered plaintext characters.
 *
 * An original source-specific collision invariant excludes direct
 * GP28 native-English plaintext for these state-static secret-alphabet
 * ciphers under book, page and chapter prime clocks.
 *
 * Node.js 20+ CommonJS; no external packages, CLI args or file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");
assert.equal(corpus.pages.length, 58);
const alphabet = corpus.translit
  .map((name, index) => ({ name: name.toLowerCase(), index }))
  .sort((a, b) => b.name.length - a.name.length);

/**
 * Public GP glyph transliteration. ING is the historically attested NG rune;
 * GP index28 (EA) is reserved as a hypothetical repeated-rune marker and is
 * omitted ONLY from these separate GP28 native controls.
 *
 * @param {string} text
 * @returns {number[]}
 */
function toGP28(text) {
  const source = text.toLowerCase().replace(/v/g, "u")
    .replace(/[kq]/g, "c").replace(/z/g, "s");
  const result = [];
  for (const word of source.match(/[a-z]+/gu) || []) {
    for (let pos = 0; pos < word.length;) {
      if (word.startsWith("ing", pos)) {
        result.push(21);
        pos += 3;
        continue;
      }
      const token = alphabet.find((entry) => word.startsWith(entry.name, pos));
      assert(token, "Unmappable native GP word: " + word.slice(pos));
      if (token.index !== 28) result.push(token.index);
      pos += token.name.length;
    }
  }
  return result;
}
const native = toGP28(shakespeare);
assert.equal(native.length, 216011);
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);

const pages = corpus.pages.slice(0, 56);
const originalRuneCount = pages.reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(originalRuneCount, 12956);
assert.equal(pages.filter((page) => page.indices.length > 0).length, 55);
assert.equal(pages[50].indices.length, 0);

/** @param {number} howMany @returns {number[]} */
function firstPrimes(howMany) {
  const limit = 20 * howMany;
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let i = 2; i * i <= limit; i++) {
    if (!sieve[i]) continue;
    for (let j = i * i; j <= limit; j += i) sieve[j] = 0;
  }
  const result = [];
  for (let i = 2; i <= limit && result.length < howMany; i++) {
    if (sieve[i]) result.push(i);
  }
  assert.equal(result.length, howMany);
  return result;
}
const primeKey = firstPrimes(originalRuneCount).map((p) => (p - 1) % 28);

// Traverse every original physical page in printed order. Key clocks consume
// every rune, including initial IVs and all 86 repeated-rune marker sites.
const rank = [];
const pageForEvent = [];
const clocks = { book: [], page: [], chapter: [] };
const eventMask = pages.map((page) => Array(page.indices.length).fill(false));
let bookCounter = 0;
let chapterCounter = 0;
let repeated = 0;
for (let page = 0; page < 56; page++) {
  if (chapterStarts.has(page)) chapterCounter = 0;
  const symbols = pages[page].indices;
  for (let pos = 0; pos < symbols.length; pos++) {
    const bookPos = bookCounter++;
    const chapterPos = chapterCounter++;
    if (pos === 0) continue;
    const delta = (symbols[pos] - symbols[pos - 1] + 29) % 29;
    if (delta === 0) {
      repeated++;
      continue;
    }
    eventMask[page][pos] = true;
    rank.push(delta - 1); // Exact reversible cyclic predecessor-exclusion rank.
    pageForEvent.push(page);
    clocks.book.push(bookPos);
    clocks.page.push(pos);
    clocks.chapter.push(chapterPos);
  }
}
assert.equal(bookCounter, originalRuneCount);
assert.equal(repeated, 86);
assert.equal(rank.length, 12815);
assert.equal(originalRuneCount, rank.length + repeated + 55);

/**
 * GP28 symbol equality inside each original observable state is invariant
 * under all 28! bijections independently assigned at that state. This
 * includes cyclic and field-power successor orderings, because both are
 * permutations of the 28 nonzero GP29 differences.
 *
 * @param {number[]} input
 * @param {number[]} clock
 * @returns {{numerator:number, denominator:number, groups:number, rate:number}}
 */
function collision(input, clock) {
  assert.equal(input.length, rank.length);
  const count = new Int32Array(56 * 28 * 28);
  const total = new Int32Array(56 * 28);
  let numerator = 0;
  let denominator = 0;
  let groups = 0;
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    assert(Number.isInteger(value) && value >= 0 && value < 28);
    const state = pageForEvent[i] * 28 + primeKey[clock[i]];
    const old = total[state];
    if (!old) groups++;
    numerator += 2 * count[state * 28 + value];
    denominator += 2 * old;
    count[state * 28 + value]++;
    total[state]++;
  }
  return { numerator, denominator, groups, rate: numerator / denominator };
}
const expected = {
  book: [9266, 253376, 661],
  page: [9146, 249240, 715],
  chapter: [9174, 251480, 669],
};

const invert28 = Array.from({ length: 28 }, (_, a) => {
  if (!a) return 0;
  for (let b = 1; b < 28; b++) if ((a * b) % 28 === 1) return b;
  return 0;
});
const units28 = [1, 3, 5, 9, 11, 13, 15, 17, 19, 23, 25, 27];
assert(units28.every((x) => invert28[x] > 0));

const windows = 150;
const stride = Math.floor((native.length - rank.length) / (windows - 1));

for (const [clockName, clock] of Object.entries(clocks)) {
  const source = collision(rank, clock);
  assert.deepEqual(
    [source.numerator, source.denominator, source.groups],
    expected[clockName],
  );

  const controls = [];
  for (let t = 0; t < windows; t++) {
    const start = t * stride;
    const segment = native.slice(start, start + rank.length);
    controls.push(collision(segment, clock).rate);
  }
  controls.sort((a, b) => a - b);
  assert(source.rate < controls[0]);
  assert(controls[0] > 0.058);

  // Positive with an unrelated secret affine alphabet for every page/residue.
  // Slope is always invertible mod28, and the state is independently known
  // at decoding time from the published source layout and prime clock.
  const plain = native.slice(0, rank.length);
  const encodedRanks = [];
  for (let i = 0; i < plain.length; i++) {
    const page = pageForEvent[i];
    const residue = primeKey[clock[i]];
    const slope = units28[(7 * page + 11 * residue) % units28.length];
    const offset = (13 * page + 5 * residue + 1) % 28;
    const c = (plain[i] * slope + offset) % 28;
    encodedRanks.push(c);
    const recovered = ((c - offset + 28) * invert28[slope]) % 28;
    assert.equal(recovered, plain[i]);
  }
  assert.deepEqual(collision(encodedRanks, clock), collision(plain, clock));

  // Restore every original page IV and every repeated-rune marker, emit
  // all 12,815 encrypted successor ranks and independently invert them.
  let event = 0;
  let markers = 0;
  const recoveredPlain = [];
  for (let page = 0; page < 56; page++) {
    const original = pages[page].indices;
    if (!original.length) continue;
    const rebuilt = [original[0]];
    for (let pos = 1; pos < original.length; pos++) {
      const previous = rebuilt.at(-1);
      if (!eventMask[page][pos]) {
        rebuilt.push(previous);
        markers++;
      } else {
        const next = (previous + 1 + encodedRanks[event]) % 29;
        assert.notEqual(next, previous);
        rebuilt.push(next);
        const observedRank = (next - previous + 29) % 29 - 1;
        const residue = primeKey[clock[event]];
        const slope = units28[(7 * page + 11 * residue) % units28.length];
        const offset = (13 * page + 5 * residue + 1) % 28;
        recoveredPlain.push(
          ((observedRank - offset + 28) * invert28[slope]) % 28,
        );
        event++;
      }
    }
    assert.equal(rebuilt.length, original.length);
  }
  assert.equal(event, rank.length);
  assert.equal(markers, 86);
  assert.deepEqual(recoveredPlain, plain);

  console.log(JSON.stringify({
    clock: clockName,
    original: source,
    native_windows: windows,
    native_min: controls[0],
    native_median: controls[Math.floor(windows / 2)],
    native_max: controls.at(-1),
    native_at_or_below_original: controls.filter((r) => r <= source.rate).length,
    planted_cipher_runes: originalRuneCount,
    planted_nonrepeat_rank_inverse_exact: event === plain.length,
    planted_marker_sites_retained: markers,
    planted_statewise_28_alphabet_collision_invariant: true,
  }));
}

/**
 * Solved p56 has a historically verified literal-F rune that does not consume
 * its next prime key. For the proposed GP28 transport, explicitly grant
 * the 86 original doublet sites the same nonconsuming-key semantics. Also
 * allow the 55 page-initial cipher runes to be transmitted IVs rather than
 * content and hence not consume prime keys. This is a different, source-
 * motivated clock architecture from the initial all-runes-consuming case.
 *
 * All 28! independent per-page/per-prime state permutations remain free.
 * @param {boolean} skipIV
 * @param {boolean} skipMarker
 * @returns {{book:number[],page:number[],chapter:number[]}}
 */
function skippedClocks(skipIV, skipMarker) {
  const alternative = { book: [], page: [], chapter: [] };
  let bookClock = 0;
  let chapterClock = 0;
  const recoveredSourceRanks = [];
  for (let page = 0; page < 56; page++) {
    if (chapterStarts.has(page)) chapterClock = 0;
    const symbols = pages[page].indices;
    let pageClock = 0;
    for (let pos = 0; pos < symbols.length; pos++) {
      if (pos === 0) {
        if (!skipIV) { bookClock++; chapterClock++; pageClock++; }
        continue;
      }
      const difference = (symbols[pos] - symbols[pos - 1] + 29) % 29;
      if (difference === 0) {
        if (!skipMarker) { bookClock++; chapterClock++; pageClock++; }
        continue;
      }
      recoveredSourceRanks.push(difference - 1);
      alternative.book.push(bookClock);
      alternative.page.push(pageClock);
      alternative.chapter.push(chapterClock);
      bookClock++;
      pageClock++;
      chapterClock++;
    }
  }
  assert.deepEqual(recoveredSourceRanks, rank);
  return alternative;
}

const skipPolicies = [
  { name: "literal-doublet-skips-prime", skipIV: false, skipMarker: true },
  { name: "both-literal-doublet-and-IV-skip-prime", skipIV: true, skipMarker: true },
  { name: "only-IV-skips-prime", skipIV: true, skipMarker: false },
];
const skipExpected = {
  "literal-doublet-skips-prime": {
    book: [8736, 253764],
    page: [9098, 249144],
    chapter: [9190, 251422],
  },
  "both-literal-doublet-and-IV-skip-prime": {
    book: [9112, 253486],
    page: [9010, 247000],
    chapter: [9142, 251084],
  },
  "only-IV-skips-prime": {
    book: [9028, 253344],
    page: [8842, 247194],
    chapter: [8950, 251088],
  },
};

for (const policy of skipPolicies) {
  const alternative = skippedClocks(policy.skipIV, policy.skipMarker);
  for (const [clockName, clock] of Object.entries(alternative)) {
    const source = collision(rank, clock);
    assert.deepEqual(
      [source.numerator, source.denominator],
      skipExpected[policy.name][clockName],
    );
    const controls = [];
    for (let t = 0; t < windows; t++) {
      const start = t * stride;
      controls.push(collision(native.slice(start, start + rank.length), clock).rate);
    }
    controls.sort((a, b) => a - b);
    assert(controls[0] > 0.058);
    assert(source.rate < controls[0]);

    const plain = native.slice(0, rank.length);
    const encodedRanks = [];
    const recoveredPlain = [];
    for (let i = 0; i < plain.length; i++) {
      const page = pageForEvent[i];
      const residue = primeKey[clock[i]];
      const slope = units28[(7 * page + 11 * residue) % units28.length];
      const offset = (13 * page + 5 * residue + 1) % 28;
      const encrypted = (plain[i] * slope + offset) % 28;
      encodedRanks.push(encrypted);
      recoveredPlain.push(((encrypted - offset + 28) * invert28[slope]) % 28);
    }
    assert.deepEqual(recoveredPlain, plain);
    assert.deepEqual(collision(encodedRanks, clock), collision(plain, clock));
    let event = 0;
    let literalMarkers = 0;
    for (let page = 0; page < 56; page++) {
      const old = pages[page].indices;
      if (!old.length) continue;
      let c = old[0]; // Source-shaped page IV, unchanged.
      for (let pos = 1; pos < old.length; pos++) {
        if (eventMask[page][pos]) {
          const next = (c + encodedRanks[event] + 1) % 29;
          assert.notEqual(next, c);
          const recoveredRank = (next - c + 29) % 29 - 1;
          assert.equal(recoveredRank, encodedRanks[event]);
          c = next;
          event++;
        } else {
          literalMarkers++; // Literal doublet, never a GP28 content symbol.
        }
      }
    }
    assert.equal(event, rank.length);
    assert.equal(literalMarkers, 86);
    console.log(JSON.stringify({
      clock_policy: policy.name,
      clock: clockName,
      original: source,
      native_windows: windows,
      native_min: controls[0],
      native_median: controls[Math.floor(windows / 2)],
      native_at_or_below_original: 0,
      planted_all_12815_content_ranks_recovered: true,
      planted_86_literal_markers_preserved: true,
    }));
  }
}


/**
 * Challenge the English-register premise with distinct historically relevant
 * native corpora: Latin (the book's title/register), corrected Anglo-Saxon
 * Beowulf (the rune tradition), and two independently published English
 * registers. These add no ciphertext-fitted key, algorithm, or phase.
 */
const base29Latin = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinWords = read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter((line) => /^[0-9A-S]+$/u.test(line));
const latinSource = [...latinWords.join("")].map((ch) => base29Latin.indexOf(ch))
  .filter((value) => value !== 28);
assert.equal(latinSource.length, 204511);
const beowulfProfile = JSON.parse(
  read("resources/control/beowulf_oe_gp_profile_corrected.json"),
);
assert.equal(beowulfProfile.allSourceGpRunes, 48012);
const beowulfSource = [...beowulfProfile.sourceGpBase29]
  .map((ch) => beowulfProfile.positiveControlAlphabet.indexOf(ch))
  .filter((value) => value !== 28);
assert.equal(beowulfSource.length, 46976);
const gibranSource = toGP28(read("resources/control/gibran_prophet_58585.txt"));
const emersonSource = toGP28(read("resources/control/emerson_essays_2944.txt"));
assert.equal(gibranSource.length, 62090);
assert.equal(emersonSource.length, 320859);

for (const [sourceName, sourceControl] of Object.entries({
  latinVulgate: latinSource,
  oldEnglishBeowulf: beowulfSource,
  gibran: gibranSource,
  emerson: emersonSource,
})) {
  const count = sourceName === "oldEnglishBeowulf" ? 40 :
    sourceName === "gibran" ? 80 : 150;
  const sourceStride = Math.floor((sourceControl.length - rank.length) / (count - 1));
  for (const [clockName, clock] of Object.entries(clocks)) {
    const observed = collision(rank, clock);
    const rates = [];
    for (let t = 0; t < count; t++) {
      const start = t * sourceStride;
      rates.push(collision(
        sourceControl.slice(start, start + rank.length),
        clock,
      ).rate);
    }
    rates.sort((a, b) => a - b);
    assert(observed.rate < rates[0]);
    console.log(JSON.stringify({
      source: sourceName,
      clock: clockName,
      native_Gp28_symbols: sourceControl.length,
      windows: count,
      original_Q: observed.rate,
      native_min: rates[0],
      native_median: rates[Math.floor(count / 2)],
      native_at_or_below_original: rates.filter((q) => q <= observed.rate).length,
    }));
  }
}

console.log("No unknown LP2 plaintext or historical cipher key recovered.");
