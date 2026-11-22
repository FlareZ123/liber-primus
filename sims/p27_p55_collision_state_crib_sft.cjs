'use strict';
/**
 * Independent source-locked p27/p55 6-rune collision state-crib gates.
 * Usage: node sims/p27_p55_collision_state_crib_sft.cjs
 *
 * Inputs: authentic LP2 GP29 indices, original separators, TextBlob English
 * word-frequency lexicon, and independently solved LP2 p56 plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt').split('%');
const wordFreq = read('resources/control/english_wordfreq_textblob.txt');
const p27=corpus.pages[27].indices, p55=corpus.pages[55].indices, p56=corpus.pages[56].indices;
const mod = x => (x%29+29)%29;
assert.deepEqual([p27.length,p55.length,p56.length],[234,76,85]);
assert.deepEqual(p27.slice(28,34),p55.slice(70,76));
assert.deepEqual(p27.slice(28,35),p55.slice(70).concat(p56.slice(0,1)));
assert.deepEqual(p27.slice(28,34),[23,11,1,17,18,10]);

/** @param {number} physicalPage @returns {Array<{start:number,length:number,runes:string}>} */
function printedWords(physicalPage) {
  const raw=transcript[physicalPage<50?physicalPage:physicalPage-1];
  const words=[];
  let runePos=0,start=0,token='';
  function finish(){if(token){words.push({start,length:token.length,runes:token});token='';}}
  for(const ch of raw) {
    if(/[\u16a0-\u16ff]/u.test(ch)){if(!token)start=runePos;token+=ch;runePos++;}
    else if(ch==='/'||/\s/u.test(ch)) continue;
    else finish();
  }
  finish();
  return words;
}
const w27=printedWords(27),w55=printedWords(55);
assert.deepEqual(w27.filter(w=>w.start<34).map(w=>w.length),[3,12,4,7,2,3,3]);
assert.deepEqual(w55.filter(w=>w.start>=42).map(w=>w.length),[4,2,7,7,2,6,3,3]);
assert.deepEqual(w27.filter(w=>w.start<34).map(w=>w.start),[0,3,15,19,26,28,31]);
assert.deepEqual(w55.filter(w=>w.start>=42).map(w=>w.start),[42,46,48,55,62,64,70,73]);

// The source-frozen alignment puts p27 [0,34) over p55 [42,76).
// The 7 original positions p27 [6,13) meet complete p55 word [48,55),
// while belonging to the p27 long word [3,15). Key reuse would force:
// (plaintext p27 12-rune word)[3..10) - (plaintext p55 7-rune word)
//       = (original p27[6..13] - original p55[48..55]) (mod29).
const delta=Array.from({length:7},(_,i)=>mod(p27[6+i]-p55[48+i]));
assert.deepEqual(delta,[25,7,27,14,4,6,24]);
const alphabet=corpus.translit.map((token,index)=>({token,index}));
/** @param {string} word @returns {string} */
const normalize=w=>w.replace(/QU/g,'CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');

/** @type {Map<string,{word:string,g:number[]}>} */
const form7=new Map(),form12=new Map();
let dictionaryWords=0;
for(const line of wordFreq.split(/\r?\n/)){
  const m=/^([a-z]+)\s+(\d+)$/.exec(line);
  if(!m)continue;
  dictionaryWords++;
  const word=m[1].toUpperCase();
  const norm=normalize(word);
  for(const letters of new Set([norm,norm.replace(/ING/g,'NG')])){
    for(const [target,out] of [[7,form7],[12,form12]]){
      if(letters.length<target||letters.length>2*target)continue;
      /** @type {number[]} */
      const current=[];
      /** @param {number} at */
      function visit(at){
        if(current.length>target || current.length+letters.length-at<target)return;
        if(at===letters.length){
          if(current.length!==target)return;
          const key=current.join(',');
          if(!out.has(key))out.set(key,{word,g:current.slice()});
          return;
        }
        for(const {token,index} of alphabet){
          if(letters.startsWith(token,at)){
            current.push(index);
            visit(at+token.length);
            current.pop();
          }
        }
      }
      visit(0);
    }
  }
}
assert.equal(dictionaryWords,29157);
assert.equal(form7.size,7211);
assert.equal(form12.size,1328);
const sig=x=>x.join(',');
const sigA=x=>sig(x.slice(3,10).map((r,i)=>mod(r-delta[i])));
const candidatesB=new Set([...form7.values()].map(x=>sig(x.g)));
const matches=[...form12.values()].filter(x=>candidatesB.has(sigA(x.g)));
assert.deepEqual(matches,[]);

// Positive source-native two-time-pad plant. The transformed signature must
// find the exact original 12-rune and 7-rune plaintext forms under a known
// common 7-rune key, with no fitted dictionary tokens.
const plantA=form12.values().next().value.g;
const plantB=form7.values().next().value.g;
const key=Array.from({length:7},(_,i)=>(3+5*i)%29);
const cipherA=plantA.slice(3,10).map((v,i)=>mod(v+key[i]));
const cipherB=plantB.map((v,i)=>mod(v+key[i]));
const plantDifference=cipherA.map((v,i)=>mod(v-cipherB[i]));
assert.deepEqual(plantDifference,plantA.slice(3,10).map((v,i)=>mod(v-plantB[i])));
assert.deepEqual(plantA.slice(3,10).map((v,i)=>mod(v-plantDifference[i])),plantB);

