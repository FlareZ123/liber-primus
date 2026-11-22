"use strict";
/**
 * Source-original 729 GP29 runes, arranged as 27x27 with 13 concentric
 * circumferences. Any arbitrary per-ring secret 29-symbol bijection,
 * including a red-rubric-selected Vigenere shift, and any reorder inside
 * each ring preserves every same-symbol pair count in its ring.
 * Independent natural-English Gibran GP29 controls under both customary
 * TH/NG and all-seven-digraph spellings. Positive ring cipher plants.
 * Read-only Node22 CommonJS Windows SFT. No network, no writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const json = (p) => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=json("resources/liber-primus/lp2-corpus.json");
const annotation=json("resources/liber-primus/lp2-ink-annotations.json");
const english=fs.readFileSync(path.join(root,"resources","control","gibran_prophet_58585.txt"),"utf8");
const original=corpus.pages.slice(0,3).flatMap(p=>p.indices);
assert.equal(original.length,729);
assert.equal(annotation.pages[0].red_spans[0].length,13);
const tokens=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
const lookup=new Map(tokens.map((name,i)=>[name,i]));
assert.equal(lookup.size,29);
const rings=Array.from({length:14},()=>[]);
for(let i=0;i<729;i++){const row=Math.floor(i/27),col=i%27;const k=Math.min(row,col,26-row,26-col);rings[k].push(i);}
assert.deepEqual(rings.map(x=>x.length),[104,96,88,80,72,64,56,48,40,32,24,16,8,1]);
const pairs=rings.reduce((sum,r)=>sum+r.length*(r.length-1)/2,0);
assert.equal(pairs,25844);

/** @param {number[]} seq @returns {{pairs:number,scaledIoC:number}} */
function collision(seq){
 assert.equal(seq.length,729);
 let hit=0;
 for(const ring of rings){const count=new Uint16Array(29);for(const i of ring)count[seq[i]]++;for(const c of count)hit+=c*(c-1)/2;}
 return {pairs:hit,scaledIoC:29*hit/pairs};
}

/**
 * @param {string} text
 * @param {boolean} allSevenDigraphs
 * @returns {number[]}
 */
function encode(text,allSevenDigraphs){
 const input=text.toUpperCase().replace(/K/g,"C").replace(/Q/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
 const output=[];
 for(let i=0;i<input.length;){
  const ch=input[i];if(ch<"A"||ch>"Z"){i++;continue;}
  const two=input.slice(i,i+2);
  const usePair=(two==="TH"||two==="NG"||(allSevenDigraphs&&["EO","OE","AE","IA","EA"].includes(two)))&&lookup.has(two);
  const token=usePair?two:ch;
  const idx=lookup.get(token);
  if(idx!==undefined)output.push(idx);
  i+=usePair?2:1;
 }
 return output;
}

/** @param {number} seed @returns {()=>number} */
function rng(seed){let x=seed|0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
/** @param {number[]} source @returns {number[]} */
function plant(source){
 const random=rng(0x4ef13a29);
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const out=source.slice();
 for(const ring of rings){const substitution=shuffle(Array.from({length:29},(_,i)=>i));const vals=shuffle(ring.map(i=>source[i]));ring.forEach((i,j)=>out[i]=substitution[vals[j]]);}
 return out;
}
const observed=collision(original);
assert.equal(observed.pairs,859);
assert.equal(observed.scaledIoC,0.9638987772790589);
const controls=[];
for(const allSevenDigraphs of [true,false]){
 const clear=encode(english,allSevenDigraphs);
 let windows=0,lo=Infinity,hi=-Infinity,below=0,sum=0;
 for(let offset=0;offset+729<=clear.length;offset++){
  const s=collision(clear.slice(offset,offset+729)).scaledIoC;
  lo=Math.min(lo,s);hi=Math.max(hi,s);sum+=s;below+=Number(s<=observed.scaledIoC);windows++;
 }
 const a=collision(clear.slice(0,729)),b=collision(plant(clear.slice(0,729)));
 assert.deepEqual(a,b);
 assert.ok(a.scaledIoC>1.4);
 assert.equal(below,0);
 controls.push({allSevenDigraphs,codedRunes:clear.length,windows,min:lo,max:hi,mean:sum/windows,atOrBelowOriginal:below,plantedPlainAndCipherInvariant:a});
}
console.log(JSON.stringify({source:"original LP2 pp0-2 729-runic 27x27",clue:"13 red heading runes and 13 full perimeter rings + center",ringLengths:rings.map(r=>r.length),original:observed,controls},null,2));
console.log("PASS: 13-ring secret-permutation/reorder positive; original below all native GP controls");