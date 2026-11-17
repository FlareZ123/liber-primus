"use strict";
/**
 * Single source-authored historical OutGuess key attempt:
 * the 36 printed base60 cells strictly between the only two 00 cells
 * at p51 table offsets 192 and229, serialized exactly as their 72 glyphs.
 * One original JPEG carrier: p51 physical scan 68.jpg, the table itself.
 *
 * Fixed original 2016 outguess-positive + password planted control.
 * Node 22, manual Linux CI, no network in script, atomic locked writes.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const root = path.resolve(__dirname,"..");
const output = path.join(root,"outguess-grid36-source-results");
const grid = JSON.parse(fs.readFileSync(
  path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.deepEqual(grid.bytes.flatMap((n,i)=>n===0?[i]:[]),[192,229]);
const chosen=tokens.slice(193,229);
assert.equal(chosen.length,36);
assert.ok(chosen.every(x=>x.length===2));
const key=chosen.join("");
assert.equal(key.length,72);
assert.equal(key,"2Z2d1T2u1t1j0l1o1E3T183E1G270L0v2t06111A2U4B1O2M3d2S0x0w0q0p2V180q1D492O");
function run(args) {
  const process=spawnSync("outguess",args,{encoding:"utf8",timeout:120000,maxBuffer:1024*1024});
  assert(!process.error,String(process.error));
  return process;
}
function sha(v){return crypto.createHash("sha256").update(v).digest("hex");}
function writeAtomic(p,value){
  const tmp=p+"."+process.pid+".tmp";
  fs.writeFileSync(tmp,value,{flag:"wx"});
  fs.renameSync(tmp,p);
}
function main(){
  fs.mkdirSync(output,{recursive:true});
  const lock=path.join(output,".lock");
  const fd=fs.openSync(lock,"wx");
  const scratch=path.join(output,"scratch-"+process.pid+".bin");
  const plant=path.join(output,"planted-"+process.pid+".txt");
  const carrier=path.join(output,"carrier-"+process.pid+".jpg");
  try {
    const priorJpg=path.join(root,"resources/historical/cicada2016-4gq25.jpg");
    const priorPayload=path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc");
    const historical=run(["-r",priorJpg,scratch]);
    assert.equal(historical.status,0,historical.stderr);
    assert(fs.readFileSync(scratch).equals(fs.readFileSync(priorPayload)));
    fs.rmSync(scratch,{force:true});
    const originalJpg=path.join(root,"resources/liber-primus/68.jpg");
    const plain=Buffer.from("SOURCE-GRID-ZERO192-229-EXACT-OUTGUESS-POSITIVE\n");
    writeAtomic(plant,plain);
    const embedded=run(["-k",key,"-d",plant,originalJpg,carrier]);
    let nativeKeyPlantPositive=false, plantError=null;
    if(embedded.status===0){
      const recovered=run(["-k",key,"-r",carrier,scratch]);
      assert.equal(recovered.status,0,recovered.stderr);
      assert(fs.readFileSync(scratch).equals(plain));
      nativeKeyPlantPositive=true;
      fs.rmSync(scratch,{force:true});
    } else if(/Bogus input colorspace/i.test(embedded.stderr)){
      // This original JPEG colorspace is not writable by OutGuess 0.4.
      // The verified independent original signed JPEG still proves extractor operation.
      plantError="Original p51 JPEG colorspace cannot be used as native embedding carrier";
    } else {
      assert.equal(embedded.status,0,embedded.stderr);
    }
    const result=run(["-k",key,"-r",originalJpg,scratch]);
    const payload=fs.existsSync(scratch)?fs.readFileSync(scratch):Buffer.alloc(0);
    const header=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(result.stdout+"\n"+result.stderr);
    const report={key,key_sha256:sha(Buffer.from(key)),sourceCells:[193,228],
      carrier:"resources/liber-primus/68.jpg",historicalPositive:true,
      nativeKeyPlantPositive,plantError,exitCode:result.status,
      stderr:result.stderr.slice(0,1600),stdout:result.stdout.slice(0,1600),
      declaredHeader:header?{seed:Number(header[1]),len:Number(header[2])}:null,
      recoveredBytes:payload.length,prefixHex:payload.subarray(0,64).toString("hex"),
      payloadSha256:payload.length?sha(payload):null};
    if(payload.length)writeAtomic(path.join(output,"p51-original-candidate.bin"),payload);
    writeAtomic(path.join(output,"summary.json"),JSON.stringify(report,null,2)+"\n");
    process.stdout.write("GRID36_ORIGINAL_OUTGUESS "+JSON.stringify(report)+"\n");
  } finally {
    for(const p of [scratch,plant,carrier])fs.rmSync(p,{force:true});
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module) main();
module.exports={main};
