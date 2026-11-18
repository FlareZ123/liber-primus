"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=r=>fs.readFileSync(path.join(root,r),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const ri=new Map(corpus.runes.map((r,i)=>[r,i])),tokens=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet;
const gpt=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gpText(s){const n=s.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Q/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");let o=[];for(let i=0;i<n.length;){const t=gpt.find(x=>n.startsWith(x.symbol,i));assert.ok(t);o.push(t.value);i+=t.symbol.length}return o}
const sum=a=>a.reduce((x,y)=>x+y,0),gp1=a=>a.reduce((x,y)=>x+y+1,0);
function dec(t,a){return a.indexOf(t[0])*a.length+a.indexOf(t[1])}
const parts=transcription.split(/^\s*%\s*$/m);
function part(p){return parts[p<=49?p:p-1]}
function words(p){const n=part(p).replace(/\/\s*/gu,"");return(n.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(r=>ri.get(r)))}
function translit(a){return a.map(v=>corpus.translit[v]).join("")}
const p57=solved.sections.find(s=>s.name==="p57_parable"),clearWords=wordsFromSolved(p57.source_text);
function wordsFromSolved(text){const n=text.replace(/\/\s*/gu,"");return(n.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(r=>ri.get(r)))}
const rows=clearWords.map((w,i)=>({position:i+1,text:translit(w),gp0:sum(w)}));
const we=rows.find(x=>x.text==="WE"),must=rows.find(x=>x.text==="MUST");
assert.ok(we&&must);assert.equal(we.position,9);assert.equal(must.position,10);assert.equal(must.gp0,51);
// FIND independently fixes p28.
assert.equal(sum(gpText("FIND")),42);assert.equal(tokens[42],"0S");assert.equal(dec(tokens[42],a60),28);
// Authenticated NEXT points back to the p28 DH line under the finite pointer gate.
assert.equal(sum(gpText("NEXT")),57);assert.equal(tokens[57],"1w");assert.equal(dec(tokens[57],a60),118);
const p28Lines=part(28).trim().split("/").filter(x=>x.trim().length);let off=0;const lineStarts=[];
for(const line of p28Lines){lineStarts.push(off);off+=[...line].filter(r=>ri.has(r)).length}
assert.equal(lineStarts[5],117);
const line6=[...p28Lines[5]].map(r=>ri.get(r)).filter(v=>v!==undefined);
assert.equal(translit(line6.slice(0,2)),"DH");
// Literal local NEXT from selected page-numbered word28 to word29.
const p28=words(28),selected=p28[27],next=p28[28];
assert.deepEqual(selected,[28,24,10,1,20]);assert.deepEqual(next,[24,25]);
assert.equal(next.length,2);assert.equal(next[1],next[0]+1);assert.equal(gp1(next),must.gp0);
// Across all page-numbered successors, p28 uniquely has both locked properties.
const family=[];
for(let p=1;p<=55;p++){if(p===50)continue;const ws=words(p);if(ws.length<=p)continue;const n=ws[p];family.push({page:p,gp1:gp1(n),forwardAdjacent:n.length===2&&n[1]===n[0]+1})}
assert.equal(family.length,48);
assert.deepEqual(family.filter(x=>x.forwardAdjacent).map(x=>x.page),[28]);
assert.deepEqual(family.filter(x=>x.gp1===must.gp0).map(x=>x.page),[28]);
assert.deepEqual(family.filter(x=>x.forwardAdjacent&&x.gp1===must.gp0).map(x=>x.page),[28]);
console.log(JSON.stringify({status:"PASS: authenticated NEXT locally selects p28 successor, which uniquely yields MUST",nextPointer:{gp0:57,token:"1w",base60:118,p28LineStart:117,fragment:"DH"},successor:{selectedWord:28,nextWord:29,values:next,gp1:gp1(next),clearTarget:"MUST"},family:{pageNumberedSuccessors:family.length,uniqueJoint:family.filter(x=>x.forwardAdjacent&&x.gp1===must.gp0)}},null,2));
