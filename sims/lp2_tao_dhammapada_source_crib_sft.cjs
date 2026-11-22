"use strict";
/**
 * Source-selected thematic-crib test for unencrypted source quotations in LP2.
 *
 * Original source text editions: Tao Teh King (James Legge, 1891) PG #216 and
 * Dhammapada (F. Max Müller, 1881) PG #2017. Both published before Cicada 2014.
 * The full 2896-source-word tape is unchanged and source word lengths are
 * contracted by the authentic GP multigraph convention.
 *
 * No guessed keys, ciphertext fitting or source-dependent word edits.
 * Node.js 22: node sims/lp2_tao_dhammapada_source_crib_sft.cjs
 */
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { parseSharedCorpus, physicalLP2Page } = require("./lp2_word_pages.cjs");

const original = parseSharedCorpus();
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
const actual = original.words.map(w => w.length);
const width = 8;
const urls = [
  ["Tao Teh King, James Legge, 1891, PG216",
   "https://www.gutenberg.org/cache/epub/216/pg216.txt"],
  ["Dhammapada, F. Max Muller, 1881, PG2017",
   "https://www.gutenberg.org/cache/epub/2017/pg2017.txt"]
];

/** @param {string} word @returns {number} */
function gpLength(word) {
  return (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}
/** @param {number[]} values @param {number} start @returns {string} */
function key(values, start) { return values.slice(start, start + width).join(","); }

/**
 * Search every exact width-long fingerprint and fully extend in both directions.
 * @param {number[]} candidate Original-sized LP2 word lengths.
 * @param {number[]} source Historic reference word lengths.
 * @returns {Array<{originalWord:number,sourceWord:number,length:number,page:number}>}
 */
function scan(candidate, source) {
  /** @type {Map<string,number[]>} */
  const index = new Map();
  for (let i = 0; i + width <= candidate.length; i++) {
    const k = key(candidate, i);
    if (!index.has(k)) index.set(k, []);
    index.get(k).push(i);
  }
  const distinct = new Map();
  for (let j = 0; j + width <= source.length; j++) {
    const found = index.get(key(source, j));
    if (!found) continue;
    for (const match of found) {
      let i = match, p = j;
      while (i > 0 && p > 0 && candidate[i - 1] === source[p - 1]) {
        i--; p--;
      }
      let n = width + match - i;
      while (i + n < candidate.length && p + n < source.length &&
             candidate[i + n] === source[p + n]) n++;
      const k = i + ":" + p;
      if (!distinct.has(k)) distinct.set(k, {
        originalWord: i, sourceWord: p, length: n,
        page: physicalLP2Page(original.words[i].startPage)
      });
    }
  }
  return [...distinct.values()].sort((a, b) => b.length - a.length ||
    a.originalWord - b.originalWord || a.sourceWord - b.sourceWord);
}
/** @param {string} s @returns {string[]} */
function letters(s) { return s.toUpperCase().match(/[A-Z]+/g) || []; }

async function main() {
  for (const [name, url] of urls) {
    const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
    assert.equal(resp.status, 200, "source must be public plaintext " + url);
    const bytes = Buffer.from(await resp.arrayBuffer());
    const text = bytes.toString("utf8");
    const begin = text.indexOf("*** START OF THE PROJECT GUTENBERG");
    const end = text.indexOf("*** END OF THE PROJECT GUTENBERG");
    const body = text.slice(begin < 0 ? 0 : text.indexOf("\n", begin),
      end < 0 ? text.length : end);
    const refs = letters(body), refLen = refs.map(gpLength);
    assert.ok(refs.length >= 500, "nontrivial complete text");
    const hits = scan(actual, refLen);
    const controlStart = Math.min(250, refs.length - 36);
    const planted = actual.slice();
    planted.splice(1200, 34, ...refLen.slice(controlStart, controlStart + 34));
    const plant = scan(planted, refLen).some(x => x.originalWord === 1200 &&
      x.sourceWord === controlStart && x.length >= 34);
    assert.ok(plant, "full 34-word source-text plant must be recovered");
    console.log(JSON.stringify({
      source: name, url, bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      sourceWords: refs.length, originalWords: actual.length,
      maxExactWordRun: hits[0]?.length ?? 0,
      matchesAtLeast12: hits.filter(x => x.length >= 12).length,
      matchesAtLeast16: hits.filter(x => x.length >= 16).length,
      matchesAtLeast20: hits.filter(x => x.length >= 20).length,
      best: hits.slice(0, 4).map(x => ({
        ...x, excerpt: refs.slice(x.sourceWord,
          x.sourceWord + Math.min(x.length, 25)).join(" ")
      })),
      positivePlantRecovered34: true
    }));
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
