#!/usr/bin/env node
'use strict';
/*
 * Original LP2: key-independent marker/word-start gate.
 * A model that emits C_i=C_{i-1} iff the plaintext rune is one fixed
 * GP29 symbol r MUST mark that rune at the 23 original word starts
 * whose ciphertext repeats the preceding word's final rune.
 * This program tests all 29 r under the declared native-English
 * fixed-word-length null, without recovering/inventing plaintext.
 * Node >=18, no external npm dependencies.
 *
 * Run: node sims/lp2_fixed_plaintext_marker_wordstart_sft.cjs
 * All inputs are retained under resources/; no downloads or artifacts.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const a = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const unsolved = a.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(unsolved.length,12956);
const runes = new Set(a.runes);
const text = read('resources/liber-primus/lp2-transcription.txt');
let words=[],current='',total=0,finished=false;
function flush() {
  if (!current || finished) return;
  if (total+current.length>unsolved.length) throw Error('word crosses unsolved/solved source cut');
  words.push(current);total+=current.length;current='';
  if (total===unsolved.length) finished=true;
}
for (const c of text) {
  if (finished) break;
  if (runes.has(c)) current+=c;
  else if (c==='-'||c==='.') flush();
}
if(!finished)flush();
assert.equal(words.length,2896);
assert.equal(total,12956);
const nativeMap = new Map(a.translit.map((s,i)=>[s,i]));
function gp(word) {
  word = word.toUpperCase().replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<word.length;) {
    const two=word.slice(i,i+2);
    if(nativeMap.has(two)) {out.push(nativeMap.get(two));i+=2;}
    else if(nativeMap.has(word[i])) {out.push(nativeMap.get(word[i]));i++;}
    else throw Error('unmapped control grapheme '+word[i]);
  }
  return out;
}
// Word starts include original hyphen/dot/punctuation and source page-carried
// words. The last 45 solved LP2 words are excluded by exact rune cut.
let start=0,inner=0,offset=0,wordStarts=[];
for (const w of words) {
  wordStarts.push(offset);
  if(offset>0 && unsolved[offset]===unsolved[offset-1]) start++;
  for(let j=1;j<w.length;j++)if(unsolved[offset+j]===unsolved[offset+j-1])inner++;
  offset+=w.length;
}
assert.equal(offset,unsolved.length);
assert.equal(start,23);
assert.equal(inner,63);
// Also check within-page-only equality count; no seam doublets in this source.
let pagePairs=0;for(const p of a.pages.slice(0,56))
  for(let i=1;i<p.indices.length;i++)if(p.indices[i]===p.indices[i-1])pagePairs++;
assert.equal(pagePairs,86);
const sources=['resources/control/gibran_prophet_58585.txt',
               'resources/control/shakespeare_first300k.txt',
               'resources/control/emerson_essays_2944.txt'];
const first=Array.from({length:16},()=>new Float64Array(29));
const count=new Uint32Array(16);
let sourceTokens=0;
for(const source of sources) {
  const tokens=read(source).match(/[A-Za-z]+/g)||[];
  for(const token of tokens) {
    const p=gp(token);
    if(!p.length||p.length>14)continue;
    first[p.length][p[0]]++;count[p.length]++;
    sourceTokens++;
  }
}
for(const w of words)assert.ok(count[w.length]>0,'native length missing '+w.length);
const target=start;
// Poisson-binomial exact probability of a word-start marker at least or
// at most 23, preserving each of the 2895 original word lengths.
function tails(probs) {
  const qge=new Float64Array(target+1),qle=new Float64Array(target+1);
  qge[0]=1;qle[0]=1;
  for(const p of probs) {
    for(let j=target;j>=1;j--) {
      qge[j]=j===target?qge[j]+qge[j-1]*p:qge[j]*(1-p)+qge[j-1]*p;
      qle[j]=qle[j]*(1-p)+qle[j-1]*p;
    }
    qge[0]*=1-p;qle[0]*=1-p;
  }
  return {atLeast: qge[target],atMost:qle.reduce((x,y)=>x+y,0)};
}
const sorted=[];
for(let r=0;r<29;r++) {
  const probs=words.slice(1).map(w=>first[w.length][r]/count[w.length]);
  const expected=probs.reduce((x,y)=>x+y,0),tail=tails(probs);
  sorted.push({rune:a.translit[r],gp_index:r,
               expectedWordStartMarkers:expected,
               oneSidedTail:expected<target?tail.atLeast:tail.atMost});
}
sorted.sort((x,y)=>y.oneSidedTail-x.oneSidedTail);
assert.equal(sorted[0].rune,'EA');
assert.ok(sorted[0].oneSidedTail>1e-6&&sorted[0].oneSidedTail<1e-4);
// Independent 2014-author-style caution: the retained solved-LP1 Latin
// paraphrase/reference is not a faithful original GP rune stream and
// repeats some continuation lines. Therefore it is a coarse, separate
// control, never pooled with the three native English training texts.
const author = read('resources/liber-primus/lp1-plaintext-reference.txt')
    .replace(/^#.*$/gm,' ').replace(/^\[.*\]$/gm,' ').replace(/^\d+.*$/gm,' ');
const authorWords = (author.match(/[A-Za-z]+/g)||[]).map(gp);
const authorEA = authorWords.filter(w=>w[0]===28).length;
const coarseEAStarts = (authorEA/authorWords.length)*(words.length-1);
// Blind forward/inverse plant for each possible reserved rune r:
// arbitrary changing secret word-independent key; no doublet loss.
const nativeExample=read(sources[0]).match(/[A-Za-z]+/g).slice(0,250).flatMap(gp);
function generate(plain,r,key) {
  const cipher=new Int16Array(plain.length);
  cipher[0]=plain[0];
  for(let i=1;i<plain.length;i++) {
    const p=plain[i],v=p<r?p:p-1;
    cipher[i]=p===r?cipher[i-1]:(cipher[i-1]+1+(v+key(i))%28)%29;
  }
  return cipher;
}
function inverse(cipher,r,key) {
  const plain=new Int16Array(cipher.length);
  plain[0]=cipher[0];
  for(let i=1;i<plain.length;i++) {
    const delta=(cipher[i]-cipher[i-1]+29)%29;
    const raw=(delta-1-key(i)+28*10)%28;
    plain[i]=delta===0?r:(raw>=r?raw+1:raw);
  }
  return plain;
}
const secret=i=>(i*i+17*i+13)%28;
for(let r=0;r<29;r++) {
  const cipher=generate(nativeExample,r,secret);
  assert.deepEqual([...inverse(cipher,r,secret)],nativeExample);
  for(let i=1;i<cipher.length;i++)
    assert.equal(cipher[i]===cipher[i-1],nativeExample[i]===r);
}
console.log(JSON.stringify({
  status:'conditional_native_gp_wordstart_negative_not_a_decryption',
  original:{runes:12956,words:2896,adjacentEqualPairs:86,insideWord:63,atWordStart:23},
  model:'one fixed GP29 plaintext marker emits identical ciphertext rune on a continuous cross-word clock; all other plaintext runes emit nonzero difference',
  nativeControls:sources,nativeTokenCount:sourceTokens,
  wordLengthConditionedExactPoissonBinomial:sorted,
  coarseAuthorReference:{wordCount:authorWords.length,EAinitialWords:authorEA,
     expectedEAStartsAmongOriginal2895WordStarts:coarseEAStarts,
     caveat:'editor-normalized solved-text excerpt with duplicated continuation, not native original runes'},
  positive:{markerVariants:29,sourceNativeRelyRecoverExact:true},
  scope:'Fails ordinary word-length-matched iid modern English under continuous clock; does not rule out author-specific word vocabulary, word resets, resegmentation, or a marker that is not one plaintext rune.'
},null,2));
