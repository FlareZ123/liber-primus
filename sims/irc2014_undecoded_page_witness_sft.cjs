'use strict';

/**
 * Recoverable May 2014-2016 Cicada source-crib audit.
 * Download source-era IRC transcripts byte-for-byte and look for claims that
 * name a Liber Primus page, plaintext/key and a decipherment operation.
 *
 * This scanner makes no decryption claim. All transcript evidence is untrusted.
 * Source SHA-1 checks are Git's `blob <size>\0<bytes>` identities.
 *
 * Run: node sims/irc2014_undecoded_page_witness_sft.cjs
 */
const https = require('node:https');
const crypto = require('node:crypto');

const base = 'https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/';
const sources = [
  { name: '#33012014.freenode.log', sha: 'a2880b1db31ce523599ef30ca2e55291bf295900', bytes: 8629610 },
  { name: '#cicadasolvers.freenode.log', sha: 'bdd277c14f94c34b5ae714cd00c238065beeed4e', bytes: 18487233 },
  { name: '#cicadasolvers.freenode.2.log', sha: '72634a9d071d32af767edbffc0493d810e88cd0d', bytes: 27234234 },
];

function getRaw(name) {
  return new Promise((resolve, reject) => {
    https.get(base + encodeURIComponent(name), (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}: ${name}`));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

/** @param {string} line */
function redact(line) {
  return line.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP]').slice(0, 360);
}

/** @param {string} line */
function score(line) {
  const l = line.toLowerCase();
  const hasBook = /liber[\s_-]*primus|liberprimus|\blp2\b/.test(l);
  const hasRune = /\brune(?:s|d)?\b|runic|gematria/.test(l);
  const hasPage = /\bpage[\s#:]*(?:0?[0-9]|[1-5][0-9])\b|\bp(?:0?[0-9]|[1-5][0-9])\b/.test(l);
  const hasMethod = /decrypt|decipher|plaintext|plain text|cryptanaly|\bkey\b|\bcrib\b|vigen[eè]re|solve[ds]?|solving|unsolved/.test(l);
  const hasClaim = /i (?:have |just |can |finally )?(?:decrypted|solved|found)|it says|translation|here is|means|decoded|breakthrough|first (?:rune|word|line)/.test(l);
  if (!(hasBook || hasRune || hasPage)) return 0;
  return (hasBook ? 5 : 0) + (hasRune ? 2 : 0) + (hasPage ? 3 : 0) +
    (hasMethod ? 4 : 0) + (hasClaim ? 3 : 0);
}

/** @param {Buffer} data @param {string} file */
function scan(data, file) {
  const lines = data.toString('utf8').split(/\r?\n/);
  const matches = [];
  const bookLines = [];
  for (let i = 0; i < lines.length; i++) {
    const s = score(lines[i]);
    if (s >= 7) matches.push({ line: i + 1, score: s, text: redact(lines[i]) });
    if (/liber[\s_-]*primus|\blp2\b/i.test(lines[i])) {
      bookLines.push({ line: i + 1, text: redact(lines[i]) });
    }
  }
  matches.sort((a, b) => b.score - a.score || a.line - b.line);
  console.log(`SOURCE ${file}; lines=${lines.length}; high_signal=${matches.length}; explicit_book=${bookLines.length}`);
  console.log(`BEGIN ${file}: ${redact(lines[0])}`);
  console.log(`END ${file}: ${redact(lines[lines.length - 2] || '')}`);
  console.log('HIGHEST SIGNAL (score >=7, max 75):');
  for (const m of matches.slice(0, 75)) {
    console.log(`  L${m.line} score${m.score} ${m.text}`);
  }
  const contextTargets = {
    '#cicadasolvers.freenode.log': [175235, 178134, 178803, 186651, 190223, 193676, 200358, 216040, 217218, 235420, 236703],
    '#cicadasolvers.freenode.2.log': [230620, 256472, 256507, 261448, 271355, 274598],
  };
  const targetLines = contextTargets[file] || [];
  console.log('FROZEN SOURCE CONTEXT (six preceding/following lines):');
  for (const center of targetLines) {
    console.log(`  CENTER ${file}:${center}`);
    for (let i = Math.max(0, center - 7); i < Math.min(lines.length, center + 6); i++) {
      console.log(`    L${i + 1}: ${redact(lines[i])}`);
    }
  }
  console.log('CHRONOLOGICAL EXPLICIT LP2/LIBER (first 35):');
  for (const m of bookLines.slice(0, 35)) {
    console.log(`  L${m.line} ${m.text}`);
  }
}

(async () => {
  for (const source of sources) {
    const bytes = await getRaw(source.name);
    const actual = crypto.createHash('sha1')
      .update(Buffer.from(`blob ${bytes.length}\0`))
      .update(bytes).digest('hex');
    if (bytes.length !== source.bytes || actual !== source.sha) {
      throw new Error(`Archive mismatch for ${source.name}: ${bytes.length} ${actual}`);
    }
    scan(bytes, source.name);
    console.log('PASS source byte-identity ' + source.name);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
