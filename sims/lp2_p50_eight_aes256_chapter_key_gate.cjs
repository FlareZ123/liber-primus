"use strict";

/**
 * Eight native printed 32-byte columns as AES-256-CTR GP29 pad keys.
 * One 2014 LP2 table column for each of eight illustrated chapters is the
 * physical source hypothesis. This script tests the first chapter's original
 * p0 ciphertext and all eight possible column assignments, with a calibrated
 * GP-language model and a first-party-text planted encrypt/decrypt control.
 *
 * Fully source-bounded: no brute passwords, secrets, or invented plaintext.
 * Usage: node sims/lp2_p50_eight_aes256_chapter_key_gate.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const get = (x) => fs.readFileSync(path.join(ROOT, x), "utf8");
const corpus = JSON.parse(get("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(get("resources/liber-primus/lp2-grid-256.json"));
const english = get("resources/control/shakespeare_first300k.txt");
const trans = get("resources/liber-primus/lp2-transcription.txt");
const q=29, N=31, START=29, END=30;
const names=corpus.translit;
const runeMap=new Map(corpus.runes.map((v,i)=>[v,i]));
const glyphMap=new Map(names.map((v,i)=>[v,i]));
const mod=(v)=>((v%q)+q)%q;
assert.equal(grid.bytes.length,256);
const columns=Array.from({length:8},(_,c)=>Buffer.from(Array.from({length:32},(_,r)=>grid.bytes[8*r+c])));
assert.ok(columns.every(k=>k.length===32));

/** @param {string} word @returns {number[]} */
function encodeWord(word) {
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  const o=[];
  for(let i=0;i<s.length;) {
    if(glyphMap.has(s.slice(i,i+2))) {o.push(glyphMap.get(s.slice(i,i+2)));i+=2;}
    else if(glyphMap.has(s[i])) {o.push(glyphMap.get(s[i]));i++;}
    else throw new Error("Unmapped corpus word: "+s);
  }
  return o;
}
function languageModel(text) {
  const count=new Float64Array(N*N),total=new Float64Array(N),uni=new Float64Array(N);
  for(const word of text.slice(0,240000).match(/[A-Za-z]+/g)||[]) {
    let prev=START;
    for(const x of [...encodeWord(word),END]){
      count[prev*N+x]++;total[prev]++;uni[x]++;prev=x;
    }
  }
  const totalUni=uni.reduce((a,b)=>a+b,0);
  const p=Float64Array.from(uni,v=>(v+1)/(totalUni+N));
  return Float64Array.from(count,(_,i)=>Math.log((count[i]+5*p[i%N])/(total[Math.floor(i/N)]+5)));
}
const LM=languageModel(english);
function readPage(page) {
  const segments=trans.split("%");
  const raw=segments[page>=51?page-1:page];
  const nums=[],starts=[],ends=[];
  let active=false;
  for(const ch of raw) {
    if(runeMap.has(ch)){nums.push(runeMap.get(ch));starts.push(!active);ends.push(false);active=true;}
    else if("-.$&§".includes(ch)) {if(ends.length) ends[ends.length-1]=true;active=false;}
  }
  if(ends.length) ends[ends.length-1]=true;
  assert.deepEqual(nums,corpus.pages.find(p=>p.page===page).indices);
  return {nums,starts,ends};
}
const p0=readPage(0);
const p57=readPage(57);
assert.equal(p0.nums.length,262);
assert.equal(p57.nums.length,95);
function scoreKnown(p) {
  let v=0,prev=START,events=0;
  for(let i=0;i<p.nums.length;i++) {
    if(p.starts[i])prev=START;
    v+=LM[prev*N+p.nums[i]];events++;
    if(p.ends[i]){v+=LM[p.nums[i]*N+END];events++;}
    prev=p.nums[i];
  }
  return {score:v,eventCount:events,perEvent:v/events};
}
/** @param {Buffer} key @param {"mod29"|"scaled29"} projection @param {number} n */
function pad(key,projection,n) {
  const cipher=crypto.createCipheriv("aes-256-ctr",key,Buffer.alloc(16));
  const stream=Buffer.concat([cipher.update(Buffer.alloc(n)),cipher.final()]);
  return Array.from(stream,x=>projection==="mod29"?x%29:Math.floor(x*29/256));
}
function encryptSynthetic(p,k,sign) {
  const c=[];let pointer=0,skips=0;
  for(const sym of p.nums) {
    let cand=mod(sym+sign*k[pointer]);
    while(c.length&&cand===c.at(-1)){
      pointer++;skips++;cand=mod(sym+sign*k[pointer]);
    }
    c.push(cand);pointer++;
  }
  return {c,skips};
}
/**
 * Exact-constraint beam search on output-aware key rejection.
 * Previous trials must have produced the previous ciphertext rune;
 * the chosen trial must reproduce the observed ciphertext rune.
 *
 * @param {number[]} cipher
 * @param {boolean[]} starts
 * @param {boolean[]} ends
 * @param {number[]} key
 * @param {number} sign
 * @param {number} width
 */
