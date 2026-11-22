'use strict';

/**
 * Original-source 9x28 quotient/chain-key test.
 *
 * The 256 printed source bytes are divided over GF(29) by the product of
 * signed-2013 BASE29 3301 (3QO) and p39's red three-rune polynomial.
 * The full 252-slot quotient admits nine ordered 28-slot key registers.
 *
 * Test their literal mod-28 pad on a lossless preceding-ciphertext exclusion
 * cipher, then remove the entire unknown chapter/phase-dependent secret
 * permutation using a same-phase equality invariant. The 86 actual adjacent
 * doublets are explicit erasures, never silently converted into fake data.
 */
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const base = path.join(root, 'resources', 'liber-primus');
const grid = JSON.parse(readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
const corpus = JSON.parse(readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const visualChapters = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const modulus = 29;
const signedBase29 = [3,26,24];
const redP39 = [27,5,15];

/** @param {number} x @returns {number} */
function mod29(x) { return ((x % modulus) + modulus) % modulus; }

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function multiply(left, right) {
  const out = Array(left.length+right.length-1).fill(0);
  for(let i=0;i<left.length;i++)for(let j=0;j<right.length;j++)
    out[i+j]=mod29(out[i+j]+left[i]*right[j]);
  return out;
}

/**
 * Divide descending coefficient vector, retain every leading coefficient slot.
 * @param {number[]} descending
 * @param {number[]} divisorAscending
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(descending,divisorAscending) {
  const coefficients=descending.map(mod29);
  const divisor=divisorAscending.slice().reverse().map(mod29);
  const leadingInverse=17; // (12*17) % 29 === 1 for this source quadratic product
  assert.equal(mod29(leadingInverse*divisor[0]),1);
  const quotient=[];
  for(let i=0;i<=coefficients.length-divisor.length;i++){
    const q=mod29(coefficients[i]*leadingInverse);
    quotient.push(q);
    for(let j=0;j<divisor.length;j++)
      coefficients[i+j]=mod29(coefficients[i+j]-q*divisor[j]);
  }
  return {quotient,remainder:coefficients.slice(-(divisor.length-1))};
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
  const counts=Array(29).fill(0);
  for(const symbol of symbols){assert.ok(Number.isInteger(symbol)&&symbol>=0&&symbol<29);counts[symbol]++;}
  return counts.reduce((sum,c)=>sum+c*(c-1),0)/(symbols.length*(symbols.length-1));
}

/**
 * @param {number[][]} chapters
 * @param {number[]} key 9*28 original quotient residues
 * @param {'sorted'|'cyclic'} mode
 */
function inverse(chapters,key,mode) {
  const plaintext=[],hist=Array.from({length:9},()=>Array.from({length:28},()=>Array(28).fill(0)));
  let repeats=0;
  for(let section=0;section<chapters.length;section++){
    const input=chapters[section];
    plaintext.push(input[0]); // source-visible start, unconstrained by the cipher
    for(let position=1;position<input.length;position++){
      const c=input[position],prev=input[position-1],phase=(position-1)%28;
      if(c===prev){
        plaintext.push(28); // declared EA escape, counted as original erasure
        repeats++;
        continue;
      }
      const rank=mode==='sorted' ? c-Number(c>prev) : mod29(c-prev)-1;
      assert.ok(rank>=0&&rank<28);
      hist[section][phase][rank]++;
      plaintext.push(((rank-key[section*28+phase])%28+28)%28);
    }
  }
  let same=0,pairs=0,eligible=0;
  for(const section of hist)for(const row of section){
    const n=row.reduce((a,b)=>a+b,0);
    eligible+=n;pairs+=n*(n-1);
    same+=row.reduce((a,c)=>a+c*(c-1),0);
  }
  return {plaintext,repeats,eligible,same,pairs,phaseIoC:same/pairs,decodedIoC:ioc(plaintext)};
}

const alphabet60='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(grid.alphabet,alphabet60);
assert.equal(grid.rows.length,32);
assert.ok(grid.rows.every(row=>row.length===8));
const bytes=grid.rows.flat().map(token=>{
  const high=alphabet60.indexOf(token[0]),low=alphabet60.indexOf(token[1]);
  assert.equal(token.length,2);
  assert.ok(high>=0&&low>=0);
  return 60*high+low;
});
assert.deepEqual(bytes,grid.byte_rows.flat());
assert.equal(createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const factor=multiply(signedBase29,redP39);
assert.deepEqual(factor,[23,21,11,17,12]);
const {quotient,remainder}=divide(bytes,factor);
assert.equal(quotient.length,252);
assert.deepEqual(remainder,[0,0,0,0]);
assert.deepEqual(quotient.slice(0,10),[0,12,9,28,2,25,23,21,18,28]);

const chapters=visualChapters.map(([first,last])=>corpus.pages
  .filter(pg=>pg.page>=first&&pg.page<=last).flatMap(pg=>pg.indices));
assert.deepEqual(chapters.map(c=>c.length),[729,1145,1729,1903,1021,1433,1680,3008,308]);
assert.equal(chapters.reduce((total,c)=>total+c.length,0),12956);
const key=quotient.map(x=>x%28);
const keyDistinct=Array.from({length:9},(_,j)=>new Set(quotient.slice(j*28,j*28+28)).size);
assert.deepEqual(keyDistinct,[16,19,21,16,19,16,18,17,22]);

/** Original native-English GP28 control, matched to published precedent. */
function englishSource(count) {
  const prose=readFileSync(path.join(root,'resources','control','shakespeare_first300k.txt'),'utf8');
  const words=prose.toUpperCase().match(/[A-Z]+/g);
  assert.ok(words);
  const digraph={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:27};
  const letter={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,
    M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
  const result=[];
  for(const word of words){
    for(let i=0;i<word.length;i++){
      const d=digraph[word.slice(i,i+2)];
      if(d!==undefined){result.push(d);i++;}else result.push(letter[word[i]]);
    }
    if(result.length>=count)break;
  }
  assert.ok(result.length>=count);
  return result.slice(0,count);
}

/**
 * Inject original same-rune markers into a fully invertible artificial GP28
 * text cipher with exactly the source-driven nine 28-symbol key periods.
 */
function plantPlaintext(real,source,key,mode){
  const out=[];
  let pointer=0;
  for(let section=0;section<real.length;section++){
    const actual=real[section],plaintext=source.slice(pointer,pointer+actual.length);
    const encrypted=[plaintext[0]];
    for(let i=1;i<actual.length;i++){
      const phase=(i-1)%28;
      const rank=(plaintext[i]+key[section*28+phase])%28;
      if(actual[i]===actual[i-1])encrypted.push(encrypted[i-1]);
      else if(mode==='sorted')encrypted.push(rank<encrypted[i-1]?rank:rank+1);
      else encrypted.push((encrypted[i-1]+rank+1)%29);
    }
    out.push(encrypted);
    pointer+=actual.length;
  }
  assert.equal(pointer,source.length);
  return out;
}
const control=englishSource(12956);
const result=[];
for(const mode of ['sorted','cyclic']){
  const original=inverse(chapters,key,mode);
  assert.equal(original.repeats,86);
  assert.equal(original.eligible,12861);
  assert.ok(original.phaseIoC<0.037,'original remains uniform by key-invariant');
  const planted=plantPlaintext(chapters,control,key,mode);
  const plantedOutcome=inverse(planted,key,mode);
  const matches=plantedOutcome.plaintext.filter((symbol,i)=>symbol===control[i]).length;
  assert.equal(plantedOutcome.repeats,86);
  assert.equal(matches,12956-86,'source-native plant must invert exactly off erasures');
  assert.ok(plantedOutcome.phaseIoC>0.055,'correct-key native plaintext must be detectable');
  assert.ok(plantedOutcome.decodedIoC>0.055);
  result.push({
    rankConvention:mode,
    sourceInvariants:{eligible:original.eligible,phaseEqualPairs:original.same,
      possiblePairs:original.pairs,phaseIoC:original.phaseIoC},
    literalQuotientKeyOutputIoC:original.decodedIoC,
    literalQuotientKeyTextPrefix:original.plaintext.slice(0,100)
      .map(index=>corpus.translit[index]).join(''),
    nativePlant:{phaseIoC:plantedOutcome.phaseIoC,recovered:matches,
      unobservedErasures:86},
  });
}
console.log(JSON.stringify({
  source:'original LP2 pp49-51 plus nine visual chapters of pp0-55',
  originalByteSHA256:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290',
  divisorAscending:factor,
  quotientSlots:quotient.length,
  nine28BlockDistinctValues:keyDistinct,
  noBlockIsAPermutation:true,
  sourceChapterLengths:chapters.map(c=>c.length),
  completeInverseModels:result,
  scope:'one frozen 9x28 mod28 pad and all unknown period28 chapter/phase bijections',
  outcome:'negative, no authentic plaintext or original key recovered',
},null,2));
