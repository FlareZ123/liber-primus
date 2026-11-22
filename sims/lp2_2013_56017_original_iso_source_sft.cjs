'use strict';

// Read-only original 2013 CicadaOS DATA/560.17 exact-source SFT.
// Node.js 22, Windows 11 / GitHub Actions. No third-party dependencies.
const assert = require('node:assert/strict');
const https = require('node:https');
const crypto = require('node:crypto');

const source2021 = 'https://raw.githubusercontent.com/cijhho123/cicada3301/36caea400b2b431e467928b4b5aecc31af5fd6b2/2013/additional%20files/Cicada%20OS/cicados/DATA/560.17';
const reverse2021 = source2021 + '.rev';
const source2022 = 'https://raw.githubusercontent.com/neuroretransmit/cicada/1a3fb4acba0c718a932c6f602112446a6459e677/2013/002-3301/3301-contents/data/560.17';
const expectedGitBlob = '49df8e57f8e6052eb2d5c2b483282461e53ef5ff';
const expectedRevBlob = '0ea9873a0656731e7c3ae1be1f4977d65642657b';

/**
 * @param {string} url
 * @param {number} redirects
 * @returns {Promise<Buffer>}
 */
function download(url, redirects = 0) {
  assert.ok(redirects <= 5, 'too many redirects');
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'Liber-Primus-original-source-audit' } }, (res) => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        download(new URL(res.headers.location, url).toString(), redirects + 1).then(resolve, reject);
        return;
      }
      if (status !== 200) {
        res.resume();
        reject(new Error('HTTP ' + status + ': ' + url));
        return;
      }
      /** @type {Buffer[]} */
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {Buffer} buffer @returns {string} */
function gitBlobSha(buffer) {
  const prefix = Buffer.from('blob ' + buffer.length + '\0');
  return crypto.createHash('sha1').update(prefix).update(buffer).digest('hex');
}
/** @param {Buffer} buffer @returns {string} */
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
/** @param {Buffer} buffer @returns {number} */
function entropy(buffer) {
  const counts = new Uint32Array(256);
  for (const byte of buffer) counts[byte]++;
  let e = 0;
  for (const n of counts) if (n) {
    const p = n / buffer.length;
    e -= p * Math.log2(p);
  }
  return e;
}
/**
 * @param {Buffer} source
 * @param {number} offset
 * @param {string} hex
 * @returns {Buffer}
 */
function xorRecordedMessage(source, offset, hex) {
  const message = Buffer.from(hex, 'hex');
  assert.ok(offset + message.length <= source.length);
  const out = Buffer.alloc(message.length);
  for (let i = 0; i < message.length; i++) out[i] = message[i] ^ source[offset + i];
  return out;
}

async function main() {
  const [forward, backward, independent] = await Promise.all([
    download(source2021), download(reverse2021), download(source2022)
  ]);
  assert.equal(forward.length, 1183811);
  assert.equal(backward.length, forward.length);
  assert.equal(independent.length, forward.length);
  assert.equal(gitBlobSha(forward), expectedGitBlob);
  assert.equal(gitBlobSha(backward), expectedRevBlob);
  assert.equal(gitBlobSha(independent), expectedGitBlob);
  assert.ok(forward.equals(independent), '2021 and 2022 archives differ');
  const reversed = Buffer.from(forward).reverse();
  const reversedEqual = backward.equals(reversed);
  const complementEqual = backward.every((byte, i) => byte === (forward[i] ^ 0xff));
  const sourceUnique = new Set(forward).size;
  const fwdPrefix = forward.subarray(0, 24).toString('hex');
  const revPrefix = backward.subarray(0, 24).toString('hex');
  const fwdSuffix = forward.subarray(-24).toString('hex');
  const revSuffix = backward.subarray(-24).toString('hex');
  console.log(JSON.stringify({
    source: '2013 CicadaOS DATA/560.17',
    independentArchiveDates: ['2021-05-08', '2022-12-04'],
    length: forward.length,
    gitBlobSha: gitBlobSha(forward),
    sha256: sha256(forward),
    reverseGitBlobSha: gitBlobSha(backward),
    reverseSha256: sha256(backward),
    exactByteReversal: reversedEqual,
    exactComplement: complementEqual,
    first24: fwdPrefix,
    last24: fwdSuffix,
    reverseFirst24: revPrefix,
    reverseLast24: revSuffix,
    distinctByteValues: sourceUnique,
    entropyBitsPerByte: entropy(forward),
    utf8ReplacementCountFirst1024: [...forward.subarray(0, 1024).toString('utf8')].filter(ch => ch === '\ufffd').length
  }, null, 2));

  const contemporaneous = [
    { offset: 33461, message: 'f6a2d0a48e1b1ae40cbd454f77baa7d2557683d0cd4998', expected: 'y2wyuvrqraowagc5.onion' },
    { offset: 617, message: 'd4b10626d65995e8fb010f4388787d56433f90c6df8d8d', expected: 'll5afyskb6v6g7ga.onion' }
  ];
  for (const example of contemporaneous) {
    const decoded = xorRecordedMessage(forward, example.offset, example.message);
    const text = decoded.toString('latin1');
    const expectedRecovered = text.includes(example.expected);
    console.log(JSON.stringify({
      authentic2013Dataset: 17,
      offset: example.offset,
      decodedHex: decoded.toString('hex'),
      decodedLatin1: JSON.stringify(text),
      expectedOnion: example.expected,
      expectedRecovered
    }));
    assert.ok(expectedRecovered, '2013 original-data XOR check failed at ' + example.offset);
  }
  console.log('56017_ORIGINAL_SOURCE_SFT_PASS');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
