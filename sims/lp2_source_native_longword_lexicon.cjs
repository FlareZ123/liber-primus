"use strict";
/**
 * Expanded SOURCE-NATIVE GP long-word control lexicon.
 * Corrects the critical weakness of relying on TextBlob alone: TextBlob
 * omits CIRCUMFERENCES, an authentic solved Cicada p57 word (14 GP runes).
 * All file inputs are existing pinned historical controls. Words from the
 * unsolved LP2 text are never learned as dictionary guesses.
 *
 * Node.js 22 CommonJS. Does not write files.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const sources=[
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/blake_song_of_liberty_train.txt"
];

/** @returns {Map<number,Array<{word:string,indices:number[],P:number[],source:string}>>} */
function sourceNativeLongwords() {
  /** @type {Map<number,Array<{word:string,indices:number[],P:number[],source:string}>>} */
  const lex=new Map([[13,[]],[14,[]]]);
  const seen=new Set();
  /** @param {string} item @param {string} source */
  const add=(item,source)=>{
    const word=item.toLowerCase();
    if(seen.has(word))return;
    const indices=encodeSourceNativeGP(word);
    if(!lex.has(indices.length))return;
    seen.add(word);
    lex.get(indices.length).push({word,indices,P:indices,source});
  };
  for(const file of sources){
    const source=fs.readFileSync(path.join(root,file),"utf8");
    for(const word of source.match(/[A-Za-z]+/g)||[])add(word,file);
  }
  const known="circumferences";
  const attested=encodeSourceNativeGP(known);
  assert.equal(attested.length,14);
  const physicalP57=gp.pages.find(p=>p.page===57).indices;
  assert(physicalP57.join(",").includes(attested.join(",")),
    "attested 14-rune CIRCUMFERENCES must be present in solved p57");
  add(known,"authenticated LP2 p57");
  assert(lex.get(13).every(x=>x.indices.length===13));
  assert(lex.get(14).every(x=>x.indices.length===14));
  assert(lex.get(14).some(x=>x.word===known));
  assert.equal(lex.get(13).length,426);
  assert.equal(lex.get(14).length,175);
  return lex;
}
module.exports={sourceNativeLongwords};
