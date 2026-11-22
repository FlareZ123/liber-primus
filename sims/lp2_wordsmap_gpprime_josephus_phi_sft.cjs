#!/usr/bin/env node
'use strict';

/**
 * Author-visible "words are the map, their numbers are the direction"
 * + clear p57 "shed our own circumferences" as a Josephus word-order cipher.
 *
 * Each ORIGINAL complete word has its immutable canonical GP prime sum.
 * Starting with the physically printed first word of each of nine illustrated
 * chapters, read it, remove it from a circular list, and count its prime sum
 * (one-based) through the remaining printed words. Reverse the circle for the
 * only other source-simple direction. No dictionary fitting or moving word
 * breaks. Receiver is solely the historically solved p56 phi(prime) cipher
 * with plaintext-F transparent/nonconsuming, at every prime start 0...4999.
 *
 * Original exact word-order/word-boundary tests, plus complete 2,896-word
 * length-adjacency native English controls and solved-p56 forward encryption.
 * No unknown plaintext or original key inferred from round-trip correctness.
 *
 * SFT: node sims/lp2_wordsmap_gpprime_josephus_phi_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const runeMap = new Map(gp.runes.map((v, i) => [v, i]));
assert.equal(runeMap.size, 29);
assert.equal(gp.prime.length, 29);
const pages = [];
let total = 0;
for (const p of gp.pages) {
  assert.equal(p.page, pages.length);
  pages.push(total);
  total += p.runic_count;
}
assert.equal(total, 13136);
assert.equal(pages[56], 12956);

// Preserve true complete words: page/printed-line breaks are never word cuts.
// The original source uses - . , & $ for actual word/delimiter boundaries.
const words = [];
let active=[], runeOffset=0, startRune=0, startChar=0;
for (let i=0;i<source.length;i++) {
  const ch=source[i];
  if (runeMap.has(ch)) {
    if (!active.length) {startRune=runeOffset;startChar=i;}
    active.push(runeMap.get(ch));
    runeOffset++;
  } else if ('-.,&$'.includes(ch) && active.length) {
    words.push({
      runes:active,
      a:startRune,
      b:runeOffset,
      str:source.slice(startChar,i)
    });
    active=[];
  }
}
if (active.length)words.push({
  runes:active,a:startRune,b:runeOffset,
  str:source.slice(startChar)
});
assert.equal(runeOffset,total);
assert.equal(words.length,2941);
assert.equal(words.filter(w=>w.a<pages[56]).length,2896);
assert.deepEqual(words.flatMap(w=>w.runes),
  gp.pages.flatMap(p=>p.indices));
const crossPages=words.slice(0,2896).filter(w=>pages.slice(1,56)
  .some(a=>w.a<a&&a<w.b)).length;
assert.equal(crossPages,32);
const chapters=[[0,2],[3,7],[8,14],[15,22],
                [23,26],[27,32],[33,39],[40,53],[54,55]];
/**
 * @param {number} from First LP2 page
 * @param {number} to Last LP2 page
 */
function chapterWords(from,to) {
  const a=pages[from],b=pages[to+1];
  return words.filter(w=>w.a>=a&&w.b<=b);
}
const groups=chapters.map(([a,b])=>chapterWords(a,b));
const original=groups.flat();
assert.equal(original.length,2896);
assert.equal(original.reduce((n,w)=>n+w.runes.length,0),12956);
assert.deepEqual(original.flatMap(w=>w.runes),
  gp.pages.slice(0,56).flatMap(p=>p.indices));

/**
 * Source-directed Josephus elimination of complete word objects.
 * First physical word always starts; for mirrored circle walk all remaining
 * words in reverse physical order, preserving the same first word.
 * Step=1 reads the next living item after the just-removed item.
 * @param {{runes:number[]}[]} input
 * @param {boolean} mirrored
 * @returns {typeof input}
 */
function walk(input,mirrored) {
  if (!input.length)return [];
  const live=mirrored ?
    [input[0],...input.slice(1).reverse()] : input.slice();
  const out=[];
  let at=0;
  while(live.length) {
    const w=live.splice(at,1)[0];
    out.push(w);
    if (!live.length)break;
    const sum=w.runes.reduce((s,x)=>s+gp.prime[x],0);
    assert.ok(sum>0);
    at=(at+sum-1)%live.length;
  }
  assert.equal(out.length,input.length);
  return out;
}
const permuted={clockwise:groups.flatMap(g=>walk(g,false)),
                counterclockwise:groups.flatMap(g=>walk(g,true))};
