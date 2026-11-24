"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(raw,corp,freq,solved,gibran) {
  const check=(x,m)=>{if(!x)throw Error(m)};
  const runeMap=new Map(corp.runes.map((x,i)=>[x,i])),pages=raw.split("%");
  const mod=(x,m)=>((x%m)+m)%m,M=Array.from({length:20},(_,i)=>29n**BigInt(i));
  const val=(w,reverse=false)=>(reverse?[...w].reverse():w).reduce((v,x)=>v*29n+BigInt(x),0n);
  const digits=(v,L)=>{const w=Array(L);for(let i=L-1;i>=0;i--){w[i]=Number(v%29n);v/=29n}return w};
  function parse(parts){
    const out=[];let w=[],p=0,start=0,offset=0;
    const finish=()=>{if(w.length){out.push({w,L:w.length,p:start,t:out.length,u:offset-w.length});w=[]}};
    for(const ch of parts.join("%")){
      if(runeMap.has(ch)){if(!w.length)start=p;w.push(runeMap.get(ch));offset++}
      else if(ch==="%")p++;
      else if(ch!=="/"&&!/\s/u.test(ch))finish();
    }finish();return out;
  }
  const p57=parse([pages[56]]).map(x=>x.w);
  check(p57.flat().join(",")===corp.pages.find(x=>x.page===57).indices.join(","),"solved p57");
  const tokens=["ING","IO",...corp.translit].sort((a,b)=>b.length-a.length);
  function encodeEnglish(w){let s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");const out=[];while(s.length){const t=tokens.find(x=>s.startsWith(x));if(!t)return null;out.push(corp.translit.indexOf(t==="ING"?"NG":t==="IO"?"IA":t));s=s.slice(t.length)}return out}
  const dict=Array.from({length:20},()=>new Map());
  function add(w,n=0){if(w&&w.length&&w.length<15){const k=w.join(","),old=dict[w.length].get(k);dict[w.length].set(k,{w,n:(old?.n??0)+n})}}
  for(const line of freq.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&!/q(?!u)/.test(m[1]))add(encodeEnglish(m[1]),Number(m[2]))}
  const sourceWords=s=>[...s.matchAll(/[a-z]+/gi)].map(x=>encodeEnglish(x[0]));
  const nativeLP1=sourceWords(solved.split("\n").filter(x=>!/^#|^\[/.test(x)).join("\n")).filter(w=>w&&w.length<15);
  for(const w of nativeLP1)add(w);
  for(const w of p57)add(w);
  const ranked=dict.map(d=>[...d.values()].sort((a,b)=>{const x=val(a.w),y=val(b.w);return x<y?-1:x>y?1:0}));
  const ranks=ranked.map(d=>new Map(d.map((x,i)=>[x.w.join(","),i]))),D=ranked.map(x=>x.length);
  check(D.every((n,i)=>BigInt(n)<=M[i]),"rank capacity");
  const MAX=840;
  function plant(words,a,b){return words.map((w,t)=>{const L=w.length,rank=ranks[L].get(w.join(","));check(rank!==undefined,"native dictionary coverage");return {t,L,w:digits(mod(BigInt(rank)+BigInt(a)+BigInt(b)*BigInt(t),M[L]),L)}})}
  function recover(rows){
    const obs=rows.map(x=>({...x,c:val(x.w),m:M[x.L],d:BigInt(D[x.L])})).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:b.L-a.L);
    const anchor=obs.filter(x=>x.m>BigInt(MAX)).sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:b.L-a.L)[0];
    check(anchor,"need multiword rank anchor");const results=[];
    for(let b=0;b<=MAX;b++){const B=BigInt(b),z=mod(anchor.c-B*BigInt(anchor.t),anchor.m);
      for(const base of [z,z+anchor.m]){
        const lo=base-anchor.d+1n>0n?base-anchor.d+1n:0n,hi=base<BigInt(MAX)?base:BigInt(MAX);
        for(let A=lo;A<=hi;A++){
          let score=0,valid=true;
          for(const x of obs){const rank=mod(x.c-A-B*BigInt(x.t),x.m);if(rank>=x.d){valid=false;break}score+=Math.log1p(ranked[x.L][Number(rank)].n)}
          if(valid)results.push({key:[Number(A),b],score});
        }
      }
    }return results.sort((a,b)=>b.score-a.score);
  }
  function decode(rows,a,b){return rows.map(x=>ranked[x.L][Number(mod(val(x.w)-BigInt(a)-BigInt(b)*BigInt(x.t),M[x.L]))]?.w??null)}
  let seed=2468;function rng(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n}
  const g=sourceWords(gibran),windows=[];
  for(let start=0;start+80<=g.length;start+=80){const w=g.slice(start,start+80);if(w.every(x=>x&&x.length<15&&ranks[x.length].has(x.join(","))))windows.push(w)}
  check(windows.length>=5,"independent contiguous Gibran controls");
  const plants=[p57,...Array.from({length:5},(_,i)=>nativeLP1.slice(i*80,(i+1)*80)),...windows.slice(0,5)];
  const controls=plants.map((w,i)=>{
    const a=rng(841),b=rng(841),cut=Math.floor(w.length*.6),cipher=plant(w,a,b),keys=recover(cipher.slice(0,cut));
    const pos=keys.findIndex(x=>x.key[0]===a&&x.key[1]===b);
    check(pos!==-1,"exhaustive solver missed true key "+i);
    const decoded=decode(cipher,...keys[0].key);
    const exact=decoded.every((x,j)=>x&&x.join(",")===w[j].join(","));
    if(decoded.every(Boolean))check(plant(decoded,...keys[0].key).every((x,j)=>x.w.join(",")===cipher[j].w.join(",")),"control replay");
    return {source:i===0?"p57":i<=5?"LP1":"Gibran",words:w.length,train:cut,holdout:w.length-cut,trueKey:[a,b],keyCount:keys.length,trueRank:pos+1,bestKey:keys[0].key,scoreMargin:keys.length>1?keys[0].score-keys[1].score:null,exact,heldoutRecovered:decoded.slice(cut).filter((x,j)=>x&&x.join(",")===w[cut+j].join(",")).length,runes:w.flat().length};
  });
  // Original unknowns opened only after blind control key selection.
  const all=parse(pages.slice(0,55));
  check(all.length===2896&&all.reduce((n,x)=>n+x.L,0)===12956,"original word counts");
  for(let i=0;i<55;i++){const physical=i>=50?i+1:i,observed=[...pages[i]].filter(x=>runeMap.has(x)).map(x=>runeMap.get(x));check(observed.join(",")===corp.pages.find(p=>p.page===physical).indices.join(","),"source page "+physical)}
  const ends=[3,8,15,23,27,33,40,54,56];
  const chapter=all.map(x=>({...x,phys:x.p>=50?x.p+1:x.p})).map(x=>({...x,ch:ends.findIndex(e=>x.phys<e)}));
  // All-key rank capacity lower bound for same-length triples.
  // C_i = rank_i + A_L + B_L * time_i (mod 29^L).
  // (t_k-t_j) C_i - (t_k-t_i) C_j + (t_j-t_i) C_k cancels A,B.
  // Its centered residue cannot exceed (t_k-t_i)*(D_L-1).
  const results=[];
  for(const reverse of [false,true])for(const clock of ["t","u"]){
    const rows=[];
    for(let ch=0;ch<9;ch++){
      const words=chapter.filter(x=>x.ch===ch);let best=null;
      for(let L=1;L<=14;L++){
        const same=words.filter(x=>x.L===L);
        for(let j=1;j+1<same.length;j++){
          const [x,y,z]=same.slice(j-1,j+2),t=BigInt(y[clock]-x[clock]),s=BigInt(z[clock]-y[clock]);
          const c=[x,y,z].map(q=>val(q.w,reverse)),residue=mod(s*c[0]-(s+t)*c[1]+t*c[2],M[L]),abs=residue<M[L]-residue?residue:M[L]-residue,lower=1n+(abs+s+t-1n)/(s+t);
          if(!best||lower>best.lower)best={L,lower,words:[x.t,y.t,z.t],pages:[x.phys,y.phys,z.phys],times:[x[clock],y[clock],z[clock]],cipher:c.map(String),digits:[x.w,y.w,z.w],residue:String(residue),centeredAbs:String(abs),dict:D[L]};
        }
      }
      rows.push({...best,lower:String(best.lower),chapter:ch+1});
    }
    results.push({reverse,clock,rows});
  }
  const originalKeys=recover(chapter.filter(x=>x.ch===0));
  return {D,controls,originalKeys,results,unknownWords:all.length};
}
const paths=["resources/lp2-transcription.txt","resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt"];
const src=paths.map(read);
console.log(JSON.stringify(experiment(src[0],JSON.parse(src[1]),src[2],src[3],src[4]),null,2));
