"use strict";
/**
 * Source-derived 32-bit PHP-MT section-key inversion for LP2.
 * Eight vertical grid columns each contribute a 4-byte integer seed at a
 * common 4-row group (0..7), little/big endian. Eight seeds are assigned
 * bijectively to the eight substantial ciphertext sections.
 *
 * The detector sees only ciphertext equality, so any single unknown global
 * permutation of the 29 output runes cancels. Selection is confined to the
 * first 300 runes per section; the section tails are held out.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {inputs,assign}=require("./grid_section_column_keys.cjs");
const {score}=require("./equality_pad_scan.cjs");
const {LegacyPhpMt}=require("./php_legacy_mt.cjs");
const {corpusWords}=require("./relative_key_english_probe.cjs");
const ROOT=path.join(__dirname,".."),MAXTRAIN=300,M=29;
const mod=x=>(x%M+M)%M;

/** @param {number[]} four Four byte values. @param {boolean} little */
function readSeed(four,little) {
  assert.equal(four.length,4);
  const b=little?four:four.slice().reverse();
  return (b[0]|(b[1]<<8)|(b[2]<<16)|(b[3]<<24))>>>0;
}
/** @param {number} n PHP 31-bit mt_rand output. @param {number} mode */
function digit(n,mode) {
  if(mode===0)return Math.floor(29*n/2147483648);
  if(mode===1)return n%29;
  if(mode===2)return 1+Math.floor(28*n/2147483648);
  if(mode===3)return 1+n%28;
  return (n&255)%29;
}
/** @param {number[]} col @param {number} chunk @param {boolean} little */
function seed(col,chunk,little) {
  return readSeed(col.slice(4*chunk,4*chunk+4),little);
}
/**
 * @param {number[][]} columns Eight 32-byte columns.
 * @param {number} chunk Shared 4-row chunk.
 * @param {boolean} little Little-endian key interpretation.
 * @param {number} mode PHP output digit map.
 * @param {number} width Longest section length.
 * @returns {Uint8Array[]}
 */
function keyPads(columns,chunk,little,mode,width) {
  return columns.map(column=>{
    const rng=new LegacyPhpMt(seed(column,chunk,little));
    return Uint8Array.from({length:width},()=>digit(rng.next31(),mode));
  });
}
/** @param {number[][]} ciphertext @param {number[][]} columns */
function search(ciphertext,columns) {
  assert.equal(ciphertext.length,8);
  assert.deepEqual(ciphertext.map(a=>a.length),
    [729,1145,1729,1903,1021,1524,1589,3316]);
  assert.equal(columns.length,8);
  const head=ciphertext.map(group=>group.slice(0,MAXTRAIN));
  const width=Math.max(...ciphertext.map(a=>a.length));
  let best=null,tested=0;
  for(let chunk=0;chunk<8;chunk++)for(const little of [false,true])
    for(let mode=0;mode<5;mode++){
      const pads=keyPads(columns,chunk,little,mode,width);
      for(const sign of [-1,1]){
        const matrix=head.map(group=>pads.map(key=>score([group],[key],sign)));
        const fit=assign(matrix);
        const candidate={chunk,little,mode,sign,training:fit.sum,
          assignment:fit.assignment,trainPairs:head.reduce((s,g)=>
            s+Array.from({length:15},(_,j)=>Math.max(0,g.length-j-2)).reduce((a,b)=>a+b,0),0)};
        tested++;
        if(!best||candidate.training>best.training)best=candidate;
      }
    }
  assert(best);
  const pads=keyPads(columns,best.chunk,best.little,best.mode,width);
  let heldout=0,heldoutPairs=0;
  for(let section=0;section<8;section++){
    const text=ciphertext[section].slice(MAXTRAIN);
    const key=pads[best.assignment[section]].subarray(MAXTRAIN);
    heldout+=score([text],[key],best.sign);
    for(let lag=2;lag<=16;lag++)heldoutPairs+=Math.max(0,text.length-lag);
  }
  return {...best,heldout,heldoutPairs,tested,
    trainingPerPair:best.training/best.trainPairs,
    heldoutPerPair:heldout/heldoutPairs};
}
/** @param {number} initial */
function random(initial) {
  let x=initial>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
}
/** @param {number[][]} columns @param {()=>number} rng */
function shuffle(columns,rng) {
  return columns.map(column=>{
    const out=column.slice();
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  });
}
/**
 * Artificial positive with the actual manuscript grid as eight independently
 * seeded MT streams, a hidden 29-rune permutation and realistic anti-doublet
 * rewrites. True settings were chosen before looking at ciphertext scores.
 * @param {number[][]} columns
 * @param {number[]} lengths
 */
