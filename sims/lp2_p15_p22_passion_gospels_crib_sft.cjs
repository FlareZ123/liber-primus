"use strict";
/**
 * SFT: p22 original reclining-body / triple-cross Passion Gospel literal-crib
 * gate. No external dependencies, network or file writes.
 *
 * Run from a checked-out repository:
 *   node sims/lp2_p15_p22_passion_gospels_crib_sft.cjs
 *
 * The original p15 lower red heading starts an 1,894-rune, 435-word body
 * terminating on p22, which depicts a recumbent body beneath a three-bar
 * cross. Four canonical KJV Passion/Resurrection passages are an independently
 * image-motivated plaintext-source proposal, without selecting a cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const RUNES = new Set([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"]);
const FILE = "resources/external/kjv-passion-gospels-2014.txt";
const SEED_WORDS = 6;

/** @param {string} word @returns {number} */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let n = 0;
  for (let i = 0; i < s.length; n++) {
    if (s.startsWith("ING", i)) i += 3;
    else if (["TH", "EO", "OE", "AE", "IA", "EA", "NG"]
      .includes(s.slice(i, i + 2))) i += 2;
    else i++;
  }
  return n;
}

/** @returns {number[]} */
function getOriginalBody() {
  const master = fs.readFileSync(path.join(ROOT,
    "resources/transcriptions/liber_primus_master.txt"), "utf8");
  const segments = master.slice(master.indexOf("\n\n") + 2).split("$");
  const target = segments[11].split(/[-.&$§•⁜⁘]/u)
    .map(s => [...s].filter(c => RUNES.has(c)).length).filter(Boolean);
  assert.equal(target.length, 435);
  assert.equal(target.reduce((a, b) => a + b, 0), 1894);
  return target;
}

/**
 * @typedef {{word: string, chapter: number, verse: number, length: number}} Token
 * @returns {Map<string, Token[]>}
 */
function getGospels() {
  const content = fs.readFileSync(path.join(ROOT, FILE), "utf8");
  const source = new Map();
  for (const line of content.split(/\r?\n/u)) {
    if (!line || line.startsWith("#")) continue;
    const m = /^(Matthew|Mark|Luke|John) (\d+):(\d+)\t(.+)$/u.exec(line);
    assert.ok(m, "Invalid source verse: " + line.slice(0, 80));
    if (!source.has(m[1])) source.set(m[1], []);
    for (const word of m[4].match(/[A-Za-z]+/g) || []) {
      source.get(m[1]).push({word, chapter:Number(m[2]),
        verse:Number(m[3]), length:gpLength(word)});
    }
  }
  assert.deepEqual([...source.keys()], ["Matthew", "Mark", "Luke", "John"]);
  assert.deepEqual([...source.values()].map(x => x.length),
    [3411, 2957, 3570, 3405]);
  return source;
}

/**
 * Match source and target complete printed GP word lengths exactly.
 * @param {number[]} target
 * @param {Token[]} words
 * @returns {{max:number, hits:Array<object>}}
 */
function scan(target, words) {
  const source = words.map(x => x.length), index = new Map();
  for (let j = 0; j + SEED_WORDS <= source.length; j++) {
    const sig = source.slice(j, j + SEED_WORDS).join(",");
    const old = index.get(sig) || [];
    old.push(j);
    index.set(sig, old);
  }
  let max = 0;
  const hits = [], seen = new Set();
  for (let i = 0; i + SEED_WORDS <= target.length; i++) {
    const starts = index.get(target.slice(i, i + SEED_WORDS).join(",")) || [];
    for (const j of starts) {
      let left = 0, right = SEED_WORDS;
      while (i > left && j > left &&
        target[i - left - 1] === source[j - left - 1]) left++;
      while (i + right < target.length && j + right < source.length &&
        target[i + right] === source[j + right]) right++;
      const n = left + right;
      max = Math.max(max, n);
      const t = i - left, s = j - left, key = t + ":" + s;
      if (n < 8 || seen.has(key)) continue;
      seen.add(key);
      hits.push({n, targetWord:t, chapter:words[s].chapter, verse:words[s].verse,
        words:words.slice(s, s + n).map(x => x.word).join(" ")});
    }
  }
  return {max,hits:hits.sort((a,b)=>b.n-a.n || a.targetWord-b.targetWord)};
}

function main() {
  const original = getOriginalBody(), bible = getGospels();
  const results = [];
  for (const [book, words] of bible) {
    const result = scan(original, words);
    results.push({book,sourceWords:words.length,max:result.max});
    console.log(book + ": " + words.length + " source words, longest exact " +
      result.max + " target words");
    for (const hit of result.hits) {
      console.log("  p15–22 word " + hit.targetWord + " ↔ " + book +
        " " + hit.chapter + ":" + hit.verse + ", length " + hit.n +
        ': "' + hit.words + '"');
    }
  }
  assert.deepEqual(results.map(x => x.max), [8, 7, 8, 8]);
  // Positive control: an unaltered 20-word KJV plant must find itself.
  const john = bible.get("John");
  const plant = john.slice(50, 70).map(x => x.length);
  const control = scan(plant, john);
  assert.equal(control.max, 20);
  console.log("PLANT 20/20 exact words recovered");
  console.log("DECISION: no verbatim KJV Passion/Resurrection 9+ word crib " +
    "under original p15–22 word boundaries; no ciphertext inverse recovered.");
}
main();
