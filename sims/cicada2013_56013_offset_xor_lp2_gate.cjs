'use strict';

/**
 * Reconstruct/use the archived 2013 560.13 material in a bounded
 * source-derived 2014 -> LP2 transfer test.
 *
 * Inputs:
 * - resources/derived/cicada2013-56013-reconstructed.bin
 * - resources/cicada2014-onion2-timing.json (256-byte final_hex)
 * - resources/liber-primus/lp2-corpus.json
 *
 * Candidate offsets are fixed before LP2 scoring:
 *   133, 331: literal 2014 onion7 HTML title/id
 *   449, 1109: zero-based selectors into the corrected 361-entry
 *              2013 prime/gap sequence
 *
 * For each offset, test the raw 256-byte 560.13 slice and the exact
 * historical phone-puzzle operation (slice XOR onion2 timing bytes).
 * Each 256-byte result is projected to GP29 by byte%29 or
 * floor(byte*29/256), then tested with both signs and page-reset/
 * continuous clocks.
 *
 * Run: node sims/cicada2013_56013_offset_xor_lp2_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {sequence} = require('./telnet2013_prime_gap361_gate.cjs');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p));
const source = read('resources/derived/cicada2013-56013-reconstructed.bin');
const timingJson = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/cicada2014-onion2-timing.json'), 'utf8'));
const timing = Buffer.from(timingJson.final_hex, 'hex');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p =>
  p.page <= 55 && p.status === 'unsolved' && p.indices.length
).map(p => p.indices);
const MOD = 29;
const OFFSETS = [133, 331, 449, 1109];
const PHONE_DATA_HEX = '28c07e1b102d4d5c4c1a376e064477e1416fcc94928765';
const PHONE_OFFSET = 12821;
const PHONE_EXPECTED = 'gbyh7znm6c7ezsmr.onion\n';

function mod(x, n) {
  return ((x % n) + n) % n;
}
function ioc(values) {
  const counts = new Uint32Array(MOD);
  for (const x of values) counts[x]++;
  const n = values.length;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}
function scoreKey(bytes, offset, kind) {
  const results = [];
  for (const reducer of ['mod29', 'scaled29']) {
    const key = Array.from(bytes, b =>
      reducer === 'mod29' ? b % MOD : Math.floor(b * MOD / 256));
    for (const clock of ['page', 'continuous']) {
      for (const sign of [-1, 1]) {
        const out = [];
        let global = 0;
        for (const page of pages) {
          for (let local = 0; local < page.length; local++, global++) {
            const pos = clock === 'page' ? local : global;
            out.push(mod(page[local] + sign * key[pos % key.length], MOD));
          }
        }
        results.push({
          offset, kind, reducer, clock, sign, ioc: ioc(out),
          uniqueBytes: new Set(bytes).size,
          printableFraction: bytes.filter(b => b >= 32 && b <= 126).length / bytes.length
        });
      }
    }
  }
  return results;
}
function main() {
  assert.equal(source.length, 15330);
  assert.equal(timing.length, 256);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, p) => s + p.length, 0), 12956);
  assert.equal(sequence[133], 449);
  assert.equal(sequence[331], 1109);

  // Reproduce the known 2013 phone message before using this derived resource.
  const phoneData = Buffer.from(PHONE_DATA_HEX, 'hex');
  const phoneOut = Buffer.alloc(phoneData.length);
  for (let i = 0; i < phoneData.length; i++) {
    phoneOut[i] = phoneData[i] ^ source[PHONE_OFFSET + i];
  }
  assert.equal(phoneOut.toString('latin1'), PHONE_EXPECTED);

  const original = pages.flat();
  const models = [];
  const extracted = [];
  for (const offset of OFFSETS) {
    const slice = source.subarray(offset, offset + 256);
    assert.equal(slice.length, 256);
    const xorTiming = Buffer.alloc(256);
    for (let i = 0; i < 256; i++) xorTiming[i] = slice[i] ^ timing[i];
    extracted.push({
      offset,
      rawUniqueBytes: new Set(slice).size,
      xorUniqueBytes: new Set(xorTiming).size,
      rawPrintableFraction: slice.filter(b => b >= 32 && b <= 126).length / 256,
      xorPrintableFraction: xorTiming.filter(b => b >= 32 && b <= 126).length / 256
    });
    models.push(...scoreKey(slice, offset, '56013-slice'));
    models.push(...scoreKey(xorTiming, offset, '56013-slice-xor-onion2-timing'));
  }
  assert.equal(models.length, 64);
  const min = Math.min(...models.map(x => x.ioc));
  const max = Math.max(...models.map(x => x.ioc));
  assert.ok(min > 0.0344 && max < 0.0346);
  return {
    source: {
      derived56013Bytes: source.length,
      timingBytes: timing.length,
      timingSha256: timingJson.final_bytes_sha256,
      historicalPhoneControl: {
        offset: PHONE_OFFSET,
        dataBytes: phoneData.length,
        recovered: phoneOut.toString('latin1'),
        exact: true
      }
    },
    original: {
      pages: pages.length,
      runes: original.length,
      ioc: ioc(original),
      uniformReference: 1 / MOD
    },
    offsets: OFFSETS,
    extracted,
    modelCount: models.length,
    iocRange: {min, max},
    bestAndWorst: {
      highestIoC: models.slice().sort((a, b) => b.ioc - a.ioc)[0],
      lowestIoC: models.slice().sort((a, b) => a.ioc - b.ioc)[0]
    },
    models,
    decision: 'No original LP2 plaintext from these four 560.13 offsets, the 2014 timing XOR, or the two fixed direct-GP29 byte projections.'
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
}
module.exports = {main, scoreKey, ioc};
