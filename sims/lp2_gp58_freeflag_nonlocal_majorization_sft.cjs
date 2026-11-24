/**
 * GP29 + one left-boundary bit: exact all-secret single-round bounds.
 * Run from repository root: node sims/lp2_gp58_freeflag_nonlocal_majorization_sft.cjs
 * Read-only Node.js CommonJS; no dependencies.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function experiment(corpus,source,control,assert) {
  const pages=source.trim().split(/\n%\s*\n/);
  assert(pages.length===57,"57 rune-bearing transcription pages");
  pages.splice(50,0,"");
  const alphabet=new Map(corpus.runes.map((ch,i)=>[ch,i]));
  const tape=[];
  let pending=1;
  for(let p=0;p<58;p++){
    const actual=[];
    for(const ch of pages[p]){
      if(alphabet.has(ch)){
        const rune=alphabet.get(ch);
        actual.push(rune);
        tape.push({page:p,rune,flag:pending});
        pending=0;
      }else if(ch==="-"||ch===".") pending=1;
    }
    assert(JSON.stringify(actual)===JSON.stringify(corpus.pages[p].indices),"page "+p);
  }
  const counts=(a,n)=>{const h=Array(n).fill(0);for(const x of a)h[x]++;return h;};
  const sorted=h=>h.slice().sort((a,b)=>b-a);
  const top=(h,k)=>sorted(h).slice(0,k).reduce((a,b)=>a+b,0);
  const ioc=(h,n)=>h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));
  const table={...Object.fromEntries(corpus.translit.map((x,i)=>[x,i])),K:5,Q:5,V:1,Z:15,ING:21};
  const native=[],rareFlags=[];
  let priorEnd=0;
  // Every ordinary word start may use a common boundary label. Count a
  // start preceded by any of these punctuation marks as a rare label.
  for(const match of control.toUpperCase().matchAll(/[A-Z]+/g)){
    let w=match[0];
    let rare=/[.!?,;:'"()—–]/.test(control.slice(priorEnd,match.index));
    priorEnd=match.index+w.length;
    while(w.length){
      const k=[w.slice(0,3),w.slice(0,2),w[0]].find(x=>Object.hasOwn(table,x));
      assert(k!==undefined,"control token "+w);
      native.push(table[k]);rareFlags.push(rare?1:0);rare=false;w=w.slice(k.length);
    }
  }
  function nativeWindows(n,bound){
    const h=counts(native.slice(0,n),29);
    let minTop5=Infinity,minIoc=Infinity,windows=0;
    let rare=rareFlags.slice(0,n).reduce((a,b)=>a+b,0),minTop5MinusRare=Infinity,excludedByRareBound=0,maxRare=0;
    for(let i=0;i+n<=native.length;i++){
      if(i){h[native[i-1]]--;h[native[i+n-1]]++;rare+=rareFlags[i+n-1]-rareFlags[i-1];}
      const adjusted=top(h,5)-rare;
      minTop5MinusRare=Math.min(minTop5MinusRare,adjusted);
      maxRare=Math.max(maxRare,rare);
      if(adjusted>bound)excludedByRareBound++;
      minTop5=Math.min(minTop5,top(h,5)/n);
      minIoc=Math.min(minIoc,ioc(h,n));windows++;
    }
    return {windows,minTop5,minIoc,minTop5MinusRare,maxRare,excludedByRareBound};
  }
  function region(lo,hi,withControl=true){
    const t=tape.filter(x=>x.page>=lo&&x.page<=hi);
    const n=t.length;
    const h=counts(t.map(x=>x.rune*2+x.flag),58);
    const hr=counts(t.map(x=>x.rune),29);
    const s=sorted(h);
    const pairs=Array.from({length:29},(_,i)=>s[2*i]+s[2*i+1]);
    const fixedTop5=top(h,10),freeTop5=top(hr,10);
    const selected=new Set(hr.map((count,rune)=>({count,rune})).sort((a,b)=>b.count-a.count||a.rune-b.rune).slice(0,10).map(x=>x.rune));
    // Construct an attaining boundary permutation: place all ones outside
    // the chosen ten rune classes, then pair the ten (rune,0) symbols.
    const starts=t.reduce((s,x)=>s+x.flag,0);
    assert(starts<=n-freeTop5,"enough other positions for flag ones");
    let left=starts;
    const flags=t.map(x=>!selected.has(x.rune)&&left>0?(left--,1):0);
    assert(left===0,"all boundary ones preserved");
    const old0=[],old1=[];
    for(let i=0;i<n;i++)(t[i].flag?old1:old0).push(i);
    let i0=0,i1=0;
    const perm=flags.map(b=>b?old1[i1++]:old0[i0++]);
    const mixed=t.map((x,i)=>2*x.rune+t[perm[i]].flag);
    const wanted=[...selected].map(x=>2*x);
    const rest=Array.from({length:58},(_,i)=>i).filter(i=>!wanted.includes(i));
    const byOutput=[...wanted,...rest];
    const byInput=Array(58);
    byOutput.forEach((x,i)=>byInput[x]=i);
    const decoded=mixed.map(x=>byInput[x]);
    const decodedRunes=decoded.map(x=>Math.floor(x/2));
    assert(top(counts(decodedRunes,29),5)===freeTop5,"sharp free-flag maximum");
    const restored=decoded.map(x=>byOutput[x]);
    const backFlags=Array(n);
    for(let i=0;i<n;i++)backFlags[perm[i]]=restored[i]%2;
    assert(restored.every((x,i)=>Math.floor(x/2)===t[i].rune&&backFlags[i]===t[i].flag),"exact original tuple roundtrip");
    return {lo,hi,n,starts,support:h.filter(Boolean).length,runeTop5:top(hr,5)/n,runeIoc:ioc(hr,n),fixedTupleTop5:fixedTop5/n,fixedTupleMaxIoc:ioc(pairs,n),freeFlagMaxTop5:freeTop5/n,freeFlagAttained:true,roundTrip:true,...(withControl?{control:nativeWindows(n,freeTop5)}:{})};
  }
  const regions=[[0,55],[16,21],[40,53]].map(([lo,hi])=>region(lo,hi));
  assert(regions[0].n===12956&&regions[0].starts===2896,"original count");
  for(const x of regions)assert(x.freeFlagMaxTop5<x.control.minTop5,"original region below every donor window");

  // More than two punctuation labels cannot evade the bound if the decoded
  // rare-label population R is small: top5 <= top10(original runes) + R.
  // The control comparison counts even commas, quotes and parentheses as rare.
  assert(regions[0].control.excludedByRareBound===regions[0].control.windows,'whole-book rare-punctuation extension');

  // Grant independently chosen GP58 maps on any partition of the physical
  // rune-bearing pages. Optimize the bound over every possible cut set.
  function rekeyEnvelope(lo,hi){
    const hist=[];
    for(let p=lo;p<=hi;p++){
      const page=tape.filter(x=>x.page===p);
      if(page.length)hist.push(counts(page.map(x=>2*x.rune+x.flag),58));
    }
    const m=hist.length;
    const n=hist.flat().reduce((a,b)=>a+b,0);
    const weights=Array.from({length:m},()=>Array(m+1).fill(null));
    for(let i=0;i<m;i++){
      let h=Array(58).fill(0);
      for(let j=i;j<m;j++){
        h=h.map((x,k)=>x+hist[j][k]);
        const hr=Array.from({length:29},(_,k)=>h[2*k]+h[2*k+1]);
        weights[i][j+1]=[top(h,10),top(hr,10)];
      }
    }
    return [0,1].map(mode=>{
      let dp=Array(m+1).fill(-Infinity);dp[0]=0;
      const maxByK=[];
      for(let k=1;k<=m;k++){
        const next=Array(m+1).fill(-Infinity);
        for(let j=k;j<=m;j++){
          for(let i=k-1;i<j;i++)next[j]=Math.max(next[j],dp[i]+weights[i][j][mode]);
        }
        dp=next;
        maxByK.push(dp[m]/n);
      }
      return {mode:mode===0?'fixed tuples':'free flag reflow',maxByK};
    });
  }
  for(const x of regions){
    x.rekeyEnvelope=rekeyEnvelope(x.lo,x.hi);
    const [fixed,free]=x.rekeyEnvelope;
    assert(fixed.maxByK.at(-1)<x.control.minTop5,'even page-private fixed tuples fail donor minimum');
    x.minimumFreeRekeyBlocks=free.maxByK.findIndex(v=>v>=x.control.minTop5)+1;
  }
  assert(regions.map(x=>x.minimumFreeRekeyBlocks).join(',')==='12,2,3','rekey thresholds');

  // A distinct genuinely space-changing plant: arbitrary 58-symbol bijection
  // with a known inverse, plus reversal of the boundary channel.
  const p57=tape.filter(x=>x.page===57);
  const n=p57.length;
  const positive=p57.map((x,i)=>(2*x.rune+p57[n-1-i].flag+17)%58);
  const recovered=positive.map(x=>(x+58-17)%58);
  assert(recovered.every((x,i)=>Math.floor(x/2)===p57[i].rune&&recovered[n-1-i]%2===p57[i].flag),"p57 plant");
  const changed=positive.filter((x,i)=>x%2!==p57[i].flag).length;
  assert(changed>0,"plant changes boundaries");
  const p57h=counts(p57.map(x=>x.rune),29);
  return {nativeLength:native.length,regions,p57:{n,changedEncodedBoundaryBits:changed,runeTop5:top(p57h,5)/n,ioc:ioc(p57h,n),positiveRoundTrip:true}};
}
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/control/gibran_prophet_58585.txt'),assert),null,2));
