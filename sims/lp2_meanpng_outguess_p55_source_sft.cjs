'use strict';
/**
 * Agent46, 2026-11-23. Single source-locked historical OutGuess experiment.
 * The original LP2 p49-51 fifth-column source scalar gives the exact compressed
 * P2PKH address 1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK. The sole hypothesis
 * tested here is whether the literal visible "Meanpng" is an OutGuess 0.4 key
 * to original physical LP2 p55 (72.jpg), singled out by missing-4C=76 runes.
 *
 * Node 22 CommonJS, works on Windows 11 if OutGuess is installed and is
 * available on PATH or supplied through OUTGUESS_BINARY. The repository's
 * manual-outguess-source-runner.yml supplies a pinned historical executable.
 *
 * No other passwords, carriers, keys, phase variants, extraction modes or
 * downloaded content are tested. An OutGuess exit0 alone is NOT evidence:
 * its known false-positive headers can yield high-entropy spurious payloads.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'resources', 'liber-primus');
const outguess = process.env.OUTGUESS_BINARY || 'outguess';
const key = 'Meanpng';
const expectedHash = 'a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba';
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');

/**
 * @param {string[]} args
 * @returns {{status: number | null, output: string}}
 */
function execute(args) {
  const cp = spawnSync(outguess, args, { encoding: 'utf8', timeout: 120000 });
  if (cp.error) throw cp.error;
  return { status: cp.status, output: (cp.stdout || '') + '\n' + (cp.stderr || '') };
}

function entropy(buffer) {
  const f = Array(256).fill(0);
  for (const b of buffer) f[b]++;
  let value = 0;
  for (const n of f) if (n) {
    const p = n / buffer.length;
    value -= p * Math.log2(p);
  }
  return value;
}

function main() {
  const original = path.join(source, '72.jpg');
  assert.equal(sha256(fs.readFileSync(original)), expectedHash);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-meanpng-outguess-'));
  try {
    const payload = Buffer.from('AGENT46 ORIGINAL-P55 MEANPNG KEY POSITIVE\n');
    const payloadPath = path.join(temp, 'known.txt');
    const stego = path.join(temp, 'embedded.jpg');
    const extracted = path.join(temp, 'extracted.txt');
    fs.writeFileSync(payloadPath, payload, { flag: 'wx' });
    const embed = execute(['-k', key, '-d', payloadPath, original, stego]);
    assert.equal(embed.status, 0, 'Positive embed failed: ' + embed.output);
    const readback = execute(['-k', key, '-r', stego, extracted]);
    assert.equal(readback.status, 0, 'Positive retrieve failed: ' + readback.output);
    assert.deepEqual(fs.readFileSync(extracted), payload);
    console.log('POSITIVE source-JPEG keyed OutGuess embed/recover',
      payload.length, 'bytes, exact SHA256');

    const resultFile = path.join(temp, 'original.bin');
    const result = execute(['-k', key, '-r', original, resultFile]);
    const data = fs.existsSync(resultFile) ? fs.readFileSync(resultFile) : Buffer.alloc(0);
    const preview = data.subarray(0, 32);
    const flags = {
      pgp: data.includes(Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----')),
      pgpMessage: data.includes(Buffer.from('-----BEGIN PGP MESSAGE-----')),
      zip: data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
      gzip: data.subarray(0, 3).equals(Buffer.from([0x1f, 0x8b, 0x08])),
      png: data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    };
    const output = {
      carrier: 'resources/liber-primus/72.jpg',
      carrierSha256: expectedHash,
      source: 'Original p50 missing-L compressed Bitcoin P2PKH prefix',
      address: '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK',
      key,
      historicalOutGuessPositiveRecovered: true,
      originalOutGuessExit: result.status,
      extractedBytes: data.length,
      extractedSha256: sha256(data),
      extractedFirst32Hex: preview.toString('hex'),
      extractedEntropy: data.length ? entropy(data) : null,
      formatIndicators: flags,
      originalExtractorReport: result.output.slice(0, 600),
      notice: 'OutGuess headers often falsely succeed on unembedded JPEGs. A nonempty binary is no authentic message by itself.'
    };
    console.log('ORIGINAL SOURCE TEST:', JSON.stringify(output, null, 2));
    if (Object.values(flags).some(Boolean)) {
      console.log('FORMAT INDICATOR: inspect this exact payload independently before classifying.');
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}
main();
