'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'resources', 'liber-primus');
const HISTORICAL_CONTROL = path.join(ROOT, 'resources', 'historical', 'cicada2016-4gq25.jpg');
const HISTORICAL_PAYLOAD = path.join(ROOT, 'resources', 'historical', 'cicada2016-4gq25-outguess.asc');
const KEY = 'M5N7';

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function entropy(bytes) {
  if (!bytes.length) return 0;
  const counts = new Uint32Array(256);
  for (const b of bytes) counts[b]++;
  let h = 0;
  for (const n of counts) {
    if (!n) continue;
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}

function recognize(bytes) {
  const flags = [];
  const starts = b => bytes.subarray(0, b.length).equals(b);
  if (
    starts(Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----')) ||
    starts(Buffer.from('-----BEGIN PGP MESSAGE-----')) ||
    starts(Buffer.from('-----BEGIN PGP PUBLIC KEY BLOCK-----'))
  ) flags.push('pgp-armor');
  if (starts(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) flags.push('zip');
  if (starts(Buffer.from([0x1f, 0x8b]))) flags.push('gzip');
  if (starts(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) flags.push('png');
  if (starts(Buffer.from('%PDF-'))) flags.push('pdf');
  if (starts(Buffer.from([0xff,0xd8,0xff]))) flags.push('jpeg');
  const printable = bytes.length
    ? [...bytes].filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)).length / bytes.length
    : 0;
  const h = entropy(bytes);
  if (bytes.length >= 64 && printable > 0.90) flags.push('highly-printable');
  if (bytes.length >= 256 && h < 7.5) flags.push('low-entropy');
  return { flags, printable, entropy: h };
}

function retrieve(image, output, key) {
  fs.rmSync(output, { force: true });
  const args = [...(key ? ['-k', key] : []), '-r', image, output];
  const run = spawnSync('outguess', args, {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 1024 * 1024,
  });
  assert.ok(!run.error, 'OutGuess launch failed: ' + String(run.error));
  const diagnostic = (run.stdout || '') + '\n' + (run.stderr || '');
  const header = /Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(diagnostic);
  const bytes = fs.existsSync(output) ? fs.readFileSync(output) : Buffer.alloc(0);
  const valid = run.status === 0 && Boolean(header) && bytes.length > 0 &&
    bytes.length === Number(header[2]);
  return {
    status: run.status,
    seed: header ? Number(header[1]) : null,
    headerLength: header ? Number(header[2]) : null,
    bytes,
    valid,
    diagnostic: diagnostic.trim().split(/\r?\n/).filter(Boolean).slice(-3).join(' | ').slice(0, 500),
  };
}

function main() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-m5n7-outguess-'));
  try {
    const controlOut = path.join(tmp, 'control.asc');
    const control = retrieve(HISTORICAL_CONTROL, controlOut, null);
    const expected = fs.readFileSync(HISTORICAL_PAYLOAD);
    assert.equal(control.valid, true, 'historical 2016 OutGuess control failed');
    assert.ok(control.bytes.equals(expected), 'historical 2016 payload mismatch');

    const successful = [];
    const failures = [];
    for (let page = 0; page <= 57; page++) {
      const image = path.join(SOURCE, String(page + 17).padStart(2, '0') + '.jpg');
      const output = path.join(tmp, 'p' + page + '.bin');
      const result = retrieve(image, output, KEY);
      if (!result.valid) {
        failures.push({
          page,
          status: result.status,
          seed: result.seed,
          headerLength: result.headerLength,
          diagnostic: result.diagnostic,
        });
        continue;
      }
      const grade = recognize(result.bytes);
      successful.push({
        page,
        sourceImage: String(page + 17).padStart(2, '0') + '.jpg',
        seed: result.seed,
        bytes: result.bytes.length,
        sha256: sha256(result.bytes),
        entropy: grade.entropy,
        printable: grade.printable,
        recognizable: grade.flags,
        prefixHex: result.bytes.subarray(0, 32).toString('hex'),
        prefixASCII: result.bytes.subarray(0, 64).toString('latin1').replace(/[^\x20-\x7e]/g, '.'),
      });
    }

    assert.equal(successful.length + failures.length, 58);
    for (const row of successful) {
      assert.equal(row.seed, 53109, 'M5N7 source-forced seed changed');
      assert.equal(row.bytes, 25903, 'M5N7 source-forced length changed');
    }

    const recognizable = successful.filter(x => x.recognizable.length);
    const output = {
      hypothesis: {
        source: '2014 Stage11 original 0.jpg..57.jpg filenames plus BASE29 page-rune-count self-index p6..p9',
        pageCountsBase29: ['6M', '75', '8N', '97'],
        strippedLiteralPassword: KEY,
        variantsTested: 1,
      },
      tool: 'OutGuess 0.4 pinned by manual-outguess-source-runner.yml',
      control: {
        carrier: path.relative(ROOT, HISTORICAL_CONTROL),
        exactHistoricalRecovery: true,
        bytes: expected.length,
        sha256: sha256(expected),
      },
      sourceForcedHeader: {
        decodedHeaderHex: '75cf2f65',
        seed: 53109,
        length: 25903,
        note: 'All LP2 originals share an all-one encrypted header prefix, so header validity alone is not evidence.',
      },
      census: {
        pages: 58,
        successfulExtractions: successful.length,
        failedExtractions: failures.length,
        recognizableExtractions: recognizable.length,
      },
      successful,
      failureSummary: failures.reduce((acc, row) => {
        const key = row.diagnostic.includes('extracting datalen') ? 'capacity-or-iterator-failure' :
          (row.diagnostic || 'unknown');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
      decision: recognizable.length
        ? 'At least one M5N7 extraction has a recognizable structural flag and requires independent authentication.'
        : 'No M5N7 extraction has file magic, PGP armor, high printability, or low entropy; source-forced header success alone is rejected.',
    };

    console.log('LP2_M5N7_OUTGUESS_RESULT ' + JSON.stringify(output));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

if (require.main === module) main();
module.exports = { main, KEY };
