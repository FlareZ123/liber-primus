"use strict";
/**
 * Read-only original 2013 Cicada OS ISO9660 free-sector and file-slack audit.
 * An original puzzle instruction says "The key is all around you"; this
 * tests only data outside normal ISO9660 file contents and directories.
 * It cannot detect steganography inside allocated files.
 *
 * Usage: node sims/cicada2013_iso_free_sectors_sft.cjs original-3301.iso
 * Node 22, CommonJS, no dependencies or external processes.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {createHash}=require("node:crypto");

const SECTOR=2048;
const EXPECTED_SIZE=136398848;
const EXPECTED_SHA256=
  "784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f";
const MAGIC=[
  ["gzip",Buffer.from([0x1f,0x8b,0x08])],
  ["zip",Buffer.from([0x50,0x4b,0x03,0x04])],
  ["jpeg",Buffer.from([0xff,0xd8,0xff])],
  ["pdf",Buffer.from("%PDF-")],
  ["elf",Buffer.from([0x7f,0x45,0x4c,0x46])],
  ["png",Buffer.from([137,80,78,71,13,10,26,10])],
  ["xz",Buffer.from([0xfd,0x37,0x7a,0x58,0x5a,0])],
  ["zlib",Buffer.from([0x78,0x9c])]
];
const isoPath=process.argv[2];
assert.ok(isoPath,"Supply original ISO path");
const fd=fs.openSync(isoPath,"r");
const size=fs.fstatSync(fd).size;
assert.equal(size,EXPECTED_SIZE,"Original ISO byte count");
assert.equal(size%SECTOR,0);
const nSectors=size/SECTOR;
const owner=new Uint8Array(nSectors);
const entries=[];
const directoryVisited=new Set();
const sectorsIn=(n)=>Math.ceil(n/SECTOR);

/** @param {number} sector @returns {Buffer} */
function sector(sector){
  assert.ok(sector>=0&&sector<nSectors);
  const b=Buffer.alloc(SECTOR);
  assert.equal(fs.readSync(fd,b,0,SECTOR,sector*SECTOR),SECTOR);
  return b;
}
/**
 * @param {number} lba @param {number} byteCount
 * @param {number} category 1 metadata, 2 directory, 3 file
 */
function mark(lba,byteCount,category){
  const blocks=sectorsIn(byteCount);
  assert.ok(lba>=0&&lba+blocks<=nSectors);
  for(let i=lba;i<lba+blocks;i++)owner[i]=Math.max(owner[i],category);
}
// First 16 sectors are ISO system area, usually boot metadata, not file space.
mark(0,16*SECTOR,1);
let pvd=null;
const bootCatalog=[];
for(let pos=16;pos<64;pos++){
  const b=sector(pos);
  assert.equal(b.subarray(1,6).toString("ascii"),"CD001");
  mark(pos,SECTOR,1);
  if(b[0]===1)pvd=b;
  if(b[0]===0&&b.subarray(7,39).toString("ascii")
    .startsWith("EL TORITO SPECIFICATION")){
    const catalog=b.readUInt32LE(71);
    if(catalog>0&&catalog<nSectors)bootCatalog.push(catalog);
  }
  if(b[0]===255)break;
}
assert.ok(pvd,"Missing primary volume descriptor");
const declaredSectors=pvd.readUInt32LE(80);
assert.ok(declaredSectors>0&&declaredSectors<=nSectors);
const tableSize=pvd.readUInt32LE(132);
for(const lba of [
  pvd.readUInt32LE(140),pvd.readUInt32LE(144),
  pvd.readUInt32BE(148),pvd.readUInt32BE(152)
])if(lba>0&&tableSize>0)mark(lba,tableSize,1);
for(const lba of bootCatalog){
  mark(lba,SECTOR,1);
  const cat=sector(lba);
  const image=cat.readUInt32LE(40);
  const load512=cat.readUInt16LE(38);
  if(image>0&&image<nSectors&&load512>0){
    mark(image,load512*512,1);
  }
}

/**
 * Walk original ISO directory records, including real source extents.
 * @param {number} lba @param {number} bytes @param {string} prefix
 */
