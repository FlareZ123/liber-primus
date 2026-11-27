'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native) {
  const assert=(v,msg)=>{if(!v)throw Error(msg)}, mod=(x,n=29)=>(x%n+n)%n;
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  const starts=[0];for(const p of corpus.pages)starts.push(starts.at(-1)+p.indices.length);
  const a=tape.slice(9811,9832),b=tape.slice(12522,12543);
  assert(tape.length===12956&&starts[40]===9640&&starts[41]===9871&&starts[53]===12469&&starts[54]===12648,"coordinates");
  assert(eq(a,[0,23,4,28,6,13,3,12,3,19,28,17,11,27,15,19,0,16,0,25,3]),"p40 anchor");
  assert(eq(b,[28,14,26,12,4,3,13,15,5,25,19,12,9,11,18,0,15,18,0,24,21]),"p53 anchor");
  /** Enumerate shared plaintexts and both independent local-phase keys via exact GF29 difference constraints. */
  function fit(a,b,q,t,s,fhold){
    const zeros=a.map((v,i)=>v===0&&b[i]===0?i:-1).filter(i=>i>=0);
    assert(zeros.length<=16,"explicit mask bound");
    const out=[];
    for(let mask=0;mask<(fhold?2**zeros.length:1);mask++){
      const holds=new Set(zeros.filter((_,i)=>mask&(1<<i)));
      let graph=Array.from({length:q+t},()=>[]),forbid=Array.from({length:q},()=>[]),j=0;
      for(let i=0;i<a.length;i++){
        if(holds.has(i))continue;
        let u=j%q,v=q+j%t,d=mod(b[i]-s*a[i]);
        graph[u].push([v,d]);graph[v].push([u,mod(-d)]);
        if(fhold)forbid[u].push(mod(s*a[i]));j++;
      }
      let p=Array(q+t).fill(null),components=[],ok=true;
      for(let k=0;k<p.length&&ok;k++){
        if(p[k]!==null)continue;p[k]=0;
        let stack=[k],nodes=[],bad=new Set();
        while(stack.length&&ok){
          let u=stack.pop();nodes.push(u);
          if(u<q)for(let v of forbid[u])bad.add(mod(v-p[u]));
          for(let [v,d] of graph[u]){
            let x=mod(p[u]+d);
            if(p[v]===null){p[v]=x;stack.push(v)}else if(p[v]!==x){ok=false;break}
          }
        }
        components.push({nodes,gauges:Array.from({length:29},(_,i)=>i).filter(i=>!bad.has(i))});
      }
      if(!ok)continue;
      const count=components.reduce((n,c)=>n*BigInt(c.gauges.length),1n);
      assert(count<=10000n,"candidate enumeration bound; no claim on overflow");
      const initial=out.length;
      function enumerate(ci,vals){
        if(ci<components.length){
          let {nodes,gauges}=components[ci];
          for(let v of gauges){let copy=vals.slice();for(let u of nodes)copy[u]=mod(p[u]+v);enumerate(ci+1,copy)}
          return;
        }
        let A=vals.slice(0,q).map(v=>mod(s*v)),B=vals.slice(q),P=[],clock=0;
        for(let i=0;i<a.length;i++){
          if(holds.has(i)){P.push(0);continue}
          let x=mod(a[i]-A[clock%q]);
          assert(!fhold||x!==0,"invalid ordinary F");
          assert(mod(x+A[clock%q])===a[i]&&mod(s*x+B[clock%t])===b[i],"replay");
          P.push(x);clock++;
        }
        out.push({A,B,P,clock,holds:[...holds]});
      }
      enumerate(0,p);
      assert(BigInt(out.length-initial)===count,"candidate count");
    }
    return out;
  }
  /** Exact forward/reverse F-held phase DP; each transition has one plaintext symbol. */
  function walk(C,K,s,j,reverse=false,fhold=true){
    let states=new Map([[mod(j,K.length),1n]]),death=null;
    for(let i=0;i<C.length;i++){
      let c=C[reverse?C.length-1-i:i],next=new Map();
      const add=(v,n)=>next.set(v,(next.get(v)||0n)+n);
      for(let [phase,n] of states){
        if(fhold&&c===0)add(phase,n);
        let use=reverse?mod(phase-1,K.length):phase;
        if(!fhold||mod(s*(c-K[use]))!==0)add(reverse?use:mod(phase+1,K.length),n);
      }
      states=next;if(!states.size){death=i;break}
    }
    return {count:String([...states.values()].reduce((a,b)=>a+b,0n)),death};
  }
  const live=x=>x.count!=="0";
  function check(K,s,j,begin,offset,end,quoteEnd,fhold){
    return {quote:walk(tape.slice(offset+21,quoteEnd),K,s,j,false,fhold),
      after:walk(tape.slice(offset+21,end),K,s,j,false,fhold),
      before:walk(tape.slice(begin,offset),K,s,0,true,fhold)};
  }
  const rows=[];
  for(let q of [1,8,13])for(let t of [1,8,13])for(let s of [1,-1])for(let fhold of [false,true]){
    const candidates=fit(a,b,q,t,s,fhold).map(k=>{
      let X=check(k.A,1,k.clock,starts[40],9811,starts[41],9869,fhold),Y=check(k.B,s,k.clock,starts[53],12522,starts[54],12592,fhold);
      return {...k,X,Y};
    });
    const quoteBoth=candidates.filter(k=>live(k.X.quote)&&live(k.Y.quote)).length;
    const forwardBoth=candidates.filter(k=>live(k.X.after)&&live(k.Y.after)).length;
    const backwardBoth=candidates.filter(k=>live(k.X.before)&&live(k.Y.before)).length;
    const pageBoth=candidates.filter(k=>live(k.X.after)&&live(k.Y.after)&&live(k.X.before)&&live(k.Y.before)).length;
    rows.push({q,t,s,fhold,n:candidates.length,quoteBoth,forwardBoth,backwardBoth,pageBoth,candidates});
  }
  const nativeTape=native.sections.flatMap(s=>[...s.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)));
  function enc(P,K,s,j=0){return P.map(p=>p===0?0:mod(s*p+K[j++%K.length]))}
  const controls=[];
  for(let [q,t] of [[8,13],[13,8]])for(let s of [1,-1]){
    const p=nativeTape.slice(8,29),A=Array.from({length:q},(_,i)=>mod(i*i+3*i+5)),B=Array.from({length:t},(_,i)=>mod(2*i*i+7*i+9));
    const keys=fit(enc(p,A,1),enc(p,B,s),q,t,s,true);
    const truth=keys.find(k=>eq(k.A,A)&&eq(k.B,B)&&eq(k.P,p));
    assert(truth,"planted key missing");
    let preA=nativeTape.slice(100,250),preB=nativeTape.slice(270,320),postA=nativeTape.slice(350,430),postB=nativeTape.slice(430,550);
    let cPreA=enc(preA,A,1,mod(-preA.filter(x=>x!==0).length,q)),cPreB=enc(preB,B,s,mod(-preB.filter(x=>x!==0).length,t));
    let cPostA=enc(postA,A,1,truth.clock),cPostB=enc(postB,B,s,truth.clock);
    assert([walk(cPreA,A,1,0,true),walk(cPreB,B,s,0,true),walk(cPostA,A,1,truth.clock),walk(cPostB,B,s,truth.clock)].every(live),"plant continuation missing");
    controls.push({q,t,s,keyCount:keys.length,knownHolds:truth.holds,heldRunes:preA.length+preB.length+postA.length+postB.length});
  }
  const positiveRows=rows.filter(r=>r.n>0);
  assert(eq(positiveRows.map(r=>r.n),[16,15,15,17]),"original counts");
  assert(eq(positiveRows.map(r=>r.quoteBoth),[2,4,4,3]),"quote counts");
  assert(rows.every(r=>r.pageBoth===0),"page survivors");
  return {rows,controls};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
