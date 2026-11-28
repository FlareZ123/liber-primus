"use strict";
/** Agent18: exact GEB one-symbol gap shift and all-key native capacity, 2026-11-28. */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
const expected=[
  "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
  "f7b534a33edeb212d427329798438325307463d7",
  "df260a07d56bf5998d40a6360b6132c35c252d10",
  "94c677ad9dd50771c6670e0c4e4dad9052b46d85",
  "a92be8ba5b3511a003a22ba31523c14397aaa83a",
  "1b064ef6d85819b7d96adaff31a82d1ec551598f"
];
const input=paths.map((p,i)=>{const b=fs.readFileSync(path.join(__dirname,"..",p));const h=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");if(h!==expected[i])throw Error("source changed: "+p+" "+h);return b.toString("utf8")});
function allStartNative(a,n,bounds,k){
  const c=Array(29).fill(0);for(let i=0;i<n;i++)c[a[i]]++;
  const order=Array.from({length:28},(_,i)=>i+1).sort((i,j)=>c[j]-c[i]||i-j);
  const survivors=bounds.map(()=>0);let minimum=Infinity,at=0;
  function move(x,delta){
    c[x]+=delta;if(x===0)return;
    let j=order.indexOf(x);
    if(delta>0){
      while(j>0&&c[order[j]]>c[order[j-1]]){[order[j],order[j-1]]=[order[j-1],order[j]];j--}
    }else{
      while(j<27&&c[order[j]]<c[order[j+1]]){[order[j],order[j+1]]=[order[j+1],order[j]];j++}
    }
  }
  for(let start=0;start+n<=a.length;start++){
    let mass=0;for(let i=0;i<k;i++)mass+=c[order[i]];
    if(mass<minimum){minimum=mass;at=start}
    for(let i=0;i<bounds.length;i++)if(mass<=bounds[i])survivors[i]++;
    if((start%4096===0||start+n===a.length)&&order.some((v,j)=>j>0&&c[v]>c[order[j-1]]))throw Error("rolling order");
    if(start+n<a.length){move(a[start],-1);move(a[start+n],1)}
  }
  return {windows:a.length-n+1,minimum,at,survivors};
}
function analyze(input) {
  const ok=(x,msg)=>{if(!x)throw Error(msg)};
  const [corpusRaw,raw,...donorRaw]=input;
  const corpus=JSON.parse(corpusRaw),glyph=new Map(corpus.runes.map((x,i)=>[x,i]));
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const sum=a=>a.reduce((s,x)=>s+x,0);
  const mod=x=>(x%29+29)%29;
  // Printed line and page wraps are not word separators.
  let current=[],words=[];
  for(const c of raw.split("%").slice(0,55).join("%")){
    if(glyph.has(c))current.push(glyph.get(c));
    else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&current.length){words.push(current);current=[]}
  }
  if(current.length)words.push(current);
  const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  ok(tape.length===12956&&words.length===2896&&eq(tape,words.flat()),"original tape");
  const ends=[729,1874,3603,5506,6527,7960,9640,12648,12956];
  const chapters=[];let i=0;
  for(const e of ends){
    let r=chapters.length?ends[chapters.length-1]:0;const w=[];
    while(r<e){w.push(words[i]);r+=words[i++].length}
    ok(r===e,"chapter endpoint");chapters.push(w)
  }
  ok(eq(chapters.map(w=>w.length),[158,255,383,437,224,326,378,669,66]),"chapter words");
  // Shift *all* cuts, including the starting/ending reading frame,
  // by exactly one symbol, clip out-of-range cuts, then restore endpoints.
  function shifted(w,d){
    const t=w.flat();let a=0;const b=[0,...w.map(v=>a+=v.length)];
    const cuts=[...new Set([0,t.length,...b.map(x=>x+d).filter(x=>x>0&&x<t.length)])].sort((x,y)=>x-y);
    const out=cuts.slice(1).map((v,i)=>t.slice(cuts[i],v));
    ok(eq(out.flat(),t),"shift must conserve tape");return out
  }
  const example=shifted("ONE WAR TWO EAR EWE".split(" ").map(x=>[...x]),1).map(x=>x.join("")).join(" ");
  ok(example==="O NEW ART WOE ARE WE","GEB worked example");
  // A state is shared across words of the same shifted length L and
  // consuming within-word clock j. All state permutations are arbitrary.
  // The simple held-F bound credits every position from the first
  // ciphertext zero through the end of its word to the target set.
  function simple(ws,hold){
    const map=new Map();let uncertain=0,total=0;
    for(const w of ws){let z=0;for(let j=0;j<w.length;j++){
      const c=w[j];total++;
      if(hold&&(z||c===0))uncertain++;
      else{const id=w.length+":"+j;if(!map.has(id))map.set(id,Array(29).fill(0));map.get(id)[c]++}
      if(c===0)z++
    }}
    const rows=[...map.values()].map(r=>r.sort((a,b)=>b-a));
    return {total,uncertain,states:rows.length,top4:uncertain+sum(rows.map(r=>sum(r.slice(0,4))))}
  }
  // Tighter all-key upper bound for a set of k *non-F* plaintext labels.
  // At position i with z prior ciphertext zeros, any actual consuming
  // clock is in [j-z,j]. Let x_{L,t,c} indicate that the inverse maps c
  // to one of the k labels; each state row has at most k selected labels.
  // A held F contributes zero. For any weights a_i in [0,D],
  // D*y_i <= D-a_i + a_i * sum_{t in J_i} x_{L,t,c_i}.
  // Sum and replace each state row by its k largest weighted counts.
  // Rounded integer weights are the *certificate*; projected
  // subgradient optimization is merely a means of finding good weights.
  function weighted(ws,k,iterations=350){
    const rows=new Map(),events=[];
    for(const w of ws){let z=0;const L=w.length;for(let j=0;j<L;j++){
      const c=w[j],keys=[];
      for(let t=j-z;t<=j;t++){
        const id=L+":"+t;if(!rows.has(id))rows.set(id,rows.size);
        keys.push(rows.get(id)*29+c)
      }
      events.push(keys);if(c===0)z++
    }}
    const n=rows.size,m=events.length;
    const weights=Float64Array.from(events,e=>1/e.length);
    const count=new Float64Array(n*29),selected=new Uint8Array(n*29);
    const idx=Array.from({length:n},(_,s)=>Array.from({length:29},(_,j)=>s*29+j));
    let best=Infinity,bw;
    for(let it=0;it<=iterations;it++){
      count.fill(0);selected.fill(0);let bound=0;
      for(let i=0;i<m;i++){const w=weights[i];bound+=1-w;for(const j of events[i])count[j]+=w}
      for(let s=0;s<n;s++){
        idx[s].sort((i,j)=>count[j]-count[i]||i-j);
        for(let t=0;t<k;t++){bound+=count[idx[s][t]];selected[idx[s][t]]=1}
      }
      if(bound<best){best=bound;bw=Float64Array.from(weights)}
      const lr=.6/Math.sqrt(1+it/20);
      for(let i=0;i<m;i++){
        let g=-1;for(const j of events[i])g+=selected[j];
        weights[i]=Math.min(1,Math.max(0,weights[i]-lr*g))
      }
    }
    const D=1024,certWeights=Array.from(bw,w=>Math.round(D*w));
    count.fill(0);let numerator=0;
    for(let i=0;i<m;i++){
      const w=certWeights[i];ok(Number.isInteger(w)&&w>=0&&w<=D,"weight");
      numerator+=D-w;for(const j of events[i])count[j]+=w
    }
    for(let s=0;s<n;s++){
      idx[s].sort((i,j)=>count[j]-count[i]||i-j);
      for(let t=0;t<k;t++)numerator+=count[idx[s][t]]
    }
    ok(Number.isSafeInteger(numerator),"exact integer certificate");
    return {k,D,numerator,upper:Math.floor(numerator/D),weights:certWeights}
  }
  const tokenizer=corpus.translit.map((token,index)=>({token,index})).sort((a,b)=>b.token.length-a.token.length);
  function nativeWords(s){
    const out=[];
    for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      const a=[];for(let i=0;i<w.length;){
        if(w.startsWith("ING",i)){a.push(21);i+=3}
        else if(w.startsWith("IO",i)){a.push(27);i+=2}
        else{const t=tokenizer.find(t=>w.startsWith(t.token,i));ok(t,"native word");a.push(t.index);i+=t.token.length}
      }out.push(a)
    }return out
  }
  const native=donorRaw.slice(0,3).map(nativeWords),donors=native.map(w=>w.flat());
  ok(eq(donors.map(a=>a.length),[62492,217106,321327]),"native controls");
  const solvedRaw=JSON.parse(donorRaw[3]);
  const solvedWords=solvedRaw.sections.flatMap(s=>{
    const groups=[];let a=[];for(const c of s.source_text){if(glyph.has(c))a.push(glyph.get(c));else if(a.length){groups.push(a);a=[]}}if(a.length)groups.push(a);return groups
  });
  const solved=solvedWords.flat();ok(solved.length===2979,"authentic native control");
  function hist(a){
    const v=Array(29).fill(0);for(const c of a)v[c]++;
    const f=v[0],s=v.slice(1).sort((a,b)=>b-a);
    return {f,top:Array.from({length:12},(_,i)=>sum(s.slice(0,i+1)))}
  }
  const names=["Gibran","Shakespeare","Emerson"];
  function windows(a,len){
    const out=[];for(let start=0;start+len<=a.length;start+=503)out.push({start,...hist(a.slice(start,start+len))});
    return out
  }
  const references=donors.map((a,i)=>{
    const book=windows(a,12956),chapter=windows(a,3008);
    const mins=w=>Array.from({length:12},(_,i)=>Math.min(...w.map(r=>r.top[i])));
    return {name:names[i],runes:a.length,book:{n:book.length,min:mins(book)},chapter:{n:chapter.length,min:mins(chapter)},chapterWindows:chapter}
  });
  const alphabet="0123456789abcdefghijklmnopqrs";
  const code=a=>a.map(x=>alphabet[x]).join("");
  const lex=new Set([...native.flat(),...solvedWords].map(code));
  const keys={
    DIVINITY:[23,10,1,10,9,10,16,26],
    FIRFUMFERENFE:[0,19,25,0,28,10,0,11,25,11,20,0,11]
  };
  // Exact known-key word reset inverse: enumerate both held F and
  // consuming zero possibilities, forbid consuming plaintext F.
  function inverseWord(w,key,sign){
    const out=[];
    function walk(i,j,p){
      if(i===w.length){out.push(p);return}
      const c=w[i];if(c===0)walk(i+1,j,[...p,0]);
      const v=mod(c-sign*key[j%key.length]);
      if(v!==0)walk(i+1,j+1,[...p,v])
    }
    walk(0,0,[]);return out
  }
  function fixed(ws,key,sign){
    let dead=0,lexical=0,totalPaths=0,firstDead=null;
    for(let j=0;j<ws.length;j++){
      const p=inverseWord(ws[j],key,sign);totalPaths+=p.length;
      if(!p.length){dead++;if(firstDead===null)firstDead={word:j,cipher:code(ws[j])}}
      if(p.some(w=>lex.has(code(w))))lexical++
    }
    return {groups:ws.length,dead,lexical,totalPaths,firstDead}
  }
  // Forward sender with actual native symbols, arbitrary independently
  // sampled state permutations, real F holds and consuming zero outputs.
  // The known hold mask is given only to the replay check, not the bound.
  function plant(plain,layout,seed,hold){
    let state=seed>>>0;const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
    const maps=new Map(),out=[];let start=0,holds=0,consumeZero=0;
    for(const w of layout){
      const L=w.length,cipher=[];let j=0;
      for(let i=0;i<L;i++){
        const p=plain[start+i];
        if(hold&&p===0){cipher.push(0);holds++;continue}
        const id=L+":"+j;
        if(!maps.has(id)){
          const a=Array.from({length:29},(_,i)=>i);
          for(let i=28;i>0;i--){const t=rnd()%(i+1);[a[i],a[t]]=[a[t],a[i]]}
          maps.set(id,a)
        }
        const c=maps.get(id)[p];cipher.push(c);
        if(c===0)consumeZero++;
        ok(maps.get(id).indexOf(c)===p,"inverse");
        j++
      }
      out.push(cipher);start+=L
    }
    ok(start===plain.length,"plant length");
    const truth=hist(plain);
    if(hold)ok(simple(out,true).top4>=truth.top[3],"hold simple bound control");
    else ok(simple(out,false).top4>=truth.top[3],"ordinary bound control");
    const cert=hold?weighted(out,9,100):null;
    if(cert)ok(cert.upper>=truth.top[8],"weighted bound control");
    return {runes:start,holds,consumeZero,truthTop9:truth.top[8],boundTop9:cert?.upper??null}
  }
  // Positive tests of the fixed-key unknown-hold inverse, independent of
  // candidate original output.
  for(const key of Object.values(keys))for(const sign of [-1,1]){
    const w=solvedWords.slice(0,100);
    for(const p of w){let j=0;const c=p.map(v=>v===0?0:mod(v+sign*key[j++%key.length]));
      ok(inverseWord(c,key,sign).some(q=>eq(p,q)),"fixed-key native plant")
    }
  }
  const records=[];
  for(const d of [-1,0,1]){
    const c=chapters.map(w=>shifted(w,d)),all=c.flat(),eighth=c[7];
    const book={ordinary:simple(all,false),hold:simple(all,true)};
    const chapter={ordinary:simple(eighth,false),hold:simple(eighth,true)};
    // Preserve all exploratory k=1..12 bounds, and the exact integer
    // certificate for k=9 (the shared discriminator for all three donors).
    const certs=Array.from({length:12},(_,i)=>weighted(eighth,i+1));
    const bound9=certs[8].upper;
    const donorExclusions=references.map(r=>({
      name:r.name,bookExcluded:r.book.min[3]>book.hold.top4,
      chapterExcluded:r.chapterWindows.filter(w=>w.top[8]>bound9).length,
      chapterN:r.chapter.n
    }));
    const fixedKeys=[];
    for(const [name,key] of Object.entries(keys))for(const sign of [-1,1])
      fixedKeys.push({name,sign,book:fixed(all,key,sign),chapter:fixed(eighth,key,sign)});
    const plants=[plant(donors[0].slice(1000,1000+3008),eighth,0x33011800+(d+1),false),
      plant(donors[1].slice(2000,2000+3008),eighth,0x33011820+(d+1),true)];
    records.push({d,groups:c.map(w=>w.length),book,chapter,
      upperNonF:certs.map(x=>x.upper),certificate9:certs[8],donorExclusions,fixedKeys,plants})
  }
  const refs=references.map(({chapterWindows,...r})=>r);
  const allStartReferences=donors.map((a,i)=>({name:names[i],book:allStartNative(a,12956,records.map(r=>r.book.hold.top4),4),chapter:allStartNative(a,3008,records.map(r=>r.upperNonF[8]),9)}));
  ok(allStartReferences.every(r=>[...r.book.survivors,...r.chapter.survivors].every(n=>n===0)),"all-start donor support");
  return {allStartReferences,workedExample:example,originalWords:words.length,originalRunes:tape.length,
    native:refs,solved:{runes:solved.length,...hist(solved)},lexiconSize:lex.size,records,
    fixedKeyPositiveWords:100*2*2}
}
console.log(JSON.stringify(analyze(input),null,2));