function walk(lba,bytes,prefix){
  assert.ok(bytes>0&&bytes<1024*1024);
  const key=lba+":"+bytes;
  if(directoryVisited.has(key))return;
  directoryVisited.add(key);
  mark(lba,bytes,2);
  const data=Buffer.alloc(bytes);
  assert.equal(fs.readSync(fd,data,0,bytes,lba*SECTOR),bytes);
  let p=0;
  while(p<data.length){
    const recordLength=data[p];
    if(!recordLength){p=(Math.floor(p/SECTOR)+1)*SECTOR;continue;}
    assert.ok(recordLength>=34&&p+recordLength<=data.length);
    const nameLength=data[p+32];
    assert.ok(33+nameLength<=recordLength);
    const name=data.subarray(p+33,p+33+nameLength);
    const nextLba=data.readUInt32LE(p+2);
    const nextLength=data.readUInt32LE(p+10);
    const flags=data[p+25];
    p+=recordLength;
    if(name.length===1&&(name[0]===0||name[0]===1))continue;
    const normalized=name.toString("ascii").replace(/;[0-9]+$/,"");
    const path=prefix+normalized;
    if(nextLength===0)continue;
    assert.ok(nextLba<nSectors&&nextLength<size);
    const dir=Boolean(flags&2);
    entries.push({path,lba:nextLba,length:nextLength,dir});
    mark(nextLba,nextLength,dir?2:3);
    if(dir)walk(nextLba,nextLength,path+"/");
  }
}
const rootLba=pvd.readUInt32LE(158),rootLength=pvd.readUInt32LE(166);
walk(rootLba,rootLength,"");
assert.ok(entries.some(e=>e.path.toUpperCase()==="DATA/560.13"&&
  e.length===118818811),"Expected original 2013 DATA/560.13 extent missing");

/** @param {Buffer} b @returns {number} */
function nonzeroCount(b){
  let count=0;
  for(const x of b)if(x!==0)count++;
  return count;
}
// ISO9660 system area is reserved rather than unallocated; inspect its
// nonzero data separately because ordinary extraction never exposes it.
const systemArea=[];
for(let i=0;i<16;i++){
  const b=sector(i),n=nonzeroCount(b);
  if(!n)continue;
  const signatures=[];
  for(const [kind,magic] of MAGIC)if(b.indexOf(magic)>=0)signatures.push(kind);
  systemArea.push({lba:i,nonzeroBytes:n,signatures,
    asciiSpans:(b.toString("latin1").match(/[\\x20-\\x7e]{24,}/g)||[])
      .slice(0,5).map(x=>x.slice(0,170))});
}
const slack=[];
for(const e of entries){
  if(e.dir||e.length%SECTOR===0)continue;
  const end=e.lba*SECTOR+e.length;
  const tail=SECTOR-e.length%SECTOR;
  const buffer=Buffer.alloc(tail);
  assert.equal(fs.readSync(fd,buffer,0,tail,end),tail);
  const nonzero=nonzeroCount(buffer);
  if(nonzero)slack.push({path:e.path,length:tail,nonzero});
}
let unownedCount=0,nonzeroSectors=0,nonzeroBytes=0;
let current=null;
const runs=[],magic=[],strings=[];
for(let i=0;i<nSectors;i++){
  if(owner[i]){if(current){runs.push(current);current=null;}continue;}
  unownedCount++;
  const b=sector(i);
  const n=nonzeroCount(b);
  if(!n){if(current){runs.push(current);current=null;}continue;}
  nonzeroSectors++;nonzeroBytes+=n;
  if(!current)current={firstLba:i,lastLba:i,sectors:1,nonzeroBytes:n};
  else{current.lastLba=i;current.sectors++;current.nonzeroBytes+=n;}
  for(const [kind,signature] of MAGIC){
    let start=-1,count=0;
    while((start=b.indexOf(signature,start+1))!==-1&&count<3){
      if(magic.length<60)magic.push({lba:i,byteOffset:start,kind});
      count++;
    }
  }
  const words=b.toString("latin1").match(/[\x20-\x7e]{32,}/g)||[];
  for(const word of words.slice(0,3)){
    if(strings.length<30)strings.push({lba:i,text:word.slice(0,160)});
  }
}
if(current)runs.push(current);
fs.closeSync(fd);

// Authentic input digest, verified after the read-only structural parse.
const stream=fs.createReadStream(isoPath);
const hash=createHash("sha256");
stream.on("data",chunk=>hash.update(chunk));
stream.on("error",error=>{throw error;});
stream.on("end",()=>{
  const sha256=hash.digest("hex");
  assert.equal(sha256,EXPECTED_SHA256,"Unexpected ISO bytes");
  const summary={
    source:{size,sha256,declaredSectors,nSectors},
    reservedSystemArea:{sectors:16,nonzeroSectors:systemArea.length,
      totalNonzeroBytes:systemArea.reduce((s,x)=>s+x.nonzeroBytes,0),
      records:systemArea},
    iso9660:{files:entries.filter(e=>!e.dir).length,
      directories:directoryVisited.size,
      filesWithNonzeroSlack:slack.length},
    unallocated:{sectors:unownedCount,nonzeroSectors,nonzeroBytes,
      contiguousNonzeroRuns:runs.length},
    firstNonzeroRuns:runs.slice(0,35),
    fileSlackWithData:slack.slice(0,35),
    unallocatedMagic:magic,
    unallocatedAsciiSpans:strings,
    scope:"Only source ISO9660 unowned sectors and per-file slack; no claimed decoder or LP2 plaintext."
  };
  console.log(JSON.stringify(summary,null,2));
});
