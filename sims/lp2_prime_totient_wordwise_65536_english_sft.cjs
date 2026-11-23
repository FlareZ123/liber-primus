"use strict";

/**
 * Source-authentic p56 prime-totient GP29, independently restarted at EVERY
 * original unknown LP2 complete word. Test all 65,536 starting prime indices
 * and both arithmetic signs against source-native English dictionary entries.
 *
 * Windows 11 / Node.js 22 SFT:
 *   node sims/lp2_prime_totient_wordwise_65536_english_sft.cjs
 *
 * Read-only. All inputs are repository files; no package installation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const MAX_START = 65536;
const MIN_LEN = 8;
const MAX_LEN = 14;
const HASH_LEN = 6;
const symbols = gp.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const nativeRuneWord = new RegExp("[" + gp.runes.join("") + "]+", "gu");

/** @param {string} word @returns {number[] | null} */
function nativeEnglish(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) {
      output.push(21);
      i += 3;
    } else if (text.startsWith("IO", i)) {
      output.push(27);
      i += 2;
    } else {
      const item = symbols.find((s) => text.startsWith(s.text, i));
      if (!item) return null;
      output.push(item.index);
      i += item.text.length;
    }
  }
  return output;
}

function originalWords() {
  const unknown = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
  assert.equal(unknown.length, 55);
  const runes = read("resources/lp2-transcription.txt")
    .split("%").slice(0, 55).join("").replace(/[/\s%$]/g, "");
  const words = (runes.match(nativeRuneWord) || [])
    .map((w) => Array.from(w, (r) => runeIndex.get(r)));
  assert.equal(words.length, 2896);
  const flat = words.flat();
  const expected = unknown.flatMap((p) => p.indices);
  assert.deepEqual(flat, expected);
  assert.equal(flat.length, 12956);
  assert.equal(words.filter((w) => w.length >= MIN_LEN).length, 343);
  assert.ok(words.every((w) => w.length <= MAX_LEN));
  return words;
}

function englishByLength() {
  const dict = Array.from({length: MAX_LEN + 1}, () => new Map());
  for (const line of read("resources/control/english_wordfreq_textblob.txt")
    .split(/\r?\n/)) {
    const matched = /^([a-z]+) (\d+)$/.exec(line);
    if (!matched) continue;
    const native = nativeEnglish(matched[1]);
    if (!native || native.length < MIN_LEN || native.length > MAX_LEN) continue;
    const key = native.join(",");
    const old = dict[native.length].get(key);
    if (!old || old.freq < Number(matched[2])) {
      dict[native.length].set(key, {
        word: matched[1], freq: Number(matched[2]), native,
      });
    }
  }
  assert.deepEqual(dict.map((d) => d.size).slice(MIN_LEN),
    [4325, 3397, 2388, 1450, 767, 379, 153]);
  return dict;
}

/**
 * The first 65,550 primes lie below one million; 3301 is prime[463].
 * Preserve full prime order and the p56 authentic phi(prime)=prime-1 key.
 */
function primeKey() {
  const limit = 1000000;
  const sieve = new Uint8Array(limit + 1);
  sieve.fill(1, 2);
  for (let d = 2; d * d <= limit; d++) {
    if (!sieve[d]) continue;
    for (let k = d * d; k <= limit; k += d) sieve[k] = 0;
  }
  const primes = [];
  for (let p = 2; p <= limit && primes.length < MAX_START + MAX_LEN; p++) {
    if (sieve[p]) primes.push(p);
  }
  assert.equal(primes.length, MAX_START + MAX_LEN);
  assert.equal(primes[0], 2);
  assert.equal(primes[463], 3301);
  return primes.map((p) => (p - 1) % 29);
}

/**
 * Encrypt under authentic p56 rule, allowing an independently chosen start.
 * F=0 passes through verbatim without consuming a prime. Non-F plaintext
 * can still wrap into ciphertext zero.
 * @param {number[]} plain
 * @param {number} start
 * @param {1|-1} sign
 * @param {number[]} key
 */
function encrypt(plain, start, sign, key) {
  const ciphertext = [];
  let pointer = start;
  for (const p of plain) {
    if (p === 0) ciphertext.push(0);
    else {
      ciphertext.push(((p + sign * key[pointer]) % 29 + 29) % 29);
      pointer++;
    }
  }
  return {ciphertext, pointer};
}

/** @param {number[]} key */
function keyIndex(key) {
  const index = new Map();
  for (let start = 0; start < MAX_START; start++) {
    let hash = 0;
    for (let j = 0; j < HASH_LEN; j++) hash = 29 * hash + key[start + j];
    let starts = index.get(hash);
    if (!starts) {starts = []; index.set(hash, starts);}
    starts.push(start);
  }
  return index;
}

