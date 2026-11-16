'use strict';
/** Original punctuation-conditioned random-packet separator test.
 * Read-only, Node.js 22, CommonJS, Windows-compatible.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
const glyph=new Map(gp.runes.map((r,i)=>[r,i]));
/** @type {number[][][]} */
const segments=[];
let segment=[],word=[],n=0;
function stopWord(){if(word.length){segment.push(word);word=[];}}
function stopSegment(){stopWord();if(segment.length){segments.push(segment);segment=[];}}
for(const ch of read('resources/liber-primus/lp2-transcription.txt')){
  if(glyph.has(ch)){
    if(n===original.length)break;
    assert.equal(glyph.get(ch),original[n++]);
    word.push(glyph.get(ch));
  }else if(ch==='-')stopWord();
  else if('.$&§'.includes(ch))stopSegment();
}
stopSegment();
const words=segments.flat(),singles=words.filter(w=>w.length===1).length;
assert.equal(n,12956);
assert.equal(segments.length,175);
assert.equal(words.length,2896);
assert.equal(singles,83);
/**
 * Uniform W-positive-part compositions of N runes.
 * @param {number} N
 * @param {number} W
 */
function moments(N,W){
  assert.ok(Number.isInteger(N)&&Number.isInteger(W)&&W>=1&&W<=N);
  if(N<=2)return {mean:W===N?W:0,variance:0};
  const p=(W-1)/(N-1),p2=(W-1)*(W-2)/((N-1)*(N-2));
  return {mean:W*p,
    variance:W*p*(1-p)+W*(W-1)*(p2-p*p)};
}
const baseline=moments(n,words.length);
let expected=0,variance=0;
for(const s of segments){
  const m=moments(s.reduce((x,w)=>x+w.length,0),s.length);
  expected+=m.mean;variance+=m.variance;
}
assert.ok(Math.abs(expected-627.132342380971)<1e-8);
assert.ok(Math.abs(Math.sqrt(variance)-19.4748535368662)<1e-8);
console.log(JSON.stringify({n,words:words.length,segments:segments.length,
  singletonObserved:singles,histogram:Array.from({length:14},(_,i)=>
    words.filter(w=>w.length===i+1).length),
  unrestricted:{mean:baseline.mean,sd:Math.sqrt(baseline.variance)},
  fixedPunctuation:{mean:expected,sd:Math.sqrt(variance),
    z:(singles-expected)/Math.sqrt(variance)}
},null,2));
