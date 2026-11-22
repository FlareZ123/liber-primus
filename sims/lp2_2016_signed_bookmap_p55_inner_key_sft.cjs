"use strict";
/**
 * 2016 signed-message base-58 book-addresses -> selected LP2 rune-word prime
 * sums -> fixed 43-value GP29 pad for original p55 43 word interiors.
 *
 * P50 is a numeric page: local cell3 is global grid byte83, 3D=193.
 * ING-aware 2016 MEANING points to independently solved p56 DEEP;
 * THEIR points to p56 END. No ciphertext-fitted indices or key phases.
 * Node 22, SFT: node sims/lp2_2016_signed_bookmap_p55_inner_key_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/base60-grid.json")).byte_rows.flat();
const scans=read("resources/lp2-transcription.txt").split("%");
assert.equal(scans.length,57);
const runeIndex=new Map(corpus.runes.map((c,i)=>[c,i]));
/** @param {string} source @returns {string[]} */
function words(source) {
 return source.replaceAll("/","").replaceAll("\n","").replaceAll("\r","")
  .split(/[-.&$§,:!?]/u).map(s=>(s.match(/[ᚠ-᛿]+/gu)||[]).join(""))
  .filter(Boolean);
}
const pages=Array.from({length:58},(_,i)=>
 i===50?[]:words(scans[i>50?i-1:i]));
assert.equal(pages.reduce((n,a)=>n+a.length,0),2973);
const alpha=corpus.translit.map((token,index)=>({token:token.toLowerCase(),index}))
 .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word @returns {number[]} */
function gp(word){
 const text=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
 const out=[],ing=corpus.translit.indexOf("NG");
 assert(ing>=0);
 for(let i=0;i<text.length;){
  if(text.startsWith("ing",i)){out.push(ing);i+=3;continue;}
  const found=alpha.find(({token})=>text.startsWith(token,i));
  assert(found,"invalid GP source word "+word);
  out.push(found.index);i+=found.token.length;
 }
 return out;
}
/** @param {number} n */
const mod29=n=>(n%29+29)%29;
/** @param {number[]} values */
const ioc=values=>{
 const n=values.length,c=Array(29).fill(0);
 for(const x of values)c[x]++;
 return c.reduce((z,k)=>z+k*(k-1),0)/(n*(n-1));
};
const payload=read("resources/historical/cicada2016-4gq25-outguess.asc");
const signed=payload.slice(payload.indexOf("Hello."),payload.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords=signed.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(signedWords.length,43);
const mapped=signedWords.map((word,index)=>{
 const sum=gp(word).reduce((n,k)=>n+corpus.prime[k],0);
 const page=sum%58,local=Math.floor(sum/58);
 const selection=page===50?table[80+local]:[...pages[page][local]]
   .map(r=>runeIndex.get(r));
 assert(selection!==undefined);
 const value=page===50?selection:
   selection.reduce((n,k)=>n+corpus.prime[k],0);
 return {word,index,page,local,value,key:value%29};
});
const lies=mapped.find(x=>x.word.toLowerCase()==="lies");
assert.deepEqual([lies.page,lies.local,lies.value,lies.key],[50,3,193,19]);
const their=mapped.filter(x=>x.word.toLowerCase()==="their");
assert.equal(their.length,2);
assert.deepEqual(their.map(x=>[x.page,x.local]),[[56,1],[56,1]]);
const meaning=mapped.find(x=>x.word.toLowerCase()==="meaning");
assert.deepEqual([meaning.page,meaning.local],[56,4]);

const sourceWords=pages[55].slice(1);
const innerGroups=sourceWords.map(w=>[...w].slice(1,-1).map(r=>runeIndex.get(r)));
const ciphertext=innerGroups.flat();
const key=mapped.map(x=>x.key);
assert.equal(ciphertext.length,43);
assert.equal(key.length,43);
assert.deepEqual(ciphertext,[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]);
assert.deepEqual(innerGroups.map(x=>x.length),
 [2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1]);

const lm=train(read("resources/control/shakespeare_first300k.txt"));
const trigram=values=>{
 let v=0;
 for(let i=2;i<values.length;i++)
  v+=lm.trigram[(values[i-2]*29+values[i-1])*29+values[i]];
 return v/(values.length-2);
};
const solved=corpus.pages[57].indices.slice(7,50);
assert.equal(solved.length,43);
assert.equal(solved.every(x=>Number.isInteger(x)),true);
const controls=[];
for(const sign of [-1,1]){
 const transformed=ciphertext.map((x,i)=>mod29(x+sign*key[i]));
 const plant=solved.map((x,i)=>mod29(x-sign*key[i]));
 assert.deepEqual(plant.map((x,i)=>mod29(x+sign*key[i])),solved);
 const chunks=[];
 let cursor=0;
 for(const group of innerGroups){
  chunks.push(transformed.slice(cursor,cursor+group.length)
   .map(k=>corpus.translit[k]).join(""));
  cursor+=group.length;
 }
 assert.equal(cursor,43);
 controls.push({sign,ioc:ioc(transformed),trigram:trigram(transformed),
  gp:transformed.map(k=>corpus.translit[k]).join(""),
  words:chunks.filter(Boolean)});
}
const ref=encode(read("resources/control/shakespeare_first300k.txt")).slice(0,43);
console.log(JSON.stringify({
 premise:"Signed 2016 43-word base58 book-map -> selected original-ciphertext word GP-prime sums, with p50 local byte193, aligned to the 43 p55 stripped interiors",
 source:{"2016Words":43,p55Interiors:43,p50CellGlobalIndex:83,p50CellByte:193,
  signedMappedP56Their:[56,1],signedMappedP56Meaning:[56,4]},
 key,original:{ioc:ioc(ciphertext),trigram:trigram(ciphertext)},
 reference:{ioc:ioc(ref),trigram:trigram(ref)},
 plantedRecovered:"43/43 each sign",
 candidates:controls,
 decision:"Direct one-per-interior additive source-map key is a hypothesis; no plaintext claim without language-consistent original evidence"
},null,2));
