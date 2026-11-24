'use strict';
const fs=require('node:fs'),path=require('node:path');
function exactFull(corpus,transcript,ink){
  const M=3301,mod=x=>(x%29+29)%29,idx=new Map(corpus.runes.map((r,i)=>[r,i]));
  const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),periods=[],tape=[];let pos=0;
  for(const ch of transcript.split("%").slice(0,55).join("%")){if(idx.has(ch)){tape.push(idx.get(ch));pos++;}else if(ch==="."&&periods.at(-1)!==pos)periods.push(pos);}
  if(pos!==12956||periods.length!==173||!tape.every((x,i)=>x===C[i]))throw Error("corrected source contract");
  const primes=[];for(let n=2;primes.length<M+C.length;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)primes.push(n);}
  const K=primes.map(p=>(p-1)%29),gp=corpus.prime;
  /** Count all legal plaintext paths for a fixed incoming prime origin, retaining every latent F branch. */
  function clause(c,s){
    let states=new Map([[s*M,1n]]);
    for(let i=0;i<c.length;i++){
      const next=new Map();
      for(const [key,n] of states){
        const j=Math.floor(key/M),sum=key%M;
        const add=(x,j2)=>{const z=j2*M+(sum+gp[x])%M;next.set(z,(next.get(z)||0n)+n);};
        if(c[i]===0)add(0,j);
        const p=mod(c[i]-K[j]);if(p!==0)add(p,j+1);
      }
      if(!next.size)return {out:new Map(),matched:i};
      states=next;
    }
    const out=new Map();
    for(const [key,n] of states){const s2=s*(key%M)%M;out.set(s2,(out.get(s2)||0n)+n);}
    return {out,matched:c.length};
  }
  /** Across full stops, merge only identical next origins, multiplying and summing exact BigInt path counts. */
  function solve(cs){
    let states=new Map(Array.from({length:M},(_,s)=>[s,1n])),trace=[],runecount=0;
    for(let i=0;i<cs.length;i++){
      const c=cs[i],next=new Map();let matched=0;
      for(const [s,n] of states){
        const x=clause(c,s);matched=Math.max(matched,x.matched);
        for(const [s2,k] of x.out)next.set(s2,(next.get(s2)||0n)+n*k);
      }
      let n=0n;for(const k of next.values())n+=k;
      trace.push({clause:i+1,length:c.length,origins:next.size,paths:n.toString(),longestPrefix:runecount+matched});
      if(!next.size)return {trace,complete:false};
      runecount+=c.length;states=next;
    }
    return {trace,complete:true};
  }
  let offset=0;const offsets=corpus.pages.map(p=>{const z=offset;offset+=p.indices.length;return z;});
  const pages=[0,3,8,15,23,27,33,40,54],results=[];
  for(let k=0;k<pages.length;k++){
    const page=pages[k];let n=0;for(const span of ink.pages.find(x=>x.page===page)?.red_spans||[])if(span.start===n)n+=span.length;
    const start=offsets[page]+n,limit=offsets[pages[k+1]]??12956;
    const cuts=[start,...periods.filter(x=>x>start&&x<=limit)];
    const cs=cuts.slice(1).map((x,i)=>C.slice(cuts[i],x));
    const res=solve(cs);
    results.push({page,start,limit,completeClauses:cs.length,testedRunes:cs.flat().length,unclosedTail:limit-cuts.at(-1),...res});
  }
  return {initialOrigins:M,rule:"all origins 0..3300, complete black-body full-stop clauses, cumulative sentence GP prime sum product modulo 3301, authentic prime-minus-one literal-F clock",results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(exactFull(JSON.parse(a[0]),a[1],JSON.parse(a[2])),null,2));
