"use strict";
/**
 * All-secret source-native gate for a fixed fifth-back plaintext marker.
 *
 * Hypothesis at printed-word offset j>=5, whenever C[j-1]!==C[j-5],
 * C[j]===C[j-5] if and only if P[j]===M5 for one fixed GP29 rune M5.
 * A second fixed plaintext rune M1 may map to C[j-1]. All remaining
 * assignments may be ARBITRARY secret state-dependent bijections.
 *
 * The original p51 eight-rune word at source word index2722 forces three
 * identical plaintext runes at positions5,6,7, regardless of M1/M5 and
 * of all secret keys. Test exact 29,157 source-native GP dictionary words
 * and three literary witnesses of the same eight-rune word shape.
 *
 * SFT: node sims/lp2_fiveback_fixed_marker_triple_gate_sft.cjs
 * Windows Node 22 / CommonJS, built-ins only, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const book=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const map=new Map(book.runes.map((ch,i)=>[ch,i]));
const rx=new RegExp("["+book.runes.join("")+"]+","gu");
const source=read("resources/liber-primus/lp2-transcription.txt");
const words=(source.split("%").slice(0,55).join("%")
 .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"").match(rx)||[])
 .map(s=>Array.from(s,ch=>map.get(ch)));
const original=words.flat();
assert.equal(words.length,2896);
assert.equal(original.length,12956);
assert.deepEqual(original,book.pages.filter(p=>p.page<56)
 .flatMap(p=>p.indices));
const targetWord=2722;
const target=words[targetWord];
assert.deepEqual(target,[15,23,21,6,20,15,23,21]);
assert.equal(target.length,8);
let start=0;
for(let i=0;i<targetWord;i++)start+=words[i].length;
assert.equal(start,12157);
let preceding=0;
for(const page of book.pages.filter(p=>p.page<51))preceding+=page.indices.length;
assert.equal(start-preceding,43);
/** @param {number[]} word */
function fifthEvents(word){
 const positions=[];
 for(let j=5;j<word.length;j++)
  if(word[j]===word[j-5]&&word[j-1]!==word[j-5])
   positions.push(j);
 return positions;
}
assert.deepEqual(fifthEvents(target),[5,6,7]);
// Therefore any fixed M5 always decoded from such a position would
// force P_5=P_6=P_7=M5 on the original p51 word.

const tokens=book.translit.map((name,index)=>({name,index}))
 .sort((a,b)=>b.name.length-a.name.length);
/** Authentic LP1 source spelling contract: ING=21, IO=27, QU->CW. */
function nativeGP(text){
 let s=text.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let j=0;j<s.length;){
  if(s.startsWith("ING",j)){out.push(21);j+=3;continue;}
  if(s.startsWith("IO",j)){out.push(27);j+=2;continue;}
  const t=tokens.find(t=>s.startsWith(t.name,j));
  assert(t,"source English transliteration failed: "+text);
  out.push(t.index);j+=t.name.length;
 }
 return out;
}
assert.deepEqual(nativeGP("FUNCTION"),[0,1,9,5,16,27,9]);
assert.deepEqual(nativeGP("FOLLOWING"),[0,3,20,20,3,7,21]);
/** @param {number[]} w */
function suffixTriple(w){
 return w.length===8&&w[5]===w[6]&&w[6]===w[7];
}
const lexicon=read("resources/control/english_wordfreq_textblob.txt")
 .split(/\r?\n/u).filter(s=>/^[a-z]+ \d+$/u.test(s))
 .map(s=>s.split(" ")[0]);
