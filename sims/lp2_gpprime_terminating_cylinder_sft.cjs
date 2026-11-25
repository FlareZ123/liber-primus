"use strict";
/** Agent 30: original-source, no-EOS terminating-cylinder GP-prime interval codec. Node 22. */
function experiment(book,solved) {
  const assert=(condition,message)=>{if(!condition)throw new Error(message)};
  const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const R=28n, W=BigInt(book.prime.reduce((a,b)=>a+b,0)), cum=[0n];
  assert(W===1480n&&book.prime.length===29,"source prime chart");
  for(const p of book.prime)cum.push(cum.at(-1)+BigInt(p));
  const weights=book.prime.map(BigInt);
  /** @param {number[]} symbols */
  function interval(symbols){
    let a=0n,b=1n,d=1n;
    for(const x of symbols){const w=b-a,base=a*W;a=base+w*cum[x];b=base+w*cum[x+1];d*=W}
    assert(0n<=a&&a<b&&b<=d,"valid interval");
    return {a,b,d};
  }
  /** @param {number[]} digits */
  function integer(digits){return digits.reduce((x,y)=>x*R+BigInt(y),0n)}
  /** @param {bigint} x @param {number} n */
  function digits(x,n){const result=Array(n);for(let j=n-1;j>=0;j--){result[j]=Number(x%R);x/=R}assert(x===0n,"digit overflow");return result}
  /** Return all length-k cylinders inside parent and crossing an internal boundary. */
  function homophones({a,b,d},scale){
    const denom=d*W, width=b-a, result=[];
    for(let j=1;j<29;j++){
      const z=(a*W+width*cum[j])*scale;
      if(z%denom===0n)continue;
      const x=z/denom;
      if(x*d<a*scale||(x+1n)*d>b*scale)continue;
      if(!result.length||result.at(-1)!==x)result.push(x);
    }
    return result;
  }
  /** Canonical shortest, then lowest, terminating cylinder. */
  function encode(symbols){
    const iv=interval(symbols);let scale=1n,k=0;
    while((iv.b-iv.a)*scale<iv.d){scale*=R;k++}
    for(;;k++,scale*=R){
      const options=homophones(iv,scale);
      if(options.length)return {digits:digits(options[0],k),count:options.length};
    }
  }
  /** Decode the longest common source prefix of the ENTIRE rank cylinder. */
  function decode(ds){
    const scale=R**BigInt(ds.length),v=integer(ds);
    let lo=v,hi=v+1n,d=scale;
    const p=[];
    for(;;){
      const l=lo*W,h=hi*W;
      let j=0;while(j<28&&l>=cum[j+1]*d)j++;
      if(h>cum[j+1]*d)return p;
      p.push(j);
      lo=l-cum[j]*d;hi=h-cum[j]*d;d*=weights[j];
    }
  }
  /** Read every rank frame with its source interval, keeping the repeated rune as a real marker. */
  function frame(cipher){
    const frames=[{start:1,end:1,digits:[]}];
    for(let i=1;i<cipher.length;i++){
      const c=cipher[i],p=cipher[i-1],f=frames.at(-1);
      if(c===p){f.end=i;frames.push({start:i+1,end:i+1,digits:[]})}
      else{f.digits.push(c-Number(c>p));f.end=i+1}
    }
    return frames;
  }
  function restore(head,frames){
    const C=[head];
    frames.forEach((f,k)=>{
      for(const rank of f){const prev=C.at(-1);C.push(rank+Number(rank>=prev))}
      if(k+1<frames.length)C.push(C.at(-1));
    });return C;
  }
  const chars=new Map(book.runes.map((x,i)=>[x,i]));
  const native=solved.sections.map(x=>({name:x.name,p:[...x.source_text].filter(c=>chars.has(c)).map(c=>chars.get(c))}));
  assert(native.reduce((a,x)=>a+x.p.length,0)===2979,"native reference size");
  function makeModel(sections){
    const tri=new Uint32Array(29**3), bi=new Uint32Array(29**2);
    for(const {p} of sections)for(let j=2;j<p.length;j++){
      const pair=p[j-2]*29+p[j-1];bi[pair]++;tri[pair*29+p[j]]++;
    }
    return {tri,bi};
  }
  function score(p,model){
    let l=0;for(let j=2;j<p.length;j++){
      const pair=p[j-2]*29+p[j-1];l-=Math.log((model.tri[pair*29+p[j]]+.5)/(model.bi[pair]+14.5));
    }
    return p.length>2?l/(p.length-2):null;
  }
  function ioc(p){const hist=Array(29).fill(0);for(const x of p)hist[x]++;return p.length>1?hist.reduce((z,n)=>z+n*(n-1),0)/(p.length*(p.length-1)):null}
  const model=makeModel(native);
  const positives=native.map(({name,p},i)=>{
    const e=encode(p),d=decode(e.digits);
    assert(equal(p,d),"native section roundtrip");
    assert(equal(encode(d).digits,e.digits),"canonical replay");
    const C=restore(15,[e.digits]);assert(equal(frame(C)[0].digits,e.digits),"rank frame roundtrip");
    return {name,runes:p.length,digits:e.digits.length,nll:score(p,makeModel(native.filter((_,j)=>j!==i)))};
  });
  let extra=0;
  for(let len=0;len<=29;len++){
    const p=Array.from({length:len},(_,i)=>(i*13+len)%29);
    const e=encode(p);assert(equal(decode(e.digits),p),"length/symbol positive");extra++;
  }
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const p=[a,b];assert(equal(decode(encode(p).digits),p),"two-symbol positive");extra++;
  }
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const details=[], totals=[];
  const preview=p=>p.slice(0,120).map(i=>book.translit[i]).join(" ");
  for(let k=0;k<chapters.length;k++){
    const [first,last]=chapters[k], pages=book.pages.filter(p=>p.page>=first&&p.page<=last);
    const cipher=pages.flatMap(p=>p.indices),fs=frame(cipher);
    assert(equal(restore(cipher[0],fs.map(f=>f.digits)),cipher),"original rank replay");
    const rows=fs.map(({start,end,digits:ds},i)=>{
      const p=decode(ds),e=encode(p), opts=homophones(interval(p),R**BigInt(ds.length)), ordinal=opts.findIndex(x=>x===integer(ds));
      assert(ordinal>=0,"actual cylinder is a homophone");
      assert(equal(digits(opts[ordinal],ds.length),ds),"conditional original inverse");
      return {chapter:k+1,frame:i+1,start,end,width:ds.length,plain:p,canonicalWidth:e.digits.length,canonical:equal(ds,e.digits),homophones:opts.length,ordinal,nll:score(p,model)};
    });
    let pageOffset=0;const ranges=pages.map(p=>{const result={page:p.page,start:pageOffset,end:pageOffset+p.indices.length};pageOffset+=p.indices.length;return result});
    const selection=k===3?rows.filter(f=>ranges.some(p=>p.page>=16&&p.page<=21&&f.start<=p.end&&f.end>p.start)):rows;
    const p=selection.flatMap(x=>x.plain);
    const full=rows.flatMap(x=>x.plain);
    totals.push({chapter:k+1,sourceRunes:cipher.length,frames:rows.length,plainRunes:full.length,canonical:rows.filter(x=>x.canonical).length,minimalWidth:rows.filter(x=>x.width===x.canonicalWidth).length,ioc:ioc(full),nll:score(full,model),selectedFrames:selection.length,selectedSourceDigits:selection.reduce((s,x)=>s+x.width,0),selectedPlainRunes:p.length,selectedNll:score(p,model),selectedIoc:ioc(p),preview:preview(p)});
    details.push(...rows);
  }
  const all=details.flatMap(x=>x.plain);
  assert(totals.reduce((a,x)=>a+x.sourceRunes,0)===12956,"source rune count");
  assert(details.length===95,"95 original frames");
  return {method:"exact radix28 terminating cylinders in GP-prime-weighted recursive partition; no EOS, chapter resets, equal successors delimit frames, F ordinary",weights:book.prime,totalWeight:Number(W),positives,additionalExactPlants:extra,totals,summary:{sourceRunes:12956,frames:details.length,repeatMarkers:86,plainRunes:all.length,canonicalFrames:details.filter(x=>x.canonical).length,minimalWidthFrames:details.filter(x=>x.width===x.canonicalWidth).length,maxHomophones:Math.max(...details.map(x=>x.homophones)),conditionalHomophoneBits:details.reduce((a,x)=>a+Math.log2(x.homophones),0),widthExcess:details.reduce((a,x)=>a+x.width-x.canonicalWidth,0),ioc:ioc(all),nll:score(all,model)},details:details.map(({plain,...x})=>({...x,plainRunes:plain.length,plaintext:plain.map(i=>book.runes[i]).join("")}))};
}
if(require.main===module){
 const fs=require("node:fs");const path=require("node:path");const root=path.resolve(__dirname,"..");
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
 console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
}
module.exports={experiment};
