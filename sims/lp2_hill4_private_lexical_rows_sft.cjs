'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function setup(raw){
 const c=JSON.parse(raw[0]),native=JSON.parse(raw[3]),runes=c.runes,parse=s=>s.split(new RegExp("[^"+runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>runes.indexOf(x))),tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(w){let a=[];w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tok.find(t=>w.startsWith(t.s,i));if(!t)throw Error("unknown word "+w);a.push(t.i);i+=t.s.length}}return a}
 const dict=new Map();function add(a){if(!dict.has(a.length))dict.set(a.length,new Map());dict.get(a.length).set(a.map(x=>x.toString(29)).join(""),a)}
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+[1-9]\d*$/i);if(m)add(gp(m[1]))}
 // Exact known LP1 spellings supplement the general-purpose lexicon.
 for(const s of native.sections)for(const w of parse(s.source_text))add(w);
 const all=c.pages.filter(p=>p.page<56).flatMap(p=>p.indices),words=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,""));if(words.flat().join(",")!==all.join(","))throw Error("source mismatch");
 let i=0,spans=words.map(w=>{let a=i;i+=w.length;return[a,i]});const pages=[];i=0;for(const p of c.pages.filter(p=>p.page<56)){const a=i;i+=p.indices.length;pages.push({page:p.page,C:p.indices,spans:spans.filter(([u,v])=>u>=a&&v<=i).map(([u,v])=>[u-a,v-a])})}
 return{c,native,parse,gp,dict,pages};
}
function rowSearch(S,target,phase,budget){
 const C=target.C,limit=phase+4*Math.floor((C.length-phase)/4),n=(limit-phase)/4,mod=x=>((x%29)+29)%29;
 const inv=Array.from({length:29},(_,x)=>{for(let i=1;i<29;i++)if(x*i%29===1)return i;return 0});
 const spans=target.spans.filter(([a,b])=>a>=phase&&b<=limit);
 const keyOf=a=>a.reduce((s,v)=>29*s+v,0);
 function norm(a){const k=a.findIndex(v=>v!==a[0]);if(k<0)return {key:0,d:0,b:a[0]};const d=mod(a[k]-a[0]);return {key:keyOf(a.map(x=>mod((x-a[0])*inv[d]))),d,b:a[0]}}
 const masks=Array.from({length:4},(_,lane)=>{const out=[];for(let w=0;w<spans.length;w++){const [a,b]=spans[w],pos=[];for(let j=0;j<b-a;j++)if((a+j-phase)%4===lane)pos.push(j);if(!pos.length)continue;
  const m=new Uint8Array(29**pos.length),orbits=new Map();let k=0;for(const v of (S.dict.get(b-a)||new Map()).values()){const arr=pos.map(p=>v[p]),z=keyOf(arr);if(!m[z]){m[z]=1;k++;const o=norm(arr);if(!orbits.has(o.key))orbits.set(o.key,[]);orbits.get(o.key).push([o.d,o.b])}}
  const idx=pos.map(p=>Math.floor((a+p-phase)/4));out.push({word:w,idx,m,orbits,prob:k/m.length,cache:new Map()})
 }return out.sort((a,b)=>a.prob-b.prob)});
 const output=Array.from({length:4},()=>[]),counts=Array.from({length:4},()=>Array(budget+1).fill(0)),v=new Uint8Array(n),W=26,states=new Uint32Array(W*(budget+1)),tmp=new Uint32Array(W*(budget+1));
 const mod32=812%32,tail=(2**mod32-1)>>>0;
 function options(d){const x=d.idx.map(i=>v[i]),key=keyOf(x);let cached=d.cache.get(key);if(cached)return cached;
  const o=norm(x),arr=d.orbits.get(o.key)||[],q=new Uint32Array(W);
  function set(a,b){let j=(a-1)*29+b;q[j>>>5]|=1<<(j&31)}
  if(o.d===0){for(const [dy,y]of arr)if(dy===0)for(let a=1;a<29;a++)set(a,mod(y-a*o.b))}
  else for(const [dy,y]of arr)if(dy!==0){const a=dy*inv[o.d]%29;set(a,mod(y-a*o.b))}
  d.cache.set(key,q);return q
 }
 const time=Date.now();
 for(let j=0;j<4;j++)for(let z=0;z<29**(3-j);z++){
  let u=z,a=[0,0,0,0];a[j]=1;for(let k=j+1;k<4;k++){a[k]=u%29;u=Math.floor(u/29)}
  const [x,y,w,t]=a;for(let i=0;i<n;i++){const p=phase+4*i;v[i]=(x*C[p]+y*C[p+1]+w*C[p+2]+t*C[p+3])%29}
  for(let lane=0;lane<4;lane++){
   const ds=masks[lane];states.fill(0);states.fill(0xffffffff,0,W);states[W-1]=tail;
   for(const d of ds){const q=options(d);let any=0;
    for(let k=0;k<=budget;k++)for(let p=0;p<W;p++){let ix=k*W+p;tmp[ix]=(states[ix]&q[p])|(k?(states[ix-W]&~q[p]):0);any|=tmp[ix]}
    if(!any){states.fill(0);break}states.set(tmp)
   }
   for(let misses=0;misses<=budget;misses++)for(let p=0;p<W;p++){let bits=states[misses*W+p];while(bits){let one=bits&-bits,q=p*32+31-Math.clz32(one);bits=(bits^one)>>>0;const scale=1+Math.floor(q/29),b=q%29;counts[lane][misses]++;output[lane].push({a:a.map(x=>x*scale%29),b,misses})}}
  }
 }
 return{phase,budget,n,spans,counts,output,elapsed:(Date.now()-time)/1000,mostSelective:masks.map(m=>m.slice(0,8).map(x=>[x.idx.length,x.prob]))};
}
function jointSearch(S,target,v){
 const {phase,n,spans,budget,output}=v,C=target.C,mod=x=>((x%29)+29)%29;
 const inv=Array.from({length:29},(_,x)=>{for(let i=1;i<29;i++)if(x*i%29===1)return i;return 0});
 const order=[0,1,2,3].sort((a,b)=>output[a].length-output[b].length),chosen=[],seq=[];
 const counts=Array(4).fill(0),visits=Array(4).fill(0),solutions=[];
 const masks=[];let m=0;for(const lane of order){m|=1<<lane;masks.push(m)}
 const projs=masks.map((mask,level)=>spans.map(([a,b],word)=>{const pos=[];for(let j=0;j<b-a;j++)if(mask&(1<<((a+j-phase)%4)))pos.push(j);const newLane=order[level];if(!pos.some(j=>(a+j-phase)%4===newLane))return null;const set=new Set();for(const w of (S.dict.get(b-a)||new Map()).values())set.add(String.fromCharCode(...pos.map(j=>w[j])));return{word,pos:pos.map(j=>[(a+j-phase)%4,Math.floor((a+j-phase)/4)]),set}}).filter(Boolean).sort((a,b)=>a.set.size/(29**a.pos.length)-b.set.size/(29**b.pos.length)));
 function rank(rows){let a=rows.map(r=>r.slice()),r=0;for(let j=0;j<4;j++){let k=a.findIndex((v,i)=>i>=r&&v[j]);if(k<0)continue;[a[r],a[k]]=[a[k],a[r]];const x=inv[a[r][j]];a[r]=a[r].map(v=>v*x%29);for(let i=r+1;i<a.length;i++){const y=a[i][j];for(let l=j;l<4;l++)a[i][l]=mod(a[i][l]-y*a[r][l])}r++}return r}
 // Retain only a candidate's row output, not a full guessed plaintext.
 for(let lane=0;lane<4;lane++)for(const row of output[lane]){const a=row.a;row.seq=Uint8Array.from({length:n},(_,i)=>{let p=phase+4*i;return(a[0]*C[p]+a[1]*C[p+1]+a[2]*C[p+2]+a[3]*C[p+3]+row.b)%29})}
 function dfs(level,bad,misses){
  if(level===4){const key=Array.from({length:4},(_,lane)=>chosen[order.indexOf(lane)]).map(({a,b})=>({a,b}));const plain=Array.from({length:n*4},(_,i)=>seq[i%4][Math.floor(i/4)]);solutions.push({key,misses,plain});return}
  const lane=order[level];
  for(const row of output[lane]){visits[level]++;seq[lane]=row.seq;let miss=misses,extra=[];
   for(const d of projs[level]){if(bad[d.word])continue;const x=String.fromCharCode(...d.pos.map(([l,i])=>seq[l][i]));if(!d.set.has(x)){extra.push(d.word);if(++miss>budget)break}}
   if(miss>budget)continue;
   if(rank([...chosen.map(x=>x.a),row.a])!==level+1)continue;
   counts[level]++;for(const w of extra)bad[w]=1;chosen.push(row);dfs(level+1,bad,miss);chosen.pop();for(const w of extra)bad[w]=0;
  }
 }
 const time=Date.now();if(output.every(x=>x.length))dfs(0,new Uint8Array(spans.length),0);
 return{order,counts,visits,solutions,seconds:(Date.now()-time)/1000};
}
function plantTarget(S,section,start,end,A,b,erase=3){
 const w=S.parse(S.native.sections.find(s=>s.name===section).source_text).slice(start,end),P=w.flat();let at=0;const spans=w.map(v=>{let a=at;at+=v.length;return[a,at]});
 const sig=v=>v.map(x=>x.toString(29)).join(""),counts=new Map();for(const v of w){const q=sig(v);counts.set(q,(counts.get(q)||0)+1)}
 const removed=[];for(const v of w){let q=sig(v);if(v.length>=4&&counts.get(q)===1&&removed.length<erase){S.dict.get(v.length).delete(q);removed.push(v)}}
 const C=P.slice();for(let i=0;i+3<P.length;i+=4)for(let j=0;j<4;j++)C[i+j]=(A[j].reduce((s,x,k)=>s+x*P[i+k],b[j]))%29;
 return{target:{C,spans},P,removed,restore:()=>{for(const v of removed)S.dict.get(v.length).set(sig(v),v)}};
}
const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
const S=setup(raw);
if(require.main===module){const target=S.pages.find(p=>p.page===Number(process.argv[2]||21));const v=rowSearch(S,target,Number(process.argv[3]||0),Number(process.argv[4]||2));const j=jointSearch(S,target,v);console.log(JSON.stringify({phase:v.phase,budget:v.budget,words:v.spans.length,n:v.n,counts:v.counts,elapsed:v.elapsed,joint:j},null,2));}
module.exports={setup,rowSearch,jointSearch,plantTarget};