assert.equal(lexicon.length,29157);
const controls=[
 {name:"English 29,157-word lexicon",tokens:lexicon},
 {name:"Gibran prose",tokens:read("resources/control/gibran_prophet_58585.txt").match(/[A-Za-z]+/g)||[]},
 {name:"Shakespeare prose",tokens:read("resources/control/shakespeare_first300k.txt").match(/[A-Za-z]+/g)||[]},
 {name:"Emerson prose",tokens:read("resources/control/emerson_essays_2944.txt").match(/[A-Za-z]+/g)||[]}
];
const sourceStats=controls.map(control=>{
 let words8=0,triples8=0;
 const examples=[];
 for(const word of control.tokens){
  const p=nativeGP(word);
  if(p.length!==8)continue;
  words8++;
  if(suffixTriple(p)){triples8++;
   if(examples.length<8)examples.push(word);
  }
 }
 return {source:control.name,sourceTokens:control.tokens.length,
  sourceEightRuneWords:words8,sourceEightRuneSuffixTriples:triples8,
  examples};
});
assert.equal(sourceStats[0].sourceEightRuneSuffixTriples,0);
// Source-native literary controls also supply a distinct 8-rune GP word
// register. Any triple-ending words, including Roman numerals or source
// web boilerplate, are printed explicitly rather than discarded.
const M=29,MARK1=28,MARK5=20;
assert.notEqual(MARK1,MARK5);
/**
 * One bijective state-dependent output alphabet. The first reserved GP
 * plaintext rune maps to the preceding ciphertext; the second maps to
 * the fifth-back ciphertext whenever that differs from the predecessor.
 * Arbitrary key-dependent ordering fills all 27 remaining destinations.
 * @param {number} prev
 * @param {number|null} five
 * @param {number} at
 * @param {number} secret
 */
function alphabet(prev,five,at,secret){
 const mapOut=new Int16Array(M).fill(-1),taken=new Set([prev]);
 mapOut[MARK1]=prev;
 if(five!==null){
  let val=five;
  if(taken.has(val))val=(val+1)%M;
  while(taken.has(val))val=(val+1)%M;
  mapOut[MARK5]=val;
  taken.add(val);
 }
 const free=Array.from({length:M},(_,i)=>(i+secret+at*7)%M)
   .filter(v=>!taken.has(v));
 let n=0;
 for(let i=0;i<M;i++)if(mapOut[i]<0)mapOut[i]=free[n++];
 assert.equal(new Set(mapOut).size,M);
 return mapOut;
}
/** @param {number[][]} ps */
function encode(ps,secret){
 const tape=[],recovered=[],wordTape=[];
 let at=0;
 for(const w of ps){
  const out=[];
  for(let j=0;j<w.length;j++,at++){
   const prev=tape.length?tape[tape.length-1]:0;
   const five=j>=5?out[j-5]:null;
   const table=alphabet(prev,five,at,secret);
   const c=table[w[j]];
   out.push(c);tape.push(c);
   const decoded=table.indexOf(c);
   recovered.push(decoded);
   assert.equal(decoded,w[j]);
  }
  wordTape.push(out);
 }
 return {tape,recovered,wordTape};
}
const buckets=new Map();
for(const word of controls[1].tokens){
 const encoded=nativeGP(word);
 if(!buckets.has(encoded.length))buckets.set(encoded.length,[]);
 buckets.get(encoded.length).push(encoded);
}
const plant=words.map((word,i)=>{
 const pool=buckets.get(word.length);
 assert(pool?.length);
 return pool[(i*17+3)%pool.length];
});
const native=plant.flat();
assert.equal(native.length,12956);
const result=encode(plant,13);
assert.deepEqual(result.recovered,native);
assert.equal(result.tape.length,12956);
assert.equal(result.wordTape.filter(w=>w.length===8&&
 fifthEvents(w).join(",")==="5,6,7").length,0);
// A deliberately artificial eight-rune plaintext ending in LLL does
// produce the original three-position return signature. This proves
// the all-key marker implication is an observable encoder behavior.
const probe=[1,2,3,4,5,MARK5,MARK5,MARK5];
const test=encode([probe],13).wordTape[0];
assert.deepEqual(fifthEvents(test),[5,6,7]);
const output={
 hypothesis:"one fixed plaintext GP marker maps to fifth-back ciphertext",
 observed:{wordIndex:targetWord,physicalPage:51,pageRuneOffset:43,
  flatRuneOffset:12157,originalWord:target.map(v=>book.runes[v]).join(""),
  fifthBackPositions:[5,6,7],unambiguousForcedPlaintextSuffix:"M5 M5 M5"},
 sourceNativeEightRuneRegister:sourceStats,
 positive:{syntheticSourceRunes:native.length,
  exactRecovered:result.recovered.length,
  eightRuneTripleReturnWordsInNativePlant:0,
  artificialThreeMarkerReturn:fifthEvents(test),
  chosenMarkers:{predecessor:book.translit[MARK1],
   fifthBack:book.translit[MARK5]},arbitraryHiddenAlphabetSeed:13},
 conclusion:"Reject fixed fifth-back plaintext-marker encoder for ordinary GP-native 8-rune English source words; no original plaintext or key recovered."
};
console.log(JSON.stringify(output,null,2));
