'use strict';
/**
 * Direct 86-marker Base64 side-channel versus the solved 64-byte AN END hash.
 * Exact maximum over every unknown fixed 64-symbol bijection, not a
 * language score. Hypothesis is postselected; no LP2 plaintext is recovered.
 * Run: node sims/doublet_base64_anend_gate.cjs (Node 22, no dependencies).
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const AN_END='36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4';
const SECTIONS=[729,1145,1738,1894,1021,1433,1680,3316];

/**
 * Exact Hungarian maximum-weight bipartite assignment over 64 input and
 * 64 output classes. Its optimum is the maximum agreement under ANY
 * single fixed bijection of the candidate residue alphabet.
 * @param {number[]} input
 * @param {number[]} output
 */
function maximumAgreement(input,output){
  assert.equal(input.length,output.length);
  const n=64,w=Array.from({length:n},()=>Array(n).fill(0));
  for(let i=0;i<input.length;i++){
    assert(input[i]>=0&&input[i]<64&&output[i]>=0&&output[i]<64);
    w[input[i]][output[i]]++;
  }
  const u=Array(n+1).fill(0),v=Array(n+1).fill(0),
    p=Array(n+1).fill(0),way=Array(n+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i;
    let j0=0;
    const minv=Array(n+1).fill(Infinity);
    const used=Array(n+1).fill(false);
    do{
      used[j0]=true;
      const row=p[j0];
      let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++)if(!used[j]){
        const cost=-w[row-1][j-1]-u[row]-v[j];
        if(cost<minv[j]){minv[j]=cost;way[j]=j0;}
        if(minv[j]<delta){delta=minv[j];j1=j;}
      }
      for(let j=0;j<=n;j++){
        if(used[j]){u[p[j]]+=delta;v[j]-=delta;}
        else minv[j]-=delta;
      }
      j0=j1;
    }while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  let score=0;
  for(let j=1;j<=n;j++)if(p[j])score+=w[p[j]-1][j-1];
  return score;
}

/** @param {number[]} C Original canonical 12,956 GP indices. */
function markers(C){
  assert.equal(C.length,12956);
  const starts=[0];
  for(const n of SECTIONS)starts.push(starts.at(-1)+n);
  assert.equal(starts.at(-1),C.length);
  const events=[];
  for(let i=1;i<C.length;i++){
    if(C[i]!==C[i-1])continue;
    const sid=starts.findIndex((x,j)=>j<8&&i>=x&&i<starts[j+1]);
    assert(sid>=0);
    events.push({pos:i,rune:C[i],sid,start:starts[sid]});
  }
  assert.equal(events.length,86);
  return events;
}

/** @param {string} hash Original solved LP2 p56 128-character digest. */
function sextets(hash){
  assert.match(hash,/^[a-f0-9]{128}$/);
  const bits=hash.match(/../g).map(x=>Number.parseInt(x,16).toString(2).padStart(8,'0')).join('');
  const out=Array.from({length:86},(_,i)=>Number.parseInt(
    bits.slice(i*6,i*6+6).padEnd(6,'0'),2));
  assert.equal(out.at(-1)%16,0);
  return out;
}

/** Matching known-secret plant; the optimal secret permutation is hidden. */
function positive(){
  let seed=0x1264a6e0;
  const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
  const pi=Array.from({length:64},(_,i)=>i);
  for(let i=63;i>0;i--){
    const j=next()%(i+1);
    [pi[i],pi[j]]=[pi[j],pi[i]];
  }
  const input=Array.from({length:86},()=>next()%64);
  const encoded=input.map(x=>pi[x]);
  assert.equal(maximumAgreement(input,encoded),86);
  return {plantedSymbols:86,blindBestMatches:86};
}

/** @param {number[]} C Canonical original LP2 ciphertext. */
function analyze(C){
  const events=markers(C),target=sextets(AN_END);
  const gaps=events.map((e,i)=>e.pos-(i?events[i-1].pos:-1));
  const localGaps=events.map((e,i)=>e.pos-(
    i&&events[i-1].sid===e.sid?events[i-1].pos:e.start-1));
  const readings={
    globalPosition:events.map(e=>e.pos%64),
    globalGap:gaps.map(x=>x%64),
    sectionPosition:events.map(e=>(e.pos-e.start)%64),
    sectionGap:localGaps.map(x=>x%64),
    repeatedRune:events.map(e=>e.rune),
    globalGapPlusRune:events.map((e,i)=>(gaps[i]+e.rune)%64)
  };
  const cases=[];
  for(const [reading,values] of Object.entries(readings)){
    for(const reverse of [false,true]){
      const x=reverse?values.slice().reverse():values;
      const score=maximumAgreement(x,target);
      cases.push({reading,reverse,bestPossibleMatches:score,
        forcedMismatches:86-score,distinctInputs:new Set(x).size});
    }
  }
  cases.sort((a,b)=>b.bestPossibleMatches-a.bestPossibleMatches);
  assert.equal(cases.length,12);
  assert(cases.every(x=>x.bestPossibleMatches<86));
  const plant=positive();
  return {originalRunes:C.length,repeatedGlyphEvents:events.length,
    digestBytes:64,base64UnpaddedSextets:target.length,
    hypotheses:cases.length,top:cases[0],cases,plant,
    conclusion:'None of these literal marker-value/position/gap residue channels directly encodes the authentic AN END hash with one unknown fixed Base64 alphabet. Stateful/keyed or unrelated payloads remain untested.'};
}
if(require.main===module){
  const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
  const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  process.stdout.write(JSON.stringify(analyze(C),null,2)+'\n');
}
module.exports={analyze,maximumAgreement,markers,sextets,positive};
