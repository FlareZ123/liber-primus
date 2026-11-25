'use strict';
// Run from repository root: node sims/lp2_p55_two_endpoint_dh_hybrid_sft.cjs
// Fixed p55 two-endpoint DH and hybrid ElGamal packet receivers.
const fs = require('node:fs');
function experiment(src) {
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const mod=x=>(x%29+29)%29;
  const runes=[..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
  const names="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" ");
  const index=new Map(runes.map((v,i)=>[v,i]));
  const digits=s=>[...s].filter(x=>index.has(x)).map(x=>index.get(x));
  const words=s=>s.split(/[-.&$§]/u).map(digits).filter(x=>x.length);
  const pages=src.replace(/\r\n/g,"\n").split(/\n%\n/);
  check(pages.length===57,"57 rune-bearing pages");
  const fragments=words(pages[54]), carry=fragments[0], ws=fragments.slice(1);
  check(carry.join()==="21","p55 NG carry");
  check(ws.map(w=>w.length).join()==="4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3","p55 geometry");
  const lengths=ws.map(w=>w.length-2);
  const p57=digits(pages[56]);
  check(p57.length===95,"p57 clear length");
  const G=[1];for(let i=1;i<29;i++)G.push(G[i-1]*5%59);
  const log=new Map(G.map((x,i)=>[x,i]));
  check(log.size===29 && G[28]*5%59===1,"subgroup generator");
  /** @param {number} b @param {number} e */
  function pow(b,e){let r=1;for(let i=0;i<e;i++)r=r*b%59;return r}
  /** @param {number} a @param {number} b @param {string} mode */
  function key(a,b,mode){
    if(mode==="DH"){
      const q=log.get(pow(G[a],b));
      check(q===mod(a*b) && G[q]===pow(G[b],a),"DH key");
      return q;
    }
    const q=mod(b-6*a);
    check(G[q]*pow(G[a],6)%59===G[b],"ElGamal encapsulation");
    return q;
  }
  /** @param {number[][]} blocks @param {string} mode */
  function decode(blocks,mode){
    return blocks.map(w=>{
      const a=w[0],b=w.at(-1),k=key(a,b,mode);
      const m=w.slice(1,-1).map(c=>mod(c-k));
      const regenerated=[a,...m.map(p=>mod(p+k)),mode==="DH"?b:mod(k+6*a)];
      check(regenerated.join()===w.join(),"exact forward replay");
      return {a,b,k,m};
    });
  }
  const spell=xs=>xs.map(x=>names[x]).join(" ");
  const ioc=xs=>{
    const n=Array(29).fill(0);for(const x of xs)n[x]++;
    return n.reduce((s,v)=>s+v*(v-1),0)/(xs.length*(xs.length-1));
  };
  const outputs={};
  for(const mode of ["DH","ElGamal"]){
    const rows=decode(ws,mode), payload=rows.flatMap(r=>r.m), combined=rows.flatMap(r=>[r.k,...r.m]);
    check(payload.length===43 && combined.length===59,"payload geometry");
    const controls=[];
    for(let t=0;t<2;t++){
      const plain=p57.slice(t*43,(t+1)*43);let off=0;
      const plant=lengths.map((n,j)=>{
        const a=mod(7*j+11*t),z=mod(13*j+3*t+1);
        const b=mode==="DH"?z:mod(z+6*a);
        const k=key(a,b,mode),m=plain.slice(off,off+=n);
        return [a,...m.map(p=>mod(p+k)),b];
      });
      const recovered=decode(plant,mode).flatMap(r=>r.m);
      check(recovered.join()===plain.join(),"clear-native control");
      controls.push({recovered:recovered.length,exact:true,physicalRunes:plant.flat().length});
    }
    outputs[mode]={keys:spell(rows.map(r=>r.k)),payload:spell(payload),payloadIoC:ioc(payload),combined:rows.map(r=>spell([r.k,...r.m])).join(" / "),combinedIoC:ioc(combined),twoRuneGroups:rows.filter(r=>r.m.length===0).map(r=>names[r.k]),controls,originalReplay:carry.length+ws.flat().length};
  }
  return outputs;
}
console.log(JSON.stringify(experiment(fs.readFileSync('resources/transcriptions/lp2-image-corrected.txt','utf8')), null, 2));
