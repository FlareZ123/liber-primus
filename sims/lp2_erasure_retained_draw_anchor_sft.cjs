// Exact source-crib anchor inverse. Node.js 22, no dependencies.
// Conditional on a q-draw contiguous retained anchor; not an exhaustive all-key scan.
"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus,native) {
  const A="0123456789abcdefghijklmnopqrstuvwxyz", mod=(x,n)=>(x%n+n)%n;
  const alphabet=new Map(corpus.runes.map((r,i)=>[r,i]));
  const sections=native.sections.filter(s=>!/^p5[67]/.test(s.name)).map(s=>({name:s.name,words:(s.source_text.replace(/\/\s*/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>alphabet.get(x)))}));
  const phrases=new Map();
  for(const s of sections){const W=s.words.map(w=>w.map(x=>A[x]).join(""));for(let i=0;i<W.length;i++)for(let j=i+1;j<W.length;j++){if(W[i]!==W[j]||(i&&W[i-1]===W[j-1]))continue;let k=0;while(j+k<W.length&&W[i+k]===W[j+k])k++;let words=W.slice(i,i+k),p=words.join("");if(p.length>=20&&!phrases.has(words.join(" ")))phrases.set(words.join(" "),{source:s.name,wordOffsets:[i,j],text:p,P:Array.from(p,x=>A.indexOf(x))});}}
  const cribs=[...phrases.values()].sort((a,b)=>b.P.length-a.P.length);
  const expected=["783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4","93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i","2ijofgi4783o4iq317837af8ifg3fg1nq8i4i","783o4iq317837af8ifg3fg1nq8i4i","7i7akk93ghifg43li93168","7i5o9hik3lo9nhi4a68g"];
  if(JSON.stringify(cribs.map(x=>x.text))!==JSON.stringify(expected))throw Error("source phrase mismatch");
  const C=corpus.pages.filter(p=>p.page>=0&&p.page<=55).flatMap(p=>p.indices);
  if(C.length!==12956)throw Error("original length");
  const canon=K=>{let s=K.map(x=>A[x]).join("");return Array.from({length:s.length},(_,i)=>s.slice(i)+s.slice(0,i)).sort()[0]};
  /** Generate one accepted emission per input, strict repeat retry. */
  function sender(P,K,N,j=0,last=-1) {
    const events=[],q=K.length;for(const p of P){let count=0,c;while((c=(p+K[j])%N)===last){j=(j+1)%q;if(++count===q)return null;}events.push({c,j,retry:count});last=c;j=(j+1)%q;}return events;
  }
  /** Search all q-draw, all-retained anchors; deletion uses greedy maximum extension. */
  function scan(P,C,q,N,minimum){
    const L=P.length, K=new Array(q);let seeds=0,suffixSurvives=0,prefixLeaves=0,replays=0;const found=new Map();
    // No strict-repeat anchor can contain an equal adjacent pair.
    const valid=[];for(let t=0;t+q<=C.length;t++){let ok=true;for(let i=1;i<q;i++)if(C[t+i]===C[t+i-1]){ok=false;break;}if(ok)valid.push(t);}
    for(let a=0;a+q<=L;a++)for(const t of valid){
      if(Math.min(a,t)+q+Math.min(L-a-q,C.length-t-q)<minimum)continue;
      seeds++;for(let j=0;j<q;j++)K[j]=mod(C[t+j]-P[a+j],N);
      let j=0,last=C[t+q-1],right=t+q,ok=true;const suffix=[];
      for(let i=a+q;i<L;i++){
        if(Math.min(a,t)+right-t+L-i<minimum){ok=false;break;}
        let retries=0,c;while((c=(P[i]+K[j])%N)===last){j=(j+1)%q;if(++retries===q){ok=false;break;}}
        if(!ok)break;
        const keep=N===36?c<29:(right<C.length&&C[right]===c);
        if(keep){if(right>=C.length||C[right]!==c){ok=false;break;}right++;}
        suffix.push({c,j,keep});last=c;j=(j+1)%q;
      }
      if(!ok||Math.min(a,t)+right-t<minimum)continue;
      suffixSurvives++;
      const rev=[];
      function prefix(i,nextPhase,nextC,left){
        if(right-left+i+1<minimum)return;
        if(i<0){
          prefixLeaves++;
          if(right-left<minimum)return;
          const pre=rev.slice().reverse(), anchor=Array.from({length:q},(_,j)=>({c:C[t+j],j,keep:true})), ev=pre.concat(anchor,suffix);
          // Full forward replay from first accepted phase; entering state may be chosen distinct from its first output.
          const replay=sender(P,K,N,ev[0].j,-1);
          if(!replay||replay.some((x,k)=>x.c!==ev[k].c||x.j!==ev[k].j))throw Error("invalid reverse replay");
          const out=ev.filter(e=>e.keep).map(e=>e.c);
          if(out.length!==right-left||out.some((v,k)=>v!==C[left+k]))throw Error("invalid visible replay");
          if(N===36&&ev.some(e=>e.keep!==(e.c<29)))throw Error("hidden rule");
          replays++;
          const key=canon(K), id=key+":"+left+":"+right;
          if(!found.has(id))found.set(id,{key,anchor:[a,t],start:left,end:right,phaseKey:K.map(x=>A[x]).join(""),phases:ev.map(e=>e.j),kept:ev.map(e=>Number(e.keep)).join("")});
          return;
        }
        // Enumerate exact previous accepted phase, at most one full cycle back.
        for(let d=1;d<=q;d++){
          const k=mod(nextPhase-d,q),c=(P[i]+K[k])%N;
          if(c===nextC)continue;
          let valid=true;for(let z=1;z<d;z++)if((P[i+1]+K[(k+z)%q])%N!==c){valid=false;break;}
          if(!valid)continue;
          const keep=N===36?c<29:left>0&&C[left-1]===c;
          if(keep&&(left===0||C[left-1]!==c))continue;
          rev.push({c,j:k,keep});prefix(i-1,k,c,left-Number(keep));rev.pop();
        }
      }
      prefix(a-1,0,C[t],t);
    }
    return {seeds,suffixSurvives,prefixLeaves,replays,hits:[...found.values()]};
  }
  function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
  const original=[],controls=[];
  // Freeze .75 retention and at least 5 extra visible symbols beyond the anchor.
  for(const N of [36,29])for(const q of [8,13])for(let ci=0;ci<cribs.length;ci++){
    const c=cribs[ci],P=c.P, minimum=Math.max(Math.ceil(.75*P.length),q+5);if(minimum>P.length||P.length<2*q)continue;
    const o=scan(P,C,q,N,minimum);original.push({N,q,ci,L:P.length,minimum,...o});
    for(let z=0;z<12;z++){
      const R=rng(3301+100000*N+1000*q+37*ci+7919*z),K=Array.from({length:q},()=>Math.floor(R()*N));
      const source=sections.find(s=>s.name===c.source).words.flat(),E=sender(source,K,N);
      if(!E)throw Error("unexpected impossible sender");
      const keep=E.map(e=>N===36?e.c<29:R()<29/36),T=E.filter((e,i)=>keep[i]).map(e=>e.c);
      const truth=[];
      for(let i=0;i+P.length<=source.length;i++){
        if(P.some((x,j)=>x!==source[i+j]))continue;
        const count=keep.slice(i,i+P.length).filter(Boolean).length;let anchor=false;
        for(let a=i;a+q<=i+P.length;a++){if(keep.slice(a,a+q).every(Boolean)&&E.slice(a+1,a+q).every(e=>e.retry===0)){anchor=true;break;}}
        truth.push({i,count,anchor,eligible:anchor&&count>=minimum});
      }
      const result=scan(P,T,q,N,minimum),key=canon(K),matched=result.hits.some(h=>h.key===key),falseKeys=[...new Set(result.hits.map(h=>h.key))].filter(k=>k!==key);
      if(truth.some(x=>x.eligible)&&!matched)throw Error("eligible control missed "+JSON.stringify({N,q,ci,z,truth}));
      controls.push({N,q,ci,z,key,truth,matched,falseKeys,seeds:result.seeds,hits:result.hits.length});
    }
  }
  return {method:"exact retained consecutive-draw anchor, spacing-free; greedy maximal GP29 post-filter deletion extension",cribs:cribs.map(({P,...x})=>x),original,controls};
}
if(require.main===module){const root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
module.exports={experiment};
