'use strict';
/** Original solved rubric-clock transfer, Agent3, #2600. Node CommonJS. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const paths=["resources/transcriptions/lp1_wulfic_canonical.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json"];
function run([lp1,refs,gp,ink]){
  refs=JSON.parse(refs);gp=JSON.parse(gp);ink=JSON.parse(ink);
  const mod=n=>(n%29+29)%29,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(x,msg)=>{if(!x)throw Error(msg)};
  assert(eq(refs.runes,gp.runes),"GP mapping");
  const tok=s=>[...s].filter(x=>gp.runes.includes(x)).map(x=>gp.runes.indexOf(x));
  const blocks=lp1.split(/\r?\n%\r?\n/),ref=n=>tok(refs.sections.find(x=>x.name===n).source_text),page=p=>gp.pages.find(x=>x.page===p).indices,red=p=>ink.pages.find(x=>x.page===p).red_spans;
  function periodic(k){return j=>k[j%k.length]}
  const primes=[];for(let p=2;primes.length<600;p++)if(primes.every(d=>d*d>p||p%d))primes.push(p);const phi=j=>primes[j]-1;
  /** Exhaust exact plaintext-F-transparent branches. Absolute consumed counts, not phase aliases. */
  function lattice(C,key,bounds){
    const next=(c,j)=>[...(c===0?[j]:[]),...(mod(c-key(j))!==0?[j+1]:[])];
    const layers=[new Map([[0,1n]])];
    for(let i=0;i<C.length;i++){const m=new Map();for(const [j,n] of layers[i])for(const k of next(C[i],j))m.set(k,(m.get(k)||0n)+n);layers.push(m);if(!m.size)return {firstImpossible:i,priorStates:[...layers[i].keys()].sort((a,b)=>a-b),boundaryForward:bounds.filter(b=>b<=i).map(b=>[b,[...layers[b].keys()].sort((a,b)=>a-b)])};}
    let valid=new Set(layers[C.length].keys()),ret=new Map([[C.length,valid]]);
    for(let i=C.length-1;i>=0;i--){valid=new Set([...layers[i].keys()].filter(j=>next(C[i],j).some(k=>valid.has(k))));if(bounds.includes(i))ret.set(i,valid);}
    return {paths:[...layers.at(-1).values()].reduce((a,b)=>a+b,0n).toString(),boundaryStates:bounds.map(b=>[b,[...ret.get(b)].sort((a,b)=>a-b)]),terminalStates:[...layers.at(-1).keys()].sort((a,b)=>a-b)};
  }
  function replay(P,C,key,bounds,reset=[]){let j=0;const states={},pred=[];for(let i=0;i<P.length;i++){if(reset.includes(i))j=0;if(bounds.includes(i))states[i]=j;pred.push(P[i]===0?0:mod(P[i]+key(j++)));}states[P.length]=j;return {match:pred.filter((x,i)=>x===C[i]).length,states};}
  function control(name,P,C,key,bounds,resets,period=null){assert(P.length===C.length,`${name} length mismatch`);const observed=replay(P,C,key,bounds);assert(observed.match===C.length,`${name} native replay mismatch ${observed.match}/${C.length}`);const L=lattice(C,key,bounds);assert(!("firstImpossible" in L),`${name} no feasible path`);for(const [b,states] of L.boundaryStates)assert(states.includes(observed.states[b]),`${name} comparator outside lattice at ${b}`);return {name,n:C.length,observed,lattice:L,period,boundaryPhaseSets:period?L.boundaryStates.map(([b,s])=>[b,[...new Set(s.map(j=>j%period))].sort((a,b)=>a-b)]):undefined,resetComparators:resets.map(b=>[b,replay(P,C,key,bounds,[b]).match])};}
  const key13=[0,10,4,0,1,19,0,18,4,18,9,0,18],key8=[23,10,1,10,9,10,16,26];
  const koan=control("second KOAN training",ref("jpg107-167"),tok(blocks[12]+blocks[13]),periodic(key13),[5,226,319],[5,226],13);
  const p56=control("p56 training",ref("p56_an_end"),page(56),phi,[5,45,85],[5,45]);
  const welcome=control("WELCOME retrospective section holdout",ref("0_welcome"),tok(blocks[1]+blocks[2]),periodic(key8),[7,251,394,400,485,497,515],[7,251,394,400,485,497],8);
  assert(eq(red(7).map(x=>[x.start,x.length]),[[194,14]]),"p7 red");assert(eq(red(8).map(x=>[x.start,x.length]),[[0,12]]),"p8 red");
  const c7=page(7),c8=page(8);let at=194;const key5=[2,4,3,2,3].map(n=>{const out=c7.slice(at,at+n).reduce((p,x)=>mod(p*x),1);at+=n;return out});assert(eq(key5,[11,26,8,15,2])&&at===208,"p7 products");assert(c8.slice(0,12).every(x=>x!==0),"p8 title has ciphertext F");
  const p8L=lattice(c8,periodic(key5),[12,255]);
  const plantP=Array.from({length:255},(_,i)=>page(57)[i%95]);let j=0;const plantC=plantP.map(p=>p===0?0:mod(p+key5[j++%5]));const plant=control("p8 schedule positive",plantP,plantC,periodic(key5),[12,255],[12],5);
  assert(p8L.firstImpossible===99&&eq(p8L.priorStates,[98]),'p8 exact empty lattice');
  assert(c8[99]===15&&key5[98%5]===15,'p8 impossible nonliteral F certificate');
  return {koan,p56,welcome,p8:{key:key5,heading:c8.slice(0,12),bodyState:12,bodyPhase:2,lattice:p8L,priorBodyLocal:lattice(c8.slice(12),periodic(key5),[0,243]),plant: {match:plant.observed.match,lattice:plant.lattice.paths,states:plant.observed.states}},scope:"No plaintext-F skip is inferred from the known comparator during lattice construction. No unknown key menu."};
}
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
