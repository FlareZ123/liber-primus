'use strict';
/**
 * Original LP2 p51 WWP anchor gate: authentic p56 Euler totient,
 * plaintext-literal W transparency, first-word GPprime81 / Wprime19.
 * Single runnable Windows Node22 test with native solved and planted controls.
 *   node sims/lp2_p51_wwp19_81_transparent_phi_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const parts=read('resources/liber-primus/lp2-transcription.txt').split('%')
  .filter(page=>/[ᚠ-ᛡ]/u.test(page));
const runeIndex=new Map(book.runes.map((r,i)=>[r,i]));
const WORDS=/[ᚠ-ᛡ]+/gu;
function parseWords(page) {
  return page.replace(/[\r\n/]/g,'').split(/[-.]/)
    .map(x=>(x.match(WORDS)||[]).join('')).filter(Boolean)
    .map(w=>[...w].map(r=>{
      const i=runeIndex.get(r);
      assert.notEqual(i,undefined);
      return i;
    }));
}
const p51=parseWords(parts[50]);
const p56=parseWords(parts[55]);
const p57=parseWords(parts[56]);
assert.equal(p51.length,20);
assert.deepEqual(p51.flat(),book.pages[51].indices);
assert.deepEqual(p56.flat(),book.pages[56].indices);
assert.deepEqual(p57.flat(),book.pages[57].indices);
assert.deepEqual(p51[0],[7,7,13]);
assert.equal(p51[0].reduce((s,x)=>s+book.prime[x],0),81);
assert.equal(book.prime[7],19);
assert.equal(p51.length-1,19);
function primeShifts(N) {
  const result=[];
  for(let n=2;result.length<N;n++){
    let prime=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){prime=false;break;}
    if(prime)result.push((n-1)%29);
  }
  return result;
}
const shifts=primeShifts(1024);
const mod=x=>(x%29+29)%29;
const asRoman=words=>words.map(w=>w.map(i=>book.translit[i]).join(''));
function decodeAll(typedWords,marker,start,sign,reset) {
  let states=[{clock:start,plain:[]}];
  for(const word of typedWords) {
    const next=[];
    for(const state of states){
      let variants=[{clock:reset?start:state.clock,word:[]}];
      for(const symbol of word) {
        const temp=[];
        for(const variant of variants){
          if(symbol===marker)
            temp.push({clock:variant.clock,word:[...variant.word,marker]});
          const guess=mod(symbol+sign*shifts[variant.clock]);
          if(guess!==marker)
            temp.push({clock:variant.clock+1,word:[...variant.word,guess]});
        }
        variants=temp;
      }
      for(const variant of variants)
        next.push({clock:variant.clock,plain:[...state.plain,variant.word]});
    }
    states=next;
  }
  return states;
}
function encode(typedWords,marker,start,sign,reset) {
  let clock=start;
  return typedWords.map(word=>{
    if(reset)clock=start;
    return word.map(p=>{
      if(p===marker)return marker;
      const c=mod(p-sign*shifts[clock]);
      clock++;
      return c;
    });
  });
}
const gpTokens=book.translit.map((value,index)=>({value,index}))
  .sort((a,b)=>b.value.length-a.value.length);
function fromEnglish(english) {
  const out=[];
  for(const word of english.split(' ')){
    let rest=word,typed=[];
    while(rest){
      const found=gpTokens.find(t=>rest.startsWith(t.value));
      assert.ok(found,rest);
      typed.push(found.index);
      rest=rest.slice(found.value.length);
    }
    out.push(typed);
  }
  return out;
}
const expected=fromEnglish('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(expected.flat().length,85);
const p56Original=decodeAll(p56,0,0,-1,false);
assert.ok(p56Original.some(result=>JSON.stringify(result.plain.flat())===JSON.stringify(expected.flat())),
  'authentic p56 original-cipher plaintext must be recoverable');

const coda=p57.flat();
assert.equal(coda.length,95);
const originalDictionary=new Set([
  ...asRoman(expected),...asRoman(p57)
].filter(s=>s.length>=3));
function ioc(a) {
  const value=a.flat(),frequency=Array(29).fill(0);
  for(const x of value)frequency[x]++;
  return frequency.reduce((s,n)=>s+n*(n-1),0)/(value.length*(value.length-1));
}
let nativePlants=0;
const summary=[];
for(const [source,original] of [['bodyAfterWWP',p51.slice(1)],['fullWithWWP',p51]]){
  for(const marker of [7,0]){
    for(const start of [19,81]) {
      for(const sign of [-1,1]) {
        for(const reset of [false,true]) {
          const recovered=decodeAll(original,marker,start,sign,reset);
          const sentences=recovered.map(q=>({
            clock:q.clock,
            ioc:ioc(q.plain),
            words:asRoman(q.plain),
            knownWords:asRoman(q.plain).filter(w=>originalDictionary.has(w)).length
          }));
          sentences.sort((a,b)=>b.knownWords-a.knownWords||b.ioc-a.ioc);
          summary.push({
            source,marker:book.translit[marker],start,sign,
            clock:reset?'per-word':'continuous',variants:recovered.length,
            best:sentences[0]||null
          });
          // For every fixed family, a fully authentic GP-native planted
          // ciphertext survives under the exact same branch search.
          const plant=encode(p57,marker,start,sign,reset);
          const back=decodeAll(plant,marker,start,sign,reset);
          assert.ok(back.some(q=>JSON.stringify(q.plain.flat())===JSON.stringify(coda)),
            'planted true GP-native plaintext was lost');
          nativePlants++;
        }
      }
    }
  }
}
assert.equal(summary.length,32);
assert.equal(nativePlants,32);
const withWWP=summary.filter(r=>r.source==='fullWithWWP');
assert.equal(withWWP.filter(r=>r.variants>0).length,0);
const bodySurvivors=summary.filter(r=>r.source==='bodyAfterWWP'&&r.variants>0);
assert.deepEqual(bodySurvivors.map(r=>[r.marker,r.start,r.sign,r.clock,r.variants]),
  [['W',19,-1,'continuous',2],['F',19,1,'continuous',4],['F',81,-1,'continuous',8]]);
assert.ok(bodySurvivors.every(r=>r.best.knownWords===0));
assert.ok(bodySurvivors.every(r=>r.best.ioc<0.04));
console.log(JSON.stringify({
  source:{physicalP51:51,originalRunes:92,title:'WWP',p51FollowingWords:19,
    p56AuthenticPositive:{runes:85,phrase:'AN END WITHIN THE DEEP WEB ...',
      exactDecryption:'PASS'},solvedNativeP57Plants:nativePlants},
  family:{sources:['fullWithWWP','bodyAfterWWP'],markers:['W','F'],
    sourceKeyStarts:[19,81],signedInverseDirections:[-1,1],
    sourceVisibleClocks:['continuous','per-word'],testedFamilies:summary.length},
  result:{completePageCompatibleFamilies:0,bodyOnlyCompatibleFamilies:bodySurvivors.length,
    bodySurvivors,failedFamilies:summary.length-bodySurvivors.length},
  decision:'The exact p56 phi/F-transparent law, promoted to W plaintext transparency, cannot decode complete original p51 under any of 32 locked source-anchor variants. On the 19-word body three variants survive algebra but yield zero solved-native GP dictionary words and IoC less than0.04. These are only exclusions of this family, not a plaintext recovery.'
},null,2));
