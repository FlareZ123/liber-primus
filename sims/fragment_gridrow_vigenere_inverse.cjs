"use strict";
/**
 * Test a source-aligned 8-byte repeating pad: each 13-dot-delimited LP2
 * fragment receives the corresponding row of the printed 32x8 base-60
 * table, with the five-dot black-marker/de-Bruijn order as the strongest
 * source-constrained row mapping.
 *
 * Run from repository root: node sims/fragment_gridrow_vigenere_inverse.cjs
 * Node 22, CommonJS, no dependencies. The mapping is a hypothesis, not an
 * authenticated historical key.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/base60-grid.json").byte_rows;
const pages=corpus.pages.filter(p=>p.page<56);
const C=pages.flatMap(p=>p.indices);
const mod=(a,n)=>(a%n+n)%n;
assert.equal(C.length,12956);
assert.equal(grid.length,32);
assert(grid.every(row=>row.length===8&&row.every(v=>v>=0&&v<=255)));

/** Build the exact 32 source fragments delimited by all original 13-dot marks. */
function sourceFragments(){
  const events=[];
  for(const page of ink.pages){
    const p=corpus.pages[page.page];
    assert.equal(page.rune_count,p.indices.length);
    for(const span of page.red_spans||[]){
      for(let i=0;i<span.length;i++){
        assert.equal(corpus.runes[p.indices[span.start+i]],[...span.runes][i]);
        events.push({page:page.page,offset:span.start+i,kind:1});
      }
    }
    for(const mark of page.large_punctuation||[])
      if(mark[1]===13)events.push({page:page.page,offset:mark[0],kind:0});
  }
  events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
  assert.equal(events.length,256);
  let current=0,red=0,ei=0;
  const bounds=[0],lengths=[];
  for(const pg of corpus.pages)for(let i=0;i<=pg.indices.length;i++){
    while(ei<events.length&&events[ei].page===pg.page&&events[ei].offset===i){
      if(events[ei].kind===0){lengths.push(red);red=0;bounds.push(current);}
      else red++;
      ei++;
    }
    if(i<pg.indices.length)current++;
  }
  lengths.push(red);
  assert.equal(ei,256);
  assert.equal(lengths.length,32);
  assert.equal(bounds.length,32);
  assert.equal(bounds[28],12956);
  assert.equal(lengths.slice(0,28).reduce((a,b)=>a+b,0),12956);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  assert.equal(Math.max(...lengths),59);
  return {events,bounds,lengths};
}
const {events,bounds,lengths}=sourceFragments();

/** Reconstruct the source-compatible five-bit row order. */
let seed=31;
const lfsr=[];
while(!lfsr.includes(seed)){
  lfsr.push(seed);
  let x=seed&18,parity=0;
  while(x){parity^=x&1;x>>>=1;}
  seed=((seed<<1)&31)|parity;
}
assert.equal(lfsr.length,31);
assert.equal(seed,31);
const insertion=lfsr.indexOf(16)+1;
const deBruijn=[...lfsr.slice(0,insertion),0,...lfsr.slice(insertion)];
assert.equal(deBruijn.length,32);
const marks=ink.pages.flatMap(p=>(p.large_punctuation||[])
  .filter(m=>m[1]===13).map(m=>({page:p.page,position:m[0],ink:m[2]})));
assert.equal(marks.length,31);
const blackMarkIndex=marks.findIndex(m=>m.ink==="black");
assert.equal(blackMarkIndex,7);
assert.deepEqual(marks[7],{page:7,position:194,ink:"black"});
assert.deepEqual(marks[8],{page:7,position:194,ink:"red"});
const zeroFragment=blackMarkIndex+1;
assert.equal(bounds[zeroFragment],bounds[zeroFragment+1]);
const rotation=mod(deBruijn.indexOf(0)-zeroFragment,32);
const blackAnchored=[...deBruijn.slice(rotation),...deBruijn.slice(0,rotation)];
assert.equal(blackAnchored[zeroFragment],0);
const rowOrders=[
  ["printed",Array.from({length:32},(_,i)=>i)],
  ["black-anchored-debruijn",blackAnchored]
];
for(const [,order] of rowOrders)
  assert.deepEqual(order.slice().sort((a,b)=>a-b),Array.from({length:32},(_,i)=>i));

/**
 * Direct GP29 additive pad or GP28 predecessor-exclusion register.
 * Key phase resets at each source fragment; each fragment cycles its own
 * eight bytes. In GP28 mode the first ciphertext rune is the literal IV,
 * and a repeated ciphertext rune is the transparent marker 28.
 */
function transform(input,rowOrder,family,projection,sign,encode){
  const out=new Array(input.length);
  for(let f=0;f<28;f++){
    const start=bounds[f],end=bounds[f+1],row=grid[rowOrder[f]];
    let previous=-1;
    for(let i=start;i<end;i++){
      const b=row[(i-start)%8];
      const period=family==="add"?29:28;
      const k=projection==="mod"?b%period:Math.floor(period*b/256);
      const value=input[i];
      let next;
      if(family==="add"){
        next=mod(value+(encode?-1:1)*sign*k,29);
      }else if(previous<0){
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
function translit(values){
  return values.slice(0,120).map(v=>corpus.translit[v]).join("");
}
function run(){
  const variants=[];
  for(const [orderName,order] of rowOrders)
    for(const family of ["add","exclude"])
      for(const projection of ["mod","scaled"])
        for(const sign of [-1,1]){
          const decoded=transform(C,order,family,projection,sign,false);
          assert.deepEqual(transform(decoded,order,family,projection,sign,true),C);
          variants.push({orderName,family,projection,sign,ioc:ioc(decoded),
            prefix:translit(decoded)});
        }
  variants.sort((a,b)=>b.ioc-a.ioc);
  const markerCount=Array.from({length:28},(_,f)=>{
    let n=0;
    for(let i=bounds[f]+1;i<bounds[f+1];i++)if(C[i]===C[i-1])n++;
    return n;
  }).reduce((a,b)=>a+b,0);
  // Mechanics-only positive plants: exact forward/reverse under each register.
  const control=corpus.pages.find(p=>p.page===57).indices;
  const gp29Plant=Array.from({length:C.length},(_,i)=>control[i%control.length]);
  const gp28Plant=Array.from({length:C.length},(_,i)=>i%157===27?28:control[i%control.length]%28);
  let plantChecks=0;
  for(const [orderName,order] of rowOrders)
    for(const projection of ["mod","scaled"])
      for(const sign of [-1,1]){
        const a=transform(gp29Plant,order,"add",projection,sign,true);
        assert.deepEqual(transform(a,order,"add",projection,sign,false),gp29Plant);
        const b=transform(gp28Plant,order,"exclude",projection,sign,true);
        assert.deepEqual(transform(b,order,"exclude",projection,sign,false),gp28Plant);
        plantChecks+=2;
      }
  return {
    classification:"bounded original-input negative; no unknown plaintext or authentic key",
    source:{originalRunes:C.length,events:events.length,redRunes:225,
      thirteenDotMarks:31,fragments:lengths.length,unsolvedFragments:28,
      fragmentLengths:lengths,unsolvedBoundary:bounds[28],
      rowOrders:rowOrders.map(([name,order])=>({name,order})),
      gridRows:grid.length,gridColumns:grid[0].length},
    originalIoC:ioc(C),fragmentResetAdjacentRepeatMarkers:markerCount,
    modelCount:variants.length,mechanicsPlantChecks:plantChecks,
    variants
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sourceFragments,transform,ioc,run};
