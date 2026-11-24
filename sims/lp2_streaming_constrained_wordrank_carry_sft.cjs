'use strict';
/** Original LP2 streaming constrained-rank state bounds and full inverse. Agent1, 2026-11-24. No authenticated cipher claim. Node 22/CommonJS. */
const fs=require('node:fs');
const path=require('node:path');
function analyze(corpus,raw,dict,native){
  "use strict";
  const check=(c,m)=>{if(!c)throw new Error(m)};
  const gp=new Map(corpus.runes.map((c,i)=>[c,i]));
  const words=[];let cur=[],page=0,start=0,end=0;
  const finish=()=>{if(cur.length){words.push({w:cur,start,end});cur=[]}};
  for(const c of raw.split("%").slice(0,55).join("%")){
    if(gp.has(c)){if(!cur.length)start=page;cur.push(gp.get(c));end=page}
    else if(c==="%")page++;
    else if(c!=="/"&&!/\s/u.test(c))finish();
  }
  finish();
  const actual=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  check(JSON.stringify(words.flatMap(x=>x.w))===JSON.stringify(actual),"source mismatch");
  check(words.length===2896&&actual.length===12956,"source counts");
  /** @param {number} n @param {number} k @returns {bigint} */
  function choose(n,k){if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n+1-i)/BigInt(i);return x}
  /** @param {bigint} n @returns {number} */
  const bitlen=n=>n===0n?0:n.toString(2).length;
  const num=(a,b)=>a.reduce((v,d)=>v*b+BigInt(d),0n);
  const digits=(x,b,L)=>{const a=Array(L);for(let i=L-1;i>=0;i--){a[i]=Number(x%b);x/=b}check(x===0n,"digit overflow");return a};
  const rank=(c,p,cyc)=>cyc?(c-p+29)%29-1:c-(c>p?1:0);
  const unrank=(r,p,cyc)=>cyc?(p+r+1)%29:r+(r>=p?1:0);
  const schedules=words.map(({w},i)=>{
    const e=w.slice(1).filter((x,j)=>x===w[j]).length;
    return {L:w.length,e,gap:i?words[i-1].w.at(-1)===w[0]:null};
  });
  check(schedules.reduce((s,x)=>s+x.e,0)===63,"interior repeats");
  check(schedules.filter(x=>x.gap===true).length===23,"seam repeats");
  const phys=p=>p>=50?p+1:p;
  const bounds=[];
  for(const mode of ["word","gap"]){
    for(let A=26;A<=29;A++){
      let a=1n,b=1n,bestA=1n,bestB=1n,s=0,bs=0,be=-1,gA=1n,gB=1n,local=0;
      for(let i=0;i<schedules.length;i++){
        const {L,e,gap}=schedules[i],first=mode==="word"||gap===null?29:gap?1:28;
        const P=BigInt(A)**BigInt(L),M=BigInt(first)*choose(L-1,e)*28n**BigInt(L-1-e);
        if(P>M)local++;
        a*=P;b*=M;gA*=P;gB*=M;
        if(a*bestB>bestA*b){bestA=a;bestB=b;bs=s;be=i}
        if(a<=b){a=1n;b=1n;s=i+1}
      }
      const states=(bestA+bestB-1n)/bestB,global=(gA+gB-1n)/gB;
      bounds.push({mode,A,local,range:[bs,be],runes:schedules.slice(bs,be+1).reduce((s,x)=>s+x.L,0),
        physical:[phys(words[bs].start),phys(words[be].end)],states:states.toString(),bits:bitlen(states-1n),globalBits:bitlen(global-1n)});
    }
  }
  /** Return the word rank in the chosen order of three finite fields. */
  function pack(w,prev,schedule,mode,cyc,order){
    const {L,e,gap}=schedule,t=L-1-e;
    let a=w[0],m=29n;
    if(mode==="gap"&&gap!==null){
      check(prev!==null&&(w[0]===prev)===gap,"seam constraint");
      a=gap?0:rank(w[0],prev,cyc);m=gap?1n:28n;
    }
    let b=0n,d=0n,k=0;
    for(let j=1;j<L;j++){
      if(w[j]===w[j-1])b+=choose(j-1,++k);
      else d=28n*d+BigInt(rank(w[j],w[j-1],cyc));
    }
    check(k===e,"word repeat constraint");
    const f={A:[BigInt(a),m],B:[b,choose(L-1,e)],D:[d,28n**BigInt(t)]};
    let r=0n,M=1n;
    for(const c of order){const [v,n]=f[c];check(v>=0n&&v<n,"field range");r=r*n+v;M*=n}
    return {r,M,L,t};
  }
  /** Invert the three finite fields and restore every original GP29 rune. */
  function unpack(r,prev,schedule,mode,cyc,order){
    const {L,e,gap}=schedule,t=L-1-e;
    const bases={A:mode==="word"||gap===null?29n:gap?1n:28n,B:choose(L-1,e),D:28n**BigInt(t)};
    const f={};
    for(const c of [...order].reverse()){f[c]=r%bases[c];r/=bases[c]}
    check(r===0n,"rank overflow");
    const eq=new Set();
    let b=f.B,ceiling=L-1;
    for(let j=e;j>=1;j--){let k=ceiling-1;while(choose(k,j)>b)k--;eq.add(k);b-=choose(k,j);ceiling=k}
    check(b===0n,"combination inverse");
    const d=digits(f.D,28n,t);
    const first=mode==="word"||gap===null?Number(f.A):gap?prev:unrank(Number(f.A),prev,cyc);
    const w=[first];let k=0;
    for(let j=1;j<L;j++)w.push(eq.has(j-1)?w.at(-1):unrank(d[k++],w.at(-1),cyc));
    return w;
  }
  /** Invert the streaming quotient from a selected terminal state. */
  function decode(rows,A,terminal){
    let state=terminal;const out=Array(rows.length);
    for(let i=rows.length-1;i>=0;i--){
      const {M,r,L}=rows[i],P=BigInt(A)**BigInt(L),v=state*M+r;
      out[i]=digits(v%P,BigInt(A),L);state=v/P;
    }
    return {state,out};
  }
  /** Encode all words, using the actual public lengths/repeat schedule. */
  function encode(plain,A,initial,sch,mode,cyc,order){
    let state=initial,prev=null;const out=[];
    for(let i=0;i<plain.length;i++){
      const {L,e,gap}=sch[i],m=mode==="word"||gap===null?29n:gap?1n:28n;
      const P=BigInt(A)**BigInt(L),M=m*choose(L-1,e)*28n**BigInt(L-1-e);
      const v=state*P+num(plain[i],BigInt(A)),r=v%M;state=v/M;
      const w=unpack(r,prev,sch[i],mode,cyc,order);out.push(w);prev=w.at(-1);
    }
    return {state,out};
  }
  const lex=Array.from({length:15},()=>new Map());
  const add=a=>{if(a.length&&a.length<=14&&a.every(x=>x!==undefined))lex[a.length].set(a.join(","),a)};
  const spell=corpus.translit.map((x,i)=>[x,i]);spell.push(["ING",21],["IO",27]);
  for(const line of dict.split("\n")){
    const m=/^([a-z]+)\s+\d+\s*$/.exec(line);if(!m)continue;
    const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    const walk=(p,a)=>{if(p===s.length){add(a);return}if(a.length===14)return;for(const [t,i] of spell)if(s.startsWith(t,p))walk(p+t.length,a.concat(i))};
    walk(0,[]);
  }
  const donor=native.sections.flatMap(s=>(s.source_text.match(/[\u16A0-\u16FF]+/gu)||[]).map(w=>[...w].map(x=>gp.get(x))));
  donor.forEach(add);
  const needed=new Map;
  for(const {L,e} of schedules)needed.set(`${L}:${L-1-e}`,{L,t:L-1-e});
  const suffixSets=Array.from({length:29},(_,omit)=>{
    const sets=new Map;
    for(const [key,{L,t}] of needed){
      const ss=new Set;
      for(const a of lex[L].values())if(!a.includes(omit)){
        let v=0n;for(const x of a.slice(L-t))v=v*28n+BigInt(x-(x>omit?1:0));ss.add(v);
      }
      sets.set(key,ss);
    }
    return sets;
  });
  function ioc(a,A){const f=Array(A).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
  const variants=[],orders=["ABD","ADB","BAD","BDA","DAB","DBA"];
  const control=donor.filter(w=>w.length<=14&&!w.includes(12)&&!w.includes(22));
  check(control.length>100,"native control size");
  const controlSch=control.map((w,i)=>{
    const same=schedules.filter(s=>s.L===w.length);
    const chosen=same[i%same.length]||{e:0};
    return {L:w.length,e:chosen.e,gap:i===0?null:i%37===0};
  });
  for(const mode of ["word","gap"])for(const cyc of [false,true])for(const order of orders){
    const rows=words.map(({w},i)=>pack(w,i?words[i-1].w.at(-1):null,schedules[i],mode,cyc,order));
    for(let i=0;i<words.length;i++){
      const w=unpack(rows[i].r,i?words[i-1].w.at(-1):null,schedules[i],mode,cyc,order);
      check(w.join(",")===words[i].w.join(","),"original unpack mismatch");
    }
    const candidates=[];
    for(const A of [26,27,28,29]){
      const d=decode(rows,A,0n),en=encode(d.out,A,d.state,schedules,mode,cyc,order);
      check(en.state===0n&&JSON.stringify(en.out)===JSON.stringify(words.map(x=>x.w)),"original carry replay");
      const omit=A===27?[12,22]:A===28?[12]:A===26?[12,22,25]:[];
      const alphabet=Array.from({length:29},(_,i)=>i).filter(i=>!omit.includes(i));
      const nativeWords=d.out.map(w=>w.map(x=>alphabet[x]));
      const longHits=nativeWords.filter(w=>w.length>=5&&lex[w.length].has(w.join(","))).length;
      candidates.push({A,initialBits:bitlen(d.state),initialHexPrefix:d.state.toString(16).slice(0,16),
        ioc:ioc(d.out.flat(),A),longHits,preview:nativeWords.slice(0,12).map(w=>w.map(x=>corpus.translit[x]).join("")).join(" ")});
    }
    let best=null;
    const tails=rows.map(({r,L,t})=>({L,t,value:r%28n**BigInt(t)}));
    for(let omit=0;omit<29;omit++){
      let allHits=0,longHits=0,train=0,hold=0;
      for(let i=0;i<tails.length;i++){
        const {L,t,value}=tails[i];
        const ok=suffixSets[omit].get(`${L}:${t}`).has(value);
        allHits+=ok;
        if(L>=5&&ok){longHits++;if(words[i].start<=2)train++;if(words[i].start>=16)hold++;}
      }
      const rec={omit,allHits,longHits,train,hold};
      if(!best||rec.longHits>best.longHits)best=rec;
    }
    // Native GP27 and GP28 donor positives, with original length-matched e constraints,
    // a known nonzero initial carry, and exact complete inverse/re-encoding.
    for(const A of [27,28]){
      const omit=A===27?[12,22]:[12];
      const a=Array.from({length:29},(_,i)=>i).filter(i=>!omit.includes(i));
      const plain=control.map(w=>w.map(x=>a.indexOf(x)));
      const e=encode(plain,A,3301n,controlSch,mode,cyc,order);
      const rr=e.out.map((w,i)=>pack(w,i?e.out[i-1].at(-1):null,controlSch[i],mode,cyc,order));
      const recovered=decode(rr,A,e.state);
      check(recovered.state===3301n&&JSON.stringify(recovered.out)===JSON.stringify(plain),"native carry control");
      if(A===28){
        for(let i=0;i<rr.length;i++){
          const {r,t}=rr[i];
          check(num(plain[i].slice(plain[i].length-t),28n)===r%28n**BigInt(t),"native suffix theorem");
        }
      }
    }
    variants.push({mode,cyc,order,candidates,best});
  }
  return {words:words.length,runes:actual.length,dict:lex.reduce((s,m)=>s+m.size,0),
    longWords:words.filter(x=>x.w.length>=5).length,nativeWords:control.length,nativeRunes:control.flat().length,
    bounds,variants};
}
const root=path.join(__dirname,'..','resources');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const result=analyze(JSON.parse(read('liber-primus/lp2-corpus.json')),read('lp2-transcription.txt'),read('control/english_wordfreq_textblob.txt'),JSON.parse(read('external/relikd-solved-gp29-native-v1.json')));
console.log(JSON.stringify(result,null,2));
