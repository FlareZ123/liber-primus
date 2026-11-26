"use strict";
const fs=require("node:fs"),path=require("node:path");
/** @param {{pages:{indices:number[]}[],translit:string[]}} corpus @param {{pages:{tokens:string[]}[]}} grid */
function analyze(corpus,grid){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const range=n=>Array.from({length:n},(_,i)=>i);
  const ring=[...range(8),...range(31).map(i=>(i+1)*8+7),...range(7).map(i=>31*8+6-i),...range(30).map(i=>(30-i)*8)];
  const inner=range(30).flatMap(i=>range(6).map(j=>(i+1)*8+j+1));
  const tokens=grid.pages.flatMap(p=>p.tokens);
  assert(tokens.length===256&&ring.length===76&&inner.length===180&&new Set([...ring,...inner]).size===256,"frame");
  const cipher=corpus.pages[56].indices, p57=corpus.pages[57].indices;
  assert(cipher.length===85&&p57.length===95&&corpus.pages[55].indices.length===76,"page lengths");
  const primes=[];
  for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
  let k=0;
  const p56=cipher.map((x,i)=>i===56?x:((x-primes[k++]+1)%29+29)%29);
  let j=0;
  assert(p56.every((x,i)=>(x===0?0:(x+primes[j++]-1)%29)===cipher[i])&&j===84,"native replay");
  const p=[...p56,...p57],ct=[...cipher,...p57],rows=inner.map(i=>tokens[i]);
  function gate(input,output){
    const conflicts=[];
    let trained=0,holdout=0,holdoutCorrect=0;
    for(let b=0;b<180;b++)for(let a=0;a<b;a++)if(rows[a]===rows[b]){
      const sameP=input[a]===input[b],sameC=output[a]===output[b];
      if(sameP!==sameC)conflicts.push({a,b,cellA:inner[a],cellB:inner[b],token:rows[a],p:[input[a],input[b]],c:[output[a],output[b]]});
      if(a<85&&b>=85&&sameP){holdout++;if(sameC)holdoutCorrect++}
      if(a<85&&b<85&&sameP)trained++;
    }
    return {trainConflicts:conflicts.filter(x=>x.b<85),crossConflicts:conflicts.filter(x=>x.a<85&&x.b>=85),holdoutConflicts:conflicts.filter(x=>x.a>=85),trained,holdout,holdoutCorrect};
  }
  // Synthetic positive: independently shuffled bijection per printed token, fixed deterministic seed.
  let seed=17423;
  const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
  const table=new Map();
  for(const row of new Set(rows)){
    const perm=range(29);
    for(let i=28;i>0;i--){const j=Math.floor(random()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
    table.set(row,perm);
  }
  const planted=p.map((x,i)=>table.get(rows[i])[x]);
  assert(planted.every((x,i)=>table.get(rows[i]).indexOf(x)===p[i]),"plant inverse");
  const positive=gate(p,planted);
  assert(positive.trainConflicts.length+positive.crossConflicts.length+positive.holdoutConflicts.length===0&&positive.holdout===positive.holdoutCorrect,"plant");
  const damaged=planted.slice();damaged[57]=(damaged[57]+1)%29;
  assert(gate(p,damaged).trainConflicts.length>0,"corrupt plant");
  const original=gate(p,ct);
  assert(original.trainConflicts.length===1&&original.crossConflicts.length===6&&original.holdoutConflicts.length===0,"original certificate");
  return {original,positive,distinctTokens:new Set(rows).size,ringUnseen:ring.filter(i=>!rows.includes(tokens[i])).length};
}
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus",name),"utf8"));
console.log(JSON.stringify(analyze(load("lp2-corpus.json"),load("lp2-grid-256.json")),null,2));
