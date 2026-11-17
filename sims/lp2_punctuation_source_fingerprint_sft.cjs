/**
 * Original LP2 punctuation/word-length historical-source fingerprint SFT.
 *
 * Source-preserving positive controls are original solved GP29 transcriptions.
 * Cross-edition controls use the separate editorial Latin reference.
 * The two unknown passages are selected only by original page/ink boundaries:
 *   13..275    first p0 black prose through its second stop;
 *   851..1111  first full-stop-bounded >=150-rune unit containing the
 *              source-visible p4 apostrophe at global rune offset 1110.
 *
 * Run from any current working directory with Node.js 22.
 * No network access, nondeterminism, or file writes.
 *
 * @typedef {{n:number,start:number,end:number,stop:number,apos:number}} Word
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

/** @param {string} p @returns {any} */
function json(p) {
  return JSON.parse(read(p));
}

const sourceFiles = {
  original: "resources/liber-primus/lp2-transcription.txt",
  alphabet: "resources/liber-primus/lp2-corpus.json",
  apostrophes: "resources/liber-primus/lp2-quote-punctuation-spans.json",
  solved: "resources/external/relikd-solved-gp29-native-v1.json",
  editorial: "resources/liber-primus/lp1-plaintext-reference.txt",
  historical: [
    "resources/external/2013-book-of-law-I.txt",
    "resources/external/2013-book-of-law-II.txt",
    "resources/external/2013-book-of-law-III.txt",
    "resources/external/blake-marriage-1906-gutenberg45315.txt",
    "resources/external/2012-marriage-of-heaven-and-hell-page.txt",
    "resources/cicada2014-may2-signed-message.asc"
  ],
  historicalLengthOnly: [
    "resources/external/cicada2012-mabinogion-gutenberg5160-gp-wordlengths.json",
    "resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json",
    "resources/external/cicada2013-crowley-book-of-law-2013-gp-wordlengths.json"
  ]
};
const runeSet = new Set(json(sourceFiles.alphabet).runes);

/**
 * Count each physically transcribed GP rune, treating pages/line wraps
 * as no additional printed word separator. Section markers delimit words
 * but do not masquerade as four-dot full stops.
 * @param {string} source
 * @returns {{words:Word[],runeTotal:number}}
 */
function parseRunes(source) {
  /** @type {Word[]} */
  const words = [];
  let total = 0;
  let n = 0;
  let start = 0;

  function flush() {
    if (n !== 0) {
      words.push({n, start, end:total, stop:0, apos:0});
      n = 0;
    }
  }

  for (const ch of source) {
    if (runeSet.has(ch)) {
      if (n === 0) start = total;
      n++;
      total++;
    } else if ("-•⁘⁜&.⁚".includes(ch)) {
      flush();
      if (("⁘.".includes(ch)) && words.length) words[words.length-1].stop = 1;
    }
  }
  flush();
  return {words, runeTotal:total};
}

/**
 * Period-contemporary Latin-to-GP29 word-count convention. DIGRAPHS
 * consume one rune; ING consumes one NG rune. The exact source edition
 * still matters, which is why controls include editorial variants.
 * @param {string} word
 * @returns {number}
 */
function gpLength(word) {
  const s = word.toUpperCase().replace(/[VKQZ]/g, ch => ({
    V:"U", K:"C", Q:"C", Z:"S"
  })[ch]);
  let n = 0;
  for (let i = 0; i < s.length;) {
    const step = s.startsWith("ING", i) ? 3
      : ["TH","EO","NG","OE","AE","IA","EA"].some(x => s.startsWith(x, i)) ? 2 : 1;
    i += step;
    n++;
  }
  return n;
}

/**
 * A raised apostrophe is a within-word GP rune boundary, not a separate
 * printed word. Map ordinary .?! to stop; strip line-initial numbered
 * Crowley verses, which are not words in the GP transliteration.
 * @param {string} source
 * @returns {Word[]}
 */
