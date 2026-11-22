#!/usr/bin/env node
'use strict';
/**
 * 2014 Onion6 read-only source contract and square-input SFT.
 *
 * Execute from any directory: node sims/cicada2014_onion6_cgi_contract_sft.cjs
 * Reads only pinned local historical artifacts; no network / POST.
 * The server-side checker was not archived, so mathematical validity is a
 * positive control, not proof of historical server acceptance.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/external/cicada2014-onion6-magic-form-and-response.json'), 'utf8'));
const form = source.files[0].raw_html;
const reply = source.files[1].raw_html;
const squares = fs.readFileSync(path.join(
  root, 'resources/cicada2014-openpuff-magic-squares.txt'), 'utf8')
  .trim().split(/\r?\n[ \t]*\r?\n/)
  .map(section => section.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));
const table = JSON.parse(fs.readFileSync(path.join(
  root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));

const action = form.match(/<form\b[^>]*method="([^"]+)"[^>]*action="([^"]+)"/i);
assert.ok(action, 'Original form method / action missing');
assert.deepEqual(action.slice(1), ['post', '/cgi-bin/squares']);
const fieldNames = [...form.matchAll(/<(?:textarea|input)\b[^>]*name="([^"]+)"/gi)]
  .map(match => match[1]);
assert.deepEqual(fieldNames, ['53301', '71033', '51033', 'onion']);
assert.equal((form.match(/<script\b/gi) || []).length, 0);
assert.match(form, /\/cgi-bin\/upload/);
assert.match(form, /name(?:d)? 'file'/);
assert.match(form, /\/key\.asc/);

const specifications = [
  { field: '53301', order: 5, total: 3301 },
  { field: '71033', order: 7, total: 1033 },
  { field: '51033', order: 5, total: 1033 },
];
const checked = [];
for (const [k, { field, order, total }] of specifications.entries()) {
  const matrix = squares[k];
  assert.equal(matrix.length, order);
  assert.ok(matrix.every(row => row.length === order && row.every(Number.isInteger)));
  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = matrix.map((_, j) => matrix.reduce((sum, row) => sum + row[j], 0));
  const diagonalTotals = [
    matrix.reduce((sum, row, i) => sum + row[i], 0),
    matrix.reduce((sum, row, i) => sum + row[order - 1 - i], 0),
  ];
  assert.ok([...rowTotals, ...colTotals, ...diagonalTotals]
    .every(value => value === total));
  checked.push({ field, order, total, entries: order * order,
    rowTotals, colTotals, diagonalTotals });
}

const payload = new URLSearchParams();
for (const { field } of specifications) {
  payload.set(field, squares[specifications.findIndex(entry => entry.field === field)]
    .map(row => row.join(' ')).join('\n'));
}
const testOnion = 'examplehiddenservice.onion'; // dummy local-only mock
payload.set('onion', testOnion);
const serialized = payload.toString();
const restored = new URLSearchParams(serialized);
assert.deepEqual([...restored.keys()], fieldNames);
assert.equal(restored.get('onion'), testOnion);
for (const { field } of specifications) assert.ok(restored.get(field).includes('\n'));
const replyLinks = [...reply.matchAll(/<img\s+src="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(replyLinks, ['/107.jpg', '/167.jpg', '/229.jpg']);
const originalGridLength = table.pages.reduce((sum, p) => sum + p.tokens.length, 0);
assert.equal(originalGridLength, 256);
assert.equal(specifications.reduce((sum, item) => sum + item.order ** 2, 0), 99);

console.log(JSON.stringify({
  sourceFormGitBlobSha: source.files[0].original_git_blob_sha1,
  sourceReplyGitBlobSha: source.files[1].original_git_blob_sha1,
  cicadaSubmission: { method: 'POST', endpoint: action[2], fields: fieldNames,
    encoding: 'application/x-www-form-urlencoded' },
  historicalSquares: checked,
  mockRoundtrip: { names: [...restored.keys()], payloadLength: serialized.length,
    decodedFirstRow: restored.get('53301').split('\n')[0] },
  participantHostedUpload: { method: 'POST', endpoint: '/cgi-bin/upload',
    fileInput: 'file', publicKey: '/key.asc', checkerSourceRecovered: false },
  historicalResponseImageLinks: replyLinks,
  lp2Table: { entries: originalGridLength, perPage: table.pages.map(p => ({
    page: p.page, entries: p.tokens.length
  })), suppliedSquareEntries: 99, directWholeObjectShapeMatch: false },
}, null, 2));
