"use strict";
// Exhaustive long-anchor candidate generation, independent group pruning and exact continuous lexical replay.
function experiment(raw) {
  const gp=JSON.parse(raw.gp),g=JSON.parse(raw.groups),gold=JSON.parse(raw.gold),Q=8,A="0123456789abcdefghijklmnopqrstuvwxyz";
  const word=a=>a.map(x=>A[x]).join(""),arr=s=>[...s].map(c=>A.indexOf(c)),tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function words(text){return (text.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const v=[];for(let i=0;i<w.length;){const t=w.startsWith("ING",i)?{s:"ING",i:21}:w.startsWith("IO",i)?{s:"IO",i:27}:tokens.find(t=>w.startsWith(t.s,i));if(!t)throw Error("unmapped "+w);v.push(t.i);i+=t.s.length}return word(v)})}
  const donors=[raw.shakespeare,raw.gibran,raw.emerson].map(words),clear=gold.sections.find(s=>s.name==="p57_parable").source_text.split(/[•⁜⁘\s]+/).filter(Boolean).map(w=>word([...w].map(x=>gp.runes.indexOf(x))));
  const lex=[...new Set([...donors.flat(),...clear])].sort((a,b)=>b.length-a.length||a.localeCompare(b)),lexarr=lex.map(arr),freq=new Map();
  for(const W of donors)for(const w of W.slice(0,Math.floor(W.length*.57)))freq.set(w,(freq.get(w)||0)+1);
  const trie={next:new Map(),w:null};for(const w of lex){let n=trie;for(const p of arr(w)){if(!n.next.has(p))n.next.set(p,{next:new Map(),w:null});n=n.next.get(p)}n.w=w}
  const mod=(c,p)=>(c-p+36)%36;
  function canon(K){let s=word([...K]),b=s;for(let j=1;j<Q;j++){const t=s.slice(j)+s.slice(0,j);if(t<b)b=t}return b}
  // Fix phase zero at the first accepted draw of a word. Initial last
  // emission is irrelevant once that draw is known to be accepted.
  // Every complete match has visited >= observed length >= Q key slots.
  function seed(obs) {
    const C=arr(obs),K=new Int8Array(Q).fill(-1),keys=new Set();let nodes=0,leaves=0,forms=0;
    if(C.length<Q)throw Error("anchor shorter than period");
    for(const P of lexarr){if(P.length<C.length)break;forms++;
      function dfs(i,h,j,last,retry){
        nodes++;
        if(P.length-i<C.length-h)return;
        if(i===P.length){if(h===C.length){if(K.some(x=>x<0))throw Error("unassigned slot");keys.add(canon(K));leaves++}return}
        const p=P[i];
        function step(c){
          if(c===last){if(retry+1<Q)dfs(i,h,(j+1)%Q,last,retry+1);return}
          if(c<29){if(h<C.length&&c===C[h])dfs(i+1,h+1,(j+1)%Q,c,0)}
          else if(P.length-i>C.length-h)dfs(i+1,h,(j+1)%Q,c,0);
        }
        if(K[j]>=0){step((p+K[j])%36);return}
        // An unassigned draw either emits the next observed symbol, emits
        // an invisible rune, or retries the last emission.
        const choices=new Set();
        if(h<C.length)choices.add(C[h]);
        if(last<36)choices.add(last);
        if(P.length-i>C.length-h)for(let c=29;c<36;c++)choices.add(c);
        for(const c of choices){K[j]=mod(c,p);step(c);K[j]=-1}
      }
      dfs(0,0,0,36,0);
    }
    return {keys,nodes,leaves,forms};
  }
  function machine(K){
    const N=Q*37,id=(j,last)=>j*37+last;
    // Degenerate constant keys cannot encode repeated plaintext; reject
    // any state/token transition that would retry a full cycle.
    const E=Array.from({length:N},(_,s)=>Array.from({length:29},(_,p)=>{
      let j=Math.floor(s/37),last=s%37,c=(p+K[j])%36,k=0;
      while(c===last){j=(j+1)%Q;if(++k>=Q)return null;c=(p+K[j])%36}
      return {c,t:id((j+1)%Q,c)}
    }));
    function encode(W,phase=0){
      let s=id(phase,36);const C=[];
      for(const w of W){let o="";for(const p of arr(w)){const e=E[s][p];if(!e)return null;s=e.t;if(e.c<29)o+=A[e.c]}C.push(o)}return C;
    }
    function match(s,obs,existOnly=false){
      const C=arr(obs),out=[];
      function visit(n,t,i){
        if(n.w!==null&&i===C.length){out.push({t,w:n.w});if(existOnly)return true}
        for(const [p,node] of n.next){const e=E[t][p];if(!e)continue;
          if(e.c>=29){if(visit(node,e.t,i)&&existOnly)return true}
          else if(i<C.length&&C[i]===e.c){if(visit(node,e.t,i+1)&&existOnly)return true}
        }return false;
      }
      visit(trie,s,0);return out;
    }
    function anyAnchor(obs){for(let j=0;j<Q;j++)if(match(id(j,36),obs,true).length)return true;return false}
    function complete(C){
      let cur=new Map(Array.from({length:Q},(_,j)=>[id(j,36),{cost:0,path:[],phase:j,count:1n}]));let n=0;
      for(const c of C){const nx=new Map();
        for(const [s,z] of cur)for(const e of match(s,c)){const cost=z.cost-Math.log((freq.get(e.w)||0)+.1),old=nx.get(e.t);
          if(!old||cost<old.cost)nx.set(e.t,{cost,path:[...z.path,e.w],phase:z.phase,count:(old?.count||0n)+z.count});else old.count+=z.count}
        if(!nx.size)break;cur=nx;n++;
      }
      if(n<C.length)return {prefix:n,count:"0",best:null};
      const best=[...cur.values()].sort((a,b)=>a.cost-b.cost)[0],count=[...cur.values()].reduce((a,b)=>a+b.count,0n);
      if(JSON.stringify(encode(best.path,best.phase))!==JSON.stringify(C))throw Error("full replay");
      return {prefix:n,count:String(count),best:best.path,phase:best.phase};
    }
    return {encode,anyAnchor,complete};
  }
  function solve(C,truth=null,K=null){
    const anchors=C.map((c,i)=>({c,i})).filter(x=>x.c.length>=Q).sort((a,b)=>b.c.length-a.c.length||a.i-b.i);
    if(!anchors.length)throw Error("no length>=q anchor");
    const z=seed(anchors[0].c),trueKey=K?canon(K):null;
    if(trueKey&&!z.keys.has(trueKey))throw Error("plant absent at seeding");
    let current=[...z.keys],stages=[{i:anchors[0].i,length:anchors[0].c.length,obs:anchors[0].c,keys:current.length}],seedNodes=z.nodes;
    // Test every remaining long anchor, then shorter groups in source
    // order of decreasing length. Initial state is relaxed for each word.
    const rest=C.map((c,i)=>({c,i})).filter(x=>x.i!==anchors[0].i).sort((a,b)=>b.c.length-a.c.length||a.i-b.i);
    for(const {c,i} of rest){if(current.length<=1)break;current=current.filter(k=>machine(arr(k)).anyAnchor(c));
      stages.push({i,length:c.length,obs:c,keys:current.length});
      if(trueKey&&!current.includes(trueKey))throw Error("plant pruned");
    }
    const final=[];for(const k of current){const d=machine(arr(k)).complete(C);if(d.best)final.push({key:k,...d,correct:truth?d.best.filter((w,i)=>w===truth[i]).length:null,text:d.best.map(w=>arr(w).map(i=>gp.translit[i]).join("")).join(" ")})}
    if(trueKey&&!final.some(x=>x.key===trueKey))throw Error("plant not complete");
    return {groups:C.length,printed:C.join("").length,empty:C.filter(x=>!x.length).length,seedForms:z.forms,seedNodes,seedLeaves:z.leaves,stages,preFull:current.length,keys:final,trueKey};
  }
  const body=g.p54.body_groups.slice(),tail=g.p55.groups.slice();body[body.length-1]+=tail.shift();body.push(...tail);
  if(body.length!==64||body.join("").length!==299||body.join("")!==word([...gp.pages.find(p=>p.page===54).indices.slice(9),...gp.pages.find(p=>p.page===55).indices]))throw Error("source drift");
  const controls=[];
  // Fixed held-out contiguous intervals; lexicon contains their forms,
  // but frequency training is first 57% only. Keys chosen independently.
  const Ks=[[13,5,21,2,30,7,18,33],[9,28,3,17,12,34,1,24]];
  for(let i=0;i<2;i++){const W=donors[i+1].slice(Math.floor(donors[i+1].length*.57)+100,Math.floor(donors[i+1].length*.57)+356),K=Ks[i],C=machine(K).encode(W);
    controls.push({source:i?"Emerson":"Gibran",K,...solve(C,W,K)})}
  return {definition:"q8 arbitrary periodic key in Z36, GP29 plaintext, strict repeat rejection, emissions 29..35 silent, nonconsuming native word separators, continuous cipher state",lexicon:lex.length,controls,original:solve(body)};
}
module.exports={experiment};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,".."),paths={"gp":"resources/liber-primus/lp2-corpus.json","groups":"resources/liber-primus/lp2-page-groups-54-55-derived.json","gold":"resources/external/relikd-solved-gp29-native-v1.json","shakespeare":"resources/control/shakespeare_first300k.txt","gibran":"resources/control/gibran_prophet_58585.txt","emerson":"resources/control/emerson_essays_2944.txt"};const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.join(root,p),"utf8")]));console.log(JSON.stringify(experiment(raw),null,2));}
