"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
const parts=transcription.split(/^\s*%\s*$/m);
const table=grid.pages.flatMap(p=>p.tokens);
const alpha60=grid.alphabet, alpha59=alpha60.replace("f","");
const mod=x=>((x%29)+29)%29;
const H=(a,b)=>[mod(a-b),mod(a+b)];
const spell=a=>a.map(v=>corpus.translit[v]).join("");
const decode=(tok,a)=>a.indexOf(tok[0])*a.length+a.indexOf(tok[1]);

function parsePage(page){
  const text=parts[page<=49?page:page-1],words=[];
  let current=[],start=0,offset=0;
  const flush=()=>{
    if(!current.length)return;
    words.push({word:words.length,start,end:offset-1,len:current.length,
      values:current.slice(),text:spell(current),
      outerDiff:current.length>=2?mod(current[0]-current.at(-1)):null});
    current=[];
  };
  for(const char of [...text]){
    const value=runeIndex.get(char);
    if(value!==undefined){if(!current.length)start=offset;current.push(value);offset++}
    else if(char==="-"||char===".")flush();
  }
  flush();return words;
}

const gpTokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(word){
  let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith("ING",i)){out.push(21);i+=3;continue}
    if(w.startsWith("IO",i)){out.push(27);i+=2;continue}
    const token=gpTokens.find(t=>w.startsWith(t.s,i));
    assert.ok(token,w.slice(i));out.push(token.i);i+=token.s.length;
  }
  return out;
}
const shell=v=>{
  const out=[];
  for(let l=0,r=v.length-1;l<r;l++,r--)out.push(...H(v[l],v[r]));
  if(v.length%2)out.push(v[(v.length-1)/2]);
  return out;
};

// Reconstruct the p28 DH tuple from the source-visible literal-DH line.
const p28Lines=parts[28].split("/").filter(x=>/[\u16A0-\u16FF]/u.test(x));
const dhFragments=(p28Lines[5].match(/[\u16A0-\u16FF]+/gu)||[])
  .map(s=>[...s].map(c=>runeIndex.get(c)));
assert.equal(spell(dhFragments[0]),"DH");
const firstH=H(dhFragments[0][0],dhFragments[0].at(-1));
const lastH=H(dhFragments.at(-1)[0],dhFragments.at(-1).at(-1));
const state={
  p:dhFragments.flat().length,g:dhFragments.length,a:6,
  b:firstH[0],A:lastH[0],B:lastH[1],K:firstH[1]
};
assert.deepEqual(state,{p:23,g:5,a:6,b:15,A:8,B:19,K:2});

// Freeze the prior FOUND/GOOD/LUCK key-shell recurrence.
const priorKeys={
  FOUND:[12,28,10,1,8],
  GOOD:[18,18,23,20],
  LUCK:[17,16,4,22],
};
const priorShells=Object.fromEntries(Object.entries(priorKeys).map(([k,v])=>[k,shell(v)]));
assert.deepEqual(priorShells,{
  FOUND:[4,20,27,0,10],
  GOOD:[27,9,24,12],
  LUCK:[24,10,12,20],
});
assert.equal(priorShells.FOUND[2],priorShells.GOOD[0]);
assert.equal(priorShells.GOOD[2],priorShells.LUCK[0]);
const predictedNextKeyShellFirst=priorShells.LUCK[2];
assert.equal(predictedNextKeyShellFirst,12);

// Independent dual-boundary receiver from authenticated signed-source words.
const gpNumbers=gp("NUMBERS").reduce((a,b)=>a+b,0);
const gpIs=gp("IS").reduce((a,b)=>a+b,0);
assert.equal(gpNumbers,83);
assert.equal(table[gpNumbers],"3D");
assert.equal(decode(table[gpNumbers],alpha60)-1,192);
assert.equal(gpIs,25);
assert.equal(table[gpIs],"3I");
assert.equal(decode(table[gpIs],alpha59),195);

const p0=parsePage(0);
const receiver=p0.find(w=>w.start===192&&w.end===195);
assert.ok(receiver);
assert.equal(receiver.len,4);
assert.deepEqual(receiver.values,[19,12,20,9]);
assert.equal(receiver.outerDiff,mod(state.K*state.g));
assert.equal(receiver.outerDiff,10);

// The key recurrence predicts plaintext outer difference before target opening.
const predictedPlainOuterDiff=mod(receiver.outerDiff-predictedNextKeyShellFirst);
assert.equal(predictedPlainOuterDiff,27);

