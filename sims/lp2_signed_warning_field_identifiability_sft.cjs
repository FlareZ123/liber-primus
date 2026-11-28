"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, ""); }
function mod29(value) { return ((value % 29) + 29) % 29; }
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit.map((symbol, value) => ({ symbol, value })).sort((a, b) => b.symbol.length - a.symbol.length);
function gp(word) { const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,""); const out=[]; for(let i=0;i<normalized.length;){ if(normalized.startsWith("ING",i)){out.push(21);i+=3;continue;} if(normalized.startsWith("IO",i)){out.push(27);i+=2;continue;} const token=gpTokens.find((candidate)=>normalized.startsWith(candidate.symbol,i)); assert.ok(token,"unmapped GP spelling: "+normalized.slice(i)); out.push(token.value); i+=token.symbol.length;} return out; }
const clear=signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter((token)=>/^[A-Za-z]+$/.test(token)).map((label,index)=>({index,label:label.toUpperCase(),gp:gp(label)}));
assert.equal(signed.length,43);
const warning=signed.slice(38,43).map((word)=>{const gpSum=word.gp.reduce((sum,value)=>sum+value,0),len=word.gp.length,delta=mod29(word.index-gpSum);return{index:word.index,label:word.label,fields:{first:word.gp[0],len,diff:mod29(delta-len),sum:mod29(delta+len)}};});
assert.deepEqual(warning,[{index:38,label:"BEWARE",fields:{first:17,len:6,diff:2,sum:14}},{index:39,label:"FALSE",fields:{first:0,len:5,diff:15,sum:25}},{index:40,label:"PATHS",fields:{first:13,len:4,diff:11,sum:19}},{index:41,label:"VERIFY",fields:{first:1,len:6,diff:5,sum:17}},{index:42,label:"OPENPGP",fields:{first:3,len:7,diff:18,sum:3}}]);
const raw=[...new Set(warning.flatMap((word)=>Object.values(word.fields)))].sort((a,b)=>a-b); assert.deepEqual(raw,[0,1,2,3,4,5,6,7,11,13,14,15,17,18,19,25]);
const signedAtoms=[...new Set(raw.flatMap((value)=>[value,mod29(-value)]))].sort((a,b)=>a-b); assert.equal(signedAtoms.length,25); assert.deepEqual(Array.from({length:29},(_,value)=>value).filter((value)=>!signedAtoms.includes(value)),[8,9,20,21]);
function pairClosure(operation){return[...new Set(raw.flatMap((a)=>raw.map((b)=>mod29(operation(a,b)))))].sort((a,b)=>a-b);} const z29=Array.from({length:29},(_,value)=>value); assert.deepEqual(pairClosure((a,b)=>a+b),z29); assert.deepEqual(pairClosure((a,b)=>a-b),z29); assert.deepEqual(pairClosure((a,b)=>a*b),z29);
const representations=Array.from({length:29},()=>[]); for(const word of warning)for(const [field,value] of Object.entries(word.fields)){representations[value].push("+"+word.label+"."+field);representations[mod29(-value)].push("-"+word.label+"."+field);}
const keys={p36:[25,19,27,26],p37:[12,1,1,22],p38:[20,7,7,7,13,4],p39:[19,12,19,2,5],p40:[20,20,12,6],p41:[26,23,1,7,13,22],p42:[7,1,12,23,13,2,18]}; const expected={p36:[2,1,1,2],p37:[2,1,1,1],p38:[0,1,1,1,1,2],p39:[1,2,1,1,2],p40:[0,0,2,2],p41:[2,2,1,1,1,1],p42:[1,1,2,2,1,1,2]}; const keyCoverage={}; for(const [page,key] of Object.entries(keys)){const counts=key.map((value)=>representations[value].length);assert.deepEqual(counts,expected[page],page+" representation counts");keyCoverage[page]={key,counts,allDirect:counts.every((count)=>count>0),labeledCartesian:counts.reduce((product,count)=>product*count,1)};} assert.equal(keyCoverage.p41.labeledCartesian,4); assert.equal(keyCoverage.p42.labeledCartesian,8); assert.equal(keyCoverage.p38.allDirect,false); assert.equal(keyCoverage.p40.allDirect,false);
const randomCoverage={}; for(let length=4;length<=7;length+=1)randomCoverage[length]=(25/29)**length;
console.log(JSON.stringify({schema:"lp2-signed-warning-field-identifiability-v1",warning,rawResidues:raw,signedResidues:signedAtoms,signedMissing:[8,9,20,21],pairSumCount:pairClosure((a,b)=>a+b).length,pairDiffCount:pairClosure((a,b)=>a-b).length,pairProductCount:pairClosure((a,b)=>a*b).length,keyCoverage,randomCoverage,conclusion:"Warning-field coordinate nameability is non-identifying: signed fields cover 25/29 residues and one raw-field binary operation covers all GP29."},null,2));
