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


/** Print-line positions for the two original 12-line illustrated pages. */
function physicalLines(page) {
  const lines=transcript.split('%')[page].split(/\r?\n/);
  let start=0;
  const out=[];
  for(const line of lines){
    const n=[...line].filter(x=>runeCode.has(x)).length;
    if(!n)continue;
    out.push({start,len:n,end:start+n});
    start+=n;
  }
  assert.equal(start,corpus.pages[page].indices.length);
  return out;
}

/** All original four-plus-rune word overlaps at the same visible print line+column. */
function rowPadGate(a,b,wa,wb,la,lb,byLen,kind){
  const result=[];
  assert.equal(la.length,lb.length);
  for(let r=0;r<la.length;r++){
    const al=la[r],bl=lb[r],N=Math.min(al.len,bl.len);
    for(const wA of wa)for(const wB of wb){
      const lo=Math.max(0,wA.start-al.start,wB.start-bl.start);
      const hi=Math.min(N,wA.end-al.start,wB.end-bl.start);
      const n=hi-lo;
      if(n<4)continue;
      const offsetA=al.start+lo-wA.start,offsetB=bl.start+lo-wB.start;
      const D=Array.from({length:n},(_,i)=>kind==='xor'
        ? (a[al.start+lo+i]^b[bl.start+lo+i])
        : (a[al.start+lo+i]-b[bl.start+lo+i]+29)%29);
      const allowed=new Set((byLen.get(wB.len)||[])
        .map(w=>w.symbols.slice(offsetB,offsetB+n).join(',')));
      let count=0;
      for(const w of byLen.get(wA.len)||[]){
        const v=w.symbols.slice(offsetA,offsetA+n).map((x,j)=>
          kind==='xor'?(x^D[j]):(x-D[j]+29)%29).join(',');
        if(allowed.has(v))count++;
      }
      result.push({row:r,lo,hi,n,offA:al.start+lo,offB:bl.start+lo,
        aLen:wA.len,bLen:wB.len,count});
    }
  }
  return result.sort((x,y)=>y.n-x.n||x.row-y.row||x.lo-y.lo);
}

function rowMain(){
  const byLen=dictionary(),wa=words(24),wb=words(26);
  const la=physicalLines(24),lb=physicalLines(26);
  assert.deepEqual(la.map(x=>x.len),[22,24,21,24,23,21,22,23,23,22,22,23]);
  assert.deepEqual(lb.map(x=>x.len),[20,22,23,22,24,23,24,21,19,24,23,20]);
  const a=corpus.pages[24].indices,b=corpus.pages[26].indices;
  assert.equal(la.reduce((s,x,i)=>s+Math.min(x.len,lb[i].len),0),255);
  const add=rowPadGate(a,b,wa,wb,la,lb,byLen,'add');
  const xor=rowPadGate(a,b,wa,wb,la,lb,byLen,'xor');
  assert.equal(add.length,17);assert.equal(xor.length,17);
  const sig=xs=>xs.filter(x=>x.count===0).map(x=>[x.row,x.lo,x.hi,x.n]);
  assert.deepEqual(sig(add),[[4,4,10,6],[7,4,10,6],[2,13,18,5],
    [9,3,8,5],[11,0,5,5]]);
  assert.deepEqual(sig(xor),[[4,4,10,6],[7,4,10,6],[2,13,18,5],
    [4,17,22,5],[9,3,8,5],[11,0,5,5],[11,15,20,5]]);
  console.log('Source row-local clock: 12 lines, 255 shared positions');
  console.log('Native-word zero overlaps: additive',sig(add).length,
    '/17; ordinal XOR',sig(xor).length,'/17');
  for(const x of add)console.log('ROW_ADD',JSON.stringify(x));
  for(const x of xor)console.log('ROW_XOR',JSON.stringify(x));

  // Two full genuine dictionary-English plaintexts in the exact original
  // 64/59 word slots. Emit both with the identical source-row clock and key.
  const pa=syntheticPlaintext(24,wa,byLen),pb=syntheticPlaintext(26,wb,byLen);
  const aAdd=[],bAdd=[],aXor=[],bXor=[],seenKeys=new Set();
  const order=Array.from({length:32},(_,i)=>(i*7+5)%32);
  for(let r=0;r<la.length;r++){
    const count=Math.max(la[r].len,lb[r].len);
    for(let j=0;j<count;j++){
      const aa=j<la[r].len?pa[la[r].start+j]:undefined;
      const bb=j<lb[r].len?pb[lb[r].start+j]:undefined;
      const key=(7*r*r+11*j+3)%29;
      const xorKey=order.find(k=>
        ((aa===undefined||(aa^k)<29)&&(bb===undefined||(bb^k)<29)));
      assert.ok(Number.isInteger(xorKey));
      seenKeys.add(xorKey);
      if(aa!==undefined){
        aAdd[la[r].start+j]=(aa+key)%29;
        aXor[la[r].start+j]=aa^xorKey;
        assert.equal((aAdd[la[r].start+j]-key+29)%29,aa);
        assert.equal(aXor[la[r].start+j]^xorKey,aa);
      }
      if(bb!==undefined){
        bAdd[lb[r].start+j]=(bb+key)%29;
        bXor[lb[r].start+j]=bb^xorKey;
        assert.equal((bAdd[lb[r].start+j]-key+29)%29,bb);
        assert.equal(bXor[lb[r].start+j]^xorKey,bb);
      }
    }
  }
  assert.ok(seenKeys.size>1);
  assert.equal(aAdd.length,270);assert.equal(bAdd.length,265);
  assert.ok(aXor.every(v=>v>=0&&v<29));
  assert.ok(bXor.every(v=>v>=0&&v<29));
  assert.equal(rowPadGate(aAdd,bAdd,wa,wb,la,lb,byLen,'add')
    .filter(x=>x.count===0).length,0);
  assert.equal(rowPadGate(aXor,bXor,wa,wb,la,lb,byLen,'xor')
    .filter(x=>x.count===0).length,0);
  console.log('PASS source row-local all-key exclusions and 17/17 native-positive controls for both operators');
}
rowMain();
