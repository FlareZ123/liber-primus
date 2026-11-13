#!/usr/bin/env node
"use strict";

/**
 * Source-constrained OutGuess password test on original LP2 p55 (72.jpg).
 *
 * Human route: the solved p57 parable says to "shed our own circumferences";
 * p55 has 16 complete printed words. Their first/last runes give 32 outer
 * symbols, leaving 43 interior symbols. Earlier Cicada stages authenticate
 * OutGuess as an actual tool. This tests only the two standard repository
 * encodings of that exact 32-rune shell as an OutGuess password:
 * GP-Latin transliteration and its base-29 integer.
 *
 * A successful OutGuess header is NOT message authentication. Preserve raw
 * bytes and report independent format/printability/entropy indicators.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const transcription = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const carrier = path.join(root, "resources/liber-primus/72.jpg"); // LP2 p55
const output = path.join(root, "outguess-p55-shell32-results");
const mod = (n, m) => ((n % m) + m) % m;

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p55WordsAll = (transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || []);
assert.equal(p55WordsAll[0].length, 1, "Expected one-rune page-turn carry before p55 words");
const p55Words = p55WordsAll.slice(1);
const wordLengths = p55Words.map(w => [...w].length);
assert.deepEqual(wordLengths, [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const endpoints = p55Words.flatMap(w => [runeIndex.get([...w][0]), runeIndex.get([...w].at(-1))]);
const interior = p55Words.flatMap(w => [...w].slice(1,-1).map(r => runeIndex.get(r)));
assert.equal(endpoints.length, 32);
assert.equal(interior.length, 43);
assert.deepEqual(p55WordsAll.flatMap(w => [...w].map(r => runeIndex.get(r))),
  corpus.pages.find(p => p.page === 55).indices,
  "Printed p55 transcription must match the canonical source rune sequence");
assert.ok(fs.existsSync(carrier), "Original p55 carrier 72.jpg must exist");

const literalPassword = endpoints.map(i => corpus.translit[i]).join("");
const base29Password = endpoints.reduce((n, i) => n * 29n + BigInt(i), 0n).toString();
const passwords = [
  {encoding:"literal-GP-Latin", value:literalPassword},
  {encoding:"base29-integer", value:base29Password},
];
assert.equal(new Set(passwords.map(x=>x.value)).size, 2);
assert.ok(passwords.every(x => x.value.length <= 80), "OutGuess CLI password length must remain within historical bound");

function run(args, timeout=60000) {
  const p = spawnSync("outguess", args, {encoding:"utf8", timeout, maxBuffer:1024*1024});
  assert.equal(p.error, undefined, "OutGuess process launch error: " + p.error);
  return p;
}
function indicators(bytes) {
  const flags=[];
  const starts=s=>bytes.subarray(0,Buffer.byteLength(s)).equals(Buffer.from(s));
  if(starts("-----BEGIN PGP ")) flags.push("pgp-armour");
  if(bytes.subarray(0,4).equals(Buffer.from("504b0304","hex"))) flags.push("zip");
  if(bytes.subarray(0,2).equals(Buffer.from("1f8b","hex"))) flags.push("gzip");
  if(bytes.subarray(0,4).equals(Buffer.from("89504e47","hex"))) flags.push("png");
  if(bytes.subarray(0,4).equals(Buffer.from("25504446","hex"))) flags.push("pdf");
  if(bytes.subarray(0,4).equals(Buffer.from("377abcaf","hex"))) flags.push("7z");
  const printable=bytes.reduce((n,b)=>n+Number(b===9||b===10||b===13||(b>=32&&b<=126)),0);
  const printableFraction=bytes.length ? printable/bytes.length : 0;
  if(bytes.length>=48 && printableFraction>=0.96) flags.push("printable");
  const freq=Array(256).fill(0); for(const b of bytes) freq[b]++;
  const entropy=freq.reduce((h,n)=>n ? h-(n/bytes.length)*Math.log2(n/bytes.length) : h,0);
  return {flags,printableFraction,entropyBitsPerByte:entropy};
}
function atomicJSON(file,obj) {
  const tmp=file+"."+process.pid+".incomplete";
  fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+"\n",{flag:"wx"});
  fs.renameSync(tmp,file);
}

function main() {
  fs.mkdirSync(output,{recursive:true});
  const lock=path.join(output,".scan.lock");
  const lockFd=fs.openSync(lock,"wx");
  const result={
    source:{
      carrier:"resources/liber-primus/72.jpg",
      page:"LP2 p55",
      instruction:"p57 solved parable: shed our own circumferences",
      completeWords:p55Words,
      wordLengths,
      endpointCount:endpoints.length,
      interiorCount:interior.length,
      endpointIndices:endpoints,
      endpointRunes:endpoints.map(i=>corpus.runes[i]),
      interiorIndices:interior,
      interiorRunes:interior.map(i=>corpus.runes[i])
    },
    passwords:passwords.map(({encoding,value})=>({encoding,value})),
    attempts:0,results:[],controls:{}
  };
  try {
    // Verify the CLI can embed and recover with the first exact derived password.
    const controlMessage=Buffer.from("P55 SHELL32 OUTGUESS POSITIVE CONTROL\n","ascii");
    const plain=path.join(output,"control.incomplete.txt");
    const planted=path.join(output,"control.incomplete.jpg");
    const recovered=path.join(output,"control.recovered.incomplete");
    fs.writeFileSync(plain,controlMessage,{flag:"wx"});
    const embed=run(["-k",literalPassword,"-d",plain,carrier,planted],120000);
    assert.equal(embed.status,0,"Derived-key OutGuess positive-control embed failed");
    const extract=run(["-k",literalPassword,"-r",planted,recovered],120000);
    assert.equal(extract.status,0,"Derived-key OutGuess positive-control extraction failed");
    assert(fs.readFileSync(recovered).equals(controlMessage),"Derived-key positive control mismatch");
    result.controls={derivedPasswordEmbedAndRecover:true,bytes:controlMessage.length};
    for(const f of [plain,planted,recovered])fs.rmSync(f,{force:true});

    for(let k=0;k<passwords.length;k++) {
      const {encoding,value}=passwords[k];
      const target=path.join(output,"candidate_"+k+".bin");
      const staging=target+".incomplete";
      fs.rmSync(staging,{force:true});
      const p=run(["-k",value,"-r",carrier,staging]);
      result.attempts++;
      const log=(p.stdout||"")+"\n"+(p.stderr||"");
      const m=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/iu.exec(log);
      const bytes=fs.existsSync(staging)?fs.readFileSync(staging):null;
      const size=bytes?bytes.length:0;
      const headerConsistent=Boolean(p.status===0 && m && size>0 && size===Number(m[2]));
      const row={encoding,exitCode:p.status,signal:p.signal||null,
        headerConsistent,seed:m?Number(m[1]):null,
        claimedBytes:m?Number(m[2]):null,actualBytes:size};
      if(headerConsistent) {
        const stats=indicators(bytes);
        Object.assign(row,stats,{sha256:crypto.createHash("sha256").update(bytes).digest("hex"),
          opening:bytes.subarray(0,96).toString("latin1").replace(/[^\x20-\x7e]/g,".")});
        fs.renameSync(staging,target);
      } else {
        fs.rmSync(staging,{force:true});
      }
      result.results.push(row);
      console.log("P55_SHELL32_OUTGUESS "+JSON.stringify(row));
    }
    atomicJSON(path.join(output,"summary.json"),result);
    console.log("P55_SHELL32_OUTGUESS_RESULT "+JSON.stringify({
      attempts:result.attempts,controls:result.controls,results:result.results
    }));
  } finally {
    fs.closeSync(lockFd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module) main();
module.exports={main};
