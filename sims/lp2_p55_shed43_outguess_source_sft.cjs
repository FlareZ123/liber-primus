"use strict";

/**
 * A source-selected OutGuess password test for the final unsolved page.
 *
 * The solved PARABLE says "shed our own circumferences"; removing the first
 * and last GP rune from every originally printed word of physical p55
 * produces exactly 43 original runes. Test precisely those 43 runes as an
 * OutGuess password, plus their canonical GP transliteration in both cases,
 * against the two images bearing the known same tree (p32 and p55) and the
 * historically signed image that shares the tree. No dictionary variants,
 * searched passwords or arbitrary missing keys.
 *
 * Required command: pinned OutGuess v0.2 build already installed in existing
 * manual LP2-OutGuess workflow. Run:
 *   node sims/lp2_p55_shed43_outguess_source_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const {spawnSync} = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const physical = fs.readFileSync(path.join(
  ROOT,"resources/lp2-transcription.txt"),"utf8").split("%");
assert.equal(physical.length,57);
const wordRunes = physical[54].replace(/[\/\r\n]/g,"").match(/[\u16A0-\u16FF]+/gu);
assert.equal(wordRunes.length,17);
assert.equal(wordRunes.reduce((a,w)=>a+[...w].length,0),76);
const runes = wordRunes.flatMap(w=>[...w].slice(1,-1));
assert.equal(runes.length,43);
const raw = runes.join("");
const translit = runes.map(r=>{
  const i=corpus.runes.indexOf(r);
  assert.ok(i>=0, "unsupported GP rune");
  return corpus.translit[i];
}).join("");
assert.equal(translit, "MIEOGDTHIAABCEAFXIMUCPHNGLSDIAPHEOEIGXGSEOTHTHEEAIMCJE");
const passwords = [
  {name:"raw-original-runes",value:raw},
  {name:"canonical-GP-uppercase",value:translit},
  {name:"canonical-GP-lowercase",value:translit.toLowerCase()},
];
const images=[
  {name:"physical-p32-blurred-tree",path:"resources/liber-primus/49.jpg"},
  {name:"physical-p55-sharp-tree",path:"resources/liber-primus/72.jpg"},
  {name:"2016-signed-tree",path:"resources/historical/cicada2016-4gq25.jpg"}
];
/** @param {Buffer} data @returns {string[]} */
function recognize(data){
  const flags=[];
  const p=data.subarray(0,80);
  if(p.toString("ascii",0,15)==="-----BEGIN PGP ")flags.push("pgp");
  if(p.subarray(0,4).equals(Buffer.from("504b0304","hex")))flags.push("zip");
  if(p.subarray(0,2).equals(Buffer.from("1f8b","hex")))flags.push("gzip");
  if(p.subarray(0,4).equals(Buffer.from("89504e47","hex")))flags.push("png");
  if(data.length>=32){
    const printable=data.reduce((n,c)=>n+Number(c===9||c===10||c===13||c>=32&&c<=126),0);
    if(printable/data.length>=.97)flags.push("printable");
  }
  return flags;
}

/** @param {string[]} args @returns {ReturnType<typeof spawnSync>} */
function command(args){
  const p=spawnSync("outguess",args,{encoding:"utf8",timeout:120000,maxBuffer:262144});
  assert.ok(!p.error, "OutGuess invocation failure: "+String(p.error));
  return p;
}
const SHA=b=>crypto.createHash("sha256").update(b).digest("hex");

const dir=fs.mkdtempSync(path.join(os.tmpdir(),"lp2-shed43-"));
const output=path.join(dir,"candidate");
try{
  const results=[];
  for(const pwd of passwords)for(const image of images){
    fs.rmSync(output,{force:true});
    const p=command(["-k",pwd.value,"-r",path.join(ROOT,image.path),output]);
    const message=(p.stdout||"")+"\n"+(p.stderr||"");
    const header=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/i.exec(message);
    const contents=fs.existsSync(output)?fs.readFileSync(output):Buffer.alloc(0);
    const flags=recognize(contents);
    const consistent=p.status===0 && header && Number(header[2])===contents.length &&
      contents.length>0;
    const result={
      password:pwd.name,
      image:image.name,
      status:p.status,
      signal:p.signal,
      headerSeed:header?Number(header[1]):null,
      headerLength:header?Number(header[2]):null,
      extractedBytes:contents.length,
      headerConsistent:Boolean(consistent),
      recognizable:flags,
      sha256:contents.length?SHA(contents):null,
      first32:contents.subarray(0,32).toString("hex")
    };
    results.push(result);
    console.log("LP2_SHED43_OUTGUESS "+JSON.stringify(result));
  }
  const successes=results.filter(r=>r.headerConsistent&&r.recognizable.length);
  console.log("LP2_SHED43_OUTGUESS_DECISION "+JSON.stringify({
    sourceRUneCount:runes.length,
    sourceWordCount:wordRunes.length,
    variants:passwords.map(p=>p.name),
    targets:images.map(x=>x.name),
    attempts:results.length,
    plausible:successes,
    decision:successes.length?
      "Candidate signature or printable payload needs independent authentication":
      "No recognized original OutGuess payload under this exact source-selected family",
    caution:"Header seed and length alone are not evidence of genuine embedding"
  }));
} finally {
  fs.rmSync(dir,{recursive:true,force:true});
}
