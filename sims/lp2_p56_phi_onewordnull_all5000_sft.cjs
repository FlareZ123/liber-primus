"use strict";
/**
 * Exact original LP2 test of the authentic p56 prime-totient GP29 cipher
 * with a source-visible word clock, an unknown initial prime chosen independently
 * for every word (all starts 0..4999), and zero or one unkeyed inserted rune
 * anywhere in that word. At any eligible six-back affine T-echo site,
 * the ciphertext may additionally represent a repaired tentative doublet.
 *
 * All original words of published length >= 9 are tested against independent
 * GP-native English and Latin vocabularies. This is a bounded necessary
 * condition for direct word-preserving plaintext, not a proposed solve.
 *
 * Windows 11 / Node 22: node sims/lp2_p56_phi_onewordnull_all5000_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const data = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const wordRecords = parseSharedCorpus().words;
const runeIds = new Map(data.runes.map((glyph, i) => [glyph, i]));
const words = wordRecords.map(w => [...w.runes].map(glyph => runeIds.get(glyph)));
const pageIndices = data.pages.filter(p => p.status === "unsolved" && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(pageIndices.length, 12956);
assert.deepEqual(words.flat(), pageIndices);
const sourceHash = createHash("sha256").update(Buffer.from(pageIndices)).digest("hex");

const alphabetTokens = data.translit.map((text, index) => ({text, index}))
  .sort((a, b) => b.text.length - a.text.length);
const gpEnglish = new Map();
const gpLatin = new Map();

/** @param {string} original A Latin alphabet word. @returns {number[]|null} */
function englishRunes(original) {
  const s = original.toUpperCase().replace(/QU/g, "CW").replace(/K/g, "C")
    .replace(/V/g, "U").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < s.length;) {
    const next = alphabetTokens.find(t => s.startsWith(t.text, i));
    if (!next) return null;
    result.push(next.index);
    i += next.text.length;
  }
  return result;
}

/** @param {Map<number, number[][]>} byLength @param {number[]} runes */
function addLength(byLength, runes) {
  const selected = byLength.get(runes.length) || [];
  selected.push(runes);
  byLength.set(runes.length, selected);
}

const englishByLength = new Map();
const latinByLength = new Map();
const englishUnique = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/u)) {
  const m = /^([a-z]+)\s+(\d+)$/u.exec(line);
  if (!m) continue;
  const runes = englishRunes(m[1]);
  if (!runes) continue;
  const id = runes.join(",");
  if (englishUnique.has(id)) continue;
  englishUnique.add(id);
  addLength(englishByLength, runes);
}
const latinChars = "0123456789ABCDEFGHIJKLMNOPQRS";
const latinUnique = new Set();
for (const token of read("resources/control/latin-vulgate-gp-wholewords.txt")
  .split(/\r?\n/u)) {
  if (!/^[0-9A-S]+$/u.test(token)) continue;
  const runes = [...token].map(ch => latinChars.indexOf(ch));
  const id = runes.join(",");
  if (latinUnique.has(id)) continue;
  latinUnique.add(id);
  addLength(latinByLength, runes);
}
assert.equal(englishUnique.size, 29060);
assert.equal(latinUnique.size, 7305);

/**
 * Combined prefix trie terminal flags: 1 = GP-English, 2 = GP-Latin.
 * @typedef {{next: Map<number, Trie>, flags: number}} Trie
 */
/** @returns {Trie} */
function node() { return {next: new Map(), flags: 0}; }
const root = node();
/** @param {Map<number, number[][]>} byLength @param {number} flag */
function register(byLength, flag) {
  for (const rows of byLength.values()) {
    for (const runes of rows) {
      let here = root;
      for (const sym of runes) {
        if (!here.next.has(sym)) here.next.set(sym, node());
        here = here.next.get(sym);
      }
      here.flags |= flag;
    }
  }
}
register(englishByLength, 1);
register(latinByLength, 2);

const sieve = new Uint8Array(60000);
const keys = [];
for (let p = 2; p < sieve.length && keys.length < 5030; p++) {
  if (sieve[p]) continue;
  keys.push((p - 1) % 29); // phi(p) for prime p
  if (p * p < sieve.length) {
    for (let x = p * p; x < sieve.length; x += p) sieve[x] = 1;
  }
}
assert.equal(keys.length, 5030);
assert.deepEqual(keys.slice(0, 8), [1, 2, 4, 6, 10, 12, 16, 18]);
const mod = x => (x % 29 + 29) % 29;
const echo = x => mod(24 - 2 * x);

/**
 * Exact existential inverse for one word, one prime start and one sign.
 * The extra null can occur in any of the visible ciphertext positions.
 * Any published C_i = 24 - 2*C_(i-6) (mod29) can optionally represent
 * a tentative C_(i-1) overwritten by this six-back collision repair.
 * A plaintext F emits a literal F and does not consume the prime key;
 * ciphertext F can alternatively encrypt non-F plaintext and consume it.
 * @param {number[]} printed
 * @param {number} start Zero-based prime ordinal.
 * @param {-1|1} sign
 * @returns {number} 1 English / 2 Latin presence flags
 */
