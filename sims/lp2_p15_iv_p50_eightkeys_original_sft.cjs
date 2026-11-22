"use strict";
/**
 * Original-source p15 printed square as AES-256-CTR IV for eight unmodified
 * p49-p51 printed table columns (32 bytes per column).
 *
 * This combines two independently visible source shapes in a single fixed
 * cross-artifact interpretation. No authorial AES/IV rule is established.
 * Preserve every one of the 12,956 original GP29 ciphertext runes.
 *
 * Run: node sims/lp2_p15_iv_p50_eightkeys_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createCipheriv, createHash} = require("node:crypto");
const {encode, train} = require("./grid_keyskip_viterbi.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root,file),"utf8");
/** @param {string} file @returns {any} */
const json = file => JSON.parse(read(file));
/** @param {number} x @param {number} n @returns {number} */
const mod = (x,n) => (x%n+n)%n;
const corpus=json("resources/liber-primus/lp2-corpus.json");
const grid=json("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(grid.length,32);
for(const row of grid)assert.equal(row.length,8);
const source=grid.flat();
assert.equal(createHash("sha256").update(Buffer.from(source)).digest("hex"),
 "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const keys=Array.from({length:8},(_,j)=>Buffer.from(grid.map(row=>row[j])));
// Original p15 4x4 source numbers, unaltered printed row-major order.
const square=[
 3258,3222,3152,3038,
 3278,3299,3298,2838,
 3288,3294,3296,2472,
 4516,1206,708,1820
];
const sourceSpiral=[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
assert.equal(square.length,16);
assert.equal(square[5],3299);
assert.deepEqual(sourceSpiral.map(i=>square[i]),
 [3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]);
const ivs={
 printed_row_major:Buffer.from(square.map(x=>x%256)),
 red3299_spiral:Buffer.from(sourceSpiral.map(i=>square[i]%256))
};
const alphabet=new Map(corpus.runes.map((ch,i)=>[ch,i]));
const raw=read("resources/transcriptions/liber_primus_master.txt");
const first=raw.indexOf("ᛋᚻᛖᚩᚷᛗᛡᚠ");
assert(first>=0);
const groups=raw.slice(first).split("%").slice(0,56).join("%")
 .split("$").map(s=>[...s].filter(ch=>alphabet.has(ch)).map(ch=>alphabet.get(ch)))
 .filter(s=>s.length>0);
assert.deepEqual(groups.map(s=>s.length),[729,1145,1729,9,1894,1021,1524,1589,3316]);
const sectionings={
 nine_with_previous:[groups[0],groups[1],groups[2].concat(groups[3]),groups[4],groups[5],groups[6],groups[7],groups[8]],
 nine_with_following:[groups[0],groups[1],groups[2],groups[3].concat(groups[4]),groups[5],groups[6],groups[7],groups[8]]
};
const original=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,12956);
for(const sections of Object.values(sectionings)){
 assert.equal(sections.length,8);
 assert.deepEqual(sections.flat(),original);
}
/** @param {Buffer} key @param {Buffer} iv @param {number} n @returns {Buffer} */
function pad(key,iv,n){
 const cipher=createCipheriv("aes-256-ctr",key,iv);
 return Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]);
}
const logs=Array(29).fill(-1),powers=[];
for(let i=0,v=1;i<28;i++,v=v*15%29){assert.equal(logs[v],-1);logs[v]=i;powers.push(v);}
assert.equal(powers.length,28);
/** @param {number[]} observed @param {Buffer} mask @param {number} sign @param {string} mode @returns {number[]} */
function decode(observed,mask,sign,mode){
 if(mode==="GP29")return observed.map((c,i)=>mod(c+sign*(mask[i]%29),29));
 let previous=0;
 return observed.map((c,i)=>{
   const difference=mod(c-previous,29);
   previous=c;
   return difference===0?28:mod(logs[difference]+sign*(mask[i]%28),28);
 });
}
/** @param {number[]} plain @param {Buffer} mask @param {number} sign @param {string} mode @returns {number[]} */
function encrypt(plain,mask,sign,mode){
 if(mode==="GP29")return plain.map((p,i)=>mod(p-sign*(mask[i]%29),29));
 let previous=0;
 return plain.map((p,i)=>{
   if(p!==28)previous=mod(previous+powers[mod(p-sign*(mask[i]%28),28)],29);
   return previous;
 });
}
/** @param {number[]} runes @returns {number} */
function ioc(runes){
 const bins=Array(29).fill(0);for(const rune of runes)bins[rune]++;
 return bins.reduce((sum,n)=>sum+n*(n-1),0)/(runes.length*(runes.length-1));
}
const model=train(read("resources/control/shakespeare_first300k.txt"));
/** @param {number[]} runes @returns {number} */
function trigram(runes){
 let sum=0;
 for(let i=2;i<runes.length;i++)sum+=model.trigram[(runes[i-2]*29+runes[i-1])*29+runes[i]];
 return sum/(runes.length-2);
}
const native=encode(read("resources/control/shakespeare_first300k.txt")).slice(0,12956);
assert.equal(native.length,12956);
const candidates=[];
for(const [sectioning,sections] of Object.entries(sectionings)){
for(const [ivSource,iv] of Object.entries(ivs)){
 const masks=sections.map((s,i)=>pad(keys[i],iv,s.length));
 for(const mode of ["GP29","GP28"])
 for(const sign of [-1,1]){
   const decrypted=sections.map((s,i)=>decode(s,masks[i],sign,mode));
   for(let i=0;i<sections.length;i++){
     assert.deepEqual(encrypt(decrypted[i],masks[i],sign,mode),sections[i],
       "original-cipher complete reencryption");
     const plant=native.slice(0,sections[i].length);
     assert.deepEqual(decode(encrypt(plant,masks[i],sign,mode),masks[i],sign,mode),
       plant,"native-GP independent full-section plant");
   }
   const flat=decrypted.flat();
   candidates.push({sectioning,ivSource,mode,sign,
     ioc:ioc(flat),trigram:trigram(flat),
     prefix:decrypted[0].slice(0,60).map(x=>corpus.translit[x]).join("")});
 }
}
}
candidates.sort((a,b)=>b.trigram-a.trigram);
console.log(JSON.stringify({
 method:"p15 source integer modulo256 16-byte IV and eight columnwise p49-51 32-byte AES256 CTR keys",
 weakness:"No surviving authored direction selects AES, integer-to-byte modulo, or reset clock",
 originalRunes:original.length,variants:candidates.length,
 raw:{ioc:ioc(original),trigram:trigram(original)},
 native:{ioc:ioc(native),trigram:trigram(native)},
 best:candidates[0],highestIoc:candidates.reduce((a,x)=>x.ioc>a.ioc?x:a),
 all:candidates,plant:"All 16 x 8 original reencryption and independently sourced English plants passed"
},null,2));
