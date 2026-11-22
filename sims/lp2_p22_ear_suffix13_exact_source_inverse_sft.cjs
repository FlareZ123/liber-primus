"use strict";
/** #2226 frozen p22 suffix 13+118 GP29, historical EAR rune poem.
 * Windows Node22 read-only SFT, no key search, exact source reencryption. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const page=corpus.pages[22].indices,solved=corpus.pages[57].indices;
const poem="Ear byþ egle eorla gehwylcun ðonne fæstlice flæsc onginneþ hraw colian hrusan ceosan blac to gebeddan bleda gedreosaþ wynna gewitaþ wera geswicaþ";
const tokens=corpus.translit.map((v,i)=>({v,i})).sort((a,b)=>b.v.length-a.v.length);
const clean=s=>s.replace(/[þðÞÐ]/g,"TH").replace(/[æÆ]/g,"AE")
  .replace(/[ƿǷ]/g,"W").toUpperCase().replace(/QU/g,"CW")
  .replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/K/g,"C")
  .replace(/V/g,"U").replace(/Z/g,"S");
/** @param {string} s */
function gp(s){const out=[];for(const word of clean(s).match(/[A-Z]+/g)||[]){
  let w=word;while(w){const t=tokens.find(x=>w.startsWith(x.v));assert.ok(t);out.push(t.i);w=w.slice(t.v.length);}
}return out;}
const key=gp(poem),mod=x=>((x%29)+29)%29;
const decode=(c,sign)=>c.map((v,i)=>i<13?v:mod(v+sign*key[i-13]));
const encode=(p,sign)=>p.map((v,i)=>i<13?v:mod(v-sign*key[i-13]));
const spell=a=>a.map(i=>corpus.translit[i]).join("");
/** @param {number[]} a */
function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const tr=read("resources/liber-primus/lp2-transcription.txt").split(/^\s*%\s*$/m)[22];
const runeindex=new Map(corpus.runes.map((r,i)=>[r,i]));
const fragments=[...tr.matchAll(/[\u16a0-\u16ff]+/gu)].map(x=>[...x[0]].map(r=>runeindex.get(r)));
assert.deepEqual(fragments.flat(),page);
let p=0,bisect;
for(const frag of fragments){if(p<13&&p+frag.length>13)bisect={offset:p,length:frag.length};p+=frag.length;}
assert.equal(p,131);assert.deepEqual(bisect,{offset:12,length:2});
assert.deepEqual(ink.pages.find(x=>x.page===22).large_punctuation,[[131,13,"red"]]);
assert.equal(key.length,118);assert.deepEqual(key.slice(0,2),[28,4]);
const model=require("./lp1_source_native_trigram_model.cjs")
  .buildSourceNativeTrigramModel({corpus,referenceText:read("resources/liber-primus/lp1-plaintext-reference.txt")});
const runs=[];
for(const sign of [-1,1]){
  const out=decode(page,sign);assert.deepEqual(encode(out,sign),page);
  const planted=encode(solved,sign);assert.deepEqual(decode(planted,sign),solved);
  runs.push({sign,ioc:ioc(out),gpTrigram:model.scoreStream(out).mean,suffixTrigram:model.scoreStream(out.slice(13)).mean,plain:spell(out)});
}
console.log(JSON.stringify({source:"1915 EAR rune-poem stanza",page:22,cipherRunes:131,stanzaRunes:118,terminalRedDots:13,source13Cut:bisect,stanzaAsVerbatimWordPreservingPlaintext:false,nativeP57:model.scoreStream(solved).mean,originalIoc:ioc(page),runs,reencryption:"131/131 both directions",positiveSolvedPlant:"95/95 both directions"},null,2));
