'use strict';

/**
 * Authentic p56 F-transparent phi(prime) key, with every printed word's traversal
 * direction latent. This tests whether the 2016 "numbers ... direction"
 * hint could point to an inferred wordwise key-direction sequence whose
 * rule is not among the 66 ciphertext-number rules of Issue #1329.
 *
 * Exact finite-state Viterbi over (29? no) all 464 historical prime-key
 * positions, granting every word a free +1 or -1 traversal and a freely
 * chosen original starting key position. Optimistically strong, since the
 * signs are allowed to depend on unknown plaintext without any rule.
 *
 * node sims/lp2_pdir_free_word_direction_dp_sft.cjs
 * Node 22 / CommonJS / read-only; original-input first chapter p0-p2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalText = read('resources/liber-primus/lp2-transcription.txt');
const runes = new Map(gp.runes.map((c, i) => [c, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const physical = originalText.split('%').map(s => s.replace(/\/\s*\n/g, '').replace(/\s+/g, ''));
assert.equal(physical.length, 57);
const opening = physical.slice(0, 3).join('');
/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  return (text.match(runePattern) || []).map(w => Array.from(w, c => {
    const i = runes.get(c);
    assert.notEqual(i, undefined);
    return i;
  }));
}
const words = runeWords(opening);
assert.equal(words.length, 158);
assert.equal(words.flat().length, 729);
assert.deepEqual(words.flat(), gp.pages.slice(0, 3).flatMap(p => p.indices));

const primeNumbers = [];
for (let x = 2; primeNumbers.length < 464; x++) {
  let prime = true;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
  if (prime) primeNumbers.push(x);
}
assert.equal(primeNumbers[463], 3301);
const KEY = primeNumbers.map(p => (p - 1) % 29);
const N = KEY.length;
/** @param {number} x @returns {number} */
const mod = x => ((x % N) + N) % N;
const tok = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/**
 * English -> GP source-calibrated spelling (ING, IO, V/U, Q/C).
 * @param {string} word
 * @returns {number[]}
 */
function encode(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const a = [];
  for (let j = 0; j < s.length;) {
    if (s.startsWith('ING', j)) { a.push(21); j += 3; continue; }
    if (s.startsWith('IO', j)) { a.push(27); j += 2; continue; }
    const t = tok.find(x => s.startsWith(x.s, j));
    if (!t) return [];
    a.push(t.i);
    j += t.s.length;
  }
  return a;
}
assert.equal(encode('FUNCTION').map(i => gp.runes[i]).join(''), 'ᚠᚢᚾᚳᛏᛡᚾ');

/** @param {number[]} a @returns {string} */
const spell = a => a.map(i => gp.translit[i]).join('');
const source = [
  read('resources/liber-primus/lp1-plaintext-reference.txt'),
  read('resources/external/2013-book-of-law-I.txt'),
  read('resources/external/2013-book-of-law-II.txt'),
  read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt'),
  read('resources/external/kjv-passion-gospels-2014.txt'),
];
const holdoutText = read('resources/external/2013-book-of-law-III.txt');
const native = [];
const dictionary = new Map();
for (const document of source) {
  for (const match of document.matchAll(/\b[A-Za-z]+\b/g)) {
    const w = encode(match[0]);
    if (!w.length || w.length > 15) continue;
    native.push(w);
    const key = w.join(',');
    dictionary.set(key, (dictionary.get(key) || 0) + 1);
  }
}
assert(native.length > 10000, 'native GP language reference');
const holdoutByLength = new Map();
for (const match of holdoutText.matchAll(/\b[A-Za-z]+\b/g)) {
  const w = encode(match[0]);
  if (!w.length || w.length > 15) continue;
  if (!holdoutByLength.has(w.length)) holdoutByLength.set(w.length, []);
  holdoutByLength.get(w.length).push({w, frequency:1});
}
const byLength = new Map();
for (const [key, frequency] of dictionary) {
  const w = key.split(',').map(Number);
  if (!byLength.has(w.length)) byLength.set(w.length, []);
  byLength.get(w.length).push({w, frequency});
}
const UNI = new Float64Array(29).fill(1);
const TRI = new Float64Array(30 * 30 * 29);
const CTX = new Float64Array(30 * 30);
for (const w of native) {
  let a = 29, b = 29;
  for (const c of w) {
    UNI[c]++;
    TRI[(a * 30 + b) * 29 + c]++;
    CTX[a * 30 + b]++;
    a = b; b = c;
  }
}
const total = UNI.reduce((a, b) => a + b, 0);
const logtri = new Float64Array(TRI.length);
for (let i = 0; i < 30 * 30; i++) {
  for (let c = 0; c < 29; c++) {
    const alpha = 8;
    logtri[i * 29 + c] = Math.log((TRI[i * 29 + c] + alpha * UNI[c] / total) /
      (CTX[i] + alpha));
  }
}
/** @param {number[]} w @returns {number} */
function languageScore(w) {
  let a = 29, b = 29, s = 0;
  for (const c of w) {
    s += logtri[(a * 30 + b) * 29 + c];
    a = b; b = c;
  }
  const count = dictionary.get(w.join(',')) || 0;
  if (count) s += Math.min(6, 2 + Math.log1p(count));
  return s;
}

