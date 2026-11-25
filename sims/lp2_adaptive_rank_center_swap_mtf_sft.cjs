'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,native,donorTexts) {
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const gp=Array.from({length:29},(_,i)=>i),idx=new Map(corpus.runes.map((r,i)=>[r,i]));
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function donor(s){
    const p=[];
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
      while(w.length){const t=tokens.find(t=>w.startsWith(t.s));assert(t,"token "+w);p.push(t.i);w=w.slice(t.s.length);}
    }
    return p;
  }
  const ds=donorTexts.map(({name,s})=>({name,p:donor(s)}));
  const nativeP=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(r=>idx.has(r)).map(r=>idx.get(r))}));
  const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
  const tape=pages.flat(),N=tape.length;
  assert(N===12956&&pages.length===55,"source count");
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices));
  assert(chapters.flat().join()===tape.join(),"chapter partition");
  function eq(p,k,skip=0){let n=0;for(let i=k+skip;i<p.length;i++)if(p[i]===p[i-k])n++;return n;}
  function hist(p){const f=Array(29).fill(0);for(const x of p)f[x]++;return f;}
  function ioc(p){return hist(p).reduce((a,x)=>a+x*(x-1),0)/(p.length*(p.length-1));}
  function recurrent(p){
    const q=[],f=Array(29).fill(0);
    for(const x of p){const j=q.indexOf(x);if(j>=0){f[j]++;q.splice(j,1);}q.unshift(x);}
    return f;
  }
  function cap(a,b){
    const c=a.slice().sort((x,y)=>y-x),d=b.slice().sort((x,y)=>y-x);
    return c.every((x,i)=>x<=d[i]);
  }
  function update(q,j,kind,z){
    if(kind==="mtf")q.unshift(q.splice(j,1)[0]);
    else [q[j],q[z]]=[q[z],q[j]];
  }
  function encode(p,kind,z,initial,labels,hold=false){
    const q=initial.slice(),c=[],h=[];
    for(const x of p){
      const H=hold&&x===0;h.push(H);
      if(H)c.push(0);
      else{const j=q.indexOf(x);assert(j>=0,"encode");c.push(labels[j]);update(q,j,kind,z);}
    }
    return {c,h};
  }
  function decode(c,kind,z,initial,labels,h=c.map(()=>false),transparent=false){
    const q=initial.slice(),p=[];
    for(let i=0;i<c.length;i++){
      if(h[i]){assert(c[i]===0,"hold glyph");p.push(0);}
      else{const j=labels.indexOf(c[i]);assert(j>=0,"decode");const x=q[j];assert(!transparent||x!==0,"illegal consuming F");p.push(x);update(q,j,kind,z);}
    }
    return p;
  }
  // Exact relaxed maximum of adjacent equality events on any retained
  // sequence after deleting an arbitrary subset of visible zero glyphs.
  // Exclude the first pair, which has no corresponding plaintext lag2.
  function repeatBound(c){
    let states=new Map([["0:29",0]]);
    for(const y of c){
      const next=new Map();
      for(const [k,v] of states){
        const [n,p]=k.split(":").map(Number);
        const put=(key,value)=>next.set(key,Math.max(next.get(key)??-Infinity,value));
        if(y===0)put(k,v);
        put(Math.min(2,n+1)+":"+y,v+(n===2&&p===y?1:0));
      }
      states=next;
    }
    return Math.max(...states.values());
  }
  // Exact Fehu-position projection for swap-to-fixed-slot. Slots are named
  // by ciphertext labels; any rank permutation is only a change of slot names.
  // Track legal path count and min/max transparent holds over all F positions.
  function swapHold(c,z,f0){
    let states=new Map([[f0,{count:1n,min:0,max:0}]]);
    for(const y of c){
      const next=new Map();
      function put(f,s,h){
        const prev=next.get(f),min=s.min+h,max=s.max+h;
        next.set(f,{count:(prev?.count??0n)+s.count,min:Math.min(prev?.min??Infinity,min),max:Math.max(prev?.max??-Infinity,max)});
      }
      for(const [f,s] of states){
        if(y===0)put(f,s,1);
        if(y!==f)put(f===z?y:f,s,0);
      }
      states=next;
      if(!states.size)break;
    }
    if(!states.size)return null;
    return {count:[...states.values()].reduce((s,x)=>s+x.count,0n),min:Math.min(...[...states.values()].map(x=>x.min)),max:Math.max(...[...states.values()].map(x=>x.max))};
  }
  const out={N,pages:pages.length,cipherHistogram:hist(tape),toyCases:0,holdProjectionToys:0,controls:[],frames:{}};
  // Exhaust all ternary strings <=8 and compare every visible-zero mask.
  // Also check the projected F-position DP against explicit full state replay
  // for every ternary string <=5, all three fixed destination/F positions.
  for(let n=0;n<=8;n++)for(let m=0;m<3**n;m++){
    let x=m,c=[];for(let i=0;i<n;i++){c.push(x%3);x=Math.floor(x/3);}
    const zs=c.flatMap((v,i)=>v===0?[i]:[]);
    const masks=Array.from({length:2**zs.length},(_,h)=>c.map((v,i)=>v===0&&!!(h&(1<<zs.indexOf(i)))));
    const best=Math.max(...masks.map(h=>eq(c.filter((_,i)=>!h[i]),1,1)));
    assert(best===repeatBound(c),"repeat DP");out.toyCases++;
    if(n<=5)for(let z=0;z<3;z++)for(let f=0;f<3;f++){
      const A=[0,1,2];[A[0],A[f]]=[A[f],A[0]];
      const legal=[];
      for(const h of masks){
        const q=A.slice();let ok=true;
        for(let i=0;i<c.length;i++)if(!h[i]){
          if(q[c[i]]===0){ok=false;break;}[q[c[i]],q[z]]=[q[z],q[c[i]]];
        }
        if(ok)legal.push(h.filter(Boolean).length);
      }
      const a=swapHold(c,z,f);
      assert(a===null?legal.length===0:a.count===BigInt(legal.length)&&a.min===Math.min(...legal)&&a.max===Math.max(...legal),"F projection toy");out.holdProjectionToys++;
    }
  }
  // Native source controls: actual chosen hidden permutation and update
  // clock, known mask supplied only for replay, independent invariant checks.
  for(const {name,p} of nativeP)for(const kind of ["mtf","swap"])for(const hold of [false,true]){
    const A=gp.map(x=>(7*x+5)%29),labels=gp.map(x=>(8*x+11)%29),z=14;
    // MTF: force a consumed cipher zero at the first non-F symbol if possible.
    if(hold&&kind==="mtf"){
      const first=p.find(Boolean),a=A.indexOf(first),b=labels.indexOf(0);
      [A[a],A[b]]=[A[b],A[a]];
    }
    const {c,h}=encode(p,kind,z,A,labels,hold),recovered=decode(c,kind,z,A,labels,h,hold);
    assert(recovered.join()===p.join(),"native roundtrip");
    const activeP=p.filter((_,i)=>!h[i]),activeC=c.filter((_,i)=>!h[i]);
    if(kind==="mtf")assert(cap(recurrent(activeP),hist(c)),"MTF recurrent bound");
    else{
      assert(eq(activeP,2)===eq(activeC,1,1),"swap lag2 identity");
      assert(eq(activeP,2)<=(hold?repeatBound(c):eq(c,1,1)),"swap upper bound");
      if(hold){const f=labels[A.indexOf(0)],s=swapHold(c,labels[z],f),holds=h.filter(Boolean).length;assert(s&&s.min<=holds&&s.max>=holds,"lost native F path");}
    }
    out.controls.push({name,n:p.length,kind,hold,held:h.filter(Boolean).length,consumingZeros:activeC.filter(x=>x===0).length,replay:true,lag2:eq(activeP,2),recurrentMax:Math.max(...recurrent(activeP))});
  }
  const layouts=[["continuous",[tape]],["chapter",chapters],["page",pages]];
  for(const [name,fr] of layouts){
    const h=fr.map(hist),total=hist(tape),summary={};
    for(const direction of [1,-1]){
      const frames=fr.map(c=>direction===1?c:c.slice().reverse());
      const ordinary=frames.reduce((s,c)=>s+eq(c,1,1),0),bound=frames.reduce((s,c)=>s+repeatBound(c),0);
      const rows=gp.map(z=>{
        const pp=frames.map(c=>decode(c,"swap",z,gp,gp));
        for(let i=0;i<frames.length;i++){
          assert(encode(pp[i],"swap",z,gp,gp).c.join()===frames[i].join(),"original swap replay");
          assert(eq(pp[i],2)===eq(frames[i],1,1),"original lag2");
        }
        return {z,ioc:ioc(pp.flat()),max:Math.max(...hist(pp.flat()))};
      });
      const mtf=frames.map(c=>decode(c,"mtf",0,gp,gp));
      assert(mtf.every((p,i)=>encode(p,"mtf",0,gp,gp).c.join()===frames[i].join()),"original MTF replay");
      const donors=[];
      for(const {name,p} of ds){
        const stat={name,windows:0,ordinary:{minLag2:Infinity,minRecMax:Infinity,swapSurvive:0,mtfSharedSurvive:0,mtfPrivateSurvive:0},hold:{minLag2:Infinity,minRecMax:Infinity,swapSurvive:0,mtfSharedSurvive:0,mtfPrivateSurvive:0,minF:Infinity,maxF:0}};
        for(let start=0;start+N<=p.length;start+=Math.floor(N/8)){
          stat.windows++;
          let at=start;
          const window=frames.map(c=>{let a=p.slice(at,at+c.length);at+=c.length;return direction===1?a:a.reverse();});
          for(const mode of ["ordinary","hold"]){
            const a=mode==="hold"?window.map(x=>x.filter(Boolean)):window,st=stat[mode];
            const rr=a.map(recurrent),rTotal=gp.map((_,i)=>rr.reduce((s,v)=>s+v[i],0)),lag=a.reduce((s,v)=>s+eq(v,2),0);
            st.minLag2=Math.min(st.minLag2,lag);st.minRecMax=Math.min(st.minRecMax,Math.max(...rTotal));
            st.swapSurvive+=mode==="hold"?lag<=bound:lag===ordinary;
            st.mtfSharedSurvive+=cap(rTotal,total);st.mtfPrivateSurvive+=rr.every((v,i)=>cap(v,h[i]));
            if(mode==="hold"){const F=N-a.reduce((s,v)=>s+v.length,0);st.minF=Math.min(st.minF,F);st.maxF=Math.max(st.maxF,F);}
          }
        }
        donors.push(stat);
      }
      summary[direction]={ordinaryLag2:ordinary,relaxedHoldLag2Upper:bound,canonicalCenterIoC:rows[14].ioc,allCenterIoCRange:[Math.min(...rows.map(x=>x.ioc)),Math.max(...rows.map(x=>x.ioc))],canonicalMtfIoC:ioc(mtf.flat()),canonicalCenterHead:decode(frames[0],"swap",14,gp,gp).slice(0,60).map(x=>corpus.translit[x]).join(" "),donors};
    }
    out.frames[name]=summary;
  }
  out.continuousExactHold=[];
  for(const direction of [1,-1]){
    const c=direction===1?tape:tape.slice().reverse();let count=0n,pairs=0,min=Infinity,max=0,nontrivial=0;const valid=[];
    for(const z of gp)for(const f of gp){
      const s=swapHold(c,z,f);if(!s)continue;
      count+=s.count;pairs++;min=Math.min(min,s.min);max=Math.max(max,s.max);
      if(s.min!==c.filter(x=>x===0).length||s.max!==s.min||f!==0)nontrivial++;
      valid.push({z,f,count:s.count.toString(),min:s.min,max:s.max});
    }
    const active=c.filter(Boolean);
    out.continuousExactHold.push({direction,pairs,paths:count.toString(),minHolds:min,maxHolds:max,nontrivial,allZeroHeldLag2:eq(active,1,1),valid});
  }
  return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),JSON.parse(raw[1]),raw.slice(2).map((s,i)=>({name:paths[i+2],s}))),null,2));
