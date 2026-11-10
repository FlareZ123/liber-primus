"use strict";
/** Diagnose OutGuess headers on an independently generated, payload-free JPEG. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {spawnSync}=require("node:child_process");
const crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const OUTPUT=path.join(ROOT,"outguess-synthetic-results");
const KEYS=["22","79","2262","638","3301","fibonacci","totient","CICADA3301"];
const REFERENCE={
  "22":[63457,15481],"79":[48754,22897],"2262":[18010,558],
  "638":[50436,14020],"3301":[62079,54051],
  "fibonacci":[55229,39302],"totient":[18608,6457],
  "CICADA3301":[15270,59519]
};
/** @param {string} exe @param {string[]} args */
function run(exe,args){
  return spawnSync(exe,args,{encoding:"utf8",maxBuffer:1024*1024,timeout:60000});
}
/** @param {ReturnType<typeof run>} p @param {string} output */
function result(p,output){
  const match=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec((p.stdout||"")+"\n"+(p.stderr||""));
  const size=fs.existsSync(output)?fs.statSync(output).size:0;
  return {status:p.status,signal:p.signal||null,
    seed:match?Number(match[1]):null,length:match?Number(match[2]):null,
    bytes:size,headerConsistent:!!(p.status===0&&match&&size===Number(match[2]))};
}
function main(){
  fs.mkdirSync(OUTPUT,{recursive:true});
  const lock=path.join(OUTPUT,".lock");
  const fd=fs.openSync(lock,"wx");
  try {
    const exe=path.join(OUTPUT,"synthetic-generator");
    const jpeg=path.join(OUTPUT,"synthetic-no-payload.jpg");
    const c=run("cc",["-O2",path.join(ROOT,"sims/jpeg_synthetic_control.c"),"-ljpeg","-o",exe]);
    assert.equal(c.status,0,"C encoder compilation failed "+c.stderr);
    assert.equal(run(exe,[jpeg]).status,0,"Cannot generate synthetic JPEG");
    const h=crypto.createHash("sha256").update(fs.readFileSync(jpeg)).digest("hex");
    const target=path.join(OUTPUT,"extract.incomplete");
    const outputs=[];
    for(const key of KEYS){
      fs.rmSync(target,{force:true});
      const p=run("outguess",["-k",key,"-r",jpeg,target]);
      const value=result(p,target);
      outputs.push({key,...value,expectedLP2seed:REFERENCE[key][0],
        expectedLP2length:REFERENCE[key][1],
        headerMatchesLP2:value.headerConsistent&&value.seed===REFERENCE[key][0]&&value.length===REFERENCE[key][1]});
      fs.rmSync(target,{force:true});
    }
    // Original-source positive verifies the extractor can distinguish a real message.
    const message=path.join(OUTPUT,"message.incomplete");
    const stego=path.join(OUTPUT,"embedded-key79.jpg");
    fs.writeFileSync(message,"KEYED SYNTHETIC SOURCE POSITIVE 79\n");
    const embed=run("outguess",["-k","79","-d",message,path.join(ROOT,"resources/liber-primus/17.jpg"),stego]);
    assert.equal(embed.status,0,"Could not embed keyed positive "+embed.stderr);
    const extracted=run("outguess",["-k","79","-r",stego,target]);
    assert.equal(extracted.status,0,"Could not recover keyed positive "+extracted.stderr);
    const authentic=fs.readFileSync(target).equals(fs.readFileSync(message));
    assert.ok(authentic,"Keyed synthetic positive content mismatch");
    const exact=result(extracted,target);
    const report={syntheticSHA256:h,keys:KEYS,control:{actualEmbeddedMessage:true,
      exactRecovery:authentic,bytes:fs.statSync(message).size,reported:exact},
      sourceNoPayload:true,positiveCover:"original 17.jpg",results:outputs};
    const tmp=path.join(OUTPUT,"summary.json.incomplete");
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+"\n");
    fs.renameSync(tmp,path.join(OUTPUT,"summary.json"));
    console.log("OUTGUESS_SYNTHETIC "+JSON.stringify(report));
    fs.rmSync(target,{force:true});
    fs.rmSync(message,{force:true});
    fs.rmSync(stego,{force:true});
    return report;
  }finally{fs.closeSync(fd);fs.rmSync(lock,{force:true});}
}
if(require.main===module)main();
module.exports={main};
