'use strict';

/**
 * SFT: Does the 138+170-rune table-flanking prose preserve the same word
 * boundaries as the 232+76-rune terminal p54/p55 prose?
 *
 * A repeated plaintext with independent, position-dependent cipher keys
 * still has identical word boundaries if the author prints plaintext spaces.
 * This compares that necessary condition without requiring any cipher key.
 * Run from repository root: node sims/lp2_flank308_terminal308_wordbreak_sft.cjs
 *
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const resource = path.join(root, 'resources', 'liber-primus');
  const corpus = JSON.parse(fs.readFileSync(path.join(resource, 'lp2-corpus.json'), 'utf8'));
  const transcription = fs.readFileSync(path.join(resource, 'lp2-transcription.txt'), 'utf8');
  const sourcePages = transcription.split('%');
  assert.equal(sourcePages.length, 57, 'the runeless p50 is absent from this transcription');
  const gpIndex = new Map(corpus.runes.map((symbol, index) => [symbol, index]));
  assert.equal(gpIndex.size, 29);

  /**
   * @param {number} physicalPage Zero-based original LP2 page.
   * @returns {{indices:number[],stops:Set<number>,clauses:Set<number>}}
   */
  function page(physicalPage) {
    const sourceIndex = physicalPage >= 51 ? physicalPage - 1 : physicalPage;
    const chars = sourcePages[sourceIndex];
    const indices = [];
    const stops = new Set();
    const clauses = new Set();
    for (const ch of chars) {
      const index = gpIndex.get(ch);
      if (index !== undefined) {
        indices.push(index);
      } else if (ch === '-' || ch === '.') {
        stops.add(indices.length);
        if (ch === '.') clauses.add(indices.length);
      }
    }
    assert.deepEqual(indices, corpus.pages[physicalPage].indices,
      'source-derived transcription disagrees with independent page-index corpus');
    return { indices, stops, clauses };
  }

  /**
   * @param {{p:number,start:number,end:number}[]} parts Exact original page slices.
   * @returns {{length:number,stops:Set<number>,clauses:Set<number>}}
   */
  function unite(parts) {
    let length = 0;
    const stops = new Set();
    const clauses = new Set();
    for (const { p, start, end } of parts) {
      const source = page(p);
      assert(start >= 0 && end <= source.indices.length && end >= start);
      for (const at of source.stops) {
        if (at > start && at <= end) stops.add(length + at - start);
      }
      for (const at of source.clauses) {
        if (at > start && at <= end) clauses.add(length + at - start);
      }
      length += end - start;
    }
    return { length, stops, clauses };
  }

  const flank = unite([
    { p: 48, start: 199, end: 271 },
    { p: 49, start: 0, end: 66 },
    { p: 51, start: 0, end: 92 },
    { p: 52, start: 0, end: 78 }
  ]);
  const terminal = unite([
    { p: 54, start: 0, end: 232 },
    { p: 55, start: 0, end: 76 }
  ]);
  assert.equal(flank.length, 308);
  assert.equal(terminal.length, 308);
  assert.equal(flank.stops.size, 73);
  assert.equal(terminal.stops.size, 66);
  assert.deepEqual([...flank.clauses].sort((a, b) => a - b), [138, 308]);
  assert.deepEqual([...terminal.clauses].sort((a, b) => a - b), [9, 308]);

  const shared = [...flank.stops].filter(at => terminal.stops.has(at)).sort((a, b) => a - b);
  assert.deepEqual(shared, [17, 20, 46, 78, 167, 189, 193, 233, 241, 268, 278, 308]);

  // Identical word-boundary vectors pass the same comparator without any key.
  assert.equal([...flank.stops].filter(at => flank.stops.has(at)).length, 73);
  assert.equal([...terminal.stops].filter(at => terminal.stops.has(at)).length, 66);
  assert.notDeepEqual([...flank.stops].sort((a, b) => a - b),
    [...terminal.stops].sort((a, b) => a - b));

  console.log(JSON.stringify({
    originalRuneLengths: [flank.length, terminal.length],
    printedWordCounts: [flank.stops.size, terminal.stops.size],
    sharedWordEnds: shared.length,
    matchingWordEndOffsets: shared,
    originalClauseEnds: [[...flank.clauses], [...terminal.clauses]],
    decision: 'Not identical plaintext with preserved printed word breaks; no key or plaintext recovered'
  }, null, 2));
}
main();
