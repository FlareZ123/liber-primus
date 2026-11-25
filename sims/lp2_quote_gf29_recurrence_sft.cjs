'use strict';
const fs=require('node:fs'),path=require('node:path');
function attack(gp,raw,allowOriginal=false) {
  const check=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>((x%29)+29)%29, A=41,N=160,S=80,R=13;
  const inv=Array.from({length:29},(_,x)=>{if(!x)return 0;for(let y=1;y<29;y++)if(x*y%29===1)return y;throw Error("inverse")});
  const idx=new Map(gp.translit.map((s,i)=>[s,i]));
  const norm=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
  function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body markers");return s.slice(a,b)}
  function chunks(s){const out=[];let words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(norm(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
  const names=["Shakespeare","Emerson","Gibran"];
  const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")];
  function graph(s){
    const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);
    for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}
    for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}
    const rem=Array(L+1).fill(0);for(let i=L-1;i>=0;i--)rem[i]=rem[i+1]+(s[i]!==" ");return {s,L,f,b,rem}
  }
  const pairs=[];for(let j=0;j<texts.length;j++){const cs=chunks(texts[j]);for(let i=0;i+1<cs.length;i++){const l=cs[i],r=cs[i+1];if(l.replace(/ /g,"").length<A||r.replace(/ /g,"").length<N-A)continue;pairs.push({source:names[j],stop:i+1,left:graph(l),right:graph(r)})}}
  check(pairs.length===1161,"frozen source pairs");
  function bm(seq){
    let C=[1],B=[1],L=0,m=1,b=1;
    for(let n=0;n<seq.length;n++){
      let d=seq[n];for(let i=1;i<=L;i++)d=mod(d+(C[i]||0)*seq[n-i]);
      if(!d){m++;continue}
      const T=C.slice(),q=mod(d*inv[b]);
      while(C.length<B.length+m)C.push(0);
      for(let i=0;i<B.length;i++)C[i+m]=mod(C[i+m]-q*B[i]);
      if(2*L<=n){L=n+1-L;B=T;b=d;m=1}else m++;
    }
    return {L,c:Array.from({length:L},(_,i)=>mod(-(C[i+1]||0)))};
  }
  function extend(state,c,n){const out=state.slice();while(out.length<n){let x=0;for(let i=0;i<c.length;i++)x+=c[i]*out[out.length-i-1];out.push(mod(x))}return out}
  function infer(seq){
    check(seq.length>=2*R,"insufficient observed active prefix");
    const {L,c}=bm(seq);if(L>R)return null;
    const K=extend(seq.slice(0,L),c,N);
    check(seq.every((v,i)=>v===K[i]),"BM prefix replay");
    return {L,c,K};
  }
  function rankClass(seq,r){
    // Coefficient equation K[t]=sum_j a[j]K[t-j-1]. Count every solution.
    const M=[];for(let t=r;t<seq.length;t++)M.push([...Array.from({length:r},(_,j)=>seq[t-j-1]),seq[t]]);
    let rank=0;
    for(let col=0;col<r;col++){
      const p=M.findIndex((row,i)=>i>=rank&&row[col]!==0);if(p<0)continue;
      [M[rank],M[p]]=[M[p],M[rank]];const q=inv[M[rank][col]];for(let j=col;j<=r;j++)M[rank][j]=mod(M[rank][j]*q);
      for(let i=0;i<M.length;i++){if(i===rank)continue;const a=M[i][col];if(!a)continue;for(let j=col;j<=r;j++)M[i][j]=mod(M[i][j]-a*M[rank][j])}
      rank++;
    }
    const consistent=M.every(row=>row.slice(0,r).some(x=>x!==0)||row[r]===0);
    return {order:r,rank,consistent,coefficientClasses:consistent?(29n**BigInt(r-rank)).toString():"0"};
  }
  function match(g,C,begin,end,K,pos,phase,callback){
    const P=[];
    function rec(i,p,h){if(i===end){callback(p,h,P.slice());return}if(g.rem[p]<end-i)return;for(const [v,n] of g.f[p]){if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,n,h);P.pop()}else if(mod(v+K[h])===C[i]){P.push(v);rec(i+1,n,h+1);P.pop()}}}
    rec(begin,pos,phase);
  }
  function scan(C){
    check(C.length===S,"prefix only");check(C.filter(x=>x!==0).length>=2*R,"every legal prefix must have >=26 active symbols");
    const out=[];let leftFPaths=0,shortLeft=0,eligibleRecurrences=0,minOrder=Infinity;const orderHistogram={};
    for(const pair of pairs){
      const left=[];
      function rec(i,p){
        if(i<0){
          leftFPaths++;const L=left.slice().reverse();const ks=[];for(let j=0;j<A;j++)if(L[j]!==0)ks.push(mod(C[j]-L[j]));
          if(ks.length<2*R)shortLeft++;
          function seed(i,pos,P,seq){
            if(seq.length>=2*R){
              const m=bm(seq);minOrder=Math.min(minOrder,m.L);orderHistogram[m.L]=(orderHistogram[m.L]||0)+1;
              const inf=infer(seq);if(!inf)return;eligibleRecurrences++;
              match(pair.right,C,i,S,inf.K,pos,seq.length,(p,h,Q)=>{
                if(pair.right.rem[p]>=N-S)out.push({pair,pos:p,phase:h,plain:L.concat(P,Q),...inf});
              });
              return
            }
            check(i<S,"short prefix impossible under count gate");
            if(pair.right.rem[pos]<S-i)return;
            for(const [v,n] of pair.right.f[pos]){
              if(v===0&&C[i]!==0)continue;
              P.push(v);if(v!==0)seq.push(mod(C[i]-v));seed(i+1,n,P,seq);if(v!==0)seq.pop();P.pop();
            }
          }
          seed(A,0,[],ks);return
        }
        for(const [v,n] of pair.left.b[p]){if(v===0&&C[i]!==0)continue;left.push(v);rec(i-1,n);left.pop()}
      }
      rec(A-1,pair.left.L);
    }
    return {out,leftFPaths,shortLeft,eligibleRecurrences,minOrder:Number.isFinite(minOrder)?minOrder:null,orderHistogram};
  }
  const enc=(P,K)=>{let h=0;return P.map(v=>v===0?0:mod(v+K[h++]))};
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function spelling(g,random){const out=[];let p=0;const splits=[];while(g.rem[p]){const opts=g.f[p];check(opts.length,"unspellable");const [v,n]=opts[Math.floor(random()*opts.length)];if(opts.length>1&&gp.translit[v].length===1)splits.push(out.length);out.push(v);p=n}return {out,splits}}
  function countPaths(g,p,n,memo=new Map()){if(!n)return 1n;if(g.rem[p]<n)return 0n;const key=p+":"+n;if(memo.has(key))return memo.get(key);let sum=0n;for(const [,q] of g.f[p])sum+=countPaths(g,q,n-1,memo);memo.set(key,sum);return sum}
  function run(C,truth=null){
    const {out,...stats}=scan(C.slice(0,S));
    let pred=0n;const prefixKeys=new Set(),survivors=[],classes=[];
    for(const o of out){
      const k=o.pair.source+":"+o.pair.stop+":"+o.K.join(",");prefixKeys.add(k);
      pred+=countPaths(o.pair.right,o.pos,N-S);
      const observed=o.plain.flatMap((p,i)=>p===0?[]:[mod(C[i]-p)]);
      const coefficientClasses=Array.from({length:R+1},(_,r)=>rankClass(observed,r));
      for(const c of coefficientClasses)check(c.consistent===(c.order>=o.L),"order class membership");
      classes.push({source:o.pair.source,stop:o.pair.stop,order:o.L,active:observed.length,coefficientClasses});
      match(o.pair.right,C,S,N,o.K,o.pos,o.phase,(pos,phase,P)=>{
        const plain=o.plain.concat(P);check(enc(plain,o.K).join()===C.join(),"full replay");
        survivors.push({source:o.pair.source,stop:o.pair.stop,L:o.L,c:o.c,K:o.K,plain,phase});
      });
    }
    const recovered=truth?survivors.some(o=>o.source===truth.source&&o.stop===truth.stop&&o.plain.join()===truth.plain.join()&&o.K.slice(0,o.phase).join()===truth.K.slice(0,o.phase).join()):null;
    const allHoldoutCorrect=truth?survivors.length>0&&survivors.every(o=>{const h=o.plain.slice(0,S).filter(x=>x!==0).length,th=truth.plain.slice(0,S).filter(x=>x!==0).length;return o.source===truth.source&&o.stop===truth.stop&&o.plain.slice(S).join()===truth.plain.slice(S).join()&&o.K.slice(h,o.phase).join()===truth.K.slice(th,th+truth.plain.slice(S).filter(x=>x!==0).length).join()}):null;
    return {...stats,prefixPaths:out.length,prefixSourceKeys:prefixKeys.size,predictionPaths:pred.toString(),suffixMatches:survivors.length,recovered,allHoldoutCorrect,classes,fullCandidates:survivors.slice(0,20)};
  }
  const controls=[],nulls=[];
  for(let j=0;j<3;j++)for(let k=0;k<4;k++){
    const random=rng((0x20261125^Math.imul(4*j+k+1,0x9e3779b9))>>>0);
    const pool=pairs.filter(p=>p.source===names[j]);let pair,L,Q;
    for(let tries=0;tries<1000;tries++){
      pair=pool[Math.floor(random()*pool.length)];L=spelling(pair.left,random);Q=spelling(pair.right,random);
      if(L.out.length>=A&&Q.out.length>=N-A&&(L.splits.some(i=>i>=L.out.length-A)||Q.splits.some(i=>i<N-A)))break;
    }
    check(L.out.length>=A&&Q.out.length>=N-A,"plant length");
    const plain=L.out.slice(-A).concat(Q.out.slice(0,N-A)),order=[0,3,8,13][k];
    const c=Array.from({length:order},()=>Math.floor(random()*29));if(order)c[order-1]=1+Math.floor(random()*28);
    const state=Array.from({length:order},()=>Math.floor(random()*29));
    const K=extend(state,c,N),truth={source:pair.source,stop:pair.stop,plain,K,order,c,state};
    const p=run(enc(plain,K),truth);
    controls.push({id:4*j+k,source:truth.source,stop:truth.stop,plantedOrder:order,actualOrder:bm(K).L,...p});
    const pad=Array.from({length:N},()=>Math.floor(random()*29));
    nulls.push({id:4*j+k,...run(enc(plain,pad))});
  }
  const gate={correct:controls.filter(x=>x.recovered).length,uniqueFull:controls.filter(x=>x.suffixMatches===1).length,falsePrefix:nulls.filter(x=>x.prefixPaths).length,falseFull:nulls.filter(x=>x.suffixMatches).length};
  gate.allHoldoutCorrect=controls.filter(x=>x.allHoldoutCorrect).length;
  // Multiple exact prefix histories are legitimate for singular recurrences and spelling ambiguity.
  // Require all retained full matches to identify the source and exact held-out consuming shifts.
  gate.pass=gate.correct===controls.length&&gate.allHoldoutCorrect===controls.length&&gate.falsePrefix===0&&gate.falseFull===0;
  let original=null;
  if(allowOriginal&&gate.pass){
    const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);check(U.length===12956,"LP2 size");
    original=run(U.slice(10279,10439));
  }
  return {method:{prefix:S,stop:A,total:N,maxOrder:R,sources:names,pairs:pairs.length},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));
