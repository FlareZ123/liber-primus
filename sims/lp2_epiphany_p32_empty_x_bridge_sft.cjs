"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

/** @param {string} relative @returns {string} */
function read(relative){
  return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");
}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/lp2-transcription.txt");
const signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const pages=transcription.split("%");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));

/**
 * Parse page-local source fragments. Slash/newline are printed line wraps.
 * Other non-runes terminate a source word/fragment.
 * @param {string} page
 * @returns {{count:number,fragments:Array<{start:number,len:number,runes:string[],text:string}>}}
 */
function parsePage(page){
  const fragments=[];
  let current=[];
  let start=0;
  let count=0;
  function finish(){
    if(!current.length)return;
    fragments.push({
      start,
      len:current.length,
      runes:current,
      text:current.map((r)=>corpus.translit[runeIndex.get(r)]).join("")
    });
    current=[];
  }
  for(const ch of page){
    if(runeIndex.has(ch)){
      if(!current.length)start=count;
      current.push(ch);
      count++;
    }else if(ch==="/" || /\s/u.test(ch)){
      continue;
    }else{
      finish();
    }
  }
  finish();
  return {count,fragments};
}

/** @param {string} page @returns {boolean} */
function endsWithWordBoundary(page){
  for(let i=page.length-1;i>=0;i--){
    const ch=page[i];
    if(ch==="/" || /\s/u.test(ch))continue;
    if(runeIndex.has(ch))return false;
    return true;
  }
  return true;
}

