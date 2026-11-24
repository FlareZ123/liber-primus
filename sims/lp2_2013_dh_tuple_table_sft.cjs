"use strict";
const fs=require("node:fs"),path=require("node:path");
function compare(grid){
 const A=grid.alphabet,b=grid.pages.flatMap(x=>x.tokens).map(x=>60*A.indexOf(x[0])+A.indexOf(x[1]));
 const vals=[2757,1264,2800,1067],pattern=vals.flatMap(x=>[Math.floor(x/60),x%60]);if(b.length!==256||String(pattern)!=="45,57,21,4,46,40,17,47")throw Error("input mismatch");
 const counts=pattern.map(x=>b.filter(y=>y===x).length),starts=Array.from({length:b.length-pattern.length+1},(_,i)=>i).filter(i=>pattern.every((x,j)=>x===b[i+j]));
 const num=counts.reduce((a,b)=>a*BigInt(b),1n),den=pattern.reduce((d,_,i)=>d*BigInt(b.length-i),1n);
 return {pattern,counts,starts,rowStarts:starts.filter(i=>i%8===0),startsTested:b.length-pattern.length+1,completeRows:b.length/8,permutationNullNumerator:num.toString(),permutationNullDenominator:den.toString(),expectedMatches:(b.length-pattern.length+1)*Number(num)/Number(den)};
}
if(require.main===module)console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-grid-256.json"),"utf8"))),null,2));
module.exports={compare};
