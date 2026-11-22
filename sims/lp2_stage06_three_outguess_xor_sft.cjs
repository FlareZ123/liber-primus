'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const https = require('node:https');

const commit = '76d3ee8c762f60025822c8c05edbf31351636469';
const base = 'https://raw.githubusercontent.com/krisyotam/cicada3301/' +
  commit + '/puzzles/2014/assets/stage06/';
const artifacts = [
  ['index.1.outguess', '29d8fe5c4b6f2b245e367077dc6c752204707c7e'],
  ['index.2.outguess', 'fc8bc6ff96e8c1078d9a231e89e18d56c708708f'],
  ['index.3.outguess', 'd7844fa0bbedfcf4e9862a1d43f565717789cb86']
];

/** @param {Buffer} data @returns {string} */
function gitBlobSha(data) {
  const header = Buffer.from('blob ' + data.length + '\0', 'ascii');
  return crypto.createHash('sha1').update(header).update(data).digest('hex');
}

/** @param {string} url @returns {Promise<Buffer>} */
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'liber-primus-stage06-source-gate' } }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('HTTP ' + response.statusCode + ': ' + url));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {Buffer[]} streams @returns {Buffer} */
function xor(streams) {
  assert.ok(streams.length > 0);
  assert.ok(streams.every(a => a.length === streams[0].length));
  const output = Buffer.alloc(streams[0].length);
  for (const b of streams) for (let i = 0; i < b.length; i++) output[i] ^= b[i];
  return output;
}

/** @param {Buffer} b @returns {number} */
function entropy(b) {
  const counts = Array(256).fill(0);
  for (const n of b) counts[n]++;
  let result = 0;
  for (const n of counts) if (n) {
    const probability = n / b.length;
    result -= probability * Math.log2(probability);
  }
  return result;
}

/** @param {Buffer} b @returns {object} */
function inspect(b) {
  let printable = 0;
  let asciiRuns = [];
  let runStart = -1;
  for (let i = 0; i <= b.length; i++) {
    const inRun = i < b.length && b[i] >= 32 && b[i] <= 126;
    if (inRun) {
      printable++;
      if (runStart < 0) runStart = i;
    } else if (runStart >= 0) {
      if (i - runStart >= 16) {
        asciiRuns.push({ offset: runStart, length: i - runStart,
          text: b.subarray(runStart, Math.min(i, runStart + 90)).toString('ascii') });
      }
      runStart = -1;
    }
  }
  asciiRuns.sort((a,c) => c.length - a.length);
  return {
    bytes: b.length,
    sha256: crypto.createHash('sha256').update(b).digest('hex'),
    start48hex: b.subarray(0,48).toString('hex'),
    entropyBitsPerByte: entropy(b),
    printableFraction: printable/b.length,
    nullCount: b.filter(x=>x===0).length,
    strongAsciiRuns: asciiRuns.slice(0,8),
    asciiRunCount16plus: asciiRuns.length,
    recognizedStart: ['ffd8ff','89504e47','504b0304','1f8b08','425a68','25504446','2d2d2d2d2d424547494e20504750']
      .filter(x => b.subarray(0, x.length/2).toString('hex').startsWith(x))
  };
}

/** @param {Buffer} a @param {Buffer} b @returns {object} */
function similarity(a,b) {
  assert.equal(a.length,b.length);
  let equal = 0, initial = 0;
  for (let i=0;i<a.length;i++) if (a[i]===b[i]) equal++;
  while (initial<a.length&&a[initial]===b[initial]) initial++;
  return {equalBytePositions:equal, equalFraction:equal/a.length, commonInitialBytes:initial};
}

async function main() {
  const inputs = [];
  for (const [name, sha] of artifacts) {
    const data = await download(base+name);
    assert.equal(data.length, 58152);
    assert.equal(gitBlobSha(data),sha);
    inputs.push(data);
  }

  const combos = [
    {name:'source1', stream:inputs[0]},
    {name:'source2', stream:inputs[1]},
    {name:'source3', stream:inputs[2]},
    {name:'1xor2', stream:xor([inputs[0],inputs[1]])},
    {name:'1xor3', stream:xor([inputs[0],inputs[2]])},
    {name:'2xor3', stream:xor([inputs[1],inputs[2]])},
    {name:'1xor2xor3', stream:xor(inputs)}
  ];

  const message = Buffer.from(
    'SOURCE POSITIVE CONTROL: SHARED PAD RECOVERS AUTHOR TEXT WHEN A TRUE THREE SHARE XOR MESSAGE IS PRESENT.',
    'ascii'
  );
  const share1 = Buffer.from(crypto.randomBytes(message.length));
  const share2 = Buffer.from(crypto.randomBytes(message.length));
  const share3 = xor([share1,share2,message]);
  assert.deepEqual(xor([share1,share2,share3]),message);

  console.log(JSON.stringify({
    source: '2014 original Stage06 OutGuess extracted payloads',
    pinnedArchiveCommit:commit,
    originalBlobSums:artifacts,
    sameLengthBytes:58152,
    pairComparisons: [
      similarity(inputs[0],inputs[1]),
      similarity(inputs[0],inputs[2]),
      similarity(inputs[1],inputs[2])
    ],
    combinations: combos.map(c=>({name:c.name,...inspect(c.stream)})),
    positiveControlXorText:message.toString('ascii'),
    decisionRule: 'Direct XOR identity must produce recognizably authored text/file, with a distinct source-stipulated endpoint; pure entropy or the fake OutGuess length header is insufficient.'
  },null,2));
}

if (require.main===module) main().catch(e => { console.error(e); process.exitCode=1; });
module.exports={main,gitBlobSha,xor,inspect};
