"use strict";
/**
 * Key-independent page-local polygraphic cipher exclusion.
 * Across n=2..7, a bijection on complete n-rune blocks preserves equality,
 * even when the bijection changes arbitrarily between physical pages.
 * Exact GP-English sources and reversible randomly keyed blocks, followed by
 * 81% stochastic immediate-repeat rewriting, provide sensitivity controls.
 * Run: node sims/polygraphic_block_collision_invariant.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,".."),N=29,ROUNDS=300;
const DIGRAPHS={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const LETTERS={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const read=file=>fs.readFileSync(path.join(ROOT,file),"utf8");
/** @param {string} input @returns {number[]} */
function encode(input){
  const s=input.toUpperCase().replace(/[^A-Z]/g,""),out=[];
  for(let i=0;i<s.length;i++){
    const di=DIGRAPHS[s.slice(i,i+2)];
    if(di===undefined)out.push(LETTERS[s[i]]);
    else{out.push(di);i++;}
  }
  return out;
}
/** @param {number} seed @returns {() => number} */
function random(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** @param {() => number} rng @param {number} n @returns {number} */
const randInt=(rng,n)=>Math.floor(rng()*n);
/** @param {number[]} a @param {() => number} rng @returns {number[]} */
function shuffle(a,rng){
  for(let i=a.length-1;i>0;i--){const j=randInt(rng,i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
/**
 * Exact count of within-page unordered equal complete blocks.
 * @param {number[][]} pages @param {number} width @param {number} phase
 * @returns {number}
 */
function collisions(pages,width,phase){
  let total=0;
  for(const p of pages){
    const hist=new Map();
    for(let at=phase;at+width<=p.length;at+=width){
      let code=0;
      for(let j=0;j<width;j++)code=29*code+p[at+j];
      hist.set(code,(hist.get(code)||0)+1);
    }
    for(const count of hist.values())total+=count*(count-1)/2;
  }
  return total;
}
/** @param {number[][]} pages @returns {number} */
function doublets(pages){
  let n=0;
  for(const p of pages)for(let i=1;i<p.length;i++)n+=Number(p[i]===p[i-1]);
  return n;
}
/** @param {number[]} src @param {number[][]} template @param {() => number} rng @returns {number[][]} */
function drawPages(src,template,rng){
  return template.map(p=>{
    const at=randInt(rng,src.length-p.length+1);
    return src.slice(at,at+p.length);
  });
}
/**
 * A reversible block bijection: per-page permutation of rune coordinates
 * and an independent permutation of 29 rune labels at every coordinate.
 * The final optional overwrite is a separate, declared nuisance model.
 * @param {number[][]} pages @param {number} width @param {number} phase
 * @param {() => number} rng
 * @returns {{pre:number[][],post:number[][]}}
 */
function encrypt(pages,width,phase,rng){
  const pre=[],post=[];
  for(const input of pages){
    const order=shuffle(Array.from({length:width},(_,i)=>i),rng);
    const rows=Array.from({length:width},
      ()=>shuffle(Array.from({length:29},(_,i)=>i),rng));
    const encoded=input.slice();
    for(let at=phase;at+width<=input.length;at+=width)
      for(let j=0;j<width;j++)
        encoded[at+j]=rows[j][input[at+order[j]]];
    pre.push(encoded);
    const fixed=encoded.slice();
    for(let i=1;i<fixed.length;i++)
      if(fixed[i]===fixed[i-1]&&rng()<0.81)
        fixed[i]=(fixed[i]+1+randInt(rng,28))%N;
    post.push(fixed);
  }
  return {pre,post};
}
/** @param {number[]} arr */
function summary(arr){
  const sorted=arr.slice().sort((a,b)=>a-b);
  return {min:sorted[0],median:sorted[sorted.length>>1],
    max:sorted[sorted.length-1],
    mean:arr.reduce((s,x)=>s+x,0)/arr.length};
}
function main(){
  const doc=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const pages=doc.pages.filter(p=>p.status==="unsolved"&&p.indices.length)
    .map(p=>p.indices.slice());
  assert.equal(pages.length,55);
  assert.equal(pages.flat().length,12956);
  assert.equal(doublets(pages),86);
  const authors=[
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Emerson","resources/control/emerson_essays_2944.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"]
  ].map(([name,file])=>({name,runes:encode(read(file))}));
  const widths=[2,3,4,5,6,7];
  const original=Object.fromEntries(widths.map(w=>[w,
    Array.from({length:w},(_,phase)=>collisions(pages,w,phase))]));
  const all=[];
  for(const [sourceNumber,src] of authors.entries()){
    assert.ok(src.runes.length>20000);
    const rng=random(0x52d44a89^((sourceNumber+1)*0x9e3779b9));
    const records=new Map(widths.map(w=>[w,{raw:[],plant:[],repeats:[],checks:0}]));
    for(let t=0;t<ROUNDS;t++){
      const plaintext=drawPages(src.runes,pages,rng);
      for(const w of widths){
        const rec=records.get(w);
        rec.raw.push(Math.min(...Array.from(
          {length:w},(_,phase)=>collisions(plaintext,w,phase))));
        const phase=t%w;
        const enc=encrypt(plaintext,w,phase,rng);
        if(t===0){
          assert.equal(collisions(plaintext,w,phase),collisions(enc.pre,w,phase),
            "block bijection invariant width="+w);
          rec.checks++;
        }
        rec.plant.push(collisions(enc.post,w,phase));
        rec.repeats.push(doublets(enc.post));
      }
    }
    for(const w of widths){
      const rec=records.get(w),worst=Math.max(...original[w]);
      all.push({source:src.name,source_runes:src.runes.length,width:w,
        original_by_phase:original[w],original_worst_phase:worst,
        raw_source_best_phase:summary(rec.raw),
        repaired_block_cipher:summary(rec.plant),
        repaired_adjacent_doublets:summary(rec.repeats),
        counts_at_or_below_original_worst:{
          raw:rec.raw.filter(x=>x<=worst).length,
          planted:rec.plant.filter(x=>x<=worst).length,
          trials:ROUNDS
        },exact_bijection_checks:rec.checks});
    }
  }
  console.log(JSON.stringify({
    hypothesis:"arbitrary per-page bijective block substitution of width 2..7",
    pages:pages.length,runes:12956,original_doublets:86,
    source_rounds_per_author:ROUNDS,
    control_rule:"source minima over every phase vs original maxima; planted at true phase",
    results:all
  },null,2));
}
main();
