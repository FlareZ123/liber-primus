"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8").replace(/\r/g,"");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans=read("resources/liber-primus/lp2-transcription.txt");
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const ri=new Map(corpus.runes.map((r,i)=>[r,i]));
const toks=corpus.translit.map((s,v)=>({s,v})).sort((a,b)=>b.s.length-a.s.length);
const mod=x=>((x%29)+29)%29;
const H=(a,b)=>[mod(a-b),mod(a+b)];
const HInv=(d,s)=>[mod(15*(d+s)),mod(15*(s-d))];
function gp(word){
  const x=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
  const out=[]; for(let i=0;i<x.length;){const t=toks.find(q=>x.startsWith(q.s,i));assert.ok(t,"unmapped "+x.slice(i));out.push(t.v);i+=t.s.length;} return out;
}
const gp0=w=>gp(w).reduce((a,b)=>a+b,0);
const words=signed.split("-----BEGIN PGP SIGNATURE-----")[0].split(/\n\n/u).slice(1).join("\n").split(/[^A-Za-z0-9]+/u).filter(x=>/^[A-Za-z]+$/u.test(x)).map((w,i)=>({index0:i,ordinal:i+1,word:w.toUpperCase(),gp0:gp0(w)}));
assert.equal(words.length,43);

// New independent pointer: established original mayfly counts 270,273,265 and local 13 frame.
const counts=[24,25,26].map(p=>corpus.pages.find(x=>x.page===p).runic_count);
assert.deepEqual(counts,[270,273,265]);
const diffs=[Math.abs(counts[0]-counts[1]),Math.abs(counts[0]-counts[2]),Math.abs(counts[1]-counts[2])].sort((a,b)=>a-b);
assert.deepEqual(diffs,[3,5,8]);
const localFrame=13; // original-image adjudicated in the mayfly/Fibonacci source report.
const pageOrdinal=diffs.reduce((a,b)=>a+b,0)+localFrame;
assert.equal(pageOrdinal,29);
const projectPage=pageOrdinal-1;
assert.equal(projectPage,28);
assert.equal(words[pageOrdinal-1].word,"THE");
assert.equal(words[pageOrdinal].word,"DIRECTION");
assert.equal(words[29].word,"DIRECTION"); // zero-based source[29] rival.

// Rebuild canonical complete words by project page, preserving page-crossing words.
const parts=trans.split(/^\s*%\s*$/m),segs=parts.slice(0,55);
const pages=segs.map((_,s)=>({page:s>=50?s+1:s,words:[],offset:0}));
let cur=[],ss=0,es=0,start=0;
function flush(){if(!cur.length)return;if(ss===es){const pg=pages[ss];pg.words.push({ordinal:pg.words.length+1,start,length:cur.length,values:cur.slice()});}cur=[];}
for(let s=0;s<segs.length;s++)for(const ch of [...segs[s]]){
  const v=ri.get(ch); if(v!==undefined){if(!cur.length){ss=s;start=pages[s].offset;}es=s;cur.push(v);pages[s].offset++;}
  else if(ch==="/"||/\s/u.test(ch)){} else flush();
}
flush();
const byPage=new Map(pages.map(p=>[p.page,p.words]));

// Existing p28 READ OUT candidate, then the held-out THE packet under the same +6 source-rise predictor.
const p28=corpus.pages.find(p=>p.page===28).indices;
const pow=(b,e,m)=>{let r=1n,x=BigInt(b),n=BigInt(e),M=BigInt(m);while(n){if(n&1n)r=r*x%M;x=x*x%M;n>>=1n;}return Number(r);};
const readout=[pow(p28[134],3,29),...p28.slice(135,140).map(v=>pow(v,27,29))];
assert.deepEqual(readout,[4,28,23,3,1,16]); // READOUT
const source29=words[28], partner35=words[34];
assert.equal(source29.word,"THE"); assert.equal(partner35.word,"BE");
const rise29=mod(partner35.gp0-source29.gp0);
assert.equal(rise29,15);
const key29=HInv(rise29,0),pred29=gp(source29.word).map((v,i)=>mod(v+key29[i]));
assert.deepEqual(key29,[22,7]); assert.deepEqual(pred29,[24,25]);
assert.deepEqual(p28.slice(140,142),pred29);

