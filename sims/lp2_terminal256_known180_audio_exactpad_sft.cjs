"use strict";

/**
 * Source-anchored terminal known-plaintext search: Does the original
 * 32x8 base60 table mask 76 unknown p55 runes and then the 180 solved/clear
 * p56/p57 runes using contiguous bytes from a genuine Cicada 2013/2014 MP3?
 *
 * Historical 2013 Cicada Twitter challenge actually used 761.MP3 as a
 * bytewise XOR operand. We use its exact bytes, not a waveform re-encoding.
 * Original 2014 Interconnectedness.MP3 is an independent real OpenPuff
 * carrier. No source selects this terminal alignment; it is conditional.
 *
 * Read-only SFT (Windows Node.js 22):
 * node sims/lp2_terminal256_known180_audio_exactpad_sft.cjs <761.MP3> <interconnected.mp3>
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const gp = load("resources/liber-primus/lp2-corpus.json");
const table = load("resources/liber-primus/lp2-grid-256.json");
const grid = Buffer.from(table.pages.flatMap(p => p.bytes));
assert.equal(grid.length, 256);
const digest = buffer => crypto.createHash("sha256").update(buffer).digest("hex");
assert.equal(digest(grid), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.deepEqual([gp.pages[55].indices.length,gp.pages[56].indices.length,gp.pages[57].indices.length],[76,85,95]);

const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function gpEncode(text){
  const arr=[];
  for(const word of text.split(" ")){
    for(let i=0;i<word.length;){
      const token=tokens.find(t=>word.startsWith(t.s,i));
      assert(token, "Non-GP text token");
      arr.push(token.i);
      i+=token.s.length;
    }
  }
  return arr;
}
const p56=gpEncode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56.length,85);
const primeKeys=[];
for(let n=2;primeKeys.length<85;n++)if(primeKeys.every(p=>p*p>n||n%p!==0))primeKeys.push(n);
let clock=0;
const reencrypted=p56.map((r,i)=>i===56?0:(r+primeKeys[clock++]-1)%29);
assert.equal(p56[56],0);
assert.equal(clock,84);
assert.deepEqual(reencrypted,gp.pages[56].indices);
const p57=gp.pages[57].indices;

const BYTE_SHIFTS=["original p56 plaintext", "literal printed p56 cipher"];
const KNOWN=[[...p56,...p57],[...gp.pages[56].indices,...p57]];
const mod29=n=>(n%29+29)%29;
/** @param {Buffer} data @param {number[]} pattern @returns {number[]} */
function residueMatches(data,pattern){
  const out=[];
  // First two bytes are a fast prefilter. Follow-on comparisons are exact.
  for(let i=0;i+pattern.length<=data.length;i++){
    if(data[i]%29!==pattern[0]||data[i+1]%29!==pattern[1])continue;
    let j=2;
    while(j<pattern.length&&data[i+j]%29===pattern[j])j++;
    if(j===pattern.length)out.push(i);
  }
  return out;
}
/** @param {Buffer} audio @param {number[]} known */
function search(audio,known){
  const fullXor=Buffer.from(known.map((v,j)=>grid[j+76]^v));
  const modAdd=known.map((v,j)=>mod29(grid[j+76]%29-v));
  const direct=[];
  for(let start=audio.indexOf(fullXor);start!==-1;start=audio.indexOf(fullXor,start+1))direct.push(start);
  const additive=residueMatches(audio,modAdd);
  const recover=(offset,method)=>{
    if(offset<76)return {offset,preceding76Available:false};
    const hidden=[];
    for(let i=0;i<76;i++){
      const byte=audio[offset-76+i];
      hidden.push(method==="xor"?grid[i]^byte:mod29(grid[i]%29-byte%29));
    }
    const valid=hidden.filter(i=>i>=0&&i<29).length;
    return {offset,preceding76Available:true,validGP29Symbols:valid,
      transliteration:valid===76?hidden.map(i=>gp.translit[i]).join(""):null};
  };
  return {knownBytes:known.length, exactXorMatches:direct.map(x=>recover(x,"xor")),
    exactMod29AdditiveMatches:additive.map(x=>recover(x,"mod29"))};
}

/**
 * Calibrate the actual 180-byte search with a synthetic historical-file-
 * shaped pad. The decoder sees only the real p56+p57 known suffix.
 */
function plant(){
  const known=KNOWN[0],hidden=p57.slice(0,76),plain=[...hidden,...known];
  const pad=Buffer.alloc(1800);
  let state=0x3301761;
  for(let i=0;i<pad.length;i++){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    pad[i]=state&255;
  }
  const initial=510;
  const plantXor=Buffer.from(plain.map((v,j)=>v^pad[initial+j]));
  const foundXor=searchFromTable(plantXor,known,pad,"xor",initial);
  const plantAdd=Buffer.from(plain.map((v,j)=>(v+pad[initial+j]%29)%29));
  const foundAdd=searchFromTable(plantAdd,known,pad,"mod29",initial);
  assert.equal(foundXor.valid,76);
  assert.equal(foundAdd.valid,76);
  return {keyStart:initial, knownStart:initial+76,
    directXor:foundXor,mod29Additive:foundAdd};
}
/** @param {Buffer} tab @param {number[]} known @param {Buffer} pad @param {string} mode @param {number} start */
function searchFromTable(tab,known,pad,mode,start){
  const pattern=mode==="xor"?
    Buffer.from(known.map((v,j)=>tab[j+76]^v)):
    known.map((v,j)=>mod29(tab[j+76]-v));
  const matches=mode==="xor"?(pad.indexOf(pattern)===start+76):
    residueMatches(pad,pattern).includes(start+76);
  assert(matches,"Planted key occurrence missing");
  const recovered=p57.slice(0,76).map((_,i)=>mode==="xor"?
    tab[i]^pad[start+i]:mod29(tab[i]-pad[start+i]%29));
  const valid=recovered.filter((v,i)=>v===p57[i]).length;
  return {matchedSuffix:matches,valid};
}
const positive=plant();
if(require.main===module){
  const sources=[
    {label:"2013 original 761.MP3",file:process.argv[2],expectedBytes:4010732,
      expectedSha256:"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"},
    {label:"2014 original Interconnectedness MP3",file:process.argv[3],expectedBytes:6651873,
      expectedSha256:null}
  ];
  const originals=[];
  for(const src of sources){
    assert(src.file,"Provide both pinned original MP3 files");
    const audio=fs.readFileSync(src.file);
    assert.equal(audio.length,src.expectedBytes);
    if(src.expectedSha256)assert.equal(digest(audio),src.expectedSha256);
    const views=KNOWN.map((known,i)=>({register:BYTE_SHIFTS[i],...search(audio,known)}));
    originals.push({label:src.label,bytes:audio.length,sha256:digest(audio),views});
  }
  console.log(JSON.stringify({
    source:"unmodified 256-cell base60 table plus p55 76/p56 85/p57 95",
    historicalOperation:"literal contiguous MP3 byte-XOR; one source-compatible byte-mod29 additive alternative",
    sourceP56Reencryption:"85/85",positive,
    originals,
    result:"An exact 180-byte match would independently select an audio start and recover all 76 earlier p55 GP runes. Zero matches exclude only these two direct alignments and readouts."
  },null,2));
}
module.exports={search,residueMatches};
