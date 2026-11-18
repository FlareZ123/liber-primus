'use strict';

/**
 * Reproduce the first-hand 9 Jan 2015 p25 totient/XOR candidate against the
 * original GP29 page, including the historical Python-2 UTF-8 grouping bug.
 * Standalone test: node sims/lp2_2015_thomasandfriends_p25_source_sft.cjs
 * Requires Node.js 22; no third-party modules. Network is used only to
 * retrieve the immutable 2015 primary-source Git commit.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REPO = 'thomasandfriends/Cicada3301Runes';
const COMMIT = '52e5c7e4827d81ffc705ef61ac0217c9bdd6ff35';
const PIN = {
  'data/runes.rune.old': '6b703270f93e7a2af40570442ccb4174830b3200',
  'data/bruterunes_findings.txt': 'a3e921cf505d9dc5e461733446dd9a860fedd6de',
  'scripts/bruterunes.py': 'd4e08c7556da18b5db8cdf39749b34d2c5b5246d'
};
const ALPHABET = Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛂᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ');
const NAMES = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const runeToIndex = new Map(ALPHABET.map((r, i) => [r, i]));
const bytesToIndex = new Map(ALPHABET.map((r, i) => [Buffer.from(r).toString('hex'), i]));

/** @param {Buffer} data */
function gitSha(data) {
  return crypto.createHash('sha1').update(Buffer.from('blob ' + data.length + '\0')).update(data).digest('hex');
}

/** @param {string} sourcePath */
async function pinnedSource(sourcePath) {
  const url = 'https://raw.githubusercontent.com/' + REPO + '/' + COMMIT + '/' + sourcePath;
  const response = await fetch(url);
  assert.equal(response.status, 200, 'Original Git source unavailable: ' + sourcePath);
  const data = Buffer.from(await response.arrayBuffer());
  assert.equal(gitSha(data), PIN[sourcePath], 'Source byte digest mismatch: ' + sourcePath);
  return data.toString('utf8');
}

/** @param {number} n */
function totient(n) {
  let remaining = n, result = n;
  for (let divisor = 2; divisor * divisor <= remaining; divisor++) {
    if (remaining % divisor !== 0) continue;
    while (remaining % divisor === 0) remaining /= divisor;
    result -= result / divisor;
  }
  if (remaining > 1) result -= result / remaining;
  return result;
}

/** @param {number[]} ciphertext */
function historicDecoder(ciphertext) {
  return ciphertext.map((c, i) => ((c ^ totient(i + 1)) + 14) % 29);
}

/** @param {number[]} ciphertext */
function transliterate(ciphertext) {
  return ciphertext.map(x => NAMES[x]).join('');
}

async function main() {
  const [raw, code, findings] = await Promise.all([
    pinnedSource('data/runes.rune.old'),
    pinnedSource('scripts/bruterunes.py'),
    pinnedSource('data/bruterunes_findings.txt')
  ]);
  assert.match(code, /tryDecrypt\(25,\s*3,\s*14,\s*3\)/);
  assert.ok(findings.includes('[25, 3, 14, 3, 0.1206896551724138]'));

  // Exactly the original Python-2 operation: drop full-line || and //
  // comments, split on doubled newlines, split words on U+2022,
  // then split raw UTF-8 bytes in units of three.
  const rawPages = raw.split('\n').filter(line => !line.startsWith('||') && !line.startsWith('//')).join('\n').split('\n\n');
  const oldWords = rawPages[25].split('•');
  const oldRuneValues = [], cleanRuneValues = [];
  let brokenTriplets = 0;
  for (const word of oldWords) {
    const bytes = Buffer.from(word, 'utf8');
    for (let i = 0; i + 3 <= bytes.length; i += 3) {
      const index = bytesToIndex.get(bytes.subarray(i, i + 3).toString('hex'));
      if (index === undefined) brokenTriplets++;
      oldRuneValues.push(index === undefined ? 0 : index);
    }
    for (const rune of Array.from(word)) {
      const index = runeToIndex.get(rune);
      if (index !== undefined) cleanRuneValues.push(index);
    }
  }
  const canon = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
  const canon25 = canon.pages.find(page => page.page === 25).indices;
  assert.deepEqual(cleanRuneValues, canon25, 'Independent modern source p25 mismatch');
  assert.equal(cleanRuneValues.length, 273);
  assert.equal(oldRuneValues.length, 273);
  assert.equal(brokenTriplets, 34);

  const historic = historicDecoder(oldRuneValues);
  const clean = historicDecoder(canon25);
  assert.equal(transliterate(clean.slice(0, 10)), 'DOEEMANGOESDD');
  assert.equal(transliterate(historic.slice(0, 10)), 'DOEEMANGOESDD');
  const scores = [...findings.matchAll(/\[25,\s*\d+,\s*\d+,\s*\d+,\s*([0-9.]+)\]/g)].map(x => Number(x[1]));
  assert.equal(scores.length, 1856);
  assert.equal(Math.max(...scores), 0.13793103448275862);
  let nonbijectiveAt = 0;
  for (let i = 0; i < canon25.length; i++) {
    const key = totient(i + 1);
    const outputs = new Set(Array.from({ length: 29 }, (_, c) => ((c ^ key) + 14) % 29));
    if (outputs.size !== 29) nonbijectiveAt++;
  }
  console.log(JSON.stringify({
    primaryCommit: COMMIT,
    page: 25,
    originalCiphertextRunes: canon25.length,
    historicPython2ThreeByteSlots: oldRuneValues.length,
    historicallyMalformedThreeByteSlots: brokenTriplets,
    best2015DictionaryScore: Math.max(...scores),
    frozenCandidateDictionaryScore: 0.1206896551724138,
    candidateKey: 'Euler totient phi(i+1)',
    candidateOperation: '((ciphertext XOR key) + 14) modulo 29',
    nonbijectiveKeystreamPositions: nonbijectiveAt,
    decodedCorrectlyParsedPrefix205: transliterate(clean.slice(0, 205)),
    decodedHistoricalParserPrefix205: transliterate(historic.slice(0, 205)),
    classification: 'original-period candidate attempt; no authenticated unknown-page plaintext'
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
