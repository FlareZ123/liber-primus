"use strict";
/**
 * Issue #333: exact historical-word-length crib gate on source-printed LP2.
 *
 * Standalone test: node sims/lp2_historical_exact_wordlength_crib_sft.cjs
 * Dependencies: built-in Node.js APIs and committed repository resources.
 *
 * All source files are frozen explicitly. The test never adjusts a target
 * word length, permits a gap, chooses a new language model, or moves a
 * body boundary after observing a hit. English-to-GP rules are the same
 * as those in sims/wordlength_crib_scan.js.
 *
 * @module lp2_historical_exact_wordlength_crib_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const RUNES = new Set([..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"]);
const BODY_RUNE_STARTS = [0, 729, 1874, 3612, 5506, 6527, 7960, 8051, 9640, 12956];
const K = 7;
const SHUFFLES = 2000;
const SHUFFLE_SEED = 0xc1cada33;
const FILES = [
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/cicada2012_blake_chorus.txt",
  "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
  "resources/historical/cicada2012-countdown-message.asc",
  "resources/historical/cicada2012-midi-49-words.txt",
  "resources/historical/cicada2013-forest-clue.asc",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/2013-0-wisdom.txt",
  "resources/historical/cicada2014-stage11-message.asc",
  "resources/historical/cicada2016-4gq25-outguess.asc",
  "resources/historical/cicada2017-yEiTHhvF.asc"
];
const UNRELATED_CONTROL = "resources/control/gibran_prophet_58585.txt";

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}
/** @param {string} text @returns {number[]} */
function runeWordLengths(text) {
  return text.split(/[-.&$§•⁜⁘]/u)
    .map(s => [...s].filter(ch => RUNES.has(ch)).length)
    .filter(Boolean);
}
/** @param {string} word @returns {number} */
function gpLength(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < s.length; length++) {
    if (s.startsWith("ING", i)) i += 3;
    else if (["TH", "EO", "OE", "AE", "IA", "EA", "NG"]
      .includes(s.slice(i, i + 2))) i += 2;
    else i++;
  }
  return length;
}
/**
 * @param {string} raw
 * @returns {{words:Array<{length:number,start:number,end:number}>,runeCount:number}}
 */