function matches(printed, start, sign) {
  let flags = 0;
  /** @param {number} position @param {number} consumed @param {Trie} trie @param {boolean} nullUsed */
  function visit(position, consumed, trie, nullUsed) {
    if (flags === 3) return;
    if (position === printed.length) {
      flags |= trie.flags;
      return;
    }
    if (!nullUsed) visit(position + 1, consumed, trie, true);
    const actual = printed[position];
    const tentative = [actual];
    if (position >= 6 && actual === echo(printed[position - 6]) &&
        actual !== printed[position - 1]) {
      tentative.push(printed[position - 1]);
    }
    for (const cipher of tentative) {
      if (cipher === 0 && cipher === actual) {
        const nextF = trie.next.get(0);
        if (nextF) visit(position + 1, consumed, nextF, nullUsed);
      }
      const candidate = mod(cipher - sign * keys[start + consumed]);
      if (candidate !== 0) {
        const next = trie.next.get(candidate);
        if (next) visit(position + 1, consumed + 1, next, nullUsed);
      }
    }
  }
  visit(0, 0, root, false);
  return flags;
}

/** @param {number[]} clear @param {number} start @param {-1|1} sign */
function encrypt(clear, start, sign) {
  let consumed = 0;
  return clear.map(plain => {
    if (plain === 0) return 0;
    return mod(plain + sign * keys[start + consumed++]);
  });
}

const target = words.filter(x => x.length >= 9);
assert.equal(target.length, 187);
const bySign = [];
for (const sign of [-1, 1]) {
  const found = {english: 0, latin: 0, byLength: {}};
  for (const word of target) {
    let mask = 0;
    for (let start = 0; start < 5000 && mask !== 3; start++) {
      mask |= matches(word, start, sign);
    }
    const item = found.byLength[word.length] || {words: 0, english: 0, latin: 0};
    item.words++;
    item.english += +(Boolean(mask & 1));
    item.latin += +(Boolean(mask & 2));
    found.byLength[word.length] = item;
    found.english += +(Boolean(mask & 1));
    found.latin += +(Boolean(mask & 2));
  }
  bySign.push({sign, ...found});
}

// Independent complete-length matched positives: every original target length
// is exercised; alternating cases carry an arbitrarily positioned keyless
// extra rune; correct secret starts vary through all 5,000 permissible indices.
const positives = {english: 0, latin: 0, withNull: 0, withoutNull: 0};
for (let index = 0; index < target.length; index++) {
  const publishedLength = target[index].length;
  const insertNull = index % 2 === 0;
  const sourceLength = publishedLength - +insertNull;
  for (const [language, flag, byLength, sign] of [
    ["english", 1, englishByLength, 1],
    ["latin", 2, latinByLength, -1]
  ]) {
    const choices = byLength.get(sourceLength);
    assert.ok(choices?.length, language + " lacks length " + sourceLength);
    const clear = choices[(index * 37 + sourceLength * 19) % choices.length];
    const secretStart = (index * 101 + (flag === 1 ? 71 : 211)) % 5000;
    const planted = encrypt(clear, secretStart, sign);
    if (insertNull) planted.splice((index * 7 + flag * 5) % publishedLength,
      0, (index * 13 + flag * 11) % 29);
    assert.equal(planted.length, publishedLength);
    assert.ok(matches(planted, secretStart, sign) & flag,
      "Model-matched planted word not recovered: " + language + " " + index);
    positives[language]++;
  }
  positives[insertNull ? "withNull" : "withoutNull"]++;
}
assert.equal(positives.english, target.length);
assert.equal(positives.latin, target.length);
assert.equal(positives.withNull + positives.withoutNull, target.length);

// Independent lag-six repair positives. When a tentative non-F ciphertext
// collides with its preceding published rune, publish the affine echo
// instead. A final non-key-consuming null is added to half the words.
let repairedEvents = 0, repairedAndNull = 0, repairedWordPlants = 0;
for (let index = 0; index < target.length; index++) {
  const publishedLength = target[index].length;
  const insertNull = index % 2 === 0;
  const candidates = englishByLength.get(publishedLength - +insertNull);
  const clear = candidates[(index * 47 + 3) % candidates.length];
  const start = (index * 107 + 97) % 5000;
  const encrypted = encrypt(clear, start, 1);
  let repairedInWord = 0;
  for (let j = 6; j < encrypted.length; j++) {
    if (clear[j] !== 0 && encrypted[j] === encrypted[j - 1]) {
      const output = echo(encrypted[j - 6]);
      if (output !== encrypted[j - 1]) {
        encrypted[j] = output;
        repairedEvents++;
        repairedInWord++;
      }
    }
  }
  if (insertNull) encrypted.push((index * 17 + 13) % 29);
  assert.equal(encrypted.length, publishedLength);
  assert.ok(matches(encrypted, start, 1) & 1,
    "Lag-six and null planted word failed: " + index);
  if (repairedInWord) {
    repairedWordPlants++;
    if (insertNull) repairedAndNull++;
  }
}
assert.ok(repairedEvents > 0);
assert.ok(repairedAndNull > 0);

console.log(JSON.stringify({
  source: "canonical LP2 GP29 unsolved pages p0..p55",
  sourceSha256: sourceHash,
  runes: pageIndices.length,
  words: words.length,
  longWords: target.length,
  primeStarts: 5000,
  nullLimitPerWord: 1,
  authenticPlaintextFBypass: true,
  allEligibleT6RepairBranches: true,
  englishLexicon: englishUnique.size,
  latinLexicon: latinUnique.size,
  original: bySign,
  matchedPositive: positives,
  matchedT6RepairPositive: {repairedEvents, repairedWordPlants, repairedAndNull},
  conclusion: "No original printed word of length >=9 decodes to known GP-English or Latin, granting independently free prime starts, up to one unkeyed ciphertext rune and every eligible T6 echo overwrite"
}, null, 2));
