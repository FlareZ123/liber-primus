"use strict";
// Agent 6: opposite-sign parity-selected prime clocks; exploratory, not authenticated.
const fs=require("node:fs"),path=require("node:path");
function run(corpus,native){
  const N=29, MAX=3300, KEEP=8, mod=x=>(x%N+N)%N, M=30;
  const ps=[], composite=new Uint8Array(60000);
  for(let i=2;i<composite.length;i++)if(!composite[i]){ps.push((i-1)%N);if(i*i<composite.length)for(let j=i*i;j<composite.length;j+=i)composite[j]=1;}
  const ids=new Map(corpus.runes.map((x,i)=>[x,i]));
  const donors=native.sections.map(x=>({name:x.name,p:[...x.source_text].filter(y=>ids.has(y)).map(y=>ids.get(y))}));
  function lm(excluded){
    const u=new Float64Array(N),b=new Float64Array(M*N),t=new Float64Array(M*M*N),tot=new Float64Array(M),tb=new Float64Array(M*M);
    let n=0;
    for(const s of donors){if(s.name===excluded)continue;let a=N,c=N;for(const p of s.p){u[p]++;n++;b[c*N+p]++;tot[c]++;t[(a*M+c)*N+p]++;tb[a*M+c]++;a=c;c=p;}}
    const unig=Float64Array.from(u,x=>Math.log((x+0.5)/(n+0.5*N))), tri=new Float64Array(t.length);
    for(let a=0;a<M;a++)for(let c=0;c<M;c++)for(let p=0;p<N;p++){
      const q=(b[c*N+p]+8*Math.exp(unig[p]))/(tot[c]+8);
      tri[(a*M+c)*N+p]=Math.log((t[(a*M+c)*N+p]+12*q)/(tb[a*M+c]+12));
    }
    return {unig,tri};
  }
  const signs=[1,-1];
  function lanes(C,prev){return C.map(c=>{const v=prev%2;prev=c;return v;});}
  function encrypt(P,offs,prev){const k=offs.slice(),C=[];for(const p of P){const l=prev%2;const c=p===0?0:mod(p+signs[l]*ps[k[l]++]);C.push(c);prev=c;}return C;}
  function screen(C,lang,l){
    const n=C.length,z=C.filter(x=>x===0).length,rows=[];
    for(let o=0;o<=MAX;o++){
      let a=new Float64Array(z+1).fill(-Infinity);a[0]=0;let maxh=0;
      for(let i=0;i<n;i++){
        const c=C[i],b=new Float64Array(z+1).fill(-Infinity);
        for(let h=0;h<=maxh;h++){
          const old=a[h];if(!Number.isFinite(old))continue;
          const p=mod(c-signs[l]*ps[o+i-h]);
          if(p!==0)b[h]=Math.max(b[h],old+lang.unig[p]);
          if(c===0)b[h+1]=Math.max(b[h+1],old+lang.unig[0]);
        }
        if(c===0)maxh++;a=b;
      }
      const score=Math.max(...a);if(Number.isFinite(score))rows.push({o,score});
    }
    rows.sort((a,b)=>b.score-a.score||a.o-b.o);return rows;
  }
  function solve(C,L,offs,lang,start){
    let states=new Map([[0,{h0:0,h1:0,a:start?.a??N,b:start?.b??N,s:0,prev:null,p:null}]]),seen=[0,0],peak=1;
    const k=start?.k??offs;
    for(let i=0;i<C.length;i++){
      const c=C[i],l=L[i],next=new Map();
      for(const old of states.values()){
        const h=l===0?old.h0:old.h1,p=mod(c-signs[l]*ps[k[l]+seen[l]-h]);
        function add(p,hold){const h0=old.h0+(hold&&l===0?1:0),h1=old.h1+(hold&&l===1?1:0),a=old.b,b=p,s=old.s+lang.tri[(old.a*M+old.b)*N+p],key=(((h0*512+h1)*M+a)*M+b);const o=next.get(key);if(!o||o.s<s)next.set(key,{h0,h1,a,b,s,prev:old,p});}
        if(p!==0)add(p,false);if(c===0)add(0,true);
      }
      seen[l]++;states=next;peak=Math.max(peak,states.size);
      if(!states.size)return null;
    }
    let best=null;for(const s of states.values())if(!best||s.s>best.s)best=s;
    const plain=[];for(let s=best;s.prev!==null;s=s.prev)plain.push(s.p);plain.reverse();
    return {plain,score:best.s/C.length,peak,state:{a:best.a,b:best.b,k:[k[0]+seen[0]-best.h0,k[1]+seen[1]-best.h1]}};
  }
  function trial(name,C,prev,truth,actual){
    const train=C.slice(0,249),held=C.slice(249),L=lanes(C,prev),lang=lm(truth?name:null);
    const r=[0,1].map(l=>screen(train.filter((c,i)=>L[i]===l),lang,l));
    const ranks=truth?r.map((a,i)=>a.findIndex(v=>v.o===actual[i])+1):null;
    const cand=[];
    for(const a of r[0].slice(0,KEEP))for(const b of r[1].slice(0,KEEP)){
      const offsets=[a.o,b.o],z=solve(train,L.slice(0,249),offsets,lang);if(z)cand.push({offsets,z});
    }
    cand.sort((a,b)=>b.z.score-a.z.score);
    const best=cand[0];if(!best)return {name,ranks,candidates:0};
    const {offsets,z}=best;
    const h=solve(held,L.slice(249),offsets,lang,z.state);
    const recovered=h?z.plain.concat(h.plain):z.plain;
    const enc=encrypt(recovered,offsets,prev);
    if(enc.some((c,i)=>c!==C[i]))throw Error("replay failure");
    const v={name,length:C.length,offsets,ranks,candidates:cand.length,prefixScore:z.score,holdScore:h?.score??null,prefixPeak:z.peak,holdPeak:h?.peak??0,fullReplay:enc.length===C.length,prefixText:z.plain.map(x=>corpus.translit[x]).join(""),holdText:h?.plain.map(x=>corpus.translit[x]).join("")??null,top5:cand.slice(0,5).map(x=>({offsets:x.offsets,score:x.z.score}))};
    if(truth){v.actual=actual;v.prefixCorrect=z.plain.filter((p,i)=>p===truth[i]).length;v.heldCorrect=h?h.plain.filter((p,i)=>p===truth[i+249]).length:0;}
    return v;
  }
  const p0=corpus.pages[0].indices,p1=corpus.pages[1].indices,prev=p0[12];
  const specs=[["0_koan_1",[1033,3300]],["0_loss_of_divinity",[3301-1,761]]];
  const tests=specs.map(([name,offsets])=>{const p=donors.find(x=>x.name===name).p.slice(0,515);if(p.length!==515)throw Error("short donor");return trial(name,encrypt(p,offsets,prev),prev,p,offsets);});
  const orig=trial("p0-body plus p1",p0.slice(13).concat(p1),prev);
  return {hypothesis:"two independent signed prime-minus-one clocks, preceding GP index parity, literal F hold, p0 red-title predecessor",maxOffset:MAX,perLaneKeep:KEEP,tests,orig};
}
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
