'use strict';

// Original LP2 p22 versus exact 2012 P.S. decimal digits as a 10-class GP29 pad.
// A local contradiction is sufficient to exclude every possible secret digit->shift map.
// Node 22, CommonJS. Lexicon path: TextBlob's en/en-spelling.txt.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PS = '10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631';
const LEX_SHA256 = 'eade91558167fe09a481abf59e176af8643ad78678cc53dd5aeaf2a8b30fa332';
const WORD_LENGTHS = [2,2,2,6,2,6,7,4,2,2,12,7,11,4,3,12,3,3,4,5,4,4,3,7,5,3,3,3];
const EXPECTED_COUNTS = [184,184,184,217,184,3,0,124,184,184,0,0,0,2114,747,0,747,25,2114,95,53,2114,747,0,112,747,747,747];
const NATIVE = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const RUNE = /[ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ]/gu;
const RAW_GP = /ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g;
const ALIASES = new Map([['ING','NG']]);
const NATIVE_IDS = new Map(NATIVE.map((v, i) => [v, i]));

/** @param {string} latin @returns {number[]} Deterministic native GP spelling. */
function nativeSymbols(latin) {
  const normalized = latin.toUpperCase().replace(/K/g,'C').replace(/V/g,'U')
    .replace(/Z/g,'S').replace(/Q/g,'CW');
  const symbols = normalized.match(RAW_GP) || [];
  return symbols.map(s => {
    const key = ALIASES.get(s) || s;
    const id = NATIVE_IDS.get(key);
    assert.notEqual(id, undefined, 'Unknown native rune ' + key);
    return id;
  });
}

/** @param {string} transcription @param {object} corpus @returns {number[][]} */
function sourceWords(transcription, corpus) {
  const pages = transcription.split(/(?:\r?\n)?%\s*(?:\r?\n)?/);
  assert.equal(pages.length, 57);
  const words = pages[22].replace(/\/\s*/g, '')
    .split(/[-.&$§!?:() \t\n]+/u).filter(w => (w.match(RUNE) || []).length);
  const map = new Map(corpus.runes.map((r,i)=>[r,i]));
  const native = words.map(w => (w.match(RUNE) || []).map(g => map.get(g)));
  assert.deepEqual(native.map(w=>w.length), WORD_LENGTHS);
  const original = corpus.pages.find(p=>p.page===22).indices;
  assert.deepEqual(native.flat(), original);
  assert.equal(original.length, PS.length);
  return native;
}

/** @param {Buffer} source @returns {Map<number,{tokens:number[],frequency:number}[]>} */
function lexicon(source) {
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), LEX_SHA256);
  const merged = new Map();
  for(const ln of source.toString('utf8').split(/\r?\n/)) {
    const m = /^([a-z]+) (\d+)$/.exec(ln);
    if (!m) continue;
    const tokens = nativeSymbols(m[1]);
    const key = tokens.join(',');
    const prev = merged.get(key);
    if (prev) prev.frequency += Number(m[2]);
    else merged.set(key, {tokens, frequency:Number(m[2])});
  }
  assert.equal(merged.size, 29062);
  const byLen = new Map();
  for(const v of merged.values()) {
    const entries = byLen.get(v.tokens.length) || [];
    entries.push(v);
    byLen.set(v.tokens.length, entries);
  }
  return byLen;
}

/**
 * A candidate native word can be decoded from one ciphertext word if all
 * repeated decimal digits require the same secret GP29 shift.
 * @param {number[]} cipher @param {number[]} decimal @param {number[]} plain
 * @returns {boolean}
 */
function locallyFits(cipher, decimal, plain) {
  assert.equal(cipher.length, decimal.length);
  assert.equal(plain.length, decimal.length);
  const key = new Map();
  for(let i=0;i<cipher.length;i+=1){
    const desired=(cipher[i]-plain[i]+29)%29, digit=decimal[i];
    if(key.has(digit) && key.get(digit)!==desired)return false;
    key.set(digit,desired);
  }
  return true;
}

/**
 * @param {number[][]} words @param {Map<number,{tokens:number[],frequency:number}[]>} source
 * @returns {number[]} Candidate counts per word.
 */
function candidateCounts(words,source,digitStream=PS){
  const digits=[...digitStream].map(Number);
  assert.equal(digits.length,131);
  let offset=0;
  const all=[];
  for(const word of words) {
    const segment=digits.slice(offset,offset+word.length);
    const candidates=source.get(word.length) || [];
    all.push(candidates.filter(x=>locallyFits(word,segment,x.tokens)).length);
    offset+=word.length;
  }
  assert.equal(offset,131);
  return all;
}


