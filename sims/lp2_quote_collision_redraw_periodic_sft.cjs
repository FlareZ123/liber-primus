'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,allowOriginal=false,many=false) {
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

  // Reverse at the original internal full stop, accounting for every
  // one-redraw/transparent-F alignment and all source tokenizations.
  function match(g,C,begin,end,key,pos,phase,prev0,callback){
    const q=key.length,P=[];
    function rec(i,p,h){
      if(i===end){callback(p,h,P.slice());return}
      if(g.rem[p]<end-i)return;
      const prev=i?C[i-1]:prev0;
      for(const [v,n] of g.f[p]){
        if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,n,h);P.pop();continue}
        let nh=(h+1)%q,a=mod(v+key[h],29);
        if(a===prev){let draws=1;do{a=mod(v+key[nh],29);nh=(nh+1)%q;draws++;}while(many&&a===prev&&draws<q);if(many&&a===prev)continue;}
        if(a===C[i]){P.push(v);rec(i+1,n,nh);P.pop();}
      }
    }
    rec(begin,pos,phase);
  }
  function scan(C,prev0,periods=[8,13]){
    check(C.length===S,"prefix only");
    const out=[];let leftPass=0,nodes=0,assignments=0;
    for(const pair of pairs)for(const q of periods){
      const K=Array(q).fill(-1),R=[];
      function rec(i,p,h){
        nodes++;
        if(i<0){
          if(K.includes(-1))throw Error("too few consuming symbols");
          leftPass++;
          const L=R.slice().reverse();
          match(pair.right,C,A,S,K,0,0,prev0,(pos,phase,P)=>{
            if(pair.right.rem[pos]>=N-S)out.push({source:pair.source,stop:pair.stop,q,key:K.slice(),pair,pos,phase,leftStart:p,plain:L.concat(P)});
          });
          return;
        }
        if(p<0)return;
        const prev=i?C[i-1]:prev0;
        for(const [v,n] of pair.left.b[p]){
          if(v===0){if(C[i]!==0)continue;R.push(v);rec(i-1,n,h);R.pop();continue}
          const j=mod(h-1,q),k=mod(C[i]-v,29),old=K[j];
          if(old!==-1&&old!==k)continue;
          K[j]=k;R.push(v);
          if(C[i]!==prev){assignments++;rec(i-1,n,j);}
          if(prev>=0&&(!many||C[i]!==prev)){
            const z=mod(prev-v,29),changed=[];
            for(let retry=1;retry<=(many?q-1:1);retry++){
              const t=mod(h-1-retry,q),old2=K[t];
              if(old2!==-1&&old2!==z)break;
              K[t]=z;changed.push([t,old2]);assignments++;rec(i-1,n,t);
            }
            for(const [t,old2] of changed)K[t]=old2;
          }
          R.pop();K[j]=old;
        }
      }
      rec(A-1,pair.left.L,0);
    }
    return {out,leftPass,nodes,assignments};
  }
  function enc(P,K,phase=0,prev=-1){const C=[];let skips=0,holds=0,used=0,maxSkips=0;for(const v of P){
    if(v===0){C.push(0);prev=0;holds++;continue;}
    let a=mod(v+K[phase++%K.length],29);used++;
    if(a===prev){let local=0;do{a=mod(v+K[phase++%K.length],29);used++;skips++;local++;}while(many&&a===prev&&local<K.length-1);if(many&&a===prev)throw Error('all-cycle collision');maxSkips=Math.max(maxSkips,local);}
    C.push(a);prev=a;
  }return {C,used,skips,holds,maxSkips,phase:phase%K.length,prev};}
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function spelling(g,random){
    const out=[];let p=0;const splits=[];
    while(g.rem[p]){const opts=g.f[p];check(opts.length,"unspellable");const [v,n]=opts[Math.floor(random()*opts.length)];if(opts.length>1&&gp.translit[v].length===1)splits.push(out.length);out.push(v);p=n}
    return {out,splits};
  }
  function countPaths(g,p,n,memo=new Map()){
    if(!n)return 1n;if(g.rem[p]<n)return 0n;
    const k=p+":"+n;if(memo.has(k))return memo.get(k);
    let sum=0n;for(const [,np] of g.f[p])sum+=countPaths(g,np,n-1,memo);
    memo.set(k,sum);return sum;
  }
  function run(C,prev0,truth=null){
    const {out,leftPass,nodes,assignments}=scan(C.slice(0,S),prev0);
    const unique=new Set(out.map(o=>[o.source,o.stop,o.q,o.key.join(",")].join(":")));
    let pred=0n;for(const o of out)pred+=countPaths(o.pair.right,o.pos,N-S);
    const survivors=[];
    for(const o of out)match(o.pair.right,C,S,N,o.key,o.pos,o.phase,prev0,(pos,phase,P)=>{
      const plain=o.plain.concat(P);const startPhases=[];
      for(let h=0;h<o.q;h++){const left=enc(plain.slice(0,A),o.key,h,prev0);if(left.phase===0&&left.C.join()===C.slice(0,A).join()&&enc(plain,o.key,h,prev0).C.join()===C.join())startPhases.push(h);}
      check(startPhases.length,"full replay");
      survivors.push({source:o.source,stop:o.stop,q:o.q,key:o.key,plain,sourceEnd:pos,phase,startPhases});
    });
    return {leftPass,nodes,assignments,prefixPaths:out.length,prefixSourceKeys:unique.size,predictionPaths:pred.toString(),suffixMatches:survivors.length,
      recovered:truth?survivors.some(o=>o.source===truth.source&&o.stop===truth.stop&&o.q===truth.q&&o.key.join()===truth.key.join()&&o.plain.join()===truth.plain.join()):null,
      prefixCandidates:out.slice(0,20).map(({source,stop,q,key,pos,phase,leftStart,plain})=>({source,stop,q,key,pos,phase,leftStart,plain})),fullCandidates:survivors.slice(0,20)};
  }
  const controls=[],nulls=[];
  for(let j=0;j<3;j++)for(let k=0;k<2;k++){
    const random=rng(((many?0x25c02225:0x25c01115)^Math.imul(2*j+k+1,0x9e3779b9))>>>0);
    const pool=pairs.filter(p=>p.source===names[j]);let pair,L,R,plain,q,key,prev0,left,all;
    for(let tries=0;tries<2000;tries++){
      pair=pool[Math.floor(random()*pool.length)];L=spelling(pair.left,random);R=spelling(pair.right,random);
      if(L.out.length<A||R.out.length<N-A)continue;
      plain=L.out.slice(-A).concat(R.out.slice(0,N-A));q=k?13:8;
      key=Array.from({length:q},()=>Math.floor(random()*29));if(many)key[1]=key[0];prev0=k?Math.floor(random()*29):-1;
      left=enc(plain.slice(0,A),key,0,prev0);all=enc(plain,key,0,prev0);
      if(left.skips>0&&all.skips>left.skips&&all.holds>0&&(!many||all.maxSkips>=2)&&(L.splits.some(i=>i>=L.out.length-A)||R.splits.some(i=>i<N-A)))break;
    }
    check(left.skips>0&&all.skips>left.skips&&all.holds>0&&(!many||all.maxSkips>=2),"plant redraw coverage");
    const rotated=key.slice(left.phase).concat(key.slice(0,left.phase));const truth={source:pair.source,stop:pair.stop,q,key:rotated,plain,prev0,skips:all.skips,holds:all.holds,leftSkips:left.skips,maxSkips:all.maxSkips};
    const result=run(all.C,prev0,truth);controls.push({id:j*2+k,truth,...result});
    const pad=Array.from({length:2*N+10},()=>Math.floor(random()*29));nulls.push({id:j*2+k,...run(enc(plain,pad,0,prev0).C,prev0)});
  }
  const gate={correct:controls.filter(c=>c.recovered).length,uniquePrefix:controls.filter(c=>c.prefixSourceKeys===1).length,falsePrefix:nulls.filter(c=>c.prefixPaths).length,falseFull:nulls.filter(c=>c.suffixMatches).length};
  gate.pass=gate.correct===controls.length&&gate.uniquePrefix===controls.length&&gate.falsePrefix===0;
  let original=null;
  if(allowOriginal&&gate.pass){
    const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"LP2 size");
    const C=U.slice(10279,10439);check(C.length===N,"quote size");
    original={continuousPredecessor:U[10278],continuous:run(C,U[10278]),quoteReset:run(C,-1)};
  }
  return {method:{prefix:S,stop:A,total:N,sources:names,pairs:pairs.length,periods:[8,13],phase:"key position 0 at internal stop, reverse before stop; "+(many?"unlimited":"strict one")+" collision redraw, mandatory F hold"},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original'),process.argv.includes('--unlimited')),null,2));
