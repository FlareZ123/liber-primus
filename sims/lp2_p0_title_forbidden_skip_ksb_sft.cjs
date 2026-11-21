'use strict';

/**
 * Source-key recovery for conditional LP2 p0 title EPIPHANY SEEKS.
 * Node 22 / CommonJS, read-only SFT.
 * Usage: node sims/lp2_p0_title_forbidden_skip_ksb_sft.cjs external-cicada3301
 * External key library: pnotisdev/cicada3301 at commit
 * 15200c67abee106913ba01ff504c5b6e88d16cc7.
 *
 * A candidate key redraw is legal ONLY if that GP29 key value would
 * recreate the preceding observed ciphertext rune. At most two such
 * redraws are allowed; no arbitrary gap or plaintext mismatch is fitted.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const C = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
const P = [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15];
const MOD = 29;
const SKIP_BUDGET = 2;

/**
 * @param {Buffer} data
 * @returns {{name: string, values: Buffer}[]}
 */
function parseKsb(data) {
  assert.equal(data.toString('ascii', 0, 4), 'KSB1');
  const count = data.readUInt32LE(4);
  const streams = [];
  let offset = 8;
  for (let i = 0; i < count; i++) {
    const nameLength = data.readUInt16LE(offset);
    offset += 2;
    const name = data.toString('utf8', offset, offset + nameLength);
    offset += nameLength;
    const size = data.readUInt32LE(offset);
    offset += 4;
    const values = data.subarray(offset, offset + size);
    assert.equal(values.length, size);
    offset += size;
    streams.push({name, values});
  }
  assert.equal(offset, data.length);
  return streams;
}

/**
 * @param {number[]} ciphertext
 * @param {number[]} plaintext
 * @param {1 | -1} sign Positive for C=P+K; negative for C=P-K.
 */
function requiredKey(ciphertext, plaintext, sign) {
  const key = ciphertext.map((c, i) =>
    (sign * (c - plaintext[i]) % MOD + MOD) % MOD);
  const forbidden = ciphertext.map((c, i) =>
    i === 0 ? -1 : (sign * (ciphertext[i - 1] - plaintext[i]) % MOD + MOD) % MOD);
  for (let i = 1; i < key.length; i++) assert.notEqual(key[i], forbidden[i]);
  return {key, forbidden};
}

/**
 * Find exact matches, allowing only skipped values that would make a
 * forbidden repeat of the preceding original ciphertext rune.
 *
 * @param {Buffer} stream
 * @param {number[]} key
 * @param {number[]} forbidden
 * @param {number} budget
 * @returns {{start:number, end:number, skips:{at:number,before:number}[]}[]}
 */
function scan(stream, key, forbidden, budget) {
  const hits = [];
  for (let start = stream.indexOf(key[0]); start >= 0;
    start = stream.indexOf(key[0], start + 1)) {
    const todo = [{pos: start + 1, i: 1, skips: []}];
    while (todo.length) {
      const state = todo.pop();
      if (state.i === key.length) {
        hits.push({start, end: state.pos, skips: state.skips});
        continue;
      }
      if (state.pos >= stream.length) continue;
      const value = stream[state.pos];
      if (value === key[state.i]) {
        todo.push({pos: state.pos + 1, i: state.i + 1, skips: state.skips});
      }
      if (state.skips.length < budget && value === forbidden[state.i]) {
        todo.push({
          pos: state.pos + 1, i: state.i,
          skips: [...state.skips, {at: state.pos, before: state.i}],
        });
      }
    }
  }
  return hits;
}

function selfTest() {
  const plus = requiredKey(C, P, 1);
  const minus = requiredKey(C, P, -1);
  assert.deepEqual(plus.key, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
  assert.deepEqual(plus.forbidden, [-1, 2, 27, 5, 24, 11, 10, 1, 14, 26, 8, 13, 6]);
  assert.deepEqual(minus.key, plus.key.map(x => (MOD - x) % MOD));
  const planted = positions => Buffer.from([4, 1, 7,
    ...plus.key.flatMap((value, i) =>
      positions.includes(i) ? [plus.forbidden[i], value] : [value]),
    6, 9]);
  const hit = scan(planted([3, 8]), plus.key, plus.forbidden, 2);
  assert.equal(hit.length, 1);
  assert.equal(hit[0].start, 3);
  assert.deepEqual(hit[0].skips.map(x => x.before), [3, 8]);
  assert.equal(scan(planted([3, 8]), plus.key, plus.forbidden, 1).length, 0);
  assert.equal(scan(planted([3, 8, 9]), plus.key, plus.forbidden, 2).length, 0);
  assert.equal(scan(Buffer.from([0, ...plus.key]), plus.key, plus.forbidden, 0).length, 1);
  assert.equal(scan(Buffer.from([0, ...minus.key]), minus.key, minus.forbidden, 0).length, 1);
}

function main() {
  selfTest();
  assert.equal(process.argv.length, 3, 'Supply external checkout directory');
  const corpus = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  assert.deepEqual(corpus.pages[0].indices.slice(0, 13), C);
  const external = path.resolve(process.argv[2]);
  const streams = parseKsb(fs.readFileSync(
    path.join(external, 'work/kscreen/data/library.ksb')));
  assert.equal(streams.length, 1439);
  const keys = [
    {sign: 'C=P+K', ...requiredKey(C, P, 1)},
    {sign: 'C=P-K', ...requiredKey(C, P, -1)},
  ];
  const matches = [];
  let sourceSymbols = 0;
  for (const source of streams) {
    sourceSymbols += source.values.length;
    for (const orientation of ['forward', 'reverse']) {
      const values = orientation === 'forward' ?
        source.values : Buffer.from(source.values).reverse();
      for (const key of keys) {
        for (const hit of scan(values, key.key, key.forbidden, SKIP_BUDGET)) {
          matches.push({
            source: source.name,
            orientation,
            sign: key.sign,
            original_offset: orientation === 'forward' ?
              hit.start : values.length - 1 - hit.start,
            consumed: hit.end - hit.start,
            forced_skips: hit.skips,
          });
        }
      }
    }
  }
  console.log(JSON.stringify({
    status: matches.length ? 'SOURCE CANDIDATE' : 'NO SOURCE-STREAM MATCH',
    candidate_title: 'EPIPHANY SEEKS',
    key_library_commit: '15200c67abee106913ba01ff504c5b6e88d16cc7',
    stream_count: streams.length,
    source_symbols: sourceSymbols,
    charged_signs: 2,
    charged_orientations: 2,
    maximum_source_forced_skips: SKIP_BUDGET,
    required_plus_key: keys[0].key,
    forbidden_plus_skips_after_first: keys[0].forbidden.slice(1),
    matches,
    interpretation: matches.length ?
      'Forward-decrypt untouched p0 body before claiming any plaintext.' :
      'Excludes only this conditional title and skip-by-rejecting-equal-rune mechanism against the finite historical key library.',
  }, null, 2));
}

if (require.main === module) main();
