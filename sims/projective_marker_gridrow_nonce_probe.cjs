"use strict";
/**
 * Tests a source-anchored projective ordering of the 32 LP2 red fragments.
 * The 30 unique 13-dot sites are labeled by the P^1(F29) orbit of M0 from Ac24.
 * The black overprint at p7:194 receives the extra row 30; the trailing fragment
 * receives row 31. Each unsolved fragment uses its mapped 32x8 grid row as IV.
 * This is an intermediate hypothesis, not a claimed decryption.
 * Reproduce with Node.js 22 from repository root; no third-party dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");

const root=path.resolve(__dirname,"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/base60-grid.json");
const pages=corpus.pages.filter(p=>p.page<56);
const C=pages.flatMap(p=>p.indices);
assert.equal(C.length,12956);
assert.equal(grid.byte_rows.length,32);
assert(grid.byte_rows.every(x=>x.length===8));
const mod=(a,n)=>(a%n+n)%n;
const inv29=x=>{for(let i=1;i<29;i++)if(mod(x*i,29)===1)return i;throw new Error("noninvertible field element");};

// M0 is the p3/p39 red-triad projective map, in the established x=a/b chart.
const M0=[[23,13],[27,17]];
function projectiveStep(t) {
  if(t===null)return mod(M0[0][0]*inv29(M0[1][0]),29);
  const den=mod(M0[1][0]*t+M0[1][1],29);
  if(den===0)return null;
  return mod((M0[0][0]*t+M0[0][1])*inv29(den),29);
}
function projectiveOrbit(start=24) {
  const out=[];let t=start;
  for(let i=0;i<30;i++){out.push(t);t=projectiveStep(t);}
  assert.equal(t,start);
  assert.equal(new Set(out.map(x=>x===null?"inf":String(x))).size,30);
  assert(out.includes(null));
  assert.deepEqual(out.filter(x=>x!==null).slice().sort((a,b)=>a-b),Array.from({length:29},(_,i)=>i));
  assert.equal(out[0],24);
  assert.equal(out[7],25);
  assert.equal(out[8],27);
  assert.equal(out[17],null);
  assert.equal(out[26],28);
  return out;
}
const projectiveStates=projectiveOrbit(24);

/** @returns {{lengths:number[],bounds:number[],fragmentRows:number[],markerSites:object[],projectiveStates:(number|null)[]}} */
function originalFragments() {
  const events=[];
  for(const page of ink.pages) {
    const p=corpus.pages[page.page];
    assert.equal(page.rune_count,p.indices.length);
    for(const span of page.red_spans||[]) {
      for(let i=0;i<span.length;i++) {
        assert.equal(corpus.runes[p.indices[span.start+i]],[...span.runes][i]);
        events.push({page:page.page,offset:span.start+i,kind:1});
      }
    }
    for(const mark of page.large_punctuation||[])if(mark[1]===13)events.push({page:page.page,offset:mark[0],kind:0,color:mark[2]});
  }
  events.sort((a,b)=>a.page-b.page||a.offset-b.offset||a.kind-b.kind);
  assert.equal(events.length,256);
  const markerEvents=events.filter(e=>e.kind===0);
  assert.equal(markerEvents.length,31);
  const markerSites=[];
  for(const e of markerEvents) {
    const last=markerSites[markerSites.length-1];
    if(last&&last.page===e.page&&last.offset===e.offset)last.colors.push(e.color);
    else markerSites.push({page:e.page,offset:e.offset,colors:[e.color]});
  }
  assert.equal(markerSites.length,30);
  const overprint=markerSites.find(s=>s.page===7&&s.offset===194);
  assert.deepEqual(overprint.colors,["black","red"]);
  assert.equal(markerSites[7].page,7);
  assert.equal(markerSites[7].offset,194);
  assert.equal(markerSites[8].page,7);
  assert.equal(markerSites[8].offset,208);
  assert.equal(markerSites[17].page,32);
  assert.equal(markerSites[17].offset,121);
  assert.equal(markerSites[26].page,55);
  assert.equal(markerSites[26].offset,76);
  let stateIndex=0,lastKey=null,lastColor=null,currentState=null;
  const fragmentRows=[];
  for(const e of markerEvents) {
    const key=e.page+":"+e.offset;
    if(key===lastKey) {
      assert.equal(lastColor,"black");
      assert.equal(e.color,"red");
      assert.equal(currentState,25);
      fragmentRows.push(25); // canonical red layer at the duplicated state
    } else {
      const state=projectiveStates[stateIndex++];
      currentState=state;
      if(e.color==="black") {
        assert.equal(state,25);
        fragmentRows.push(30); // black overprint is the extra row
      } else fragmentRows.push(state===null?29:state);
    }
    lastKey=key;lastColor=e.color;
  }
  assert.equal(stateIndex,30);
  fragmentRows.push(31); // trailing fragment after the final marker
  assert.equal(fragmentRows.length,32);
  assert.deepEqual(fragmentRows,[24,22,13,4,2,9,12,30,25,27,15,26,19,20,16,21,8,23,29,3,18,5,10,6,7,0,11,28,1,14,17,31]);
  assert.deepEqual(fragmentRows.slice().sort((a,b)=>a-b),Array.from({length:32},(_,i)=>i));
  let current=0,red=0,ei=0;
  const lengths=[],bounds=[0];
  for(const pg of corpus.pages)for(let i=0;i<=pg.indices.length;i++) {
    while(ei<events.length&&events[ei].page===pg.page&&events[ei].offset===i) {
      if(events[ei].kind===0){lengths.push(red);red=0;bounds.push(current);}
      else red++;
      ei++;
    }
    if(i<pg.indices.length)current++;
  }
  lengths.push(red);
  assert.equal(current,13136);
  assert.equal(ei,256);
  assert.equal(lengths.length,32);
  assert.equal(bounds.length,32);
  assert.equal(bounds[28],C.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0),225);
  assert.equal(Buffer.from(lengths).toString("hex"),"0d00100003000b00000e0c00090b00100013000a00080003003b090005000700");
  assert.equal(bounds[18],6546);
  return {lengths,bounds,fragmentRows,markerSites,projectiveStates};
}
const {lengths,bounds,fragmentRows,markerSites}=originalFragments();
const K=Buffer.from(lengths);
const keyOrders=[
  ["raw",K],
  ["reverse",Buffer.from(lengths.slice().reverse())],
  ["sha256",crypto.createHash("sha256").update(K).digest()],
  ["sha256-reverse",crypto.createHash("sha256").update(Buffer.from(lengths.slice().reverse())).digest()]
];
const nonceModes=["row-zero","zero-row","row-row","sha256-row"];
const boundaries=bounds.slice(0,29);
assert.equal(boundaries.length,29);

