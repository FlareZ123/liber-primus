"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
const gp=read("resources/liber-primus/lp2-corpus.json"),native=read("resources/external/relikd-solved-gp29-native-v1.json");
const chars="abcdefghijklmnopqrstuvwxyzABC",enc=v=>v.map(x=>chars[x]).join("");
for(const s of native.sections)console.log(s.name+" "+enc([...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)));
for(const [a,b] of [[0,2],[3,7],[54,55]])console.log("p"+a+"-"+b+" "+enc(gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)));
