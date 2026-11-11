#!/usr/bin/env node
'use strict';

// Source-constrained test of the mirrored footer at LP2 p22 (archive image 39).
// Run from any directory: node sims/lp2_body_strip_mirror_gate.cjs
//
// Control: LP1 segment 0.5 from pnotisdev/cicada3301@15200c67abee106913ba01ff504c5b6e88d16cc7,
// work/ref/lp_verified.txt. Its method/key and literal-F positions are in
// work/ref/lp_keys.txt and work/lp.py (KNOWN[5]). Target: this repository's
// transcription, checked exactly against resources/liber-primus/lp2-corpus.json.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const TRANSCRIPTION = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8');
const WORDFREQ = fs.readFileSync(path.join(ROOT, 'resources/control/english_wordfreq_textblob.txt'), 'utf8');

const CONTROL_SEGMENT_05_RAW = [
  '%',
  'ᚪ-ᛋᚹᚪᛁ.ᛈᚢᛟᚫ-ᛈ-ᚠᛖᚱᛋᛈᛈ-ᚦᛗ-ᚾᚪᚱ/',
  'ᛚᚹᛈ-ᛖᚩᛈᚢᛠᛁᛁᚻᛞ-ᛚᛟ-ᛠ.ᛄᛖ-/',
  'ᛠ-ᛁᚫ-ᚷᛖ-ᚦᛟᛁᛞᛟ-ᛝᚠ-ᛄᛖ-ᛞᛁᛉᚾᚢ/',
  'ᛚᚠᚻᚱᚹᛈᛞᛡ-ᚻᚹ-ᛋᚳᛉᛞ.ᚻᛡᛖᛡ-ᛠᚱ/',
  'ᛉᛖᛇ-ᛒᚹ-ᛠ-ᛋᛒᛚᛞᚹᛈᚳ-ᚫᚩ-ᚹᛉᛞᚪᚪᛄᛠ/',
  '-ᚹᚣᛠᚳ-ᛄᚪᚳ-ᛗᚾᛈᛏ-ᚩᚻ-ᛗᛈᛗᚳᛡᚱ-ᚱᚪ/',
  'ᛚᛡ-ᛁᛒ-ᚠᛋ-ᛈ-ᚳᛝᛗᚳᚹ-ᛁᛗᛗᛁᚪᚻ-ᚣᛝᚳᛟ-ᛒ/',
  'ᛠᛇ.ᛁ-ᚱᚹᚾᛒ-ᛡᚪᛗᛟ-ᛈ-ᛁᚩᛠᚳᛠ-ᛉ/',
  'ᚾ-ᛚᛏ-ᚻᛒᛡ-ᛚᛇᚢᚪᚻᚣ-ᚷᛖ-ᛏᚷᚢᛇᛟᛡᚫ-/',
  'ᚪᛡᛞ-ᛖᛟ-ᚱᚫᚠᛋᚹᛡ-ᚣᛗᛋ-ᚣᚪᛗᛡ-ᛏᚱ-ᚷᛖ/',
  'ᚾᚪ-ᛚᛡ-ᛗᛈᛋᚣᛟᚱ.ᚩᚻ-ᛗᛈᛗᚳᛡᚱ-ᚱᛏᛈᛒ/',
  '%',
  'ᛈᛗᛈ-ᚦᚹ-ᛗᚳᛁᛞᚹᚾᚣ-ᛠᚾᚪ-ᚳᚪᛠᛡ-ᛚᛡ-/',
  'ᚢᛝᛁᛋᛟ-ᚦᚫᚷ-ᛄᛗᛗᚳ-ᚪᚪᛠᛞ-ᚹᚹᚢ-ᚾᛉᚢ/',
  'ᚹ-ᛈᛝ-ᛁᚩᛠᚳᛠ-ᛉᚾ-ᛡᛟᚢᛟ-ᛇᛒᚩ-ᛁᚱ-ᚦᛠ-/',
  'ᛉ.ᚪᛁᛈ-ᚦᚹ-ᛗᚳᛁᛞᚹᚾᚣᛗ-ᚹᛗᛞᛖ-ᚹᛈᚾ/',
  'ᛗᚷᚣᛏᛠᛈᛖᚪ./',
  '&'
].join('\n');

