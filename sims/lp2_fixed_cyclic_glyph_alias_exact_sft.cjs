'use strict';
// Exact original-input fixed cyclic glyph alias receiver. Run from repository root.
function analyse(c,t,native) {
  const assert=(v,msg)=>{if(!v)throw Error(msg)};
  const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
  const ix=new Map(c.runes.map((r,i)=>[r,i]));
  const parse=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
  const raw=t.split("%").slice(0,55).join("%");
  const physical=c.pages.slice(0,56).map(x=>x.indices).filter(x=>x.length);
  const flat=physical.flat();
  function group(s,ignore){
    const out=[];let w=[];
    for(const x of s){
      if(ix.has(x))w.push(ix.get(x));
      else if(!ignore.includes(x)&&w.length){out.push(w);w=[]}
    }
    if(w.length)out.push(w);
    return out;
  }
  const frames={continuous:[flat],page:physical,line:raw.split("/").map(parse).filter(x=>x.length),word:group(raw,"/\n%"),fine:group(raw,"")};
  assert(flat.length===12956&&physical.length===55&&frames.word.length===2896&&frames.line.length===594&&frames.fine.length===3316,"canonical dimensions");
  for(const f of Object.values(frames))assert(eq(f.flat(),flat),"canonical tape mismatch");
  const pairs=[];for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)pairs.push([a,b]);
  // An invalid projected transition at positions u<v needs a reset boundary r with u<r<=v.
  function conflicts(fs,g){
    const succ=new Int8Array(29).fill(-1);
    for(let i=0;i<g.length;i++)succ[g[i]]=g[(i+1)%g.length];
    let o=0;const r=[];
    for(const f of fs){
      let v=-1,i0=-1;
      for(let i=0;i<f.length;i++){
        const x=f[i];if(succ[x]<0)continue;
        if(v>=0&&succ[v]!==x)r.push([o+i0+1,o+i]);
        v=x;i0=i;
      }
      o+=f.length;
    }
    return r;
  }
  // Exact minimum interval stabbing, sorted by increasing right endpoint.
  function hit(a,b=[]){
    let i=0,j=0,last=-1;const cuts=[];
    while(i<a.length||j<b.length){
      const q=j>=b.length||(i<a.length&&a[i][1]<=b[j][1])?a[i++]:b[j++];
      if(last<q[0]){last=q[1];cuts.push(last)}
    }
    return cuts;
  }
  function replay(fs,groups,cuts){
    const owner=new Map();
    groups.forEach((g,k)=>g.forEach(x=>{assert(!owner.has(x),"overlapping aliases");owner.set(x,k)}));
    const reset=new Set(cuts);let o=0,ok=0;const firstPhases=[];
    for(const f of fs){
      let next=new Array(groups.length).fill(-1);
      let phases=new Array(groups.length).fill(-1);
      for(let i=0;i<f.length;i++,o++){
        if(i===0||reset.has(o)){
          if(i!==0)firstPhases.push(phases);
          next=new Array(groups.length).fill(-1);phases=new Array(groups.length).fill(-1);
        }
        const x=f[i],k=owner.get(x);
        if(k===undefined){ok++;continue}
        const g=groups[k];
        if(next[k]<0){next[k]=g.indexOf(x);phases[k]=next[k]}
        // The abstract plaintext symbol is g[0], and the receiver advances its recovered cycle.
        assert(g[next[k]]===x,"nonreplaying cycle witness");
        next[k]=(next[k]+1)%g.length;ok++;
      }
      firstPhases.push(phases);
    }
    assert(ok===fs.flat().length,"replay length");
    return {replayed:ok,phaseFrames:firstPhases.length};
  }
  function optimize(fs){
    const ints=pairs.map(p=>conflicts(fs,p));
    let pbest={n:Infinity},dbest={n:Infinity},tbest={n:Infinity},dc=0,tc=0;
    const zero=[];
    for(let i=0;i<pairs.length;i++){
      if(!ints[i].length)zero.push(pairs[i]);
      if(ints[i].length<pbest.n)pbest={n:ints[i].length,groups:[pairs[i]],cuts:ints[i].map(v=>v[1])};
      for(let j=i+1;j<pairs.length;j++){
        if(pairs[i].some(x=>pairs[j].includes(x)))continue;
        dc++;const cuts=hit(ints[i],ints[j]);
        if(cuts.length<dbest.n)dbest={n:cuts.length,groups:[pairs[i],pairs[j]],cuts};
      }
    }
    for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)for(let d=b+1;d<29;d++){
      for(const g of [[a,b,d],[a,d,b]]){
        tc++;const v=conflicts(fs,g);
        if(v.length<tbest.n)tbest={n:v.length,groups:[g],cuts:v.map(q=>q[1])};
      }
    }
    assert(dc===71253&&tc===7308,"enumeration coverage");
    for(const w of [pbest,dbest,tbest])w.replay=replay(fs,w.groups,w.cuts);
    const gp27=dbest.n<=tbest.n?dbest:tbest;
    return {frameCount:fs.length,zeroPairs:zero,minOnePair:pbest,minTwoPairs:dbest,minTriple:tbest,minGP27:gp27.n,dc,tc};
  }
  // Exhaustively verify the interval greedy against brute subset enumeration on deterministic small cases.
  let seed=0x1234abcd;
  function rand(m){seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed%m}
  for(let trial=0;trial<512;trial++){
    const iv=[];for(let j=0;j<1+rand(7);j++){const l=1+rand(8);iv.push([l,l+rand(9-l)])}
    iv.sort((x,y)=>x[1]-y[1]);
    const greedy=hit(iv).length;let brute=9;
    for(let mask=0;mask<256;mask++){
      let cnt=0;for(let i=0;i<8;i++)if(mask>>i&1)cnt++;
      if(cnt>=brute)continue;
      if(iv.every(([l,r])=>Array.from({length:r-l+1},(_,i)=>l+i).some(k=>mask>>(k-1)&1)))brute=cnt;
    }
    assert(greedy===brute,"interval brute disagreement");
  }
  const sourceNative=native.sections.flatMap(x=>parse(x.source_text));
  assert(sourceNative.length===2979&&new Set(sourceNative).size===27&&!sourceNative.includes(12)&&!sourceNative.includes(22),"native source register");
  const perm=x=>(7*x+13)%29;
  function plant(groups){
    const gmap=new Map(groups.map(g=>[g[0],g])),clock=new Map();
    const cipher=sourceNative.map(x=>{
      const g=gmap.get(x);if(!g)return perm(x);
      const k=clock.get(x)||0;clock.set(x,k+1);return perm(g[k%g.length]);
    });
    const zero=pairs.filter(p=>conflicts([cipher],p).length===0);
    const trueGroups=groups.map(g=>g.map(perm));
    const expected=trueGroups.flatMap(g=>g.flatMap((x,i)=>g.slice(i+1).map(y=>[x,y].sort((a,b)=>a-b)))).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    assert(eq(zero,expected),"blind plant partition recovery");
    const rev=new Map();for(let i=0;i<29;i++)rev.set(perm(i),i);
    const labels=new Map(trueGroups.flatMap((g,k)=>g.map(x=>[x,groups[k][0]])));
    const decoded=cipher.map(x=>labels.has(x)?labels.get(x):rev.get(x));
    assert(eq(decoded,sourceNative),"native decode control");
    return {groups:trueGroups,zero,decoded:decoded.length,replay:replay([cipher],trueGroups,[])};
  }
  const controls={twoPairs:plant([[18,12],[20,22]]),triple:plant([[18,12,22]]),intervalBrute:512};
  const results=Object.fromEntries(Object.entries(frames).map(([k,v])=>[k,optimize(v)]));
  const bounds=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const offsets=[0];for(const p of c.pages)offsets.push(offsets.at(-1)+p.indices.length);
  let o=0;const fragments=frames.fine.map(w=>{const start=o;o+=w.length;return{start,end:o,w}});
  const chapter=bounds.map(([l,h])=>{
    const start=offsets[l],end=offsets[h+1];
    const fs=fragments.filter(x=>x.start<end&&x.end>start).map(x=>x.w.slice(Math.max(0,start-x.start),Math.min(x.w.length,end-x.start)));
    assert(eq(fs.flat(),flat.slice(start,end)),"chapter fine tape");
    return {pages:[l,h],runes:end-start,continuous:optimize([flat.slice(start,end)]),fine:optimize(fs)};
  });
  return {sourceCounts:{runes:flat.length,pages:physical.length,words:frames.word.length,lines:frames.line.length,fragments:frames.fine.length},controls,results,chapter};
}
module.exports = analyse;
if (require.main === module) {
  const fs = require('node:fs');
  const read = p => fs.readFileSync(p, 'utf8');
  const result = analyse(JSON.parse(read('resources/liber-primus/lp2-corpus.json')), read('resources/transcriptions/lp2-image-corrected.txt'), JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')));
  console.log(JSON.stringify(result, null, 2));
}
