'use strict';

/**
 * LP2 p56 printed digest as a single, exact F5 JPEG password.
 *
 * Historical basis: Cicada used JPEG steganography; solved p56 prints the
 * 128-character lowercase hex digest. This one password is tried only on
 * the adjacent p53 moth, p55 moth/tree, and p56 "AN END" original JPEGs.
 *
 * F5 is a different extraction algorithm from OutGuess. This test never
 * enumerates passwords, alters original images, or interprets a failed
 * extraction as evidence against every possible JPEG steganographic method.
 *
 * Requires github.com/0verkilll/f5/cmd/f5@v1.0.0 on PATH.
 * Run from any working directory: node sims/lp2_p56_digest_f5_moth_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const images = path.join(root, 'resources', 'liber-primus');
const digest = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';

/** @type {{file:string,page:number,sha256:string,reason:string}[]} */
const targets = [
  { file: '70.jpg', page: 53, sha256: '4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548', reason: 'moth image' },
  { file: '72.jpg', page: 55, sha256: 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba', reason: 'moth and tree, before digest' },
  { file: '73.jpg', page: 56, sha256: 'a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc', reason: 'page printing the password' },
];

/** @param {Buffer} data @returns {string} */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/** @param {string} filename @param {string} expected */
function checkSource(filename, expected) {
  const actual = sha256(fs.readFileSync(path.join(images, filename)));
  assert.equal(actual, expected, filename + ' source SHA-256');
}

/**
 * @param {string[]} args
 * @returns {{status:number|null,stdout:string,stderr:string}}
 */
function f5(args) {
  const result = spawnSync('f5', args, {
    encoding: 'utf8',
    timeout: 240000,
    maxBuffer: 1024 * 1024,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stdout: result.stdout.slice(-1500),
    stderr: result.stderr.slice(-1500),
  };
}

/** @param {Buffer} data */
function payloadSummary(data) {
  const ascii = Array.from(data).filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)).length / data.length;
  const prefix = data.subarray(0, 96).toString('utf8');
  const recognized = data.subarray(0, 5).toString('utf8') === '-----'
    || data.subarray(0, 4).toString('binary') === 'PK\u0003\u0004'
    || data.subarray(0, 4).toString('utf8') === '%PDF';
  return {
    bytes: data.length,
    sha256: sha256(data),
    asciiRatio: Number(ascii.toFixed(5)),
    startsWithKnownHeader: recognized,
    first96Hex: data.subarray(0, 96).toString('hex'),
    textPreview: ascii >= 0.85 ? prefix : null,
  };
}

/**
 * @param {string} image
 * @param {string} password
 * @param {string} dest
 */
function extract(image, password, dest) {
  const result = f5(['extract', image, '-p', password, '-o', dest]);
  const complete = result.status === 0 && fs.existsSync(dest);
  const data = complete ? fs.readFileSync(dest) : null;
  return {
    ...result,
    complete,
    payload: data && data.length ? payloadSummary(data) : null,
  };
}

assert.match(digest, /^[0-9a-f]{128}$/);
for (const target of targets) checkSource(target.file, target.sha256);
checkSource('17.jpg', '197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-f5-p56-digest-'));
try {
  const testPassword = 'LP2-F5-POSITIVE-CONTROL-20261114';
  const payload = Buffer.concat([
    Buffer.from('LP2-F5-EXTRACT-POSITIVE-CONTROL: THE DIVINITY WITHIN\n', 'utf8'),
    Buffer.from(Array.from({length: 1024}, (_, i) => (i * 73 + 19) & 255)),
  ]);
  const payloadPath = path.join(temp, 'control.bin');
  const embedded = path.join(temp, 'control-stego.jpg');
  const recovered = path.join(temp, 'control-recovered.bin');
  fs.writeFileSync(payloadPath, payload);
  const embed = f5([
    'embed-x', path.join(images, '17.jpg'), '-p', testPassword,
    '-in', payloadPath, '-encoder', 'libjpeg', '-o', embedded,
  ]);
  assert.equal(embed.status, 0, 'F5 positive embedding: ' + JSON.stringify(embed));
  const positive = extract(embedded, testPassword, recovered);
  assert.equal(positive.status, 0, 'F5 positive extraction: ' + JSON.stringify(positive));
  assert.ok(positive.complete, 'F5 positive extracted file exists');
  assert.deepEqual(fs.readFileSync(recovered), payload, 'exact F5 positive-control payload');

  const wrongPassword = extract(embedded, digest, path.join(temp, 'control-wrong-pass.bin'));
  assert.ok(!wrongPassword.complete || wrongPassword.payload?.sha256 !== sha256(payload),
    'wrong-password control must not authenticate the positive payload');

  const probes = targets.map(target => {
    const extracted = extract(
      path.join(images, target.file), digest,
      path.join(temp, 'candidate-' + target.page + '.bin')
    );
    return { page: target.page, file: target.file, reason: target.reason, ...extracted };
  });

  console.log(JSON.stringify({
    test: 'source-exact p56 128-hex F5 password on neighboring original JPEGs',
    input: 'original LP2 p53/p55/p56 JPEG, SHA-256 source asserted',
    passwordSource: 'LP2 p56 printed SHA-512-looking digest, unmodified lowercase ASCII',
    f5Version: f5(['version']),
    positiveExact: true,
    positivePayloadBytes: payload.length,
    positiveSha256: sha256(payload),
    positiveWrongPassword: wrongPassword,
    probes,
    authenticatedOriginalPayloads: probes.filter(p => p.complete && p.payload?.startsWithKnownHeader).length,
    interpretation: 'A returned file requires independent plaintext/signature validation; missing file rejects this exact F5 password only.',
  }, null, 2));
} finally {
  fs.rmSync(temp, {recursive:true,force:true});
}
