"use strict";
/**
 * Entire p55 shell+interior affine/dihedral native-word gate.
 *
 * Each published complete word can secretly select its own invertible GP29
 * affine alphabet and its own cyclic orientation and reversal. Unlike an
 * interior-only mask, EVERY rune in the original 76-symbol page, including
 * all 33 exterior positions, is allowed to change. The first singleton is
 * a real continued p54 word and is not asserted to be a p55 whole word.
 *
 * Windows Node22 read-only: node sims/lp2_p55_wholeword_affine_dihedral_allkeys_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} name */
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source=gp.pages.find(x=>x.page===55).indices;
const sizes=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(source.length,76);
assert.equal(sizes.reduce((a,b)=>a+b,0),76);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** Historical GP rune spelling, cross-checked against solved-material source. @param {string} text */
function nativeGP(text){
 const w=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
   .replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let i=0;i<w.length;){
  if(w.startsWith("ING",i)){out.push(21);i+=3;}
  else if(w.startsWith("IO",i)){out.push(27);i+=2;}
  else {
   const found=tokens.find(t=>w.startsWith(t.s,i));
   assert(found,"unknown source English letter");
   out.push(found.i);i+=found.s.length;
  }
 }
 return out;
}
assert.deepEqual(nativeGP("IN"),[10,9]);
assert.deepEqual(nativeGP("THE"),[2,18]);
assert.equal(nativeGP("PERTINACIOUSLY").length,13);
assert.equal(new Set(nativeGP("PERTINACIOUSLY")).size,13);
const corpora=[
 "resources/control/shakespeare_first300k.txt",
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/english_wordfreq_textblob.txt"
];
/** @type {Map<number, Map<string,string>>} */
const dictionary=new Map();
const counts=[];
for(const name of corpora){
 const wordTokens=read(name).match(/[A-Za-z]+/g)||[];
 for(const word of wordTokens){
  const values=nativeGP(word);
  const length=values.length;
  if(!dictionary.has(length))dictionary.set(length,new Map());
  const key=values.join(",");
  if(!dictionary.get(length).has(key))dictionary.get(length).set(key,word);
 }
 counts.push([name,wordTokens.length]);
}
assert.equal(dictionary.get(13).size,422);
/** @param {number[]} values @param {boolean} reversed @param {number} shift */
function orient(values,reversed,shift){
 const base=reversed?values.slice().reverse():values;
 return base.map((_,i)=>base[(i+shift)%base.length]);
}
/**
 * An affine map over GP29 has 28 invertible multipliers and 29 offsets. For a
 * word of length L grant all 2L cyclic/reversed orientations independently.
 * Return exact unique native-GP target identities.
 * @param {number[]} word
 * @param {boolean} allowDihedral
 */
function candidates(word,allowDihedral){
 const lex=dictionary.get(word.length)||new Map();
 const matches=new Map();
 for(let rev=0;rev<(allowDihedral?2:1);rev++){
  for(let rot=0;rot<(allowDihedral?word.length:1);rot++){
   const v=orient(word,Boolean(rev),rot);
   for(let mult=1;mult<29;mult++)for(let add=0;add<29;add++){
    const key=v.map(x=>(x*mult+add)%29).join(",");
    if(lex.has(key) && !matches.has(key))
      matches.set(key,{word:lex.get(key),mult,add,rev,rot});
   }
  }
 }
 return matches;
}
const fullWords=[];
let offset=0;
for(let i=0;i<sizes.length;i++){
 const original=source.slice(offset,offset+sizes[i]);
 fullWords.push({fragment:i,offset,size:sizes[i],cipher:original});
 offset+=sizes[i];
}
assert.equal(offset,76);
const normal=[],dihedral=[];
for(const item of fullWords){
 const base=candidates(item.cipher,false),all=candidates(item.cipher,true);
 assert(all.size>=base.size);
 normal.push(base.size);
 dihedral.push(all.size);
}
assert.deepEqual(normal,
 [26,3,187,187,0,0,187,0,0,2,187,0,0,187,0,26,28]);
assert.deepEqual(dihedral,
 [26,23,187,187,0,0,187,0,0,16,187,0,0,187,1,175,175]);
const noEnglish=[4,5,7,8,11,12];
assert.deepEqual(fullWords.filter((_,i)=>i>0 && dihedral[i]===0).map(x=>x.fragment),noEnglish);
const originalUnmatchableRunes=noEnglish.reduce((sum,i)=>sum+sizes[i],0);
assert.equal(originalUnmatchableRunes,45);
/**
 * Positive: affine-encrypt one real source-native dictionary word of
 * each exact original complete-word size, independently invert using
 * every allowed key and all orientations. Also reverse the produced
 * GP input: no guess about native "E" alphabet is needed by the inverse.
 */
const native=[];
for(let i=1;i<sizes.length;i++){
 const pool=dictionary.get(sizes[i]);
 assert(pool && pool.size>0);
 const key=[...pool.keys()][(i*17+3)%pool.size];
 const plain=key.split(",").map(Number);
 const a=(i*7+3)%28+1,b=(i*11+5)%29;
 const cipher=orient(plain,Boolean(i%2),(i*3)%plain.length)
   .map(x=>(x*a+b)%29);
 assert(candidates(cipher,true).has(key),
  "positive native source word must survive all-secret inverse enumeration");
 native.push({size:plain.length,original:plain,cipher});
}
assert.equal(native.length,16);
// Complete forward and inverse checks: each transformed native word is a
// true GP29 bijection for its own orientation and nonzero affine key.
for(let i=1;i<sizes.length;i++){
 const plain=native[i-1].original;
 const a=(i*7+3)%28+1,b=(i*11+5)%29,rev=Boolean(i%2),rot=(i*3)%plain.length;
 const actual=native[i-1].cipher;
 let invA=0;for(let x=1;x<29;x++)if(x*a%29===1)invA=x;
 assert(invA);
 const inverted=actual.map(x=>((x-b+29)*invA)%29);
 const oriented=orient(plain,rev,rot);
 assert.deepEqual(inverted,oriented);
}
const output={
 source:"original LP2 p55 72.jpg, full source GP29 word fragments",
 originalRunes:source.length,completeWords:16,carriedFirstRune:1,
 morphology:{strictInteriors:43,exteriorRunes:33},
 corpusWordTokens:counts,
 dictionary13GPTypes:dictionary.get(13).size,
 noMatchEvenWithWordPrivateKeysAndDihedral:noEnglish,
 runeCountInImpossibleCompleteWords:originalUnmatchableRunes,
 perFragment:fullWords.map((x,i)=>({
  fragment:i,offset:x.offset,size:x.size,
  nativeAffineOriginalOrientation:normal[i],
  nativeAffineDihedral:dihedral[i]
 })),
 positiveIndependentRealNativeWords:native.length
};
console.log("PASS "+JSON.stringify(output));
