"use strict";
/**
 * Exact original 16x16 Hill and feedback inversion from LP2's
 * 225 red runes plus 31 13-dot glyphs (a 15x15 core + a 31-cell rim).
 *
 * Run: node sims/red_256_rim_hill_inverse.cjs
 * Node.js 22 CommonJS. Input source files are immutable.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {events}=require("./red_256_event_key_inverse.cjs");
const root=path.resolve(__dirname,"..");
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const english=fs.readFileSync(path.join(root,
  "resources/control/shakespeare_first300k.txt"),"utf8");
const n=16,field=29,mod=x=>(x%field+field)%field;

/** @param {number[][]} a */
function transpose(a){return a[0].map((_,j)=>a.map(r=>r[j]));}
/** @param {number[][]} a */
function inverse(a){
  const width=a.length;
  const q=a.map((row,i)=>row.concat(
    Array.from({length:width},(_,j)=>Number(i===j))));
  let rank=0;
  for(let c=0;c<width;c++){
    let p=rank;
    while(p<width&&q[p][c]===0)p++;
    if(p===width)continue;
    [q[rank],q[p]]=[q[p],q[rank]];
    let pivot=1;
    while(mod(q[rank][c]*pivot)!==1)pivot++;
    for(let j=0;j<2*width;j++)q[rank][j]=mod(q[rank][j]*pivot);
    for(let i=0;i<width;i++)if(i!==rank){
      const factor=q[i][c];
      for(let j=0;j<2*width;j++)q[i][j]=mod(q[i][j]-factor*q[rank][j]);
    }
    rank++;
  }
  return rank===width?q.map(row=>row.slice(width)):null;
}
/** @param {number[][]} matrix @param {number[]} vector */
function mul(matrix,vector) {
  return matrix.map(row=>mod(row.reduce(
    (sum,v,j)=>sum+v*vector[j],0)));
}
const add=(a,b)=>a.map((v,i)=>mod(v+b[i]));
const sub=(a,b)=>a.map((v,i)=>mod(v-b[i]));
/** @param {number[]} v */
function ioc(v) {
  const c=new Array(29).fill(0);
  for(const x of v)c[x]++;
  return c.reduce((z,x)=>z+x*(x-1),0)/(v.length*(v.length-1));
}
const stream=events();
const red=stream.filter(x=>x.kind===1);
const mark=stream.filter(x=>x.kind===0);
assert.equal(red.length,225);
assert.equal(mark.length,31);

/**
 * 13-dot markers may supply a fixed visible border value 13, or 31
 * source-attached predecessor glyphs. Page-initial marker reads its
 * page's first glyph because no page-local predecessor exists.
 */
function sourceMatrices() {
  const matrices=[];
  for(const alphabet of ["index","prime"]) {
    const convert=v=>alphabet==="index"?v:mod(corpus.prime[v]);
    const v=red.map(x=>convert(x.value));
    const borderSources={
      dots13:Array(31).fill(13),
      predecessor:mark.map(x=>{
        const list=corpus.pages[x.page].indices;
        return convert(list[x.offset===0?0:x.offset-1]);
      })
    };
    const grid=Array.from({length:15},(_,i)=>v.slice(i*15,(i+1)*15));
    for(const [kind,b] of Object.entries(borderSources)){
      let a=grid.map((row,i)=>row.concat([b[i]]));
      a.push(b.slice(15));
      assert.equal(a.length,n);
      matrices.push({alphabet,kind,orientation:"rows",matrix:a});
      matrices.push({alphabet,kind,orientation:"columns",matrix:transpose(a)});
    }
    const evt=stream.map(x=>x.kind?convert(x.value):13);
    let a=Array.from({length:n},(_,i)=>evt.slice(i*n,(i+1)*n));
    matrices.push({alphabet,kind:"chronological",orientation:"rows",matrix:a});
    matrices.push({alphabet,kind:"chronological",orientation:"columns",
      matrix:transpose(a)});
  }
  assert.equal(matrices.length,12);
  return matrices;
}
const originalPages=corpus.pages.filter(p=>p.status==="unsolved"&&
  p.indices.length).map(p=>p.indices);
const original=originalPages.flat();
assert.equal(originalPages.length,55);
assert.equal(original.length,12956);

/** @param {number[]} plain @param {number[]} prevC
 * @param {number[]} prevP @param {number[][]} m @param {string} mode */
function encryptBlock(plain,prevC,prevP,m,mode) {
  if(mode==="ECB")return mul(m,plain);
  if(mode==="CBC")return mul(m,add(plain,prevC));
  if(mode==="CFB")return add(plain,mul(m,prevC));
  if(mode==="PCBC")return mul(m,add(add(plain,prevC),prevP));
  throw Error("unknown mode");
}
function decryptBlock(c,prevC,prevP,m,inv,mode) {
  if(mode==="ECB")return mul(inv,c);
  if(mode==="CBC")return sub(mul(inv,c),prevC);
  if(mode==="CFB")return sub(c,mul(m,prevC));
  if(mode==="PCBC")return sub(sub(mul(inv,c),prevC),prevP);
  throw Error("unknown mode");
}

