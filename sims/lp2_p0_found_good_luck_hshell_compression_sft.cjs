"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const toks=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const mod=x=>((x%29)+29)%29;
const H=(a,b)=>[mod(a-b),mod(a+b)];
function gp(w){
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith("ING",i)){out.push(21);i+=3;continue}
    if(w.startsWith("IO",i)){out.push(27);i+=2;continue}
    const t=toks.find(x=>w.startsWith(x.s,i)); assert.ok(t,w.slice(i));
    out.push(t.i);i+=t.s.length;
  }
  return out;
}
function shell(v){
  const out=[];
  for(let l=0,r=v.length-1;l<r;l++,r--) out.push(...H(v[l],v[r]));
  if(v.length%2) out.push(v[(v.length-1)/2]);
  return out;
}
const junction=v=>v.length>=4&&shell(v)[1]===shell(v)[2];
const clear=signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/).slice(1).join("\n");
const words=clear.split(/[^A-Za-z0-9]+/)
  .filter(x=>/^[A-Za-z]+$/.test(x))
  .map((word,i)=>({i,word:word.toUpperCase(),gp:gp(word)}));
assert.equal(words.length,43);
const hits=words.filter(x=>junction(x.gp)).map(x=>({
  i:x.i,word:x.word,gp:x.gp,shell:shell(x.gp)
}));
assert.deepEqual(hits,[
  {i:35,word:"FOUND",gp:[0,3,1,9,23],shell:[6,23,23,12,1]},
  {i:36,word:"GOOD",gp:[6,3,3,23],shell:[12,0,0,6]},
  {i:37,word:"LUCK",gp:[20,1,5,5],shell:[15,25,25,6]},
]);

// One source-state shell grammar covers all three recovered words.
const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2};
assert.deepEqual(hits[0].shell,[state.a,state.p,state.p,mod(state.K*state.a),mod(state.a-state.g)]);
assert.deepEqual(hits[1].shell,[mod(state.K*state.a),0,0,state.a]);
assert.deepEqual(hits[2].shell,[state.b,mod(state.p+state.K),mod(state.p+state.K),state.a]);

// Exact p0 candidate inverses already established independently.
const candidates=[
 {word:"FOUND",cipher:[12,2,11,10,2],key:[12,28,10,1,8]},
 {word:"GOOD",cipher:[24,21,26,14],key:[18,18,23,20]},
 {word:"LUCK",cipher:[8,17,9,27],key:[17,16,4,22]},
];
for(const row of candidates){
  const plain=row.cipher.map((v,i)=>mod(v-row.key[i]));
  assert.deepEqual(plain,gp(row.word));
  assert.equal(junction(plain),true);
  assert.equal(junction(row.cipher),false);
}

// Controls: the junction rule is not rare enough to be evidence by itself.
function stats(text){
  const ws=(text.match(/[A-Za-z]+/g)||[]).map(gp);
  let eligible=0,hitCount=0,maxRun=0,run=0;
  for(const v of ws){
    if(v.length<4){run=0;continue}
    eligible++;
    if(junction(v)){hitCount++;run++;maxRun=Math.max(maxRun,run)} else run=0;
  }
  return {eligible,hits:hitCount,maxRun};
}
const controls={
  lp1:stats(read("resources/liber-primus/lp1-plaintext-reference.txt")),
  gibran:stats(read("resources/control/gibran_prophet_58585.txt")),
  shakespeare:stats(read("resources/control/shakespeare_first300k.txt")),
  emerson:stats(read("resources/control/emerson_essays_2944.txt")),
};
assert.deepEqual(controls.lp1,{eligible:469,hits:9,maxRun:1});
assert.deepEqual(controls.gibran,{eligible:7572,hits:403,maxRun:2});
assert.deepEqual(controls.shakespeare,{eligible:27471,hits:1358,maxRun:3});
assert.deepEqual(controls.emerson,{eligible:37629,hits:1356,maxRun:2});

console.log(JSON.stringify({
 status:"PASS",
 classification:"mechanism compression: under frozen H, FOUND GOOD LUCK are exactly the only authenticated 2016 words with equal outer/inner shell junction coordinates, form the only three-word hit run, and each shell is a compact p28-DH state expression; ordinary-language controls show the equality alone is not proof",
 signedHits:hits,
 sourceState:state,
 controls
},null,2));
