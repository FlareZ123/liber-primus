'use strict';
/**
 * One source-selected p27/p55 OutGuess differential with fixed original controls.
 * Native OutGuess executable must be installed on PATH by the manual workflow.
 * No source-free key search, cipher fitting, or plaintext language scoring.
 *
 * Run: node sims/lp2_p55_p27_outguess_crosscarrier_xor_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const get = (p) => {
  const row = corpus.pages.find((x) => x.page === p);
  assert.ok(row, 'Missing source GP29 page ' + p);
  return row.indices;
};
const toText = (array) => array.map((i) => corpus.translit[i]).join('');
const p27 = get(27), p55 = get(55), p56 = get(56);
assert.deepEqual(p55.slice(-6), p27.slice(28, 34));
assert.equal(p27[34], p56[0]);
assert.equal(corpus.translit[p27[35]], 'F');
const PASSWORD = toText(p27.slice(28, 36));
assert.equal(PASSWORD, 'DJUBEIAEF');
const digest = (b) => crypto.createHash('sha256').update(b).digest('hex');

/**
 * @param {string[]} args
 * @returns {import('node:child_process').SpawnSyncReturns<string>}
 */
function run(args) {
  const result = spawnSync('outguess', args, {
    encoding: 'utf8', maxBuffer: 256 * 1024, timeout: 120000,
  });
  assert.equal(result.status, 0, JSON.stringify({
    args: args.slice(0, 1), error: String(result.error || ''),
    stdout: result.stdout?.slice(0, 150),
    stderr: result.stderr?.slice(0, 150),
  }));
  return result;
}

/**
 * @param {Buffer} buf
 * @returns {number}
 */
function entropy(buf) {
  const hist = Array(256).fill(0);
  for (const value of buf) hist[value]++;
  let h = 0;
  for (const n of hist) {
    if (n) { const p = n / buf.length; h -= p * Math.log2(p); }
  }
  return h;
}

/**
 * @param {Buffer} x
 * @param {Buffer} y
 */
