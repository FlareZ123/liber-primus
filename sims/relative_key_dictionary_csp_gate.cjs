"use strict";
/**
 * Exact dictionary-automaton constraint on the originally selected GP29
 * pages 28/42 factor-four relative-key pair, with arbitrary secret additive
 * key eliminated by subtraction. No plaintext recovery is asserted.
 *
 * 5,002 deduplicated Shakespeare GP word types train the exact dictionary.
 * Dynamic programming counts the minimum number of whole printed words
 * that must be out of dictionary to realize the observed difference stream.
 *
 * Node22 CommonJS. Run from the repository root:
 * node sims/relative_key_dictionary_csp_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript=read("resources/liber-primus/lp2-transcription.txt");
const source=read("resources/control/shakespeare_first300k.txt");
const runeMap=new Map(corpus.runes.map((ch,i)=>[ch,i]));
const gpTokens=corpus.translit.map((s,i)=>({s,i}))
  .sort((a,b)=>b.s.length-a.s.length);
const mod=x=>(x%29+29)%29;

/** @param {string} word @returns {number[]} */
function encode(word) {
  word=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let at=0;at<word.length;) {
    const t=gpTokens.find(t=>word.startsWith(t.s,at));
    assert.ok(t,"Source has canonical GP encoding for "+word+" at "+at);
    out.push(t.i);
    at+=t.s.length;
  }
  return out;
}
/** @param {string} text @returns {number[][]} */
function words(text) {
  return (text.match(/[A-Za-z]+/g)||[]).map(encode);
}
/** @param {number} page */
function physicalPage(page) {
  const src=transcript.split("%")[page>=51?page-1:page];
  const xs=[],start=[],end=[];
  let active=false;
  for(const ch of src) {
    if(runeMap.has(ch)) {
      xs.push(runeMap.get(ch));start.push(!active);
      end.push(false);active=true;
    } else if("-.$&§".includes(ch)) {
      if(end.length)end[end.length-1]=true;
      active=false;
    }
  }
  if(end.length)end[end.length-1]=true;
  assert.deepEqual(xs,corpus.pages[page].indices);
  return {xs,start,end};
}
/** @param {number[][]} textWords */
function dictionary(textWords) {
  const unique=new Set(textWords.map(w=>w.join(",")));
  const nodes=[{to:new Int32Array(29).fill(-1),end:false}];
  for(const key of unique) {
    let current=0;
    for(const raw of key.split(",")) {
      const symbol=Number(raw);
      if(nodes[current].to[symbol]===-1){
        nodes[current].to[symbol]=nodes.length;
        nodes.push({to:new Int32Array(29).fill(-1),end:false});
      }
      current=nodes[current].to[symbol];
    }
    nodes[current].end=true;
  }
  return {nodes,uniqueWords:unique.size};
}
/**
 * An exact minimum-cost product automaton over both printed word masks and
 * a common-pad-canceled difference D. Each stream follows the GP trie
 * until its first failure; an entire off-dictionary word then costs one
 * and becomes an unrestricted wildcard until the next printed boundary.
 *
 * At word end a nonterminal trie prefix likewise pays one; wildcards
 * do not pay twice. The result is a lower bound on dictionary violations
 * across all 29^n possible plaintext-pair assignments.
 *
 * @param {number[]} differences
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {{to:Int32Array,end:boolean}[]} nodes
 */
