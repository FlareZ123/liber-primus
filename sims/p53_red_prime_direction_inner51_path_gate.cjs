"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const p57=corpus.pages[57].indices;
assert.equal(p57.length,95);
const inner=[];
for(let row=1;row<=3;row++)for(let col=1;col<=17;col++)inner.push(p57[row*19+col]);
assert.equal(inner.length,51);
const page53=corpus.pages[53].indices;
const redSpan=annotations.pages.find(p=>p.page===53).red_spans.find(s=>s.start===128&&s.length===51).runes;
const red=[...redSpan].map(r=>corpus.runes.indexOf(r));
assert.equal(red.length,51);
assert.deepEqual(red,page53.slice(128,179));
const primeWeights=red.map(i=>corpus.prime[i]);
const runeOrdinals=red.map(i=>i+1);
const mod=(n,m)=>((n%m)+m)%m;
const dirs=[[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]]; // N, NE, E, SE, S, SW, W, NW
function absoluteWalk(residues,rotation,handedness){
 let row=1,col=8;
 const visited=new Set(["1,8"]),path=[[row,col]];
 let failure=null;
 for(let i=0;i<50;i++){
  const d=dirs[mod(rotation+handedness*residues[i],8)];
  row+=d[0];col+=d[1];
  if(row<0||row>=3||col<0||col>=17){failure={step:i+1,kind:"exit",at:[row,col]};break;}
  const key=row+","+col;
  if(visited.has(key)){failure={step:i+1,kind:"revisit",at:[row,col]};break;}
  visited.add(key);path.push([row,col]);
 }
 let finalExit=null;
 if(!failure){
  const d=dirs[mod(rotation+handedness*residues[50],8)];
  finalExit=[row+d[0],col+d[1]];
  if(finalExit[0]>=0&&finalExit[0]<3&&finalExit[1]>=0&&finalExit[1]<17)
   failure={step:51,kind:"did-not-exit",at:finalExit};
 }
 return {rotation,handedness,visited:visited.size,failure,finalExit,path,success:!failure&&visited.size===51};
}
function relativeWalk(residues,turnSign,initialHeading=2){
 let row=1,col=8,heading=initialHeading;
 const visited=new Set(["1,8"]),path=[[row,col]];
 let failure=null;
 for(let i=0;i<50;i++){
  heading=mod(heading+turnSign*residues[i],8);
  const d=dirs[heading];row+=d[0];col+=d[1];
  if(row<0||row>=3||col<0||col>=17){failure={step:i+1,kind:"exit",at:[row,col],heading};break;}
  const key=row+","+col;
  if(visited.has(key)){failure={step:i+1,kind:"revisit",at:[row,col],heading};break;}
  visited.add(key);path.push([row,col]);
 }
 return {turnSign,initialHeading,visited:visited.size,failure,path,success:!failure&&visited.size===51};
}
const primeMod8=primeWeights.map(x=>x%8);
const ordinalMod8=runeOrdinals.map(x=>x%8);
const absolutePrime=[];
const absoluteOrdinal=[];
for(const handedness of [1,-1])for(let rotation=0;rotation<8;rotation++){
 absolutePrime.push(absoluteWalk(primeMod8,rotation,handedness));
 absoluteOrdinal.push(absoluteWalk(ordinalMod8,rotation,handedness));
}
const relativePrime=[relativeWalk(primeMod8,1),relativeWalk(primeMod8,-1)];
const relativeOrdinal=[relativeWalk(ordinalMod8,1),relativeWalk(ordinalMod8,-1)];
assert.equal(absolutePrime.filter(x=>x.success).length,0);
assert.equal(absoluteOrdinal.filter(x=>x.success).length,0);
assert.equal(relativePrime.filter(x=>x.success).length,0);
assert.equal(relativeOrdinal.filter(x=>x.success).length,0);
assert.equal(Math.max(...absolutePrime.map(x=>x.visited)),5);
assert.equal(Math.max(...absoluteOrdinal.map(x=>x.visited)),8);
assert.deepEqual(relativePrime.map(x=>x.visited),[4,4]);
assert.deepEqual(relativeOrdinal.map(x=>x.visited),[7,7]);
const translit=indices=>indices.map(i=>corpus.translit[i]).join("");
const result={
  sourceStructure:{
    p57RuneCount:p57.length,
    p57Inner51:translit(inner),
    p53RedSpanStart:128,
    p53RedSpanLength:red.length,
    p53RedSpanMatchesCorpus:JSON.stringify(red)===JSON.stringify(page53.slice(128,179))
  },
  directionValues:{
    primeWeights,
    primeWeightsMod8:primeMod8,
    primeWeightResidueCounts:Array.from({length:8},(_,r)=>primeMod8.filter(x=>x===r).length),
    runeOrdinals,
    runeOrdinalsMod8:ordinalMod8,
    ordinalResidueCounts:Array.from({length:8},(_,r)=>ordinalMod8.filter(x=>x===r).length)
  },
  absoluteCompass:{
    start:[1,8],
    mappingsTested:16,
    primeWeightSuccesses:0,
    primeWeightMaxVisited:Math.max(...absolutePrime.map(x=>x.visited)),
    primeWeightFailures:absolutePrime.map(({rotation,handedness,visited,failure})=>({rotation,handedness,visited,failure})),
    runeOrdinalSuccesses:0,
    runeOrdinalMaxVisited:Math.max(...absoluteOrdinal.map(x=>x.visited)),
    runeOrdinalFailures:absoluteOrdinal.map(({rotation,handedness,visited,failure})=>({rotation,handedness,visited,failure}))
  },
  relativeTurnControl:{
    initialHeading:"east (the p15 red-arrow direction)",
    primeWeight:relativePrime,
    runeOrdinal:relativeOrdinal
  },
  decision:"No mod-8 absolute compass mapping or east-seeded relative-turn mapping traverses the p57 3x17 inner51. This does not reject the 5x19 structural correspondence; it rejects this direct path interpretation."
};
process.stdout.write(JSON.stringify(result,null,2)+"\n");
