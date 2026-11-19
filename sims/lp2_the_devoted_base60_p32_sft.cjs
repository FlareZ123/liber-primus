"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const T=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const toks=T.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
function gp(w){const n=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");const out=[];for(let i=0;i<n.length;){if(n.startsWith("ING",i)){out.push(21);i+=3;continue;}if(n.startsWith("IO",i)){out.push(27);i+=2;continue;}const t=toks.find(x=>n.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;}return out;}
const gp0=w=>gp(w).reduce((a,b)=>a+b,0);
const cells=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace("f","");
const dec=(t,a)=>{const h=a.indexOf(t[0]),l=a.indexOf(t[1]);assert.notEqual(h,-1);assert.notEqual(l,-1);return h*a.length+l;};
assert.equal(gp0("THE"),20);assert.equal(cells[20],"1g");assert.equal(dec(cells[20],a60),102);assert.equal(gp0("DEVOTED"),102);assert.equal(cells[102],"0W");assert.equal(dec(cells[102],a59),32);assert.equal(dec(cells[102],a60),32);assert.equal(gp0("EPIPHANY"),121);
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\r?\n\r?\n/).slice(1).join("\n");
const words=clear.split(/[^A-Za-z]+/).filter(Boolean).map(w=>w.toUpperCase()),h59=[],h60=[];
for(let i=0;i+1<words.length;i++){const A=words[i],B=words[i+1],addr=gp0(A);if(addr>=256)continue;const token=cells[addr],target=gp0(B),row={i,A,B,addr,token,target};if(dec(token,a59)===target)h59.push(row);if(dec(token,a60)===target)h60.push(row);}
assert.equal(words.length-1,44);assert.deepEqual(h59,[]);assert.deepEqual(h60,[{i:7,A:"THE",B:"DEVOTED",addr:20,token:"1g",target:102}]);
const parts=transcription.split(/^\s*%\s*$/m),rs=new Set(corpus.runes);const p32=[...parts[32]].filter(r=>rs.has(r)).length;assert.equal(p32,121);
console.log(JSON.stringify({status:"PASS: THE->DEVOTED uniquely selects base60 and p32",hits59:h59,hits60:h60,p32RuneCount:p32},null,2));
