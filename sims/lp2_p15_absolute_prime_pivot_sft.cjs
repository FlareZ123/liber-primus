'use strict';
const fs = require('node:fs');
function run(corpus,native){
  /** @param {number} n */
  const mod=n=>((n%29)+29)%29;
  const prime=[];for(let n=2;prime.length<5400;n++){let ok=true;for(const p of prime){if(p*p>n)break;if(n%p===0){ok=false;break;}}if(ok)prime.push(n);}
  const fib=[0,1,2];while(fib.at(-1)<987)fib.push(fib.at(-1)+fib.at(-2));
  const plate=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
  const check=(ok,msg)=>{if(!ok)throw Error(msg);};
  check(fib.every((f,i)=>Math.abs(3301-prime[f])===plate[i]),"plate mismatch");
  const residues=prime.map(mod), pivot=3301, maxStart=3301;
  const rm=new Map(corpus.runes.map((x,i)=>[x,i]));
  const records=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(x=>rm.has(x)).map(x=>rm.get(x))}));
  const an=records.find(s=>s.name.includes("p56"));
  /** @param {number[]} p @param {(j:number)=>number} key @param {boolean} held */
  function enc(p,key,held){let j=0;return p.map(x=>held&&x===0?0:mod(x+key(j++)));}
  check(enc(an.p,j=>mod(prime[j]-1),true).every((x,i)=>x===corpus.pages[56].indices[i]),"p56 failed");
  /** Exact fixed-key F reachability. @param {number[]} c @param {(j:number)=>number} key */
  function fixed(c,key){let states=new Set([0]);for(let i=0;i<c.length;i++){const n=new Set();for(const j of states){if(c[i]===0)n.add(j);if(c[i]!==key(j))n.add(j+1);}if(!n.size)return{prefix:i,end:[]};states=n;}return{prefix:c.length,end:[...states]};}
  /** Exact relaxed absolute-pivot model. At each consuming event, can switch from b-prime to prime-b once.
   *  @param {number[]} c @param {number} start @param {number} b */
  function relax(c,start,b){
    const m=c.filter(x=>x===0).length+2;
    let a=new Uint8Array(m),d=new Uint8Array(m),na=new Uint8Array(m),nd=new Uint8Array(m);
    a[0]=1;let hmax=0;
    for(let i=0;i<c.length;i++){
      na.fill(0,0,hmax+2);nd.fill(0,0,hmax+2);
      let any=0;const z=c[i]===0;
      for(let h=0;h<=hmax;h++){
        const av=a[h],dv=d[h];if(!(av|dv))continue;
        const p=residues[start+i-h];
        let k=b-p;if(k<0)k+=29;
        const kk=k===0?0:29-k;
        if(av&&c[i]!==k){na[h]=1;any=1;}
        if((av|dv)&&c[i]!==kk){nd[h]=1;any=1;}
        if(z){if(av)na[h+1]=1;if(dv)nd[h+1]=1;any=1;}
      }
      if(!any)return{prefix:i,ends:[]};
      [a,na]=[na,a];[d,nd]=[nd,d];if(z)hmax++;
    }
    const ends=[];for(let h=0;h<=hmax;h++)if(a[h]||d[h])ends.push(c.length-h);
    return{prefix:c.length,ends};
  }
  /** Independent slow oracle with explicit switch position, before/after each possible consumed count. */
  function oracle(c,s,b){let best=0;for(let t=0;t<=c.length;t++){const q=fixed(c,j=>mod(j<t?b-prime[s+j]:prime[s+j]-b));best=Math.max(best,q.prefix);}return best;}
  let seed=0x7a28b15;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
  for(let i=0;i<240;i++){const c=Array.from({length:12},()=>rnd(29));c[rnd(12)]=0;c[rnd(12)]=0;const s=rnd(3302),b=rnd(29);check(relax(c,s,b).prefix===oracle(c,s,b),"relax oracle mismatch");}
  /** @param {number[]} c */
  function scan(c){
    let fixedMax=-1,relaxedMax=-1,fixedFull=0,relaxedFull=0;const fm=[],lm=[],survivors=[];
    for(let s=0;s<=maxStart;s++){
      const z=fixed(c,j=>mod(Math.abs(pivot-prime[s+j])));if(z.prefix>fixedMax){fixedMax=z.prefix;fm.length=0;}if(z.prefix===fixedMax)fm.push(s);if(z.prefix===c.length)fixedFull++;
      for(let b=0;b<29;b++){
        const q=relax(c,s,b);if(q.prefix>relaxedMax){relaxedMax=q.prefix;lm.length=0;}if(q.prefix===relaxedMax)lm.push([s,b]);if(q.prefix===c.length){relaxedFull++;if(survivors.length<30)survivors.push({s,b,ends:q.ends});}
      }
    }
    return{fixedMax,fixedBest:fm,fixedFull,relaxedMax,relaxedBest:lm,relaxedFull,relaxedWitnesses:survivors};
  }
  /** Native smoothed trigram with independent held donor exclusion. */
  function model(ref){
    const a=new Float64Array(29),b=new Float64Array(29*29),d=new Float64Array(29*29*29),s=ref.reduce((n,x)=>n+x.length,0);
    for(const p of ref)for(let i=0;i<p.length;i++){a[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)d[(p[i-2]*29+p[i-1])*29+p[i]]++;}
    const bc=new Float64Array(29);const dc=new Float64Array(841);
    for(let x=0;x<29;x++)for(let y=0;y<29;y++){bc[x]+=b[x*29+y];for(let z=0;z<29;z++)dc[x*29+y]+=d[(x*29+y)*29+z];}
    const u=Array.from(a,x=>(x+.5)/(s+14.5));const log=new Float64Array(24389);
    for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){
      const p2=(b[y*29+z]+8*u[z])/(bc[y]+8);
      log[(x*29+y)*29+z]=Math.log(29*(d[(x*29+y)*29+z]+8*p2)/(dc[x*29+y]+8));
    }
    return log;
  }
  /** Full fixed-pivot ordinary origin recovery, train prefix only. */
  function ordinary(c,cut,ref,B=3301){
    const score=model(ref);const rank=[];
    for(let s=0;s<=maxStart;s++){
      let a=0,b=0,total=0;for(let i=0;i<cut;i++){const x=mod(c[i]-Math.abs(B-prime[s+i]));if(i>=2)total+=score[(a*29+b)*29+x];a=b;b=x;}
      rank.push([total,s]);
    }
    rank.sort((x,y)=>y[0]-x[0]||x[1]-y[1]);const best=rank[0][1];
    const p=c.map((x,i)=>mod(x-Math.abs(B-prime[best+i])));let held=0;for(let i=Math.max(2,cut);i<p.length;i++)held+=score[(p[i-2]*29+p[i-1])*29+p[i]];
    check(enc(p,j=>mod(Math.abs(B-prime[best+j])),false).every((x,i)=>x===c[i]),"ordinary replay");
    return{origin:best,fit:rank[0][0]/(cut-2),gap:rank[0][0]-rank[1][0],held:held/(p.length-cut),plain:p};
  }
  const plant=records.filter(s=>s.p.length>=120).slice(0,3).map((rec,i)=>{
    const s=[100,400,20][i],B=[3301,3301,1033][i],key=j=>mod(Math.abs(B-prime[s+j]));
    const c=enc(rec.p,key,true),z=fixed(c,key),q=relax(c,s,mod(B)),truth=rec.p.filter(x=>x!==0).length;
    check(z.end.includes(truth)&&q.ends.includes(truth),"F planted path lost");
    const oc=enc(rec.p,key,false),o=ordinary(oc,Math.floor(.75*oc.length),records.filter(x=>x!==rec).map(x=>x.p),B);
    return{name:rec.name,n:rec.p.length,s,B,truth,fixedEnds:z.end,relaxEnds:q.ends,ordinaryOrigin:o.origin,ordinaryAccuracy:o.plain.filter((x,i)=>x===rec.p[i]).length,fit:o.fit,held:o.held};
  });
  const tail=corpus.pages.slice(16,23).flatMap(p=>p.indices);
  const target=[{name:"p15-offset20-through-p22",c:[...corpus.pages[15].indices.slice(20),...tail]},{name:"p16-through-p22",c:tail}];
  const original=target.map(({name,c})=>{const cut=c.length-corpus.pages[22].indices.length;const o=ordinary(c,cut,records.map(s=>s.p));const z=scan(c);return{name,n:c.length,cut,sourceOrigin0:fixed(c,j=>mod(Math.abs(pivot-prime[j]))),...z,ordinary:{...o,plain:o.plain.map(x=>corpus.translit[x]).join(" ")}};});
  return{fib,plate,pivot,sourceCrossingPrimeOrdinal:prime.indexOf(pivot)+1,origins:maxStart+1,relaxedClasses:(maxStart+1)*29,toyOracleChecks:240,p56:{n:an.p.length,consumed:an.p.filter(x=>x!==0).length},plant,original};
}
module.exports={run};
if(require.main===module){const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));}
