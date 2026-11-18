/**
 * Original p24/p26 shared-insect illustration → one shared positionwise GP29
 * additive key: complete lexicon-bounded necessary-condition gate.
 *
 * Node 22, CommonJS, read-only. Uses the repository's source-exact corpus,
 * transcription and historical research English lexicon.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'resources');
const corpus = JSON.parse(fs.readFileSync(path.join(sourceDir, 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(sourceDir, 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const lexicon = fs.readFileSync(path.join(sourceDir, 'control', 'english_wordfreq_textblob.txt'), 'utf8');

const code = new Map(corpus.translit.map((x, i) => [x, i]));
const runeCode = new Map(corpus.runes.map((x, i) => [x, i]));
const letters = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA', ...corpus.translit.filter((x) => x.length === 1)];

/** @param {string} input @returns {number[] | null} */
function encode(input) {
  const s = input.toUpperCase()
    .replace(/QU/g, 'CW').replace(/K/g, 'C').replace(/Q/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = letters.find((t) => s.startsWith(t, i));
    if (!token) return null;
    out.push(code.get(token));
    i += token.length;
  }
  return out;
}

/** @returns {Map<number, {word: string, symbols: number[]}[]>} */
function dictionary() {
  const grouped = new Map();
  let count = 0;
  for (const line of lexicon.split(/\r?\n/)) {
    const match = /^([a-z]+)\s+(\d+)$/.exec(line.trim());
    if (!match) continue;
    const symbols = encode(match[1]);
    if (!symbols) continue;
    if (!grouped.has(symbols.length)) grouped.set(symbols.length, []);
    grouped.get(symbols.length).push({ word: match[1], symbols });
    count++;
  }
  assert.equal(count, 29157);
  return grouped;
}

/** @param {number} page @returns {{start:number,end:number,len:number}[]} */
function words(page) {
  const text = transcript.split('%')[page];
  const expected = corpus.pages[page].indices;
  assert.equal(typeof text, 'string');
  const observed = [];
  const result = [];
  let start = 0;
  for (const char of text) {
    if (runeCode.has(char)) observed.push(runeCode.get(char));
    else if (char === '-' || char === '.') {
      if (observed.length > start) {
        result.push({ start, end: observed.length, len: observed.length - start });
        start = observed.length;
      }
    }
  }
  if (observed.length > start) {
    result.push({ start, end: observed.length, len: observed.length - start });
  }
  assert.deepEqual(observed, expected);
  assert.equal(result.reduce((s, w) => s + w.len, 0), observed.length);
  return result;
}

/**
 * Check whether ANY two lexicon words of the exact printed lengths explain
 * the original fixed-position ciphertext difference under ONE common pad.
 * Uses a B-side substring hash, not a cross-product or fitted secret key.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {{start:number,end:number,len:number}[]} wordsA
 * @param {{start:number,end:number,len:number}[]} wordsB
 * @param {Map<number,{word:string,symbols:number[]}[]>} byLength
 * @returns {{lo:number,hi:number,n:number,aLen:number,bLen:number,count:number,example:string|null}[]}
 */
function test(a, b, wordsA, wordsB, byLength) {
  const out = [];
  for (const wa of wordsA) for (const wb of wordsB) {
    const lo = Math.max(wa.start, wb.start);
    const hi = Math.min(wa.end, wb.end);
    if (hi - lo < 4) continue;
    const n = hi - lo, offA = lo - wa.start, offB = lo - wb.start;
    const delta = Array.from({length:n}, (_,i) => (a[lo+i] - b[lo+i] + 29)%29);
    const candidatesB = new Map();
    for (const wbType of byLength.get(wb.len) || []) {
      const key = wbType.symbols.slice(offB, offB+n).join(',');
      if (!candidatesB.has(key)) candidatesB.set(key, wbType.word);
    }
    let count = 0, example = null;
    for (const waType of byLength.get(wa.len) || []) {
      const key = waType.symbols.slice(offA, offA+n)
        .map((x,i) => (x - delta[i] + 29)%29).join(',');
      const matched = candidatesB.get(key);
      if (matched) {
        count++;
        if (!example) example = waType.word + '/' + matched;
      }
    }
    out.push({lo,hi,n,aLen:wa.len,bLen:wb.len,count,example});
  }
  return out.sort((x,y) => y.n-x.n || x.lo-y.lo);
}

/** @param {number} page @param {{start:number,end:number,len:number}[]} spans
 * @param {Map<number,{word:string,symbols:number[]}[]>} byLen
 * @returns {number[]}
 */
function syntheticPlaintext(page, spans, byLen) {
  return spans.flatMap((span, j) => {
    const group = byLen.get(span.len);
    assert.ok(group && group.length, 'positive lexicon lacks length ' + span.len);
    return group[(j*37+page*5)%group.length].symbols;
  });
}

