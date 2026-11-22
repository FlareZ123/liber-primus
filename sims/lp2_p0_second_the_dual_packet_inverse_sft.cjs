"use strict";

/**
 * SFT: conditional second THE recovery at p0 offsets235..236.
 *
 * Receiver selection:
 * authenticated 2016 EMPTY / EPIPHANY under the independently calibrated
 * GP0 -> p50 base60 zero-offset grammar yields the exact p0 boundary 236/237.
 *
 * Key-family inputs:
 * the frozen one-based (A,K) selector on the split READ OUT H packet emits
 * [a,p], while the same selector on the independently selected whole READOUT
 * sibling emits [K,A].
 *
 * Charge all elementary field scalars of each pair, both pair orders, and
 * additive +/- directions against every authenticated 2016 native-GP
 * two-rune target. The unique hit is [a,K*A] -> THE.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const runeSet=new Set(corpus.runes);
const parts=transcription.split(/^\s*%\s*$/m);
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const table60=grid.pages.flatMap((p)=>p.bytes);

/** @param {number} page @returns {string} */
function physicalPart(page){assert.notEqual(page,50);return parts[page<=49?page:page-1];}

/** @param {string} word @returns {number[]} */
function gp(word){
  const n=word.toUpperCase().replace(/QU/g,"CW").replace(/K/g,"C").replace(/Q/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<n.length;){
    if(n.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(n.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const token=gpTokens.find((item)=>n.startsWith(item.symbol,i));
    assert.ok(token,"unmapped "+word+":"+i);
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}

/** @param {string} text @returns {Array<{word:number,start:number,end:number,values:number[]}>} */
function parseWords(text){
  const words=[];let current=[];let start=0;let offset=0;
  const flush=()=>{if(!current.length)return;words.push({word:words.length+1,start,end:offset-1,values:current.slice()});current=[];};
  for(const char of [...text]){
    if(runeSet.has(char)){if(!current.length)start=offset;current.push(runeIndex.get(char));offset+=1;}
    else if(char==="-"||char==="."||char==="$"||char==="&"||char==="§")flush();
  }
  flush();return words;
}

/** @param {number} x @returns {number} */
const mod29=(x)=>((x%29)+29)%29;
/** @param {number[]} values @returns {number} */
const gp0=(values)=>values.reduce((sum,value)=>sum+value,0);
/** @param {number} left @param {number} right @returns {[number,number]} */
const H=(left,right)=>[mod29(left-right),mod29(left+right)];
/** @param {number[]} values @returns {number[]} */
function shell(values){
  const out=[];
  for(let left=0,right=values.length-1;left<right;left+=1,right-=1)out.push(...H(values[left],values[right]));
  if(values.length%2===1)out.push(values[Math.floor(values.length/2)]);
  return out;
}
/** @param {number} base @param {number} exponent @returns {number} */
function pow29(base,exponent){
  let result=1,factor=mod29(base),e=exponent;
  while(e>0){if(e&1)result=mod29(result*factor);factor=mod29(factor*factor);e=Math.floor(e/2);}
  return result;
}
/** @param {number} value @returns {number} */
const inv29=(value)=>pow29(value,27);

/**
 * @param {string} xName @param {number} x
 * @param {string} yName @param {number} y
 * @returns {Record<string,number>}
 */
function scalarFamily(xName,x,yName,y){
  return {
    [xName]:x,
    [yName]:y,
    [xName+"+"+yName]:mod29(x+y),
    [xName+"-"+yName]:mod29(x-y),
    [yName+"-"+xName]:mod29(y-x),
    [xName+"*"+yName]:mod29(x*y),
    [xName+"/"+yName]:mod29(x*inv29(y)),
    [yName+"/"+xName]:mod29(y*inv29(x)),
    [xName+"^"+yName]:pow29(x,y),
    [yName+"^"+xName]:pow29(y,x),
  };
}

const p0Words=parseWords(physicalPart(0));
const starts=new Map(p0Words.map((word)=>[word.start,word]));
const ends=new Map(p0Words.map((word)=>[word.end,word]));

// Independently frozen authenticated-2016 receiver boundary.
assert.equal(table60[gp0(gp("EMPTY"))],236);
assert.equal(table60[gp0(gp("EPIPHANY"))],237);
const selected=ends.get(236);
assert.ok(selected);
assert.equal(starts.get(237).word,selected.word+1);
assert.deepEqual(selected,{word:53,start:235,end:236,values:[8,5]});

// Reconstruct both frozen 23-rune H packets and the already validated shared
// one-based (A,K) selector.
const splitWords=p0Words.filter((word)=>word.start>=80&&word.end<=102);
const wholeWords=p0Words.filter((word)=>word.start>=166&&word.end<=188);
assert.equal(splitWords.length,4);
assert.equal(wholeWords.length,5);
const splitPacket=splitWords.flatMap((word)=>shell(word.values));
const wholePacket=wholeWords.flatMap((word)=>shell(word.values));
assert.equal(splitPacket.length,23);
assert.equal(wholePacket.length,23);

const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const splitState=[splitPacket[dh.A-1],splitPacket[dh.K-1]];
const wholeState=[wholePacket[dh.A-1],wholePacket[dh.K-1]];
assert.deepEqual(splitState,[dh.a,dh.p]);
assert.deepEqual(wholeState,[dh.K,dh.A]);

const leftFamily=scalarFamily("a",splitState[0],"p",splitState[1]);
const rightFamily=scalarFamily("K",wholeState[0],"A",wholeState[1]);
assert.equal(Object.keys(leftFamily).length,10);
assert.equal(Object.keys(rightFamily).length,10);

// Freeze every authenticated 2016 word whose canonical native-GP length is2.
const clearStart=signed2016.indexOf("Hello.");
const clearEnd=signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const signedWords=(signed2016.slice(clearStart,clearEnd).match(/[A-Za-z]+/gu)||[]);
const targets=[...new Set(signedWords.map((word)=>word.toUpperCase()).filter((word)=>gp(word).length===2))]
  .map((word)=>({word,values:gp(word)}));
assert.deepEqual(targets,[
  {word:"THE",values:[2,18]},
  {word:"IS",values:[10,15]},
  {word:"BE",values:[17,18]},
]);

const hits=[];
let charged=0;
for(const [leftName,leftValue] of Object.entries(leftFamily)){
  for(const [rightName,rightValue] of Object.entries(rightFamily)){
    for(const order of ["left-right","right-left"]){
      for(const direction of ["subtract","add"]){
        charged+=1;
        const key=order==="left-right"?[leftValue,rightValue]:[rightValue,leftValue];
        const plain=selected.values.map((value,index)=>
          direction==="subtract"?mod29(value-key[index]):mod29(value+key[index])
        );
        const matches=targets.filter((target)=>target.values.every((value,index)=>value===plain[index])).map((target)=>target.word);
        if(matches.length)hits.push({leftName,leftValue,rightName,rightValue,order,direction,key,plain,matches});
      }
    }
  }
}
assert.equal(charged,400);
assert.deepEqual(hits,[{
  leftName:"a",leftValue:6,rightName:"K*A",rightValue:16,
  order:"left-right",direction:"subtract",
  key:[6,16],plain:[2,18],matches:["THE"]
}]);

// Exact forward reconstruction.
assert.deepEqual(hits[0].plain.map((value,index)=>mod29(value+hits[0].key[index])),selected.values);

console.log(JSON.stringify({
  status:"PASS",
  receiver:{empty:236,epiphany:237,selected},
  packetStates:{splitAK:splitState,wholeAK:wholeState},
  family:{leftFamily,rightFamily,authenticatedTargets:targets,charged,hits},
  recovery:{cipher:selected.values,key:hits[0].key,plain:hits[0].plain,text:"THE"},
  classification:"Conditional value-changing recovery of p0 offsets235..236. The receiver is independently fixed by EMPTY/EPIPHANY; the shared dual-READOUT packet selector supplies [a,p] and [K,A]; across 400 elementary field-pair configurations, only [a,K*A] with subtraction yields an authenticated native-GP two-rune word, THE."
},null,2));
