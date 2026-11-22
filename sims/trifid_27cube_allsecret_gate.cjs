'use strict';
/**
 * Exact all-secret LP2 Trifid 27-cube capacity bound, Node 22 CommonJS.
 * Run: node sims/trifid_27cube_allsecret_gate.cjs
 * No external dependencies and no file writes.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
assert.equal(original.length, 12956);
const core = original.filter((x) => x !== 27 && x !== 28);
assert.equal(core.length, 12026);

/** @param {number[]} v @param {number} k @returns {number} */
function top(v,k) {
  return v.slice().sort((a,b) => b-a).slice(0,k).reduce((s,x) => s+x,0);
}

/**
 * Exact integer maximum of any 9 rows by 9 columns of a nonnegative 27x27 matrix.
 * Branch bound relaxes the shared-column constraint separately within each row.
 * @param {number[][]} m
 * @returns {{value:number,nodes:number}}
 */
function rectangle(m) {
  const order=Array.from({length:27},(_,i)=>i)
    .sort((a,b)=>m.reduce((sum,r)=>sum+r[b]-r[a],0));
  const suffix=Array.from({length:27},()=>
    Array.from({length:28},()=>Array(10).fill(0)));
  for(let r=0;r<27;r++)for(let i=0;i<27;i++){
    const tail=order.slice(i).map((j)=>m[r][j]).sort((a,b)=>b-a);
    for(let k=1;k<=9;k++)suffix[r][i][k]=suffix[r][i][k-1]+(tail[k-1]||0);
  }
  const rows=Array(27).fill(0),initial=Array(27).fill(0);
  for(let j=0;j<9;j++)for(let r=0;r<27;r++)initial[r]+=m[r][order[j]];
  let value=top(initial,9),nodes=0;
  /** @param {number} pos @param {number} chosen @returns {void} */
  function search(pos,chosen){
    nodes++;
    if(chosen===9){value=Math.max(value,top(rows,9));return;}
    const need=9-chosen;
    if(27-pos===need){
      const forced=rows.slice();
      for(let j=pos;j<27;j++)for(let r=0;r<27;r++)forced[r]+=m[r][order[j]];
      value=Math.max(value,top(forced,9));return;
    }
    const upper=Array.from({length:27},(_,r)=>rows[r]+suffix[r][pos][need]);
    if(top(upper,9)<=value)return;
    for(let r=0;r<27;r++)rows[r]+=m[r][order[pos]];
    search(pos+1,chosen+1);
    for(let r=0;r<27;r++)rows[r]-=m[r][order[pos]];
    search(pos+1,chosen);
  }
  search(0,0);return {value,nodes};
}

/**
 * Both native Trifid decryption and its inverse give nine ciphertext triples
 * per complete 27-symbol block; each tuple contributes to three output layers.
 * Arbitrarily relax the unknown secret cube's 9-symbol coordinate slices.
 * @param {'standard'|'reverse'} direction
 * @returns {{direction:string,maximum:number,topNine:number[],perFirst:number[],nodes:number,tail:number}}
 */
function bound(direction){
  const tensor=new Uint16Array(27*27*27);
  for(let block=0;block+27<=core.length;block+=27){
    for(let j=0;j<9;j++){
      const x=core[block+(direction==='standard'?j:3*j)];
      const y=core[block+(direction==='standard'?9+j:3*j+1)];
      const z=core[block+(direction==='standard'?18+j:3*j+2)];
      tensor[(x*27+y)*27+z]++;
    }
  }
  const perFirst=[];let nodes=0;
  for(let x=0;x<27;x++){
    const m=Array.from({length:27},(_,y)=>
      Array.from({length:27},(_,z)=>tensor[(x*27+y)*27+z]));
    const fit=rectangle(m);perFirst.push(fit.value);nodes+=fit.nodes;
  }
  const tail=core.length%27;
  const topNine=perFirst.slice().sort((a,b)=>b-a).slice(0,9);
  return {direction,maximum:3*top(perFirst,9)+tail,topNine,perFirst,nodes,tail};
}

