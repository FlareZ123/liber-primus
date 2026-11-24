'use strict';
/** LP2 58-page Solitaire generalized deck source inverse. Node22 CommonJS SFT. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function run(corpus,raw,assert){
  /** @param {number} x @param {number} n */
  const mod=(x,n)=>(x%n+n)%n;
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  /** @param {number[]} deck @param {number} card */
  function down(deck,card){
    const i=deck.indexOf(card);
    deck.splice(i,1);deck.splice(i===deck.length?1:i+1,0,card);
  }
  /** @param {number[]} deck @param {number} n */
  function countCut(deck,n){
    return deck.slice(n,-1).concat(deck.slice(0,n),deck.at(-1));
  }
  /** @param {number[]} deck */
  function round(deck){
    const N=deck.length,A=N-1,B=N;
    const d=deck.slice();down(d,A);down(d,B);down(d,B);
    const i=Math.min(d.indexOf(A),d.indexOf(B)),j=Math.max(d.indexOf(A),d.indexOf(B));
    const t=d.slice(j+1).concat(d.slice(i,j+1),d.slice(0,i));
    return countCut(t,Math.min(t.at(-1),A));
  }
  /** @param {number[]} deck @param {number[]} cuts */
  function key(deck,cuts){
    let d=deck.slice();
    for(const n of cuts)d=countCut(round(d),n);
    return d;
  }
  /** @param {number[]} initial @param {number} length */
  function stream(initial,length){
    let deck=initial.slice(),a=[],N=deck.length;
    while(a.length<length){
      deck=round(deck);
      const v=deck[Math.min(deck[0],N-1)];
      if(v<N-1)a.push(v);
    }
    return a;
  }
  const identity=N=>Array.from({length:N},(_,i)=>i+1);
  const letters=s=>Array.from(s,x=>x.charCodeAt(0)-64);
  const d54=identity(54);
  assert(same(stream(d54,10),[4,49,10,24,8,51,44,6,4,33]),"historical unkeyed raw sample");
  const enc26=(p,cuts)=>Array.from(p).map((x,i)=>String.fromCharCode(65+mod(x.charCodeAt(0)-65+stream(key(d54,cuts),p.length)[i],26))).join("");
  assert(enc26("AAAAAAAAAA",[])==="EXKYIZSGEH","historical unkeyed sample");
  assert(enc26("AAAAAAAAAAAAAAA",letters("FOO"))==="ITHZUJIWGRFARMW","historical FOO sample");
  assert(enc26("SOLITAIREX",letters("CRYPTONOMICON"))==="KIRAKSFJAN","historical CRYPTONOMICON sample");
  const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C"),a=[];for(let i=0;i<s.length;){const v=tokens.find(z=>s.startsWith(z.t,i));if(v){a.push(v.i);i+=v.t.length}else i++}return a;}
  const pages=corpus.pages.slice(0,56).map(p=>p.indices),C=pages.flat(),starts=[0];
  for(const p of pages)starts.push(starts.at(-1)+p.length);
  assert(C.length===12956&&corpus.pages.length===58,"58-page source");
  assert(corpus.pages[56].status==="solved"&&corpus.pages[57].status==="solved","two solved pages");
  const cue=gp("WE MUST SHED OUR OWN CIRCUMFERENCES");
  assert(corpus.pages[57].indices.some((_,i)=>same(corpus.pages[57].indices.slice(i,i+cue.length),cue)),"solved phrase");
  const seeds=[
    ["unkeyed",[]],["BASE29-3301",[3,26,24]],
    ["historical-2014-FIRFUMFERENFE",gp("FIRFUMFERENFE").map(v=>v+1)],
    ["p0-red13",pages[0].slice(0,13).map(v=>v+1)],
    ["p57-circumferences-clause",cue.map(v=>v+1)]
  ];
  assert(3*29*29+26*29+24===3301,"BASE29 signed numeric example");
  const decks=[];
  for(const [name,cuts] of seeds)for(const reverse of [false,true])for(const swap of [false,true]){
    const d=identity(56);if(reverse)d.reverse();d.push(...(swap?[58,57]:[57,58]));
    decks.push({name,reverse,swap,deck:key(d,cuts)});
  }
  const bounds=[0,3,8,15,23,28,33,40,54,56];
  const scopes=[["book",[[0,C.length]]],["chapter",bounds.slice(1).map((h,i)=>[starts[bounds[i]],starts[h]])],["page",pages.map((_,i)=>[starts[i],starts[i+1]]).filter(([a,b])=>b>a)]];
  const mapShift=(v,kind)=>kind==="raw29"?v%29:((v-1)%28)+1;
  /** @param {number[]} input @param {number[]} k @param {number} sign @param {string} kind */
  function deterministic(input,k,sign,kind){
    let j=0;return input.map(v=>{
      if(kind==="nonF28"){
        if(v===0)return 0;
        return 1+mod(v-1+sign*mapShift(k[j++],kind),28);
      }
      return mod(v+sign*mapShift(k[j++],kind),29);
    });
  }
  /** @param {number[]} input @param {number[]} k @param {number} sign @param {string} kind */
  function transparentEnc(input,k,sign,kind){
    let j=0;return input.map(v=>v===0?0:mod(v+sign*mapShift(k[j++],kind),29));
  }
  // Exact reachable stream-offset set under p56-style plaintext F skip.
  // C=0 may be literal F (no step) OR an encrypted non-F (one step).
  /** @param {number[]} input @param {number[]} k @param {number} sign @param {string} kind */
  function fReach(input,k,sign,kind){
    let active=new Set([0]);
    for(let i=0;i<input.length;i++){
      const c=input[i],next=new Set();
      for(const j of active){
        if(c===0)next.add(j);
        const p=mod(c-sign*mapShift(k[j],kind),29);
        if(p!==0)next.add(j+1);
      }
      if(next.size===0)return {ok:false,firstDead:i,finalStates:0};
      active=next;
    }
    return {ok:true,firstDead:null,finalStates:active.size,offsets:active};
  }
  /** @param {number[]} a */
  function ioc(a){const f=Array(29).fill(0);for(const v of a)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
  const native=gp(raw).slice(0,C.length);assert(native.length===C.length,"native control");
  const K=stream(decks[0].deck,C.length);
  for(const kind of ["nonF28","raw29","normalized29"]){
    for(const sign of [-1,1]){
      const enc=deterministic(native,K,sign,kind);
      assert(same(deterministic(enc,K,-sign,kind),native),"native full exact deterministic plant");
    }
  }
  const trueClock=native.filter(v=>v!==0).length;
  for(const kind of ["raw29","normalized29"])for(const sign of [-1,1]){
    const enc=transparentEnc(native,K,sign,kind),inv=fReach(enc,K,sign,kind);
    assert(inv.ok&&inv.offsets.has(trueClock),"native true F-transparent path retained");
  }
  const results=[],fResults=[];
  for(const d of decks){
    const K=stream(d.deck,C.length);
    const info={name:d.name,reverse:d.reverse,swap:d.swap};
    for(const [scope,spans] of scopes)for(const sign of [-1,1]){
      for(const kind of ["nonF28","raw29","normalized29"]){
        const plain=spans.flatMap(([a,b])=>deterministic(C.slice(a,b),K,sign,kind));
        assert(same(spans.flatMap(([a,b])=>deterministic(plain.slice(a,b),K,-sign,kind)),C),"original inverse replay");
        results.push({...info,scope,sign,kind,ioc:ioc(plain),train:ioc(plain.slice(starts[15],starts[23])),holdout:ioc(plain.slice(starts[40],starts[54]))});
      }
      for(const kind of ["raw29","normalized29"]){
        const f=spans.map(([a,b])=>fReach(C.slice(a,b),K,sign,kind));
        fResults.push({...info,scope,sign,kind,surviving:f.filter(x=>x.ok).length,segments:f.length,firstDead:f[0].firstDead,furthestDead:Math.max(...f.filter(x=>!x.ok).map(x=>x.firstDead))});
      }
    }
  }
  const best=scopes.map(([scope])=>({scope,best:results.filter(r=>r.scope===scope).sort((a,b)=>b.ioc-a.ioc)[0],bestHoldout:results.filter(r=>r.scope===scope).sort((a,b)=>b.holdout-a.holdout)[0]}));
  const fSummary=scopes.map(([scope])=>{const a=fResults.filter(r=>r.scope===scope);return {scope,count:a.length,wholeScopeSurvivors:a.filter(r=>r.surviving===r.segments).length,maximumSurvivingSegments:Math.max(...a.map(r=>r.surviving)),maximumFirstDead:Math.max(...a.map(r=>r.firstDead===null?-1:r.firstDead)),segments:a[0].segments}});
  return {historicalVectors:4,sourceDecks:decks.length,deterministicOriginalInverses:results.length,transparentOriginalGates:fResults.length,nativeIoc:ioc(native),nativeFCount:native.length-trueClock,originalFCount:C.filter(v=>v===0).length,best,fSummary};
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),['I','II','III'].map(i=>read('resources/external/2013-book-of-law-'+i+'.txt')).join('\n'),assert.ok),null,2));