function parseContinuousWords(raw) {
  let runes = 0;
  let current = 0;
  let start = 0;
  const words = [];
  const flush = () => {
    if (!current) return;
    words.push({length:current,start,end:runes});
    current = 0;
  };
  for (const ch of raw) {
    if (RUNES.has(ch)) {
      if (!current) start = runes;
      current++;
      runes++;
    } else if ("-.&$§".includes(ch)) {
      flush();
    }
    // A printed / line or % physical-page break does not terminate words.
  }
  flush();
  return {words,runeCount:runes};
}
/** @param {string} file @returns {{name:string,words:string[],lengths:number[],sha256:string}} */
function loadSource(file) {
  let content = read(file);
  const sha256 = crypto.createHash("sha256").update(content).digest("hex");
  if (file.includes("lp1-plaintext")) {
    // The later solved LP2 pp56/57 are controls, never historical LP1 cribs.
    content = content.split(/^###\s*56\s*$/m)[0]
      .replace(/\[[^\]]+\]/g, " ")
      .replace(/^\s*###.*$/gm, " ")
      .replace(/^\s*[0-9a-f ]{16,}$/gmi, " ")
      .replace(/^\s*[0-9 ]{8,}$/gm, " ");
  } else if (file.includes("cicada2012_blake_chorus")) {
    content = content.split("BEGIN SOURCE TEXT")[1]
      .split("END SOURCE TEXT")[0];
  } else if (file.includes("2012-marriage-")) {
    // Join only the typeset, explicit end-of-line hyphenation.
    content = content.replace(/([a-z])-\s*\n([a-z])/g, "$1$2");
  } else if (file.endsWith(".asc")) {
    assert.ok(content.startsWith("-----BEGIN PGP SIGNED MESSAGE-----"));
    content = content.split(/\r?\n\r?\n/u).slice(1).join("\n\n")
      .split("-----BEGIN PGP SIGNATURE-----")[0];
    // Literal onion address labels are metadata and non-GP numerals.
    content = content.replace(/[a-z0-9]{16}\.onion/gi, " ");
  } else if (file.endsWith("2013-0-wisdom.txt")) {
    content = content.split(/\r?\n\r?\n/u)[0];
    const lengths = runeWordLengths(content);
    return {name:file,words:[],lengths,sha256};
  }
  const words = content.match(/[A-Za-z]+/g) || [];
  return {name:file,words,lengths:words.map(gpLength),sha256};
}
/** @param {number[]} a @returns {string} */
function signature(a) {
  return a.map(n => String.fromCharCode(35 + n)).join("");
}
/** @param {ReturnType<typeof loadSource>} s */
function indexSource(s) {
  const seq = signature(s.lengths), index = new Map();
  for (let j = 0; j + K <= seq.length; j++) {
    const key = seq.slice(j, j + K);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(j);
  }
  return {...s,seq,index};
}
/**
 * A hit is a source-and-target exact seven-word seed. Extend left and right
 * within the same manuscript body and single source file, with no errors.
 * @param {number[][]} bodies
 * @param {ReturnType<typeof indexSource>[]} sources
 * @returns {{max:number,best:object,perSource:number[],seedHits:number}}
 */
function scan(bodies, sources) {
  let max = 0, best = {}, seedHits = 0;
  const perSource = Array(sources.length).fill(0);
  for (let b = 0; b < bodies.length; b++) {
    const target = signature(bodies[b]);
    for (let s = 0; s < sources.length; s++) {
      const src = sources[s];
      for (let i = 0; i + K <= target.length; i++) {
        const js = src.index.get(target.slice(i, i + K));
        if (!js) continue;
        for (const j of js) {
          seedHits++;
          let left = 0, right = K;
          while (i - left > 0 && j - left > 0 &&
            target[i-left-1] === src.seq[j-left-1]) left++;
          while (i + right < target.length && j + right < src.seq.length &&
            target[i+right] === src.seq[j+right]) right++;
          const n = left + right;
          if (n > perSource[s]) perSource[s] = n;
          if (n > max) {
            max = n;
            const targetStart = i - left, sourceStart = j - left;
            best = {length:n,body:b,source:src.name,
              targetWordWithinBody:targetStart,sourceWord:sourceStart,
              sourceExcerpt:src.words.slice(sourceStart, sourceStart+n).join(" "),
              withheldSourceLengths:src.lengths.slice(sourceStart+n,sourceStart+n+10),
              withheldOriginalLengths:bodies[b].slice(targetStart+n,targetStart+n+10)};
          }
        }
      }
    }
  }
  return {max,best,perSource,seedHits};
}
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/** @param {number[][]} bodies @param {()=>number} random @returns {number[][]} */
function shuffled(bodies, random) {
  const arr = bodies.flat();
  for (let i = arr.length-1; i > 0; i--) {
    const j = random() % (i+1);
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  let off = 0;
  return bodies.map(b => {
    const out = arr.slice(off,off+b.length);
    off += b.length;
    return out;
  });
}
function histogram(numbers) {
  const h = {};
  for (const n of numbers) h[n] = (h[n]||0)+1;
  return h;
}
function run() {
  const text = read("resources/liber-primus/lp2-transcription.txt");
  const all = parseContinuousWords(text);
  const original = all.words.filter(w => w.start < 12956);
  assert.equal(original.length,2896);
  assert.equal(all.runeCount,13136);
  const bodies = BODY_RUNE_STARTS.slice(0,9).map((start,i) =>
    original.filter(w => w.start>=start && w.end<=BODY_RUNE_STARTS[i+1])
      .map(w => w.length));
  assert.deepEqual(bodies.map(a=>a.length),
    [158,255,385,435,224,326,23,355,735]);
  assert.equal(bodies.flat().length,2896);
  const pages = text.split("%").filter(x => [...x].some(c => RUNES.has(c)));
  const p57 = runeWordLengths(pages.at(-1));
  const p57English = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
    .split(" ").map(gpLength);
  assert.deepEqual(p57,p57English);
  const p56prefix = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO"
    .split(" ").map(gpLength);
  assert.deepEqual(runeWordLengths(pages.at(-2)).slice(0,p56prefix.length),
    p56prefix);
  const sources = FILES.map(loadSource).map(indexSource);
  const unrelated = indexSource(loadSource(UNRELATED_CONTROL));
  const observed = scan(bodies,sources);
  const control = scan(bodies,[unrelated]);
  const rand = xorshift(SHUFFLE_SEED);
  const nulls = [];
  for(let i=0;i<SHUFFLES;i++) {
    nulls.push(scan(shuffled(bodies,rand),sources).max);
  }
  const ge = nulls.filter(n => n >= observed.max).length;
  const result = {
    contract:{unsolvedRunes:12956,unsolvedWords:2896,
      nineBodyWordCounts:bodies.map(x=>x.length),
      solvedPage57ExactGpLength:true,solvedPage56PrefixExactGpLength:true},
    sourceFiles:sources.map((s,i)=>({path:s.name,sha256:s.sha256,
      words:s.lengths.length,observedMax:observed.perSource[i]})),
    exactOriginal:observed,
    unrelatedGibranControl:{words:unrelated.lengths.length,max:control.max,
      strongest:control.best},
    permutation:{shuffles:SHUFFLES,seed:SHUFFLE_SEED,
      nullMaxHistogram:histogram(nulls),geObserved:ge,
      plusOneUpperTail:(ge+1)/(SHUFFLES+1)}
  };
  assert.ok(observed.max < 18,
    "Potential predeclared 8-word seed plus 10 withheld words: inspect!");
  console.log(JSON.stringify(result,null,2));
}
if (require.main === module) run();
module.exports = {run,gpLength,runeWordLengths,scan,shuffled};
