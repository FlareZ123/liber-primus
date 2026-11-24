'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus, transcript, ink, gold) {
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const M=3301, mod=x=>(x%29+29)%29;
  const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
  const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  const periods=[],stream=[];let pos=0;
  for(const ch of transcript.split("%").slice(0,55).join("%")){
    if(idx.has(ch)){stream.push(idx.get(ch));pos++;}
    else if(ch==="."&&periods.at(-1)!==pos)periods.push(pos);
  }
  assert(pos===12956&&periods.length===173&&stream.every((x,i)=>x===C[i]),"corrected tape");
  const primes=[];
  for(let n=2;primes.length<M+Math.max(C.length,5000);n++){
    let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)primes.push(n);
  }
  const K=primes.map(p=>(p-1)%29), gp=corpus.prime;
  const native=gold.sections.map(s=>({name:s.name,clauses:s.source_text.split("⁜").slice(1).join("⁜").split("⁘").map(t=>[...t].filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(x=>x.length)}));
  const sums=native.find(x=>x.name==="p57_parable").clauses.map(p=>p.reduce((a,b)=>a+gp[b],0));
  assert(sums.join()==="1259,1031,1229","native p57 clause prime sums");
  function model(exclude){
    const ct=Array.from({length:30},()=>Array(29).fill(.5));
    for(const s of native)if(s.name!==exclude)for(const p of s.clauses){let prev=29;for(const x of p){ct[prev][x]++;prev=x;}}
    return ct.map(row=>{const z=row.reduce((a,b)=>a+b);return row.map(x=>Math.log(x/z));});
  }
  function enc(p,s){let j=s,sum=0;const c=p.map(x=>{sum=(sum+gp[x])%M;return x===0?0:mod(x+K[j++]);});return {c,next:s*sum%M};}
  const p56=[...gold.sections.find(s=>s.name==="p56_an_end").source_text].filter(x=>idx.has(x)).map(x=>idx.get(x));
  assert(enc(p56,0).c.join()===corpus.pages[56].indices.join(),"authentic p56 cipher replay");
  function decodeClause(c,s,m){
    // Exact within-clause DP: active cursor, plaintext GP prime sum modulo M, prior rune.
    let states=new Map([[29,{j:s,sum:0,last:29,n:1n,score:0,p:[]}]]);
    for(let i=0;i<c.length;i++){
      const next=new Map();
      for(const v of states.values()){
        const add=(x,j)=>{
          const sum=(v.sum+gp[x])%M, id=(j*M+sum)*30+x, score=v.score+m[v.last][x],old=next.get(id);
          if(old){old.n+=v.n;if(score>old.score){old.score=score;old.p=[...v.p,x];}}
          else next.set(id,{j,sum,last:x,n:v.n,score,p:[...v.p,x]});
        };
        if(c[i]===0)add(0,v.j);
        const x=mod(c[i]-K[v.j]);if(x!==0)add(x,v.j+1);
      }
      if(!next.size)return [];
      states=next;
    }
    const out=new Map();
    for(const v of states.values()){
      const key=s*v.sum%M,old=out.get(key);
      if(old){old.n+=v.n;if(v.score>old.score){old.score=v.score;old.p=v.p;}}
      else out.set(key,{s:key,n:v.n,score:v.score,p:v.p});
    }
    return [...out.values()];
  }
  function solve(clauses,m,initial,keepTrace=true){
    let states=new Map(initial.map(s=>[s,{s,seed:s,n:1n,score:0,p:[]}]));
    const trace=[];
    for(let i=0;i<clauses.length;i++){
      const c=clauses[i],next=new Map();
      for(const v of states.values())for(const w of decodeClause(c,v.s,m)){
        const score=v.score+w.score,n=v.n*w.n,old=next.get(w.s);
        if(old){old.n+=n;if(score>old.score){old.score=score;old.seed=v.seed;old.p=[...v.p,w.p];}}
        else next.set(w.s,{s:w.s,seed:v.seed,n,score,p:[...v.p,w.p]});
      }
      let count=0n,best=null;
      for(const v of next.values()){count+=v.n;if(!best||v.score>best.score)best=v;}
      if(keepTrace)trace.push({clause:i+1,length:c.length,origins:next.size,paths:count.toString(),bestSeed:best?.seed,bestNext:best?.s,bestScore:best?.score});
      if(!next.size)return {trace,best:null};
      states=next;
    }
    let best=null;for(const v of states.values())if(!best||v.score>best.score)best=v;
    return {trace,best};
  }
  function replay(cs,p,seed){let s=seed;for(let i=0;i<p.length;i++){const a=enc(p[i],s);assert(a.c.join()===cs[i].join(),"replay");s=a.next;}return s;}
  const initial=Array.from({length:M-1},(_,i)=>i+1);
  const countCorrect=(a,b)=>a.flat().filter((x,i)=>x===b.flat()[i]).length;
  const render=p=>p.map(cl=>cl.map(x=>corpus.translit[x]).join("")).join(". ");
  const controls=[];
  // Predeclared independent source controls, no target plaintext in scoring model.
  for(const [name,seed] of [["p57_parable",761],["0_warning",1033],["0_koan_1",229],["0_welcome",137]]){
    const p=native.find(x=>x.name===name).clauses,cs=[];let s=seed;const trueStates=[s];
    for(const cl of p){const a=enc(cl,s);cs.push(a.c);s=a.next;trueStates.push(s);}
    const fit=Math.max(2,Math.ceil(p.length/2)),m=model(name),tr=solve(cs.slice(0,fit),m,initial);
    assert(tr.best,"native plant remains feasible");
    assert(replay(cs.slice(0,fit),tr.best.p,tr.best.seed)===tr.best.s,"training replay");
    const te=solve(cs.slice(fit),m,[tr.best.s]);
    if(te.best)assert(replay(cs.slice(fit),te.best.p,tr.best.s)===te.best.s,"heldout replay");
    controls.push({name,seed,fit,clauses:p.length,fitRunes:p.slice(0,fit).flat().length,holdoutRunes:p.slice(fit).flat().length,recoveredSeed:tr.best.seed,correctBoundary:tr.best.s===trueStates[fit],fitCorrect:countCorrect(tr.best.p,p.slice(0,fit)),holdoutCorrect:te.best?countCorrect(te.best.p,p.slice(fit)):null,trainTrace:tr.trace,testTrace:te.trace});
  }
  let offset=0;const offsets=corpus.pages.map(p=>{const z=offset;offset+=p.indices.length;return z;});
  const pages=[0,3,8,15,23,27,33,40,54],original=[];
  for(let k=0;k<pages.length;k++){
    const page=pages[k];let n=0;for(const span of ink.pages.find(x=>x.page===page)?.red_spans||[])if(span.start===n)n+=span.length;
    const start=offsets[page]+n,limit=offsets[pages[k+1]]??12956;
    const cuts=[start,...periods.filter(x=>x>start&&x<=limit)];
    const clauses=cuts.slice(1).map((x,i)=>C.slice(cuts[i],x));
    const fit=Math.max(1,Math.ceil(clauses.length/2));
    const m=model(null),tr=solve(clauses.slice(0,fit),m,initial);
    let test=null;
    if(tr.best){
      assert(replay(clauses.slice(0,fit),tr.best.p,tr.best.seed)===tr.best.s,"original training replay");
      if(clauses.length>fit){const te=solve(clauses.slice(fit),m,[tr.best.s]);if(te.best)assert(replay(clauses.slice(fit),te.best.p,tr.best.s)===te.best.s,"original suffix replay");test={trace:te.trace,bestText:te.best?render(te.best.p):null,score:te.best?te.best.score/clauses.slice(fit).flat().length:null};}
    }
    original.push({page,start,limit,clauses:clauses.length,fit,trainTrace:tr.trace,bestText:tr.best?render(tr.best.p):null,test});
  }
  return {rule:"C=P+(prime[s+j]-1) mod29, plaintext F literal/no advance; full-stop update s'=s*sum(GP-prime(P)) mod3301, zero allowed after first clause, all 3300 nonzero initial origins",sums,product:sums.reduce((a,b)=>a*b,1),authenticP56Replay:p56.length,controls,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-ink-annotations.json","resources/external/relikd-solved-gp29-native-v1.json"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),a[1],JSON.parse(a[2]),JSON.parse(a[3])),null,2));
