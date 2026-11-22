"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const table = require("../resources/liber-primus/lp2-grid-256.json");
const trans = fs.readFileSync(path.join(root,"resources","liber-primus","lp2-transcription.txt"),"utf8");
const signed = fs.readFileSync(path.join(root,"resources","historical","cicada2016-4gq25-outguess.asc"),"utf8");
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const toks = corpus.translit.map((text,i)=>({text,i})).sort((a,b)=>b.text.length-a.text.length);
function gp(word){
  const s=word.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S");
  const out=[]; let at=0;
  while(at<s.length){
    const t=toks.find(x=>s.startsWith(x.text,at)); assert.ok(t, word+"@"+at);
    out.push(t.i); at+=t.text.length;
  }
  return out;
}
const sum=a=>a.reduce((x,y)=>x+y,0);
function pageWords(page){
  const src=trans.split(/\r?\n%\r?\n/)[page]; const words=[];
  let current=[],offset=0,start=0;
  const flush=()=>{if(current.length){words.push({index:words.length,start,length:current.length,indices:current});current=[];}};
  for(const ch of [...src]){
    const v=runeIndex.get(ch);
    if(v!==undefined){if(!current.length)start=offset;current.push(v);offset++;}
    else if(ch==="-"||ch===".")flush();
  }
  flush(); return words;
}
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n");
const message=clear.split(/[^A-Za-z0-9]+/).filter(x=>/^[A-Za-z]+$/.test(x));
assert.equal(message.length,43);
const K=2,hits=[];
for(let i=0;i<message.length-1;i++){
  const g=sum(gp(message[i]));
  if(g+K===i+1)hits.push({i,word:message[i].toLowerCase(),gp0:g,next:i+1,nextWord:message[i+1].toLowerCase()});
}
assert.deepEqual(hits,[{i:36,word:"good",gp0:35,next:37,nextWord:"luck"}]);
for(const k of [5,6,8,15,19,23]){
  const h=[];
  for(let i=0;i<message.length-1;i++)if(sum(gp(message[i]))+k===i+1)h.push(i);
  assert.deepEqual(h,[]);
}
const modHits=[];
for(let i=0;i<message.length-1;i++){
  const r=((i+1-sum(gp(message[i])))%29+29)%29;
  if(r===K)modHits.push([i,message[i].toLowerCase()]);
}
assert.deepEqual(modHits,[[26,"numbers"],[36,"good"]]);
const p2=pageWords(2);
assert.equal(sum(gp("GOOD")),35);
assert.equal(table.bytes[35],39);
const recv=p2.find(w=>w.start<=39&&39<w.start+w.length);
assert.ok(recv);
assert.deepEqual({index:recv.index,start:recv.start,length:recv.length,end:recv.start+recv.length-1},{index:9,start:36,length:4,end:39});
assert.equal(recv.length,gp("GOOD").length);
assert.equal(sum(recv.indices),37);
assert.equal(sum(recv.indices)-sum(gp("GOOD")),K);
assert.equal(table.bytes[37],80);
assert.deepEqual(recv.indices.map(i=>corpus.translit[i]),["U","TH","H","Y"]);
assert.deepEqual(gp("GOOD").map(i=>corpus.translit[i]),["G","O","O","D"]);
console.log(JSON.stringify({classification:"retrospective shared2 source selector",K,hits,modHits,receiver:{page:2,word:9,offsets:[36,39],ciphertext:recv.indices.map(i=>corpus.translit[i]),conditional:"GOOD",cipherGp0:37,plainGp0:35,endpoint:80},decision:"shared2 selects GOOD before receiver; letterwise inverse remains unknown"},null,2));
