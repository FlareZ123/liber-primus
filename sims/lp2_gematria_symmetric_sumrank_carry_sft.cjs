'use strict';
/** GP prime-sum ordering on both constrained ciphertext and GP28 plaintext. Agent21, 2026-11-25. Node22/CommonJS. */
function analyze(corpus,raw,dict,native){
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const gp=new Map(corpus.runes.map((x,i)=>[x,i])),W=corpus.prime;
  const gp29=Array.from({length:29},(_,i)=>i);
  let page=0,cur=[],start=0;const words=[];
  const finish=()=>{if(cur.length){words.push({w:cur,page:start>=50?start+1:start});cur=[]}};
  for(const c of raw.split("%").slice(0,55).join("%")){
    if(gp.has(c)){if(!cur.length)start=page;cur.push(gp.get(c))}
    else if(c==="%")page++;
    else if(c!=="/"&&!/\s/u.test(c))finish();
  }finish();
  const actual=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  check(words.length===2896&&actual.length===12956&&words.flatMap(x=>x.w).join(",")===actual.join(","),"original tape");
  const sc=words.map(({w},i)=>({L:w.length,e:w.slice(1).filter((v,j)=>v===w[j]).length,gap:i?words[i-1].w.at(-1)===w[0]:null}));
  check(sc.reduce((a,x)=>a+x.e,0)===63&&sc.filter(x=>x.gap===true).length===23,"source equalities");
  const maxE=Math.max(...sc.map(s=>s.e)),maxL=14;
  const pow=Array.from({length:15},(_,i)=>28n**BigInt(i));
  const choose=(n,k)=>{if(k<0||k>n)return 0n;let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n+1-i)/BigInt(i);return a};
  const cardinality=(s,mode)=>BigInt(mode==="word"||s.gap===null?29:s.gap?1:28)*choose(s.L-1,s.e)*pow[s.L-1-s.e];
  const get=(a,i)=>a?.[i]??0n;
  // F[k][e][p][s] counts k GP29 symbols after p, with e adjacent repeats and prime sum s.
  // G[k][e][s] counts k symbols with a free first symbol and e internal repeats.
  const F=[Array.from({length:maxE+1},(_,e)=>gp29.map(()=>[e===0?1n:0n]))];
  const G=[Array.from({length:maxE+1},(_,e)=>[e===0?1n:0n])];
  for(let k=1;k<=maxL;k++){
    const g=[],f=[];
    for(let e=0;e<=maxE;e++){
      const a=Array(109*k+1).fill(0n);
      for(const x of gp29){const p=F[k-1][e][x],w=W[x];for(let s=0;s<p.length;s++)a[s+w]+=p[s]}
      g.push(a);
      f.push(gp29.map(p=>a.map((v,s)=>v-get(F[k-1][e][p],s-W[p])+get(F[k-1][e-1]?.[p],s-W[p]))));
      check(a.reduce((v,x)=>v+x,0n)===29n*choose(k-1,e)*28n**BigInt(Math.max(0,k-1-e)),"free-head count");
      for(const row of f[e])check(row.reduce((v,x)=>v+x,0n)===choose(k,e)*28n**BigInt(Math.max(0,k-e)),"fixed predecessor count");
    }G.push(g);F.push(f);
  }
  const fcount=(k,e,p,s)=>get(F[k][e]?.[p],s);
  const headAllowed=(x,prev,s,mode)=>mode==="word"||s.gap===null||(x===prev)===s.gap;
  function sumCount(sum,prev,s,mode){
    const all=get(G[s.L][s.e],sum);
    if(mode==="word"||s.gap===null)return all;
    const eq=fcount(s.L-1,s.e,prev,sum-W[prev]);
    return s.gap?eq:all-eq;
  }
  function branch(x,j,prev,e,sum,s,mode){
    if(j===0&&!headAllowed(x,prev,s,mode))return 0n;
    const de=j===0?0:Number(x===prev);
    return fcount(s.L-j-1,e-de,x,sum-W[x]);
  }
  function crank(a,prev,s,mode){
    let sum=a.reduce((z,x)=>z+W[x],0),e=s.e,r=0n;
    for(let z=0;z<sum;z++)r+=sumCount(z,prev,s,mode);
    let p=prev;
    for(let j=0;j<a.length;j++){
      for(let x=0;x<a[j];x++)r+=branch(x,j,p,e,sum,s,mode);
      check(branch(a[j],j,p,e,sum,s,mode)>0n,"cipher rank path");
      if(j>0&&a[j]===p)e--;
      sum-=W[a[j]];p=a[j];
    }check(sum===0&&e===0&&r<cardinality(s,mode),"cipher rank domain");return r;
  }
  function cunrank(r,prev,s,mode){
    check(r>=0n&&r<cardinality(s,mode),"cipher unrank domain");let sum=0,e=s.e,p=prev;
    while(r>=sumCount(sum,prev,s,mode)){r-=sumCount(sum,prev,s,mode);sum++;check(sum<=109*s.L,"sum search")}
    const a=[];
    for(let j=0;j<s.L;j++){
      let found=false;
      for(const x of gp29){
        const c=branch(x,j,p,e,sum,s,mode);
        if(r<c){if(j>0&&x===p)e--;a.push(x);sum-=W[x];p=x;found=true;break}
        r-=c;
      }check(found,"cipher unrank branch");
    }check(r===0n&&e===0&&sum===0,"cipher unrank residue");return a;
  }
  // All length-1/2 GP29 words under all head conditions, checked against an independent literal sort.
  let oracle=0;
  for(const L of [1,2])for(let e=0;e<L;e++)for(const [mode,prev,gap] of [["word",null,null],["gap",17,true],["gap",17,false]]){
    const s={L,e,gap},a=[];
    const visit=w=>{if(w.length===L){if(headAllowed(w[0],prev,s,mode)&&w.slice(1).filter((x,j)=>x===w[j]).length===e)a.push(w);return}for(const x of gp29)visit(w.concat(x))};visit([]);
    a.sort((a,b)=>a.reduce((z,x)=>z+W[x],0)-b.reduce((z,x)=>z+W[x],0)||a[0]-b[0]||(a[1]??0)-(b[1]??0));
    check(BigInt(a.length)===cardinality(s,mode),"oracle cardinality");
    for(let i=0;i<a.length;i++){check(crank(a[i],prev,s,mode)===BigInt(i)&&cunrank(BigInt(i),prev,s,mode).join(",")===a[i].join(","),"oracle rank");oracle++}
  }
  const rowsByMode=["word","gap"].map(mode=>{
    const rows=words.map(({w},i)=>{const prev=i?words[i-1].w.at(-1):null,s=sc[i],r=crank(w,prev,s,mode),M=cardinality(s,mode),t=s.L-1-s.e;
      check(cunrank(r,prev,s,mode).join(",")===w.join(","),"cipher original rank roundtrip");return {r,M,L:s.L,t,residue:r%pow[t]}});
    return {mode,rows};
  });
  // Same generous lexicon used by Agent1 and the first prime-sum experiment.
  const lex=Array.from({length:15},()=>new Map);
  const add=a=>{if(a.length&&a.length<=14&&a.every(x=>x!==undefined))lex[a.length].set(a.join(","),a)};
  const spell=corpus.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
  for(const line of dict.split("\n")){
    const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;
    const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const walk=(p,a)=>{if(p===s.length){add(a);return}if(a.length===14)return;for(const [t,i] of spell)if(s.startsWith(t,p))walk(p+t.length,a.concat(i))};walk(0,[]);
  }
  const donor=native.sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>gp.get(x))));donor.forEach(add);
  check(lex.reduce((a,x)=>a+x.size,0)===40596,"lexicon");
  function plainCodec(omit,weighted){
    const a=gp29.filter(x=>x!==omit),dp=[[1n]],cum=[[0n,1n]];
    if(weighted)for(let k=1;k<=maxL;k++){
      const v=Array(109*k+1).fill(0n);
      for(const x of a){const w=W[x],p=dp[k-1];for(let s=0;s<p.length;s++)v[s+w]+=p[s]}
      dp.push(v);const c=[0n];for(const n of v)c.push(c.at(-1)+n);cum.push(c);check(c.at(-1)===pow[k],"plain sum count");
    }
    function rank(w){
      if(!weighted)return w.reduce((v,x)=>v*28n+BigInt(a.indexOf(x)),0n);
      let sum=w.reduce((z,x)=>z+W[x],0),r=cum[w.length][sum];
      for(let j=0;j<w.length;j++){for(const x of a){if(x>=w[j])break;r+=get(dp[w.length-j-1],sum-W[x])}sum-=W[w[j]]}
      return r;
    }
    function unrank(r,L){
      if(!weighted){const w=Array(L);for(let j=L-1;j>=0;j--){w[j]=a[Number(r%28n)];r/=28n}check(r===0n,"plain rank overflow");return w}
      let lo=0,hi=dp[L].length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[L][m+1]>r)hi=m;else lo=m+1}
      let sum=lo;r-=cum[L][sum];const w=[];
      for(let j=0;j<L;j++){let found=false;for(const x of a){const n=get(dp[L-j-1],sum-W[x]);if(r<n){w.push(x);sum-=W[x];found=true;break}r-=n}check(found,"plain unrank")}
      check(r===0n&&sum===0,"plain remainder");return w;
    }
    return {rank,unrank};
  }
  const need=Array.from({length:15},()=>new Set),byLen=Array.from({length:15},()=>[]);
  for(const s of sc){need[s.L].add(s.L-1-s.e);byLen[s.L].push(s)}
  const results=[],controls=[];
  // Both plaintext sides are fixed in advance: symmetric sum rank and the old canonical ordinal rank.
  for(const weighted of [true,false])for(let omit=0;omit<29;omit++){
    const pc=plainCodec(omit,weighted),sets=need.map(ts=>new Map([...ts].map(t=>[t,new Set])));
    for(let L=1;L<=maxL;L++)for(const w of lex[L].values()){
      if(w.includes(omit))continue;const r=pc.rank(w);
      for(const [t,set] of sets[L])set.add(r%pow[t]);
    }
    for(const {mode,rows} of rowsByMode){
      let long=0,all=0,opening=0,holdout=0;
      for(let i=0;i<rows.length;i++){const {L,t,residue}=rows[i];if(!sets[L].get(t).has(residue))continue;all++;if(L>=5){long++;if(words[i].page<=2)opening++;if(words[i].page>=16&&words[i].page<=21)holdout++}}
      results.push({weighted,omit,mode,long,all,opening,holdout});
    }
    if(omit!==12&&omit!==22)continue;
    const control=donor.filter(w=>w.length<=14&&!w.includes(omit));
    const cs=control.map((w,i)=>({L:w.length,e:byLen[w.length][i%byLen[w.length].length]?.e??0,gap:i===0?null:i%37===0}));
    for(const mode of ["word","gap"]){
      let state=3301n,prev=null;const cipher=[];
      for(let i=0;i<control.length;i++){
        const s=cs[i],M=cardinality(s,mode),p=pc.rank(control[i]),v=state*pow[s.L]+p,r=v%M;
        const c=cunrank(r,prev,s,mode);check(p%pow[s.L-1-s.e]===r%pow[s.L-1-s.e],"native residue");state=v/M;cipher.push(c);prev=c.at(-1);
      }
      for(let i=control.length-1;i>=0;i--){const s=cs[i],r=crank(cipher[i],i?cipher[i-1].at(-1):null,s,mode),v=state*cardinality(s,mode)+r;check(pc.unrank(v%pow[s.L],s.L).join(",")===control[i].join(","),"native inverse");state=v/pow[s.L]}
      check(state===3301n,"native seed");controls.push({weighted,omit,mode,words:control.length,runes:control.flat().length});
    }
  }
  results.sort((a,b)=>b.long-a.long||b.all-a.all);
  const bests=[];
  for(const weighted of [true,false]){
    const winner=results.find(x=>x.weighted===weighted),pc=plainCodec(winner.omit,weighted),rows=rowsByMode.find(x=>x.mode===winner.mode).rows;
    let state=0n;const plain=Array(words.length);
    for(let i=words.length-1;i>=0;i--){const row=rows[i],v=state*row.M+row.r;plain[i]=pc.unrank(v%pow[row.L],row.L);state=v/pow[row.L]}
    const initial=state;let prev=null;
    for(let i=0;i<words.length;i++){const row=rows[i],v=state*pow[row.L]+pc.rank(plain[i]),c=cunrank(v%row.M,prev,sc[i],winner.mode);state=v/row.M;check(c.join(",")===words[i].w.join(","),"original full replay");prev=c.at(-1)}
    check(state===0n,"original terminal");bests.push({...winner,initialBits:initial===0n?0:initial.toString(2).length,preview:plain.slice(0,12).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" "),actualLongHits:plain.filter(w=>w.length>=5&&lex[w.length].has(w.join(","))).length});
  }
  return {words:words.length,runes:actual.length,longWords:words.filter(x=>x.w.length>=5).length,openingLong:words.filter(x=>x.w.length>=5&&x.page<=2).length,holdoutLong:words.filter(x=>x.w.length>=5&&x.page>=16&&x.page<=21).length,lexicon:lex.reduce((a,x)=>a+x.size,0),maxE,oracle,originalRankChecks:words.length*2,variants:results.length,bests,controls,controlRunes:controls.reduce((a,x)=>a+x.runes,0),controlWords:controls.reduce((a,x)=>a+x.words,0),maxOpening:Math.max(...results.map(x=>x.opening)),maxHoldout:Math.max(...results.map(x=>x.holdout)),results};
}
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(analyze(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