const LATIN = [
  'F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S',
  'T','B','E','M','L','ING','OE','D','A','AE','Y','IA','EA'
];
const runeIndex = new Map(CORPUS.runes.map((r, i) => [r, i]));
const translitIndex = new Map(CORPUS.translit.map((r, i) => [r, i]));
const KEY = [...'FIRFUMFERENFE'].map(ch => translitIndex.get(ch));
if (KEY.some(x => x === undefined)) throw new Error('LP1 control key is not representable in the local GP alphabet.');

function tokenize(text) {
  const out = [];
  for (const ch of text) {
    if (runeIndex.has(ch)) out.push(runeIndex.get(ch));
    else if (ch === '-') out.push(' ');
    else if (ch === '.') out.push('.');
    else if (ch === '/') out.push('\n');
    else if (ch === '%' || ch === '&') out.push(ch);
    // Physical newlines in the transcription file are formatting; '/' is
    // the actual line-wrap token.
  }
  return out;
}

function targetSegment011() {
  const pages = TRANSCRIPTION.split('%');
  if (pages.length !== 57) throw new Error('Expected 57 rune-bearing page groups; got ' + pages.length + '.');
  const p15 = pages[15];
  const p22 = pages[22];
  const start = p15.indexOf('$');
  const end = p22.indexOf('&');
  if (start < 0 || end < 0) throw new Error('Could not locate the 0.10/0.11 and segment-end markers.');
  const text = p15.slice(start + 1) + pages.slice(16, 22).join('%') + p22.slice(0, end);
  const tokens = tokenize(text);
  const actual = tokens.filter(x => typeof x === 'number');
  const expected = CORPUS.pages
    .filter(p => p.page >= 15 && p.page <= 22)
    .flatMap(p => p.indices)
    .slice(9); // The first nine runes on p15 are the separate 0.10 segment.
  if (actual.length !== 1894 || actual.length !== expected.length ||
      actual.some((x, i) => x !== expected[i])) {
    throw new Error('Extracted 0.11 does not exactly match the original page-index corpus.');
  }
  return tokens;
}

function reverseLines(tokens) {
  const out = [];
  let line = [];
  for (const x of tokens) {
    if (x === '\n' || x === '%') {
      out.push(...line.reverse(), x);
      line = [];
    } else line.push(x);
  }
  out.push(...line.reverse());
  return out;
}

function normalize(word) {
  let w = word.toUpperCase().replace(/QU/g, 'CW');
  for (const [a, b] of [
    ['V','U'],['K','C'],['Q','C'],['Z','S'],['IA','IO'],['IING','NG'],['ING','NG']
  ]) w = w.replaceAll(a, b);
  return w;
}

const COMMON = 'A AN THE OF TO AND IN IS IT YOU THAT HE WAS FOR ON ARE AS WITH HIS THEY I AT BE THIS HAVE FROM OR ONE HAD BY WORD BUT NOT WHAT ALL WERE WE WHEN YOUR CAN SAID THERE USE EACH WHICH SHE DO HOW THEIR IF WILL UP OTHER ABOUT OUT MANY THEN THEM THESE SO SOME HER WOULD MAKE LIKE HIM INTO TIME HAS LOOK TWO MORE WRITE GO SEE NUMBER NO WAY COULD PEOPLE MY THAN FIRST WATER BEEN CALL WHO OIL ITS NOW FIND DOWN DAY DID GET COME MADE MAY PART OWN WITHIN TRUTH TRUE KNOW BOOK BELIEVE NOTHING EXCEPT DEATH SACRED SELF DIVINITY PRIMES WISDOM INSTRUCTION WARNING WELCOME KOAN END PARABLE LIKE INSTAR EMERGE SURFACE CIRCUMFERENCE SHED OUR MUST BECOME CONSUMPTION TEST KNOWLEDGE EXPERIENCE'.split(/\s+/);

