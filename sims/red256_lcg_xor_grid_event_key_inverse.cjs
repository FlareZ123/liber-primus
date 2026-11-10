"use strict";
/**
 * Source-derived two-input key hypothesis:
 *   key[i] = grid[state_i] XOR event[i]
 *   state_(i+1) = (13*state_i + 31) mod 256.
 *
 * The 13/31 constants are the retrospective five-dot border-mask reading.
 * Starts 0 (baseline) and 230 (the archived OutGuess seed) are tested;
 * 230 = 256 - 2*13 is a possible source relation, not an authenticated rule.
 *
 * Events are the chronological 225-red-rune + 31-thirteen-dot sequence.
 * Run from repository root: node sims/red256_lcg_xor_grid_event_key_inverse.cjs
 * Node 22, CommonJS, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/base60-grid.json").byte_rows.flat();
const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
const mod=(a,n)=>(a%n+n)%n;
assert.equal(C.length,12956);
assert.equal(grid.length,256);

/** Original chronological red-rune / thirteen-dot event stream. */
function sourceEvents(){
  const events=[];
  for(const page of ink.pages){
    const p=corpus.pages[page.page];
    assert.equal(page.rune_count,p.indices.length);
    for(const span of page.red_spans||[]){
      for(let i=0;i<span.length;i++){
        const value=p.indices[span.start+i];
        assert.equal(corpus.runes[value],[...span.runes][i]);
        events.push({page:page.page,offset:span.start+i,kind:1,value});
      }
    }
    for(const mark of page.large_punctuation||[])
      if(mark[1]===13)events.push({page:page.page,offset:mark[0],kind:0,value:29});
  }
  events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
  assert.equal(events.length,256);
  assert.equal(events.filter(e=>e.kind===1).length,225);
  assert.equal(events.filter(e=>e.kind===0).length,31);
  return events;
}
const events=sourceEvents();

/** Exact 32 fragments delimited by all 31 original thirteen-dot marks. */
function sourceBounds(){
  let current=0,ei=0;
  const bounds=[0],lengths=[];
  let red=0;
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
  assert.equal(bounds.length,32);
  assert.equal(lengths.length,32);
  assert.equal(bounds[28],12956);
  assert.equal(lengths.slice(0,28).reduce((a,b)=>a+b,0),12956);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  return {bounds,lengths};
}
const {bounds,lengths}=sourceBounds();

/** Full-period LCG order from the source-visible 13/31 masks. */
function lcgOrder(start){
  const order=[],seen=new Set();
  let state=start;
  for(let i=0;i<256;i++){
    assert(!seen.has(state));
    seen.add(state);
    order.push(state);
    state=(13*state+31)%256;
  }
  assert.equal(seen.size,256);
  assert.equal(state,start);
  return order;
}

/** Pair each chronological event with one LCG-ordered table byte by XOR. */
function deriveKey(start){
  const order=lcgOrder(start);
  const key=events.map((event,i)=>grid[order[i]]^event.value);
  assert.equal(key.length,256);
  return {order,key};
}

/**
 * Direct GP29 additive or GP28 predecessor-exclusion inverse.
 * GP28 previous-ciphertext state resets at every source fragment.
 * Key phase is either book-global or reset at each fragment.
 */
function transform(input,key,family,projection,sign,clock,encode){
  const out=new Array(input.length);
  for(let f=0;f<28;f++){
    const start=bounds[f],end=bounds[f+1];
    let previous=-1;
    for(let i=start;i<end;i++){
      const keyIndex=clock==="book"?i%256:(i-start)%256;
      const period=family==="add"?29:28;
      const byte=key[keyIndex];
      const k=projection==="mod"?byte%period:Math.floor(period*byte/256);
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
  const variants=[],seedSummaries=[];
  const control=corpus.pages.find(p=>p.page===57).indices;
  const plant29=Array.from({length:C.length},(_,i)=>control[i%control.length]);
  const plant28=Array.from({length:C.length},(_,i)=>
    i%157===27?28:control[i%control.length]%28);
  let plantChecks=0;
  for(const seedStart of [0,230]){
    const {order,key}=deriveKey(seedStart);
    seedSummaries.push({seedStart,lcgPeriod:order.length,keyFirst64:key.slice(0,64)});
    for(const family of ["add","exclude"])
      for(const projection of ["mod","scaled"])
        for(const sign of [-1,1])
          for(const clock of ["book","fragment"]){
            const decoded=transform(C,key,family,projection,sign,clock,false);
            assert.deepEqual(transform(decoded,key,family,projection,sign,clock,true),C);
            variants.push({seedStart,family,projection,sign,clock,ioc:ioc(decoded),prefix:prefix(decoded)});
            const plant=family==="add"?plant29:plant28;
            const encoded=transform(plant,key,family,projection,sign,clock,true);
            assert.deepEqual(transform(encoded,key,family,projection,sign,clock,false),plant);
            plantChecks++;
          }
  }
  variants.sort((a,b)=>b.ioc-a.ioc);
  return {
    classification:"bounded source-derived candidate; no unknown plaintext or authentic key",
    source:{events:events.length,redRunes:225,thirteenDotMarks:31,
      tableBytes:grid.length,fragmentLengths:lengths,fragmentCount:bounds.length,
      unsolvedFragments:28,unsolvedEnd:bounds[28],
      lcg:"state=(13*state+31) mod 256",starts:seedSummaries,
      outguessSeedRelation:"230 = 256 - 2*13"},
    originalIoC:ioc(C),modelCount:variants.length,plantChecks,variants
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={sourceEvents,sourceBounds,lcgOrder,deriveKey,transform,ioc,run};
