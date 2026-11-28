'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const specs=[
  [
    "neuroretransmit/cicada",
    "2013/001-232.jpg/232.jpg.asc",
    "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
    "a62a45bec4752ab49bd0d9f344d429df0cf9dc68"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/external/2013-liber-al-bookcode-I.txt",
    null,
    "64876892683fab1467481fe87d85743a8ea17982"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/external/2013-liber-al-bookcode-II.txt",
    null,
    "cb4353b080d7584441f85502aeccb60796e6fe0f"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/external/2013-liber-al-bookcode-III.txt",
    null,
    "36e716252a271d31f5c4ba25b3cb78199ccc1114"
  ],
  [
    "neuroretransmit/cicada",
    "2014/001-twitter/zN4h51m.jpg.asc",
    "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3",
    "1f9a61b97d5de9c4ca57402c064365a503d956a9"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt",
    null,
    "12a6bc018047a1276e77f2b7f633d5905732fff9"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/liber-primus/lp2-corpus.json",
    null,
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/transcriptions/lp2-image-corrected.txt",
    null,
    "f7b534a33edeb212d427329798438325307463d7"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/liber-primus/lp2-ink-annotations.json",
    null,
    "0614aca67969a14ae006e0c1ae6aee6dcd8136e6"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/cicada2014-onion5-signed-message.asc",
    null,
    "e0ed3d728782d9d42dab82fb7a54b8d07ae2cea3"
  ]
];
function analyze(raw) {
 const [signed13,c1,c2,c3,signed14,emerson,ct,tr,ink,geb]=raw;
 const chapters=[c1,c2,c3].map(x=>x.split(/\d+\. /).filter(Boolean).map(s=>s.replace(/[ \n]/g,'')));
 const verses=chapters.flatMap((v,c)=>v.map((s,i)=>({id:["I","II","III"][c]+":"+(i+1),s})));
 const records=signed13.split(/\r?\n/).filter(s=>/^(?:I|II|III):\d+:\d+$|^[05]$/.test(s));
 const detail=[];let choices=1n;const seen=new Set();
 const plaintext=records.map(l=>{if(!l.includes(":"))return l;const [c,v,k]=l.split(":");const verse=verses.find(x=>x.id===c+":"+v).s;const ch=verse[+k-1];if(ch===undefined)throw Error("bad record "+l);const n=[...verse].filter(x=>x===ch).length;if(!seen.has(l)){choices*=BigInt(n);seen.add(l)}detail.push({record:l,first:verse.indexOf(ch)+1===+k,occurrences:n});return ch;}).join("");
 function encode(text){let cur=0;const wrap=[],literal=[];const out=[...text].map((ch,j)=>{let i=verses.findIndex((x,i)=>i>=cur&&x.s.includes(ch));if(i<0){wrap.push(j);i=verses.findIndex(x=>x.s.includes(ch));}if(i<0){cur=0;literal.push(j);return ch;}cur=i+1;return verses[i].id+":"+(verses[i].s.indexOf(ch)+1)});return {out,wrap,literal}}
 const enc=encode(plaintext);const mismatch=enc.out.flatMap((x,i)=>x!==records[i]?[{i,got:x,want:records[i]}]:[]);
 const sourcePunctuationOutput=records.flatMap((record,i)=>/[.:-]/.test(plaintext[i])?[{record,character:plaintext[i]}]:[]);
 const sourcePunctuationStrippedVerses=verses.map(x=>({
  id:x.id,s:x.s.replace(/[^\\p{L}\\p{N}]/gu,"")
 }));
 const strippedDecoded=records.map(record=>{
  if(!record.includes(":"))return record;
  const [chapter,verse,idx]=record.split(":");
  const source=sourcePunctuationStrippedVerses.find(x=>x.id===chapter+":"+verse)?.s;
  return source?.[Number(idx)-1]??"?";
 }).join("");
 const markedPunctuationCounterfactual={
  sourcePunctuationRetained:plaintext,
  sourcePunctuationStripped: strippedDecoded,
  firstSourceCoordinate:"I:1:6",
  firstRetained:plaintext[0],
  firstStripped:strippedDecoded[0],
  literalDigitRecords:records.filter(x=>/^[05]$/.test(x)),
  punctuationCoordinates:sourcePunctuationOutput,
  differingResultPositions:[...plaintext].filter((x,i)=>x!==strippedDecoded[i]).length
 };
 if(markedPunctuationCounterfactual.firstRetained!=="h" ||
    markedPunctuationCounterfactual.firstStripped!=="e" ||
    markedPunctuationCounterfactual.punctuationCoordinates.length!==8 ||
    markedPunctuationCounterfactual.differingResultPositions<10)
   throw Error("historical punctuation typed counterfactual failed");

 if(plaintext!=="https:--www.dropbox.com-s-r7sgeb5dtmzj14s-3301"||records.length!==46||mismatch.length||detail.length!==44)throw Error("2013 forward replay failed");
 const q=signed14.split(/\r?\n/).filter(s=>/^(?:\d+:){3}\d+$|^[.on3i]$/.test(s));const pars=emerson.split('\n\n').map(p=>p.split(/(?<=[.!?])\s+/).map(s=>s.replace(/\n/g,' ').trim().split(/\s+/)));
 const p14detail=[];const dec=q.map(s=>{if(s.length===1)return s;let [i,j,k,l]=s.split(":").map(x=>+x-1);if(i>=44)i++;const word=pars[i]?.[j]?.[k],ch=word?.[l];if(ch===undefined)throw Error("2014 invalid record "+s);p14detail.push({record:s,first:word.indexOf(ch)===l});return ch}).join("");
 if(dec!=="auqgnxjtvdbll3pv.onion"||q.length!==22)throw Error("2014 replay failed");
 const corpus=JSON.parse(ct),ann=JSON.parse(ink),pageStart=[];let total=0;for(const p of corpus.pages){pageStart[p.page]=total;total+=p.indices.length}
 const colors=Array(total).fill(false);for(const p of ann.pages)for(const s of p.red_spans??[]){const i=pageStart[p.page]+s.start;if(s.runes!==corpus.pages[p.page].indices.slice(s.start,s.start+s.length).map(i=>corpus.runes[i]).join(""))throw Error("ink mismatch");for(let j=0;j<s.length;j++)colors[i+j]=true;}
 const map=new Map(corpus.runes.map((s,i)=>[s,i]));const words=[];let w=[],start=0,k=0;for(const s of tr){if(map.has(s)){if(!w.length)start=k;w.push(map.get(s));k++}else if("-.\u0026$§".includes(s)&&w.length){words.push({start,w});w=[]}}if(w.length)words.push({start,w});if(words.flatMap(x=>x.w).join(",")!==corpus.pages.flatMap(p=>p.indices).join(","))throw Error("corpus mismatch");
 function minValue(w){let n=0n;const m=new Map();for(const x of w){if(!m.has(x))m.set(x,m.size);n=n*29n+BigInt(m.get(x));}return n}
 const sourceSize=verses.reduce((a,x)=>a+x.s.length,0),emersonSize=emerson.length;
 function stats(a,b){const ww=words.filter(x=>x.start>=a&&x.start<b);const out={};for(const color of ["red","black","mixed"]){const rows=ww.filter(x=>{const n=colors.slice(x.start,x.start+x.w.length).filter(Boolean).length;return (n===0?"black":n===x.w.length?"red":"mixed")===color});out[color]={words:rows.length,runes:rows.reduce((a,x)=>a+x.w.length,0),lt3:rows.filter(x=>x.w.length<3).length,lt4:rows.filter(x=>x.w.length<4).length,above2013:rows.filter(x=>minValue(x.w)>BigInt(sourceSize)).length,above2014:rows.filter(x=>minValue(x.w)>BigInt(emersonSize)).length,maxMin:rows.reduce((a,x)=>minValue(x.w)>a?minValue(x.w):a,0n).toString()};}return out}
 const g=geb.split(/\r?\n/).map(s=>s.trim()).filter(s=>/^[A-Z0-9.[\]]+:\d+:\d+:\d+$|^[37]$|^ONION$/.test(s));
 return {history2013:{records:records.length,coordinates:detail.length,distinctCoordinates:seen.size,first:detail.filter(x=>x.first).length,choicesWithoutCanonicalRule:choices.toString(),verseCounts:chapters.map(x=>x.length),sourceSize,wrap:enc.wrap,literal:enc.literal,mismatch,detail,typedPunctuation:markedPunctuationCounterfactual},history2014:{records:q.length,coordinates:p14detail.length,firstWithinWord:p14detail.filter(x=>x.first).length,nonmonotoneParagraphs:p14detail.slice(1).filter((x,i)=>+x.record.split(":")[0]<+p14detail[i].record.split(":")[0]).length,carrierLength:emersonSize},geb:{records:g.length,coordinates:g.filter(s=>s.includes(":")).length},unknown:stats(0,pageStart[56]),p56:stats(pageStart[56],pageStart[57]),p57:stats(pageStart[57],total),wordCount:words.length,runecount:k};
}
async function main(){const raw=await Promise.all(specs.map(async ([repo,path,ref,sha])=>{const b=ref?Buffer.from(await (await fetch('https://raw.githubusercontent.com/'+repo+'/'+ref+'/'+path)).arrayBuffer()):fs.readFileSync(path);const got=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(got!==sha)throw Error('source hash mismatch '+path);return b.toString('utf8')}));console.log(JSON.stringify(analyze(raw),null,2));}
main().catch(e=>{console.error(e);process.exitCode=1});
