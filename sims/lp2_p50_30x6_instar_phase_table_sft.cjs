"use strict";
/**
 * Source-constrained p50 interior / INSTAR phase-table hypothesis.
 *
 * Observable clue chain:
 *   - The 32x8 base60 token grid spans LP2 pp.49-51.
 *   - The p57 poem says to "shed our own circumferences"; removing one-cell
 *     border leaves a 30x6 interior (180 cells).
 *   - GP29 has 29 symbols; 30 rows can be 29 runes plus a separator.
 *   - "INSTAR" is a six-letter word repeated by the p57 poem / 2013 audio.
 *
 * Hypothesis tested: the 30x6 interior is a symbol-dependent, six-phase
 * shift/substitution table. Row c is the current GP29 symbol; column j is the
 * INSTAR phase; the cell value is reduced mod 29. The phase either advances
 * every rune or holds on literal F. Column order is natural INSTAR or the
 * standard keyword-rank order. This is a bounded hypothesis, not an established
 * reading. The weakest assumption is interpreting the base60 cell as a mod-29
 * action; only source-selected variants are tested.
 *
 * Pinned source commit: ba3e23405607786150be78f02e92f7dac03df560
 * Run with: node sims/lp2_p50_30x6_instar_phase_table_sft.cjs
 */
const assert = require("node:assert/strict");

const BASE = "https://raw.githubusercontent.com/FlareZ123/liber-primus/ba3e23405607786150be78f02e92f7dac03df560/";
const MOD = 29;
const GP_LETTERS = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const DIGRAPHS = ["TH","NG","EO","OE","AE","IA","EA"];
const mod = x => ((x % MOD) + MOD) % MOD;

