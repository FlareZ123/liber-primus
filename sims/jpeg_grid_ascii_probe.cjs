"use strict";
/**
 * Literal JPEG-byte pad attack on the 256-byte LP2 base-60 grid.
 * Tests all 24 combinations of original/reversed LP1 page-05 file bytes,
 * four table traversals and XOR/byte-add/byte-subtract decoding, for every
 * complete 256-byte aligned key window in the JPEG file.
 *
 * This is a narrow and falsifiable ASCII-text inversion experiment. It does
 * not assume that the grid is actually plaintext under any of these models.
 * Node.js 22, CommonJS, no dependencies. On-demand execution only.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const LEN = 256, HEAD = 32, TOP = 64;
const ORDERS = ["row","reversed-row","column","reversed-column"];
const OPERATIONS = ["xor","subtract","add"];
/** @param {number} c @param {number} k @param {string} op */
function decode(c,k,op) {
  if(op==="xor")return c^k;
  if(op==="subtract")return(c-k+256)&255;
  assert.equal(op,"add");
  return(c+k)&255;
}
/** @param {number} p @param {number} k @param {string} op */
function encode(p,k,op) {
  if(op==="xor")return p^k;
  if(op==="subtract")return(p+k)&255;
  return(p-k+256)&255;
}
/** @param {number[]} grid @param {string} name */
function order(grid,name) {
  assert.equal(grid.length,LEN);
  const out=new Uint8Array(LEN);
  for(let i=0;i<LEN;i++){
    const j=name.includes("column")?(i%32)*8+Math.floor(i/32):i;
    out[i]=grid[name.startsWith("reversed")?LEN-1-j:j];
  }
  return out;
}
/**
 * Train ASCII unigram model from historical solved LP1 text, with an
 * independent trailing 256-byte plaintext excerpt reserved for the plant.
 * @param {string} source
 */
