"use strict";
/**
 * Recover literal author-historical scripture quotations even if the unknown
 * LP2 cipher inserts zero or one decorative rune into each printed source word.
 * Original p57's 'shed ... circumferences' motivates removing nulls; this
 * finite model conserves all source word boundaries and adds 0/1 rune per word.
 * Search complete historical KJV or Latin Vulgate editions, no text fitting.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const {parseSharedCorpus,physicalLP2Page}=require("./lp2_word_pages.cjs");

const mode=process.argv[2];
assert.ok(["kjv","latin"].includes(mode),"Use kjv/latin mode");
const original=parseSharedCorpus();
assert.equal(original.words.length,2896);
assert.equal(original.runeCount,12956);
const target=original.words.map(w=>w.length);
const k=6;
/** @param {string} x @returns {string[]} */
const latinWords=x=>(x.toUpperCase().replace(/Æ/g,"AE").replace(/Œ/g,"OE")
  .normalize("NFKD").replace(/[\u0300-\u036f]/g,"").match(/[A-Z]+/g)||[]);
/** @param {string} w @returns {number} */
const gp=w=>(w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[]).length;
/** @param {number[]} ar @param {number} i */
const sig=(ar,i)=>ar.slice(i,i+k).join(",");
/** @param {number[]} originalLengths */
function indexPossibleOneNull(originalLengths){
  const index=new Map();
  for(let pos=0;pos+k<=originalLengths.length;pos++)
    for(let mask=0;mask<(1<<k);mask++){
      let v=[],valid=true;
      for(let j=0;j<k;j++){
        const next=originalLengths[pos+j]-((mask>>j)&1);
        if(next<=0){valid=false;break;}
        v.push(next);
      }
      if(!valid)continue;
      const key=v.join(",");
      if(!index.has(key))index.set(key,[]);
      index.get(key).push(pos);
    }
  return index;
}
/**
 * @param {number[]} originalLengths
 * @param {number[]} sourceLengths
 * @param {string[]} sourceWords
 * @returns {{best:object[],countAtLeast20:number,highest:number}}
 */
function scan(originalLengths,sourceLengths,sourceWords){
  const index=indexPossibleOneNull(originalLengths);
  const seen=new Set(),matches=[];
  let maximum=0;
  for(let j=0;j+k<=sourceLengths.length;j++){
    const refs=index.get(sig(sourceLengths,j));
    if(!refs)continue;
    for(const pos of refs){
      let a=pos,b=j,n=k;
      while(a>0&&b>0&&[0,1].includes(
        originalLengths[a-1]-sourceLengths[b-1])){a--;b--;n++;}
      while(a+n<originalLengths.length&&b+n<sourceLengths.length&&
        [0,1].includes(originalLengths[a+n]-sourceLengths[b+n]))n++;
      if(n>maximum)maximum=n;
      if(n<15)continue;
      const id=a+":"+b;
      if(seen.has(id))continue;
      seen.add(id);
      matches.push({originalWord:a,sourceWord:b,length:n,
        physicalPage:physicalLP2Page(original.words[a].startPage),
        numberOfAddedRunes:originalLengths.slice(a,a+n).reduce(
          (s,c,idx)=>s+c-sourceLengths[b+idx],0),
        excerpt:sourceWords.slice(b,b+Math.min(n,24)).join(" ").slice(0,250)});
    }
  }
  matches.sort((a,b)=>b.length-a.length||a.originalWord-b.originalWord||
    a.sourceWord-b.sourceWord);
  return {highest:maximum,best:matches.slice(0,12),
    countAtLeast15:matches.length,countAtLeast20:matches.filter(x=>x.length>=20).length,
    countAtLeast25:matches.filter(x=>x.length>=25).length};
}
const sources=[];
if(mode==="kjv"){
  const file=process.argv[3],bytes=fs.readFileSync(file);
  const sha=crypto.createHash("sha256").update(bytes).digest("hex");
  assert.equal(sha,
    "1ec99be81dcfcd4d601a5f988f3f8a544382c6b8594b0ec94a94599bcac29d73");
  sources.push({edition:"KJV 1769",words:bytes.toString("utf8").toUpperCase()
    .match(/[A-Z]+/g)||[],fingerprint:sha});
}else{
  for(const [edition,file,version,hash] of [
    ["Clementine 1592",process.argv[3],"clem",
      "b99bc8cded07adaa368ea0c05baf772ea774d52f"],
    ["Vulgate Latin",process.argv[4],"vulg",
      "749a180a91e1d9f526f96a02aacba6999747c255"]
  ]){
    const bytes=fs.readFileSync(file);
    const digest=crypto.createHash("sha1").update("blob "+bytes.length+"\0")
      .update(bytes).digest("hex");
    assert.equal(digest,hash);
    const obj=JSON.parse(bytes.toString("utf8"));
    assert.equal(obj.version,version);
    const words=[];
    for(const book of obj.books){
      for(const chapter of book.chapters)for(const verse of chapter.verses)
        words.push(...latinWords(verse.text));
      words.push("BOOKBREAKSENTINEL");
    }
    sources.push({edition,words,fingerprint:hash});
  }
}
const output=[];
for(const source of sources)for(const [register,lengthOf] of [
  ["GP",gp],["literal letters",w=>w.length]
]){
  const lengths=source.words.map(w=>w==="BOOKBREAKSENTINEL"?
    999:lengthOf(w));
  const result=scan(target,lengths,source.words);
  const start=25001,planted=target.slice();
  for(let i=0;i<40;i++)planted[1200+i]=lengths[start+i]+
    (i%5===0||i%5===3?1:0);
  const pos=scan(planted,lengths,source.words);
  assert.ok(pos.best.some(x=>x.originalWord===1200&&x.sourceWord===start&&x.length>=40),
    "40-word source quotation with a deterministic single-rune-per-word null mask must be recovered");
  output.push({edition:source.edition,register,sourceWords:source.words.length,
    sourceFingerprint:source.fingerprint,...result,planted40Recovered:true});
}
console.log(JSON.stringify({
  scope:"All unknown printed word boundaries, 0/1 extra ciphertext rune per source word",
  originalWords:target.length,originalRunes:original.runeCount,sourceKind:mode,
  outputs:output,authenticatedUnknownPlaintext:false},null,2));
