'use strict';

/**
 * Original LP2 selector-coupling test. The p50 table's leading-zero class has
 * been independently associated with adjacent ciphertext doublets. Test whether
 * the same fixed source-table class selects the within-word lag-five echoes.
 *
 * Uses original corrected printed separators and one continuous rune clock.
 * Read-only, run on Windows 11 / Node22:
 * node sims/lp2_p50_low60_lagfive_coupling_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  repo, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const imageText = fs.readFileSync(path.join(
  repo, 'resources', 'transcriptions', 'lp2-image-corrected.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(
  repo, 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8'));
const bytes = grid.pages.flatMap(page => page.bytes);
assert.equal(bytes.length, 256);

const symbol = new Map(corpus.runes.map((r, i) => [r, i]));
/**
 * Return the original rune stream with printed-word coordinates. A physical
 * page break (%) or line break (/) does not end a printed word. The original
 * '.' or '-' delimiters do.
 * @returns {{index:number,rune:number,word:number,position:number}[]}
 */
function runesWithWords() {
  const text = imageText.split('%').slice(0, 55).join('%');
  const runes = [];
  let word = 0;
  let position = 0;
  let separated = false;
  for (const char of text) {
    if (symbol.has(char)) {
      runes.push({index:runes.length, rune:symbol.get(char), word, position});
      position++;
      separated = false;
    } else if ('-.'.includes(char) && !separated) {
      word++;
      position = 0;
      separated = true;
    }
  }
  assert.deepEqual(runes.map(x => x.rune), corpus.pages.filter(
    p => p.page <= 55).flatMap(p => p.indices));
  assert.equal(runes.length, 12956);
  return runes;
}

/** @param {ReturnType<runesWithWords>} runes */
function fiveBackEvents(runes) {
  return runes.filter(r => r.position >= 5).map(r => ({
    index: r.index, hit: +(
      runes[r.index - 5].word === r.word &&
      runes[r.index - 5].rune === r.rune
    )
  }));
}

/** @param {{index:number,hit:number}[]} events @param {number} anchor */
function calculate(events, anchor) {
  let lowHits = 0;
  let lowTotal = 0;
  let otherHits = 0;
  let otherTotal = 0;
  const byFirstDigit = Array.from({length:5}, () => ({opportunities:0, hits:0}));
  for (const event of events) {
    const v = bytes[(event.index + anchor + 256) % 256];
    const digit = Math.floor(v / 60);
    byFirstDigit[digit].opportunities++;
    byFirstDigit[digit].hits += event.hit;
    if (v < 60) {
      lowTotal++;
      lowHits += event.hit;
    } else {
      otherTotal++;
      otherHits += event.hit;
    }
  }
  const phaseRates = [];
  for (let shift = 0; shift < 256; shift++) {
    let hits = 0;
    let total = 0;
    for (const event of events) {
      if (bytes[(event.index + anchor + shift + 512) % 256] < 60) {
        hits += event.hit;
        total++;
      }
    }
    phaseRates.push(hits / total);
  }
  const originalRate = lowHits / lowTotal;
  return {
    anchor, lowHits, lowTotal, otherHits, otherTotal,
    lowRate: originalRate, otherRate: otherHits / otherTotal,
    oddsRatio: lowHits * (otherTotal - otherHits) /
      ((lowTotal - lowHits) * otherHits),
    phasesWithAtLeastObservedRate: phaseRates.filter(
      rate => rate >= originalRate - Number.EPSILON).length,
    byFirstDigit
  };
}

function main() {
  const runes = runesWithWords();
  const events = fiveBackEvents(runes);
  assert.equal(events.length, 2105);
  assert.equal(events.reduce((s, x) => s + x.hit, 0), 104);
  const [later, earlier, middle] = [
    calculate(events, 0), calculate(events, -5), calculate(events, -2)
  ];
  assert.deepEqual([later.lowHits, later.lowTotal, later.otherHits,
    later.otherTotal], [22, 497, 82, 1608]);
  assert.deepEqual([earlier.lowHits, earlier.lowTotal, earlier.otherHits,
    earlier.otherTotal], [27, 482, 77, 1623]);
  assert.deepEqual([middle.lowHits, middle.lowTotal, middle.otherHits,
    middle.otherTotal], [27, 459, 77, 1646]);
  assert.deepEqual(later.byFirstDigit.map(q => [q.opportunities, q.hits]),
    [[497,22], [466,18], [548,30], [439,23], [155,11]]);
  // Positive control: same original event geometry, explicit source-class
  // event rate planted at phase zero, then measured by the unchanged test.
  const planted = events.map(event => ({
    index:event.index,
    hit: +(bytes[event.index % 256] < 60)
  }));
  const control = calculate(planted, 0);
  assert.equal(control.lowHits, control.lowTotal);
  assert.equal(control.otherHits, 0);
  assert.equal(control.phasesWithAtLeastObservedRate, 1);
  console.log(JSON.stringify({
    input:'original LP2 12,956 runes; source printed words and p50 256 cells',
    observed:{opportunities:events.length,
      lagFiveEqualities:events.reduce((s, x) => s + x.hit, 0)},
    originalPhaseZero:{later, earlier, middle},
    plantedPositiveControl:{hits:control.lowHits,
      total:control.lowTotal, shiftRank:control.phasesWithAtLeastObservedRate},
    decision:'The originally selected p50 low60 binary gate does not show a transferable lag-five event enrichment under any of the three prespecified interval anchors.'
  }, null, 2));
}
if (require.main === module) main();
module.exports = {runesWithWords, fiveBackEvents, calculate};