function prior(source){
  const cleaned=source.replace(/^#.*$/gm," ").replace(/[^A-Za-z0-9 .,!?;:'\n\r-]/g," ")
    .replace(/\s+/g," ").toUpperCase();
  const at=Math.floor(cleaned.length*0.7);
  const counts=new Float64Array(256).fill(0.02);
  const train=Buffer.from(cleaned.slice(0,at),"ascii");
  for(const byte of train)counts[byte]++;
  const total=counts.reduce((a,b)=>a+b,0);
  return {log:Float64Array.from(counts,v=>Math.log(v/total)),
    plant:Buffer.from(cleaned.slice(-LEN),"ascii"),trainBytes:train.length};
}
/**
 * Verify a lossless decomposition of page 05 into first genuine JPEG,
 * 360-byte historical known magic-square insert, and byte-reversed JPEG.
 * @param {Buffer} file
 */
function jpegStructure(file){
  assert.equal(file.length,673066);
  assert.deepEqual([...file.subarray(336351,336353)],[255,217]);
  assert.equal(Buffer.from(file.subarray(0,336353)).reverse()
    .compare(file.subarray(336713)),0);
  const center=file.subarray(336353,336713);
  assert.equal(center.subarray(0,2).toString("ascii"),"\n\n");
  const square=Buffer.from(center.subarray(2).toString("ascii")
    .split("").reverse().join(""),"hex").toString("ascii")
    .trim().split("\n").map(line=>line.trim().split(/\s+/).map(Number));
  assert.deepEqual(square.map(row=>row.length),[5,5,5,5,5]);
  const sums=square.map(row=>row.reduce((a,b)=>a+b,0));
  for(let j=0;j<5;j++)sums.push(square.reduce((a,row)=>a+row[j],0));
  sums.push(square.reduce((a,row,i)=>a+row[i],0));
  sums.push(square.reduce((a,row,i)=>a+row[4-i],0));
  assert.ok(sums.every(value=>value===1033));
  return {totalFileBytes:file.length,firstEoiEnd:336353,
    centerBytes:center.length,exactMirroredTailBytes:336353,
    magicSquare:square,allRowsColumnsDiagonals:1033};
}
/** @param {number} byte */
const printable=byte=>(byte>=32&&byte<=126)||byte===10||byte===13;
/**
 * For each complete candidate key window, score a 32-byte ASCII head;
 * fully decode the best 64 heads within each independently specified branch.
 * @param {Uint8Array} grid
 * @param {Buffer} file
 * @param {Float64Array} log
 * @param {string[]} directions
 * @param {string[]} orders
 * @param {string[]} operations
 */
function scan(grid,file,log,directions=["forward","reverse"],orders=ORDERS,
  operations=OPERATIONS){
  let headCandidates=0;const shortlisted=[];
  for(const direction of directions){
    const key=direction==="reverse"?Buffer.from(file).reverse():file;
    for(const traversal of orders){
      const c=order(grid,traversal);
      for(const operation of operations){
        const lookup=new Float64Array(HEAD*256);
        for(let i=0;i<HEAD;i++)for(let k=0;k<256;k++)
          lookup[i*256+k]=log[decode(c[i],k,operation)];
        const best=[];
        for(let offset=0;offset<=key.length-LEN;offset++){
          let value=0;
          for(let i=0;i<HEAD;i++)value+=lookup[i*256+key[offset+i]];
          headCandidates++;
          if(best.length<TOP||value>best[best.length-1].headScore){
            let pos=best.findIndex(item=>value>item.headScore);
            if(pos<0)pos=best.length;
            best.splice(pos,0,{offset,headScore:value});
            if(best.length>TOP)best.pop();
          }
        }
        for(const b of best){
          let fullScore=0,printableCount=0;
          const text=Buffer.alloc(LEN);
          for(let i=0;i<LEN;i++){
            const v=decode(c[i],key[b.offset+i],operation);
            fullScore+=log[v];printableCount+=Number(printable(v));text[i]=v;
          }
          shortlisted.push({...b,direction,traversal,operation,fullScore,
            printableCount,head:text.subarray(0,HEAD).toString("latin1")
              .replace(/[^\x20-\x7e]/g,".")});
        }
      }
    }
  }
  shortlisted.sort((a,b)=>b.fullScore-a.fullScore);
  return {headCandidates,shortlistCount:shortlisted.length,
    maximumPrintable:Math.max(...shortlisted.map(x=>x.printableCount)),
    top:shortlisted.slice(0,10)};
}
function run(){
  const grid=JSON.parse(fs.readFileSync(path.join(ROOT,
    "resources/liber-primus/base60-grid.json"),"utf8")).byte_rows.flat();
  const file=fs.readFileSync(path.join(ROOT,"resources/liber-primus/05.jpg"));
  const ref=fs.readFileSync(path.join(ROOT,"resources/liber-primus/lp1-plaintext-reference.txt"),"utf8");
  const english=prior(ref),structure=jpegStructure(file);
  assert.equal(grid.length,256);assert.equal(english.plant.length,256);
  const observed=scan(Uint8Array.from(grid),file,english.log);
  // Independent excerpt from authentic solved text, encrypted under a
  // fresh high-entropy nonzero offset: proves literal-pad recovery works.
  const knownOffset=300000,plantedGrid=new Uint8Array(LEN);
  for(let i=0;i<LEN;i++)plantedGrid[i]=encode(english.plant[i],file[knownOffset+i],"xor");
  const planted=scan(plantedGrid,file,english.log,["forward"],["row"],["xor"]);
  const best=planted.top[0];
  assert.equal(best.offset,knownOffset);
  assert.equal(best.printableCount,LEN);
  for(let i=0;i<LEN;i++)assert.equal(decode(plantedGrid[i],file[best.offset+i],"xor"),english.plant[i]);
  const output={model:"literal JPEG raw-byte XOR/add/subtract across every 256-byte pad window; four grid traversals, both directions",
    jpeg:structure,gridUniqueByteValues:new Set(grid).size,
    searchedModels:24,keyStartsPerModel:file.length-LEN+1,
    observed,plant:{knownOffset,trainBytes:english.trainBytes,
      headCandidates:planted.headCandidates,foundOffset:best.offset,
      recoveredAll256Bytes:true,fullScore:best.fullScore,
      headScore:best.headScore},interpretation:"No recovery unless the best decoded 256-byte holdout is readable ASCII; bytewise pad candidates are not evidence of a key without independent plaintext."};
  process.stdout.write(JSON.stringify(output,null,2)+"\n");
}
if(require.main===module)run();
module.exports={decode,encode,order,prior,jpegStructure,scan,run};
