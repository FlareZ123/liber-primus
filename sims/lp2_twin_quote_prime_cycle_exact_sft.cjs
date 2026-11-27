'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(corpus,native){
  const assert=(x,msg)=>{if(!x)throw Error(msg)},m=(x)=>(x%29+29)%29;
  const tape=corpus.pages.slice(0,56).flatMap(p=>p.indices);
  assert(tape.length===12956,"source length");
  const a=tape.slice(9811,9832),b=tape.slice(12522,12543);
  assert(a.join(",")==="0,23,4,28,6,13,3,12,3,19,28,17,11,27,15,19,0,16,0,25,3","p40 anchor");
  assert(b.join(",")==="28,14,26,12,4,3,13,15,5,25,19,12,9,11,18,0,15,18,0,24,21","p53 anchor");
  const bound=12956,limit=200000,composite=new Uint8Array(limit+1),primes=[];
  for(let i=2;i<=limit;i++)if(!composite[i]){primes.push(i);if(i*i<=limit)for(let j=i*i;j<=limit;j+=i)composite[j]=1}
  assert(primes.length>bound+21&&primes.slice(0,5).join(",")==="2,3,5,7,11","prime schedule");
  const shift=primes.map(p=>m(p-1));
  /** Recover all local cyclic keys directly from the two original ciphertexts at each prime origin. */
  function recover(X,Y,q,ps,s,fhold){
    const Z=X.map((x,i)=>x===0&&Y[i]===0?i:-1).filter(i=>i>=0);
    assert(Z.length<=16,"explicit F mask bound");
    let out=[];
    for(let mask=0;mask<(fhold?2**Z.length:1);mask++){
      const held=new Set(Z.filter((_,i)=>mask&(1<<i)));
      for(let origin=0;origin<=bound;origin++){
        const K=Array(q).fill(null),P=[];let j=0,ok=true;
        for(let i=0;i<X.length;i++){
          if(held.has(i)){P.push(0);continue}
          let p=m(X[i]-ps*shift[origin+j]);
          if(fhold&&p===0){ok=false;break}
          let k=m(Y[i]-s*p),h=j%q;
          if(K[h]!==null&&K[h]!==k){ok=false;break}
          K[h]=k;P.push(p);j++;
        }
        if(!ok)continue;
        assert(K.every(k=>k!==null),"incomplete cyclic key");
        let clock=0;
        for(let i=0;i<P.length;i++){if(held.has(i)){assert(X[i]===0&&Y[i]===0,"F replay");continue}
          assert(m(P[i]+ps*shift[origin+clock])===X[i]&&m(s*P[i]+K[clock%q])===Y[i],"replay");clock++;
        }
        out.push({origin,K,P,held:[...held],clock});
      }
    }
    return out;
  }
  const rows=[];
  for(let [side,X,Y] of [[40,a,b],[53,b,a]])for(let q of [1,8,13])for(let ps of [1,-1])for(let s of [1,-1])for(let fhold of [false,true]){
    const candidates=recover(X,Y,q,ps,s,fhold);
    rows.push({side,q,ps,s,fhold,candidates});
  }
  const P=native.sections.flatMap(x=>[...x.source_text].filter(r=>corpus.runes.includes(r)).map(r=>corpus.runes.indexOf(r))).slice(8,29);
  let controls=[];
  for(let q of [8,13])for(let ps of [1,-1])for(let s of [1,-1]){
    const origin=137+q, K=Array.from({length:q},(_,i)=>m(3*i*i+7*i+8));let j=0,X=[],Y=[];
    for(let p of P){if(p===0){X.push(0);Y.push(0);continue}X.push(m(p+ps*shift[origin+j]));Y.push(m(s*p+K[j%q]));j++}
    const hits=recover(X,Y,q,ps,s,true);
    assert(hits.some(h=>h.origin===origin&&h.K.join(",")===K.join(",")&&h.P.join(",")===P.join(",")),"planted solution missing");
    controls.push({q,ps,s,origin,candidates:hits.length});
  }
  let assignments=rows.reduce((sum,r)=>sum+(bound+1)*(r.fhold?2:1),0);
  return {bound,assignments,rows,controls};
}
const root=path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
