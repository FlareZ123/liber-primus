'use strict';

/**
 * Original LP2 quotation/p55 direct literary-crib gate.
 * Node.js 22, CommonJS. Fetches byte-pinned public texts and never writes files.
 * Run after checking the published original page word vectors.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const SOURCES = [
  {
    label: 'KJV',
    repo: 'thiagobodruk/bible',
    rev: '4c8b8a4a7bd75fee381e1b55523b152191d6a1a5',
    path: 'json/en_kjv.json',
    blob: '00720bda5a8b79412529b0375764022c5ef8662a',
    expectedWords: 792469,
    expectedMax: [[7, 5], [5, 5], [6, 6], [7, 7]],
    expectedFullTail: [2, 1],
    json: true,
  },
  {
    label: 'Mabinogion',
    repo: 'GITenberg/The-Mabinogion_5160',
    rev: '86b1521ce54ddae3caaa235a6fb04a9ae67f2370',
    path: '5160-0.txt',
    blob: 'fd9db1c7bc90e11d41433b7cc2ec3b7e1ccb0cd7',
    expectedWords: 108235,
    expectedMax: [[5, 5], [5, 5], [5, 6], [6, 4]],
    expectedFullTail: [0, 0],
  },
  {
    label: 'King in Yellow',
    repo: 'GITenberg/The-King-in-Yellow_8492',
    rev: '5daf1c0d36c9665d9df1c881a7dbab484b415db2',
    path: '8492.txt',
    blob: '03a3fa6d9980fae3c432abc16c30ac6571b0eefb',
    expectedWords: 73074,
    expectedMax: [[6, 5], [5, 5], [4, 5], [6, 5]],
    expectedFullTail: [0, 0],
  },
];

const TARGETS = [
  ['p40-quote', [5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4]],
  ['p53-quote', [5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3]],
  ['p55-body', [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]],
  ['p55-sevenword-tail', [2, 7, 7, 2, 6, 3, 3]],
];

function nativeGPLength(word) {
  // Original LP1 p10–13 and LP2 p57 attest ING, NG and IO as single runes.
  // The other canonical multi-letter GP labels are TH, EO, OE, AE, IA and EA.
  return word.replace(/ING|TH|NG|IO|EO|OE|AE|IA|EA/g, '#').length;
}

/** @param {string} text @returns {string[]} */
function words(text) {
  return (text.match(/[A-Za-z]+/g) || []).map((s) => s.toUpperCase());
}

/** @param {string} text @returns {string} */
function gutenbergBody(text) {
  const first = text.search(/\*\*\*\s*START OF/i);
  const last = text.search(/\*\*\*\s*END OF/i);
  assert.ok(first >= 0 && last > first, 'Project Gutenberg body delimiters');
  return text.slice(first, last);
}

/** @param {string[]} tokens @param {number[]} target @param {(s:string)=>number} lengthOf */
function inspect(tokens, target, lengthOf) {
  const lengths = tokens.map(lengthOf);
  const n = target.length;
  let maxPrefix = 0;
  let full = 0;
  let atLeastFive = 0;
  let firstExample = '';
  for (let i = 0; i + n <= lengths.length; i += 1) {
    if (lengths[i] !== target[0]) continue;
    let prefix = 1;
    while (prefix < n && lengths[i + prefix] === target[prefix]) prefix += 1;
    if (prefix >= 5) atLeastFive += 1;
    if (prefix === n) full += 1;
    if (prefix > maxPrefix) {
      maxPrefix = prefix;
      firstExample = tokens.slice(i, i + n).join(' ');
    }
  }
  return { maxPrefix, full, atLeastFive, firstExample };
}

async function sourceText(config) {
  const url = `https://raw.githubusercontent.com/${config.repo}/${config.rev}/${config.path}`;
  const response = await fetch(url);
  assert.equal(response.status, 200, `source retrievable: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const gitBlobSha = createHash('sha1')
    .update(Buffer.from(`blob ${buffer.length}\0`))
    .update(buffer)
    .digest('hex');
  assert.equal(gitBlobSha, config.blob, `pinned bytes: ${config.label}`);
  return buffer.toString('utf8');
}

async function main() {
  assert.deepEqual(
    words('THE TOTIENT FUNCTION IS SACRED ALL THINGS').map(nativeGPLength),
    TARGETS[3][1],
    'original LP1 source-native seven-word positive crib length',
  );

  for (const [sourceIndex, config] of SOURCES.entries()) {
    const text = await sourceText(config);
    const docs = config.json
      ? JSON.parse(text).flatMap((book) => book.chapters.map((verses) => verses.join(' ')))
      : [gutenbergBody(text)];
    const tokensByDoc = docs.map(words);
    const observedWords = tokensByDoc.reduce((n, a) => n + a.length, 0);
    assert.equal(observedWords, config.expectedWords, `tokenization of ${config.label}`);
    console.log(`SOURCE ${sourceIndex} ${config.label}: ${observedWords} words, blob ${config.blob}`);

    for (let t = 0; t < TARGETS.length; t += 1) {
      const [name, target] = TARGETS[t];
      for (let model = 0; model < 2; model += 1) {
        const lengthOf = model === 0 ? (word) => word.length : nativeGPLength;
        const parts = tokensByDoc.map((doc) => inspect(doc, target, lengthOf));
        const maxPrefix = Math.max(...parts.map((x) => x.maxPrefix));
        const full = parts.reduce((sum, x) => sum + x.full, 0);
        const atLeastFive = parts.reduce((sum, x) => sum + x.atLeastFive, 0);
        assert.equal(maxPrefix, config.expectedMax[t][model]);
        assert.equal(full, t === 3 ? config.expectedFullTail[model] : 0);
        const example = parts.find((x) => x.maxPrefix === maxPrefix).firstExample;
        console.log(`  ${name} ${model === 0 ? 'Latin' : 'native-GP'}: ` +
          `full=${full} maxPrefix=${maxPrefix} prefix>=5=${atLeastFive}; ${example}`);
      }
    }
  }
  console.log('PASS: complete p40/p53/p55 literary cribs absent from all three pinned sources.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
