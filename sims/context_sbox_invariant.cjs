"use strict";
/**
 * Collision invariant for arbitrary ciphertext-context-conditioned substitutions.
 *
 * For context length k, C[t]=S[C[t-k]...[t-1]][P[t]], where each S row
 * is any fixed permutation of 29 GP rune values, shared across all pages.
 * Collision concentration within a context is exactly preserved by S.
 *
 * This program tests k=2 and k=3 with independent English-GP planted
 * controls and matched self-avoiding null streams. No packages required.
 *
 * Run: node sims/context_sbox_invariant.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const {toGematria, xorshift} = require("./previous_cipher_sbox_invariant.cjs");
const ROOT=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
const pages=corpus.pages.filter((p)=>p.status==="unsolved"&&p.indices.length>0).map((p)=>p.indices);
const source=toGematria(fs.readFileSync(path.join(ROOT,"resources","control","shakespeare_first300k.txt"),"utf8"));

/**
 * @param {number[][]} pageArrays
 * @param {number} order - number of prior ciphertext runes used as state
 * @returns {{ratio:number,collidingPairs:number,eligiblePairs:number,occupiedContexts:number}}
 */
function collision(pageArrays, order) {
  /** @type {Map<number,Uint16Array>} */
  const counts=new Map();
  for(const page of pageArrays) {
    for(let i=order;i<page.length;i++) {
      let state=0;
      for(let j=i-order;j<i;j++) state=state*29+page[j];
      let row=counts.get(state);
      if(!row) {row=new Uint16Array(29);counts.set(state,row);}
      row[page[i]]++;
    }
  }
  let numerator=0,denominator=0;
  for(const row of counts.values()) {
    let total=0;
    for(const v of row) {numerator+=v*(v-1);total+=v;}
    denominator+=total*(total-1);
  }
  return {ratio:numerator/denominator,collidingPairs:numerator/2,
    eligiblePairs:denominator/2,occupiedContexts:counts.size};
}

/** @param {()=>number} rng @returns {number[]} */
function permutation(rng) {
  const arr=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>0;i--) {
    const j=Math.floor(rng()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

/**
 * @param {number} order
 * @param {()=>number} rng
 * @param {"plant"|"null"} mode
 * @returns {number[][]}
 */
function simulate(order,rng,mode) {
  /** @type {Map<number,number[]>} */
  const substitutions=new Map();
  const generated=[];
  for(const original of pages) {
    const start=Math.floor(rng()*(source.length-original.length-1));
    const out=Array.from({length:order},()=>Math.floor(rng()*29));
    for(let t=order;t<original.length;t++) {
      let symbol;
      if(mode==="plant") {
        let state=0;
        for(let j=t-order;j<t;j++) state=state*29+out[j];
        let row=substitutions.get(state);
        if(!row) {row=permutation(rng);substitutions.set(state,row);}
        symbol=row[source[start+t]];
        if(symbol===out[t-1]&&rng()<0.81)
          symbol=(symbol+1+Math.floor(rng()*28))%29;
      } else {
        symbol=rng()<0.00667?out[t-1]:
          (out[t-1]+1+Math.floor(rng()*28))%29;
      }
      out.push(symbol);
    }
    generated.push(out);
  }
  return generated;
}

/**
 * @param {number[]} values
 * @param {number} observed
 */
function summary(values,observed) {
  const n=values.length;
  const mean=values.reduce((a,b)=>a+b,0)/n;
  const sd=Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/(n-1));
  return {mean,sd,min:Math.min(...values),max:Math.max(...values),
    pLower:(1+values.filter((v)=>v<=observed).length)/(n+1),
    pUpper:(1+values.filter((v)=>v>=observed).length)/(n+1)};
}

/**
 * @param {number} order
 * @param {number} seed
 * @param {number} trials
 */
function experiment(order,seed,trials) {
  const rng=xorshift(seed);
  const observed=collision(pages,order);
  const nulls=[];
  const plants=[];
  for(let i=0;i<trials;i++) {
    nulls.push(collision(simulate(order,rng,"null"),order).ratio);
    plants.push(collision(simulate(order,rng,"plant"),order).ratio);
  }
  return {order,seed:"0x"+seed.toString(16),trials,observed,
    null:summary(nulls,observed.ratio),
    plant:summary(plants,observed.ratio)};
}

function main() {
  const total=pages.reduce((n,page)=>n+page.length,0);
  if(pages.length!==55||total!==12956||source.length!==218800) {
    throw new Error("Expected checked-in LP2 and GP-English corpus sizes");
  }
  const output={model:"global arbitrary context-conditioned 29-symbol substitution",
    pages:pages.length,runes:total,sourceRunes:source.length,
    experiments:[experiment(2,0x1602aa6b,300),experiment(3,0x1603babe,200)],
    caveat:"English-like direct GP encoding; not arbitrary hidden state or external keystream"};
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module) main();
module.exports={collision,simulate,experiment};
