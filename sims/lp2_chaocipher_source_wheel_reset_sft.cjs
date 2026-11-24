'use strict';
/** Original-input Chaocipher wheel/in-depth reset experiment. Node 22 CJS. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus, master, crowRaw, blakeRaw, assert) {
  /** @param {number} n */
  const identity = n => Array.from({length:n}, (_,i)=>i);
  /** @param {number[]} a @param {number} k */
  const rotate = (a,k) => a.slice(k).concat(a.slice(0,k));
  /** @param {number[]} input @param {number[]} left @param {number[]} right @param {number} nadir @param {boolean} decrypt */
  function chao(input,left,right,nadir,decrypt) {
    let L=left.slice(),R=right.slice(),output=[];
    for(const x of input){
      const i=(decrypt?L:R).indexOf(x);
      assert(i>=0,"invalid symbol");
      L=rotate(L,i); R=rotate(R,i);
      output.push((decrypt?R:L)[0]);
      L.splice(nadir,0,L.splice(1,1)[0]);
      R=rotate(R,1);
      R.splice(nadir,0,R.splice(2,1)[0]);
    }
    return output;
  }
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const ascii=s=>Array.from(s,x=>x.charCodeAt(0)-65);
  const left26=ascii("HXUCZVAMDSLKPEFJRIGTWOBNYQ"),right26=ascii("PTLNBQDEOYSFAVZKGJRIHWXUMC");
  const p26=ascii("WELLDONEISBETTERTHANWELLSAID"),c26=ascii("OAHQHCNYNXTSZJRRHJBYHQKSOUJY");
  assert(same(chao(p26,left26,right26,13,false),c26),"published 26-letter vector");
  assert(same(chao(c26,left26,right26,13,true),p26),"published 26-letter inverse");
  const id=identity(29), pages=corpus.pages.slice(0,56).map(p=>p.indices),x=pages.flat();
  assert(x.length===12956,"original source length");
  const p57=corpus.pages[57].indices;
  const tokens=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
  /** @param {string} raw */
  function gp(raw) {
    const t=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C"),a=[];
    for(let i=0;i<t.length;){const n=tokens.find(z=>t.startsWith(z.token,i));if(n){a.push(n.i);i+=n.token.length}else i++}
    return a;
  }
  const phrase=gp("WE MUST SHED OUR OWN CIRCUMFERENCES");
  assert(p57.some((_,i)=>same(p57.slice(i,i+phrase.length),phrase)),"p57 literal instruction");
  const keys=[
    ["GP",id],["P0-red-heading",pages[0].slice(0,13)],
    ["P57-circumferences",gp("CIRCUMFERENCES")],
    ["P57-instruction",phrase],["P57-entire",p57]
  ].flatMap(([name,seed])=>{
    const a=Array.from(new Set([...seed,...id]));
    return [[name,a],[name+"-reverse",a.slice().reverse()]];
  });
  // A common cyclic rotation of the left starting wheel is equivalent to
  // relabeling the arbitrary right wheel; no need to sweep 29 rotations.
  const starts=[0];for(const p of pages)starts.push(starts.at(-1)+p.length);
  const bounds=[0,3,8,15,23,28,33,40,54,56],sections=bounds.slice(1).map((h,i)=>[starts[bounds[i]],starts[h]]);
  const whole=[[0,x.length]],pageSpans=pages.map((_,i)=>[starts[i],starts[i+1]]),regs=[["book",whole],["chapter",sections],["page",pageSpans]];
  const rmap=new Map(corpus.runes.map((r,i)=>[r,i]));
  const anchor=master.lastIndexOf("%",master.indexOf(pages[0].slice(0,8).map(i=>corpus.runes[i]).join("")));
  assert(anchor>=0,"master LP2 boundary");
  const original=master.slice(anchor+1).split("%").slice(0,58);
  const lineSpans=[],lineGroups=[];
  let pos=0;
  for(let pg=0;pg<58;pg++){
    const lines=original[pg].split("/").map(l=>Array.from(l).filter(r=>rmap.has(r)).map(r=>rmap.get(r))).filter(a=>a.length);
    assert(same(lines.flat(),corpus.pages[pg].indices),"master page "+pg);
    if(pg<56){
      const group=[];
      for(const l of lines){group.push(pos);lineSpans.push([pos,pos+l.length]);pos+=l.length}
      lineGroups.push(group);
    }
  }
  assert(pos===x.length&&lineSpans.length===594,"original line count");
  regs.push(["line",lineSpans]);
  const crow=gp(crowRaw),blake=gp(blakeRaw.slice(blakeRaw.indexOf("THE ARGUMENT"),blakeRaw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
  assert(crow.length===21611&&blake.length===18631,"native text controls");
  const N=x.length,donors=[crow.slice(0,N),crow.slice(4327,4327+N),crow.slice(8655,8655+N),blake.slice(0,N),blake.slice(5675,5675+N)];
  /** @param {number[]} a */
  function ioc(a){
    const f=Array(29).fill(0);for(const v of a)f[v]++;
    return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
  }
  /** @param {number[]} a @param {number[][]} spans @param {number[]} l @param {number[]} r @param {number} n @param {boolean} dec */
  const transform=(a,spans,l,r,n,dec)=>spans.flatMap(([lo,hi])=>chao(a.slice(lo,hi),l,r,n,dec));
  // Arbitrary common starting plaintext alphabet: each abstract label is
  // mapped to its fixed initial right-wheel symbol, independent of ciphertext.
  const secret=Array.from({length:29},(_,i)=>(11*i+7)%29);
  const nonAffine=secret.slice();[nonAffine[0],nonAffine[7]]=[nonAffine[7],nonAffine[0]];
  const plant=donors[0];
  for(const [name,spans] of regs){
    const left=keys[4][1],n=14;
    const enc=transform(plant,spans,left,nonAffine,n,false);
    const abstract=transform(enc,spans,left,id,n,true);
    assert(same(abstract.map(i=>nonAffine[i]),plant),"native right-wheel relabel plant "+name);
    assert(same(transform(abstract,spans,left,id,n,false),enc),"native inverse plant "+name);
  }
  const originalResults=[];
  for(const [scope,spans] of regs){
    for(const [key,left] of keys)for(const nadir of [14,15]){
      const a=transform(x,spans,left,id,nadir,true);
      assert(same(transform(a,spans,left,id,nadir,false),x),"original replay "+scope+" "+key);
      // When right wheel is separately private per segment, pooled IoC is
      // not invariant. Weighted within-segment IoC remains exact.
      const pairCount=spans.reduce((s,[lo,hi])=>s+(hi-lo)*(hi-lo-1),0);
      const weighted=spans.reduce((s,[lo,hi])=>hi-lo<2?s:s+ioc(a.slice(lo,hi))*(hi-lo)*(hi-lo-1),0)/pairCount;
      originalResults.push({scope,key,nadir,ioc:ioc(a),within:weighted,train:ioc(a.slice(starts[15],starts[23])),holdout:ioc(a.slice(starts[40],starts[54]))});
    }
  }
  // Rotation equivalence checked explicitly on unchanged original.
  const k=keys[0][1],a0=chao(x,k,id,14,true);
  for(let j=0;j<29;j++){
    const a=chao(x,rotate(k,j),id,14,true);
    assert(same(a.map(v=>(v+j)%29),a0),"cyclic wheel equivalence "+j);
  }
  function pairs(a,s){const f=Array(29).fill(0);let n=0;for(const i of s)n+=f[a[i]]++;return n}
  const chapGroups=bounds.slice(1).map((h,i)=>lineGroups.slice(bounds[i],h).flat());
  const groupDefs=[["line-global",[lineGroups.flat()]],["line-chapter-private",chapGroups],["line-page-private",lineGroups],["page-global",[pageSpans.filter(([a,b])=>b>a).map(([a])=>a)]]];
  const resetResults=groupDefs.map(([scope,g])=>({scope,count:g.flat().length,orig:g.reduce((n,s)=>n+pairs(x,s),0),donors:donors.map(d=>g.reduce((n,s)=>n+pairs(d,s),0))}));
  const maxima=regs.map(([scope,spans])=>{
    const a=originalResults.filter(r=>r.scope===scope);
    const den=spans.reduce((s,[l,h])=>s+(h-l)*(h-l-1),0);
    const donorWithin=donors.map(d=>spans.reduce((s,[l,h])=>h-l<2?s:s+ioc(d.slice(l,h))*(h-l)*(h-l-1),0)/den);
    return {scope,candidates:a.length,bestCommon:a.slice().sort((a,b)=>b.ioc-a.ioc)[0],bestPrivate:a.slice().sort((a,b)=>b.within-a.within)[0],donorWithin,donorCommon:donors.map(ioc)};
  });
  return {historicalVector:"PASS",nativePlants:regs.length,originalCandidates:originalResults.length,distinctLeftOrders:new Set(keys.map(x=>x[1].join())).size,maxima,resetResults};
}
const result=experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/liber_primus_master.txt'),['I','II','III'].map(i=>read('resources/external/2013-book-of-law-'+i+'.txt')).join('\n'),read('resources/external/cicada2012-blake-marriage-gutenberg45315.txt'),assert.ok);
console.log(JSON.stringify(result,null,2));
