"use strict";
/**
 * Authenticated 2016 message -> source-selected LP2 OutGuess carriers.
 * Node.js 22 SFT, requires the repository-pinned OutGuess executable on PATH.
 * No arbitrary password search, offsets, image variations or guessed carriers.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const {spawnSync} = require("node:child_process");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "resources/liber-primus");
const signed = path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc");
const signedImage = path.join(root, "resources/historical/cicada2016-4gq25.jpg");
const output = path.join(root, "outguess-signed2016-results");
const paths = ["31.jpg", "49.jpg", "72.jpg"]; // Physical LP2 p14, p32, p55.
const keys = [
  "epiphany", "the devoted", "The path lies empty",
  "Liber Primus is the way", "Its words are the map",
  "their numbers are the direction", "Seek and you will be found",
  "7A35090F", "FOLD", "563569", "1136"
];
/** @param {Buffer} bytes @returns {string} */
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
/** @param {string[]} args @param {number} timeout */
function outguess(args, timeout=30000) {
  const res = spawnSync("outguess", args, {encoding:"utf8",timeout,maxBuffer:256000});
  assert(!res.error, "OutGuess launch failure: " + res.error);
  assert(!res.signal, "OutGuess terminated: " + res.signal);
  return res;
}
/** @param {Buffer} bytes @returns {string[]} */
function indicators(bytes) {
  const flags=[];
  const hasPrefix=prefix => bytes.subarray(0,prefix.length)
    .equals(Buffer.from(prefix));
  if(hasPrefix("-----BEGIN PGP "))flags.push("pgp");
  if(hasPrefix("PK\\x03\\x04"))flags.push("zip");
  if(bytes.subarray(0,2).equals(Buffer.from("1f8b","hex")))flags.push("gzip");
  if(bytes.subarray(0,4).equals(Buffer.from("89504e47","hex")))flags.push("png");
  const printable=bytes.reduce((n,v)=>n+Number(v===9||v===10||v===13||v>=32&&v<=126),0);
  if(bytes.length>=48 && printable/bytes.length>0.96)flags.push("printable");
  return flags;
}
/** Atomic UTF-8 JSON write within the exclusive output-directory lease. */
function atomicJSON(destination,obj) {
  const staged=destination + "." + process.pid + ".incomplete";
  fs.writeFileSync(staged,JSON.stringify(obj,null,2)+"\n",{flag:"wx"});
  fs.renameSync(staged,destination);
}
function main() {
  const sourceText=fs.readFileSync(signed,"utf8");
  assert.equal(Buffer.byteLength(sourceText),1136);
  for(const key of keys.slice(0,8))assert(sourceText.includes(key),
    "key must be literal in 2016 signed source: "+key);
  assert.equal(new Set(keys).size,keys.length);
  fs.mkdirSync(output,{recursive:true});
  const lock=path.join(output,".scan.lock");
  const handle=fs.openSync(lock,"wx");
  const scratch=path.join(output,"extract.incomplete");
  const result={source:{signed:"resources/historical/cicada2016-4gq25-outguess.asc",
      exactBytes:1136,sourceImage:"2016/4gq25.jpg"},
    carriers:paths,keys,attempts:0,validHeaders:0,
    candidateCount:0,candidates:[],control:{},countsByKey:[]};
  try {
    const known=fs.readFileSync(signed);
    const defaultRes=outguess(["-r",signedImage,scratch]);
    assert.equal(defaultRes.status,0,
      "authentic 2016 unkeyed positive control failed");
    assert(fs.readFileSync(scratch).equals(known),
      "original 2016 signed OutGuess extraction differs from authenticated source");
    result.control.authentic2016ExactBytes=known.length;
    fs.rmSync(scratch,{force:true});

    const message=Buffer.from("SIGNED 2016 SOURCE-SELECTED OUTGUESS POSITIVE CONTROL\n");
    const plain=path.join(output,"plant.incomplete");
    const embedded=path.join(output,"plant.incomplete.jpg");
    fs.writeFileSync(plain,message,{flag:"wx"});
    const embed=outguess(["-k",keys[0],"-d",plain,
      path.join(src,paths[0]),embedded],120000);
    assert.equal(embed.status,0,"source-passphrase embed failed: "+embed.stderr);
    const recover=outguess(["-k",keys[0],"-r",embedded,scratch],120000);
    assert.equal(recover.status,0,"source-passphrase extraction failed: "+recover.stderr);
    assert(fs.readFileSync(scratch).equals(message),
      "planted source-key extraction did not recover original payload");
    result.control.embeddedKey=keys[0];
    result.control.plantExactRecovery=true;
    for(const file of [plain,embedded,scratch])fs.rmSync(file,{force:true});

    for(const key of keys){
      let headerConsistent=0,recognisable=0;
      for(const imageName of paths){
        fs.rmSync(scratch,{force:true});
        const run=outguess(["-k",key,"-r",path.join(src,imageName),scratch]);
        result.attempts++;
        const info=(run.stdout||"")+"\n"+(run.stderr||"");
        const match=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/iu.exec(info);
        const size=fs.existsSync(scratch)?fs.statSync(scratch).size:0;
        if(run.status!==0||!match||size===0||size!==Number(match[2]))continue;
        headerConsistent++;
        const bytes=fs.readFileSync(scratch);
        const flags=indicators(bytes);
        if(flags.length){
          recognisable++;
          const item={key,imageName,bytes:size,seed:Number(match[1]),
            sha256:hash(bytes),flags,
            opening:bytes.subarray(0,80).toString("latin1").replace(/[^\x20-\x7e]/g,".")};
          result.candidates.push(item);
          const final=path.join(output,
            "candidate_"+keys.indexOf(key)+"_"+imageName.replace(".jpg","")+".bin");
          const staged=final+"."+process.pid+".incomplete";
          fs.writeFileSync(staged,bytes,{flag:"wx"});
          fs.renameSync(staged,final);
        }
      }
      result.validHeaders+=headerConsistent;
      result.countsByKey.push({key,headerConsistent,recognisable});
      console.log("SIGNED2016_OUTGUESS_KEY "+JSON.stringify(
        {key,headerConsistent,recognisable}));
    }
    result.candidateCount=result.candidates.length;
    atomicJSON(path.join(output,"summary.json"),result);
    console.log("SIGNED2016_OUTGUESS_RESULT "+JSON.stringify({
      attempts:result.attempts,validHeaders:result.validHeaders,
      recognisable:result.candidateCount,control:result.control,
      candidates:result.candidates
    }));
  } finally {
    fs.rmSync(scratch,{force:true});
    fs.closeSync(handle);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module)main();
module.exports={main,keys,paths,indicators};
