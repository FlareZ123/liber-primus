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
  const primes=[];
  for(let n=2;primes.length<N;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
  const shifts=primes.map(p=>(p-1)%29);
  const range=n=>Array.from({length:n},(_,i)=>i);
  const identity=()=>({c:range(29),v:Array(29).fill(0)});
  /** Immutable modular-difference graph, component representatives and relative potentials. */
  function edge(s,p,c,k){
    const a=s.c[p],b=s.c[c],d=mod(k+s.v[p]-s.v[c],29);
    if(a===b)return d===0?s:null;
    let used=0;
    for(let i=0;i<29;i++)if(s.c[i]===a)used|=1<<s.v[i];
    for(let i=0;i<29;i++)if(s.c[i]===b){
      const bit=1<<mod(s.v[i]+d,29);
      if(used&bit)return null;used|=bit;
    }
    const t={c:s.c.slice(),v:s.v.slice()};
    for(let i=0;i<29;i++)if(s.c[i]===b){t.c[i]=a;t.v[i]=mod(t.v[i]+d,29)}
    return t;
  }
  function factorial(n){let v=1n;for(let i=2;i<=n;i++)v*=BigInt(i);return v}
  /** Exact disjoint translations; singleton assignments represented by their factorial multiplicity. */
  function completions(s){
    const groups=new Map();
    for(let i=0;i<29;i++){if(!groups.has(s.c[i]))groups.set(s.c[i],[]);groups.get(s.c[i]).push(i)}
    const anchor=groups.get(s.c[0]), aShift=mod(-s.v[0],29);
    const mask=(g,z)=>g.reduce((m,i)=>m|1<<mod(s.v[i]+z,29),0);
    let used=mask(anchor,aShift), singles=0;
    const multi=[];
    for(const g of groups.values())if(g!==anchor){if(g.length===1)singles++;else multi.push(g)}
    multi.sort((a,b)=>b.length-a.length);
    const options=multi.map(g=>range(29).map(z=>({z,m:mask(g,z)})));
    const memo=new Map();
    function dfs(i,m){
      if(i===multi.length)return factorial(singles);
      const key=i+":"+m;if(memo.has(key))return memo.get(key);
      let total=0n;
      for(const {m:b} of options[i])if(!(m&b))total+=dfs(i+1,m|b);
      memo.set(key,total);return total;
    }
    return dfs(0,used);
  }
  /** Construct one admissible complete alphabet; uniqueness is assessed separately. */
  function witness(s){
    const groups=new Map();
    for(let i=0;i<29;i++){if(!groups.has(s.c[i]))groups.set(s.c[i],[]);groups.get(s.c[i]).push(i)}
    const anchor=groups.get(s.c[0]), others=[...groups.values()].filter(g=>g!==anchor).sort((a,b)=>b.length-a.length);
    const a=Array(29).fill(-1);
    const install=(g,z)=>{let m=0;for(const i of g){a[i]=mod(s.v[i]+z,29);m|=1<<a[i]}return m};
    const initial=install(anchor,mod(-s.v[0],29));
    function rec(i,m){
      if(i===others.length)return true;
      const g=others[i];
      for(let z=0;z<29;z++){const b=install(g,z);if(!(m&b)&&rec(i+1,m|b))return true}
      return false;
    }
    check(rec(0,initial)&&belongs(s,a),"invalid completion witness");
    return a;
  }
  function countPaths(g,p,n,memo=new Map()){
    if(!n)return 1n;if(g.rem[p]<n)return 0n;
    const k=p+":"+n;if(memo.has(k))return memo.get(k);
    let sum=0n;for(const [,np] of g.f[p])sum+=countPaths(g,np,n-1,memo);
    memo.set(k,sum);return sum;
  }
  function belongs(s,a){
    return a[0]===0&&new Set(a).size===29&&range(29).every(i=>mod(a[i]-a[s.c[i]],29)===s.v[i]);
  }
  function enc(P,a){
    const inv=Array(29);a.forEach((x,i)=>inv[x]=i);
    let j=0;return P.map(p=>p===0?0:inv[mod(a[p]+shifts[j++],29)]);
  }
  function forward(g,C,start,end,pos,j,s,callback){
    const P=[];
    function rec(i,p,h,t){
      if(i===end){callback(p,h,t,P.slice());return}
      if(g.rem[p]<end-i)return;
      for(const [v,n] of g.f[p]){
        if(v===0){if(C[i]!==0)continue;P.push(v);rec(i+1,n,h,t);P.pop()}
        else{const u=edge(t,v,C[i],shifts[h]);if(u){P.push(v);rec(i+1,n,h+1,u);P.pop()}}
      }
    }
    rec(start,pos,j,s);
  }
  function scan(C){
    check(C.length===S,"prefix only");
    const out=[];let leftGraphPass=0;
    const min=A-C.slice(0,A).filter(v=>v===0).length;
    for(const pair of pairs)for(let active=min;active<=A;active++){
      const R=[];
      function rec(i,p,h,s){
        if(h<0||h>i+1)return;
        if(i<0){
          if(h!==0)return;
          leftGraphPass++;
          const L=R.slice().reverse();
          forward(pair.right,C,A,S,0,active,s,(pos,j,t,P)=>{
            if(pair.right.rem[pos]<N-S)return;
            const count=completions(t);
            if(count)out.push({source:pair.source,stop:pair.stop,pair,pos,j,s:t,plain:L.concat(P),count:String(count),leftStart:p});
          });
          return;
        }
        for(const [v,n] of pair.left.b[p]){
          if(v===0){if(C[i]!==0)continue;R.push(v);rec(i-1,n,h,s);R.pop()}
          else if(h>0){const t=edge(s,v,C[i],shifts[h-1]);if(t){R.push(v);rec(i-1,n,h-1,t);R.pop()}}
        }
      }
      rec(A-1,pair.left.L,active,identity());
    }
    return {out,leftGraphPass};
  }
  function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
  function spelling(g,random){
    const out=[];let p=0;
    while(g.rem[p]){const opts=g.f[p];check(opts.length,"unspellable");const [v,n]=opts[Math.floor(random()*opts.length)];out.push(v);p=n}
    return out;
  }
  function run(C,truth=null){
    const {out,leftGraphPass}=scan(C.slice(0,S));
    const sourceStops=new Set(out.map(o=>o.source+":"+o.stop));
    const full=[],truePrefixes=truth?out.filter(o=>o.source===truth.source&&o.stop===truth.stop&&o.plain.join()===truth.plain.slice(0,S).join()&&belongs(o.s,truth.alpha)):[];
    // Independently forced withheld outputs for the planted spelling: a fixed
    // within-component difference forces the unique inverse image under every
    // completion, without fitting any suffix constraint.
    const forced=truth?truePrefixes.map(o=>{
      let j=o.j,k=0;for(let i=S;i<N;i++){const p=truth.plain[i],c=C[i];if(p===0){if(c===0)k++;continue}
        if(o.s.c[p]===o.s.c[c]&&mod(o.s.v[c]-o.s.v[p],29)===shifts[j])k++;j++;
      }return k;
    }):[];
    for(const o of out)forward(o.pair.right,C,S,N,o.pos,o.j,o.s,(pos,j,t,P)=>{
      const count=completions(t);
      if(count){
        const plain=o.plain.concat(P),alpha=witness(t);
        check(enc(plain,alpha).join()===C.join(),"full exact re-encryption");
        full.push({source:o.source,stop:o.stop,plain,alpha,prefixCount:o.count,fullCount:String(count),trueAlphabet:truth?belongs(t,truth.alpha):null});
      }
    });
    const exactUniquePrediction=truth?truePrefixes.some(o=>o.count==="1"&&enc(truth.plain,witness(o.s)).slice(S).join()===C.slice(S).join()):null;
    let predictionPathUpper=0n;
    for(const o of out)predictionPathUpper+=BigInt(o.count)*countPaths(o.pair.right,o.pos,N-S);
    const recovered=truth?full.some(o=>o.source===truth.source&&o.stop===truth.stop&&o.plain.join()===truth.plain.join()&&o.trueAlphabet):null;
    return {leftGraphPass,prefixPaths:out.length,prefixSourceStops:sourceStops.size,prefixClasses:out.slice(0,20).map(o=>({source:o.source,stop:o.stop,count:o.count,components:new Set(o.s.c).size,graph:o.s,uniqueAlphabet:o.count==='1'?witness(o.s):null})),truePrefixClasses:truePrefixes.length,forcedWithheldLowerBound:forced.length?Math.min(...forced):null,fullPaths:full.length,exactUniquePrediction,predictionPathUpper:String(predictionPathUpper),recovered,full:full.slice(0,10)};
  }
  const controls=[],nulls=[];
  for(let j=0;j<3;j++)for(let k=0;k<2;k++){
    const random=rng((0x2693a6^Math.imul(j*2+k+1,0x9e3779b9))>>>0);
    const pool=pairs.filter(p=>p.source===names[j]);
    let pair,L,R;
    for(let tries=0;tries<pool.length;tries++){
      pair=pool[Math.floor(random()*pool.length)];L=spelling(pair.left,random);R=spelling(pair.right,random);
      if(L.length>=A&&R.length>=N-A)break;
    }
    check(L.length>=A&&R.length>=N-A,"plant length");
    const plain=L.slice(-A).concat(R.slice(0,N-A)),alpha=range(29);
    for(let i=28;i>1;i--){const t=1+Math.floor(random()*i);[alpha[i],alpha[t]]=[alpha[t],alpha[i]]}
    const truth={source:pair.source,stop:pair.stop,alpha,plain};
    const C=enc(plain,alpha);
    controls.push({id:j*2+k,truth,...run(C,truth)});
    const NC=plain.map(p=>p===0?0:Math.floor(random()*29));
    nulls.push({id:j*2+k,...run(NC)});
  }
  const gate={correct:controls.filter(c=>c.recovered).length,uniqueSource:controls.filter(c=>c.prefixSourceStops===1).length,falsePrefix:nulls.filter(c=>c.prefixPaths).length,falseFull:nulls.filter(c=>c.fullPaths).length,minimumForcedWithheld:Math.min(...controls.map(c=>c.forcedWithheldLowerBound??0))};
  gate.pass=gate.correct===controls.length&&gate.uniqueSource===controls.length&&gate.falseFull===0&&gate.minimumForcedWithheld>=72;
  let original=null;
  if(allowOriginal&&gate.pass){
    const U=gp.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page).flatMap(p=>p.indices);
    check(U.length===12956,"LP2 size");
    const C=U.slice(10279,10439);check(C.length===N,"quote size");
    original=run(C);
  }
  return {method:{prefix:S,stop:A,total:N,sources:names,pairs:pairs.length,primeOrigin:0,alphaFixF:true},gate,controls,nulls,original};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(attack(JSON.parse(data[0]),data.slice(1),process.argv.includes('--original')),null,2));
