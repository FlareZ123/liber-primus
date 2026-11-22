/**
 * Fixed EPIPHANY SEECS / 2013 560.13 source-pad crib scan.
 * This searches every byte-aligned offset for direct GP29 one-byte-per-rune
 * +/- modular pad, no arbitrary starting offset selection and no fitted key.
 * Tested source contains no F plaintext within the 13-symbol heading, so
 * Cicada's historical literal-F bypass does not alter this initial check.
 *
 * @returns {Promise<void>}
 */
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gp = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const originalCipher = gp.pages[0].indices.slice(0, 13);
const word = 'EPIPHANYSEECS';
const symbolMap = new Map(gp.translit.map((s, i) => [s, i]));
const allegedPlain = [...word].map(ch => symbolMap.get(ch));
assert.equal(allegedPlain.length, 13);
assert(!allegedPlain.includes(undefined));
assert(!allegedPlain.includes(0));
assert.deepEqual(originalCipher, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
const k = originalCipher.map((x, i) => (x - allegedPlain[i] + 29) % 29);
assert.deepEqual(k, [26,24,8,19,27,24,18,3,0,8,0,16,19]);

/** @param {number[]} pattern */
function failure(pattern) {
  const fail = Array(pattern.length).fill(0);
  for (let i = 1, j = 0; i < pattern.length; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) j = fail[j - 1];
    if (pattern[i] === pattern[j]) j++;
    fail[i] = j;
  }
  return fail;
}

/** @param {number[][]} patterns */
function matcher(patterns) {
  const fail = patterns.map(failure);
  const states = patterns.map(() => 0);
  const found = patterns.map(() => []);
  let count = 0;
  return {
    feed(chunk) {
      for (const byte of chunk) {
        const value = byte % 29;
        for (let t = 0; t < patterns.length; t++) {
          const p = patterns[t], f = fail[t];
          let j = states[t];
          while (j > 0 && value !== p[j]) j = f[j - 1];
          if (value === p[j]) j++;
          if (j === p.length) {
            found[t].push(count - p.length + 1);
            j = f[j - 1];
          }
          states[t] = j;
        }
        count++;
      }
    },
    get found() { return found; },
    get count() { return count; },
  };
}

(async () => {
  const patterns = [k, k.map(x => (29 - x) % 29)];
  const planted = crypto.randomBytes(4096);
  for (let i = 0; i < k.length; i++) planted[2027 + i] = k[i];
  const control = matcher(patterns);
  control.feed(planted.subarray(0, 1000));
  control.feed(planted.subarray(1000));
  assert(control.found[0].includes(2027));
  assert.equal(control.count, planted.length);
  console.log('Positive source-shape KMP control PASS; fixed GP29 title key:', JSON.stringify(k));

  const url = 'https://archive.org/download/3301.iso/3301.iso/DATA%2F560.13';
  console.log('Checking full original 2013 CicadaOS DATA/560.13; start', new Date().toISOString());
  const response = await fetch(url, { signal: AbortSignal.timeout(12 * 60 * 1000) });
  assert(response.ok, 'Historical source fetch failed: HTTP '+response.status+' at '+url);
  assert(response.body);
  const hash = crypto.createHash('sha256');
  const scan = matcher(patterns);
  let nextMilestone = 20_000_000;
  for await (const chunk of response.body) {
    hash.update(chunk);
    scan.feed(chunk);
    if (scan.count >= nextMilestone) {
      console.log('Scanned', scan.count, 'original bytes');
      nextMilestone += 20_000_000;
    }
  }
  const sha256 = hash.digest('hex');
  console.log('SOURCE_SCAN', JSON.stringify({ length:scan.count,sha256,offsetsSubtract:scan.found[0],offsetsAdd:scan.found[1] }));
  assert.equal(scan.count, 118818811, 'Source length must match original ISO DATA/560.13');
  assert.equal(sha256, 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f', 'Historical archive source digest mismatch');
  console.log('Verified original-source full-range scan PASS', new Date().toISOString());
})().catch(err => { console.error(err); process.exitCode = 1; });
