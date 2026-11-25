'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(j,native,donorTexts){
  const assert=(x,m)=>{if(!x)throw Error(m)},g=Array.from({length:29},(_,i)=>i);
  const rm=new Map(j.runes.map((x,i)=>[x,i])),tok=j.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function donor(s){
    const p=[];
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
      while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,"donor token");p.push(t.i);w=w.slice(t.s.length);}
    }return p;
  }
  const ds=donorTexts.map(({name,s})=>({name,p:donor(s)})),pages=j.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices),tape=pages.flat(),N=tape.length;
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>j.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
  assert(N===12956&&pages.length===55&&chapters.flat().join()===tape.join(),"source");
  function encode(p,d,A,L,hold){
    const q=A.slice(),c=[],mask=[],ranks=[];
    for(const x of p){const H=hold&&x===0;mask.push(H);
      if(H)c.push(0);else{const k=q.indexOf(x);assert(k>=0,"missing");ranks.push(k);c.push(L[k]);q.splice(k,1);q.splice(d,0,x);}
    }return {c,mask,ranks};
  }
  function decode(c,d,A,L,mask,hold){
    const q=A.slice(),p=[];
    for(let i=0;i<c.length;i++){
      if(mask[i]){assert(c[i]===0,"hold");p.push(0);}
      else{const k=L.indexOf(c[i]),x=q[k];assert(!hold||x!==0,"consuming F");p.push(x);q.splice(k,1);q.splice(d,0,x);}
    }return p;
  }
  // Exact factorization: carrier names never change sides. The selected
  // carrier is moved to the front of its side queue; its plaintext token
  // is exchanged with the center token (the center carrier remains fixed).
  function carrierRanks(p,d,A){
    const a=Array(29);A.forEach((x,i)=>a[x]=i);
    const left=g.slice(0,d).reverse(),right=g.slice(d+1),r=[];let center=A[d];
    for(const x of p){
      const k=a[x];
      if(k===d)r.push(d);
      else{const s=k<d?left:right,i=s.indexOf(k);assert(i>=0,"carrier missing");r.push(d+(k<d?-1:1)*(i+1));s.unshift(s.splice(i,1)[0]);}
      [a[x],a[center]]=[a[center],a[x]];center=x;
    }return r;
  }
  // After the first active event, all initial centers differ only by a
  // relabeling of the carrier identities. Choose p[0] as center and ignore
  // the first event. Remaining center events contribute depth zero.
  function carrierModel(p){
    const a=g.slice(),center=p[0],o=[];let prev=center;
    for(let i=1;i<p.length;i++){const x=p[i],k=a[x];if(k!==center)o.push(k);[a[x],a[prev]]=[a[prev],a[x]];prev=x;}
    const q=[],W=Array.from({length:29},()=>Array(29).fill(0)),f=Array(29).fill(0);let n=0;
    for(const x of o){f[x]++;const i=q.indexOf(x);if(i>=0){n++;for(let k=0;k<i;k++)W[x][q[k]]++;q.splice(i,1);}q.unshift(x);}
    const rows=W.map((r,i)=>r.map((v,k)=>v+W[k][i]).sort((x,y)=>y-x)).filter((_,i)=>i!==center).map(r=>{let s=0;return [0,...r.map(x=>s+=x)];});
    return {n,seen:q.length,f:f.filter((_,i)=>i!==center),rows,total:o.length};
  }
  const depths=Array.from({length:15},(_,d)=>g.map(i=>Math.abs(i-d)).filter(Boolean).sort((x,y)=>x-y));
  function repeat(p){let s=0;for(let i=1;i<p.length;i++)s+=p[i]===p[i-1];return s;}
  // Exact native F count fixes the number of retained cipher zeros; the
  // center label frequency minus its first-active indicator must equal
  // the native adjacent-repeat count.
  function cipherModel(c,F,rep){
    const h=Array(29).fill(0);for(const x of c)h[x]++;
    if(F>h[0])return null;h[0]-=F;
    let lead=c.findIndex(Boolean);if(lead<0)lead=c.length;
    const first=F>=lead&&lead<c.length?[c[lead]]:[];
    if(lead>0&&h[0]>0)first.push(0);
    const z=g.filter(x=>first.some(y=>h[x]-(x===y?1:0)===rep));
    if(!z.length)return null;
    return {z,rows:z.map(k=>h.filter((_,i)=>i!==k).sort((x,y)=>y-x))};
  }
  function lossRows(m,d){
    const b=28-d,stats=m.rows.map(r=>({big:r[b-1],loss:r[b-1]-r[Math.max(0,d-1)]})),base=stats.reduce((s,x)=>s+x.big,0);
    // Each first suffix carrier contributes at most its side depth; grant
    // the largest-side capacity first, plus one unconstrained initial event.
    const first=b+Math.min(b,m.seen)*b+Math.max(0,m.seen-b)*d;
    return {stats,base,first};
  }
  function plainUpper2(m,d){
    const {stats,base,first}=lossRows(m,d),s=stats.map(x=>x.loss).sort((x,y)=>x-y).slice(0,d).reduce((a,b)=>a+b,0);
    return 2*(m.n+first)+base-s;
  }
  function cipherLower(cm,d){
    return Math.min(...cm.rows.map(r=>r.reduce((s,v,i)=>s+v*depths[d][i],0)));
  }
  // Side-count constrained relaxation: selecting d carrier vertices on the
  // shorter side must match a feasible total of d ciphertext-label counts.
  // Unknown first event permits a single extra occurrence. Exact knapsack
  // minimizes vertex upper-bound loss under this necessary interval.
  function refinedGap2(m,cm,d){
    const {stats,base,first}=lossRows(m,d),total=m.total;
    const dp=Array.from({length:d+1},()=>new Float64Array(total+1).fill(Infinity));dp[0][0]=0;
    let seen=0,maxSum=0;
    for(const v of stats){
      const f=m.f[seen];
      for(let k=Math.min(d,seen+1);k>=1;k--)for(let x=0;x<=maxSum;x++)if(dp[k-1][x]<Infinity)dp[k][x+f]=Math.min(dp[k][x+f],dp[k-1][x]+v.loss);
      maxSum+=f;seen++;
    }
    let gap=Infinity;
    for(const h of cm.rows){
      const minSide=h.slice(28-d).reduce((s,x)=>s+x,0),maxSide=h.slice(0,d).reduce((s,x)=>s+x,0);
      let loss=Infinity;for(let f=Math.max(0,minSide-1);f<=Math.min(total,maxSide);f++)loss=Math.min(loss,dp[d][f]);
      const lower=h.reduce((s,v,i)=>s+v*depths[d][i],0),upper2=2*(m.n+first)+base-loss;
      gap=Math.min(gap,2*lower-upper2);
    }return gap;
  }
  const out={N,controls:0,controlRunes:0,consumingZeroControls:0,direct:{},layouts:{}};
  // All 29 destinations, all nine source-native records, both clocks.
  // Actual initial alphabet and rank labels differ from canonical and the
  // first consumed cipher zero is deliberately exercised in held-F plants.
  for(const s of native.sections){
    const p=[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x));
    for(const d of g)for(const hold of [false,true]){
      const A=g.map(x=>(7*x+5)%29),L=g.map(x=>(8*x+11)%29);
      if(hold){const first=p.find(Boolean),a=A.indexOf(first),b=L.indexOf(0);[A[a],A[b]]=[A[b],A[a]];}
      const {c,mask,ranks}=encode(p,d,A,L,hold),q=decode(c,d,A,L,mask,hold),active=p.filter((_,i)=>!mask[i]),F=p.length-active.length;
      assert(q.join()===p.join(),"control replay");
      assert(carrierRanks(active,d,A).join()===ranks.join(),"carrier factorization");
      const cm=cipherModel(c,F,repeat(active)),m=carrierModel(active),k=Math.min(d,28-d),actual=ranks.reduce((a,x)=>a+Math.abs(x-d),0);
      assert(cm&&cipherLower(cm,k)<=actual&&2*actual<=plainUpper2(m,k),"coarse bound lost true key");
      assert(refinedGap2(m,cm,k)<=0,"knapsack lost true key");
      out.controls++;out.controlRunes+=p.length;if(hold&&c.some((x,i)=>x===0&&!mask[i]))out.consumingZeroControls++;
    }
  }
  const fr=[["continuous",[tape]],["chapter",chapters],["page",pages]];
  for(const [name,frames] of fr){
    const dsOut={};
    for(const mode of ["ordinary","hold"])for(const dir of [1,-1]){
      const cc=frames.map(c=>dir===1?c:c.slice().reverse()),r={windows:0,centerPass:0,coarsePass:0,refinedPass:0,coarseWitnesses:[],refinedWitnesses:[],minCoarseGap2:null};
      for(const d of ds)for(let off=0;off+N<=d.p.length;off+=Math.floor(N/8)){
        let at=off;const models=[];let ok=true;
        for(const c of cc){
          let p=d.p.slice(at,at+c.length);at+=c.length;if(dir===-1)p.reverse();
          const active=mode==="hold"?p.filter(Boolean):p,F=p.length-active.length,cm=cipherModel(c,F,repeat(active));
          if(!cm){ok=false;break;}
          const m=carrierModel(active),gap=depths.map((_,k)=>2*cipherLower(cm,k)-plainUpper2(m,k));models.push({m,cm,gap});
        }
        r.windows++;if(!ok)continue;r.centerPass++;
        const coarseGap=Math.max(...models.map(x=>Math.min(...x.gap)));
        r.minCoarseGap2=r.minCoarseGap2===null?coarseGap:Math.min(r.minCoarseGap2,coarseGap);
        if(coarseGap>0)continue;r.coarsePass++;
        const candidates=models.map(x=>x.gap.flatMap((v,i)=>v<=0?[i]:[]));r.coarseWitnesses.push({name:d.name,off,candidates});
        const refined=models.map((x,i)=>candidates[i].map(k=>({k,gap2:refinedGap2(x.m,x.cm,k)})));
        const pass=refined.every(a=>a.some(x=>x.gap2<=0));
        if(pass)r.refinedPass++;
        r.refinedWitnesses.push({name:d.name,off,pass,frameSurvivors:refined.map(a=>a.filter(x=>x.gap2<=0).map(x=>x.k)),frameMinGap2:refined.map(a=>Math.min(...a.map(x=>x.gap2)))});
      }
      dsOut[mode+":"+dir]=r;
    }
    out.layouts[name]=dsOut;
    const pp=frames.map(c=>decode(c,14,g,g,c.map(()=>false),false));
    assert(pp.every((p,i)=>encode(p,14,g,g,false).c.join()===frames[i].join()),"original canonical replay");
    const h=Array(29).fill(0);for(const x of pp.flat())h[x]++;
    out.direct[name]={ioc:h.reduce((a,x)=>a+x*(x-1),0)/(N*(N-1)),head:pp[0].slice(0,60).map(x=>j.translit[x]).join(" ")};
  }
  return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),JSON.parse(raw[1]),raw.slice(2).map((s,i)=>({name:paths[i+2],s}))),null,2));
