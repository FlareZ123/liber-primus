'use strict';
/**
 * Original LP2 source-RSA-432 block impossibility certificate.
 *
 * Removing the 86 immediate repeated ciphertext runes leaves 12,870
 * nonrepeating emissions = 143*90. A 432-bit RSA integer needs 90
 * base28 digits. For all 90 possible positions of the 90-digit clock,
 * head-edge certificates refute ANY fixed 29-glyph cyclic or sorted
 * predecessor-excluding alphabet, including secret permutations.
 *
 * Separately checks source-RSA modular exponentiation and validates
 * the attack using synthetic RSA ciphertext with hidden rune order
 * and 86 inserted repeats (all original page lengths preserved).
 *
 * SFT: node sims/rsa432_rank28_block_impossibility.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {encode}=require('./grid_keyskip_viterbi.cjs');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const GP=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=GP.pages.filter(p=>p.page<56&&p.indices.length);
const ciphertext=pages.flatMap(p=>p.indices);
const P=97513779050322159297664671238670850085661086043266591739338007321n;
const Q=77506098606928780021829964781695212837195959082370473820509360759n;
const N=P*Q,E=65537n;
const PHI=(P-1n)*(Q-1n);
const RADIX=28n,BLOCK=90,MARKERS=86,BLOCKS=143;
assert.equal(N,7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n);
assert.ok(N<RADIX**BigInt(BLOCK)&&N>RADIX**BigInt(BLOCK-1));
const MAX_HEAD=Number(N/RADIX**BigInt(BLOCK-1));
assert.equal(MAX_HEAD,12);
assert.equal(ciphertext.length,12956);
const pageStarts=new Set();
let offset=0;
for(const page of pages){pageStarts.add(offset);offset+=page.indices.length;}
assert.equal(pages.length,55);
assert.equal(offset,12956);
const pow15=[],log15=Array(29).fill(-1);
for(let v=1,i=0;i<28;i++,v=v*15%29){
  pow15.push(v);log15[v]=i;
}
assert.equal(new Set(pow15).size,28);
/** @param {number} value */
const mod29=value=>(value%29+29)%29;
/** @param {bigint} a @param {bigint} b */
function inverse(a,b){
  let [t,u,r,s]=[0n,1n,b,a];
  while(s){const q=r/s;[t,u,r,s]=[u,t-q*u,s,r-q*s];}
  assert.equal(r,1n);
  return (t%b+b)%b;
}
const D=inverse(E,PHI);
assert.equal(E*D%PHI,1n);
/** @param {bigint} value @param {bigint} exponent */
function modPow(value,exponent){
  let x=value%N,out=1n;
  while(exponent){if(exponent&1n)out=out*x%N;x=x*x%N;exponent>>=1n;}
  return out;
}
/**
 * Filter immediate repeat markers; preserve source glyph edges and their
 * raw source offsets. The artificial initial predecessor is irrelevant
 * because the proof excludes head index 0.
 * @param {number[]} runes
 */
