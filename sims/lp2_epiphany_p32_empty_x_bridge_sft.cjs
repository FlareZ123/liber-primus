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


// "FIND DIVINITY WITHIN" has one source-shaped geometric receiver already
// present on p32: five g-selected shell peels of the 11x11 square.
const p32Indices=corpus.pages[32].indices;
const side=11;
const primeMatrix=Array.from({length:side},(_,row)=>
  p32Indices.slice(row*side,(row+1)*side).map((index)=>corpus.prime[index])
);
const peeled=new Set();
const shellSizes=[];
for(let depth=0;depth<dh.g;depth++){
  let shell=0;
  for(let row=depth;row<side-depth;row++){
    for(let column=depth;column<side-depth;column++){
      if(row!==depth && row!==side-1-depth &&
         column!==depth && column!==side-1-depth)continue;
      peeled.add(row*side+column);
      shell++;
    }
  }
  shellSizes.push(shell);
}
assert.deepEqual(shellSizes,[40,32,24,16,8]);
assert.equal(peeled.size,120);
const divinityOffset=60;
assert.equal(peeled.has(divinityOffset),false);
const divinityRune=corpus.translit[p32Indices[divinityOffset]];
const divinityPrime=corpus.prime[p32Indices[divinityOffset]];
assert.equal(divinityRune,"W");
assert.equal(divinityPrime,dh.B);

// THE@21 independently fixes the final local fragment, whose start is offset117.
// Charge every source-shaped straight direction from that fixed cell.
const residueMatrix=primeMatrix.map((row)=>row.map((value)=>value%dh.B));
const finalFragment=p32.fragments[21];
assert.equal(route[21],gp0("THE"));
assert.equal(finalFragment.start,117);
const finalStart={
  row:Math.floor(finalFragment.start/side),
  column:finalFragment.start%side
};
assert.deepEqual(finalStart,{row:10,column:7});
const directions=[
  [-1,-1,"NW"],[-1,0,"N"],[-1,1,"NE"],[0,-1,"W"],
  [0,1,"E"],[1,-1,"SW"],[1,0,"S"],[1,1,"SE"]
];
const directionalReads=[];
for(const [dr,dc,name] of directions){
  const cells=[];
  for(let step=0;step<q;step++){
    const row=finalStart.row+dr*step;
    const column=finalStart.column+dc*step;
    if(row<0 || row>=side || column<0 || column>=side){
      cells.length=0;
      break;
    }
    cells.push({row,column,offset:row*side+column});
  }
  if(cells.length!==q)continue;
  const residues=cells.map(({row,column})=>residueMatrix[row][column]);
  const consecutive=residues.every((value,index)=>
    index===0 || value===residues[index-1]+1);
  const nextRow=finalStart.row+dr*q;
  const nextColumn=finalStart.column+dc*q;
  const nextLeaves=nextRow<0 || nextRow>=side ||
    nextColumn<0 || nextColumn>=side;
  directionalReads.push({
    direction:name,
    offsets:cells.map((cell)=>cell.offset),
    residues,
    words:residues.map((value)=>parableLabels[value]),
    consecutive,
    next:[nextRow,nextColumn],
    nextLeaves,
    impliedNextWord:consecutive && residues[q-1]+1<parableLabels.length
      ?parableLabels[residues[q-1]+1]:null
  });
}
const consecutiveDirections=directionalReads.filter((row)=>row.consecutive);
assert.deepEqual(consecutiveDirections,[{
  direction:"NE",
  offsets:[117,107,97,87],
  residues:[2,3,4,5],
  words:["INSTAR","TUNNELING","TO","THE"],
  consecutive:true,
  next:[6,11],
  nextLeaves:true,
  impliedNextWord:"SURFACE"
}]);

// Two simple boundary continuations are fixed controls. Neither continues
// the PARABLE sequence with SURFACE after the four-cell NE path.
const wrapOffset=6*side+0;
const reflectOffset=6*side+9;
assert.equal(parableLabels[corpus.prime[p32Indices[wrapOffset]]%dh.B],"DIVINITY");
assert.equal(parableLabels[corpus.prime[p32Indices[reflectOffset]]%dh.B],"THE");


