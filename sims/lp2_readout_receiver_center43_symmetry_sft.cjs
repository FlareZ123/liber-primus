"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=r=>fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const parts=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m);
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const gt=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(w){const n=w.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const o=[];for(let i=0;i<n.length;){const t=gt.find(x=>n.startsWith(x.s,i));assert.ok(t);o.push(t.i);i+=t.s.length}return o}
const sum=a=>a.reduce((x,y)=>x+y,0);
function b60(t){return grid.alphabet.indexOf(t[0])*60+grid.alphabet.indexOf(t[1])}
function parse(s){const runes=[],words=[];let cur=[],st=0;const flush=()=>{if(!cur.length)return;words.push({number:words.length+1,start:st,end:runes.length-1,values:cur.slice()});cur=[]};for(const ch of [...s]){const v=ri.get(ch);if(v!==undefined){if(!cur.length)st=runes.length;runes.push(v);cur.push(v)}else if(ch==="-"||ch===".")flush()}flush();return{runes,words}}
const table=grid.pages.flatMap(p=>p.tokens);
const readV=sum(gp("READ")),outV=sum(gp("OUT")),allV=sum(gp("READOUT"));
assert.deepEqual([readV,outV,allV],[55,20,75]);
const left=b60(table[readV]),right=b60(table[outV]),whole=b60(table[allV]);
assert.deepEqual([left,right,whole],[80,102,177]);
const split=(left+right)/2;assert.equal(split,91);
const p0=parse(parts[0]);
const sw=p0.words.filter(w=>w.start>=left&&w.end<=right);
assert.deepEqual(sw.map(w=>w.number),[18,19,20,21]);assert.equal(p0.runes[split],0);
const ww=p0.words.filter(w=>w.start>=whole-11&&w.end<=whole+11);
assert.deepEqual(ww.map(w=>w.number),[38,39,40,41,42]);assert.equal(ww[0].start,166);assert.equal(ww.at(-1).end,188);assert.equal(p0.runes[whole],0);
const p28=corpus.pages.find(p=>p.page===28);assert.equal(p28.runic_count,269);
const center=(p28.runic_count-1)/2;assert.equal(center,134);
const m=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);assert.ok(m);
const natural=m[1].match(/\b[A-Za-z]+\b/gu)||[];assert.equal(natural.length,43);assert.ok(natural.includes("OpenPGP"));assert.ok(!natural.includes("A"));assert.ok(!natural.includes("F"));
const direction=natural.length;
assert.deepEqual([center-direction,center+direction],[split,whole]);
assert.equal((split+whole)/2,center);assert.equal((whole-split)/2,direction);
const alt={gpAlphabetSize:29,lp2PageCount:58,p28WordCount:parse(parts[28]).words.length,signedInstructionSentenceWords:16,naiveAlphabeticSubstrings:(m[1].match(/[A-Za-z]+/gu)||[]).length};
assert.deepEqual(alt,{gpAlphabetSize:29,lp2PageCount:58,p28WordCount:59,signedInstructionSentenceWords:16,naiveAlphabeticSubstrings:45});
for(const v of Object.values(alt))assert.notDeepEqual([center-v,center+v],[split,whole]);
console.log(JSON.stringify({status:"PASS",source:{p28RuneCount:p28.runic_count,p28Center:center,signed2016NaturalWords:direction,alternatives:alt},readoutNavigation:{gp0:{READ:readV,OUT:outV,READOUT:allV},base60:{READ:left,OUT:right,READOUT:whole},splitReceiver:{span:[80,102],center:split,words:sw.map(w=>w.number),centerRune:corpus.translit[p0.runes[split]]},wholeReceiver:{span:[166,188],center:whole,words:ww.map(w=>w.number),centerRune:corpus.translit[p0.runes[whole]]}},exactRelation:{equation:"H_integer(134,43)=(91,177)",midpoint:(split+whole)/2,halfDistance:(whole-split)/2},classification:"source-linked geometric echo: receiver pair was independently selected before this relation; 43-word interpretation was recognized afterward and remains provisional"},null,2));
