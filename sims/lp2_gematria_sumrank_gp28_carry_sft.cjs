'use strict';
/** GP28 gematria-sum ranked quotient inverse. Agent21, 2026-11-25. Node22/CommonJS. */
function analyze(corpus,raw,dict,native){
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const gp=new Map(corpus.runes.map((x,i)=>[x,i])),W=corpus.prime;
  check(W.join(",")==="2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109","GP order");
  let page=0,cur=[],start=0;const words=[];
  const finish=()=>{if(cur.length){words.push({w:cur,page:start>=50?start+1:start});cur=[]}};
  for(const c of raw.split("%").slice(0,55).join("%")){
    if(gp.has(c)){if(!cur.length)start=page;cur.push(gp.get(c))}
    else if(c==="%")page++;
    else if(c!=="/"&&!/\s/u.test(c))finish();
  }finish();
  const actual=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  check(words.length===2896&&actual.length===12956&&words.flatMap(x=>x.w).join(",")===actual.join(","),"original tape");
  const choose=(n,k)=>{if(k<0||k>n)return 0n;let a=1n;for(let i=1;i<=k;i++)a=a*BigInt(n+1-i)/BigInt(i);return a};
  const sc=words.map(({w},i)=>({L:w.length,e:w.slice(1).filter((v,j)=>v===w[j]).length,gap:i?words[i-1].w.at(-1)===w[0]:null}));
  check(sc.reduce((a,x)=>a+x.e,0)===63&&sc.filter(x=>x.gap===true).length===23,"source equalities");
  const rank=(c,p,cyc)=>cyc?(c-p+29)%29-1:c-(c>p?1:0);
  const unrank=(r,p,cyc)=>cyc?(p+r+1)%29:r+(r>=p?1:0);
  const pow=Array.from({length:15},(_,i)=>28n**BigInt(i));
  const digits=(v,L)=>{const a=Array(L);for(let i=L-1;i>=0;i--){a[i]=Number(v%28n);v/=28n}check(v===0n,"rank overflow");return a};
  const bases=(s,mode)=>({A:mode==="word"||s.gap===null?29n:s.gap?1n:28n,B:choose(s.L-1,s.e),D:pow[s.L-1-s.e]});
  function pack(w,prev,s,mode,cyc,order){
    const b=bases(s,mode);let a=BigInt(w[0]),c=0n,d=0n,k=0;
    if(mode==="gap"&&s.gap!==null){check((w[0]===prev)===s.gap,"seam");a=s.gap?0n:BigInt(rank(w[0],prev,cyc))}
    for(let j=1;j<w.length;j++){if(w[j]===w[j-1])c+=choose(j-1,++k);else d=28n*d+BigInt(rank(w[j],w[j-1],cyc))}
    check(k===s.e,"repeat count");const f={A:a,B:c,D:d};let r=0n,M=1n;
    for(const x of order){check(f[x]>=0n&&f[x]<b[x],"rank range");r=r*b[x]+f[x];M*=b[x]}return {r,M,L:s.L,t:s.L-1-s.e};
  }
  function unpack(r,prev,s,mode,cyc,order){
    const b=bases(s,mode),f={};for(const x of [...order].reverse()){f[x]=r%b[x];r/=b[x]}check(r===0n,"overflow");
    let q=f.B,ceiling=s.L-1;const eq=new Set;
    for(let j=s.e;j>=1;j--){let k=ceiling-1;while(choose(k,j)>q)k--;eq.add(k);q-=choose(k,j);ceiling=k}
    check(q===0n,"colex");const d=digits(f.D,s.L-1-s.e);
    const first=mode==="word"||s.gap===null?Number(f.A):s.gap?prev:unrank(Number(f.A),prev,cyc);
    const w=[first];let k=0;for(let i=1;i<s.L;i++)w.push(eq.has(i-1)?w.at(-1):unrank(d[k++],w.at(-1),cyc));return w;
  }
  const lex=Array.from({length:15},()=>new Map);
  const add=a=>{if(a.length&&a.length<=14&&a.every(x=>x!==undefined))lex[a.length].set(a.join(","),a)};
  const spell=corpus.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
  for(const line of dict.split("\n")){
    const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;
    const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const walk=(p,a)=>{if(p===s.length){add(a);return}if(a.length===14)return;for(const [t,i] of spell)if(s.startsWith(t,p))walk(p+t.length,a.concat(i))};walk(0,[]);
  }
  const donor=native.sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>gp.get(x))));donor.forEach(add);
  check(lex.reduce((a,x)=>a+x.size,0)===40596,"lexicon count");
  /** Exact rank by (native GP prime sum, canonical rune lexicographic order). */
  function weighted(alphabet,maxLen){
    const dp=[[1n]],cum=[[0n,1n]];
    for(let k=1;k<=maxLen;k++){
      const a=Array(109*k+1).fill(0n);
      for(const x of alphabet){const w=W[x],p=dp[k-1];for(let s=0;s<p.length;s++)a[s+w]+=p[s]}
      dp.push(a);const c=[0n];for(const v of a)c.push(c.at(-1)+v);cum.push(c);
      check(c.at(-1)===BigInt(alphabet.length)**BigInt(k),"weight total");
    }
    const n=(k,s)=>dp[k][s]??0n;
    function wrank(a){
      const L=a.length;let s=a.reduce((z,x)=>z+W[x],0),r=cum[L][s];
      for(let j=0;j<L;j++){check(alphabet.includes(a[j]),"alphabet");for(const x of alphabet){if(x>=a[j])break;r+=n(L-j-1,s-W[x])}s-=W[a[j]]}
      check(s===0&&r>=0n&&r<cum[L].at(-1),"weighted rank");return r;
    }
    function wunrank(r,L){
      check(r>=0n&&r<cum[L].at(-1),"weighted rank domain");let lo=0,hi=dp[L].length-1;
      while(lo<hi){const m=(lo+hi)>>1;if(cum[L][m+1]>r)hi=m;else lo=m+1}
      let s=lo;r-=cum[L][s];const a=[];
      for(let j=0;j<L;j++){let found=false;for(const x of alphabet){const c=n(L-j-1,s-W[x]);if(r<c){a.push(x);s-=W[x];found=true;break}r-=c}check(found,"unrank symbol")}
      check(r===0n&&s===0,"unrank residue");return a;
    }
    return {wrank,wunrank};
  }
  const tiny=[0,1,2,3],tc=weighted(tiny,4);let toy=0;
  for(let L=1;L<=4;L++){
    const a=[];function visit(w){if(w.length===L){a.push(w);return}for(const x of tiny)visit(w.concat(x))}visit([]);
    a.sort((a,b)=>a.reduce((v,x)=>v+W[x],0)-b.reduce((v,x)=>v+W[x],0)||a.join("").localeCompare(b.join("")));
    for(let j=0;j<a.length;j++){check(tc.wrank(a[j])===BigInt(j)&&tc.wunrank(BigInt(j),L).join(",")===a[j].join(","),"exhaustive rank");toy++}
  }
  const modes=[];
  for(const mode of ["word","gap"])for(const cyc of [false,true])for(const order of ["ABD","ADB","BAD","BDA","DAB","DBA"]){
    const rows=words.map(({w},i)=>pack(w,i?words[i-1].w.at(-1):null,sc[i],mode,cyc,order));
    for(let i=0;i<rows.length;i++)check(unpack(rows[i].r,i?words[i-1].w.at(-1):null,sc[i],mode,cyc,order).join(",")===words[i].w.join(","),"original rank replay");
    modes.push({mode,cyc,order,rows,tails:rows.map(x=>({L:x.L,t:x.t,r:x.r%pow[x.t]}))});
  }
  const needed=Array.from({length:15},()=>new Set);for(const s of sc)needed[s.L].add(s.L-1-s.e);
  const scByLen=Array.from({length:15},()=>[]);sc.forEach(x=>scByLen[x.L].push(x));
  const results=[],controls=[];let exactRankChecks=0;
  for(let omit=0;omit<29;omit++){
    const alphabet=Array.from({length:29},(_,i)=>i).filter(x=>x!==omit),codec=weighted(alphabet,14);
    const allowed=Array.from({length:15},(_,L)=>new Map([...needed[L]].map(t=>[t,new Set])));
    for(let L=1;L<=14;L++)for(const a of lex[L].values()){
      if(a.includes(omit))continue;const r=codec.wrank(a);for(const [t,set] of allowed[L])set.add(r%pow[t]);
    }
    const control=donor.filter(a=>a.length<=14&&!a.includes(omit));
    for(const a of control){check(codec.wunrank(codec.wrank(a),a.length).join(",")===a.join(","),"native rank");exactRankChecks++}
    for(const m of modes){
      let all=0,long=0,opening=0,holdout=0;
      for(let i=0;i<m.tails.length;i++){
        const {L,t,r}=m.tails[i],ok=allowed[L].get(t).has(r);
        if(ok){all++;if(L>=5){long++;if(words[i].page<=2)opening++;if(words[i].page>=16&&words[i].page<=21)holdout++}}
      }results.push({omit,mode:m.mode,cyc:m.cyc,order:m.order,all,long,opening,holdout});
    }
    const cs=control.map((a,i)=>({L:a.length,e:scByLen[a.length].length?scByLen[a.length][i%scByLen[a.length].length].e:0,gap:i===0?null:i%37===0}));
    for(const mode of ["word","gap"]){
      const cyc=false,order="ABD";let state=3301n,prev=null;const cipher=[];
      for(let i=0;i<control.length;i++){
        const s=cs[i],b=bases(s,mode),M=b.A*b.B*b.D,P=pow[s.L],p=codec.wrank(control[i]),v=state*P+p,r=v%M;state=v/M;
        const c=unpack(r,prev,s,mode,cyc,order);
        check(p%pow[s.L-1-s.e]===r%pow[s.L-1-s.e],"native all-carry residue");cipher.push(c);prev=c.at(-1);
      }
      for(let i=control.length-1;i>=0;i--){
        const row=pack(cipher[i],i?cipher[i-1].at(-1):null,cs[i],mode,cyc,order),v=state*row.M+row.r,p=v%pow[row.L];state=v/pow[row.L];
        check(codec.wunrank(p,row.L).join(",")===control[i].join(","),"native full inverse");
      }check(state===3301n,"native seed");controls.push({omit,mode,words:control.length,runes:control.flat().length});
    }
  }
  results.sort((a,b)=>b.long-a.long||b.all-a.all);
  const winner=results[0],m=modes.find(x=>x.mode===winner.mode&&x.cyc===winner.cyc&&x.order===winner.order),codec=weighted(Array.from({length:29},(_,i)=>i).filter(x=>x!==winner.omit),14);
  let state=0n;const plain=Array(words.length);
  for(let i=words.length-1;i>=0;i--){const row=m.rows[i],v=state*row.M+row.r;plain[i]=codec.wunrank(v%pow[row.L],row.L);state=v/pow[row.L]}
  const initial=state;let prev=null;
  for(let i=0;i<plain.length;i++){const row=m.rows[i],v=state*pow[row.L]+codec.wrank(plain[i]),c=unpack(v%row.M,prev,sc[i],m.mode,m.cyc,m.order);state=v/row.M;check(c.join(",")===words[i].w.join(","),"original replay");prev=c.at(-1)}
  check(state===0n,"original terminal");
  return {originalWords:words.length,originalRunes:actual.length,lexicon:lex.reduce((a,x)=>a+x.size,0),longWords:words.filter(x=>x.w.length>=5).length,openingLong:words.filter(x=>x.w.length>=5&&x.page<=2).length,holdoutLong:words.filter(x=>x.w.length>=5&&x.page>=16&&x.page<=21).length,toy,exactRankChecks,controls:controls.length,controlWords:controls.reduce((a,x)=>a+x.words,0),controlRunes:controls.reduce((a,x)=>a+x.runes,0),variants:results.length,winner,top:results.slice(0,10),maxOpening:Math.max(...results.map(x=>x.opening)),maxHoldout:Math.max(...results.map(x=>x.holdout)),initialBits:initial===0n?0:initial.toString(2).length,preview:plain.slice(0,20).map(a=>a.map(x=>corpus.translit[x]).join("")).join(" "),nativeLexHits:plain.filter(a=>a.length>=5&&lex[a.length].has(a.join(","))).length,originalReplay:actual.length,results};
}
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(analyze(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
