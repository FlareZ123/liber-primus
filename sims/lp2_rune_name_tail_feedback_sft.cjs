"use strict";
const fs = require("node:fs");
const path = require("node:path");
function experiment(data, reference) {
  const A=data.translit, mod=x=>(x%29+29)%29;
  const names="Feoh Ur Thorn Os Rad Cen Gyfu Wynn Haegl Nyd Is Ger Eoh Peordh Eolh-secg Sigel Tir Beorc Eh Mann Lagu Ing Ethel Daeg Ac Aesc Yr Ior Ear".toUpperCase().split(" ");
  const tail=names.map(n=>A.map((s,i)=>[s,i]).filter(([s])=>n.endsWith(s)).sort((a,b)=>b[0].length-a[0].length)[0][1]);
  const encodeText=s=>s.toUpperCase().match(/[A-Z]+/g).flatMap(w=>{w=w.replace(/ING/g,"NG").replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){const candidates=A.map((s,j)=>[s,j]).filter(([s])=>w.startsWith(s,i)).sort((a,b)=>b[0].length-a[0].length);if(candidates.length){a.push(candidates[0][1]);i+=candidates[0][0].length}else i++;}return a;});
  const train=reference.split("### 56")[0].split("\n").filter(x=>!x.startsWith("#")&&!x.startsWith("[")&&!x.startsWith("(")&&/[A-Z]/.test(x)).join(" ");
  const T=encodeText(train), counts=new Float64Array(30*30*29), den=new Float64Array(900);
  let a=29,b=29;for(const x of T){let k=a*30+b;counts[k*29+x]++;den[k]++;a=b;b=x;}
  const log=Array.from(counts,(v,i)=>Math.log((v+0.2)/(den[Math.floor(i/29)]+5.8)));
  const score=(x,a,b)=>log[(a*30+b)*29+x];
  const variants=[];for(const prev of ["plain","cipher"])for(const sign of [-1,1])for(const hold of [false,true])variants.push({prev,sign,hold});
  function encrypt(p,seed,v){let state=seed;return p.map(x=>{if(v.hold&&x===0)return 0;const c=mod(x+v.sign*tail[state]);state=v.prev==="plain"?x:c;return c;});}
  function decode(c,v,starts){
    let layer=new Map(starts.map(s=>[s.state*900+s.a*30+s.b,{...s,score:0,path:[],origin:s.origin??s.state}]));
    for(const x of c){const next=new Map();for(const q of layer.values()){
      function emit(p,state){const value=q.score+score(p,q.a,q.b);const k=state*900+q.b*30+p;const old=next.get(k);if(!old||old.score<value)next.set(k,{state,a:q.b,b:p,score:value,path:[...q.path,p],origin:q.origin});}
      if(v.hold&&x===0)emit(0,q.state);
      const p=mod(x-v.sign*tail[q.state]);if(!v.hold||p!==0)emit(p,v.prev==="plain"?p:x);
    }layer=next;if(!layer.size)return null;}
    return [...layer.values()].sort((a,b)=>b.score-a.score)[0];
  }
  const seeds=Array.from({length:29},(_,state)=>({state,a:29,b:29}));
  const render=p=>p.map(i=>A[i]).join(" ");
  const primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
  let j=0;const p56=data.pages[56].indices.map((c,i)=>i===56?0:mod(c-(primes[j++]-1)));
  const p57=data.pages[57].indices;
  const targets=[{name:"p0-black/p1",fit:data.pages[0].indices.slice(13),held:data.pages[1].indices},{name:"p54-body/p55-carry",fit:data.pages[54].indices.slice(9,222),held:[...data.pages[54].indices.slice(222),...data.pages[55].indices]}];
  const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  function feasibility(c,v){
    let states=new Set(Array.from({length:29},(_,i)=>i));
    for(let i=0;i<c.length;i++){
      const x=c[i], next=new Set();
      for(const s of states){
        if(v.hold&&x===0)next.add(s);
        const p=mod(x-v.sign*tail[s]);
        if(!v.hold||p!==0)next.add(v.prev==="plain"?p:x);
      }
      if(!next.size)return {firstImpossibleOffset:i,statesBefore:[...states].sort((a,b)=>a-b),cipherRune:x};
      states=next;
    }
    return {firstImpossibleOffset:null,finalStates:[...states].sort((a,b)=>a-b)};
  }
  const results=[];
  for(let vi=0;vi<variants.length;vi++){
    const v=variants[vi],controls=[];
    for(const [ci,p] of [p56,p57].entries()){
      const seed=(7+ci*11)%29,c=encrypt(p,seed,v),cut=50;
      const fit=decode(c.slice(0,cut),v,seeds),held=fit&&decode(c.slice(cut),v,[fit]);
      const recovered=fit&&held?[...fit.path,...held.path]:null;
      controls.push({nativePage:56+ci,seed,fitScore:fit&&fit.score/cut,heldScore:held&&held.score/(p.length-cut),fitMatches:fit&&fit.path.filter((x,i)=>x===p[i]).length,heldMatches:held&&held.path.filter((x,i)=>x===p[i+cut]).length,fitLength:cut,heldLength:p.length-cut,exactReplay:recovered&&equal(encrypt(recovered,fit.origin,v),c)});
    }
    const original=targets.map(t=>{const fit=decode(t.fit,v,seeds),held=fit&&decode(t.held,v,[fit]);return {name:t.name,feasibility:feasibility(t.fit,v),seed:fit?.origin??null,fitLength:t.fit.length,heldLength:t.held.length,fitScore:fit&&fit.score/t.fit.length,heldScore:held&&held.score/t.held.length,fitText:fit&&render(fit.path),heldText:held&&render(held.path),exactReplay:fit&&held&&equal(encrypt([...fit.path,...held.path],fit.origin,v),[...t.fit,...t.held])};});
    results.push({v,controls,original});
  }
  return {names,tail,tailLabels:tail.map(i=>A[i]),trainingRunes:T.length,p56Control:render(p56),p57Control:render(p57),results};
}
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(root, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
console.log(JSON.stringify(experiment(corpus, reference), null, 2));
