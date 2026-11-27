"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function build(data){
 const gp=JSON.parse(data[0]),mp=new Map(gp.runes.map((r,i)=>[r,i])),tr=new Map(gp.translit.map((r,i)=>[r,i]));
 const parse=s=>(s.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>[...w].map(x=>mp.get(x).toString(29)).join(""));
 const solved=JSON.parse(data[3]).sections.map(x=>parse(x.source_text)),d=new Map();
 const add=(s,f)=>{if(s.length&&s.length<40)d.set(s,Math.max(d.get(s)||0,f))};
 function word(w,f){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");function go(i,s){if(i===w.length){add(s,f);return}for(let n=1;n<=3&&i+n<=w.length;n++){const a=w.slice(i,i+n),v=tr.get(a==="ING"?"NG":a==="IO"?"IA":a);if(v!==undefined)go(i+n,s+v.toString(29))}}go(0,"")}
 for(const l of data[2].split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m)word(m[1],+m[2])}
 for(const w of solved.flat())add(w,1);for(const s of ["A","I","O"])word(s,1);
 if(d.size!==40751)throw Error("dictionary count");
 function last(w){let n=0,i=w.length;while(n<76)n+=w[--i].length;return w.slice(i).join(" ")}
 const original=[32,53,55].map(p=>{const w=parse(data[1].split("%")[p<50?p:p-1].replace(/[\s/%]/g,""));if(w.join("")!==gp.pages[p].indices.map(v=>v.toString(29)).join(""))throw Error("original page "+p);return w.join(" ")});
 return [String(d.size),...[...d.keys()].sort().map(w=>w+" "+d.get(w)),"3",...[1,4,8,0,2,5].map(i=>last(solved[i])),...original,""].join("\n");
}
if(require.main===module)process.stdout.write(build(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))));
module.exports={build,files};
