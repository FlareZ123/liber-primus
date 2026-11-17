'use strict';

/**
 * LP2 original three-channel 256-position Shamir 2-of-3 inverse gate.
 * Run: node sims/lp2_red256_grid_terminal256_shamir2of3_sft.cjs
 *
 * Source channels:
 *  - all 225 red runes and 31 original thirteen-dot marks (256 events);
 *  - all 256 original p49-51 two-character numerical cells;
 *  - p55's 76 unsolved runes + p56's 85 solved + p57's 95 clear runes.
 * 2013 Cicada used Shamir sharing, motivating a direct finite-field check.
 * This script tests a necessary condition, not an independently authorized cipher.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/base60-grid.json');
const mod = (n) => ((n % 29) + 29) % 29;

/** @returns {{index:number|null,page:number,offset:number}[]} */
function sourceEvents() {
  const out = [];
  for (const page of ink.pages) {
    const within = [];
    for (const span of page.red_spans || []) {
      const runes = [...span.runes];
      assert.equal(runes.length, span.length);
      for (let k = 0; k < runes.length; k++) {
        const index = corpus.runes.indexOf(runes[k]);
        assert.ok(index >= 0, 'unknown red rune');
        assert.equal(corpus.pages[page.page].indices[span.start + k], index);
        within.push({offset:span.start + k, kind:1, index, page:page.page});
      }
    }
    for (const [offset, dots] of page.large_punctuation || []) {
      if (dots === 13) within.push({offset, kind:0, index:null, page:page.page});
    }
    within.sort((a, b) => a.offset - b.offset || a.kind - b.kind);
    for (const event of within) {
      out.push({index:event.index, page:event.page, offset:event.offset});
    }
  }
  assert.equal(out.filter(e => e.index !== null).length, 225);
  assert.equal(out.filter(e => e.index === null).length, 31);
  assert.equal(out.length, 256);
  return out;
}

/** @returns {{radix:number, bytes:number[]}[]} */
function sourceTables() {
  const bytes60 = grid.byte_rows.flat();
  assert.equal(bytes60.length, 256);
  const digest = crypto.createHash('sha256').update(Buffer.from(bytes60)).digest('hex');
  assert.equal(digest, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const alphabet59 = grid.alphabet.replace('f', '');
  assert.equal(alphabet59.length, 59);
  const bytes59 = grid.rows.flat().map(token => {
    assert.equal(token.length, 2);
    const high = alphabet59.indexOf(token[0]);
    const low = alphabet59.indexOf(token[1]);
    assert.ok(high >= 0 && low >= 0);
    const value = high * 59 + low;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
  assert.equal(bytes59.length, 256);
  return [{radix:60, bytes:bytes60}, {radix:59, bytes:bytes59}];
}

/**
 * A source-blind stationary 29-symbol lookup may be noninjective.
 * The optimal lookup maps each input symbol to its modal known output.
 * Any true fixed bijection is a subcase; no English-language score is used.
 * @param {number[]} predicted
 * @param {number[]} observed
 * @returns {{direct:number, lookup:number}}
 */
function score(predicted, observed) {
  assert.equal(predicted.length, observed.length);
  const classes = Array.from({length:29}, () => Array(29).fill(0));
  let direct = 0;
  for (let i = 0; i < predicted.length; i++) {
    const p = predicted[i], q = observed[i];
    assert.ok(p >= 0 && p < 29 && q >= 0 && q < 29);
    classes[p][q]++;
    if (p === q) direct++;
  }
  return {direct, lookup:classes.reduce((n, row) => n + Math.max(...row), 0)};
}

function run() {
  const events = sourceEvents();
  const tables = sourceTables();
  const lengths = [55,56,57].map(i => corpus.pages[i].indices.length);
  assert.deepEqual(lengths, [76,85,95]);
  const terminal = [55,56,57].flatMap(i => corpus.pages[i].indices);
  assert.equal(terminal.length, 256);
  let bestLookup = null;
  let bestDirect = null;
  let tested = 0;
  const bestOptions = [];
  for (const {radix,bytes} of tables)
    for (const marker of [0,13])
      for (const reverseRed of [false,true])
        for (const reverseGrid of [false,true])
          for (const reverseTerminal of [false,true]) {
            const red = events.map(e => e.index === null ? marker : e.index);
            const table = bytes.map(x => x % 29);
            const plain = terminal.slice();
            if (reverseRed) red.reverse();
            if (reverseGrid) table.reverse();
            if (reverseTerminal) plain.reverse();
            const knownPositions = Array.from({length:180}, (_,i) => i + (reverseTerminal ? 0 : 76));
            const actual = knownPositions.map(i => plain[i]);
            for (let k = 0; k < 29; k++) {
              const predicted = knownPositions.map(i => mod(k*red[i] + (1-k)*table[i]));
              const {direct,lookup} = score(predicted, actual);
              const desc = {radix,marker,reverseRed,reverseGrid,reverseTerminal,k,direct,lookup};
              tested++;
              if (bestLookup === null || lookup > bestLookup.lookup)
                bestLookup = desc;
              if (bestDirect === null || direct > bestDirect.direct)
                bestDirect = desc;
              bestOptions.push(desc);
            }
          }
  assert.equal(tested, 928);
  assert.equal(bestLookup.lookup, 53);
  assert.equal(bestDirect.direct, 15);

  // Positives: correctly constructed direct and secret-alphabet Shamir
  // interpolation outputs must recover each of the 180 reserved known slots.
  const a = events.map(e => e.index === null ? 13 : e.index);
  const b = tables[0].bytes.map(x => x % 29);
  const x = 17;
  const synthetic = a.map((v,i) => mod(x*v + (1-x)*b[i]));
  const known = synthetic.slice(76);
  assert.deepEqual(score(synthetic.slice(76),known), {direct:180,lookup:180});
  const relabeled = known.map(i => mod(11*i+7)); // bijective, gcd(11,29)=1
  assert.equal(score(synthetic.slice(76),relabeled).lookup,180);

  bestOptions.sort((a,b) => b.lookup-a.lookup || b.direct-a.direct);
  console.log(JSON.stringify({
    source:{redRunes:225,thirteenDotMarks:31,tableBytes:256,
      terminalUnknown:76,terminalKnown:180,knownPageLengths:[85,95]},
    model:'GF29 affine Shamir 2-of-3, 29 unknown coordinates, secret terminal alphabet',
    variants:tested, bestLookup, bestDirect, top:bestOptions.slice(0,5),
    planted:{direct:180,stationaryRelabel:180},
    conclusion:'No tested direct 2-of-3 cross-channel Shamir reconstruction; no unknown plaintext'
  },null,2));
}
run();
