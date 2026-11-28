"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const mod=x=>((x%29)+29)%29;
const inv2=15;
const h2inv=([d,s])=>[mod((d+s)*inv2),mod((s-d)*inv2)];

const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription=read("resources/liber-primus/lp2-transcription.txt");
const toks=corpus.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));

function gp(word){
 const n=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
 const out=[];
 for(let i=0;i<n.length;){
  if(n.startsWith("ING",i)){out.push(21);i+=3;continue}
  if(n.startsWith("IO",i)){out.push(27);i+=2;continue}
  const t=toks.find(x=>n.startsWith(x.symbol,i));assert.ok(t);out.push(t.value);i+=t.symbol.length;
 }
 return out;
}
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0];
const source=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/.test(x)).map((w,i)=>{
 const v=gp(w);return {i,w:w.toUpperCase(),v,gp0:mod(v.reduce((a,b)=>a+b,0))};
});
const parts=transcription.split(/^\s*%\s*$/m).slice(0,55), printed=[];
let cur=[],sp=-1,ep=-1,so=-1;
function flush(){if(!cur.length)return;printed.push({page:sp,endPage:ep,start:so,v:cur.slice()});cur=[]}
for(let b=0;b<parts.length;b++){
 const page=b>=50?b+1:b;let off=0;
 for(const ch of parts[b]){
  const v=runeIndex.get(ch);
  if(v!==undefined){if(!cur.length){sp=page;so=off}ep=page;cur.push(v);off++}
  else if(!/[\s/]/u.test(ch))flush();
 }
}
flush();
const canonical=printed.filter(w=>w.page===w.endPage);
const local=p=>canonical.filter(w=>w.page===p);
const p30=local(30)[26], p31=local(31)[31];
assert.deepEqual([p30.start,p31.start],[112,126]);
const C=[mod(p30.v.reduce((a,b)=>a+b,0)),mod(p31.v.reduce((a,b)=>a+b,0))];
assert.deepEqual(C,[18,7]);

const state={K:2,e:3,g:5,a:6};
const W4=[14,12], redMarker=13;
const titleLengthH4=[state.K,mod(-state.e),state.g,state.a];
const signedTitleFields=[...new Set(titleLengthH4.flatMap(v=>[v,mod(-v)]))];
assert.deepEqual(signedTitleFields,[2,27,26,3,5,24,6,23]);

const source43=[];
for(let i=0;i+1<source.length;i++)if(source[i].v.length===4&&source[i+1].v.length===3){
 source43.push({index:i,words:[source[i].w,source[i+1].w],gp0:[source[i].gp0,source[i+1].gp0]});
}
assert.deepEqual(source43.map(x=>[x.index,...x.words]),[[23,"ROAD","AND"],[30,"SEEK","AND"]]);

const hits=[];let configurations=0;
for(const base of [W4,W4.slice().reverse()]){
 for(const field of signedTitleFields){
  const companion=h2inv([redMarker,field]);
  const sigma=[mod(base[0]+companion[0]),mod(base[1]+companion[1])];
  for(const pair of source43){
   configurations++;
   const required=[mod(C[0]-pair.gp0[0]),mod(C[1]-pair.gp0[1])];
   if(sigma.join(",")===required.join(","))hits.push({base,field,companion,sigma,pair,required});
  }
 }
}
assert.equal(configurations,32);
assert.deepEqual(hits,[{
 base:[12,14],field:state.e,companion:[8,24],sigma:[20,9],
 pair:{index:30,words:["SEEK","AND"],gp0:[27,27]},
 required:[20,9]
}]);

const out={
 status:"PASS",
 classification:"post-discovery p6-visible scalar checksum extension for the K-prefix; not plaintext authentication",
 preparedReceiverGp0:C,
 family:{
  baseline:"either orientation of terminal title word W4",
  companion:"H2^-1([redMarker13, signed H4(titleLengths) field])",
  packetCount:16,
  sourcePairs:source43.length,
  configurations,
  hits
 },
 identity:"reverse(W4)+H2^-1([13,e])=[12,14]+[8,24]=[20,9]"
};
const text=JSON.stringify(out,null,2);console.log(text);
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.env.TEMP||__dirname,"source-test-output.json"),text+"\n");
