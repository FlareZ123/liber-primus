'use strict';
const fs=require('node:fs');
const path=require('node:path');

function orthographicGate(corpus,transcription,signedSource){
  const mod=x=>(x%29+29)%29,sum=v=>v.reduce((a,b)=>a+b,0),sig=v=>[...v].sort((a,b)=>a-b).join(",");
  const gpTokens=corpus.translit.map((symbol,value)=>({symbol,value})).concat([{symbol:"ING",value:21},{symbol:"IO",value:27}]);
  function spellings(word){
    const x=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/[^A-Z]/g,"");
    function rec(i){if(i===x.length)return [[]];return gpTokens.filter(t=>x.startsWith(t.symbol,i)).flatMap(t=>rec(i+t.symbol.length).map(tail=>[t.value,...tail]))}
    return [...new Map(rec(0).map(x=>[x.join(","),x])).values()];
  }
  const clear=signedSource.split("-----BEGIN PGP SIGNATURE-----")[0],signed=clear.slice(clear.indexOf("Hello.")).split(/[^A-Za-z0-9]+/).filter(t=>/^[A-Za-z]+$/.test(t));
  const ri=new Map(corpus.runes.map((r,i)=>[r,i])),parts=transcription.replace(/\r/g,"").split(/^\s*%\s*$/m).slice(0,55);
  let words=[],w=[],sp=-1,ep=-1,st=0;
  function flush(){if(w.length)words.push({page:sp,endPage:ep,start:st,values:w});w=[]}
  for(let s=0;s<parts.length;s++){
    const p=s>=50?s+1:s;let o=0;
    for(const ch of parts[s]){
      if(ri.has(ch)){if(!w.length){sp=p;st=o}ep=p;w.push(ri.get(ch));o++}
      else if(!/[\s/]/u.test(ch))flush();
    }
    if(o!==corpus.pages[p].indices.length)throw Error("page count");
  }
  flush();
  if(words.length!==2896||words.filter(w=>w.page===w.endPage).length!==2864)throw Error("word count");
  const obj=corpus.pages[25].indices.slice(144,150),v=obj.map((x,i)=>Number(BigInt(x)**BigInt(i?27:3)%29n));
  const cuts=Array.from({length:5},(_,i)=>[sum(v.slice(0,i+1)),sum(v.slice(i+1))]);
  const ids=[...new Set(cuts.flat().filter(x=>x<signed.length))].sort((a,b)=>a-b);
  const rows=ids.flatMap(n=>spellings(signed[n]).map(gp=>({n,label:signed[n].toUpperCase(),gp,sum:sum(gp),hits:words.filter(w=>w.page===n&&w.endPage===n&&w.values.length===gp.length&&sum(w.values)===sum(gp))})));
  if(rows.length!==16||rows.filter(x=>x.hits.length).length!==1||rows.find(x=>x.hits.length).n!==40)throw Error("orthographic survivor");
  const sixTargets=spellings(signed[20]).filter(x=>x.length===6);
  const H6=[0,1,2].map(i=>mod(15*(v[i]+v[5-i]))).concat([0,1,2].map(i=>mod(15*(v[i+3]-v[2-i]))));
  const keys=[v,H6],sixTests=[];
  let windows=0;
  for(let p=0;p<56;p++)windows+=Math.max(0,corpus.pages[p].indices.length-5);
  for(const target of sixTargets)for(let ki=0;ki<keys.length;ki++)for(const sign of [1,-1]){
    const key=keys[ki].map(x=>mod(x*sign)),enc=target.map((x,i)=>mod(x+key[i])),hits=[];
    for(let p=0;p<56;p++){const a=corpus.pages[p].indices;for(let i=0;i+6<=a.length;i++){const w=a.slice(i,i+6);if(sig(w.map((x,j)=>mod(x-target[j])))===sig(key))hits.push({p,i,w})}}
    sixTests.push({target,ki,sign,enc,hits});
  }
  if(sixTests.length!==8||sixTests.some(x=>x.hits.length))throw Error("six variant survivor");
  return {orthographicRows:rows,sixTests,withinPageSixWindows:windows};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(orthographicGate(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/historical/cicada2016-4gq25-outguess.asc')),null,2));
