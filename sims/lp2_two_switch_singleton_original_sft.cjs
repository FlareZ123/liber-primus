'use strict';
/**
 * Exact printed-singleton obstruction for ciphertext-predecessor-feedback
 * two-state substitution, with a complete three-state positive witness.
 *
 * Node.js 22 / CommonJS, Windows-compatible, read-only.
 * Source data are the original 55 rune-bearing LP2 pages with literal
 * line wraps, physical page breaks and printed punctuation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
/** @type {{runes:string[],translit:string[],pages:Array<{page:number,indices:number[]}>}} */
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const physical = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const source = read('resources/liber-primus/lp2-transcription.txt');
const sourcePages = source.split('%').slice(0,55);
const Q = corpus.runes.length;
const A = corpus.translit.indexOf('A');
const I = corpus.translit.indexOf('I');
const O = corpus.translit.indexOf('O');
assert.equal(Q,29);
assert.equal(sourcePages.length,55);
assert.deepEqual([A,I,O],[24,10,3]);
const byRune = new Map(corpus.runes.map((x,i)=>[x,i]));
const RUNIC = /[\u16A0-\u16FF]/u;
const observed = Array.from({length:55},()=>[]);
/** @type {Array<{page:number,offset:number,preceding:number|null,current:number}>} */
const singles = [];
let page = 0;
let preceding = null;
let startPreceding = null;
let startPage = 0;
let startOffset = 0;
let lastRunePage = 0;
/** @type {number[]} */
let word = [];
let completeWords = 0;
let crossPageWords = 0;
/** @returns {void} */
function finish() {
  if (!word.length) return;
  completeWords++;
  // A leading separator on the next page does not carry the preceding word.
  if (lastRunePage !== startPage) crossPageWords++;
  if (word.length===1) {
    singles.push({page:startPage,offset:startOffset,
      preceding:startPreceding,current:word[0]});
  }
  word=[];
  startPreceding=null;
}
for(const char of sourcePages.join('%')) {
  if (RUNIC.test(char)) {
    if (word.length===0) {
      startPreceding=preceding;
      startPage=page;
      startOffset=observed[page].length;
    }
    const c=byRune.get(char);
    assert.ok(Number.isInteger(c),'unknown original rune');
    observed[page].push(c);
    word.push(c);
    lastRunePage=page;
    preceding=c;
  } else if(char==='%') {
    page++;
    preceding=null;
  } else if(char==='/' || /\s/u.test(char)) {
    // Line breaks and spacing around source rows do not delimit words.
  } else finish();
}
finish();
assert.equal(completeWords,2896);
assert.equal(crossPageWords,32);
assert.equal(singles.length,83);
assert.equal(page,54);
for(let p=0;p<55;p++)assert.deepEqual(observed[p],physical[p].indices,
  'Original page mismatch at '+physical[p].page);

/**
 * For each ciphertext predecessor state, count distinct singleton-word
 * ciphertext successors. An unknown mode selects one bijection in which
 * every one-rune English plaintext is A or I (possibly also O).
 * @returns {Array<Map<number,number>>}
 */
function singletonSuccessors() {
  const rows=Array.from({length:Q},()=>new Map());
  for(const s of singles)if(s.preceding!==null){
    const m=rows[s.preceding];
    m.set(s.current,(m.get(s.current)||0)+1);
  }
  return rows;
}
const rows=singletonSuccessors();
const freeSingles=singles.filter(s=>s.preceding===null).length;
const bad=rows.flatMap((m,i)=>m.size>4?[{index:i,translit:corpus.translit[i],
  unique:m.size,successors:[...m.keys()].map(v=>corpus.translit[v])}]:[]);
assert.equal(freeSingles,1);
assert.deepEqual(bad.map(x=>[x.translit,x.unique]),
  [['G',5],['B',6],['L',5],['D',6]]);
assert.equal(Math.max(...rows.map(m=>m.size)),6);

