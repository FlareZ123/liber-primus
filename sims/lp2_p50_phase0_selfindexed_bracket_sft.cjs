'use strict';

const fs = require('fs');
const path = require('path');

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8')
);
const grid = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-grid-256.json'), 'utf8')
);

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

const tokens = grid.pages.flatMap((page) => page.tokens);
assertEqual(tokens.length, 256, 'table token count');

const unknownPages = corpus.pages.filter((page) => page.page <= 55);
let globalRune = 0;
const starts = new Map();

for (const page of unknownPages) {
  starts.set(page.page, globalRune);
  globalRune += page.runic_count;
}

assertEqual(globalRune, 12956, 'unknown rune count');
assertEqual(starts.get(49), 12048, 'p49 global rune start');
assertEqual(corpus.pages.find((page) => page.page === 49).runic_count, 66, 'p49 rune count');
assertEqual(starts.get(50), 12114, 'table-only p50 start');
assertEqual(starts.get(51), 12114, 'post-table p51 start');

const insertionOffset = starts.get(51);
const phase = insertionOffset % 256;
assertEqual(phase, 82, 'table insertion phase');
assertEqual(tokens[phase], '3L', 'phase-zero insertion token');

const bracketStarts = [];
for (let i = 0; i + 46 < tokens.length; i += 1) {
  if (tokens[i] === tokens[i + 46] && tokens[i + 1] === tokens[i + 45]) {
    bracketStarts.push(i);
  }
}

assertEqual(JSON.stringify(bracketStarts), JSON.stringify([82]), 'unique AB...BA 47-token bracket');
assertEqual(tokens[82], '3L', 'left outer marker');
assertEqual(tokens[83], '3D', 'left inner marker');
assertEqual(tokens[127], '3D', 'right inner marker');
assertEqual(tokens[128], '3L', 'right outer marker');
assertEqual(tokens[105], '13', 'bracket center');
assertEqual(tokens.filter((token) => token === '13').length, 1, 'global 13 uniqueness');
assertEqual(105 - 84, 21, 'center zero-based offset in strict 43-token interior');

const page51 = corpus.pages.find((page) => page.page === 51);
assertEqual(page51.indices[0], page51.indices[1], 'p51 leading doublet');
const pagesWithLeadingDoublet = unknownPages
  .filter((page) => page.indices.length >= 2 && page.indices[0] === page.indices[1])
  .map((page) => page.page);
assertEqual(JSON.stringify(pagesWithLeadingDoublet), JSON.stringify([51]), 'unique page-initial doublet');

assertEqual(starts.get(27) % 256, 127, 'p27 start phase');
assertEqual(starts.get(28) % 256, 105, 'p28 start phase');

console.log('PASS p50 phase-zero self-indexed bracket');
console.log(`  insertion offset: ${insertionOffset}; modulo256 phase: ${phase}; token: ${tokens[phase]}`);
console.log('  unique bracket: cells82..128 = 3L 3D [43] 3D 3L; center cell105 = 13');
console.log('  p51 resumes at the same phase and is the sole unknown page with a leading ciphertext doublet');
console.log('  secondary boundary contacts: p27 start cell127=3D; p28 start cell105=13');
