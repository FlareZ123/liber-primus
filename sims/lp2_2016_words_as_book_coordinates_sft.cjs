#!/usr/bin/env node
'use strict';

// Bounded transfer test: GP prime-sum(word) -> 2012 book line,
// GP-word-length(word) -> character. No modulo, offsets, or key fitting.
// Node 18+; optional --agrippa=PATH and --britannica=PATH avoid network fetches.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_COMMIT = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const BASE = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' + SOURCE_COMMIT +
  '/2012/006-two-book-codes/books/';
const SOURCES = {
  agrippa: {
    url: BASE + 'agrippa.txt',
    blob: '673ba225d1277945f2d2e5056bf025db8e89bb92',
    local: process.argv.find(x => x.startsWith('--agrippa='))?.slice(10)
  },
  britannica: {
    url: BASE + '31447.txt',
    blob: '8cba4356812ff852e3fe9c88e80ab1e9b5b8670c',
    local: process.argv.find(x => x.startsWith('--britannica='))?.slice(13)
  }
};

function gitBlobSha(bytes) {
  const header = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, bytes])).digest('hex');
}

async function loadSource(spec, name) {
  let bytes;
  if (spec.local) {
    bytes = fs.readFileSync(path.resolve(spec.local));
  } else {
    const response = await fetch(spec.url);
    if (!response.ok) throw new Error(name + ' fetch failed: HTTP ' + response.status +
      '. Supply --' + name + '=PATH to a local copy.');
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const actual = gitBlobSha(bytes);
  if (actual !== spec.blob) {
    throw new Error(name + ' Git blob mismatch: expected ' + spec.blob + ', got ' + actual);
  }
  return bytes.toString('utf8');
}

function readRepoFile(relative) {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

function extractCoordinate(lines, line, character, source, cicadaIndex) {
  const index = source === 'agrippa' ? line - 1 : cicadaIndex + line;
  const row = lines[index];
  if (!row || character < 1 || character > row.length) return null;
  return row[character - 1];
}

const AGRIPPA_CONTROL = [
  [1,5], [152,24], 6, [14,13], [7,36], [12,10], [7,16], [24,3],
  [271,22], [10,7], [13,28], [12,7], [86,17], [93,14], 6,
  [16,7], [96,4], [19,13], [47,2], [71,22], [75,9], [77,4]
];
const BRITANNICA_CONTROL = [
  [1,29], [6,46], 6, [2,37], [14,41], [17,3], [27,40], 2,
  [2,33], [1,1], [7,45], [17,29], [21,31], [12,17], 6,
  [22,42], [15,18], [24,33], [27,46], [12,29], [25,66], [7,47]
];

function controlText(vector, lines, source, cicadaIndex) {
  return vector.map(item => {
    if (typeof item === 'number') return String(item);
    return extractCoordinate(lines, item[0], item[1], source, cicadaIndex) || '?';
  }).join('').toLowerCase();
}

function runExtraction(rows, lines, source, cicadaIndex, lengthField) {
  let output = '';
  let valid = 0;
  for (const row of rows) {
    const char = extractCoordinate(lines, row.primeSum, row[lengthField], source, cicadaIndex);
    if (char === null) output += '?';
    else { output += char; valid++; }
  }
  return {
    valid,
    total: rows.length,
    coverage: Number((valid / rows.length).toFixed(6)),
    prefix: output.slice(0, 64),
    suffix: output.slice(-32),
    full: rows.length <= 50 ? output : undefined
  };
}

function main() {
  return Promise.all([
    loadSource(SOURCES.agrippa, 'agrippa'),
    loadSource(SOURCES.britannica, 'britannica')
  ]).then(([agrippaText, britannicaText]) => {
    const corpus = JSON.parse(readRepoFile('resources/liber-primus/lp2-corpus.json'));
    const transcription = readRepoFile('resources/lp2-transcription.txt');
    const signed = readRepoFile('resources/historical/cicada2016-4gq25-outguess.asc');

    const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
    const raw = transcription.split('%').slice(0, 55).join('');
    const normalized = raw.replace(/[\/\r\n]/g, '')
      .replace(/[&$§]/g, ' ')
      .replace(/[-.]/g, ' ');
    const lp2Words = normalized.split(/\s+/)
      .map(s => Array.from(s).filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch)))
      .filter(a => a.length);
    const lp2Rows = lp2Words.map(a => ({
      primeSum: a.reduce((sum, i) => sum + corpus.prime[i], 0),
      gpLen: a.length,
      alphaLen: a.reduce((sum, i) => sum + corpus.translit[i].length, 0)
    }));
    const lp2Runes = lp2Rows.reduce((sum, row) => sum + row.gpLen, 0);
    if (lp2Rows.length !== 2896 || lp2Runes !== 12956) {
      throw new Error('LP2 parse mismatch: expected 2896 words / 12956 runes; got ' +
        lp2Rows.length + ' / ' + lp2Runes);
    }

    // This is the same 43-word extraction used by the existing signed-message
    // compass SFT. K/V/Z normalization is a test convention, not an authenticated
    // LP2 instruction; it is disclosed rather than silently inferred.
    const body = signed.slice(signed.indexOf('Hello.'), signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
    const asciiWords = body.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
    if (asciiWords.length !== 43) throw new Error('Expected 43 signed-message words; got ' + asciiWords.length);

    const tokens = corpus.translit.map((token, i) => ({ token: token.toLowerCase(), i }))
      .sort((a, b) => b.token.length - a.token.length);
    function encodeAsciiWord(word) {
      const value = word.toLowerCase().replace(/v/g, 'u').replace(/k/g, 'c').replace(/z/g, 's');
      const indices = [];
      for (let pos = 0; pos < value.length;) {
        const token = tokens.find(t => value.startsWith(t.token, pos));
        if (!token) throw new Error('Unmapped ASCII letter in signed word: ' + word);
        indices.push(token.i);
        pos += token.token.length;
      }
      return indices;
    }
    const signedRows = asciiWords.map(word => {
      const indices = encodeAsciiWord(word);
      return {
        primeSum: indices.reduce((sum, i) => sum + corpus.prime[i], 0),
        gpLen: indices.length,
        alphaLen: word.length
      };
    });

    const agrippaLines = agrippaText.split(/\r?\n/).slice(5); // agrippa.py
    const britannicaLines = britannicaText.split(/\r?\n/);
    const cicadaIndex = britannicaLines.findIndex(line => line.startsWith('CICADA'));
    if (agrippaLines.length !== 344 || cicadaIndex !== 15388) {
      throw new Error('Pinned source layout changed: Agrippa lines=' + agrippaLines.length +
        ', Britannica CICADA index=' + cicadaIndex);
    }

    const agrippaControl = controlText(AGRIPPA_CONTROL, agrippaLines, 'agrippa', -1);
    const britannicaControl = controlText(BRITANNICA_CONTROL, britannicaLines, 'britannica', cicadaIndex);
    if (agrippaControl !== 'sq6wmgv2zcsrix6t.onion') throw new Error('Agrippa positive control failed: ' + agrippaControl);
    if (britannicaControl !== 'eq6emgv2ehsrix6t.onion') throw new Error('Britannica positive control failed: ' + britannicaControl);

    const results = {};
    for (const [name, lines, index] of [
      ['agrippa', agrippaLines, -1],
      ['britannica', britannicaLines, cicadaIndex]
    ]) {
      for (const lengthField of ['gpLen', 'alphaLen']) {
        results['lp2_' + name + '_' + lengthField] =
          runExtraction(lp2Rows, lines, name, index, lengthField);
        results['signed43_' + name + '_' + lengthField] =
          runExtraction(signedRows, lines, name, index, lengthField);
      }
    }

    process.stdout.write(JSON.stringify({
      hypothesis: 'GP prime-sum(word) -> book line; GP-word-length(word) -> character',
      sourceCommit: SOURCE_COMMIT,
      sourceGitBlobs: { agrippa: SOURCES.agrippa.blob, britannica: SOURCES.britannica.blob },
      positiveControls: { agrippa: agrippaControl, britannica: britannicaControl },
      lp2: { words: lp2Rows.length, runes: lp2Runes,
        maxPrimeSum: Math.max(...lp2Rows.map(x => x.primeSum)) },
      signed2016: { words: asciiWords.length, normalization: 'v->u, k->c, z->s',
        primeSums: signedRows.map(x => x.primeSum) },
      results
    }, null, 2) + '\n');
  });
}

main().catch(error => {
  process.stderr.write(String(error.stack || error) + '\n');
  process.exitCode = 1;
});
