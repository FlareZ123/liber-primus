"use strict";
/**
 * Original/noise controls for pinned November 2026 independent external
 * 27x27 LP2 C++ decoder. Node CommonJS; 27x27 source matrix untouched.
 * Run via read-only workflow with argv = executable path, original matrix path.
 * The original program reports the deepest route then its best word score.
 * @module agent11_2026_autonomous_decoder_null_sft
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const cp=require("node:child_process");
/** @param {number} seed @returns {()=>number} */
function rng32(seed) {
  let value=seed>>>0;
  return ()=>{value^=value<<13;value^=value>>>17;value^=value<<5;return value>>>0;};
}
/** @template T @param {T[]} items @param {()=>number} rand @returns {T[]} */
function permute(items,rand) {
  const out=items.slice();
  for(let i=out.length-1;i>0;i--) {
    const j=rand()%(i+1);
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}
/**
 * @param {string} executable @param {string} matrixFile @param {string} working
 * @returns {{score:number,blocks:number,runes:number,lastLayer:number,openings:number|null,text:string}}
 */
function decode(executable,matrixFile,working) {
  const call=cp.spawnSync(executable,[matrixFile,"--top","1"],{
    cwd:working,encoding:"utf8",timeout:15000,maxBuffer:5*1024*1024
  });
  const saturated=call.status===4 && /Depth limit 128 reached with active branches/.test(call.stderr||"");
  const timedOut=call.error?.code==="ETIMEDOUT";
  assert.ok(call.status===0||saturated||timedOut,call.stderr||call.stdout);
  const output=call.stdout;
  const first=output.match(/#1\s+score=([-+\d.]+)\s+blocks=(\d+)\s+runes=(\d+)/);
  const last=output.match(/Last layer explored:\s*(\d+)/);
  const openings=output.match(/Admissible openings with words:\s*(\d+)/);
  return {
    score:first?Number(first[1]):null,
    blocks:first?Number(first[2]):0,runes:first?Number(first[3]):0,
    lastLayer:last?Number(last[1]):saturated?128:0,
    saturated,timedOut,
    openings:openings?Number(openings[1]):null,
    text:first?output.slice(first.index+first[0].length).trim().split(/\r?\n/)[0]:""
  };
}
/** Runs frozen original and finite non-plaintextroute controls. */
function run() {
  const executable=path.resolve(process.argv[2]);
  const originalPath=path.resolve(process.argv[3]);
  const working=path.dirname(originalPath);
  const raw=fs.readFileSync(originalPath,"utf8");
  const rows=raw.trim().split(/\r?\n/).map(line=>line.trim().split(/\s+/));
  assert.equal(rows.length,27);
  assert.ok(rows.every(row=>row.length===27));
  const tokens=rows.flat();
  assert.equal(tokens.length,729);
  const hash=crypto.createHash("sha256").update(raw).digest("hex");
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"agent11-lp2-null-"));
  /** @param {string[][]} matrix @param {string} filename */
  function writeMatrix(matrix,filename) {
    const file=path.join(dir,filename);
    fs.writeFileSync(file,matrix.map(r=>r.join(" ")).join("\n")+"\n");
    return file;
  }
  /** @param {string[][]} matrix @returns {boolean} */
  function sameInventory(matrix) {
    return matrix.flat().slice().sort().join("\t")===tokens.slice().sort().join("\t");
  }
  const original=decode(executable,originalPath,working);
  assert.equal(original.blocks,39);
  assert.equal(original.runes,118);
  const groups=[];
  const cases=[
    {name:"uniform-all-729",count:5},
    {name:"row-order",count:5},
    {name:"independent-row-shift",count:5},
    {name:"column-order",count:5}
  ];
  for(let groupIndex=0;groupIndex<cases.length;groupIndex++) {
    const kind=cases[groupIndex];
    const members=[];
    for(let sample=0;sample<kind.count;sample++) {
      const seed=(0x33012026 ^ ((groupIndex+1)*0x9e3779b9) ^ (sample+1)*0x85ebca6b)>>>0;
      const rand=rng32(seed);
      let matrix;
      if(kind.name==="uniform-all-729") {
        const t=permute(tokens,rand);
        matrix=Array.from({length:27},(_,r)=>t.slice(27*r,27*r+27));
      } else if(kind.name==="row-order") {
        matrix=permute(rows,rand);
      } else if(kind.name==="independent-row-shift") {
        matrix=rows.map(row=>{
          const k=1+rand()%26;
          return row.slice(k).concat(row.slice(0,k));
        });
      } else {
        const cols=permute(Array.from({length:27},(_,i)=>i),rand);
        matrix=rows.map(row=>cols.map(c=>row[c]));
      }
      assert.ok(sameInventory(matrix));
      const testFile=writeMatrix(matrix,`control-g${groupIndex}-s${sample}.txt`);
      const outcome=decode(executable,testFile,working);
      members.push({seed,blocks:outcome.blocks,runes:outcome.runes,
        score:outcome.score,lastLayer:outcome.lastLayer,
        saturated:outcome.saturated,timedOut:outcome.timedOut});
    }
    const hist={};
    for(const row of members)hist[row.lastLayer]=(hist[row.lastLayer]??0)+1;
    const longest=members.reduce((a,b)=>Math.max(a,b.lastLayer),0);
    const numericScores=members.filter(x=>x.score!==null).map(x=>x.score);
    groups.push({name:kind.name,controls:members.length,maxLastLayer:longest,
      atLeast39:members.filter(x=>x.lastLayer>=39).length,
      saturated:members.filter(x=>x.saturated).length,
      timedOut:members.filter(x=>x.timedOut).length,
      depthHistogram:hist,maxScore:numericScores.length?Math.max(...numericScores):null,
      sample:members});
    console.log("CONTROL_GROUP_COMPLETE "+JSON.stringify({name:kind.name,
      saturated:members.filter(x=>x.saturated).length,
      timedOut:members.filter(x=>x.timedOut).length,depthHistogram:hist}));
  }
  const report={sourceMatrixSha256:hash,externalCodeSha:"1f952dc948948bcd2bea4d5e5a61ba6175b501ec",
    original,groups,totalControls:groups.reduce((s,v)=>s+v.controls,0),
    interpretation:"Frozen external decoder on original and token-inventory-preserving null matrices"};
  console.log(JSON.stringify(report,null,2));
  return report;
}
if(require.main===module)run();
module.exports={run,decode,permute};
