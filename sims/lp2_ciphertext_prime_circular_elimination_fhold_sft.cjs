"use strict";
/**
 * Ciphertext-directed circular elimination + authentic LP2 F-hold clocks.
 * P57 "shed our own circumferences" motivates elimination; GP prime weights
 * determine the next step. No printed word boundary is consumed.
 */
function experiment(raw, nativeRaw) {
  const gp=JSON.parse(raw), gold=JSON.parse(nativeRaw);
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const mod=(a,n=29)=>(a%n+n)%n;
  const index=new Map(gp.runes.map((r,i)=>[r,i]));
  const extract=s=>Array.from(s).filter(x=>index.has(x)).map(x=>index.get(x));
  const primes=gp.prime;
  assert(primes.length===29&&primes[0]===2&&primes[28]===109,"GP prime register");
  /** @param {number[]} input @param {number} dir @param {boolean} pack */
  function route(input,dir,pack=false){
    const remaining=Array.from(input.keys()),out=Array(input.length);
    let pos=0;
    for(let i=0;i<input.length;i++){
      const address=remaining[pos],c=pack?input[i]:input[address];
      if(pack)out[address]=c;else out[i]=c;
      remaining.splice(pos,1);
      if(remaining.length)pos=mod(pos+(dir===1?primes[c]-1:-primes[c]),remaining.length);
    }
    return out;
  }
  const p=[];for(let n=2;p.length<19000;n++){let ok=true;for(const a of p){if(a*a>n)break;if(n%a===0){ok=false;break}}if(ok)p.push(n)}
  const pk=p.map(x=>(x-1)%29);
  const keysets=[{name:"p56",K:pk,periodic:false,origins:3302},{name:"WELCOME",K:[23,10,1,10,9,10,16,26],periodic:true,origins:8},{name:"KOAN",K:[0,10,4,0,1,19,0,18,4,18,9,0,18],periodic:true,origins:13}];
  const next=(key,k)=>key.periodic?(k+1)%key.K.length:k+1;
  function encode(P,key,start){
    let k=start;const C=[];
    for(const x of P){if(x===0)C.push(0);else{C.push(mod(x+key.K[k]));k=next(key,k)}}
    return C;
  }
  /** exact legality DP; no pruning, and all latent literal-F masks */
  function legal(C,key,origin){
    let states=new Set([origin]),i=0;
    for(;i<C.length;i++){
      let out=new Set();const c=C[i];
      for(const k of states){if(c===0)out.add(k);if(mod(c-key.K[k])!==0)out.add(next(key,k))}
      if(!out.size)break;states=out;
    }
    return i;
  }
  // Freeze source-native trigram counts; no original ciphertext or WELCOME,
  // KOAN2, p56, p57 control text in training.
  const holdoutNames=new Set(["0_welcome","jpg107-167","p56_an_end","p57_parable"]);
  const hist=new Float64Array(31*31*29),total=new Float64Array(31*31);
  for(const s of gold.sections.filter(x=>!holdoutNames.has(x.name))){
    let a=29,b=30;
    for(const x of extract(s.source_text)){const h=a*31+b;hist[h*29+x]++;total[h]++;a=b;b=x}
  }
  const logs=Float64Array.from(hist,(x,i)=>Math.log((x+0.25)/(total[Math.floor(i/29)]+7.25)));
  function best(C,key,origin){
    // state key position and last two plaintext symbols; exact Viterbi score.
    let states=new Map([[origin*961+29*31+30,{k:origin,a:29,b:30,score:0,node:null}]]);
    for(const c of C){
      let out=new Map;
      const push=(s,x,k)=>{const score=s.score+logs[(s.a*31+s.b)*29+x],id=k*961+s.b*31+x;
        const prev=out.get(id);if(!prev||score>prev.score)out.set(id,{k,a:s.b,b:x,score,node:{x,prev:s.node}})};
      for(const s of states.values()){if(c===0)push(s,0,s.k);const x=mod(c-key.K[s.k]);if(x!==0)push(s,x,next(key,s.k))}
      if(!out.size)return null;states=out;
    }
    let top=null;for(const s of states.values())if(!top||s.score>top.score)top=s;
    const P=[];for(let node=top.node;node;node=node.prev)P.push(node.x);P.reverse();
    assert(eq(encode(P,key,origin),C),"Viterbi replay");
    return {score:top.score/C.length,P};
  }
  function directScore(P){let a=29,b=30,s=0;for(const x of P){s+=logs[(a*31+b)*29+x];a=b;b=x}return s/P.length}
  function scan(C,key){
    let maxPrefix=0,originsAtMax=[],full=[],top=null;
    for(let o=0;o<key.origins;o++){
      const n=legal(C,key,o);
      if(n>maxPrefix){maxPrefix=n;originsAtMax=[o]}else if(n===maxPrefix)originsAtMax.push(o);
      if(n===C.length){full.push(o);const b=best(C,key,o);if(!top||b.score>top.score)top={origin:o,...b}}
    }
    return {maxPrefix,originsAtMax:originsAtMax.length,firstMaxOrigin:originsAtMax[0],full:full.length,fullOrigins:full,top};
  }
  const solved=Object.fromEntries(gold.sections.map(s=>[s.name,extract(s.source_text)]));
  assert(eq(encode(solved.p56_an_end,keysets[0],0),gp.pages.find(x=>x.page===56).indices),"authentic p56 replay");
  assert(eq(solved.p57_parable,gp.pages.find(x=>x.page===57).indices),"authentic p57 plaintext");
  const controls=[];
  for(const [name,keyIdx,origin,dir] of [["0_welcome",0,117,1],["jpg107-167",0,219,-1],["p57_parable",1,3,1],["p56_an_end",2,7,-1]]){
    const P=solved[name],C=encode(P,keysets[keyIdx],origin),physical=route(C,dir,true),read=route(physical,dir);
    assert(eq(C,read),"plant route inverse");const result=scan(read,keysets[keyIdx]);
    assert(result.fullOrigins.includes(origin),"true key lost");
    const recovered=result.top.P.filter((x,i)=>x===P[i]).length;
    controls.push({name,key:keysets[keyIdx].name,origin,dir,length:P.length,truthScore:directScore(P),topScore:result.top.score,topOrigin:result.top.origin,fullOrigins:result.full,recovered});
  }
  const pages=gp.pages.filter(x=>x.page<56&&x.indices.length);
  assert(pages.length===55&&pages.flatMap(x=>x.indices).length===12956,"source count");
  const cuts=[0,3,8,15,23,27,33,40,54,56];
  const chapters=cuts.slice(0,-1).map((a,i)=>({id:a+"-"+(cuts[i+1]-1),indices:pages.filter(x=>x.page>=a&&x.page<cuts[i+1]).flatMap(x=>x.indices)}));
  const groups=[["chapter",chapters],["page",pages.map(x=>({id:String(x.page),indices:x.indices}))]];
  const rows=[];
  for(const [scope,units] of groups)for(const u of units)for(const dir of [1,-1]){
    const C=route(u.indices,dir);
    assert(eq(route(C,dir,true),u.indices),"original route exact replay");
    for(const key of keysets){
      const r=scan(C,key);
      const top=r.top&&{origin:r.top.origin,score:r.top.score,prefix:r.top.P.slice(0,80).map(x=>gp.translit[x]).join(""),indices:r.top.P};
      if(r.top)assert(eq(route(encode(r.top.P,key,r.top.origin),dir,true),u.indices),"full original replay");
      rows.push({scope,unit:u.id,dir,key:key.name,length:C.length,maxPrefix:r.maxPrefix,originAtMax:r.firstMaxOrigin,originsAtMax:r.originsAtMax,full:r.full,top});
    }
  }
  const summary=[];
  for(const [scope] of groups)for(const key of keysets){
    const rr=rows.filter(r=>r.scope===scope&&r.key===key.name);
    const full=rr.filter(x=>x.full);
    summary.push({scope,key:key.name,configurations:rr.length*key.origins,completeRoutes:full.length,completeOrigins:full.reduce((s,x)=>s+x.full,0),maxPrefix:Math.max(...rr.map(x=>x.maxPrefix)),best:full.sort((a,b)=>b.top.score-a.top.score).slice(0,3).map(x=>({unit:x.unit,dir:x.dir,length:x.length,full:x.full,origin:x.top.origin,score:x.top.score,prefix:x.top.prefix}))});
  }
  return {description:"read physical first glyph, remove it, count its GP prime weight around remaining circle; count adjacent survivor as one",controls,summary,rows};
}
if(typeof module!=="undefined"&&require.main===module){
  const fs=require("node:fs"),path=require("node:path"),base=path.join(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(base,p),"utf8");
  console.log(JSON.stringify(experiment(read("resources/liber-primus/lp2-corpus.json"),read("resources/external/relikd-solved-gp29-native-v1.json")),null,2));
}
