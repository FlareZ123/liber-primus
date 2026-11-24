'use strict';
// GP29 spacing-free shared word-reset p56 prime origin recovery.
// Run from repository root: node sims/lp2_latent_word_prime_origin_sft.cjs
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function run(gp,gold,dict) {
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const glyph=new Map(gp.runes.map((x,i)=>[x,i]));
  const tokens=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
  function encode(s){
    s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const out=[];
    for(let i=0;i<s.length;){
      if(s.startsWith("ING",i)){out.push(21);i+=3;continue}
      if(s.startsWith("IO",i)){out.push(27);i+=2;continue}
      const t=tokens.find(t=>s.startsWith(t[0],i));if(!t)return [];
      out.push(t[1]);i+=t[0].length;
    }
    return out;
  }
  const native=new Map(gold.sections.map(s=>[s.name,(s.source_text.match(new RegExp("["+gp.runes.join("")+"]+","gu"))||[]).map(w=>Array.from(w,x=>glyph.get(x)))]));
  const entries=new Map();
  let total=0;
  function add(p,label,f){
    if(!p.length || (p.length===1&&p[0]!==24&&p[0]!==10))return;
    const k=p.join(",");
    const old=entries.get(k);if(!old||old.f<f)entries.set(k,{p,label,f})
  }
  for(const row of dict.split(/\r?\n/)){
    const m=/^([a-z]+) (\d+)$/.exec(row);if(!m)continue;
    add(encode(m[1]),m[1],+m[2]);total+=+m[2];
  }
  for(const words of native.values())for(const w of words)add(w,w.map(x=>gp.translit[x]).join(""),1);
  const root={next:new Map(),terminal:null};let maxLength=0;
  for(const e of entries.values()){
    let t=root;for(const x of e.p){if(!t.next.has(x))t.next.set(x,{next:new Map(),terminal:null});t=t.next.get(x)}
    t.terminal={label:e.label,p:e.p,score:Math.log(e.f/total)};
    maxLength=Math.max(maxLength,e.p.length);
  }
  const primes=[];for(let x=2;primes.length<3302+Math.max(maxLength,90);x++){let ok=true;for(const p of primes){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)primes.push(x)}
  const key=primes.map(x=>(x-1)%29);
  function encrypt(words,start,reset=true){
    let k=start;const out=[];
    for(const w of words){if(reset)k=start;for(const p of w){out.push(p===0?0:mod(p+key[k++]));}}
    return out;
  }
  const p56=gp.pages.find(p=>p.page===56).indices;
  assert(JSON.stringify(encrypt(native.get("p56_an_end"),0,false))===JSON.stringify(p56),"authentic p56");
  function decode(c,start,{clip=false,trace=false}={}){
    const n=c.length;
    const miss=new Int32Array(n+1).fill(n+1),score=new Float64Array(n+1).fill(-Infinity);
    const exact=new Uint8Array(n+1);const back=trace?Array(n+1):null;
    miss[0]=0;score[0]=0;exact[0]=1;
    let prefixExact=false;
    function relax(j,i,m,s,term){
      if(m<miss[j]||(m===miss[j]&&s>score[j])){miss[j]=m;score[j]=s;if(back)back[j]={i,term}}
    }
    for(let i=0;i<n;i++){
      if(miss[i]>n)continue;
      relax(i+1,i,miss[i]+1,score[i]-9,null);
      function walk(j,k,t){
        if(t.terminal){relax(j,i,miss[i],score[i]+t.terminal.score,t.terminal);if(exact[i])exact[j]=1;}
        if(j===n){if(clip&&exact[i]&&(t.terminal||t.next.size))prefixExact=true;return}
        if(j-i>=maxLength)return;
        const x=c[j];
        if(x===0&&t.next.has(0))walk(j+1,k,t.next.get(0));
        const p=mod(x-key[k]);if(p!==0&&t.next.has(p))walk(j+1,k+1,t.next.get(p));
      }
      walk(i,start,root)
    }
    let words=null,plain=null;
    if(back){words=[];plain=[];for(let j=n;j>0;){const b=back[j];if(!b)throw Error("missing backtrack");words.push(b.term?b.term.label:"?");plain.unshift(...(b.term?b.term.p:[-1]));j=b.i}words.reverse()}
    return {start,omitted:miss[n],score:score[n],exact:!!exact[n],prefixExact:!!exact[n]||prefixExact,words,plain};
  }
  function compare(a,b){return a.omitted-b.omitted||b.score-a.score||a.start-b.start}
  function rank(c,clip=false){
    const rows=[];for(let start=0;start<=3301;start++)rows.push(decode(c,start,{clip}));
    rows.sort(compare);return {rows,exactStarts:rows.filter(x=>x.exact).map(x=>x.start),prefixStarts:rows.filter(x=>x.prefixExact).map(x=>x.start)}
  }
  function control(name,start){
    const w=native.get(name).filter(w=>w.length!==1||w[0]===24||w[0]===10);
    let split=0,used=0;while(split<w.length&&used<160){used+=w[split++].length}
    if(split===w.length)split=Math.floor(w.length/2);
    const a=w.slice(0,split),b=w.slice(split),c=encrypt(a,start),d=encrypt(b,start);
    const fit=rank(c);const chosen=fit.rows[0].start;const pred=decode(d,chosen,{trace:true});
    const correct=b.flat();const exactGold=pred.plain.every((x,i)=>x===correct[i]);
    return {name,plantedStart:start,fitRunes:c.length,holdoutRunes:d.length,chosen,plantedRank:fit.rows.findIndex(x=>x.start===start)+1,fitExactStarts:fit.exactStarts.length,heldoutOmitted:pred.omitted,heldoutExactPlaintext:exactGold,heldoutRecoveredRunes:pred.plain.filter((x,i)=>x===correct[i]).length,heldoutScorePerRune:pred.score/d.length}
  }
  const controls=[control("0_welcome",2014),control("0_koan_1",3301),control("p57_parable",83)];
  const p=gp.pages.find(x=>x.page===0).indices;
  const h=gp.pages.filter(x=>x.page>=16&&x.page<=17).flatMap(x=>x.indices);
  const fit=rank(p,true);const chosen=fit.rows[0].start;
  const trace=decode(p,chosen,{trace:true,clip:true}),held=decode(h,chosen,{trace:true});
  return {lexicon:entries.size,maxLength,p56Exact:p56.length,controls,original:{fit:"p0 262 runes, starts 0–3301, final latent partial word allowed in exact prefix gate",holdout:"p16–17 540 runes, frozen origin, diagnostic only because latent edges may cross pages",fitExactStarts:fit.exactStarts,fitPrefixStarts:fit.prefixStarts,bestTen:fit.rows.slice(0,10).map(({start,omitted,score})=>({start,omitted,score})),selected:{start:chosen,omitted:trace.omitted,scorePerRune:trace.score/p.length,words:trace.words.join(" ")},heldout:{omitted:held.omitted,scorePerRune:held.score/h.length,words:held.words.join(" ")}}}
}
const result=run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/control/english_wordfreq_textblob.txt'));
console.log(JSON.stringify(result,null,2));
