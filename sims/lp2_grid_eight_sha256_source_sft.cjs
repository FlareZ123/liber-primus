/**
 * Original LP2 32x8 grid as eight literal SHA-256 digests.
 * SFT: node sims/lp2_grid_eight_sha256_source_sft.cjs
 * Node 20+, repository root fixtures. No third-party dependencies.
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p));
const json = (p) => JSON.parse(read(p).toString('utf8'));
const digest = (b) => crypto.createHash('sha256').update(b).digest();
const hex = (b) => b.toString('hex');

const corpus = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const table = Buffer.from(grid.bytes);
assert.equal(table.length, 256);
assert.equal(hex(digest(table)), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(hex(digest(Buffer.from('abc'))), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');

const targets = [];
for (let col = 0; col < 8; col++) {
  targets.push(Buffer.from(Array.from({length: 32}, (_, row) => table[row * 8 + col])));
}
for (let block = 0; block < 8; block++) targets.push(table.subarray(block * 32, block * 32 + 32));

/** @type {{id:string, bytes:Buffer}[]} */
const candidates = [];
/** @param {string} id @param {Buffer|string} b */
function add(id, b) {
  const bytes = Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf8');
  if (bytes.length) candidates.push({id, bytes});
}
/** @param {string} id @param {number[]} indices */
function addRuneVersions(id, indices) {
  if (!indices.length) return;
  const rune = indices.map((i) => corpus.runes[i]).join('');
  add(id + ':runes', rune);
  add(id + ':latin-gp', indices.map((i) => corpus.translit[i]).join(''));
  add(id + ':bytes-gp', Buffer.from(indices));
  add(id + ':two-decimal', indices.map((i) => String(i).padStart(2, '0')).join(''));
  add(id + ':prime-list', indices.map((i) => corpus.prime[i]).join(' '));
  add(id + ':runes-lf', rune + '\n');
}

assert.equal(corpus.pages.length, 58);
for (const p of corpus.pages) addRuneVersions('page' + p.page, p.indices);
const chapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
for (let n = 0; n < chapters.length; n++) {
  const [from, to] = chapters[n];
  addRuneVersions('visual-chapter' + n, corpus.pages.slice(from, to + 1).flatMap((p) => p.indices));
}
const unknown = corpus.pages.slice(0, 56).flatMap((p) => p.indices);
assert.equal(unknown.length, 12956);
const cuts = [0,729,1874,3603,3612,5506,6527,8051,9640,12956];
for (let n = 0; n < cuts.length - 1; n++) {
  addRuneVersions('text-section' + n, unknown.slice(cuts[n], cuts[n + 1]));
}
const eightSectionCuts = [
  [0,729,1874,3612,5506,6527,8051,9640,12956],
  [0,729,1874,3603,5506,6527,8051,9640,12956],
];
for (const [version, cuts8] of eightSectionCuts.entries()) {
  for (let n = 0; n < 8; n++) {
    addRuneVersions('eight-text-sections:' + version + ':' + n, unknown.slice(cuts8[n], cuts8[n + 1]));
  }
}
assert.equal(candidates.length, 546, 'corpus encodings including the two source-natural eight-section attachments');

const scans = Array.from({length: 75}, (_, i) => read('resources/liber-primus/' + String(i).padStart(2, '0') + '.jpg'));
scans.forEach((bytes, i) => add('original-jpeg' + i, bytes));
for (const [from, to] of [[0,16],[17,19],[20,24],[25,31],[32,39],[40,55],[56,65],[66,72],[73,74],[17,74],[0,74]]) {
  add('jpeg-range' + from + '-' + to, Buffer.concat(scans.slice(from, to + 1)));
}
const p57 = 'LIKE THE INSTAR TUNNELING TO THE SURFACE\nWE MUST SHED OUR OWN CIRCUMFERENCES\nFIND THE DIVINITY WITHIN AND EMERGE';
const p56 = 'WITHIN THE DEEP WEB, THERE EXISTS A PAGE THAT HASHES TO\n36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4\nIT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE';
for (const [name, passage, title] of [['p57',p57,'PARABLE\n'],['p56',p56,'AN END\n']]) {
  for (const [form, base] of [['body',passage],['spaces',passage.replaceAll('\n',' ')],['no-spaces',passage.replace(/\s/g,'')],['title',title + passage]]) {
    for (const ending of ['', '\n', '\r\n']) add(name + ':' + form + ':' + JSON.stringify(ending), base + ending);
  }
}
assert.equal(candidates.length, 656);
let peak = 0;
const near = [];
let exact = 0;
for (const candidate of candidates) {
  const h = digest(candidate.bytes);
  for (let i = 0; i < targets.length; i++) {
    const equal = h.reduce((n, v, j) => n + (v === targets[i][j] ? 1 : 0), 0);
    peak = Math.max(peak, equal);
    if (equal >= 3) near.push({source: candidate.id, target: i < 8 ? 'column-' + i : 'row-block-' + (i - 8), equal});
    if (equal === 32) exact++;
  }
}
assert.equal(exact, 0);
assert.equal(peak, 3);
console.log(JSON.stringify({candidate_count: candidates.length, comparisons: candidates.length * targets.length, exact, maximum_matching_bytes: peak, near}, null, 2));
