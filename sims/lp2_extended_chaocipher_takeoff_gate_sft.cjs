'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,native,crowRaw,blakeRaw,assert){
  /** @param {number} n */
  const id=n=>Array.from({length:n},(_,i)=>i);
  const rot=(a,k)=>a.slice(k).concat(a.slice(0,k));
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const doubles=a=>a.slice(1).reduce((s,v,i)=>s+(v===a[i]),0);
  const ascii=s=>Array.from(s,x=>x.charCodeAt(0)-65);
  /** @param {number[]} input @param {number[]} l @param {number[]} r @param {number} m @param {number[]} schedule @param {boolean} decrypt @param {boolean} greedy */
  function run(input,l,r,m,schedule,decrypt=false,greedy=false){
    let L=l.slice(),R=r.slice(),out=[],bits=[],changed=0,collisions=0,ambiguous=0;
    for(let i=0;i<input.length;i++){
      const x=input[i], prev=out.at(-1);
      let side=schedule[i%schedule.length]; // 0 = right plaintext, 1 = left plaintext
      if(greedy){
        assert(!decrypt&&side===0,"greedy policy only in encoder");
        const a=L[R.indexOf(x)],b=R[L.indexOf(x)];
        if(i){
          const p0=R[L.indexOf(prev)],c0=R[L.indexOf(p0)];
          if(c0!==prev)collisions++; // mapping drops prev and duplicates c0
          if(a===prev&&b!==prev){side=1;changed++;}
          const c=side?b:a;
          if(c0!==prev&&c===c0)ambiguous++;
        }
      }
      const active=decrypt?(side?R:L):(side?L:R);
      const opposite=decrypt?(side?L:R):(side?R:L);
      const j=active.indexOf(x);assert(j>=0,"symbol in wheel");
      out.push(opposite[j]);bits.push(side);
      L=rot(L,j);R=rot(R,j);
      L.splice(m,0,L.splice(1,1)[0]);R=rot(R,1);R.splice(m,0,R.splice(2,1)[0]);
    }
    return {out,bits,changed,collisions,ambiguous,L,R};
  }
  const l26=ascii("HXUCZVAMDSLKPEFJRIGTWOBNYQ"),r26=ascii("PTLNBQDEOYSFAVZKGJRIHWXUMC"),p26=ascii("WELLDONEISBETTERTHANWELLSAID"),c26=ascii("OAHQHCNYNXTSZJRRHJBYHQKSOUJY");
  assert(eq(run(p26,l26,r26,13,[0]).out,c26),"classic vector");
  const ep=ascii("CHAOCIPHER"),el=ascii("TUVWXYZABCDEFGHIJKLMNOPQRS"),er=id(26),pattern=[0,0,1,1,0,0,1,0,1,0];
  const ev=run(ep,el,er,13,pattern);
  assert(eq(ev.out,ascii("VZKYRVPRRP")),"2011 mixed-side priming vector");
  assert(eq(ev.L,ascii("PFGTHXIWJKLADESNOQRUVYZMBC"))&&eq(ev.R,ascii("STUKVWYZAFCDLXEHIJMNBOPQGR")),"2011 final wheels");
  assert(eq(run(ev.out,el,er,13,pattern,true).out,ep),"mixed inverse");
  /** Exact numerator over q*(q-1)^2 for each adjacent event. */
  function numer(q,same,sw){
    return sw?(same?(q-2)*(q-1):q*q-2*q+2):(same?0:q*(q-1));
  }
  function expected(p,pat,q){
    let sum=0;for(let i=1;i<p.length;i++)sum+=numer(q,p[i]===p[i-1],pat[i%pat.length]!==pat[(i-1)%pat.length]);
    const den=q*(q-1)**2;
    return sum/den;
  }
  function bounds(p,q){
    const n=p.length-1,d=doubles(p);
    return {n:p.length,d,minimum:(n-d)*numer(q,false,true)/(q*(q-1)**2),maximum:(n-d)/(q-1)+d*numer(q,true,true)/(q*(q-1)**2)};
  }
  function perms(a){if(!a.length)return [[]];return a.flatMap((v,i)=>perms(a.filter((_,j)=>i!==j)).map(p=>[v,...p]));}
  const q=5, all=perms(id(q)),left=all.filter(a=>a[0]===0),exact=[];
  for(const p of [[0,1,2,3,4],[0,0,1,0,1],[2,3,2,2,4]]){
    for(let mask=0;mask<32;mask++){
      const pat=id(p.length).map(i=>(mask>>i)&1),counts=Array(p.length-1).fill(0);
      for(const L of left)for(const R of all){
        const c=run(p,L,R,2,pat).out;
        for(let i=1;i<p.length;i++)if(c[i]===c[i-1])counts[i-1]++;
      }
      const den=q*(q-1)**2,keys=left.length*all.length;
      for(let i=1;i<p.length;i++)assert(counts[i-1]*den===keys*numer(q,p[i]===p[i-1],pat[i]!==pat[i-1]),"exact quotient transition probabilities");
      exact.push({p,mask,counts});
    }
  }
  const x=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  assert(x.length===12956&&doubles(x)===86,"original count");
  const map=new Map(corpus.runes.map((r,i)=>[r,i]));
  const nativeP=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).filter(r=>map.has(r)).map(r=>map.get(r))}));
  const p56=nativeP.find(s=>s.name==="p56_an_end").p,p57=nativeP.find(s=>s.name==="p57_parable").p;
  const prime=[];for(let n=2;prime.length<p56.length;n++)if(!prime.some(p=>n%p===0))prime.push(n);
  let k=0;
  assert(eq(p56.map(v=>v===0?0:(v+prime[k++]-1)%29),corpus.pages[56].indices),"p56 authentic prime replay");
  assert(eq(p57,corpus.pages[57].indices),"p57 literal replay");
  const tokens=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
  function gp(raw){const t=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C"),a=[];for(let i=0;i<t.length;){const z=tokens.find(z=>t.startsWith(z.token,i));if(z){a.push(z.i);i+=z.token.length;}else i++;}return a;}
  const crow=gp(crowRaw),blake=gp(blakeRaw.slice(blakeRaw.indexOf("THE ARGUMENT"),blakeRaw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
  assert(crow.length===21611&&blake.length===18631,"native donor lengths");
  let seed=3301;
  const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  const donors=[{name:"Crowley prefix",p:crow.slice(0,x.length)},{name:"Blake suffix",p:blake.slice(-x.length)}];
  const summarize=a=>({n:a.length,min:Math.min(...a),max:Math.max(...a),mean:a.reduce((s,x)=>s+x,0)/a.length});
  const trials=[];
  for(const {name,p} of donors){
    const fixed=[],greedy=[];
    for(let t=0;t<128;t++){
      const L=shuffle(id(29)),R=shuffle(id(29));
      const f=run(p,L,R,14,pattern);
      assert(eq(run(f.out,L,R,14,pattern,true).out,p),"native fixed replay");
      fixed.push(doubles(f.out));
      if(t<8){
        const g=run(p,L,R,14,[0],false,true);
        assert(eq(run(g.out,L,R,14,g.bits,true).out,p),"greedy explicit sidecar replay");
        greedy.push({doublets:doubles(g.out),switches:g.changed,nonbijectiveStates:g.collisions,ambiguousObserved:g.ambiguous});
      }
    }
    trials.push({name,...bounds(p,29),fixedPatternMean:expected(p,pattern,29),fixed:summarize(fixed),fixedRaw:fixed,greedy});
  }
  // Check the authentic native sections at their actual lengths, with frozen pattern.
  const short=nativeP.map(({name,p})=>({name,...bounds(p,29),fixedPatternMean:expected(p,pattern,29)}));
  return {original:{n:x.length,adjacent:doubles(x)},mixedVector:"PASS",exactToy:{keyQuotient:left.length*all.length,patterns:exact.length,transitionChecks:exact.length*4},nativeShort:short,trials};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),[read("resources/external/2013-book-of-law-I.txt"),read("resources/external/2013-book-of-law-II.txt"),read("resources/external/2013-book-of-law-III.txt")].join('\n'),read("resources/external/cicada2012-blake-marriage-gutenberg45315.txt"),assert.ok),null,2));