for (const name of Object.keys(permuted)) {
  const output=permuted[name];
  assert.equal(output.length,2896);
  assert.equal(new Set(output).size,2896);
  const before=new Map(original.map((obj,i)=>[obj,i]));
  const permutation=output.map(obj=>before.get(obj));
  assert.equal(new Set(permutation).size,2896);
  // Exact source identity when word objects go back to their original slots:
  const restored=Array(output.length);
  for(let j=0;j<output.length;j++)restored[permutation[j]]=output[j];
  assert.deepEqual(restored,original);
  assert.deepEqual(restored.flatMap(w=>w.runes),
    gp.pages.slice(0,56).flatMap(p=>p.indices));
}

/** @param {number[]} lens */
function wordLengthMI(lens) {
  const pairs=new Int32Array(81),r=new Int32Array(9),c=new Int32Array(9);
  for(let i=0;i<lens.length-1;i++) {
    const a=Math.min(9,lens[i])-1,b=Math.min(9,lens[i+1])-1;
    pairs[9*a+b]++;r[a]++;c[b]++;
  }
  const n=lens.length-1;
  let out=0;
  for(let a=0;a<9;a++)for(let b=0;b<9;b++) {
    const x=pairs[9*a+b];
    if(x)out+=(x/n)*Math.log((x*n)/(r[a]*c[b]));
  }
  return out;
}
const lengths=arr=>arr.map(w=>w.runes.length);
const miSource=wordLengthMI(lengths(original));
const miCW=wordLengthMI(lengths(permuted.clockwise));
const miCCW=wordLengthMI(lengths(permuted.counterclockwise));
const tolerance=1e-11;
assert.ok(Math.abs(miSource-0.01229969288099127)<tolerance);
assert.ok(Math.abs(miCW-0.011134491471408317)<tolerance);
assert.ok(Math.abs(miCCW-0.011538771719780731)<tolerance);

/**
 * For a fixed W=2896 original-length English window, all MI values can
 * be calculated exactly with one sliding pass; no random-window sampling.
 * Same GP spelling rules as the independently solved 181 LP1 words and p57.
 * @param {number[]} lengths
 */
function windowMinimumMI(lengths) {
  const W=2896,n=W-1;
  assert.ok(lengths.length>=W);
  const f=new Float64Array(n+2);
  for(let i=1;i<f.length;i++)f[i]=i*Math.log(i);
  const joint=new Int32Array(81),r=new Int32Array(9),c=new Int32Array(9);
  let jSum=0,rSum=0,cSum=0;
  function change(i,delta) {
    const a=Math.min(9,lengths[i])-1;
    const b=Math.min(9,lengths[i+1])-1;
    const key=a*9+b;
    const old=joint[key],row=r[a],col=c[b];
    joint[key]+=delta;r[a]+=delta;c[b]+=delta;
    jSum+=f[joint[key]]-f[old];
    rSum+=f[r[a]]-f[row];
    cSum+=f[c[b]]-f[col];
  }
  for(let i=0;i<n;i++)change(i,1);
  let min=Infinity,at=-1,belowOriginal=0;
  const check=i=>{
    const x=Math.log(n)+(jSum-rSum-cSum)/n;
    if(x<min){min=x;at=i;}
    if(x<=miSource)belowOriginal++;
  };
  check(0);
  for(let first=1;first+W<=lengths.length;first++) {
    change(first-1,-1);
    change(first+n-1,1);
    check(first);
  }
  return {windows:lengths.length-W+1,minimum:min,minAtWord:at,
    atOrBelowOriginal:belowOriginal};
}
const references=[];
for(const [file,minimum] of [
  ['resources/control/gibran_prophet_58585.txt',0.03406062851195202],
  ['resources/control/shakespeare_first300k.txt',0.01797759911608754],
  ['resources/control/emerson_essays_2944.txt',0.0305496256766844]
]) {
  const strs=read(file).match(/[A-Za-z]+/g)||[];
  const lens=strs.map(w=>encodeSourceNativeGP(w).length);
  const result=windowMinimumMI(lens);
  assert.ok(Math.abs(result.minimum-minimum)<tolerance,file);
  assert.equal(result.atOrBelowOriginal,0);
  assert.ok(result.minimum>miCW && result.minimum>miCCW);
  references.push({source:file,words:strs.length,...result});
}

