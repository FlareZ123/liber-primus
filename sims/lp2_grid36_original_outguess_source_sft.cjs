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
    function stats(buf){
      if(!buf.length)return {entropyBitsPerByte:null,printableAsciiFraction:null,distinctByteValues:0,magic:[]};
      const counts=new Uint32Array(256);
      for(const b of buf)counts[b]++;
      let entropyBitsPerByte=0;
      for(const n of counts)if(n){const p=n/buf.length;entropyBitsPerByte-=p*Math.log2(p);}
      let printable=0;
      for(const b of buf)if(b===9||b===10||b===13||(b>=32&&b<=126))printable++;
      const signatures=[
        ["PNG","89504e470d0a1a0a"],["JPEG","ffd8ff"],["GIF87a","474946383761"],
        ["GIF89a","474946383961"],["ZIP","504b0304"],["GZIP","1f8b08"],
        ["PDF","255044462d"],["PGP armor","2d2d2d2d2d424547494e2050475020"],
        ["ELF","7f454c46"],["SQLite","53514c69746520666f726d6174203300"],
        ["7z","377abcaf271c"],["RAR","526172211a07"]
      ];
      const magic=signatures.filter(([,hex])=>buf.subarray(0,Buffer.from(hex,"hex").length).equals(Buffer.from(hex,"hex"))).map(([name])=>name);
      return {entropyBitsPerByte:Number(entropyBitsPerByte.toFixed(6)),
        printableAsciiFraction:Number((printable/buf.length).toFixed(6)),
        distinctByteValues:counts.reduce((a,n)=>a+(n?1:0),0),magic};
    }
    const gpAscii="ABCDEFGHIJKLMNOPQRSTUVWXYZ123";
    assert.equal(gpAscii.length,29);
    const residues=grid.bytes.slice(193,229).map(n=>n%29);
    const controls=[
      {name:"reverse-72-character-string",password:key.split("").reverse().join("")},
      {name:"reverse-36-cell-order",password:chosen.slice().reverse().join("")},
      {name:"gp29-residues-as-A-Z-1-3",password:residues.map(n=>gpAscii[n]).join("")},
      {name:"shifted-window-192-through-227",password:tokens.slice(192,228).join("")},
      {name:"shifted-window-194-through-229",password:tokens.slice(194,230).join("")}
    ];
    const nullControls=controls.map(control=>{
      fs.rmSync(scratch,{force:true});
      const r=run(["-k",control.password,"-r",originalJpg,scratch]);
      const bytes=fs.existsSync(scratch)?fs.readFileSync(scratch):Buffer.alloc(0);
      const h=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(r.stdout+"\n"+r.stderr);
      if(bytes.length)writeAtomic(path.join(output,control.name+".bin"),bytes);
      return {name:control.name,passwordLength:control.password.length,
        passwordSha256:sha(Buffer.from(control.password)),exitCode:r.status,
        declaredHeader:h?{seed:Number(h[1]),len:Number(h[2])}:null,
        recoveredBytes:bytes.length,prefixHex:bytes.subarray(0,64).toString("hex"),
        payloadSha256:bytes.length?sha(bytes):null,...stats(bytes),
        stdout:r.stdout.slice(0,800),stderr:r.stderr.slice(0,800)};
    });
    const report={key,key_sha256:sha(Buffer.from(key)),sourceCells:[193,228],
      carrier:"resources/liber-primus/68.jpg",historicalPositive:true,
      nativeKeyPlantPositive,plantError,exitCode:result.status,
      stderr:result.stderr.slice(0,1600),stdout:result.stdout.slice(0,1600),
      declaredHeader:header?{seed:Number(header[1]),len:Number(header[2])}:null,
      recoveredBytes:payload.length,prefixHex:payload.subarray(0,64).toString("hex"),
      payloadSha256:payload.length?sha(payload):null,payloadStats:stats(payload),nullControls};
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
