"use strict";
/**
 * Search a fixed Gutendex topic/page selection for long plaintext-source
 * word-length fingerprints in LP2, permitting zero or one extra rune per
 * ciphertext word. Every selected source is public-domain English text.
 *
 * Only independently recovered plaintext / keys should be promoted to
 * established research. This is an exploratory quote discovery instrument.
 *
 * Node.js >=22, opt-in CI only. No filesystem writes or dependencies.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {runeWords,parseMaster,runeLength,englishWords}=require("./wordlength_crib_scan.js");
const ROOT=path.resolve(__dirname,"..");
const MASTER=fs.readFileSync(path.join(ROOT,"resources/transcriptions/liber_primus_master.txt"),"utf8");
const TARGET=parseMaster(MASTER).cipherLengths;
const K=6,BASE=32;
const TOPICS=["philosophy","religion","mysticism","occult","esoteric","poetry"];
const PAGES_PER_TOPIC=2;
const MAX_BOOKS=Number(process.env.MAX_BOOKS||140);
const MAX_BYTES=3000000;
const MAX_WORDS=600000;

/** @param {number[]} target @returns {Map<number,number[]>} */
function targetIndex(target){
 const out=new Map();
 for(let i=0;i<=target.length-K;i++)for(let mask=0;mask<1<<K;mask++){
   let n=0,valid=true;
   for(let t=0;t<K;t++){
     const v=target[i+t]-((mask>>t)&1);
     if(v<1||v>=BASE){valid=false;break;}
     n=n*BASE+v;
   }
   if(!valid)continue;
   if(!out.has(n))out.set(n,[]);
   out.get(n).push(i);
 }
 return out;
}
const INDEX=targetIndex(TARGET);

/**
 * @param {Map<number,number[]>} index
 * @param {number[]} target
 * @param {number[]} source
 * @param {string[]} words
 * @param {number} minLength
 * @returns {object}
 */
function scan(index,target,source,words,minLength=18){
 let best=null,seedHits=0,qualifying=0;
 for(let j=0;j<=source.length-K;j++){
   let key=0,valid=true;
   for(let u=0;u<K;u++){
     if(source[j+u]<=0||source[j+u]>=BASE){valid=false;break;}
     key=key*BASE+source[j+u];
   }
   if(!valid)continue;
   const starts=index.get(key);
   if(!starts)continue;
   for(const i of starts){
     seedHits++;
     let left=0,right=K;
     while(i-left>0&&j-left>0&&(target[i-left-1]===source[j-left-1]||
       target[i-left-1]===source[j-left-1]+1))left++;
     while(i+right<target.length&&j+right<source.length&&(
       target[i+right]===source[j+right]||target[i+right]===source[j+right]+1))right++;
     const length=left+right;
     if(length>=minLength)qualifying++;
     if(!best||length>best.length){
       const ti=i-left,sj=j-left;
       best={length,targetStart:ti,sourceStart:sj,
         extraRunes:target.slice(ti,ti+length).reduce((s,v,x)=>
           s+Number(v===source[sj+x]+1),0),
         phrase:words.slice(sj,sj+Math.min(30,length)).join(" ")};
     }
   }
 }
 return {sourceWords:source.length,seedHits,qualifying,best};
}

/** @param {string} str */
function cleanGutenberg(str){
 const upper=str.toUpperCase(), begin=upper.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG/);
 const end=upper.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/);
 const start=begin>=0?str.indexOf("\n",begin)+1:0;
 return str.slice(start,end>=start?end:undefined);
}

/** @param {string} url @param {number} limit */
async function getText(url,limit=MAX_BYTES){
 const response=await fetch(url,{signal:AbortSignal.timeout(18000),headers:{"User-Agent":"LiberPrimusAcademicResearch/1.0"}});
 if(!response.ok)throw Error("HTTP "+response.status);
 const len=Number(response.headers.get("content-length")||0);
 if(len>limit)throw Error("oversized response");
 const text=await response.text();
 if(text.length>limit)throw Error("oversized text");
 return text;
}

/** @returns {Promise<object[]>} */
async function selectBooks(){
 const ids=new Map();
 for(const topic of TOPICS)for(let p=1;p<=PAGES_PER_TOPIC;p++){
   const url="https://gutendex.com/books?languages=en&copyright=false&topic="+encodeURIComponent(topic)+"&page="+p;
   try{
     const content=JSON.parse(await getText(url,500000));
     for(const book of content.results||[]){
       if(ids.size>=MAX_BOOKS)break;
       const entry=Object.entries(book.formats||{}).find(([type])=>type.startsWith("text/plain"));
       if(!entry)continue;
       if(!ids.has(book.id))ids.set(book.id,{id:book.id,title:book.title,topic,url:entry[1]});
     }
   }catch(e){console.log("CATALOGUE_ERROR",JSON.stringify({topic,page:p,error:String(e)}));}
 }
 return [...ids.values()];
}

async function main(){
 const books=await selectBooks();
 console.log("CATALOGUE",JSON.stringify({selection:"gutendex english public-domain topic top pages",topics:TOPICS,pagesPerTopic:PAGES_PER_TOPIC,maxBooks:MAX_BOOKS,selected:books.length,ids:books.map(b=>b.id)}));
 const results=[];
 for(let i=0;i<books.length;i++){
   const book=books[i];
   try{
     const text=cleanGutenberg(await getText(book.url));
     const words=englishWords(text);
     if(words.length<300||words.length>MAX_WORDS)continue;
     const lengths=words.map(runeLength);
     const match=scan(INDEX,TARGET,lengths,words);
     const hash=crypto.createHash("sha256").update(text).digest("hex");
     results.push({id:book.id,title:book.title,topic:book.topic,sha256:hash,...match});
     if(match.best.length>=20)console.log("CANDIDATE",JSON.stringify({id:book.id,title:book.title,...match.best}));
   }catch(e){
     console.log("BOOK_ERROR",JSON.stringify({id:book.id,error:String(e)}));
   }
   if(i%25===24)console.log("PROGRESS",JSON.stringify({booksSeen:i+1,scanned:results.length,highScore:Math.max(0,...results.map(r=>r.best?.length||0))}));
 }
 results.sort((a,b)=>(b.best?.length||0)-(a.best?.length||0));
 console.log("SUMMARY",JSON.stringify({scanned:results.length,failed:books.length-results.length,
   selectedTopicRules:TOPICS,
   top:results.slice(0,30).map(r=>({id:r.id,title:r.title,topic:r.topic,sha256:r.sha256,sourceWords:r.sourceWords,seedHits:r.seedHits,qualifying:r.qualifying,best:r.best})),
   all:{idAndMax:results.map(r=>[r.id,r.best?.length||0])}
 }));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={targetIndex,scan,cleanGutenberg,selectBooks};
