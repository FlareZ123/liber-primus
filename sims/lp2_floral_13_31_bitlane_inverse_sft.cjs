'use strict';
// Agent44: source-motivated 13/31 floral two-lane original inverse and arbitrary-permutation marginal gate.
// Read-only, Node.js 22, CommonJS. No generated inputs or third-party dependencies.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,gold,raws){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const mod=(x,n)=>(x%n+n)%n;
  const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
  const native=gold.sections.map(s=>({name:s.name,a:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
  assert(native.reduce((n,s)=>n+s.a.length,0)===2979,"native register size");
  let primes=[];for(let p=2;primes.length<84;p++){if(primes.every(q=>q*q>p||p%q))primes.push(p);}
  let j=0;const p56=corpus.pages[56].indices.map((x,i)=>i===56?0:mod(x-(primes[j++]-1),29));
  assert(j===84&&eq(p56,native.find(s=>s.name==="p56_an_end").a),"authentic p56");
  assert(eq(corpus.pages[57].indices,native.find(s=>s.name==="p57_parable").a),"authentic p57");
  const masks=[13,22],variants=[0,1].flatMap(offset=>masks.map(mask=>({offset,mask,other:31^mask})));
  function bins(mask){return Array.from({length:32},(_,i)=>i).filter(i=>(i&mask)===i)}
  function laneHist(a,offset,mask){const h=Array(32).fill(0);for(const x of a)h[(x+offset)&mask]++;return bins(mask).map(x=>h[x]);}
  const sorted=h=>[...h].sort((a,b)=>a-b);
  function recombine(a,offset,mask,d,s){
    const n=a.length;
    return a.map((x,i)=>(((x+offset)&mask)|((a[mod(d*i+s,n)]+offset)&(31^mask)))-offset);
  }
  function search(a,offset,mask,verify=true){
    const n=a.length, candidates=[];let minInvalid=n, ties=0;const lo=a.map(x=>(x+offset)&mask),hi=a.map(x=>(x+offset)&(31^mask));
    for(const d of [1,-1])for(let s=0;s<n;s++){
      let bad=0;
      for(let i=0,k=s;i<n;i++,k=mod(k+d,n)){const x=(lo[i]|hi[k])-offset;bad+=Number(x<0||x>28)}
      if(d===1&&s===0){assert(bad===0,"identity valid");continue}
      if(bad<minInvalid){minInvalid=bad;ties=1}else if(bad===minInvalid)ties++;
      if(!bad){const p=recombine(a,offset,mask,d,s);
        if(verify)assert(eq(a,recombine(p,offset,mask,d,mod(-d*s,n))),"full exact round trip");
        candidates.push({d,s,changed:p.reduce((z,x,i)=>z+Number(x!==a[i]),0),ioc:p.length>1?laneHist(p,0,31).reduce((z,x)=>z+x*(x-1),0)/(n*(n-1)):0,prefix:p.slice(0,28).map(x=>corpus.translit[x]).join(" ")});
      }
    }
    return {tested:2*n-1,minInvalid,ties,valid:candidates.length,changedValid:candidates.filter(x=>x.changed).length,candidates};
  }
  // Four native controls: seek one nontrivial legal shift in a genuine solved
  // section, with deterministic selection independent of original unknown pages.
  const controls=variants.map(v=>{
    for(const source of native){const a=source.a;
      for(const n of [Math.min(95,a.length),50,32,20].filter(n=>n<=a.length)){
        const p=a.slice(0,n),q=search(p,v.offset,v.mask);
        const plant=q.candidates.find(c=>c.changed>=Math.min(6,n));
        if(!plant)continue;
        const c=recombine(p,v.offset,v.mask,plant.d,plant.s),inv=mod(-plant.d*plant.s,n);
        const r=search(c,v.offset,v.mask);
        assert(r.candidates.some(x=>x.d===plant.d&&x.s===inv),"planted true inverse retained");
        assert(eq(p,recombine(c,v.offset,v.mask,plant.d,inv)),"planted recovery");
        assert(eq(laneHist(p,v.offset,v.mask),laneHist(c,v.offset,v.mask))&&eq(laneHist(p,v.offset,v.other),laneHist(c,v.offset,v.other)),"planted margins");
        return {...v,source:source.name,n,encrypt:{d:plant.d,s:plant.s},decrypt:{d:plant.d,s:inv},recovered:n,changed:plant.changed,validNonidentity:r.valid};
      }
    }
    throw Error("No positive shift for variant "+JSON.stringify(v));
  });
  // Native greedy/ING+IO-calibrated controls reuse existing source normalizer.
  const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function gp(raw,cal){const out=[];for(const word of raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<word.length;){if(cal&&word.startsWith("ING",i)){out.push(21);i+=3;continue;}if(cal&&word.startsWith("IO",i)){out.push(27);i+=2;continue;}const t=tokens.find(x=>word.startsWith(x.s,i));assert(t,"GP encoding");out.push(t.i);i+=t.s.length;}}return out;}
  const donors=[];for(let j=0;j<raws.length;j++)for(const cal of [false,true]){const a=gp(raws[j],cal);assert(a.length===[[63114,62492],[218800,217106],[324630,321327]][j][Number(cal)],"donor length");donors.push({name:["Gibran","Shakespeare","Emerson"][j]+(cal?" calibrated":" greedy"),a});}
  function scan(a,n,v,targetA,targetB){
    if(a.length<n)return {windows:0,exact:0,sortedA:0,sortedBoth:0,minApass:0,maxOfMinA:null,maxOfMinB:null,rangeA:null};
    const ma=v.mask,mb=v.other,o=v.offset,ba=bins(ma),bb=bins(mb),hA=Array(32).fill(0),hB=Array(32).fill(0);
    const sA=sorted(targetA),sB=sorted(targetB),minA=sA[0],minB=sB[0];let exact=0,sortedA=0,sortedBoth=0,minApass=0,maxOfMinA=0,maxOfMinB=0;
    const rangeA=ba.map(()=>[n,0]);const aa=a.map(x=>(x+o)&ma),ab=a.map(x=>(x+o)&mb);
    for(let i=0;i<n;i++){hA[aa[i]]++;hB[ab[i]]++;}
    for(let i=0;i+n<=a.length;i++){
      let ha=ba.map(x=>hA[x]),hb=bb.map(x=>hB[x]);for(let k=0;k<ha.length;k++){rangeA[k][0]=Math.min(rangeA[k][0],ha[k]);rangeA[k][1]=Math.max(rangeA[k][1],ha[k]);}
      const mina=Math.min(...ha),minb=Math.min(...hb);maxOfMinA=Math.max(maxOfMinA,mina);maxOfMinB=Math.max(maxOfMinB,minb);minApass+=Number(mina>=minA);
      if(eq(ha,targetA)&&eq(hb,targetB))exact++;
      if(eq(sorted(ha),sA)){sortedA++;if(eq(sorted(hb),sB))sortedBoth++;}
      if(i+n<a.length){hA[aa[i]]--;hB[ab[i]]--;hA[aa[i+n]]++;hB[ab[i+n]]++;}
    }
    return {windows:a.length-n+1,exact,sortedA,sortedBoth,minApass,maxOfMinA,maxOfMinB,rangeA};
  }
  const concatenate=(s,e)=>corpus.pages.filter(p=>p.page>=s&&p.page<=e).flatMap(p=>p.indices);
  const scopes=[{name:"p40-53",a:concatenate(40,53)},{name:"p54-55",a:concatenate(54,55)},{name:"p40-55",a:concatenate(40,55)}];
  assert(eq(scopes.map(x=>x.a.length),[3008,308,3316]),"original scope lengths");
  const results=scopes.map(({name,a})=>({name,n:a.length,variants:variants.map(v=>{
    const A=laneHist(a,v.offset,v.mask),B=laneHist(a,v.offset,v.other);
    const literary=donors.map(d=>({name:d.name,...scan(d.a,a.length,v,A,B)}));
    const known=native.map(d=>({name:d.name,...scan(d.a,a.length,v,A,B)}));
    const aggregate=xs=>({windows:xs.reduce((s,x)=>s+x.windows,0),exact:xs.reduce((s,x)=>s+x.exact,0),sortedA:xs.reduce((s,x)=>s+x.sortedA,0),sortedBoth:xs.reduce((s,x)=>s+x.sortedBoth,0),minApass:xs.reduce((s,x)=>s+x.minApass,0),maxOfMinA:Math.max(...xs.map(x=>x.maxOfMinA??0)),maxOfMinB:Math.max(...xs.map(x=>x.maxOfMinB??0)),rangeA:bins(v.mask).map((_,k)=>[Math.min(...xs.filter(x=>x.windows).map(x=>x.rangeA[k][0])),Math.max(...xs.filter(x=>x.windows).map(x=>x.rangeA[k][1]))])});
    return {...v,A,B,minA:Math.min(...A),search:search(a,v.offset,v.mask),literary:aggregate(literary),known:known.some(x=>x.windows)?aggregate(known):null,literaryByDonor:literary,knownBySection:known};
  })}));
  const pages=corpus.pages.filter(p=>p.page>=40&&p.page<=55&&p.indices.length).map(p=>({page:p.page,n:p.indices.length,variants:variants.map(v=>({...v,...search(p.indices,v.offset,v.mask)}))}));
  // Exhaustive toy control: for all 4! permutations in each lane independently
  // (576 possibilities), histograms and sorted counts must be preserved.
  const toy=[3,7,12,24], perms=a=>a.length===0?[[]]:a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(z=>[x,...z]));
  const ps=perms([0,1,2,3]);let toyLegal=0;
  for(const v of variants)for(const x of ps)for(const y of ps){const q=x.map((z,i)=>(((toy[z]+v.offset)&v.mask)|((toy[y[i]]+v.offset)&v.other))-v.offset);if(q.some(x=>x<0||x>28))continue;toyLegal++;assert(eq(laneHist(q,v.offset,v.mask),laneHist(toy,v.offset,v.mask))&&eq(laneHist(q,v.offset,v.other),laneHist(toy,v.offset,v.other)),"arbitrary lane permutation histogram");}
  return {controls,toyLegal,results,pages};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
const a=paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(a[0]),JSON.parse(a[1]),a.slice(2)),null,2));
