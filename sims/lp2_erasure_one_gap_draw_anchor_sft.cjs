// Exact spacing-free key recovery: one missing accepted or rejected draw in a complete key cycle.
"use strict";
const fs=require("node:fs"), path=require("node:path");
function oneGapExperiment(corpus,native,{N=36,q=13,ci=-1,mode="both",plants=12}={}){
  const A="0123456789abcdefghijklmnopqrstuvwxyz",mod=(x,n)=>(x%n+n)%n;
  const chart=new Map(corpus.runes.map((x,i)=>[x,i]));
  const sections=native.sections.filter(s=>!/^p5[67]/.test(s.name)).map(s=>({name:s.name,W:(s.source_text.replace(/\/\s*/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>chart.get(x)))}));
  const cribs=new Map();
  for(const s of sections){const W=s.W.map(w=>w.map(x=>A[x]).join(""));for(let i=0;i<W.length;i++)for(let j=i+1;j<W.length;j++){if(W[i]!==W[j]||(i&&W[i-1]===W[j-1]))continue;let k=0;while(j+k<W.length&&W[i+k]===W[j+k])k++;const p=W.slice(i,i+k).join("");if(p.length>=20&&!cribs.has(p))cribs.set(p,{source:s.name,P:Array.from(p,x=>A.indexOf(x))});}}
  const phrases=[...cribs.values()].sort((a,b)=>b.P.length-a.P.length);
  if(phrases.map(x=>x.P.length).join()!=="42,41,37,29,22,20")throw Error("source phrases");
  const C=corpus.pages.filter(p=>p.page>=0&&p.page<=55).flatMap(p=>p.indices);if(C.length!==12956)throw Error("original");
  const canon=K=>{let s=Array.from(K,x=>A[x]).join("");return Array.from({length:s.length},(_,i)=>s.slice(i)+s.slice(0,i)).sort()[0]};
  function sender(P,K,j=0,last=-1){const E=[];for(const p of P){let retry=0,c;while((c=(p+K[j])%N)===last){j=(j+1)%q;if(++retry===q)return null;}E.push({c,j,retry});last=c;j=(j+1)%q;}return E;}
  function scan(P,T,m){
    const L=P.length, K=new Int8Array(q), h=q-1, hits=new Map();
    let seeds=0, keys=0, passes=0, replays=0;
    const windows=Array.from({length:q-2},()=>[]),noRepeat=[];
    for(let t=0;t+h<=T.length;t++){let equal=-1,bad=false;for(let j=1;j<h;j++)if(T[t+j]===T[t+j-1]){if(equal>=0){bad=true;break;}equal=j;}
      if(bad)continue;if(equal<0){noRepeat.push(t);for(const w of windows)w.push(t);}else if(equal>=1&&equal<=q-2)windows[equal-1].push(t);
    }
    function check(a,t,g,kind,missing){
      keys++;
      const span=kind===0?q:q-1;
      let j=0,last=T[t+h-1],r=t+h;
      const end=a+span;
      // Evaluate deterministic forward suffix first, with early maximum-visible bound.
      for(let i=end;i<L;i++){
        if(Math.min(a,t)+r-t+L-i<m)return;
        let retry=0,c;while((c=(P[i]+K[j])%N)===last){j=(j+1)%q;if(++retry===q)return;}
        if(N===36){if(c<29){if(r>=T.length||T[r]!==c)return;r++;}}
        else if(r<T.length&&T[r]===c)r++;
        last=c;j=(j+1)%q;
      }
      if(Math.min(a,t)+r-t<m)return;
      passes++;
      const rev=[];
      function back(i,nextPhase,nextC,left){
        if(r-left+i+1<m)return;
        if(i<0){
          if(r-left<m)return;
          // Replay whole accepted path, including the selected missing/retry anchor.
          const firstPhase=rev.length?rev[rev.length-1]:0,E=sender(P,K,firstPhase);
          if(!E)throw Error("replay impossible");
          if(E[a].j!==0)throw Error("anchor phase");
          let keep=new Array(L).fill(false),pos=t;
          // The anchor is fixed, prefix/suffix greedy are recomputed from replay.
          for(let k=0;k<span;k++){if(kind===0&&k===g)continue;keep[a+k]=true;if(E[a+k].c!==T[pos++])throw Error("anchor replay");}
          if(kind===0){if(E[a+g].c!==missing||E.slice(a+1,a+span).some(e=>e.retry!==0))throw Error("gap replay");}
          else if(E[a+g].retry!==1||E.slice(a+1,a+span).some((e,k)=>e.retry!==(k+1===g?1:0)))throw Error("retry replay");
          pos=t;for(let k=a-1;k>=0;k--){if(N===36?E[k].c<29:pos>0&&T[pos-1]===E[k].c){if(pos===0||T[--pos]!==E[k].c)throw Error("left replay");keep[k]=true;}}
          if(pos!==left)throw Error("left extent");
          pos=t+h;for(let k=end;k<L;k++){if(N===36?E[k].c<29:pos<T.length&&T[pos]===E[k].c){if(pos>=T.length||T[pos++]!==E[k].c)throw Error("right replay");keep[k]=true;}}
          if(pos!==r)throw Error("right extent");
          if(N===36&&E.some((e,k)=>keep[k]!== (e.c<29)))throw Error("silent replay");
          replays++;const key=canon(K),id=key+":"+left+":"+r;
          if(!hits.has(id))hits.set(id,{key,phaseKey:Array.from(K,x=>A[x]).join(""),start:left,end:r,anchor:[a,t,g],kind:kind===0?"missing accepted":"rejected draw",missing,phases:E.map(e=>e.j),kept:keep.map(Number).join("")});
          return;
        }
        for(let d=1;d<=q;d++){
          const k=mod(nextPhase-d,q),c=(P[i]+K[k])%N;if(c===nextC)continue;
          let ok=true;for(let z=1;z<d;z++)if((P[i+1]+K[(k+z)%q])%N!==c){ok=false;break;}if(!ok)continue;
          const keep=N===36?c<29:left>0&&T[left-1]===c;if(keep&&(left===0||T[left-1]!==c))continue;
          rev.push(k);back(i-1,k,c,left-Number(keep));rev.pop();
        }
      }
      back(a-1,0,T[t],t);
    }
    // q accepted events, one internal invisible event and no internal rejections.
    for(let a=0;a+q<=L;a++)for(let g=1;g<=q-2;g++)for(const t of windows[g-1]){
      if(Math.min(a,t)+h+Math.min(L-a-q,T.length-t-h)<m)continue;
      seeds++;
      for(let j=0;j<q;j++)if(j!==g)K[j]=mod(T[t+j-Number(j>g)]-P[a+j],N);
      const before=T[t+g-1],after=T[t+g];
      for(let c=N===36?29:0;c<N;c++){if(c===before||c===after)continue;K[g]=mod(c-P[a+g],N);check(a,t,g,0,c);}
    }
    // q draws, one internal rejected draw and q-1 retained accepted events.
    for(let a=0;a+q-1<=L;a++)for(let g=1;g<=q-2;g++)for(const t of noRepeat){
      if(Math.min(a,t)+h+Math.min(L-a-q+1,T.length-t-h)<m)continue;
      seeds++;
      for(let j=0;j<q;j++){const p=a+j-Number(j>g),c=t+j-Number(j>=g);K[j]=mod(T[c]-P[p],N);}
      check(a,t,g,1,-1);
    }
    return {seeds,keys,passes,replays,hits:[...hits.values()]};
  }
  function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
  const original=[],controls=[];
  for(let i=0;i<phrases.length;i++){
    if(ci>=0&&ci!==i)continue;const {P,source}=phrases[i],L=P.length,m=Math.max(Math.ceil(.75*L),q+5);if(m>L||L<2*q)continue;
    if(mode!=="controls")original.push({N,q,ci:i,L,m,...scan(P,C,m)});
    if(mode==="original")continue;
    for(let z=0;z<plants;z++){
      const R=rng(3301+100000*N+1000*q+37*i+7919*z),K=Array.from({length:q},()=>Math.floor(R()*N)),S=sections.find(s=>s.name===source).W.flat(),E=sender(S,K);
      if(!E)throw Error("plant sender");const keep=E.map(e=>N===36?e.c<29:R()<29/36),T=E.filter((e,j)=>keep[j]).map(e=>e.c),truth=[];
      for(let a=0;a+L<=S.length;a++){
        if(P.some((x,j)=>x!==S[a+j]))continue;
        const count=keep.slice(a,a+L).filter(Boolean).length;let plain=false,missing=false,rejected=false;
        for(let b=a;b+q<=a+L;b++){
          const mask=keep.slice(b,b+q);if(!E.slice(b+1,b+q).every(e=>e.retry===0))continue;
          if(mask.every(Boolean))plain=true;
          if(mask[0]&&mask[q-1]&&mask.filter(Boolean).length===q-1)missing=true;
        }
        for(let b=a;b+q-1<=a+L;b++)if(keep.slice(b,b+q-1).every(Boolean)&&E.slice(b+1,b+q-1).reduce((s,e)=>s+e.retry,0)===1)rejected=true;
        truth.push({a,count,plain,missing,rejected,eligible:count>=m&&(missing||rejected),union:count>=m&&(plain||missing||rejected)});
      }
      const res=scan(P,T,m),key=canon(K),matched=res.hits.some(x=>x.key===key);if(truth.some(x=>x.eligible)&&!matched)throw Error("missed eligible plant "+JSON.stringify({N,q,i,z,truth}));
      controls.push({N,q,ci:i,z,key,truth,matched,falseKeys:[...new Set(res.hits.map(x=>x.key))].filter(k=>k!==key),hitCount:res.hits.length,keys:res.keys});
    }
  }
  return {N,q,ci,mode,original,controls};
}
module.exports={oneGapExperiment};
if(require.main===module){const root=path.resolve(__dirname,"..");const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));const [N,q,ci,mode]=process.argv.slice(2);console.log(JSON.stringify(oneGapExperiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json"),{N:Number(N||36),q:Number(q||13),ci:Number(ci??-1),mode:mode||"both"}),null,2));}
