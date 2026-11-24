'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,allowOriginal=false) {
  const check=(x,m)=>{if(!x)throw Error(m)};
  const mod=(x,q)=>((x%q)+q)%q;
  const A=41,N=160,S=80;
  const idx=new Map(gp.translit.map((s,i)=>[s,i]));
  const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body markers");return s.slice(a,b)}
  function chunks(s){
    const out=[];let words=[],prev=0;
    for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){
      if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}
      words.push(norm(m[0]));prev=m.index+m[0].length;
    }
    if(words.length)out.push(words.join(" "));
    return out;
  }
  const names=["Shakespeare","Emerson","Gibran"];
  const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")];
  function graph(s){
    const L=s.length, f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);
    for(let i=0;i<L;i++){
      let p=i;while(s[p]===" ")p++;
      for(let d=1;d<=2&&p+d<=L;d++){
        const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d]);
      }
    }
    for(let i=1;i<=L;i++){
      let p=i;while(s[p-1]===" ")p--;
      for(let d=1;d<=2&&p-d>=0;d++){
        const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d]);
      }
    }
    const rem=Array(L+1).fill(0);for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");
    return {s,L,f,b,rem};
  }
  const pairs=[];
  for(let j=0;j<texts.length;j++){
    const chunksj=chunks(texts[j]);
    for(let i=0;i+1<chunksj.length;i++){
      const l=chunksj[i],r=chunksj[i+1];
      if(l.replace(/ /g,"").length<A||r.replace(/ /g,"").length<N-A)continue;
      pairs.push({source:names[j],stop:i+1,left:graph(l),right:graph(r)});
    }
  }
  function matchF(g,C,begin,end,key,pos,phase,callback){
    const q=key.length,P=[];
    function rec(i,p,h){
      if(i===end){callback(p,h,P.slice());return}
      if(g.rem[p]<end-i)return;
      for(const [v,n] of g.f[p]){
        if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,n,h);P.pop()}
        else if(mod(v+key[h],29)===C[i]){P.push(v);rec(i+1,n,(h+1)%q);P.pop()}
      }
    }
    rec(begin,pos,phase);
  }
  function scan(C){
    check(C.length===S,"prefix only");
    const out=[];let leftPass=0;
    for(const pair of pairs)for(const q of [8,13]){
      const K=Array(q).fill(-1),R=[];
      function rec(i,p,h){
        if(i<0){
          if(K.includes(-1))throw Error("too few consuming symbols in prefix");
          leftPass++;
          const L=R.slice().reverse();
          matchF(pair.right,C,A,S,K,0,0,(pos,phase,P)=>{
            if(pair.right.rem[pos]>=N-S)out.push({source:pair.source,stop:pair.stop,q,key:K.slice(),pair,pos,phase,leftStart:p,plain:L.concat(P)});
          });
          return;
        }
        for(const [v,n] of pair.left.b[p]){
          if(v===0){if(C[i]!==0)continue;R.push(v);rec(i-1,n,h);R.pop();continue}
          const nh=mod(h-1,q),k=mod(C[i]-v,29),old=K[nh];
          if(old!==-1&&old!==k)continue;
          K[nh]=k;R.push(v);rec(i-1,n,nh);R.pop();K[nh]=old;
        }
      }
      rec(A-1,pair.left.L,0);
    }
    return {out,leftPass};
  }
  function enc(P,K,phase=0){return P.map(v=>v===0?0:mod(v+K[phase++%K.length],29))}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function spelling(g,random){
    const out=[];let p=0,split=0;
    while(g.rem[p]){const opts=g.f[p];check(opts.length,"unspellable "+g.s.slice(p,p+15));const [v,n]=opts[Math.floor(random()*opts.length)];if(opts.length>1&&gp.translit[v].length===1)split++;out.push(v);p=n}
    return {out,split};
  }
  function countPaths(g,p,n,memo=new Map()){
    if(!n)return 1n;if(g.rem[p]<n)return 0n;
    const k=p+":"+n;if(memo.has(k))return memo.get(k);
    let sum=0n;for(const [,np] of g.f[p])sum+=countPaths(g,np,n-1,memo);
    memo.set(k,sum);return sum;
  }
  function run(C,truth=null){
    const {out,leftPass}=scan(C.slice(0,S));
    // Prefix states are frozen before any suffix comparison.
    const unique=new Set(out.map(o=>[o.source,o.stop,o.q,o.key.join(",")].join(":")));
    let pred=0n;for(const o of out)pred+=countPaths(o.pair.right,o.pos,N-S);
    const survivors=[];
    for(const o of out)matchF(o.pair.right,C,S,N,o.key,o.pos,o.phase,(pos,phase,P)=>{
      const plain=o.plain.concat(P);
      const before=plain.slice(0,A).filter(v=>v!==0).length;
      check(enc(plain,o.key,mod(-before,o.q)).join()===C.join(),"full replay");
      survivors.push({source:o.source,stop:o.stop,q:o.q,key:o.key,plain,sourceEnd:pos,phase});
    });
    return {leftPass,prefixPaths:out.length,prefixSourceKeys:unique.size,predictionPaths:pred.toString(),suffixMatches:survivors.length,
      recovered:truth?survivors.some(o=>o.source===truth.source&&o.stop===truth.stop&&o.q===truth.q&&o.key.join()===truth.key.join()&&o.plain.join()===truth.plain.join()):null,
      prefixCandidates:out.slice(0,20).map(({source,stop,q,key,pos,phase,leftStart,plain})=>({source,stop,q,key,pos,phase,leftStart,plain})),
      fullCandidates:survivors.slice(0,20)};
  }
  const controls=[],nulls=[];
  for(let j=0;j<3;j++)for(let k=0;k<4;k++){
    const random=rng((0x490f82a7^Math.imul(4*j+k+1,0x9e3779b9))>>>0);
    const pool=pairs.filter(p=>p.source===names[j]);
    let pair,L,R;
    for(let tries=0;tries<pool.length;tries++){
      pair=pool[Math.floor(random()*pool.length)];L=spelling(pair.left,random);R=spelling(pair.right,random);
      if(L.out.length>=A&&R.out.length>=N-A&&L.split+R.split>0)break;
    }
    check(L.out.length>=A&&R.out.length>=N-A,"plant length");
    const plain=L.out.slice(-A).concat(R.out.slice(0,N-A)),q=k%2===0?8:13;
    const key=Array.from({length:q},()=>Math.floor(random()*29));
    const before=plain.slice(0,A).filter(v=>v!==0).length,phase=mod(-before,q);
    const C=enc(plain,key,phase);
    // Require actual non-greedy spelling in the selected physical window, not just elsewhere in sentence.
    const nonGreedy=plain.some((v,i)=>i+1<plain.length&&idx.has(gp.translit[v]+gp.translit[plain[i+1]]));
    const truth={source:pair.source,stop:pair.stop,q,key,plain};
    const result=run(C,truth);
    controls.push({id:j*4+k,truth,nonGreedy,...result});
    const pad=Array.from({length:N},()=>Math.floor(random()*29));
    const NC=enc(plain,pad);
    nulls.push({id:j*4+k,...run(NC)});
  }
  const gate={correct:controls.filter(c=>c.recovered).length,uniquePrefix:controls.filter(c=>c.prefixSourceKeys===1).length,nonGreedy:controls.filter(c=>c.nonGreedy).length,falsePrefix:nulls.filter(c=>c.prefixPaths).length,falseFull:nulls.filter(c=>c.suffixMatches).length};
  gate.pass=gate.correct===controls.length&&gate.uniquePrefix===controls.length&&gate.nonGreedy>=6&&gate.falsePrefix===0;
  let original=null;
  if(allowOriginal&&gate.pass){
    const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);
    check(U.length===12956,"LP2 size");
    const C=U.slice(10279,10439);check(C.length===N,"quote size");
    original=run(C);
  }
  return {method:{prefix:S,stop:A,total:N,sources:names,pairs:pairs.length,periods:[8,13],phase:"key position 0 at internal stop, reverse before stop"},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));
