// Agent1: sharp rank-majorization bound on shared per-position GP29 bijections.
// Usage: node sims/lp2_shared_page_bijection_majorization_sft.cjs
const fs=require("node:fs");
const path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/derived/dukotah-r37-lp1-map-runes.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const bound=function bound(source){
  const corpus=JSON.parse(source[0]), native=JSON.parse(source[1]).key, Q=29;
  const p=corpus.pages.slice(0,56).filter(x=>x.indices.length).map(x=>x.indices), N=p.reduce((s,r)=>s+r.length,0), L=Math.max(...p.map(r=>r.length));
  if(N!==12956||p.length!==55)throw Error("unexpected original corpus");
  const hist=a=>{let f=Array(Q).fill(0);for(const x of a)f[x]++;return f;};
  const sorted=a=>a.slice().sort((a,b)=>b-a);
  const prefix=a=>{let s=0;return a.map(x=>s+=x);};
  const ioc=f=>{const n=f.reduce((s,x)=>s+x,0);return f.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1));};
  const envelope=Array(Q).fill(0);let matches=0,opportunities=0;
  const witness=p.map(r=>Array(r.length));
  for(let j=0;j<L;j++){
    const f=hist(p.filter(r=>r.length>j).map(r=>r[j]));
    const rank=Array.from({length:Q},(_,i)=>i).sort((a,b)=>f[b]-f[a]||a-b);
    const inverse=Array(Q);
    rank.forEach((c,k)=>{envelope[k]+=f[c];inverse[c]=k;});
    for(let i=0;i<p.length;i++)if(p[i].length>j)witness[i][j]=inverse[p[i][j]];
    matches+=f.reduce((s,x)=>s+x*(x-1)/2,0);
    const n=f.reduce((s,x)=>s+x,0);opportunities+=n*(n-1)/2;
  }
  if(JSON.stringify(hist(witness.flat()))!==JSON.stringify(envelope))throw Error("sharpness witness failed");
  const cap=prefix(envelope);
  const gp=corpus.translit,tok=[...gp].sort((a,b)=>b.length-a.length);
  function encode(s){let out=[];let i=s.indexOf("*** START OF");if(i>=0)s=s.slice(s.indexOf("\n",i));i=s.indexOf("*** END OF");if(i>=0)s=s.slice(0,i);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/ING/g,"NG").replace(/QU/g,"CW").replace(/Q/g,"C").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S");for(let j=0;j<w.length;){const t=tok.find(t=>w.startsWith(t,j));if(!t)throw Error(w);out.push(gp.indexOf(t));j+=t.length;}}return out;}
  function scan(t){if(t.length<N)throw Error("short donor");let f=hist(t.slice(0,N)),minGap=Infinity,minIoc=Infinity,minTop=Infinity,admissible=0,topCapPass=0, iocPass=0,minGapAt=-1, example=null;
    for(let start=0;start<=t.length-N;start++){
      let v=sorted(f), s=0,gap=0,critK=0;for(let k=0;k<Q;k++){s+=v[k];if(s-cap[k]>gap){gap=s-cap[k];critK=k+1;}}
      const io=ioc(f);if(io<minIoc)minIoc=io;if(v[0]<minTop)minTop=v[0];
      if(v[0]<=envelope[0])topCapPass++;if(io<=ioc(envelope))iocPass++;if(gap===0)admissible++;
      if(gap<minGap){minGap=gap;minGapAt=start;example={hist:v,k:critK,ioc:io};}
      if(start<t.length-N){f[t[start]]--;f[t[start+N]]++;}
    }
    return {donorLength:t.length,windows:t.length-N+1,admissible,topCapPass,iocPass,minGap,minGapAt,minIoc,minTop,closest:example};
  }
  return {N,L,matches,opportunities,collisionRate:matches/opportunities,envelope,cap,maxIoc:ioc(envelope),maxFrequency:envelope[0]/N,native:{N:native.length,hist:sorted(hist(native)),ioc:ioc(hist(native))},donors:source.slice(2).map(s=>scan(encode(s)))};
};
console.log(JSON.stringify(bound(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
