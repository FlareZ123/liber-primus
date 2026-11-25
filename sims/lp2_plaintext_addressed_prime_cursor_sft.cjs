'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native){
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const mod=x=>(x%29+29)%29;
  const maxOrigin=3301,fit=223,held=76,total=fit+held,maxCursor=maxOrigin+29*total;
  const primes=[];let n=2;for(;primes.length<=maxCursor;n++){if(primes.every(p=>p*p>n||n%p!==0))primes.push(n)}
  const shifts=primes.map(p=>(p-1)%29);
  const sections=native.sections.map(s=>({name:s.name,p:[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0)}));
  assert(eq(corpus.runes,native.runes),"chart order");
  function encrypt(p,j,step=x=>x+1){let c=[];let zeros=0;for(const x of p){if(x===0)c.push(0);else{const y=mod(x+shifts[j]);c.push(y);if(y===0)zeros++;j+=step(x)}}return {c,j,encryptedZeros:zeros}}
  const p56=sections.find(s=>s.name==="p56_an_end").p;
  assert(eq(encrypt(p56,0,()=>1).c,corpus.pages[56].indices),"authentic p56 fixed-clock control");
  function model(exclude){
    const uni=new Float64Array(29),bi=new Float64Array(30*29),tri=new Float64Array(900*29),bctx=new Float64Array(30),tctx=new Float64Array(900);
    let n=0;for(const s of sections){if(s.name===exclude)continue;let a=29,b=29;for(const x of s.p){uni[x]++;n++;bi[b*29+x]++;bctx[b]++;tri[(a*30+b)*29+x]++;tctx[a*30+b]++;a=b;b=x}}
    const log=new Float64Array(900*29);
    for(let a=0;a<30;a++)for(let b=0;b<30;b++)for(let x=0;x<29;x++){const p0=(uni[x]+.5)/(n+14.5),p1=(bi[b*29+x]+4*p0)/(bctx[b]+4),p2=(tri[(a*30+b)*29+x]+6*p1)/(tctx[a*30+b]+6);log[(a*30+b)*29+x]=Math.log(p2)}
    return log;
  }
  const state=(j,a=29,b=29,score=0,path="",count=1n)=>({j,a,b,score,path,count});
  function decode(c,states,log){
    for(const y of c){
      const next=new Map();
      const add=(s,x,j)=>{
        const a=s.b,b=x,k=j*900+a*30+b,score=s.score+log[(s.a*30+s.b)*29+x];
        const old=next.get(k);
        if(old){const count=old.count+s.count;if(score>old.score)next.set(k,state(j,a,b,score,s.path+String.fromCharCode(65+x),count));else old.count=count}
        else next.set(k,state(j,a,b,score,s.path+String.fromCharCode(65+x),s.count));
      };
      for(const s of states){if(y===0)add(s,0,s.j);const x=mod(y-shifts[s.j]);if(x!==0)add(s,x,s.j+x+1)}
      states=[...next.values()];
      if(!states.length)break;
    }
    return states;
  }
  const unpack=s=>[...s].map(x=>x.charCodeAt(0)-65);
  const readable=p=>p.map(i=>corpus.translit[i]).join("");
  const best=states=>states.reduce((a,b)=>!a||b.score>a.score?b:a,null);
  function recover(c,log,truth,hidden){
    const pre=c.slice(0,fit),post=c.slice(fit);
    let viable=0,stateCount=0,pathCount=0n,fullOrigins=0,fullPaths=0n,ranked=[],maxPaths=0n;
    for(let o=0;o<=maxOrigin;o++){
      const st=decode(pre,[state(o)],log);
      if(!st.length)continue;
      viable++;stateCount+=st.length;const paths=st.reduce((n,s)=>n+s.count,0n);pathCount+=paths;if(paths>maxPaths)maxPaths=paths;
      const b=best(st);
      ranked.push({o,score:b.score,s:b});
      const full=decode(post,st,log);
      if(full.length){fullOrigins++;fullPaths+=full.reduce((n,s)=>n+s.count,0n)}
    }
    ranked.sort((a,b)=>b.score-a.score||a.o-b.o);
    const z=ranked[0],out={zeros:c.filter(x=>x===0).length,fitZeros:pre.filter(x=>x===0).length,viable,stateCount,pathCount:String(pathCount),maxPaths:String(maxPaths),fullOrigins,fullPaths:String(fullPaths),ranked:ranked.slice(0,5).map(q=>({origin:q.o,nll:-q.score/fit,cursor:q.s.j}))};
    if(truth)out.trueRank=ranked.findIndex(q=>q.o===hidden)+1;
    if(!z)return out;
    const p=unpack(z.s.path);assert(eq(encrypt(p,z.o).c,pre),"prefix replay");
    const continuations=decode(post,[state(z.s.j,z.s.a,z.s.b)],log);
    const h=best(continuations);out.frozen={origin:z.o,prefixNll:-z.score/fit,prefix:readable(p),prefixGP:p,holdStates:continuations.length,holdPaths:String(continuations.reduce((n,s)=>n+s.count,0n))};
    if(truth){out.frozen.fitCorrect=p.filter((x,i)=>x===truth[i]).length}
    if(h){const hp=unpack(h.path);assert(eq(encrypt([...p,...hp],z.o).c,c),"full replay");out.frozen.holdNll=-h.score/held;out.frozen.hold=readable(hp);out.frozen.holdGP=hp;if(truth)out.frozen.heldCorrect=hp.filter((x,i)=>x===truth[fit+i]).length}
    return out;
  }
  const orig=corpus.pages[54].indices.slice(9).concat(corpus.pages[55].indices);assert(orig.length===total,"target size");
  const controls=[];const specs=[["0_welcome",137,31],["0_koan_1",911,170],["0_loss_of_divinity",2027,355],["jpg107-167",3300,9]];
  function shuffleNonzero(c,seed){const out=c.slice(),indices=[];for(let i=0;i<out.length;i++)if(out[i]!==0)indices.push(i);let x=seed>>>0;for(let i=indices.length-1;i>0;i--){x=(Math.imul(x,1664525)+1013904223)>>>0;const j=x%(i+1),a=indices[i],b=indices[j];[out[a],out[b]]=[out[b],out[a]]}return out}
  for(let k=0;k<specs.length;k++){const [name,origin,offset]=specs[k],p=sections.find(s=>s.name===name).p.slice(offset,offset+total);assert(p.length===total,"control length");const log=model(name),enc=encrypt(p,origin);const positive=recover(enc.c,log,p,origin),negative=recover(shuffleNonzero(enc.c,0x9e3779b9+k),log);controls.push({name,origin,offset,plainF:p.filter(x=>x===0).length,encryptedZeros:enc.encryptedZeros,positive,negative})}
  const original=recover(orig,model());
  return {scope:{fit,held,maxOrigin,maxCursor,primeTableLength:primes.length,maxPrime:primes.at(-1),p56Replay:p56.length,rule:"P=0 -> C=0,hold; otherwise C=(P+prime[j]-1) mod29,j+=P+1"},controls,original};
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
