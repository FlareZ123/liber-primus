'use strict';
/**
 * Original-source p55 test of the 2014 reconstructed Atbash-order+3 layer
 * composed with the authentic p56 prime-totient / plaintext-F-transparent
 * cipher. Read-only Windows Node22 SFT, no key or orientation search.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page=id=>gp.pages.find(x=>x.page===id).indices;
const mod=x=>((x%29)+29)%29;
const atbash3=i=>mod(2-i);
const primes=[];
for(let value=2;primes.length<500;value++){
  let prime=true;
  for(let d=2;d*d<=value;d++)if(value%d===0){prime=false;break;}
  if(prime)primes.push(value-1);
}
assert.deepEqual(primes.slice(0,7),[1,2,4,6,10,12,16]);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} sentence @returns {number[]} */
function encodeSentence(sentence){
  const out=[];
  for(const word of sentence.split(' ')){
    for(let i=0;i<word.length;){
      const tok=tokens.find(t=>word.startsWith(t.s,i));
      assert(tok,'No historical GP rune for '+word.slice(i));
      out.push(tok.i);i+=tok.s.length;
    }
  }
  return out;
}
/** @param {number[]} plain @returns {number[]} */
function encryptPhi(plain){
  let k=0;return plain.map(v=>v===0?0:mod(v+primes[k++]));
}
const known='AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(encryptPhi(encodeSentence(known)),page(56),
  'Authentic solved p56 ciphertext must re-encrypt 85/85');
const clear=page(57);assert.equal(clear.length,95);
/**
 * Enumerate every complete plaintext-F-bypass path with exact prime phase0.
 * @param {number[]} cPhi
 * @returns {{plain:number[],phase:number,bypass:number[]}[]}
 */
function allPhiInverses(cPhi){
  let states=[{plain:[],phase:0,bypass:[]}];
  for(let i=0;i<cPhi.length;i++){
    const c=cPhi[i],next=[];
    for(const s of states){
      if(c===0)next.push({plain:s.plain.concat(0),phase:s.phase,bypass:s.bypass.concat(i)});
      const candidate=mod(c-primes[s.phase]);
      if(candidate!==0)next.push({plain:s.plain.concat(candidate),phase:s.phase+1,bypass:s.bypass});
    }
    states=next;
    if(!states.length)break;
  }
  return states.filter(s=>s.plain.length===cPhi.length);
}
const synth=encryptPhi(clear).map(atbash3);
const recovered=allPhiInverses(synth.map(atbash3));
assert.ok(recovered.some(s=>JSON.stringify(s.plain)===JSON.stringify(clear)),
  'Full 95-rune native-GP plant must be recovered');
const C55=page(55);assert.equal(C55.length,76);
const transcription=read('resources/liber-primus/lp2-transcription.txt').split('%')[54];
const runeMap=new Map(gp.runes.map((r,i)=>[r,i]));
const wordLengths=transcription.split(/[-.&$§]/)
 .map(s=>[...s].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c)))
 .filter(arr=>arr.length).map(arr=>arr.length);
assert.deepEqual(wordLengths,[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(wordLengths.reduce((a,b)=>a+b,0),76);
const dict=new Set(read('resources/control/english_wordfreq_textblob.txt')
 .split(/\r?\n/).map(line=>line.split(/\s+/)[0]));
/** @param {number[]} values @returns {string[]} */
function romanWords(values){
  let pos=0;
  return wordLengths.map(n=>{
    const word=values.slice(pos,pos+n).map(i=>gp.translit[i]).join('');
    pos+=n;
    return word;
  });
}
/** @param {number[]} values @returns {number} */
function ioc(values){
  const counts=Array(29).fill(0);
  for(const n of values)counts[n]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/** @param {number[]} rawCipher */
function candidates(rawCipher){
  return allPhiInverses(rawCipher.map(atbash3));
}
const actual=candidates(C55);
assert.equal(actual.length,6);
assert.deepEqual(actual.map(s=>s.bypass),[[13,58,59,62],[13],[58],[59],[62],[]]);
for(const s of actual)
  assert.deepEqual(encryptPhi(s.plain).map(atbash3),C55,
    'Every inverse candidate must re-encrypt original p55');
const results=actual.map(s=>{
  const words=romanWords(s.plain);
  return {
    FBypassPositions:s.bypass,keyDigitsConsumed:s.phase,
    fullInverse:true,ioc:ioc(s.plain),
    dictionaryWords:words.filter(w=>dict.has(w.toLowerCase())).length,
    dictionaryLong:words.filter(w=>w.length>=4&&dict.has(w.toLowerCase())).length,
    literalWords:words
  };
});
assert.equal(results.reduce((n,x)=>n+x.dictionaryLong,0),0);
const rotations=Array.from({length:76},(_,i)=>{
  const rotated=C55.slice(i).concat(C55.slice(0,i));
  return candidates(rotated).length;
});
assert.equal(rotations.filter(x=>x>0).length,27);
assert.equal(rotations[0],6);
console.log(JSON.stringify({
  status:'NO AUTHENTIC UNKNOWN PLAINTEXT',
  hypothesis:'2014 participant Atbash-order+3 then p56 prime-totient/F skip',
  source:'original 76-rune p55, all 17 printed words intact',
  p56AuthenticControl:85,p57SyntheticTransparentPlant:95,
  originalP55Candidates:results,
  rotatedOriginalPositiveCount:27,rotationsTested:76,
  decision:'Six full original p55 inverse paths have no dictionary words of length >=4 and GP29-uniform marginals; 27/76 frozen source rotations are also feasible. No credible unknown-page plaintext or source-selected two-layer opcode.'
},null,2));
