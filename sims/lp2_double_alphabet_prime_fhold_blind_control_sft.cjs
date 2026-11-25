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
 function perm(seed){let s=id.slice(),x=seed;for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[s[i],s[j]]=[s[j],s[i]]}return s}
 const S=perm(0x6b013301),T=perm(0x1907beef),Ti=id.map(x=>T.indexOf(x));
 const donor=lit[2].toUpperCase().match(/[A-Z]+/g).map(word=>({word,P:encode(word)})).filter(x=>x.P);
 const chosenWords=new Set(),planted=[],flat=donor.flatMap(x=>x.P);let donorOffset=0;
 for(const w of donor){const pos=donorOffset;donorOffset+=w.P.length;if(planted.length===8)break;const pre=[0,3,9,12,15,18,21,23][planted.length];
 if(w.P.length<12||w.P.length>14||new Set(w.P).size<8||pos<pre||pos+w.P.length+76>flat.length||chosenWords.has(w.P.join(",")))continue;
 chosenWords.add(w.P.join(","));const P=flat.slice(pos-pre,pos+w.P.length+76);let j=0;const C=P.map(p=>p===0?0:T[mod(S[p]+sh[j++])]);planted.push({i:planted.length,local:pre,len:w.P.length,prefixF:C.slice(0,pre).filter(x=>x===0).length,C:C.slice(pre,pre+w.P.length),fullC:C,fullP:P,truth:w.P,trueWord:w.word,trueJ:P.slice(0,pre).filter(x=>x!==0).length});
 }
 assert(planted.length===8,"control anchors");
 const sets=planted.map(a=>({a,L:choices(a)})).sort((a,b)=>a.L.length-b.L.length);
 for(const s of sets)assert(s.L.some(q=>q.j===s.a.trueJ&&q.P.every((x,i)=>x===s.a.truth[i])),"true trace preserved");
 const K=sets.length,active=sets,pairs=[],pairStats=[],dsu=new DSU(),counts=Array(K).fill(0),nodes=Array(K).fill(0),chosen=[];let visits=0,limited=false,witness=null,solutions=0;
 const Q=4;
 for(let i=0;i<Q;i++){pairs[i]=[];for(let j=i+1;j<Q;j++){const A=active[i].L,B=active[j].L,W=Math.ceil(B.length/32),rows=new Uint32Array(A.length*W);let compatible=0;for(let x=0;x<A.length;x++){assert(dsu.add(A[x].e),"local");const k=dsu.log.length;for(let y=0;y<B.length;y++){if(dsu.add(B[y].e)){rows[x*W+(y>>>5)]|=1<<(y&31);compatible++}dsu.rollback(k)}dsu.rollback(0)}pairs[i][j]={W,rows};pairStats.push({i,j,total:A.length*B.length,compatible})}}
 function search(i){if(i===K){const key=dsu.completion();if(!key)return;solutions++;if(!witness){witness={key,chosen:chosen.map((v,j)=>({i:active[j].a.i,word:active[j].L[v].word,P:active[j].L[v].P,j:active[j].L[v].j}))}}return}
 const A=active[i].L,W=Math.ceil(A.length/32),mask=new Uint32Array(W).fill(0xffffffff);
 if(A.length%32)mask[W-1]=(2**(A.length%32)-1)>>>0;
 if(i<Q)for(let j=0;j<i;j++){const q=pairs[j][i];for(let w=0;w<W;w++)mask[w]&=q.rows[chosen[j]*W+w]}
 for(let w=0;w<W;w++){let bits=mask[w];while(bits){const lsb=bits&-bits,x=w*32+31-Math.clz32(lsb);bits=(bits^lsb)>>>0;visits++;if(visits>30000000){limited=true;return}nodes[i]++;const k=dsu.log.length;if(dsu.add(A[x].e)){counts[i]++;chosen.push(x);search(i+1);chosen.pop()}dsu.rollback(k);if(limited)return}}}
 search(0);
 const bigram=Array.from({length:29},()=>new Float64Array(29).fill(.2));for(const raw of lit.slice(0,2)){const p=(raw.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>encode(w)||[]);for(let i=1;i<p.length;i++)bigram[p[i-1]][p[i]]++}
 for(const row of bigram){const sum=row.reduce((a,b)=>a+b);for(let i=0;i<29;i++)row[i]=Math.log(row[i]/sum)}
 function predict(C,q,key){const I=id.map(x=>key.slice(0,29).indexOf(x));let states=new Map();const cursor=q.j+q.P.filter(x=>x!==0).length,last=q.P.at(-1);states.set(cursor*29+last,{j:cursor,last,s:0,P:[]});
 for(const c of C){const next=new Map();for(const st of states.values()){function offer(p,j){const s=st.s+bigram[st.last][p],k=j*29+p;if(!next.has(k)||next.get(k).s<s)next.set(k,{j,last:p,s,P:st.P.concat(p)})}if(c===0)offer(0,st.j);const p=I[mod(key[29+c]-sh[st.j])];if(p!==0)offer(p,st.j+1)}states=next;if(!states.size)return null}
 return [...states.values()].sort((a,b)=>b.s-a.s)[0]}
 const truthKey=S.concat(Ti).map(x=>mod(x-S[0]));let results=null;
 if(witness){const q=witness.key;const rows=witness.chosen.map(v=>{const a=planted[v.i],cut=a.local+a.len,H=predict(a.fullC.slice(cut),v,q);let replay=false;if(H){let j=v.j+v.P.filter(x=>x!==0).length;const C=H.P.map(p=>p===0?0:q.slice(29).indexOf(mod(q[p]+sh[j++])));replay=C.every((x,i)=>x===a.fullC[cut+i]);assert(replay,"heldout forward replay")}return {i:a.i,selectedWord:v.word,trueWord:a.trueWord,wordExact:v.P.every((x,i)=>x===a.truth[i]),phase:v.j,truePhase:a.trueJ,withheld:H?H.P.filter((x,i)=>x===a.fullP[cut+i]).length:0,heldoutLength:76,legal:!!H,replay}});results={keyMatch:q.filter((x,i)=>x===truthKey[i]).length,innerMatch:q.slice(0,29).filter((x,i)=>x===truthKey[i]).length,outerMatch:q.slice(29).filter((x,i)=>x===truthKey[29+i]).length,rows}}
 return {method:"blind two independent alphabet recovery from eight genuine literary long groups, four pair-indexed and remaining exact DFS; frozen inferred anchor cursor/key to 76 following runes per scope",sets:sets.map(s=>({i:s.a.i,word:s.a.trueWord,offset:s.a.local,length:s.a.len,prefixF:s.a.prefixF,localTraces:s.L.length})),pairStats,nodes,counts,visits,limited,solutions,witness,truthKey,results};
}

const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];const d=paths.map(p=>fs.readFileSync(p,"utf8"));console.log(JSON.stringify(experiment(JSON.parse(d[0]),d[1],d[2],JSON.parse(d[3]),d.slice(4)),null,2));
