"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} r @returns {string} */ function read(r){return fs.readFileSync(path.join(root,r),"utf8").replace(/\r/g,"");}
/** @param {number} v @returns {number} */ function mod29(v){return ((v%29)+29)%29;}
/** @param {number[]} v @returns {number[]} */ function H(v){const o=[];for(let i=0;i<Math.floor(v.length/2);i++){const l=v[i],r=v[v.length-1-i];o.push(mod29(l-r),mod29(l+r));}if(v.length%2)o.push(v[Math.floor(v.length/2)]);return o;}
/** @param {number[]} v @returns {boolean} */ function unit(v){if(v.length<2)return false;const s=v[1]-v[0];if(Math.abs(s)!==1)return false;for(let i=2;i<v.length;i++)if(v[i]-v[i-1]!==s)return false;return true;}
/** @param {string} t @param {string} a @returns {number|null} */ function dec(t,a){const h=a.indexOf(t[0]),l=a.indexOf(t[1]);return h<0||l<0?null:h*a.length+l;}
/** @param {Array<number|null>} t @param {number} s @param {number} n @returns {number[]|null} */ function walk(t,s,n){const r=[s];let x=s;for(let i=0;i<n;i++){if(x<0||x>=t.length)return null;const y=t[x];if(y===null||y===undefined)return null;x=y;r.push(x);}return r;}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tr=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const ri=new Map(corpus.runes.map((r,i)=>[r,i])),parts=tr.split(/^\s*%\s*$/m).slice(0,55);
const pages=parts.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let cur=[],ss=0,es=0,so=0,cross=0;
function flush(){if(!cur.length)return;if(ss===es){const p=pages[ss];p.words.push({page:p.page,ordinal:p.words.length+1,start:so,end:so+cur.length-1,values:cur.slice()});}else cross++;cur=[];}
for(let s=0;s<parts.length;s++)for(const ch of [...parts[s]]){const v=ri.get(ch);if(v!==undefined){if(!cur.length){ss=s;so=pages[s].offset;}es=s;cur.push(v);pages[s].offset++;}else if(ch!=="/"&&!/\s/u.test(ch))flush();}flush();
const all=pages.flatMap(p=>p.words),byPage=new Map(pages.map(p=>[p.page,p.words]));
assert.equal(cross,32);assert.equal(all.length,2864);
const clear=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);assert.ok(clear);
const source=(clear[1].match(/\b[A-Za-z]+\b/gu)||[]).map(w=>w.toUpperCase());
assert.equal(source.length,43);assert.deepEqual(source.slice(25,30),["THEIR","NUMBERS","ARE","THE","DIRECTION"]);assert.deepEqual(source.slice(5,9),["EPIPHANY","SEEKS","THE","DEVOTED"]);
const diagonal=source.map((word,i)=>({i,word,obj:(byPage.get(i)||[])[i]||null}));
assert.equal(diagonal.filter(r=>r.obj).length,42);assert.deepEqual(diagonal.filter(r=>!r.obj).map(r=>[r.i,r.word]),[[32,"YOU"]]);
const eligible=diagonal.filter(r=>r.obj&&r.obj.values.length>=4).map(r=>{const shed=r.obj.values.slice(1,-1);return{i:r.i,word:r.word,page:r.obj.page,ordinal:r.obj.ordinal,start:r.obj.start,end:r.obj.end,values:r.obj.values,shed,h:H(shed)};});
assert.equal(eligible.length,24);
const hits=eligible.filter(r=>unit(r.h));assert.equal(hits.length,1);
assert.deepEqual(hits[0],{i:27,word:"ARE",page:27,ordinal:28,start:111,end:114,values:[0,20,15,1],shed:[20,15],h:[5,6]});
assert.deepEqual(hits[0].h.map(i=>source[i]),["EPIPHANY","SEEKS"]);assert.deepEqual(H(hits[0].values),[28,1,5,6]);assert.equal(hits[0].values.reduce((a,b)=>a+b,0),36);assert.equal(source[36],"GOOD");
const four=all.filter(w=>w.values.length===4);assert.equal(four.length,509);assert.deepEqual(four.filter(w=>H(w.values).join(",")==="28,1,5,6").map(w=>[w.page,w.ordinal,w.start,w.values]),[[27,28,111,[0,20,15,1]]]);

const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number} */ function gp0(word){const n=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");let i=0,sum=0;while(i<n.length){if(n.startsWith("ING",i)){sum+=21;i+=3;continue;}if(n.startsWith("IO",i)){sum+=27;i+=2;continue;}const t=gpTokens.find(x=>n.startsWith(x.symbol,i));assert.ok(t,`unmapped GP word ${word} at ${i}`);sum+=t.value;i+=t.symbol.length;}return sum;}
const tokens=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace("f","");
const tables={base60:tokens.map(t=>dec(t,a60)),base59:tokens.map(t=>dec(t,a59))},rows=source.map((word,index)=>({index,word,gp0:gp0(word)}));
assert.deepEqual(rows.slice(5,9).map(r=>r.gp0),[121,71,20,102]);
const counts=new Map(corpus.pages.map(p=>[p.page,p.indices.length]));assert.equal(counts.get(32),121);
const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2},down=[];let tested=0;
for(let i=0;i<=rows.length-4;i++){const [w0,w1,w2,w3]=rows.slice(i,i+4);for(const [field,depth] of Object.entries(dh)){if(depth<2)continue;for(const [radix,table] of Object.entries(tables)){tested++;const route=walk(table,w1.gp0,depth);if(!route)continue;const terminal=route[depth];if(route[depth-2]!==w2.gp0||route[depth-1]!==w3.gp0)continue;if(!counts.has(terminal)||counts.get(terminal)!==w0.gp0)continue;down.push({i,words:[w0.word,w1.word,w2.word,w3.word],field,depth,radix,terminal,route});}}}
assert.equal(tested,560);assert.equal(down.length,1);assert.deepEqual(down[0],{i:5,words:["EPIPHANY","SEEKS","THE","DEVOTED"],field:"p",depth:23,radix:"base60",terminal:32,route:[71,108,14,183,81,58,146,92,236,238,129,179,175,18,15,212,70,169,228,144,125,20,102,32]});
console.log(JSON.stringify({status:"PASS",eligible:eligible.length,bridge:hits[0],sourceWords:hits[0].h.map(i=>source[i]),downstream:{tested,hit:down[0]},decision:"ARE27 -> p27 word28 -> shed -> H=[5,6]=EPIPHANY SEEKS -> THE DEVOTED -> p32"},null,2));
