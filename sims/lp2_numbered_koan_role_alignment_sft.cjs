"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function analyze(source,native,quotes){
 const words=s=>s.replace(/'/g,"").match(new RegExp("["+native.runes.join("")+"]+","gu"))||[];const shape=w=>w.map(x=>[...x].length);const sig=w=>shape(w).join(",");const matches=(w,p)=>{const z=[];for(let i=0;i<=w.length-p.length;i++)if(p.every((v,j)=>w[i+j].length===v))z.push(i);return z;};
 const pages=source.replace(/\r\n/g,"\n").split("\n%\n");const s=pages.slice(36,39).join("\n");const m=[...s.matchAll(/(?:^|\n)([1-5])-/g)];const units=m.map((x,i)=>s.slice(x.index+x[0].length,i<4?m[i+1].index:s.indexOf("\n&\n",x.index)).replace(/[\/\n]/g,""));const unitWords=units.map(words);const sentences=units.flatMap((u,i)=>u.split(".").filter(x=>words(x).length).map((x,j)=>({unit:i+1,sentence:j+1,words:words(x)})));const get=name=>native.sections.find(x=>x.name===name).source_text;
 const koan=get("0_koan_1"),koan2=get("jpg107-167"),parable=get("p57_parable"),loss=get("0_loss_of_divinity");
 const question=words(koan.match(/"([^"]+)"/)[1]);const pattern=shape(question);const allKoan=words(koan);const exactQ=matches(allKoan,pattern).filter(i=>question.every((w,j)=>allKoan[i+j]===w));const numberedLoss=[...loss.matchAll(/(?:^|\n)[12]([^\n]+)/g)].map(x=>words(x[1]));
 function pairCommon(list,k,end){const pairs=[];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const a=end?list[i].slice(-k):list[i].slice(0,k),b=end?list[j].slice(-k):list[j].slice(0,k);if(a.length===k&&b.length===k&&sig(a)===sig(b))pairs.push([i+1,j+1]);}return pairs;}
 return {pages:pages.length,unitLengths:unitWords.map(x=>shape(x).reduce((a,b)=>a+b,0)),unitWordCounts:unitWords.map(x=>x.length),sentenceShapes:sentences.map(x=>({unit:x.unit,sentence:x.sentence,wordCount:x.words.length,start:shape(x.words.slice(0,3)),end:shape(x.words.slice(-3))})),question:question.join(" "),questionShape:pattern,questionExactOccurrencesInKoan:exactQ,questionShapeOccurrencesByUnit:unitWords.map(x=>matches(x,pattern)),questionShapeOccurrencesBySentence:sentences.map(x=>matches(x.words,pattern)),unitPrefixPairs2:pairCommon(unitWords,2,false),unitSuffixPairs2:pairCommon(unitWords,2,true),sentencePrefixPairs2:pairCommon(sentences.map(x=>x.words),2,false),sentenceSuffixPairs2:pairCommon(sentences.map(x=>x.words),2,true),sentencePrefixPairs3:pairCommon(sentences.map(x=>x.words),3,false),sentenceSuffixPairs3:pairCommon(sentences.map(x=>x.words),3,true),numberedOrdinaryControl:{counts:numberedLoss.map(x=>x.length),prefix:numberedLoss.map(x=>shape(x.slice(0,2))),quoteChars:[...loss].filter(x=>x==='"').length},quoteCounts:[koan,koan2,parable].map(x=>[...x].filter(y=>y==='"').length),targetQuoteSpans:quotes.quotes.filter(x=>x.page_slices.some(y=>y.page>=36&&y.page<=38))};
}
const files=["resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-quote-punctuation-spans.json"];
const result=analyze(read(files[0]),JSON.parse(read(files[1])),JSON.parse(read(files[2])));
assert.deepEqual(result.unitLengths,[139,91,98,96,129]);
assert.deepEqual(result.unitWordCounts,[30,20,25,19,28]);
assert.deepEqual(result.questionShape,[3,3,3,3,6,2,5,4]);
assert.equal(result.questionExactOccurrencesInKoan.length,5);
console.log(JSON.stringify(result,null,2));
