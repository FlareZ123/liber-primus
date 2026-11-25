// Continuous-clock fixed-red8 necessary lexical CSP, corrected physical carry.
// Three optional literal-F holds on original p54; no p55 glyph enters fitting.
const fs=require("node:fs"),path=require("node:path");
function experiment(lex,fixture,profile){
const N=29,Q=8,SYM="0123456789abcdefghijklmnopqrs",A=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"],idx=new Map(A.map((x,i)=>[x,i])),D=new Set(),mod=x=>(x%29+29)%29,ALL=(1<<29)-1;
function require(x,s){if(!x)throw Error(s)}
for(const line of lex.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(!m)continue;const w=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,s){if(i===w.length){D.add(s);return}for(let k=1;k<=3&&i+k<=w.length;k++){const t=w.slice(i,i+k),v=k===3?(t==="ING"?21:undefined):idx.get(t);if(v!==undefined)rec(i+k,s+SYM[v])}}rec(0,"")}
require(D.size===38910,"base dictionary "+D.size);for(const x of fixture.added.split(/\s+/))if(x)D.add(x);require(D.size===38938,"dictionary "+D.size);
const by=Array.from({length:60},()=>[]),prefix=new Set();for(const w of D){by[w.length].push(w);if(w.length===11)prefix.add(w.slice(0,10))}for(const a of by)a.sort();const pref=[...prefix].sort();const src=profile.p54.body_groups;
require(src.length===48&&src.at(-1)==="63g2eis46q"&&src.join("").length===223,"physical carry");
const ord=profile.red8_key.gp29_indices,prime=profile.red8_key.prime_mod29;
const pop=x=>{x=x>>>0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
function rot(x,d){return d?((x<<d)|(x>>>(29-d)))&ALL:x}
function local(c,phase,hold,key,words){
 const C=[...c].map(x=>SYM.indexOf(x)),ts=[],steps=[],hs=[];let j=phase,z=0;
 for(const x of C){let h=x===0&&((hold>>z)&1);if(x===0)z++;hs.push(!!h);const k=h?0:key[j];ts.push(h?-1:x*29+k);steps.push(k);if(!h)j=(j+1)%8}
 const candidates=[],r=new Int8Array(29),o=new Int8Array(29),s=new Int8Array(29),m=new Int32Array(29);
 for(const w of words){let good=true;for(let i=0;i<C.length;i++){const p=SYM.indexOf(w[i]);if(hs[i]?(p!==0):(p===0||p===C[i])){good=false;break}}if(!good)continue;
  for(let i=0;i<29;i++){r[i]=i;o[i]=0;s[i]=1;m[i]=1}
  for(let i=0;i<C.length;i++){if(hs[i])continue;const p=SYM.indexOf(w[i]),c=C[i],k=steps[i];let a=r[p],b=r[c],d=mod(k+o[p]-o[c]);if(a===b){if(d!==0){good=false;break}continue}if(s[a]<s[b]){[a,b]=[b,a];d=mod(-d)}const zz=rot(m[b],d);if(zz&m[a]){good=false;break}for(let v=0;v<29;v++)if(r[v]===b){r[v]=a;o[v]=mod(o[v]+d)}m[a]|=zz;s[a]+=s[b]}
  if(good)candidates.push(w)
 }
 return {ts,steps,words:candidates,next:j,zero:z}
}
function makeCache(groups,key){const cache=new Map();return (i,j,h)=>{const k=i*4096+j*256+h;let a=cache.get(k);if(!a){a=local(groups[i],j,h,key,i===47?pref:by[groups[i].length]);cache.set(k,a)}return a}}
function scenario(groups,key,cache,start,mask){let j=start,z=0;const ds=[];for(let i=0;i<groups.length;i++){let n=0;for(const c of groups[i])if(c==="0")n++;const h=(mask>>z)&((1<<n)-1);z+=n;const d=cache(i,j,h);ds.push({ts:d.ts,steps:d.steps,words:d.words});j=d.next}return ds}
function propagate(ds,budget){
 let rounds=0,forced=[],removed=0;const initial=ds.reduce((s,d)=>s+d.words.length,0),ng=ds.length,carry=ng-1,lo=new Uint32Array(29*29*29),hi=new Uint32Array(29*29*29);
 const tokens=[...new Set(ds.flatMap(d=>d.ts).filter(t=>t>=0))],neighbors=new Map(tokens.map(t=>[t,tokens.filter(u=>u!==t&&((u%29===t%29)||Math.floor(u/29)===Math.floor(t/29)))]));
 function outcome(excluded){return {excluded,rounds,forced,initial,final:ds.reduce((s,d)=>s+d.words.length,0),prefix:ds[carry].words.length,removed,domains:ds.map(d=>d.words.length)}}
 for(;;){
  forced=ds.flatMap((d,i)=>d.words.length===0?[i]:[]);if(forced.includes(carry)||forced.length>budget)return outcome(true);
  rounds++;lo.fill(0);hi.fill(0);
  for(let g=0;g<ng;g++){const d=ds[g];if(!d.words.length)continue;const sup=new Map();for(let i=0;i<d.ts.length;i++){const t=d.ts[i];if(t<0)continue;let m=0;for(const w of d.words)m|=1<<SYM.indexOf(w[i]);sup.set(t,(sup.get(t)||0)|m)}
   const arr=g<32?lo:hi,b=1<<(g%32);
   for(const [t,m] of sup){for(let p=1;p<29;p++)if(!(m&(1<<p)))arr[t*29+p]|=b;if(pop(m)===1){const p=31-Math.clz32(m);for(const u of neighbors.get(t))arr[u*29+p]|=b}}
  }
  let change=0;const left=budget-forced.length,carryBit=1<<(carry%32);
  for(let g=0;g<ng;g++){const d=ds[g];if(!d.words.length)continue;const old=d.words.length;d.words=d.words.filter(w=>{let a=0,b=0;for(let i=0;i<d.ts.length;i++){const t=d.ts[i];if(t<0)continue;const v=t*29+SYM.indexOf(w[i]);a|=lo[v];b|=hi[v];if((carry<32?(a&carryBit):(b&carryBit))||pop(a)+pop(b)>left)return false}return true});change+=old-d.words.length}
  removed+=change;if(change===0)return outcome(false);
 }
}
function testOriginal(key,name){let zeros=[...src.join("")].filter(x=>x==="0").length,cache=makeCache(src,key),out=[];for(let start=0;start<8;start++)for(let h=0;h<(1<<zeros);h++){const d=scenario(src,key,cache,start,h),a=propagate(d,3);out.push({start,h,...a})}return {name,zeros,cases:out.length,excluded:out.filter(x=>x.excluded).length,leastPrefix:Math.min(...out.filter(x=>!x.excluded).map(x=>x.prefix)),mostPrefix:Math.max(...out.filter(x=>!x.excluded).map(x=>x.prefix)),initial:out.reduce((s,x)=>s+x.initial,0),final:out.reduce((s,x)=>s+x.final,0),casesDetail:out}}
function rng(seed){let x=seed>>>0;return n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n}}
function control(key,name,seed,withOov){const R=rng(seed),pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){let j=1+R(i);[pi[i],pi[j]]=[pi[j],pi[i]]}const inv=[];pi.forEach((p,i)=>inv[p]=i);let phase=R(8),start=phase,mask=0,z=0;const P=[],C=[],oov=[];for(let i=0;i<48;i++){const l=i===47?11:src[i].length;let w=by[l][R(by[l].length)];if(withOov&&[3,12,45].includes(i)){do{w=Array.from({length:l},()=>SYM[1+R(28)]).join("")}while(D.has(w));oov.push(i)}let c="";for(const a of w){const p=SYM.indexOf(a);if(p===0){if(z>=30)throw Error("too many zeros");mask|=1<<z;z++;c+="0"}else{const v=inv[mod(pi[p]+key[phase])];if(v===0)z++;c+=SYM[v];phase=(phase+1)%8}}if(i===47){w=w.slice(0,10);c=c.slice(0,10)}P.push(w);C.push(c)}
 const ds=scenario(C,key,makeCache(C,key),start,mask);for(let i=0;i<48;i++)if(!oov.includes(i))require(ds[i].words.includes(P[i]),"local lost true word "+name+" "+seed+" "+i);
 const a=propagate(ds,3);require(!a.excluded,"false exclusion "+name+" "+seed);let retained=0;for(let i=0;i<48;i++)if(!oov.includes(i)){require(ds[i].words.includes(P[i]),"propagation lost true word "+name+" "+seed+" "+i);retained++}return {name,seed,withOov,retained,initial:a.initial,final:a.final,rounds:a.rounds,prefix:a.prefix,forced:a.forced}}
const controls=[];for(const [name,k] of [["ordinal",ord],["prime",prime]])for(const seed of [19,71,3301,1033])controls.push(control(k,name,seed,seed%2===1&&seed!==19));
const original=[testOriginal(ord,"ordinal"),testOriginal(prime,"prime")];return {dictionary:D.size,controls,original};
}
const root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(read("resources/control/english_wordfreq_textblob.txt"),JSON.parse(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json")),JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json"))),null,2));
