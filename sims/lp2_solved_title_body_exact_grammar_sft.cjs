'use strict';
const fs = require('node:fs');
const path = require('node:path');
function analyze(native,trans,ann){
 const rune=/[\u16a0-\u16ea]+/gu;
 const words=s=>s.match(rune)||[];
 const names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","ING","OE","D","A","AE","Y","IA","EA"];
 const label=s=>[...s].map(c=>names[native.runes.indexOf(c)]||c).join("");
 const headings={"0_warning":[0],"0_welcome":[0,8,13],"0_wisdom":[0,4],"0_koan_1":[0,20],"0_loss_of_divinity":[0,2,7,12,18,22],"jpg107-167":[0],"jpg229":[0,5],"p56_an_end":[0],"p57_parable":[0]};
 const entries=[];
 for(const s of native.sections){const lines=s.source_text.split("\n");const h=headings[s.name];for(const [j,i] of h.entries()){const title=words(lines[i]);const body=lines.slice(i+1,h[j+1]??lines.length);const first=words(body[0]||"");const all=words(body.join("\n"));const full=title.join(" ");
 const phrase=seq=>seq.some((_,k)=>title.every((v,l)=>seq[k+l]===v));
 const longest=title.reduce((x,y)=>x.length>=y.length?x:y,"");
 const length=title.map(w=>w.length);
 entries.push({source:s.name,line:i,title:label(full),pattern:length.join("+"),n:length.reduce((x,y)=>x+y,0),first:first.map(label),fullFirst:phrase(first),fullAnywhere:phrase(all),longestFirst:first.includes(longest),longestAnywhere:all.includes(longest),firstPrefix:title.every((v,k)=>first[k]===v),firstWords:first,allWords:all,table:body.length===5&&body.every(l=>l.trim().split(/\s+/).length===5)});
 }}
 const pages=trans.split("%").map(s=>s.trim()).filter(Boolean);if(pages.length!==57)throw Error("page count");pages.splice(50,0,"");
 const spans=[];
 for(const p of ann.pages.filter(p=>p.page<56)){
 const src=pages[p.page].replace(/[/\r\n]/g,"");
 const positions=[...src.matchAll(/[\u16a0-\u16ea]/gu)].map(m=>m.index);
 if(positions.length!==p.rune_count)throw Error("rune count "+p.page);
 for(const s of p.red_spans||[]){
 const v=src.slice(positions[s.start],positions[s.start+s.length-1]+1);
 const pattern=words(v).map(w=>w.length).join("+");
 if(words(v).join("").length!==s.length)throw Error("span length");
 spans.push({page:p.page,start:s.start,n:s.length,pattern,exact:[...new Set(entries.filter(e=>e.pattern===pattern).map(e=>e.title))],lengthOnly:[...new Set(entries.filter(e=>e.n===s.length).map(e=>e.title))]});
 }}
 const fit=entries.filter(e=>["0_warning","0_welcome","0_wisdom","0_koan_1"].includes(e.source));
 const hold=entries.filter(e=>!fit.includes(e));
 const aggregate=xs=>Object.fromEntries(["fullFirst","fullAnywhere","longestFirst","longestAnywhere","firstPrefix"].map(k=>[k,xs.filter(e=>e[k]).length]));
 const koans=entries.filter(e=>e.title==="A COAN").map(e=>({source:e.source,masterPositions:e.first.map((w,i)=>w==="MASTER"?i:-1).filter(i=>i>=0),sixRunePositions:e.firstWords.map((w,i)=>w.length===6?i:-1).filter(i=>i>=0)}));
 const repeated=Object.entries(Object.groupBy(entries,e=>e.title)).filter(([k,x])=>x.length>1).map(([title,x])=>({title,count:x.length,firstCommon:x[0].firstWords.filter(w=>x.every(y=>y.firstWords.includes(w))).map(label),firstPrefix:x.map(e=>e.first[0]??null),allTable:x.every(e=>e.table)}));
 return {fit:{n:fit.length,...aggregate(fit)},hold:{n:hold.length,...aggregate(hold)},koans,repeated,entries:entries.map(({firstWords,allWords,...e})=>e),spans};
}
const read = p => fs.readFileSync(path.join(__dirname,'..','resources',p),'utf8');
const result=analyze(JSON.parse(read('external/relikd-solved-gp29-native-v1.json')),read('liber-primus/lp2-transcription.txt'),JSON.parse(read('liber-primus/lp2-ink-annotations.json')));
console.log(JSON.stringify(result,null,2));
