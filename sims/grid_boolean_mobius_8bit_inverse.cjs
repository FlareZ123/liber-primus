"use strict";
/**
 * Full 8-bit Boolean-lattice Mobius inverse of the printed 256-byte LP2 table.
 * The source clue is LP1's literal MOBIUS plus the 256=2^8 table size.
 * This is a distinct, weaker extension of the more directly motivated 5-bit
 * (32-row) study; no arbitrary bit permutation or table reordering is tried.
 *
 * Run from repository root: node sims/grid_boolean_mobius_8bit_inverse.cjs
 * Node 22, CommonJS, no third-party dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const grid=read("resources/liber-primus/base60-grid.json");
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const latin=read("resources/control/latin-vulgate-heldout-gp.json");
const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const PLANT=latin.runes.slice(0,2400);
const B=grid.byte_rows.flat();
const mod=(a,n)=>(a%n+n)%n;
assert.equal(C.length,12956);
assert.equal(B.length,256);
assert(B.every(x=>Number.isInteger(x)&&x>=0&&x<=255));
assert(PLANT.length===2400&&PLANT.every(x=>Number.isInteger(x)&&x>=0&&x<=28));

/** Reconstruct the exact 32 fragments delimited by all 31 original 13-dot marks. */
function fragmentBounds(){
  const marks=[];
  for(const page of ink.pages)
    for(const mark of page.large_punctuation||[])
      if(mark[1]===13)marks.push({page:page.page,offset:mark[0]});
  marks.sort((a,b)=>a.page-b.page||a.offset-b.offset);
  assert.equal(marks.length,31);
  let current=0,mi=0;
  const bounds=[0],lengths=[];
  for(const pg of corpus.pages)for(let i=0;i<=pg.indices.length;i++){
    while(mi<marks.length&&marks[mi].page===pg.page&&marks[mi].offset===i){
      lengths.push(current-bounds[bounds.length-1]);
      bounds.push(current);
      mi++;
    }
    if(i<pg.indices.length)current++;
  }
  lengths.push(current-bounds[bounds.length-1]);
  assert.equal(mi,31);
  assert.equal(bounds.length,32);
  assert.equal(lengths.length,32);
  assert.equal(bounds[28],12956);
  assert.equal(lengths.slice(0,28).reduce((a,b)=>a+b,0),12956);
  return {bounds,lengths};
}
const {bounds,lengths}=fragmentBounds();

/**
 * Full 8-dimensional Boolean Mobius inverse on the row-major 256-byte vector.
 * Subset/superset partial order; subtraction in Z/256 or XOR in characteristic 2.
 */
function inverse8(input,order,ring){
  const a=input.slice();
  for(let bit=0;bit<8;bit++)for(let x=0;x<256;x++){
    const has=(x&(1<<bit))!==0;
    if((order==="subset"&&has)||(order==="superset"&&!has)){
      const other=x^(1<<bit);
      a[x]=ring==="xor"?(a[x]^a[other]):mod(a[x]-a[other],256);
    }
  }
  return a;
}
function keyDigit(b,period,projection){
  return projection==="mod"?b%period:Math.floor(period*b/256);
}

/**
 * Direct GP29 additive or GP28 predecessor-exclusion inverse.
 * GP28's previous-ciphertext register resets at each 13-dot fragment.
 * Key phase is either book-global or reset at each fragment.
 */
function transform(input,key,family,projection,sign,clock,encode){
  const out=new Array(input.length);
  for(let f=0;f<28;f++){
    const start=bounds[f],end=bounds[f+1];
    let previous=-1;
    for(let i=start;i<end;i++){
      const ki=clock==="book"?i%256:(i-start)%256;
      const period=family==="add"?29:28;
      const k=keyDigit(key[ki],period,projection);
      const value=input[i];
      let next;
      if(family==="add"){
        next=mod(value+(encode?1:-1)*sign*k,29);
      }else if(i===start){
        next=value;
      }else if(encode){
        next=value===28?previous:mod(previous+1+mod(value+sign*k,28),29);
      }else{
        next=value===previous?28:mod(mod(value-previous-1,29)-sign*k,28);
      }
      out[i]=next;
      if(family==="exclude")previous=encode?next:value;
    }
  }
  return out;
}
function ioc(values){
  const counts=new Array(29).fill(0);
  for(const v of values)counts[v]++;
  return counts.reduce((s,c)=>s+c*(c-1),0)/(values.length*(values.length-1));
}
function prefix(values){
  return values.slice(0,160).map(v=>corpus.translit[v]).join("");
}
function run(){
  const variants=[],keyProperties=[];
  const plant29=Array.from({length:C.length},(_,i)=>PLANT[i%PLANT.length]);
  const plant28=Array.from({length:C.length},(_,i)=>
    i%157===27?28:PLANT[i%PLANT.length]%28);
  let plantChecks=0;
  for(const order of ["subset","superset"])
    for(const ring of ["mod256","xor"]){
      const key=inverse8(B,order,ring);
      const counts=new Array(256).fill(0);
      for(const byte of key)counts[byte]++;
      keyProperties.push({name:order+"-"+ring,unique:counts.filter(x=>x>0).length,
        maxMultiplicity:Math.max(...counts),fixedPoints:key.filter((v,i)=>v===i).length});
      for(const family of ["add","exclude"])
        for(const projection of ["mod","scaled"])
          for(const sign of [-1,1])
            for(const clock of ["book","fragment"]){
              const decoded=transform(C,key,family,projection,sign,clock,false);
              assert.deepEqual(transform(decoded,key,family,projection,sign,clock,true),C);
              variants.push({key:order+"-"+ring,family,projection,sign,clock,
                ioc:ioc(decoded),prefix:prefix(decoded)});
              const plant=family==="add"?plant29:plant28;
              const encoded=transform(plant,key,family,projection,sign,clock,true);
              assert.deepEqual(transform(encoded,key,family,projection,sign,clock,false),plant);
              plantChecks++;
            }
    }
  variants.sort((a,b)=>b.ioc-a.ioc);
  assert.equal(variants.length,64);
  return {
    classification:"bounded full-8-bit Mobius key negative; no unknown plaintext",
    source:{tableRows:32,tableColumns:8,tableBytes:B.length,
      originalRunes:C.length,thirteenDotFragments:bounds.length,
      unsolvedFragments:28,unsolvedEnd:bounds[28],fragmentLengths:lengths,
      operation:"8-bit Boolean Mobius inverse over row-major table vector"},
    originalIoC:ioc(C),keyProperties,variantCount:variants.length,plantChecks,variants
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={fragmentBounds,inverse8,transform,ioc,run};
