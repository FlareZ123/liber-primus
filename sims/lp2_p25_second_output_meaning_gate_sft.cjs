'use strict';
const fs = require('node:fs');
const path = require('node:path');

function experiment(corpus,transcription) {
  const mod=x=>(x%29+29)%29;
  const sum=v=>v.reduce((a,b)=>a+b,0);
  const sig=v=>[...v].sort((a,b)=>a-b).join(",");
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const runeIndex=new Map(corpus.runes.map((r,i)=>[r,i]));
  const parts=transcription.replace(/\r/g,"").split(/^\s*%\s*$/m).slice(0,55);
  let words=[],w=[],sp=-1,ep=-1,st=0;
  function flush(){if(w.length)words.push({page:sp,endPage:ep,start:st,values:w});w=[]}
  for(let s=0;s<parts.length;s++){
    const p=s>=50?s+1:s;let o=0;
    for(const ch of parts[s]){
      if(runeIndex.has(ch)){if(!w.length){sp=p;st=o}ep=p;w.push(runeIndex.get(ch));o++}
      else if(!/[\s/]/u.test(ch))flush();
    }
    check(o===corpus.pages[p].indices.length,"page offset mismatch "+p);
  }
  flush();
  const canon=words.filter(w=>w.page===w.endPage);
  check(words.length===2896&&canon.length===2864,"canonical count");
  const target=[19,18,24,9,10,21]; // Expanded noncanonical M E A N I NG; canonical MEANING has four runes
  const source=corpus.pages[25].indices.slice(144,150);
  check(eq(source,[18,3,20,10,11,16]),"p25 source mismatch");
  const v=source.map((x,i)=>Number(BigInt(x)**BigInt(i?27:3)%29n));
  check(eq(v,[3,10,16,3,8,20])&&sum(v.slice(0,5))===40&&v[5]===20,"cut5");
  // Natural outside-in pairwise difference/sum extension of the existing H4.
  const H6=x=>[0,1,2].map(i=>mod(x[i]-x[5-i])).concat([0,1,2].map(i=>mod(x[2-i]+x[3+i])));
  const k=[0,1,2].map(i=>mod(15*(v[i]+v[5-i]))).concat([0,1,2].map(i=>mod(15*(v[i+3]-v[2-i]))));
  check(eq(H6(k),v),"H6 replay");
  const variants=[v,k].flatMap((key,kind)=>[1,-1].map(sign=>({kind,sign,key:key.map(x=>mod(sign*x))})));
  const local=canon.filter(w=>w.page===20&&w.values.length===6);
  const all6=canon.filter(w=>w.values.length===6);
  const windows=[];
  for(let p=0;p<56;p++){const a=corpus.pages[p].indices;for(let i=0;i+6<=a.length;i++)windows.push({page:p,start:i,values:a.slice(i,i+6)})}
  const delta=a=>a.map((x,j)=>mod(x-target[j]));
  const results=variants.map(({kind,sign,key})=>{
    const enc=target.map((x,i)=>mod(x+key[i]));
    const matches=w=>sig(delta(w.values))===sig(key);
    const exact=w=>eq(w.values,enc);
    const localResidue=local.filter(w=>mod(sum(w.values))===mod(sum(enc))).length;
    const pageWindows=windows.filter(w=>w.page===20);
    return {kind,sign,key,enc,residue:mod(sum(enc)),localResidue,localExact:local.filter(exact),globalWordExact:all6.filter(exact),pageWindowExact:pageWindows.filter(exact),pageWindowResidue:pageWindows.filter(w=>mod(sum(w.values))===mod(sum(enc))).length,allPageWindowPermutationMatches:windows.filter(matches)};
  });
  // Exhaustive planted positive controls over all orderings, including repeated values.
  function* permutations(a,i=0){if(i===a.length){yield a.slice();return}for(let j=i;j<a.length;j++){[a[i],a[j]]=[a[j],a[i]];yield* permutations(a,i+1);[a[i],a[j]]=[a[j],a[i]]}}
  let controls=0;
  for(const {key} of variants){
    for(const ordered of permutations([...key])){
      const plant=target.map((x,i)=>mod(x+ordered[i]));
      check(sig(delta(plant))===sig(key),"planted key multiset");
      check(eq(plant.map((x,i)=>mod(x-ordered[i])),target),"plant inverse");
      controls++;
    }
  }
  check(results.every(x=>!x.localResidue&&!x.allPageWindowPermutationMatches.length),"original survivor");
  return {counts:{global:words.length,complete:canon.length,crossing:words.length-canon.length,completeSix:all6.length,withinPageWindows:windows.length,p20Windows:windows.filter(w=>w.page===20).length},source,transformed:v,H6inverse:k,target,local:local.map(w=>({...w,sum:sum(w.values),residue:mod(sum(w.values))})),results,controls};
}

const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt')),null,2));
