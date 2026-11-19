"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const table=grid.rows.flat(),alpha60=grid.alphabet,alpha59=alpha60.replace("f","");
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));

/** @param {string} word @returns {number[]} */
function gp(word){
 const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
 const out=[];
 for(let offset=0;offset<normalized.length;){
  if(normalized.startsWith("ING",offset)){out.push(21);offset+=3;continue;}
  if(normalized.startsWith("IO",offset)){out.push(27);offset+=2;continue;}
  const token=gpTokens.find(x=>normalized.startsWith(x.symbol,offset));
  assert.ok(token,"unmapped GP spelling "+word);
  out.push(token.value);offset+=token.symbol.length;
 }
 return out;
}
/** @param {string} word */
function gp0(word){return gp(word).reduce((a,b)=>a+b,0);}

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n");
const signedWords=clear.split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map(x=>x.toUpperCase());
assert.equal(signedWords.length,43);

/** @param {string} text @returns {string[]} */
function solvedWords(text){
 const out=[];let current=[];
 function flush(){if(!current.length)return;out.push(current.map(v=>corpus.translit[v]).join("").toUpperCase());current=[];}
 for(const ch of [...text]){
  const value=runeIndex.get(ch);
  if(value!==undefined)current.push(value);else flush();
 }
 flush();return out;
}

const sections=[
 {name:"signed2016",words:signedWords},
 ...solved.sections
  .filter(x=>x.name==="p56_an_end"||x.name==="p57_parable")
  .map(x=>({name:x.name,words:solvedWords(x.source_text)})),
];
assert.deepEqual(sections.map(x=>[x.name,x.words.length]),[
 ["signed2016",43],["p56_an_end",25],["p57_parable",20],
]);

/** @param {{radix:number,component:string,addressOrigin:number,digitOrigin:number}} mode @param {number} state */
function step(mode,state){
 const alphabet=mode.radix===60?alpha60:alpha59;
 const address=state+mode.addressOrigin;
 if(address<0||address>=table.length)return null;
 const char=table[address][mode.component==="low"?1:0];
 const raw=alphabet.indexOf(char);
 return raw<0?null:raw+mode.digitOrigin;
}

const modes=[];
for(const radix of [60,59])for(const component of ["low","high"])for(const addressOrigin of [0,1])for(const digitOrigin of [0,1]){
 modes.push({radix,component,addressOrigin,digitOrigin});
}
assert.equal(modes.length,16);

const distinctWords=[...new Set(signedWords)],wordsByState=new Map();
for(const word of distinctWords){
 const state=gp0(word);
 if(!wordsByState.has(state))wordsByState.set(state,[]);
 wordsByState.get(state).push(word);
}
assert.equal(wordsByState.size,27);

// Reproduce the prior source-state cycle family without unknown ciphertext.
const cycleRows=[];
for(const mode of modes){
 const edges=new Map();
 for(const state of wordsByState.keys()){
  const next=step(mode,state);
  if(next!==null&&wordsByState.has(next))edges.set(state,next);
 }
 const cycles=[];
 for(const [left,right] of edges)if(left<right&&edges.get(right)===left)cycles.push([left,right]);
 cycleRows.push({...mode,edgeCount:edges.size,cycles});
}
const cycleModes=cycleRows.filter(x=>x.cycles.length);
assert.deepEqual(cycleModes,[{
 radix:60,component:"low",addressOrigin:0,digitOrigin:0,
 edgeCount:7,cycles:[[36,54]],
}]);

// Independent exact-adjacency family. GOOD/LUCK is sealed and withheld from
// mode comparison because it is the prospective test below.
const comparison=[];
for(const mode of modes){
 const hits=[];let eligible=0;
 for(const section of sections){
  for(let i=0;i+1<section.words.length;i++){
   const left=section.words[i],right=section.words[i+1];
   if(section.name==="signed2016"&&left==="GOOD"&&right==="LUCK")continue;
   eligible+=1;
   if(step(mode,gp0(left))===gp0(right)){
    hits.push({section:section.name,index:i,left,right,states:[gp0(left),gp0(right)]});
   }
  }
 }
 comparison.push({...mode,eligible,hits,count:hits.length});
}
assert.equal(new Set(comparison.map(x=>x.eligible)).size,1);
assert.equal(comparison[0].eligible,84);

const preferred=comparison.find(x=>
 x.radix===60&&x.component==="low"&&x.addressOrigin===0&&x.digitOrigin===0
);
assert.ok(preferred);
assert.equal(preferred.count,0);

const maxCount=Math.max(...comparison.map(x=>x.count));
assert.equal(maxCount,3);
const leaders=comparison.filter(x=>x.count===maxCount);
assert.deepEqual(leaders.map(x=>[x.radix,x.component,x.addressOrigin,x.digitOrigin]),[
 [60,"low",0,1],[59,"low",0,1],
]);

// Sealed prospective holdout from issue comment: GOOD -> LUCK in exactly one
// low-digit step. Do not change path length or source pair after this point.
assert.equal(gp0("GOOD"),35);
assert.equal(gp0("LUCK"),31);
assert.equal(table[35],"0d");
assert.equal(step({radix:60,component:"low",addressOrigin:0,digitOrigin:0},35),39);

const holdout=modes.map(mode=>({
 ...mode,
 output:step(mode,gp0("GOOD")),
 hit:step(mode,gp0("GOOD"))===gp0("LUCK"),
}));
assert.equal(holdout.filter(x=>x.hit).length,0);

console.log(JSON.stringify({
 status:"PASS",
 classification:
  "Director #1787 negative prospective gate. Native-base60/low/zero/zero uniquely owns the prior authenticated-source 36<->54 cycle, but it has zero exact adjacent-word transitions in an independent 84-adjacency signed+p56+p57 comparison family with GOOD/LUCK held out. The sealed one-step GOOD->LUCK prediction then misses (35 -> 39, target31) and no one of the 16 frozen modes hits it. Keep existing low-digit cycles/self-closures as source-side consistency; do not promote the operator to a prospectively authenticated general navigation opcode.",
 sourceCycleModes:cycleModes,
 comparison:{
  heldOut:["GOOD","LUCK"],
  adjacencies:comparison[0].eligible,
  preferredCount:preferred.count,
  maxCount,
  leaders:leaders.map(x=>({radix:x.radix,component:x.component,addressOrigin:x.addressOrigin,digitOrigin:x.digitOrigin,hits:x.hits})),
  allModes:comparison.map(x=>({radix:x.radix,component:x.component,addressOrigin:x.addressOrigin,digitOrigin:x.digitOrigin,count:x.count,hits:x.hits})),
 },
 holdout:{
  states:[gp0("GOOD"),gp0("LUCK")],
  preferredCell:table[gp0("GOOD")],
  preferredOutput:step({radix:60,component:"low",addressOrigin:0,digitOrigin:0},gp0("GOOD")),
  modes:holdout,
 },
},null,2));
