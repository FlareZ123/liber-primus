"use strict";
/**
 * Source-fixed combination of LP2 page-15 4x4 prime/Fibonacci spiral
 * and LP2 pages 49-51 32x8 base60 byte grid, reshaped 16x16.
 * Node.js 22, CommonJS. No original ciphertext is used to derive a key.
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const {clockwiseSpiral} = require("./fibonacci_prime_spiral.cjs");
const {scan,plant} = require("./base60_seeded_stream.cjs");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const grid = require("../resources/liber-primus/lp2-grid-256.json");
const pages = corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
assert.equal(pages.length,55);
assert.equal(pages.reduce((n,p)=>n+p.indices.length,0),12956);
assert.equal(grid.bytes.length,256);
const original = Buffer.from(grid.bytes);
const spiral = clockwiseSpiral().map(([r,c])=>4*r+c);
assert.deepEqual(spiral,[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]);

/**
 * Traverse a 16x16 reshape as sixteen 4x4 macroblocks in the
 * source's 4x4 spiral order, each using row-major or spiral order.
 * @param {"row"|"column"} layout 16x16 source matrix byte order.
 * @param {"row"|"spiral"} inner Order inside each 4x4 macroblock.
 * @param {boolean} reversed Reverse the source-square reading.
 * @returns {Buffer}
 */
function macroTraversal(layout,inner,reversed){
  const macro = reversed?spiral.slice().reverse():spiral;
  const cells = inner==="spiral"?spiral:Array.from({length:16},(_,i)=>i);
  const output=[];
  for(const m of macro){
    const mr=Math.floor(m/4),mc=m%4;
    for(const z of cells){
      const r=4*mr+Math.floor(z/4),c=4*mc+z%4;
      const offset=layout==="row"?16*r+c:16*c+r;
      output.push(original[offset]);
    }
  }
  assert.equal(output.length,256);
  assert.deepEqual([...output].slice().sort((a,b)=>a-b),[...original].sort((a,b)=>a-b));
  return Buffer.from(output);
}

/** @returns {Array<{name:string,key:Buffer,source:Buffer}>} */
function sourceKeys(){
  const keys=[];
  for(const layout of ["row","column"])
    for(const inner of ["row","spiral"])
      for(const reverse of [false,true]){
        const src=macroTraversal(layout,inner,reverse);
        const base=layout+"-"+inner+"-"+(reverse?"reverse":"forward");
        keys.push({name:"sha256:"+base,key:createHash("sha256").update(src).digest(),source:src});
        keys.push({name:"first32:"+base,key:src.subarray(0,32),source:src});
        keys.push({name:"last32:"+base,key:src.subarray(224,256),source:src});
      }
  assert.equal(keys.length,24);
  return keys;
}

/** @param {number[]} data GP source or decoded runes. */
function ioc(data){
  const hist=new Uint32Array(29);
  for(const x of data)hist[x]++;
  let sum=0;for(const f of hist)sum+=f*(f-1);
  return sum/(data.length*(data.length-1));
}

/**
 * Direct GP29 source-table repeating pad, with page/continuous clocks.
 * This is a separate, reversible arithmetic family from the AES/RC4 keys.
 * @param {Array<{page:number,indices:number[]}>} used
 * @param {ReturnType<typeof sourceKeys>} keys
 */
function directTest(used,keys){
  const best=[];
  const flat=used.flatMap(p=>p.indices);
  for(const k of keys.filter(x=>x.name.startsWith("sha256:"))){
    const source=k.source;
    for(const scope of ["continuous","page"])
      for(const reduction of ["mod","scale"])
        for(const sign of [-1,1]){
          let global=0;
          const decoded=[];
          for(const page of used){
            let local=0;
            for(const c of page.indices){
              const byte=source[(scope==="continuous"?global:local)%256];
              const shift=reduction==="mod"?byte%29:Math.floor(byte*29/256);
              decoded.push((c+sign*shift+29)%29);
              global++;local++;
            }
          }
          assert.equal(decoded.length,flat.length);
          best.push({key:k.name,scope,reduction,sign,ioc:ioc(decoded)});
        }
  }
  best.sort((a,b)=>b.ioc-a.ioc);
  return {tested:best.length,top:best.slice(0,10)};
}

/** @returns {object} */
function run(){
  const keys=sourceKeys();
  const sample=pages.filter(p=>p.page>=16&&p.page<=22);
  const hold=pages.filter(p=>p.page>=23&&p.page<=29);
  const observed=scan(sample,keys);
  const heldout=scan(hold,keys);
  const rawSample=ioc(sample.flatMap(p=>p.indices));
  const rawHold=ioc(hold.flatMap(p=>p.indices));
  const direct={
    sample:directTest(sample,keys),
    hold:directTest(hold,keys),
    all:directTest(pages,keys)
  };
  const positiveKey=keys.find(k=>k.name==="sha256:row-row-forward");
  assert.ok(positiveKey);
  const planted=plant(pages,positiveKey.key);
  const recovered=scan(planted,keys).overall[0];
  assert.equal(recovered.key,positiveKey.name);
  assert.equal(recovered.cipher,"aes-256-ctr");
  assert.equal(recovered.ivmode,"zero");
  assert.equal(recovered.drop,0);
  assert.equal(recovered.mapping,"mod");
  assert.equal(recovered.sign,-1);
  return {
    method:"LP2 source-fixed page15 spiral over 16x16 rearrangements of 32x8 grid",
    originalBytesSha256:createHash("sha256").update(original).digest("hex"),
    sourceKeys:keys.map(k=>({name:k.name,keySha256:createHash("sha256").update(k.key).digest("hex")})),
    observed:{
      samplePages:sample.map(p=>p.page),
      heldoutPages:hold.map(p=>p.page),
      sampleRawIoC:rawSample,
      heldoutRawIoC:rawHold,
      sample:observed,
      heldout:heldout,
      direct
    },
    positive:{
      plantedSource:"native GP-like English with 81% adjacent-repeat repair, exact known source-derived key",
      best:recovered,
      rankOne:true,
      plantedKey:positiveKey.name
    },
    disclaimer:"Source-fixed hypothesis only; synthetic exact key control is not historical recovery."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={macroTraversal,sourceKeys,directTest,run};
