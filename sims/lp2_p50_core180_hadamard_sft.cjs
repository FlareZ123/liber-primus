"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
/** @param {number} x */
const mod = x => (x % 29 + 29) % 29;
/** @param {number} x @param {number} y */
const H = (x,y) => [mod(x-y), mod(x+y)];
/** @param {number} u @param {number} v */
const inverse = (u,v) => [mod(15*(u+v)), mod(15*(v-u))];
/** @param {number[]} xs @param {(x:number,y:number)=>number[]} fn */
const pairs = (xs,fn) => Array.from({length:xs.length/2},(_,i)=>fn(xs[2*i],xs[2*i+1])).flat();
/** @param {any} grid @param {any} corpus */
function test(grid,corpus) {
  const p56=corpus.pages.find(p=>p.page===56).indices;
  const p57=corpus.pages.find(p=>p.page===57).indices;
  assert.equal(p56.length,85); assert.equal(p57.length,95);
  assert.equal(p56[56],0);
  /** @type {number[]} */
  const primes=[];
  for(let n=2;primes.length<84;n++) if(!primes.some(p=>n%p===0)) primes.push(n);
  let clock=0;
  const plain56=p56.map((c,i)=>i===56?0:mod(c-primes[clock++]+1));
  assert.equal(clock,84);
  assert.deepEqual(plain56.slice(0,5),[24,9,18,9,23]);
  clock=0;
  assert.deepEqual(plain56.map((p,i)=>i===56?0:mod(p+primes[clock++]-1)),p56);
  const known=plain56.concat(p57);
  for(let x=0;x<29;x++) for(let y=0;y<29;y++) assert.deepEqual(inverse(...H(x,y)),[x,y]);
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert.equal(tokens.length,256);
  const addresses=Array.from({length:256},(_,i)=>i).filter(i=>i>=8&&i<248&&i%8>0&&i%8<7);
  assert.equal(addresses.length,180);
  const results=[59,60].map(radix=>{
    const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
    assert.equal(alphabet.length,radix);
    const residues=addresses.map(i=>{
      const t=tokens[i],a=alphabet.indexOf(t[0]),b=alphabet.indexOf(t[1]);
      assert(a>=0&&b>=0);
      const n=radix*a+b;
      if(radix===60) assert.equal(n,grid.bytes[i]);
      return mod(n);
    });
    // Plant actual known native runes as inverse-paired numeral tokens, not as a synthetic text score.
    const plantedTokens=pairs(known,inverse).map(n=>alphabet[0]+alphabet[n]);
    const planted=plantedTokens.map(t=>mod(radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1])));
    assert.deepEqual(pairs(planted,H),known);
    const actual=pairs(residues,H);
    assert.deepEqual(pairs(actual,inverse),residues);
    const matches=actual.map((x,i)=>x===known[i]?i:-1).filter(i=>i>=0);
    return {radix,firstPair:{addresses:addresses.slice(0,2),tokens:addresses.slice(0,2).map(i=>tokens[i]),input:residues.slice(0,2),output:actual.slice(0,2),expected:known.slice(0,2)},matches,p56Matches:matches.filter(i=>i<85).length,p57Matches:matches.filter(i=>i>=85).length,actual};
  });
  assert.deepEqual(results.map(r=>r.matches.length),[6,11]);
  return {p56Length:85,p57Length:95,p56Replay:85,positivePlant:180,exhaustivePairReplay:841,known,results,verdict:"Both frozen H receivers rejected; no perimeter decoding."};
}
if(require.main===module){
  const root=path.resolve(__dirname,"..");
  const read=p=>JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus",p),"utf8"));
  console.log(JSON.stringify(test(read("lp2-grid-256.json"),read("lp2-corpus.json")),null,2));
}
module.exports={test};
