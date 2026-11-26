'use strict';
const fs=require('node:fs'),path=require('node:path');
function study(raw,donorRaw,projectionRaw){
  const corpus=JSON.parse(raw),projection=JSON.parse(projectionRaw),Q=29,N=3302,all=(1<<Q)-1;
  const assert=(v,s)=>{if(!v)throw Error(s)};
  const R=['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'],ri=new Map(R.map((r,i)=>[r,i]));
  function gp(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){let x=w.slice(i,i+2);if(!ri.has(x))x=w[i];out.push(ri.get(x));i+=x.length}}return out}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
  function permutation(q,rand,fix0=false){const a=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>(fix0?1:0);i--){const j=(fix0?1:0)+rand()%(i+(fix0?0:1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function match(dom,q){const owner=new Int16Array(q).fill(-1),order=Array.from({length:q},(_,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b]));function augment(c,seen){let m=dom[c];while(m){const b=m&-m,k=31-Math.clz32(b);m^=b;if(seen[k])continue;seen[k]=1;if(owner[k]<0||augment(owner[k],seen)){owner[k]=c;return true}}return false}for(const c of order)if(!augment(c,new Uint8Array(q)))return null;const beta=new Int16Array(q);for(let k=0;k<q;k++)beta[owner[k]]=k;return Array.from(beta)}
  function pop(x){let n=0;while(x){x&=x-1;n++}return n}
  function bits(K,q){const M=Array(q).fill(0n);for(let j=K.length-1;j>=0;j--){for(let k=0;k<q;k++)M[k]<<=1n;M[K[j]]|=1n}return M}

  // Restrict each domain to edges belonging to at least one perfect matching.
  function supported(D,q){
    const B=match(D,q);if(!B)return null;
    const own=new Int8Array(q),reach=new Uint32Array(q);
    for(let c=0;c<q;c++)own[B[c]]=c;
    for(let c=0;c<q;c++){let m=D[c];while(m){const b=m&-m,k=31-Math.clz32(b);m^=b;reach[c]|=1<<own[k]}}
    for(let k=0;k<q;k++)for(let c=0;c<q;c++)if(reach[c]&(1<<k))reach[c]|=reach[k];
    const A=D.slice();for(let c=0;c<q;c++){let m=D[c];while(m){const b=m&-m,k=31-Math.clz32(b);m^=b;if(!(reach[own[k]]&(1<<c)))A[c]&=~b}}
    return {D:A,B};
  }
  function exactReach(C,K,B,o){let S=new Set([o]);for(const z of C){let T=new Set();for(const j of S){if(z===0)T.add(j);if(B[z]!==K[j])T.add(j+1)}S=T;if(!S.size)return false}return true}
  function alternatives(C,K,o,q,maxF){const count=C.filter(z=>z===0).length;if(count>maxF)return null;
    const out=[],full=(1<<q)-1;
    for(let m=0;m<(1<<count);m++){const D=new Uint32Array(q).fill(full);let f=0,j=o;
      for(const z of C){if(z===0&&((m>>f++)&1))continue;D[z]&=~(1<<K[j++]);}
      out.push(D);
    }
    return out;
  }
  function meet(A,B){return A.map((x,i)=>x&B[i])}
  function equal(A,B){return A.every((x,i)=>x===B[i])}
  function subset(A,B){return A.every((x,i)=>(x&B[i])===x)}
  function prefixDomains(rows,K,o,q){const D=new Uint32Array(q).fill((1<<q)-1);for(const C of rows)for(let i=0;i<C.length&&C[i]!==0;i++)D[C[i]]&=~(1<<K[o+i]);return D}
  // Existential disjunction per page: exactly one whole hold path must admit
  // the same outer bijection. Dominated alternatives can be discarded.
  function solve(rows,K,o,q,maxF=4,cap=10000){
    let calls=0,branches=0,capped=false,maxDepth=0;
    const paths=rows.map((C,i)=>({i,A:alternatives(C,K,o,q,maxF)})).filter(x=>x.A);
    const init=supported(prefixDomains(rows,K,o,q),q);if(!init)return{status:'UNSAT',calls,branches,pages:paths.length,maxDepth};
    function recurse(D,todo,depth){
      if(++calls>cap){capped=true;return null}maxDepth=Math.max(maxDepth,depth);
      for(;;){
        let best=null,rest=[],forced=false;
        for(const item of todo){
          const A=[];
          for(const P of item.A){
            const T=meet(D,P);if(equal(T,D)){A.length=0;A.push(D);break}
            const S=supported(T,q);if(!S)continue;
            if(A.some(x=>subset(S.D,x)))continue;
            for(let i=A.length-1;i>=0;i--)if(subset(A[i],S.D))A.splice(i,1);
            A.push(S.D);
          }
          if(!A.length)return null;
          if(A.length===1){
            if(equal(A[0],D))continue;
            D=A[0];todo=todo.filter(x=>x.i!==item.i);forced=true;break;
          }
          const item2={i:item.i,A};rest.push(item2);
          const cost=A.length*100000+A.reduce((s,d)=>s+d.reduce((v,m)=>v+pop(m),0),0);
          if(!best||cost<best.cost)best={...item2,cost};
        }
        if(forced)continue;
        if(!best){const B=match(D,q);assert(B,'leaf matching');return {B,D:Array.from(D)}}
        for(const S of best.A){branches++;const answer=recurse(S,rest.filter(x=>x.i!==best.i),depth+1);if(answer)return answer;if(capped)return null}
        return null;
      }
    }
    const answer=recurse(init.D,paths,0);if(answer)assert(paths.every(x=>exactReach(rows[x.i],K,answer.B,o)),'leaf failed processed page');
    return{status:answer?'SAT':capped?'UNKNOWN':'UNSAT',calls,branches,pages:paths.length,maxDepth,witness:answer?.B??null,witnessAll:answer?rows.every(C=>exactReach(C,K,answer.B,o)):false};
  }
  // Truncate each full chapter immediately before its (maxF+1)st F.
  // A full solution implies a solution of these unchanged prefixes.
  function trunc(C,maxF){let f=0;for(let i=0;i<C.length;i++)if(C[i]===0&&++f>maxF)return C.slice(0,i);return C}
  const primes=[];for(let x=2;primes.length<N+3009;x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
  const K=primes.map(x=>(x-1)%Q),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],tape=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  const chapters=starts.slice(0,-1).map((x,i)=>tape.slice(x,starts[i+1]));
  const P=gp(donorRaw).slice(190000,202956),rnd=rng(0x26112691),A=permutation(Q,rnd,true),B=permutation(Q,rnd),inv=B.map((_,i)=>B.indexOf(i)),o=911;let offset=0;
  const plant=chapters.map(row=>{let j=o;const plain=P.slice(offset,offset+row.length);offset+=row.length;return plain.map(p=>p===0?0:inv[(A[p]+K[j++])%Q])});
  let live=Array.from({length:N},(_,i)=>i);const stages=[];
  for(const maxF of [4,6]){
    const rows=chapters.map(C=>trunc(C,maxF)),controlRows=plant.map(C=>trunc(C,maxF));
    const control=solve(controlRows,K,o,Q,maxF,2000);assert(control.status!=='UNSAT','true plant origin lost');
    const results=live.map(origin=>({origin,...solve(rows,K,origin,Q,maxF,2000)}));
    live=results.filter(x=>x.status!=='UNSAT').map(x=>x.origin);
    stages.push({maxF,lengths:rows.map(x=>x.length),controlLengths:controlRows.map(x=>x.length),control,results});
    if(!live.length)break;
  }
  return{model:'Exact joint complete hold-path disjunction over nine chapter prefixes, each cut just before the next visible F; common origin, shared outer permutation. UNSAT rejects full chapters; SAT or UNKNOWN retains origin.',stages};
}

if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(read('resources/liber-primus/lp2-corpus.json'),read('resources/control/shakespeare_first300k.txt'),read('im-results/lp2-p56-shared-origin-outer-projection-output.json')),null,2))}
module.exports={study};
