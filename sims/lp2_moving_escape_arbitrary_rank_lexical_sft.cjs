'use strict';
// Agent 6: arbitrary rank permutation / moving escape lexical recovery.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,lexicon,solved){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const idx=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let w=[];
 for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const pages=corpus.pages.filter(p=>p.page<=55),actual=pages.flatMap(p=>p.indices),startPages=pages.flatMap(p=>p.indices.map(()=>p.page));
 assert(words.length===2896&&words.flat().length===12956&&words.flat().every((v,i)=>v===actual[i]),"source");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const code=p=>String.fromCharCode(...p);
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
 const lex=new Map(),known=new Set();for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p||known.has(code(p)))continue;known.add(code(p));if(!lex.has(p.length))lex.set(p.length,[]);lex.get(p.length).push(p);}
 const ALL=(1<<28)-1,mod=x=>(x+29)%29,bit=x=>x>=0&&x<28?1<<x:0;
 function pop(x){let n=0;while(x){x&=x-1;n++;}return n;}
 /** Exact matching of constrained rows; fully free rows can fill unused ranks. @param {number[]} masks */
 function match(masks){if(masks.some(v=>!v))return false;const owner=Array(28).fill(-1);const order=masks.map((_,i)=>i).filter(i=>masks[i]!==ALL).sort((a,b)=>pop(masks[a])-pop(masks[b]));let seen=0;
  function aug(i){let m=masks[i]&~seen;while(m){const v=m&-m;m^=v;seen|=v;const j=31-Math.clz32(v);if(owner[j]<0||aug(owner[j])){owner[j]=i;return true;}}return false;}
  for(const i of order){seen=0;if(!aug(i))return false;}return true;
 }
 const merge=(a,b)=>a.map((v,i)=>v&b[i]);
 /** @param {number[]} w */
 function candidates(w){const ds=w.slice(1).map((v,i)=>mod(v-w[i])),out=[];for(const p of lex.get(w.length)||[]){const m=Array(28).fill(ALL);let valid=true;for(let j=0;j<ds.length;j++){const d=ds[j];if(!d)continue;const y=p[j+1];m[d-1]&=bit(y)|bit(y-1);if(!m[d-1]){valid=false;break;}}if(valid&&match(m))out.push({p,m});}return out;}
 function propagate(records){let dom=Array(28).fill(ALL),lists=records.map(x=>x.c),round=0;while(true){round++;let changed=false;
  for(let i=0;i<lists.length;i++){const old=lists[i];lists[i]=old.filter(c=>match(merge(dom,c.m)));if(!lists[i].length)return {fail:records[i].i,round,domains:dom.map(pop)};if(lists[i].length!==old.length)changed=true;const u=Array(28).fill(0);for(const c of lists[i])for(let j=0;j<28;j++)u[j]|=c.m[j];const nd=merge(dom,u);if(!match(nd))return {fail:records[i].i,round,domains:nd.map(pop)};if(nd.some((x,j)=>x!==dom[j]))changed=true;dom=nd;}
  for(let j=0;j<28;j++){let m=dom[j];if(pop(m)<=1)continue;while(m){const v=m&-m;m^=v;const test=dom.slice();test[j]=v;if(!match(test)){dom[j]^=v;changed=true;}}}
  if(!changed)return {round,domains:dom.map(pop),masks:dom,remaining:lists.map(x=>x.length)};
 }}
 const chapter=p=>[2,7,14,22,26,32,39,53,55].findIndex(e=>p<=e);
 let offset=0;const all=words.map((w,i)=>{const page=startPages[offset],start=offset;offset+=w.length;return {w,i,page,start,chapter:chapter(page)};});
 const byLen={},long=[];
 for(const x of all.filter(x=>x.w.length>=7)){const c=candidates(x.w);const s=byLen[x.w.length]??={words:0,any:0,min:Infinity,max:0};s.words++;if(c.length)s.any++;s.min=Math.min(s.min,c.length);s.max=Math.max(s.max,c.length);if(x.w.length>=10)long.push({...x,c});}
 const groups=[];let disjoint=0,emptyCount=0;
 for(let ch=0;ch<9;ch++){const rows=long.filter(x=>x.chapter===ch),eligible=rows.filter(x=>x.c.length).sort((a,b)=>a.c.length-b.c.length),used=new Set(),pairs=[];
  for(let i=0;i<eligible.length;i++){const a=eligible[i];if(used.has(a.i))continue;for(let j=i+1;j<eligible.length;j++){const b=eligible[j];if(used.has(b.i)||a.c.length*b.c.length>50000)continue;let compatible=false;outer:for(const ca of a.c)for(const cb of b.c){if(match(merge(ca.m,cb.m))){compatible=true;break outer;}}if(!compatible){pairs.push([a.i,b.i,a.c.length,b.c.length]);used.add(a.i);used.add(b.i);break;}}}
  const empty=rows.filter(x=>!x.c.length).map(x=>({i:x.i,page:x.page,start:x.start,w:x.w}));disjoint+=pairs.length;emptyCount+=empty.length;const prop=propagate(eligible);
  groups.push({ch,words:rows.length,empty,pairs,prop:{fail:prop.fail,round:prop.round,domains:prop.domains}});
 }
 // Every nonzero step has at most two adjacent possible plaintext indices.
 // Each singleton alphabet S admits at most |{y,y-1: y in S}| distinct ranks.
 function upper(hist,k){return hist.slice(1).sort((a,b)=>b-a).slice(0,k).reduce((a,b)=>a+b,hist[0]);}
 const singleton=all.filter(x=>x.w.length===1);
 const vocab=[["A","I","O"],["A","I","O","T"]];
 const ks=vocab.map(v=>new Set(v.flatMap(s=>{const y=corpus.translit.indexOf(s);return [y,y-1].filter(n=>n>=0&&n<28);})).size);
 function singletonBound(key){const hist=new Map();for(const x of singleton){const group=key(x),h=hist.get(group)||Array(29).fill(0);hist.set(group,h);h[x.start?mod(actual[x.start]-actual[x.start-1]):0]++;}return {groups:hist.size,zeros:[...hist.values()].reduce((n,h)=>n+h[0],0),bounds:ks.map(k=>[...hist.values()].reduce((n,h)=>n+upper(h,k),0))};}
 // Allow a free first rune at every independently keyed zone.
 function eBound(key){const hist=new Map();let last=null;for(let i=0;i<actual.length;i++){const group=key(i),h=hist.get(group)||Array(29).fill(0);hist.set(group,h);h[!i||last!==group?0:mod(actual[i]-actual[i-1])]++;last=group;}return {groups:hist.size,free:[...hist.values()].reduce((n,h)=>n+h[0],0),maxE:[...hist.values()].reduce((n,h)=>n+upper(h,2),0)};}
 const native=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const nativeLong=native.filter(w=>w.length>=10),donor=native.filter(w=>w.length>=7&&known.has(code(w)));
 let seed=0x33010624;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
 const perm=Array.from({length:28},(_,i)=>i);for(let i=27;i>0;i--){const j=rnd()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}
 const inv=Array(28);perm.forEach((x,i)=>inv[x]=i);const f=Array.from({length:29},()=>rnd()%29);
 function transform(ws,enc){let pp=0,cc=0;return ws.map(w=>w.map(v=>{const e=f[pp];let p,c;if(enc){p=v;const d=p===e?0:1+inv[p-(p>e?1:0)];c=mod(cc+d);}else{c=v;const d=mod(c-cc);if(!d)p=e;else{const rank=perm[d-1];p=rank+(rank>=e?1:0);}}pp=p;cc=c;return enc?c:p;}));}
 const encrypted=transform(donor,true);assert(JSON.stringify(transform(encrypted,false))===JSON.stringify(donor),"plant replay");
 const trainN=73,train=encrypted.slice(0,trainN).map((w,i)=>({i,c:candidates(w)}));assert(train.every((x,i)=>x.c.some(v=>code(v.p)===code(donor[i]))),"plant true candidate");
 const pr=propagate(train.sort((a,b)=>a.c.length-b.c.length));assert(pr.masks&&pr.masks.every((m,i)=>m&bit(perm[i])),"plant true key survives");
 const held=encrypted.slice(trainN).map((w,i)=>({p:donor[i+trainN],c:candidates(w)}));const retained=held.filter(x=>x.c.some(y=>code(y.p)===code(x.p)&&match(merge(pr.masks,y.m)))).length;assert(retained===held.length,"holdout true word");

 // Exact weighted assignment for source-visible physical-page rank rotations.
 function assign(w){const n=w.length,u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);for(let i=1;i<=n;i++){p[0]=i;let j0=0,min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-w[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;}j0=j1;}while(p[j0]);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}return p.slice(1).reduce((a,i,j)=>a+w[i-1][j],0);}
 assert(assign([[1,5,2],[7,0,3],[4,8,1]])===17,"assignment control");
 const m=(x,n)=>(x%n+n)%n,primes=[];for(let n=2;primes.length<58;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const logs=Array(29).fill(-1);for(let x=1,i=0;i<28;i++,x=x*15%29)logs[x]=i;
 assert(new Set(logs.slice(1)).size===28,"primitive base");
 function capacity(sites,allowed,key,sign,order,log){let free=0;const weights=Array.from({length:28},()=>Array(28).fill(0));for(const i of sites){const d=i?m(actual[i]-actual[i-1],29):0;if(!d){free++;continue;}const q=log?logs[d]:d-1,k=sign*key(startPages[i]);if(order==="before"){const row=m(q-k,28);for(const v of allowed)weights[row][v]++;}else{for(const v of allowed)weights[q][m(v+k,28)]++;}}return free+assign(weights);}
 const sets={singleton:new Set([24,10,3,16].flatMap(y=>[y,y-1])),E:new Set([17,18])},pageClock=[];
 for(const [label,key] of [["physical",p=>p],["primeTotient",p=>primes[p]-1]])for(const sign of [1,-1])for(const order of ["before","after"])for(const log of [false,true])pageClock.push({label,sign,order,log,single:capacity(singleton.map(x=>x.start),sets.singleton,key,sign,order,log),E:capacity(actual.map((_,i)=>i),sets.E,key,sign,order,log)});
 assert(Math.max(...pageClock.map(x=>x.single))===60&&Math.max(...pageClock.map(x=>x.E))===1305,"page-clock capacities");
 return {pageClock,lexicon:known.size,byLen,longWords:long.length,emptyCount,disjoint,minimumOutOfLexicon:emptyCount+disjoint,groups,singletons:{count:singleton.length,ks,global:singletonBound(()=>0),chapter:singletonBound(x=>x.chapter),page:singletonBound(x=>x.page)},eCapacity:{global:eBound(()=>0),chapter:eBound(i=>chapter(startPages[i])),page:eBound(i=>startPages[i])},native:{longWords:nativeLong.length,longInLexicon:nativeLong.filter(w=>known.has(code(w))).length,runes:native.flat().length,E:native.flat().filter(x=>x===18).length},plant:{train:trainN,held:held.length,correctRankEntries:pr.domains.filter(x=>x===1).length,domains:pr.domains,retained,fullKnownKeyReplay:true,rounds:pr.round}};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const p=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(JSON.parse(read(p[0])),read(p[1]),read(p[2]),JSON.parse(read(p[3]))),null,2));
