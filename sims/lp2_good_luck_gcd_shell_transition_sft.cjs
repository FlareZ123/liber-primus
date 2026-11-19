"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);
const mod=x=>((x%29)+29)%29;
const H=(a,b)=>[mod(a-b),mod(a+b)];

function gp(word){
  const normalized=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let offset=0;offset<normalized.length;){
    if(normalized.startsWith("ING",offset)){out.push(21);offset+=3;continue;}
    if(normalized.startsWith("IO",offset)){out.push(27);offset+=2;continue;}
    const token=gpTokens.find(row=>normalized.startsWith(row.symbol,offset));
    assert.ok(token,normalized.slice(offset));
    out.push(token.value); offset+=token.symbol.length;
  }
  return out;
}
function shell4(values){
  assert.equal(values.length,4);
  return [...H(values[0],values[3]),...H(values[1],values[2])];
}
function invH(difference,sum){
  return [mod((difference+sum)*15),mod((sum-difference)*15)];
}
function unshell4(serialized){
  const outer=invH(serialized[0],serialized[1]);
  const inner=invH(serialized[2],serialized[3]);
  return [outer[0],inner[0],inner[1],outer[1]];
}

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/).slice(1).join("\n");
const words=clear.split(/[^A-Za-z0-9]+/)
  .filter(token=>/^[A-Za-z]+$/.test(token))
  .map((word,index)=>({index,word:word.toUpperCase(),values:gp(word)}));
assert.equal(words.length,43);
const targets=[...new Map(words.filter(row=>row.values.length===4)
  .map(row=>[row.values.join(","),row])).values()];
assert.deepEqual(targets.map(row=>row.word),
  ["LIES","THEIR","MEANING","ROAD","SEEK","WILL","GOOD","LUCK","PATHS"]);
const targetByGp=new Map(targets.map(row=>[row.values.join(","),row.word]));

const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
const inverseB=3;
assert.equal(state.b*inverseB%(state.p-1),1);
const goodShell=shell4(gp("GOOD"));
const luckShell=shell4(gp("LUCK"));
assert.deepEqual(goodShell,[12,0,0,6]);
assert.deepEqual(luckShell,[15,25,25,6]);
const delta=luckShell.map((value,index)=>mod(value-goodShell[index]));
assert.deepEqual(delta,[inverseB,mod(state.p+state.K),mod(state.p+state.K),0]);

const scalarEntries=[
  ["p",state.p],["g",state.g],["a",state.a],["b",state.b],
  ["A",state.A],["B",state.B],["K",state.K],["b^-1_mod22",inverseB],
  ["p+K",mod(state.p+state.K)],["K*a",mod(state.K*state.a)],
  ["K*g",mod(state.K*state.g)],["H(A,B).0",H(state.A,state.B)[0]],
  ["H(A,B).1",H(state.A,state.B)[1]],["H(K,b).0",H(state.K,state.b)[0]],
  ["H(K,b).1",H(state.K,state.b)[1]],
];
const scalars=[...new Map(scalarEntries.map(([name,value])=>[value,{value,names:[]}])).values()];
for(const [name,value] of scalarEntries) scalars.find(row=>row.value===value).names.push(name);
assert.equal(scalars.length,15);

const familyHits=[];
for(const x of scalars) for(const y of scalars){
  const candidateDelta=[x.value,y.value,y.value,0];
  const output=unshell4(goodShell.map((value,index)=>mod(value+candidateDelta[index])));
  const target=targetByGp.get(output.join(","));
  if(target) familyHits.push({x:x.names,y:y.names,delta:candidateDelta,target,output});
}
assert.deepEqual(familyHits,[{
  x:["b^-1_mod22"],y:["p+K"],delta:[3,25,25,0],
  target:"LUCK",output:gp("LUCK")
}]);

