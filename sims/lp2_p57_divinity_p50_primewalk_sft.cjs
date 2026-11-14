/**
 * LP2 p57 DIVINITY -> p50 canonical base60 / GP29 directional graph.
 *
 * Single-file reproducibility test (SFT): no network requests or writes.
 * Run from repository root: node sims/lp2_p57_divinity_p50_primewalk_sft.cjs
 *
 * This proves source arithmetic and a specifically stated, exploratory
 * graph operation. It does not decrypt an unknown Liber Primus passage.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const text = read('resources/liber-primus/lp2-transcription.txt').replace(/\r\n/g, '\n');
const bytes = grid.bytes;
const literalTokens = grid.pages.flatMap((page) => page.tokens);
const moves = [
  [1, -1], [1, 0], [1, 1],
  [0, -1], [0, 0], [0, 1],
  [-1, -1], [-1, 0], [-1, 1],
];

assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime.length, 29);
assert.equal(bytes.length, 256);
assert.equal(literalTokens.length, 256);

/**
 * @param {number[]} sourceBytes
 * @param {number} start - One-based table cell.
 * @returns {{path: Array<{cell:number,byte:number,q:number,r:number,rune:string,prime:number,next:number|null}>, kind:'cycle'|'edge', terminal:number|null}}
 */
function trace(sourceBytes, start) {
  const seen = new Set();
  const trail = [];
  let cell = start;
  while (cell >= 1 && cell <= 256 && !seen.has(cell)) {
    seen.add(cell);
    const byte = sourceBytes[cell - 1];
    const q = Math.floor(byte / 29);
    const r = byte % 29;
    const row = Math.floor((cell - 1) / 8);
    const column = (cell - 1) % 8;
    const [dr, dc] = moves[q];
    const nextRow = row + dr;
    const nextColumn = column + dc;
    const next = nextRow >= 0 && nextRow < 32 &&
      nextColumn >= 0 && nextColumn < 8
      ? 1 + 8 * nextRow + nextColumn : null;
    trail.push({
      cell, byte, q, r,
      rune: corpus.translit[r],
      prime: corpus.prime[r],
      next,
    });
    cell = next === null ? -1 : next;
  }
  return {
    path: trail,
    kind: cell >= 1 && cell <= 256 ? 'cycle' : 'edge',
    terminal: cell >= 1 && cell <= 256 ? cell : null,
  };
}

function sumRunes(word) {
  return Array.from(word).reduce((sum, rune) => {
    const index = corpus.runes.indexOf(rune);
    assert.ok(index >= 0, 'Unexpected non-GP rune');
    return sum + corpus.prime[index];
  }, 0);
}

function spell(word) {
  return Array.from(word).map((rune) => corpus.translit[corpus.runes.indexOf(rune)]).join('');
}

const finalPage = text.slice(text.lastIndexOf('\n%\n') + 3)
  .replace(/\/\r?\n/g, '')
  .replace(/\r?\n/g, '')
  .replace(/§/g, '');
const words = finalPage.split(/[.-]/).filter((item) => item.length > 0);
assert.equal(words.length, 20);
assert.equal(spell(words[16]), 'DIUINITY');
assert.equal(words[16], 'ᛞᛁᚢᛁᚾᛁᛏᚣ');

// Direct within-word checksum: exactly the highlighted source words
// TUNNELNG and DIUINITY match grid[GPsum(word) mod 256] = GPsum(interior).
// Distinct signed 2016 source-word "lies" -> p50 fourth numeric token
// -> canonical 193 as one-based address -> literal source 00/F.
// This adds a hypothetical byte-to-cell jump, not an authenticated rule.
const signedMessage = read('resources/historical/cicada2016-4gq25-outguess.asc');
assert.match(signedMessage, /The path lies empty; epiphany seeks the devoted\./);
assert.match(signedMessage, /Its words are the map, their\s+\n?meaning is the road/);
const liesPrimeSum = ['L', 'I', 'E', 'S'].reduce((sum, item) => {
  const index = corpus.translit.indexOf(item);
  assert.ok(index >= 0);
  return sum + corpus.prime[index];
}, 0);
assert.equal(liesPrimeSum, 224);
const liesPhysicalPage = liesPrimeSum % 58;
const liesPageLocalTokenIndex = Math.floor(liesPrimeSum / 58);
assert.equal(liesPhysicalPage, 50);
assert.equal(liesPageLocalTokenIndex, 3);
assert.equal(grid.pages[1].page, 50);
assert.equal(grid.pages[0].tokens.length, 80);
assert.equal(grid.pages[1].tokens[liesPageLocalTokenIndex], '3D');
const liesGlobalCell = grid.pages[0].tokens.length + liesPageLocalTokenIndex + 1;
assert.equal(liesGlobalCell, 84);
assert.equal(bytes[liesGlobalCell - 1], 193);
assert.equal(bytes[193 - 1], 0);
assert.equal(literalTokens[193 - 1], '00');

