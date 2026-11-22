"use strict";
/**
 * Whole-LP2 exact Latin Vulgate plaintext crib test: complete 66-book editions.
 * Intentionally distinct from the previous 39,835-word partial Vulgate screen.
 * Use historically extant Clementine (1592) and Jerome/Vulgate (405) Latin
 * sources, pinned to the original Git blobs in midvash/bible-data.
 * Search every original preserved rune word regardless of printed quotation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

const inputs = [
  {name:"Clementine Vulgate",file:process.argv[2],version:"clem",
   gitBlob:"b99bc8cded07adaa368ea0c05baf772ea774d52f"},
  {name:"Latin Vulgate",file:process.argv[3],version:"vulg",
   gitBlob:"749a180a91e1d9f526f96a02aacba6999747c255"}
];
assert.ok(inputs.every(item => item.file), "Supply clem.json and vulg.json");
const orig=parseSharedCorpus();
assert.equal(orig.words.length,2896);
assert.equal(orig.runeCount,12956);
const original=orig.words.map(w=>w.length);
const N=8;

/** @param {string} value @returns {string[]} */
function latinWords(value) {
  const clean=value.toUpperCase().replace(/Æ/g,"AE").replace(/Œ/g,"OE")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g,"");
  return clean.match(/[A-Z]+/g)||[];
}
/** @param {string} value @returns {number} */
const gpLength=value=>(value.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[]).length;
/** @param {number[]} numbers @param {number} i @returns {string} */
const key=(numbers,i)=>numbers.slice(i,i+N).join(",");

/**
 * @param {number[]} target Original rune-word shape, or positive-control plant
 * @param {number[]} source The text's Latin or Latin-GP word lengths
 * @returns {Array<{originalWord:number,sourceWord:number,length:number,physicalPage:number}>}
 */
function find(target,source) {
  const index=new Map();
  for(let i=0;i+N<=target.length;i++){
    const hash=key(target,i);
    if(!index.has(hash))index.set(hash,[]);
    index.get(hash).push(i);
  }
  const found=new Map();
  for(let j=0;j+N<=source.length;j++){
    const refs=index.get(key(source,j));
    if(!refs)continue;
    for(const pos of refs){
      let a=pos,b=j,len=N;
      while(a>0&&b>0&&target[a-1]===source[b-1]){a--;b--;len++;}
      while(a+len<target.length&&b+len<source.length&&
        target[a+len]===source[b+len])len++;
      const id=a+":"+b;
      if(!found.has(id))found.set(id,{
        originalWord:a,sourceWord:b,length:len,
        physicalPage:physicalLP2Page(orig.words[a].startPage)
      });
    }
  }
  return [...found.values()].sort((a,b)=>
    b.length-a.length||a.originalWord-b.originalWord||a.sourceWord-b.sourceWord);
}
const outputs=[];
for(const item of inputs) {
  const bytes=fs.readFileSync(item.file);
  const hash=crypto.createHash("sha1").update("blob "+bytes.length+"\0")
    .update(bytes).digest("hex");
  assert.equal(hash,item.gitBlob,"source blob changed");
  const parsed=JSON.parse(bytes.toString("utf8"));
  assert.equal(parsed.version,item.version);
  assert.equal(parsed.language,"la");
  assert.equal(parsed.books.length,66);
  const words=[], starts=[];
  for(const book of parsed.books){
    starts.push({book:book.book,sourceWord:words.length});
    for(const chapter of book.chapters)for(const verse of chapter.verses)
      words.push(...latinWords(verse.text));
    // Block across book breaks by a source token with impossible rune length.
    words.push("BOOKBREAKSENTINEL");
  }
  const wordLengths=[
    ["raw Latin letters",words.map(w=>w==="BOOKBREAKSENTINEL"?999:w.length)],
    ["GP digraphs",words.map(w=>w==="BOOKBREAKSENTINEL"?999:gpLength(w))]
  ];
  for(const [mode,lengths] of wordLengths){
    const hits=find(original,lengths);
    const anchor=25001,planted=original.slice();
    planted.splice(1200,34,...lengths.slice(anchor,anchor+34));
    assert.ok(find(planted,lengths).some(x=>
      x.originalWord===1200&&x.sourceWord===anchor&&x.length>=34),
      "Known 34-word source plant must be recovered");
    const top=hits.slice(0,10).map(hit=>{
      let book="unknown";
      for(const candidate of starts){
        if(candidate.sourceWord>hit.sourceWord)break;
        book=candidate.book;
      }
      return {...hit,book,excerpt:words.slice(hit.sourceWord,
        hit.sourceWord+Math.min(hit.length,18)).join(" ")};
    });
    outputs.push({edition:item.name,mode,wordCount:words.length,
      maxExact:top[0]?.length||0,counts:Object.fromEntries(
        [10,12,15,20,30].map(n=>[n,hits.filter(x=>x.length>=n).length])),
      top,plant34Recovered:true,gitBlob:item.gitBlob});
  }
}
console.log(JSON.stringify({scope:"All 2,896 LP2 words, two complete Latin Bible editions",
  originalRunes:orig.runeCount,originalWords:original.length,
  sourceCommit:"9586bd8228a747962df1ee8692730422fb7eb2ec",
  sourceRepo:"midvash/bible-data",outputs,plaintextRecovered:false},null,2));