function beamDecrypt(cipher,starts,ends,key,sign,width) {
  let states=[{pos:0,last:START,score:0,plain:"",skips:0}];
  for(let i=0;i<cipher.length;i++) {
    const c=cipher[i],prevC=i?cipher[i-1]:-1,uniq=new Map();
    for(const st of states)for(let d=0;d<=2;d++) {
      if(st.pos+d>=key.length||d>0&&(i===0||c===prevC))continue;
      const v=mod(c-sign*key[st.pos+d]);
      let valid=true;
      for(let j=0;j<d;j++)if(mod(v+sign*key[st.pos+j])!==prevC){valid=false;break;}
      if(!valid)continue;
      const prior=starts[i]?START:st.last;
      let score=st.score+LM[prior*N+v];
      if(ends[i])score+=LM[v*N+END];
      const next={pos:st.pos+d+1,last:v,score,plain:st.plain+String.fromCharCode(65+v),skips:st.skips+d};
      const stateKey=String(next.pos)+":"+v;
      const older=uniq.get(stateKey);
      if(!older||next.score>older.score)uniq.set(stateKey,next);
    }
    states=[...uniq.values()].sort((a,b)=>b.score-a.score).slice(0,width);
    assert.ok(states.length,"Beam eliminated every decoder state at i="+i);
  }
  const best=states[0];
  const eventCount=cipher.length+ends.filter(Boolean).length;
  return {scorePerEvent:best.score/eventCount,
    scorePerRune:best.score/cipher.length,
    skips:best.skips,
    preview:best.plain.slice(0,120),
    len:best.plain.length,
    states:states.length};
}
const controlKey=pad(columns[0],"mod29",p57.nums.length+600);
const planted=encryptSynthetic(p57,controlKey,1);
const roundtrip=beamDecrypt(planted.c,p57.starts,p57.ends,controlKey,1,640);
const recoveredSymbols=[...roundtrip.preview].map(x=>x.charCodeAt(0)-65);
const truePrefix=p57.nums.slice(0,recoveredSymbols.length);
const controlMatches=truePrefix.filter((x,i)=>x===recoveredSymbols[i]).length;
const result=[];
for(let col=0;col<8;col++)for(const projection of ["mod29","scaled29"])for(const sign of [1,-1]) {
  const stream=pad(columns[col],projection,262+900);
  result.push({col,projection,sign,...beamDecrypt(p0.nums,p0.starts,p0.ends,stream,sign,320)});
}
result.sort((a,b)=>b.scorePerEvent-a.scorePerEvent);
const report={source:"LP2 printed 32-row × 8-column 256-byte grid; 8 literal AES-256 keys (one column each)",
  hypothesis:"AES-256-CTR zero IV, GP29 mod/scaled byte pad with 0–2 output-aware collision retries",
  input:"unaltered LP2 physical p0 with printed complete-word boundaries",
  tested:result.length,
  knownPlaintextScore:scoreKnown(p57),
  positiveControl:{source:"clear p57 PARABLE",runes:95,encoderSkips:planted.skips,exactPreviewMatches:controlMatches,previewLength:recoveredSymbols.length,decoder:roundtrip},
  best:result.slice(0,8), worst:result.at(-1),
  decision:"Recovered plaintext requires coherent original full-page GP29 prose and a source-selected transport; a beam score alone cannot establish decryption."};
console.log(JSON.stringify(report,null,2));
