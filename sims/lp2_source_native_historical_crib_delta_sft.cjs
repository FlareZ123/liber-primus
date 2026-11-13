"use strict";
/**
 * Issue #744: source-native (ING and IO) literal historical crib rescan.
 * Repro: node sims/lp2_source_native_historical_crib_delta_sft.cjs
 *
 * Inputs are pre-2014 Cicada-referenced public texts and the unchanged
 * printed word segmentation of LP2 p0–55. No cipher/key is fitted.
 *
 * @module lp2_source_native_historical_crib_delta_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const RUNES = new Set([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"]);
const SOURCE_FILES = [
  "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt"
];
const BODY_STARTS = [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640, 12956];
const MIN_SEED = 6;
const REQUIRED_CRIB = 12;
const CONTROL_SEED = 0x33012014;
const SHUFFLES = 200;

/** @param {string} filename @returns {string} */
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");

/**
 * The prior #333 encoder already contracted ING; its remaining
 * observed mismatch to solved LP1 is IO as one printed GP IOR rune.
 * @param {string} word
 * @param {boolean} sourceNative
 * @returns {number}
 */
function gpLength(word, sourceNative) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let result = 0;
  for (let i = 0; i < s.length; result++) {
    if (s.startsWith("ING", i)) i += 3;
    else if (sourceNative && s.startsWith("IO", i)) i += 2;
    else if (["TH", "EO", "OE", "AE", "IA", "EA", "NG"]
      .some(t => s.startsWith(t, i))) i += 2;
    else i++;
  }
  return result;
}

/**
 * Page % and line / continue a word. Only literal printed punctuation
 * ends it. Words are assigned to the existing, image-anchored chapters.
 * @param {string} source
 * @returns {{words:{start:number,end:number,length:number}[],runes:number}}
 */
function printedWords(source) {
  const words = [];
  let runes = 0, length = 0, start = 0;
  const flush = () => {
    if (!length) return;
    words.push({start, end:runes, length});
    length = 0;
  };
  for (const ch of source) {
    if (RUNES.has(ch)) {
      if (!length) start = runes;
      runes++;
      length++;
    } else if ("-.&$§".includes(ch)) flush();
  }
  flush();
  return {words, runes};
}

/** @param {string} filename @returns {string[]} */
function sourceWords(filename) {
  let raw = read(filename);
  if (filename.includes("2012-marriage-")) {
    raw = raw.replace(/([a-z])-\s*\n([a-z])/g, "$1$2");
  }
  return raw.match(/[A-Za-z]+/g) || [];
}

/**
 * Search at least six identical printed word lengths, extend each
 * anchor in both directions and freeze the first longest alignment.
 * There is no target-word editing or resegmentation.
 * @param {number[][]} bodies
 * @param {number[]} source
 * @returns {{length:number,body?:number,targetWord?:number,sourceWord?:number,nextSource?:number[],nextTarget?:number[],seedHits:number}}
 */
function scan(bodies, source) {
  const index = new Map();
  for (let j = 0; j + MIN_SEED <= source.length; j++) {
    const key = source.slice(j, j + MIN_SEED).join(",");
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(j);
  }
  let best = {length:0};
  let seedHits = 0;
  bodies.forEach((target, body) => {
    for (let i = 0; i + MIN_SEED <= target.length; i++) {
      const hits = index.get(target.slice(i, i + MIN_SEED).join(","));
      if (!hits) continue;
      hits.forEach(j => {
        seedHits++;
        let left = 0, right = MIN_SEED;
        while (i-left > 0 && j-left > 0 &&
          target[i-left-1] === source[j-left-1]) left++;
        while (i+right < target.length && j+right < source.length &&
          target[i+right] === source[j+right]) right++;
        const length = left + right;
        if (length > best.length) {
          best = {
            length, body, targetWord:i-left, sourceWord:j-left,
            nextSource:source.slice(j+right, j+right+5),
            nextTarget:target.slice(i+right, i+right+5)
          };
        }
      });
    }
  });
  return {...best, seedHits};
}

/** @param {number} seed @returns {()=>number} */
function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

/** @param {number[][]} bodies @param {()=>number} random @returns {number[][]} */
function shuffleWithinBodies(bodies, random) {
  return bodies.map(body => {
    const values = body.slice();
    for (let j = values.length - 1; j > 0; j--) {
      const k = random() % (j + 1);
      [values[j], values[k]] = [values[k], values[j]];
    }
    return values;
  });
}

