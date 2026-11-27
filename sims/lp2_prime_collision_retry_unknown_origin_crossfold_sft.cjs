'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw,emersonRaw,shakespeareRaw,gibranRaw){
  const corpus=JSON.parse(raw),Q=29,N=3302,starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const assert=(v,s)=>{if(!v)throw Error(s)};
  const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
  function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
  function permutation(q,rand,fix0=false){const a=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>(fix0?1:0);i--){const j=(fix0?1:0)+rand()%(i+(fix0?0:1));[a[i],a[j]]=[a[j],a[i]]}return a}

  const rho=.81;
  // Approximate posterior over retry count conditioned on observed repeat status.
  const retry=rho/Q,retryOnRepeat=rho/(rho+Q*(1-rho));
  const primes=[];for(let x=2;primes.length<N+3400;x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
  const K=primes.map(x=>(x-1)%Q);
  function observations(C,width){
    const out=[];
    for(let s=0;s<C.length;s++){
      let p=[1];
      for(let i=0;i<Math.min(width,Math.floor(.75*C[s].length));i++){
        const c=C[s][i];
        if(i){const q=c===C[s][i-1]?retryOnRepeat:retry,next=Array(p.length+1).fill(0);for(let j=0;j<p.length;j++){next[j]+=p[j]*(1-q);next[j+1]+=p[j]*q}p=next}
        const weights=[];for(let h=0;h<p.length;h++)if(p[h]>1e-5)weights.push([i+h,p[h]]);
        out.push({fold:s%2,c,weights});
      }
    }
    return out;
  }
  // Each fold has separate empirical marginals. Cross-fold association,
  // rather than within-fold fit, avoids rewarding a flexible table for noise.
  function rank(C,width){
    const O=observations(C,width),counts=[new Float64Array(Q*Q),new Float64Array(Q*Q)],rows=[new Float64Array(Q),new Float64Array(Q)],cols=[new Float64Array(Q),new Float64Array(Q)];
    // Sum observation weights by fold, rune and relative cursor first.
    // This is exactly the same linear count statistic, much less repeated work.
    const w=Array.from({length:2*Q},()=>new Float64Array(2*width+1));
    for(const x of O)for(const [j,p] of x.weights)w[x.fold*Q+x.c][j]+=p;
    const sparse=w.map(v=>{const j=[],p=[];for(let i=0;i<v.length;i++)if(v[i]){j.push(i);p.push(v[i])}return{j:Int16Array.from(j),p:Float64Array.from(p)}});
    for(let t=0;t<2;t++)for(let c=0;c<Q;c++)rows[t][c]=w[t*Q+c].reduce((s,x)=>s+x,0);
    const N0=rows[0].reduce((s,x)=>s+x,0),N1=rows[1].reduce((s,x)=>s+x,0),out=[];
    for(let o=0;o<N;o++){
      for(let t=0;t<2;t++){counts[t].fill(0);cols[t].fill(0);for(let c=0;c<Q;c++){const a=counts[t],v=cols[t],off=c*Q,{j,p}=sparse[t*Q+c];for(let i=0;i<j.length;i++){const k=K[o+j[i]],x=p[i];a[off+k]+=x;v[k]+=x}}}
      let score=0;
      for(let c=0;c<Q;c++)for(let k=0;k<Q;k++){const i=c*Q+k,a=rows[0][c]*cols[0][k]/N0,b=rows[1][c]*cols[1][k]/N1;score+=(counts[0][i]-a)*(counts[1][i]-b)/Math.sqrt((a+1)*(b+1))}
      out.push({origin:o,score});
    }
    return {width,observations:O.length,ranked:out.sort((a,b)=>b.score-a.score)};
  }
  const source=[gp(shakespeareRaw),gp(gibranRaw)],settings=[[0,25000,137],[0,130000,911],[1,1500,1703],[1,35000,3200]],controls=[];
  for(let t=0;t<settings.length;t++){
    const [kind,offset,o]=settings[t],P=source[kind].slice(offset,offset+starts.at(-1)),rand=rng(0x27112760+t),A=permutation(Q,rand,false),B=permutation(Q,rand),inv=B.map((_,i)=>B.indexOf(i));assert(P.length===starts.at(-1),'control length');
    const C=starts.slice(0,-1).map((x,i)=>{let j=o,prev=-1;return P.slice(x,starts[i+1]).map(p=>{let c=inv[(A[p]+K[j])%Q];if(c===prev&&rand()/4294967296<rho)c=inv[(A[p]+K[++j])%Q];j++;prev=c;return c})});
    const ranked=[64,128,256,512].map(width=>{const z=rank(C,width),pos=z.ranked.findIndex(x=>x.origin===o);return{width,observations:z.observations,trueRank:pos+1,trueScore:z.ranked[pos].score,top:z.ranked.slice(0,16)}});
    controls.push({kind,offset,origin:o,ranked});
  }
  // Predeclared gate: exact origin is retained among top 16 by at least one
  // width, for all four plants. Only then screen the original.
  const gate=controls.every(c=>c.ranked.some(x=>x.trueRank<=16));
  const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices),C=starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1]));
  const original=gate?[64,128,256,512].map(w=>{const z=rank(C,w);return{width:w,observations:z.observations,top:z.ranked.slice(0,16)}}):null;
  return {model:'Shared unknown p56 consuming origin, arbitrary common alphabets, ordinary-consuming F, optional single collision retry rho=.81. Approximate collision-only retry clock posterior under a uniform collision probability prior; cross-fold conditional-shift association of first 75% prefixes. Candidate screen only.',retry,retryOnRepeat,controls,gate,original};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(read('resources/liber-primus/lp2-corpus.json'),read('resources/control/emerson_essays_2944.txt'),read('resources/control/shakespeare_first300k.txt'),read('resources/control/gibran_prophet_58585.txt')),null,2))}
module.exports={study};
