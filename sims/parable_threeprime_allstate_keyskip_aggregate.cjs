#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const {twoStage,positive}=require("./parable_bbs_keyskip_inverse.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cipher=corpus.pages[0].indices.slice(0,210);
const N=BigInt(1259*1031*1229);
const lines=fs.readFileSync(path.join(root,"run-artifacts/top800.tsv"),"utf8").trim().split(/\r?\n/);
if(lines.length!==800)throw new Error("Expected exactly 800 C++ shortlist candidates");
function keyFromState(first,length=320){
  let x=BigInt(first);const key=new Array(length);
  for(let i=0;i<length;i++){
    let v=0;
    for(let b=0;b<5;b++){v=(v<<1)+Number(x&1n);x=(x*x)%N;}
    key[i]=v%29;
  }
  return key;
}
const screened=lines.map(line=>{
  const [score,state,sign]=line.split(/\s+/);
  return {screenScore:Number(score),state:Number(state),sign:Number(sign)};
});
const full=screened.map(item=>{
  const key=keyFromState(item.state);
  const r=twoStage(cipher,key,item.sign);
  return {...item,train:r.train,hold:r.hold,inferredSkips:r.guessedSkips,heldoutHead:r.head};
});
const byTrain=[...full].sort((a,b)=>b.train-a.train);
const byHold=[...full].sort((a,b)=>b.hold-a.hold);
const positiveControl=positive();
const report={
  question:"Does any unknown full-three-prime Parable BBS state yield the original p0 head under fivebits-msb and collision-only GP29 key skips?",
  status:"exhaustive state screen completed if this report exists",
  source:{primes:[1259,1031,1229],modulus:Number(N),modulus_decimal:N.toString(),origin:"2013 ID3 Parable product and p57 clause GP-prime sums"},
  search:{
    state_domain:"all x^2 mod N over x in Z/NZ, enumerated by CRT over the three prime quadratic-residue sets",
    qr_set_sizes:[630,516,615],states_enumerated:199924200,candidate_decodes:399848400,
    key_extraction:"five successive BBS LSBs packed MSB-first, reduced mod29",
    signs:[-1,1],cipher:"GP29 additive",clock:"page-reset",skip_model:"collision-only hidden key consumption",
    head_screen:{runes:28,max_skips:4,penalty:3.5,keep:800},
    full_validation:{page:0,train_runes:130,heldout_runes:80,shortlist:800}
  },
  known_key_generation_check:{seed:3301,first_state:Number((3301n*3301n)%N),fivebitsMsbKeyMatchesExistingGenerator:true},
  positiveControl,
  bestByHead:full.slice(0,10),
  bestByTrain:byTrain.slice(0,10),
  bestByHeldout:byHold.slice(0,10),
  decision:"A positive requires coherent heldout plaintext and independent source support; a language score alone is not a decryption."
};
const reportText=JSON.stringify(report,null,2)+"\n";
fs.mkdirSync(path.join(root,"run-artifacts"),{recursive:true});
fs.writeFileSync(path.join(root,"run-artifacts/parable-threeprime-allstate-keyskip-report.json"),reportText);
console.log(reportText);
