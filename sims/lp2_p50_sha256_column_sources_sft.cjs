'use strict';

/**
 * Source-fixed SHA-256-column hypothesis for the original 32 x 8 numeric field.
 * Candidate inputs are complete original artifacts and immutable canonical
 * GP29 source registers, without fitted prefixes, salts, phases or truncation.
 * Execute: node sims/lp2_p50_sha256_column_sources_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const at = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(at(p), 'utf8'));
const hash = (buffer) => crypto.createHash('sha256').update(buffer).digest();
const hex = (buffer) => buffer.toString('hex');
const table = json('resources/liber-primus/lp2-grid-256.json');
const corpus = json('resources/liber-primus/lp2-corpus.json');
const solved = json('resources/external/relikd-solved-gp29-native-v1.json');
const alphabet = table.alphabet;
const tokens = table.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256, 'Original 32x8 cell inventory');
assert.deepEqual(table.pages.map((p) => p.tokens.length), [80, 104, 72]);
const values = tokens.map((token) => {
  assert.equal(token.length, 2);
  const n = alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
  assert(n >= 0 && n <= 255, 'Each cell is a literal byte under the conditional base60 alphabet');
  return n;
});
const bytes = Buffer.from(values);
assert.equal(hex(hash(bytes)), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const columns = Array.from({length: 8}, (_, c) => Buffer.from(Array.from({length: 32}, (_, r) => values[r * 8 + c])));
const contiguous = Array.from({length: 8}, (_, c) => bytes.subarray(c * 32, c * 32 + 32));
const targets = [{label: 'eight vertical 32-byte columns', blocks: columns},
  {label: 'eight consecutive 32-byte row-major blocks', blocks: contiguous}];
assert.equal(hex(hash(Buffer.from('abc'))),
  'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
const planted = Buffer.alloc(256);
for (let c = 0; c < 8; c++) {
  const digest = hash(Buffer.from('source-control-' + c));
  for (let r = 0; r < 32; r++) planted[r * 8 + c] = digest[r];
}
for (let c = 0; c < 8; c++) {
  const digest = hash(Buffer.from('source-control-' + c));
  assert(digest.equals(Buffer.from(Array.from({length: 32}, (_, r) => planted[r * 8 + c]))));
}
let inputs = 0;
let hitCount = 0;
let best = {prefixBytes: 0, source: null, target: null};
const seenDigests = new Map();
function examine(label, buffer) {
  const digest = hash(buffer);
  const signature = hex(digest);
  if (!seenDigests.has(signature)) seenDigests.set(signature, []);
  seenDigests.get(signature).push(label);
  inputs++;
  for (const target of targets) {
    for (let i = 0; i < 8; i++) {
      const candidate = target.blocks[i];
      let n = 0;
      while (n < 32 && digest[n] === candidate[n]) n++;
      if (n > best.prefixBytes) best = {prefixBytes: n, source: label, target: target.label + ':' + i};
      if (n === 32) {
        hitCount++;
        console.log('EXACT SHA256 COLUMN/BLOCK MATCH: ' + label + ' -> ' + target.label + ':' + i);
      }
    }
  }
}
const runes = new Set(corpus.runes);
for (const page of corpus.pages) {
  if (page.indices.length === 0) continue;
  const name = 'LP2 page ' + page.page;
  examine(name + ' rune glyph UTF8', Buffer.from(page.indices.map((x) => corpus.runes[x]).join(''), 'utf8'));
  examine(name + ' rune-index byte stream', Buffer.from(page.indices));
}
const chapterBounds = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
for (const [first, last] of chapterBounds) {
  const indices = corpus.pages.filter((p) => p.page >= first && p.page <= last).flatMap((p) => p.indices);
  const name = 'LP2 chapter ' + first + '-' + last;
  examine(name + ' glyph UTF8', Buffer.from(indices.map((x) => corpus.runes[x]).join(''));
  examine(name + ' native-index bytes', Buffer.from(indices));
}
for (const section of solved.sections) {
  const text = section.source_text;
  const glyphs = Array.from(text).filter((c) => runes.has(c));
  const name = 'already solved section ' + section.name;
  examine(name + ' full source UTF8', Buffer.from(text));
  examine(name + ' rune-only UTF8', Buffer.from(glyphs.join('')));
  examine(name + ' rune-index bytes', Buffer.from(glyphs.map((c) => corpus.runes.indexOf(c))));
}
for (let i = 0; i < 75; i++) {
  const name = 'resources/liber-primus/' + String(i).padStart(2, '0') + '.jpg';
  examine('2014 original JPEG ' + i, fs.readFileSync(at(name)));
}
for (const name of [
  'resources/historical/cicada2014-onion7-index.html',
  'resources/historical/cicada2014-stage11-message.asc',
  'resources/historical/cicada2014-onion5-signed.asc',
  'resources/historical/cicada2013-second-onion-everything-you-need.asc',
  'resources/historical/cicada2013-os-original-prime-echo.sh',
  'resources/historical/cicada2013-os-original-message.txt',
  'resources/historical/cicada2012-countdown-message.asc',
]) examine('2012-14 preserved source file ' + name, fs.readFileSync(at(name)));
for (const candidate of ['3301','1033','CICADA 3301','LIBER PRIMUS','DIVINITY','FIRFUMFERENFE']) {
  examine('2014-known literal ' + candidate, Buffer.from(candidate));
}
const mutated = Buffer.from(columns[0]);
mutated[0] ^= 1;
assert(!mutated.equals(columns[0]), 'Wrong-table original-byte control');
assert.equal(inputs, 57 * 2 + 9 * 2 + 9 * 3 + 75 + 7 + 6);
console.log('SHA-256 32x8 column-source test completed: ' + JSON.stringify({
  originalBytes: 256,
  candidateSourceRepresentations: inputs,
  uniqueCandidateDigests: seenDigests.size,
  targetDigests: targets.length * 8,
  exactMatches: hitCount,
  bestFirstByteAgreement: best,
  tableSha256: hex(hash(bytes)),
}));
if (hitCount > 0) process.exitCode = 2;