// Reuse the already established p50 base60 transition on the recovered center.
// B=19 is the only frozen DH field whose next table value is an unknown page.
const dhFieldTargets=Object.entries(dh).map(([name,value])=>({
  name,value,token:tokens[value],next:table60[value],
  unknownPage:table60[value]>=0 && table60[value]<=55
}));
assert.deepEqual(dhFieldTargets.filter((row)=>row.unknownPage),[
  {name:"B",value:19,token:"0X",next:33,unknownPage:true}
]);
assert.equal(divinityPrime,dh.B);
assert.equal(table60[divinityPrime],33);

// q was recovered before this check. The same route state equals the exact
// source body size of p33's first red-titled unit, and one p32 shell leaves
// an equally sized 9x9 core.
assert.equal(route[q],81);
const p32OneShellCore=[];
for(let row=1;row<side-1;row++){
  for(let column=1;column<side-1;column++){
    p32OneShellCore.push(p32Indices[row*side+column]);
  }
}
assert.equal(p32OneShellCore.length,81);
const p33Text=pages[33];
const firstUnitEnd=p33Text.indexOf("&");
assert.ok(firstUnitEnd>0);
const p33FirstUnit=p33Text.slice(0,firstUnitEnd);
const firstTitleEnd=p33FirstUnit.indexOf(".");
assert.ok(firstTitleEnd>0);
const countRunes=(value)=>[...value].filter((ch)=>runeIndex.has(ch)).length;
const p33TitleRunes=countRunes(p33FirstUnit.slice(0,firstTitleEnd));
const p33FirstUnitRunes=countRunes(p33FirstUnit);
const p33BodyRunes=p33FirstUnitRunes-p33TitleRunes;
assert.equal(p33TitleRunes,10);
assert.equal(p33FirstUnitRunes,91);
assert.equal(p33BodyRunes,81);
assert.equal(p33BodyRunes,route[q]);
assert.equal(p33BodyRunes,p32OneShellCore.length);


// P33 source layout after the p32->p33 handoff.
// The actual oversized initials on scan 50.jpg are D and NG. The legacy M
// computation is retained for the historical conditional hypothesis, not a
// source reading. The red-title lengths are machine-verifiable below.
const p33SecondUnit=p33Text.slice(firstUnitEnd+1);
const secondTitleEnd=p33SecondUnit.indexOf(".");
assert.ok(secondTitleEnd>0);
const p33SecondTitleRunes=countRunes(p33SecondUnit.slice(0,secondTitleEnd));
const p33SecondUnitRunes=countRunes(p33SecondUnit);
const p33SecondBodyRunes=p33SecondUnitRunes-p33SecondTitleRunes;
assert.equal(p33SecondTitleRunes,8);
assert.equal(p33SecondUnitRunes,123);
assert.equal(p33SecondBodyRunes,115);
assert.equal(table60[32],p33SecondBodyRunes);

const markerM={ // historical hypothetical M, not an observed marker
  translit:"M",
  ordinal:corpus.translit.indexOf("M"),
  prime:corpus.prime[corpus.translit.indexOf("M")]
};
const markerNG={
  translit:"NG",
  ordinal:corpus.translit.indexOf("NG"),
  prime:corpus.prime[corpus.translit.indexOf("NG")]
};
assert.deepEqual(markerM,{translit:"M",ordinal:19,prime:71});
assert.deepEqual(markerNG,{translit:"NG",ordinal:21,prime:79});
assert.equal(markerM.ordinal,dh.B);
assert.equal(markerM.prime,gp0("SEEKS"));
assert.equal(markerNG.ordinal,dh.B+dh.K);
assert.equal(p33TitleRunes,dh.A+dh.K);
assert.equal(p33SecondTitleRunes,dh.A);
assert.equal(markerM.ordinal+p33TitleRunes,29);
assert.equal(markerNG.ordinal+p33SecondTitleRunes,29);

// The p50 transition graph maps the old hypothetical marker primes to black
// body length under a source-fixed depth: q for section 1, printed A=8 title
// length for section 2.
const markerMRoute=walk(markerM.prime,q);
const markerNGRoute=walk(markerNG.prime,dh.A);
assert.equal(markerMRoute[q],p33BodyRunes);
assert.equal(markerNGRoute[dh.A],p33SecondBodyRunes);
assert.deepEqual(markerMRoute,[71,108,14,183,81]);
assert.deepEqual(markerNGRoute,[79,82,201,74,205,76,114,197,115]);

