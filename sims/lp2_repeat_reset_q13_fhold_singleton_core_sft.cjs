'use strict';
/** Agent25: minimal contradiction and blind native-control key support calibration. */
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function strengthen(corpus,raw,donor){
  const Q=13,ALL=(1<<29)-1;
  const id=new Map(corpus.runes.map((r,i)=>[r,i]));
  const check=(a,m)=>{if(!a)throw Error(m)};
  const C=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const words=[];let w=[];
  function end(){if(w.length){words.push(w);w=[];}}
  for(const c of raw.split("%").slice(0,55).join("%")){if(id.has(c))w.push(id.get(c));else if(c==="%"||c==="/"||/\s/u.test(c))continue;else end();}
  end();
  function singletons(words){const s=new Set();let i=0;for(const w of words){if(w.length===1)s.add(i);i+=w.length;}return s;}
  function partition(c){const out=[];let start=0;for(let i=1;i<c.length;i++)if(c[i]===c[i-1]){out.push({start,end:i+1,c:c.slice(start,i+1)});start=i+1;}out.push({start,end:c.length,c:c.slice(start)});return out;}
  function compile(block,ss,allowed=[24,10]){
    const mask=(x,s)=>s?allowed.reduce((m,p)=>m|(1<<((x-p+29)%29)),0):ALL&~(1<<x);
    const S=[[]],zero=[];
    for(let i=0;i<block.c.length;i++){const c=block.c[i],single=ss.has(block.start+i);
      if(c===0){zero.push({single,mask:mask(0,single)});S.push([]);}else S.at(-1).push(mask(c,single));
    }
    const M=S.map(s=>Array.from({length:Q},(_,p)=>{const m=Array(Q).fill(ALL);s.forEach((x,i)=>m[(p+i)%Q]&=x);return m;}));
    return {...block,L:S.map(s=>s.length),M,zero,singleCount:block.c.filter((_,i)=>ss.has(block.start+i)).length};
  }
  const bits=x=>{let n=0;while(x){x&=x-1;n++;}return n};
  let nodes=0;
  function enumerate(b,D,fn,stop){
    let paths=0;
    function go(t,p,d){nodes++;const e=d.map((x,j)=>x&b.M[t][p][j]);if(e.some(x=>!x))return false;
      const phase=(p+b.L[t])%Q;if(t===b.L.length-1){paths++;return fn(e);}
      const z=b.zero[t];if(!z.single&&go(t+1,phase,e)&&stop)return true;
      if(e[phase]&z.mask){e[phase]&=z.mask;if(go(t+1,(phase+1)%Q,e)&&stop)return true;}
      return false;
    }
    go(0,0,D);return paths;
  }
  function prop(bs,D){
    let d=D.slice(),changed=true;
    const sorted=bs.slice().sort((a,b)=>b.singleCount-a.singleCount||b.c.length/b.L.length-a.c.length/a.L.length||a.start-b.start);
    while(changed){changed=false;for(const b of sorted){const u=Array(Q).fill(0);const n=enumerate(b,d,e=>{for(let j=0;j<Q;j++)u[j]|=e[j];return u.every((x,j)=>x===d[j]);},true);
      if(!n)return null;if(u.some((x,j)=>x!==d[j])){d=u;changed=true;}}}
    return d;
  }
  function keyWitness(b,S,allowed){let result=null;enumerate(compile(b,new Set(S),allowed),Array(Q).fill(ALL),d=>{result=d.map(x=>31-Math.clz32(x&-x));return true;},true);return result;}
  const target=partition(C).find(b=>b.start===1039&&b.end===1592);
  const S=[...singletons(words)].filter(i=>i>=target.start&&i<target.end);
  check(!keyWitness(target,S,[24,10]),"A/I contradiction");
  let core=S.slice();
  for(const v of S){const smaller=core.filter(x=>x!==v);if(!keyWitness(target,smaller,[24,10]))core=smaller;}
  const deletions=core.map(v=>({removed:v,keyWitness:keyWitness(target,core.filter(x=>x!==v),[24,10])}));
  check(deletions.every(x=>x.keyWitness),"deletion-minimal");
  const aio=keyWitness(target,S,[24,10,3]);
  function encrypt(P,key){let phase=0;const c=[];for(const p of P){const v=p===0?0:(p+key[phase])%29;if(p!==0)phase=(phase+1)%Q;if(c.length&&v===c.at(-1))phase=0;c.push(v);}return c;}
  const trainNames=["0_warning","0_welcome","0_wisdom","0_koan_1","0_loss_of_divinity","jpg229"];
  const testNames=["p56_an_end","p57_parable"];
  const toWords=names=>donor.sections.filter(s=>names.includes(s.name)).flatMap(s=>[...s.source_text.matchAll(/[ᚠ-᛿]+/gu)].map(m=>[...m[0]].map(c=>id.get(c))));
  const tw=toWords(trainNames),tp=tw.flat(),ts=singletons(tw),hw=toWords(testNames),hp=hw.flat(),hs=singletons(hw);
  check([...ts].every(i=>tp[i]===24||tp[i]===10),"control singleton");
  check([...hs].every(i=>hp[i]===24||hp[i]===10),"heldout singleton");
  let rng=0x330125>>>0;function rand(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;}
  const controls=[];
  for(let k=0;k<3;k++){
    const key=Array.from({length:Q},()=>rand()%29);
    const cipher=encrypt(tp,key),bs=partition(cipher).map(b=>compile(b,ts));
    const h=prop(bs,Array(Q).fill(ALL));check(h&&key.every((x,j)=>(h[j]&(1<<x))!==0),"plant support");
    let solutions=[],visited=0;
    function dfs(d){if(solutions.length>=2)return;visited++;const a=prop(bs,d);if(!a)return;let j=-1;for(let i=0;i<Q;i++)if(bits(a[i])>1&&(j<0||bits(a[i])<bits(a[j])))j=i;if(j<0){solutions.push(a.map(x=>31-Math.clz32(x)));return;}for(let x=a[j];x&&solutions.length<2;){const one=x&-x;x&=x-1;const f=a.slice();f[j]=one;dfs(f);}}
    dfs(h);
    controls.push({k,key,trainRunes:tp.length,trainSingletons:ts.size,repeats:bs.length-1,domainCounts:h.map(bits),visited,solutionCountCapped2:solutions.length,solutions,uniqueKey:solutions.length===1&&solutions[0].every((x,j)=>x===key[j])});
  }
  return {target:{start:target.start,end:target.end,allSingletons:S.map(i=>[i,C[i]]),minimalCore:core.map(i=>[i,C[i]]),deletions,aioWitness:aio},controls,trainNames,testNames,heldoutRunes:hp.length,nodes};
}
console.log(JSON.stringify(strengthen(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
