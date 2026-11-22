'use strict';

/** Original-input 256-position triple-XOR test. Read only; run under Node.js 22. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const read = name => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const ink = read('lp2-ink-annotations.json');
const grid = read('lp2-grid-256.json');
const corpus = read('lp2-corpus.json');
const letterIndex = new Map([...corpus.runes].map((rune, index) => [rune, index]));
/** @type {{offset:number,order:number,type:'rune'|'mark',value:number,page:number}[]} */
const events = [];
for (const page of ink.pages) {
  /** @type {typeof events} */
  const local = [];
  for (const span of page.red_spans || []) {
    let offset = span.start;
    for (const rune of span.runes) {
      assert.ok(letterIndex.has(rune), 'Unknown GP rune');
      local.push({offset:offset++,order:1,type:'rune',value:letterIndex.get(rune),page:page.page});
    }
  }
  for (const [offset, dotCount] of page.large_punctuation || []) {
    if (dotCount === 13) local.push({offset,order:0,type:'mark',value:13,page:page.page});
  }
  local.sort((a,b) => a.offset-b.offset || a.order-b.order);
  events.push(...local);
}
const terminal = corpus.pages.filter(p => p.page >= 55 && p.page <= 57).flatMap(p => p.indices);
const bytes = grid.bytes;
assert.deepEqual([events.length, bytes.length, terminal.length], [256,256,256]);
assert.deepEqual([events.filter(x => x.type === 'rune').length,events.filter(x => x.type === 'mark').length],[225,31]);
assert.deepEqual(corpus.pages.slice(-3).map(p => p.indices.length),[76,85,95]);
assert.equal(bytes.filter(x => x >= 128).length,129);
const expected = {
  'index:index':['d1f6a6b360f174b940ec82cde50ba3c069de1631628c2f5f7ad6ad1b95429e85',104,20],
  'index:prime':['8b8af2a674cb589814d6a7daab0cdfc219a73a39609820730bd48c0ec14096a3',99,27],
  'prime:index':['ebe9f7b777a504bb7a91d397ed0ba39d47fb096b6a8b042354fd8c04be40db85',94,27],
  'prime:prime':['b195a3a2639f289a2eabf680a30cdf9f37822563689f0b0f25ffad11ea42d3a3',95,28],
};
const target = '36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
for (const emode of ['index','prime']) for (const tmode of ['index','prime']) {
  const e = events.map(x => x.type === 'mark' ? 13 : emode === 'index' ? x.value : corpus.prime[x.value]);
  const t = terminal.map(x => tmode === 'index' ? x : corpus.prime[x]);
  assert.ok(e.every(x => x < 128) && t.every(x => x < 128));
  const out = bytes.map((x,i) => x ^ e[i] ^ t[i]);
  assert.deepEqual(out.map(x => x & 128),bytes.map(x => x & 128));
  assert.deepEqual(out.map((x,i) => x ^ e[i] ^ t[i]),bytes);
  const printable=out.filter(x => x >= 32 && x <= 126).length;
  const below29=out.filter(x => x < 29).length;
  const high=out.filter(x => x >= 128).length;
  const hex=Buffer.from(out.slice(0,32)).toString('hex');
  assert.deepEqual([hex,printable,below29],expected[`${emode}:${tmode}`]);
  assert.equal(high,129);
  const sha512=crypto.createHash('sha512').update(Buffer.from(out)).digest('hex');
  assert.notEqual(sha512,target);
  console.log(JSON.stringify({emode,tmode,high,printable,below29,first32:hex,sha512}));
}
console.log('PASS: source 256+256+256 triple XOR cannot directly output 7-bit ASCII under these rune/mark encodings.');