/** @returns {object} */
function run() {
  const parsed = printedWords(read("resources/liber-primus/lp2-transcription.txt"));
  assert.equal(parsed.runes, 13136);
  const originalWords = parsed.words.filter(w => w.start < 12956);
  assert.equal(originalWords.length, 2896);
  const bodies = BODY_STARTS.slice(0, -1).map((start, body) =>
    originalWords.filter(w =>
      w.start >= start && w.end <= BODY_STARTS[body + 1]).map(w => w.length));
  assert.deepEqual(bodies.map(b => b.length),
    [158,255,385,435,224,326,23,355,735]);
  assert.equal(bodies.flat().reduce((a, b) => a + b, 0), 12956);

  // The independently solved LP2 parable measures the true GP output,
  // including the single source-printed ING glyph in TUNNELING.
  const parable = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
  assert.equal(parable.split(" ").reduce((n, w) => n + gpLength(w, true), 0), 95);
  assert.equal(gpLength("FUNCTION", false) - gpLength("FUNCTION", true), 1);

  const sources = SOURCE_FILES.map(filename => {
    const words = sourceWords(filename);
    const old = words.map(w => gpLength(w, false));
    const corrected = words.map(w => gpLength(w, true));
    const nChanged = old.reduce((n, v, i) => n + (v !== corrected[i]), 0);
    return {filename, words, old, corrected, nChanged,
      legacy:scan(bodies, old), native:scan(bodies, corrected)};
  });
  assert.deepEqual(sources.map(s => s.words.length), [120,1897,1968,2002]);
  assert.deepEqual(sources.map(s => s.nChanged), [1,12,8,17]);
  assert.deepEqual(sources.map(s => s.legacy.length), [7,7,8,8]);
  assert.deepEqual(sources.map(s => s.native.length), [7,7,8,8]);
  assert(sources.every(s => s.native.length < REQUIRED_CRIB));

  // The new orthography must expose a 20-word original-length plant.
  // Choose a source window containing a newly contracted IO spelling.
  const chosen = sources[1];
  const changedAt = chosen.old.findIndex((n, i) => n !== chosen.corrected[i]);
  assert(changedAt >= 0);
  const first = Math.min(Math.max(0, changedAt - 5), chosen.corrected.length - 20);
  const planted = bodies.map(b => b.slice());
  planted[3].splice(100, 20, ...chosen.corrected.slice(first, first + 20));
  const plantHit = scan(planted, chosen.corrected);
  assert(plantHit.length >= 20);
  assert.equal(plantHit.body, 3);
  assert.equal(plantHit.targetWord, 100);
  assert.equal(plantHit.sourceWord, first);

  // Fixed-inventory, inside-chapter permutation null. Calibrates only
  // selection among these four historical references and 9 fixed bodies.
  const random = xorshift32(CONTROL_SEED);
  const shuffledMax = [];
  for (let t = 0; t < SHUFFLES; t++) {
    const nullBodies = shuffleWithinBodies(bodies, random);
    shuffledMax.push(Math.max(...sources.map(s =>
      scan(nullBodies, s.corrected).length)));
  }
  const result = {
    status:"no source-calibrated 12-word original plaintext crib",
    input:{unknownRunes:12956,unknownWords:2896,
      chapterWordCounts:bodies.map(b => b.length)},
    sourceFiles:sources.map(s => ({
      filename:s.filename,words:s.words.length,
      newlyChangedIoWords:s.nChanged,
      older:{max:s.legacy.length,seedHits:s.legacy.seedHits},
      sourceNative:{max:s.native.length,seedHits:s.native.seedHits,
        strongest:s.native.length ? {
          body:s.native.body,originalWord:s.native.targetWord,
          sourceWord:s.native.sourceWord,
          nextFiveOriginal:s.native.nextTarget,
          nextFiveSource:s.native.nextSource
        } : null}
    })),
    positivePlant:{matched:plantHit.length,sourceWord:first,originalBody:3,
      originalWord:100},
    shuffledControl:{trials:SHUFFLES,seed:CONTROL_SEED,
      maxima:shuffledMax.reduce((h, n) => {
        h[n] = (h[n] || 0) + 1;
        return h;
      }, {}),atLeast12:shuffledMax.filter(n => n >= REQUIRED_CRIB).length}
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = {run, gpLength, printedWords, scan};