function plant(columns,lengths){
  const heldout=fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8").slice(240000);
  const pt=corpusWords(heldout).flat().slice(0,lengths.reduce((s,n)=>s+n,0));
  assert.equal(pt.length,12956);
  const target={chunk:3,little:true,mode:1,sign:1,assignment:[6,2,4,0,1,7,5,3]};
  const rng=random(0x39011367),sigma=Array.from({length:29},(_,i)=>i);
  for(let i=sigma.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
  const pads=keyPads(columns,target.chunk,target.little,target.mode,Math.max(...lengths));
  let offset=0,rewrites=0;
  const groups=lengths.map((n,s)=>{
    const out=[];
    for(let i=0;i<n;i++){
      const p=pt[offset++],k=pads[target.assignment[s]][i];
      let c=sigma[mod(p+target.sign*k)];
      if(i>0&&c===out[i-1]&&rng()<.81){c=mod(c+1+Math.floor(28*rng()));rewrites++;}
      out.push(c);
    }
    return out;
  });
  const winner=search(groups,columns);
  return {target,rewrites,winning:{chunk:winner.chunk,little:winner.little,
    mode:winner.mode,sign:winner.sign,assignment:winner.assignment,
    trainingPerPair:winner.trainingPerPair,heldoutPerPair:winner.heldoutPerPair},
    recoveredExact:target.chunk===winner.chunk&&target.little===winner.little&&
      target.mode===winner.mode&&target.sign===winner.sign&&
      winner.assignment.every((x,i)=>x===target.assignment[i])};
}
/** @param {number} trials */
function run(trials=20) {
  assert(Number.isInteger(trials)&&trials>=0&&trials<=1000);
  const {groups,columnKeys}=inputs();
  const data=Buffer.from(columnKeys[0].map((_,r)=>columnKeys.map(col=>col[r])).flat());
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const real=search(groups,columnKeys),positive=plant(columnKeys,groups.map(g=>g.length));
  assert(positive.recoveredExact,"Positive must recover the exact eight seeds and assignment");
  const rng=random(0x38092ad5),controls=[];
  for(let n=0;n<trials;n++){
    const selected=search(groups,shuffle(columnKeys,rng));
    controls.push({training:selected.training,heldout:selected.heldout});
  }
  const trainingOutrank=controls.filter(x=>x.training>=real.training).length;
  const holdoutOutrank=controls.filter(x=>x.heldout>=real.heldout).length;
  return {source:{runes:12956,groups:8,gridSha256:crypto.createHash("sha256").update(data).digest("hex")},
    hypothesis:"Eight PHP 5.x mt_rand 32-bit seeds from same 4-byte row group of eight vertical base60 columns; one column per cipher section; arbitrary outer alphabet",
    settings:{chunks:8,endian:2,reducers:5,signs:2,assignments:"exact 8! optimization",fit:"first 300 runes of each section",heldout:"all remaining runes"},
    real,positive,control:{trials,trainingOutrank,holdoutOutrank,
      trainP:(trainingOutrank+1)/(trials+1),heldoutP:(holdoutOutrank+1)/(trials+1),
      trainingMean:controls.reduce((s,x)=>s+x.training,0)/Math.max(1,trials),
      heldoutMean:controls.reduce((s,x)=>s+x.heldout,0)/Math.max(1,trials)}};
}
if(require.main===module){
  const result=run(Number(process.argv[2]??20));
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
}
module.exports={readSeed,digit,keyPads,search,plant,run};
