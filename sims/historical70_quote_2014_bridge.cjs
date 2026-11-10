"use strict";
/** Original LP2 70-rune p53 quotation versus historical 2014 70-character command.
 * Execute from repo root: node sims/historical70_quote_2014_bridge.cjs
 * All original bytes and source references are checked in; fixed shuffle seed, exact 29x29 assignment.
 */
const fs=require("node:fs");
const path=require("node:path");
function analyze(data,reference) {
  const assert=(c,msg)=>{if(!c)throw Error(msg)};
  const T=data.translit,m=29,idx=new Map(T.map((v,i)=>[v,i]));
  const p53=data.pages.find(p=>p.page===53).indices.slice(53,123);
  const p40=data.pages.find(p=>p.page===40).indices.slice(171,229);
  const command="GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO";
  const order=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
  assert(p53.length===70 && p40.length===58 && command.length===70,"source length");
  assert(p53[0]===28 && p53[69]===17 && p40[0]===0,"original source quote");
  assert(new Set(order).size===14 && Math.min(...order)===0 && Math.max(...order)===13,"historical order");
  function colRead(a){const b=[];for(const j of order)for(let k=0;k<5;k++)b.push(a[k*14+j]);return b;}
  function colInverse(a){const b=Array(70);let v=0;for(const j of order)for(let k=0;k<5;k++)b[k*14+j]=a[v++];return b;}
  assert(colInverse(colRead(p53)).every((v,i)=>v===p53[i]),"column invertibility");
  const chars=[...new Set(command)].sort(),yc=[...command].map(ch=>chars.indexOf(ch));
  function matching(a){
    const n=29,w=Array.from({length:n},()=>Array(n).fill(0));
    for(let i=0;i<70;i++)w[a[i]][yc[i]]++;
    const u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
      do{
        used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){
          const cur=-w[i0-1][j-1]-u[i0]-v[j];
          if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
          if(minv[j]<delta){delta=minv[j];j1=j;}
        }
        for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;
        j0=j1;
      }while(p[j0]!==0);
      do{let j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
    }
    let best=0;for(let j=1;j<=n;j++)best+=w[p[j]-1][j-1];
    return best;
  }
  const synthetic=yc.slice();
  assert(matching(synthetic)===70,"known-answer one-to-one substitution");
  const observed=[matching(p53),matching(colRead(p53)),matching(colInverse(p53))];
  let seed=20261110|0;
  function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
  const trials=3000,nullScores=[];
  for(let i=0;i<trials;i++){
    let a=p53.slice();for(let j=a.length-1;j>0;j--){const k=rand()%(j+1);[a[j],a[k]]=[a[k],a[j]];}
    nullScores.push(Math.max(matching(a),matching(colRead(a)),matching(colInverse(a))));
  }
  let exceed=nullScores.filter(z=>z>=Math.max(...observed)).length;
  function encode(text){
    const x=[];const toks=[...T,"ING"].sort((a,b)=>b.length-a.length);
    const s=text.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/QU/g,"CW");
    for(let i=0;i<s.length;){if(s[i]<"A"||s[i]>"Z"){i++;continue;}let matched=false;
      for(const k of toks){if(s.startsWith(k,i)){x.push(k==="ING"?21:idx.get(k));i+=k.length;matched=true;break;}}
      if(!matched)i++;
    }return x;
  }
  const corpus=encode(reference);
  assert(corpus.length>10000,"english control missing");
  let tri=new Map(),bi=new Map();
  for(let i=2;i<corpus.length;i++){
    const a=corpus[i-2]*m+corpus[i-1],b=a*m+corpus[i];
    tri.set(b,(tri.get(b)||0)+1);bi.set(a,(bi.get(a)||0)+1);
  }
  function score(a){let v=0;for(let i=2;i<a.length;i++){
    const b=a[i-2]*m+a[i-1],t=b*m+a[i];v+=Math.log(((tri.get(t)||0)+0.1)/((bi.get(b)||0)+2.9));
  }return v/(a.length-2);}
  function primes(n){const p=[];for(let z=2;p.length<n;z++){let ok=true;for(let k=2;k*k<=z;k++)if(z%k===0){ok=false;break;}if(ok)p.push((z-1)%29);}return p;}
  const keys=[["DIVINITY",encode("DIVINITY")],["FIRFUMFERENFE",encode("FIRFUMFERENFE")],["p56-totient",primes(100)]];
  function inverse(c,key,sign,phase,mask){const out=[];let pos=0,ff=0;for(let i=0;i<c.length;i++){
    if(c[i]===0 && ((mask>>ff++)&1)){out.push(0);continue;}
    out.push((c[i]+29+sign*key[(pos+++phase)%key.length])%29);
  }return out;}
  let best={score:-Infinity},count=0;
  for(const [reading,x] of [["printed",p53],["2014-read",colRead(p53)],["2014-inverse",colInverse(p53)]]){
    const nF=x.filter(z=>z===0).length;
    for(const [keyName,k] of keys)for(const sign of [-1,1]){
      const phases=keyName==="p56-totient"?[0]:Array.from({length:k.length},(_,i)=>i);
      for(const phase of phases)for(let mask=0;mask<(1<<nF);mask++){
        const pt=inverse(x,k,sign,phase,mask),s=score(pt);count++;
        if(s>best.score)best={score:s,reading,keyName,sign,phase,mask,plaintext:pt.map(z=>T[z]).join("")};
      }
    }
  }
  let nativeScores=[];for(let i=0;i+70<=corpus.length;i+=333)nativeScores.push(score(corpus.slice(i,i+70)));
  nativeScores.sort((a,b)=>a-b);
  const nativeMedian=nativeScores[nativeScores.length>>1],nativeMinimum=nativeScores[0];
  const plant=corpus.slice(500,570),key=keys[0][1];
  const encrypted=plant.map((v,i)=>(v+key[i%key.length])%29);
  assert(inverse(encrypted,key,-1,0,0).every((v,i)=>v===plant[i]),"native-key plant");
  assert(colInverse(colRead(encrypted)).every((v,i)=>v===encrypted[i]),"native-transpose plant");
  return {originalPage53:[53,123],originalPage40:[171,229],quoteLengths:[p53.length,p40.length],historicalCommandLength:command.length,observedMappingMatches:observed,shuffledTrials:trials,shuffledExceeding:exceed,shuffledFamilyTail:(exceed+1)/(trials+1),keyCandidates:count,bestHistoricalCipher:best,emersonRuneLength:corpus.length,nativeWindowCount:nativeScores.length,nativeMinimum,nativeMedian,positiveControls:"70/70 known-message relabeling; 70/70 source-key plant; 70/70 transposition inverse"};
}
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const reference=fs.readFileSync(path.join(root,"resources/control/emerson_essays_2944.txt"),"utf8");
console.log(JSON.stringify(analyze(data,reference),null,2));