const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((left,right)=>right.symbol.length-left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word){
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW")
    .replace(/V/g,"U")
    .replace(/[KQ]/g,"C")
    .replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  let offset=0;
  let sum=0;
  while(offset<normalized.length){
    if(normalized.startsWith("ING",offset)){sum+=21;offset+=3;continue;}
    if(normalized.startsWith("IO",offset)){sum+=27;offset+=2;continue;}
    const token=gpTokens.find((item)=>normalized.startsWith(item.symbol,offset));
    assert.ok(token,"unmapped GP word "+word+" at "+offset);
    sum+=token.value;
    offset+=token.symbol.length;
  }
  return sum;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powMod(base,exponent,modulus){
  let value=1;
  for(let i=0;i<exponent;i++)value=value*base%modulus;
  return value;
}

/** @param {number} value @param {number} modulus @returns {number} */
function multiplicativeOrder(value,modulus){
  let state=1;
  for(let n=1;n<modulus;n++){
    state=state*value%modulus;
    if(state===1)return n;
  }
  throw new Error("no multiplicative order");
}

const tokens=grid.pages.flatMap((page)=>page.tokens);
const alphabet60=grid.alphabet;

/** @param {string} token @returns {number} */
function decode60(token){
  const high=alphabet60.indexOf(token[0]);
  const low=alphabet60.indexOf(token[1]);
  assert.ok(high>=0 && low>=0);
  return high*60+low;
}
const table60=tokens.map(decode60);

/** @param {number} start @param {number} steps @returns {number[]} */
function walk(start,steps){
  const route=[start];
  let state=start;
  for(let i=0;i<steps;i++){
    assert.ok(state>=0 && state<256);
    state=table60[state];
    route.push(state);
  }
  return route;
}

// Independently frozen upstream route from the authenticated 2016 clause.
const route=walk(gp0("SEEKS"),23);
assert.deepEqual(route,[
  71,108,14,183,81,58,146,92,236,238,129,179,
  175,18,15,212,70,169,228,144,125,20,102,32
]);
assert.equal(gp0("EPIPHANY"),121);
assert.equal(gp0("EMPTY"),92);
assert.equal(gp0("THE"),20);
assert.equal(gp0("DEVOTED"),102);

const clear=signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const signedWords=(clear[1].match(/\b[A-Za-z]+\b/gu)||[])
  .map((word)=>({word:word.toUpperCase(),gp0:gp0(word)}));
const routeWordHits=[];
for(let step=0;step<route.length-1;step++){
  const names=[...new Set(signedWords
    .filter((row)=>row.gp0===route[step])
    .map((row)=>row.word))];
  if(names.length)routeWordHits.push({step,state:route[step],words:names});
}
assert.deepEqual(routeWordHits,[
  {step:0,state:71,words:["SEEKS"]},
  {step:7,state:92,words:["EMPTY"]},
  {step:21,state:20,words:["THE"]},
  {step:22,state:102,words:["DEVOTED"]}
]);

// Frozen p28 Diffie-Hellman tuple.
const dh={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
assert.equal(powMod(dh.g,dh.a,dh.p),dh.A);
assert.equal(powMod(dh.g,dh.b,dh.p),dh.B);
assert.equal(powMod(dh.B,dh.a,dh.p),dh.K);
assert.equal(multiplicativeOrder(dh.g,dh.p),22);

// Correct source boundary model: p32 begins with a one-rune incoming carry.
const p32=parsePage(pages[32]);
const p32IncomingCarry=!endsWithWordBoundary(pages[31]);
assert.equal(p32IncomingCarry,true);
assert.equal(p32.count,121);
assert.equal(p32.fragments.length,22);
assert.equal(p32.fragments.length-1,21);
assert.equal(corpus.pages[32].indices.length,121);

// This exact page-local segmentation is unique among the 55 unsolved raw pages.
const pageShape=[];
for(let page=0;page<=55;page++){
  const parsed=parsePage(pages[page]);
  if(parsed.count===0)continue;
  const incoming=page>0 && !endsWithWordBoundary(pages[page-1]);
  pageShape.push({
    page,
    fragments:parsed.fragments.length,
    incoming,
    completeStarts:parsed.fragments.length-(incoming?1:0)
  });
}
assert.deepEqual(pageShape.filter((row)=>row.fragments===22),[
  {page:32,fragments:22,incoming:true,completeStarts:21}
]);
assert.deepEqual(pageShape.filter((row)=>row.completeStarts===21),[
  {page:32,fragments:22,incoming:true,completeStarts:21}
]);

// Route steps 0..21 span exactly the 22 local fragments: incoming carry,
// then 21 complete p32 word starts. DEVOTED@22 is the first post-map boundary.
assert.equal(route[23],32);
assert.equal(route[22],gp0("DEVOTED"));
assert.equal(route[21],gp0("THE"));
assert.equal(p32.fragments[21].text,"AGBEO");
assert.equal(p32.fragments[21].start,117);
assert.equal(p32.fragments[21].start+p32.fragments[21].len,121);

const emptyStep=7;
assert.equal(route[emptyStep],gp0("EMPTY"));
assert.equal(emptyStep,dh.g+dh.K);
const selected=p32.fragments[emptyStep];
assert.deepEqual(
  {start:selected.start,len:selected.len,text:selected.text},
  {start:33,len:11,text:"HOMEXWDSLFD"}
);
// Because fragment0 is the incoming carry, fragment7 is the seventh complete
// word start on p32 and the first word after the source-visible period at 32.
assert.equal(p32.fragments.slice(1,emptyStep+1).length,7);

// q is independently recoverable from the authenticated EMPTY state and p.
const q=gp0("EMPTY")/dh.p;
assert.equal(Number.isInteger(q),true);
assert.equal(q,4);
// Descriptive DH equalities, useful as cross-checks rather than extra degrees of freedom.
assert.equal(q,dh.a-dh.K);
assert.equal(q,dh.p-dh.B);
assert.equal(q,dh.B-dh.b);
assert.equal(q,dh.g-1);
assert.equal(selected.len,dh.g+dh.a);
assert.equal(selected.len,q+1+q+dh.K);

const selectedRunes=selected.runes;
const prefix=selectedRunes.slice(0,q);
const xRune=selectedRunes[q];
const payload=selectedRunes.slice(q+1,q+1+q);
const trailer=selectedRunes.slice(q+1+q);
const text=(runes)=>runes.map((r)=>corpus.translit[runeIndex.get(r)]).join("");
assert.equal(text(prefix),"HOME");
assert.equal(corpus.translit[runeIndex.get(xRune)],"X");
assert.equal(text(payload),"WDSL");
assert.equal(text(trailer),"FD");
assert.equal(trailer.length,dh.K);
assert.equal(selectedRunes.length-(q+1),dh.a);
assert.equal(q+1,dh.g);
assert.equal(selected.start+q,37);

// Source-marker values inside the selected complete row.
const prime=(rune)=>corpus.prime[runeIndex.get(rune)];
assert.equal(prime(prefix[0]),dh.p);      // H -> 23
assert.equal(prime(payload[0]),dh.B);    // W -> 19
assert.equal(prime(trailer[0]),dh.K);    // F -> 2

// p57 PARABLE supplies exactly B=19 solved body words.
const p57Fragments=parsePage(pages[56]).fragments;
const parableBody=p57Fragments.slice(1);
const parableLabels=[
  "LIKE","THE","INSTAR","TUNNELING","TO","THE","SURFACE",
  "WE","MUST","SHED","OUR","OWN","CIRCUMFERENCES","FIND",
  "THE","DIVINITY","WITHIN","AND","EMERGE"
];
assert.equal(parableBody.length,dh.B);
assert.equal(parableLabels.length,dh.B);

const payloadPrimes=payload.map(prime);
const payloadResidues=payloadPrimes.map((value)=>value%dh.B);
const payloadWords=payloadResidues.map((value)=>parableLabels[value]);
assert.deepEqual(payloadPrimes,[19,89,53,73]);
assert.deepEqual(payloadResidues,[0,13,15,16]);
assert.deepEqual(payloadWords,["LIKE","FIND","DIVINITY","WITHIN"]);
// If the first W is interpreted as a typed B=19 marker rather than data,
// the remaining DSL spells the clean three-word instruction.
assert.equal(prime(payload[0]),parableBody.length);
assert.deepEqual(payloadWords.slice(1),["FIND","DIVINITY","WITHIN"]);

// Natural directional controls from the same q=4 source span.
const leftPrimes=prefix.map(prime);
const leftResidues=leftPrimes.map((value)=>value%dh.B);
const leftWords=leftResidues.map((value)=>parableLabels[value]);
const leftTravelWords=[...leftResidues].reverse().map((value)=>parableLabels[value]);
assert.deepEqual(leftWords,["TO","WE","THE","OUR"]);
assert.deepEqual(leftTravelWords,["OUR","THE","WE","TO"]);

// Matched corpus control: with q, X-position, read length and B frozen,
// the exact right-hand residue vector occurs only at the selected p32 fragment.
let eligibleFragments=0;
const targetMatches=[];
for(let page=0;page<=55;page++){
  const parsed=parsePage(pages[page]);
  for(let fragment0=0;fragment0<parsed.fragments.length;fragment0++){
    const fragment=parsed.fragments[fragment0];
    if(fragment.len<q+1+q)continue;
    eligibleFragments++;
    const residues=fragment.runes.slice(q+1,q+1+q)
      .map((rune)=>prime(rune)%dh.B);
    if(residues.join(",")===payloadResidues.join(",")){
      targetMatches.push({page,fragment0,start:fragment.start,text:fragment.text});
    }
  }
}
assert.equal(eligibleFragments,181);
assert.deepEqual(targetMatches,[
  {page:32,fragment0:7,start:33,text:"HOMEXWDSLFD"}
]);

// EMPTY is the unique selected-route state congruent to zero modulo p.
const routePResidues=route.slice(0,23).map((value)=>value%dh.p);
assert.deepEqual(routePResidues.flatMap((value,index)=>value===0?[index]:[]),[7]);

// Supplementary page-local address only: B=19 selects local fragment 19 = EN,
// whose length is K=2. Because of the incoming carry, this is complete-word
// ordinal 18, so it must not be called the nineteenth canonical word.
assert.equal(p32.fragments[dh.B-1].text,"EN");
assert.equal(p32.fragments[dh.B-1].len,dh.K);
assert.equal(p32.fragments[dh.B-1].start,102);

console.log(JSON.stringify({
  status:"PASS",
  route,
  routeWordHits,
  dh,
  p32SourceModel:{
    incomingCarry:p32IncomingCarry,
    localFragments:p32.fragments.length,
    completeWordStarts:21,
    finalFragment:p32.fragments[21].text,
    boundaryStep:22,
    terminalPage:route[23]
  },
  emptySelector:{
    step:emptyStep,
    gp0:gp0("EMPTY"),
    uniqueRouteZeroModP:7,
    selectedFragment:selected.text,
    start:selected.start,
    q,
    partition:[text(prefix),"X",text(payload),text(trailer)],
    partitionLengths:[prefix.length,1,payload.length,trailer.length],
    xOffset:selected.start+q
  },
  markerPrimes:{H:prime(prefix[0]),W:prime(payload[0]),F:prime(trailer[0])},
  parable:{
    bodyWords:parableBody.length,
    payloadPrimes,
    payloadResidues,
    payloadWords,
    markerInterpretation:payloadWords.slice(1),
    leftControl:leftWords,
    leftTravelControl:leftTravelWords
  },
  controls:{eligibleFragments,targetMatches},
  supplementaryLocalFragment19:{text:p32.fragments[18].text,start:p32.fragments[18].start,len:p32.fragments[18].len},
  conclusion:"The fixed p50 route aligns with p32's incoming carry plus 21 complete starts; EMPTY@7 selects the HOME/X row. q=EMPTY/p=4 fixes X and a four-rune right span WDSL, while B=19 fixes the PARABLE modulus. This closes the old row/start/stop/modulus selector gap as a source-constrained intermediate route, but no unknown LP2 plaintext or reversible cipher consumer is yet recovered."
},null,2));
