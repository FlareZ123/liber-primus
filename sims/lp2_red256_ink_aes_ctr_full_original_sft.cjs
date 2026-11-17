'use strict';

/**
 * SFT: first-party chronological red-rune/13-dot 256-bit AES keys as full LP2 GP29 CTR pads.
 * Source: 225 printed red runes + 31 printed thirteen-dot marks, including original p7.
 * Node.js 22, CommonJS, built-in modules. Read-only, deterministic.
 * AES-CTR and GP29 projection are hypothesized consumers, not Cicada instructions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv, createHash } = require('node:crypto');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {any} */
const resource = (name) => JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const gp = resource('lp2-corpus.json');
const ann = resource('lp2-ink-annotations.json');
const table = resource('lp2-grid-256.json').pages.flatMap(p => p.bytes);
const pages = gp.pages.filter(p => p.page <= 55);
const C = pages.flatMap(p => p.indices);
const p57 = gp.pages.find(p => p.page === 57).indices;
const originalP0 = gp.pages.find(p => p.page === 0).indices;
assert.equal(gp.runes.length, 29);
assert.equal(table.length, 256);
assert.equal(C.length, 12956);
assert.equal(p57.length, 95);
assert.equal(originalP0.length, 262);

/** @type {{ page:number, pos:number, mark:boolean, value:number }[]} */
const events = [];
const index = new Map(gp.runes.map((r, i) => [r, i]));
for (const p of ann.pages) {
  for (const span of p.red_spans || []) {
    assert.equal([...span.runes].length, span.length);
    [...span.runes].forEach((symbol, j) => {
      assert(index.has(symbol));
      events.push({ page: p.page, pos: span.start + j,
        mark: false, value: index.get(symbol) });
    });
  }
  for (const mark of p.large_punctuation || []) {
    if (mark[1] === 13) events.push({
      page: p.page, pos: mark[0], mark: true, value: 0 });
  }
}
events.sort((a, b) => a.page - b.page || a.pos - b.pos ||
  (a.mark === b.mark ? 0 : a.mark ? -1 : 1));
assert.equal(events.length, 256);
assert.equal(events.filter(e => e.mark).length, 31);
assert.equal(events.filter(e => !e.mark).length, 225);

/** @param {number[]} bits @returns {Buffer} */
function packBits(bits) {
  assert.equal(bits.length, 256);
  return Buffer.from(Array.from({ length: 32 }, (_, row) =>
    bits.slice(row * 8, row * 8 + 8).reduce((n, bit) => (n << 1) | bit, 0)));
}
const keyRules = [
  { id: 'redParity_dot1', bits: events.map(e => e.mark ? 1 : e.value & 1),
    hex: '969e9985ec6e7c78636fa82fe7b244f3413f22709fd99b92e10a3e36dde3eb89' },
  { id: 'redParity_dot0', bits: events.map(e => e.mark ? 0 : e.value & 1),
    hex: '96989984606e0c78436e280fe4b244334139221087199b92e10a3e36d9e26888' },
  { id: 'redHigh_dot1', bits: events.map(e => e.mark ? 1 : Number(e.value >= 15)),
    hex: 'a6f7134baf6e7b42e2439ff457524deed9e704705dcda280e95c142507e3db5f' },
  { id: 'redHigh_dot0', bits: events.map(e => e.mark ? 0 : Number(e.value >= 15)),
    hex: 'a6f1134a236e0b42c2421fd454524d2ed9e10410450da280e95c142503e2585e' },
];
for (const rule of keyRules) assert.equal(packBits(rule.bits).toString('hex'), rule.hex);

const ivs = [
  { id: 'zeroIV', bytes: Buffer.alloc(16) },
  { id: 'p50First16', bytes: Buffer.from(table.slice(0, 16)) },
];
const clocks = ['book', 'page', 'chapter'];
const reducers = ['mod29', 'scaled29', 'reject232'];
const chapters = new Set([0, 3, 8, 15, 23, 28, 32, 40, 54]);
const groupLengths = { book: [12956], page: [], chapter: [] };
for (const page of pages) {
  if (page.indices.length === 0) continue;
  groupLengths.page.push(page.indices.length);
}
let chapterLen = 0;
for (const page of pages) {
  if (chapters.has(page.page) && chapterLen > 0) {
    groupLengths.chapter.push(chapterLen);
    chapterLen = 0;
  }
  chapterLen += page.indices.length;
}
groupLengths.chapter.push(chapterLen);
assert.equal(groupLengths.page.length, 55);
assert.equal(groupLengths.chapter.length, 9);
for (const lengths of Object.values(groupLengths)) {
  assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
}

