'use strict';

/**
 * Original LP2 no-identical-output-digraph gate for all keyed 5x6 Playfair boards.
 *
 * Reads only the committed GP29 corpus, literal original page transcription, and
 * original-JPEG source-position doublet inventory. This source-shape invariant
 * is independent of the Playfair grid's secret permutation.
 *
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname, '..');
  const data = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
  const pages = data.pages.filter(page => page.page <= 55 && page.indices.length > 0);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((sum, page) => sum + page.indices.length, 0), 12956);

  /** @type {{page:number,second:number}[]} */
  const events = [];
  /** @type {{page:number,seconds:number[]}[]} */
  const mixedPages = [];
  for (const page of pages) {
    const seconds = [];
    for (let i = 1; i < page.indices.length; i++) {
      if (page.indices[i] === page.indices[i - 1]) {
        events.push({page: page.page, second: i});
        seconds.push(i);
      }
    }
    if (seconds.some(i => i % 2 === 0) && seconds.some(i => i % 2 === 1)) {
      mixedPages.push({page: page.page, seconds});
    }
  }
  assert.equal(events.length, 86);
  assert.equal(events.filter(event => event.second % 2 === 0).length, 51);
  assert.equal(events.filter(event => event.second % 2 === 1).length, 35);
  assert.equal(mixedPages.length, 14);
  assert.deepEqual(mixedPages.find(p => p.page === 0).seconds, [122, 207]);
  assert.deepEqual(mixedPages.find(p => p.page === 24).seconds, [52, 59, 106, 117, 251]);

  const csv = fs.readFileSync(path.join(root, 'im-results/lp2-doublet-allograph-crops.csv'), 'utf8');
  const rows = csv.trim().split(/\r?\n/);
  const keys = rows.shift().split(',');
  const sites = rows.map(line => {
    const cells = line.split(',');
    return Object.fromEntries(keys.map((key, i) => [key, cells[i]]));
  });
  assert.equal(sites.length, 86);
  const sameLine = sites.filter(site => site.line_a === site.line_b);
  assert.equal(sameLine.length, 82);
  const byLine = new Map();
  for (const site of sites) {
    const page = data.pages[Number(site.page)];
    const pairFirst = Number(site.rune_offset);
    const symbol = Number(site.rune_index);
    assert.equal(page.indices[pairFirst], symbol);
    assert.equal(page.indices[pairFirst + 1], symbol);
    if (site.line_a !== site.line_b) continue;
    const key = site.page + ':' + site.line_a;
    if (!byLine.has(key)) byLine.set(key, []);
    byLine.get(key).push(site);
  }
  assert.equal(byLine.size, 79);
  const mixedLines = [...byLine.entries()].filter(([, line]) => (
    new Set(line.map(site => Number(site.column_b) % 2)).size === 2
  ));
  assert.equal(mixedLines.length, 1);
  assert.equal(mixedLines[0][0], '24:2');
  const p24Sites = mixedLines[0][1].sort((a,b) => Number(a.column_b) - Number(b.column_b));
  assert.deepEqual(p24Sites.map(site => Number(site.column_b)), [6,13]);
  assert.deepEqual(p24Sites.map(site => Number(site.rune_offset)), [51,58]);
  assert.ok(p24Sites.every(site => site.ink_a === 'black' && site.ink_b === 'black'));

  // Verify the two sites also occur at opposite parities in one *literal*
  // unmodified original printed line, rather than in an OCR-reflowed line.
  const original = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
  const line = original.split(/\r?\n/).find(s => s.includes('ᛉᚷᚷ-ᚹᛞᛁᛋ-ᚦᛡᛡ'));
  assert.ok(line, 'Original p24 physical line absent');
  const alphabet = new Map(data.runes.map((rune,i) => [rune,i]));
  const printed = [...line].filter(ch => alphabet.has(ch)).map(ch => alphabet.get(ch));
  assert.equal(printed.length, 21);
  assert.equal(printed[5], printed[6]);
  assert.equal(printed[12], printed[13]);
  assert.notEqual(printed[5], printed[12]);
  assert.equal(printed[5], data.runes.indexOf('ᚷ'));
  assert.equal(printed[12], data.runes.indexOf('ᛡ'));

  /**
   * Standard 5x6 Playfair on a 30-cell grid, including one filler symbol.
   * The row-major numerical board is an arbitrary *positive control* only;
   * the no-doublet invariant is true for any keyed board permutation.
   *
   * @param {number} a First source cell.
   * @param {number} b Second source cell.
   * @param {number} direction +1 encrypt; -1 decrypt.
   * @returns {[number, number]} Output pair.
   */
  function playfair(a, b, direction) {
    assert.ok(a >= 0 && a < 30 && b >= 0 && b < 30 && a !== b);
    const ra = Math.floor(a / 6), ca = a % 6;
    const rb = Math.floor(b / 6), cb = b % 6;
    if (ra === rb) return [
      6 * ra + ((ca + direction + 6) % 6),
      6 * rb + ((cb + direction + 6) % 6)
    ];
    if (ca === cb) return [
      6 * ((ra + direction + 5) % 5) + ca,
      6 * ((rb + direction + 5) % 5) + cb
    ];
    return [6 * ra + cb, 6 * rb + ca];
  }

  // Real, independently solved p57 GP29 text. Proper repeated-rune handling
  // inserts the 30th filler cell without discarding the second source rune.
  const clear = data.pages.find(page => page.page === 57).indices;
  assert.equal(clear.length, 95);
  const prepared = [];
  for (let i = 0; i < clear.length;) {
    const a = clear[i++];
    const b = (i === clear.length || clear[i] === a) ? 29 : clear[i++];
    prepared.push(a,b);
  }
  assert.equal(prepared.length % 2, 0);
  const encoded = [];
  for (let i = 0; i < prepared.length; i += 2) {
    const [a,b] = playfair(prepared[i], prepared[i+1], +1);
    assert.notEqual(a,b);
    encoded.push(a,b);
  }
  const recovered = [];
  for (let i = 0; i < encoded.length; i += 2) {
    recovered.push(...playfair(encoded[i], encoded[i+1], -1));
  }
  assert.deepEqual(recovered, prepared);

  const answer = {
    source: 'Unmodified LP2 p0..p55 and original p24 printed line',
    runes: 12956,
    adjacent_equal_events: 86,
    second_rune_page_parity: {even:51, odd:35},
    mixed_parity_pages: mixedPages.map(x=>x.page),
    within_printed_line_events: 82,
    affected_lines:79,
    sole_mixed_parity_printed_line:{page:24,line_zero_based:2,second_columns:[6,13],first_rune_offsets:[51,58]},
    actual_standard_playfair_native_plant:{plain_original_runes:95,prepared_runes:prepared.length,roundtrip_exact:true},
    conclusion: 'All fixed-digraph-boundary Playfair outputs are incompatible with the original unchanged rune stream.'
  };
  console.log(JSON.stringify(answer,null,2));
}
main();
