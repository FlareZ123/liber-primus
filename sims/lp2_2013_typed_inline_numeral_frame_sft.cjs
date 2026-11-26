"use strict";
const paths=[
  "resources/external/2013-liber-al-bookcode-I.txt",
  "resources/external/2013-liber-al-bookcode-II.txt",
  "resources/external/2013-liber-al-bookcode-III.txt",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/liber-primus/lp2-corpus.json"
];
const signedUrl="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/001-232.jpg/232.jpg.asc";
function main(inputs){
 const [c1,c2,c3,raw,cjson,signed]=inputs,R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
 const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
 const chapters=[c1,c2,c3].map(x=>x.split(/\d+\. /).filter(Boolean).map(s=>s.replace(/[ \n]/g,"")));
 const verses=chapters.flatMap((v,c)=>v.map((s,i)=>({id:["I","II","III"][c]+":"+(i+1),s})));
 assert(chapters.map(c=>c.length).join(",")==="66,79,75","verse count");
 function next(ch,cur){let i=verses.findIndex((v,j)=>j>=cur&&v.s.includes(ch));if(i<0)i=verses.findIndex(v=>v.s.includes(ch));if(i<0)return {record:ch,cur:0,literal:true};const v=verses[i];return {record:v.id+":"+(v.s.indexOf(ch)+1),cur:i+1,literal:false}}
 function encode(text){let cur=0;return [...text].map(ch=>{const x=next(ch,cur);cur=x.cur;return x.record})}
 function receive(records){let cur=0,out="",literals=[];for(let j=0;j<records.length;j++){const rec=records[j];let ch;const m=rec.match(/^(I|II|III):([1-9]\d*):([1-9]\d*)$/);if(m){const v=verses.find(v=>v.id===m[1]+":"+m[2]);ch=v?.s[+m[3]-1];if(ch===undefined)return {ok:false,index:j,reason:"out-of-range coordinate"}}else if([...rec].length===1){ch=rec;literals.push(j)}else return {ok:false,index:j,reason:"untyped record"};const expect=next(ch,cur);if(expect.record!==rec)return {ok:false,index:j,reason:"noncanonical cursor/escape",got:rec,expect:expect.record};cur=expect.cur;out+=ch}return {ok:true,out,literals}}
 const hist=signed.split(/\r?\n/).filter(s=>/^(?:I|II|III):\d+:\d+$|^[0-9]$/.test(s));
 const d=receive(hist);assert(hist.length===46&&d.ok&&d.literals.join(",")==="32,44"&&encode(d.out).join("\n")===hist.join("\n"),"history");
 const digits=Array.from("0123456789",ch=>({ch,occurrences:verses.reduce((n,v)=>n+[...v.s].filter(x=>x===ch).length,0),initial:next(ch,0).record,records:hist.filter((rec,i)=>d.out[i]===ch)}));
 const plantText="The7 road5 is0 within7 the5 words0.";const plant=encode(plantText),pd=receive(plant);assert(pd.ok&&pd.out===plantText&&pd.literals.length>=4,"plant");
 const wrong=plant.slice();wrong[plantText.indexOf("7")]="7";const rejected=receive(wrong);assert(!rejected.ok&&rejected.index===plantText.indexOf("7"),"literal rejection");
 const pages=raw.split("%"),canon=JSON.parse(cjson);const expected=canon.pages.filter(p=>p.page>=8&&p.page<=14).flatMap(p=>p.indices);
 const chapter=pages.slice(8,15).join("%"),toRunes=s=>[...s].filter(c=>R.includes(c)).map(c=>R.indexOf(c));assert(JSON.stringify(toRunes(chapter))===JSON.stringify(expected),"chapter source");
 const events=[];let pos=0;for(let p=0;p<pages.length;p++){let line=0,runeOffset=0;for(const ch of pages[p]){if(ch==="/")line++;if(R.includes(ch)){pos++;runeOffset++}if(/[0-9]/.test(ch))events.push({page:p+(p>=50?1:0),line:line+1,runeOffset,globalRuneOffset:pos,ch})}}
 const tokenRegex=new RegExp("["+R+"]+|[0-9]+","gu");
 const recordStats=records=>{const rr=records.map(x=>({text:x,fields:x.match(tokenRegex)||[]})).filter(x=>x.fields.length);const histogram={};let arityOnly=0;for(const x of rr){const n=x.fields.length;histogram[n]=(histogram[n]||0)+1;if(n===3||n===1&&/^[0-9]$/.test(x.fields[0]))arityOnly++}return {records:rr.length,arityOnly,incompatible:rr.length-arityOnly,histogram,withArabic:rr.filter(x=>x.fields.some(t=>/^[0-9]+$/.test(t))).map(x=>x.fields)}};
 const lines=recordStats(pages.slice(8,15).flatMap(s=>s.split("/").map(x=>x.replace(/\s/g,""))));
 const stops=recordStats(chapter.replace(/[\/%\s]/g,"").split(/[.&$§]/g));
 const seven=events.find(e=>e.ch==="7");assert(seven&&seven.page===10&&seven.line===8,"inline numeral source");
 const nr=digits.find(x=>x.ch==="7");assert(nr.occurrences>0&&nr.records.length>0&&nr.records.every(x=>x.includes(":")),"historical7");
 const p10line=pages[10].split("/")[7].replace(/\s/g,"");
 return {historical:{records:hist.length,literals:d.literals,digits,verseLengths:chapters.map(c=>c.length),characters:verses.reduce((n,v)=>n+v.s.length,0)},plant:{records:plant,decoded:pd.out,literals:pd.literals,wrongLiteral:rejected},original:{chapterRunes:expected.length,events,p10line,lines,stops,colonCount:(chapter.match(/:/g)||[]).length}};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");(async()=>{const r=await fetch(signedUrl);if(!r.ok)throw Error("signed source HTTP "+r.status);console.log(JSON.stringify(main([...paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),await r.text()]),null,2))})().catch(e=>{console.error(e);process.exitCode=1});}
