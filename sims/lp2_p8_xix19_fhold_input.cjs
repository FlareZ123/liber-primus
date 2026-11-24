"use strict";
const fs=require("node:fs");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const c=read("resources/liber-primus/lp2-corpus.json"),g=read("resources/external/relikd-solved-gp29-native-v1.json");
const source=c.pages.slice(8,15).flatMap(p=>p.indices);
const native=g.sections.flatMap(s=>[...s.source_text].map(x=>c.runes.indexOf(x)).filter(x=>x>=0));
const enc=a=>a.map(v=>v.toString(29)).join("");
if(source.length!==1729||native.length!==2979||native.includes(12)||native.includes(22))throw Error("source mismatch");
console.log(enc(source)+"\n"+enc(native.slice(0,1729)));
