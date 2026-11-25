"use strict";
// Prepare pinned historical GEB key and original/held-out native rune arrays.
const fs=require("node:fs"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const URL="https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt";
const read=p=>fs.readFileSync(p,"utf8"),corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),native=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const alphabet=corpus.runes,ix=new Map(alphabet.map((v,i)=>[v,i])),parse=t=>Array.from(t).filter(x=>ix.has(x)).map(x=>ix.get(x));
const latin="F U TH O R C G W H N I J EO P X S T B E M L ING OE D A AE Y IA EA".split(" ");
const tokens=latin.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function toBook(t,letters){const ts=letters?tokens.filter(x=>x.t.length===1):tokens,alias={V:1,K:5,Z:15,Q:5},out=[];t=t.normalize("NFKD").replace(/\p{M}/gu,"").replace(/[^A-Za-z ]/g," ").toUpperCase().replace(/QU/g,"CW");for(const w of t.match(/[A-Z]+/g)||[])for(let j=0;j<w.length;){const v=ts.find(x=>w.startsWith(x.t,j));if(v){out.push(v.i);j+=v.t.length}else{out.push(alias[w[j]]??0);j++}}return out}
async function main(){
 const letters=process.argv[2]==="letters",sign=Number(process.argv[3]);assert([1,-1].includes(sign));
 const res=await fetch(URL);assert(res.ok,"GEB fetch "+res.status);
 const bytes=Buffer.from(await res.arrayBuffer());assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),"2674287a2f6ccdf9f263451b9e332d57d39af7891090ddc3561b6c5fa7fccf8e");
 const key=toBook(bytes.toString("utf8"),letters);assert.equal(key.length,letters?1470789:1399392);
 const lines=read("resources/transcriptions/lp2-image-corrected.txt").split(/\n/).map(parse).filter(x=>x.length).slice(0,594);
 assert.deepEqual(lines.flat(),corpus.pages.slice(0,56).flatMap(p=>p.indices));
 const terminal=lines.slice(579);assert.deepEqual(terminal.slice(0,11).flat(),corpus.pages[54].indices);assert.deepEqual(terminal.slice(11).flat(),corpus.pages[55].indices);
 const sections=native.sections.map(s=>parse(s.source_text)),train=sections.slice(0,4),donor=sections.slice(4,7).flat();assert(donor.length>=616);
 // Plain numeric stream only in ephemeral runner; no book text or key tape in repository or artifact.
 const arr=[key.map(k=>(k*sign+29)%29),...train,donor,...terminal];
 fs.writeFileSync("geb-line-input.txt",arr.map(a=>a.length+" "+a.join(" ")).join("\n")+"\n");
 console.log(JSON.stringify({format:letters?"letters":"digraph",sign,keyLength:key.length,trainRunes:train.flat().length,lineLengths:terminal.map(x=>x.length)}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
