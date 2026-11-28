'use strict';
/*
 * Recover entire original p55 under a source-native 13-word GF(29) q7 law
 * WITHOUT asserting that its six-rune ending is THE END. Fits only the
 * 13-rune word7 dictionary identity; other 15 groups are withheld controls.
 * A correct family must recover a coherent 76-rune original and survive
 * exactly-length-matched solved-native plants.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const {solveAffine,expandKey,knownKey,encrypt,decrypt,p55,C,norm}=
 require('./lp2_p55_disjoint_13_6_crib_lfsr7_sft.cjs');
const sources=[
 'resources/control/english_wordfreq_textblob.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/shakespeare_first300k.txt',
 'resources/control/emerson_essays_2944.txt',
 'resources/liber-primus/lp1-plaintext-reference.txt',
 'resources/control/blake_song_of_liberty_train.txt'
];
const lengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const offsets=(()=>{let p=1;return lengths.map(w=>{let a=p;p+=w;return a;})})();
assert.deepEqual([offsets[6],offsets[7],offsets[14],offsets[15]+lengths[15]],[23,36,70,76]);
const lex=new Map(),bylen=new Map();
for(const file of sources){
 const raw=fs.readFileSync(path.join(root,file),'utf8');
 for(const word of raw.match(/[A-Za-z]+/g)||[]){
  const P=encodeSourceNativeGP(word.toLowerCase());
  if(P.length<2||P.length>13)continue;
  const key=P.join(',');
  if(lex.has(key))continue;
  const entry={P,word:word.toUpperCase(),file};
  lex.set(key,entry);
  if(!bylen.has(P.length))bylen.set(P.length,[]);
  bylen.get(P.length).push(entry);
 }
}
for(const l of lengths)assert((bylen.get(l)||[]).length>0);
const sorted=x=>x.slice().sort((a,b)=>a.word<b.word?-1:a.word>b.word?1:0);
const cribs=sorted(bylen.get(13));
assert(cribs.length>100);
const laws=['direct','feedback','beaufort'];
function evaluate(cipher,oracle){
 const result={cribs:cribs.length,keysTested:0,rankFailures:0,
  bestOtherWordMatches:0,maxOtherLongMatches:0,fullOriginalCandidates:[],bestSix:[],
  exactOracleRecoveries:0};
 for(const law of laws)for(const crib of cribs){
  const known=crib.P.map((p,i)=>knownKey(cipher,p,23+i,law));
  const sol=solveAffine(known);
  if(!sol||sol.rank!==6||sol.free.length!==1){result.rankFailures++;continue;}
  for(let t=0;t<29;t++){
   const coefficients=sol.a.map((a,i)=>norm(a+t*sol.v[i]));
   if(coefficients[6]===0)continue;
   const {K,prefixDecoded}=expandKey(known,coefficients);
   assert(prefixDecoded);
   const clear=decrypt(cipher,K,law);
   assert.deepEqual(encrypt(clear,K,law),cipher);
   assert.deepEqual(clear.slice(23,36),crib.P);
   result.keysTested++;
   let other=0,long=0;
   const names=[];
   for(let i=0;i<16;i++){
    if(i===6)continue;
    const fragment=clear.slice(offsets[i],offsets[i]+lengths[i]).join(',');
    const found=lex.get(fragment);
    if(found){other++;if(lengths[i]>=6)long++;names.push((i+1)+':'+found.word);}
   }
   if(oracle&&clear.every((x,i)=>x===oracle[i])){
    result.exactOracleRecoveries++;
    assert.equal(other,15);
   }
   result.bestOtherWordMatches=Math.max(result.bestOtherWordMatches,other);
   result.maxOtherLongMatches=Math.max(result.maxOtherLongMatches,long);
   const entry={law,word13:crib.word,t,coefficients,other,long,names};
   if(other>=9&&long>=2){
    entry.candidateClear=clear.map(i=>C.translit[i]).join(' ');
    result.fullOriginalCandidates.push(entry);
   }
   const tiebreak=result.bestSix.length===0||other>result.bestSix[result.bestSix.length-1].other||
    (other===result.bestSix[result.bestSix.length-1].other&&long>result.bestSix[result.bestSix.length-1].long);
   if(result.bestSix.length<6||tiebreak){
    result.bestSix.push(entry);
    result.bestSix.sort((a,b)=>b.other-a.other||b.long-a.long||a.word13.localeCompare(b.word13));
    if(result.bestSix.length>6)result.bestSix.pop();
   }
  }
 }
 return result;
}
const original=evaluate(p55);
const P=[C.pages.find(x=>x.page===57).indices[0]],sourceWords=[];
for(let i=0;i<16;i++){
 const choices=sorted(bylen.get(lengths[i]));
 const selected=choices[(7+3301*i)%choices.length];
 P.push(...selected.P);
 sourceWords.push({w:i+1,sourceWord:selected.word,gpLength:lengths[i]});
}
assert.equal(P.length,76);
const key=[2,3,5,7,11,13,17],coefficients=[1,4,2,3,8,6,9];
for(let i=7;i<76;i++)key[i]=norm(coefficients.reduce((z,a,j)=>z+a*key[i-j-1],0));
const nativePlants=[];
for(const law of laws){
 const cipher=encrypt(P,key,law),result=evaluate(cipher,P);
 assert.equal(result.exactOracleRecoveries,1);
 assert.equal(result.bestOtherWordMatches,15);
 assert(result.fullOriginalCandidates.some(x=>x.other===15));
 nativePlants.push({law,sourceGP29PlaintextRecovered:76,exactOracleRecoveries:result.exactOracleRecoveries,
  candidatesTested:result.keysTested,bestOtherWordMatches:result.bestOtherWordMatches});
}
console.log(JSON.stringify({
 scope:'original p55, fixed 76 ciphertext runes, 16 complete printed groups + one p54 carry',
 hypothesis:'page-continuous GF29 seven-tap key; unknown 13-rune dictionary word7',
 sourceLexicon:sources,lexiconPatterns:lex.size,word13:cribs.length,
 original,nativePlants,positiveWords:sourceWords,
 status:'No claim that original printed ciphertext groups are plaintext words; controls only test exact conditional family'
},null,2));