"use strict";
/** Source-locked full-256 ARC4 key with exact collision-skip GP29 Viterbi. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const {viterbi}=require("./grid_stream_collision_viterbi.cjs");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const M=x=>(x%29+29)%29;
/** @param {ArrayLike<number>} key @param {number} n @returns {number[]} */
function arc4(key,n){
 const s=Uint8Array.from({length:256},(_,i)=>i);let j=0;
 for(let i=0;i<256;i++){j=(j+s[i]+key[i%key.length])&255;[s[i],s[j]]=[s[j],s[i]];}
 let i=0;j=0;let out=[];
 for(let k=0;k<n;k++){i=(i+1)&255;j=(j+s[i])&255;[s[i],s[j]]=[s[j],s[i]];out.push(s[(s[i]+s[j])&255]);}
 return out;
}
/** Deterministic planted-cipher randomness. @param {number} seed @returns {()=>number} */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
/** @param {number[]} text @param {number[]} pad @param {number} sign */
function plant(text,pad,sign){
 const random=rng(0x33012755),cipher=[];let k=0,prev=-1,skips=0;
 for(const p of text){let c=M(p+sign*pad[k]);if(prev>=0&&c===prev&&random()<0.81){k++;c=M(p+sign*pad[k]);skips++;}cipher.push(c);prev=c;k++;}
 return {cipher,skips};
}
function run(){
 assert.equal(Buffer.from(arc4(Buffer.from("Key"),10)).toString("hex"),"eb9f7781b734ca72a7");
 const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
 const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
 const key=Buffer.from(grid.bytes);
 assert.equal(key.length,256);
 assert.equal(crypto.createHash("sha256").update(key).digest("hex"),"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
 const opening=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);
 assert.equal(opening.length,729);
 const s=read("resources/control/shakespeare_first300k.txt");
 const lm=train(s.slice(0,200000));
 const plain=encode(s.slice(210000,260000)).slice(0,729);
 assert.equal(plain.length,729);
 const variants=[{name:"all p0-p2",cipher:opening},{name:"p0-p2 after red13",cipher:opening.slice(13)}];
 const original=[];
 for(const {name,cipher} of variants){
  const pad=arc4(key,cipher.length+36).map(b=>b%29);
  for(const sign of [1,-1]){const x=viterbi(cipher,pad,sign,lm);original.push({name,sign,runes:cipher.length,score:x.perRune,skips:x.skips,preview:x.plaintext.slice(0,100).map(i=>corpus.translit[i]).join("")});}
 }
 const pad=arc4(key,765).map(b=>b%29),positive=[];
 for(const sign of [1,-1]){const p=plant(plain,pad,sign),x=viterbi(p.cipher,pad,sign,lm);const hits=x.plaintext.filter((v,i)=>v===plain[i]).length;positive.push({sign,hits,of:729,trueSkips:p.skips,decodedSkips:x.skips,score:x.perRune});assert.ok(hits>=656,"blind positive must recover >=90%");}
 process.stdout.write(JSON.stringify({keyBytes:256,keyHash:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",mechanism:"standard full-grid ARC4, drop0, GP29 mod29, <=1 collision-latent skip, Viterbi source-trained trigram",original,positive},null,2)+"\n");
}
if(require.main===module)run();
module.exports={arc4,plant,run};
