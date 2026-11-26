"use strict";
/** Frozen public 27x27 decoder: exact inventory + row-major adjacent-equality count controls.
 * Each independent seed starts at a random permutation and uses random swaps to reach
 * the target equality count, followed by 30,000 equality-preserving swaps proposed.
 * This is a matched sampling procedure, not a proof of uniformity.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const os=require("node:os");
const cp=require("node:child_process");
const crypto=require("node:crypto");
const exe=path.resolve(process.argv[2]), matrixFile=path.resolve(process.argv[3]);
const cwd=path.dirname(matrixFile);
const tokens=fs.readFileSync(matrixFile,"utf8").trim().split(/\s+/);
assert.equal(tokens.length,729);
const aliases={"S/Z":"S","C/K":"C","U/V":"U","IA/IO":"IA"};
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
assert.deepEqual(tokens.map(s=>corpus.translit.indexOf(aliases[s]??s)),corpus.pages.slice(0,3).flatMap(p=>p.indices));
/** @param {string[]} a */
const repeats=a=>a.slice(1).reduce((n,x,i)=>n+Number(x===a[i]),0);
const target=repeats(tokens);
const inv=a=>a.slice().sort().join("|");
const inventory=inv(tokens);
function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
function matched(seed) {
  const r=rng(seed), a=tokens.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  let n=repeats(a), accepted=0, repair=0;
  for(let k=0;k<300000&&n!==target;k++){
    const i=Math.floor(r()*a.length),j=Math.floor(r()*a.length);
    if(i===j||a[i]===a[j])continue;
    [a[i],a[j]]=[a[j],a[i]];
    const m=repeats(a);
    if(Math.abs(m-target)<=Math.abs(n-target)){n=m;repair++;}
    else [a[i],a[j]]=[a[j],a[i]];
  }
  assert.equal(n,target);
  for(let k=0;k<30000;k++){
    const i=Math.floor(r()*a.length),j=Math.floor(r()*a.length);
    if(i===j||a[i]===a[j])continue;
    [a[i],a[j]]=[a[j],a[i]];
    if(repeats(a)===target)accepted++;
    else [a[i],a[j]]=[a[j],a[i]];
  }
  assert.equal(inv(a),inventory);
  assert.equal(repeats(a),target);
  return {a,accepted,repair,distance:a.reduce((n,x,i)=>n+Number(x!==tokens[i]),0)};
}
function decode(file) {
  const c=cp.spawnSync(exe,[file,"--top","1","--trace"],{cwd,encoding:"utf8",timeout:20000,maxBuffer:8*1024*1024});
  const out=c.stdout??"",err=c.stderr??"";
  const head=out.match(/#1\s+score=([-+\d.]+)\s+blocks=(\d+)\s+runes=(\d+)/);
  const depth=out.match(/Last layer explored:\s*(\d+)/);
  const saturated=c.status===4&&/Depth limit 128 reached with active branches/.test(err);
  const timeout=c.error?.code==="ETIMEDOUT";
  assert.ok(c.status===0||saturated||timeout,err||out);
  const blocks=[...out.matchAll(/^\d\d\s+.+?\s+node=\(\(.*?\)\)\s+cells=(\(\(.*?\)\))\s+key=\(.*?\)\s+runes=\(.*?\)/gm)];
  const cells=blocks.flatMap(b=>[...b[1].matchAll(/\((\d+),\s*(\d+)\)/g)].map(m=>(+m[1]-1)*27+(+m[2]-1)));
  return {status:c.status,saturated,timeout,depth:depth?+depth[1]:saturated?128:head?+head[2]:null,blocks:head?+head[2]:null,runes:head?+head[3]:null,score:head?+head[1]:null,uniqueCipher:head&&blocks.length===+head[2]?new Set(cells).size:null,traceBlocks:blocks.length};
}
const original=decode(matrixFile);
assert.deepEqual([original.blocks,original.runes,original.uniqueCipher],[39,118,106]);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-matched27-"));
const outcomes=[];
try{
  for(let i=0;i<64;i++){
    const seed=(0x29112726^Math.imul(i+1,0x9e3779b9))>>>0;
    const {a,accepted,repair,distance}=matched(seed);
    const p=path.join(dir,"matrix-"+i+".txt");
    fs.writeFileSync(p,Array.from({length:27},(_,j)=>a.slice(j*27,j*27+27).join(" ")).join("\n")+"\n");
    const result={seed,accepted,repair,distance,...decode(p)};
    outcomes.push(result);
    console.log("CASE "+JSON.stringify(result));
  }
}finally{fs.rmSync(dir,{recursive:true,force:true});}
const done=outcomes.filter(x=>x.status===0);
const summary={targetAdjacentEqualities:target,original,count:outcomes.length,completed:done.length,censored:outcomes.length-done.length,completedAtLeast39:done.filter(x=>x.blocks>=39).length,completedAtLeast106Cells:done.filter(x=>x.uniqueCipher!==null&&x.uniqueCipher>=106).length,completedJoint:done.filter(x=>x.blocks>=39&&x.uniqueCipher!==null&&x.uniqueCipher>=106&&x.score>=original.score).length,maxDepth:Math.max(...done.map(x=>x.blocks??0)),maxCoverage:Math.max(...done.map(x=>x.uniqueCipher??0)),maxScore:Math.max(...done.map(x=>x.score??-Infinity)),outcomes};
console.log("SUMMARY "+JSON.stringify(summary));
