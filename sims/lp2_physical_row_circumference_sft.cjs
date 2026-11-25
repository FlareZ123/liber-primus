"use strict";
// Original physical-row circumference, Director issue #2841.
// No search over rotations, shell widths, or language-model parameters.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
function run(source,corpus) {
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const index=new Map(corpus.runes.map((ch,i)=>[ch,i]));
  const native=s=>[...s].filter(ch=>index.has(ch)).map(ch=>index.get(ch));
  const toGP=s=>{
    const ts=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
    return s.split(" ").flatMap(w=>{let out=[];while(w){let t=ts.find(t=>w.startsWith(t.s));check(t,"no GP token "+w);out.push(t.i);w=w.slice(t.s.length)}return out});
  };
  const text=xs=>xs.map(x=>corpus.translit[x]).join("");
  const words=s=>s.replace(/[\/%\s]/g,"").split(/[-.&$§]+/).map(native).filter(w=>w.length);
  const raw=source.split("%");check(raw.length===57,"physical pages");raw.splice(50,0,"");
  const rows=raw.map(s=>s.split(/[\n/]/).map(native).filter(l=>l.length));
  for(let p=0;p<58;p++)check(eq(rows[p].flat(),corpus.pages[p].indices),"source mismatch p"+p);
  check(rows.slice(0,56).flat().length===594,"line count");
  check(rows.slice(0,56).flat(2).length===12956,"unknown rune count");
  const p56plain=toGP("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
  const primes=[];for(let n=2;primes.length<85;n++){if(primes.every(p=>p*p>n||n%p))primes.push(n)}
  let clock=0;const encrypted=p56plain.map(p=>p===0?0:(p+primes[clock++]-1)%29);
  check(eq(encrypted,rows[56].flat()),"p56 authentic re-encryption");
  const splitRows=(flat,lengths)=>{let p=0;return lengths.map(n=>flat.slice(p,p+=n))};
  const peel=(rr)=>{
    const lens=rr.map(r=>r.length);let offsets=[],s=0;for(let l of lens){offsets.push(s);s+=l}
    const outer=[],seen=new Set();
    const add=(r,c)=>{let i=offsets[r]+c;if(!seen.has(i)){seen.add(i);outer.push(i)}};
    if(rr.length){for(let c=0;c<lens[0];c++)add(0,c);
      for(let r=1;r<rr.length-1;r++)add(r,lens[r]-1);
      if(rr.length>1)for(let c=lens.at(-1)-1;c>=0;c--)add(rr.length-1,c);
      for(let r=rr.length-2;r>=1;r--)add(r,0);
    }
    const flat=rr.flat(),inner=flat.map((_,i)=>i).filter(i=>!seen.has(i));
    const a=outer.map(i=>flat[i]),b=inner.map(i=>flat[i]),back=Array(flat.length);
    outer.forEach((i,j)=>back[i]=a[j]);inner.forEach((i,j)=>back[i]=b[j]);check(eq(back,flat),"round trip");
    return {lengths:lens,perimeter_offsets:outer,perimeter:a,interior:b};
  };
  const p57w=words(raw[57]);check(p57w.length===20,"p57 words");
  const phraseTape=[
    {id:"p57 first clause",v:p57w.slice(1,8).flat()},
    {id:"p57 shed clause",v:p57w.slice(8,14).flat()},
    {id:"p57 find clause",v:p57w.slice(14,20).flat()},
    {id:"p56 within deep web",v:toGP("WITHIN THE DEEP WEB THERE EXISTS A PAGE")},
    {id:"2016 path lies empty",v:toGP("THE PATH LIES EMPTY")},
    {id:"2016 liber primus is the way",v:toGP("LIBER PRIMUS IS THE WAY")}
  ];
  const hits=(xs)=>phraseTape.filter(q=>xs.some((_,i)=>q.v.every((v,j)=>xs[i+j]===v))).map(q=>q.id);
  const ioc=xs=>{let h=Array(29).fill(0);for(let x of xs)h[x]++;return xs.length<2?null:h.reduce((s,x)=>s+x*(x-1),0)/(xs.length*(xs.length-1))};
  const pages=rows.map((rr,p)=>({p,...peel(rr)}));
  const unknown=pages.slice(0,56);
  const outer=unknown.flatMap(x=>x.perimeter),inner=unknown.flatMap(x=>x.interior);
  const controls=[{p:56,kind:"original ciphertext",...pages[56]},{p:56,kind:"authenticated plaintext",...peel(splitRows(p56plain,rows[56].map(x=>x.length)))},{p:57,kind:"clear original",...pages[57]}];
  const summary={unknown_pages:unknown.length,unknown_rune_pages:unknown.filter(x=>x.lengths.length).length,unknown_rows:594,unknown_runes:12956,perimeter_runes:outer.length,interior_runes:inner.length,perimeter_ioc:ioc(outer),interior_ioc:ioc(inner),complete_phrase_checks:phraseTape.map(q=>({id:q.id,length:q.v.length})),page_hits:unknown.flatMap(p=>[["perimeter",p.perimeter],["interior",p.interior]].flatMap(([part,values])=>hits(values).map(id=>({p:p.p,part,id})))),global_hits:{perimeter:hits(outer),interior:hits(inner)},control:controls.map(x=>({p:x.p,kind:x.kind,lengths:x.lengths,perimeter_len:x.perimeter.length,interior_len:x.interior.length,perimeter_text:text(x.perimeter),interior_text:text(x.interior),perimeter_ioc:ioc(x.perimeter),interior_ioc:ioc(x.interior),perimeter_phrase_hits:hits(x.perimeter),interior_phrase_hits:hits(x.interior)}))};
  return {summary,pages,controls,readout:unknown.map(x=>({p:x.p,len:x.perimeter.length,text:text(x.perimeter),interior_len:x.interior.length}))};
}
const source=fs.readFileSync(path.join(root,"resources/transcriptions/lp2-image-corrected.txt"),"utf8");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
console.log(JSON.stringify(run(source,corpus),null,2));
