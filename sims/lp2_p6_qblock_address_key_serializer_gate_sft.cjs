"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const MOD=29;
/** @param {number} x @returns {number} */
function mod(x){return((x%MOD)+MOD)%MOD;}
/** @param {number} a @returns {number} */
function inv(a){for(let x=1;x<MOD;x+=1)if(mod(a*x)===1)return x;throw new Error("noninvertible");}
/** @param {number[][]} matrix @returns {number} */
function rank(matrix){
  const a=matrix.map((row)=>row.map(mod));
  if(a.length===0)return 0;
  let r=0;
  for(let c=0;c<a[0].length&&r<a.length;c+=1){
    let pivot=-1;
    for(let i=r;i<a.length;i+=1)if(a[i][c]!==0){pivot=i;break;}
    if(pivot<0)continue;
    [a[r],a[pivot]]=[a[pivot],a[r]];
    const scale=inv(a[r][c]);
    a[r]=a[r].map((value)=>mod(value*scale));
    for(let i=0;i<a.length;i+=1){
      if(i===r||a[i][c]===0)continue;
      const factor=a[i][c];
      a[i]=a[i].map((value,j)=>mod(value-factor*a[r][j]));
    }
    r+=1;
  }
  return r;
}
/** @param {number[]} values @returns {number[]} */
function degree2(values){
  const out=[1,...values];
  for(let i=0;i<values.length;i+=1)for(let j=i;j<values.length;j+=1)out.push(mod(values[i]*values[j]));
  return out;
}

const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const transcription=fs.readFileSync(path.join(root,"resources/liber-primus/lp2-transcription.txt"),"utf8");
const signed=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"),"utf8");
const runeIndex=new Map(corpus.runes.map((rune,index)=>[rune,index]));
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55);
const words=[];let current=[],startPage=-1,endPage=-1,startOffset=-1;
function flush(){if(!current.length)return;words.push({page:startPage,endPage,start:startOffset,values:current.slice()});current=[];}
for(let block=0;block<parts.length;block+=1){
  const page=block>=50?block+1:block;let offset=0;
  for(const ch of parts[block]){
    const value=runeIndex.get(ch);
    if(value!==undefined){if(!current.length){startPage=page;startOffset=offset;}endPage=page;current.push(value);offset+=1;}
    else if(!/[\s/]/u.test(ch))flush();
  }
}
flush();
const canonical=words.filter((word)=>word.page===word.endPage);
/** @param {number} page */
function localWords(page){return canonical.filter((word)=>word.page===page);}

const tokens=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} word @returns {number[]} */
function gp(word){
  const text=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<text.length;){
    if(text.startsWith("ING",i)){out.push(21);i+=3;continue;}
    if(text.startsWith("IO",i)){out.push(27);i+=2;continue;}
    const token=tokens.find((candidate)=>text.startsWith(candidate.symbol,i));
    assert.ok(token,"unmapped GP spelling "+text.slice(i));
    out.push(token.value);i+=token.symbol.length;
  }
  return out;
}
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const source=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/u).filter((word)=>/^[A-Za-z]+$/u.test(word)).map((word,index)=>({index,label:word.toUpperCase(),gp:gp(word)}));

const selected=new Map([[32,30],[33,132],[34,4],[35,25],[37,146],[38,57],[39,132],[40,71]]);
const rows=[];
for(const page of [32,33,34,35,37,38,39,40]){
  const start=selected.get(page);
  let receiver;
  if(page===35){
    const local=localWords(page),index=local.findIndex((word)=>word.start===start);
    assert.ok(index>=0&&index+1<local.length);
    assert.equal(local[index].values.length,2);assert.equal(local[index+1].values.length,3);
    receiver=local[index].values.concat(local[index+1].values);
  }else{
    const word=localWords(page).find((candidate)=>candidate.start===start);
    assert.ok(word,"missing receiver p"+page+" start"+start);
    receiver=word.values;
  }
  const target=source[page].gp;
  assert.equal(receiver.length,target.length);
  const key=receiver.map((value,index)=>mod(value-target[index]));
  const block=page<=35?1:3;
  const slot=block===1?page-32:page-37;
  rows.push({page,label:source[page].label,start,Q:Math.floor(start/29),R:start%29,n:key.length,block,slot,receiver,target,key});
}
assert.deepEqual(rows.map((row)=>row.key),[
 [3,0,1],[25,5,26,2],[24,5],[19,14,18,15,17],
 [12,1,1,22],[20,7,7,7,13,4],[19,12,19,2,5],[20,20,12,6],
]);

const p33=rows.find((row)=>row.page===33),p39=rows.find((row)=>row.page===39);
assert.deepEqual([p33.Q,p33.R],[4,16]);assert.deepEqual([p39.Q,p39.R],[4,16]);
assert.notEqual(p33.key[0],p39.key[0]);

const observations=[];
for(const row of rows)for(let j=0;j<row.key.length;j+=1)observations.push({...row,j,k:row.key[j]});
assert.equal(observations.length,33);

const families=[
 {name:"affine_QRnJ",features:(o)=>[1,o.Q,o.R,o.n,o.j],expected:[5,6]},
 {name:"quadratic_QRnJ",features:(o)=>degree2([o.Q,o.R,o.n,o.j]),expected:[13,14]},
 {name:"quadratic_QRnJblock",features:(o)=>degree2([o.Q,o.R,o.n,o.j,o.block]),expected:[14,15]},
 {name:"quadratic_QRnJblockslot",features:(o)=>degree2([o.Q,o.R,o.n,o.j,o.block,o.slot]),expected:[15,16]},
];
const results=[];
for(const family of families){
  const A=observations.map(family.features),b=observations.map((o)=>o.k);
  const rankA=rank(A),rankAug=rank(A.map((row,index)=>row.concat([b[index]])));
  assert.deepEqual([rankA,rankAug],family.expected);
  assert.ok(rankAug>rankA);
  results.push({name:family.name,coefficients:A[0].length,rankA,rankAug,inconsistent:true});
}

console.log(JSON.stringify({
 status:"PASS",
 rows:rows.map(({page,label,start,Q,R,n,key})=>({page,label,start,Q,R,n,key})),
 addressCollision:{pages:[33,39],address:[4,16],firstKeyValues:[p33.key[0],p39.key[0]]},
 polynomialFamilies:results,
},null,2));
