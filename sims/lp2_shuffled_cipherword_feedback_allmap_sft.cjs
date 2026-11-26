"use strict";
function experiment(inputs){
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const mod=x=>(x%29+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),s=donor(sh);for(const p of [...g,...s])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"lexicon");

 const words=[];let w=[];
 for(const c of raw.split('%').slice(0,55).join('%')){if(map.has(c))w.push(map.get(c));else if(!'%/'.includes(c)&&! /\s/u.test(c)&&w.length){words.push(w);w=[];}}
 if(w.length)words.push(w);assert(words.length===2896&&String(words.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original words");
 const code=x=>String.fromCharCode(...x.map(v=>65+v)),decode=x=>[...x].map(c=>c.charCodeAt(0)-65);
 const maxLen=Math.max(...words.map(w=>w.length));

 const inv=Array(29).fill(0);for(let x=1;x<29;x++)for(let y=1;y<29;y++)if(x*y%29===1)inv[x]=y;
 const M=30*28*29+29,proj=(d,x)=>mod((d===29?0:x)+(d===29?1:d)*(gp.prime[x]-1));
 function mapId(a,b,c){if(!a&&!c)return M-29+b;const d=a?mod(c*inv[a]):29,s=a||c;return d*28*29+(s-1)*29+b}
 function unmap(id){if(id>=M-29)return [0,id-(M-29),0];const d=Math.floor(id/(28*29)),s=Math.floor((id%(28*29))/29)+1,b=id%29;return d===29?[0,b,s]:[s,b,mod(s*d)]}
 function emit(P,K,f,rev,hold){const k=rev?K.slice().reverse():K;let t=0;return P.map(v=>hold&&v===0?0:mod(v+f[0]*k[t%k.length]+f[1]+f[2]*(gp.prime[k[t++%k.length]]-1)))}
 function sig(v){const a=v[0]??0;let d=0,s="";for(const x of v){const z=mod(x-a);if(z&&!d)d=z;s+=String.fromCharCode(65+mod(z*inv[d]));}return {s,a,d}}
 // Algebra oracle: canonical projective decomposition covers every map exactly once.
 const seen=new Set();for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const id=mapId(a,b,c);assert(String(unmap(id))===String([a,b,c]),"map decomposition");seen.add(id)}assert(seen.size===M,"all maps");
 const eligible=words.map((c,i)=>({c,i,set:0})).filter(x=>x.c.length>=8);assert(eligible.length===343,"anchor count");
 const cleanG=donor(gib.slice(gib.indexOf("Almustafa, the{7} chosen"),gib.indexOf("End of the Project Gutenberg EBook of The Prophet")));
 const cleanS=s;
 const nativeWords=native.sections.flatMap(sec=>(sec.source_text.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 let seed=0x44ae331;function rand(){return seed=(Math.imul(seed,1664525)+1013904223)>>>0}
 function shuf(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=rand()%(i+1);[b[i],b[j]]=[b[j],b[i]]}return b}
 const controlSpecs=[{src:cleanG,start:100,f:[3,7,0]},{src:cleanS,start:Math.floor(cleanS.length*.84),f:[17,21,1]},{src:cleanG,start:800,f:[28,12,11]},{src:nativeWords,start:20,f:[0,5,13]}];
 const controls=controlSpecs.map(({src,start,f},j)=>{const P=src.slice(start,start+401);assert(P.length===401&&P.every(w=>dict[w.length]?.has(String(w))),"clean control register");const E=[{c:P[0],p:code(P[0]),i:0,set:j+1}];for(let i=1;i<P.length;i++){const k=E.at(-1).c,rev=i%3===1,hold=i%2===0;E.push({c:emit(P[i],k,f,rev,hold),p:code(P[i]),k:code(k),rev,hold,i,set:j+1})}return {f,id:mapId(...f),pool:E.map(x=>x.c),anchors:shuf(E.slice(1)).filter(x=>x.c.length>=8&&x.c.length<=maxLen)}});return {f,id:mapId(...f),anchors:shuf(E).filter(x=>x.c.length>=8)}});
 const targets=eligible.concat(...controls.map(x=>x.anchors));const N=targets.length,bitWords=Math.ceil(N/32),hit=new Uint32Array(M*bitWords),mark=(id,j)=>{hit[id*bitWords+(j>>>5)]|=(1<<(j&31))};
 const isHit=(id,j)=>!!(hit[id*bitWords+(j>>>5)]&(1<<(j&31)));
 const dictionaries=Array.from({length:maxLen+1},()=>new Map()),stats=Array(maxLen+1).fill(0);
 function target(j,v){if(!v.length){for(let id=0;id<M;id++)mark(id,j);return}
  const {s,a,d}=sig(v),t=j*841+a*29+d,mp=dictionaries[v.length],old=mp.get(s);if(old===undefined)mp.set(s,t);else if(typeof old==="number")mp.set(s,[old,t]);else old.push(t);stats[v.length]++;
  if(!d)mark(M-29+a,j);
 }
 for(let j=0;j<N;j++){const C=targets[j].c;for(const P of dict[C.length].values()){
  target(j,P.map((p,k)=>mod(C[k]-p)));
  if(P.includes(0)){let legal=true;const T=[];for(let k=0;k<P.length;k++)if(P[k]===0){if(C[k]!==0){legal=false;break}}else T.push(mod(C[k]-P[k]));if(legal)target(j,T)}
 }}
 const minLen=dictionaries.findIndex(x=>x.size>0),keyWords=[words,...controls.map(x=>x.pool)].flatMap((pool,set)=>[...new Map(pool.map(w=>[code(w),w])).values()].flatMap(w=>[{w,set},{w:w.slice().reverse(),set}]));let matches=0;
 function accept(id,t,k0,kd,set){const j=Math.floor(t/841),a=Math.floor(t%841/29),d=t%29;if(targets[j].set!==set)return;
  if(kd){assert(d>0,"nonconstant signature");const s=mod(d*inv[kd]),b=mod(a-s*k0);mark(id+(s-1)*29+b,j)}
  else {assert(d===0,"constant signature");for(let s=1;s<29;s++)mark(id+(s-1)*29+mod(a-s*k0),j)}
 }
 // Each key pool contains only its own ciphertext groups; original whole-book pool grants arbitrary predecessor locations, even self.
 for(let d=0;d<30;d++){
  const project=Array.from({length:29},(_,x)=>proj(d,x)),offset=d*28*29;
  for(const {w,set} of keyWords){
   const a=project[w[0]];let delta=0,s="";
   for(let i=0;i<maxLen;i++){
    const x=mod(project[w[i%w.length]]-a);if(x&&!delta)delta=x;
    s+=String.fromCharCode(65+mod(x*inv[delta]));
    if(i+1<minLen)continue;const v=dictionaries[i+1].get(s);if(v===undefined)continue;
    matches++;if(typeof v==="number")accept(offset,v,a,delta,set);else for(const t of v)accept(offset,t,a,delta,set)
   }
  }
 }
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],pageStarts=[0],starts=[0];
 for(const p of gp.pages.slice(0,56))pageStarts.push(pageStarts.at(-1)+p.indices.length);for(const x of words)starts.push(starts.at(-1)+x.length);
 const groups=chapters.map(([p,q])=>words.flatMap((w,i)=>starts[i]>=pageStarts[p]&&starts[i+1]<=pageStarts[q+1]?[i]:[]));
 const subsets=[eligible.map((_,i)=>i),...groups.map(ids=>{const set=new Set(ids);return eligible.flatMap((x,i)=>set.has(x.i)?[i]:[])}),...controls.map((_,k)=>targets.flatMap((x,i)=>x.set===k+1?[i]:[]))];
 function summarize(js){let best=-1,bestIds=[],nonzero=0,all=0;const hist={};for(let id=0;id<M;id++){let n=0;for(const j of js)n+=isHit(id,j);hist[n]=(hist[n]??0)+1;if(n)nonzero++;if(n===js.length)all++;if(n>best){best=n;bestIds=[id]}else if(n===best)bestIds.push(id)}return {anchors:js.length,best,nonzero,all,bestMaps:bestIds.slice(0,20).map(unmap),ties:bestIds.length,hist};}
 const sums=subsets.map(summarize),whole={...sums[0],lowerOOV:Math.max(0,(eligible.length-sums[0].best-chapters.length)),budget:Math.floor(words.length*.05)};
 const chapterResults=groups.map((g,i)=>({...sums[i+1],chapter:chapters[i],groups:g.length,lowerOOV:Math.max(0,(subsets[i+1].length-sums[i+1].best-1)),budget:Math.floor(g.length*.05)}));
 function exactEdges(C,pool,f){
  const pre=Array.from({length:C.length+1},()=>new Map());
  for(let i=0;i<pool.length;i++)for(const rev of [false,true]){
   const w=rev?pool[i].slice().reverse():pool[i];let s="";
   for(let m=1;m<=C.length;m++){
    const x=w[(m-1)%w.length],k=mod(f[0]*x+f[1]+f[2]*(gp.prime[x]-1));s+=String.fromCharCode(k+65);
    if(!pre[m].has(s))pre[m].set(s,[]);pre[m].get(s).push({i,rev})
   }
  }
  const edges=new Map();for(const P of dict[C.length].values())for(const hold of [false,true]){
   const v=[];let valid=true;for(let i=0;i<C.length;i++){if(hold&&P[i]===0){if(C[i]!==0){valid=false;break}}else v.push(mod(C[i]-P[i]))}
   if(!valid)continue;
   const ks=v.length?pre[v.length].get(code(v))||[]:pool.flatMap((_,i)=>[{i,rev:false},{i,rev:true}]);
   for(const {i,rev} of ks){assert(code(emit(P,pool[i],f,rev,hold))===code(C),"edge replay");const key=i+":"+code(P);edges.set(key,{i,p:code(P)})}
  }
  return [...edges.values()]
 }
 const plantResults=controls.map((c,i)=>{const idx=1+chapters.length+i,js=subsets[idx];assert(js.every(j=>isHit(c.id,j)),"actual hidden map lost");
  let uniquePred=0,uniquePlain=0,uniquePair=0,edgeCount=0;const edges=c.anchors.map(x=>{const e=exactEdges(x.c,c.pool,c.f);assert(e.some(z=>z.i===x.i-1&&z.p===x.p),"true edge absent");uniquePred+= +(new Set(e.map(x=>x.i)).size===1);uniquePlain+= +(new Set(e.map(x=>x.p)).size===1);uniquePair+= +(e.length===1);edgeCount+=e.length;return {i:x.i,count:e.length}});
  return {...sums[idx],actual:c.f,trueMatches:js.length,actualIsBest:sums[idx].best===js.length,uniquePred,uniquePlain,uniquePair,edgeCount,edges}
 });
 const originalBest=whole.bestMaps.map(f=>{const id=mapId(...f),es=[];for(let j=0;j<eligible.length;j++)if(isHit(id,j)){const x=eligible[j],E=exactEdges(x.c,words,f);assert(E.length,"support replay");es.push({group:x.i,len:x.c.length,n:E.length,examples:E.slice(0,8)})}return {f,es}});
 return {vocabulary,maxLen,M,N,stats,distinct:dictionaries.map(x=>x.size),matches,keyWords:keyWords.length,whole,chapterResults,plantResults,originalBest};
}

const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
