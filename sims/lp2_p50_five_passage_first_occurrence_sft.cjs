'use strict';
const fs=require('node:fs');
const path=require('node:path');
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
    "FlareZ123/liber-primus",
    "resources/liber-primus/lp2-corpus.json",
    null,
    "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/liber-primus/lp2-transcription.txt",
    null,
    "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  ],
  [
    "FlareZ123/liber-primus",
    "resources/liber-primus/base60-grid.json",
    null,
    "4698c0806e6bab06a39cfbc3c3283b862de58b35"
  ]
];
function analyze(raw){
const [s,c1,c2,c3,ct,tr,g]=raw;const gp=JSON.parse(ct),grid=JSON.parse(g);
const verses=[c1,c2,c3].flatMap((v,j)=>v.split(/\d+\. /).filter(Boolean).map((p,i)=>({id:["I","II","III"][j]+":"+(i+1),s:p.replace(/[ \n]/g,'')})));const records=s.split(/\r?\n/).filter(x=>/^(?:I|II|III):\d+:\d+$|^[05]$/.test(x));const plain=records.map(l=>{if(!l.includes(":"))return l;const [c,v,k]=l.split(":");return verses.find(x=>x.id===c+":"+v).s[+k-1]}).join("");
function encode(tape,rows,ids,oneBased){let cur=0;return [...tape].map(x=>{let i=rows.findIndex((p,j)=>j>=cur&&p.includes(x));if(i<0)i=rows.findIndex(p=>p.includes(x));if(i<0){cur=0;return x}cur=i+1;return ids[i]+":"+(rows[i].indexOf(x)+oneBased)})}
const hist=encode(plain,verses.map(x=>x.s),verses.map(x=>x.id),1);if(hist.join("|")!==records.join("|")||records.length!==46)throw Error("historical replay mismatch");
const sec=tr.split("%").slice(36,39).join("\n"),labels=[...sec.matchAll(/([1-5])-/g)].map(x=>x.index),end=sec.indexOf("&",labels[4]);const rows=labels.map((x,i)=>[...sec.slice(x+2,labels[i+1]??end)].filter(r=>gp.runes.includes(r)).join(""));if(rows.map(x=>x.length).join()!=[139,91,98,96,129].join())throw Error("geometry");
const tokens=grid.rows.flat(),a=grid.alphabet;const rec=tokens.map((t,j)=>{let row=+t[0],off=a.indexOf(t[1]),x=rows[row][off];if(!x)throw Error("bad coord");return {j,t,row,off,x,first:rows[row].indexOf(x)}});let first=rec.filter(x=>x.off===x.first);const local={total:tokens.length,first:first.length,firstUnique:new Set(first.map(x=>x.t)).size,bad:rec.filter(x=>x.off!==x.first),missingSymbols:gp.runes.filter(x=>!first.some(y=>y.x===x)),uniqueFirstSymbols:new Set(first.map(x=>x.x)).size,byRow:rows.map((x,i)=>({i,total:rec.filter(x=>x.row===i).length,first:first.filter(x=>x.row===i).length,completeAlphabet:new Set(x).size}))};let pred=encode(rec.map(x=>x.x).join(""),rows,rows.map((_,i)=>String(i)),0);let expected=rec.map(x=>x.row+":"+x.off);if(local.total!==256||local.first!==103||local.uniqueFirstSymbols!==28)throw Error("original source mismatch");
return {historic:{records:records.length,exact:hist.every((x,i)=>x===records[i])},local,fullGreedy:{matching:pred.filter((x,i)=>x===expected[i]).length,firstMismatch:pred.findIndex((x,i)=>x!==expected[i])}}}
async function main(){const root=path.resolve(__dirname,'..');const raw=await Promise.all(specs.map(async ([repo,p,ref,sha])=>{let b;if(ref){const res=await fetch('https://raw.githubusercontent.com/'+repo+'/'+ref+'/'+p);if(!res.ok)throw Error('historical source HTTP '+res.status);b=Buffer.from(await res.arrayBuffer());}else b=fs.readFileSync(path.join(root,p));const got=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');if(got!==sha)throw Error('source blob mismatch '+p);return b.toString('utf8')}));console.log(JSON.stringify(analyze(raw),null,2));}
main().catch(e=>{console.error(e);process.exitCode=1});
