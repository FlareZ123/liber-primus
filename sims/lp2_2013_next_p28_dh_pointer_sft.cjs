"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const tokens=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace("f","");
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const gpt=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(s){const n=s.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");let o=[];for(let i=0;i<n.length;){const t=gpt.find(x=>n.startsWith(x.symbol,i));assert.ok(t);o.push(t.value);i+=t.symbol.length;}return o}
const sum=a=>a.reduce((x,y)=>x+y,0);
function dec(t,a){return a.indexOf(t[0])*a.length+a.indexOf(t[1])}
function page(p){const parts=transcription.split(/\r?\n%\r?\n/),lines=parts[p<50?p:p-1].trim().split(/\r?\n/),values=[],ls=new Set(),le=new Set(),ws=new Set(),we=new Set();let off=0;for(const line of lines){ls.add(off);let iw=false;for(const ch of [...line]){const v=ri.get(ch);if(v!==undefined){if(!iw){ws.add(off);iw=true}values.push(v);off++;}else if("-./&$".includes(ch)&&iw){we.add(off-1);iw=false}}if(iw)we.add(off-1);le.add(off-1)}return{values,ls,le,ws,we}}
assert.equal(sum(gp("FIND")),42);assert.equal(tokens[42],"0S");assert.equal(dec(tokens[42],a59),28);assert.equal(dec(tokens[42],a60),28);
const p28=page(28);assert.equal(p28.values.length,269);assert.equal(p28.ls.size,12);
const opcodes=["RAND","QUINE","BASE29","CODE","KOAN","DH","NEXT","GOODBYE"],family=[];
for(const opcode of opcodes){const address=sum(gp(opcode.replace(/\d/g,""))),token=tokens[address];for(const [radix,a] of [["base59",a59],["base60",a60]]){const value=dec(token,a);for(const [origin,offset] of [["zeroBased",value],["oneBased",value-1]])family.push({opcode,address,token,radix,origin,value,offset,wordStart:p28.ws.has(offset),wordEnd:p28.we.has(offset),lineStart:p28.ls.has(offset),lineEnd:p28.le.has(offset),first2:offset>=0&&offset+1<p28.values.length?corpus.translit[p28.values[offset]]+corpus.translit[p28.values[offset+1]]:null})}}
const hit={opcode:"NEXT",address:57,token:"1w",radix:"base60",origin:"oneBased",value:118,offset:117,wordStart:true,wordEnd:false,lineStart:true,lineEnd:false,first2:"DH"};
assert.deepEqual(family.filter(x=>x.lineStart),[hit]);assert.deepEqual(family.filter(x=>x.first2==="DH"),[hit]);
const receivers=[];for(let p=0;p<=55;p++){if(p===50)continue;const x=page(p);if(x.values.length<118)continue;receivers.push({page:p,lineStart:x.ls.has(117),first2:corpus.translit[x.values[117]]+corpus.translit[x.values[118]]})}
assert.equal(receivers.length,52);
assert.deepEqual(receivers.filter(x=>x.lineStart),[{page:8,lineStart:true,first2:"AX"},{page:21,lineStart:true,first2:"PH"},{page:28,lineStart:true,first2:"DH"}]);
assert.deepEqual(receivers.filter(x=>x.first2==="DH"),[{page:28,lineStart:true,first2:"DH"}]);
console.log(JSON.stringify({status:"PASS",find:{gp0:42,token:"0S",page:28},commandFamily:{cases:family.length,lineStartHits:family.filter(x=>x.lineStart)},receiverCensus:{eligible:receivers.length,lineStartAt117:receivers.filter(x=>x.lineStart),dhAt117:receivers.filter(x=>x.first2==="DH")}},null,2));
