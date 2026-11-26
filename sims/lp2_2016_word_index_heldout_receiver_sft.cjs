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

const p55Geometry = {
  interior: 43,
  exterior: 33,
  total: 76,
  firstLine: 24,
  incomingCarry: 1
};
const motifPages = [33, 35, 38, 39];
const p39Address = p55Geometry.interior + p55Geometry.firstLine;
const p35Address = p55Geometry.total + p55Geometry.exterior + p55Geometry.incomingCarry;
const p39Receiver = receivers.find(r => r.page === 39 && r.start === p39Address);
const p35Receiver = receivers.find(r => r.page === 35 && r.start === 110);
const p39SuffixHValues = receivers.map(r => ({
  page: r.page,
  start: r.start,
  suffixH: hsum(r.values.slice(2))
}));
const p39SuffixH = p39Receiver ? hsum(p39Receiver.values.slice(2)) : null;
const p39SuffixHMatches = p39SuffixHValues.filter(x => x.suffixH === p39SuffixH);

function sortedFieldPacket(fields) {
  const sorted = Object.entries(fields).sort((a, b) => a[1] - b[1]);
  const positions = sorted.map(x => x[1]);
  return {
    sortedFields: sorted.map(([name, value]) => ({ name, value })),
    positions,
    oneBasedWords: positions.every(v => v >= 1 && v <= sourceWords.length)
      ? positions.map(v => sourceWords[v - 1])
      : null
  };
}

let p35TotientPacket = null;
if (p35Receiver) {
  const plain = gpWord('TOTIENT');
  const key = p35Receiver.values.map((v, i) => mod(v - plain[i]));
  const fields = {
    full: hsum(key),
    prefix: hsum(key.slice(0, 2)),
    carrier: gp0(p35Receiver.values),
    suffix: hsum(key.slice(2))
  };
  p35TotientPacket = {
    page: 35,
    start: p35Receiver.start,
    cipher: p35Receiver.values,
    plaintextWord: 'TOTIENT',
    plaintext: plain,
    residualKey: key,
    fields,
    sorted: sortedFieldPacket(fields)
  };
}

let p39CipherPacket = null;
if (p39Receiver) {
  const fields = {
    full: hsum(p39Receiver.values),
    prefix: hsum(p39Receiver.values.slice(0, 2)),
    carrier: gp0(p39Receiver.values),
    suffix: hsum(p39Receiver.values.slice(2))
  };
  p39CipherPacket = {
    page: 39,
    start: p39Receiver.start,
    cipher: p39Receiver.values,
    fields,
    sorted: sortedFieldPacket(fields),
    suffixH: hsum(p39Receiver.values.slice(2)),
    suffixWord: sourceWords[hsum(p39Receiver.values.slice(2)) - 1],
    suffixHUniqueAmong15: p39SuffixHMatches.length === 1,
    suffixHMatches: p39SuffixHMatches
  };
}

let p0DevotedSortedPacket = null;
if (p0DevotedReceiver) {
  const plain = gpWord('DEVOTED');
  const key = p0DevotedReceiver.values.map((v, i) => mod(v - plain[i]));
  const fields = {
    full: hsum(key),
    prefix: hsum(key.slice(0, 2)),
    carrier: gp0(p0DevotedReceiver.values),
    suffix: hsum(key.slice(2))
  };
  p0DevotedSortedPacket = {
    page: 0,
    start: p0DevotedReceiver.start,
    plaintextWord: 'DEVOTED',
    residualKey: key,
    fields,
    sorted: sortedFieldPacket(fields)
  };
}

const p55GeometryCrossPageAnchor = {
  geometry: p55Geometry,
  cuneiformArithmetic: {
    '1033': '43*24+1',
    '3301': '43*76+33'
  },
  candidateOffsets: {
    p39: {
      formula: '43+24',
      value: p39Address,
      receiverFound: Boolean(p39Receiver)
    },
    p35: {
      formula: '76+33+1',
      value: p35Address,
      receiverFound: Boolean(p35Receiver),
      caveat: 'Exploratory only: the p55 source-framing report already includes the incoming carry in the 33 exterior count, so the extra +1 is not independently justified.'
    }
  },
  motifPages,
  motifPageReceivers: receivers.filter(r => motifPages.includes(r.page))
    .map(r => ({ page: r.page, start: r.start, cipher: r.values })),
  p39CipherPacket,
  p35TotientPacket,
  p0DevotedSortedPacket,
  interpretation: 'The p39 suffix H-sum is candidate-independent and unique among the 15 physical 2|5 receivers. It points to 2016 word 9, DEVOTED. The p35 TOTIENT candidate has full H-sum 9; sorting its four numeric fields gives positions 9..12 and DEVOTED LIBER PRIMUS IS. This is a cross-page anchor, not a verified decryption.'
};

const output = {
  p55GeometryCrossPageAnchor,
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
