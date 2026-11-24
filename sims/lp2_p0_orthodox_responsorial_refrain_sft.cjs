"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const rune = /[\u16a0-\u16ea]/g;
/** @param {string} s @returns {number} */
const gpLength = s => (s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S")
  .match(/ING|TH|NG|EO|OE|AE|IA|EA|IO|[A-Z]/g)||[]).length;
const shape = "Lord have mercy".split(" ").map(gpLength);
assert.deepEqual(shape,[4,4,5]);
/** @param {number[]} a @param {number} i */
const match = (a,i) => shape.every((x,j)=>a[i+j]===x);
/** @param {number[]} a */
const hits = a => a.flatMap((x,i)=>match(a,i)?[i]:[]);
/** @param {number[]} a */
const triples = a => hits(a).filter(i=>match(a,i+3)&&match(a,i+6));
/** @param {number[][]} windows */
const summary = windows => ({
  n:windows.length,
  hitsMin:Math.min(...windows.map(x=>hits(x).length)),
  hitsMax:Math.max(...windows.map(x=>hits(x).length)),
  any:windows.filter(x=>hits(x).length>0).length,
  triple:windows.filter(x=>triples(x).length>0).length
});
const src=read("resources/control/orthodox_daily_prayers_pg34981.txt").split(/\r?\n/);
const linePattern=/^\s*(?:Amen!\s*)?Lord,? have mercy!\s*(?:_?\((\d+) times)/i;
const begin=src.findIndex(x=>x.startsWith("*** START OF THE PROJECT GUTENBERG"));
const end=src.findIndex(x=>x.startsWith("*** END OF THE PROJECT GUTENBERG"));
assert(begin>=0&&end>begin);
const literal=[],expanded=[],literalPositions=[],expandedPositions=[];
let responses=0;
for(const s of src.slice(begin+1,end)){
  const w=s.match(/[A-Za-z]+/g)||[],m=s.match(linePattern);
  if(m){
    const prefix=/^\s*Amen!/i.test(s)?["Amen"]:[];
    literal.push(...prefix.map(gpLength)); expanded.push(...prefix.map(gpLength));
    literalPositions.push(literal.length);expandedPositions.push(expanded.length);
    literal.push(...shape);
    responses+=Number(m[1]);
    for(let i=0;i<Number(m[1]);i++)expanded.push(...shape);
  }else{literal.push(...w.map(gpLength));expanded.push(...w.map(gpLength));}
}
assert.equal(responses,194);
/** @param {number[]} a @param {number} i */
const getWindow=(a,i)=>{const start=Math.max(0,Math.min(a.length-158,i-70));return a.slice(start,start+158);};
const positive=expandedPositions.map(i=>getWindow(expanded,i));
const printed=literalPositions.map(i=>getWindow(literal,i));
const ctrl=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")).sections.map(s=>({
  name:s.name,len:s.source_text.split(/[•⁚⁜⁘\s]+/).map(w=>(w.match(rune)||[]).length).filter(Boolean)
}));
const negatives=ctrl.flatMap(x=>Array.from({length:Math.max(0,x.len.length-157)},(_,i)=>x.len.slice(i,i+158)));
const chapter=read("resources/liber-primus/lp2-transcription.txt").split("%").slice(0,3).join("")
  .replace(/[/\s]/g,"").split(/[-.&$]+/).filter(Boolean).map(w=>(w.match(rune)||[]).length);
assert.equal(chapter.length,158);assert.equal(chapter.reduce((a,b)=>a+b,0),729);
const out={shape,responses,source:summary(positive),printed:summary(printed),solved:summary(negatives),
  chapter:{words:chapter.length,runes:chapter.reduce((a,b)=>a+b,0),matches:hits(chapter),triples:triples(chapter)}};
assert.deepEqual(out.source,{n:25,hitsMin:3,hitsMax:29,any:25,triple:25});
assert.deepEqual(out.printed,{n:25,hitsMin:1,hitsMax:3,any:25,triple:0});
assert.deepEqual(out.solved,{n:73,hitsMin:0,hitsMax:1,any:22,triple:0});
assert.equal(out.chapter.matches.length,0);
console.log(JSON.stringify(out,null,2));
