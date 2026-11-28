'use strict';
// Search the *unseen* original p55 13-rune word against a fixed independent
// literary dictionary. Freeze terminal crib "THE END" and q7 recurrence
// before looking at any unknown original decoder's outputs.
// Conditional and exploratory: neither terminal nor the q7 law is verified.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {recover,encrypt,decrypt,p55,donor,C,norm,terminal}=require('./lp2_p55_disjoint_13_6_crib_lfsr7_sft.cjs');
const sourceFiles=[
 'resources/control/english_wordfreq_textblob.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt',
 'resources/control/blake_song_of_liberty_train.txt'
];
const gp=Object.fromEntries(C.translit.map((x,i)=>[x,i]));
const normalize={'K':'C','Q':'C','V':'U','Z':'S'};
function raw13(word){
 assert.equal(word.length,13);
 return [...word].map(ch=>{
  const x=gp[normalize[ch]||ch];assert.notEqual(x,undefined);return x;
 });
}
const dictionary=new Map();
let totalWords=0;
for(const fname of sourceFiles){
 const text=fs.readFileSync(path.join(root,fname),'utf8');
 for(const match of text.match(/[A-Za-z]+/g)||[]){
  if(match.length!==13)continue;totalWords++;
  const word=match.toUpperCase();
  const P=raw13(word),key=P.join(',');
  if(!dictionary.has(key))dictionary.set(key,{P,word,aliases:new Set(),sources:new Set()});
  dictionary.get(key).aliases.add(word);dictionary.get(key).sources.add(fname);
 }
}
const entries=[...dictionary.values()].sort((a,b)=>a.word.localeCompare(b.word));
assert(entries.length>100);
assert(entries.some(x=>x.word==='ENLIGHTENMENT'));
const laws=['direct','feedback','beaufort'];
const forms=[['THEEND',terminal],['ENDTHE',raw13('ENDTHE')],['EHTDNE',raw13('EHTDNE')]];
const hist=(arr)=>arr.reduce((o,x)=>{o[x]=(o[x]||0)+1;return o;},{});
function score(Cipher,tail){
 const matches=[],bestRows=[],scores=[];
 for(const law of laws){
  let best=0,bestWords=[];
  for(const e of entries){
   const r=recover(Cipher,e.P,tail,law);
   assert.equal(r.dim,1);
   if(r.best>best){best=r.best;bestWords=[e.word]}
   else if(r.best===best&&bestWords.length<10)bestWords.push(e.word);
   scores.push(r.best);
   for(const hit of r.survivors){
    const out={word:e.word,aliases:[...e.aliases].sort(),law,
     coefficients:hit.a,parameter:hit.t,keyRecoverable:hit.prefixDecoded};
    if(hit.prefixDecoded){
     const P=decrypt(Cipher,hit.key,law);
     assert.deepEqual(encrypt(P,hit.key,law),Cipher);
     const cuts=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3],chunks=[];let k=0;
     for(const len of cuts){chunks.push(P.slice(k,k+len).map(i=>C.translit[i]).join(''));k+=len;}
     out.decoded=chunks.join(' ');
    }
    matches.push(out);
   }
  }
  bestRows.push({law,bestMatchingOf6:best,exampleWords:bestWords});
 }
 return{matches,bestRows,distribution:hist(scores)};
}
const original=score(p55,terminal),decoys=[];
for(let i=1;i<forms.length;i++){
 const r=score(p55,forms[i][1]);
 decoys.push({terminal:forms[i][0],hits:r.matches.length,best:r.bestRows});
}
// Three actual plaintext-recovery positive controls against independent
// solved-p57 donor runes; replace ONLY 13+6 positions with known lexical cribs.
const candidate=entries[Math.floor(entries.length/3)];
const P=donor.slice();P.splice(23,13,...candidate.P);P.splice(70,6,...terminal);
const correctCoeffs=[1,4,2,3,8,6,9],K=[2,3,5,7,11,13,17];
for(let i=7;i<76;i++)K[i]=norm(correctCoeffs.reduce((s,a,j)=>s+a*K[i-j-1],0));
const plants=[];
for(const law of laws){
 const cipher=encrypt(P,K,law);
 const result=score(cipher,terminal);
 const good=result.matches.filter(m=>m.word===candidate.word&&m.law===law);
 assert.equal(result.matches.length,1,'dictionary plant should identify the only full matching cipher and word');
 assert.equal(good.length,1);
 assert.deepEqual(good[0].coefficients,correctCoeffs);
 const inferred=recover(cipher,candidate.P,terminal,law).survivors[0];
 assert.deepEqual(decrypt(cipher,inferred.key,law),P);
 plants.push({law,word:candidate.word,uniqueDictionarySolution:true,
  recoveredUnexposedRunes:57,totalRecovered:76});
}
console.log(JSON.stringify({
 input:'unchanged original physical LP2 p55',
 candidateLexicon:{sources:sourceFiles,raw13WordOccurrences:totalWords,
  distinctNormalizedRaw13Patterns:entries.length},
 encodedRegister:'one rune per Latin letter; K/Q→C, V→U, Z→S; no TH/NG digraph contractions',
 conditionalTerminal:'THEEND',terminalIndexes:[70,75],
 model:'order-7 GF(29) affine-one-parameter LFSR from p55 word7 at offsets23..35',
 original:{fullSixOfSixMatches:original.matches.length,
  exactCandidateDetails:original.matches,
  modelWiseBest:original.bestRows,
  bestScoreDistribution:original.distribution},
 shuffledTerminals:decoys,positiveNativeControls:plants,
 caveat:'The original plaintext and key remain unknown unless authentic full-length output is verified independently'
},null,2));
