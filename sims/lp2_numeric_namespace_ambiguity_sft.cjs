"use strict";
// #3200: source-typed numeric namespaces and fixed hybrid collision test.
// node sims/lp2_numeric_namespace_ambiguity_sft.cjs
const fs=require("node:fs"),path=require("node:path");
function run(c,w,s,g,t,v){
 const check=(x,m)=>{if(!x)throw Error(m)};
 const idx=new Map(c.runes.map((x,i)=>[x,i]));
 const words=w.trim().split(/\r?\n/).slice(-5).flatMap(row=>row.replace(/⁘/g,"").trim().split(/\s+/));
 const values=s.trim().split(/\r?\n\s*\r?\n/)[2].trim().split(/\s+/).map(Number);
 check(words.length===25&&values.length===25,"size");
 const alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
 function base29(a){if([...a].some(x=>!alphabet.includes(x)))return null;return [...a].reduce((n,x)=>29*n+alphabet.indexOf(x),0)}
 const entries=words.map((token,i)=>{const expected=values[i];if(/^\d+$/.test(token))return {slot:i,token,kind:"decimal",expected,decimal:Number(token),base29:base29(token)};const a=[...token].map(x=>idx.get(x));check(a.every(x=>x!==undefined),"unknown rune");return {slot:i,token,kind:"GP word",expected,prime:a.reduce((n,k)=>n+c.prime[k],0),zeroRank:a.reduce((n,k)=>n+k,0),oneRank:a.reduce((n,k)=>n+k+1,0)}});
 check(entries.every(e=>e.kind==="decimal"?e.decimal===e.expected:e.prime===e.expected),"typed exact");
 const counts=entries.filter(e=>e.kind==="decimal"),gp=entries.filter(e=>e.kind!=="decimal");
 const numericUnique=[...new Map(counts.map(e=>[e.token,e])).values()];
 const historical=[{input:3301,token:"3QO",type:"signed example"},{input:30,token:"11",type:"participant log"},{input:v.stableOrganizerTestVector.base29Request,token:v.stableOrganizerTestVector.base29Response,type:"participant log"}].map(x=>({...x,decoded:base29(x.token)}));
 check(historical.every(e=>e.input===e.decoded),"historical base29 control");
 const grid=g.pages.flatMap(p=>p.tokens.map((token,j)=>({page:p.page,cell:j,token})));
 const numericGrid=grid.filter(e=>/^\d+$/.test(e.token));
 const overlap=grid.filter(e=>numericUnique.some(n=>n.token===e.token)).map(e=>({...e,decimal:Number(e.token),base29:base29(e.token),radix60:60*Number(e.token[0])+Number(e.token[1])}));
 const prose=t.split("%").slice(0,55).flatMap((page,i)=>(page.match(/\d+/g)||[]).map(token=>({page:i>=50?i+1:i,token,decimal:Number(token),base29:base29(token)})));
 function fact(n){let f=1n;for(let i=2;i<=n;i++)f*=BigInt(i);return f}
 const hybrid={};
 for(const radix of [60,59]){
  const a=radix===60?g.alphabet:g.alphabet.replace("f","");
  const bins=new Map();
  for(const {token} of grid){check([...token].every(x=>a.includes(x)),"invalid source digit");const value=/^\d+$/.test(token)?Number(token):radix*a.indexOf(token[0])+a.indexOf(token[1]);if(!bins.has(value))bins.set(value,new Map());let b=bins.get(value);b.set(token,(b.get(token)||0)+1)}
  let multiplicityAmbiguity=1n,ambiguousPositions=0;
  const collisions=[...bins].filter(([,b])=>b.size>1).sort((a,b)=>a[0]-b[0]).map(([value,b])=>{let n=[...b.values()].reduce((s,x)=>s+x,0);let m=fact(n);for(const k of b.values())m/=fact(k);multiplicityAmbiguity*=m;ambiguousPositions+=n;return {value,spellings:Object.fromEntries(b),fixedInventoryPreimages:m.toString()}});
  hybrid[radix]={distinctValues:bins.size,collisionClasses:collisions.length,ambiguousPositions,fixedInventoryPreimages:multiplicityAmbiguity.toString(),fixedInventoryBits:Math.log2(Number(multiplicityAmbiguity)),collisions};
 }
 return {historical,sourceEntries:entries,sourceSummary:{numericCells:counts.length,distinctNumerals:numericUnique.length,decimalMatches:counts.filter(e=>e.decimal===e.expected).length,base29Matches:counts.filter(e=>e.base29===e.expected).length,firstRowDistinctFit:[...new Set(counts.filter(e=>e.slot<5).map(e=>e.token))],heldDistinctNumerals:numericUnique.filter(e=>!counts.some(f=>f.slot<5&&f.token===e.token)).map(e=>e.token),runeCells:gp.length,distinctRuneWords:new Set(gp.map(e=>e.token)).size,primeMatches:gp.filter(e=>e.prime===e.expected).length,zeroRankMatches:gp.filter(e=>e.zeroRank===e.expected).length,oneRankMatches:gp.filter(e=>e.oneRank===e.expected).length},original:{prose,gridCells:grid.length,asciiNumeralCells:numericGrid.length,leadingZeroNumericCells:numericGrid.filter(e=>e.token.startsWith("0")).length,base29Legal:grid.filter(e=>base29(e.token)!==null).length,base29Illegal:grid.filter(e=>base29(e.token)===null).length,sharedLiteralTokens:overlap},hybrid};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/2013-0-wisdom.txt","resources/cicada2014-openpuff-magic-squares.txt","resources/liber-primus/lp2-grid-256.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/2013-tcp-live-test-vectors.json"];
const f=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(JSON.parse(f[0]),f[1],f[2],JSON.parse(f[3]),f[4],JSON.parse(f[5])),null,2));