function nonce(row,mode) {
  const b=Buffer.from(row);
  if(mode==="row-zero")return Buffer.concat([b,Buffer.alloc(8)]);
  if(mode==="zero-row")return Buffer.concat([Buffer.alloc(8),b]);
  if(mode==="row-row")return Buffer.concat([b,b]);
  return crypto.createHash("sha256").update(b).digest().subarray(0,16);
}
function stream(key,mode,algorithm) {
  const output=Buffer.alloc(C.length);
  for(let f=0;f<28;f++) {
    const start=boundaries[f],end=boundaries[f+1],len=end-start;
    if(len===0)continue;
    const iv=nonce(grid.byte_rows[fragmentRows[f]],mode);
    const cipher=crypto.createCipheriv(algorithm,key,iv);
    const pad=Buffer.concat([cipher.update(Buffer.alloc(len)),cipher.final()]);
    pad.copy(output,start);
  }
  return output;
}
function transform(input,pad,mode,encode) {
  const result=new Array(input.length);
  for(let f=0;f<28;f++) {
    let prev=-1;
    for(let i=boundaries[f];i<boundaries[f+1];i++) {
      const period=mode.family==="add"?29:28;
      const key=mode.projection==="mod"?pad[i]%period:Math.floor(period*pad[i]/256);
      const value=input[i];let next;
      if(mode.family==="add")next=mod(value+(encode?-1:1)*mode.sign*key,29);
      else if(prev<0)next=value;
      else if(encode)next=value===28?prev:mod(prev+1+mod(value+mode.sign*key,28),29);
      else next=value===prev?28:mod(mod(value-prev-1,29)-mode.sign*key,28);
      result[i]=next;
      if(mode.family==="exclude")prev=encode?next:value;
    }
  }
  return result;
}
function normIoC(runes,a,b) {
  const ct=new Uint32Array(29);for(let i=a;i<b;i++)ct[runes[i]]++;
  const n=b-a;let numerator=0;for(const m of ct)numerator+=m*(m-1);
  return 29*numerator/(n*(n-1));
}
const trainStop=bounds[18];
const controls=corpus.pages.find(p=>p.page===57).indices;assert.equal(controls.length,95);
const plant=Array.from({length:C.length},(_,i)=>i%157===27?28:controls[i%controls.length]);
const variants=[];
for(const [keyName,key] of keyOrders)
for(const ivMode of nonceModes)
for(const algorithm of ["aes-256-ctr","chacha20"]) {
  const pad=stream(key,ivMode,algorithm);
  for(const family of ["add","exclude"])for(const sign of [-1,1])for(const projection of ["mod","scale"]) {
    const mode={family,sign,projection},decoded=transform(C,pad,mode,false);
    assert.deepEqual(transform(decoded,pad,mode,true),C);
    variants.push({key:keyName,iv:ivMode,algorithm,...mode,trainIoC:normIoC(decoded,0,trainStop),heldoutIoC:normIoC(decoded,trainStop,C.length),prefix:decoded.slice(0,45).map(x=>corpus.translit[x]).join("")});
  }
}
const testPad=stream(keyOrders[0][1],"row-zero","aes-256-ctr");
const planted=transform(plant,testPad,{family:"add",sign:-1,projection:"scale"},true);
assert.deepEqual(transform(planted,testPad,{family:"add",sign:-1,projection:"scale"},false),plant);
const secondPad=stream(keyOrders[3][1],"sha256-row","chacha20");
const planted2=transform(plant,secondPad,{family:"exclude",sign:1,projection:"mod"},true);
assert.deepEqual(transform(planted2,secondPad,{family:"exclude",sign:1,projection:"mod"},false),plant);
variants.sort((a,b)=>b.trainIoC-a.trainIoC);
const output={
  classification:"Intermediate source-constrained test; no decryption claimed",
  mechanism:"M0 projective orbit labels 30 unique 13-dot sites; black duplicate and trailing fragment use rows 30 and 31",
  matrix:M0,start:24,projectiveStates:projectiveStates.map(x=>x===null?"infinity":x),
  markerLayers:31,uniqueMarkerSites:markerSites.length,redRunes:225,
  blackOverprint:{page:7,offset:194,projectiveState:25,extraRow:30},
  infinityMarker:{page:32,offset:121,gridRow:29},
  sourceOrderRows:fragmentRows,unsolvedFragmentRows:fragmentRows.slice(0,28),
  remainingRows:fragmentRows.slice(28),
  originalRuneCount:C.length,sourceFragments:32,unsolvedFragments:28,gridRows:32,
  modelCount:variants.length,trainStop,heldoutRunes:C.length-trainStop,
  sourceBoundaryPositions:boundaries,sourceFragmentLengths:lengths,
  sourcePlantIoC:normIoC(plant,0,C.length),
  trainTop10:variants.slice(0,10),
  heldoutTop10:variants.slice().sort((a,b)=>b.heldoutIoC-a.heldoutIoC).slice(0,10)
};
console.log(JSON.stringify(output,null,2));
