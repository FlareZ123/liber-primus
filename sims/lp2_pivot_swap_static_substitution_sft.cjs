"use strict";
/** Pivot-swap original-input SFT, issue #2921. Run with Node 20+. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp1_wulfic_canonical.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function run(raw, assert) {
  const d=JSON.parse(raw[0]);
  const ID=Array.from({length:29},(_,i)=>i);
  function swap(a,i,j){[a[i],a[j]]=[a[j],a[i]]}
  function enc(p,A0,r){let A=A0.slice();return p.map(x=>{let c=A[x];swap(A,x,r);return c})}
  function unmask(c,l){let inv=ID.slice(),prev=l;return c.map(x=>{let z=inv[x];swap(inv,x,prev);prev=x;return z})}
  function hist(x){let h=Array(29).fill(0);for(let v of x)h[v]++;return h}
  function pairs(h){return h.reduce((s,n)=>s+n*(n-1),0)}
  function summary(x){let h=hist(x),n=x.length;return {n,max:Math.max(...h),ioc:pairs(h)/(n*(n-1)),counts:h.slice().sort((a,b)=>b-a)}}
  function gates(c) {
    const variants=ID.map(l=>{const y=unmask(c,l),h=hist(y);return {l,...summary(y),pivotCount:h[l]}});
    const c0=c[0],base=unmask(c,c0);
    for(let l of ID){
      const y=unmask(c,l);
      for(let i=1;i<c.length;i++){
        const expected=base[i]===l?c0:base[i]===c0?l:base[i];
        assert(y[i]===expected,"initial-label suffix equivalence");
        assert((y[i]===l)===(c[i]===c[i-1]),"pivot equality");
        if(i>=2) assert((y[i]===y[i-1])===(c[i]===c[i-2]),"lag2 invariant");
      }
    }
    return {n:c.length,cipherRepeats:c.filter((x,i)=>i>0&&x===c[i-1]).length,cipherLag2:c.filter((x,i)=>i>=2&&x===c[i-2]).length,pivotRange:[Math.min(...variants.map(v=>v.pivotCount)),Math.max(...variants.map(v=>v.pivotCount))],maxCount:Math.max(...variants.map(v=>v.max)),minIoc:Math.min(...variants.map(v=>v.ioc)),maxIoc:Math.max(...variants.map(v=>v.ioc)),canonicalCounts:variants[c0].counts};
  }
  const pages=d.pages.filter(p=>p.page<56);
  const tape=pages.flatMap(p=>p.indices);
  assert(tape.length===12956,"original length");
  const chapterRanges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const book=gates(tape);
  const chapters=chapterRanges.map(([a,b])=>({a,b,...gates(pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices))}));
  const physicalPages=pages.filter(p=>p.indices.length).map(p=>({page:p.page,...gates(p.indices)}));
  const chapterPrivateUpper=chapters.reduce((s,p)=>s+p.maxCount,0),pagePrivateUpper=physicalPages.reduce((s,p)=>s+p.maxCount,0);
  const nativeMap=new Map(d.runes.map((g,i)=>[g,i]));
  const src=raw[1].split("%");
  const clearLP1=[3,8,9,10,11,14].map(n=>[...src[n]].filter(g=>nativeMap.has(g)).map(g=>nativeMap.get(g)));
  assert(clearLP1.map(p=>p.length).join(",")==="157,187,207,192,169,89","native LP1 source");
  const p57=d.pages.find(p=>p.page===57).indices;
  const tokens=d.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(text){let out=[];let clean=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    for(let w of clean.match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{let t=tokens.find(t=>w.startsWith(t.s,i));assert(t,"token");out.push(t.i);i+=t.s.length}}}return out}
  const literary=raw.slice(2).map(encode);
  const native=clearLP1.concat([p57]);
  let plants=0,plantRunes=0;
  for(const p of native.concat([clearLP1.flat().concat(p57)])){
    for(let r=0;r<29;r++){
      for(const A of [ID,ID.map(x=>28-x),ID.map(x=>(11*x+7)%29)]){
        const c=enc(p,A,r),y=unmask(c,A[r]),I=Array(29);
        A.forEach((v,i)=>I[v]=i);
        const recovered=y.map(v=>I[v]);
        assert(recovered.every((v,i)=>v===p[i]),"plant exact plaintext");
        assert(enc(recovered,A,r).every((v,i)=>v===c[i]),"plant exact replay");
        assert(pairs(hist(y))===pairs(hist(p)),"plant histogram invariant");
        gates(c);plants++;plantRunes+=p.length;
      }
    }
  }
  // Continuous multi-page plants, including native F and arbitrary pivot.
  const crossPagePlants=literary.map((p,i)=>{let plain=p.slice(0,tape.length),A=ID.map(x=>((7+2*i)*x+5+i)%29),r=[11,14,0][i];let c=enc(plain,A,r),y=unmask(c,A[r]),I=Array(29);A.forEach((v,j)=>I[v]=j);assert(y.every((v,j)=>I[v]===plain[j]),"continuous long plant");let seam=0;for(const page of pages){seam+=page.indices.length;if(seam>0&&seam<c.length){assert((c[seam]===c[seam-1])===(plain[seam]===r),"cross-page pivot");}}return {n:plain.length,pivot:r,exact:plain.length,stats:summary(plain)}});
  const controls=literary.map((x,idx)=>{
    const name=["Gibran","Shakespeare","Emerson"][idx];
    function windows(n,thresholdIoc,thresholdCount){
      let h=hist(x.slice(0,n)),minIoc=Infinity,minMax=Infinity,minE=Infinity,lowIoc=0,lowMax=0,joint=0;
      for(let i=0;i+n<=x.length;i++){
        let ic=pairs(h)/(n*(n-1)),m=Math.max(...h);
        minIoc=Math.min(minIoc,ic);minMax=Math.min(minMax,m);minE=Math.min(minE,h[18]);
        lowIoc+=+(ic<=thresholdIoc);lowMax+=+(m<=thresholdCount);joint+=+(ic<=thresholdIoc&&m<=thresholdCount);
        if(i+n<x.length){h[x[i]]--;h[x[i+n]]++}
      }
      return {windows:x.length-n+1,minIoc,minMax,minE,lowIoc,lowMax,joint};
    }
    return {name,runes:x.length,book:windows(tape.length,book.maxIoc,book.maxCount),chapters:chapters.map(p=>({a:p.a,b:p.b,...windows(p.n,p.maxIoc,p.maxCount)}))};
  });
  return {book,chapters,pagePrivateUpper,chapterPrivateUpper,physicalPageCount:physicalPages.length,native: native.map(summary),nativeCombined:summary(native.flat()),plants,plantRunes,crossPagePlants,controls};
}
const raw=files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(raw,assert),null,2));
