"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),out=process.argv[2]||process.cwd();
fs.mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const A=read("resources/liber-primus/lp2-corpus.json"),B=read("resources/external/relikd-solved-gp29-native-v1.json");
const raw=A.pages.slice(8,15).flatMap(p=>p.indices),native=B.sections.flatMap(s=>[...s.source_text].map(x=>A.runes.indexOf(x)).filter(x=>x>=0)).slice(0,1729);
if(raw.length!==1729||native.length!==1729)throw Error("length");
const pack=a=>a.map(v=>v.toString(29)).join("");
function write(name,a){fs.writeFileSync(path.join(out,name+".txt"),pack(a)+"\n"+pack(native)+"\n")}
function layouts(name,a){write(name+"-row",a);write(name+"-col",Array.from({length:1729},(_,i)=>a[(i%7)*247+Math.floor(i/7)]))}
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(t=>[v,...t])):[[]]}
layouts("printed",raw);
const mixed=raw.slice(0,692).concat([-1],raw.slice(692));
for(const tail of permutations([0,1,3,4])){
 const q=[2,...tail],d=Array.from({length:1730},(_,i)=>mixed[346*q[i%5]+Math.floor(i/5)]);
 if(d[0]!==-1||d.slice(1).includes(-1))throw Error("marker");
 layouts(q.join(""),d.slice(1));
}
