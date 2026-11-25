"use strict";const fs=require("node:fs");
function experiment(c,raw,dict,n,lit){
 const mod=x=>(x%29+29)%29,all=(1<<29)-1,id=Array.from({length:29},(_,i)=>i),assert=(x,m)=>{if(!x)throw Error(m)},rot=(m,k)=>((m<<k)|(m>>>(29-k)))&all;
 const sh=[];for(let x=2;sh.length<3302;x++){let p=true;for(let a=2;a*a<=x;a++)if(x%a===0){p=false;break}if(p)sh.push((x-1)%29)}
 const idx=new Map(c.runes.map((x,i)=>[x,i])),tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){p.push(21);i+=3}else if(w.startsWith("IO",i)){p.push(27);i+=2}else{const t=tok.find(x=>w.startsWith(x.s,i));if(!t)return null;p.push(t.i);i+=t.s.length}}return p}
 const words=raw.split("%").slice(0,55).join("%").replace(/[/\s%]/g,"").split(/[^\u16a0-\u16ff]+/g).filter(Boolean);let off=0,p=0,start=0;const anchors=[];
 for(let i=0;i<words.length;i++){let P=[...words[i]].map(x=>idx.get(x));while(off>=start+c.pages[p].indices.length){start+=c.pages[p].indices.length;p++}const page=c.pages[p].indices,loc=off-start;assert(P.slice(0,Math.min(P.length,page.length-loc)).every((x,j)=>x===page[loc+j]),"transcript");if(P.length>=12&&loc+P.length<=page.length)anchors.push({i,p,local:loc,len:P.length,prefixF:page.slice(0,loc).filter(x=>x===0).length,C:P});off+=P.length}
 assert(off===12956&&words.length===2896&&anchors.length===25,"source");
 anchors.sort((a,b)=>b.len-a.len||a.prefixF-b.prefixF||a.i-b.i);
 const lex=new Map();function add(word,P){if(P&&(P.length>=12&&P.length<=14)&&!lex.has(P.join(",")))lex.set(P.join(","),{word,P})}
 for(const line of dict.split(/\r?\n/)){if(/^[a-z]+\s+\d+$/i.test(line)){const w=line.split(/\s+/)[0].toUpperCase();add(w,encode(w))}}
 for(const text of lit)for(const w of text.toUpperCase().match(/[A-Z]+/g)||[])add(w,encode(w));
 for(const s of n.sections)for(const w of s.source_text.split(/[^\u16a0-\u16ff]+/g).filter(Boolean))add(w,[...w].map(x=>idx.get(x)));
 const dictionaries=[...lex.values()];
 class DSU{
  constructor(){this.parent=Int8Array.from({length:58},(_,i)=>i);this.delta=new Int8Array(58);this.size=new Uint8Array(58).fill(1);this.pmask=new Int32Array(58);this.cmask=new Int32Array(58);for(let i=0;i<58;i++)(i<29?this.pmask:this.cmask)[i]=1;this.log=[]}
  find(x){let d=0;while(x!==this.parent[x]){d+=this.delta[x];x=this.parent[x]}return [x,d%29]}
  merge(x,y,k){let [a,dx]=this.find(x),[b,dy]=this.find(y),d=mod(k+dx-dy);if(a===b)return d===0;
   if(this.size[a]<this.size[b]){[a,b]=[b,a];d=mod(-d)}
   const p=rot(this.pmask[b],d),c=rot(this.cmask[b],d);if((p&this.pmask[a])||(c&this.cmask[a]))return false;
   this.log.push([a,b,this.pmask[a],this.cmask[a],this.size[a]]);this.parent[b]=a;this.delta[b]=d;this.size[a]+=this.size[b];this.pmask[a]|=p;this.cmask[a]|=c;return true}
  rollback(k){while(this.log.length>k){const [a,b,p,c,s]=this.log.pop();this.parent[b]=b;this.delta[b]=0;this.pmask[a]=p;this.cmask[a]=c;this.size[a]=s}}
  add(e){for(let i=0;i<e.length;i+=3)if(!this.merge(e[i],e[i+1],e[i+2]))return false;return true}
  completion(){let groups=[];for(let i=0;i<58;i++)if(this.parent[i]===i&&this.size[i]>1)groups.push(i);groups.sort((a,b)=>this.size[b]-this.size[a]);const offsets=new Int8Array(58).fill(-1);
   function visit(t,P,C){if(t===groups.length)return true;const g=groups[t],m=this.pmask[g],n=this.cmask[g];for(let k=0;k<(t===0?1:29);k++){const a=rot(m,k),b=rot(n,k);if((P&a)||(C&b))continue;offsets[g]=k;if(visit.call(this,t+1,P|a,C|b))return true;}offsets[g]=-1;return false}
   if(!visit.call(this,0,0,0))return null;
   const vals=new Int8Array(58).fill(-1),used=[0,0];for(let i=0;i<58;i++){const [a,d]=this.find(i);if(offsets[a]>=0){vals[i]=mod(offsets[a]+d);used[i<29?0:1]|=1<<vals[i]}}
   for(let i=0;i<58;i++)if(vals[i]<0){const side=i<29?0:1;let k=0;while(used[side]&(1<<k))k++;vals[i]=k;used[side]|=1<<k}
   const gauge=vals[0];return Array.from(vals,v=>mod(v-gauge))
  }
 }
 function edges(C,P,j){const e=[];for(let i=0;i<C.length;i++){if(P[i]===0){if(C[i]!==0)return null;continue}e.push(P[i],29+C[i],sh[j++])}return e}
 function choices(a){let out=[];const d=new DSU();for(const w of dictionaries)if(w.P.length===a.len)for(let j=a.local-a.prefixF;j<=a.local;j++){const e=edges(a.C,w.P,j);if(e&&d.add(e)){out.push({word:w.word,P:w.P,j,e})}d.rollback(0)}return out}
 const chapterStarts=[0,3,8,15,23,27,33,40,54];for(const a of anchors){const cp=chapterStarts.filter(p=>p<=a.p).at(-1),prefix=c.pages.slice(cp,a.p).flatMap(p=>p.indices).concat(c.pages[a.p].indices.slice(0,a.local));a.pageLocal=a.local;a.local=prefix.length;a.prefixF=prefix.filter(x=>x===0).length;a.chapter=cp;}const sets=anchors.map(a=>({a,L:choices(a)})).sort((a,b)=>a.L.length-b.L.length);
 const K=4,active=sets.slice(0,K),pairs=[],pairStats=[],dsu=new DSU(),counts=Array(K).fill(0),nodes=Array(K).fill(0),chosen=[];let visits=0,limited=false,witness=null;
 for(let i=0;i<K;i++){pairs[i]=[];for(let j=i+1;j<K;j++){const A=active[i].L,B=active[j].L,W=Math.ceil(B.length/32),rows=new Uint32Array(A.length*W);let compatible=0;for(let x=0;x<A.length;x++){assert(dsu.add(A[x].e),"local");const k=dsu.log.length;for(let y=0;y<B.length;y++){if(dsu.add(B[y].e)){rows[x*W+(y>>>5)]|=1<<(y&31);compatible++}dsu.rollback(k)}dsu.rollback(0)}pairs[i][j]={W,rows};pairStats.push({i,j,total:A.length*B.length,compatible})}}
 function search(i){if(i===K){const key=dsu.completion();if(!key)return false;witness={key,chosen:chosen.map((v,j)=>({i:active[j].a.i,word:active[j].L[v].word,P:active[j].L[v].P,j:active[j].L[v].j}))};return true}
 const A=active[i].L,W=Math.ceil(A.length/32),mask=new Uint32Array(W).fill(0xffffffff);
 if(A.length%32)mask[W-1]=(2**(A.length%32)-1)>>>0;
 for(let j=0;j<i;j++){const q=pairs[j][i];for(let w=0;w<W;w++)mask[w]&=q.rows[chosen[j]*W+w]}
 for(let w=0;w<W;w++){let bits=mask[w];while(bits){const lsb=bits&-bits,x=w*32+31-Math.clz32(lsb);bits=(bits^lsb)>>>0;visits++;nodes[i]++;const k=dsu.log.length;if(dsu.add(A[x].e)){counts[i]++;chosen.push(x);if(search(i+1))return true;chosen.pop()}dsu.rollback(k)}}return false}
 search(0);
 // Validate bipartite graph solver on hidden independent alphabets, exact same source lengths/positions, lexical plants.
 function perm(seed){let s=id.slice(),x=seed;for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[s[i],s[j]]=[s[j],s[i]]}return s}
 const S=perm(0x12913301),T=perm(0x7251beef),control=new DSU();let planted=[];
 for(let k=0;k<7;k++){const a=anchors[k],w=dictionaries.find(w=>w.P.length===a.len&&w.P.every(x=>x!==0)),j=a.local, C=w.P.map((p,i)=>T[mod(S[p]+sh[j+i])]),e=edges(C,w.P,j);assert(control.add(e),"plant graph");planted.push({C,P:w.P,j,e})}
 const key=control.completion();assert(key&&planted.every(q=>q.e.every((_,i)=>i%3||mod(key[q.e[i+1]]-key[q.e[i]])===q.e[i+2])),"plant exact cover");
 const bad=new DSU();assert(bad.merge(1,29,1)&&!bad.merge(2,29,1),"collision rejection");
 return {method:"two independent GP29 permutations bracketing p56 prime shift; literal F hold, illustrated-chapter zero-origin reset, four most constrained of 25 intact groups of length at least 12, exact pairwise bitset intersections; relaxed earlier hold counts, sign symmetry",dictionaryCounts:{12:dictionaries.filter(w=>w.P.length===12).length,13:dictionaries.filter(w=>w.P.length===13).length,14:dictionaries.filter(w=>w.P.length===14).length},sets:sets.map(({a,L})=>({...a,localTraces:L.length})),pairStats,activeAnchors:active.map(s=>s.a.i),nodes,counts,visits,limited,witness,control:{knownGraphFeasible:true,completeAssignedKey:key,anchors:planted.length}}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];const d=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],d[2],JSON.parse(d[3]),d.slice(4)),null,2));
