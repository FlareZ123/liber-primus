'use strict';
/** Agent25: local all-key affine period13 F-hold singleton exclusion. */
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function localGate(corpus,raw,donor){
  const Q=13,mod=x=>(x%29+29)%29,id=new Map(corpus.runes.map((r,i)=>[r,i]));
  const check=(a,m)=>{if(!a)throw Error(m)};
  const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const words=[];let w=[];
  function end(){if(w.length){words.push(w);w=[];}}
  for(const c of raw.split("%").slice(0,55).join("%")){if(id.has(c))w.push(id.get(c));else if(c==="%"||c==="/"||/\s/u.test(c))continue;else end();}
  end();check(words.length===2896&&JSON.stringify(words.flat())===JSON.stringify(C),"canonical parse");
  function singletonIndices(ws){const s=[];let i=0;for(const w of ws){if(w.length===1)s.push(i);i+=w.length;}return s;}
  // Split at every page boundary, ciphertext F, or reset after repeated C.
  // Also permit arbitrary key changes between these spans: only within-span
  // equal relative phase is used by the witness.
  function spans(c,ps){
    const B=[];let off=0;for(const {page,n} of ps){let start=off;
      for(let i=off;i<off+n;i++){
        if(c[i]===0){if(i>start)B.push({page,start,end:i});start=i+1;}
        else if(i>off&&c[i]===c[i-1]){if(i+1>start)B.push({page,start,end:i+1});start=i+1;}
      }
      if(start<off+n)B.push({page,start,end:off+n});off+=n;
    }
    return B;
  }
  function witness(c,S,B,allowed,a){
    const res=[];
    for(const b of B){const ss=S.filter(i=>i>=b.start&&i<b.end);
      if(!ss.length)continue;
      for(const s of ss){
        const ks=allowed.map(p=>mod(c[s]-a*p));
        const sites=ks.map(k=>{for(let i=b.start;i<b.end;i++)if(i!==s&&(i-s)%Q===0&&c[i]===k)return i;return -1;});
        if(sites.every(i=>i>=0))res.push({page:b.page,span:[b.start,b.end],s,c:c[s],keys:ks,sites});
      }
    }
    return res;
  }
  const ps=corpus.pages.filter(p=>p.page<56).map(p=>({page:p.page,n:p.indices.length}));
  const B=spans(C,ps),S=singletonIndices(words);
  const initial=B.filter(b=>b.page<=14),heldout=B.filter(b=>b.page>=16&&b.page<=21);
  const test=(ranges,allowed)=>Array.from({length:28},(_,i)=>{const a=i+1,ws=witness(C,S,ranges,allowed,a);return {a,count:ws.length,first:ws[0]??null}});
  const fit=test(initial,[24,10]),hold=test(heldout,[24,10]),aioFit=test(initial,[24,10,3]),aioHold=test(heldout,[24,10,3]);
  const whole=test(B,[24,10]),aioWhole=test(B,[24,10,3]);
  // Real native plants: shared affine slope, a different key per page/section
  // and deterministic reset after a repeat. All true slope witnesses must be absent.
  const native=donor.sections.filter(s=>s.name==="0_welcome"||s.name==="0_koan_1").map(s=>({name:s.name,words:[...s.source_text.matchAll(/[ᚠ-᛿]+/gu)].map(m=>[...m[0]].map(x=>id.get(x)))}));
  let state=3301>>>0;function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  const positives=[];
  for(const n of native){
    const P=n.words.flat(),S=singletonIndices(n.words);
    check(S.every(i=>P[i]===24||P[i]===10),"control singleton");
    for(let a=1;a<=28;a++){
      const key=Array.from({length:Q},()=>rng()%29);let phase=0;const c=[];
      for(const p of P){const x=p===0?0:mod(a*p+key[phase]);if(p!==0)phase=(phase+1)%Q;if(c.length&&x===c.at(-1))phase=0;c.push(x);}
      const spansC=spans(c,[{page:0,n:c.length}]);check(witness(c,S,spansC,[24,10],a).length===0,"false rejection of authentic plant");
      positives.push({name:n.name,a,n:P.length});
    }
  }
  const summary=v=>({eliminated:v.filter(x=>x.count).map(x=>x.a),survive:v.filter(x=>!x.count).map(x=>x.a),witnesses:v.filter(x=>x.count)});
  return {fit:summary(fit),holdout:summary(hold),aioFit:summary(aioFit),aioHoldout:summary(aioHold),whole:summary(whole),aioWhole:summary(aioWhole),positives:positives.length,positiveRunes:positives.reduce((s,x)=>s+x.n,0)};
}
console.log(JSON.stringify(localGate(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
