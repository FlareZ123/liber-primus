'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native) {
  const assert=(v,msg)=>{if(!v)throw Error(msg)}, mod=(x,n=29)=>(x%n+n)%n, inv=x=>Array.from({length:28},(_,i)=>i+1).find(i=>mod(x*i)===1);
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
        let A=vals.slice(0,q).map(v=>mod(inv(s)*v)),B=vals.slice(q),P=[],clock=0;
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
  for(let q of [1,8,13])for(let t of [1,8,13])for(let s=1;s<29;s++)for(let fhold of [false,true]){
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
  for(let [q,t] of [[8,13],[13,8]])for(let s of [2,5,14,23]){
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
  assert(rows.reduce((a,r)=>a+r.n,0)===904,"original count");
  assert(rows.filter(r=>r.fhold).every(r=>r.pageBoth===0),"F page survivors");
  const survivorRows=rows.filter(r=>!r.fhold&&r.pageBoth);
  assert(survivorRows.length===2&&survivorRows.every(r=>r.s===14&&r.pageBoth===29),"ordinary survivors");

  const secs=native.sections.map(s=>[...s.source_text].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x)));
  function train(secs){const N=new Uint32Array(29**3),D=new Uint32Array(29**2);for(const p of secs)for(let i=2;i<p.length;i++){let j=29*p[i-2]+p[i-1];N[29*j+p[i]]++;D[j]++}return p=>{let s=0;for(let i=2;i<p.length;i++){const j=29*p[i-2]+p[i-1];s+=Math.log((N[29*j+p[i]]+.1)/(D[j]+2.9))}return {s,n:p.length-2}}}
  const decode=(C,K,off,s=1,m=1)=>C.map((x,i)=>mod(m*inv(s)*(x-K[mod(i-off,K.length)])));
  function rank(keys,ca,cb,offA,offB,score){const result=[];for(const k of keys)for(let m=1;m<29;m++){let x=decode(ca,k.A,offA,1,m),y=decode(cb,k.B,offB,k.s,m);let a=x.slice(offA,offA+21),b=y.slice(offB,offB+21);assert(eq(a,b),"common replay");const tr=score(a),ho=[x.slice(0,offA),x.slice(offA+21),y.slice(0,offB),y.slice(offB+21)].map(score),h=ho.reduce((a,b)=>a+b.s,0)/ho.reduce((a,b)=>a+b.n,0);result.push({q:k.q,t:k.t,s:k.s,m,A:k.A,B:k.B,anchor:a,anchorScore:tr.s/tr.n,heldScore:h,x,y});}return result.sort((a,b)=>b.anchorScore-a.anchorScore)}
  const keys=survivorRows.flatMap(r=>r.candidates.map(k=>({...k,q:r.q,t:r.t,s:r.s})));
  const ranked=rank(keys,tape.slice(9640,9871),tape.slice(12469,12648),171,53,train(secs));
  const lex=new Set(native.sections.flatMap(s=>s.source_text.split(/[^\u16a0-\u16ff]+/u).filter(Boolean)).map(x=>[...x].map(v=>corpus.runes.indexOf(v)).join(",")));
  function words(p){let i=0;return [5,7,2,3,4].map(n=>{let w=p.slice(i,i+n);i+=n;return w})}
  const hits=ranked.map(k=>words(k.anchor).filter(w=>lex.has(w.join(","))).length);
  const render=p=>p.map(x=>corpus.translit[x]).join("");
  const affineControls=[];
  function ordinary(P,K,s,off){return P.map((p,i)=>mod(s*p+K[mod(i-off,K.length)]))}
  const eligible=secs.map((p,i)=>[p,i]).filter(([p])=>p.length>=125);
  for(let z=0;z<4;z++){
    const [donor,di]=eligible[z%eligible.length],q=z%2?13:8,t=z%2?8:13,s=[2,5,14,23][z],m=[3,7,11,17][z],P=donor.slice(25,46),x=donor.slice(0,100),y=[...donor.slice(50,70),...P,...donor.slice(70,125)],offA=25,offB=20,A=Array.from({length:q},(_,i)=>mod(i*i+3*i+5+z)),B=Array.from({length:t},(_,i)=>mod(2*i*i+7*i+9+z));
    const X=ordinary(x,A,m,offA),Y=ordinary(y,B,mod(s*m),offB);
    const ks=fit(X.slice(offA,offA+21),Y.slice(offB,offB+21),q,t,s,false).map(k=>({...k,q,t,s}));
    const k=ks.find(k=>eq(k.A,A)&&eq(k.B,B));assert(k&&eq(k.P,P.map(x=>mod(m*x))),"ordinary plant");
    const rr=rank(ks,X,Y,offA,offB,train(secs.filter((_,i)=>i!==di))),truth=rr.findIndex(k=>eq(k.x,x)&&eq(k.y,y));assert(truth>=0,"affine plant");
    affineControls.push({q,t,s,m,candidates:rr.length,truthRank:truth+1,truthAnchor:rr[truth].anchorScore,truthHeld:rr[truth].heldScore,bestAnchor:rr[0].anchorScore,bestHeld:rr[0].heldScore});
  }
  return {cases:rows.length,totals:Object.fromEntries(["n","quoteBoth","forwardBoth","backwardBoth","pageBoth"].map(k=>[k,rows.reduce((s,x)=>s+x[k],0)])),positiveRows:rows.filter(r=>r.n).map(({candidates,...r})=>r),affinePlaintextCandidates:ranked.length,distinctAnchorPlaintexts:new Set(ranked.map(k=>k.anchor.join(","))).size,maximumNativeWordHits:Math.max(...hits),bestAnchor:ranked[0].anchorScore,bestAnchorHeld:ranked[0].heldScore,maximumHeld:Math.max(...ranked.map(k=>k.heldScore)),top5:ranked.slice(0,5).map(k=>({q:k.q,t:k.t,s:k.s,m:k.m,A:k.A,B:k.B,anchor:words(k.anchor).map(render).join(" "),anchorScore:k.anchorScore,heldScore:k.heldScore,p40:render(k.x),p53:render(k.y)})),controls,affineControls};

}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
