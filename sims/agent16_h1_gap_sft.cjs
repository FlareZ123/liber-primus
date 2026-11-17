"use strict";
/**
 * Agent16: source-locked external H1 Rust engine setup and matched-null adjudicator.
 * Node.js 22 CommonJS. No third-party dependencies.
 * prepare <upstream> <original-lp2-corpus.json> <out-directory>
 * analyze <shards-directory> <report.md> [shard-count]
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function writeAtomic(file, contents) {
  fs.mkdirSync(path.dirname(file), {recursive:true});
  const lock = file + ".lock";
  const fd = fs.openSync(lock, "wx");
  let temp;
  try {
    temp = file + "." + process.pid + "." + crypto.randomBytes(5).toString("hex") + ".tmp";
    fs.writeFileSync(temp, contents);
    fs.renameSync(temp, file);
  } finally {
    if (temp && fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
/** @param {Buffer} b @returns {{name:string,values:Buffer}[]} */
function readKsb(b) {
  assert.equal(b.subarray(0,4).toString("ascii"), "KSB1");
  const count=b.readUInt32LE(4), out=[];
  let p=8;
  for (let i=0;i<count;i++) {
    const nameLength=b.readUInt16LE(p);p+=2;
    const name=b.subarray(p,p+nameLength).toString("utf8");p+=nameLength;
    const n=b.readUInt32LE(p);p+=4;
    const values=b.subarray(p,p+n);p+=n;
    assert.equal(values.length,n);
    for (const v of values) assert.ok(v<29);
    out.push({name,values});
  }
  assert.equal(p,b.length);
  return out;
}
/** @param {{name:string,values:Buffer}[]} arr @returns {Buffer} */
function writeKsb(arr) {
  const head=Buffer.alloc(8);head.write("KSB1");head.writeUInt32LE(arr.length,4);
  const pieces=[head];
  for(const e of arr) {
    const name=Buffer.from(e.name,"utf8");
    const h=Buffer.alloc(2+name.length+4);
    h.writeUInt16LE(name.length,0);name.copy(h,2);
    h.writeUInt32LE(e.values.length,2+name.length);
    pieces.push(h,e.values);
  }
  return Buffer.concat(pieces);
}
function prepare(upstream, corpusFile, out) {
  const data=path.join(upstream,"work","kscreen","data");
  const all=readKsb(fs.readFileSync(path.join(data,"library.ksb")));
  const info=fs.readFileSync(path.join(data,"library.tsv"),"utf8")
    .trim().split(/\r?\n/).slice(1).map(line=>line.split("\t"));
  assert.equal(all.length,1439);
  assert.equal(info.length,all.length);
  const flat=all.filter((e,i)=>{
    assert.ok(info[i][0].startsWith(e.name),"stream name/order mismatch at "+i);
    return info[i][4]==="0";
  });
  assert.equal(flat.length,581);
  const nullBytes=fs.readFileSync(path.join(upstream,"work","h5rs","data","null581.ksb"));
  assert.equal(readKsb(nullBytes).length,581);
  const src=fs.readFileSync(path.join(upstream,"work","h5rs","data","lp2_windows.txt"),"utf8");
  const pages=JSON.parse(fs.readFileSync(corpusFile,"utf8")).pages;
  const original=pages.slice(0,56).flatMap(p=>p.indices);
  assert.equal(original.length,12956);
  const startByName={"seg0.7":0,"seg0.8":729,"seg0.9":1874,
    "seg0.11":3612,"seg0.12":5506,"seg0.13":6527,"seg0.14":8051,"seg0.15":9640};
  const blocks=src.trim().split(/(?=^W )/m);
  assert.equal(blocks.length,8);
  for(const block of blocks) {
    const lines=block.trim().split(/\r?\n/);
    const name=lines[0].split(" ")[1];
    const vals=lines[1].slice(2).trim().split(/\s+/).map(Number);
    assert.equal(vals.length,300);
    assert.deepEqual(vals,original.slice(startByName[name],startByName[name]+300),name);
  }
  const flatBytes=writeKsb(flat);
  writeAtomic(path.join(out,"library_flat.ksb"),flatBytes);
  writeAtomic(path.join(out,"null581.ksb"),nullBytes);
  writeAtomic(path.join(out,"lp2_windows.txt"),src);
  // The final physically distinct red-titled p54–55 passage was not a
  // restart window in the external eight-window campaign. Fix one source-led
  // 300-rune original test with an explicit p54 beginning and no tuning.
  const finalPassage=pages[54].indices.concat(pages[55].indices);
  assert.equal(pages[54].indices.length,232);
  assert.equal(pages[55].indices.length,76);
  assert.equal(finalPassage.length,308);
  const p54Window="W p54 -1\nR "+finalPassage.slice(0,300).join(" ")+"\n";
  writeAtomic(path.join(out,"lp2_p54_window.txt"),p54Window);
  const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
  const audit="H1 gap prepared from pinned pnotisdev/cicada3301\n"+
    "Full streams 1439; flat streams 581; null streams 581\n"+
    "All 8 exact original 300-rune windows match; original rune count 12956\n"+
    "Window global starts "+JSON.stringify(startByName)+"\n"+
    "flat KSB SHA256 "+sha(flatBytes)+"\n"+
    "windows SHA256 "+sha(src)+"\n"+
    "p54 source SHA256 "+sha(p54Window)+"\n";
  writeAtomic(path.join(out,"audit.txt"),audit);
  process.stdout.write(audit);
}
/** @param {string} filepath @param {number} shard @returns {{hits:object[],best:object[]}} */
function parseTsv(filepath,shard,offsetStep,minL,maxL) {
  const hits=[],best=[];
  for (const line of fs.readFileSync(filepath,"utf8").split(/\r?\n/)) {
    if(!line||line.startsWith("#")) continue;
    const f=line.split("\t");
    const isBest=f[0]==="best";
    assert.equal(f.length,isBest?7:6,"bad TSV: "+filepath);
    const p=isBest?1:0;
    const e={name:f[p],offset:Number(f[p+1]),L:Number(f[p+2]),
      model:Number(f[p+3]),window:f[p+4],score:Number(f[p+5])};
    assert.ok(e.offset===-1||(e.offset>=shard*offsetStep && e.offset<(shard+1)*offsetStep));
    assert.ok(e.offset===-1||(e.L>=minL&&e.L<=maxL));
    assert.ok([0,1].includes(e.model));
    assert.ok(Number.isFinite(e.score));
    (isBest?best:hits).push(e);
  }
  return {hits,best};
}
function analyze(dir,file,shardCount,variant) {
  const isP54=variant==="p54";
  assert.ok(isP54||variant==="gap");
  const offsetStep=isP54?250:100, minL=isP54?2:14, maxL=isP54?13:20;
  const expectedWindowModels=isP54?2:16;
  const realHits=[],nullHits=[],realBest=[],nullBest=[];
  for(let s=0;s<shardCount;s++){
    for(const [name,hits,best] of [["real",realHits,realBest],["null",nullHits,nullBest]]){
      const loc=path.join(dir,name+"_"+s+".tsv");
      assert.ok(fs.existsSync(loc),"missing shard "+loc);
      const part=parseTsv(loc,s,offsetStep,minL,maxL);
      hits.push(...part.hits);best.push(...part.best);
    }
  }
  function maxima(arr){
    const m=new Map();
    for(const r of arr) {
      if(r.offset===-1) continue;
      const k=r.window+":"+r.model;
      m.set(k,Math.max(m.get(k)||0,r.score));
    }
    return m;
  }
  const nm=maxima(nullBest),rm=maxima(realBest);
  assert.equal(nm.size,expectedWindowModels);assert.equal(rm.size,expectedWindowModels);
  const floor=r=>Math.max(1.6,(nm.get(r.window+":"+r.model)||0)+0.15);
  const candidates=realHits.filter(r=>r.score>=floor(r)).sort((a,b)=>b.score-a.score);
  const lines=[
    isP54?"# LP2 p54–55 final passage: untouched H1 short-key original test":"# LP2 H1 keyword L14–20: original-source completed finite sweep",
    "",
    "Fixed external source: pnotisdev/cicada3301 commit 15200c67abee106913ba01ff504c5b6e88d16cc7.",
    isP54?"Original source: p54 232 + p55 76 =308 contiguous GP runes; first 300 fixed from p54 red-titled beginning; previous source chapter and original extra rune positions not used.":"Original source: resources/liber-primus/lp2-corpus.json; exact eight-window byte-for-byte rune match.",
    "Decoder: external parity-controlled Rust h5rs, frozen two anti-repeat models.",
    isP54?"Real and matched-null grids: 581 historical streams × one 300-rune p54 original window × 2,000 offsets × lengths2–13 × two models, each.":"Real and matched-null grids: 581 independent streams × eight 300-rune windows × 2,000 offsets × lengths14–20 × two models, each.",
    "Shards observed: "+shardCount+" ("+offsetStep+" offsets each).", 
    "Real hit rows >=1.5: "+realHits.length+"; null: "+nullHits.length+".",
    "Real hit rows >=1.6: "+realHits.filter(r=>r.score>=1.6).length+
      "; null: "+nullHits.filter(r=>r.score>=1.6).length+".",
    "Predeclared candidate rule: IoC >= max(1.6, matching 581-stream null maximum + 0.15).",
    "Candidates: "+candidates.length+".",
    "",
    "| Window/model | Real max | Null max | Floor |",
    "|---|---:|---:|---:|"
  ];
  for (const k of [...rm.keys()].sort()){
    const n=nm.get(k);
    lines.push("| "+k+" | "+rm.get(k).toFixed(6)+" | "+n.toFixed(6)+" | "+Math.max(1.6,n+0.15).toFixed(6)+" |");
  }
  lines.push("","## Candidate cells","","These are screen-only until verified by a complete original chapter and a blinded second original window.");
  for(const r of candidates.slice(0,50))
    lines.push("- "+r.name+" / "+r.window+" / offset "+r.offset+" / L"+r.L+" / model"+r.model+" / IoC "+r.score);
  if(candidates.length===0)lines.push("No candidates in this frozen grid.");
  lines.push("","## Strongest original near-misses","");
  for(const r of realHits.sort((a,b)=>b.score-a.score).slice(0,12))
    lines.push("- "+r.name+" / "+r.window+" / offset "+r.offset+" / L"+r.L+" / model"+r.model+" / IoC "+r.score);
  lines.push("",isP54?
    "The final p54–55 red-titled passage is a newly motivated source-section restart, separate from the earlier eight H5 windows. This is a novel short-key screen, not a continuation of the L14–20 incomplete grid. Even a null does not rule out unprovided keys, other segment starts, or an exact invertible cipher.":
    "Earlier externally completed L2–13 and nonflat L2–8 had no candidate. Longer H1 keywords have low planted-key screen power (L16 14%; L20 7% at floor1.6), so a screen negative does not exclude all H1. No unknown plaintext/key is claimed unless independently verified.","");
  writeAtomic(file,lines.join("\n"));
  process.stdout.write(lines.join("\n"));
}
const cmd=process.argv[2];
if(cmd==="prepare") prepare(process.argv[3],process.argv[4],process.argv[5]);
else if(cmd==="analyze") analyze(process.argv[3],process.argv[4],Number(process.argv[5]||20),process.argv[6]||"gap");
else throw new Error("usage: prepare <upstream> <corpus.json> <outdir> | analyze <shardsdir> <report.md> [shards]");
