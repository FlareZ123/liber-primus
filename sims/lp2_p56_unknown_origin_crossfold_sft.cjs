'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw,emersonRaw,shakespeareRaw,gibranRaw){
  const corpus=JSON.parse(raw),Q=29,N=3302,starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const assert=(v,s)=>{if(!v)throw Error(s)};
  const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
  function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
  function permutation(q,rand,fix0=false){const a=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>(fix0?1:0);i--){const j=(fix0?1:0)+rand()%(i+(fix0?0:1));[a[i],a[j]]=[a[j],a[i]]}return a}

  const train=gp(emersonRaw),f=train.filter(x=>x===0).length/train.length;
  // Uniform consuming-symbol prior. Conditional on a visible F, the chance
  // that it was a transparent hold is f / (f+(1-f)/29).
  const hold=f/(f+(1-f)/Q);
  const primes=[];for(let x=2;primes.length<N+3009;x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
  const K=primes.map(x=>(x-1)%Q);
  function observations(C,width){
    const out=[];
    for(let s=0;s<C.length;s++){
      let p=[1];
      for(let i=0;i<Math.min(width,Math.floor(.75*C[s].length));i++){
        const c=C[s][i];if(c===0){const next=Array(p.length+1).fill(0);for(let j=0;j<p.length;j++){next[j]+=p[j]*(1-hold);next[j+1]+=p[j]*hold}p=next;continue}
        const weights=[];for(let h=0;h<p.length;h++)if(p[h]>1e-5)weights.push([i-h,p[h]]);
        out.push({fold:s%2,c,weights});
      }
    }
    return out;
  }
  // Each fold has separate empirical marginals. Cross-fold association,
  // rather than within-fold fit, avoids rewarding a flexible table for noise.
  function rank(C,width){
    const O=observations(C,width),N0=O.filter(x=>x.fold===0).length,N1=O.length-N0,counts=[new Float64Array(Q*Q),new Float64Array(Q*Q)],rows=[new Float64Array(Q),new Float64Array(Q)],cols=[new Float64Array(Q),new Float64Array(Q)];
    const out=[];
    for(let o=0;o<N;o++){
      for(let t=0;t<2;t++){counts[t].fill(0);rows[t].fill(0);cols[t].fill(0)}
      for(const x of O){const a=counts[x.fold],r=rows[x.fold],v=cols[x.fold],off=x.c*Q;for(const [j,w] of x.weights){const k=K[o+j];a[off+k]+=w;r[x.c]+=w;v[k]+=w}}
      let score=0;
      for(let c=1;c<Q;c++)for(let k=0;k<Q;k++){const i=c*Q+k,a=rows[0][c]*cols[0][k]/N0,b=rows[1][c]*cols[1][k]/N1;score+=(counts[0][i]-a)*(counts[1][i]-b)/Math.sqrt((a+1)*(b+1))}
      out.push({origin:o,score});
    }
    return {width,observations:O.length,ranked:out.sort((a,b)=>b.score-a.score)};
  }
  const source=[gp(shakespeareRaw),gp(gibranRaw)],settings=[[0,5000,137],[0,110000,911],[1,1000,1703],[1,35000,3200]],controls=[];
  for(let t=0;t<settings.length;t++){
    const [kind,offset,o]=settings[t],P=source[kind].slice(offset,offset+starts.at(-1)),rand=rng(0x22112650+t),A=permutation(Q,rand,true),B=permutation(Q,rand),inv=B.map((_,i)=>B.indexOf(i));assert(P.length===starts.at(-1),'control length');
    const C=starts.slice(0,-1).map((x,i)=>{let j=o;return P.slice(x,starts[i+1]).map(p=>p===0?0:inv[(A[p]+K[j++])%Q])});
    const ranked=[64,128,256,512].map(width=>{const z=rank(C,width),pos=z.ranked.findIndex(x=>x.origin===o);return{width,observations:z.observations,trueRank:pos+1,trueScore:z.ranked[pos].score,top:z.ranked.slice(0,16)}});
    controls.push({kind,offset,origin:o,ranked});
  }
  // Predeclared gate: exact origin is retained among top 16 by at least one
  // width, for all four plants. Only then screen the original.
  const gate=controls.every(c=>c.ranked.some(x=>x.trueRank<=16));
  const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices),C=starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1]));
  const original=gate?[64,128,256,512].map(w=>{const z=rank(C,w);return{width:w,observations:z.observations,top:z.ranked.slice(0,16)}}):null;
  return {model:'Shared unknown p56 consuming origin, arbitrary common alphabets, true literal F hold. Approximate conditional-F clock posterior under a uniform consuming-symbol prior; cross-fold conditional-shift association of first 75% prefixes. Candidate screen only.',hold,controls,gate,original};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(read('resources/liber-primus/lp2-corpus.json'),read('resources/control/emerson_essays_2944.txt'),read('resources/control/shakespeare_first300k.txt'),read('resources/control/gibran_prophet_58585.txt')),null,2))}
module.exports={study};
