'use strict';
// Finite, source-constrained hash gate for artifacts derived from the 2014 Stage 4 onion.
// Node.js 20+. The raw index.html.1 and server-status dumps are already covered by
// sims/archive_hash_preimage_scan.cjs; this gate adds documented derived outputs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const manifest = require('../resources/cicada2014-archive-hash-manifest.json');

const SOURCE_REPO = manifest.sourceRepo;
const SOURCE_COMMIT = manifest.sourceCommit;
const SOURCE_DIR = process.env.CICADA2014_SOURCE_DIR || path.resolve('cicada2014-source');
const TARGET = manifest.targetHex;
const ALGORITHMS = ['sha512', 'sha3-512', 'blake2b512'];
for (const algorithm of ALGORITHMS) {
  if (!crypto.getHashes().includes(algorithm)) throw new Error('Unsupported digest: ' + algorithm);
}
if (!/^[0-9a-f]{128}$/.test(TARGET)) throw new Error('Bad p56 target digest');

const checkedOutCommit = execFileSync('git', ['-C', SOURCE_DIR, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (checkedOutCommit !== SOURCE_COMMIT) throw new Error('Stage4 source checkout drift: ' + checkedOutCommit);

const FILES = [
  { path: 'stage4/gematria-primus.jpg', size: 53549, blobSha1: '412ecb2225a9485375981a864896a85da06e2cba', role: 'derived-image' },
  { path: 'stage4/index.html', size: 524, blobSha1: '81837b8d5e89f6a31731b84a217a6fdeaa62aff8', role: 'direct-page' },
  { path: 'stage4/index.html.1', size: 4302741, blobSha1: '9f4c609a3fe04e367121d05dacd34e4de9c035f8', role: 'derivation-source', screenedRaw: true },
  { path: 'stage4/index.1.bin', size: 2116096, blobSha1: 'dedbe57644cf549e705fe1b6770b358b493f7758', role: 'derived-binary' },
  { path: 'stage4/index.1.rev.bin', size: 2116096, blobSha1: '16850c6d6485b0f2a9b7970851bc84a4213ba498', role: 'byte-reversed-derived-binary' },
  { path: 'stage4/index.1.decrypted', size: 386, blobSha1: 'cac11c707fed9a97b7c4b35f2bc9ce4a34e379eb', role: 'outguess-plaintext' },
  { path: 'stage4/index.1.jpg', size: 892759, blobSha1: 'fb390cedd9e26547f0b39563a1ce8998f0def030', role: 'derived-image' },
  { path: 'stage4/index.1.outguess', size: 31809, blobSha1: '2a355d1bf14d37041384f09d8700e2ee274a13e6', role: 'outguess-payload' },
  { path: 'stage4/index.1.outguess.decrypted', size: 41, blobSha1: '586f966108f2797f420cd1239b2268ec9bff0599', role: 'outguess-plaintext' },
  { path: 'stage4/index.1.outguess.jpg', size: 15188, blobSha1: 'f91bdd6e2a890968a5a13d39be4d56899b877920', role: 'derived-image' },
  { path: 'stage4/index.1.rev.jpg', size: 1223337, blobSha1: 'e6a27cd5b25948d27d3af5ba029e4ba44fbff46f', role: 'derived-image' },
  { path: 'stage4/index.1.rev.outguess', size: 7524, blobSha1: 'd738b052bf0548e2f431e231af7ef1514becb4ad', role: 'outguess-payload' },
  { path: 'stage4/matrix', size: 179, blobSha1: 'faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd', role: 'derived-matrix' },
  { path: 'stage4/server-status', size: 1370852, blobSha1: '071fb34c82ba56c5dfbba376200be43822e31ee0', role: 'derivation-source', screenedRaw: true },
  { path: 'stage4/server-status.data', size: 359, blobSha1: '0caa28ad1f9b32528019a3c27a16f38258ffb51e', role: 'derived-text' },
  { path: 'stage4/server-status.jpg', size: 673066, blobSha1: '2829e13812015601ff1014cb4427587b4a8aa3a6', role: 'derived-image' }
];

const report = {
  target: TARGET,
  sourceRepo: SOURCE_REPO,
  sourceCommit: SOURCE_COMMIT,
  sourceFiles: [],
  candidates: [],
  derivationChecks: [],
  algorithms: ALGORITHMS,
  hits: []
};

function gitBlobSha1(bytes) {
  const header = Buffer.from('blob ' + bytes.length + '\0', 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
}

function readSource(item) {
  const fullPath = path.join(SOURCE_DIR, ...item.path.split('/'));
  const bytes = fs.readFileSync(fullPath);
  if (bytes.length !== item.size) throw new Error(item.path + ' size mismatch: ' + bytes.length + ' != ' + item.size);
  const sha = gitBlobSha1(bytes);
  if (sha !== item.blobSha1) throw new Error(item.path + ' Git blob SHA1 mismatch: ' + sha);
  return bytes;
}

function addCandidate(source, variant, bytes, note = '') {
  const b = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const hashes = {};
  for (const algorithm of ALGORITHMS) hashes[algorithm] = crypto.createHash(algorithm).update(b).digest('hex');
  const item = {
    source, variant, bytes: b.length,
    sha256: crypto.createHash('sha256').update(b).digest('hex'),
    hashes, note
  };
  item.matches = ALGORITHMS.filter(algorithm => hashes[algorithm] === TARGET);
  if (item.matches.length) report.hits.push(item);
  report.candidates.push(item);
  console.log('CANDIDATE', JSON.stringify({ source, variant, bytes: b.length, hashes, matches: item.matches }));
  return item;
}

function addTextVariants(source, bytes) {
  if (bytes.length && bytes[bytes.length - 1] === 10) addCandidate(source, 'drop-final-LF', bytes.subarray(0, -1));
  const text = bytes.toString('utf8');
  if (text.includes('\r\n')) addCandidate(source, 'CRLF-to-LF', Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8'));
}

function stripWhitespace(text) {
  return text.replace(/\s/g, '');
}

function assertEqual(label, a, b) {
  if (!a.equals(b)) throw new Error(label + ' did not reproduce the archived derived file');
  report.derivationChecks.push({
    label, bytes: a.length,
    sha256: crypto.createHash('sha256').update(a).digest('hex'),
    reproduced: true
  });
  console.log('DERIVATION-OK', label, a.length);
}

function main() {
  const files = {};
  for (const item of FILES) {
    const bytes = readSource(item);
    files[item.path] = bytes;
    report.sourceFiles.push({ path: item.path, bytes: bytes.length, gitBlobSha1: item.blobSha1, role: item.role });
    if (!item.screenedRaw) {
      addCandidate(item.path, 'raw', bytes);
      if (/\.(?:html|decrypted|data)$/.test(item.path) || item.path.endsWith('/matrix')) addTextVariants(item.path, bytes);
    } else {
      console.log('RAW-ALREADY-SCREENED', item.path, bytes.length);
    }
  }

  // Stage4's first 256-byte hex page: test the page, hex text, and decoded value.
  const indexHtml = files['stage4/index.html'].toString('utf8');
  const initialHex = stripWhitespace(indexHtml.replace(/^<!--1033-->\s*/, ''));
  if (!/^[0-9a-f]{512}$/i.test(initialHex)) throw new Error('Unexpected Stage4 initial 256-byte hex page');
  addCandidate('stage4/index.html', 'hex-payload-ASCII', Buffer.from(initialHex, 'utf8'));
  addCandidate('stage4/index.html', 'hex-payload-decoded-256-bytes', Buffer.from(initialHex, 'hex'));

  // The later Stage4 page is a hex dump; its documented decode must reproduce index.1.bin.
  const laterHtml = files['stage4/index.html.1'].toString('utf8');
  const laterBody = laterHtml.slice(laterHtml.indexOf('\n') + 1);
  const laterHex = stripWhitespace(laterBody);
  if (!/^[0-9a-f]+$/i.test(laterHex) || laterHex.length % 2) throw new Error('Stage4 index.html.1 is not a clean hex dump');
  const laterDecoded = Buffer.from(laterHex, 'hex');
  assertEqual('index.html.1 -> index.1.bin', laterDecoded, files['stage4/index.1.bin']);
  addCandidate('stage4/index.html.1', 'hex-body-ASCII', Buffer.from(laterHex, 'utf8'));

  // The source README's byte-reversal step must reproduce index.1.rev.bin.
  const reversedBinary = Buffer.from(files['stage4/index.1.bin']).reverse();
  assertEqual('index.1.bin byte-reverse -> index.1.rev.bin', reversedBinary, files['stage4/index.1.rev.bin']);

  // The server-status response is a reversed hex dump of server-status.jpg.
  const serverText = files['stage4/server-status'].toString('utf8');
  const serverHex = stripWhitespace(serverText);
  if (!/^[0-9a-f]+$/i.test(serverHex) || serverHex.length % 2) throw new Error('Unexpected server-status hexdump');
  const reverseServerHex = serverHex.split('').reverse().join('');
  addCandidate('stage4/server-status', 'reverse-hex-ASCII', Buffer.from(reverseServerHex, 'utf8'));
  const serverDecoded = Buffer.from(reverseServerHex, 'hex');
  assertEqual('server-status reverse-hex -> server-status.jpg', serverDecoded, files['stage4/server-status.jpg']);

  // The 360-byte extraction is reversed and hex-decoded to the 179-byte matrix.
  const matrixSource = files['stage4/server-status.data'].toString('utf8');
  const matrixHex = stripWhitespace(matrixSource).split('').reverse().join('');
  if (!/^[0-9a-f]+$/i.test(matrixHex) || matrixHex.length % 2) throw new Error('Unexpected server-status.data hex');
  addCandidate('stage4/server-status.data', 'reverse-hex-ASCII', Buffer.from(matrixHex, 'utf8'));
  const matrixDecoded = Buffer.from(matrixHex, 'hex');
  assertEqual('server-status.data reverse-hex -> matrix', matrixDecoded, files['stage4/matrix']);

  const outputPath = path.resolve('im-results/cicada2014-stage4-derived-hash-gate.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log('SUMMARY', JSON.stringify({
    sourceFiles: report.sourceFiles.length,
    candidates: report.candidates.length,
    derivationChecks: report.derivationChecks.length,
    algorithms: ALGORITHMS,
    hits: report.hits.length,
    output: outputPath
  }));
  if (report.hits.length) process.exitCode = 2;
}

try { main(); } catch (error) {
  console.error('FATAL', error.stack || error);
  process.exitCode = 1;
}
