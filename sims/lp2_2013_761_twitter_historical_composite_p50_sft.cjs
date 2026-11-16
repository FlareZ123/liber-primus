'use strict';

/**
 * First-party 2013 Twitter XOR-mask positive control, then original LP2 p50
 * direct-byte receiver gate. Read-only except for in-memory HTTPS downloads.
 * Run with Node.js 22 from the repository root.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');

const sourceCommit = 'ade9a02889ef8acbc8cde8edbfd0a785c369f4c3';
const source = 'https://raw.githubusercontent.com/neuroretransmit/cicada/' +
  sourceCommit + '/2013/003-twitter/';
const files = [
  ['560.13%5E761.mp3.bin', '2b4d661ab1b56c64337dd31cb0c27f7b13e107ff', 4010732],
  ['twitter.bin', 'ba1866f89b31a7bd816eb6307eda56bdbd083674', 64167],
  ['b64.txt', '3cf34e331497e7e85c6707c22d07e500397cc794', 64167]
];

/** @param {string} url @returns {Promise<Buffer>} */
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'liber-primus-source-gate' } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error('HTTP ' + res.statusCode + ' at ' + url));
        return;
      }
      /** @type {Buffer[]} */
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {Buffer} data @returns {string} */
function gitBlobSha(data) {
  const header = Buffer.from('blob ' + data.length + '\0', 'ascii');
  return crypto.createHash('sha1').update(header).update(data).digest('hex');
}

/** @param {Buffer} data @returns {number} */
function printableCount(data) {
  return [...data].filter(v => (v >= 32 && v <= 126) || v === 9 ||
    v === 10 || v === 13).length;
}

/** @param {Buffer} data @returns {number} */
function ioc29(data) {
  const counts = Array(29).fill(0);
  for (const value of data) counts[value % 29]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

/** @param {Buffer} data @returns {string} */
function readable(data) {
  return [...data.subarray(0, 96)].map(v => v >= 32 && v <= 126 ?
    String.fromCharCode(v) : '.').join('');
}

(async () => {
  /** @type {Buffer[]} */
  const fetched = [];
  for (const [filename, sha, length] of files) {
    const bytes = await download(source + filename);
    assert.equal(bytes.length, length, 'historical length: ' + filename);
    assert.equal(gitBlobSha(bytes), sha, 'historical Git blob: ' + filename);
    fetched.push(bytes);
  }
  const [mask, twitter, b64] = fetched;
  assert.ok(twitter.equals(Buffer.from(twitter)), 'historical source loaded');
  const positive = Buffer.alloc(twitter.length);
  for (let i = 0; i < twitter.length; i++) positive[i] = mask[i] ^ twitter[i];
  assert.ok(positive.equals(b64),
    '2013 XOR Twitter ciphertext must recover original b64.txt byte-for-byte');

  const grid = JSON.parse(fs.readFileSync(
    'resources/liber-primus/base60-grid.json', 'utf8'));
  assert.equal(grid.byte_rows.length, 32);
  assert.ok(grid.byte_rows.every(row => row.length === 8));
  const table = Buffer.from(grid.byte_rows.flat());
  assert.equal(table.length, 256);
  assert.equal(crypto.createHash('sha256').update(table).digest('hex'),
    '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

  const output = Buffer.alloc(256);
  for (let i = 0; i < output.length; i++) output[i] = table[i] ^ mask[i];
  const corpus = JSON.parse(fs.readFileSync(
    'resources/liber-primus/lp2-corpus.json', 'utf8'));
  const page0 = corpus.pages.find(page => page.page === 0).indices;
  const rawXor = Buffer.from(page0.map((index, i) => index ^ mask[i]));
  const signatures = {
    jpeg: output.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')),
    png: output.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    zip: output.subarray(0, 4).equals(Buffer.from('504b0304', 'hex')),
    gzip: output.subarray(0, 2).equals(Buffer.from('1f8b', 'hex')),
    pdf: output.subarray(0, 4).toString('ascii') === '%PDF',
    pgpArmor: output.subarray(0, 14).toString('ascii') === '-----BEGIN PGP'
  };
  /** @param {number[]} ciphertext @returns {{full: boolean, prefix: number, paths: number}} */
  function fTransparentDecodeState(ciphertext) {
    let states = new Set([0]);
    for (let i = 0; i < ciphertext.length; i++) {
      const next = new Set();
      for (const k of states) {
        const residue = mask[k] % 29;
        if (ciphertext[i] === 0) {
          next.add(k); // plaintext F emitted visibly, without consuming the key
          if (residue !== 0) next.add(k + 1);
        } else if ((ciphertext[i] - residue + 29) % 29 !== 0) {
          next.add(k + 1); // no plaintext F may encrypt to a non-F ciphertext
        }
      }
      if (!next.size) return { full: false, prefix: i, paths: 0 };
      states = next;
    }
    return { full: true, prefix: ciphertext.length, paths: states.size };
  }
  const nativeClear = corpus.pages.find(page => page.page === 57).indices;
  const planted = [];
  let plantedKeyClock = 0;
  for (const plain of nativeClear) {
    if (plain === 0) planted.push(0);
    else planted.push((plain + mask[plantedKeyClock++] % 29) % 29);
  }
  assert.equal(fTransparentDecodeState(planted).full, true,
    'source-native clear p57 transparent-F synthetic positive');

  const runeReceivers = [0, 54, 55].map(pageNum => {
    const cipher = corpus.pages.find(page => page.page === pageNum).indices;
    const minus = Buffer.from(cipher.map((v, i) => (v - mask[i] % 29 + 29) % 29));
    const plus = Buffer.from(cipher.map((v, i) => (v + mask[i] % 29) % 29));
    const xor5 = cipher.map((v, i) => v ^ (mask[i] & 31));
    return {
      page: pageNum,
      length: cipher.length,
      additiveMinusIoc: ioc29(minus),
      additivePlusIoc: ioc29(plus),
      xor5Illegal29to31: xor5.filter(v => v >= 29).length,
      fTransparentMinus: fTransparentDecodeState(cipher),
      subtractHead: [...minus.subarray(0, 48)].map(v => corpus.translit[v]).join('')
    };
  });
  console.log(JSON.stringify({
    sourceCommit,
    sourceGitBlobShas: files.map(file => file[1]),
    positiveControl: {
      length: twitter.length,
      fullEquality: true,
      recoveredHead: readable(positive)
    },
    lp2P50: {
      length: output.length,
      xorAtHistoricallyUsedOffset: 0,
      sha256: crypto.createHash('sha256').update(output).digest('hex'),
      first32Hex: output.subarray(0, 32).toString('hex'),
      asciiPreview: readable(output),
      printable: printableCount(output),
      byteValuesBelow29: [...output].filter(x => x < 29).length,
      modulo29Ioc: ioc29(output),
      signatures
    },
    runeReceivers,
    fTransparentSyntheticPlant: true,
    lp2P0DirectRawByteXor: {
      runeCount: rawXor.length,
      byteValuesBelow29: [...rawXor].filter(x => x < 29).length,
      first32Hex: rawXor.subarray(0, 32).toString('hex')
    }
  }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