/** @returns {Record<string,string>} Fixed original three-line readings/rotations. */
function sourceOrientations() {
  const rows=[PS.slice(0,40),PS.slice(40,85),PS.slice(85)];
  const readColumn=(r)=>Array.from({length:46},(_,i)=>r.map(x=>x[i]||'').join('')).join('');
  const top=readColumn(rows),bottom=readColumn([...rows].reverse());
  return {
    original:PS,
    reversed:[...PS].reverse().join(''),
    rowreverse:rows.map(x=>[...x].reverse().join('')).join(''),
    rowsup:[...rows].reverse().join(''),
    coltop:top,
    colbottom:bottom,
    coltop_reversed:[...top].reverse().join(''),
    colbottom_reversed:[...bottom].reverse().join(''),
  };
}

/** @param {string} lexiconPath @returns {object} */
function run(lexiconPath) {
  const resources=path.join(__dirname,'..','resources','liber-primus');
  const corpus=JSON.parse(fs.readFileSync(path.join(resources,'lp2-corpus.json'),'utf8'));
  const trans=fs.readFileSync(path.join(resources,'lp2-transcription.txt'),'utf8');
  const original=sourceWords(trans,corpus);
  const vocab=lexicon(fs.readFileSync(lexiconPath));
  const counts=candidateCounts(original,vocab);
  assert.deepEqual(counts,EXPECTED_COUNTS,'original local candidate counts changed');
  const incompatible=counts.map((n,i)=>n?null:i).filter(x=>x!==null);
  assert.deepEqual(incompatible,[6,10,11,12,15,23]);

  // The original 2012 hint explicitly mentions a 90-degree rotation of
  // its ragged three-line matrix: test both column readout orientations.
  const expectedOrientationZeros = {
    original:[6,10,11,12,15,23],
    reversed:[10,12,15,23],
    rowreverse:[6,10,12,15],
    rowsup:[10,12,15,23],
    coltop:[10,12,15],
    colbottom:[10,12,15],
    coltop_reversed:[10,11,15],
    colbottom_reversed:[10,12,15],
  };
  const orientationZeros = {};
  for (const [reading, stream] of Object.entries(sourceOrientations())) {
    const local = candidateCounts(original,vocab,stream);
    const zeroIndices=local.map((v,i)=>v?null:i).filter(x=>x!==null);
    assert.deepEqual(zeroIndices,expectedOrientationZeros[reading],reading);
    orientationZeros[reading]=zeroIndices;
  }

  // Reversible native-GP positive plant: same source digits, same word shapes,
  // one arbitrary 29-valued key per decimal class, exact 131/131 recovery.
  const secret=[12,5,11,10,22,2,24,18,4,20];
  const native=original.map((w,j)=>{
    const options=vocab.get(w.length);
    return options[(j*17)%options.length].tokens;
  });
  const digits=[...PS].map(Number),plain=native.flat();
  const cipher=plain.map((p,i)=>(p+secret[digits[i]])%29);
  const recovered=cipher.map((c,i)=>(c-secret[digits[i]]+29)%29);
  assert.deepEqual(recovered,plain);
  const cipherWords=[];let offset=0;
  for(const word of native) {
    cipherWords.push(cipher.slice(offset,offset+word.length));
    offset+=word.length;
  }
  const positiveCounts=candidateCounts(cipherWords,vocab);
  assert(positiveCounts.every(x=>x>0),'native plant had an incompatible word');

  return { classification:'ALL FIXED DIGIT-CLASS GP29 ADDITIVE MAPS EXCLUDED FOR THIS NATIVE LEXICON',
    originalPage:22, runeCount:131, originalWords:28, archiveDecimalDigits:PS.length,
    lexiconNativeWordTypes:29062, originalCandidates:counts,
    incompatibleWordIndices:incompatible,
    orientationIncompatibleWordIndices:orientationZeros,
    originalIncompatibleWords:incompatible.map(i=>({wordIndex:i, length:original[i].length})),
    positivePlant:{recoveredRuneCount:recovered.length, exactRuneCount:131,
      eligibleWords:positiveCounts.filter(x=>x>0).length} };
}
if(require.main===module){
  const source=process.argv[2];
  assert(source,'usage: node sims/lp2_2012_psdigit_class_original_sft.cjs path/to/en-spelling.txt');
  console.log(JSON.stringify(run(source),null,2));
}
module.exports={PS,WORD_LENGTHS,sourceWords,nativeSymbols,lexicon,locallyFits,candidateCounts,sourceOrientations,run};
