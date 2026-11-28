'use strict';
// Exact source-fixed opposite/same GP29 pad lexical/OOV inverse. Run from repository root with Node.
const fs = require('node:fs');
const path = require('node:path');
const study = function(read){
  const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),pages=read("resources/liber-primus/lp2-transcription.txt").split("%");
  const glyph=new Map(corpus.runes.map((s,i)=>[s,i])),tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  const mod=x=>(x%29+29)%29;
  function encode(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<w.length;){const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)return null;a.push(t.i);i+=t.s.length;}return a;}
  const dict=new Map();
  function add(w,f){const a=encode(w);if(!a||!a.length)return;const s=a.join(",");const old=dict.get(s);if(old)old.f+=f;else dict.set(s,{a,f,w});}
  for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){const m=line.match(/^([a-z]+) (\d+)$/);if(m)add(m[1],+m[2]);}
  for(const p of ["resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"]){for(const w of read(p).match(/[A-Za-z]+/g)||[])add(w,1);}
  const byLen=new Map();for(const w of dict.values()){if(!byLen.has(w.a.length))byLen.set(w.a.length,[]);byLen.get(w.a.length).push(w);}
  for(const ws of byLen.values())ws.sort((a,b)=>b.f-a.f||a.w.localeCompare(b.w));
  function layout(page){const words=[],positions=[],lines=[];let word=[],line=[];const finish=()=>{if(word.length){words.push(word);word=[];}};const cipher=corpus.pages.find(p=>p.page===page).indices;
    for(const ch of pages[page]){if(glyph.has(ch)){const i=positions.length;if(cipher[i]!==glyph.get(ch))throw Error("transcript mismatch "+page+":"+i);positions.push([words.length,word.length]);word.push(i);line.push(i);}else if(" -.$&§".includes(ch))finish();if(ch==="/"&&line.length){lines.push(line);line=[];}}
    finish();if(line.length)lines.push(line);if(positions.length!==cipher.length)throw Error("length mismatch");return {words,positions,lines,cipher};
  }
  const a=layout(7),b=layout(23);if(a.cipher.length!==208||b.cipher.length!==213||a.words.length!==50||b.words.length!==46||a.lines.length!==10||b.lines.length!==10)throw Error("layout");
  const ord=Array.from({length:213},(_,i)=>i),mir=b.lines.slice().reverse().flat(),alignments=[["direct-first",ord.slice(0,208)],["direct-last",ord.slice(5)],["mirror-first",mir.slice(0,208)],["mirror-last",mir.slice(5)]];
  const n=a.words.length,sizes=[...a.words,...b.words].map(w=>w.length);
  // Source page breaks cut the p6→p7 and p23→p24 groups.
  function edgeCount(page,fromEnd){const chars=[...pages[page]].filter(c=>c!=='/'&&c!=='\n'&&c!=='\r');if(fromEnd)chars.reverse();let count=0;for(const c of chars){if(!glyph.has(c))break;count++;}return count;}
  const prefix=edgeCount(6,true),suffix=edgeCount(24,false);
  if(prefix!==1||suffix!==3||sizes[0]!==2||sizes.at(-1)!==4)throw Error("carry source changed");
  const full=sizes.map((l,i)=>{const pre=i===0?prefix:0,post=i===sizes.length-1?suffix:0;const ws=byLen.get(l+pre+post);if(!ws)throw Error("no dictionary length "+(l+pre+post));if(!pre&&!post)return ws;const projected=new Map();for(const w of ws){const a=w.a.slice(pre,pre+l),key=a.join(",");if(!projected.has(key))projected.set(key,{...w,a});}return [...projected.values()];});
  const lexicalSets=full.map(ws=>new Set(ws.map(w=>w.a.join(","))));
  function makeEdges(al,ca,cb,sign,omitHeading){const map=new Map();for(let i=0;i<208;i++){const j=al[i];if(omitHeading&&j<16)continue;const [u,x]=a.positions[i],[v0,y]=b.positions[j],v=v0+n,k=u+":"+v;let e=map.get(k);if(!e){e={u,v,p:[]};map.set(k,e);}e.p.push([x,y,mod(ca[i]+sign*cb[j])]);}return [...map.values()];}
  function sig(w,e,node,sign){return String.fromCharCode(...e.p.map(([x,y,t])=>node===e.u?mod(sign*(t-w.a[x])):w.a[y]));}
  // Lexical domains plus one unrestricted wildcard. Each position has only
  // one counterpart, so wildcard letters can be chosen independently.
  function solve(al,ca,cb,sign,omitHeading){
    const edges=makeEdges(al,ca,cb,sign,omitHeading),N=sizes.length,adj=Array.from({length:N},()=>[]),uf=Array.from({length:N},(_,i)=>i);
    const find=x=>{while(uf[x]!==x){uf[x]=uf[uf[x]];x=uf[x];}return x;};
    let dropped=0;
    for(const e of edges){const x=find(e.u),y=find(e.v);if(x===y){dropped++;continue;}uf[x]=y;adj[e.u].push([e.v,e]);adj[e.v].push([e.u,e]);}
    const chosen=Array(N),seen=new Set(),roots=[];
    // Every child sends a minimum-cost message keyed by its edge signature.
    // Wildcard state is the last entry. Its message is valid for every key.
    function visit(u,parent){
      seen.add(u);const ws=full[u],W=ws.length,cost=new Int16Array(W+1);cost[W]=1;const children=[];
      for(const [v,e] of adj[u]){if(v===parent)continue;const child=visit(v,u),vc=child.cost,V=full[v].length,lookup=new Map();let best=V;
        for(let j=0;j<V;j++){const k=sig(full[v][j],e,v,sign),old=lookup.get(k);if(old===undefined||vc[j]<vc[old])lookup.set(k,j);if(vc[j]<vc[best])best=j;}
        function choice(i){if(i===W)return best;const j=lookup.get(sig(ws[i],e,u,sign));return j!==undefined&&vc[j]<=vc[V]?j:V;}
        for(let i=0;i<=W;i++)cost[i]+=vc[choice(i)];children.push({child,choice});
      }
      function assign(i){chosen[u]=i;for(const {child,choice} of children)child.assign(choice(i));}
      return {cost,assign};
    }
    let min=0;
    for(let u=0;u<N;u++)if(!seen.has(u)){roots.push(u);const r=visit(u,-1);let best=0;for(let j=1;j<r.cost.length;j++)if(r.cost[j]<r.cost[best])best=j;min+=r.cost[best];r.assign(best);}
    const wild=chosen.map((i,u)=>i===full[u].length);
    if(wild.filter(Boolean).length!==min)throw Error("DP reconstruction mismatch");
    const plain=chosen.map((i,u)=>wild[u]?Array(sizes[u]).fill(null):full[u][i].a.slice());
    let conflict=0;
    for(const e of edges)for(const [x,y,t] of e.p){const A=plain[e.u],B=plain[e.v];if(A[x]===null&&B[y]===null){A[x]=0;B[y]=mod(sign*t);}else if(A[x]===null)A[x]=mod(t-sign*B[y]);else if(B[y]===null)B[y]=mod(sign*(t-A[x]));else if(mod(A[x]+sign*B[y])!==t)conflict++;}
    for(const p of plain)for(let i=0;i<p.length;i++)if(p[i]===null)p[i]=0;
    const ap=a.positions.map(([w,p])=>plain[w][p]),bp=b.positions.map(([w,p])=>plain[w+n][p]);
    let replay=0,compared=0;for(let i=0;i<208;i++){const k=mod(ca[i]-ap[i]),j=al[i];if(omitHeading&&j<16)continue;compared++;if(mod(bp[j]-sign*k)===cb[j])replay++;}
    const actualOov=plain.filter((p,i)=>!lexicalSets[i].has(p.join(","))).length;
    if(!conflict&&(replay!==compared||actualOov<min))throw Error("bad optimum or replay");
    const result={edgeCount:edges.length,components:roots.length,dropped,minOovLowerBound:min,exact:conflict===0,conflict,replay,compared,actualOov,wildcardWordIds:wild.flatMap((yes,i)=>yes?[i<n?`p7:${i}`:`p23:${i-n}`]:[]),witness:plain.map(p=>p.map(i=>corpus.translit[i]).join(""))};
    return result;
  }
  let seed=127031;function rand(m){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%m;}
  const results=[];for(const [name,al] of alignments)for(const sign of [1,-1])for(const omitHeading of [false,true]){
    const original=solve(al,a.cipher,b.cipher,sign,omitHeading);
    const truth=full.map(ws=>ws[rand(Math.min(ws.length,50))]);const ap=a.positions.map(([w,p])=>truth[w].a[p]),bp=b.positions.map(([w,p])=>truth[w+n].a[p]);const ca=ap.map(x=>mod(x+rand(29))),cb=bp.map(x=>mod(x+rand(29)));for(let i=0;i<208;i++)cb[al[i]]=mod(bp[al[i]]-sign*mod(ca[i]-ap[i]));
    const plant=solve(al,ca,cb,sign,omitHeading);if(plant.minOovLowerBound!==0||!plant.exact||plant.replay!==plant.compared)throw Error("planted dictionary support failed");
    results.push({name,sign,omitHeading,original,plant:{minOov:plant.minOovLowerBound,exact:plant.exact,replay:plant.replay,compared:plant.compared}});
  }
  return{dictionarySize:dict.size,initialCandidateCount:full.reduce((s,d)=>s+d.length,0),wordSizes:sizes,carry:{p7Prefix:prefix,p23Suffix:suffix},results};
};
const result = study(p => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8'));
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
