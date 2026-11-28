'use strict';

/**
 * Source-frozen terminal composition:
 *   solved p56 plaintext || clear p57 -> 76 ordinal-wheel carry positions;
 *   shed p50 circumference -> 30x6 inner register (180 cells);
 *   select inner cells at those 76 carry positions;
 *   use selected values as the complete p55 key under the historically
 *   attested GP29 additive family, with source-era XOR as an alphabet gate.
 *
 * Also tests the actual p54||p55 308-rune chapter clock, where p55 begins
 * at key phase 232 mod 76 = 4.
 *
 * Run from repository root:
 *   node sims/lp2_terminal180_carrypos_inner180_p55_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'
));

const mod = (x, n = 29) => ((x % n) + n) % n;
const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} words @returns {number[]} */
function toGp(words) {
  const source = words.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < source.length;) {
    if (source[i] === ' ') {
      i++;
      continue;
    }
    if (source.startsWith('ING', i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (source.startsWith('IO', i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const hit = tokens.find(({ s }) => source.startsWith(s, i));
    assert.ok(hit, 'No GP token at ' + source.slice(i));
    out.push(hit.i);
    i += hit.s.length;
  }
  return out;
}

/** @param {number[]} source */
function carryEvents(source) {
  let wheel = 0;
  const events = [];
  for (let i = 0; i < source.length; i++) {
    const before = wheel;
    const total = wheel + source[i];
    wheel = total % 29;
    if (total >= 29) {
      events.push({
        pos: i,
        trigger: source[i],
        before,
        after: wheel,
        primeTrigger: gp.prime[source[i]] % 29,
      });
    }
  }
  assert.equal(wheel, 0);
  return events;
}

/** @param {number[]} runes */
function scaledIoC(runes) {
  const hist = Array(29).fill(0);
  for (const rune of runes) hist[rune]++;
  return 29 * hist.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

/** @param {number[]} cipher @param {number[]} key @param {-1|1} sign */
function additiveDecode(cipher, key, sign) {
  return cipher.map((c, i) => mod(c + sign * key[i % key.length]));
}

/** @param {number[]} plain @param {number[]} key @param {-1|1} sign */
function additiveEncode(plain, key, sign) {
  return plain.map((p, i) => mod(p - sign * key[i % key.length]));
}

/** @param {number[]} a @param {number[]} b */
function bestShift(a, b) {
  const counts = Array(29).fill(0);
  for (let i = 0; i < a.length; i++) counts[mod(a[i] - b[i])]++;
  const best = Math.max(...counts);
  return { shift: counts.indexOf(best), matches: best };
}

const p56Words =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56 = toGp(p56Words);
const p57 = gp.pages.find(({ page }) => page === 57).indices;
const terminal = p56.concat(p57);
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(terminal.length, 180);
assert.equal(terminal.reduce((sum, x) => sum + x, 0), 2204);

const events = carryEvents(terminal);
assert.equal(events.length, 76);

const innerTokens = grid.rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
const inner60 = grid.byte_rows.slice(1, 31).flatMap((row) => row.slice(1, 7));
assert.equal(innerTokens.length, 180);
assert.equal(inner60.length, 180);

const alphabet59 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
assert.equal(alphabet59.length, 59);
const inner59 = innerTokens.map((token) => {
  const hi = alphabet59.indexOf(token[0]);
  const lo = alphabet59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, 'Token outside drop-f base59: ' + token);
  return 59 * hi + lo;
});

const p54 = gp.pages.find(({ page }) => page === 54).indices;
const p55 = gp.pages.find(({ page }) => page === 55).indices;
const chapter = p54.concat(p55);
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);
assert.equal(chapter.length, 308);
assert.equal(232 % 76, 4);

const selected = {
  base60: events.map(({ pos }) => inner60[pos]),
  base59: events.map(({ pos }) => inner59[pos]),
};
for (const values of Object.values(selected)) assert.equal(values.length, 76);

const direct = [];
const chapterResults = [];
const eventCorrespondence = [];

for (const [radix, bytes] of Object.entries(selected)) {
  const key = bytes.map((value) => value % 29);

  for (const sign of /** @type {const} */ ([-1, 1])) {
    const p55Plain = additiveDecode(p55, key, sign);
    assert.deepEqual(additiveEncode(p55Plain, key, sign), p55);
    direct.push({
      radix,
      sign,
      scaledIoC: scaledIoC(p55Plain),
      first24: p55Plain.slice(0, 24).map((i) => gp.translit[i]).join(' '),
    });

    const chapterPlain = additiveDecode(chapter, key, sign);
    assert.deepEqual(additiveEncode(chapterPlain, key, sign), chapter);
    chapterResults.push({
      radix,
      sign,
      scaledIoC: scaledIoC(chapterPlain),
      p55Phase: p54.length % 76,
      p54First40: chapterPlain.slice(0, 40).map((i) => gp.translit[i]).join(' '),
      p55First40: chapterPlain.slice(232, 272).map((i) => gp.translit[i]).join(' '),
    });

    // Mechanism-positive: the same frozen key recovers a native solved tail.
    const planted = p57.slice(0, 76);
    const plantedCipher = additiveEncode(planted, key, sign);
    assert.deepEqual(additiveDecode(plantedCipher, key, sign), planted);
  }

  const xor = p55.map((c, i) => c ^ (bytes[i] & 31));
  direct.push({
    radix,
    operation: 'xor-low5',
    nativeGp: xor.filter((x) => x < 29).length,
    invalidPositions: xor.flatMap((x, i) => x >= 29 ? [i] : []),
  });

  const residue = bytes.map((x) => x % 29);
  const exact = {};
  const shifts = {};
  for (const field of ['trigger', 'before', 'after', 'primeTrigger']) {
    const source = events.map((event) => event[field]);
    exact[field] = residue.filter((x, i) => x === source[i]).length;
    shifts[field] = bestShift(residue, source);
  }
  eventCorrespondence.push({ radix, exact, shifts });
}

assert.deepEqual(
  direct.filter((x) => x.operation === 'xor-low5').map((x) => x.nativeGp),
  [69, 69]
);
assert.deepEqual(
  chapterResults.map((x) => Number(x.scaledIoC.toFixed(12))),
  [0.996150429375, 0.977748635729, 0.994923643132, 1.004737933077]
);

console.log(JSON.stringify({
  status: 'PASS: carry-position-selected inner-table p55 receiver is source-frozen and negative under direct GP29/XOR consumers',
  source: {
    terminalRunes: terminal.length,
    terminalOrdinalSum: 2204,
    carries: events.length,
    carryPositions: events.map(({ pos }) => pos),
    innerCells: inner60.length,
    selectedCells: 76,
    p55Runes: p55.length,
    chapterRunes: chapter.length,
    p55ChapterKeyPhase: p54.length % 76,
  },
  selected,
  direct,
  eventCorrespondence,
  chapterResults,
}, null, 2));
