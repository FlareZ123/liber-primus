'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const historicalRoot = path.join(root, 'resources', 'historical');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'),
  'utf8'
));

/** @param {string} dir */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const textExtensions = new Set([
  '.md', '.txt', '.asc', '.html', '.json', '.py', '.c', '.js',
]);
const historicalFiles = walk(historicalRoot)
  .filter((file) => textExtensions.has(path.extname(file).toLowerCase()))
  .filter((file) => fs.statSync(file).size <= 150 * 1024)
  .sort();

assert.equal(historicalFiles.length, 65);
assert.equal(
  historicalFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0),
  174215
);

const selectorPattern =
  /\b(?:0x[0-9a-f]+|hex(?:adecimal)?|base\s*[-_ ]?\s*16|radix\s*[-_ ]?\s*16)\b/ig;
const hits = [];

for (const file of historicalFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = selectorPattern.exec(content)) !== null) {
    hits.push({
      path: path.relative(root, file).replaceAll('\\', '/'),
      match: match[0],
    });
  }
}

const hitPaths = [...new Set(hits.map((hit) => hit.path))];
assert.deepEqual(hitPaths, [
  'resources/historical/lp1-outguess-2014-source-map.md',
  'resources/historical/pklmx-2013/README.md',
]);

const tokens = grid.pages.flatMap((page) => page.tokens);
const bytes60 = grid.pages.flatMap((page) => page.bytes);
assert.equal(tokens.length, 256);

const hexReadable = tokens.flatMap((token, cell) =>
  /^[0-9A-Fa-f]{2}$/.test(token)
    ? [{ cell, token, value: Number.parseInt(token, 16) }]
    : []
);
assert.equal(hexReadable.length, 88);
assert.equal(new Set(hexReadable.map((item) => item.token)).size, 61);

const exact1D = tokens.flatMap((token, cell) =>
  token === '1D' ? [cell] : []
);
assert.deepEqual(exact1D, [43, 69, 112, 226]);
assert.equal(bytes60[43], 73);

const alphabet59 = grid.alphabet.replace('f', '');
const token = tokens[43];
const base59 =
  59 * alphabet59.indexOf(token[0]) + alphabet59.indexOf(token[1]);
assert.equal(base59, 72);
assert.equal(Number.parseInt(token, 16), 29);

console.log(JSON.stringify({
  status: 'PASS',
  cell43: {
    token,
    base60: bytes60[43],
    base59,
    hexadecimal: Number.parseInt(token, 16),
  },
  p50Control: {
    hexReadableCells: hexReadable.length,
    distinctHexReadableTokens: new Set(hexReadable.map((item) => item.token)).size,
    exact1DCells: exact1D,
  },
  historicalAudit: {
    fileCount: historicalFiles.length,
    byteCount: historicalFiles.reduce(
      (sum, file) => sum + fs.statSync(file).size,
      0
    ),
    hitPaths,
    hits,
  },
  decision: 'Historical Cicada used hexadecimal, but no source-local selector licenses reading isolated p50 token 1D as base16.',
}, null, 2));
