"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8").replace(/\r/g,"");}
/** @param {number} x */
function mod29(x){return ((x%29)+29)%29;}

const inv2=15;
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const signedText=read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {string} word */
function gp(word){
  const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<s.length;){
    if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const t=gpTokens.find(x=>s.startsWith(x.symbol,i));
    assert.ok(t,"unmapped "+s.slice(i)); out.push(t.value); i+=t.symbol.length;
  }
  return out;
}

const clear=signedText.split("-----BEGIN PGP SIGNATURE-----")[0];
const signed=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/)
  .filter(x=>/^[A-Za-z]+$/.test(x))
  .map((label,index)=>({index,label:label.toUpperCase(),gp:gp(label)}));
const targets=signed.filter(x=>x.gp.length===7);
assert.deepEqual(targets.map(x=>[x.index,x.label]),[[8,"DEVOTED"],[26,"NUMBERS"],[42,"OPENPGP"]]);

const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const words=[];let current=[],sp=-1,ep=-1,start=-1;
function flush(){if(!current.length)return;words.push({page:sp,endPage:ep,start,values:current.slice()});current=[];}
for(let block=0;block<parts.length;block++){
  const page=block>=50?block+1:block;let offset=0;
  for(const ch of parts[block]){
    const v=runeIndex.get(ch);
    if(v!==undefined){if(!current.length){sp=page;start=offset;}ep=page;current.push(v);offset++;}
    else if(!/[\s/]/u.test(ch))flush();
  }
}
flush();
const canonical=words.filter(x=>x.page===x.endPage);

const selectorHits=[];
for(let page=0;page<=55;page++){
  const local=canonical.filter(x=>x.page===page);
  for(let i=0;i<local.length;i++){
    const w=local[i];
    if(w.values.length!==3)continue;
    const [left,center,right]=w.values;
    const h=[mod29(left-right),mod29(left+right),center];
    if(h.join(",")!=="2,1,0")continue;
    const dest=local[i+2];
    selectorHits.push({
      page,selectorOrdinal:i+1,selectorStart:w.start,selector:w.values,h,
      destination:dest?{ordinal:i+3,start:dest.start,values:dest.values}:null
    });
  }
}
assert.deepEqual(selectorHits,[{
  page:42,selectorOrdinal:43,selectorStart:206,selector:[16,0,14],h:[2,1,0],
  destination:{ordinal:45,start:211,values:[10,0,14,1,3,26,8,2]}
}]);
assert.equal(selectorHits[0].destination.values[1],0);

const receivers=canonical.filter(x=>x.values.length===8&&x.values[1]===0);
assert.equal(receivers.length,5);

function permutations(values){
  const out=new Map();
  function visit(prefix,rest){
    if(!rest.length){out.set(prefix.join(","),prefix.slice());return;}
    for(let i=0;i<rest.length;i++){const next=rest.slice(),v=next.splice(i,1)[0];visit(prefix.concat(v),next);}
  }
  visit([],values);return [...out.values()];
}
function h7inv(s){
  const [d0,s0,d1,s1,d2,s2,c]=s;
  return [
    mod29((d0+s0)*inv2),mod29((d1+s1)*inv2),mod29((d2+s2)*inv2),c,
    mod29((s2-d2)*inv2),mod29((s1-d1)*inv2),mod29((s0-d0)*inv2)
  ];
}

const shellAtoms=[18,25,28,3,28,25,23];
const family=new Set();
for(let mask=0;mask<128;mask++){
  const atoms=shellAtoms.map((v,i)=>(mask>>i)&1?mod29(-v):v);
  for(const shell of permutations(atoms))family.add(h7inv(shell).join(","));
}
assert.equal(family.size,161280);

const hits=[];
for(const r of receivers){
  const c=r.values.filter((_,i)=>i!==1);
  for(const t of targets){
    const key=c.map((v,i)=>mod29(v-t.gp[i]));
    if(family.has(key.join(",")))hits.push({
      page:r.page,start:r.start,cipher:r.values,prepared:c,
      targetIndex:t.index,target:t.label,key
    });
  }
}
assert.deepEqual(hits,[{
  page:42,start:211,cipher:[10,0,14,1,3,26,8,2],
  prepared:[10,14,1,3,26,8,2],
  targetIndex:42,target:"OPENPGP",key:[7,1,12,23,13,2,18]
}]);
assert.deepEqual(
  hits[0].prepared.map((v,i)=>mod29(v-hits[0].key[i])),
  signed[42].gp
);

console.log(JSON.stringify({
  status:"PASS",selectorHits,
  eligibleReceivers:receivers.length,
  targets:targets.map(x=>[x.index,x.label]),
  distinctKeys:family.size,
  configurations:receivers.length*targets.length*family.size,
  hits
},null,2));