/**
 * Test a stricter candidate than unconstrained skips: a key symbol may be
 * discarded only if it would emit the previous ciphertext rune, with a
 * maximum of three consecutive discards per non-F rune. A repeated
 * ciphertext rune may alternatively be accepted (stochastic exception).
 * This exactly contains the source-no-repeat and 19% repeat-accept routes,
 * and grants all 464 original-key starts and both directions per word.
 *
 * The input remains full original p0-p2 729 runes / 158 actual printed words;
 * this test grants each long word independent starts, so a failed lexical
 * preimage cannot be rescued by inter-word pointer continuity.
 */

const broadTexts=[...source,holdoutText,
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/gibran_prophet_58585.txt')];
const broadByLength=new Map();
for(const text of broadTexts)for(const m of text.matchAll(/\b[A-Za-z]+\b/g)){
  const w=encode(m[0]);if(!w.length||w.length>15)continue;
  if(!broadByLength.has(w.length)) broadByLength.set(w.length,new Map());
  broadByLength.get(w.length).set(w.join(','),w);
}
const lexsize=[...broadByLength.values()].reduce((s,x)=>s+x.size,0);
const MAXSKIPS=3;
/**
 * Forward source cipher under optional repeat rejection.
 * The deterministic planted control uses a documented skip decision, and
 * the inverse has no access to this control's skips.
 * @param {number[]} plain
 * @param {number} start
 * @param {number} dir
 * @param {number} previousC
 * @param {(i:number,j:number)=>boolean} reject
 */
function encryptRejection(plain,start,dir,previousC,reject){
  let cursor=start;
  const out=[];
  for(let i=0;i<plain.length;i++){
    const p=plain[i];
    if(p===0){out.push(0);previousC=0;continue;}
    let c=0;
    for(let skipped=0; ;skipped++){
      c=(p+KEY[cursor])%29;
      if(c===previousC && skipped<MAXSKIPS && reject(i,skipped)){
        cursor=mod(cursor+dir);
        continue;
      }
      cursor=mod(cursor+dir);
      break;
    }
    out.push(c);previousC=c;
  }
  return {out,cursor,previousC};
}
/**
 * Exact per-word reachability under any start/sign and any limited
 * repeat-rejection choices. The state set is the possible NEXT key phases.
 * @param {number[]} plain
 * @param {number[]} cipher
 * @param {number} start
 * @param {number} dir
 * @param {number} previousC
 * @returns {boolean}
 */
function reachable(plain,cipher,start,dir,previousC){
  let states=new Set([start]);
  for(let i=0;i<plain.length;i++){
    const p=plain[i],c=cipher[i],last=i?cipher[i-1]:previousC;
    const next=new Set();
    for(const pos of states){
      if(p===0){if(c===0) next.add(pos);continue;}
      let k=pos;
      for(let skipped=0;skipped<=MAXSKIPS;skipped++){
        const predicted=(p+KEY[k])%29;
        if(predicted===c) next.add(mod(k+dir));
        if(predicted!==last)break; // can skip only a rejected repeat
        k=mod(k+dir);
      }
    }
    if(!next.size)return false;
    states=next;
  }
  return true;
}
/**
 * Full lexical existential: all starts, both signs, all repeat-skip paths.
 * @param {number[]} cipher
 * @param {number} previousC
 */
function anyLexicalPreimage(cipher,previousC){
  const lex=broadByLength.get(cipher.length);
  if(!lex)return {hits:0,first:null};
  let count=0,first=null;
  for(const plain of lex.values()){
    let found=false;
    for(let start=0;start<N && !found;start++)
      for(const dir of [-1,1])if(reachable(plain,cipher,start,dir,previousC)){
        found=true;break;
      }
    if(found){count++;if(!first)first=spell(plain);}
  }
  return {hits:count,first};
}
const thresholds=[5,6,7,8,9];
const previous=[];let prior=-1;
for(const w of words){previous.push(prior);prior=w[w.length-1];}
const originals=[];
for(let i=0;i<words.length;i++){
  const cw=words[i];
  if(cw.length<5)continue;
  const result=anyLexicalPreimage(cw,previous[i]);
  originals.push({index:i,length:cw.length,...result});
}
const positives=[];
let cursor=73,dir=1,prev=-1;
for(let i=0;i<words.length;i++){
  const length=words[i].length;
  const list=holdoutByLength.get(length)||byLength.get(length);
  assert(list?.length);
  const p=list[(17*i+5)%list.length].w;
  const e=encryptRejection(p,cursor,dir,prev,(x,j)=>(i*7+x+j)%5!==0);
  cursor=e.cursor;prev=e.previousC;
  positives.push({cipher:e.out,plain:p});
  const sum=p.reduce((a,x)=>a+gp.prime[x],0);
  let prime=sum>1;for(let d=2;d*d<=sum;d++)if(sum%d===0){prime=false;break;}
  dir=prime?1:-1;
}
let last=-1;const controls=[];
for(let i=0;i<positives.length;i++){
  const p=positives[i];
  if(p.cipher.length>=5){
    const res=anyLexicalPreimage(p.cipher,last);
    assert(res.hits>0,'planted lexical candidate found, word '+i);
    controls.push({index:i,length:p.cipher.length,hits:res.hits});
  }
  last=p.cipher[p.cipher.length-1];
}
const summaries=thresholds.map(minimumLength=>({
  minimumLength,
  originalWords:originals.filter(z=>z.length>=minimumLength).length,
  originalAnyLexical:originals.filter(z=>z.length>=minimumLength&&z.hits>0).length,
  nativePlantWords:controls.filter(z=>z.length>=minimumLength).length,
  nativePlantAnyLexical:controls.filter(z=>z.length>=minimumLength&&z.hits>0).length
}));
const r56=gp.pages.find(p=>p.page===56).indices;
const solved='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const sourcep56=solved.split(' ').flatMap(encode);
assert.equal(sourcep56.length,85);
assert.deepEqual(encryptRejection(sourcep56,0,1,-1,()=>false).out,r56);
console.log('Original source 729 runes / 158 printed words, canonical held-out English native controls');
console.log('Authentic source p56 85/85 exact φ(prime) transparent-F no-rejection regression PASS');
console.log('F-transparent key rank 0..463 and ± direction per word; 0..3 rejected repeated-cipher proposals per rune');
console.log('All 464 starts each word, independent between words; lexicon '+lexsize+' distinct GP-native words');
console.log('Original independent lexical preimages: '+JSON.stringify(summaries));
console.log('Any original long-word preimages: '+JSON.stringify(originals.filter(x=>x.hits>0).slice(0,12)));
console.log('Native planted test requires true skip branches; all candidates accepted '+controls.length+'/'+controls.length);
console.log('PASS: exact full original per-word reachability; original decoding claimed only on coherent plaintext');
