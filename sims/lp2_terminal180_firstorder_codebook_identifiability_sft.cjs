"use strict";
/** Exact original p50 terminal codebook identifiability; read-only CommonJS SFT. */
const fs=require("node:fs");
const path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus",p),"utf8"));
function experiment(table,corpus) {
  "use strict";
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const tokens=table.rows.flat(), primes=[];
  for(let n=2;primes.length<84;n++)if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);
  let k=0;
  const p56=corpus.pages[56].indices.map((v,i)=>i===56?0:(v-primes[k++]+2901)%29);
  check(k===84&&corpus.pages[56].indices[56]===0,"p56 hold");
  check(p56.map(x=>corpus.translit[x]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","p56 plaintext");
  check(corpus.pages[55].indices.length===76&&p56.length===85&&corpus.pages[57].indices.length===95,"physical page sizes");
  const regs={solved:p56.concat(corpus.pages[57].indices),printed:corpus.pages[56].indices.concat(corpus.pages[57].indices)};
  const paths=[];
  for(const mode of ["row","column"])for(const rr of [false,true])for(const cc of [false,true]){
    const cells=[],starts=[];
    for(let i=0;i<180;i++){
      const r=mode==="row"?Math.floor(i/6):i%30,c=mode==="row"?i%6:Math.floor(i/30);
      cells.push(8*(rr?30-r:r+1)+(cc?6-c:c+1));starts.push(i%(mode==="row"?6:30)===0);
    }
    paths.push({name:`${mode}:${+rr}:${+cc}`,cells,starts});
  }
  for(let corner=0;corner<4;corner++)for(const reverse of [false,true]){
    const cells=[],starts=[];
    for(let s=0;s<3;s++){
      const a=1+s,b=30-s,l=1+s,r=6-s,ring=[];
      for(let i=l;i<=r;i++)ring.push(a*8+i);
      for(let i=a+1;i<=b;i++)ring.push(i*8+r);
      for(let i=r-1;i>=l;i--)ring.push(b*8+i);
      for(let i=b-1;i>a;i--)ring.push(i*8+l);
      check(ring.length===[68,60,52][s],"interior ring length");
      const start=ring.indexOf([8*a+l,8*a+r,8*b+r,8*b+l][corner]);
      for(let i=0;i<ring.length;i++){cells.push(ring[(start+(reverse?-i:i)+ring.length)%ring.length]);starts.push(i===0);}
    }
    paths.push({name:`spiral:${corner}:${+reverse}`,cells,starts});
  }
  const rim=[];
  for(let i=0;i<8;i++)rim.push(i);
  for(let r=1;r<32;r++)rim.push(r*8+7);
  for(let i=6;i>=0;i--)rim.push(31*8+i);
  for(let r=30;r>=1;r--)rim.push(r*8);
  check(rim.length===76&&paths.length===16,"geometry dimensions");
  for(const path of paths)check(new Set([...rim,...path.cells]).size===256,"partition");
  const pair=(a,b)=>`${a}:${b}`;
  /** Exact minimum number of incompatible observations for an unrestricted function. */
  function audit(keys,outputs){
    const counts=new Map();
    for(let i=0;i<keys.length;i++){
      if(!counts.has(keys[i]))counts.set(keys[i],new Map());
      const h=counts.get(keys[i]),v=outputs[i];h.set(v,(h.get(v)||0)+1);
    }
    let errors=0;
    for(const h of counts.values())errors+=Array.from(h.values()).reduce((a,b)=>a+b,0)-Math.max(...h.values());
    return {keys:counts.size,errors,observations:keys.length};
  }
  const summaries=[];
  const detail=[];
  for(const radix of [60,59]){
    const alphabet=radix===60?table.alphabet:table.alphabet.replace("f","");
    const bytes=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
    check(bytes.every(x=>x>=0&&x<256)&&new Set(bytes).size===161,"byte parse");
    for(const path of paths){
      const a=path.cells.map(i=>bytes[i]);
      const knownPairs=new Set(a.slice(1).map((v,i)=>pair(a[i],v)));
      for(const direction of [rim,[...rim].reverse()]){
        const b=direction.map(i=>bytes[i]),p=b.slice(1).map((v,i)=>pair(b[i],v));
        check(new Set(p).size===75,"distinct rim pairs");
        check(p.every(key=>!knownPairs.has(key)),"no rim pair in inner training");
      }
      for(const [register,P] of Object.entries(regs)){
        for(const reset of [false,true]){
          const at=[];
          for(let i=1;i<180;i++)if(!reset||(!path.starts[i]&&i!==85))at.push(i);
          const outputs=at.map(i=>P[i]);
          const prevP=audit(at.map(i=>pair(P[i-1],a[i])),outputs);
          const prevByte=audit(at.map(i=>pair(a[i-1],a[i])),outputs);
          const both=audit(at.map(i=>`${P[i-1]}:${a[i-1]}:${a[i]}`),outputs);
          const encoder=audit(at.map(i=>pair(a[i-1],P[i])),at.map(i=>a[i]));
          detail.push({radix,path:path.name,register,reset,prevP,prevByte,both,encoder});
        }
      }
    }
    // A direct nonidentification proof for canonical row order and full solved tail.
    const b=rim.map(i=>bytes[i]),a=paths[0].cells.map(i=>bytes[i]),P=regs.solved;
    const seed=Array.from({length:256},(_,i)=>i).find(i=>!bytes.includes(i));
    check(seed!==undefined,"unused initial state");
    const train=new Map();
    for(let i=1;i<a.length;i++)train.set(pair(a[i-1],a[i]),P[i]);
    check(train.size===179,"canonical training pairs are all distinct");
    const all=b.concat(a),keys=all.map((v,i)=>pair(i?all[i-1]:seed,v));
    check(new Set(keys).size===256,"every full-path key is distinct");
    for(let i=0;i<76;i++)check(!train.has(keys[i]),"untrained rim keys");
    check(!train.has(keys[76]),"untrained boundary key");
    const witness=corpus.pages[57].indices.slice(0,76);
    const witnesses=[witness,witness.map(x=>(x+1)%29)];
    for(const hidden of witnesses){
      const expected=hidden.concat(P),D=new Map(train);
      for(let i=0;i<expected.length;i++){
        if(D.has(keys[i]))check(D.get(keys[i])===expected[i],"known label retained");
        else D.set(keys[i],expected[i]);
      }
      check(keys.every((key,i)=>D.get(key)===expected[i]),"complete 256-label replay");
    }
    const native=regs.solved;
    // Native positive for arbitrary previous-plaintext homophonic state.
    const planted=native.map((p,i)=>2*((p+(i?native[i-1]:0))%29)+(i%2));
    check(audit(planted.slice(1).map((v,i)=>pair(native[i],v)),native.slice(1)).errors===0,"native P-state plant");
    check(planted.every((v,i)=>(Math.floor(v/2)-(i?native[i-1]:0)+29)%29===native[i]),"native P-state known-law inverse");
    // Native positive for deterministic previous-byte state.
    let s=0;const encoded=native.map(p=>s=(p+s)%29);
    check(audit(encoded.slice(1).map((v,i)=>pair(encoded[i],v)),native.slice(1)).errors===0,"native byte inverse");
    check(audit(native.slice(1).map((p,i)=>pair(encoded[i],p)),encoded.slice(1)).errors===0,"native byte encoder");
    check(encoded.every((v,i)=>(v-(i?encoded[i-1]:0)+29)%29===native[i]),"native byte known-law inverse");
    summaries.push({radix,distinctTrainingKeys:train.size,distinctFullPathKeys:new Set(keys).size,unseenRimTransitions:76,arbitraryRimPlaintexts:(29n**76n).toString(),witnesses:2,plantRunes:native.length});
  }
  const metrics=[];
  for(const radix of [60,59])for(const register of ["solved","printed"])for(const reset of [false,true]){
    const a=detail.filter(x=>x.radix===radix&&x.register===register&&x.reset===reset);
    metrics.push({radix,register,reset,
      minPrevP:Math.min(...a.map(x=>x.prevP.errors)),
      prevPConsistent:a.filter(x=>!x.prevP.errors).map(x=>x.path),
      prevByteConsistent:a.filter(x=>!x.prevByte.errors).length,
      bothConsistent:a.filter(x=>!x.both.errors).length,
      deterministicByteConsistent:a.filter(x=>!x.prevByte.errors&&!x.encoder.errors).map(x=>x.path)});
  }
  check(metrics.filter(x=>x.register==="solved").every(x=>!x.prevPConsistent.length),"all solved P-state variants excluded");
  check(metrics.filter(x=>x.register==="solved"&&!x.reset).every(x=>!x.deterministicByteConsistent.length),"deterministic byte-state gate");
  return {metrics,summaries,detail};
}
console.log(JSON.stringify(experiment(read("base60-grid.json"),read("lp2-corpus.json")),null,2));
