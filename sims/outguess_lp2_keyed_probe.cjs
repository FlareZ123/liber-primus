"use strict";
/**
 * Test source-derived keys against original LP2 JPEGs under pinned OutGuess.
 * A known-key embedded image and authentic Cicada controls must pass first.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {spawnSync}=require("node:child_process");
const ROOT=path.resolve(__dirname,"..");
const SOURCE=path.join(ROOT,"resources/liber-primus");
const OUTPUT=path.join(ROOT,"outguess-results-keyed");
const KEYS=[
  "15","22","53","78","79","435","638","2262","3299","3301",
  "fibonacci","FIBONACCI","totient","TOTIENT","divinity","DIVINITY",
  "firfumferenfe","FIRFUMFERENFE","cicada3301","CICADA3301",
  "liberprimus","LIBERPRIMUS"
];
const PAGES=Array.from({length:58},(_,i)=>17+i);
const SHA=b=>crypto.createHash("sha256").update(b).digest("hex");
const image=n=>path.join(SOURCE,String(n).padStart(2,"0")+".jpg");
const outguess=(args,timeout=20000)=>spawnSync("outguess",args,{
  encoding:"utf8",timeout,maxBuffer:256*1024
});

/** @param {Buffer} bytes @returns {string[]} */
function recognisable(bytes){
  const first=bytes.subarray(0,100).toString("latin1");
  const flags=[];
  if(first.startsWith("-----BEGIN PGP SIGNED MESSAGE-----") ||
     first.startsWith("-----BEGIN PGP MESSAGE-----") ||
     first.startsWith("-----BEGIN PGP PUBLIC KEY BLOCK-----"))flags.push("pgp");
  if(bytes.subarray(0,4).equals(Buffer.from("504b0304","hex")))flags.push("zip");
  if(bytes.subarray(0,2).equals(Buffer.from("1f8b","hex")))flags.push("gzip");
  if(bytes.subarray(0,4).equals(Buffer.from("89504e47","hex")))flags.push("png");
  const ascii=bytes.reduce((n,x)=>n+Number(x===9||x===10||x===13||x>=32&&x<=126),0);
  if(bytes.length>=32&&ascii/bytes.length>.97)flags.push("printable");
  return flags;
}

function main(){
  assert.equal(new Set(KEYS).size,KEYS.length);
  fs.mkdirSync(OUTPUT,{recursive:true});
  const lock=path.join(OUTPUT,".keyscan.lock"),fd=fs.openSync(lock,"wx");
  const temp=path.join(OUTPUT,"extract.incomplete");
  const report={keys:KEYS,pages:PAGES,attempts:0,headerMatches:0,
    plausible:[],unknownBinaryCounts:{},errors:[],controls:{}};
  try{
    const message=Buffer.from("AGENT40 OUTGUESS KEYED RED TRIANGLE CONTROL 79\n");
    const msg=path.join(OUTPUT,"message.incomplete");
    const stego=path.join(OUTPUT,"carrier.incomplete.jpg");
    const recovered=path.join(OUTPUT,"recover.incomplete");
    fs.writeFileSync(msg,message);
    const embedded=outguess(["-k","79","-d",msg,image(17),stego],120000);
    assert.equal(embedded.status,0,"OutGuess embed failed: "+embedded.stderr);
    const decoded=outguess(["-k","79","-r",stego,recovered],120000);
    assert.equal(decoded.status,0,"OutGuess keyed retrieve failed: "+decoded.stderr);
    assert.ok(fs.readFileSync(recovered).equals(message),"Planted OutGuess key failed");
    report.controls.knownKey={password:"79",source:"17.jpg",bytes:message.length,
      messageSHA256:SHA(message),exactRecovery:true};
    for(const p of [msg,stego,recovered])fs.rmSync(p,{force:true});

    for(const page of [0,8]){
      const process=outguess(["-r",image(page),temp]);
      assert.equal(process.status,0,"Authentic default control failed "+page);
      const content=fs.readFileSync(temp);
      if(page===0)assert.ok(content.toString("utf8",0,40)
        .startsWith("-----BEGIN PGP SIGNED MESSAGE-----"));
      if(page===8)assert.ok(content.toString().includes("For those who have fallen behind"));
      fs.rmSync(temp,{force:true});
    }
    report.controls.authenticDefaultImages=[0,8];

    for(const key of KEYS){
      let matched=0, recognised=0;
      const unknown=[];
      for(const page of PAGES){
        fs.rmSync(temp,{force:true});
        const proc=outguess(["-k",key,"-r",image(page),temp]);
        report.attempts++;
        const output=(proc.stdout||"")+"\n"+(proc.stderr||"");
        const header=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(output);
        const n=fs.existsSync(temp)?fs.statSync(temp).size:0;
        if(proc.status===0&&header&&n>0&&n===Number(header[2])){
          matched++;
          const bytes=fs.readFileSync(temp),flags=recognisable(bytes);
          const item={page,seed:Number(header[1]),bytes:n,sha256:SHA(bytes)};
          if(flags.length){
            recognised++;
            const found={key,...item,flags,
              opening:bytes.subarray(0,100).toString("latin1").replace(/[^\x20-\x7e]/g,".")};
            report.plausible.push(found);
            fs.writeFileSync(path.join(OUTPUT,"candidate_"+KEYS.indexOf(key)+"_"+page+".bin"),bytes);
          }else unknown.push(item);
        }else if(proc.error||proc.status===null){
          report.errors.push({key,page,message:String(proc.error||"no exit code")});
        }
        fs.rmSync(temp,{force:true});
      }
      report.headerMatches+=matched;
      report.unknownBinaryCounts[key]={matched,unvalidated:unknown};
      console.log("OUTGUESS_KEYED_KEY "+JSON.stringify({
        key,attempts:PAGES.length,headerConsistent:matched,recognisable:recognised
      }));
    }
    const target=path.join(OUTPUT,"summary.json");
    const staging=target+".incomplete";
    fs.writeFileSync(staging,JSON.stringify(report,null,2)+"\n");
    fs.renameSync(staging,target);
    console.log("OUTGUESS_KEYED_COMPLETE "+JSON.stringify({
      attempts:report.attempts,matchedHeaders:report.headerMatches,
      recognisable:report.plausible.length,errors:report.errors.length,
      controls:report.controls
    }));
    assert.equal(report.errors.length,0,"Unexpected OutGuess process errors");
  }finally{
    fs.rmSync(temp,{force:true});
    fs.closeSync(fd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module)main();
module.exports={main,KEYS,PAGES,recognisable};
