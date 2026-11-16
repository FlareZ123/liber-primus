'use strict';

/**
 * 2015 participant ten-field table: original archival source-vs-schema test.
 * Node.js 22, CommonJS, read-only. Run: node sims/lp2_2015_tenfield_nonidentifiability_sft.cjs
 * Downloads immutable historical source files, checks Git blob identities, and
 * tests all 13,041 rows without consulting LP2 plaintext or a fitted key.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const COMMIT = 'e4bdbc24b1d1b5a6462f3332c9a8db785b5c48ec';
const ROOT = `https://raw.githubusercontent.com/resvolver/c1cada/${COMMIT}/`;
const EXPECT = {
  csv: 'f864602155cbb645136ab981456adee23fdfbb35',
  rne: '71f775af897a2c9516d0868b520557fda58db311'
};
const INDEX = new Map([
  ...Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ').map((ch, i) => [ch, i]),
  ['ᛂ', 11]
]);

/** @param {string} file @param {string} sha */
async function original(file, sha) {
  const response = await fetch(ROOT + file);
  assert.equal(response.status, 200, `historical source unavailable: ${file}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const blob = Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]);
  assert.equal(crypto.createHash('sha1').update(blob).digest('hex'), sha, file);
  return bytes.toString('utf8');
}

/** RFC4180 reader, including the source's embedded quoted newlines. @param {string} data */
function csvRows(data) {
  const out = [];
  let cell = '', row = [], quoted = false;
  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    if (ch === '"') {
      if (quoted && data[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && ch === ',') {
      row.push(cell); cell = '';
    } else if (!quoted && (ch === '\r' || ch === '\n')) {
      if (ch === '\r' && data[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(Boolean)) out.push(row);
      row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); out.push(row); }
  assert.equal(quoted, false);
  return out;
}

/** All ten historical fields have zero independent computed cipher columns. */
function validateHistorical(rows) {
  const head = ['', 'ttl_pos', 'chara', 'l_pos', 'word', 'w_length',
    'w_pos', 'page_n', 'word_c', 'char_page'];
  assert.deepEqual(rows[0], head);
  const d = rows.slice(1);
  assert.equal(d.length, 13041);
  let maxWord = 0;
  for (let i = 0; i < d.length; i++) {
    const r = d[i], p = d[i - 1];
    assert.equal(r.length, 10);
    const [row, global, letter, pos, word, length, wp, page, wc, cp] =
      r.map((x, j) => j === 4 ? x : Number(x));
    const letters = word.split(',').map(Number);
    assert.equal(row, i + 1);
    assert.equal(global, i + 1);
    assert.ok(Number.isInteger(letter) && letter >= 0 && letter < 29);
    assert.equal(length, letters.length);
    assert.equal(letter, letters[pos - 1]);
    if (!p) {
      assert.deepEqual([pos, wp, page, wc, cp], [1, 1, 1, 1, 1]);
    } else {
      const sameWord = wc === Number(p[8]);
      const samePage = page === Number(p[7]);
      assert.equal(wc, Number(p[8]) + (sameWord ? 0 : 1));
      assert.equal(pos, sameWord ? Number(p[3]) + 1 : 1);
      assert.equal(wp, samePage ? Number(p[6]) + (sameWord ? 0 : 1) : 1);
      assert.equal(cp, samePage ? Number(p[9]) + 1 : 1);
      if (sameWord) assert.equal(word, p[4]);
    }
    maxWord = wc;
  }
  assert.equal(maxWord, 2922);
  assert.equal(Number(d.at(-1)[7]), 57);
  console.log('Historical internal schema: 13041/13041 rows satisfy every ten-field identity; 2922 word groups, 56 rune-bearing pages');
  return d;
}

/** Reconstruct from a separate 2015 runic transcription and its word/page breaks. */
function sourceRows(rne) {
  const words = [];
  let line = 0, current = [];
  function closeWord() {
    if (current.length) {
      words.push({ values: current.map(x => x.i), page: current.at(-1).page });
      current = [];
    }
  }
  for (const ch of rne) {
    if (ch === '\n') { line++; continue; }
    if (INDEX.has(ch)) {
      current.push({i: INDEX.get(ch), page: line < 50 ? line + 1 : line + 2});
    } else closeWord();
  }
  closeWord();
  const out = [];
  let lastPage = 0, pageWord = 0, pageLetter = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    if (w.page !== lastPage) { lastPage = w.page; pageWord = 0; pageLetter = 0; }
    pageWord++;
    for (let k = 0; k < w.values.length; k++) {
      pageLetter++;
      const n = out.length + 1;
      out.push([String(n), String(n), String(w.values[k]), String(k + 1),
        w.values.join(','), String(w.values.length), String(pageWord),
        String(w.page), String(wi + 1), String(pageLetter)]);
    }
  }
  assert.equal(out.length, 13136);
  return { out, wordCount: words.length };
}

async function main() {
  const [rawCsv, originalRne] = await Promise.all([
    original('full%20transcript%20data/all_data.csv', EXPECT.csv),
    original('translation/liber_primus.rne', EXPECT.rne)
  ]);
  const historical = validateHistorical(csvRows(rawCsv));
  const source = sourceRows(originalRne);
  for (let i = 0; i < 729; i++)
    assert.deepEqual(source.out[i], historical[i],
      `first-chapter source-generated row ${i + 1}`);
  console.log('Independent original transcription: first 729 historical rows reconstructed exactly, including all 10 columns');
  const historicalChars = historical.map(r => Number(r[2]));
  const sourceChars = source.out.slice(0, historical.length).map(r => Number(r[2]));
  const originalDisagreements = historicalChars
    .flatMap((value, i) => value === sourceChars[i] ? [] : [i + 1]);
  console.log('2015 RNE vs CSV rune disagreements:', originalDisagreements.join(','));
  assert.equal(originalDisagreements.length, 11);
  // Two different, equally compatible choices for two hypothetical extra columns.
  // The absent February file has 132 more rows and unknown mark semantics as well.
  let different = 0;
  for (let i = 0; i < historical.length; i++) {
    const c = historicalChars[i], previous = i ? historicalChars[i - 1] : 0;
    const next = i + 1 < historical.length ? historicalChars[i + 1] : 0;
    const first = [(c - previous + 29) % 29, Math.abs(c - previous)];
    const second = [(c - next + 29) % 29, (c + next) % 29];
    if (first[0] !== second[0] || first[1] !== second[1]) different++;
  }
  assert.ok(different > 10000);
  console.log(`Two explicit incompatible 12-field extensions fit every observed 10-field row; they disagree on ${different}/13041 rows`);
  console.log('No surviving typed operation or historical value of the two absent fields follows from these records.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
