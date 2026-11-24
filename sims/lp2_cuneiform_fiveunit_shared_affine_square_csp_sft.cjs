'use strict';
// Source-fixed five-unit shared affine constraint solver; Node 22 CommonJS.
const fs=require('node:fs');
const path=require('node:path');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/lp2-transcription.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/cicada2014-openpuff-magic-squares.txt"
];
const experiment=function experiment(inputs) {
  const [corp,trans,lex,native,squareText]=inputs;
  const corpus=JSON.parse(corp), known=JSON.parse(native), pageText=trans.split('%');
  const map=new Map(corpus.runes.map((r,i)=>[r,i])), alpha=new Map(corpus.translit.map((s,i)=>[s,i]));
  const N=29,W=91,ALL=(1<<N)-1, mod=x=>(x%N+N)%N;
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const inv=Array.from({length:29},(_,a)=>{for(let b=1;b<29;b++)if(a*b%29===1)return b;return 0});
  const dict=Array.from({length:32},()=>new Map());
  const add=(w,f=1)=>{if(w.length&&w.length<dict.length){const k=w.join(',');const old=dict[w.length].get(k);if(!old||old.f<f)dict[w.length].set(k,{w,f})}};
  function variants(word){
    const s=word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
    const out=[];
    function visit(i,w){if(i===s.length){out.push(w);return}for(const n of [1,2,3]){
      const sub=s.slice(i,i+n);if(sub.length!==n)continue;
      const v=n===3?(sub==='ING'?alpha.get('NG'):undefined):alpha.get(sub);
      if(v!==undefined)visit(i+n,w.concat(v));
    }}
    visit(0,[]);return out;
  }
  for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m && m[1].length>=2)for(const w of variants(m[1]))add(w,+m[2]);}
  for(const w of ['A','I','O'])for(const v of variants(w))add(v);
  function runeWords(s){const out=[];let w=[];for(const c of s){if(map.has(c))w.push(map.get(c));else if(w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out}
  const nativeWords=known.sections.map(x=>runeWords(x.source_text));
  for(const ws of nativeWords)for(const w of ws)add(w);
  const vocabulary=dict.map(x=>[...x.values()]);
  function span(p,lo,hi){let count=0,started=false,s='';for(const ch of pageText[p]){
    const is=map.has(ch);if(is&&count===lo)started=true;if(is&&count===hi)break;if(started)s+=ch;if(is)count++;
  }assert(count===hi,'source span');return s}
  const definitions=[[[36,99,238]],[[37,0,91]],[[37,91,189]],[[37,189,228],[38,0,57]],[[38,57,186]]];
  function sourceWords(s){const words=[];let w=[];for(const c of s){if(map.has(c))w.push(map.get(c));else if('- .&•'.replace(' ','').includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
  const origWords=definitions.map(parts=>{const w=sourceWords(parts.map(([p,a,b])=>span(p,a,b)).join(''));const expected=parts.flatMap(([p,a,b])=>corpus.pages.find(x=>x.page===p).indices.slice(a,b));assert(w.flat().join(',')===expected.join(','),'original source');return w});
  assert(origWords.map(w=>w.flat().length).join(',')==='139,91,98,96,129','source lengths');
  assert(origWords.reduce((s,w)=>s+w.length,0)===122,'source words');
  function tracks(words){return words.map(ws=>{let t=0;const groups=[];for(const w of ws){if(t>=W)break;groups.push({start:t,len:w.length,used:Math.min(w.length,W-t)});t+=w.length}return {groups,tape:ws.flat().slice(0,W)}})}
  const original=tracks(origWords);
  function invert(M){let a=M.map((row,i)=>row.map(mod).concat(Array.from({length:5},(_,j)=>+(i===j))));for(let k=0;k<5;k++){let i=a.findIndex((x,j)=>j>=k&&x[k]);assert(i>=0,'singular');[a[k],a[i]]=[a[i],a[k]];let u=inv[a[k][k]];a[k]=a[k].map(x=>mod(x*u));for(let j=0;j<5;j++)if(j!==k){let v=a[j][k];a[j]=a[j].map((x,l)=>mod(x-v*a[k][l]))}}return a.map(x=>x.slice(5))}
  const I=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>+(i===j)));
  const sq=squareText.trim().split(/\r?\n\s*\r?\n/).map(s=>s.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number)));
  const matrices=[I,sq[0],sq[2]];
  assert(matrices.slice(1).map(m=>m[0].reduce((a,b)=>a+b,0)).join(',')==='3301,1033','source squares');
  function apply(T,M){return T.map((track,j)=>({...track,tape:track.tape.map((_,t)=>mod(M[j].reduce((s,m,k)=>s+m*T[k].tape[t],0)))}))}

  // Choose the shortest window whose layout-only heuristic expected count
  // is below 0.01; no ciphertext values are used for window selection.
  const cache=new Map();
  function size(n,a,b){const k=[n,a,b].join(',');if(!cache.has(k))cache.set(k,new Set(vocabulary[n].map(x=>x.w.slice(a,b).join(','))).size);return cache.get(k)}
  function score(a,b,T=original){let z=(b-a)*Math.log(812/29**5);for(const t of T)for(const g of t.groups){const lo=Math.max(0,a-g.start),hi=Math.min(g.len,b-g.start);if(lo<hi)z+=Math.log(size(g.len,lo,hi))}return z}
  let window;
  for(let n=1;n<=W&&!window;n++){let z=[];for(let a=0;a<=W-n;a++)z.push([a,a+n,score(a,a+n)]);z.sort((a,b)=>a[2]-b[2]||a[0]-b[0]);if(z[0][2]<Math.log(.01))window=z[0]}
  assert(window&&window[0]===62&&window[1]===67,'layout-only selection');
  function solve(T,a,b,excluded=null){
    const lanes=T.map(track=>{
      const slots=[];
      for(const g of track.groups){
        const lo=Math.max(0,a-g.start),hi=Math.min(g.len,b-g.start);
        if(lo>=hi)continue;
        const nodes=[{edge:new Int32Array(N).fill(-1),active:[]}];
        for(const {w} of vocabulary[g.len]){
          let k=0;
          for(let j=lo;j<hi;j++){const v=w[j];let next=nodes[k].edge[v];
            if(next===-1){next=nodes.length;nodes[k].edge[v]=next;nodes[k].active.push(v);nodes.push({edge:new Int32Array(N).fill(-1),active:[]})}
            k=next;
          }
        }
        for(let j=lo;j<hi;j++)slots.push({nodes,first:j===lo,last:j===hi-1});
      }
      assert(slots.length===b-a,'slot coverage');return slots;
    });
    const steps=Array.from({length:b-a},(_,d)=>{
      const c=T.map(x=>x.tape[a+d]);const ratios=Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>c.map(x=>mod((x-c[i])*inv[mod(c[j]-c[i])]))));return {c,ratios};
    });
    let calls=0,transitions=0;
    const dead=Array.from({length:b-a},()=>new Set());
    function search(d,indices,different=false){
      if(d===b-a)return excluded&&!different?null:[];
      calls++;
      const key=indices.join(',')+','+Number(different);if(dead[d].has(key))return null;
      const {c,ratios}=steps[d],slots=lanes.map(x=>x[d]);
      const ns=slots.map((s,l)=>s.nodes[s.first?0:indices[l]]);
      let i=-1,j=-1,best=Infinity;
      for(let u=0;u<5;u++)for(let v=u+1;v<5;v++)if(c[u]!==c[v]){
        const cost=ns[u].active.length*ns[v].active.length;
        if(cost<best){best=cost;i=u;j=v}
      }
      function next(p){
        transitions++;
        const ix=ns.map((n,l)=>n.edge[p[l]]);
        if(ix.some(v=>v<0))return null;
        for(let l=0;l<5;l++)if(slots[l].last)ix[l]=0;
        const changed=different||!!(excluded&&p.some((v,l)=>v!==excluded[d][l]));
        const rest=search(d+1,ix,changed);return rest===null?null:[p,...rest];
      }
      if(i===-1){for(const v of ns[0].active){const r=next([v,v,v,v,v]);if(r)return r}}
      else{
        const k=ratios[i][j];
        for(const u of ns[i].active)for(const v of ns[j].active){
          if(u===v)continue;
          const p=k.map(x=>mod(u+x*(v-u))),r=next(p);
          if(r)return r;
        }
      }
      dead[d].add(key);return null;
    }
    const witness=search(0,[0,0,0,0,0]);
    return {witness,calls,transitions,dead:dead.map(x=>x.size)};
  }

  let seed=20261124;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n};
  const matched=tracks(origWords.map(ws=>ws.map(w=>{const top=vocabulary[w.length].slice().sort((a,b)=>b.f-a.f).slice(0,30);assert(top.length,'dictionary coverage');return top[rnd(top.length)].w})));
  const actual=tracks(nativeWords.filter(ws=>ws.flat().length>=W).slice(0,5));
  assert(actual.length===5,'five native controls');
  function encrypt(T,M){const a=Array.from({length:W},()=>1+rnd(28)),b=Array.from({length:W},()=>rnd(29));return apply(T.map(track=>({...track,tape:track.tape.map((v,t)=>mod(a[t]*v+b[t]))})),M)}
  const [a,b]=window;
  const results=matrices.map((M,k)=>{
    const Mi=invert(M), orig=solve(apply(original,Mi),a,b);
    const controls=[matched,actual].map(P=>{
      const C=encrypt(P,M), T=apply(C,Mi), Q=solve(T,a,b);
      assert(Q.witness,'positive eliminated');
      let hits=0;
      for(let d=0;d<b-a;d++){
        const v=Q.witness[d],c=T.map(t=>t.tape[a+d]);
        assert(Array.from({length:28},(_,j)=>j+1).some(m=>v.every((p,l)=>mod(m*(p-v[0])+c[0])===c[l])),'forward replay');
        for(let l=0;l<5;l++)hits+=+(v[l]===P[l].tape[a+d]);
      }
      const second=P===matched?solve(T,a,b,Q.witness):null;
      return {...Q,hits,total:5*(b-a),unique:second?!second.witness:null,secondSearch:second?{calls:second.calls,transitions:second.transitions}:null};
    });
    assert(!orig.witness,'original lexical candidate unexpectedly exists');
    assert(controls[0].hits===5*(b-a),'matched planted witness differs');
    return {matrix:['identity','3301','1033'][k],original:orig,controls};
  });
  return {sourceWords:origWords.map(w=>w.length),vocabulary:vocabulary.reduce((s,d)=>s+d.length,0),singleton:vocabulary[1].map(x=>corpus.translit[x.w[0]]),window,results};
};
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
