"use strict";
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),assert=require("node:assert/strict");
const p=path.resolve(__dirname,"lp2_p57_divmod29_register_audit_sft.cjs");
const s=fs.readFileSync(p,"utf8").split("console.log(JSON.stringify({")[0];
const probe=s+`\nglobalThis.data={selected:selected.map((w,i)=>({name:names[i],address:gp0(w),pair:targets[i]})),signed:signedWords.map((w,i)=>({word:signedWordText[i],address:gp0(w)})),values:tokens.map(t=>decodeToken(t,alpha60,false))};`;
const ctx={require,console,__dirname}; vm.runInNewContext(probe,ctx,{filename:p});
const {selected,signed,values}=ctx.data, fixed=new Set(selected.map(x=>x.address)), targets=new Set(selected.map(x=>x.pair[0]*29+x.pair[1])), others=new Map();
let predetermined=0;
for(const x of signed){if(fixed.has(x.address)){if(targets.has(values[x.address]))predetermined++;}else{if(!others.has(x.address))others.set(x.address,[]);others.get(x.address).push(x.word);}}
const rem=values.filter((_,i)=>!fixed.has(i)), good=rem.filter(v=>targets.has(v)).length, hits=[...others].filter(([a])=>targets.has(values[a]));
assert.equal(predetermined,11); assert.equal(others.size,24); assert.equal(good,3); assert.deepEqual(JSON.parse(JSON.stringify(hits)),[[31,["LUCK"]]]);
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n-i+1)/BigInt(i);return x;}
const n=rem.length,m=others.size,prob=1-Number(choose(n-good,m))/Number(choose(n,m));
console.log(JSON.stringify({fixed:[...fixed],predetermined,newHit:hits,remainingCells:n,targetCells:good,otherAddresses:m,chanceAtLeastOne:prob},null,2));
