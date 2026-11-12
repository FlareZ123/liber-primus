'use strict';
/**
 * Source-frozen Fehu interruption rule tested with authentic solved controls.
 * LP1 rune offsets 0..99 alone determine the candidate; LP1 holdout,
 * independent LP1 koan and LP2 page 56 are untouched until validation.
 * Run: node sims/lp1_fehu_word_shape_prospective_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (name) => fs.readFileSync(path.join(__dirname, '..', 'resources', name), 'utf8');
const corpus = JSON.parse(read('liber-primus/lp2-corpus.json'));
const lp1 = read('transcriptions/lp1_wulfic_canonical.txt');
const master = read('transcriptions/liber_primus_master.txt');
const reference = read('liber-primus/lp1-plaintext-reference.txt');
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = corpus.translit.map((token, value) => ({token, value})).sort((a,b) => b.token.length-a.token.length);

/**
 * Printed word breaks are '-' and '.'; '/' and newlines wrap a single word.
 * @param {string} text
 * @returns {Array<{c:number,pos:number,len:number,word:number}>}
 */
function flattenPrintedWords(text) {
  const words = text.split(/[-.&$§%]/)
    .map(part => [...part].filter(r => runeMap.has(r)).map(r => runeMap.get(r)))
    .filter(word => word.length);
  return words.flatMap((word, w) =>
    word.map((c, pos) => ({c, pos, len:word.length, word:w})));
}

/**
 * Freeze only from the first 100 solved LP1 positions:
 * literal F at last rune of a 2-rune word (OF);
 * literal F at first rune of a 3- or 4-rune word (FOR, FIND).
 * No tuning on any holdout is permitted.
 * @param {{c:number,pos:number,len:number}} symbol
 * @returns {boolean}
 */
function prospectiveSkip(symbol) {
  return symbol.c === 0 && (
    (symbol.pos === symbol.len - 1 && symbol.len === 2) ||
    (symbol.pos === 0 && (symbol.len === 3 || symbol.len === 4))
  );
}

/** @param {string} phrase @returns {number[]} */
function gp(phrase) {
  const out = [];
  for (let word of phrase.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll('V','U').replaceAll('K','C').replaceAll('ING','NG');
    for (let p=0; p<word.length;) {
      const t = tokens.find(x => word.startsWith(x.token,p));
      assert.ok(t, 'bad GP token: '+word.slice(p));
      out.push(t.value); p+=t.token.length;
    }
  }
  return out;
}

/** @param {number} count @returns {number[]} */
function primes(count) {
  const result=[];
  for(let n=2;result.length<count;n++) {
    let prime=true;
    for(let k=2;k*k<=n;k++)if(n%k===0){prime=false;break;}
    if(prime)result.push(n);
  }
  return result;
}

/**
 * @param {Array<{c:number,pos:number,len:number}>} ciphertext
 * @param {(s:{c:number,pos:number,len:number},i:number)=>boolean} skip
 * @param {(k:number)=>number} key
 * @returns {number[]}
 */
function decode(ciphertext,skip,key) {
  let k=0;
  return ciphertext.map((s,i) => {
    if (s.c===0 && skip(s,i)) return 0;
    const p=((s.c-key(k))%29+29)%29;
    k++;
    return p;
  });
}

/** @param {number[]} expected @param {number[]} actual */
function compare(expected,actual) {
  assert.equal(expected.length,actual.length);
  const firstMismatch=expected.findIndex((v,i)=>v!==actual[i]);
  const matches=expected.reduce((sum,v,i)=>sum+Number(v===actual[i]),0);
  return {matches, total:expected.length, firstMismatch};
}

/**
 * Both Fehu branches have valid GP29 symbols and an exact inverse.
 * A wrong, fully invertible skip assignment therefore still reencodes.
 * @param {Array<{c:number,pos:number,len:number}>} source
 * @param {number[]} plaintext
 * @param {(s:{c:number,pos:number,len:number},i:number)=>boolean} skip
 * @param {(k:number)=>number} key
 * @returns {number[]}
 */
function reencode(source, plaintext, skip, key) {
  let k=0;
  return plaintext.map((p,i)=>{
    if (skip(source[i],i)) {
      assert.equal(p,0);
      return 0;
    }
    const c=(p+key(k))%29;
    k++;
    return c;
  });
}

const divinity=flattenPrintedWords(lp1.split('%').slice(1,3).join('%'));
const lp1KnownSkips=new Set([48,74,84,132,159,160,250,421,443,465,514]);
const key=[23,10,1,10,9,10,16,26];
assert.equal(divinity.length,515);
const lp1Truth=gp(reference.split('### 3')[1].split('### 4')[0]
  .replaceAll('ILLUSIONS','ILLUSIANS')
  .replaceAll('WISDOM','WIDSOM')
  .replaceAll('INSTRUCTION','INSTRUCTIAN'));
