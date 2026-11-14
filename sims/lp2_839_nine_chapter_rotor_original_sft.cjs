'use strict';
/**
 * Director #839: original-input nine-independent-key variant of the frozen
 * #823 GP29 two-state rotor, with nine source-visible chapter boundaries.
 *
 * Node.js 22 CommonJS SFT; requires only checked-in source and control files.
 * Read-only: all observed predictions, keys and controls print as JSON.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} name */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page <= 55);
const spans = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
assert.equal(pages.length, 56);
assert.equal(pages.reduce((n,p) => n+p.indices.length, 0), 12956);
const lengths = spans.map(([a,b]) => pages.filter((p) => p.page>=a && p.page<=b).reduce((n,p) => n+p.indices.length,0));
assert.deepEqual(lengths,[729,1145,1729,1903,1021,1433,1680,3008,308]);
const char = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,
  N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const digraph = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const native = [];
for (const word of read('resources/control/shakespeare_first300k.txt').toUpperCase().match(/[A-Z]+/g)) {
  for (let i=0; i<word.length; i++) {
    const pair = digraph[word.slice(i,i+2)];
    if (pair!==undefined) {native.push(pair);i++;}
    else native.push(char[word[i]]);
  }
}
assert.ok(native.length>205000);
const bins = 29*29*29, counts = new Uint32Array(bins), logs = new Float64Array(bins);
for (let i=2;i<140000;i++) counts[(native[i-2]*29+native[i-1])*29+native[i]]++;
for (let i=0;i<bins;i++) logs[i]=Math.log((counts[i]+.08)/(139998+bins*.08));
const units = Array.from({length:28},(_,i)=>i).filter((a)=>a%2!==0 && a%7!==0);
const inv = Object.fromEntries(units.map((a)=>[a,Array.from({length:28},(_,i)=>i).find((i)=>(i*a)%28===1)]));
assert.equal(units.length,12);
const mod = (x,m) => ((x%m)+m)%m;
/** @typedef {{a:number,b:number,s:number}} Key */
/** @param {number[]} plain @param {Key} key */
function encrypt(plain,key) {
  if (!plain.length) return [];
  let s=key.s;
  const out=[mod(plain[0]+key.b+7*s,29)];s^=plain[0]&1;
  for(let i=1;i<plain.length;i++){
    const x=plain[i];
    out.push(x===28?out[i-1]:mod(out[i-1]+1+mod(key.a*x+key.b+7*s,28),29));
    s^=x&1;
  }
  return out;
}
/** @param {number[]} cipher @param {Key} key */
function decrypt(cipher,key) {
  if (!cipher.length) return [];
  let s=key.s;
  const out=[mod(cipher[0]-key.b-7*s,29)];s^=out[0]&1;
  for(let i=1;i<cipher.length;i++){
    const x=cipher[i]===cipher[i-1]?28:
      mod(inv[key.a]*mod(mod(cipher[i]-cipher[i-1]-1,29)-key.b-7*s,28),28);
    out.push(x);s^=x&1;
  }
  return out;
}
/** @param {number[]} xs */
function score(xs) {
  let z=0;
  for(let i=2;i<xs.length;i++) z+=logs[(xs[i-2]*29+xs[i-1])*29+xs[i]];
  return z/(xs.length-2);
}
/** @param {number[]} xs */
function ioc(xs){
  const h=new Uint32Array(29);
  for(const x of xs)h[x]++;
  return h.reduce((v,x)=>v+x*(x-1),0)/(xs.length*(xs.length-1));
}
/** @param {{indices:number[]}[]} source */
function fit(source) {
  let best={score:-Infinity,key:null,second:-Infinity};
  for(const a of units)for(let b=0;b<28;b++)for(let s=0;s<2;s++){
    const key={a,b,s};
    const plain=source.flatMap((p)=>decrypt(p.indices,key));
    const rating=score(plain);
    if(rating>best.score){best.second=best.score;best.score=rating;best.key=key;}
    else if(rating>best.second)best.second=rating;
  }
  return best;
}
const base=pages.map((p)=>({page:p.page,indices:p.indices}));
/** @param {{page:number,indices:number[]}[]} input */
function analyze(input) {
  return spans.map(([first,last],chapter)=>{
    const within=input.filter((p)=>p.page>=first && p.page<=last);
    const training=within.filter((p)=>p.page<last);
    const heldout=within.filter((p)=>p.page===last);
    const best=fit(training), decoded=within.map((p)=>({page:p.page,indices:decrypt(p.indices,best.key)}));
    for(let i=0;i<within.length;i++)
      assert.deepEqual(encrypt(decoded[i].indices,best.key),within[i].indices);
    const test=decoded.filter((p)=>p.page===last).flatMap((p)=>p.indices);
    const original=heldout.flatMap((p)=>p.indices);
    return {chapter,first,last,key:best.key,trainingLength:training.reduce((n,p)=>n+p.indices.length,0),
      heldoutLength:test.length,trainingScore:best.score,trainingRunnerUp:best.second,
      heldoutScore:score(test),untransformedHeldoutScore:score(original),heldoutIoc:ioc(test),
      decodedFirst40:decoded[decoded.length-1].indices.slice(0,40),
      reencryptionExact:true};
  });
}
const authentic=analyze(base);
const controlStarts=[146000,169000,191000], control=[];
for(let sample=0;sample<controlStarts.length;sample++){
  const reference=native.slice(controlStarts[sample],controlStarts[sample]+12956);
  assert.equal(reference.length,12956);
  let pos=0;
  const plainPages=base.map((p)=>{const part=reference.slice(pos,pos+p.indices.length);pos+=part.length;return{page:p.page,indices:part};});
  assert.equal(pos,12956);
  const infected=[], keys=[];
  for(let chapter=0;chapter<spans.length;chapter++){
    const [first,last]=spans[chapter], key={a:units[(chapter*7+sample*5+3)%12],
      b:(chapter*9+sample*11+17)%28,s:(chapter+sample)%2};
    keys.push(key);
    for(const p of plainPages.filter((p)=>p.page>=first && p.page<=last))
      infected.push({page:p.page,indices:encrypt(p.indices,key)});
  }
  const wins=analyze(infected), chapters=[];
  for(let j=0;j<spans.length;j++){
    const [first,last]=spans[j], selected=wins[j].key;
    const cipher=infected.filter((p)=>p.page>=first && p.page<=last);
    const truth=plainPages.filter((p)=>p.page>=first && p.page<=last);
    const decoded=cipher.flatMap((p)=>decrypt(p.indices,selected));
    const expected=truth.flatMap((p)=>p.indices);
    let correct=0;for(let i=0;i<decoded.length;i++)if(decoded[i]===expected[i])correct++;
    const check=decoded.filter((_,i)=>i>=expected.length-wins[j].heldoutLength);
    const nativeHeld=expected.slice(-wins[j].heldoutLength);
    chapters.push({chapter:j,hidden:keys[j],found:selected,
      exactKey:JSON.stringify(keys[j])===JSON.stringify(selected),
      correct,expected:expected.length,heldoutCorrect:check.filter((x,i)=>x===nativeHeld[i]).length,
      heldoutLength:nativeHeld.length,heldoutScore:wins[j].heldoutScore,
      sourceNativeHeldoutScore:score(nativeHeld)});
  }
  control.push({sourceStart:controlStarts[sample],chapters,
    exactKeys:chapters.filter((x)=>x.exactKey).length,correct:chapters.reduce((n,x)=>n+x.correct,0)});
}
assert.deepEqual(control.map((p)=>p.exactKeys),[9,8,9]);
assert.deepEqual(control.map((p)=>p.correct),[12956,12953,12956]);
assert.ok(authentic.every((p)=>p.heldoutScore<-12.8));
const nativeMin=Math.min(...control.flatMap((p)=>p.chapters.map((x)=>x.heldoutScore)));
assert.ok(nativeMin>-8.7);
const weighted=authentic.reduce((z,p)=>z+p.heldoutScore*p.heldoutLength,0)
  /authentic.reduce((z,p)=>z+p.heldoutLength,0);