/** @param {Buffer} key @param {Buffer} iv @param {string} reducer @returns {number[]} */
function makePad(key, iv, reducer) {
  const aes = createCipheriv('aes-256-ctr', key, iv);
  const raw = Buffer.concat([aes.update(Buffer.alloc(30000)), aes.final()]);
  const out = [];
  for (const b of raw) {
    if (reducer === 'reject232' && b >= 232) continue;
    out.push(reducer === 'scaled29' ? Math.floor(b * 29 / 256) : b % 29);
    if (out.length === C.length) break;
  }
  assert.equal(out.length, C.length);
  assert(out.every(x => Number.isInteger(x) && x >= 0 && x < 29));
  return out;
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const cnt = Array(29).fill(0);
  for (const x of input) cnt[x]++;
  return cnt.reduce((s, n) => s + n * (n - 1), 0) / (input.length * (input.length - 1));
}
/** @param {number[]} input @param {number[]} pad @param {number[]} groups @param {number} sign @returns {number[]} */
function transform(input, pad, groups, sign) {
  const out = [];
  let at = 0;
  for (const size of groups) {
    for (let k = 0; k < size; k++) out.push((input[at++] + sign * pad[k] + 29) % 29);
  }
  assert.equal(at, input.length);
  return out;
}
/** @param {number[]} cipher @param {number[]} pad @param {number} sign @returns {{length:number,states:number,full:boolean}} */
function strictF(cipher, pad, sign) {
  let states = new Set([0]);
  let until = 0;
  for (const ch of cipher) {
    const next = new Set();
    for (const consumed of states) {
      if (ch === 0) next.add(consumed);
      const plain = (ch + sign * pad[consumed] + 29) % 29;
      if (plain !== 0) next.add(consumed + 1);
    }
    if (next.size === 0) break;
    states = next;
    until++;
  }
  return { length: until, states: states.size, full: until === cipher.length };
}
/** @param {number[]} plain @param {number[]} pad @param {number} sign @returns {number[]} */
function encryptStrictF(plain, pad, sign) {
  let consumed = 0;
  return plain.map(ch => {
    if (ch === 0) return 0;
    return (ch - sign * pad[consumed++] + 29) % 29;
  });
}
/** @param {number[]} input @returns {string} */
function translit(input) { return input.map(x => gp.translit[x]).join(''); }
const results = [];
let positives = 0;
for (const rule of keyRules) {
  const key = packBits(rule.bits);
  for (const iv of ivs) {
    for (const reducer of reducers) {
      const pad = makePad(key, iv.bytes, reducer);
      for (const clock of clocks) {
        const groups = groupLengths[clock];
        for (const sign of [-1, 1]) {
          const decrypted = transform(C, pad, groups, sign);
          assert.deepEqual(transform(decrypted, pad, groups, -sign), C);
          const originalP57cipher = p57.map((x, i) => (x - sign * pad[i] + 29) % 29);
          assert.deepEqual(transform(originalP57cipher, pad, [95], sign), p57);
          const fCipher = encryptStrictF(p57, pad, sign);
          assert(strictF(fCipher, pad, sign).full);
          positives++;
          let at = 0;
          const perPage = [];
          for (const page of pages) {
            perPage.push({ page: page.page, offset: at, length: page.indices.length });
            at += page.indices.length;
          }
          const first = decrypted.slice(0, 729);
          const sourceP55 = perPage.find(p => p.page === 55);
          const p55plain = decrypted.slice(sourceP55.offset, sourceP55.offset + sourceP55.length);
          const p40 = perPage.find(p => p.page === 40);
          const p54 = perPage.find(p => p.page === 54);
          const p40text = decrypted.slice(p40.offset, p54.offset);
          // Strict-F on original p0 uses the same local zero pad for every clock.
          const f0 = strictF(originalP0, pad, sign);
          const openingPages = gp.pages.filter(p => p.page <= 2);
          let openingFmax = 0;
          if (clock === 'page') {
            for (const page of openingPages) {
              const result = strictF(page.indices, pad, sign);
              openingFmax += result.length;
              if (!result.full) break;
            }
          } else {
            openingFmax = strictF(C.slice(0, 729), pad, sign).length;
          }
          results.push({
            key: rule.id, iv: iv.id, reducer, clock, sign,
            ioc: ioc(decrypted), p0to2Ioc: ioc(first),
            p40to53Ioc: ioc(p40text), p55Ioc: ioc(p55plain),
            p0Fmax: f0.length, p0Ffull: f0.full,
            opening729Fmax: openingFmax, opening729Ffull: openingFmax === 729,
            start: translit(decrypted.slice(0, 48))
          });
        }
      }
    }
  }
}
assert.equal(results.length, 144);
assert.equal(positives, 144);
const sortBy = (field) => results.slice().sort((a, b) => b[field] - a[field]).slice(0, 5);
const summary = {
  source: { unknownRunes: C.length, pages: pages.length, redEvents: events.length,
    redRunes: 225, thirteenDotMarks: 31, tableBytes: table.length,
    tableSha256: createHash('sha256').update(Buffer.from(table)).digest('hex'),
    pageLengths: pages.map(p => p.indices.length),
    clockGroupLengths: groupLengths },
  tests: results.length, p57PositiveControls: positives,
  originalIoc: ioc(C), solvedP57Ioc: ioc(p57),
  bestWhole: sortBy('ioc'), bestOpening729: sortBy('p0to2Ioc'),
  bestP40to53: sortBy('p40to53Ioc'), bestP55: sortBy('p55Ioc'),
  strictF: { p0FullCount: results.filter(x => x.p0Ffull).length,
    longestP0Prefix: Math.max(...results.map(x => x.p0Fmax)),
    opening729FullCount: results.filter(x => x.opening729Ffull).length,
    longestOpeningPrefix: Math.max(...results.map(x => x.opening729Fmax)),
    bestOpeningPrefixes: results.slice().sort((a, b) =>
      b.opening729Fmax - a.opening729Fmax).slice(0, 8) }
};
console.log(JSON.stringify(summary, null, 2));
console.log('RESULT: Exact 144-case source-frozen AES-CTR original-input gate; no linguistic claims from isolated maxima.');
