"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
const c=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const g=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
const raw=fs.readFileSync("resources/historical/cicada2016-4gq25-outguess.asc","utf8");
const src=fs.readFileSync("resources/lp2-transcription.txt","utf8").split("%");
const msg=raw.slice(raw.indexOf("Hello."),raw.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words=msg.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(words.length,43);
assert.deepEqual([words[14],words[34],words[35],words[39],words[42]],["Its","be","found","false","OpenPGP"]);
const gp=c.translit.map((t,i)=>({t:t.toLowerCase(),i})).sort((a,b)=>b.t.length-a.t.length);
function sumWord(word){let s=word.toLowerCase().replaceAll("v","u").replaceAll("k","c").replaceAll("z","s"),p=0,n=0;while(p<s.length){const h=gp.find(x=>s.startsWith(x.t,p));assert(h,"GP parse "+word+"@"+p);n+=c.prime[h.i];p+=h.t.length;}return n;}
const S=words.map(w=>sumWord(w)%43);
assert.equal(sumWord("Its"),143);assert.equal(S[14],14);
assert.equal(sumWord("be"),128);assert.equal(S[34],42);
assert.equal(sumWord("OpenPGP"),249);assert.equal(S[42],34);
const cycles=new Map();
for(let start=0;start<43;start++){const path=[],seen=new Map();let i=start;while(!seen.has(i)){seen.set(i,path.length);path.push(i);i=S[i];}const k=path.slice(seen.get(i)).sort((a,b)=>a-b).join(",");cycles.set(k,(cycles.get(k)||0)+1);}
assert.deepEqual(Object.fromEntries(cycles),{"34,42":42,"14":1});
function pwords(page){return page.replaceAll("/","").replaceAll("\n","").replaceAll("\r","").split(/[-.&$§,:!?]/u).map(x=>(x.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean);}
const pages=Array.from({length:58},(_,p)=>p===50?[]:pwords(src[p>50?p-1:p]));
const tr=w=>[...w].map(r=>c.translit[c.runes.indexOf(r)]).join("");
const addr=n=>({page:n%58,index:Math.floor(n/58)});
function target(n){const a=addr(n);if(a.page===50)return "p50cell"+a.index;const w=pages[a.page]?.[a.index];return w?tr(w):null;}
const allTokens=g.pages.flatMap(p=>p.tokens);
assert.deepEqual(allTokens.slice(82,84),["3L","3D"]);assert.deepEqual(allTokens.slice(127,129),["3D","3L"]);
const tokens=allTokens.slice(84,127);assert.equal(tokens.length,43);assert.equal(tokens[21],"13");
assert.equal(sumWord("FOLD"),171);assert.equal(171%43,42);assert.equal(words[42],"OpenPGP");
function dec(t,a,e){const x=a.indexOf(t[0]),y=a.indexOf(t[1]),r=a.length;assert(x>=0&&y>=0);return e==="BE"?x*r+y:y*r+x;}
const specs=[["base60-BE",g.alphabet,"BE"],["base60-LE",g.alphabet,"LE"],["base59-BE",g.alphabet.replace("f",""),"BE"],["base59-LE",g.alphabet.replace("f",""),"LE"]];
const rows=specs.map(([name,a,e])=>{const V=tokens.map(t=>dec(t,a,e));const T=Array.from({length:43},(_,i)=>(V[i]+V[42-i])%43);const adjacent=[];for(let i=0;i<43;i++){const pair=[S[i],T[i]].sort((x,y)=>x-y);if(pair[1]===pair[0]+1)adjacent.push({node:i,nodeWord:words[i],targets:pair,words:pair.map(j=>words[j]).join(" ")});}return{name,first:V[0],firstAddress:addr(V[0]),firstTarget:target(V[0]),phrase42:words[S[42]]+" "+words[T[42]],sorted39:[S[39],T[39]].sort((x,y)=>x-y).map(j=>words[j]).join(" "),adjacent};});
assert.deepEqual(rows.map(r=>({name:r.name,first:r.first,firstAddress:r.firstAddress,firstTarget:r.firstTarget,phrase42:r.phrase42,sorted39:r.sorted39,adjacentCount:r.adjacent.length})),[
{name:"base60-BE",first:173,firstAddress:{page:57,index:2},firstTarget:"THE",phrase42:"be found",sorted39:"will be",adjacentCount:4},
{name:"base60-LE",first:3182,firstAddress:{page:50,index:54},firstTarget:"p50cell54",phrase42:"be path",sorted39:"words be",adjacentCount:0},
{name:"base59-BE",first:170,firstAddress:{page:54,index:2},firstTarget:"IADPNGUWAM",phrase42:"be direction",sorted39:"and be",adjacentCount:2},
{name:"base59-LE",first:3070,firstAddress:{page:54,index:52},firstTarget:null,phrase42:"be lies",sorted39:"numbers be",adjacentCount:2}]);
assert.deepEqual(rows[0].adjacent,[
{node:21,nodeWord:"is",targets:[40,41],words:"paths Verify"},
{node:29,nodeWord:"direction",targets:[35,36],words:"found Good"},
{node:39,nodeWord:"false",targets:[33,34],words:"will be"},
{node:42,nodeWord:"OpenPGP",targets:[34,35],words:"be found"}]);
assert.deepEqual(rows.filter(r=>r.firstTarget==="THE"&&r.phrase42==="be found").map(r=>r.name),["base60-BE"]);
console.log("PASS 43-word folded-table codec gate");
console.log(JSON.stringify({cycles:Object.fromEntries(cycles),foldStart:171%43,foldStartWord:words[42],codecs:rows},null,2));
