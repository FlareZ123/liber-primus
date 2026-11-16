'use strict';

/**
 * Original LP2 p49–51, exact 2014 V8 MWC1616 hidden-state recovery gate.
 * Standalone, read-only, Node.js 22 CommonJS.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const SOURCE=path.join(__dirname,'..','resources','liber-primus','lp2-grid-256.json');
const EXPECTED_SHA256='3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const A0=18030;
const A1=30903;

/** @param {number} state @param {number} multiplier @returns {number} */
function nextHalf(state,multiplier) {
  return (Math.imul(multiplier,state&65535)+(state>>>16))>>>0;
}

/** @param {number} state @param {boolean} high @returns {number} */
function laneByte(state,high) {
  return high?((state>>>8)&255):(state&255);
}

/**
 * Exhaust every reachable MWC half-state after the first observed byte.
 * @param {number[]} source @param {number} multiplier @param {boolean} high
 * @returns {{count3:number,count4:number,count5:number,fullStates:number[],exception4:Array<{seed:number,matched:number}>}}
 */
function recoverLane(source,multiplier,high) {
  let count3=0,count4=0,count5=0;
  const fullStates=[],exception4=[];
  for(let free=0;free<256;free++){
    const low=high?((source[0]<<8)|free):((free<<8)|source[0]);
    for(let carry=0;carry<multiplier;carry++){
      const seed=((carry<<16)|low)>>>0;
      let state=seed,matched=1;
      for(;matched<source.length;matched++){
        state=nextHalf(state,multiplier);
        if(laneByte(state,high)!==source[matched])break;
      }
      if(matched>=3)count3++;
      if(matched>=4){count4++;exception4.push({seed,matched});}
      if(matched>=5)count5++;
      if(matched===source.length)fullStates.push(seed);
    }
  }
  return {count3,count4,count5,fullStates,exception4};
}

/**
 * @param {number[]} bytes @param {boolean} little @param {number} offset
 * @returns {number}
 */
function loadWord(bytes,little,offset){
  return little
    ?(bytes[offset]|bytes[offset+1]<<8|bytes[offset+2]<<16|bytes[offset+3]<<24)>>>0
    :(bytes[offset]<<24|bytes[offset+1]<<16|bytes[offset+2]<<8|bytes[offset+3])>>>0;
}

/**
 * Two native 32-bit MWC observations fix both initial carry values exactly.
 * @param {number[]} bytes @param {boolean} little
 * @returns {{candidate:boolean,matchedBytes:number,seed0:number|null,seed1:number|null}}
 */
function recoverPacked(bytes,little){
  const first=loadWord(bytes,little,0),second=loadWord(bytes,little,4);
  const lo0=first>>>16,lo1=first&65535;
  const hi0=((second>>>16)-Math.imul(A0,lo0))&65535;
  const hi1=((second&65535)-Math.imul(A1,lo1))&65535;
  if(hi0>=A0||hi1>=A1)return {candidate:false,matchedBytes:4,seed0:null,seed1:null};
  const seed0=((hi0<<16)|lo0)>>>0,seed1=((hi1<<16)|lo1)>>>0;
  let state0=seed0,state1=seed1,matchedWords=1;
  while(4*matchedWords<bytes.length){
    state0=nextHalf(state0,A0);
    state1=nextHalf(state1,A1);
    const output=((state0<<16)|(state1&65535))>>>0;
    if(output!==loadWord(bytes,little,matchedWords*4))break;
    matchedWords++;
  }
  return {candidate:true,matchedBytes:matchedWords*4,seed0,seed1};
}

/** @param {number} word @param {boolean} little @returns {number[]} */
function storeWord(word,little){
  return little
   ?[word&255,(word>>>8)&255,(word>>>16)&255,word>>>24]
   :[word>>>24,(word>>>16)&255,(word>>>8)&255,word&255];
}

/**
 * @param {number} seed @param {number} multiplier @param {boolean} high @param {number} n
 * @returns {number[]}
 */
function plantLane(seed,multiplier,high,n){
  const out=[];let state=seed;
  for(let i=0;i<n;i++){out.push(laneByte(state,high));state=nextHalf(state,multiplier);}
  return out;
}

/**
 * @param {number} seed0 @param {number} seed1 @param {boolean} little @param {number} n
 * @returns {number[]}
 */
function plantPacked(seed0,seed1,little,n){
  const out=[];let state0=seed0,state1=seed1;
  for(let i=0;i<n;i++){
    out.push(...storeWord(((state0<<16)|(state1&65535))>>>0,little));
    state0=nextHalf(state0,A0);state1=nextHalf(state1,A1);
  }
  return out;
}