function parseLatin(source) {
  /** @type {Word[]} */
  const words = [];
  const stripped = source.replace(/^\s*\d+\.\s*/gm, "");
  for (const hit of stripped.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*|[.?!]/g)) {
    const token = hit[0];
    if (/^[A-Za-z]/.test(token)) {
      const parts = token.split(/['’]/);
      const n = parts.reduce((sum, part) => sum + gpLength(part), 0);
      words.push({n, start:0, end:0, stop:0, apos:parts.length === 2 ? gpLength(parts[0]) : 0});
    } else if (words.length) {
      words[words.length - 1].stop = 1;
    }
  }
  return words;
}

/**
 * A complete original-window fingerprint must match word lengths,
 * end-of-word stops, and within-word apostrophe position. The separate
 * minimum length-only distance measures robustness to editorial stops.
 * All windows are evaluated; there are no tuned offsets.
 *
 * @param {Word[]} q
 * @param {Word[]} donor
 */
function compare(q, donor) {
  if (donor.length < q.length) {
    return {donorWords:donor.length, windows:0, exact:0,
      fullMin:null, fullOffset:null, lenMin:null, lenOffset:null};
  }
  let fullMin = Infinity;
  let lenMin = Infinity;
  let fullOffset = -1;
  let lenOffset = -1;
  let exact = 0;
  for (let i = 0; i + q.length <= donor.length; i++) {
    let lengthDiff = 0;
    let stopDiff = 0;
    let apostropheDiff = 0;
    for (let j = 0; j < q.length; j++) {
      if (q[j].n !== donor[i+j].n) lengthDiff++;
      if (q[j].stop !== donor[i+j].stop) stopDiff++;
      if (q[j].apos !== donor[i+j].apos) apostropheDiff++;
    }
    const full = lengthDiff + stopDiff + apostropheDiff;
    if (full < fullMin) {
      fullMin = full;
      fullOffset = i;
    }
    if (lengthDiff < lenMin) {
      lenMin = lengthDiff;
      lenOffset = i;
    }
    if (full === 0) exact++;
  }
  return {donorWords:donor.length, windows:donor.length-q.length+1,
    exact, fullMin, fullOffset, lenMin, lenOffset};
}

/**
 * Count mismatch in only the rune-length profile, against archive
 * donor datasets already independently normalized to GP29.
 * @param {Word[]} q
 * @param {number[]} donor
 */
function compareLengths(q, donor) {
  if (donor.length < q.length) {
    return {donorWords:donor.length, windows:0, exact:0, lenMin:null, lenOffset:null};
  }
  let min = Infinity;
  let offset = -1;
  let exact = 0;
  for (let i=0; i+q.length<=donor.length; i++) {
    let distance=0;
    for (let j=0; j<q.length; j++) {
      if (q[j].n !== donor[i+j]) distance++;
    }
    if (distance<min) {min=distance;offset=i;}
    if (distance===0) exact++;
  }
  return {donorWords:donor.length, windows:donor.length-q.length+1,
    exact, lenMin:min, lenOffset:offset};
}

/** @param {Word[]} words @param {number} from @param {number} to */
function windowByRunes(words, from, to) {
  const w = words.filter(item => item.start >= from && item.end <= to);
  assert(w.length > 0 && w[0].start === from && w[w.length-1].end === to,
    "Unknown query must be an intact printed-word interval");
  assert(w.reduce((a, x) => a + x.n, 0) === to-from);
  return w;
}

/** @param {Word[]} q */
function windowMetadata(q) {
  return {
    runeCount:q.reduce((a,x)=>a+x.n,0),
    wordCount:q.length,
    wordLengths:q.map(x=>x.n),
    stops:q.flatMap((x,i)=>x.stop?[i]:[]),
    apostrophes:q.flatMap((x,i)=>x.apos?[[i,x.apos]]:[])
  };
}

const original = parseRunes(read(sourceFiles.original));
assert.equal(original.runeTotal,13136);
assert.equal(original.words.filter(w => w.start < 12956).length,2896);

const ink = json(sourceFiles.apostrophes);
assert.equal(ink.source_visible_apostrophes.length,4);
for (const item of ink.source_visible_apostrophes) {
  const w = original.words.find(x =>
    x.start < item.global_before_rune && x.end > item.global_before_rune);
  assert(w, "Apostrophe must fall inside a printed word");
  assert.equal(item.global_before_rune - w.start,item.stem_runes);
  assert.equal(w.end - item.global_before_rune,item.tail_runes);
  w.apos = item.stem_runes;
}

const queries = {
  p0BlackTwoSentences:windowByRunes(original.words,13,275),
  firstPhysicalApostrophe:windowByRunes(original.words,851,1111)
};
assert.deepEqual(windowMetadata(queries.p0BlackTwoSentences).stops,[32,57]);
assert.deepEqual(windowMetadata(queries.firstPhysicalApostrophe).apostrophes,[[61,3]]);
assert.deepEqual(windowMetadata(queries.firstPhysicalApostrophe).stops,[39,47,53,61]);

const historical = sourceFiles.historical.map(p => {
  let source = read(p);
  if (p.endsWith(".asc")) {
    source = source.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n\n");
  }
  return {name:path.basename(p),words:parseLatin(source)};
});

const solved = json(sourceFiles.solved).sections.map(section =>
  ({name:section.name,words:parseRunes(section.source_text).words}));
const editorial = parseLatin(read(sourceFiles.editorial));

const controls = [];
for (const name of ["0_warning","0_welcome","0_koan_1","0_loss_of_divinity","jpg107-167"]) {
  const donor = solved.find(s => s.name === name);
  assert(donor);
  const withheld = donor.words.slice(7,61);
  const size = windowMetadata(withheld);
  assert(size.runeCount>=150,"Solved controls must span >=150 actual GP runes");
  const trueMatch = compare(withheld,donor.words);
  assert.equal(trueMatch.exact,1,"Native GP positive must retrieve exactly");
  const foreignSource = solved.filter(s=>s.name!==name).map(s=>({
    name:s.name,...compare(withheld,s.words)
  })).filter(x=>x.fullMin!==null).sort((a,b)=>a.fullMin-b.fullMin);
  const unrelated = historical.map(s=>({
    name:s.name,...compare(withheld,s.words)
  })).filter(x=>x.fullMin!==null).sort((a,b)=>a.fullMin-b.fullMin);
  assert(foreignSource.every(x=>x.exact===0));
  assert(unrelated.every(x=>x.exact===0));
  controls.push({
    name,words:size.wordCount,runes:size.runeCount,trueMatch,
    nearestOtherNative:foreignSource[0]??null,
    nearestHistorical:unrelated[0]??null,
    independentEditorialLatin:compare(withheld,editorial)
  });
}

const historyMatches = Object.fromEntries(Object.entries(queries).map(([key,q])=>[
  key,historical.map(s=>({name:s.name,...compare(q,s.words)}))
]));
for (const rows of Object.values(historyMatches)) {
  assert(rows.every(x=>x.exact===0));
}

const mabinogion = json(sourceFiles.historicalLengthOnly[0]);
const agrippa = json(sourceFiles.historicalLengthOnly[1]);
const crowley = json(sourceFiles.historicalLengthOnly[2]);
const lengthOnlySources = [
  {name:"2012_mabinogion_all",list:mabinogion.mabinogion_story_word_lengths},
  {name:"2012_mabinogion_lady",list:mabinogion.lady_of_the_fountain_word_lengths},
  {name:"2012_gibson_agrippa",list:agrippa.word_lengths},
  ...crowley.chapters.map(x=>({name:"2013_crowley_chapter"+x.chapter,list:x.word_lengths}))
];
const lengthOnlyMatches = Object.fromEntries(Object.entries(queries).map(([key,q])=>[
  key,lengthOnlySources.map(s=>({name:s.name,...compareLengths(q,s.list)}))
]));
for (const rows of Object.values(lengthOnlyMatches)) {
  assert(rows.every(x=>x.exact===0));
}

const inputs = [
  sourceFiles.original,sourceFiles.alphabet,sourceFiles.apostrophes,
  sourceFiles.solved,sourceFiles.editorial,
  ...sourceFiles.historical,...sourceFiles.historicalLengthOnly
].map(p=>({
  path:p, sha256:crypto.createHash("sha256").update(fs.readFileSync(path.join(root,p))).digest("hex")
}));

const out = {
  schema:1,description:"Physical LP2 stop/apostrophe fingerprint with solved native and cross-edition gates",
  source: {originalRuneCount:original.runeTotal,unknownWordCount:2896},
  queryWindows:Object.fromEntries(Object.entries(queries).map(([k,q])=>[k,windowMetadata(q)])),
  historicalOriginalSearch:historyMatches,
  historicalLengthOnlySearch:lengthOnlyMatches,
  solvedControls:controls,sourceHashes:inputs,
  interpretation:"Neither source-selected unknown interval is an exact historical-source fingerprint. Same-native-edition solved controls retrieve uniquely; editorial Latin versions often lose original four-dot punctuation. No original ciphertext was deciphered."
};
process.stdout.write(JSON.stringify(out,null,2)+"\n");
