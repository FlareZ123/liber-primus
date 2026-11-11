"use strict";
/**
 * SFT: test exact GP-rune word-length fingerprints of four original LP2
 * quoted spans against a fixed independently published KJV Bible source.
 *
 * Historical source: King James Version of the Bible (public domain),
 * nigelmsipa/public-domain-bibles commit a7d5ae6a..., KJV.txt.
 * GitHub Actions passes downloaded source as first argument. No Internet
 * inside SFT; no write; no cryptanalytic key fitting.
 *
 * Usage: node sims/lp2_quote405_kjv_source_crib_sft.cjs path/to/KJV.txt
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=json("resources/liber-primus/lp2-corpus.json");
const annotation=json("resources/liber-primus/lp2-quote-punctuation-spans.json");
const raw=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const runeID=new Map(corpus.runes.map((r,i)=>[r,i]));
const fromTranscription=[...raw].filter(c=>runeID.has(c)).map(c=>runeID.get(c));
const native=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(native.length,12956);
assert.deepEqual(fromTranscription.slice(0,native.length),native);
assert.equal(annotation.quotes.length,7);
assert.deepEqual(annotation.quotes.map(q=>q.length),[18,19,12,58,68,160,70]);

// Visibly delimited quote lengths, recovered from the seven quoted
// blocks in Dukotah/cicada3301's original-rune-rich transcription.
// The sum of GP word lengths must equal the source-slice rune count.
const fingerprints=[
 [6,3,3,6],
 [3,3,4,5,4],
 [3,9],
 [5,7,2,3,4,6,4,3,3,4,4,4,5,4],
 [9,8,3,4,6,3,10,2,4,7,6,2,4],
 [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
 [5,7,2,3,4,10,3,9,7,3,7,4,3,3],
];
fingerprints.forEach((f,i)=>{
 assert.equal(f.reduce((a,b)=>a+b,0),annotation.quotes[i].length);
 assert.equal(annotation.quotes[i].end-annotation.quotes[i].start,
   annotation.quotes[i].length);
});
/** @param {string} w @returns {number} */
const gpLength=w=>(w.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g)||[]).length;
/** @param {number[]} source @param {number[][]} targets */
function find(source,targets){
 const seed=6;
 const groups=new Map();
 for(let q=0;q<targets.length;q++){
  const target=targets[q];
  for(let j=0;j+seed<=target.length;j++){
   const key=target.slice(j,j+seed).join(",");
   const list=groups.get(key)||[];
   list.push([q,j]);
   groups.set(key,list);
  }
 }
 const found=new Map();
 for(let i=0;i+seed<=source.length;i++){
  const candidates=groups.get(source.slice(i,i+seed).join(","));
  if(!candidates)continue;
  for(const [q,j] of candidates){
   let a=j,b=i,len=seed;
   while(a>0&&b>0&&targets[q][a-1]===source[b-1]){
    a--;b--;len++;
   }
   while(a+len<targets[q].length&&b+len<source.length
      &&targets[q][a+len]===source[b+len])len++;
   const id=q+":"+a+":"+b;
   const existing=found.get(id);
   if(!existing||len>existing.length)found.set(id,
      {quote:q,quoteWord:a,sourceWord:b,length:len,
       complete:len===targets[q].length});
  }
 }
 return [...found.values()].sort((a,b)=>b.length-a.length||
   a.quote-b.quote||a.sourceWord-b.sourceWord);
}
const file=process.argv[2];
assert.ok(file,"KJV.txt path required");
const bytes=fs.readFileSync(file);
const sourceHash=crypto.createHash("sha256").update(bytes).digest("hex");
const tokens=(bytes.toString("utf8").toUpperCase().match(/[A-Z]+/g)||[]);
const lengths=tokens.map(gpLength);
assert.ok(lengths.length>600000);
const results=find(lengths,fingerprints.slice(3));
for(const r of results)r.quote+=3;
const bestByQuote=fingerprints.map((f,i)=>({
  quote:i,
  originalRuneCount:f.reduce((s,n)=>s+n,0),
  words:f.length,
  topMatches:results.filter(r=>r.quote===i).slice(0,2).map(v=>({
   ...v,
   sourceExcerpt:tokens.slice(v.sourceWord,v.sourceWord+v.length).join(" ").slice(0,200),
  })),
}));
// Known positive: select a 34-word original KJV source passage without
// optimizing its word lengths, then search same entire reference.
const anchor=25001,plant=lengths.slice(anchor,anchor+34);
assert.equal(plant.length,34);
const planted=find(lengths,[plant]);
assert.ok(planted.some(r=>r.complete&&r.sourceWord===anchor&&r.quoteWord===0),
  "34-word KJV source control must be recovered verbatim");
const top=results[0]||null;
console.log(JSON.stringify({
 source:"2014 original LP2 seven source-visible quotation spans; KJV Bible",
 source_sha256:sourceHash,
 source_words:tokens.length,
 original_quoterunes:405,
 strict_quote_words:fingerprints.map(x=>x.length),
 tested:"four quote spans of 13+ original printed words, GP ING-aware length, exact matches only",
 original_maximum_exact_words:top?.length||0,
 original_top:top,
 by_quote:bestByQuote,
 known_source_34word_plant_recovered:true,
 conclusion:top&&top.length>=13?
  "Investigate independently withheld source continuation and source-selected location before claiming a crib":
  "No original exact 13-word+ GP-length match against this full KJV source",
},null,2));
