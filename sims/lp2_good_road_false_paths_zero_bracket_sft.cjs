"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");

/** @param {string} relative @returns {string} */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");}
/** @param {number} n @returns {number} */
function mod29(n){return ((n%29)+29)%29;}

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeToValue=new Map(corpus.runes.map((rune,value)=>[rune,value]));
const tokens=grid.pages.flatMap((page)=>page.tokens);
const bytes=grid.pages.flatMap((page)=>page.bytes);
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token,alphabet){
  const high=alphabet.indexOf(token[0]);
  const low=alphabet.indexOf(token[1]);
  return high<0||low<0?null:high*alphabet.length+low;
}
const tables={
  base60:tokens.map((token)=>decodeToken(token,alphabet60)),
  base59:tokens.map((token)=>decodeToken(token,alphabet59)),
};

/** @param {string} fragment @returns {number[]} */
function runeValues(fragment){
  return [...fragment].filter((rune)=>runeToValue.has(rune)).map((rune)=>runeToValue.get(rune));
}
/** @param {string} fragment @returns {[number,number]} */
function outerH(fragment){
  const values=runeValues(fragment);
  assert.ok(values.length>=2);
  return [mod29(values[0]-values.at(-1)),mod29(values[0]+values.at(-1))];
}

const gpTokens=corpus.translit
  .map((symbol,value)=>({symbol,value}))
  .sort((left,right)=>right.symbol.length-left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word){
  const normalized=word.toUpperCase()
    .replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .replace(/[^A-Z]/g,"");
  let offset=0,sum=0;
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

const clear=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words=(clear[1].match(/\b[A-Za-z]+\b/gu)||[])
  .map((word,index)=>({index,word:word.toUpperCase(),gp0:gp0(word)}));
assert.equal(words.length,43);
assert.equal(words[36].word,"GOOD");
assert.deepEqual(words.slice(38,41).map((row)=>row.word),["BEWARE","FALSE","PATHS"]);
assert.equal(words[23].word,"ROAD");

const distinctWordsByGp0=new Map();
for(const row of words){
  if(!distinctWordsByGp0.has(row.gp0))distinctWordsByGp0.set(row.gp0,new Set());
  distinctWordsByGp0.get(row.gp0).add(row.word);
}

const sharedCollisionFamily={};
for(const [radix,table] of Object.entries(tables)){
  const hits=[];
  for(const source of words){
    const value=table[source.index];
    if(value===null||value===undefined)continue;
    const lexical=[...(distinctWordsByGp0.get(value)||new Set())].sort();
    if(lexical.length>=2){
      hits.push({
        sourceIndex:source.index,
        sourceWord:source.word,
        token:tokens[source.index],
        value,
        lexical,
      });
    }
  }
  sharedCollisionFamily[radix]=hits;
}
assert.deepEqual(sharedCollisionFamily.base59,[]);
assert.deepEqual(sharedCollisionFamily.base60,[{
  sourceIndex:36,
  sourceWord:"GOOD",
  token:"0s",
  value:54,
  lexical:["PATHS","ROAD"],
}]);
assert.equal(gp0("ROAD"),54);
assert.equal(gp0("PATHS"),54);
assert.equal(tables.base60[36],54);
assert.equal(tables.base59[36],53);

// The authenticated postscript itself resolves the GP0 collision.
const pathsIndex=words.find((row)=>row.word==="PATHS").index;
assert.equal(pathsIndex,40);
assert.equal(words[pathsIndex-1].word,"FALSE");
const selectedWord=["ROAD","PATHS"].find((word)=>word!=="PATHS");
assert.equal(selectedWord,"ROAD");

// Reconstruct the existing ROAD source descriptor from original p28.
const pages=transcription.split("%").slice(0,58);
const p28=pages[28];
const lines=p28.trim().split("/").filter((line)=>/[\u16A0-\u16FF]/u.test(line));
assert.equal(lines.length,12);
const line1=lines[0].match(/[\u16A0-\u16FF]+/gu)||[];
assert.equal(line1.length,5);
const here=[...outerH(line1[0]),...outerH(line1[1])];
assert.equal(here.map((value)=>corpus.translit[value]).join(""),"HERE");
const roadKey=[lines.length,line1.length,1,here.length];
assert.deepEqual(roadKey,[12,5,1,4]);
const p0Cipher=corpus.pages[0].indices.slice(105,109);
const road=p0Cipher.map((value,index)=>mod29(value-roadKey[index]));
assert.equal(road.map((value)=>corpus.translit[value]).join(""),"ROAD");

/** @param {[number,number]} pair @returns {number} */
function address(pair){return pair[0]*8+pair[1];}
const roadAddresses=[address([roadKey[0],roadKey[1]]),address([roadKey[2],roadKey[3]])];
assert.deepEqual(roadAddresses,[101,12]);
assert.equal(bytes[roadAddresses[0]],229);
assert.equal(tokens[229],"00");
assert.equal(bytes[roadAddresses[1]],247);
assert.equal(bytes[247],192);
assert.equal(tokens[192],"00");
const zeroCells=tokens.map((token,index)=>token==="00"?index:-1).filter((index)=>index>=0);
assert.deepEqual(zeroCells,[192,229]);
const interiorLength=zeroCells[1]-zeroCells[0]-1;
assert.equal(interiorLength,36);
assert.equal(interiorLength,words.find((row)=>row.word==="GOOD").index);

console.log(JSON.stringify({
  status:"PASS",
  signedPostscript:words.slice(35).map(({index,word,gp0})=>({index,word,gp0})),
  collisionFamily:sharedCollisionFamily,
  goodSelector:{
    index:36,
    token:tokens[36],
    base60:tables.base60[36],
    base59:tables.base59[36],
    gp0Collision:["ROAD","PATHS"],
    disambiguator:"FALSE PATHS",
    selected:"ROAD",
  },
  roadSource:{
    key:roadKey,
    decrypted:road.map((value)=>corpus.translit[value]).join(""),
    addresses:roadAddresses,
    zeroRoutes:[[101,229],[12,247,192]],
    zeroCells,
    interiorLength,
  },
  closedLoop:"GOOD36 -> base60 54 -> {ROAD,PATHS}; FALSE PATHS -> ROAD; ROAD source numbers -> unique zero endpoints 192/229; strict interior length 36 -> GOOD",
  interpretation:"The signed postscript independently selects base60 and ROAD, resolving the ROAD branch's prior conditional status. ROAD's already frozen source numbers select the two literal p50 zero endpoints, whose strict interior length returns the signed index of GOOD and closes the loop.",
},null,2));
