// Agent35 — previous-clause GP sum selects the one-based consecutive-prime origin.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const A=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const G=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const idx=new Map(A.runes.map((r,i)=>[r,i]));
const tape=s=>[...s].filter(x=>idx.has(x)).map(x=>idx.get(x));
const rawUnits=s=>s.replace(/[\/\s]/g,'').split(/[.&$]+/).filter(x=>tape(x).length);
const units=s=>rawUnits(s).map(tape);
const q=read('resources/transcriptions/lp2-image-corrected.txt').trim().split('%');
const p=read('resources/transcriptions/lp1_wulfic_canonical.txt').trim().split('%');
const native=G.sections.map(s=>tape(s.source_text));
const ranges=[[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40],[40,54],[54,56]];
const raw=ranges.map(([l,h])=>q.slice(l>=51?l-1:l,h>50?h-1:h).join(''));
const chapters=raw.map(units);
assert.deepEqual(chapters.flat(2),A.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
const sieve=new Uint8Array(900000),pr=[0];
for(let n=2;n<sieve.length;n++)if(!sieve[n]){pr.push(n);for(let j=n*n;j<sieve.length;j+=n)sieve[j]=1;}
assert(pr.length>109*Math.max(...chapters.flat().map(x=>x.length))+400);
const sh=pr.map(p=>(p-1+29)%29);
const sum=s=>s.reduce((v,i)=>v+A.prime[i],0),range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
function prime(n){if(n<2)return false;for(let j=2;j*j<=n;j++)if(n%j===0)return false;return true;}
function lm(ex){
 const counts=new Float64Array(29**3),tot=new Float64Array(29**2);
 for(let id=0;id<native.length;id++)if(id!==ex){const s=native[id];for(let i=2;i<s.length;i++){const k=s[i-2]*29+s[i-1];counts[29*k+s[i]]++;tot[k]++;}}
 const log=counts.map((x,i)=>Math.log((x+.1)/(tot[Math.floor(i/29)]+2.9)));
 return(p,i,v)=>i>=2?log[(p[i-2]*29+p[i-1])*29+v]:0;
}
function candidates(c,o,score,gate,visit){
 const memo=Array.from({length:c.length+1},()=>new Map());
 function can(i,j){
  if(i===c.length)return true;
  const x=memo[i].get(j);if(x!==undefined)return x;
  const v=(c[i]-sh[o+j]+29)%29;
  const yes=(c[i]===0&&can(i+1,j))||(v!==0&&can(i+1,j+1));
  memo[i].set(j,yes);return yes;
 }
 const out=new Map();if(!can(0,0))return out;
 const path=[];
 function walk(i,j,s,z){
  if(i===c.length){
   if(gate&&!prime(s))return;
   if(visit)visit(s,path);
   const old=out.get(s);
   if(!old)out.set(s,{n:1n,z,p:path.slice()});
   else{old.n++;if(z>old.z){old.z=z;old.p=path.slice();}}
   return;
  }
  const v=(c[i]-sh[o+j]+29)%29;
  const step=(x,k)=>{const zs=z+score(path,i,x);path.push(x);walk(i+1,k,s+A.prime[x],zs);path.pop();};
  if(c[i]===0&&can(i+1,j))step(0,j);
  if(v&&can(i+1,j+1))step(v,j+1);
 }
 walk(0,0,0,0);return out;
}
function solve(ch,score,gate,start,first=0,trackStarts=false){
 let cur=new Map([...start].map(o=>[o,{z:0,n:1n,seed:o,p:[],origins:[],starts:trackStarts?new Set([o]):null}]));
 const hist=[];
 for(let i=first;i<ch.length;i++){
  const next=new Map();
  for(const [o,b] of cur)for(const [s,v] of candidates(ch[i],o,score,gate&&i>0)){
   const old=next.get(s),z=b.z+v.z,n=b.n*v.n;
   const starts=trackStarts?new Set([...(old?.starts??[]),...b.starts]):null;
   if(!old||z>old.z)next.set(s,{z,n:n+(old?.n??0n),seed:b.seed,p:b.p.concat([v.p]),origins:b.origins.concat(o),starts});
   else{old.n+=n;if(trackStarts)old.starts=starts;}
  }
  hist.push({i,states:next.size,paths:[...next.values()].reduce((s,v)=>s+v.n,0n).toString()});
  cur=next;if(!cur.size)break;
 }
 return{hist,best:[...cur.values()].sort((a,b)=>b.z-a.z)[0],starts:trackStarts?[...new Set([...cur.values()].flatMap(x=>[...x.starts]))].sort((a,b)=>a-b):null};
}
const enc=(u,o)=>{let j=0;return u.map(p=>p===0?0:(p+sh[o+j++])%29);};
const make=(p,seed)=>p.map((u,i)=>enc(u,i?sum(p[i-1]):seed));
function replay(c,b,first){if(!b)return;b.p.forEach((p,i)=>assert.deepEqual(enc(p,b.origins[i]),c[first+i]));for(let i=1;i<b.p.length;i++)assert.equal(b.origins[i],sum(b.p[i-1]));}
function errors(x,y){return x.flat().filter((v,i)=>v!==y.flat()[i]).length;}
const warnings=units(p[0]).map(u=>u.map(x=>28-x)),loss=units(p.slice(8,12).join(''));
const controls=[[warnings,0,3301,true,6],[loss,4,1033,false,8]].map(([plain,ex,seed,gate,k])=>{
 const c=make(plain,seed),s=lm(ex),pref=solve(c.slice(0,k),s,gate,range(1,3301)),b=pref.best;
 const state=sum(b.p.at(-1)),hold=solve(c.slice(k),s,gate,[state]),full=solve(c,s,gate,range(1,3301));
 replay(c.slice(0,k),b,0);replay(c.slice(k),hold.best,0);replay(c,full.best,0);
 return{ex,seed,prefix:{last:pref.hist.at(-1),seed:b.seed,errors:errors(b.p,plain.slice(0,k)),bodyErrors:errors(b.p.slice(1),plain.slice(1,k)),state,trueState:sum(plain[k-1])},hold:{last:hold.hist.at(-1),errors:errors(hold.best.p,plain.slice(k)),len:plain.slice(k).flat().length},full:{last:full.hist.at(-1),seed:full.best.seed,errors:errors(full.best.p,plain),len:plain.flat().length}};
});
assert.equal(controls[0].prefix.bodyErrors,0);assert.equal(controls[0].hold.errors,0);assert.equal(controls[0].hold.len,87);
assert.equal(controls[1].prefix.seed,1033);assert.equal(controls[1].prefix.errors,0);assert.equal(controls[1].hold.errors,0);assert.equal(controls[1].hold.len,460);
const lex=new Set(),tokens=A.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
function gp(raw,cal){
 let word=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[];
 for(let i=0;i<word.length;){
  if(cal&&word.startsWith("ING",i)){a.push(21);i+=3;continue;}
  if(cal&&word.startsWith("IO",i)){a.push(27);i+=2;continue;}
  const t=tokens.find(x=>word.startsWith(x.s,i));assert(t,word);a.push(t.i);i+=t.s.length;
 }
 return a.join(",");
}
for(const path of ['english_wordfreq_textblob.txt','gibran_prophet_58585.txt','shakespeare_first300k.txt','emerson_essays_2944.txt'])
 for(const w of read('resources/control/'+path).match(/[A-Za-z]+/g)||[])for(const cal of [false,true])lex.add(gp(w,cal));
for(const s of G.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/gu)||[])lex.add(tape(w).join(","));
assert.equal(lex.size,36718);
const s=lm(-1),original=chapters.map((ch,i)=>{
 const z=solve(ch,s,false,range(ch[0].length*2,ch[0].length*109),1,true);
 const out={range:ranges[i],lengths:ch.map(u=>u.length),hist:z.hist,starts:z.starts};
 if(!z.best)return out;
 replay(ch,z.best,1);
 out.bodyMAP={seed:z.best.seed,score:z.best.z/ch.slice(1).reduce((v,u)=>v+u.length-2,0),origins:z.best.origins,readout:z.best.p.map(u=>u.map(j=>A.translit[j]).join('')).join(' | ')};
 const lens=rawUnits(raw[i])[0].match(new RegExp("["+A.runes.join("")+"]+","gu")).map(w=>w.length),surv=[];
 for(let o=1;o<=3301;o++)candidates(ch[0],o,()=>0,false,(s,p)=>{
  if(!z.starts.includes(s))return;
  let at=0;const ws=lens.map(l=>{const w=p.slice(at,at+l);at+=l;return w;});
  surv.push({o,sum:s,ok:ws.map(w=>lex.has(w.join(','))),words:ws.map(w=>w.map(j=>A.translit[j]).join(''))});
 });
 out.header={lens,paths:surv.length,origins:new Set(surv.map(x=>x.o)).size,allLex:surv.filter(x=>x.ok.every(Boolean)),someLex:surv.filter(x=>x.ok.some(Boolean))};
 return out;
});
assert.deepEqual(original.map(x=>x.hist.at(-1).states),[21,0,0,0,0,0,0,0,6]);
assert.deepEqual(original.map(x=>x.hist.at(-1).i),[8,7,11,8,5,10,9,22,1]);
assert.equal(original[0].hist.at(-1).paths,'213');assert.equal(original[8].hist.at(-1).paths,'6');
assert.deepEqual([original[0].header.paths,original[8].header.paths],[113,10]);
assert.equal(original[0].header.someLex.length,0);assert.equal(original[8].header.allLex.length,0);
console.log(JSON.stringify({controls,lex:lex.size,original},null,2));
