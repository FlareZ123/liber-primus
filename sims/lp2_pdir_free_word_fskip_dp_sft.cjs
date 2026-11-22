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
 * True forward p56 cipher with plaintext-F bypass and no key consumption.
 * At each word the pointer sign is freely chosen; this optimistically
 * grants all key-start positions and all +/- directions.
 * @param {number[]} plaintext
 * @param {number} start
 * @param {number} dir
 * @returns {{cipher:number[],next:number}}
 */
function encrypt(plaintext,start,dir) {
  let pos=start; const cipher=[];
  for(const p of plaintext){
    if(p===0) cipher.push(0);
    else {cipher.push((p+KEY[pos])%29); pos=mod(pos+dir);}
  }
  return {cipher,next:pos};
}
/**
 * Enumerate all inverse branches: a cipher-0 could be passthrough F,
 * or a shifted non-F whose modular image is zero.
 * A nonzero cipher symbol cannot result from plaintext F.
 * @param {number[]} cipher
 * @param {number} start
 * @param {number} dir
 * @param {(plain:number[],next:number)=>void} emit
 */
function enumerate(cipher,start,dir,emit){
  const word=[];
  /** @param {number} i @param {number} pos */
  function walk(i,pos){
    if(i===cipher.length){emit(word,pos);return;}
    const c=cipher[i];
    if(c===0){word.push(0);walk(i+1,pos);word.pop();}
    const p=(c-KEY[pos]+29)%29;
    if(p!==0){word.push(p);walk(i+1,mod(pos+dir));word.pop();}
  }
  walk(0,start);
}
/**
 * Exact max-product over 464 pointer states and 2 signs per word.
 * Every potentially ambiguous F/0 position is exhaustively explored.
 * @param {number[][]} cipherWords
 * @returns {{average:number,plaintext:number[][],states:{start:number,dir:number}[],seed:number,covered:number}}
 */
function viterbi(cipherWords){
  let dp=new Float64Array(N);
  const trace=[];
  for(let t=0;t<cipherWords.length;t++){
    const cw=cipherWords[t];
    const next=new Float64Array(N).fill(-Infinity);
    const prev=new Int16Array(N).fill(-1);
    const sign=new Int8Array(N);
    const choice=new Array(N);
    for(let i=0;i<N;i++)if(Number.isFinite(dp[i])){
      for(const d of [-1,1]){
        enumerate(cw,i,d,(plain,pos)=>{
          const candidate=dp[i]+languageScore(plain);
          if(candidate>next[pos]){
            next[pos]=candidate;
            prev[pos]=i;
            sign[pos]=d;
            choice[pos]=plain.slice();
          }
        });
      }
    }
    if(!next.some(Number.isFinite))return {
      average:-Infinity,plaintext:[],states:[],seed:-1,covered:t
    };
    trace.push({prev,sign,choice});
    dp=next;
  }
  let end=0;for(let i=1;i<N;i++)if(dp[i]>dp[end])end=i;
  const avg=dp[end]/cipherWords.flat().length;
  const plaintext=Array.from({length:cipherWords.length},()=>[]);
  const states=Array.from({length:cipherWords.length},()=>({start:0,dir:1}));
  for(let t=cipherWords.length-1;t>=0;t--){
    const record=trace[t],start=record.prev[end],dir=record.sign[end];
    assert(start>=0 && (dir===1||dir===-1));
    plaintext[t]=record.choice[end];
    states[t]={start,dir};
    const enc=encrypt(plaintext[t],start,dir);
    assert.deepEqual(enc.cipher,cipherWords[t]);
    assert.equal(enc.next,end);
    end=start;
  }
  for(let i=1;i<states.length;i++)
    assert.equal(states[i].start,encrypt(plaintext[i-1],states[i-1].start,states[i-1].dir).next);
  return {average:avg,plaintext,states,seed:end,covered:cipherWords.length};
}
// Independently verify the exact previously solved p56 cipher and literal-F
// bypass, before making an unknown-page claim.
const knownP56='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const solvedWords=knownP56.split(' ').map(encode);
assert.equal(solvedWords.flat().length,85);
let cursor=0;const p56C=[];
for(const word of solvedWords){
  const e=encrypt(word,cursor,1);p56C.push(...e.cipher);cursor=e.next;
}
assert.deepEqual(p56C,gp.pages.find(x=>x.page===56).indices,
  'source p56 exact 85-rune F-transparent cipher regression');