const key=[];
const sieve=new Uint8Array(200000);
for(let p=2;p<sieve.length&&key.length<9000;p++) {
  if(sieve[p])continue;
  key.push((p-1)%29);
  if(p*p<sieve.length)for(let j=p*p;j<sieve.length;j+=p)sieve[j]=1;
}
assert.equal(key.length,9000);
const mod29=x=>(x%29+29)%29;
/**
 * Exact p56 keyskip inverse: cipher F may be literal F (not consuming key)
 * or a key-consuming encoded non-F collision; no non-F cipher may map to
 * forbidden plaintext F. Keep every possible key consumption count.
 * @param {number[]} cipher
 * @param {number} primeStart
 */
function reach(cipher,primeStart) {
  let consumed=[0];
  for(let i=0;i<cipher.length;i++) {
    const next=[],seen=new Uint8Array(i+2),v=cipher[i];
    for(const k of consumed) {
      if(v===0&&!seen[k]) {
        next.push(k);seen[k]=1;
      }
      if(mod29(v-key[primeStart+k])!==0&&!seen[k+1]) {
        next.push(k+1);seen[k+1]=1;
      }
    }
    if(!next.length)return i;
    consumed=next;
  }
  return cipher.length;
}
/** @param {number[]} plain */
function phiEncrypt(plain) {
  let i=0;
  return plain.map(p=>p===0?0:mod29(p+key[i++]));
}
// Exact published 85-rune source plaintext in the solved p56 AN END page.
const p56Known=encodeSourceNativeGP('AN END WITHIN THE DEEP WEB '+
  'THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM '+
  'TO SEEC OUT THIS PAGE');
assert.equal(p56Known.length,85);
assert.deepEqual(phiEncrypt(p56Known),gp.pages[56].indices);
assert.equal(reach(gp.pages[56].indices,0),85);

const expected={
  clockwise:{
    zero:[41,18,274,9,0,18,10,32,31],
    max:[729,403,825,512,590,503,368,445,308],
    survivors:[[1088,1089],[],[],[],[],[],[],[],[678,1189,4628,4629]]
  },
  counterclockwise:{
    zero:[254,284,120,87,0,14,34,226,150],
    max:[672,491,282,572,389,888,424,419,308],
    survivors:[[],[],[],[],[],[],[],[],[27,28,2875,3682]]
  }
};
const sections=[];
for (let i=0;i<chapters.length;i++) {
  const [a,b]=chapters[i],section={
    pages:'p'+a+'–'+b,words:groups[i].length,
    runes:groups[i].flatMap(w=>w.runes).length
  };
  for(const [name,mirror] of [
    ['clockwise',false],['counterclockwise',true]
  ]) {
    const cipher=walk(groups[i],mirror).flatMap(w=>w.runes);
    const survivors=[];
    let maximum=0;
    for(let start=0;start<5000;start++) {
      const v=reach(cipher,start);
      maximum=Math.max(maximum,v);
      if(v===cipher.length)survivors.push(start);
    }
    const sourceZero=reach(cipher,0);
    assert.equal(sourceZero,expected[name].zero[i]);
    assert.equal(maximum,expected[name].max[i]);
    assert.deepEqual(survivors,expected[name].survivors[i]);
    section[name]={prime2Reach:sourceZero,
      maximumReachIn5000:maximum,viableStarts:survivors};
  }
  sections.push(section);
}
console.log(JSON.stringify({
  status:'Exact original-source negative, no unknown-page plaintext',
  proposal:'Source word prime-sum-driven Josephus circle traversal, 2016 words/numbers/direction clue + clear p57 circumferences; two physical directions, nine visual chapters',
  verified:'2896 complete printed words, 12956 ciphertext runes, 32 physical page-carry words, full original word-object inverse',
  keyControl:'authentic p56 85/85 prime-totient/F-transparent cipher',
  candidateMI:{untouched:miSource,clockwise:miCW,counterclockwise:miCCW},
  nativeEnglishWordLengthMI:references,
  search:'0..4999 prime starts independently per original chapter and direction',
  sections,
  conclusion:'For either direction, 7/9 complete unknown chapters have no legal F-transparent prime inverse at any start; original p0-2 and p54-55 survivors have near-uniform outputs and no source-selected key. Neither direction improves whole-book word-length adjacency into any of the three native-English control ranges. Source wording does not uniquely prescribe Josephus; no authenticated plaintext.'
},null,2));
