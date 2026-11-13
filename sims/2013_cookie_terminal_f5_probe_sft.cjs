'use strict';

/**
 * Finite 2013 documented 167/761 cookie-passphrase probe on LP2 original JPEGs.
 * Two exact name strings and two verbatim 64-digit cookie values. No tuning.
 * The same external F5 extractor must recover two native embedded positives.
 * Node 22, CommonJS; requires --f5 CLI and --embedder native Go F5 executable.
 *
 * Usage: node sims/2013_cookie_terminal_f5_probe_sft.cjs --f5 path --embedder path --root resources/liber-primus
 * Does not declare a negative F5 steganography result for unknown passwords.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const keys = Object.freeze([
  ['name167', '167'],
  ['name761', '761'],
  ['cookie167', '6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6'],
  ['cookie761', '7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5'],
]);

/** @param {string} flag @returns {string} */
function option(flag) {
  const at = process.argv.indexOf(flag);
  assert.ok(at >= 0 && at + 1 < process.argv.length, `missing ${flag}`);
  return process.argv[at + 1];
}
const f5 = option('--f5');
const embedder = option('--embedder');
const root = path.resolve(option('--root'));
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-2013-cookie-f5-'));

/** @param {string} exe @param {string[]} args @param {boolean} shouldPass */
function execute(exe, args, shouldPass = false) {
  const r = cp.spawnSync(exe, args, {
    timeout: 60000, maxBuffer: 2 * 1024 * 1024, encoding: 'utf8',
  });
  if (shouldPass) assert.equal(r.status, 0, `${exe}: ${r.stderr}`);
  return r;
}
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

/** @param {string} image @param {string} pass @returns {object} */
function probe(image, pass) {
  const output = path.join(work, 'extracted.bin');
  fs.rmSync(output, { force: true });
  const cmd = execute(f5, ['extract', image, '-p', pass, '-o', output]);
  if (cmd.status !== 0) {
    return { status: 'no_extractor_valid_payload', error: (cmd.stderr || cmd.stdout).trim().slice(0, 200) };
  }
  assert.ok(fs.existsSync(output));
  const raw = fs.readFileSync(output);
  return {
    status: 'extractor_returned_bytes',
    bytes: raw.length,
    sha256: sha256(raw),
    leading_hex: raw.subarray(0, 32).toString('hex'),
    ascii_fraction: raw.length ? raw.filter((n) => n >= 32 && n <= 126).length / raw.length : 0,
  };
}

try {
  const payload = crypto.createHash('sha256').update('2013-167-761-f5-exact-control').digest();
  const payloadPath = path.join(work, 'payload.bin');
  fs.writeFileSync(payloadPath, payload);
  for (const [cover, pass] of [['62.jpg', '167'], ['71.jpg', '761']]) {
    const carrier = path.join(work, 'known-stego.jpg');
    execute(embedder, ['-cover', path.join(root, cover), '-payload', payloadPath, '-password', pass, '-k', '4', '-out', carrier], true);
    const positive = probe(carrier, pass);
    assert.equal(positive.status, 'extractor_returned_bytes');
    assert.equal(positive.sha256, sha256(payload));
    console.log('TRUE_F5_POSITIVE_CONTROL', JSON.stringify({ cover, pass, bytes: payload.length, pass: true }));
  }

  const counts = {};
  const successes = [];
  for (const [label, pass] of keys) {
    counts[label] = { tested: 0, nonzero_exit: 0, decoded: 0 };
    for (let i = 17; i <= 74; i += 1) {
      const file = `${String(i).padStart(2, '0')}.jpg`;
      const original = path.join(root, file);
      assert.ok(fs.existsSync(original), `missing LP2 source ${file}`);
      const r = probe(original, pass);
      counts[label].tested += 1;
      if (r.status === 'extractor_returned_bytes') {
        counts[label].decoded += 1;
        successes.push({ file, lp2_page: i - 17, key: label, ...r });
        console.log('ORIGINAL_CANDIDATE', JSON.stringify(successes.at(-1)));
      } else counts[label].nonzero_exit += 1;
    }
    console.log('SOURCE_KEY_PROGRESS', JSON.stringify({ label, ...counts[label] }));
  }
  console.log('FINAL_ORIGINAL_SOURCE_COOKIE_F5', JSON.stringify({
    scope: '58 original LP2 JPEGs times 4 finite 2013 source-quoted passphrases',
    positive_controls: 2,
    counts,
    candidates: successes,
    original_key_role: 'unproven; F5 consumer and bearer selection not authenticated',
  }));
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