const parableSum = sumRunes(words[0]);
const tunnelSum = sumRunes(words[4]);
const tunnelInterior = sumRunes(Array.from(words[4]).slice(1, -1).join(''));
const divinityInterior = sumRunes(Array.from(words[16]).slice(1, -1).join(''));
assert.equal(spell(words[0]), 'PARABLE');
assert.equal(spell(words[4]), 'TUNNELNG');
assert.equal(parableSum, 449);
assert.equal(parableSum % 256, 193);
assert.equal(bytes[(parableSum % 256) - 1], 0);
assert.equal(literalTokens[(parableSum % 256) - 1], '00');
assert.equal(tunnelSum, 339);
assert.equal(tunnelSum % 256, 83);
assert.equal(tunnelInterior, 201);
assert.equal(bytes[(tunnelSum % 256) - 1], tunnelInterior);
assert.equal(divinityInterior, 184);
assert.equal(bytes[((sumRunes(words[16]) % 256) || 256) - 1], divinityInterior);
const withinMatches = words.map((word, index) => {
  const runeList = Array.from(word);
  const full = sumRunes(word);
  const inside = runeList.length < 3 ? 0 :
    sumRunes(runeList.slice(1, -1).join(''));
  const addr = full % 256 || 256;
  return { index, match: inside === bytes[addr - 1] };
}).filter((x) => x.match).map((x) => x.index);
assert.deepEqual(withinMatches, [4, 16]);

// All 2,896 original complete unknown printed words retain cross-page carry.
// This check rules out the checksum as a universal ciphertext-word property.
const physicalChunks = text.split(/\n%\n/);
assert.equal(physicalChunks.length, 57);
const unsolvedJoined = physicalChunks.slice(0, -2).join('')
  .replace(/\/\n/g, '').replace(/[\n&$%§\/]/g, '');
const unsolvedWords = unsolvedJoined.split(/[.-]/)
  .filter((word) => word.length > 0 &&
    Array.from(word).every((rune) => corpus.runes.includes(rune)));
assert.equal(unsolvedWords.length, 2896);
assert.equal(unsolvedWords.reduce((acc, word) => acc + Array.from(word).length, 0), 12956);
const unknownMatchIndices = unsolvedWords.map((word, index) => {
  const letters = Array.from(word);
  const full = sumRunes(word);
  const inside = letters.length < 3 ? 0 :
    sumRunes(letters.slice(1, -1).join(''));
  return { index, match: inside === bytes[(full % 256 || 256) - 1] };
}).filter((x) => x.match).map((x) => x.index);
assert.deepEqual(unknownMatchIndices, [161, 360, 953, 973, 986, 2013]);

const divinitySum = sumRunes(words[16]);
const start = divinitySum % 256 || 256;
assert.equal(divinitySum, 376);
assert.equal(start, 120);

const route = trace(bytes, start);
assert.equal(route.kind, 'cycle');
assert.equal(route.terminal, 119);
assert.deepEqual(route.path.map((x) => x.cell), [120, 111, 119, 127, 128]);
assert.equal(route.path.map((x) => x.rune).join(''), 'IOGEM');
assert.deepEqual(route.path.map((x) => x.byte), [184, 32, 35, 163, 193]);
assert.deepEqual(route.path.map((x) => [x.q, x.r]), [
  [6, 10], [1, 3], [1, 6], [5, 18], [6, 19],
]);
assert.deepEqual(route.path.map((x) => literalTokens[x.cell - 1]),
  ['34', '0W', '0Z', '2h', '3D']);

const routePrimeSum = route.path.reduce((sum, x) => sum + x.prime, 0);
assert.equal(routePrimeSum, 193);
assert.equal(routePrimeSum, route.path.at(-1).byte);
assert.equal(bytes[routePrimeSum - 1], 0);
assert.equal(literalTokens[routePrimeSum - 1], '00');
const zeroExit = trace(bytes, routePrimeSum);
assert.equal(zeroExit.kind, 'edge');
assert.deepEqual(zeroExit.path.map((x) => x.rune), ['F']);
assert.deepEqual(zeroExit.path.map((x) => x.cell), [193]);
assert.equal(zeroExit.path[0].next, null);

// Source-independent previous selector: 2016 JPEG 563 = prime #103.
// Its existing, frozen start reaches the same cell 111 and GEM loop.
const dimensionRoute = trace(bytes, 103);
assert.deepEqual(dimensionRoute.path.map((x) => x.cell),
  [103, 111, 119, 127, 128]);
assert.equal(dimensionRoute.path.map((x) => x.rune).join(''), 'OOGEM');