/**
 * Fully lossless for all 12,956 original positions; incomplete blocks
 * and phase prefixes retain their original symbols.
 * @param {number[][]} groups
 * @param {number[][]} m
 * @param {number[][]} inv
 * @param {string} mode
 * @param {number} phase
 * @param {boolean} encode
 */
function apply(groups,m,inv,mode,phase,encode) {
  const output=[],scored=[];
  for(const group of groups){
    const dest=group.slice();
    let prevC=Array(n).fill(0),prevP=Array(n).fill(0);
    for(let start=phase;start+n<=group.length;start+=n){
      const old=group.slice(start,start+n);
      const next=encode?encryptBlock(old,prevC,prevP,m,mode):
        decryptBlock(old,prevC,prevP,m,inv,mode);
      for(let j=0;j<n;j++)dest[start+j]=next[j];
      scored.push(...next);
      prevC=encode?next:old;
      prevP=encode?old:next;
    }
    output.push(dest);
  }
  return {output,scored};
}
/** Greedy GP source encoding for native control. */
function englishGP(s) {
  const text=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const labels=corpus.translit.map((s,i)=>({s,i}))
    .sort((a,b)=>b.s.length-a.s.length);
  const out=[];
  for(let i=0;i<text.length;) {
    const token=labels.find(t=>text.startsWith(t.s,i));
    if(token){out.push(token.i);i+=token.s.length;}
    else i++;
  }
  return out;
}
const gp=englishGP(english);
assert.ok(gp.length>=12956);
const modes=["ECB","CBC","CFB","PCBC"];

function run(){
  const stats=[],plants=[],matrixStatuses=[];
  for(const spec of sourceMatrices()){
    const inv=inverse(spec.matrix);
    const id={alphabet:spec.alphabet,kind:spec.kind,
      orientation:spec.orientation,rank:inv?16:"singular"};
    matrixStatuses.push(id);
    if(!inv)continue;
    for(const mode of modes)for(const clock of ["book","page"]){
      const groups=clock==="book"?[original]:originalPages;
      for(let phase=0;phase<16;phase++){
        const d=apply(groups,spec.matrix,inv,mode,phase,false);
        const cut=Math.floor(d.scored.length/2);
        stats.push({...id,mode,clock,phase,scored:d.scored.length,
          trainIoC:ioc(d.scored.slice(0,cut)),
          heldoutIoC:ioc(d.scored.slice(cut)),
          fullIoC:ioc(d.scored)});
      }
      const lens=groups.map(g=>g.length);
      let pos=1500;
      const nativeGroups=lens.map(len=>{
        const a=gp.slice(pos,pos+len);
        pos+=len;
        return a;
      });
      const plant=apply(nativeGroups,spec.matrix,inv,mode,0,true);
      const recovered=apply(plant.output,spec.matrix,inv,mode,0,false);
      assert.deepEqual(recovered.output,nativeGroups);
      const rerecorded=apply(recovered.output,spec.matrix,inv,mode,0,true);
      assert.deepEqual(rerecorded.output,plant.output);
      plants.push({...id,mode,clock,exact:nativeGroups.flat().length,
        referenceIoC:ioc(nativeGroups.flat())});
    }
  }
  const train=stats.slice().sort((a,b)=>b.trainIoC-a.trainIoC);
  const hold=stats.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC);
  const selected=train[0];
  const mat=sourceMatrices().find(x=>x.alphabet===selected.alphabet&&
    x.kind===selected.kind&&x.orientation===selected.orientation);
  const inv=inverse(mat.matrix);
  const groups=selected.clock==="book"?[original]:originalPages;
  const decoded=apply(groups,mat.matrix,inv,selected.mode,
    selected.phase,false);
  assert.deepEqual(apply(decoded.output,mat.matrix,inv,selected.mode,
    selected.phase,true).output,groups);
  return {study:"16x16 border/composite red-rune and stencil Hill inverse",
    red:225,marks:31,size:256,mod:29,original:original.length,
    sourceMatrixVariants:matrixStatuses,studied:stats.length,
    nativeControlIoC:ioc(gp),originalCipherIoC:ioc(original),
    originalTrainWinner:selected,
    maxOriginalHeldout:hold[0],
    rankPositive:matrixStatuses.filter(s=>s.rank===16).length,
    positiveCases:plants.length,
    positiveRecovered:plants.reduce((s,v)=>s+v.exact,0),
    originalWinningCaseRoundtrip:decoded.output.flat().length,
    conclusion:"No original GP-text recovered unless selected IoC approaches native reference"};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sourceMatrices,inverse,apply,ioc,run};
