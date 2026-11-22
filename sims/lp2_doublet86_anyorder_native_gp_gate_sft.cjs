"use strict";
/**
 * Exact all-order symbol-histogram gate for the 86 original within-page
 * adjacent-equal-rune events, including p50 row-major byte-order reading.
 * A permutation cannot change the GP29 index of coincidence.
 * Run: node sims/lp2_doublet86_anyorder_native_gp_gate_sft.cjs
 * Windows 11 / Node 22 / CommonJS / no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const tokens=table.pages.flatMap(page=>page.tokens);
assert.equal(tokens.length,256);
const bytes=tokens.map(t=>table.alphabet.indexOf(t[0])*60+table.alphabet.indexOf(t[1]));
assert.deepEqual(tokens.flatMap((x,i)=>x==="00"?[i]:[]),[192,229]);
const events=[];
let global=0;
for(const page of gp.pages.slice(0,56)) {
 for(let i=0;i+1<page.indices.length;i++) {
  if(page.indices[i]!==page.indices[i+1])continue;
  events.push({rune:page.indices[i],phase:(global+i)%256,global:global+i});
 }
 global+=page.indices.length;
}
assert.equal(global,12956);
assert.equal(events.length,86);
const values=events.map(x=>x.rune);
/** @param {number[]} a @returns {number} */
function coincidence(a) {
 const counts=Array(29).fill(0);
 a.forEach(x=>counts[x]++);
 return counts.reduce((v,c)=>v+c*(c-1),0)/(a.length*(a.length-1));
}
const eventIoC=coincidence(values);
assert.ok(Math.abs(eventIoC-0.03365253077975376)<1e-14);
const byteOrdered=events.slice().sort((a,b)=>bytes[a.phase]-bytes[b.phase]
 ||a.phase-b.phase||a.global-b.global);
const phaseOrdered=events.slice().sort((a,b)=>a.phase-b.phase||a.global-b.global);
for(const reordered of [byteOrdered,phaseOrdered]) {
 assert.equal(coincidence(reordered.map(x=>x.rune)),eventIoC);
}
const emitted=items=>items.map(x=>gp.translit[x.rune]).join("");
assert.equal(emitted(byteOrdered).slice(0,5),"YOUAX");
const at192=events.filter(x=>x.phase===192);
assert.deepEqual(at192.map(x=>x.rune),[gp.translit.indexOf("Y"),
 gp.translit.indexOf("O"),gp.translit.indexOf("U"),gp.translit.indexOf("A")]);
const tokensGP=gp.translit.map((token,index)=>({token,index}))
 .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} word @returns {number[]} */
function gpWord(word) {
 const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
  .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG")
  .replace(/IO/g,"IA");
 const result=[];
 for(let i=0;i<s.length;) {
  const match=tokensGP.find(t=>s.startsWith(t.token,i));
  assert.ok(match,"Unmapped GP control token "+s);
  result.push(match.index);
  i+=match.token.length;
 }
 return result;
}
const controls={};
for(const [name,file] of [
 ["Gibran","resources/control/gibran_prophet_58585.txt"],
 ["Shakespeare","resources/control/shakespeare_first300k.txt"]
]) {
 const text=read(file);
 const runes=(text.match(/[A-Za-z]+/g)||[]).flatMap(gpWord);
 let windows=0,min=Infinity,notHigher=0;
 for(let i=0;i+86<=runes.length;i+=7) {
  const score=coincidence(runes.slice(i,i+86));
  windows++;
  if(score<min)min=score;
  if(score<=eventIoC)notHigher++;
 }
 assert.equal(runes.length,name==="Gibran"?62492:217106);
 assert.equal(windows,name==="Gibran"?8916:31003);
 assert.equal(notHigher,0);
 controls[name]={runes:runes.length,windows,minIoC:min,atOrBelowOriginal:notHigher};
}
const clear=gp.pages[57].indices;
assert.equal(clear.length,95);
const native86=clear.slice(0,86);
const nativeIoC=coincidence(native86);
assert.ok(nativeIoC>eventIoC);
assert.equal(coincidence(native86.slice().reverse()),nativeIoC);
console.log(JSON.stringify({
 originalEvents:events.length,originalIoC:eventIoC,
 fixedSource:{"p50-zero-cells":[192,229],"phase192":emitted(at192)},
 p50ByteSortedPrefix:emitted(byteOrdered).slice(0,28),
 phaseSortedPrefix:emitted(phaseOrdered).slice(0,28),
 allOrdersPreserveIoC:true,
 controls,clearP57Native86IoC:nativeIoC,
 decision:"All reorderings of the 86 original doublet glyphs preserve GP29 IoC=0.03365253, below every tested native GP English 86-rune control. No full-length native English plaintext by pure event rearrangement, even though 00 phase192 spells YOUA."
},null,2));