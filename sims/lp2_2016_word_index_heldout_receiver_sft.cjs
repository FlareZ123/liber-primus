#!/usr/bin/env node
'use strict';

// Held-out receiver test for the 2016 signed-message one-based word-index map.
// Run from any directory: node sims/lp2_2016_word_index_heldout_receiver_sft.cjs

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const mod = x => ((x % 29) + 29) % 29;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const frequencyText = read('resources/control/english_wordfreq_textblob.txt');

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gpWord(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (normalized.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = gpTokens.find(x => normalized.startsWith(x.symbol, i));
    if (!token) return null;
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

function shell(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left++, right--) {
    out.push(mod(values[left] - values[right]));
    out.push(mod(values[left] + values[right]));
  }
  if (values.length % 2) out.push(values[(values.length - 1) / 2]);
  return out;
}
const hsum = values => mod(shell(values).reduce((a, b) => a + b, 0));
const gp0 = values => mod(values.reduce((a, b) => a + b, 0));

const clearSigned = signed.split('-----BEGIN PGP SIGNATURE-----')[0]
  .replace('-----BEGIN PGP SIGNED MESSAGE-----', '')
  .replace(/^Hash:.*$/gm, '')
  .replace(/^\s*3301\s*$/gm, '')
  .replace(/\b7A35090F\b/g, '');
const sourceWords = (clearSigned.match(/[A-Za-z]+/g) || []).map(x => x.toUpperCase());
if (sourceWords.length !== 43) {
  throw new Error('Expected 43 alphabetic words in the complete signed 2016 message; got ' + sourceWords.length);
}

function projectOneBased(values) {
  const invalid = values.filter(v => v < 1 || v > sourceWords.length);
  const positions = [...new Set(values.filter(v => v >= 1 && v <= sourceWords.length))]
    .sort((a, b) => a - b);
  return {
    invalid,
    positions,
    words: positions.map(i => sourceWords[i - 1])
  };
}

// The printed transcription uses '%' page separators, '/' physical line breaks,
// and punctuation as word separators. p50 is a rune-free numeric table.
const segments = raw.split(/^\s*%\s*$/m).slice(0, 55);
const receivers = [];
for (let segment = 0; segment < segments.length; segment++) {
  let offset = 0;
  let values = [];
  let start = 0;
  let breaks = [];
  const flush = () => {
    if (values.length === 7 && breaks.length === 1 && breaks[0] === 2) {
      receivers.push({
        page: segment >= 50 ? segment + 1 : segment,
        start,
        values: values.slice()
      });
    }
    values = [];
    breaks = [];
  };
  for (const ch of [...segments[segment]]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!values.length) start = offset;
      values.push(value);
      offset++;
    } else if (ch === '/') {
      if (values.length) breaks.push(values.length);
    } else if (/\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
}

const general = new Map();
for (const line of frequencyText.split(/\r?\n/u)) {
  const match = /^([a-zA-Z]+)\s+(\d+)$/u.exec(line.trim());
  if (!match) continue;
  const values = gpWord(match[1]);
  if (!values || values.length !== 7) continue;
  const id = values.join(',');
  if (!general.has(id)) general.set(id, { values, words: [] });
  general.get(id).words.push(match[1].toUpperCase());
}
const candidates = [...general.values()];

const fieldNames = ['full', 'prefix', 'carrier', 'suffix'];
const permutations = [];
function permute(remaining, prefix = []) {
  if (!remaining.length) {
    permutations.push(prefix);
    return;
  }
  for (let i = 0; i < remaining.length; i++) {
    permute(remaining.slice(0, i).concat(remaining.slice(i + 1)), prefix.concat(remaining[i]));
  }
}
permute(fieldNames);

const hits = [];
for (const receiver of receivers) {
  const carrier = gp0(receiver.values);
  for (const candidate of candidates) {
    for (const direction of ['C-P', 'P-C']) {
      const key = receiver.values.map((c, i) =>
        direction === 'C-P' ? mod(c - candidate.values[i]) : mod(candidate.values[i] - c));
      const field = {
        full: hsum(key),
        prefix: hsum(key.slice(0, 2)),
        carrier,
        suffix: hsum(key.slice(2))
      };
      for (const order of permutations) {
        const signature = order.map(name => field[name]);
        if (signature[1] !== signature[0] + 1 ||
            signature[2] !== signature[1] + 1 ||
            signature[3] !== signature[2] + 1) continue;
        hits.push({
          page: receiver.page,
          start: receiver.start,
          candidate: candidate.words[0],
          aliases: candidate.words,
          direction,
          fieldOrder: order.join('>'),
          key,
          signature,
          oneBasedWords: signature.every(v => v >= 1 && v <= sourceWords.length)
            ? signature.map(v => sourceWords[v - 1])
            : null
        });
      }
    }
  }
}

function residualProjection(cipher, plaintextWord) {
  const plaintext = gpWord(plaintextWord);
  if (!plaintext || plaintext.length !== cipher.length) {
    throw new Error('Plaintext control does not match ciphertext length: ' + plaintextWord);
  }
  const cMinusP = cipher.map((v, i) => mod(v - plaintext[i]));
  const pMinusC = cipher.map((v, i) => mod(plaintext[i] - v));
  return {
    plaintextWord,
    cMinusP: { key: cMinusP, projection: projectOneBased(cMinusP) },
    pMinusC: { key: pMinusC, projection: projectOneBased(pMinusC) }
  };
}

const p0TitleCipher = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const titleControls = {};
for (const title of ['EPIPHANY WORDS', 'EPIPHANY SEEKS']) {
  const plain = title.split(/\s+/u).flatMap(gpWord);
  const key = p0TitleCipher.map((v, i) => mod(v - plain[i]));
  titleControls[title] = { plaintext: plain, key, projection: projectOneBased(key) };
}

const p0DevotedReceiver = receivers.find(r => r.page === 0 && r.start === 237);
const p0DevotedControls = p0DevotedReceiver
  ? ['DEVOTED', 'DEVOTEE', 'DEVOTION'].map(word => ({
      ...residualProjection(p0DevotedReceiver.values, word)
    }))
  : [];

const p35FoundCipher = [19, 17, 19, 24, 11];
const p38FoundCipher = [19, 25, 22, 26, 3];
const foundHoldouts = [
  { page: 35, start: 25, cipher: p35FoundCipher },
  { page: 38, start: null, cipher: p38FoundCipher }
].map(x => ({
  page: x.page,
  start: x.start,
  ...residualProjection(x.cipher, 'FOUND')
}));

const output = {
  sourceWordCount: sourceWords.length,
  sourceWords,
  physicalTwoFiveReceiverCount: receivers.length,
  receivers: receivers.map(r => ({ page: r.page, start: r.start, cipher: r.values })),
  generalEnglishGpVectorCount: candidates.length,
  keySignsTested: ['C-P', 'P-C'],
  fieldOrdersTested: permutations.length,
  hitCount: hits.length,
  hits,
  titleControls,
  p0DevotedControls,
  independentlyRecoveredFoundHoldouts: foundHoldouts,
  note: 'Candidate-generation result only. A hit does not establish a cipher or plaintext; receiver location and field order still require source selection.'
};
console.log(JSON.stringify(output, null, 2));