// Frozen, source-driven complete PARABLE wordmap: the same graph is invoked
// for *every* original p57 word in printed order. The output is not a
// plaintext message under the direct unaltered readout.
const allP57Readouts=words.map((word)=>{
  const start=sumRunes(word)%256||256;
  return trace(bytes,start).path.map((node)=>node.rune).join('');
});
assert.deepEqual(allP57Readouts, [
  'F','D','NGA','FUB','IANG','DUJAE','NGA','IAW','EAR','JMIXTH',
  'UOEU','SRAEDAC','JOE','XTH','HSSW','NGA','IOGEM','DC','MNG','SEAOE',
]);

// All 256 original starts: the three-factor circuit is uniquely start 120.
// This is an exact inventory, not a multiple-hypothesis-corrected p-value.
const all = Array.from({ length: 256 }, (_, i) => {
  const t = trace(bytes, i + 1);
  const sum = t.path.reduce((acc, x) => acc + x.prime, 0);
  const last = t.path.at(-1).byte;
  return {
    start: i + 1,
    checksum: sum === last,
    zeroJump: sum >= 1 && sum <= 256 && bytes[sum - 1] === 0,
    sum, length: t.path.length, kind: t.kind,
  };
});
assert.deepEqual(all.filter((x) => x.checksum).map((x) => x.start),
  [120, 123]);
assert.deepEqual(all.filter((x) => x.zeroJump).map((x) => x.start),
  [66, 120, 180, 247]);
assert.deepEqual(all.filter((x) => x.checksum && x.zeroJump)
  .map((x) => x.start), [120]);
assert.deepEqual(words
  .map((word, i) => ({ i, seed: sumRunes(word) % 256 || 256 }))
  .filter(({ seed }) => trace(bytes, seed).terminal === 119)
  .map(({ i }) => i), [16]);

// A matched exploratory null shuffles the full 256-byte multiset.
// All analysis choices were developed after exploring the original graph.
// Hence even striking null rates do not give confirmatory significance.
let rngState = 0x12010357;
function random32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
const iterations = 100000;
const shuffled = bytes.slice();
let checksums = 0;
let zeroJumps = 0;
let joint = 0;
let jointFiveCycles = 0;
for (let iteration = 0; iteration < iterations; iteration++) {
  for (let j = 255; j >= 1; j--) {
    const k = random32() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  const t = trace(shuffled, 120);
  const sum = t.path.reduce((acc, x) => acc + x.prime, 0);
  const checksum = sum === t.path.at(-1).byte;
  const zeroJump = sum >= 1 && sum <= 256 && shuffled[sum - 1] === 0;
  if (checksum) checksums++;
  if (zeroJump) zeroJumps++;
  if (checksum && zeroJump) {
    joint++;
    if (t.kind === 'cycle' && t.path.length === 5) jointFiveCycles++;
  }
}
assert.deepEqual({ checksums, zeroJumps, joint, jointFiveCycles }, {
  checksums: 538, zeroJumps: 675, joint: 2, jointFiveCycles: 0,
});

console.log('LP2 p57 original complete words:', words.length);
console.log('PARABLE: whole 449 mod256 -> table cell193 literal 00/F;');
console.log('Signed 2016 LIES prime sum224 -> p50 token3 cell84=3D/193 -> cell193=00 (hypothetical two-step);');
console.log('TUNNELNG: whole 339 mod256 -> cell83 byte201 = interior prime sum201;');
console.log('DIUINITY: whole 376 mod256 -> cell120 byte184 = interior prime sum184;');
console.log('P57 interior-sum table fixed points at words', withinMatches, 'among 20; unknown 6/2896:', unknownMatchIndices);
console.log('Solved p57 DIVINITY GP prime sum:', divinitySum, 'mod 256 ->', start);
for (const node of route.path) {
  console.log('cell', node.cell, 'token', literalTokens[node.cell - 1],
    'byte', node.byte, '= 29*', node.q, '+', node.r,
    'rune', node.rune, 'GP prime', node.prime,
    'next', node.next);
}
console.log('Cycle:', route.terminal, 'GP readout: IOGEM');
console.log('Whole path GP prime sum', routePrimeSum,
  '= last byte193 -> table cell193 00/F -> edge exit');
console.log('Source 2016 width-prime-ordinal start103: OOGEM; paths meet at111');
console.log('All 20 original p57 word-to-graph outputs:',allP57Readouts.join('|'),'= nonlinguistic');
console.log('Full 256-start census: checksum [120,123], zero jump [66,120,180,247], joint [120]');
console.log('Solved p57 other-word starts reaching GEM: 0/19');
console.log('Fixed multiset shuffle xorshift32 seed 0x12010357, N=100000:',
  { checksums, zeroJumps, joint, jointFiveCycles });
console.log('STATUS: a conditional source-navigation circuit; NO new unknown plaintext/key/decoder');
