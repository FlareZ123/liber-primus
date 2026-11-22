'use strict';
/**
 * Search all authentic unknown LP2 word-length fingerprints against
 * source-authored and public-domain full-text reference corpora.
 * Exact contiguous matches only, with fixed char and GP29-digraph
 * length conventions, no text scoring or key guesses.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_original_wordlength_source_crib_search_sft.cjs
 *
 * The known p56 plaintext in lp1-plaintext-reference.txt supplies a
 * POSITIVE calibration. It is excluded from original unknown input.
 * Optional additional UTF-8 text filenames can be supplied as argv.
 * Standard bundled corpora are read by absolute path relative to repo.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.resolve(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = read('resources/liber-primus/lp2-transcription.txt');
const runes = new Set(corpus.runes);
const syllables = corpus.translit.filter(s => s.length > 1).sort((a, b) => b.length - a.length);
const breakGlyphs = new Set(['-', '.', ',', ';', ':', '&', '$', '§']);
const sections = original.split('%');
assert.equal(sections.length, 57);
/**
 * Printed slash, physical line/page break are transparent in words.
 * Cicada printed separator is '-', clause punctuation terminates word.
 * The 55 original *rune-bearing* unknown sections are p0–49, p51–55:
 * numeric-only p50 is deliberately absent in the transcribed rune text.
 * The separate final two sections are solved p56 and p57.
 * @param {string} source @returns {{ length:number, offset:number, section:number }[]}
 */
function parseRunic(source) {
  const words = [];
  let length = 0, offset = 0, section = 0, start = 0;
  for (const ch of source) {
    if (runes.has(ch)) {
      if (length === 0) start = offset;
      length++;
      offset++;
    } else if (breakGlyphs.has(ch)) {
      if (length) words.push({length, offset:start, section});
      length = 0;
    } else if (ch === '%') section++;
  }
  if (length) words.push({length, offset:start, section});
  return words;
}
const cipherWords = parseRunic(sections.slice(0, 55).join('%'));
const total = cipherWords.reduce((n, w) => n + w.length, 0);
assert.equal(total, 12956);
assert.equal(cipherWords.length, 2896);
const knownWords = parseRunic(sections[55]);
assert.equal(knownWords.reduce((n, w) => n + w.length, 0), 85);
const refs = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/control/orthodox_daily_prayers_pg34981.txt',
  'resources/control/blake_song_of_liberty_train.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt',
  'resources/control/cicada2012_blake_chorus.txt',
  ...process.argv.slice(2)
];
/** @param {string} t @returns {string[]} */
function sourceWords(t) {
  return Array.from(t.toUpperCase().matchAll(/[A-Z]+(?:['’][A-Z]+)*/g),
    x => x[0].replace(/[^A-Z]/g, ''));
}
/**
 * Conventional GP29 has TH, NG, EO, OE, AE, IA, EA as single symbols.
 * This is a frozen *heuristic orthography*; the solved source can vary
 * (e.g. I/J, V/U). A corpus miss cannot reject an actual quotation.
 * @param {string} word @returns {number}
 */
function gpLength(word) {
  let n = 0;
  for (let i = 0; i < word.length;) {
    const pair = syllables.find(k => word.startsWith(k, i));
    i += pair ? pair.length : 1;
    n++;
  }
  return n;
}
/** @param {number[]} x @param {number} start @param {number} width @returns {string} */
function key(x, start, width) {
  return x.slice(start, start + width).join(',');
}
/**
 * Returns unique maximally extended exact word-length matches.
 * Search's 8-window index is only an accelerator, not a significance
 * threshold. Each returned candidate is exact and from unmodified
 * original word counts (not runes, cipher shifts, or plaintext scores).
 * @param {{length:number, offset:number, section:number}[]} target
 * @param {string[]} words
 * @param {'plain'|'gp'} mode
 * @param {number} [width=8]
 */
function match(target, words, mode, width=8) {
  const a = target.map(w => w.length);
  const b = words.map(w => mode === 'gp' ? gpLength(w) : w.length);
  const index = new Map();
  for (let i=0; i+width<=a.length; i++) {
    const h = key(a,i,width);
    if (!index.has(h)) index.set(h,[]);
    index.get(h).push(i);
  }
  const seen = new Set();
  const matches = [];
  for (let j=0; j+width<=b.length; j++) {
    const hits = index.get(key(b,j,width));
    if (!hits) continue;
    for (const i of hits) {
      let ai=i,bj=j,ae=i+width,be=j+width;
      while (ai>0 && bj>0 && a[ai-1]===b[bj-1]) {ai--;bj--;}
      while (ae<a.length && be<b.length && a[ae]===b[be]) {ae++;be++;}
      const exact=ae-ai;
      if (exact<8) continue;
      const sig=ai+':'+bj+':'+exact;
      if (seen.has(sig)) continue;
      seen.add(sig);
      matches.push({
        matchedWords:exact,
        originalWordStart:ai,
        originalRuneOffset:target[ai].offset,
        originalSection:target[ai].section,
        sourceWordStart:bj,
        plainText:words.slice(bj,Math.min(be,bj+24)).join(' '),
        lengths:key(a,ai,Math.min(exact,24))
      });
    }
  }
  return matches.sort((a,b)=>b.matchedWords-a.matchedWords || a.originalWordStart-b.originalWordStart);
}
// Full-length native-GP positive: the openly solved p56 prose is already
// preserved in the LP1 reference. Its *length* sequence must be found.
const lps=sourceWords(read('resources/liber-primus/lp1-plaintext-reference.txt'));
const positive=match(knownWords,lps,'gp');
assert(positive.length && positive[0].matchedWords >= 12);
console.log('Native GP solved-p56 positive', positive[0].matchedWords,
  'source:',positive[0].plainText);
const all=[];
for (const file of refs) {
  const words=sourceWords(read(file));
  for(const orthography of ['plain','gp']) {
    const matches=match(cipherWords,words,orthography);
    all.push({file,orthography,sourceWords:words.length,
      longestExactWords:matches[0]?.matchedWords || 0,
      originalMatchesAtLeast10:matches.filter(m => m.matchedWords>=10).length,
      topDistinct:matches.filter(m=>m.matchedWords>=9).slice(0,5)});
  }
}
assert.equal(all.find(x=>x.file.includes('shakespeare')&&x.orthography==='plain').longestExactWords,9);
assert.equal(all.find(x=>x.file.includes('emerson')&&x.orthography==='plain').longestExactWords,10);
assert.equal(all.find(x=>x.file.includes('orthodox')&&x.orthography==='gp').longestExactWords,10);
assert(all.slice(0, 14).every(x => x.longestExactWords <= 10),
  'A bundled original-source control changed; inspect it before using this result');
const newlySelectedLongMatches = all.slice(14).filter(x => x.longestExactWords >= 14);
if (newlySelectedLongMatches.length) console.log('EXAMINE POTENTIAL EXTERNAL SOURCE CRIB', JSON.stringify(newlySelectedLongMatches));
console.log(JSON.stringify({
  status:'PASS: 2896 original unknown-word source fingerprint compared to seven full texts',
  originalRunes:total, originalPrintedWords:cipherWords.length,
  sourceMatchThreshold:8, recoveredAuthenticUnknownPlaintext:0,
  sourceOnlyLimits:'No >10-length match in these references; no bound on external quotations. Manuscript GP symbols may use non-greedy historical orthography or paraphrase.',
  knownP56Control:positive[0], matches:all
}, null, 2));
