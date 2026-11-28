#!/usr/bin/env node
"use strict";

/**
 * P47 visible local group47 line-wrap DH-state reconstruction.
 * The selected group is page-local ordinal47, globally complete-word46.
 * No plaintext is claimed.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8").replace(/\r/g,"");
const raw=read("resources/liber-primus/lp2-transcription.txt");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod29=(n)=>((n%29)+29)%29;

function H(values){
  const m=Math.floor(values.length/2),out=[];
  for(let i=0;i<m;i+=1)out.push(mod29(values[i]-values[values.length-1-i]));
  if(values.length%2)out.push(values[m]);
  for(let i=m-1;i>=0;i-=1)out.push(mod29(values[i]+values[values.length-1-i]));
  return out;
}
function modPow(base,exp,mod){
  let r=1n,b=BigInt(base),e=BigInt(exp),m=BigInt(mod);
  while(e>0n){if(e&1n)r=(r*b)%m;b=(b*b)%m;e>>=1n;}
  return Number(r);
}

// Visible page-local groups: slash/whitespace preserve words; punctuation terminates.
// This is the source-visible ordinal domain used by literal token 47.
function pageLocalGroups(physicalPage){
  if(physicalPage===50)return [];
  const block=raw.split("%")[physicalPage<=49?physicalPage:physicalPage-1]||"";
  let offset=0,line=1;
  const lineByOffset=new Map();
  for(const ch of block){
    if(runeIndex.has(ch)){lineByOffset.set(offset,line);offset+=1;}
    else if(ch==="/")line+=1;
  }
  const groups=[];let current=[];let start=null;
  const finish=()=>{
    if(!current.length)return;
    groups.push({
      start,
      values:current.slice(),
      lines:current.map((_,i)=>lineByOffset.get(start+i)),
    });
    current=[];start=null;
  };
  offset=0;
  for(const ch of block){
    if(runeIndex.has(ch)){
      if(!current.length)start=offset;
      current.push(runeIndex.get(ch));
      offset+=1;
    }else if(ch==="/"||/\s/u.test(ch)){
      // printed line wrapping preserves the current group
    }else{
      finish();
    }
  }
  finish();
  return groups;
}

const local47=pageLocalGroups(47);
assert.equal(local47.length,59);
const selected=local47[46];
const localZeroBasedRival=local47[47];
assert.equal(selected.start,206);
assert.deepEqual(selected.values,[19,1,10,27,11,3]);
assert.deepEqual(selected.lines,[9,10,10,10,10,10]);
assert.deepEqual(localZeroBasedRival.values,[15,12,25,12,21,4]);

const uniqueLines=[...new Set(selected.lines)];
assert.deepEqual(uniqueLines,[9,10]);
const left=selected.values.filter((_,i)=>selected.lines[i]===9);
const right=selected.values.filter((_,i)=>selected.lines[i]===10);
assert.deepEqual(left,[19]);
assert.deepEqual(right,[1,10,27,11,3]);

const direct={
  a:selected.values.length,
  g:right.length,
  B:left[0],
  p:right.reduce((a,b)=>a+b,0)%29,
};
assert.deepEqual(direct,{a:6,g:5,B:19,p:23});

const bSolutions=[];
for(let x=1;x<direct.p;x+=1)if(modPow(direct.g,x,direct.p)===direct.B)bSolutions.push(x);
assert.deepEqual(bSolutions,[15]);
const b=bSolutions[0];
const A=modPow(direct.g,direct.a,direct.p);
const K=modPow(direct.B,direct.a,direct.p);
const eSolutions=[];
for(let x=1;x<direct.p-1;x+=1)if((b*x)%(direct.p-1)===1)eSolutions.push(x);
assert.deepEqual(eSolutions,[3]);
const e=eSolutions[0],q=e+1;
assert.equal(A,8);
assert.equal(K,2);
assert.equal(modPow(A,b,direct.p),K);
assert.deepEqual({p:direct.p,g:direct.g,a:direct.a,b,A,B:direct.B,K,e,q},
  {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4});

// Untouched scalar/H checks on the selected object.
const gp0=selected.values.reduce((a,b)=>a+b,0);
const prime=selected.values.reduce((a,b)=>a+corpus.prime[b],0);
const h6=H(selected.values);
assert.equal(gp0,71);
assert.equal(prime,256);
assert.deepEqual(h6,[16,19,12,8,12,22]);

// Canonical cross-page complete-word parser for the manuscript-wide controls.
const segments=raw.split("%").slice(0,55);
const stream=segments.join("%");
const allWords=[];let current=[];let runePage=0;let line=1;let offset=0;
const finish=()=>{if(current.length){allWords.push(current);current=[];}};
for(const ch of stream){
  if(runeIndex.has(ch)){
    current.push({page:runePage,line,offset,value:runeIndex.get(ch)});
    offset+=1;
  }else if(ch==="%"){
    runePage+=1;line=1;offset=0;
  }else if(ch==="/"){
    line+=1;
  }else if(/\s/u.test(ch)){
    // word continues
  }else{
    finish();
  }
}
finish();
const physical=(p)=>p>=50?p+1:p;
const complete=allWords
  .filter((w)=>w.every((site)=>site.page===w[0].page))
  .map((w)=>({page:physical(w[0].page),sites:w}));

assert.equal(complete.length,2864);
const p47Complete=complete.filter((w)=>w.page===47);
assert.equal(p47Complete.length,57);
const targetComplete=p47Complete.find((w)=>w.sites[0].offset===206);
assert.ok(targetComplete);
assert.equal(p47Complete.indexOf(targetComplete)+1,46);

const metricHits=[];
const hHits=[];
const crossing=[];
let completeSix=0;
for(const w of complete){
  const values=w.sites.map((s)=>s.value);
  const sum=values.reduce((a,b)=>a+b,0);
  const ps=values.reduce((a,b)=>a+corpus.prime[b],0);
  if(values.length===6){
    completeSix+=1;
    if(H(values).join(",")===h6.join(",")){
      hHits.push({page:w.page,start:w.sites[0].offset});
    }
  }
  if(values.length===6&&sum===71&&ps===256){
    metricHits.push({page:w.page,start:w.sites[0].offset});
  }
  const lines=[...new Set(w.sites.map((s)=>s.line))];
  if(lines.length===2)crossing.push(w);
}
assert.equal(completeSix,251);
assert.deepEqual(metricHits,[{page:47,start:206}]);
assert.deepEqual(hHits,[{page:47,start:206}]);
assert.equal(crossing.length,388);

const crossingSix=crossing.filter((w)=>w.sites.length===6);
assert.equal(crossingSix.length,58);
const descriptorHits=[];
for(const w of crossingSix){
  const lines=[...new Set(w.sites.map((s)=>s.line))];
  const l=w.sites.filter((s)=>s.line===lines[0]).map((s)=>s.value);
  const r=w.sites.filter((s)=>s.line===lines[1]).map((s)=>s.value);
  if(l.length===1&&r.length===5&&l.reduce((a,b)=>a+b,0)%29===19&&r.reduce((a,b)=>a+b,0)%29===23){
    descriptorHits.push({page:w.page,start:w.sites[0].offset,left:l,right:r});
  }
}
assert.deepEqual(descriptorHits,[{
  page:47,start:206,left:[19],right:[1,10,27,11,3]
}]);

// Held-out destination selected by the derived modulus p=23.
// Reuse the printed-line grammar from the established p23 reconciliation.
const parts=raw.split(/^\s*%\s*$/m);
function physicalPart(page){
  assert.notEqual(page,50);
  return parts[page<=49?page:page-1]||"";
}
function printedLineLengths(page){
  return physicalPart(page)
    .split(/\n/u)
    .filter((line)=>/[\u16A0-\u16FF]/u.test(line))
    .map((line)=>(line.match(/[\u16A0-\u16FF]+/gu)||[]).map((word)=>[...word].length));
}
const predictedP23Line=[K,direct.a,e,direct.g,q];
assert.deepEqual(predictedP23Line,[2,6,3,5,4]);
assert.deepEqual(printedLineLengths(direct.p)[0],predictedP23Line);

const unknownFiveWordLines=[];
const fullFiveWordLines=[];
for(let page=0;page<=57;page+=1){
  if(page===50)continue;
  for(let line=0;line<printedLineLengths(page).length;line+=1){
    const lens=printedLineLengths(page)[line];
    if(lens.length===5){
      const row={page,line,lens};
      fullFiveWordLines.push(row);
      if(page<=55)unknownFiveWordLines.push(row);
    }
  }
}
assert.equal(unknownFiveWordLines.length,186);
assert.equal(fullFiveWordLines.length,188);
assert.deepEqual(
  unknownFiveWordLines.filter((row)=>row.lens.join(",")===predictedP23Line.join(",")),
  [{page:23,line:0,lens:[2,6,3,5,4]}]
);
assert.deepEqual(
  fullFiveWordLines.filter((row)=>row.lens.join(",")===predictedP23Line.join(",")),
  [{page:23,line:0,lens:[2,6,3,5,4]}]
);

const output={
  classification:"source-selected visible line-wrap DH-state reconstruction; no plaintext",
  selection:{
    physicalPage:47,
    pageLocalGroupOneBased:47,
    localGroupCount:59,
    completeWordOneBased:46,
    completeWordCountOnPage:57,
    start:206,
    values:selected.values,
    lineSplit:[left,right],
  },
  direct,
  reconstructed:{p:23,g:5,a:6,b,A,B:19,K,e,q},
  confirmations:{gp0,prime,h6},
  p23Holdout:{predictedLine:predictedP23Line,unknownFiveWordLineCount:unknownFiveWordLines.length,fullFiveWordLineCount:fullFiveWordLines.length,uniqueHit:{page:23,line:0}},
  controls:{
    completeWords:complete.length,
    completeSix,
    metricHits,
    hHits,
    lineCrossingCompleteWords:crossing.length,
    lineCrossingSix:crossingSix.length,
    descriptorHits,
  },
  decision:"The visible 1|5 line wrap of p47 local group47 reconstructs the full DH state and prospectively selects p23, whose first printed five-word line uniquely equals [K,a,e,g,q]. No unknown plaintext is promoted.",
};
const json=JSON.stringify(output,null,2);
console.log(json);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),"source-test-output.json"),json+"\n");
