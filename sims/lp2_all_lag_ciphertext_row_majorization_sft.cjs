'use strict';
const fs=require('node:fs');
const path=require('node:path');
function run(corpus,native,trans,donors) {
  const ALL=(1<<29)-1, NONZERO=ALL^1;
  const isSingle=x=>x!==0 && !(x&(x-1));
  const index=x=>31-Math.clz32(x);
  const pages=corpus.pages.filter(p=>p.page<56&&p.indices.length).map(p=>p.indices);
  const tape=pages.flat(),N=tape.length;
  const runes=new Map(corpus.runes.map((x,i)=>[x,i]));
  const sections=trans.split("$").slice(0,8).map(s=>Array.from(s,c=>runes.get(c)).filter(x=>x!==undefined));
  if(N!==12956||String(sections.flat())!==String(tape))throw Error("source alignment");
  const frames={continuous:[tape],section:sections,page:pages};
  const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
  function topVector(p){const f=Array(29).fill(0);for(const x of p)f[x]++;return f.sort((a,b)=>b-a)}
  function prefix(a){let s=0;return a.map(x=>s+=x)}
  function ordinary(arrays,q){
    const rows=Array.from({length:29},()=>new Uint32Array(29));let unknown=0;
    for(const c of arrays){unknown+=Math.min(q,c.length);for(let i=q;i<c.length;i++)rows[c[i-q]][c[i]]++}
    const ranked=Array(29).fill(0);
    for(const row of rows){row.sort((a,b)=>b-a);for(let j=0;j<29;j++)ranked[j]+=row[j]}
    ranked[0]+=unknown;
    return {ranked,unknown,known:N-unknown,holds:0,forced:0,iterations:1};
  }
  // Relax every unresolved ciphertext zero independently to consume OR hold.
  // The q-th preceding consumed position is between the q-th mandatory
  // nonzero and q-th not-proven-held physical positions. Its exact possible
  // symbol set under this relaxation is their inclusive interval OR,
  // excluding proven holds; an arbitrary primer is granted until q mandatory
  // events have occurred. Both endpoints advance monotonically.
  function contexts(c,h,q){
    const mandatory=[],available=[],out=new Uint32Array(c.length);
    let left=0,right=-1,mask=0;const f=new Uint32Array(29);
    for(let i=0;i<c.length;i++){
      if(mandatory.length>=q){
        const lo=mandatory[mandatory.length-q],hi=available[available.length-q];
        while(right<hi){right++;if(!h[right]){let v=c[right];if(++f[v]===1)mask|=1<<v}}
        while(left<lo){if(!h[left]){let v=c[left];if(--f[v]===0)mask&=~(1<<v)}left++}
        if(!mask)throw Error("empty relaxed context");
        out[i]=mask;
      }else out[i]=ALL;
      if(c[i])mandatory.push(i);
      if(!h[i])available.push(i);
    }
    return out;
  }
  function hold(arrays,q,truth){
    const hs=arrays.map(c=>new Uint8Array(c.length)),seen=new Uint32Array(29);
    let forced=0,iterations=0,ctxs;
    while(true){
      iterations++;ctxs=arrays.map((c,j)=>contexts(c,hs[j],q));
      let changed=false;
      for(let j=0;j<arrays.length;j++){
        const c=arrays[j],ctx=ctxs[j];
        for(let i=0;i<c.length;i++){
          if(truth&&!(ctx[i]&(1<<truth[j].contexts[i])))throw Error("lost real context");
          if(c[i]&&isSingle(ctx[i]))seen[index(ctx[i])]|=1<<c[i];
        }
      }
      let next=0;
      for(let k=0;k<29;k++)if(seen[k]===NONZERO)next|=1<<k;
      if(next!==forced){changed=true;forced=next}
      for(let j=0;j<arrays.length;j++){
        const c=arrays[j],ctx=ctxs[j],h=hs[j];
        for(let i=0;i<c.length;i++)if(!c[i]&&!h[i]&&(ctx[i]&~forced)===0){
          if(truth&&!truth[j].holds[i])throw Error("false F hold");
          h[i]=1;changed=true;
        }
      }
      if(!changed)break;
    }
    const rows=Array.from({length:29},()=>new Uint32Array(28));let unknown=0,holds=0,known=0;
    for(let j=0;j<arrays.length;j++){
      const c=arrays[j],ctx=ctxs[j],h=hs[j];
      for(let i=0;i<c.length;i++){
        if(h[i])holds++;
        else if(c[i]&&isSingle(ctx[i])){rows[index(ctx[i])][c[i]-1]++;known++}
        else unknown++;
      }
    }
    const sum=Array(28).fill(0);
    for(const row of rows){row.sort((a,b)=>b-a);for(let i=0;i<28;i++)sum[i]+=row[i]}
    const ranked=[...sum,holds].sort((a,b)=>b-a);ranked[0]+=unknown;
    if(unknown+known+holds!==arrays.reduce((s,c)=>s+c.length,0))throw Error("lost symbols");
    return {ranked,unknown,known,holds,forced:forced.toString(2).replace(/0/g,"").length,iterations};
  }
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function donor(s){
    const result=[];
    for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
      w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
      while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);result.push(t.i);w=w.slice(t.s.length)}
    }
    return result;
  }
  const windows=[],donorStats=[];
  for(const {name,s} of donors){
    const p=donor(s),a=[];
    for(let off=0;off+N<=p.length;off+=Math.floor(N/4)){
      const v=prefix(topVector(p.slice(off,off+N)));a.push(v);windows.push(v)
    }
    donorStats.push({name,windows:a.length,minTop9:Math.min(...a.map(v=>v[8]))});
  }
  const minTop9=Math.min(...windows.map(v=>v[8]));
  if(windows.length!==176||minTop9!==7946)throw Error("control window mismatch");
  const mins=Array.from({length:29},(_,i)=>Math.min(...windows.map(v=>v[i])));
  function survivors(ranked){
    const upper=prefix(ranked);
    if(upper.some((x,i)=>x<mins[i]))return 0;
    return windows.filter(w=>w.every((v,i)=>v<=upper[i])).length;
  }
  const ranges=a=>{const r=[];for(const x of a){if(r.length&&r.at(-1)[1]===x-1)r.at(-1)[1]=x;else r.push([x,x])}return r};
  function summarize(rows){
    const excluded=rows.filter(x=>x.survivors===0),top9=rows.filter(x=>x.top9<minTop9);
    return {tested:rows.length,excluded:excluded.length,excludedRanges:ranges(excluded.map(x=>x.q)),top9Excluded:top9.length,top9Ranges:ranges(top9.map(x=>x.q)),maxTop9:rows.reduce((a,b)=>a.top9>=b.top9?a:b),
      selected:[1,8,13,16,29,40,43,45,46,47,48,49,50,51,52,53,59,75,100,133,256,729,1033,2000,3301].filter(q=>q<=rows.length).map(q=>rows[q-1])};
  }
  const result={N,donorStats,minTop9,ordinary:{},hold:{},controls:[]};
  for(const [name,arrays] of Object.entries(frames)){
    const max=Math.max(...arrays.map(c=>c.length));
    const ordinaryRows=[],holdRows=[];
    for(let q=1;q<=3301;q++){
      const a=ordinary(arrays,q);
      ordinaryRows.push({q,top9:prefix(a.ranked)[8],unknown:a.unknown,survivors:survivors(a.ranked)});
      // q >= max frame length: every row may be an arbitrary primer.
      const b=q>=max?{ranked:[N,...Array(28).fill(0)],unknown:N,known:0,holds:0,forced:0,iterations:1}:hold(arrays,q);
      holdRows.push({q,top9:prefix(b.ranked)[8],unknown:b.unknown,known:b.known,holds:b.holds,forced:b.forced,iterations:b.iterations,survivors:survivors(b.ranked)});
    }
    result.ordinary[name]=summarize(ordinaryRows);
    result.hold[name]=summarize(holdRows);
  }
  // Independently keyed native controls, including genuine consumed
  // ciphertext zeros from rows whose unused plaintext-F image is nonzero.
  const p=native.sections.flatMap(s=>Array.from(s.source_text,c=>runes.get(c)).filter(x=>x!==undefined));
  let rng=0x95ab2341;
  const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
  function shuffle(a){for(let i=a.length-1;i>0;i--){let j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  for(const q of [1,8,13,29,43,59,133]){
    for(const mode of ["ordinary","hold-fixed","hold-mixed"]){
      const rows=range(0,28).map(k=>mode==="hold-fixed"||(mode==="hold-mixed"&&k%3===0)?[0,...shuffle(range(1,28))]:shuffle(range(0,28)));
      const primer=range(1,q).map(()=>rand()%29),queue=primer.slice(),c=[],actualContexts=[],actualHolds=[];
      let consumedZeros=0;
      for(const x of p){
        const k=queue[0];actualContexts.push(k);
        const isHold=mode!=="ordinary"&&x===0;actualHolds.push(isHold);
        if(isHold)c.push(0);
        else{const y=rows[k][x];c.push(y);if(y===0)consumedZeros++;queue.shift();queue.push(y)}
      }
      const dq=primer.slice(),decoded=[];
      // Control mask is used only for exact round-trip; inference receives
      // only C and q. True contexts/masks are passed solely as assertions.
      for(let i=0;i<c.length;i++){if(actualHolds[i])decoded.push(0);else{const k=dq.shift();decoded.push(rows[k].indexOf(c[i]));dq.push(c[i])}}
      if(String(decoded)!==String(p))throw Error("native replay mismatch");
      const b=mode==="ordinary"?ordinary([c],q):hold([c],q,[{contexts:actualContexts,holds:actualHolds}]);
      const trueRank=prefix(topVector(p)),upper=prefix(b.ranked);
      if(trueRank.some((v,i)=>v>upper[i]))throw Error("majorization false negative");
      result.controls.push({q,mode,n:p.length,consumedZeros,realHolds:actualHolds.filter(Boolean).length,inferredHolds:b.holds,known:b.known,top9:trueRank[8],boundTop9:upper[8],replay:true});
    }
  }
  return result;
}
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const paths=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(JSON.parse(load('resources/liber-primus/lp2-corpus.json')),JSON.parse(load('resources/external/relikd-solved-gp29-native-v1.json')),load('resources/liber-primus/lp2-transcription.txt'),paths.map(name=>({name,s:load(name)}))),null,2));
