"use strict";
/**
 * Frozen broader-prose exact word-length crib scan for original LP2 p0–55.
 *
 * Extends the restricted *historical-authored* source catalog in Issue #333
 * to three large, independently retained literary controls. Counts and
 * source SHA-256 identities are pinned. No partial plaintext is assumed.
 *
 * Run under Node.js 22 from repository root:
 *   node sims/lp2_broadprose_wordlength_crib_sft.cjs
 *
 * @module lp2_broadprose_wordlength_crib_sft
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = Object.freeze([
  ["resources/control/gibran_prophet_58585.txt",
    "df260a07d56bf5998d40a6360b6132c35c252d10", 15733, 98, 9, 6],
  ["resources/control/emerson_essays_2944.txt",
    "a92be8ba5b3511a003a22ba31523c14397aaa83a", 77932, 273, 9, 6],
  ["resources/control/shakespeare_first300k.txt",
    "94c677ad9dd50771c6670e0c4e4dad9052b46d85", 55407, 265, 9, 6]
]);
const TRANSCRIPTION = "resources/lp2-transcription.txt";
const TRANSCRIPTION_SHA = "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7";
const RUNES = new Set([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"]);
const CHAPTER_CUTS = [0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const P55_BODY_LENGTHS = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const SEED_WORDS = 7;

/** @param {string} file @returns {string} */
function readPinned(file, expected) {
  const data = fs.readFileSync(path.join(ROOT, file), "utf8");
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"),
    expected, file + " changed");
  return data;
}

/** Existing Issue #333 source-native English/GP length convention. */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  let len = 0;
  for (let i = 0; i < s.length; len++) {
    if (s.startsWith("ING", i)) i += 3;
    else if (["TH","EO","OE","AE","IA","EA","NG"].includes(s.slice(i, i+2))) i += 2;
    else i++;
  }
  return len;
}

/** Preserve original / line breaks and % page breaks within printed words. */
function parsePrintedWords(raw) {
  let offset = 0, length = 0, start = 0;
  const words = [];
  function flush() {
    if (!length) return;
    words.push({length, start, end:offset});
    length = 0;
  }
  for (const c of raw) {
    if (RUNES.has(c)) {
      if (!length) start = offset;
      offset++; length++;
    } else if ("-.&$§".includes(c)) flush();
  }
  flush();
  assert.equal(offset, 13136);
  const unknown = words.filter(w => w.end <= 12956);
  assert.equal(unknown.length, 2896);
  return unknown;
}

const symbol = n => String.fromCharCode(35+n);
const signature = lens => lens.map(symbol).join("");

/**
 * Find only unedited, consecutive, chapter-contained matches.
 * Extend hits on both sides; do not tune gaps or non-source offsets.
 */
function scan(target, sourceWords) {
  const sourceLengths = sourceWords.map(gpLength);
  const sourceSig = signature(sourceLengths);
  const targetSig = signature(target.map(w => w.length));
  const lookup = new Map();
  for (let j = 0; j+SEED_WORDS <= sourceSig.length; j++) {
    const k = sourceSig.slice(j,j+SEED_WORDS);
    if (!lookup.has(k)) lookup.set(k, []);
    lookup.get(k).push(j);
  }
  let hits = 0, longest = 0, candidates = [];
  for (let i = 0; i+SEED_WORDS <= target.length; i++) {
    const ch = CHAPTER_CUTS.findIndex((v,k) =>
      k+1<CHAPTER_CUTS.length && target[i].start>=v &&
      target[i+SEED_WORDS-1].end<=CHAPTER_CUTS[k+1]);
    if (ch === -1) continue;
    const matches = lookup.get(targetSig.slice(i,i+SEED_WORDS)) || [];
    for (const j of matches) {
      hits++;
      let left=0, right=SEED_WORDS;
      while (i-left>0 && j-left>0 &&
             target[i-left-1].start>=CHAPTER_CUTS[ch] &&
             targetSig[i-left-1]===sourceSig[j-left-1]) left++;
      while (i+right<target.length && j+right<sourceSig.length &&
             target[i+right].end<=CHAPTER_CUTS[ch+1] &&
             targetSig[i+right]===sourceSig[j+right]) right++;
      const n=left+right;
      if (n>longest) { longest=n; candidates=[]; }
      if (n===longest) {
        const t=i-left, s=j-left;
        if (!candidates.some(x => x.targetWord===t && x.sourceWord===s)) {
          candidates.push({chapter:ch, targetWord:t, targetRune:target[t].start,
            sourceWord:s, words:n, text:sourceWords.slice(s,s+n).join(" "),
            predicted:sourceLengths.slice(s+n,s+n+10),
            observed:target.slice(t+n,t+n+10).map(w=>w.length)});
        }
      }
    }
  }
  return {sourceWordCount:sourceWords.length, seedHits:hits,
    longest, best:candidates.slice(0,5)};
}

/** Fixed p55 16-complete-word prefix against a whole control source. */
function longestP55Prefix(sourceWords) {
  const lengths=sourceWords.map(gpLength);
  let best=0;
  for (let i=0; i<lengths.length; i++) {
    let j=0;
    while (j<P55_BODY_LENGTHS.length && i+j<lengths.length &&
      lengths[i+j]===P55_BODY_LENGTHS[j]) j++;
    best=Math.max(best,j);
  }
  return best;
}

const original=parsePrintedWords(readPinned(TRANSCRIPTION,TRANSCRIPTION_SHA));
for (const [file,sha,expectedWords,expectedHits,expectedLongest,expectedP55] of SOURCE) {
  const words=readPinned(file,sha).match(/[A-Za-z]+/g) || [];
  const result=scan(original,words);
  const p55=longestP55Prefix(words);
  assert.equal(result.sourceWordCount, expectedWords);
  assert.equal(result.seedHits,expectedHits);
  assert.equal(result.longest,expectedLongest);
  assert.equal(p55,expectedP55);
  for (const c of result.best) {
    assert.ok(c.observed.some((v,i) => v!==c.predicted[i]),
      "false full ten-word extension");
  }
  console.log(JSON.stringify({file, ...result, p55LongestPrefix:p55}));
}
console.log("PASS: no 10-word exact quote or surviving extension in all three pinned corpora");
