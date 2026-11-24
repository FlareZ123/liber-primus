"use strict";
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const g=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-grid-256.json"),"utf8"));
const tokens=g.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const hex=a=>tokens.map(t=>(a.length*a.indexOf(t[0])+a.indexOf(t[1])).toString(16).padStart(2,"0")).join("");
const streams=[hex(g.alphabet),hex(g.alphabet.replace("f",""))];
const needles=new Set(streams.flatMap(h=>Array.from({length:241},(_,i)=>h.slice(i*2,i*2+32))));
const literal=Array.from({length:249},(_,i)=>tokens.slice(i,i+8).join(" "));
/** @param {string} s */
function scan(s){
 const runs=[...s.matchAll(/(?:0x[0-9a-fA-F]{2}\s*,?\s*){16,}|[0-9a-fA-F]{2,}(?:(?:\s|\\\r?\n|"\s*")+[0-9a-fA-F]{2,})*/g)].map(m=>m[0].replace(/0x/g,"").replace(/[^0-9a-fA-F]/g,"").toLowerCase()).filter(x=>x.length>=32);
 const hits=[];
 for(const v of runs)for(let i=0;i<=v.length-32;i++)if(needles.has(v.slice(i,i+32)))hits.push(v.slice(i,i+32));
 const normal=s.replace(/\s+/g," ");
 for(const v of literal)if(normal.includes(v))hits.push(v);
 return {runs:runs.length,digits:runs.reduce((p,v)=>p+v.length,0),hits:[...new Set(hits)]};
}
assert(scan(streams[0].slice(0,16)+"\n"+streams[0].slice(16,32)).hits.includes(streams[0].slice(0,32)));
assert(scan(literal[0].replace(" ","\n")).hits.includes(literal[0]));
const dir=process.argv[2];assert(dir,"provide historical Crypto++ TestVectors directory");
const rows=fs.readdirSync(dir).filter(n=>n.endsWith(".txt")).sort().map(name=>{const s=fs.readFileSync(path.join(dir,name),"utf8");return{name,chars:s.length,...scan(s)}});
console.log(JSON.stringify({byteWindows:needles.size,literalWindows:literal.length,rows,totals:{files:rows.length,chars:rows.reduce((p,v)=>p+v.chars,0),runs:rows.reduce((p,v)=>p+v.runs,0),digits:rows.reduce((p,v)=>p+v.digits,0),hits:rows.reduce((p,v)=>p+v.hits.length,0)}},null,2));
