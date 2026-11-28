"use strict";
/**
 * Independent deletion/silent-output singleton necessary gate.
 * Run: node sims/lp2_erasure_preserved_word_gate.cjs
 * Given genuine surviving word boundaries, fresh independent uniform key
 * values, and a fixed contiguous native donor, no key search is required.
 */
function experiment(gp, transcription, donors) {
  const set=new Set(gp.runes), tape=[];
  let n=0;
  for(const c of transcription){
    if(set.has(c)){
      if(n===12956)break;
      n++;tape.push(c);
    }else if(!"/%\r\n \t".includes(c))tape.push("-");
  }
  const words=tape.join("").split(/-+/).filter(Boolean);
  const hist={};
  for(const w of words)hist[w.length]=(hist[w.length]||0)+1;
  const N=words.length,X=hist[1];
  if(n!==12956||N!==2896||X!==83)throw Error("canonical tape drift");
  const tokens=[...gp.translit].sort((a,b)=>b.length-a.length);
  function length(w){
    w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    let len=0;
    for(let i=0;i<w.length;){
      const t=w.startsWith("ING",i)?"ING":w.startsWith("IO",i)?"IO":tokens.find(x=>w.startsWith(x,i));
      if(!t)throw Error("unmapped word "+w);
      i+=t.length;len++;
    }
    return len;
  }
  /** probability exactly one retained rune; minimum over incoming cipher state */
  function single(m,n){
    if(m===0)return n*.813*.187**(n-1);
    const V=29,Z=m-V,T=[[(V-1)/(m-1),Z/(m-1)],[V/(m-1),(Z-1)/(m-1)]];
    return Math.min(...[0,1].map(s=>{
      let a=[[0,0],[0,0]];a[0][s]=1;
      for(let i=0;i<n;i++){
        const b=[[0,0],[0,0]];
        for(let k=0;k<2;k++)for(let j=0;j<2;j++){
          if(k===0)b[1][0]+=a[k][j]*T[j][0];
          b[k][1]+=a[k][j]*T[j][1];
        }
        a=b;
      }
      return a[1][0]+a[1][1];
    }));
  }
  const rows=[];
  for(const [author,raw] of Object.entries(donors)){
    const W=(raw.toUpperCase().match(/[A-Z]+/g)||[]).map(length);
    if(W.length<N)throw Error("short donor");
    for(const m of [0,35,36,37]){
      const P=W.map(n=>single(m,n));
      let sum=P.slice(0,N).reduce((a,b)=>a+b,0),min=sum,at=0;
      for(let j=N;j<P.length;j++){
        sum+=P[j]-P[j-N];
        if(sum<min){min=sum;at=j-N+1;}
      }
      // Conservative slack for floating-point rolling sums.
      const lower=min-1e-7;
      if(lower<=X)throw Error("no discriminating lower mean");
      const t=Math.log(lower/X);
      const log10Fixed=(X*t+lower*(Math.exp(-t)-1))/Math.LN10;
      rows.push({author,m,rawWords:W.length,windows:W.length-N+1,minExpectedSingletons:min,
        start:at,log10Fixed,log10Union:log10Fixed+Math.log10(W.length-N+1)});
    }
  }
  return {runes:n,groups:N,singletons:X,hist,rows,
    unionBound:rows.reduce((p,r)=>p+10**r.log10Union,0)};
}
module.exports={experiment};
if(require.main===module){
  const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");
  const read=p=>fs.readFileSync(path.join(root,p),"utf8");
  console.log(JSON.stringify(experiment(
    JSON.parse(read("resources/liber-primus/lp2-corpus.json")),
    read("resources/transcriptions/lp2-image-corrected.txt"),
    {Shakespeare:read("resources/control/shakespeare_first300k.txt"),
     Gibran:read("resources/control/gibran_prophet_58585.txt"),
     Emerson:read("resources/control/emerson_essays_2944.txt")}),null,2));
}