function nonrepeatEdges(runes){
  let prev=0,repeat=0;
  const out=[];
  for(let i=0;i<runes.length;i++){
    const cur=runes[i];
    if(cur===prev){repeat++;continue;}
    out.push({from:prev,to:cur,raw:i});
    prev=cur;
  }
  return {out,repeat};
}
/** @param {ReturnType<typeof nonrepeatEdges>['out']} edges */
function certificate(edges){
  const phases=[];
  for(let phase=0;phase<BLOCK;phase++){
    const seen=new Map(),targets=new Set(),witness=[];
    let heads=0;
    for(let i=phase;i+BLOCK<=edges.length;i+=BLOCK){
      // First glyph and physical page first glyph are excluded from
      // edge claims because their predecessor could be an IV.
      const edge=edges[i];
      if(i===0||pageStarts.has(edge.raw))continue;
      heads++;
      targets.add(edge.to);
      const key=edge.from+':'+edge.to;
      const reverse=edge.to+':'+edge.from;
      const earlier=seen.get(reverse);
      if(earlier!==undefined)witness.push({
        first:{digit:earlier.digit,raw:earlier.raw,
          glyphs:[earlier.from,earlier.to]},
        second:{digit:i,raw:edge.raw,glyphs:[edge.from,edge.to]}
      });
      if(!seen.has(key))seen.set(key,{...edge,digit:i});
    }
    phases.push({phase,heads,
      distinctTargetGlyphs:targets.size,
      reciprocalPairs:witness.length,example:witness[0]||null});
  }
  return {
    phasesChecked:phases.length,
    allCyclicOrFieldExcluded:phases.every(x=>x.reciprocalPairs>=1),
    allSortedExcluded:phases.every(x=>x.distinctTargetGlyphs>MAX_HEAD+1),
    minReciprocalPairs:Math.min(...phases.map(x=>x.reciprocalPairs)),
    minTargetGlyphs:Math.min(...phases.map(x=>x.distinctTargetGlyphs)),
    minHeads:Math.min(...phases.map(x=>x.heads)),
    phase0:phases[0],
    phase53:phases[53],
    fullPhaseSummary:phases.map(x=>[x.phase,x.heads,
      x.reciprocalPairs,x.distinctTargetGlyphs])
  };
}
/** @param {number[]} order @param {'cyclic'|'sorted'|'fieldPower'} kind @param {number} prev @param {number} digit */
function emit(order,kind,prev,digit){
  const before=order.indexOf(prev);
  assert.ok(before>=0&&digit>=0&&digit<28);
  if(kind==='cyclic')return order[(before+digit+1)%29];
  if(kind==='fieldPower')return order[(before+pow15[digit])%29];
  const options=order.filter(c=>c!==prev);
  return options[digit];
}
/** @param {number[]} order @param {'cyclic'|'sorted'|'fieldPower'} kind @param {number} previous @param {number} current */
function rank(order,kind,previous,current){
  if(previous===current)return -1;
  const a=order.indexOf(previous),b=order.indexOf(current);
  if(kind==='cyclic')return mod29(b-a)-1;
  if(kind==='fieldPower')return log15[mod29(b-a)];
  return order.filter(c=>c!==previous).indexOf(current);
}
/** @param {bigint} number */
function digits(number){
  assert.ok(number>=0n&&number<N);
  const out=Array(BLOCK).fill(0);
  for(let i=BLOCK-1;i>=0;i--){
    out[i]=Number(number%RADIX);
    number/=RADIX;
  }
  assert.equal(number,0n);
  return out;
}
/** @param {number[]} list */
function rotatePermutation(list){
  let x=0x33012014;
  function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
  const arr=list.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=next()%(i+1);
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
/** @param {'cyclic'|'sorted'|'fieldPower'} kind */
function planted(kind){
  const order=rotatePermutation(Array.from({length:29},(_,i)=>i));
  const src=read('resources/control/shakespeare_first300k.txt');
  let prev=order[0];
  const raw=[],plaintext=[],expectedDigits=[];
  for(let i=0;i<BLOCKS;i++){
    const text=src.slice(8000+i*30,8000+i*30+30);
    assert.equal(text.length,30);
    const value=BigInt('0x'+Buffer.from(text).toString('hex'));
    assert.ok(value<N);
    const encrypted=modPow(value,E);
    const ds=digits(encrypted);
    plaintext.push(value);
    expectedDigits.push(...ds);
    for(const v of ds){
      prev=emit(order,kind,prev,v);
      raw.push(prev);
    }
  }
  assert.equal(raw.length,12870);
  // Insert the exact number of no-op repeat markers at fixed source
  // positions, without altering the predecessor for any further digit.
  const added=[],positions=new Set(Array.from({length:MARKERS},(_,j)=>
    Math.floor((j+1)*raw.length/(MARKERS+1))));
  for(let i=0;i<raw.length;i++){
    added.push(raw[i]);
    if(positions.has(i))added.push(raw[i]);
  }
  assert.equal(added.length,12956);
  assert.ok(pages.every((p,i)=>p.indices.length>0));
  let at=0,prior=order[0],repeats=0;
  const found=[];
  for(const p of pages){
    const fragment=added.slice(at,at+p.indices.length);
    at+=p.indices.length;
    for(const c of fragment){
      if(c===prior){repeats++;continue;}
      const v=rank(order,kind,prior,c);
      assert.ok(v>=0&&v<28);
      found.push(v);
      prior=c;
    }
  }
  assert.equal(repeats,MARKERS);
  assert.deepEqual(found,expectedDigits);
  for(let b=0;b<BLOCKS;b++){
    let n=0n;
    for(let j=0;j<BLOCK;j++)n=n*RADIX+BigInt(found[b*BLOCK+j]);
    assert.ok(n<N);
    assert.equal(modPow(n,D),plaintext[b]);
  }
  return {kind,blocks:BLOCKS,repeats,
    sourceRunes:added.length,exactPrivateInversions:BLOCKS,
    originalPageLengthsPreserved:true,secretGlyphOrderHidden:true};
}
function main(){
  const {out:edges,repeat}=nonrepeatEdges(ciphertext);
  assert.equal(repeat,MARKERS);
  assert.equal(edges.length,BLOCKS*BLOCK);
  const original=certificate(edges);
  assert.equal(original.phasesChecked,90);
  assert.ok(original.allCyclicOrFieldExcluded&&original.allSortedExcluded);
  assert.ok(original.minReciprocalPairs>=3);
  assert.ok(original.minTargetGlyphs>=25);
  const plants=['cyclic','sorted','fieldPower'].map(planted);
  const result={source:'genuine Cicada 2014 432-bit RSA modulus and original LP2 runes',
    modulusBits:432,modulusRemainderFraction:
      Number(N*1000000n/RADIX**BigInt(BLOCK))/1000000,
    maxBase28LeadingDigit:MAX_HEAD,
    originalRunes:ciphertext.length,repeatedRuneMarks:repeat,
    packedDigits:edges.length,blockSize:BLOCK,completeBlocks:BLOCKS,
    original,positive:plants,
    interpretation:'For every phase, some opposite-direction head edges make all cyclic and GF29 power ranks impossible under any fixed alphabet order; independently >14 distinct head target glyphs make sorted predecessor-skip ranks impossible. This is a canonical RSA-block capacity exclusion only.'};
  console.log(JSON.stringify(result,null,2));
}
if(require.main===module)main();
module.exports={certificate,nonrepeatEdges,rank,emit,planted,main};
