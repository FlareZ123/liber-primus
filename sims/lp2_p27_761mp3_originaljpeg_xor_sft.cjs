"use strict";
/**
 * Frozen source-selected 2013 MP3 XOR on original p27 44.jpg, with p53/55 controls.
 * The authenticated 2013 operation is first reproduced on saved Twitter hex bytes.
 * Run: node sims/lp2_p27_761mp3_originaljpeg_xor_sft.cjs /tmp/761.MP3
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname,"..");
const read = p=>fs.readFileSync(path.join(root,p));
const sha = bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const mp3=fs.readFileSync(process.argv[2]);
assert.equal(sha(mp3),"83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460");
assert.equal(mp3.toString("ascii",0,3),"ID3");
const tag=10+(mp3[6]&127)*0x200000+(mp3[7]&127)*0x4000+(mp3[8]&127)*0x80+(mp3[9]&127);
assert.equal(tag,206);
/** @param {Buffer} cipher @param {number} start */
function xor(cipher,start){
  assert.ok(start+cipher.length<=mp3.length);
  const out=Buffer.allocUnsafe(cipher.length);
  for(let i=0;i<out.length;i++)out[i]=cipher[i]^mp3[start+i];
  return out;
}
function isJpeg(b){return b.subarray(0,3).equals(Buffer.from("ffd8ff","hex"))&&
 b.indexOf(Buffer.from("ffda","hex"))>0&&b.indexOf(Buffer.from("ffd9","hex"))>0;}
const records=read("resources/cicada2013-twitter-hex-stream.txt").toString("utf8").trim()
 .split(/\r?\n/).map(line=>{
   const m=/^([0-9a-fA-F]+):\s*([0-9a-fA-F]+)\s*$/.exec(line);
   assert.ok(m);
   return [parseInt(m[1],16),Buffer.from(m[2],"hex")];
 }).sort((a,b)=>a[0]-b[0]);
const total=records.at(-1)[0]+records.at(-1)[1].length;
const twitter=Buffer.alloc(total);
let cursor=0;
for(const [offset,data] of records){assert.equal(offset,cursor);data.copy(twitter,offset);cursor+=data.length;}
assert.equal(cursor,64167);
const historical=[0,tag].map(start=>({start,decoded:xor(twitter,start)}));
const historicalMatches=historical.filter(t=>isJpeg(t.decoded));
assert.equal(historicalMatches.length,1,"Historical 2013 raw Twitter->JPEG XOR must uniquely select pad phase");
const selected=historicalMatches[0].start;
assert.equal(selected,0, "Historical source chooses whole MP3 file including ID3 header");
const magic=[
 ["JPEG","ffd8ff"],["PNG","89504e470d0a1a0a"],["ZIP","504b0304"],
 ["GZIP","1f8b08"],["PDF","25504446"],["GIF","47494638"],
 ["MP3-ID3","494433"],["OGG","4f676753"],["7Z","377abcaf271c"],
 ["RIFF","52494646"],["PGP-armor",Buffer.from("-----BEGIN PGP","ascii").toString("hex")]
];
function classify(b){
 const hits=magic.filter(([,hex])=>b.subarray(0,hex.length/2).toString("hex")===hex).map(([n])=>n);
 const seen=new Uint32Array(256);for(const v of b)seen[v]++;
 let entropy=0,nonzero=0;
 for(const n of seen)if(n){nonzero++;const f=n/b.length;entropy-=f*Math.log2(f);}
 const ascii=b.reduce((n,v)=>n+((v>=32&&v<=126)||v===10||v===13||v===9?1:0),0)/b.length;
 return {sha256:sha(b),length:b.length,first32hex:b.subarray(0,32).toString("hex"),
   last16hex:b.subarray(-16).toString("hex"),fileMagic:hits,printableRate:+ascii.toFixed(6),
   shannonEntropy:+entropy.toFixed(6),uniqueBytes:nonzero,zeroBytes:seen[0]};
}
const pages=[27,53,55];
const results=pages.map(p=>{
 const img=read("resources/liber-primus/"+(p+17)+".jpg");
 assert.ok(isJpeg(img));
 const raw=xor(img,selected);
 return {page:p,original:{sha256:sha(img),length:img.length,first16:img.subarray(0,16).toString("hex")},
   xored:classify(raw)};
});
console.log(JSON.stringify({
 method:"2013 raw Twitter XOR JPEG positive chooses the sole MP3 pad offset; apply unchanged to LP2 p27,p53,p55 JPEG bytes",
 mp3:{sha256:sha(mp3),bytes:mp3.length,ID3:tag,selectedOffset:selected},
 historical:{twitter:twitter.length,validJPEGStarts:historicalMatches.map(x=>x.start),
 recoveredJPEG:classify(historicalMatches[0].decoded)},
 originals:results,
 conclusion:"A recognizable complete-file magic or recoverable ciphertext/plaintext output is required; entropy alone cannot establish authorship"
},null,2));
