/**
 * Original-source p50 43-byte marker interval -> p55 strict 43 rune interiors:
 * exhaustive GP29 affine additive-key family P = C + a*K + b (mod 29).
 *
 * Independently selected inputs: the only two p50-global base60 3D=193
 * marker positions (one-based cells 84 and 128), and the 43 exact p55
 * printed word interiors selected by solved p57 "shed circumferences".
 *
 * Uses original rune corpus, source table and pinned Shakespeare reference.
 * No third-party modules. Run with Node22 on Windows or equivalent.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root,p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const shakespeare = read('resources/control/shakespeare_first300k.txt');

const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const sourceWords = read('resources/liber-primus/lp2-transcription.txt')
  .replace(/\r\n/g,'\n').split(/\n%\n/)[54]
  .replace(/\/\n/g,'').replace(/[\n&$%§\/]/g,'')
  .split(/[-.]/).filter(Boolean);
assert.deepEqual(sourceWords.map((w) => Array.from(w).length), wordLengths);

const cells = grid.bytes;
assert.equal(cells.length, 256);
assert.deepEqual(cells.map((x,i)=>x===193?i+1:null).filter(Boolean),[84,128]);
const key = cells.slice(84,127);
assert.equal(key.length, 43);
assert.equal(grid.pages[0].tokens.length, 80);
assert.equal(grid.pages[1].tokens[3], '3D');

const page = gp.pages[55].indices;
assert.equal(page.length, 76);
let offset = 0;
const segments = [];
for (let j=0;j<sourceWords.length;j++){
  const chars = Array.from(sourceWords[j]);
  const indices = chars.map((ch)=>gp.runes.indexOf(ch));
  assert.deepEqual(page.slice(offset,offset+indices.length),indices);
  segments.push(indices.slice(1,-1));
  offset += indices.length;
}
assert.equal(offset,76);
const cipher = segments.flat();
assert.equal(cipher.length,43);

const toks = gp.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const vocab = new Map();
const triCounts = new Map();
const normalise = (s)=>s.toUpperCase().replace(/QU/g,'CW')
  .replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
function encodeWord(word) {
  word=normalise(word);
  const out=[];
  for (let i=0;i<word.length;){
    const token=toks.find((t)=>word.startsWith(t.s,i));
    assert.ok(token,'source GP English transliteration must remain defined');
    out.push(token.i);
    i+=token.s.length;
  }
  return out;
}
for (const word of shakespeare.toUpperCase().match(/[A-Z]+/g)||[]) {
  const encoded = encodeWord(word);
  if (!vocab.has(encoded.length))vocab.set(encoded.length,[]);
  vocab.get(encoded.length).push(encoded);
  for (let i=0;i+3<=encoded.length;i++) {
    const id=encoded[i]*841+encoded[i+1]*29+encoded[i+2];
    triCounts.set(id,(triCounts.get(id)||0)+1);
  }
}
const observedTotal = [...triCounts.values()].reduce((s,n)=>s+n,0);
assert.equal(observedTotal,111151);
const alpha=.05;
const denominator=observedTotal+alpha*29**3;
const insideLengths = wordLengths.map((n)=>Math.max(n-2,0));
function score(interiors) {
  assert.equal(interiors.length,43);
  let offset=0, sum=0, count=0;
  for (const length of insideLengths) {
    for(let i=0;i+3<=length;i++){
      const id=interiors[offset+i]*841+
        interiors[offset+i+1]*29+interiors[offset+i+2];
      sum+=Math.log(((triCounts.get(id)||0)+alpha)/denominator);
      count++;
    }
    offset+=length;
  }
  assert.equal(offset,43);
  assert.ok(count>0);
  return sum/count;
}
const mod=(x)=>(x%29+29)%29;
function decode(src,a,b) {
  return src.map((c,i)=>mod(c+a*key[i]+b));
}
const candidates=[];
for (let a=0;a<29;a++)for(let b=0;b<29;b++){
  candidates.push({a,b,s:score(decode(cipher,a,b))});
}
candidates.sort((u,v)=>v.s-u.s);
assert.equal(candidates.length,841);
const best=candidates[0];
assert.deepEqual([best.a,best.b],[25,14]);
assert.ok(Math.abs(best.s-(-12.42303556483193))<1e-9);
const originalScore=score(cipher);

let seed=0x1245fa1;
function rand32(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
function sampleNative() {
  const out=[];
  for (const length of wordLengths){
    const choices=vocab.get(length);
    assert.ok(choices?.length>0,'all original word lengths occur in controls');
    out.push(...choices[rand32()%choices.length].slice(1,-1));
  }
  assert.equal(out.length,43);
  return out;
}
const nativeScores=[];
for(let i=0;i<2000;i++)nativeScores.push(score(sampleNative()));
nativeScores.sort((u,v)=>u-v);
const minNative=nativeScores[0];
assert.ok(Math.abs(minNative-(-8.866880353470817))<1e-9);
assert.ok(best.s<minNative);

// Original-layout positive control: encrypt genuine independently sampled
// English 17-word/43-interior plaintext under the exact affine family,
// and recover it with the actual selected (a,b) values.
const plant=sampleNative();
const plantA=17,plantB=19;
const syntheticCipher=plant.map((p,i)=>mod(p-plantA*key[i]-plantB));
const recovered=decode(syntheticCipher,plantA,plantB);
assert.deepEqual(recovered,plant);
assert.ok(score(recovered)>best.s);

console.log(JSON.stringify({
  source: {p55PrintedWords:wordLengths.length,p55Runes:76,
    strictInteriors:43,p50Table:256,
    bracketingBase60Token:'3D',bracketingCells:[84,128],
    enclosedOriginalBytes:43},
  family:'P_i=(C_i + a*(K_i mod29) + b) mod29',
  parameterPairs:841,
  bestOriginal:best,unchangedOriginalScore:originalScore,
  exactNativeShapeControls: {samples:2000,min:minNative,
    median:nativeScores[1000],p95:nativeScores[1900],
    originalFamilyAboveNativeMin:0},
  positivePlant:{a:plantA,b:plantB,recovered:43}
},null,2));