const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/).slice(1).join("\n");
const signedWords=clear.split(/[^A-Za-z0-9]+/)
  .filter(x=>/^[A-Za-z]+$/.test(x))
  .map((word,i)=>({i,word:word.toUpperCase(),values:gp(word)}));
const fourRuneTargets=new Map();
for(const row of signedWords){
  if(row.values.length!==4)continue;
  const key=row.values.join(",");
  if(!fourRuneTargets.has(key))fourRuneTargets.set(key,new Set());
  fourRuneTargets.get(key).add(row.word);
}
const predictedTargets=[...fourRuneTargets.entries()]
  .filter(([key])=>{
    const v=key.split(",").map(Number);
    return mod(v[0]-v.at(-1))===predictedPlainOuterDiff;
  })
  .map(([key,names])=>({values:key.split(",").map(Number),names:[...names]}));
assert.deepEqual(predictedTargets,[
  {values:[2,18,10,4],names:["THEIR"]},
  {values:[19,28,9,21],names:["MEANING"]},
  {values:[13,24,2,15],names:["PATHS"]},
]);

// Charge a symmetric DH role/orientation packet family:
// [first private, one H(K,second private) coordinate,
//  one H(public pair) coordinate, p], with role swap,
// H coordinate choices, endpoint reversal, and inner reversal.
const roles=[
  {name:"abAB",x:state.a,y:state.b,X:state.A,Y:state.B},
  {name:"baBA",x:state.b,y:state.a,X:state.B,Y:state.A},
];
const rawFamily=[];
for(const role of roles)
for(const h1 of [0,1])
for(const h2 of [0,1])
for(const endpointOrder of [0,1])
for(const innerOrder of [0,1]){
  const endpoints=endpointOrder===0?[role.x,state.p]:[state.p,role.x];
  const inner=[H(state.K,role.y)[h1],H(role.X,role.Y)[h2]];
  if(innerOrder)inner.reverse();
  rawFamily.push({
    name:`${role.name}-h${h1}${h2}-e${endpointOrder}-i${innerOrder}`,
    values:[endpoints[0],...inner,endpoints[1]],
  });
}
const unique=new Map();
for(const key of rawFamily)unique.set(key.values.join(","),key);
const family=[...unique.values()];
assert.equal(family.length,32);

const p0Four=p0.filter(w=>w.len===4);
assert.equal(p0Four.length,11);
const hits=[];
for(const word of p0Four)
for(const key of family)
for(const sign of [-1,1]){
  const plain=word.values.map((v,i)=>mod(v+sign*key.values[i]));
  const names=fourRuneTargets.get(plain.join(","));
  if(!names)continue;
  hits.push({
    receiver:{word:word.word,start:word.start,end:word.end,text:word.text},
    key,
    sign:sign===-1?"subtract":"add",
    plaintext:plain,
    text:spell(plain),
    targets:[...names],
  });
}
assert.deepEqual(hits,[{
  receiver:{word:43,start:192,end:195,text:"MEOLN"},
  key:{name:"abAB-h10-e0-i0",values:[6,17,18,23]},
  sign:"subtract",
  plaintext:[13,24,2,15],
  text:"PATHS",
  targets:["PATHS"],
}]);

// Lock the source expression and forward replay.
const selectedKey=[
  state.a,
  H(state.K,state.b)[1],
  H(state.A,state.B)[0],
  state.p,
];
assert.deepEqual(selectedKey,[6,17,18,23]);
assert.deepEqual(
  hits[0].plaintext.map((v,i)=>mod(v+selectedKey[i])),
  receiver.values
);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "strong new p0 PATHS plaintext candidate: independently dual-bounded receiver 192..195, ciphertext outerDiff=K*g, prior key-shell recurrence predicts target outerDiff27, and a charged 32-key p28 DH role/orientation family yields exactly one authenticated hit across all p0 four-rune words and both signs: PATHS with key [a,H(K,b).sum,H(A,B).diff,p]",
  state,
  navigation:{
    NUMBERS:{gp0:gpNumbers,token:table[gpNumbers],mode:"base60 origin1",position:192},
    IS:{gp0:gpIs,token:table[gpIs],mode:"base59 origin0",position:195},
    receiver,
  },
  recurrence:{priorShells,predictedNextKeyShellFirst,predictedPlainOuterDiff,predictedTargets},
  family:{size:family.length,p0FourWords:p0Four.length,targetTypes:fourRuneTargets.size,hits},
},null,2));