// Wrong-layout control: merge original physical pages under the *known true*
// chapter-7 key of planted book 1, violating page-entry state resets.
const plant=controlStarts[0], source=native.slice(plant,plant+12956);
let cursor=0;
const pieces=base.map((p)=>{const z=source.slice(cursor,cursor+p.indices.length);cursor+=z.length;return{page:p.page,indices:z};});
const key=control[0].chapters[7].hidden;
const full=pieces.filter((p)=>p.page>=40 && p.page<=53);
const correctCipher=full.flatMap((p)=>encrypt(p.indices,key));
const wrong=decrypt(correctCipher,key);
const truth=full.flatMap((p)=>p.indices);
let wrongBoundaryMatch=0;for(let i=0;i<wrong.length;i++)if(wrong[i]===truth[i])wrongBoundaryMatch++;
assert.ok(wrongBoundaryMatch<truth.length);
console.log(JSON.stringify({
  model:'unchanged #823 672-key EA-repeat / parity-bit GP29 rotor',
  keyRule:'one independently fitted key per nine visible chapters; exact physical-page state resets',
  train:'all but last physical page of each chapter; last page entirely withheld',
  chapterLengths:lengths,keysPerChapter:672,
  original:{chapters:authentic,weightedHeldoutScore:weighted},
  blindNativePlants:control,allThreePlantsCorrect:control.reduce((n,p)=>n+p.correct,0),
  allThreePlantsLength:38868,wrongBoundaryControl:{chapter:'40-53',correct:wrongBoundaryMatch,total:truth.length},
  result:'All original heldout chapters remain ciphertext-like; scoped independent-chapter variant rejected under native-GP English.'
},null,2));
