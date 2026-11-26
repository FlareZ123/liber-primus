'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw,donorRaw){
  const corpus=JSON.parse(raw),Q=29,N=3302,starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],all=(1<<Q)-1;
  const assert=(v,s)=>{if(!v)throw Error(s)};
  const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
  function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
  function permutation(q,rand,fix0=false){const a=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>(fix0?1:0);i--){const j=(fix0?1:0)+rand()%(i+(fix0?0:1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function match(dom,q){const owner=new Int16Array(q).fill(-1),order=Array.from({length:q},(_,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b]));function augment(c,seen){let m=dom[c];while(m){const b=m&-m,k=31-Math.clz32(b);m^=b;if(seen[k])continue;seen[k]=1;if(owner[k]<0||augment(owner[k],seen)){owner[k]=c;return true}}return false}for(const c of order)if(!augment(c,new Uint8Array(q)))return null;const beta=new Int16Array(q);for(let k=0;k<q;k++)beta[owner[k]]=k;return Array.from(beta)}
  function pop(x){let n=0;while(x){x&=x-1;n++}return n}
  function bits(K,q){const M=Array(q).fill(0n);for(let j=K.length-1;j>=0;j--){for(let k=0;k<q;k++)M[k]<<=1n;M[K[j]]|=1n}return M}
  // Every unobserved plaintext F is a hold; consuming plaintext F is
  // impossible. Normalize alpha(F)=0, even if beta(F) is not zero.
  // Backwards legality for a partial outer map beta(c)=k:
  // all legal final cursors, inverse consume (right shift), or visible-F hold.
  // Skip gaps in which neither c nor 0 occurs: consumption is unconditional.
  function events(C,c){const es=[];for(let i=0;i<C.length;i++)if(C[i]===0||C[i]===c)es.push([i,C[i]]);return es}
  function support(C,es,c,k,M,n){let R=(1n<<BigInt(n+C.length))-1n,end=C.length;for(let j=es.length-1;j>=0;j--){const [i,z]=es[j],gap=end-i-1;if(gap)R>>=BigInt(gap);let consume=R>>1n;if(z===c)consume&=~M[k];R=z===0?R|consume:consume;end=i;if(!R)break}if(end)R>>=BigInt(end);return R&((1n<<BigInt(n))-1n)}
  function direct(C,K,c,k,o){let S=new Set([o]);for(const z of C){let T=new Set();for(const j of S){if(z===0)T.add(j);if(z!==c||K[j]!==k)T.add(j+1)}S=T}return S.size>0}
  function exactReach(C,K,B,o){let S=new Set([o]);for(const z of C){let T=new Set();for(const j of S){if(z===0)T.add(j);if(B[z]!==K[j])T.add(j+1)}S=T;if(!S.size)return false}return true}
  const rand=rng(0x330129);let small=0;
  for(let t=0;t<30;t++){const q=4,n=13,C=Array.from({length:6+t%12},()=>rand()%q),K=Array.from({length:n+C.length},()=>rand()%q),M=bits(K,q);
    for(let c=0;c<q;c++){const es=events(C,c);for(let k=0;k<q;k++){const z=support(C,es,c,k,M,n);for(let o=0;o<n;o++){assert(Boolean(z&(1n<<BigInt(o)))===direct(C,K,c,k,o),'backward all-origin support mismatch');small++}}}}
  function run(rows,K,n,q=Q,truth=null){const full=(1<<q)-1,D=new Uint32Array(n*q).fill(full),prefix=[];
    for(let o=0;o<n;o++){const d=D.subarray(o*q,(o+1)*q);for(const row of rows){for(let i=0;i<row.length&&row[i]!==0;i++)d[row[i]]&=~(1<<K[o+i])}if(match(d,q))prefix.push(o)}
    const prefixSet=new Set(prefix);
    if(truth){assert(prefixSet.has(truth.o),'true origin lost at prefix Hall');for(let c=0;c<q;c++)assert(D[truth.o*q+c]&(1<<truth.B[c]),'true beta lost prefix')}
    const M=bits(K,q),E=rows.map(row=>Array.from({length:q},(_,c)=>events(row,c)));
    const base=prefix.reduce((v,o)=>v|(1n<<BigInt(o)),0n);
    let evaluated=0;
    if(prefix.length){
      for(let c=0;c<q;c++)for(let k=0;k<q;k++){
        let live=base;
        for(let j=0;j<rows.length&&live;j++)live&=support(rows[j],E[j][c],c,k,M,n);
        // Convert one support bitset to a string once; avoid repeated BigInt shifts.
        const s=live.toString(2);for(const o of prefix)if(s[s.length-1-o]!=='1')D[o*q+c]&=~(1<<k);
        evaluated++;
      }
    }
    const survivors=[];
    for(const o of prefix){const d=D.subarray(o*q,(o+1)*q),B=match(d,q);if(B)survivors.push({origin:o,domains:Array.from(d),domainSizes:Array.from(d,pop),witnessLegal:rows.every(row=>exactReach(row,K,B,o)),witness:B})}
    if(truth){const t=survivors.find(x=>x.origin===truth.o);assert(t,'true origin lost after unary support Hall');assert(t.domains.every((m,c)=>m&(1<<truth.B[c])),'true beta lost after projection');assert(rows.every(row=>exactReach(row,K,truth.B,truth.o)),'plant replay legality')}
    return {prefixHall:prefix.length,prefixOrigins:prefix,fullUnaryHall:survivors.length,survivors,evaluated,truthOrigin:truth?.o??null};
  }
  const primes=[];for(let x=2;primes.length<N+3009;x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
  const K=primes.map(x=>(x-1)%Q),pages=corpus.pages.slice(0,56).map(p=>p.indices).filter(x=>x.length),tape=pages.flat();assert(tape.length===12956,'source length');
  const scopes=[['page',pages],['chapter',starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1]))]];
  const P=gp(donorRaw).slice(190000,202956);assert(P.length===12956,'donor length');
  const results=[];
  for(let t=0;t<scopes.length;t++){const [name,rows]=scopes[t],random=rng(0x26112690+t),A=permutation(Q,random,true),B=permutation(Q,random),inv=B.map((_,i)=>B.indexOf(i)),o=t?911:137;let offset=0;
    const plant=rows.map(row=>{let j=o;const plain=P.slice(offset,offset+row.length);offset+=row.length;return plain.map(p=>p===0?0:inv[(A[p]+K[j++])%Q])});
    const control=run(plant,K,N,Q,{o,B}),original=run(rows,K,N);
    results.push({name,lengths:rows.map(x=>x.length),control,original});
  }
  return {model:'authentic p56 prime-minus-one; shared unknown initial prime index 0..3301 at every physical page or illustrated chapter, arbitrary two fixed GP29 alphabets, literal F holds; exact unary projection and necessary all-different matching, not full joint SAT',small,results};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(read('resources/liber-primus/lp2-corpus.json'),read('resources/control/shakespeare_first300k.txt')),null,2))}
module.exports={study};
