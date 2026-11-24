"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/blake_song_of_liberty_train.txt"];
const input=files.map(f=>fs.readFileSync(path.join(root,f),"utf8"));
function ordinary(j,gibran,shakespeare,blake){
  const mod=x=>(x%29+29)%29,primes=j.prime,check=(x,m)=>{if(!x)throw Error(m)};
  const map=new Map(j.translit.map((s,i)=>[s,i]));map.set("ING",21);
  function gp(t){let result=[];for(let w of t.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");let p=[],i=0;while(i<w.length){let found=false;for(let n of [3,2,1]){if(i+n<=w.length&&map.has(w.slice(i,i+n))){p.push(map.get(w.slice(i,i+n)));i+=n;found=true;break}}if(!found)break}if(i===w.length)result.push(...p)}return result}
  const training=[...gp(gibran.slice(10000,40000)),...j.pages[57].indices],counts=Array.from({length:30},()=>Array(29).fill(0.5));
  for(let i=0;i<training.length;i++)counts[i?training[i-1]:29][training[i]]++;
  const lm=counts.map(r=>{let n=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/n))});
  // Normalized coefficients alpha=a/u, beta=b/u; initial plaintext rune determines the initial state.
  const inverses=Array.from({length:29},(_,u)=>u?Array.from({length:28},(_,i)=>i+1).find(x=>u*x%29===1):0);
  const h=(alpha,beta)=>Uint8Array.from(primes,(q,p)=>mod(p-alpha*(q-1)-beta));
  function encode(p,u,alpha,beta,seed){let s=seed;return p.map(x=>{let c=mod(u*x+s);s=mod(s+u*(alpha*(primes[x]-1)+beta));return c})}
  function predict(c,key,p0){let [u,alpha,beta]=key,inv=inverses[u],hh=h(alpha,beta),p=[p0];for(let i=1;i<c.length;i++)p.push(mod(hh[p[i-1]]+inv*(c[i]-c[i-1])));let seed=mod(c[0]-u*p0);check(encode(p,u,alpha,beta,seed).every((x,i)=>x===c[i]),"forward replay");return p}
  function mean(p,prev=29){let l=0;for(let x of p){l+=lm[prev][x];prev=x;}return l/p.length}
  function search(c){const ds=Array.from({length:29},(_,u)=>u?Uint8Array.from(c.slice(1),(x,i)=>mod((x-c[i])*inverses[u])):null);let best=null,selected=null;
    const A=new Float64Array(29),B=new Float64Array(29);
    for(let alpha=1;alpha<29;alpha++)for(let beta=0;beta<29;beta++){
      const hh=h(alpha,beta);
      // Lookup transition and bigram log for each observed scaled delta and candidate preceding plaintext.
      const target=new Uint8Array(841),weight=new Float64Array(841);
      for(let d=0;d<29;d++)for(let p=0;p<29;p++){let q=hh[p]+d;if(q>=29)q-=29;target[d*29+p]=q;weight[d*29+p]=lm[p][q]}
      for(let u=1;u<29;u++){let a=A,b=B;a.fill(0);const d=ds[u];for(let i=d.length-1;i>=0;i--){let base=d[i]*29;for(let p=0;p<29;p++)b[p]=weight[base+p]+a[target[base+p]];let z=a;a=b;b=z;}
        let top=-Infinity,p0=0;for(let p=0;p<29;p++){let score=a[p]+lm[29][p];if(score>top){top=score;p0=p;}}
        const candidate={key:[u,alpha,beta],p0,score:top};
        if(!best||top>best.score)best=candidate;
        if(alpha===22&&beta===17&&(!selected||top>selected.score))selected=candidate;
      }
    }return {best,selected};
  }
  function assess(c,fit,r,truth=null){let p=predict(c,r.key,r.p0);return {key:r.key,p0:r.p0,seed:mod(c[0]-r.key[0]*r.p0),fitMean:mean(p.slice(0,fit)),suffixMean:mean(p.slice(fit),p[fit-1]),fullMean:mean(p),exact:truth?p.reduce((n,x,i)=>n+Number(x===truth[i]),0):null,suffixExact:truth?p.slice(fit).reduce((n,x,i)=>n+Number(x===truth[fit+i]),0):null,plain:p,text:p.map(x=>j.translit[x]).join("")}}
  const controls=[];
  for(const [name,p,k,seed] of [["Shakespeare",gp(shakespeare.slice(18000,60000)).slice(0,729),[16,22,17],12],["Blake",gp(blake).slice(0,729),[7,23,17],26]]){
    let c=encode(p,...k,seed),f=search(c.slice(0,262));controls.push({name,planted:k,seed,n:p.length,fit:262,selected:assess(c,262,f.best,p)});
  }
  const original=j.pages.slice(0,3).flatMap(p=>p.indices),fit=j.pages[0].indices.length;const r=search(original.slice(0,fit));
  const candidate=assess(original,fit,r.best),sourceSelected=assess(original,fit,r.selected);
  const donors=[gp(gibran),gp(shakespeare)],n=j.pages.slice(0,56).reduce((s,p)=>s+p.indices.length,0),tape=j.pages.slice(0,56).flatMap(p=>p.indices),observed=tape.slice(1).filter((x,i)=>x===tape[i]).length,repeatWindows=[];
  for(let di=0;di<donors.length;di++)for(let start=0;start+n<=donors[di].length;start+=n){let p=donors[di].slice(start,start+n),pairs=Array.from({length:29},()=>Array(29).fill(0));for(let i=1;i<p.length;i++)pairs[p[i-1]][p[i]]++;let counts=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++){let sum=0,hh=h(a,b);for(let x=0;x<29;x++)sum+=pairs[x][hh[x]];counts.push({a,b,sum})}counts.sort((a,b)=>a.sum-b.sum);repeatWindows.push({donor:di,start,min:counts[0],sourceSelected:counts.find(x=>x.a===22&&x.b===17).sum,atMostObserved:counts.filter(x=>x.sum<=observed).map(x=>[x.a,x.b,x.sum])});}
  return {controls,original:{fit,n:original.length,candidate,sourceSelected},repeat:{observed,n,windows:repeatWindows}};
}
console.log(JSON.stringify(ordinary(JSON.parse(input[0]),...input.slice(1)),null,2));