/** @returns {number[]} */
function secretCube(){
  let s=0x33012014;
  const draw=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
  const p=Array.from({length:27},(_,i)=>i);
  for(let i=26;i>0;i--){const j=draw()%(i+1);[p[i],p[j]]=[p[j],p[i]];}
  return p;
}

/**
 * 27-ary Trifid forward and inverse on a continuous core, period27.
 * @param {number[]} v @param {number[]} cube
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function transform(v,cube,encrypt,period=27){
  const rank=Array(27);cube.forEach((x,i)=>{rank[x]=i;});
  const output=[];
  for(let i=0;i<v.length;i+=period){
    const b=v.slice(i,i+period),n=b.length;
    const digits=b.flatMap((x)=>{const q=rank[x];return [Math.floor(q/9),Math.floor(q/3)%3,q%3];});
    const mixed=Array.from({length:3*n},(_,k)=>encrypt
      ?digits[3*(k%n)+Math.floor(k/n)]
      :digits[(k%3)*n+Math.floor(k/3)]);
    for(let k=0;k<n;k++)output.push(cube[9*mixed[3*k]+3*mixed[3*k+1]+mixed[3*k+2]]);
  }
  return output;
}

/**
 * Original GP indices 27,28 are passed through with no clock advance.
 * @param {number[]} v @param {number[]} cube
 * @param {'standard'|'reverse'} direction
 * @param {boolean} encrypt
 * @returns {number[]}
 */
function apply(v,cube,direction,encrypt,period=27){
  const part=v.filter((x)=>x!==27&&x!==28);
  const coded=transform(part,cube,(direction==='standard')===encrypt,period);
  let j=0;return v.map((x)=>x===27||x===28?x:coded[j++]);
}

/** @param {string} raw @returns {number[]} */
function gp(raw){
  const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const words=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').match(/[A-Z]+/g)||[];
  const out=[];
  for(const w of words)for(let i=0;i<w.length;){
    const t=tok.find((x)=>w.startsWith(x.s,i));
    if(t){out.push(t.i);i+=t.s.length;}else i++;
  }
  return out;
}

/** @param {number[]} v @param {number} length @returns {{minE:number,windows:number}} */
function windowE(v,length){
  assert.ok(v.length>=length);
  let cur=0;for(let i=0;i<length;i++)cur+=Number(v[i]===18);
  let minE=cur;
  for(let i=length;i<v.length;i++){
    cur+=Number(v[i]===18)-Number(v[i-length]===18);
    minE=Math.min(minE,cur);
  }
  return {minE,windows:v.length-length+1};
}
function main(){
  const standard=bound('standard'),reverse=bound('reverse');
  assert.equal(standard.maximum,1337);
  assert.equal(reverse.maximum,1340);
  const bypassCounts=[27,28].map((a)=>original.filter((x)=>x===a).length);
  assert.ok(Math.max(...bypassCounts)<standard.maximum);
  const files=['resources/control/shakespeare_first300k.txt',
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/emerson_essays_2944.txt'];
  const references=Object.fromEntries(files.map((f)=>[f,windowE(gp(read(f)),original.length)]));
  assert.deepEqual(files.map((f)=>references[f].minE),[1404,1414,1486]);
  const control=gp(read(files[0])).slice(0,original.length),cube=secretCube();
  const plants=[];
  for(const direction of ['standard','reverse']){
    const generated=apply(control,cube,direction,true);
    assert.deepEqual(apply(generated,cube,direction,false),control);
    const originalInverse=apply(original,cube,direction,false);
    assert.deepEqual(apply(originalInverse,cube,direction,true),original);
    plants.push({direction,recovered:control.length,reencrypted:generated.length,
      originalRoundTrip:original.length,keyProvenanceFromRoundTrip:false});
  }
  return {status:'conditional direct-GP exclusion, no authenticated key or plaintext',
    alphabet:'27 secret cube cells, GP IA/EA direct passthrough',
    clock:'continuous 27-rune blocks after removing passthrough',
    originalLength:original.length,coreLength:core.length,bypassCounts,
    standard,reverse,references,plants,
    caveats:'Other bypass glyphs, page/word resets, extra encryption layers and non-GP plaintext are untested'};
}
if(require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={main,bound,rectangle,apply,transform,gp};