function loadWeights() {
  const weights = new Map();
  for (const word of COMMON) weights.set(normalize(word), 1);
  const rows = WORDFREQ.split(/\r?\n/)
    .filter(line => line && !line.startsWith(';'))
    .map(line => line.trim().split(/\s+/))
    .filter(parts => parts.length >= 2 && /^\d+$/.test(parts[parts.length - 1]))
    .map(parts => ({ word: parts.slice(0, -1).join(' '), count: Number(parts[parts.length - 1]) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10000);
  for (let i = 0; i < rows.length; i++) {
    const word = normalize(rows[i].word);
    weights.set(word, Math.max(weights.get(word) || 0, 1 - 0.5 * i / 10000));
  }
  return weights;
}
const WEIGHTS = loadWeights();

function runesOf(tokens) {
  return tokens.filter(x => typeof x === 'number');
}

function wordSpans(tokens, plain) {
  const spans = [];
  let current = '';
  let start = 0;
  let pos = 0;
  for (const x of [...tokens, ' ']) {
    if (typeof x === 'number') {
      if (!current) start = pos;
      current += LATIN[plain[pos]];
      pos++;
    } else if (x === '\n' || x === '%') {
      continue;
    } else if (current) {
      spans.push([current, start, pos]);
      current = '';
    }
  }
  return spans;
}

function wordScore(tokens, plain, lo = 0, hi = Infinity) {
  const spans = wordSpans(tokens, plain).filter(([, a, b]) => b > lo && a < hi);
  const total = spans.reduce((s, [, a, b]) => s + b - a, 0);
  return total
    ? spans.reduce((s, [w, a, b]) => s + (b - a) * (WEIGHTS.get(normalize(w)) || 0), 0) / total
    : 0;
}

function decode(cipher, literalF) {
  const plain = [];
  let keyPos = 0;
  for (let i = 0; i < cipher.length; i++) {
    if (literalF.has(i)) {
      plain.push(cipher[i]);
      continue;
    }
    plain.push((cipher[i] - KEY[keyPos % KEY.length] + 29) % 29);
    keyPos++;
  }
  return plain;
}

function findLiteralF(tokens, window = 40, beam = 16) {
  const cipher = runesOf(tokens);
  const fPositions = [];
  cipher.forEach((x, i) => { if (x === 0) fPositions.push(i); });
  let states = [[]];
  for (const pos of fPositions) {
    const candidates = new Map();
    for (const state of states) {
      candidates.set(state.join(','), state);
      const added = [...state, pos];
      candidates.set(added.join(','), added);
    }
    states = [...candidates.values()]
      .map(state => ({
        state,
        score: wordScore(tokens, decode(cipher, new Set(state)), 0, pos + window)
      }))
      .sort((a, b) => b.score - a.score || a.state.length - b.state.length)
      .slice(0, beam)
      .map(x => x.state);
  }
  return states
    .map(state => ({ state, plain: decode(cipher, new Set(state)) }))
    .map(x => ({ ...x, score: wordScore(tokens, x.plain) }))
    .sort((a, b) => b.score - a.score || a.state.length - b.state.length)[0];
}

function ioc(plain) {
  const counts = Array(29).fill(0);
  for (const x of plain) counts[x]++;
  const n = plain.length;
  return 29 * counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}

function preview(tokens, plain) {
  const words = wordSpans(tokens, plain).map(([w]) => w);
  return { first: words.slice(0, 18), last: words.slice(-8) };
}

function summarize(tokens) {
  const result = findLiteralF(tokens);
  return {
    runes: runesOf(tokens).length,
    literal_f_positions: result.state,
    dictionary_score: Number(result.score.toFixed(6)),
    normalized_ioc: Number(ioc(result.plain).toFixed(6)),
    preview: preview(tokens, result.plain)
  };
}

const controlTokens = tokenize(CONTROL_SEGMENT_05_RAW);
const control = summarize(controlTokens);
if (control.runes !== 319 || control.literal_f_positions.join(',') !== '49,58') {
  throw new Error('LP1 segment 0.5 positive control failed; expected 319 runes and literal-F positions 49,58.');
}

const target = targetSegment011();
const forward = summarize(target);
const mirrored = summarize(reverseLines(target));
if (forward.runes !== 1894 || mirrored.runes !== 1894) {
  throw new Error('LP2 segment 0.11 length check failed.');
}

console.log(JSON.stringify({
  source_key: 'FIRFUMFERENFE',
  key_indices: KEY,
  control_lp1_segment_0_5: control,
  lp2_segment_0_11_forward: forward,
  lp2_segment_0_11_mirrored_lines: mirrored,
  decision: 'The LP1 key plus right-to-left line reading does not recover LP2 plaintext.'
}, null, 2));
