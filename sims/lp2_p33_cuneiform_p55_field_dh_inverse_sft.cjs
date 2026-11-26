'use strict';
/** Source-fixed p33/p55 conditional DH inverse. Run from repository root. */
const fs=require('node:fs');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
function run(corpus) {
  /** @param {boolean} ok @param {string} message */
  function check(ok,message){if(!ok)throw Error(message)}
  /** @param {bigint} b @param {bigint} e @param {bigint} p */
  function pow(b,e,p){let x=1n;while(e){if(e&1n)x=x*b%p;b=b*b%p;e>>=1n;}return x}
  /** @param {number[]} ds */
  const encode=ds=>ds.reduce((n,d)=>n*29n+BigInt(d),0n);
  /** @param {bigint} n */
  function decode(n){let a=[];do{a.unshift(Number(n%29n));n/=29n}while(n);return a}
  /** @param {number[]} xs */
  const render=xs=>xs.map(i=>corpus.translit[i]).join(" ");
  const p55=corpus.pages.find(p=>p.page===55).indices;
  const lengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
  let i=1;const inner=[],shell=[];
  for(const n of lengths){const w=p55.slice(i,i+n);inner.push(...w.slice(1,-1));shell.push(w[0],w[n-1]);i+=n}
  check(i===76&&inner.length===43&&shell.length===32,"source frame");
  const N=encode(inner),E=encode(shell);
  check(N%8n===0n&&E%43n===0n,"source factors");
  const p=N/8n,g=E/43n;
  check(p===63755441409934721069036418908763882578170591536653256311514221n,"source prime");
  check(g===1268532719737981052966698570711268391040527137n,"source generator");
  const a=1033n,b=3301n;
  check(a===43n*24n+1n&&b===43n*76n+33n,"geometry");
  const A=pow(g,a,p),B=pow(g,b,p),K=pow(A,b,p);
  check(K===pow(B,a,p)&&K===pow(g,a*b,p),"DH agreement");
  const key=decode(K);
  /** @param {number[]} plain @param {number[]} key @param {boolean} hold */
  function forward(plain,key,hold){let j=0;return plain.map(x=>hold&&x===0?0:(x+key[j++%key.length])%29)}
  /** Exact DP for all historical literal-F histories, merging only clock-equivalent states.
   * @param {number[]} cipher @param {number[]} key */
  function inverse(cipher,key){let states=new Map([[0,{count:1n,word:[]}]]);
    for(let pos=0;pos<cipher.length;pos++){
      const c=cipher[pos],next=new Map();
      for(const [j,{count,word}] of states){
        const candidates=[];
        if(c===0)candidates.push([j,0]);
        const x=(c-key[j]+29)%29;
        if(x!==0)candidates.push([(j+1)%key.length,x]);
        for(const [k,x] of candidates){const old=next.get(k);if(old)old.count+=count;else next.set(k,{count,word:[...word,x]})}
      }
      if(!next.size)return {failure:pos,cipherRune:c,liveBefore:[...states].map(([phase,o])=>({phase,shift:key[phase],count:o.count.toString()})),count:"0",example:null};
      states=next;
    }
    const example=states.values().next().value.word;
    check(forward(example,key,true).every((x,j)=>x===cipher[j]),"replay");
    return {failure:null,count:[...states.values()].reduce((n,o)=>n+o.count,0n).toString(),example:render(example)};
  }
  const target=corpus.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.page===33?p.indices.slice(99):p.page===39?p.indices.slice(0,119):p.indices);
  const control=corpus.pages.find(p=>p.page===57).indices;
  const controlCipher=forward(control,key,true);
  const controlInverse=inverse(controlCipher,key);
  check(controlInverse.failure===null,"native control recovery path");
  // Directly retain the known plaintext path under the declared exact transition relation.
  let phase=0;
  for(let i=0;i<control.length;i++){const x=control[i],c=controlCipher[i];check(x===0?c===0:c===(x+key[phase])%29,"control transition");if(x!==0)phase=(phase+1)%key.length}
  const ordinary=target.map((c,i)=>(c-key[i%key.length]+29)%29);
  check(forward(ordinary,key,false).every((x,j)=>x===target[j]),"ordinary replay");
  const ioc=xs=>{const f=Array(29).fill(0);xs.forEach(x=>f[x]++);return f.reduce((s,x)=>s+x*(x-1),0)/(xs.length*(xs.length-1))};
  return {source:"p55 local 16 complete groups; p33 cuneiform 1033/3301 as hypothesized private exponents",p:p.toString(),g:g.toString(),a:a.toString(),b:b.toString(),A:A.toString(),B:B.toString(),K:K.toString(),key,target:{first:[33,99],lastExclusive:[39,119],length:target.length,rawIoc:ioc(target),strict:inverse(target,key),ordinary:{ioc:ioc(ordinary),first115:render(ordinary.slice(0,115)),replay:true}},control:{length:control.length,count:controlInverse.count,knownPathRetained:true,example:controlInverse.example}};
}
console.log(JSON.stringify(run(corpus),null,2));