/** @param {number[]} lengths @param {Map<number,{w:number[],frequency:number}[]>} selection */
function plant(lengths,selection){
  let pos=73,dir=1;const cipher=[],plain=[];
  for(let i=0;i<lengths.length;i++){
    const list=selection.get(lengths[i])||byLength.get(lengths[i]);
    assert(list?.length>0,'native source matched length '+lengths[i]);
    const chosen=list[(17*i+5)%list.length].w;
    plain.push(chosen);
    const result=encrypt(chosen,pos,dir);
    cipher.push(result.cipher);pos=result.next;
    const sum=chosen.reduce((a,p)=>a+gp.prime[p],0);
    let prime=sum>1;
    for(let d=2;d*d<=sum;d++)if(sum%d===0){prime=false;break;}
    dir=prime?1:-1;
  }
  return {cipher,plain};
}
/** @param {number[][]} a @param {number[][]} b */
const exactWordHits=(a,b)=>a.reduce((n,w,i)=>n+Number(w.join(',')===b[i].join(',')),0);
/** @param {number[][]} a */
const doublets=a=>a.flat().slice(1).reduce((n,x,i)=>n+Number(x===a.flat()[i]),0);
const inSample=plant(words.map(w=>w.length),byLength);
const outOfSample=plant(words.map(w=>w.length),holdoutByLength);
const a=viterbi(inSample.cipher);
const b=viterbi(outOfSample.cipher);
const result=viterbi(words);
// Stronger optimistic lexical necessary screen. Each original word gets an
// independently chosen 464-state start, sign and all F-skip branch choices.
// It therefore cannot miss a globally consistent phrase solely because of
// the word-to-word pointer continuity constraints imposed by Viterbi.
const lexicalSources=[
  ...source,holdoutText,
  read('resources/control/shakespeare_first300k.txt'),
  read('resources/control/gibran_prophet_58585.txt')
];
const lexicon=new Set();
for(const text of lexicalSources)for(const hit of text.matchAll(/\b[A-Za-z]+\b/g)){
  const w=encode(hit[0]);
  if(w.length>0&&w.length<=15) lexicon.add(w.join(','));
}
/** @param {number[]} word */
function anyLexicalPreimage(word){
  for(let start=0;start<N;start++)for(const dir of [-1,1]){
    let matched=false;
    enumerate(word,start,dir,(plain)=>{
      if(lexicon.has(plain.join(',')))matched=true;
    });
    if(matched)return true;
  }
  return false;
}
const thresholds=[5,6,7,8,9];
const lexStats=thresholds.map(threshold=>{
  const originalLong=words.filter(w=>w.length>=threshold);
  const positiveLong=outOfSample.plain.filter(w=>w.length>=threshold);
  return {
    minimumLength:threshold,
    originalWords:originalLong.length,
    originalAnyLexical:originalLong.filter(anyLexicalPreimage).length,
    positiveWords:positiveLong.length,
    positiveAuthentic:positiveLong.filter(w=>lexicon.has(w.join(','))).length
  };
});

console.log('Original 729-runic opening, '+words.length+' authentic words; phi(prime) p56 F-transparent key');
console.log('Full all-key start phases='+N+', all +/- word directions, all zero/F inverse branches');
console.log('Authentic solved p56 exact ciphertext forward regression: 85/85 PASS');
console.log('Native reference dictionary '+dictionary.size+' distinct words; independent broad lexicon='+lexicon.size);
console.log('Optimistic independent word-all-phase lexical necessity: '+JSON.stringify(lexStats));
console.log('Original adjacent doublets='+doublets(words)+
  ', in-sample plant='+doublets(inSample.cipher)+
  ', external heldout plant='+doublets(outOfSample.cipher));
console.log('In-sample encrypted native control: '+a.covered+
  ' words, score '+a.average.toFixed(6)+
  ', exact recovered '+exactWordHits(a.plaintext,inSample.plain)+'/'+words.length);
console.log('Held-out BookIII encrypted native control: '+b.covered+
  ' words, score '+b.average.toFixed(6)+
  ', exact recovered '+exactWordHits(b.plaintext,outOfSample.plain)+'/'+words.length);
console.log('Original unknown: '+result.covered+'/'+words.length+
  ' words reachable, score '+result.average.toFixed(6)+
  ', native dictionary matches '+result.plaintext.filter(w=>dictionary.has(w.join(','))).length+'/'+words.length);
console.log('Original first 70 words: '+result.plaintext.slice(0,70).map(spell).join(' '));
assert.equal(a.covered,words.length);
assert.equal(b.covered,words.length);
assert.equal(result.covered,words.length);
console.log('SFT complete PASS. No unknown plaintext asserted.');
