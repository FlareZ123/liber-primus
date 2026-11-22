'use strict';
/**
 * Original LP2 p54–55 conditional-exception anti-repeat transport gate.
 * Node 22; CommonJS; single runnable test file (SFT).
 * Uses only committed original GP29 source/transcription and native controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} file @returns {string} */
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=n=>((n%29)+29)%29;
/** Source-observed lag-six affine map; not an authenticated cipher opcode. @param {number} x */
const T=x=>mod(24-2*x);
/** @param {number[]} plain @param {number} firstCipher */
function encrypt(plain,firstCipher){
 assert(plain.length>0);
 const out=[firstCipher];
 for(let i=1;i<plain.length;i++)out.push(mod(out[i-1]+plain[i]-T(plain[i-1])));
 return out;
}
/** @param {number[]} cipher @param {number} firstPlain */
function decrypt(cipher,firstPlain){
 assert(cipher.length>0);
 const out=[firstPlain];
 for(let i=1;i<cipher.length;i++)out.push(mod(T(out[i-1])+cipher[i]-cipher[i-1]));
 return out;
}
const rmap=new Map(corpus.runes.map((s,i)=>[s,i]));
const gp=new Map(corpus.translit.map((s,i)=>[s,i]));
/** GP29 longest-match orthography, following existing control normalization. @param {string} token */
function encodeWord(token){
 const s=token.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<s.length;){
  const pair=s.slice(i,i+2);
  if(gp.has(pair)){out.push(gp.get(pair));i+=2;}
  else{if(gp.has(s[i]))out.push(gp.get(s[i]));i++;}
 }
 return out;
}
/** @param {string} file */
function nativeRunes(file){
 const text=read(file).replace(/^#.*$/gm,'');
 return (text.match(/[A-Za-z]+/g)||[]).flatMap(encodeWord);
}
/** @param {string[]} paths */
function dictionary(paths){
 const s=new Set();
 for(const file of paths){
  const text=read(file).replace(/^#.*$/gm,'');
  for(const word of text.match(/[A-Za-z]+/g)||[]){
   const runes=encodeWord(word);
   if(runes.length>=4)s.add(runes.join(','));
  }
 }
 return s;
}
/** @param {number[]} a */
const print=a=>a.map(n=>corpus.translit[n]).join('/');
const parts=read('resources/lp2-transcription.txt').split('%');
/* Canonical physical p50 is runeless and omitted by this transcription.
   So physical p54 and p55 are transcription sections 53 and 54. */
const originalSection=parts.slice(53,55).join('');
const words=[];
let w=[];
for(const ch of originalSection){
 if(rmap.has(ch))w.push(rmap.get(ch));
 else if('-.&$§'.includes(ch)&&w.length){words.push(w);w=[];}
}
if(w.length)words.push(w);
const sourceCipher=corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(sourceCipher.length,308);
assert.equal(words.length,66);
assert.deepEqual(words.flat(),sourceCipher);
const sourceDoublets=sourceCipher.slice(1).reduce((n,x,i)=>n+Number(x===sourceCipher[i]),0);
assert.equal(sourceDoublets,3);

/* Full 29-symbol, all-state inverse: for each previous GP plain & cipher,
   28 nonzero steps and the repeat step 0 are all uniquely reversible. */
let branchChecks=0;
for(let previousPlain=0;previousPlain<29;previousPlain++)
 for(let previousCipher=0;previousCipher<29;previousCipher++)
  for(let nextPlain=0;nextPlain<29;nextPlain++){
   const out=mod(previousCipher+nextPlain-T(previousPlain));
   const back=mod(T(previousPlain)+out-previousCipher);
   assert.equal(back,nextPlain);
   assert.equal(out===previousCipher,nextPlain===T(previousPlain));
   branchChecks++;
  }
assert.equal(branchChecks,24389);

/* Original-authenticated solved p57 is a 95-rune positive control. */
const positiveP57=corpus.pages[57].indices;
assert.equal(positiveP57.length,95);
assert.deepEqual(decrypt(encrypt(positiveP57,positiveP57[0]),positiveP57[0]),positiveP57);

/* Independent, original-source p54-55 inverse. Precommitted seed is
   P0=C0 (no offset); all other 28 seeds are shown only as exclusions. */
const referencePaths=[
 'resources/liber-primus/lp1-plaintext-reference.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt'
];
const lexicon=dictionary(referencePaths);
const trials=[];
for(let iv=0;iv<29;iv++){
 const plain=decrypt(sourceCipher,iv);
 assert.deepEqual(encrypt(plain,sourceCipher[0]),sourceCipher);
 let pos=0,eligible=0,hits=[];
 const recoveredWords=words.map(word=>{
  const segment=plain.slice(pos,pos+word.length);
  pos+=word.length;
  if(segment.length>=4){
   eligible++;
   if(lexicon.has(segment.join(',')))hits.push({word:print(segment),position:pos-segment.length});
  }
  return print(segment);
 });
 assert.equal(pos,308);
 trials.push({iv,matchCount:hits.length,eligible,hits,translit:recoveredWords.join(' | ')});
}
const ranked=trials.slice().sort((a,b)=>b.matchCount-a.matchCount||a.iv-b.iv);
assert.equal(ranked[0].matchCount,1);
assert.equal(ranked[0].iv,1);
assert.equal(trials[sourceCipher[0]].matchCount,0);
const plainControls=referencePaths.slice(0,2).map(file=>{
 const r=nativeRunes(file);
 let observed=0;
 for(let i=1;i<r.length;i++)observed+=Number(r[i]===T(r[i-1]));
 const plant=r.slice(0,308),cipher=encrypt(plant,plant[0]);
 assert.deepEqual(decrypt(cipher,plant[0]),plant);
 const doublets=cipher.slice(1).reduce((n,x,i)=>n+Number(x===cipher[i]),0);
 return {file,sourceRunes:r.length,conditionHits:observed,
         conditionRate:observed/(r.length-1),plantedDoublets:doublets};
});
console.log(JSON.stringify({
 hypothesis:'C[i]=C[i-1]+P[i]-T(P[i-1]) mod 29; T(x)=24-2x mod 29',
 status:'source-motivated diagnostic; no LP2 plaintext or authentic key recovered',
 original:{pages:[54,55],runes:308,printedWords:words.length,doublets:sourceDoublets,
           candidates:29,wordsLengthAtLeastFour:39,maxDictionaryMatches:ranked[0].matchCount,
           initialZeroOffsetSeed:sourceCipher[0]},
 exactAllStateBranchChecks:branchChecks,
 originalKeyless:trials[sourceCipher[0]],
 bestOtherSeed:ranked[0],
 nativeControls:plainControls,
 solvedP57Positive:positiveP57.length
},null,2));
