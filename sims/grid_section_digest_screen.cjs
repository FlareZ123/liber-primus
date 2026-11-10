"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const runeOrder = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const runeValues = new Map(runeOrder.map((r, i) => [r, i]));
const labels = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const isRune = (r) => runeValues.has(r);

/** @param {string} s */
function encodings(s) {
  const onlyRunes = [...s].filter(isRune);
  const indices = Buffer.from(onlyRunes.map(c=>runeValues.get(c)));
  const base29Digit = Buffer.from(onlyRunes.map(c=>runeValues.get(c)+1));
  const latin = onlyRunes.map(c=>labels[runeValues.get(c)]).join("");
  return {
    literalUtf8:Buffer.from(s,"utf8"),
    runeUtf8:Buffer.from(onlyRunes.join(""),"utf8"),
    numericIndex:indices,
    numericOneBased:base29Digit,
    uppercaseLatin:Buffer.from(latin,"utf8"),
    lowercaseLatin:Buffer.from(latin.toLowerCase(),"utf8"),
    spacedRunesUtf8:Buffer.from(s.replace(/[/%\r\n]/g,""),"utf8"),
    spacesForHyphens:Buffer.from(s.replace(/-/g," ").replace(/[/%\r\n]/g,""),"utf8"),
    strippedLineBreaks:Buffer.from(s.replace(/[/%\r\n]/g,"").replace(/[&$§]/g,""),"utf8")
  };
}

/** @param {Buffer} bytes */
function digestVariants(bytes) {
  const x = {};
  for(const alg of ["sha256","sha3-256","blake2s256"]) {
    if(!crypto.getHashes().includes(alg))continue;
    x[alg]=crypto.createHash(alg).update(bytes).digest();
  }
  const sha512=crypto.createHash("sha512").update(bytes).digest();
  x.sha512front=sha512.subarray(0,32);
  x.sha512back=sha512.subarray(32);
  const sha3 = crypto.getHashes().includes("shake256")
    ? crypto.createHash("shake256",{outputLength:32}).update(bytes).digest() : null;
  if(sha3)x.shake256=sha3;
  return x;
}

function sources(){
  const master=read("resources/transcriptions/liber_primus_master.txt");
  const start=master.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ");
  assert.ok(start>=0);
  const lp2=master.slice(start).split("%").slice(0,56).join("%");
  const nine=lp2.split("$").filter(x=>[...x].some(isRune));
  assert.equal(nine.length,9);
  const eight=[nine[0],nine[1],nine[2],nine[3]+nine[4],
    nine[5],nine[6],nine[7],nine[8]];
  const pages=lp2.split("%").filter(x=>[...x].some(isRune));
  assert.equal(pages.length,55);
  const allRunes=[...lp2].filter(isRune);
  assert.equal(allRunes.length,12956);
  return {nine,eight,pages,allRunes:allRunes.join(""),lp2};
}

function table(){
  const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
  const row=grid.byte_rows;
  assert.equal(row.length,32);
  row.forEach(x=>assert.equal(x.length,8));
  const col=Array.from({length:8},(_,i)=>Buffer.from(row.map(x=>x[i])));
  const rowChunks=Array.from({length:8},(_,i)=>Buffer.from(row.flat().slice(i*32,i*32+32)));
  return {col,rowChunks};
}

function main(){
  assert.equal(crypto.createHash("sha256").update("abc").digest("hex"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  const src=sources();
  const grid=table();
  const variants=[];
  for(const [name,inputs] of Object.entries({
    nine:src.nine,eight:src.eight,physicalPage:src.pages,all:[src.allRunes,src.lp2]
  }))for(let i=0;i<inputs.length;i++){
    for(const [encoding,bytes] of Object.entries(encodings(inputs[i]))){
      const digests=digestVariants(bytes);
      for(const [hash,digest] of Object.entries(digests))
        variants.push({source:name,unit:i,encoding,hash,digest:digest.toString("hex")});
    }
  }
  const candidates=[];
  for(const [layout,blocks] of Object.entries(grid))
    for(let i=0;i<blocks.length;i++)for(const reverse of [false,true])
      candidates.push({layout,index:i,reverse,
        hex:Buffer.from(reverse?[...blocks[i]].reverse():blocks[i]).toString("hex")});
  const lookup=new Map();
  for(const v of candidates){
    if(!lookup.has(v.hex))lookup.set(v.hex,[]);
    lookup.get(v.hex).push(v);
  }
  const hits=variants.filter(v=>lookup.has(v.digest)).map(v=>({
    source:v.source,unit:v.unit,encoding:v.encoding,hash:v.hash,
    gridMatches:lookup.get(v.digest)
  }));
  const answer={sourceSections9:src.nine.map(x=>[...x].filter(isRune).length),
    mergedSections8:src.eight.map(x=>[...x].filter(isRune).length),
    physicalPages:src.pages.length,runes:src.allRunes.length,
    sourceHashesTested:variants.length,tablePresentations:candidates.length,
    testedAlgorithms:[...new Set(variants.map(v=>v.hash))],
    matches:hits,control:"SHA256 abc NIST vector passes"};
  console.log(JSON.stringify(answer,null,2));
}
if(require.main===module)main();
module.exports={encodings,digestVariants,sources,table};