/** @param {number[]} allowed @returns {{secret:number[][][],inverses:number[][][]}} */
function construct(allowed) {
  const count=allowed.length===2?3:2;
  const secret=Array.from({length:count},()=>[]);
  const inverses=Array.from({length:count},()=>[]);
  for(let prev=0;prev<Q;prev++) {
    const ranked=[...rows[prev]].sort((a,b)=>b[1]-a[1] || a[0]-b[0])
      .map(x=>x[0]);
    for(let mode=0;mode<count;mode++) {
      /** @type {number[]} */
      const targets=ranked.slice(mode*allowed.length,(mode+1)*allowed.length);
      const free=Array.from({length:Q},(_,i)=>i)
        .filter(v=>!targets.includes(v));
      const cipher=Array(Q).fill(-1);
      for(let j=0;j<targets.length;j++)cipher[allowed[j]]=targets[j];
      let k=0;
      for(let j=0;j<Q;j++)if(cipher[j]<0)cipher[j]=free[k++];
      const inv=Array(Q).fill(-1);
      for(let j=0;j<Q;j++)inv[cipher[j]]=j;
      assert.equal(new Set(cipher).size,Q);
      secret[mode][prev]=cipher;
      inverses[mode][prev]=inv;
    }
  }
  return {secret,inverses};
}

/**
 * Construct the best-specified source witness under an arbitrary hidden
 * mode at each position, and guarantee exact full-cipher replay.
 * @param {number[]} allowed
 * @returns {{total:number,classified:number,countO:number,modes:number}}
 */
function witness(allowed) {
  const {secret,inverses}=construct(allowed);
  const bySite=new Map(singles.map(s=>[s.page+':'+s.offset,s]));
  let total=0,classified=0,countO=0;
  for(let p=0;p<observed.length;p++) {
    for(let j=0;j<observed[p].length;j++) {
      const c=observed[p][j],prev=j?observed[p][j-1]:null;
      let mode=0;
      const singleton=bySite.get(p+':'+j);
      if(singleton && prev!==null) {
        assert.equal(singleton.preceding,prev);
        mode=inverses.findIndex(v=>allowed.includes(v[prev][c]));
        assert.ok(mode>=0);
        classified++;
      }
      const plain=prev===null?c:inverses[mode][prev][c];
      if(singleton && prev!==null) {
        assert.ok(allowed.includes(plain));
        countO+=+(plain===O);
      }
      if(prev!==null)assert.equal(secret[mode][prev][plain],c);
      total++;
    }
  }
  assert.equal(total,12956);
  assert.equal(classified,82);
  return {total,classified,countO,modes:secret.length};
}
const threeModeAI=witness([A,I]);
const twoModeAIO=witness([A,I,O]);
assert.equal(threeModeAI.countO,0);
assert.equal(twoModeAIO.countO,6);

// Exact lower bound: each predecessor state has two distinct A/I outputs
// per hidden mode. The remaining singleton events must be O or another
// independently allowed one-letter word. Among row outcomes choose the
// four highest-frequency successors as A/I to minimize the exception count.
const minimalOther=rows.reduce((sum,m)=>{
  const descending=[...m.values()].sort((a,b)=>b-a);
  return sum+descending.slice(4).reduce((a,b)=>a+b,0);
},0);
assert.equal(minimalOther,6);
console.log('Source-checked original: '+completeWords+' whole words, '+
  crossPageWords+' cross-page words, 12956 runes, 83 one-rune words');
console.log('82 predecessor-conditioned singleton sites; first-page-free: '+
  freeSingles);
for(const b of bad)console.log('State '+b.translit+
  ' has '+b.unique+' distinct singleton next-ciphertext symbols: '+
  b.successors.join(', '));
console.log('Book-static two-mode GP(A,I) limit=4; four original states fail.');
console.log('Minimum modes required for book-static (A,I): 3, achieved by '+
  threeModeAI.total+' exact original-cipher roundtrips.');
console.log('Book-static two-mode GP(A,I,O) requires at least '+
  minimalOther+' standalone vocative O tokens, achieved by '+
  twoModeAIO.total+' exact original-cipher roundtrips.');
console.log('No unknown plaintext or author-selected mode schedule is recovered.');