/**
 * Completeness: each native lexicon word of matching length is examined.
 * Its plaintext F slots must appear as ciphertext F and consume no prime.
 * All other slots imply a unique consecutive prime-residue sequence. Lookup
 * the first six values, then compare every remaining required shift.
 * Shorter non-F sequences use a complete 65,536-start loop.
 *
 * @param {number[]} cipher
 * @param {Map<string, {word:string,freq:number,native:number[]}>} dictionary
 * @param {number[]} key
 * @param {Map<number, number[]>} index
 */
function findMatches(cipher, dictionary, key, index) {
  const matches = [];
  let prefixCandidates = 0;
  for (const entry of dictionary.values()) {
    const live = [];
    let impossible = false;
    for (let i = 0; i < cipher.length; i++) {
      if (entry.native[i] === 0) {
        if (cipher[i] !== 0) {impossible = true; break;}
      } else live.push(i);
    }
    if (impossible) continue;
    for (const sign of [-1, 1]) {
      const required = live.map((i) =>
        (((cipher[i] - entry.native[i]) * sign) % 29 + 29) % 29
      );
      let starts;
      if (required.length < HASH_LEN) {
        starts = Array.from({length: MAX_START}, (_, i) => i);
      } else {
        let hash = 0;
        for (let i = 0; i < HASH_LEN; i++) hash = hash * 29 + required[i];
        starts = index.get(hash) || [];
      }
      for (const start of starts) {
        prefixCandidates++;
        if (required.every((v, i) => v === key[start + i])) {
          const verify = encrypt(entry.native, start, sign, key);
          assert.deepEqual(verify.ciphertext, cipher);
          matches.push({word: entry.word, freq: entry.freq, sign, start});
        }
      }
    }
  }
  return {matches, prefixCandidates};
}

function run() {
  const words = originalWords();
  const dictionary = englishByLength();
  const key = primeKey();
  const index = keyIndex(key);

  // Entire authentic 85-rune solved p56, including its sole transparent-F,
  // must match exactly. No original unknown plaintext is supplied.
  const solved = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT "
    + "HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  const solvedWords = solved.split(" ").map(nativeEnglish);
  const plain56 = solvedWords.flat();
  const actual56 = gp.pages.find((p) => p.page === 56).indices;
  assert.equal(plain56.length, 85);
  const whole = encrypt(plain56, 0, 1, key);
  assert.equal(whole.pointer, 84);
  assert.deepEqual(whole.ciphertext, actual56);

  // Confirm that the actual solved seven-rune word PILGRIM is reproduced
  // using its authentic p56 word-local prime index 61.
  const pilgrim = nativeEnglish("PILGRIM");
  assert.equal(pilgrim.length, 7);
  const pilgrimOffset = solvedWords.slice(0, 19)
    .reduce((n, w) => n + w.length, 0);
  assert.equal(pilgrimOffset, 62);
  assert.deepEqual(encrypt(pilgrim, 61, 1, key).ciphertext,
    actual56.slice(pilgrimOffset, pilgrimOffset + 7));

  // Independent long-word positives validate both signs, all GP lengths,
  // F transparency, and arbitrary nonzero prime starts.
  let positives = 0;
  for (let length = MIN_LEN; length <= MAX_LEN; length++) {
    const entry = dictionary[length].values().next().value;
    assert.ok(entry);
    for (const sign of [-1, 1]) {
      const start = 463 + 101 * length;
      const encrypted = encrypt(entry.native, start, sign, key);
      assert.ok(findMatches(encrypted.ciphertext,
        dictionary[length], key, index).matches.some((m) =>
          m.word === entry.word && m.sign === sign && m.start === start));
      positives++;
    }
  }
  assert.equal(positives, 14);

  let firstSixCandidates = 0;
  let tested = 0;
  const found = [];
  for (let i = 0; i < words.length; i++) {
    const cipher = words[i];
    if (cipher.length < MIN_LEN || cipher.length > MAX_LEN) continue;
    tested++;
    const r = findMatches(cipher, dictionary[cipher.length], key, index);
    firstSixCandidates += r.prefixCandidates;
    for (const match of r.matches) found.push({wordIndex: i, ...match});
  }
  assert.equal(tested, 343);
  assert.deepEqual(found, []);
  console.log("PASS source=12956_runes_2896_words tested_long_words=" + tested
    + " unique_dictionary_words=" + dictionary.reduce((n, d) => n + d.size, 0)
    + " first_six_survivors=" + firstSixCandidates
    + " all_65536_prime_starts_both_signs_exact_long_matches=" + found.length
    + " p56_authentic_85_of_85=PASS planted_14_of_14=PASS");
}
run();
