"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative){ return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g,""); }
/** @param {number} value @returns {number} */
function mod29(value){ return ((value%29)+29)%29; }
/** @param {[number,number]} pair @returns {[number,number]} */
function H(pair){ const [x,y]=pair; return [mod29(x-y),mod29(x+y)]; }
/** @param {[number,number]} pair @returns {[number,number]} */
function Hinv(pair){ const [u,v]=pair; return [mod29((u+v)*15),mod29((v-u)*15)]; }
/** @param {number} count @returns {number[]} */
function firstPrimes(count){
  const out=[];
  for(let n=2;out.length<count;n+=1){
    let prime=true;
    for(let d=2;d*d<=n;d+=1){ if(n%d===0){ prime=false; break; } }
    if(prime)out.push(n);
  }
  return out;
}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts=transcription.split(/^\s*%\s*$/m);
const primes=firstPrimes(130);
const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {number} page @returns {string} */
function physicalPart(page){ assert.notEqual(page,50); return parts[page<=49?page:page-1]; }
/** @param {string} text @returns {number[][]} */
function runeWords(text){
  const normalized=text.replace(/\/\s*/gu,"");
  return (normalized.match(/[\u16A0-\u16FF]+/gu)||[]).map((word)=>
    [...word].map((rune)=>{
      const value=runeIndex.get(rune);
      assert.notEqual(value,undefined);
      return value;
    })
  );
}
/** @param {number} page @returns {{values:number[],start:number,end:number,length:number}[]} */
function wordRows(page){
  let offset=0;
  return runeWords(physicalPart(page)).map((values)=>{
    const row={values,start:offset,end:offset+values.length,length:values.length};
    offset=row.end;
    return row;
  });
}
/** @param {{start:number,end:number,length:number}[]} rows @param {number} start @param {number} end */
function rowsInSpan(rows,start,end){ return rows.filter((row)=>row.start>=start&&row.end<=end); }
/** @param {number} n @returns {number} */
function T(n){ assert.ok(n>=1); return mod29(primes[n-1]-1); }
/** @param {number[]} values @returns {string} */
function spell(values){ return values.map((v)=>corpus.translit[v]).join(""); }
/** @param {string} word @returns {number[]} */
function gp(word){
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/[KQ]/g,"C")
    .replace(/V/g,"U")
    .replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  const out=[];
  for(let offset=0;offset<normalized.length;){
    if(normalized.startsWith("ING",offset)){ out.push(21); offset+=3; continue; }
    if(normalized.startsWith("IO",offset)){ out.push(27); offset+=2; continue; }
    const token=gpTokens.find(({symbol})=>normalized.startsWith(symbol,offset));
    assert.ok(token,"unmapped GP spelling "+normalized.slice(offset));
    out.push(token.value);
    offset+=token.symbol.length;
  }
  return out;
}
/** @param {number[]} values @returns {string} */
function key(values){ return values.join(","); }

const clear=signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");
const sourceWords=clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token)=>/^[A-Za-z]+$/u.test(token))
  .map((word)=>word.toUpperCase());

const p56Words="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" ");
const p57Words="PARABLE LICE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE".split(" ");
const registerWords=[...new Set([...sourceWords,...p56Words,...p57Words])];

const register=new Map();
for(const word of registerWords){
  const values=gp(word);
  if(values.length!==4)continue;
  const k=key(values);
  if(!register.has(k))register.set(k,[]);
  register.get(k).push(word);
}

const spans=[];
for(const page of ink.pages){
  if(page.page===50)continue;
  const rows=wordRows(page.page);
  for(const span of page.red_spans||[]){
    const selected=rowsInSpan(rows,span.start,span.start+span.length);
    const exact=selected.length===2 &&
      selected[0].start===span.start &&
      selected[1].end===span.start+span.length;
    if(!exact)continue;
    spans.push({
      page:page.page,
      start:span.start,
      lengths:selected.map((word)=>word.length),
    });
  }
}
assert.equal(spans.length,8);

const rows=[];
for(const span of spans){
  for(const mode of ["H","Hinv"]){
    const transformed=mode==="H"?H(span.lengths):Hinv(span.lengths);
    const valid=transformed.every((value)=>value>0);
    const extended=[...span.lengths,...transformed];
    const output=valid?extended.map(T):null;
    const hits=output?(register.get(key(output))||[]):[];
    rows.push({
      page:span.page,
      start:span.start,
      lengths:span.lengths,
      mode,
      transformed,
      valid,
      output,
      translit:output?spell(output):null,
      registerHits:hits,
    });
  }
}

const exactHits=rows.filter((row)=>row.registerHits.length>0);
const knownTheir=rows.find((row)=>row.page===33&&row.start===0&&row.mode==="Hinv");
const knownRise=rows.find((row)=>row.page===33&&row.start===91&&row.mode==="H");
assert.ok(knownTheir&&knownTheir.registerHits.includes("THEIR"));
assert.ok(knownRise&&knownRise.translit==="RISE");

console.log(JSON.stringify({
  status:"PASS",
  precommittedFamily:{
    spans:spans.length,
    chargedOrientations:rows.length,
    fourRuneRegisterEntries:register.size,
    sourceWords:sourceWords.length,
    registerWords:registerWords.length,
  },
  allOutputs:rows,
  exactRegisterHits:exactHits,
  additionalHits:exactHits.filter((row)=>
    !(row.page===33&&row.start===0&&row.mode==="Hinv") &&
    !(row.page===33&&row.start===91&&row.mode==="H")
  ),
},null,2));
