'use strict';
/**
 * Five-dot black-anchored de Bruijn row order applied to the eight LP2
 * 32-byte grid columns as section-specific AES/ChaCha keys.
 * Distinct from row-as-nonce and direct-table-pad experiments.
 * Run: node sims/grid_section_debruijn_keyskip_probe.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { inputs } = require('./grid_section_column_keys.cjs');
const { candidates, screen } = require('./grid_section_keyskip_probe.cjs');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');
const { encrypt } = require('./mirror_jpeg_pad.cjs');
const ROOT = path.resolve(__dirname, '..');
const WINDOW = 220, NULL_ROUNDS = 10;
const NAMES = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];

function reorderColumns(columns, order) {
  return columns.map(column => order.map(row => column[row]));
}
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
function runOrder(groups, columns, name, lm) {
  const keys = candidates(columns);
  assert.equal(keys.length, 128);
  const results = groups.map((group, groupIndex) => {
    const r = screen(group.slice(0, WINDOW), keys, lm);
    return {
      group: groupIndex, groupLength: group.length, bestHead: r.ranked[0].short,
      top: r.finalists.slice(0, 3).map(item => ({
        key: item.tag, headScore: item.short, fullScore: item.full.perRune,
        inferredSkips: item.full.skips,
        first40: item.full.plain.slice(0, 40).map(x => NAMES[x]).join('')
      }))
    };
  });
  return { order: name,
    meanBestScore: results.reduce((s, x) => s + x.top[0].fullScore, 0) / results.length,
    groups: results };
}
function main() {
  assert.ok(!process.env.LP2_GRID_FIVE_CORRECTIONS);
  assert.ok(!process.env.LP2_GRID_RADIX || process.env.LP2_GRID_RADIX === '60');
  const { groups, columnKeys } = inputs();
  assert.deepEqual(groups.map(g => g.length), [729,1145,1729,1903,1021,1524,1589,3316]);
  assert.equal(columnKeys.length, 8);
  assert.ok(columnKeys.every(c => c.length === 32));

  const annotations = JSON.parse(fs.readFileSync(path.join(
    ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
  const marks = annotations.pages.flatMap(p => (p.large_punctuation || [])
    .filter(m => m[1] === 13).map(m => ({ page: p.page, position: m[0], ink: m[2] })))
    .sort((a,b) => a.page-b.page || a.position-b.position);
  assert.equal(marks.length, 31);
  const blackIndex = marks.findIndex(m => m.ink === 'black');
  assert.equal(blackIndex, 7);
  assert.deepEqual(marks[blackIndex], { page: 7, position: 194, ink: 'black' });
  assert.deepEqual(marks[blackIndex+1], { page: 7, position: 194, ink: 'red' });

  // Two hollow cells -> feedback taps 18; all-solid tree -> seed 31.
  let state = 31; const cycle = [];
  while (!cycle.includes(state)) {
    cycle.push(state);
    let bits = state & 18, parity = 0;
    while (bits) { parity ^= bits & 1; bits >>>= 1; }
    state = ((state << 1) & 31) | parity;
  }
  assert.equal(cycle.length, 31);
  assert.equal(state, 31);
  const insertAt = cycle.indexOf(16) + 1;
  const db = [...cycle.slice(0,insertAt), 0, ...cycle.slice(insertAt)];
  const zeroFragment = blackIndex + 1;
  const rotation = (db.indexOf(0) - zeroFragment + 32) % 32;
  const anchored = [...db.slice(rotation), ...db.slice(0,rotation)];
  assert.deepEqual(anchored,
    [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6]);

  const lm = train(fs.readFileSync(path.join(ROOT,
    'resources/control/shakespeare_first300k.txt'), 'utf8'));
  const solved = fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');
  const sample = encode(solved.split('### 3')[1].split('### 4')[0]).slice(0, WINDOW);
  assert.equal(sample.length, WINDOW);
  const dbColumns = reorderColumns(columnKeys, anchored);

  // Both stream families must recover an independently sourced planted passage.
  const positive = [];
  for (const algorithm of ['aes-256-ctr','chacha20']) {
    const keys = candidates(dbColumns);
    const trueKey = keys.find(k => k.algorithm === algorithm
      && !k.reversed && k.col === 0 && !k.scaled && k.sign === 1);
    assert.ok(trueKey);
    const plant = encrypt(sample, trueKey.key, 0, 1, 0x47d3b29a);
    const result = screen(plant.cipher, keys, lm);
    const rank = result.ranked.findIndex(x => x.key.tag === trueKey.tag) + 1;
    const recovered = result.finalists.find(x => x.tag === trueKey.tag);
    assert.ok(recovered);
    const exact = recovered.full.plain.filter((x,i) => x === sample[i]).length;
    assert.ok(exact >= 198);
    positive.push({ algorithm, trueRank: rank, recovered: exact, total: WINDOW,
      plantedSkips: plant.skips, inferredSkips: recovered.full.skips,
      score: recovered.full.perRune, winner: result.finalists[0].tag });
  }

  const rowMajor = runOrder(groups, columnKeys, 'row-major', lm);
  const deBruijn = runOrder(groups, dbColumns, 'black-marker-anchored de Bruijn', lm);
  const random = rng(0x47d3b29b), nullScores = [];
  for (let n = 0; n < NULL_ROUNDS; n++) {
    const order = Array.from({length:32}, (_,i) => i);
    for (let i=31; i>0; i--) {
      const j = Math.floor(random() * (i+1));
      [order[i],order[j]] = [order[j],order[i]];
    }
    const r = screen(groups[0].slice(0,WINDOW),
      candidates(reorderColumns(columnKeys,order)), lm);
    nullScores.push(r.finalists[0].full.perRune);
  }
  const observed = deBruijn.groups[0].top[0].fullScore;
  const atLeast = nullScores.filter(x => x >= observed).length;
  console.log('INPUTS', JSON.stringify({
    groupLengths: groups.map(g => g.length), totalRunes: groups.reduce((s,g)=>s+g.length,0),
    grid: '32x8', candidateModesPerSection: 128, tapMask: 18, seed: 31,
    blackMarkIndex: blackIndex, zeroFragment, anchored
  }));
  console.log('PLANT', JSON.stringify(positive));
  console.log('ROW_MAJOR', JSON.stringify(rowMajor));
  console.log('DEBRUIJN', JSON.stringify(deBruijn));
  console.log('NULL', JSON.stringify({
    group: 0, trials: NULL_ROUNDS, observedDeBruijn: observed,
    randomRowMean: nullScores.reduce((s,x)=>s+x,0)/nullScores.length,
    randomRowMaximum: Math.max(...nullScores), randomOrdersAtLeastAsGood: atLeast,
    addOneUpperTail: (1+atLeast)/(NULL_ROUNDS+1)
  }));
}
if (require.main === module) main();
module.exports = { reorderColumns, runOrder };
