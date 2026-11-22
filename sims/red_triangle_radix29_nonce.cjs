'use strict';
/**
 * Source-triangle direct inversion: LP2 p53 red base29 256-bit key; p15 and
 * p40 red title base29 concatenation 96-bit nonce; eight source-bound
 * geometric orientations, AES256-CTR or ChaCha20. Exact original bodies,
 * matched original-source shuffles and an independent genuine-English plant.
 * No remote I/O, Node.js 22 CommonJS.
 */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const read=n=>JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus',n),'utf8'));
const C=read('lp2-corpus.json'),ink=read('lp2-ink-annotations.json'),grid=read('lp2-grid-256.json');
const alphabet=C.runes,code=new Map(alphabet.map((r,i)=>[r,i]));
const digits=page=>{
 const p=C.pages.find(x=>x.page===page),ann=ink.pages.find(x=>x.page===page);
 const s=ann.red_spans[0];
 const d=[...s.runes].map(r=>code.get(r));
 if(d.some(x=>x===undefined)||d.some((x,i)=>x!==p.indices[s.start+i]))throw Error('Red source mismatch on page '+page);
 return {digits:d,start:s.start,length:s.length};
};
const a=digits(15),b=digits(40),k0=digits(53);
if(a.length!==9||b.length!==8||k0.length!==51||k0.start!==128)throw Error('Triangle span source changed');
const combined=[
 C.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.page===15?p.indices.slice(20):p.indices),
 C.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.page===40?p.indices.slice(8):p.indices)
];
const original=combined.flat(),gridBytes=Buffer.from(grid.pages.flatMap(p=>p.bytes));
if(combined[0].length!==1883||combined[1].length!==3308||gridBytes.length!==256)
 throw Error('Source-selected body/grid count mismatch '+combined.map(x=>x.length));
const keyOptions=d=>[d,d.slice().reverse(),d.map(x=>28-x),d.slice().reverse().map(x=>28-x)];
const nonceOptions=[
 [...a.digits,...b.digits],[...b.digits,...a.digits],
 [...a.digits,...b.digits].reverse(),[...b.digits,...a.digits].reverse()
];
function asBase29(ds,len){
 let v=0n;
 for(const d of ds)v=v*29n+BigInt(d);
 const hex=v.toString(16).padStart(len*2,'0');
 if(hex.length!==len*2)throw Error('base29 overflow');
 return Buffer.from(hex,'hex');
}
const IVs=nonceOptions.map(x=>Buffer.concat([Buffer.alloc(4),asBase29(x,12)]));
/** @param {Buffer} buf @param {Buffer} key @param {Buffer} iv @param {string} algo */
function apply(buf,key,iv,algo){
 const dec=crypto.createDecipheriv(algo,key,iv);
 return Buffer.concat([dec.update(buf),dec.final()]);
}
/** @param {number[]} arr */
function ioc(arr){
 const bins=new Uint32Array(29);
 for(const v of arr)bins[v]++;
 return bins.reduce((z,v)=>z+v*(v-1),0)/(arr.length*(arr.length-1));
}
const gridAscii=v=>[...v].filter(x=>x===9||x===10||x===13||(x>=32&&x<=126)).length;
const algos=['aes-256-ctr','chacha20'];
/** @param {number[]} red @param {boolean} detailed */
function score(red,detailed=false){
 let maxGrid=-1,maxRune=-1,gridWinner=null,runeWinner=null;
 for(const [ki,k] of keyOptions(red).entries())for(let ni=0;ni<IVs.length;ni++)for(const algo of algos){
  const key=asBase29(k,32),iv=IVs[ni],g=gridAscii(apply(gridBytes,key,iv,algo));
  if(g>maxGrid){maxGrid=g;gridWinner={keyOrientation:ki,nonceOrientation:ni,algo};}
  const st=combined.map(body=>apply(Buffer.alloc(body.length),key,iv,algo));
  for(const sign of [-1,1]){
   const plain=combined.flatMap((body,j)=>body.map((v,i)=>(v+sign*(st[j][i]%29)+29)%29));
   const val=ioc(plain);
   if(val>maxRune){maxRune=val;runeWinner={keyOrientation:ki,nonceOrientation:ni,algo,sign,
     bodyIoC:combined.map((body,j)=>ioc(body.map((v,i)=>(v+sign*(st[j][i]%29)+29)%29)))};
   }
  }
 }
 return detailed?{maxGrid,gridWinner,maxRune,runeWinner}:{maxGrid,maxRune};
}
const actual=score(k0.digits,true);
let seed=0x22534079;
const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const reps=800;
let gridMean=0,runeMean=0,gridGE=0,runeGE=0;
for(let trial=0;trial<reps;trial++){
 const s=k0.digits.slice();
 for(let j=s.length-1;j>0;j--){const i=rand()%(j+1);[s[i],s[j]]=[s[j],s[i]];}
 const z=score(s);
 gridMean+=z.maxGrid;runeMean+=z.maxRune;
 gridGE+=+(z.maxGrid>=actual.maxGrid);runeGE+=+(z.maxRune>=actual.maxRune);
}
// Planted English-source GP indices, with source-frozen key/IV, two independent
// sections and exact forward inverse. This checks the expected IoC gate.
const {plaintextWords}=require('./authentic_decryption_regression.cjs');
const sample=plaintextWords('A WARNING BELIEVE NOTHING FROM THIS BOOK EXCEPT WHAT YOU KNOW TO BE TRUE TEST THE KNOWLEDGE FIND YOUR TRUTH EXPERIENCE YOUR DEATH').flat();
if(sample.length<50)throw Error('Reference plaintext tokenizer failed');
const key=asBase29(k0.digits,32),iv=IVs[0];
const planted=combined.map((body,j)=>{
 const plain=Array.from({length:body.length},(_,i)=>sample[(i+23*j)%sample.length]);
 const stream=apply(Buffer.alloc(body.length),key,iv,algos[1]);
 const cipher=plain.map((v,i)=>(v+stream[i]%29)%29);
 const back=cipher.map((v,i)=>(v-stream[i]%29+29)%29);
 if(back.some((v,i)=>v!==plain[i]))throw Error('Synthetic English exact inversion failed');
 return {runes:body.length,EnglishIoC:ioc(plain),cipherIoC:ioc(cipher),exact:true};
});
console.log(JSON.stringify({
 original:{redSpanLengths:[a.length,b.length,k0.length],bodyLengths:combined.map(x=>x.length),
  gridBytes:gridBytes.length,originalBodyIoC:ioc(original),...actual},
 trials:{algorithms:2,keyOrientations:4,nonceOrientations:4,mod29Signs:2,
  gridCandidates:32,runeCandidates:64},
 null:{replicates:reps,seed:'0x22534079',gridMean:gridMean/reps,gridExceed:gridGE,
  gridP:(gridGE+1)/(reps+1),runeMean:runeMean/reps,runeExceed:runeGE,
  runeP:(runeGE+1)/(reps+1)},planted
},null,2));
