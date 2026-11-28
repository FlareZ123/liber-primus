'use strict';

/**
 * Source-selected p50 horizontal reflection transferred to p51's unique 72/72
 * same-page receiver, under the newly strengthened base59 state route.
 *
 * SFT: node sims/lp2_p51_base59_reflected72_receiver_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const ids = new Map(corpus.runes.map((r, i) => [r, i]));

const sourceP51 = source.split('%')[50];
const words = sourceP51.replace(/[\r\n/]/g, '').split(/[-.&$§]/)
  .map(token => [...token].filter(r => ids.has(r)).map(r => ids.get(r)))
  .filter(word => word.length);
const original = corpus.pages.find(page => page.page === 51).indices;
assert.deepEqual(words.flat(), original);
assert.equal(original.length, 92);
assert.equal(words.length, 20);
assert.equal(original.length - words.length, 72);

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');
assert.equal(alphabet59.length, 59);
const tokenFrom60 = value => alphabet60[Math.floor(value / 60)] + alphabet60[value % 60];
// Original physical split is 10 rows on p49, 13 on p50, 9 on p51.
const p51Start = (10 + 13) * 8;
assert.equal(p51Start, 184);
const p51Tokens = grid.bytes.slice(p51Start).map(tokenFrom60);
assert.equal(p51Tokens.length, 9 * 8);
assert.ok(p51Tokens.every(token => [...token].every(ch => alphabet59.includes(ch))));

const decode59 = token =>
  alphabet59.indexOf(token[0]) * 59 + alphabet59.indexOf(token[1]);
const base59 = p51Tokens.map(decode59);
assert.ok(base59.every(value => value >= 0 && value < 256));

// Independent p50 artwork result: horizontal reflection c -> 7-c.
// Apply only that operation, row-by-row, to the source's 9x8 p51 block.
const reflected = [];
for (let row = 0; row < 9; row++) {
  for (let column = 0; column < 8; column++) {
    reflected.push(base59[row * 8 + (7 - column)]);
  }
}
assert.equal(reflected.length, 72);
for (let row = 0; row < 9; row++) {
  assert.deepEqual(
    reflected.slice(row * 8, row * 8 + 8),
    base59.slice(row * 8, row * 8 + 8).reverse()
  );
}

const mod = n => (n % 29 + 29) % 29;
const ioc = xs => {
  const h = Array(29).fill(0);
  for (const x of xs) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};

// Solved native controls, exactly the same register used by the established
// p51 72/72 report.
const native = corpus.pages.find(page => page.page === 57).indices;
assert.equal(native.length, 95);
const lp1Lines = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split(/\r?\n/).filter(line => line && !/^\s*(#|\[|\d)/.test(line));
const sourceNativeTokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
function encodeEditorialGP(text) {
  const normalized = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[VKZQ]/g, ch => ({V:'U',K:'C',Z:'S',Q:'C'})[ch]);
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const hit = sourceNativeTokens.find(({token}) =>
      normalized.startsWith(token, offset));
    if (hit) { out.push(hit.i); offset += hit.token.length; }
    else offset++;
  }
  return out;
}
const lp1 = encodeEditorialGP(lp1Lines.join(' '));
assert.equal(lp1.length, 3107);
let controlMin = Infinity;
const controlIocs = [];
for (let i = 0; i + 72 <= lp1.length; i++) {
  const value = ioc(lp1.slice(i, i + 72));
  controlIocs.push(value);
  controlMin = Math.min(controlMin, value);
}
assert.equal(controlIocs.length, 3036);
assert.ok(Math.abs(controlMin - 0.045774647887323945) < 1e-14);

const results = [];
for (const cut of ['first', 'last']) {
  const retained = words.flatMap(word =>
    cut === 'first' ? word.slice(1) : word.slice(0, -1));
  assert.equal(retained.length, 72);
  for (const sign of [-1, 1]) {
    const key = reflected.map(value => value % 29);
    const plain = retained.map((c, i) => mod(c + sign * key[i]));
    const reenacted = plain.map((p, i) => mod(p - sign * key[i]));
    assert.deepEqual(reenacted, retained);

    // Positive plant: the exact same transform must invert/replay 72 clear runes.
    const plantedCipher = native.slice(0, 72)
      .map((p, i) => mod(p - sign * key[i]));
    const recoveredPlant = plantedCipher
      .map((c, i) => mod(c + sign * key[i]));
    assert.deepEqual(recoveredPlant, native.slice(0, 72));

    const outputIoc = ioc(plain);
    const controlsAtOrBelow = controlIocs.filter(x => x <= outputIoc).length;
    results.push({
      cut, sign, ioc: outputIoc, controlsAtOrBelow,
      transliteration: plain.map(v => corpus.translit[v]).join('')
    });
  }
}
assert.equal(results.length, 4);

console.log(JSON.stringify({
  source: {
    page:51, panelShape:[9,8], panelCells:72,
    ciphertextRunes:92, printedWords:20, shedReceiverRunes:72,
    operation:'base59 decode; source-selected horizontal reflection c->7-c; mod29 additive inverse'
  },
  solvedControl: {
    lp1Windows72:controlIocs.length,
    minimumIoC:controlMin,
    clearP57IoC:ioc(native)
  },
  candidates:results,
  allBelowSolvedWindowMinimum:results.every(x => x.ioc < controlMin),
  decision:'bounded reflected base59 additive receiver only; no plaintext claim'
}, null, 2));
