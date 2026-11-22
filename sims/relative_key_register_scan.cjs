'use strict';
/**
 * Domain-adapted LP2 page28/page42 scale-four two-time-pad lexicon inversion.
 * Trains independent GP word tries and trigrams on Shakespeare, Emerson,
 * Gibran and mixed, and tests each on genuinely heldout literary plaintext
 * under a planted common key. No target rune is used for model training.
 *
 * Node.js 22, offline: node sims/relative_key_register_scan.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const {trainTrigram}=require('./relative_key_trigram_probe.cjs');
const {trainDictionary,invert}=require('./relative_key_dictionary_beam.cjs');
const ROOT=path.resolve(__dirname,'..'),MOD=29,SCALE=4;
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const corpora=[
  {name:'shakespeare',content:read('resources/control/shakespeare_first300k.txt'),split:240000},
  {name:'emerson',content:read('resources/control/emerson_essays_2944.txt'),split:350000},
  {name:'gibran',content:read('resources/control/gibran_prophet_58585.txt'),split:72000}
];
const mods=x=>((x%29)+29)%29;
const A=base.lp2Page(28),B=base.lp2Page(42);
const pages=[A,B],n=Math.min(A.xs.length,B.xs.length);
const seed=331003, WIDTH=7000;
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function plant(wordsA,wordsB){
  const a=base.stream(wordsA,269),b=base.stream(wordsB,269),random=rng(seed);
  if(a.xs.length!==269||b.xs.length!==269)return null;
  const key=Array.from({length:269},()=>Math.floor(random()*MOD));
  return {a:{...a,xs:a.xs.map((v,i)=>mods(SCALE*v+key[i]))},b:{...b,xs:b.xs.map((v,i)=>mods(SCALE*v+key[i]))},p:a.xs};
}
function scan(){
  const versions=corpora.map(source=>({
    name:source.name,
    train:base.corpusWords(source.content.slice(0,source.split)),
    held:base.corpusWords(source.content.slice(source.split))
  }));
  versions.push({name:'mixed-literary',
    train:versions.flatMap(x=>x.train),
    held:versions[1].held
  });
  const out=[];
  for(const candidate of versions){
    const lex=trainDictionary(candidate.train),lm=trainTrigram(candidate.train);
    const target=invert(A,B,lex,lm,{scale:SCALE,beam:WIDTH});
    const planted=plant(candidate.held.slice(0,400),candidate.held.slice(500,900));
    const positive=planted?invert(planted.a,planted.b,lex,lm,{scale:SCALE,beam:WIDTH}):{status:'insufficient-heldout'};
    let accuracy=positive.status==='success'?positive.p.filter((x,i)=>x===planted.p[i]).length/269:null;
    out.push({
      register:candidate.name,
      trainWords:candidate.train.length,
      lexiconSize:lex.vocabulary,
      actual:{
        status:target.status,score:target.score,oovWords:target.oovWords,
        p28:target.pText?.slice(0,380),p42:target.qText?.slice(0,380)
      },
      heldout:{
        status:positive.status,score:positive.score,oovWords:positive.oovWords,
        accuracy,opening:positive.pText?.slice(0,150)
      }
    });
  }
  return {hypothesis:'C28-C42=4*(P28-P42) mod 29',n,pages:[28,42],models:out,
    caveat:'Register selection is exploratory; no target-derived sentence or key verified. Inversion assumes literal rune-word lengths and one-to-one transformed plaintext.'};
}
if(require.main===module)console.log(JSON.stringify(scan(),null,2));
module.exports={scan};
