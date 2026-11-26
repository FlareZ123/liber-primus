"use strict";
/** Original solved-word abbreviation grammar gate, #2925. Node 20+. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const paths=[
  "resources/transcriptions/liber_primus_master.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/liber-primus/lp2-corpus.json"
];
function analyze(raw,assert){
const gp=JSON.parse(raw[3]),I=new Map(gp.runes.map((g,i)=>[g,i])),mod=x=>(x%29+29)%29;
const master=raw[0];const s=master.slice(master.indexOf("\n\n")+2).split(/\s*\$\s*/u).filter(x=>[...x].some(c=>I.has(c))).map(x=>x.replace(/[\/%\s]+/gu,"").split(/[-.&§]+/u).map(t=>[...t].filter(c=>I.has(c)).map(c=>I.get(c))).filter(w=>w.length));
const original=[...s.slice(0,7),...s.slice(16,18)];
const donor=JSON.parse(raw[1]).sections.map(x=>[...x.source_text].filter(g=>I.has(g)).map(g=>I.get(g)));
const ref=raw[2].split(/### (\d+)\n/);const rs=new Map();for(let i=1;i<ref.length;i+=2)rs.set(+ref[i],ref[i+1].replace(/^\[[^\n]*\]$/gm,"").replace(/[’']/g,"").match(/[A-Z]+/g)||[]);
const latin=[rs.get(1),rs.get(3),rs.get(5),rs.get(6).concat(rs.get(9)),[10,11,12,13].flatMap(i=>rs.get(i)),rs.get(14),rs.get(15).concat(rs.get(16)),rs.get(56),rs.get(57)];
const names=["WARNING","WELCOME","SOME WISDOM","KOAN1","LOSS OF DIVINITY","KOAN2","AN INSTRUCTION","AN END","PARABLE"];
function eq(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
function vig(plain,key){let j=0;return plain.map(p=>p===0?0:mod(p+key[j++%key.length]))}
function primes(n){let p=[];for(let i=2;p.length<n;i++){if(!p.some(x=>x*x<=i&&i%x===0))p.push(i)}return p}
const pr=primes(85);let pos=0;
const actual=[original[0].flat().map(c=>28-c),donor[1],original[2].flat(),original[3].flat().map(c=>mod(2-c)),original[4].flat(),donor[5],original[6].flat(),original[7].flat().map((c,i)=>i===56?c:mod(c-pr[pos++]+1)),original[8].flat()];
const replay=[actual[0].map(p=>28-p),vig(actual[1],[23,10,1,10,9,10,16,26]),actual[2],actual[3].map(p=>mod(2-p)),actual[4],vig(actual[5],[0,10,4,0,1,19,0,18,4,18,9,0,18]),actual[6],(()=>{let j=0;return actual[7].map((p,i)=>i===56?p:mod(p+pr[j++]-1))})(),actual[8]];
const replays=replay.map((a,i)=>eq(a,original[i].flat()));
assert(replays.every(Boolean),"exact original source cipher replays");
assert(actual.every((x,i)=>x.length===[184,515,157,778,755,319,89,85,95][i]),"all solved rune counts");
const donors=donor.map((d,i)=>eq(d,actual[i]));
assert(donors.every((v,i)=>v===(i!==3)),"known KOAN1 donor discrepancy only");
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function greedy(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,"token");out.push(t.i);i+=t.s.length}}return out}
const spell=Object.fromEntries(gp.translit.map((s,i)=>[s,[i]]));Object.assign(spell,{V:[1],K:[5],Q:[5],Z:[15],ING:[21],IO:[27],QU:[5,7]});
function matches(w,x){let cache=new Map();function go(i,j){if(i===w.length)return j===x.length;if(j>=x.length)return false;let k=i+":"+j;if(cache.has(k))return cache.get(k);let yes=false;for(let n=1;n<=3;n++){let a=spell[w.slice(i,i+n)];if(a&&i+n<=w.length&&a.every((v,h)=>x[j+h]===v)&&go(i+n,j+a.length)){yes=true;break}}cache.set(k,yes);return yes}return go(0,0)}
const pairs=original.flatMap((ws,k)=>{let i=0;assert(ws.length===latin[k].length,"word count "+names[k]);return ws.map((w,j)=>{let x=actual[k].slice(i,i+w.length);i+=w.length;const word=latin[k][j];return {section:names[k],j,word,actual:x.map(v=>gp.runes[v]).join(""),translit:x.map(v=>gp.translit[v]).join(""),greedy:greedy(word).map(v=>gp.runes[v]).join(""),exact: eq(greedy(word),x),allowed:matches(word,x),len:x.length,expectedLength:greedy(word).length}})});
const types=[...new Set(pairs.map(x=>x.word))].map(w=>{let a=pairs.filter(x=>x.word===w);return {word:w,forms:[...new Set(a.map(x=>x.actual))],count:a.length,sections:[...new Set(a.map(x=>x.section))].length}});
let stats={uniqueTypes:types.length,repeatedTypes:types.filter(x=>x.count>1).length,repeatedOccurrences:types.filter(x=>x.count>1).reduce((s,x)=>s+x.count,0),crossSectionTypes:types.filter(x=>x.sections>1).length,shorterThanGreedy:pairs.filter(x=>x.len<x.expectedLength).length,longerThanGreedy:pairs.filter(x=>x.len>x.expectedLength).length,latinLetters:pairs.reduce((s,x)=>s+x.word.length,0),runes:pairs.reduce((s,x)=>s+x.len,0)};
return {replays,donors,sections:names.map((name,i)=>({name,words:latin[i].length,runes:actual[i].length,greedy:pairs.filter(x=>x.section===name&&x.exact).length,allowed:pairs.filter(x=>x.section===name&&x.allowed).length})),total:pairs.length,greedy:pairs.filter(x=>x.exact).length,allowed:pairs.filter(x=>x.allowed).length,mismatches:pairs.filter(x=>!x.exact),repeatForms:types.filter(x=>x.forms.length>1),stats};
}
const raw=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(analyze(raw,assert),null,2));
