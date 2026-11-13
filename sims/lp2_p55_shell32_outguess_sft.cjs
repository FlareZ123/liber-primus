#!/usr/bin/env node
"use strict";

/**
 * Source-constrained p55 circumference test.
 *
 * Human route: the solved p57 parable says to "shed our own circumferences";
 * p55 has 16 complete printed words. Their first/last runes give 32 outer
 * symbols, leaving 43 interior symbols. Earlier Cicada stages authenticate
 * OutGuess/ARC4 as an actual tool. This tests only two canonical encodings of
 * that exact shell as an OutGuess password, both as (a) a keyed OutGuess
 * extraction from p55's original JPEG and (b) the source-native OutGuess ARC4
 * stream applied to the 43 interior runes.
 *
 * OutGuess success headers are not authentication. A deterministic, known
 * payload-free JPEG is tested with the same passwords as a negative control.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const { trainNativeGP, languageScore } = require("./historical_solve_path_transfer.cjs");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const transcription = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const emerson = read("resources/control/emerson_essays_2944.txt");
const model = trainNativeGP(emerson);
const carrier = path.join(root, "resources/liber-primus/72.jpg"); // LP2 p55
const controlCarrier = path.join(root, "resources/liber-primus/31.jpg"); // LP2 p14 positive-control cover
const output = path.join(root, "outguess-p55-shell32-results");
const mod = (n, m = 29) => ((n % m) + m) % m;
const translit = xs => xs.map(x => corpus.translit[x]).join("");
const ioc = xs => {
  const f = Array(29).fill(0);
  for (const x of xs) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const p55WordsAll = (transcription.split("%")[54].replace(/\/\s*/g, "")
  .match(/[\u16A0-\u16FF]+/gu) || []);
