'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(native,transcription,wordfreq) {
  /** @param {boolean} c @param {string} m */
  function assert(c,m){if(!c)throw Error(m);}
  const R=native.runes,ix=new Map(R.map((r,i)=>[r,i])),m29=n=>(n%29+29)%29,m28=n=>(n%28+28)%28;
  const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
  const tokens=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"].map((s,i)=>({s,i})).concat([{s:"ING",i:21},{s:"IO",i:27}]).sort((a,b)=>b.s.length-a.s.length);
  const words=native.sections.map(s=>(s.source_text.match(new RegExp("["+R.join("")+"]+","gu"))||[]).map(w=>[...w].map(r=>ix.get(r))));
  let off=0,fixes=0;
  words[3]=words[3].map(w=>{const o=off;off+=w.length;if(o===140||o===277){assert(w.join(",")==="7,8,24,16","WHO correction");fixes++;return [7,8,3];}return w;});
  const C=[...transcription].filter(r=>ix.has(r)).map(r=>ix.get(r));
  assert(fixes===2&&words.slice(0,7).flat(2).length===2797&&C.length===13136,"sources");
  const L=24, id=w=>String.fromCharCode(...w.map(p=>65+p)), modPhi=n=>{let o=n,m=n;for(let p=2;p*p<=m;p++)if(m%p===0){o-=o/p;while(m%p===0)m/=p;}if(m>1)o-=o/m;return o;};
  const keys=(exclude=-1)=>{const s=words.slice(0,7).flatMap((a,i)=>i===exclude?[]:a).map(w=>w.reduce((a,p)=>a+primes[p],0));return {sum:s.map(m28),phi:s.map(n=>m28(modPhi(n)))};};
  const dictCount=new Map(), single=new Set([24,10,3,16]);
  const add=(w,n)=>{if(w.length&&w.length<=L&&(w.length!==1||single.has(w[0]))){const k=id(w);dictCount.set(k,(dictCount.get(k)||0)+n);}};
  function latin(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const t=tokens.find(x=>w.startsWith(x.s,j));if(!t)return [];p.push(t.i);j+=t.s.length;}return p;}
  for(const line of wordfreq.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(line);if(z)add(latin(z[1]),Number(z[2]));}
  for(const s of [0,2,3,4,6])for(const w of words[s])add(w,1);
  const total=[...dictCount.values()].reduce((s,n)=>s+n,0);
  const dict=new Map([...dictCount].map(([w,n])=>[w,Math.log(.98*n/total)]));
  const oov=new Float64Array(L+1);
  for(let n=1;n<=L;n++)oov[n]=Math.log(.02*.25*Math.pow(.75,n-1)/(1-Math.pow(.75,L)))-n*Math.log(29);
  function emit(w){const z=dict.get(id(w));return Math.max(z??-Infinity,oov[w.length]);}
  function deltas(c,prev){return c.map(x=>{const d=m29(x-prev);prev=x;return d;});}
  function runes(D,start,len,shift){const p=[];for(let i=start;i<start+len;i++)p.push(D[i]===0?28:m28(D[i]-1-shift));return p;}
  function encrypt(W,K,origin,sign,prev){let j=origin,out=[];for(const w of W){const shift=m28(sign*K[j]);for(const p of w){const d=p===28?0:1+m28(p+shift);prev=m29(prev+d);out.push(prev);}j=(j+1)%K.length;}return out;}
  function scores(D){const out=new Float64Array(D.length*28*(L+1));for(let pos=0;pos<D.length;pos++)for(let shift=0;shift<28;shift++){let w="",base=(pos*28+shift)*(L+1);for(let l=1;l<=L&&pos+l<=D.length;l++){w+=String.fromCharCode(65+(D[pos+l-1]===0?28:m28(D[pos+l-1]-1-shift)));out[base+l]=Math.max(dict.get(w)??-Infinity,oov[l]);}}return out;}
  /** Exact max-product segmentation and key-phase dynamic program. */
  function decode(D,A,K,sign,start,minEnd,maxEnd,initial=null){
    const M=K.length,N=maxEnd-start,dp=new Float64Array((N+1)*M).fill(-Infinity),back=new Uint8Array((N+1)*M),shifts=K.map(k=>m28(sign*k));
    if(initial===null)dp.fill(0,0,M);else dp[initial]=0;
    for(let i=0;i<N;i++){const limit=Math.min(L,N-i),row=i*M;
      for(let j=0;j<M;j++){const val=dp[row+j];if(val===-Infinity)continue;const next=(j+1)%M,base=((i+start)*28+shifts[j])*(L+1);
        for(let l=1;l<=limit;l++){const q=(i+l)*M+next,s=val+A[base+l];if(s>dp[q]){dp[q]=s;back[q]=l;}}
      }
    }
    let best=-Infinity,end=-1,jEnd=-1;
    for(let e=minEnd-start;e<=N;e++)for(let j=0;j<M;j++){const v=dp[e*M+j]/e;if(v>best){best=v;end=e;jEnd=j;}}
    assert(end>0,"reachable OOV model");
    let i=end,j=jEnd,W=[];
    while(i>0){const len=back[i*M+j];assert(len>0,"backtrack");j=(j+M-1)%M;i-=len;const w=runes(D,i+start,len,shifts[j]);W.push({start:i+start,phase:j,word:w,logp:emit(w),inVocab:dict.has(id(w))});}
    W.reverse();
    assert(initial===null||initial===j,"frozen phase");
    return {origin:j,phase:jEnd,end:end+start,score:best,W};
  }
  function fit(c,prev,ks,truth=null){const D=deltas(c,prev),A=scores(D),rows=[];
    for(const [kind,K] of Object.entries(ks))for(const sign of [-1,1]){
      const p=decode(D,A,K,sign,0,190,200),h=decode(D,A,K,sign,p.end,c.length,c.length,p.phase),W=p.W.concat(h.W),P=W.flatMap(w=>w.word);
      assert(encrypt(W.map(w=>w.word),K,p.origin,sign,prev).every((x,i)=>x===c[i]),"full original replay");
      const strictlyUnseen=h.W.filter(w=>w.start>=200),N=strictlyUnseen.reduce((s,w)=>s+w.word.length,0);
      const trueTape=truth?truth.flat():null;
      const exact=trueTape?P.reduce((s,x,i)=>s+(i>=200&&x===trueTape[i]),0):null;
      const actualBounds=new Set();if(truth){let j=0;for(const w of truth){actualBounds.add(j);j+=w.length;}}
      rows.push({kind,sign,origin:p.origin,phaseAtSplit:p.phase,split:p.end,prefixScore:p.score,holdScore:h.score,strictHoldScore:strictlyUnseen.reduce((s,w)=>s+w.logp,0)/N,strictHoldRunes:N,unseenExact:exact,unseenTotal:c.length-200,words:W.length,knownRunes:W.filter(w=>w.inVocab).reduce((s,w)=>s+w.word.length,0),boundsMatched:truth?W.filter(w=>actualBounds.has(w.start)).length:null,truthWords:truth?truth.length:null,plaintext:W.map(w=>w.word),oov:W.filter(w=>!w.inVocab).map(w=>({start:w.start,word:w.word}))});
    }
    const best=rows.slice().sort((a,b)=>b.prefixScore-a.prefixScore)[0];
    return {best,variants:rows,repeats:D.filter(d=>d===0).length};
  }
  const K=keys();assert(K.sum.length===695,"695 source words");
  const controls=[];
  const plants=[{section:1,kind:"sum",sign:1,origin:137},{section:5,kind:"phi",sign:-1,origin:433}];
  for(const p of plants){const k=keys(p.section),W=[];let n=0;for(const w of words[p.section]){W.push(w);n+=w.length;if(n>=308)break;}assert(n>=308&&n<=320,"plant length");
    const ct=encrypt(W,k[p.kind],p.origin,p.sign,0),truthScore=W.reduce((s,w)=>s+emit(w),0)/n;
    controls.push({type:"plant",...p,n,truthScore,...fit(ct,0,k,W)});
    const wrong=k[p.kind].slice();let seed=(0x81fe2000^p.origin)>>>0;for(let i=wrong.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
    controls.push({type:"wrong-source",...p,n,truthScore,...fit(encrypt(W,wrong,p.origin,p.sign,0),0,k,W)});
  }
  const starts=[0,729,1874,3603,5506,6527,7960,9640,12648],names=["p0–2","p3–7","p8–14","p15–22","p23–26","p27–32","p33–39","p40–53","p54–55"];
  const originals=starts.map((start,i)=>({chapter:names[i],start,prev:start?C[start-1]:0,...fit(C.slice(start,start+308),start?C[start-1]:0,K)}));
  return {keyLength:K.sum.length,dictTypes:dict.size,dictTotal:total,maxWord:L,controls,originals};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const result=experiment(JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/liber-primus/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(result,null,2));
