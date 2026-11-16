'use strict';

/**
 * Original 2014 GEB book-code first-letter running-key transfer, GP29.
 *
 * SOURCE TEXT NOT VENDORED: input comes from a fixed public 2014 puzzle archive
 * and remains copyright its author. The script only prints numerical findings.
 * Node 22, CommonJS; read-only against this repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BOOK_URL = 'https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt';
const LABELS = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const tokenIndex = new Map(LABELS.map((token, index) => [token, index]));
const SOURCE_TOKENS = ['ING','IO',...LABELS].sort((a,b) => b.length-a.length);
const LEGACY_TOKENS = [...LABELS].sort((a,b) => b.length-a.length);

function encodeGP(raw, sourceNative) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[VKQZ]/g, symbol => ({V:'U', K:'C', Q:'C', Z:'S'})[symbol])
    .replace(/[^A-Z]/g, '');
  const tokens = sourceNative ? SOURCE_TOKENS : LEGACY_TOKENS;
  const encoded = [];
  for (let i = 0; i < text.length;) {
    const match = tokens.find(token => text.startsWith(token, i));
    assert.ok(match, 'Unencodable source letter at ' + i);
    encoded.push(match === 'ING' ? 21 : match === 'IO' ? 27 : tokenIndex.get(match));
    i += match.length;
  }
  return encoded;
}

function coincidence(arr) {
  const n = arr.length;
  const freq = Array(29).fill(0);
  for (const x of arr) freq[x]++;
  return freq.reduce((s, count) => s + count*(count-1), 0)/(n*(n-1));
}

/**
 * Exact existence test for authentic plaintext-F bypass.
 * Non-F plaintext consumes next key symbol. Plaintext F emits zero and skips.
 * Every possible transparent-F path is retained; no linguistic pruning.
 * sign = -1 corresponds to plaintext = ciphertext - key.
 */
function transparentFeasibility(cipher, key, sign) {
  let current = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const consumed of current) {
      const plaintext = (cipher[i]+sign*key[consumed]+29)%29;
      if (plaintext !== 0) next.add(consumed+1);
      if (cipher[i] === 0) next.add(consumed);
    }
    current = next;
    if (current.size === 0) return {survives:false,firstImpossibleZeroBased:i};
  }
  return {survives:true,possibleClocks:current.size};
}

function encryptTransparent(plain, key, sign) {
  const out = [];
  let clock = 0;
  for (const rune of plain) {
    if (rune === 0) out.push(0);
    else {out.push((rune-sign*key[clock]+29)%29);clock++;}
  }
  return out;
}

async function main() {
  const root = path.join(__dirname, '..');
  const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
  const first = corpus.pages.slice(0,3).flatMap(page => page.indices);
  assert.deepEqual(corpus.pages.slice(0,3).map(p=>p.runic_count),[262,266,201]);
  assert.equal(first.length,729);

  const response = await fetch(BOOK_URL);
  assert.equal(response.ok,true,'Cicada-era GEB reference HTTP failure ' + response.status);
  const book = await response.text();
  const anchor = 'TORTOISE: Your argument is persuasive';
  const ix = book.indexOf(anchor);
  assert.equal(ix,87816,'Historical GEB source OCR anchor unexpectedly changed');
  const start = ix + 'TORTOISE: Yo'.length;
  assert.equal(start,87828);
  console.log('Original source anchor, 3PI:6:1:3 (U): UTF-16 code-unit index',start);
  console.log('First original chapter GP29 runes:',first.length,'; original IoC',coincidence(first).toFixed(12));

  for (const native of [true,false]) {
    const key = encodeGP(book.slice(start),native);
    assert.ok(key.length>first.length);
    assert.deepEqual(key.slice(0,16),[1,4,24,4,6,1,19,18,9,16,10,15,13,18,4,15]);
    for (const sign of [-1,1]) {
      const direct = first.map((c,i)=>(c+sign*key[i]+29)%29);
      const gate = transparentFeasibility(first,key,sign);
      // The synthetic solved p57 positive verifies every genuine-F bypass
      // is represented and that real plaintext can survive the same key.
      const p57 = corpus.pages[57].indices;
      assert.equal(p57.length,95);
      assert.ok(p57.includes(0),'Solved p57 must contain a literal F bypass');
      const plant = encryptTransparent(p57,key,sign);
      const recovered = transparentFeasibility(plant,key,sign);
      assert.ok(recovered.survives,'F-transparent original-source positive must survive');
      console.log(JSON.stringify({
        original:true,sourceNative:native,sign,anchorUtf16:start,
        directIoC:Number(coincidence(direct).toFixed(12)),
        fTransparent:gate,
        plantedSolvedP57:{runes:95,valid:recovered.survives},
        first32Direct:direct.slice(0,32).map(x=>LABELS[x]).join(' ')
      }));
      assert.ok(!gate.survives,'Unexpected original GEB/F-transparent inverse requires review');
    }
  }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
