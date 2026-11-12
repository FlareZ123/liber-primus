'use strict';

/**
 * Frozen authentic 2013 DATA/560.13 original-byte source pad as a GP28
 * previous-ciphertext-exclusion inverse on LP2 p15 upper-title suffix.
 *
 * Node 22; node sims/lp2_p15_56013_rank28_original_sft.cjs path\to\DATA_560.13
 * The source address is exact: nine original red GP29 digits / 3301,
 * quotient 8,952,964 (byte offset) and remainder 560 (DATA family).
 * The spiral includes exactly 13 among original file suffixes 0/13/17.
 * The historical 2013 source itself used XOR with DATA/560.13 byte offsets.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname,'..');
const book=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const heading=book.pages[15].indices.slice(0,9);
assert.deepEqual(heading,[0,1,20,19,24,28,26,22,24]);
const asInteger=heading.reduce((acc,digit)=>acc*29n+BigInt(digit),0n);
assert.equal(asInteger,29553734724n);
const offset=Number(asInteger/3301n);
assert.equal(offset,8952964);
assert.equal(asInteger%3301n,560n);
const specialPrimeOffsets=[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817];
assert.deepEqual([0,13,17].filter(n=>specialPrimeOffsets.includes(n)),[13]);
const original=book.pages.filter(page=>page.page>=15&&page.page<=22)
  .flatMap(page=>page.page===15?page.indices.slice(9):page.indices);
assert.equal(original.length,1894);
const file=process.argv[2];
assert.ok(file,'The original 118,818,811-byte DATA/560.13 is required');
const raw=fs.readFileSync(file);
assert.equal(raw.length,118818811);
const sha256=crypto.createHash('sha256').update(raw).digest('hex');
assert.equal(sha256,'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f');
const bytes=raw.subarray(offset,offset+original.length);
assert.equal(bytes.length,original.length);

/** @param {number[]} symbols @returns {number} GP28 coincidence */
function ioc28(symbols){
  const counts=Array(28).fill(0);
  for(const symbol of symbols){assert.ok(symbol>=0&&symbol<28);counts[symbol]++;}
  return counts.reduce((sum,n)=>sum+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} text @param {'sorted'|'cyclic'} encoder */
function ranks(text,encoder){
  const out=[],exceptionIndices=[];
  for(let i=1;i<text.length;i++){
    if(text[i]===text[i-1]){exceptionIndices.push(i);continue;}
    const rank=encoder==='sorted'
      ?text[i]-Number(text[i]>text[i-1])
      :(text[i]-text[i-1]+29)%29-1;
    assert.ok(rank>=0&&rank<28);
    out.push(rank);
  }
  return {out,exceptionIndices};
}
/** @param {number} byte @param {'mod28'|'scaled28'} mode @returns {number} */
function key28(byte,mode){return mode==='mod28'?byte%28:Math.floor(byte*28/256);}
const nativeShakespeare=fs.readFileSync(path.join(root,'resources','control','shakespeare_first300k.txt'),'utf8');
const digraph={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:27};
const letter={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,
  M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const english=[];
for(const word of nativeShakespeare.toUpperCase().match(/[A-Z]+/g)||[]){
  for(let j=0;j<word.length;j++){
    const dig=digraph[word.slice(j,j+2)];
    if(dig!==undefined){english.push(dig);j++;}else english.push(letter[word[j]]);
  }
  if(english.length>=original.length)break;
}
assert.ok(english.length>=original.length);
const truth=english.slice(0,original.length);
/**
 * @param {number[]} plain
 * @param {number[]} trueSource
 * @param {'sorted'|'cyclic'} encoder
 * @param {number[]} key
 * @param {number} sign
 */
function plant(plain,trueSource,encoder,key,sign){
  const out=[plain[0]];
  for(let i=1;i<plain.length;i++){
    if(trueSource[i]===trueSource[i-1]){out.push(out[i-1]);continue;}
    const rank=((plain[i]+sign*key[i])%28+28)%28;
    const c=encoder==='sorted'
      ?rank<out[i-1]?rank:rank+1
      :(out[i-1]+rank+1)%29;
    out.push(c);
  }
  return out;
}
const expectedDoublets=ranks(original,'sorted').exceptionIndices;
const items=[];
for(const encoder of ['sorted','cyclic']){
  const sourceRanks=ranks(original,encoder);
  assert.deepEqual(sourceRanks.exceptionIndices,expectedDoublets);
  for(const projection of ['mod28','scaled28']){
    const key=Array.from(bytes,byte=>key28(byte,projection));
    assert.ok(key.every(value=>value>=0&&value<28));
    for(const sign of [-1,1]){
      const candidate=sourceRanks.out.map((rank,k)=>{
        const originalPosition=k+1+sourceRanks.exceptionIndices.filter(i=>i<=k+1).length;
        return ((rank-sign*key[originalPosition])%28+28)%28;
      });
      // Reconstruct explicitly via valid physical positions for a second check.
      const exact=[];
      for(let i=1;i<original.length;i++){
        if(original[i]===original[i-1])continue;
        const r=encoder==='sorted'
          ?original[i]-Number(original[i]>original[i-1])
          :(original[i]-original[i-1]+29)%29-1;
        exact.push(((r-sign*key[i])%28+28)%28);
      }
      assert.equal(exact.length,original.length-1-expectedDoublets.length);
      assert.deepEqual(exact,candidate);
      const synthetic=plant(truth,original,encoder,key,sign);
      const native=[];
      for(let i=1;i<synthetic.length;i++){
        if(synthetic[i]===synthetic[i-1])continue;
        const rr=encoder==='sorted'
          ?synthetic[i]-Number(synthetic[i]>synthetic[i-1])
          :(synthetic[i]-synthetic[i-1]+29)%29-1;
        native.push(((rr-sign*key[i])%28+28)%28);
      }
      const originalValidTruth=truth.slice(1).filter((_,j)=>original[j+1]!==original[j]);
      assert.deepEqual(native,originalValidTruth);
      const result={
        encoder,projection,sign,
        valid:exact.length,observedDoublets:expectedDoublets.length,
        originalIoC:ioc28(exact),nativeControlIoC:ioc28(native),
        nativeRecovered:native.length,expectedNativeRecovered:originalValidTruth.length,
        originalPrefix:exact.slice(0,45).map(i=>book.translit[i]).join(''),
      };
      assert.ok(result.nativeControlIoC>0.055);
      items.push(result);
    }
  }
}
assert.equal(items.length,8);
const maxOriginalIoC=Math.max(...items.map(r=>r.originalIoC));
console.log(JSON.stringify({
  sourceSha256:sha256,offset,dataset:'DATA/560.13',plaintextTarget:'p15:9 through p22:end',
  totalSourceRunes:original.length,originDoublets:expectedDoublets.length,
  originalRankIoC:ioc28(ranks(original,'sorted').out),
  maxSourceInverseIoC:maxOriginalIoC,
  candidates:items,
  conclusion:'Complete eight-model 2013 source-pad rank28 inverse; independent native controls recover every unmasked rune; compare all original outputs against native GP28 register before claiming plaintext.'
},null,2));
