"use strict";
const fs=require("node:fs"),path=require("node:path");
function compare(script,grid){
 const primes=[...script.matchAll(/^echo\s+(?:-n\s+)?"(\d+)\s*"/gm)].map(m=>Number(m[1]));
 const A=grid.alphabet,enc=x=>A[Math.floor(x/60)]+A[x%60],table=grid.pages.flatMap(x=>x.tokens),expected=primes.slice(0,256);
 if(primes.length!==464||table.length!==256||expected.some(x=>x>=3600))throw Error("unexpected source");
 const cells=table.map((actual,i)=>{const p=i<80?49:i<184?50:51,local=i-(p===49?0:p===50?80:184);return {index:i,page:p,row:Math.floor(local/8)+1,col:local%8+1,actual,actualValue:60*A.indexOf(actual[0])+A.indexOf(actual[1]),expected:enc(expected[i]),prime:expected[i]}});
 return {primeOutputs:primes.length,tableCells:table.length,first:expected[0],last:expected.at(-1),matches:cells.filter(x=>x.actual===x.expected),mismatchIndices:cells.filter(x=>x.actual!==x.expected).map(x=>x.index),aboveByte:expected.filter(x=>x>255).length,maxTable:Math.max(...cells.map(x=>x.actualValue)),cells};
}
if(require.main===module){const root=path.resolve(__dirname,"..");console.log(JSON.stringify(compare(fs.readFileSync(path.join(root,"resources/historical/cicada2013-os-original-prime-echo.sh"),"utf8"),JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"))),null,2))}
module.exports={compare};