function compare(x, y) {
  assert.equal(x.length, y.length);
  let prefix = 0, suffix = 0, equal = 0;
  for (let i = 0; i < x.length && x[i] === y[i]; i++) prefix++;
  for (let i = x.length - 1; i >= 0 && x[i] === y[i]; i--) suffix++;
  const xor = Buffer.alloc(x.length);
  let runLength = 0, maxZeroRun = 0, maxZeroRunStart = -1, runStart = 0;
  for (let i = 0; i < x.length; i++) {
    xor[i] = x[i] ^ y[i];
    if (xor[i] === 0) {
      equal++;
      if (!runLength) runStart = i;
      runLength++;
      if (runLength > maxZeroRun) {
        maxZeroRun = runLength; maxZeroRunStart = runStart;
      }
    } else runLength = 0;
  }
  const printable = Array.from(xor).filter(
    (c) => c === 9 || c === 10 || c === 13 || c >= 32 && c <= 126
  ).length / xor.length;
  const core = xor.subarray(prefix, xor.length - suffix);
  assert.ok(core.length > 100);
  const coreZeros = Array.from(core).filter((v) => v === 0).length;
  const corePrintable = Array.from(core).filter(
    (v) => v === 9 || v === 10 || v === 13 || v >= 32 && v <= 126
  ).length / core.length;
  return {equal, prefix, suffix, maxZeroRun, maxZeroRunStart,
    xorSHA256: digest(xor), xorEntropy: entropy(xor),
    coreLength: core.length, coreZeroFraction: coreZeros / core.length,
    coreEntropy: entropy(core), corePrintableFraction: corePrintable,
    xorPrintableFraction: printable,
    xorFirst64: xor.subarray(0, 64).toString('hex'),
    xorAfterPrefix64: xor.subarray(prefix, Math.min(xor.length, prefix + 64)).toString('hex')};
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-outguess-bridge-xor-'));
try {
  const original = (id) => path.join(ROOT, 'resources/liber-primus',
    String(id).padStart(2, '0') + '.jpg');
  const positive = Buffer.from('SOURCE-LOCKED OUTGUESS CROSS-CARRIER NATIVE POSITIVE 79\n');
  const message = path.join(temp, 'planted-message.dat');
  const carrier = path.join(temp, 'planted-original17.jpg');
  const readback = path.join(temp, 'readback.dat');
  fs.writeFileSync(message, positive);
  run(['-k','79','-d',message,original(17),carrier]);
  run(['-k','79','-r',carrier,readback]);
  assert.ok(fs.readFileSync(readback).equals(positive), 'Native keyed plant failed');
  console.log('NATIVE_POSITIVE_EXACT', positive.length, digest(positive));

  /** @type {Map<number, Buffer>} */
  const data = new Map();
  const knownSHA = new Map([
    [44, '36bfadecfa4d4735b234b41278d9cc0e48a44fa759c4b0c72039c7fbb13a1ae3'],
    [72, '94c38a361be407b607b4b82c33f8f09c2dfd698a0461ab6e74d7a3eff2d57e47'],
    [17, '71f45b77638ec2ffea8da1a4b02f48258acb411b2fdb56d9dc80f3acb5ea516d'],
    [60, '579f5f9c560b115eddbd972e62f64409630f47bd7155a7ed790debcd15f93164'],
  ]);
  for (const id of [44, 72, 17, 60]) {
    const file = path.join(temp, 'extracted-' + id + '.dat');
    const proc = run(['-k', PASSWORD, '-r', original(id), file]);
    const bytes = fs.readFileSync(file);
    const header = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(
      (proc.stdout || '') + '\n' + (proc.stderr || ''));
    assert.ok(header);
    assert.equal(Number(header[1]), 24559);
    assert.equal(Number(header[2]), 42649);
    assert.equal(bytes.length, 42649);
    assert.equal(digest(bytes), knownSHA.get(id), 'Unexpected source artifact bytes');
    data.set(id, bytes);
    console.log('ORIGINAL',JSON.stringify({
      scan: id, seed: Number(header[1]), len: bytes.length,
      sha256: digest(bytes), entropy: entropy(bytes)
    }));
  }

  const relationships = [
    ['source_pair', 44, 72],
    ['disjoint_control_pair', 17, 60],
    ['cross_control_44_17', 44, 17],
    ['cross_control_72_60', 72, 60],
    ['cross_control_44_60', 44, 60],
    ['cross_control_72_17', 72, 17],
  ];
  for (const [label, left, right] of relationships) {
    console.log('KEYED_DIFFERENTIAL', JSON.stringify({
      label, left, right, ...compare(data.get(left), data.get(right)),
    }));
  }

  // Single falsifier: replace the last literal source F with a different
  // ASCII character, hold the same four original carriers and operations.
  // A source-selected stego operation must distinguish its true password
  // from this exactly one-character wrong-key control.
  const WRONG_PASSWORD = 'DJUBEIAEG';
  /** @type {Map<number, Buffer>} */
  const wrong = new Map();
  for (const id of [44, 72, 17, 60]) {
    const file = path.join(temp, 'wrong-' + id + '.dat');
    const proc = run(['-k', WRONG_PASSWORD, '-r', original(id), file]);
    const buf = fs.readFileSync(file);
    wrong.set(id, buf);
    const match = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(
      (proc.stdout || '') + '\n' + (proc.stderr || ''));
    console.log('WRONG_KEY_ORIGINAL', JSON.stringify({
      scan: id, seed: match ? Number(match[1]) : null,
      headerLength: match ? Number(match[2]) : null,
      bytes: buf.length, sha256: digest(buf),
    }));
  }
  const common = Math.min(...Array.from(wrong.values(), (b) => b.length));
  assert.ok(common > 1000, 'Wrong-key outputs too short for controlled differential');
  for (const [label, left, right] of relationships) {
    console.log('WRONG_KEY_DIFFERENTIAL', JSON.stringify({
      label, left, right, wrongKey: WRONG_PASSWORD,
      ...compare(wrong.get(left).subarray(0, common),
        wrong.get(right).subarray(0, common)),
    }));
  }
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
