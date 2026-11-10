'use strict';
/** Standalone original-LP2 SFT. Node.js/CommonJS; read-only. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const original = pages.flatMap((p) => p.indices);
const key = grid.bytes;
assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(key.length, 256);
assert(key.every((n) => Number.isInteger(n) && n >= 0 && n < 256));
/** @param {number} n */
const mod = (n) => (n % 29 + 29) % 29;
/** Standard RC4 KSA/PRGA. @param {number[]} bytes @param {number} length */
function rc4(bytes, length) {
  const s = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + bytes[i % bytes.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  let i = 0;
  j = 0;
  const output = [];
  for (let t = 0; t < length; t++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    output.push(s[(s[i] + s[j]) & 255]);
  }
  return output;
}
/**
 * @param {number[]} input
 * @param {number[]} pad
 * @param {'direct'|'difference'} kind
 * @param {number} sign
 * @param {boolean} decrypt
 */
function transform(input, pad, kind, sign, decrypt) {
  const output = [];
  let start = 0;
  for (const page of pages) {
    let previous = 0; // page-local ciphertext feedback, for both pad clocks
    for (let i = 0; i < page.indices.length; i++) {
      const x = input[start + i];
      const k = pad[start + i] % 29;
      if (decrypt) {
        output.push(mod((kind === 'difference' ? x - previous : x) - sign * k));
        previous = x;
      } else {
        const c = mod(x + sign * k + (kind === 'difference' ? previous : 0));
        output.push(c);
        previous = c;
      }
    }
    start += page.indices.length;
  }
  return output;
}
/** @param {number[]} sequence */
function ioc(sequence) {
  const n = new Array(29).fill(0);
  for (const x of sequence) n[x]++;
  return n.reduce((sum, count) => sum + count * (count - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
function plantReference() {
  const latin = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .replace(/^#.*$/gm, '').toUpperCase();
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length || a.index - b.index);
  const out = [];
  for (let i = 0; i < latin.length;) {
    const t = tokens.find(({ token }) => latin.startsWith(token, i));
    if (t) {
      out.push(t.index);
      i += t.token.length;
    } else i++;
  }
  assert(out.length > 3000);
  return original.map((_, i) => out[i % out.length]);
}
const plant = plantReference();
const rows = [];
for (const clock of ['book', 'page']) {
  const pad = clock === 'book' ? rc4(key, original.length) :
    pages.flatMap((page) => rc4(key, page.indices.length));
  for (const kind of ['direct', 'difference']) for (const sign of [1, -1]) {
    const candidate = transform(original, pad, kind, sign, true);
    const encryptedPlant = transform(plant, pad, kind, sign, false);
    const recoveredPlant = transform(encryptedPlant, pad, kind, sign, true);
    const recovered = recoveredPlant.filter((x, i) => x === plant[i]).length;
    assert.equal(recovered, original.length);
    rows.push({ clock, kind, sign, originalIoc: ioc(candidate),
      plantedIoc: ioc(recoveredPlant), exactPlantRunes: recovered,
      preview: candidate.slice(0, 32).map((i) => corpus.translit[i]).join(' ') });
  }
}
console.log(JSON.stringify({ source: 'original 256-byte LP2 base60 table',
  hypothesis: 'RC4 with byte%29 additive or page-local differential GP29 inverse',
  runes: original.length, originalIoc: ioc(original), plantedIoc: ioc(plant),
  results: rows }, null, 2));
