'use strict';

// Source-motivated, read-only OutGuess test:
// LP2 physical p10 contains the unique standalone "7" immediately followed
// by GP rune G. Test whether that literal 7G points to LP1 archive page 07.jpg
// and supplies an OutGuess password. Only the directly readable strings 7G,
// 7, and the GP prime value of G (17) are tested. Default-key LP1 pages 00,
// 03, and 08 are authentic extraction controls.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const images = path.join(root, 'resources', 'liber-primus');

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}
function printableFraction(buf) {
  if (!buf.length) return 0;
  let n = 0;
  for (const b of buf) if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) n++;
  return n / buf.length;
}
function signature(buf) {
  const s = buf.toString('latin1', 0, Math.min(buf.length, 512));
  if (s.startsWith('-----BEGIN PGP SIGNED MESSAGE-----')) return 'pgp-clear-signed';
  if (s.startsWith('-----BEGIN PGP MESSAGE-----')) return 'pgp-message';
  if (s.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----')) return 'pgp-public-key';
  if (buf.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))) return 'jpeg';
  if (buf.subarray(0, 4).toString('hex') === '89504e47') return 'png';
  if (buf.subarray(0, 4).toString('ascii') === 'PK\u0003\u0004') return 'zip';
  if (buf.subarray(0, 4).toString('ascii') === '%PDF') return 'pdf';
  return null;
}
function extract(imageName, key) {
  const image = path.join(images, imageName);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-7g-outguess-'));
  const output = path.join(temp, 'payload.bin');
  const args = [];
  if (key !== null) args.push('-k', key);
  args.push('-r', image, output);
  const p = spawnSync('outguess', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  const data = fs.existsSync(output) ? fs.readFileSync(output) : Buffer.alloc(0);
  const result = {
    image: imageName,
    key: key === null ? '(default)' : key,
    exitCode: p.status,
    signal: p.signal,
    log: ((p.stdout || '') + (p.stderr || '')).trim().slice(0, 700),
    outputLength: data.length,
    sha256: data.length ? sha256(data) : null,
    recognizedType: signature(data),
    printableFraction: Number(printableFraction(data).toFixed(6)),
    first96Hex: data.subarray(0, 96).toString('hex'),
    first160Text: printableFraction(data) >= 0.75
      ? data.subarray(0, 160).toString('latin1').replace(/[^\x20-\x7e\r\n\t]/g, '.')
      : null
  };
  fs.rmSync(temp, { recursive: true, force: true });
  return result;
}

const controls = [
  { image: '00.jpg', predicate: r => r.recognizedType === 'pgp-clear-signed' },
  { image: '03.jpg', predicate: r => r.recognizedType === 'pgp-clear-signed' },
  { image: '08.jpg', predicate: r => (r.first160Text || '').includes('For those who have fallen behind') }
].map(x => {
  const result = extract(x.image, null);
  return { ...result, positiveControlPass: x.predicate(result) };
});
const candidates = [
  extract('07.jpg', null),
  extract('07.jpg', '7G'),
  extract('07.jpg', '7'),
  extract('07.jpg', '17')
];
const report = {
  hypothesis: 'The unique LP2 p10 literal 7G points to LP1 image 07.jpg and supplies an OutGuess key.',
  scope: 'Original LP1 JPEG 07.jpg; default, literal 7G, literal 7, and GP-prime 17 only.',
  controls,
  controlsPass: controls.every(x => x.positiveControlPass),
  candidates,
  candidateHasRecognizedPayload: candidates.some(x => x.recognizedType || (x.printableFraction >= 0.85 && x.outputLength >= 40)),
  noClaimFromUnrecognizedOutput: true
};
console.log(JSON.stringify(report, null, 2));
if (!report.controlsPass) process.exitCode = 1;
