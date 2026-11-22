"use strict";
/**
 * Exact recursive circumference-peeling to the one/two-rune core of every
 * complete printed LP2 word. SFT: node sims/lp2_recursive_word_core_sft.cjs
 *
 * A word of odd length has one central rune; an even-length word has two.
 * Every outer layer is retained for reversible reconstruction. No fitted
 * phases, alphabet changes, key guesses or stop positions are used.
 *
 * @module lp2_recursive_word_core_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const alphabet=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const gp=new Set(alphabet);
const TRANS=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const starts=[0,729,1874,3612,5506,6527,7960,8051,9640,12956];
/** @param {string} s @returns {string} */
const sha256=s=>crypto.createHash("sha256").update(s,"utf8").digest("hex");
/** @param {string} s @returns {string} */
function gitBlob(s){const b=Buffer.from(s,"utf8");return crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex")}
/** @param {string} raw @returns {{start:number,end:number,runes:string}[]} */
function words(raw){
  const out=[];let i=0,current=[],start=0;
  const flush=()=>{
    if(current.length){out.push({start,end:i,runes:current.join("")});current=[]}
  };
  for(const ch of raw){
    if(gp.has(ch)){if(!current.length)start=i;current.push(ch);i++}
    else if("-.&$§".includes(ch))flush();
  }
  flush();return out;
}
/** @param {string} word @returns {{center:string,rings:string[],length:number}} */
function peel(word){
  const a=[...word],n=a.length,rings=[];
  for(let i=0;i<Math.floor((n-1)/2);i++)rings.push(a[i]+a[n-i-1]);
  return {center:a.slice(Math.floor((n-1)/2),Math.ceil((n+1)/2)).join(""),
    rings,length:n};
}
/** @param {{center:string,rings:string[],length:number}} z @returns {string} */
function reconstruct(z){
  let s=z.center;
  for(let i=z.rings.length-1;i>=0;i--){
    const p=[...z.rings[i]];assert.equal(p.length,2);
    s=p[0]+s+p[1];
  }
  assert.equal([...s].length,z.length);return s;
}
/** @param {string} s @returns {string} */
function latin(s){return [...s].map(ch=>TRANS[alphabet.indexOf(ch)]).join("")}
/** @param {string} s @returns {number} */
function ioc(s){
  const h=Array(29).fill(0);for(const ch of s){const i=alphabet.indexOf(ch);assert.ok(i>=0);h[i]++}
  return h.reduce((sum,n)=>sum+n*(n-1),0)/(s.length*(s.length-1));
}
function run(){
  const raw=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
  assert.equal(gitBlob(raw),"43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7");
  const input=words(raw),unknown=input.filter(w=>w.start<12956);
  assert.equal(input.length,2941);assert.equal(unknown.length,2896);
  const peeled=unknown.map(w=>peel(w.runes));
  assert.deepEqual(peeled.map(reconstruct),unknown.map(w=>w.runes));
  const centers=peeled.map(z=>z.center).join("");
  const odd=peeled.filter(z=>z.length%2).map(z=>z.center).join("");
  const even=peeled.filter(z=>!(z.length%2)).map(z=>z.center).join("");
  assert.equal(centers.length,4342);
  assert.equal(odd.length,1450);
  assert.equal(even.length,2892);
  const solved=words(raw.split("%").filter(page=>[...page].some(ch=>gp.has(ch))).at(-1));
  assert.equal(solved.length,20);
  const solvedCenters=solved.map(w=>peel(w.runes).center).join("");
  assert.equal(solvedCenters.length,33);
  const perBody=starts.slice(0,-1).map((start,i)=>{
    const unit=unknown.filter(w=>w.start>=start&&w.end<=starts[i+1]);
    const c=unit.map(w=>peel(w.runes).center).join("");
    return {body:i+1,words:unit.length,centerRunes:c.length,ioc:ioc(c)};
  });
  assert.deepEqual(perBody.map(x=>x.centerRunes),
    [237,387,574,658,337,479,35,525,1110]);
  assert.ok(ioc(centers)>0.034 && ioc(centers)<0.035);
  assert.ok(ioc(solvedCenters)>0.07);
  const summary={
    sourceGitBlob:gitBlob(raw),strategy:"strip every complete word's outermost pair until one rune (odd) or two runes (even) remain",
    originalUnknownWords:unknown.length,coreRunes:centers.length,
    singletonCoreRunes:odd.length,pairedCoreRunes:even.length,
    originalCoreSha256:sha256(centers),coreIoC:ioc(centers),
    oddCoreSha256:sha256(odd),oddIoC:ioc(odd),
    evenCoreSha256:sha256(even),evenIoC:ioc(even),
    openingCoreLatin:latin(centers.slice(0,160)),
    sourceSolvedP57:{words:solved.length,coreRunes:solvedCenters.length,
      coreIoC:ioc(solvedCenters),coreLatin:latin(solvedCenters)},
    perBody,roundTripOriginalWords:2896,
    noUnshiftedGpEnglishInstruction:true
  };
  console.log(JSON.stringify(summary,null,2));
  if(process.argv.includes("--full"))console.log(JSON.stringify({
    cores:centers,rings:peeled.map((p,i)=>({index:i,sourceStart:unknown[i].start,
      length:p.length,core:p.center,rings:p.rings}))},null,2));
}
if(require.main===module)run();
module.exports={run,words,peel,reconstruct};
