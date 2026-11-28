"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
/** @param {number} x */
function mod29(x) { return ((x % 29) + 29) % 29; }

const inv2 = 15;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit.map((symbol,value)=>({symbol,value}))
  .sort((a,b)=>b.symbol.length-a.symbol.length);

/** @param {string} word */
function gp(word) {
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
const targets=signed.filter(x=>x.gp.length===6);
assert.deepEqual(targets.map(x=>[x.index,x.label]),[[10,"PRIMUS"],[38,"BEWARE"],[41,"VERIFY"]]);

const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const words=[]; let current=[],sp=-1,ep=-1,start=-1;
function flush(){
  if(!current.length)return;
  words.push({page:sp,endPage:ep,start,values:current.slice()}); current=[];
}
for(let block=0;block<parts.length;block++){
  const page=block>=50?block+1:block; let offset=0;
  for(const ch of parts[block]){
    const v=runeIndex.get(ch);
    if(v!==undefined){
      if(!current.length){sp=page;start=offset;}
      ep=page; current.push(v); offset++;
    } else if(!/[\s/]/u.test(ch)) flush();
  }
}
flush();
const canonical=words.filter(x=>x.page===x.endPage);
const p41=canonical.filter(x=>x.page===41);
assert.deepEqual(p41[41],{page:41,endPage:41,start:178,values:[27,12,5,0,17,13,19]});
const receivers=canonical.filter(x=>x.values.length===7&&x.values[3]===0);
assert.equal(receivers.length,7);

function permutations(values){
  const out=new Map();
  function visit(prefix,rest){
    if(!rest.length){out.set(prefix.join(","),prefix.slice());return;}
    for(let i=0;i<rest.length;i++){
      const next=rest.slice(),v=next.splice(i,1)[0]; visit(prefix.concat(v),next);
    }
  }
  visit([],values); return [...out.values()];
}
function h6inv(s){
  const [d0,d1,d2,s2,s1,s0]=s;
  return [
    mod29((d0+s0)*inv2),mod29((d1+s1)*inv2),mod29((d2+s2)*inv2),
    mod29((s2-d2)*inv2),mod29((s1-d1)*inv2),mod29((s0-d0)*inv2)
  ];
}

const atoms=[4,10,23,8,7,19];
const family=new Map();
for(let mask=0;mask<64;mask++){
  const a=atoms.map((v,i)=>(mask>>i)&1?mod29(-v):v);
  for(const shell of permutations(a)){
    const key=h6inv(shell); family.set(key.join(","),{key,shell});
  }
}
assert.equal(family.size,23040);

const hits=[];
for(const r of receivers){
  const c=[r.values[0],r.values[1],r.values[2],r.values[4],r.values[5],r.values[6]];
  for(const t of targets){
    const key=c.map((v,i)=>mod29(v-t.gp[i]));
    const form=family.get(key.join(","));
    if(form) hits.push({page:r.page,start:r.start,cipher:r.values,prepared:c,targetIndex:t.index,target:t.label,key,shell:form.shell});
  }
}
assert.deepEqual(hits,[{
  page:41,start:178,cipher:[27,12,5,0,17,13,19],prepared:[27,12,5,17,13,19],
  targetIndex:41,target:"VERIFY",key:[26,23,1,7,13,22],shell:[4,10,23,8,7,19]
}]);

console.log(JSON.stringify({
  status:"PASS",centerFReceivers:receivers.length,
  targets:targets.map(x=>[x.index,x.label]),
  distinctKeys:family.size,configurations:receivers.length*targets.length*family.size,hits
},null,2));
