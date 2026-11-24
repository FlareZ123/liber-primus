// Produces the exact input of the C++ blind redraw solver.
"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json"),native=read("resources/external/relikd-solved-gp29-native-v1.json");
const chars="abcdefghijklmnopqrstuvwxyzABC";
for(const {name,source_text} of native.sections){
 const s=Array.from(source_text).map(x=>native.runes.indexOf(x)).filter(x=>x>=0).map(x=>chars[x]).join("");
 console.log(name+" "+s);
}
for(const [a,b] of [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]]){
 const s=corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices).map(x=>chars[x]).join("");
 console.log("p"+a+"-"+b+" "+s);
}