// Independently solved p56 native-GP text and its authentic phi(prime) mask.
const p56Words='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
/** @param {string} phrase @returns {number[]} */
function toGp(phrase){
  const sorted=alphabet.slice().sort((a,b)=>b.token.length-a.token.length);
  const out=[];
  for(const word of phrase.split(' ')){
    for(let i=0;i<word.length;){
      const match=sorted.find(({token})=>word.startsWith(token,i));
      assert.ok(match,'GP spelling source word '+word);
      out.push(match.index);
      i+=match.token.length;
    }
  }
  return out;
}
const p56Plain=toGp(p56Words);
assert.equal(p56Plain.length,85);
assert.deepEqual(p56Plain.slice(0,6),[24,9,18,9,23,7]);
assert.deepEqual(p56.slice(0,6).map((v,i)=>mod(v-p56Plain[i])),[1,2,4,6,10,12]);
const knownKey=p56.map((v,i)=>mod(v-p56Plain[i]));
const preceding=p55.slice(70,76).concat(p56);

/** @param {number[][]} rows @returns {number} */
function rank(rows) {
  const a=rows.map(x=>x.map(mod));
  let r=0;
  for(let col=0;col<a[0].length && r<a.length;col++){
    let lead=r;
    while(lead<a.length&&a[lead][col]===0)lead++;
    if(lead===a.length)continue;
    [a[r],a[lead]]=[a[lead],a[r]];
    const k=Array.from({length:29},(_,j)=>j).find(k=>mod(k*a[r][col])===1);
    assert.notEqual(k,undefined);
    for(let j=col;j<a[0].length;j++)a[r][j]=mod(a[r][j]*k);
    for(let i=r+1;i<a.length;i++)if(a[i][col]){
      const coefficient=a[i][col];
      for(let j=col;j<a[0].length;j++)a[i][j]=mod(a[i][j]-coefficient*a[r][j]);
    }
    r++;
  }
  return r;
}
const feedback=[];
for(let q=1;q<=6;q++){
  // q is selected by the exactly repeated six-rune source context.
  // The entire key law has q+1 unknown coefficients, including intercept.
  const rows=[];
  for(let i=0;i<85;i++){
    // Ciphertext F at index56 is literal and does not consume the known
    // phi(prime) key. Grant a free exception at this original position.
    if(i===56)continue;
    const history=Array.from({length:q},(_,j)=>preceding[6+i-(j+1)]);
    rows.push({x:[1,...history],y:knownKey[i]});
  }
  const aRank=rank(rows.map(x=>x.x));
  const augmentedRank=rank(rows.map(x=>[...x.x,x.y]));
  assert.equal(aRank,q+1);
  assert.equal(augmentedRank,q+2,'known p56 plaintext obstructs stationary affine CFB with q<=6');
  // Source-native synthetic control: build an actual affine-feedback ciphertext,
  // recover its exact consistency on the same physical p56 plaintext.
  const coefficients=Array.from({length:q+1},(_,i)=>(i*3+2)%29);
  const artificial=p55.slice(70,76);
  const fitted=[];
  for(let i=0;i<p56Plain.length;i++){
    const context=[1,...Array.from({length:q},(_,j)=>artificial[6+i-(j+1)])];
    const k=mod(context.reduce((sum,v,j)=>sum+v*coefficients[j],0));
    artificial.push(mod(p56Plain[i]+k));
    fitted.push({x:context,y:k});
  }
  assert.equal(rank(fitted.map(x=>x.x)),rank(fitted.map(x=>[...x.x,x.y])));
  feedback.push({history:q,unknownCoefficients:q+1,knownPositions:84,
    coefficientRank:aRank,augmentedRank,realSourceConsistent:false,
    plantedSourceConsistent:true});
}

// If the same unknown deterministic ciphertext-history function operates
// without resetting across both source sites and p56, the exact seven-rune
// match forces p27 position34 to have p56's first plaintext rune A. For a
// stationary additive CFB keystream whose state sees only the preceding six
// symbols, the next key is additionally shared, implying p27 index35 -> IA.
// The source supplies no such cross-chapter shared-function instruction.
const conditionalNextTwo=[p56Plain[0],mod(p27[35]-knownKey[1])];
assert.deepEqual(conditionalNextTwo,[24,27]);
console.log(JSON.stringify({
  source:'Original p27/p55 complete-word collision, original p55->p56 seam, solved p56 native GP plaintext',
  collision:{p27Offset:28,p55Offset:70,indices:p27.slice(28,34),seventhCipher:p56[0],p27NextRune:p27[34]},
  alignment:{p27Start:0,p55Start:42,commonCipherSymbols:34,
    obstructingOriginalOverlap:{p27LongWordStart:3,p55SevenWordStart:48,
      delta7:delta},words27:w27.slice(0,7).map(x=>x.length),
    words55:w55.slice(-8).map(x=>x.length)},
  lexicon:{source:'resources/control/english_wordfreq_textblob.txt',words:dictionaryWords,
    GPSpellingVariants:'all 29-symbol tokenizations; ING contracted or expanded',
    GP12Forms:form12.size,GP7Forms:form7.size,matchingSevenRunePairs:matches.length,
    nativeGpTwoTimePadPlant:true},
  p56:{knownPlainFirstSix:p56Plain.slice(0,6),knownPhiKeysFirstSix:knownKey.slice(0,6),
    literalFSkipAt56:true,feedback,conditionalNextTwo},
  decision:'A 34-rune reused additive key cannot give both aligned GP-English words from this pinned broad lexicon. A stationary affine ciphertext-history continuation of orders1..6 cannot generate solved p56, even exempting its literal F; no authenticated full state or plaintext follows from the short collision.'
},null,2));