const depthCandidates=[
  ["p",dh.p],["g",dh.g],["a",dh.a],["b",dh.b],
  ["A",dh.A],["B",dh.B],["K",dh.K],["q",q],
  ["A+K",dh.A+dh.K],["B+K",dh.B+dh.K]
];
const markerMDepthHits=depthCandidates.filter(([,depth])=>
  walk(markerM.prime,depth)[depth]===p33BodyRunes);
const markerNGDepthHits=depthCandidates.filter(([,depth])=>
  walk(markerNG.prime,depth)[depth]===p33SecondBodyRunes);
assert.deepEqual(markerMDepthHits,[["q",4]]);
assert.deepEqual(markerNGDepthHits,[["A",8],["B",19]]);
assert.equal(p33SecondTitleRunes,dh.A); // local title length selects the first hit.

// Exact bounded decoder negatives on the newly selected second p33 body.
const p33Indices=corpus.pages[33].indices;
const p33SecondBody=p33Indices.slice(99,214);
assert.equal(p33SecondBody.length,p33SecondBodyRunes);
const pointerCycle=[115,247,192,0,203,68,199,47,76,114,197];
const ioc=(values)=>{
  const counts=Array(29).fill(0);
  for(const value of values)counts[value]++;
  return counts.reduce((sum,count)=>sum+count*(count-1),0)/
    (values.length*(values.length-1));
};
const pointerKey=pointerCycle.map((value)=>value%29);
const secondCycleMinus=p33SecondBody.map((value,index)=>
  (value-pointerKey[index%pointerKey.length]+29)%29);
const secondCyclePlus=p33SecondBody.map((value,index)=>
  (value+pointerKey[index%pointerKey.length])%29);
assert.ok(Math.abs(ioc(p33SecondBody)-0.031121281464530894)<1e-15);
assert.ok(Math.abs(ioc(secondCycleMinus)-0.034019832189168576)<1e-15);
assert.ok(Math.abs(ioc(secondCyclePlus)-0.032646834477498096)<1e-15);

// Supplementary direct-state address: DEVOTED's GP0 value is 102, and p32
// zero-based rune offset102 begins the complete local EN fragment.
const devotedOffset=gp0("DEVOTED");
assert.equal(devotedOffset,102);
assert.equal(p32.fragments.find((fragment)=>fragment.start===devotedOffset).text,"EN");

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
  withinGeometry:{shellSizes,divinityOffset,divinityRune,divinityPrime},
  finalWordDirection:{start:finalStart,directionalReads,consecutiveDirections},
  devotedDirectOffset:{offset:devotedOffset,fragment:"EN"},
  p33Handoff:{centerValue:divinityPrime,pointerToken:tokens[divinityPrime],page:table60[divinityPrime],dhFieldTargets,qRouteState:route[q],p32OneShellCore:p32OneShellCore.length,p33TitleRunes,p33BodyRunes,
    secondTitleRunes:p33SecondTitleRunes,secondBodyRunes:p33SecondBodyRunes,
    markerM,markerNG,markerMRoute,markerNGRoute,markerMDepthHits,markerNGDepthHits, // legacy conditional fields
    actualMarkerOrdinals:[corpus.pages[33].indices[0],corpus.pages[33].indices[91]],
    actualMarkerDRoute:walk(corpus.prime[corpus.pages[33].indices[0]],q),
    actualDualMarkerBodyMatch:false,
    secondBodyPointerCycleIoC:{raw:ioc(p33SecondBody),minus:ioc(secondCycleMinus),plus:ioc(secondCyclePlus)}},
  conclusion:"The route now reaches p33 and its two source sections: M(ordinal B, prime SEEKS) walked q steps lands on the first body length 81; NG(ordinal B+K) walked A=8 title-length steps lands on the second body length 115, which is also T[32]. The repeated 115-cycle additive body test is negative. The remaining problem is a source-selected reversible decoder on these now-selected p33 receivers."
},null,2));