async function fetchText(path) {
  const response = await fetch(BASE + path, {redirect:"follow"});
  assert.ok(response.ok, `HTTP ${response.status} fetching ${path}`);
  return response.text();
}
function encodeEnglish(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, "");
  const out = [];
  for (let i=0;i<s.length;i++) {
    const pair=s.slice(i,i+2);
    if (DIGRAPHS.includes(pair)) {
      const idx = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28}[pair];
      out.push(idx); i++;
    } else {
      out.push(GP_LETTERS[s[i]]);
    }
  }
  return out;
}
function trainTrigram(text) {
  const seq=encodeEnglish(text);
  const uni=new Uint32Array(MOD), bi=new Uint32Array(MOD*MOD), tri=new Uint32Array(MOD*MOD*MOD);
  for(let i=0;i<seq.length;i++){
    uni[seq[i]]++;
    if(i>0) bi[seq[i-1]*MOD+seq[i]]++;
    if(i>1) tri[(seq[i-2]*MOD+seq[i-1])*MOD+seq[i]]++;
  }
  const uniLog=new Float64Array(MOD), triLog=new Float64Array(MOD*MOD*MOD);
  for(let c=0;c<MOD;c++) uniLog[c]=Math.log((uni[c]+1)/(seq.length+MOD));
  const alpha=0.25;
  for(let a=0;a<MOD;a++) for(let b=0;b<MOD;b++){
    const context=bi[a*MOD+b];
    const base=(context+MOD*alpha);
    for(let c=0;c<MOD;c++){
      const idx=(a*MOD+b)*MOD+c;
      triLog[idx]=Math.log((tri[idx]+alpha)/(base));
    }
  }
  return {triLog,uniLog};
}
function score(seq,model){
  let total=0;
  for(let i=2;i<seq.length;i++) total+=model.triLog[(seq[i-2]*MOD+seq[i-1])*MOD+seq[i]];
  return total/Math.max(1,seq.length-2);
}
function decode(seq,translit){return Array.from(seq,x=>translit[x]).join("");}
function apply(cipher,matrix,mode,sign,holdF,columnOrder){
  const out=new Uint8Array(cipher.length);
  let phase=0;
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i], value=matrix[c][columnOrder[phase]];
    if(mode==="direct") out[i]=value;
    else out[i]=mod(c+sign*value);
    if(!holdF || c!==0) phase=(phase+1)%6;
  }
  return out;
}
async function main(){
  const [corpusText,gridText,controlText]=await Promise.all([
    fetchText("resources/liber-primus/lp2-corpus.json"),
    fetchText("resources/liber-primus/lp2-grid-256.json"),
    fetchText("resources/control/shakespeare_first300k.txt")
  ]);
  const corpus=JSON.parse(corpusText), grid=JSON.parse(gridText);
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert.equal(tokens.length,256);
  assert.equal(grid.alphabet.length,60);
  const values=tokens.map(t=>{
    assert.equal(t.length,2);
    const a=grid.alphabet.indexOf(t[0]),b=grid.alphabet.indexOf(t[1]);
    assert.ok(a>=0&&b>=0);
    return 60*a+b;
  });
  const rows=Array.from({length:32},(_,r)=>values.slice(r*8,r*8+8));
  const matrix=rows.slice(1,31).map(row=>row.slice(1,7).map(v=>v%MOD));
  assert.equal(matrix.length,30);
  assert.ok(matrix.every(r=>r.length===6));
  const cipher=corpus.pages.filter(p=>p.page>=0&&p.page<=55).flatMap(p=>p.indices);
  assert.equal(cipher.length,12956);
  assert.ok(cipher.every(x=>x>=0&&x<MOD));
  const model=trainTrigram(controlText);
  const translit=corpus.translit;
  const baseline=score(cipher,model);
  const colOrders=[
    {name:"INSTAR-natural",order:[0,1,2,3,4,5]},
    {name:"INSTAR-keyword-rank",order:[4,0,1,5,2,3]}
  ];
  const results=[];
  for(const col of colOrders){
    for(const holdF of [false,true]){
      for(const mode of ["add","subtract","direct"]){
        const sign=mode==="add"?1:mode==="subtract"?-1:0;
        const plain=apply(cipher,matrix,mode,sign,holdF,col.order);
        results.push({
          mode,holdF,columnOrder:col.name,
          score:score(plain,model),
          preview:decode(plain.slice(0,360),translit),
          tail:decode(plain.slice(-180),translit),
          uniqueSymbols:new Set(plain).size
        });
      }
    }
  }
  results.sort((a,b)=>b.score-a.score);
  // Histogram-preserving row-label null: permute the 29 rune rows, keep the
  // extra separator row fixed, and correct for the same 12 tested variants.
  const rng = (()=>{let s=0x3301;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};})();
  const nullBest=[];
  for(let rep=0;rep<1000;rep++){
    const perm=Array.from({length:29},(_,i)=>i);
    for(let i=perm.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}
    const permMatrix=perm.map(i=>matrix[i]).concat([matrix[29]]);
    let best=-Infinity;
    for(const col of colOrders) for(const holdF of [false,true]) for(const mode of ["add","subtract","direct"]){
      const sign=mode==="add"?1:mode==="subtract"?-1:0;
      const plain=apply(cipher,permMatrix,mode,sign,holdF,col.order);
      const s=score(plain,model); if(s>best) best=s;
    }
    nullBest.push(best);
  }
  nullBest.sort((a,b)=>a-b);
  const observedBest=results[0].score;
  const q=p=>nullBest[Math.floor(p*(nullBest.length-1))];
  const nullSummary={
    replicates:nullBest.length,
    bestObserved:observedBest,
    median:q(.5),q95:q(.95),q99:q(.99),maximum:nullBest[nullBest.length-1],
    empiricalP:(nullBest.filter(x=>x>=observedBest).length+1)/(nullBest.length+1)
  };
  console.log(JSON.stringify({
    sourceCommit:"ba3e23405607786150be78f02e92f7dac03df560",
    sourceGrid:{shape:grid.shape,tokenCount:tokens.length,radix:grid.byte_rule,perimeter:76,interior:"30x6"},
    clue:"p57 'shed our own circumferences' + six-letter INSTAR + 29-symbol GP29",
    operation:"row=current cipher symbol; column=INSTAR phase; cell mod 29",
    scope:"unknown LP2 p0-55, 12,956 GP29 indices",
    phaseRules:["advance every rune","hold on literal F"],
    columnOrders:colOrders,
    baselineTrigramScore:baseline,
    nullSummary,
    results
  },null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