assert.equal(lp1Truth.length,515);
const historicalSkip=(_,i)=>lp1KnownSkips.has(i);
assert.deepEqual(decode(divinity,historicalSkip,k=>key[k%8]),lp1Truth);
assert.deepEqual(reencode(divinity,lp1Truth,historicalSkip,k=>key[k%8]),divinity.map(s=>s.c));

const trainingF=divinity.flatMap((s,i)=>i<100&&s.c===0?[{i,expect:historicalSkip(s,i),predicted:prospectiveSkip(s)}]:[]);
assert.deepEqual(trainingF.map(x=>x.i),[5,14,47,48,74,84]);
assert.ok(trainingF.every(x=>x.expect===x.predicted));
const lp1PredictedSkip=divinity.flatMap((s,i)=>s.c===0&&prospectiveSkip(s)?[i]:[]);
const lp1Prediction=decode(divinity,prospectiveSkip,k=>key[k%8]);
const lp1Eval=compare(lp1Truth,lp1Prediction);
assert.deepEqual(lp1Prediction.slice(0,100),lp1Truth.slice(0,100));
assert.equal(lp1Eval.firstMismatch,159);
assert.equal(lp1Eval.matches,188);
assert.deepEqual(reencode(divinity,lp1Prediction,prospectiveSkip,k=>key[k%8]),divinity.map(s=>s.c));
const holdoutFs=divinity.flatMap((s,i)=>i>=100&&s.c===0?[{i,expect:historicalSkip(s,i),predicted:prospectiveSkip(s)}]:[]);
assert.equal(holdoutFs.filter(x=>x.expect===x.predicted).length,13);
assert.equal(holdoutFs.length,19);

// Independently solved second LP1 koan, with a different 13-rune key.
const koan=flattenPrintedWords(lp1.split('$')[5]).slice(0,110);
assert.equal(koan.length,110);
const koanKey=[0,10,4,0,1,19,0,18,4,18,9,0,18];
const koanSkips=new Set([49,58]);
const koanF=koan.flatMap((s,i)=>s.c===0?[{i,expect:koanSkips.has(i),predicted:prospectiveSkip(s)}]:[]);
assert.deepEqual(koanF.map(x=>x.i),[10,49,58]);
assert.equal(koanF.filter(x=>x.expect===x.predicted).length,2);

// Unused at inference time: independent 2014 LP2 page 56 solved control.
const lp2=master.slice(master.indexOf('ᛋᚻᛖᚩᚷᛗᛡᚠ')).split('%');
const p56=flattenPrintedWords(lp2[56]);
assert.equal(p56.length,85);
assert.deepEqual(p56.map(s=>s.c),corpus.pages.find(x=>x.page===56).indices);
const p56Words='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const p56Truth=gp(p56Words);
const p56KnownSkips=new Set([56]);
const primeList=primes(90);
const phi=k=>primeList[k]-1;
assert.deepEqual(decode(p56,(_,i)=>p56KnownSkips.has(i),phi),p56Truth);
const p56Fs=p56.flatMap((s,i)=>s.c===0?[{i,wordPos:s.pos,wordLength:s.len,
  actual:p56KnownSkips.has(i),predicted:prospectiveSkip(s)}]:[]);
assert.deepEqual(p56Fs.map(x=>x.i),[35,47,51,56,74]);
assert.equal(p56Fs.filter(x=>x.actual===x.predicted).length,4);
const p56Prediction=decode(p56,prospectiveSkip,phi);
const p56Eval=compare(p56Truth,p56Prediction);
assert.deepEqual(p56Eval,{matches:52,total:85,firstMismatch:51});
assert.deepEqual(reencode(p56,p56Prediction,prospectiveSkip,phi),p56.map(s=>s.c));

if(require.main===module)console.log(JSON.stringify({
  hypothesis:'LP1-first-100 word-shape Fehu interrupt selector',
  LP1_train_F:trainingF,
  LP1_holdout_F_correct:13,
  LP1_holdout_F_total:19,
  LP1_holdout_first_error:159,
  LP1_holdout_error_word:'SUFFERING double-F interior',
  LP1_allRunes:lp1Eval,
  LP1_secondKoan_F:koanF,
  LP2_p56_F:p56Fs,
  LP2_p56_allRunes:p56Eval,
  both_wrongMasks_still_exactly_reencrypt:true,
  verdict:'REJECTED as a cross-cipher F selector'
},null,2));
module.exports={flattenPrintedWords,prospectiveSkip,decode,reencode};
