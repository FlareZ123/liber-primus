"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(corpus, ink, transcript, shakespeare, gibran) {
  const check=(x,m)=>{if(!x)throw Error(m)};
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  const map=new Map(corpus.runes.map((r,i)=>[r,i]));
  const segments=transcript.split("%");
  const parse=(start,end,skip,count)=>{
    const all=segments.slice(start,end+1).join("").replace(/[\/\r\n]/g,"");
    const words=[];let w=[];
    for(const ch of all){if(map.has(ch))w.push(map.get(ch));else if(w.length){words.push(w);w=[];}}
    if(w.length)words.push(w);
    const original=corpus.pages.slice(start,end+1).flatMap(p=>p.indices);
    check(eq(words.flat(),original),"source alignment "+start);
    const selected=[];let off=0;
    for(const word of words){if(off>=skip&&off+word.length<=skip+count)selected.push(word);off+=word.length;}
    check(eq(selected.flat(),original.slice(skip,skip+count)),"complete word edges "+start);
    const title=ink.pages.find(p=>p.page===start).red_spans[0];
    check(title.start===0&&title.length===skip,"title "+start);
    const seed=original.slice(0,skip).reduce((sum,v)=>sum+corpus.prime[v],0);
    return {start,seed,lengths:selected.map(w=>w.length),c:selected.flat()};
  };
  const sections=[parse(0,2,13,716),parse(3,3,16,103),parse(8,14,12,1717)];
  const alphabet=corpus.translit.map((token,id)=>({token,id})).sort((a,b)=>b.token.length-a.token.length);
  const native=word=>{const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){out.push(21);i+=3;continue;}if(s.startsWith("IO",i)){out.push(27);i+=2;continue;}let h=alphabet.find(x=>s.startsWith(x.token,i));check(h,"GP "+s);out.push(h.id);i+=h.token.length;}return out};
  const nativeWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(native);
  const dictionary=new Set(), unigram=Array(29).fill(1), bigram=Array.from({length:29},()=>Array(29).fill(1));
  for(const word of nativeWords(shakespeare)){dictionary.add(word.join(","));for(let i=0;i<word.length;i++){unigram[word[i]]++;if(i)bigram[word[i-1]][word[i]]++;}}
  const total=unigram.reduce((a,b)=>a+b);
  const u=unigram.map(v=>Math.log(v/total));const b=bigram.map(row=>{const sum=row.reduce((a,v)=>a+v);return row.map(v=>Math.log(v/sum));});
  const pools=new Map();for(const w of nativeWords(gibran)){if(!pools.has(w.length))pools.set(w.length,[]);pools.get(w.length).push(w);}
  const score=(x,lengths)=>{let hits=0,hitWords=0,ll=0,k=0;for(const n of lengths){if(dictionary.has(x.slice(k,k+n).join(","))){hits+=n;hitWords++;}for(let i=0;i<n;i++){ll+=i?b[x[k+i-1]][x[k+i]]:u[x[k+i]];}k+=n;}return {value:(ll+4*hits)/x.length,coverage:hits/x.length,hitWords,words:lengths.length};};
  const inverses=Array.from({length:29},(_,a)=>Array.from({length:29},(_,i)=>i).find(i=>a*i%29===1));
  const mod=x=>(x%29+29)%29;
  /** Exact digit multiplication or inverse with initial carry, in source or reversed traversal. */
  const pass=(x,a,seed,reverse,decode)=>{const out=new Array(x.length);let carry=seed;for(let j=0;j<x.length;j++){let i=reverse?x.length-1-j:j;const p=decode?mod((x[i]-carry)*inverses[a]):x[i];const t=a*p+carry;out[i]=decode?p:t%29;carry=Math.floor(t/29);}return out;};
  const encode=(x,a,b,s)=>pass(pass(x,a,s,false,false),b,s,true,false);
  const decode=(x,a,b,s)=>pass(pass(x,b,s,true,true),a,s,false,true);
  const fit=(x,sec)=>{let winner=null;for(let a=1;a<=28;a++)for(let b=1;b<=28;b++){const p=decode(x,a,b,sec.seed),q=score(p,sec.lengths);if(!winner||q.value>winner.score.value)winner={a,b,score:q};}return winner;};
  const ioc=x=>{const f=Array(29).fill(0);for(const v of x)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));};
  const assess=(key,x,sec)=>{const p=decode(x,key.a,key.b,sec.seed);check(eq(encode(p,key.a,key.b,sec.seed),x),"replay");let k=0;const words=sec.lengths.map(n=>{const w=p.slice(k,k+n).map(i=>corpus.translit[i]).join("");k+=n;return w;});return {score:score(p,sec.lengths),ioc:ioc(p),prefix:words.slice(0,18).join(" ")};};
  let rng=0x24563301;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
  const plant=sec=>sec.lengths.flatMap(n=>{const p=pools.get(n);check(p?.length,"pool "+n);return p[rand()%p.length]});
  const controls=[];for(let trial=0;trial<4;trial++){const key={a:1+rand()%28,b:1+rand()%28};const plains=sections.map(plant);const cs=sections.map((s,i)=>encode(plains[i],key.a,key.b,s.seed));const found=fit(cs[0],sections[0]);const exact=sections.map((s,i)=>eq(decode(cs[i],found.a,found.b,s.seed),plains[i]));controls.push({key,found,exact,heldout:sections.slice(1).map((s,i)=>assess(found,cs[i+1],s))});}
  const nulls=[];for(let trial=0;trial<32;trial++){const cs=sections.map(s=>plant(s).map(v=>mod(v+rand()%29)));const key=fit(cs[0],sections[0]);nulls.push([key.score,...sections.slice(1).map((s,i)=>assess(key,cs[i+1],s).score)]);}
  const maxNull=sections.map((_,i)=>({score:Math.max(...nulls.map(n=>n[i].value)),coverage:Math.max(...nulls.map(n=>n[i].coverage))}));
  const key=fit(sections[0].c,sections[0]);const original=sections.map(s=>assess(key,s.c,s));
  return {scope:sections.map(s=>({page:s.start,seed:s.seed,runes:s.c.length,words:s.lengths.length})),key,original,controls,maxNull,nullTrials:nulls.length,origWithinNull:nulls.filter(n=>n[0].value>=key.score.value).length,originalReplays:true};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"];
const input=files.map(read);
console.log(JSON.stringify(experiment(JSON.parse(input[0]),JSON.parse(input[1]),...input.slice(2)),null,2));
