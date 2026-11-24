'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>fs.readFileSync(path.join(root,p),'utf8'));

/** @param {string[]} inputs Canonical corpus, transcript, native solved donor. */
function run(inputs) {
  const corpus=JSON.parse(inputs[0]), solved=JSON.parse(inputs[2]);
  const ix=new Map(corpus.runes.map((r,i)=>[r,i]));
  const assert=(v,msg)=>{if(!v)throw Error(msg)};
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const mod=(x,m)=>((x%m)+m)%m;
  const bm=(x,m)=>((x%m)+m)%m;
  let page=0, word=[],start=0,last=0,pos=0;
  const words=[];
  const finish=()=>{
    if(!word.length)return;
    words.push({w:word,page:start>=50?start+1:start,end:last>=50?last+1:last,j:words.length,pos:pos-word.length});
    word=[];
  };
  for(const ch of inputs[1].split('%').slice(0,55).join('%')){
    if(ix.has(ch)){
      if(!word.length)start=page;
      word.push(ix.get(ch));last=page;pos++;
    }else if(ch==='%')page++;
    else if(ch==='/'||/\s/u.test(ch))continue;
    else finish();
  }
  finish();
  assert(words.length===2896&&pos===12956,'original count');
  assert(words.filter(x=>x.page!==x.end).length===32,'cross-page count');
  assert(eq(words.flatMap(x=>x.w),corpus.pages.filter(x=>x.page<56).flatMap(x=>x.indices)),'canonical mismatch');
  assert(eq(corpus.runes,solved.runes),'donor alphabet');
  const donor=solved.sections.flatMap(sec=>sec.source_text.split(/[^\u16a0-\u16ff]+/u).filter(x=>x&&[...x].every(ch=>ix.has(ch))).map(x=>[...x].map(ch=>ix.get(ch))));
  assert(donor.length===740&&donor.flat().length===2979,'donor counts');
  const singles=data=>data.filter(x=>x.w.length===1).map(x=>({...x,y:x.w[0]}));
  const orig=singles(words);
  const ds=donor.filter(w=>w.length===1).map(w=>w[0]);
  assert(orig.length===83&&ds.length===28,'singleton counts');
  const clocks=[
    ['word',x=>[x.j,x.j*(x.j-1)/2]],
    ['rune',x=>[x.pos,x.pos*(x.pos-1)/2]],
    ['mixed',x=>[x.j,x.pos]]
  ];
  function evaluate(data,clock,sentinel,a,b){
    const counts=new Uint8Array(29);
    for(const x of data){
      let v=mod(x.y-sentinel-1,29);
      const [j,k]=clock(x);
      if(v!==28)v=mod(v-a*j-b*k,28);
      counts[v]++;
    }
    const order=Array.from({length:29},(_,i)=>i).sort((i,j)=>counts[j]-counts[i]||i-j).slice(0,3);
    return {score:order.reduce((n,i)=>n+counts[i],0),order,counts};
  }
  function scan(data,clock){
    const tr=data.filter(x=>x.page<=26),ho=data.filter(x=>x.page>=27);
    let best=null,bestAll=0;
    for(let sentinel=0;sentinel<29;sentinel++)for(let a=0;a<28;a++)for(let b=0;b<28;b++){
      const t=evaluate(tr,clock,sentinel,a,b);
      const h=evaluate(ho,clock,sentinel,a,b);
      const all=evaluate(data,clock,sentinel,a,b);
      const heldout=t.order.reduce((z,i)=>z+h.counts[i],0);
      if(!best||t.score>best.train)best={sentinel,a,b,train:t.score,heldout,order:t.order,oracleHold:h.score};
      bestAll=Math.max(bestAll,all.score);
    }
    return {...best,bestAll};
  }
  const original=clocks.map(([name,k])=>[name,scan(orig,k)]);
  // Complete variable-width native plant, not a singleton-only simulation.
  const groups=Array.from({length:15},(_,L)=>donor.filter(w=>w.length===L));
  const seen=new Uint32Array(15);
  const perm=Array.from({length:29},(_,i)=>i);
  for(const [a,b] of [[24,28],[10,8],[16,17]])[perm[a],perm[b]]=[perm[b],perm[a]];
  const inv=Array.from({length:29},(_,i)=>perm.indexOf(i));
  const pack=w=>w.reduce((v,d)=>29n*v+BigInt(d),0n);
  function unpack(v,L){
    const w=Array(L);
    for(let k=L-1;k>=0;k--){w[k]=Number(v%29n);v/=29n;}
    assert(v===0n,'width');return w;
  }
  function mask(j){const n=BigInt(j);return 9n*n+13n*n*(n-1n)/2n;}
  function encode(w,j){
    const L=w.length,M=29n**BigInt(L)-1n,v=pack(w.map(d=>perm[d]));
    const c=v===M?M:bm(29n*v+mask(j),M);
    return unpack(c,L).map(d=>mod(d+7,29));
  }
  function decode(w,j){
    const L=w.length,M=29n**BigInt(L)-1n,c=pack(w.map(d=>mod(d-7,29)));
    const v=c===M?M:bm((c-mask(j))*29n**BigInt(L-1),M);
    return unpack(v,L).map(d=>inv[d]);
  }
  let recovered=0;
  const plant=words.map(x=>{
    const L=x.w.length,g=groups[L],k=seen[L]++;
    assert(g.length>0,'native donor length');
    const p=g[(k*11+7)%g.length];
    const cipher=encode(p,x.j),plain=decode(cipher,x.j);
    assert(eq(plain,p)&&eq(encode(plain,x.j),cipher),'plant replay');
    recovered+=plain.length;
    return {...x,w:cipher};
  });
  const positive=scan(singles(plant),clocks[0][1]);
  assert(recovered===12956&&positive.train===47&&positive.heldout===36,'positive gate');
  assert(positive.sentinel===6&&positive.a===9&&positive.b===13,'blind singleton key recovery');
  return {original,positive,recovered,sourceCounts:{words:words.length,runes:pos,singletons:orig.length,train:47,holdout:36,nativeSingletons:ds.length,nativeTypes:[...new Set(ds)].map(i=>corpus.translit[i])},parametersPerClock:29*28*28};
}

console.log(JSON.stringify(run(inputs),null,2));