const exactPairs=[];
const shapedPairs=[];
for(const from of targets) for(const to of targets){
  if(from.values.join(",")===to.values.join(",")) continue;
  const fromShell=shell4(from.values),toShell=shell4(to.values);
  const d=toShell.map((value,index)=>mod(value-fromShell[index]));
  if(d.every((value,index)=>value===delta[index])) exactPairs.push([from.word,to.word]);
  if(d[1]===d[2]&&d[3]===0) shapedPairs.push({from:from.word,to:to.word,delta:d});
}
assert.deepEqual(exactPairs,[["GOOD","LUCK"]]);
assert.deepEqual(shapedPairs,[
  {from:"GOOD",to:"LUCK",delta:[3,25,25,0]},
  {from:"LUCK",to:"GOOD",delta:[26,4,4,0]},
]);

let solvedAdjacent4=0,solvedExact=0,solvedShaped=0;
const solvedBySection={};
for(const section of solved.sections){
  const sourceWords=(section.source_text.match(/[\u16A0-\u16FF]+/gu)||[])
    .map(raw=>[...raw].map(rune=>runeIndex.get(rune)).filter(value=>value!==undefined));
  let adjacent=0,exact=0,shaped=0;
  for(let i=0;i+1<sourceWords.length;i++){
    const left=sourceWords[i],right=sourceWords[i+1];
    if(left.length!==4||right.length!==4) continue;
    adjacent++; solvedAdjacent4++;
    const leftShell=shell4(left),rightShell=shell4(right);
    const d=rightShell.map((value,index)=>mod(value-leftShell[index]));
    if(d.every((value,index)=>value===delta[index])){exact++;solvedExact++;}
    if(d[1]===d[2]&&d[3]===0){shaped++;solvedShaped++;}
  }
  solvedBySection[section.name]={adjacent,exact,shaped};
}
assert.equal(solvedAdjacent4,18);
assert.equal(solvedExact,0);
assert.equal(solvedShaped,0);
assert.equal(solvedBySection.p56_an_end.adjacent,0);
assert.equal(solvedBySection.p57_parable.adjacent,1);

const goodKey=[18,18,23,20];
const luckKey=[17,16,4,22];
const directKeyDelta=luckKey.map((value,index)=>mod(value-goodKey[index]));
assert.deepEqual(directKeyDelta,[28,27,10,2]);
assert.deepEqual(directKeyDelta,[
  mod(state.g-state.a),H(state.A,state.B)[1],mod(state.K*state.g),state.K
]);
const nextKey=luckKey.map((value,index)=>mod(value+directKeyDelta[index]));
assert.deepEqual(nextKey,[16,14,14,24]);

const parts=transcription.split(/^\s*%\s*$/m);
function pageWords(page){
  const text=parts[page<=49?page:page-1];
  const out=[]; let current=[],start=0,offset=0;
  const flush=()=>{
    if(!current.length) return;
    out.push({start,end:offset-1,values:current.slice()}); current=[];
  };
  for(const char of [...text]){
    const value=runeIndex.get(char);
    if(value!==undefined){
      if(!current.length) start=offset;
      current.push(value); offset++;
    } else if(char==="-"||char===".") flush();
  }
  flush(); return out;
}
let fourRuneWords=0;
const repeatedKeyHits=[];
for(let page=0;page<=55;page++){
  if(page===50) continue;
  for(const word of pageWords(page)){
    if(word.values.length!==4) continue;
    fourRuneWords++;
    const plaintext=word.values.map((value,index)=>mod(value-nextKey[index]));
    const target=targetByGp.get(plaintext.join(","));
    if(target) repeatedKeyHits.push({page,start:word.start,end:word.end,target});
  }
}
assert.equal(fourRuneWords,514);
assert.deepEqual(repeatedKeyHits,[]);

console.log(JSON.stringify({
  status:"PASS",
  classification:"retrospective mechanism compression: frozen GCD/DH state gives the unique 225-family GOOD -> LUCK H-shell update [b^-1,p+K,p+K,0]; solved adjacent-4 controls miss the broader shape; repeated direct-key recurrence fails",
  state,goodShell,luckShell,delta,
  scalarFamilyConfigs:scalars.length**2,
  familyHits,exactPairs,shapedPairs,
  solved:{adjacent4:solvedAdjacent4,exact:solvedExact,shaped:solvedShaped,bySection:solvedBySection},
  rejectedDirectKeyRecurrence:{directKeyDelta,nextKey,fourRuneWords,repeatedKeyHits}
},null,2));