function minimumUnknownWords(differences,a,b,nodes) {
  let state=new Map([["0,0",0]]);
  let largestStateCount=0;
  for(let t=0;t<differences.length;t++){
    const next=new Map();
    for(const [key,loss] of state){
      const comma=key.indexOf(",");
      const u=Number(key.slice(0,comma));
      const v=Number(key.slice(comma+1));
      for(let x=0;x<29;x++){
        const y=mod(x-differences[t]);
        let nu=u<0?-1:nodes[u].to[x];
        let nv=v<0?-1:nodes[v].to[y];
        let cost=loss+Number(u>=0&&nu<0)+Number(v>=0&&nv<0);
        if(a.end[t]){
          if(nu>=0&&!nodes[nu].end)cost++;
          nu=0;
        }
        if(b.end[t]){
          if(nv>=0&&!nodes[nv].end)cost++;
          nv=0;
        }
        const nk=nu+","+nv;
        if(cost<(next.get(nk)??Infinity))next.set(nk,cost);
      }
    }
    state=next;
    largestStateCount=Math.max(largestStateCount,state.size);
  }
  return {minimum:Math.min(...state.values()),
    maxProductStates:largestStateCount};
}
/** @param {number} seed @returns {()=>number} */
function random(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {{end:boolean[]}} page @returns {number[]} */
function wordLengths(page) {
  const out=[];
  let count=0;
  for(const end of page.end){
    count++;
    if(end){out.push(count);count=0;}
  }
  if(count)out.push(count);
  return out;
}
/** @param {number[]} nums @returns {{minimum:number,maximum:number,mean:number,values:number[]}} */
function stats(nums) {
  return {minimum:Math.min(...nums),maximum:Math.max(...nums),
    mean:nums.reduce((x,y)=>x+y,0)/nums.length,values:nums};
}
function main(){
  const a=physicalPage(28),b=physicalPage(42);
  assert.deepEqual([a.xs.length,b.xs.length],[269,272]);
  const sourceWords=words(source.slice(0,240000));
  const heldoutWords=words(source.slice(240000));
  const dict=dictionary(sourceWords);
  assert.equal(dict.uniqueWords,5002);
  assert.equal(dict.nodes.length,13208);
  const n=Math.min(a.xs.length,b.xs.length);
  const inverseFour=22;
  assert.equal((4*inverseFour)%29,1);
  const differences=Array.from({length:n},(_,i)=>
    mod(inverseFour*(a.xs[i]-b.xs[i])));
  const original=minimumUnknownWords(differences,a,b,dict.nodes);
  assert.equal(original.minimum,26);

  const groups=new Map();
  for(const word of heldoutWords){
    if(!groups.has(word.length))groups.set(word.length,[]);
    groups.get(word.length).push(word);
  }
  const rand=random(0x3301abc1);
  /** @param {ReturnType<typeof physicalPage>} page */
  function sample(page){
    const stream=[];
    for(const length of wordLengths(page)){
      const choices=groups.get(length);
      assert.ok(choices&&choices.length,"heldout control supplies each printed word length");
      stream.push(...choices[rand()%choices.length]);
    }
    assert.equal(stream.length,page.xs.length);
    return stream;
  }

  const repeats=64,positive=[],nulls=[];
  for(let trial=0;trial<repeats;trial++){
    const p=sample(a),q=sample(b);
    // Real held-out source words under arbitrary hidden additive K: the
    // ciphertexts would be 4P+K and 4Q+K, so this difference cancels K.
    const syntheticD=Array.from({length:n},(_,i)=>mod(p[i]-q[i]));
    positive.push(minimumUnknownWords(syntheticD,a,b,dict.nodes).minimum);

    // Hist-matched permutation retains the *actual* 29-bin difference
    // profile for the source-selected page pair and scale four.
    const permuted=differences.slice();
    for(let j=n-1;j>0;j--){
      const k=rand()%(j+1);
      [permuted[j],permuted[k]]=[permuted[k],permuted[j]];
    }
    nulls.push(minimumUnknownWords(permuted,a,b,dict.nodes).minimum);
  }
  const controls=stats(positive), nullControls=stats(nulls);
  assert.ok(controls.maximum<original.minimum);
  assert.ok(original.minimum>=nullControls.minimum&&
    original.minimum<=nullControls.maximum);
  return {
    scope:"Exact 29-state joint dictionary feasibility for the fixed p28/42 factor-four relative key, no authentic plaintext recovery",
    source:{dictionaryWords:dict.uniqueWords,trieNodes:dict.nodes.length,
      sourceTrainCharacters:240000,heldoutCharacters:60000},
    original:{alignedRunes:n,wordCounts:[wordLengths(a).length,wordLengths(b).length],
      minimumUnknownWords:original.minimum,maxProductStates:original.maxProductStates},
    controls:{repetitions:repeats,seed:"0x3301abc1",
      independentEnglishHeldout:controls,
      fixedHistogramOriginalDifferencePermutations:nullControls,
      heldoutAtLeastOriginal:positive.filter(x=>x>=original.minimum).length,
      nullAtLeastOriginal:nulls.filter(x=>x>=original.minimum).length},
    interpretation:"The selected pair/scale's ordered word structure resembles histogram-permuted difference controls rather than new, length-matched English heldout controls. Unknown target vocabulary and source-selected page pair remain limiting assumptions."
  };
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={encode,words,physicalPage,dictionary,minimumUnknownWords,wordLengths,main};
