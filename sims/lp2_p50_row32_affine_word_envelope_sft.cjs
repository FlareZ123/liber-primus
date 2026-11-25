"use strict";
const fs=require("node:fs");
const path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-grid-256.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
function run(data) {
  const [gp,grid]=data.slice(0,2).map(JSON.parse);
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const index=new Map(gp.runes.map((s,i)=>[s,i]));
  const words=[]; let w=[], page=0, start=0;
  const flush=()=>{if(w.length)words.push({digits:w,page:start+(start>=50?1:0)});w=[]};
  for(const c of data[2].split("%").slice(0,55).join("%")){
    if(index.has(c)){if(!w.length)start=page;w.push(index.get(c));}
    else if(c==="%")page++;
    else if(c!=="/"&&!/\s/u.test(c))flush();
  }
  flush();
  const original=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  assert(words.length===2896 && original.length===12956 && words.flatMap(w=>w.digits).join(",")===original.join(","),"source word parsing");
  const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} word @returns {number[]} */
  function encode(word){
    const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    let out=[];
    for(let i=0;i<s.length;){
      if(s.startsWith("ING",i)){out.push(21);i+=3;}
      else if(s.startsWith("IO",i)){out.push(27);i+=2;}
      else {const t=tok.find(t=>s.startsWith(t.s,i));assert(t,"encoding");out.push(t.i);i+=t.s.length;}
    }
    return out;
  }
  const p57=(data[7].split("### 57\n")[1].match(/[A-Z]+/g)||[]).map(encode);
  assert(p57.flat().join(",")===gp.pages[57].indices.join(","),"native p57 spelling");
  const M=Array.from({length:15},(_,i)=>29n**BigInt(i));
  const mod=(x,m)=>(x%m+m)%m;
  const pack=d=>d.reduce((v,x)=>v*29n+BigInt(x),0n);
  function unpack(v,n){const d=Array(n);for(let i=n-1;i>=0;i--){d[i]=Number(v%29n);v/=29n;}return d;}
  function inv(a,m){let x=1n,y=0n,b=m;while(b){let q=a/b;[a,b]=[b,a%b];[x,y]=[y,x-q*y];}assert(a===1n,"nonunit");return mod(x,m);}
  const vocab1=Array.from({length:15},()=>new Set());
  const vocab2=Array.from({length:15},()=>new Set());
  const add=(sets,arr)=>{for(const w of arr){const d=encode(w);if(d.length<=14&&d.length)sets[d.length].add(pack(d));}};
  const freq=data[3].split(/\r?\n/).map(l=>l.match(/^([a-z]+)\s+\d+$/i)?.[1]).filter(Boolean);
  const extract=s=>s.match(/[A-Za-z]+/g)||[];
  add(vocab1,[...freq,...extract(data[4]),...extract(data[5])]);
  for(let i=1;i<=14;i++)for(const x of vocab1[i])vocab2[i].add(x);
  add(vocab2,[...extract(data[6]),...extract(data[7])]);
  const pools=Array.from({length:15},()=>[]);
  for(const w of extract(data[6])){const d=encode(w);if(d.length&&d.length<=14)pools[d.length].push(d);}
  const models=[];
  for(const radix of [59,60]){
    const alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
    const bytes=grid.pages.flatMap(p=>p.tokens).map(t=>{const a=alphabet.indexOf(t[0]),b=alphabet.indexOf(t[1]);assert(a>=0&&b>=0,"digit");return a*radix+b;});
    assert(bytes.length===256&&bytes.every(x=>x>=0&&x<=255),"grid bytes");
    const be=x=>x.reduce((v,b)=>256n*v+BigInt(b),0n);
    for(const swap of [false,true]){
      const rows=[];
      for(let r=0;r<32;r++){
        const b=bytes.slice(8*r,8*r+8);
        const A=be(b.slice(swap?4:0,swap?8:4)),B=be(b.slice(swap?0:4,swap?4:8));
        if(A%29n!==0n)rows.push({r,A,B,invs:M.map((m,i)=>i?inv(A,m):0n)});
      }
      models.push({radix,swap,rows});
    }
  }
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  const groups=words.map(w=>({n:w.digits.length,c:pack(w.digits),page:w.page}));
  const decrypt=(c,n,row)=>mod(row.invs[n]*(c-row.B),M[n]);
  const encrypt=(p,n,row)=>mod(row.A*p+row.B,M[n]);
  const domain=(g,ms)=>{const out=new Set();for(const m of ms)for(const r of m.rows){let p=decrypt(g.c,g.n,r);assert(encrypt(p,g.n,r)===g.c,"original inverse");out.add(p);}return out;};
  function coverage(gs,ms){
    const byLength=Array.from({length:15},()=>({total:0,base:0,broad:0,unique:0}));
    const byChapter=chapters.map(([lo,hi])=>({lo,hi,total:0,runes:0,base:0,broad:0,broadRunes:0,long:0,longHits:0}));
    let base=0,broad=0,baseRunes=0,broadRunes=0,long=0,longHits=0,maxRun=0,run=0,examples=[];
    for(const g of gs){
      const cand=domain(g,ms),n=g.n;
      const c1=[...cand].filter(x=>vocab1[n].has(x)),c2=[...cand].filter(x=>vocab2[n].has(x));
      const h1=Number(c1.length>0),h2=Number(c2.length>0),ch=byChapter.find(t=>g.page>=t.lo&&g.page<=t.hi);
      base+=h1;broad+=h2;baseRunes+=h1*n;broadRunes+=h2*n;
      byLength[n].total++;byLength[n].base+=h1;byLength[n].broad+=h2;byLength[n].unique+=Number(c2.length===1);
      if(ch){ch.total++;ch.runes+=n;ch.base+=h1;ch.broad+=h2;ch.broadRunes+=h2*n;if(n>=8){ch.long++;ch.longHits+=h2;}}
      if(n>=8){long++;longHits+=h2;if(h2&&examples.length<20)examples.push({page:g.page,n,candidates:c2.map(v=>unpack(v,n).map(x=>gp.translit[x]).join(""))});}
      run=h2?run+n:0;maxRun=Math.max(run,maxRun);
    }
    return {total:gs.length,runes:gs.reduce((s,g)=>s+g.n,0),base,broad,baseRunes,broadRunes,long,longHits,maxRun,byLength:byLength.slice(1),byChapter,examples};
  }
  const results=models.map(m=>({radix:m.radix,swap:m.swap,rows:m.rows.length,...coverage(groups,[m])}));
  const union=coverage(groups,models);
  // Independent row selector recovery on four independently keyed width-matched
  // Shakespeare plants. We train offset on p0-7 and freeze it for later pages.
  const controls=models.map((m,j)=>{
    const nrows=m.rows.length, hidden=[3,11,17,23][j]%nrows;
    let seed=(0x33012026^(j*0x9e3779b9))>>>0;
    const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
    const chosen=groups.map((g,i)=>{
      const pool=pools[g.n];assert(pool.length,"plant word width");
      const p=pack(pool[rand()%pool.length]),row=m.rows[(i+hidden)%nrows];
      return {...g,p,c:encrypt(p,g.n,row)};
    });
    const score=Array.from({length:nrows},(_,off)=>chosen.reduce((s,g,i)=>s+(g.page<=7&&vocab1[g.n].has(decrypt(g.c,g.n,m.rows[(i+off)%nrows]))?g.n:0),0));
    const best=Math.max(...score),wins=score.map((s,i)=>s===best?i:-1).filter(i=>i>=0);
    let exact=0,held=0,heldExact=0;
    for(let i=0;i<chosen.length;i++){const g=chosen[i],p=decrypt(g.c,g.n,m.rows[(i+wins[0])%nrows]);if(p===g.p)exact+=g.n;if(g.page>=16){held+=g.n;if(p===g.p)heldExact+=g.n;}}
    assert(wins.length===1&&wins[0]===hidden&&exact===12956,"control offset recovery");
    const cov=coverage(chosen,[m]);assert(cov.broad===2896,"broad oracle retains all planted words");
    return {radix:m.radix,swap:m.swap,hidden,wins,margin:best-Math.max(...score.filter((_,i)=>i!==hidden)),exact,held,heldExact,base:cov.base,baseRunes:cov.baseRunes,broad:cov.broad,broadRunes:cov.broadRunes};
  });
  return {vocab1:vocab1.map(s=>s.size),vocab2:vocab2.map(s=>s.size),results,union,controls};
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(run(data),null,2));
