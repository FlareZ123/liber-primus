'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(data) {
  const [rawCorpus,raw,dict,rawNative,lp1,shakespeare,gibran,emerson]=data;
  const c=JSON.parse(rawCorpus), native=JSON.parse(rawNative);
  const m=x=>(x%29+29)%29, full=(1<<29)-1, ids=Array.from({length:29},(_,i)=>i);
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const rot=(a,k)=>((a<<k)|(a>>>(29-k)))&full;
  const idx=new Map(c.runes.map((r,i)=>[r,i])), tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const extract=s=>[...s].filter(r=>idx.has(r)).map(r=>idx.get(r));
  function encode(w){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){p.push(21);i+=3}else if(w.startsWith("IO",i)){p.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)return null;p.push(t.i);i+=t.s.length}}return p}
  const ss=native.sections.slice(0,7).map(s=>extract(s.source_text));
  const corrected=ss.map((s,i)=>i===3?extract(lp1.split("%").slice(4,8).join("")).map(x=>m(31-x)):s).flat();
  check(corrected.length===2797,"corrected LP1 length");
  const schedules=[corrected,corrected.map(x=>c.prime[x]%29)];
  const lex=new Map();
  function add(w,P){if(P&&P.length>=12&&P.length<=14&&!lex.has(P.join(",")))lex.set(P.join(","),{w,P})}
  for(const line of dict.split(/\r?\n/)){if(/^[a-z]+\s+\d+$/i.test(line)){const w=line.split(/\s+/)[0].toUpperCase();add(w,encode(w))}}
  for(const t of [shakespeare,gibran,emerson])for(const w of t.toUpperCase().match(/[A-Z]+/g)||[])add(w,encode(w));
  for(const s of native.sections)for(const w of s.source_text.split(/[^\u16a0-\u16ff]+/g).filter(Boolean))add(w,extract(w));
  const lexByLen=Array.from({length:15},()=>[]);for(const x of lex.values())lexByLen[x.P.length].push(x);
  const tape=c.pages.slice(0,56).flatMap(p=>p.indices), starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const groups=raw.split("%").slice(0,55).join("%").replace(/[/\s%]/g,"").split(/[^\u16a0-\u16ff]+/g).filter(Boolean);
  let off=0,pg=0,ps=0;const original=[];
  for(let i=0;i<groups.length;i++){const C=extract(groups[i]);while(off>=ps+c.pages[pg].indices.length){ps+=c.pages[pg].indices.length;pg++}
    check(C.every((v,j)=>v===tape[off+j]),"original transcription mismatch");
    if(C.length>=12&&off-ps+C.length<=c.pages[pg].indices.length){const cp=starts.findLastIndex(x=>x<=off), local=off-starts[cp];original.push({i,pg,local,len:C.length,prefixF:tape.slice(starts[cp],off).filter(x=>x===0).length,C})}off+=C.length;
  }
  check(off===12956&&groups.length===2896&&original.length===25,"original dimensions");
  class DSU{
    constructor(){this.parent=Int8Array.from({length:58},(_,i)=>i);this.d=new Int8Array(58);this.size=new Uint8Array(58).fill(1);this.pm=new Int32Array(58);this.cm=new Int32Array(58);for(let i=0;i<58;i++)(i<29?this.pm:this.cm)[i]=1;this.log=[]}
    find(x){let d=0;while(x!==this.parent[x]){d+=this.d[x];x=this.parent[x]}return [x,d%29]}
    merge(x,y,k){let [a,dx]=this.find(x),[b,dy]=this.find(y),d=m(k+dx-dy);if(a===b)return d===0;if(this.size[a]<this.size[b]){[a,b]=[b,a];d=m(-d)}
      const p=rot(this.pm[b],d),q=rot(this.cm[b],d);if((p&this.pm[a])||(q&this.cm[a]))return false;
      this.log.push([a,b,this.pm[a],this.cm[a],this.size[a]]);this.parent[b]=a;this.d[b]=d;this.size[a]+=this.size[b];this.pm[a]|=p;this.cm[a]|=q;return true}
    rollback(n){while(this.log.length>n){const [a,b,p,q,s]=this.log.pop();this.parent[b]=b;this.d[b]=0;this.pm[a]=p;this.cm[a]=q;this.size[a]=s}}
    add(e){for(let i=0;i<e.length;i+=3)if(!this.merge(e[i],e[i+1],e[i+2]))return false;return true}
    completion(){const groups=[];for(let i=0;i<58;i++)if(this.parent[i]===i&&this.size[i]>1)groups.push(i);groups.sort((a,b)=>this.size[b]-this.size[a]);const shifts=new Int8Array(58).fill(-1),self=this;
      function rec(t,P,C){if(t===groups.length)return true;const a=groups[t];for(let k=0;k<(t===0?1:29);k++){const p=rot(self.pm[a],k),c=rot(self.cm[a],k);if((p&P)||(c&C))continue;shifts[a]=k;if(rec(t+1,P|p,C|c))return true}shifts[a]=-1;return false}
      if(!rec(0,0,0))return null;
      const vals=new Int8Array(58).fill(-1),used=[0,0];for(let i=0;i<58;i++){const [a,d]=this.find(i);if(shifts[a]>=0){vals[i]=m(shifts[a]+d);used[i<29?0:1]|=1<<vals[i]}}
      for(let i=0;i<58;i++)if(vals[i]<0){const s=i<29?0:1;let k=0;while(used[s]&(1<<k))k++;vals[i]=k;used[s]|=1<<k}
      return Array.from(vals,v=>m(v-vals[0]));
    }
  }
  function edges(C,P,j,K){const e=[];for(let i=0;i<P.length;i++){if(P[i]===0){if(C[i]!==0)return null;continue}e.push(P[i],29+C[i],K[j++%K.length])}return e}
  function options(a,K){const out=[],d=new DSU();for(const w of lexByLen[a.len])for(let j=a.local-a.prefixF;j<=a.local;j++){const e=edges(a.C,w.P,j,K);if(e&&d.add(e))out.push({w:w.w,P:w.P,j,e});d.rollback(0)}return out}
  function solve(anchors,K,originalMode){
    const sets=anchors.map(a=>({a,L:options(a,K)})).sort((a,b)=>a.L.length-b.L.length);
    const sizes=sets.map(s=>({i:s.a.i,local:s.a.local,len:s.a.len,prefixF:s.a.prefixF,options:s.L.length}));
    const n=sets.length, q=Math.min(4,n), pairs=[], pairStats=[], d=new DSU();
    const chosen=[],nodes=Array(n).fill(0),counts=Array(n).fill(0);let visits=0,limit=false,solutions=0,witness=null;
    if(sets[0].L.length===0)return {sizes,pairStats,nodes,counts,visits,limit,solutions,witness};
    for(let i=0;i<q;i++){pairs[i]=[];for(let j=i+1;j<q;j++){const A=sets[i].L,B=sets[j].L,W=Math.ceil(B.length/32),rows=new Uint32Array(A.length*W);let compatible=0;
      for(let x=0;x<A.length;x++){check(d.add(A[x].e),"local");const z=d.log.length;for(let y=0;y<B.length;y++){if(d.add(B[y].e)){rows[x*W+(y>>>5)]|=1<<(y&31);compatible++}d.rollback(z)}d.rollback(0)}
      pairs[i][j]={W,rows};pairStats.push({i,j,total:A.length*B.length,compatible});
    }}
    function search(i){if(i===n){const key=d.completion();if(!key)return false;solutions++;if(!witness)witness={key,chosen:chosen.map((v,j)=>({i:sets[j].a.i,w:sets[j].L[v].w,P:sets[j].L[v].P,j:sets[j].L[v].j}))};return originalMode}
      const A=sets[i].L,W=Math.ceil(A.length/32),mask=new Uint32Array(W).fill(0xffffffff);if(A.length%32)mask[W-1]=(2**(A.length%32)-1)>>>0;
      if(i<q)for(let j=0;j<i;j++){const a=pairs[j][i];for(let w=0;w<W;w++)mask[w]&=a.rows[chosen[j]*W+w]}
      for(let w=0;w<W;w++){let b=mask[w];while(b){const l=b&-b,x=w*32+31-Math.clz32(l);b=(b^l)>>>0;if(++visits>5_000_000){limit=true;return true}
        nodes[i]++;const z=d.log.length;if(d.add(A[x].e)){counts[i]++;chosen.push(x);if(search(i+1))return true;chosen.pop()}d.rollback(z);
      }}return false
    }
    search(0);return {sizes,pairStats,nodes,counts,visits,limit,solutions,witness};
  }
  function perm(seed){let x=seed>>>0,p=ids.slice();for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
  function encrypt(P,K,A,B,j=0){const inv=ids.map(x=>B.indexOf(x));return P.map(p=>p===0?0:inv[m(A[p]+K[j++%K.length])])}
  const L=Array.from({length:29},()=>new Float64Array(29).fill(.5));
  const train=(emerson.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>encode(w)||[]);
  for(let i=1;i<train.length;i++)L[train[i-1]][train[i]]++;
  for(const row of L){const s=row.reduce((a,b)=>a+b);for(let i=0;i<29;i++)row[i]=Math.log(row[i]/s)}
  function decode(C,K,key,j,last){const A=key.slice(0,29),B=key.slice(29),inv=ids.map(x=>A.indexOf(x));let states=new Map([[j*29+last,{j,last,s:0,P:[]}]]);
    for(const c of C){const next=new Map();for(const st of states.values()){function add(p,j){const s=st.s+L[st.last][p],k=j*29+p;if(!next.has(k)||next.get(k).s<s)next.set(k,{j,last:p,s,P:st.P.concat(p)})}
      if(c===0)add(0,st.j);const p=inv[m(B[c]-K[st.j%K.length])];if(p!==0)add(p,st.j+1)}
      states=next;if(!states.size)return null;
    }return [...states.values()].sort((a,b)=>b.s-a.s)[0]
  }
  function plant(donor,K,seed){
    const A=perm(seed),B=perm(seed^0x1a2098cd),truthKey=A.concat(B).map(x=>m(x-A[0]));
    const words=(donor.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>({w,P:encode(w)})).filter(x=>x.P),flat=words.flatMap(x=>x.P);
    const scopes=[],prefixes=[0,3,9,12,15,18,21,23],used=new Set();let i=0,previous=-1000;
    for(const w of words){const pos=i;i+=w.P.length;if(scopes.length===8)break;const pre=prefixes[scopes.length];
      if(w.P.length<12||w.P.length>14||new Set(w.P).size<8||pos<pre||pos-previous<180||i+76>flat.length||used.has(w.P.join(",")))continue;
      previous=pos;used.add(w.P.join(","));const P=flat.slice(pos-pre,i+76),C=encrypt(P,K,A,B);scopes.push({i:scopes.length,local:pre,len:w.P.length,prefixF:C.slice(0,pre).filter(x=>x===0).length,C:C.slice(pre,pre+w.P.length),fullC:C,fullP:P,word:w.w,truth:w.P,trueJ:P.slice(0,pre).filter(x=>x!==0).length});
    }
    check(scopes.length===8,"not enough controls");
    const answer=solve(scopes.map(({i,local,len,prefixF,C})=>({i,local,len,prefixF,C})),K,false);
    const truthRetained=scopes.every(s=>options(s,K).some(x=>x.j===s.trueJ&&x.P.join()===s.truth.join()));
    const w=answer.witness, rows=w?w.chosen.map(q=>{const s=scopes[q.i],end=q.j+q.P.filter(x=>x!==0).length,H=decode(s.fullC.slice(s.local+s.len),K,w.key,end,q.P.at(-1));
      const replay=H&&encrypt(H.P,K,w.key.slice(0,29),w.key.slice(29),end).join()===s.fullC.slice(s.local+s.len).join();
      return {anchor:s.word,recovered:q.w,anchorExact:q.P.join()===s.truth.join(),cursorExact:q.j===s.trueJ,heldCorrect:H?H.P.filter((v,i)=>v===s.fullP[s.local+s.len+i]).length:0,heldLength:76,legal:!!H,replay:!!replay}
    }):[];
    const bestTranslationKeyMatch=w?ids.map(d=>({d,total:w.key.filter((v,i)=>m(v+d)===truthKey[i]).length,inner:w.key.slice(0,29).filter((v,i)=>m(v+d)===truthKey[i]).length,outer:w.key.slice(29).filter((v,i)=>m(v+d)===truthKey[i+29]).length})).sort((a,b)=>b.total-a.total)[0]:null;
    return {answer,truthRetained,rows,keyMatches:w?w.key.filter((x,i)=>x===truthKey[i]).length:0,bestTranslationKeyMatch,truthKey};
  }
  const results=[];
  for(let i=0;i<schedules.length;i++){const K=schedules[i],control=plant(i?gibran:shakespeare,K,0x20261126+i);
    const gate=!control.answer.limit&&control.answer.solutions===1&&control.truthRetained&&control.rows.every(r=>r.anchorExact&&r.cursorExact);
    const target=gate?solve(original,K,true):null;
    results.push({schedule:i?"corrected LP1 sacred primes mod29":"corrected LP1 GP ordinals",control,gate,target});
  }
  return {method:"Independent GP29 input/output permutations, source-corrected LP1 cyclic running key, chapter zero origins, genuine plaintext F hold. Exact long-anchor graph constraints, relaxed independent preceding hold counts. Positive controls use fresh reset scopes with native donor anchors; no original test unless unique exact anchor/cursor tuple recovered. Signs equivalent by negating both permutations. Original solver stops at first complete key or 5M DFS visits.",lexCounts:[12,13,14].map(n=>lexByLen[n].length),sourceKeyLength:corrected.length,results};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
