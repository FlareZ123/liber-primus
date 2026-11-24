'use strict';
/** Agent 7: shared printed-line pad with arbitrary line Caesar IV; read-only CJS. */
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,transcript,refText) {
  const M=29, mod=x=>(x%M+M)%M, sum=x=>x.reduce((a,b)=>a+b,0);
  const requireTrue=(x,msg)=>{if(!x)throw Error(msg)};
  const rng=(seed)=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296};
  const rand=rng(0x07011224), ri=()=>Math.floor(rand()*M);
  const alphabet=new Map(corpus.runes.map((x,i)=>[x,i]));
  const lines=transcript.split(/\r?\n/).map(x=>Array.from(x).filter(c=>alphabet.has(c)).map(c=>alphabet.get(c))).filter(x=>x.length);
  const pages=[];let li=0;
  for(const p of corpus.pages.filter(p=>p.page<56&&p.indices.length)){
    let n=0;const l=[];
    while(n<p.indices.length){const x=lines[li++];n+=x.length;l.push(x)}
    requireTrue(n===p.indices.length&&l.flat().every((v,i)=>v===p.indices[i]),"line/corpus disagreement");
    pages.push({page:p.page,lines:l});
  }
  const L=26;requireTrue(li===594&&sum(pages.map(p=>sum(p.lines.map(x=>x.length))))===12956,"unexpected source size");
  const tokenMap=new Map(corpus.translit.map((x,i)=>[x,i])), tokens=[...tokenMap.keys()].sort((a,b)=>b.length-a.length);
  function encode(s){
    const out=[];
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replaceAll("ING","NG").replaceAll("V","U").replaceAll("K","C").replaceAll("Z","S").replaceAll("Q","C");
      const word=[];
      for(let k=0;k<w.length;){const t=tokens.find(t=>w.startsWith(t,k));if(!t){word.length=0;break}word.push(tokenMap.get(t));k+=t.length}
      out.push(...word);
    }return out;
  }
  const clean=s=>s.split(/\r?\n/).filter(l=>!l.startsWith("#")&&!l.startsWith("[")).join("\n");
  const boundary=refText.indexOf("### 10"), end=refText.indexOf("### 56");
  requireTrue(boundary>0&&end>boundary,"missing reference split");
  const ref=encode(clean(refText.slice(0,boundary))), natural=encode(clean(refText.slice(boundary,end)));
  const U=Array(M).fill(.5), B=Array.from({length:M},()=>Array(M).fill(.25));
  for(const x of ref)U[x]++;
  for(let j=1;j<ref.length;j++)B[ref[j-1]][ref[j]]++;
  const u=U.map(x=>x/sum(U)), b=B.map(row=>row.map(x=>x/sum(row))), logU=u.map(Math.log), logB=b.map(row=>row.map(Math.log));
  const diff=Array.from({length:L},()=>Array(M).fill(0));
  const independent=Array(M).fill(0);for(let a=0;a<M;a++)for(let c=0;c<M;c++)independent[mod(c-a)]+=u[a]*u[c];
  for(let lag=1;lag<L;lag++){
    for(let j=lag;j<ref.length;j++)diff[lag][mod(ref[j]-ref[j-lag])]++;
    diff[lag]=diff[lag].map((v,d)=>Math.log((v+250*independent[d])/(ref.length-lag+250)));
  }
  const A=p=>p.page<40&&p.page%2===0, Bset=p=>p.page<40&&p.page%2===1, H=p=>p.page>=40;
  const flatten=(ps,filter)=>ps.filter(filter).flatMap(p=>p.lines);
  function pairData(ls){
    const edges=[];
    for(let j=0;j<L;j++)for(let k=j+1;k<L;k++){
      const count=Array(M).fill(0);let n=0;
      for(const line of ls)if(line.length>k){count[mod(line[k]-line[j])]++;n++}
      const scores=Array.from({length:M},(_,delta)=>sum(count.map((v,d)=>v*diff[k-j][mod(d-delta)])));
      edges.push({j,k,n,scores});
    }return edges;
  }
  function fit(ls){
    const edges=pairData(ls), incident=Array.from({length:L},()=>[]);
    for(const e of edges){incident[e.j].push(e);incident[e.k].push(e)}
    const score=k=>sum(edges.map(e=>e.scores[mod(k[e.k]-k[e.j])]));
    let best=null,bestScore=-Infinity;
    for(let start=0;start<12;start++){
      const k=Array(L).fill(0);
      if(start===0){for(const e of incident[0])k[e.k]=e.scores.indexOf(Math.max(...e.scores))}
      else if(start>1){for(let j=1;j<L;j++)k[j]=ri()}
      for(let sweep=0;sweep<40;sweep++){
        let changes=0;
        for(let j=1;j<L;j++){
          let v=k[j],s=-Infinity;
          for(let x=0;x<M;x++){
            let q=0;for(const e of incident[j])q+=e.scores[mod(e.k===j?x-k[e.j]:k[e.k]-x)];
            if(q>s){s=q;v=x}
          }if(v!==k[j]){k[j]=v;changes++}
        }if(!changes)break;
      }
      const s=score(k);if(s>bestScore){bestScore=s;best=k.slice()}
    }return {key:best,composite:bestScore/sum(edges.map(e=>e.n))};
  }
  function pairScore(ls,k){
    const edges=pairData(ls),n=sum(edges.map(e=>e.n));
    return {n,score:sum(edges.map(e=>e.scores[mod(k[e.k]-k[e.j])]))/n,upper:sum(edges.map(e=>Math.max(...e.scores)))/n,uniform:-Math.log(M)};
  }
  function scoreSuffix(ls,k,truth){
    let score=0,n=0,correct=0,ivCorrect=0,used=0;const sample=[];
    for(let i=0;i<ls.length;i++){
      const c=ls[i];if(c.length<8)continue;
      const h=Math.floor(c.length/2);
      let iv=0,best=-Infinity;
      for(let v=0;v<M;v++){
        let s=logU[mod(c[0]-k[0]-v)];
        for(let j=1;j<h;j++)s+=logB[mod(c[j-1]-k[j-1]-v)][mod(c[j]-k[j]-v)];
        if(s>best){best=s;iv=v}
      }
      const p=c.map((x,j)=>mod(x-k[j]-iv));
      if(sample.length<120)sample.push(...p);
      for(let j=h;j<p.length;j++){score+=logB[p[j-1]][p[j]];n++;if(truth&&p[j]===truth[i][j])correct++}
      if(truth&&p[0]===truth[i][0])ivCorrect++;
      used++;
    }
    return {n,lines:used,score:score/n,accuracy:truth?correct/n:null,firstRuneAccuracy:truth?ivCorrect/used:null,sample:sample.slice(0,120).map(x=>corpus.translit[x]).join("-")};
  }
  function sample(probs){let q=rand();for(let j=0;j<M;j++){q-=probs[j];if(q<0)return j}return M-1}
  const trueKey=Array.from({length:L},(_,j)=>j?ri():0);
  function plant(kind){
    return pages.map(p=>{
      const truth=p.lines.map(l=>{
        if(kind==="native"){let at=Math.floor(rand()*(natural.length-l.length));return natural.slice(at,at+l.length)}
        const x=[sample(u)];while(x.length<l.length)x.push(sample(b[x[x.length-1]]));return x;
      });
      return {page:p.page,truth,lines:truth.map(l=>{const v=ri();return l.map((x,j)=>mod(x+trueKey[j]+v))})};
    });
  }
  const match=(a,b,n)=>a.slice(0,n).filter((x,i)=>x===b[i]).length;
  function run(ps,control){
    const a=fit(flatten(ps,A)),bb=fit(flatten(ps,Bset)),ab=fit(flatten(ps,p=>p.page<40));
    const h=flatten(ps,H), truth=control?ps.filter(H).flatMap(p=>p.truth):null;
    return {a, b:bb, ab, agreement20:match(a.key,bb.key,20),agreement24:match(a.key,bb.key,24),trueMatches20:control?[a,bb,ab].map(z=>match(z.key,trueKey,20)):null,trueMatches24:control?[a,bb,ab].map(z=>match(z.key,trueKey,24)):null,heldoutPair:[a,bb,ab].map(z=>pairScore(h,z.key)),heldoutSuffix:[a,bb,ab].map(z=>scoreSuffix(h,z.key,truth)),truePair:control?pairScore(h,trueKey):null,trueSuffix:control?scoreSuffix(h,trueKey,truth):null};
  }
  const controls=[run(plant("markov"),true),run(plant("native"),true)];
  const original=run(pages,false);
  const wrong=Array.from({length:100},()=>scoreSuffix(flatten(pages,H),Array.from({length:L},(_,j)=>j?ri():0),null).score).sort((a,b)=>a-b);
  const result={referenceRunes:ref.length,nativeControlRunes:natural.length,sourceLines:li,trueKey,controls,original,wrongKeySuffix:{min:wrong[0],median:wrong[50],max:wrong[99]}};
  return result;
}
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2));