assert.equal(p55WordsAll[0].length, 1, "Expected one-rune page-turn carry before p55 words");
const p55Words = p55WordsAll.slice(1);
const wordLengths = p55Words.map(w => [...w].length);
assert.deepEqual(wordLengths, [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(
  p55WordsAll.flatMap(w => [...w].map(r => runeIndex.get(r))),
  corpus.pages.find(p => p.page === 55).indices,
  "Printed p55 transcription must match canonical source rune sequence"
);
const endpoints = p55Words.flatMap(w => [runeIndex.get([...w][0]), runeIndex.get([...w].at(-1))]);
const interior = p55Words.flatMap(w => [...w].slice(1,-1).map(r => runeIndex.get(r)));
const interiorWordLengths = p55Words.map(w => [...w].length - 2);
assert.equal(endpoints.length, 32);
assert.equal(interior.length, 43);
assert.equal(interiorWordLengths.reduce((a,b)=>a+b,0), 43);
assert.ok(fs.existsSync(carrier), "Original p55 carrier 72.jpg must exist");
assert.ok(fs.existsSync(controlCarrier), "Original p14 control cover 31.jpg must exist");

const passwords = [
  {encoding:"literal-GP-Latin", value:translit(endpoints)},
  {encoding:"base29-integer", value:endpoints.reduce((n, i) => n * 29n + BigInt(i), 0n).toString()},
];
assert.equal(new Set(passwords.map(x=>x.value)).size, 2);
assert.ok(passwords.every(x => x.value.length <= 80), "OutGuess CLI password length must remain within historical bound");

function spawn(exe, args, timeout=60000) {
  return spawnSync(exe, args, {encoding:"utf8", timeout, maxBuffer:1024*1024});
}
function runOutguess(args, timeout=60000) {
  const p=spawn("outguess",args,timeout);
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
  const entropy=bytes.length ? freq.reduce((h,n)=>n ? h-(n/bytes.length)*Math.log2(n/bytes.length) : h,0) : 0;
  return {flags,printableFraction,entropyBitsPerByte:entropy};
}
function parseHeader(p, outputPath) {
  const log=(p.stdout||"")+"\n"+(p.stderr||"");
  const m=/Steg retrieve:\s*seed:\s*(\d+),\s*len:\s*(\d+)/iu.exec(log);
  const bytes=fs.existsSync(outputPath)?fs.readFileSync(outputPath):null;
  const size=bytes?bytes.length:0;
  const headerConsistent=Boolean(p.status===0 && m && size>0 && size===Number(m[2]));
  const row={exitCode:p.status,signal:p.signal||null,headerConsistent,
    seed:m?Number(m[1]):null,claimedBytes:m?Number(m[2]):null,actualBytes:size};
  if(headerConsistent) Object.assign(row,indicators(bytes),{
    sha256:crypto.createHash("sha256").update(bytes).digest("hex"),
    opening:bytes.subarray(0,96).toString("latin1").replace(/[^\x20-\x7e]/g,".")
  });
  return row;
}
function outguessArc4(password, type, n) {
  // OutGuess 0.4 source-native KDF/PRGA: MD5(type || password), ARC4 KSA + PRGA.
  const digest=crypto.createHash("md5").update(type+password,"ascii").digest();
  const s=Uint8Array.from({length:256},(_,i)=>i);
  let i=255,j=0;
  for(let k=0;k<256;k++) {
    i=(i+1)&255;
    const si=s[i];
    j=(j+si+digest[k%16])&255;
    [s[i],s[j]]=[s[j],s[i]];
  }
  const stream=new Uint8Array(n);
  i=0;j=0;
  for(let k=0;k<n;k++) {
    i=(i+1)&255;
    const si=s[i];
    j=(j+si)&255;
    [s[i],s[j]]=[s[j],s[i]];
    stream[k]=s[(s[i]+s[j])&255];
  }
  return [...stream];
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
      pageTurnCarry:p55WordsAll[0],
      completeWords:p55Words,
      wordLengths,
      interiorWordLengths,
      endpointCount:endpoints.length,
      interiorCount:interior.length,
      endpointIndices:endpoints,
      endpointRunes:endpoints.map(i=>corpus.runes[i]),
      interiorIndices:interior,
      interiorRunes:interior.map(i=>corpus.runes[i])
    },
    passwords:passwords.map(({encoding,value})=>({encoding,value})),
    outguess:{attempts:0,results:[],syntheticControl:[]},
    arc4Core:{attempts:0,results:[],control:{}},
    controls:{}
  };
  try {
    // Verify the exact derived password can recover a newly embedded real message.
    const controlMessage=Buffer.from("P55 SHELL32 OUTGUESS POSITIVE CONTROL\n","ascii");
    const plain=path.join(output,"control.incomplete.txt");
    const planted=path.join(output,"control.incomplete.jpg");
    const recovered=path.join(output,"control.recovered.incomplete");
    fs.writeFileSync(plain,controlMessage,{flag:"wx"});
    const embed=runOutguess(["-k",passwords[0].value,"-d",plain,controlCarrier,planted],120000);
    assert.equal(embed.status,0,"Derived-key OutGuess positive-control embed failed");
    const extract=runOutguess(["-k",passwords[0].value,"-r",planted,recovered],120000);
    assert.equal(extract.status,0,"Derived-key OutGuess positive-control extraction failed");
    assert(fs.readFileSync(recovered).equals(controlMessage),"Derived-key positive control mismatch");
    result.controls={derivedPasswordEmbedAndRecover:true,bytes:controlMessage.length};
    for(const f of [plain,planted,recovered])fs.rmSync(f,{force:true});

    // Test the two exact shell encodings against original p55.
    for(let k=0;k<passwords.length;k++) {
      const {encoding,value}=passwords[k];
      const target=path.join(output,"p55_candidate_"+k+".bin");
      const staging=target+".incomplete";
      fs.rmSync(staging,{force:true});
      const p=runOutguess(["-k",value,"-r",carrier,staging]);
      const row={encoding,...parseHeader(p,staging)};
      result.outguess.attempts++;
      if(row.headerConsistent) fs.renameSync(staging,target);
      else fs.rmSync(staging,{force:true});
      result.outguess.results.push(row);
      console.log("P55_SHELL32_OUTGUESS "+JSON.stringify(row));
    }

    // Payload-free negative control: same passwords, same extractor, clean generated JPEG.
    const generator=path.join(output,"synthetic-jpeg-generator");
    const synthetic=path.join(output,"synthetic-no-payload.jpg");
    const cc=spawn("cc",["-O2",path.join(root,"sims/jpeg_synthetic_control.c"),"-ljpeg","-o",generator],120000);
    assert.equal(cc.status,0,"Cannot compile deterministic no-payload JPEG generator: "+cc.stderr);
    const generated=spawn(generator,[synthetic],120000);
    assert.equal(generated.status,0,"Cannot generate deterministic no-payload JPEG: "+generated.stderr);
    const syntheticSha256=crypto.createHash("sha256").update(fs.readFileSync(synthetic)).digest("hex");
    for(let k=0;k<passwords.length;k++) {
      const {encoding,value}=passwords[k];
      const target=path.join(output,"synthetic_candidate_"+k+".bin");
      const staging=target+".incomplete";
      fs.rmSync(staging,{force:true});
      const p=runOutguess(["-k",value,"-r",synthetic,staging]);
      const row={encoding,...parseHeader(p,staging)};
      row.knownPayloadFreeCarrier=true;
      row.syntheticSha256=syntheticSha256;
      result.outguess.syntheticControl.push(row);
      if(row.headerConsistent) fs.renameSync(staging,target);
      else fs.rmSync(staging,{force:true});
      console.log("P55_SHELL32_SYNTHETIC "+JSON.stringify(row));
    }
    result.outguess.syntheticSha256=syntheticSha256;

    // Apply the same historical OutGuess ARC4 KDF/PRGA to p55's 43 inner runes.
    for(const {encoding,value} of passwords) {
      for(const role of ["Encryption","Seeding"]) {
        const stream=outguessArc4(value,role,interior.length);
        const directXor=interior.map((x,i)=>x^stream[i]);
        for(const sign of [-1,1]) {
          const decoded=interior.map((x,i)=>mod(x+sign*(stream[i]%29)));
          const fragments=[];
          let pos=0;
          for(const n of interiorWordLengths) {
            fragments.push(translit(decoded.slice(pos,pos+n)));
            pos+=n;
          }
          const row={
            encoding,role,
            operation:sign===-1?"C-K":"C+K",
            ioc:ioc(decoded),
            emersonGpLanguageScore:languageScore(decoded,model),
            directXorValidGp29:directXor.filter(x=>x<29).length,
            total:directXor.length,
            output:translit(decoded),
            interiorWordFragments:fragments
          };
          result.arc4Core.attempts++;
          result.arc4Core.results.push(row);
          console.log("P55_SHELL32_ARC4 "+JSON.stringify(row));
        }
      }
    }

    // Positive control: same derived ARC4 pad must invert a known 43-rune p57 segment.
    const p57Runes=transcription.split("%")[56].match(/[\u16A0-\u16FF]/gu)||[];
    const p57=p57Runes.slice(7,50).map(r=>runeIndex.get(r));
    assert.equal(p57.length,43);
    const controlStream=outguessArc4(passwords[0].value,"Encryption",43).map(x=>x%29);
    const syntheticCipher=p57.map((x,i)=>mod(x+controlStream[i]));
    const recoveredP57=syntheticCipher.map((x,i)=>mod(x-controlStream[i]));
    assert.deepEqual(recoveredP57,p57);
    result.arc4Core.control={knownP57SegmentRoundTrip:true,runes:p57.length};
    atomicJSON(path.join(output,"summary.json"),result);
    console.log("P55_SHELL32_OUTGUESS_RESULT "+JSON.stringify({
      controls:result.controls,
      outguess:result.outguess,
      arc4Core:result.arc4Core
    }));
  } finally {
    fs.closeSync(lockFd);
    fs.rmSync(lock,{force:true});
  }
}
if(require.main===module) main();
module.exports={main};
