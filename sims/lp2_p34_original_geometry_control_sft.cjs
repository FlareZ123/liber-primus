'use strict';
// Director #3427: ciphertext-blind complete-word geometry control.
// Operates on canonical rune/word/period transcription; inspect original JPEG 51.jpg
// and comparison page 39.jpg for drawing placement. No ciphertext values are used.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const audit=function audit(textSource,corpus){
const letters=new Set(corpus.runes),chunks=textSource.replace(/\r/g,"").split(/\n%\n/),pages=[];
for(let index=0;index<chunks.length;index++){
 const pn=index<50?index:index+1,words=[],periods=[],s={at:0,row:0,last:"PAGE",cur:null};
 const end=(mark)=>{if(s.cur){s.cur.after=mark;words.push(s.cur);s.cur=null;}s.last=mark;};
 for(const ch of chunks[index]){
  if(letters.has(ch)){if(!s.cur)s.cur={start:s.at,length:0,ordinal:words.length,row:s.row,before:s.last};s.cur.length++;s.at++;s.last="RUNE";}
  else if(ch==="\n")s.row++;
  else if(ch==="-"||ch==="."||ch===","){end(ch);if(ch===".")periods.push(s.at);}
 }
 end("END");
 for(let i=0;i<words.length;i++){words[i].prevLen=words[i-1]?.length??null;words[i].prev2Len=words[i-2]?.length??null;words[i].nextLen=words[i+1]?.length??null;words[i].triad=words[i].length===2&&((words[i-2]?.length===2&&words[i-1]?.length===2)||(words[i-1]?.length===2&&words[i+1]?.length===2)||(words[i+1]?.length===2&&words[i+2]?.length===2));}
 pages.push({pn,runes:s.at,words,periods});
}
const target=pages.find(p=>p.pn===34),two=p=>p.words.filter(w=>w.length===2),opening3=p=>p.words.slice(0,3).length===3&&p.words.slice(0,3).every(w=>w.length===2),unsolved=pages.filter(p=>p.pn<=55);
const bad=pages.filter(p=>{const o=corpus.pages.find(x=>x.page===p.pn);return !o||o.runic_count!==p.runes;}).map(p=>p.pn);
if(bad.length)throw Error("Page transcription misaligned: "+bad.join(","));
return {source:"resources/liber-primus/lp2-transcription.txt",candidateOffsets:[4,249],pages:pages.length,runes:pages.reduce((n,p)=>n+p.runes,0),unsolvedPages:unsolved.length,unsolvedRunes:unsolved.reduce((n,p)=>n+p.runes,0),p34Count:target.runes,p34Words:target.words.length,p34TwoRuneWords:two(target).map(w=>w.start),p34Periods:target.periods,candidates:[4,249].map(offset=>({offset,...target.words.find(w=>w.start===offset)})),controls:{allPagesTwoRune:pages.reduce((n,p)=>n+two(p).length,0),unsolvedTwoRune:unsolved.reduce((n,p)=>n+two(p).length,0),p34FirstRowTwoRune:two(target).filter(w=>w.row===0).map(w=>w.start),p34InThreeRun:two(target).filter(w=>w.triad).map(w=>w.start),p34AfterPeriodTwoRune:two(target).filter(w=>w.before===".").map(w=>w.start),allAfterPeriodTwoRune:pages.reduce((n,p)=>n+two(p).filter(w=>w.before===".").length,0),unsolvedAfterPeriodTwoRune:unsolved.reduce((n,p)=>n+two(p).filter(w=>w.before===".").length,0),openingTriplePages:pages.filter(opening3).map(p=>p.pn),openingTripleWords:pages.filter(opening3).flatMap(p=>p.words.slice(0,3).map(w=>`${p.pn}:${w.start}`)),p34SentenceStarts:target.words.filter(w=>w.before===".").map(w=>w.start)}};
};
const text=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
console.log(JSON.stringify(audit(text,corpus),null,2));
