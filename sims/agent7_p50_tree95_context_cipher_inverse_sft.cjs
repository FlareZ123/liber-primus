'use strict';
/** Tree-local ciphertext feedback: full child tuple, all secret shifts or bijections, 60 frozen existing layouts. Read-only SFT. */
const fs=require('node:fs');
const path=require('node:path');
function experiment(grid, corpus) {
  const check=(cond,msg)=>{if(!cond)throw Error(msg)};
  const mod=x=>(x%29+29)%29;
  const ids=Array.from({length:256},(_,i)=>i);
  const alphabet=grid.alphabet.replace("f","");
  const ptr=grid.pages.flatMap(p=>p.tokens).map(t=>59*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
  check(alphabet.length===59&&ptr.length===256&&ptr.every(x=>x>=0&&x<256),"source grid");
  const root=189,ch=ids.map(()=>[]);
  check(ptr[root]===root&&ptr.filter((p,i)=>p===i).length===1,"root");
  ptr.forEach((p,i)=>{if(p!==i)ch[p].push(i)});
  const pre=[],post=[],breadth=[root];
  function dfs(v){pre.push(v);ch[v].forEach(dfs);post.push(v)}
  dfs(root);for(let i=0;i<breadth.length;i++)breadth.push(...ch[breadth[i]]);
  check(new Set(pre).size===256,"tree");
  const leaf=o=>o.filter(v=>ch[v].length===0), internal=o=>o.filter(v=>ch[v].length>0);
  const leafOrders={address:leaf(ids),pre:leaf(pre),breadth:leaf(breadth)};
  const internalOrders={address:internal(ids),pre:internal(pre),post:internal(post),breadth:internal(breadth),inward:internal(breadth).reverse()};
  const [c55,c56,p57]=[55,56,57].map(i=>corpus.pages[i].indices);
  const gp=corpus.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  const text="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  const p56=text.split(" ").flatMap(w=>{const a=[];while(w.length){const [s,i]=gp.find(([s])=>w.startsWith(s));a.push(i);w=w.slice(s.length)}return a});
  const primes=[];for(let n=2;primes.length<84;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
  let j=0;check(p56.length===85&&p56.map(p=>p===0?0:mod(p+primes[j++]-1)).every((c,i)=>c===c56[i])&&j===84,"authentic p56 replay");
  check(c55.length===76&&p57.length===95&&leafOrders.address.length===95&&internalOrders.address.length===161,"page geometry");
  /** @param {number} v @param {(number|null)[]} values */
  function context(v,values){const a=ch[v].map(w=>values[w]);return a.includes(null)?null:a.join(",")}
  /** Known rows determine a partial key and exact conflicts; no p55 plaintext used. */
  function learn(P,C,known,domain,mode,hold){
    const states=new Map();let rows=0,skipped=0,conflicts=0,witness=null;
    for(const v of known){
      const p=P[v],c=C[v];
      if(hold&&p===0){check(c===0,"literal F");skipped++;continue}
      const ctx=context(v,domain==="plain"?P:C);if(ctx===null){skipped++;continue}
      rows++;
      const key=mode==="shift"?"*":String(p),val=mode==="shift"?mod(c-p):c;
      if(!states.has(ctx))states.set(ctx,new Map());
      const row=states.get(ctx);
      let other=row.get(key);
      if(other&&other.val!==val){conflicts++;witness??={ctx,kind:"forward",a:other,b:{v,p,c,val}}}
      if(mode==="permutation")for(const [k,x] of row)if(k!==key&&x.val===val){conflicts++;witness??={ctx,kind:"inverse",a:x,b:{v,p,c,val}}}
      if(!other)row.set(key,{v,p,c,val});
    }
    return {states,rows,skipped,conflicts,witness};
  }
  /** Infer only logically forced values from learned partial tables; no language scoring. */
  function predict(P,C,unknown,key,domain,mode,hold){
    const values=P.slice();let contradictions=0;
    for(const v of post){
      if(values[v]!==null)continue;
      const ctx=context(v,domain==="plain"?values:C);if(ctx===null)continue;
      const row=key.states.get(ctx);if(!row)continue;
      const c=C[v];let options=[];
      if(hold&&c===0)options.push(0);
      if(mode==="shift"){
        const p=mod(c-row.get("*").val);
        if(!hold||p!==0)options.push(p);
      }else{
        const exact=[...row.values()].find(x=>x.val===c);
        if(exact)options.push(exact.p);
        else for(let p=hold?1:0;p<29;p++)if(!row.has(String(p)))options.push(p);
      }
      options=[...new Set(options)];
      if(options.length===0)contradictions++;
      if(options.length===1)values[v]=options[0];
    }
    return {forced:unknown.map(v=>values[v]),contradictions};
  }
  function random(ctx,seed){let h=seed>>>0;for(const s of ctx)h=Math.imul(h^s.charCodeAt(0),16777619)>>>0;return ()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return h>>>0}}
  function plant(P,domain,mode,hold,seed){
    const C=ids.map(()=>null);
    for(const v of post){
      if(ch[v].length===0){C[v]=P[v];continue}
      const p=P[v];if(hold&&p===0){C[v]=0;continue}
      const ctx=context(v,domain==="plain"?P:C);check(ctx!==null,"plant context");
      const rng=random(ctx,seed);
      if(mode==="shift")C[v]=mod(p+rng()%29);
      else{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const k=rng()%(i+1);[a[i],a[k]]=[a[k],a[i]]}C[v]=a[p]}
    }
    return C;
  }
  const output=[];
  for(const [ln,lo] of Object.entries(leafOrders))for(const [inm,io] of Object.entries(internalOrders))for(const reverse of [false,true])for(const first of [false,true]){
    const l=reverse?[...lo].reverse():lo;
    const known=first?io.slice(0,85):io.slice(76);
    const unknown=first?io.slice(85):io.slice(0,76);
    const P=ids.map(()=>null), C=ids.map(()=>null);
    l.forEach((v,i)=>{P[v]=C[v]=p57[i]});
    known.forEach((v,i)=>{P[v]=p56[i];C[v]=c56[i]});
    unknown.forEach((v,i)=>{C[v]=c55[i]});
    for(const domain of ["plain","cipher"])for(const mode of ["shift","permutation"])for(const hold of [false,true]){
      const key=learn(P,C,known,domain,mode,hold);
      const pred=key.conflicts?null:predict(P,C,unknown,key,domain,mode,hold);
      const truth=P.slice();unknown.forEach((v,i)=>{truth[v]=p57[i]});
      const pc=plant(truth,domain,mode,hold,0x173301+output.length*131);
      const pk=learn(P,pc,known,domain,mode,hold);
      check(pk.conflicts===0,"plant inconsistent");
      const pp=predict(P,pc,unknown,pk,domain,mode,hold);
      check(pp.contradictions===0&&pp.forced.every((x,i)=>x===null||x===truth[unknown[i]]),"plant forced incorrect");
      output.push({layout:[ln,inm,reverse,first],domain,mode,hold,rows:key.rows,contexts:key.states.size,conflicts:key.conflicts,witness:key.witness,originalForced:pred?.forced??null,originalContradictions:pred?.contradictions??null,plantForced:pp.forced.filter(x=>x!==null).length});
    }
  }
  check(output.length===480,"case count");
  const summary=[];
  for(const domain of ["plain","cipher"])for(const mode of ["shift","permutation"])for(const hold of [false,true]){
    const cases=output.filter(x=>x.domain===domain&&x.mode===mode&&x.hold===hold);
    const survivors=cases.filter(x=>x.conflicts===0&&x.originalContradictions===0);
    summary.push({domain,mode,hold,layouts:cases.length,knownRows:[Math.min(...cases.map(x=>x.rows)),Math.max(...cases.map(x=>x.rows))],minimumConflicts:Math.min(...cases.map(x=>x.conflicts)),survivingLayouts:survivors.length,maximumOriginalForced:Math.max(0,...survivors.map(x=>x.originalForced.filter(v=>v!==null).length)),plantForcedRange:[Math.min(...cases.map(x=>x.plantForced)),Math.max(...cases.map(x=>x.plantForced))],survivorPredictions:survivors.map(x=>({layout:x.layout,forced:x.originalForced.map(v=>v===null?"?":corpus.runes[v]).join("")}))});
  }
  return {source:{root,leaves:95,internals:161,knownP56:85,unknownP55:76,sourceLayouts:60},summary,cases:output};
}
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus',name),'utf8'));
console.log(JSON.stringify(experiment(load('lp2-grid-256.json'),load('lp2-corpus.json')),null,2));
