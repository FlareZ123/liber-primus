'use strict';
/** Agent25: exact repeat-triggered phase-reset q13/F-hold singleton support. */
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function solve(corpus,raw,donor){
  const Q=13,ALL=(1<<29)-1;
  const id=new Map(corpus.runes.map((r,i)=>[r,i]));
  const check=(a,m)=>{if(!a)throw Error(m)};
  const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const text=raw.split("%").slice(0,55).join("%");const words=[];let w=[];
  function end(){if(w.length){words.push(w);w=[];}}
  for(const c of text){if(id.has(c))w.push(id.get(c));else if(c==="%"||c==="/"||/\s/u.test(c))continue;else end();}
  end();check(words.length===2896,"source group count");check(eq(words.flat(),C),"canonical source match");
  function singletons(words){const s=new Set();let i=0;for(const w of words){if(w.length===1)s.add(i);i+=w.length;}return s;}
  function partition(c){const out=[];let start=0;for(let i=1;i<c.length;i++)if(c[i]===c[i-1]){out.push({start,end:i+1,c:c.slice(start,i+1)});start=i+1;}out.push({start,end:c.length,c:c.slice(start)});return out;}
  function consumeMask(x,single){return single?((1<<((x-24+29)%29))|(1<<((x-10+29)%29))):ALL&~(1<<x);}
  function compile(block,ss){
    const S=[[]],zero=[];
    for(let i=0;i<block.c.length;i++){const c=block.c[i],single=ss.has(block.start+i);
      if(c===0){zero.push({single,mask:consumeMask(0,single)});S.push([]);}
      else S.at(-1).push(consumeMask(c,single));
    }
    const M=S.map(s=>Array.from({length:Q},(_,p)=>{const m=Array(Q).fill(ALL);s.forEach((x,i)=>m[(p+i)%Q]&=x);return m;}));
    return {...block,L:S.map(s=>s.length),M,zero,singleCount:block.c.filter((_,i)=>ss.has(block.start+i)).length};
  }
  const bits=x=>{let n=0;while(x){x&=x-1;n++;}return n};
  let nodes=0;
  function enumerate(b,D,fn,stop){
    let paths=0;
    function go(t,p,d){nodes++;const e=d.map((x,j)=>x&b.M[t][p][j]);if(e.some(x=>!x))return false;
      const phase=(p+b.L[t])%Q;
      if(t===b.L.length-1){paths++;return fn(e);}
      const z=b.zero[t];
      if(!z.single&&go(t+1,phase,e)&&stop)return true;
      if(e[phase]&z.mask){e[phase]&=z.mask;if(go(t+1,(phase+1)%Q,e)&&stop)return true;}
      return false;
    }
    go(0,0,D);return paths;
  }
  function propagate(bs,D){
    let d=D.slice(),changed=true,passes=0,log=[];
    const sorted=bs.slice().sort((a,b)=>b.singleCount-a.singleCount||b.c.length/b.L.length-a.c.length/a.L.length||a.start-b.start);
    while(changed){changed=false;passes++;for(const b of sorted){const u=Array(Q).fill(0);const n=enumerate(b,d,e=>{for(let j=0;j<Q;j++)u[j]|=e[j];return u.every((x,j)=>x===d[j]);},true);
      if(!n)return {domain:null,failedBlock:[b.start,b.end],passes,log};
      if(u.some((x,j)=>x!==d[j])){d=u;changed=true;log.push({block:[b.start,b.end],singletons:b.singleCount,sizes:d.map(bits)});}
    }}
    return {domain:d,passes,log};
  }
  function exactSolve(bs,D){
    let visited=0;
    function dfs(d){
      visited++;
      const v=propagate(bs,d);if(!v.domain)return null;d=v.domain;
      let k=-1;for(let j=0;j<Q;j++)if(bits(d[j])>1&&(k<0||bits(d[j])<bits(d[k])))k=j;
      if(k<0)return d.map(x=>31-Math.clz32(x));
      for(let x=d[k];x;){const one=x&-x;x&=x-1;const e=d.slice();e[k]=one;const got=dfs(e);if(got)return got;}
      return null;
    }
    const witness=dfs(D);
    return {witness,visited};
  }
  const S=singletons(words),B=partition(C);
  check(B.length===87,"repeat resets count");
  const initial=B.filter(b=>b.end<=729).map(b=>compile(b,S));const training=B.filter(b=>b.end<=3603).map(b=>compile(b,S));
  const holdout=B.filter(b=>b.start>=3762&&b.end<=5375);
  const init=propagate(initial,Array(Q).fill(ALL));const initNodes=nodes;
  nodes=0;const fit=propagate(training,Array(Q).fill(ALL));const fitNodes=nodes;
  let exact=null;
  if(fit.domain){nodes=0;exact=exactSolve(training,fit.domain);exact.enumerationNodes=nodes;}
  const controlNames=["0_welcome","0_koan_1"];
  function encrypt(P,key){let phase=0;const c=[];for(const p of P){const v=p===0?0:(p+key[phase])%29;if(p!==0)phase=(phase+1)%Q;if(c.length&&v===c.at(-1))phase=0;c.push(v);}return c;}
  let rng=3301>>>0;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
  const controls=controlNames.map(name=>{
    const section=donor.sections.find(s=>s.name===name);
    const pw=[...section.source_text.matchAll(/[ᚠ-᛿]+/gu)].map(m=>[...m[0]].map(c=>id.get(c)));
    const p=pw.flat(),ss=singletons(pw);check([...ss].every(i=>p[i]===24||p[i]===10),"native singleton control");
    const key=Array.from({length:Q},()=>rand()%29);
    const c=encrypt(p,key),blocks=partition(c).map(b=>compile(b,ss));
    const known=key.map(x=>1<<x);
    const proved=propagate(blocks,known);check(proved.domain&&eq(proved.domain,known),"planted key admitted");
    const inferred=propagate(blocks,Array(Q).fill(ALL));check(inferred.domain&&key.every((x,j)=>(inferred.domain[j]&(1<<x))!==0),"propagation excludes planted key");
    return {name,n:p.length,key,repeats:blocks.length-1,singletons:ss.size,remainingDomains:inferred.domain.map(bits),knownKeyAdmitted:true};
  });
  return {initial:{n:initial.at(-1).end,segments:initial.length,singletons:initial.reduce((a,b)=>a+b.singleCount,0),result:init.domain?.map(bits)??null,failedBlock:init.failedBlock??null,passes:init.passes,nodes:initNodes,log:init.log},training:{n:training.at(-1).end,segments:training.length,singletons:training.reduce((a,b)=>a+b.singleCount,0),result:fit.domain?.map(bits)??null,failedBlock:fit.failedBlock??null,passes:fit.passes,nodes:fitNodes,log:fit.log,exact},withheld:{n:holdout.reduce((a,b)=>a+b.c.length,0),segments:holdout.length,range:[3762,5375]},controls};
}
console.log(JSON.stringify(solve(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