function main() {
  const byLen = dictionary();
  const a = corpus.pages[24].indices, b = corpus.pages[26].indices;
  const wa = words(24), wb = words(26);
  assert.equal(a.length,270); assert.equal(b.length,265);
  assert.equal(wa.length,64); assert.equal(wb.length,59);
  const original = test(a,b,wa,wb,byLen);
  const missing = original.filter(x => x.count === 0);
  assert.equal(original.length,20);
  assert.deepEqual(missing.map(x => [x.lo,x.hi,x.n]),
    [[27,33,6],[109,115,6],[162,168,6],[211,217,6],
     [86,91,5],[245,250,5],[82,86,4]]);
  assert.ok(original.every(x => x.hi <= b.length));
  console.log('Original original-art pair p24/p26, 265 aligned GP29 symbols');
  console.log('20 overlapping intact printed-word portions length>=4');
  console.log('Original zero-pair overlaps: '+missing.length);
  for (const x of original) {
    console.log(JSON.stringify(x));
  }

  // Construct two entire source-length, source-word-length English dictionary
  // streams and encrypt under the SAME 265-position nonconstant additive pad.
  // The checker must find at least the planted pair in every overlap.
  const pa=syntheticPlaintext(24,wa,byLen),pb=syntheticPlaintext(26,wb,byLen);
  const key=i => (7*i*i+11*i+3)%29;
  const ea=pa.map((x,i)=>(x+key(i))%29);
  const eb=pb.map((x,i)=>(x+key(i))%29);
  assert.deepEqual(ea.map((x,i)=>(x-key(i)+29)%29),pa);
  assert.deepEqual(eb.map((x,i)=>(x-key(i)+29)%29),pb);
  const planted = test(ea,eb,wa,wb,byLen);
  assert.equal(planted.length,original.length);
  assert.equal(planted.filter(x => x.count===0).length,0);
  console.log('Positive English word-shape-matched independent pad plant:',
    planted.length,'/',planted.length,'word overlaps satisfiable');
  console.log('PASS: shared same-clock additive GP29 key incompatible with',
    missing.length,'source-original overlapping dictionary word pairs.');
  console.log('Scope: pinned finite GP-English dictionary; zero plaintext or authentic key recovered.');
}

main();

function testXor(a, b, wordsA, wordsB, byLength) {
  const out = [];
  for (const wa of wordsA) for (const wb of wordsB) {
    const lo = Math.max(wa.start, wb.start);
    const hi = Math.min(wa.end, wb.end);
    if (hi - lo < 4) continue;
    const n = hi - lo, offA = lo - wa.start, offB = lo - wb.start;
    const delta = Array.from({length:n}, (_,i) => (a[lo+i] ^ b[lo+i]));
    const candidatesB = new Map();
    for (const wbType of byLength.get(wb.len) || []) {
      const key = wbType.symbols.slice(offB, offB+n).join(',');
      if (!candidatesB.has(key)) candidatesB.set(key, wbType.word);
    }
    let count = 0, example = null;
    for (const waType of byLength.get(wa.len) || []) {
      const key = waType.symbols.slice(offA, offA+n)
        .map((x,i) => (x ^ delta[i])).join(',');
      const matched = candidatesB.get(key);
      if (matched) {
        count++;
        if (!example) example = waType.word + '/' + matched;
      }
    }
    out.push({lo,hi,n,aLen:wa.len,bLen:wb.len,count,example});
  }
  return out.sort((x,y) => y.n-x.n || x.lo-y.lo);
}


/** Historical Cicada XOR alternative, separate original-corpus all-key gate. */
function xorMain() {
  const byLen=dictionary();
  const wa=words(24),wb=words(26);
  const a=corpus.pages[24].indices,b=corpus.pages[26].indices;
  const observed=testXor(a,b,wa,wb,byLen);
  assert.equal(observed.length,20);
  const missing=observed.filter(x=>x.count===0);
  assert.deepEqual(missing.map(x=>[x.lo,x.hi,x.n]),
    [[27,33,6],[109,115,6],[162,168,6],[211,217,6],
     [86,91,5],[203,208,5],[245,250,5],[72,76,4]]);
  console.log('XOR original shared-key zero pair overlaps:',missing.length);
  for(const item of observed) console.log('XOR',JSON.stringify(item));
  const pa=syntheticPlaintext(24,wa,byLen);
  const pb=syntheticPlaintext(26,wb,byLen);
  const padChoices=Array.from({length:32},(_,i)=>(i*7+5)%32);
  const key=pa.map((x,i)=>{
    const eligible=padChoices.find(k=>
      ((x^k)<29 && (i>=pb.length || (pb[i]^k)<29)));
    assert.ok(Number.isInteger(eligible));
    return eligible;
  });
  assert.ok(new Set(key).size>1);
  const ea=pa.map((x,i)=>x^key[i]),eb=pb.map((x,i)=>x^key[i]);
  assert.ok(ea.every(x=>x>=0&&x<29));assert.ok(eb.every(x=>x>=0&&x<29));
  assert.deepEqual(ea.map((x,i)=>x^key[i]),pa);
  assert.deepEqual(eb.map((x,i)=>x^key[i]),pb);
  const planted=testXor(ea,eb,wa,wb,byLen);
  assert.equal(planted.length,20);
  assert.equal(planted.filter(x=>x.count===0).length,0);
  console.log('XOR plant PASS:',planted.length,'/20 native GP word overlaps');
  console.log('PASS: all shared five-bit XOR pad keys contradict eight original word overlaps within pinned dictionary');
}
xorMain();
