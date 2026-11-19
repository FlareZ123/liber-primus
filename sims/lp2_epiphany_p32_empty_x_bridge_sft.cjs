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

function parseWords(page){
  const words=[];
  let current="";
  for(const ch of page){
    if(runeIndex.has(ch)) current+=ch;
    else if(ch==="/" || /\s/u.test(ch)) continue;
    else if(current){words.push(current);current="";}
  }
  if(current) words.push(current);
  return words;
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
  if(names.length) routeWordHits.push({step,state:route[step],words:names});
}
assert.deepEqual(routeWordHits,[
  {step:0,state:71,words:["SEEKS"]},
  {step:7,state:92,words:["EMPTY"]},
  {step:21,state:20,words:["THE"]},
  {step:22,state:102,words:["DEVOTED"]}
]);

const p32Words=parseWords(pages[32]);
assert.equal(p32Words.length,22);
assert.equal(corpus.pages[32].indices.length,121);

const ranges=[];
let cursor=0;
for(let i=0;i<p32Words.length;i++){
  const len=[...p32Words[i]].length;
  ranges.push({index:i,start:cursor,end:cursor+len,len});
  cursor+=len;
}
assert.equal(cursor,121);

const emptyStep=routeWordHits.find((row)=>row.words.includes("EMPTY")).step;
assert.equal(emptyStep,7);
const selectedWord=p32Words[emptyStep];
const selectedWordRunes=[...selectedWord];
const selectedWordText=selectedWordRunes
  .map((r)=>corpus.translit[runeIndex.get(r)]).join("");
assert.equal(selectedWordText,"HOMEXWDSLFD");
assert.equal(selectedWordRunes.length,11);
assert.deepEqual(ranges[7],{index:7,start:33,end:44,len:11});

const selectedPos=gp0("EMPTY")%selectedWordRunes.length;
assert.equal(selectedPos,4);
const selectedRune=corpus.translit[runeIndex.get(selectedWordRunes[selectedPos])];
assert.equal(selectedRune,"X");
const selectedPageOffset=ranges[7].start+selectedPos;
assert.equal(selectedPageOffset,37);

const origins=[];
for(const wordOrigin of ["zero","one"]){
  const wordIndex=wordOrigin==="zero"?emptyStep:emptyStep-1;
  const word=[...p32Words[wordIndex]];
  for(const positionOrigin of ["zero","one"]){
    const position=positionOrigin==="zero"
      ?gp0("EMPTY")%word.length
      :(gp0("EMPTY")-1)%word.length;
    origins.push({
      wordOrigin,positionOrigin,wordIndex,wordLength:word.length,position,
      rune:corpus.translit[runeIndex.get(word[position])]
    });
  }
}
assert.deepEqual(origins.map((row)=>row.rune),["X","E","TH","O"]);
assert.equal(origins.filter((row)=>row.rune==="X").length,1);

const pagesWith22Words=[];
const sameRuleXPages=[];
for(let page=0;page<=55;page++){
  if(corpus.pages[page].indices.length===0) continue;
  const words=parseWords(pages[page]);
  if(words.length===22) pagesWith22Words.push(page);
  if(words.length>emptyStep){
    const word=[...words[emptyStep]];
    const pos=gp0("EMPTY")%word.length;
    const rune=corpus.translit[runeIndex.get(word[pos])];
    if(rune==="X") sameRuleXPages.push(page);
  }
}
assert.deepEqual(pagesWith22Words,[32]);
assert.deepEqual(sameRuleXPages,[11,15,18,31,32]);

const wholeRows=[];
for(let page=0;page<=55;page++){
  const count=corpus.pages[page].indices.length;
  const side=Math.sqrt(count);
  if(count===0 || !Number.isInteger(side)) continue;
  const words=parseWords(pages[page]);
  let start=0;
  for(let i=0;i<words.length;i++){
    const runes=[...words[i]];
    if(start%side===0 && runes.length===side){
      wholeRows.push({
        page,side,wordIndex:i,start,
        text:runes.map((r)=>corpus.translit[runeIndex.get(r)]).join("")
      });
    }
    start+=runes.length;
  }
}
assert.deepEqual(wholeRows,[
  {page:32,side:11,wordIndex:7,start:33,text:"HOMEXWDSLFD"}
]);

const p32Flat=p32Words.flatMap((word)=>[...word]);
const xRune=corpus.runes[corpus.translit.indexOf("X")];
const p32XOffsets=p32Flat.flatMap((r,i)=>r===xRune?[i]:[]);
assert.deepEqual(p32XOffsets,[37,54,61,68,70]);

const parableLabels=[
  "LIKE","THE","INSTAR","TUNNELING","TO","THE","SURFACE",
  "WE","MUST","SHED","OUR","OWN","CIRCUMFERENCES","FIND",
  "THE","DIVINITY","WITHIN","AND","EMERGE"
];
const tail=selectedWordRunes.slice(selectedPos+1);
const tailText=tail.map((r)=>corpus.translit[runeIndex.get(r)]).join("");
assert.equal(tailText,"WDSLFD");
const tailPrimes=tail.map((r)=>corpus.prime[runeIndex.get(r)]);
const tailResidues=tailPrimes.map((prime)=>prime%19);
const tailLabels=tailResidues.map((residue)=>parableLabels[residue]);
assert.deepEqual(tailPrimes,[19,89,53,73,2,89]);
assert.deepEqual(tailResidues,[0,13,15,16,2,13]);
assert.deepEqual(tailLabels,["LIKE","FIND","DIVINITY","WITHIN","INSTAR","FIND"]);
assert.deepEqual(tailLabels.slice(0,4),["LIKE","FIND","DIVINITY","WITHIN"]);

console.log(JSON.stringify({
  status:"PASS",
  upstreamRoute:route,
  routeWordHits,
  destinationPage:32,
  p32WordCount:p32Words.length,
  uniqueRunePageWith22Words:pagesWith22Words,
  emptySelector:{
    step:emptyStep,
    gp0:gp0("EMPTY"),
    selectedWordIndex:emptyStep,
    selectedWord:selectedWordText,
    wordLength:selectedWordRunes.length,
    position:selectedPos,
    pageOffset:selectedPageOffset,
    rune:selectedRune,
    originControls:origins
  },
  squarePageWholeRowWords:wholeRows,
  sameEmptyWord7RuleXPages,
  p32XOffsets,
  afterX:{
    fullTail:tailText,
    primes:tailPrimes,
    residuesMod19:tailResidues,
    parableWords:tailLabels,
    firstFour:tailLabels.slice(0,4)
  },
  conclusion:"The independently fixed 23-step route supplies a zero-based EMPTY@7 selector for the unique full-row p32 word; GP0(EMPTY) modulo that word length selects the HOME-adjacent X. This strengthens the old WDSL mod19 readout start selector but does not select modulo19, a four-cell stop, or a cipher consumer."
},null,2));