/**
 * Twelve original-image-compatible rectangular traversals, including reversals.
 * @param {number[]} bytes @param {Array<{rows:number,bytes:number[]}>} pages
 * @returns {Array<{name:string,bytes:number[]}>}
 */
function traversals(bytes,pages){
  const out=[];
  const add=(name,v)=>{
    assert.equal(v.length,256);
    assert.deepEqual(v.slice().sort((a,b)=>a-b),bytes.slice().sort((a,b)=>a-b));
    out.push({name,bytes:v});
  };
  add('row',bytes);
  add('row-snake',bytes.map((_,i)=>bytes[Math.floor(i/8)*8+
    ((Math.floor(i/8)&1)?7-(i%8):(i%8))]));
  add('columns',Array.from({length:256},(_,i)=>bytes[(i%32)*8+Math.floor(i/32)]));
  add('columns-snake',Array.from({length:256},(_,i)=>bytes[
    ((Math.floor(i/32)&1)?31-(i%32):(i%32))*8+Math.floor(i/32)]));
  for(const serp of [false,true]){
    const result=[];let offset=0;
    for(const page of pages){
      for(let col=0;col<8;col++){
        for(let row=0;row<page.rows;row++){
          const sourceRow=serp&&(col&1)?page.rows-1-row:row;
          result.push(bytes[offset+sourceRow*8+col]);
        }
      }
      offset+=page.rows*8;
    }
    add(serp?'local-col-snake':'local-cols',result);
  }
  for(const item of out.slice())add('reverse-'+item.name,item.bytes.slice().reverse());
  return out;
}

function main(){
  const original=JSON.parse(fs.readFileSync(SOURCE,'utf8'));
  assert.deepEqual(original.pages.map(p=>p.rows),[10,13,9]);
  const bytes=original.pages.flatMap(p=>p.bytes);
  assert.equal(bytes.length,256);
  assert(bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
  const digest=crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
  assert.equal(digest,EXPECTED_SHA256);

  const planted0=((0x1395<<16)|0xC7A5)>>>0;
  const planted1=((0x3918<<16)|0x52BF)>>>0;
  for(const [multiplier,seed] of [[A0,planted0],[A1,planted1]]){
    for(const high of [false,true]){
      const recovered=recoverLane(plantLane(seed,multiplier,high,256),multiplier,high);
      assert(recovered.fullStates.includes(seed));
      assert.equal(recovered.fullStates.length,1);
    }
  }
  for(const little of [false,true]){
    const recovered=recoverPacked(plantPacked(planted0,planted1,little,64),little);
    assert.equal(recovered.candidate,true);
    assert.equal(recovered.matchedBytes,256);
    assert.equal(recovered.seed0,planted0);
    assert.equal(recovered.seed1,planted1);
  }
  console.log('CONTROL 4/4 lane streams and 2/2 complete-word streams recover original planted states, 256/256 predicted bytes');

  let total=0,recoveredCount=0,fourPrefixCount=0,packedCandidateCount=0,maxPackedBytes=0;
  for(const entry of traversals(bytes,original.pages)){
    const cases=[['s0-high8',A0,true],['s0-low8',A0,false],['s1-high8',A1,true],['s1-low8',A1,false]];
    const laneSummary=[];
    for(const [label,a,high] of cases){
      const test=recoverLane(entry.bytes,a,high);
      recoveredCount+=test.fullStates.length;
      fourPrefixCount+=test.count4;
      total++;
      laneSummary.push(label+':3='+test.count3+',4='+test.count4+
        ',5='+test.count5+',256='+test.fullStates.length);
    }
    const wordBig=recoverPacked(entry.bytes,false);
    const wordLittle=recoverPacked(entry.bytes,true);
    packedCandidateCount+=Number(wordBig.candidate)+Number(wordLittle.candidate);
    maxPackedBytes=Math.max(maxPackedBytes,wordBig.matchedBytes,wordLittle.matchedBytes);
    console.log('SOURCE '+entry.name+': '+laneSummary.join(' | ')+
      '; packedBig='+wordBig.matchedBytes+',packedLittle='+wordLittle.matchedBytes);
  }
  assert.equal(total,48);
  assert.equal(recoveredCount,0);
  assert.equal(maxPackedBytes,8);
  console.log('DECISION no complete 2014 MWC1616 state; 48 native one-byte and 24 packed cases; '+
    'four-byte prefix exceptions='+fourPrefixCount+', eight-byte packed candidates='+packedCandidateCount);
}
main();