// Complete one-based source-ordinal -> same-number physical-page family.
const hitRows=[];
const tested=[];
for(const src of words){
  if(src.index0+6>=words.length)continue;
  const plain=gp(src.word); if(plain.length!==2)continue;
  const rise=mod(words[src.index0+6].gp0-src.gp0),key=HInv(rise,0);
  const pred=plain.map((v,i)=>mod(v+key[i]));
  const targetProject=src.ordinal-1;
  const matches=(byPage.get(targetProject)||[]).filter(w=>w.values.length===2&&w.values.every((v,i)=>v===pred[i]));
  const row={ordinal:src.ordinal,word:src.word,projectPage:targetProject,physicalPage:targetProject+1,rise,pred,matches:matches.map(w=>w.start)};
  tested.push(row); if(matches.length)hitRows.push(row);
}
assert.deepEqual(hitRows.map(r=>[r.ordinal,r.word,r.physicalPage,r.matches]),[[29,"THE",29,[140]],[35,"BE",35,[4]]]);

// One-based follower DIRECTION30 -> physical page30 -> canonical word30 packet.
const direction=words[29]; assert.deepEqual([direction.ordinal,direction.word],[30,"DIRECTION"]);
const physical30Project=direction.ordinal-1; assert.equal(physical30Project,29);
const w30=byPage.get(physical30Project).find(w=>w.ordinal===30);
assert.ok(w30); assert.deepEqual(w30.values,[11,26,11,18]);
// canonical H4 serialization is [x0-x3,x1-x2,x1+x2,x0+x3].
const h4=[mod(w30.values[0]-w30.values[3]),mod(w30.values[1]-w30.values[2]),mod(w30.values[1]+w30.values[2]),mod(w30.values[0]+w30.values[3])];
assert.deepEqual(h4,[22,15,8,0]);

const p33Rises=[1,7,34];
const p33ZeroLabels=p33Rises.map(n=>words[n].word);
const p33OneLabels=p33Rises.map(n=>words[n-1].word);
assert.deepEqual(p33ZeroLabels,["THE","THE","BE"]);
assert.deepEqual(p33OneLabels,["HELLO","SEEKS","WILL"]);

const out={
  schema:1,
  classification:"source-origin cross-route gate; no new unknown plaintext claimed",
  mayflyPointer:{counts,diffs,localFrame,pageOrdinal,projectPage},
  signedOneBased:{word29:words[28].word,word30:words[29].word,word35:words[34].word,zeroBased29Rival:words[29].word},
  readout:{projectPage:28,physicalPage:29,decoded:"READOUT",heldoutNext:"THE",heldoutCipher:pred29},
  sameOrdinalTwoRuneFamily:{tested:tested.map(r=>({ordinal:r.ordinal,word:r.word,matches:r.matches})),hits:hitRows},
  follower:{sourceOrdinal:30,word:"DIRECTION",physicalPage:30,projectPage:29,canonicalWordOrdinal:30,cipher:w30.values,h4},
  originConflict:{mayflyPointer29:{ordinalTargetProjectPage:28,zeroIndexTargetProjectPage:29},p33Rise34:{oneBasedTargetProjectPage:33,zeroIndexTargetProjectPage:34,zeroBasedLabels:p33ZeroLabels,oneBasedLabels:p33OneLabels}},
  consequence:"The p28/p34 held-out source-to-page hits are exactly one-based word29->physical page29 and word35->physical page35. The independently recovered mayfly pointer29 lands on the first hit. Thus this route can be stated without zero-based signed-word dereferencing; READ OUT THE on physical page29 aligns with one-based word29 THE, whose immediate follower is one-based word30 DIRECTION and therefore physical page30/project p29. This does not authenticate the signed message as the intended register by itself. It also exposes a cross-route origin conflict: the mayfly/Fibonacci route interprets 29 ordinally (29th page = p28), whereas the promoted p33 body-rise route needs zero-based labels/pages for [1,7,34] = THE,THE,BE and p34. A single global number-to-page/source-origin convention cannot justify both routes unchanged."
};
const s=JSON.stringify(out,null,2);console.log(s);
if(process.env.RUNNER_TEMP)fs.writeFileSync(path.join(process.env.RUNNER_TEMP,"source-test-output.json"),s);
