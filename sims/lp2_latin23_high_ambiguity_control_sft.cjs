"use strict";
// Run: node sims/lp2_latin23_high_ambiguity_control_sft.cjs
// Same solver as lp2_latin23_unknown_key_lattice_sft.cjs, isolated calibration.
const fs=require("node:fs"), path=require("node:path");
const paths={
  "corpus": "resources/liber-primus/lp2-corpus.json",
  "solved": "resources/liber-primus/lp1-plaintext-reference.txt",
  "gibran": "resources/control/gibran_prophet_58585.txt",
  "emerson": "resources/control/emerson_essays_2944.txt"
};
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")]));
function experiment(input) {
 const gp=JSON.parse(input.corpus),q=23, A=26;
 const opt=gp.translit.map(x=>[x]);opt[1]=["U","V"];opt[5]=["C","K","Q"];opt[15]=["S","Z"];opt[21]=["NG","ING"];opt[27]=["IA","IO"];
 const arcs=opt.flatMap((ss,r)=>ss.map(s=>({s,rs:[r]})));arcs.push({s:"QU",rs:[5,7]});
 const byChar={};for(const a of arcs)(byChar[a.s[0]]??=[]).push(a);for(const a of Object.values(byChar))a.sort((a,b)=>b.s.length-a.s.length);
 const norm=s=>s.toUpperCase().replace(/[^A-Z]/g,""), nums=s=>Array.from(s,c=>c.charCodeAt(0)-65), letters=a=>Array.from(a,v=>String.fromCharCode(65+v)).join("");
 const enc=(s,k,off=0)=>letters(nums(s).map((v,i)=>(v+k[(off+i)%q])%26));
 const dec=(s,k,off=0)=>letters(nums(s).map((v,i)=>(v-k[(off+i)%q]+26)%26));
 const rng=(seed)=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const powers=[1,26,676,17576,456976],counts=powers.map(n=>new Uint32Array(n)),log=powers.map(n=>new Float64Array(n));let total=0;
 for(const d of [input.gibran,input.emerson]){const a=nums(norm(d));total+=a.length;for(let i=0;i<a.length;i++){let idx=0;for(let k=1;k<=Math.min(4,i+1);k++){idx+=a[i-k+1]*powers[k-1];counts[k][idx]++}}}
 for(let j=0;j<26;j++)log[1][j]=Math.log((counts[1][j]+.5)/(total+13));
 for(let k=2;k<=4;k++)for(let i=0;i<powers[k];i++)log[k][i]=Math.log((counts[k][i]+20*Math.exp(log[k-1][i%powers[k-1]]))/(counts[k-1][Math.floor(i/26)]+20));
 function at(a,i){const k=Math.min(4,i+1);let n=0;for(let j=i-k+1;j<=i;j++)n=26*n+a[j];return log[k][n]}
 function encode(s){const rs=[],offset=[0],lengths=[];for(let i=0;i<s.length;){const e=byChar[s[i]].find(a=>s.startsWith(a.s,i));rs.push(...e.rs);if(e.rs[0]===21)lengths.push(e.s.length===3?1:0);if(e.rs.length===2)offset.push(i+1);i+=e.s.length;offset.push(i)}return {rs,offset,lengths}}
 function groups(rs,mask){let j=0,pos=0;const g=[];for(let i=0;i<rs.length;i++){let a;if(rs[i]===21)a=[opt[21][(mask>>j++)&1]];else if(rs[i]===5&&rs[i+1]===7){a=["CW","KW","QW","QU"];i++}else a=opt[rs[i]];const choices=a.map(nums);g.push({pos,choices});pos+=choices[0].length}return {g,n:pos}}
 function initialize(rs,mask){const {g,n}=groups(rs,mask);const cols=Array.from({length:q},()=>[]);for(const z of g)for(let j=0;j<z.choices[0].length;j++)cols[(z.pos+j)%q].push([...new Set(z.choices.map(x=>x[j]))]);
  const key=[],ranking=[];let score=0;for(const col of cols){let a=Array.from({length:26},(_,k)=>{let s=0;for(const choices of col){let v=-Infinity;for(const c of choices)v=Math.max(v,log[1][(c-k+26)%26]);s+=v}return {k,s}}).sort((a,b)=>b.s-a.s);ranking.push(a.map(x=>x.k));key.push(a[0].k);score+=a[0].s}return {mask,g,n,key,ranking,score}}
 function optimize(init,seed,perturb){const {g,n}=init,rand=rng(seed),key=init.key.slice(),c=new Int16Array(n),p=new Int16Array(n);
  if(perturb)for(let j=0;j<q;j++)if(rand()<.45)key[j]=init.ranking[j][Math.floor(rand()*6)];
  for(const z of g){let b,best=-Infinity;for(const x of z.choices){let s=0;for(let j=0;j<x.length;j++)s+=log[1][(x[j]-key[(z.pos+j)%q]+26)%26];if(s>best){best=s;b=x}}for(let j=0;j<b.length;j++){c[z.pos+j]=b[j];p[z.pos+j]=(b[j]-key[(z.pos+j)%q]+26)%26}}
  const positions=Array.from({length:q},(_,k)=>Array.from({length:Math.ceil(n/q)},(_,i)=>k+i*q).filter(i=>i<n));
  const effects=positions.map(a=>[...new Set(a.flatMap(i=>[i,i+1,i+2,i+3]).filter(j=>j<n))]);
  const sum=inds=>{let s=0;for(const j of inds)s+=at(p,j);return s};
  const shuffled=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const phaseOrder=Array.from({length:q},(_,i)=>i);
  for(let pass=0;pass<15;pass++){let changes=0;
   for(const k of shuffled(phaseOrder)){let bestKey=key[k],best=sum(effects[k]);for(let t=0;t<26;t++){if(t===key[k])continue;for(const i of positions[k])p[i]=(c[i]-t+26)%26;const s=sum(effects[k]);if(s>best+1e-10){best=s;bestKey=t}}
    if(bestKey!==key[k])changes++;key[k]=bestKey;for(const i of positions[k])p[i]=(c[i]-bestKey+26)%26;
   }
   for(const z of shuffled(g)){if(z.choices.length===1)continue;const pos=z.pos,len=z.choices[0].length,inds=Array.from({length:Math.min(len+3,n-pos)},(_,i)=>pos+i);let best=sum(inds),choice=Array.from(c.slice(pos,pos+len));for(const a of z.choices){for(let j=0;j<len;j++)p[pos+j]=(a[j]-key[(pos+j)%q]+26)%26;const s=sum(inds);if(s>best+1e-10){best=s;choice=a}}
    if(choice.some((v,j)=>v!==c[pos+j]))changes++;for(let j=0;j<len;j++){c[pos+j]=choice[j];p[pos+j]=(choice[j]-key[(pos+j)%q]+26)%26}
   }
   if(!changes)break;
  }
  let score=0;for(let i=0;i<n;i++)score+=at(p,i);return {mask:init.mask,key,plain:letters(p),cipher:letters(c),score,latinLength:n};
 }

 function refine(init,result){
  const {g,n}=init,key=result.key.slice(),c=Int16Array.from(nums(result.cipher)),p=Int16Array.from(nums(result.plain));
  const positions=Array.from({length:q},(_,k)=>Array.from({length:Math.ceil(n/q)},(_,i)=>k+i*q).filter(i=>i<n));
  const sum=inds=>{let s=0;for(const j of inds)s+=at(p,j);return s};
  function block(ks){
   const inds=[...new Set(ks.flatMap(k=>positions[k].flatMap(i=>[i,i+1,i+2,i+3])).filter(i=>i<n))];
   let best=sum(inds),bestKey=ks.map(k=>key[k]);const chosen=[];
   function search(j){if(j===ks.length){const s=sum(inds);if(s>best+1e-10){best=s;bestKey=chosen.slice()}return;}
    const k=ks[j];for(let t=0;t<26;t++){chosen[j]=t;for(const i of positions[k])p[i]=(c[i]-t+26)%26;search(j+1)}
   }
   search(0);let changed=false;for(let j=0;j<ks.length;j++){const k=ks[j],t=bestKey[j];changed ||=t!==key[k];key[k]=t;for(const i of positions[k])p[i]=(c[i]-t+26)%26;}return changed;
  }
  function aliases(){
   let changed=false;
   for(const z of g){if(z.choices.length===1)continue;const pos=z.pos,len=z.choices[0].length,inds=Array.from({length:Math.min(len+3,n-pos)},(_,i)=>pos+i);let best=sum(inds),choice=Array.from(c.slice(pos,pos+len));for(const a of z.choices){for(let j=0;j<len;j++)p[pos+j]=(a[j]-key[(pos+j)%q]+26)%26;const score=sum(inds);if(score>best+1e-10){best=score;choice=a}}
    changed ||=choice.some((v,j)=>v!==c[pos+j]);for(let j=0;j<len;j++){c[pos+j]=choice[j];p[pos+j]=(choice[j]-key[(pos+j)%q]+26)%26}
   }return changed;
  }
  // Refine the single best fit without access to the withheld text.
  for(let pass=0;pass<4;pass++){let change=false;for(let j=0;j<q;j++)change=block([j,(j+1)%q])||change;change=aliases()||change;if(!change)break}
  // One exhaustive adjacent triple pass, then two pair/alias passes.
  for(let j=0;j<q;j++)block([j,(j+1)%q,(j+2)%q]);aliases();
  for(let pass=0;pass<2;pass++){for(let j=0;j<q;j++)block([j,(j+1)%q]);aliases()}
  let score=0;for(let i=0;i<n;i++)score+=at(p,i);return {...result,key,plain:letters(p),cipher:letters(c),score};
 }

 function exactAliases(init,key,trace=false){
  // Position is fixed by the length mask, so only the last three plaintext letters
  // are state. Dense integer context coding avoids string allocation in the score loop.
  let dp=new Map([[0,{score:0,ctx:0,prev:null}]]);
  for(const z of init.g){
   const next=new Map();for(const old of dp.values())for(const a of z.choices){
    let ctx=old.ctx,score=old.score;
    for(let j=0;j<a.length;j++){const i=z.pos+j,v=(a[j]-key[i%q]+26)%26;const k=Math.min(4,i+1),code=ctx*26+v;score+=log[k][code];ctx=code%17576}
    const prev=next.get(ctx);if(!prev||score>prev.score)next.set(ctx,{ctx,score,prev:trace?old:null,a:trace?a:null});
   }dp=next;
  }
  let best;for(const z of dp.values())if(!best||z.score>best.score)best=z;
  if(!trace)return best.score;
  const choices=[];for(let z=best;z.prev;z=z.prev)choices.push(z.a);const cipher=letters(choices.reverse().flat());
  return {score:best.score,cipher,plain:dec(cipher,key)};
 }
 function profileRefine(init,result){
  const key=result.key.slice();let best=exactAliases(init,key);
  // Three full coordinate passes. Each key test maximizes over ALL aliases
  // conditional on the length mask, rather than freezing a guessed expansion.
  for(let pass=0;pass<3;pass++){let changes=0;for(let j=0;j<q;j++){
   const orig=key[j];let chosen=orig,score=best;for(let t=0;t<26;t++){if(t===orig)continue;key[j]=t;const v=exactAliases(init,key);if(v>score+1e-10){score=v;chosen=t}}
   key[j]=chosen;best=score;if(chosen!==orig)changes++;
  }if(!changes)break}
  // One adjacent-block pass, conditional exact alias objective. Reject any
  // apparent gain if it cannot be emitted by the same chart relation.
  for(let j=0;j<q;j++){const k=(j+1)%q,oldA=key[j],oldB=key[k];let a=oldA,b=oldB,score=best;
   for(let x=0;x<26;x++)for(let y=0;y<26;y++){if(x===oldA&&y===oldB)continue;key[j]=x;key[k]=y;const v=exactAliases(init,key);if(v>score+1e-10){score=v;a=x;b=y}}
   key[j]=a;key[k]=b;best=score;
  }
  const a=exactAliases(init,key,true);return {...result,...a,key};
 }
 function fit(rs,trueMask=null){const n=rs.filter(v=>v===21).length;if(n>12)throw Error("length-mask cap");
  const all=Array.from({length:1<<n},(_,m)=>initialize(rs,m)).sort((a,b)=>b.score-a.score),selected=all.slice(0,24);
  let best=null;for(const z of selected)for(let j=0;j<3;j++){const a=optimize(z,0x2345+z.mask*137+j*719,j>0);if(!best||a.score>best.score)best=a}
  const preRefineScore=best.score;best=refine(all.find(z=>z.mask===best.mask),best);const preProfileScore=best.score;best=profileRefine(all.find(z=>z.mask===best.mask),best);if(best.score+1e-7<preProfileScore)throw Error("nonmonotone profile refinement");if(best.score+1e-7<preRefineScore)throw Error("nonmonotone refinement");
  if(enc(best.plain,best.key)!==best.cipher)throw Error("fit replay failed");
  let p=0;for(const z of groups(rs,best.mask).g){const l=z.choices[0].length;if(!z.choices.some(a=>letters(a)===best.cipher.slice(p,p+l)))throw Error("fit relation replay");p+=l}
  return {...best,preRefineScore,preProfileScore,scorePerRune:best.score/rs.length,maskCount:all.length,optimizedMasks:selected.length,trueMaskRank:trueMask===null?null:all.findIndex(x=>x.mask===trueMask)+1,runes:rs.length};
 }
 // Exact Viterbi with the fitted key and last three fit letters; no key changes in heldout.
 function hold(rs,k,start,context){const dp=Array.from({length:rs.length+1},()=>new Map());dp[0].set(start+"|"+context,{score:0,phase:start,ctx:context,prev:null});
  for(let i=0;i<rs.length;i++){const a=opt[rs[i]].map(s=>({s,step:1}));if(rs[i]===5&&rs[i+1]===7)a.push({s:"QU",step:2});
   for(const z of dp[i].values())for(const t of a){const s=dec(t.s,k,z.phase);let v=0,ctx=z.ctx;for(const c of s){const a=nums(ctx+c);v+=at(a,a.length-1);ctx=(ctx+c).slice(-3)}const phase=(z.phase+s.length)%q,score=z.score+v,id=phase+"|"+ctx,old=dp[i+t.step].get(id);if(!old||score>old.score)dp[i+t.step].set(id,{score,phase,ctx,prev:z,plain:s,cipher:t.s,step:t.step})}
  }let best;for(const z of dp.at(-1).values())if(!best||z.score>best.score)best=z;
  const plain=[],cipher=[],steps=[];for(let z=best;z.prev;z=z.prev){plain.push(z.plain);cipher.push(z.cipher);steps.push(z.step)}plain.reverse();cipher.reverse();steps.reverse();let i=0;for(let j=0;j<cipher.length;j++){if(steps[j]===1&&!opt[rs[i]].includes(cipher[j]))throw Error("hold relation replay");if(steps[j]===2&&!(rs[i]===5&&rs[i+1]===7&&cipher[j]==="QU"))throw Error("hold QU replay");i+=steps[j]}if(i!==rs.length||enc(plain.join(""),k,start)!==cipher.join(""))throw Error("hold replay failed");
  return {plain:plain.join(""),score:best.score,scorePerRune:best.score/rs.length,runes:rs.length,end:best.phase};
 }
 function edit(a,b){let x=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){const y=[i+1];for(let j=0;j<b.length;j++)y.push(Math.min(y[j]+1,x[j+1]+1,x[j]+(a[i]!==b[j])));x=y}return x.at(-1)}

 const native=norm(input.solved.split("### 10\n")[1].split("### 13")[0].replace(/\[[^\]]*\]/g,""));
 const plain=native.slice(0,360);if(plain.length!==360)throw Error("short held-out native");
 // Construct a source-native plant with disjoint key-phase constraints forcing
 // three ING and six NG strings at distinct positions in the training region.
 // The selected key is deliberately not sampled uniformly.
 let plant;
 for(let seed=1;seed<=128&&!plant;seed++){
  const rand=rng(0x7841+seed*997),key=Array.from({length:q},()=>Math.floor(rand()*26));
  let phase=0;for(const pattern of ["ING","ING","ING","NG","NG","NG","NG","NG","NG"]){const starts=[];for(let i=phase+q;i<220-pattern.length;i+=q)starts.push(i);const start=starts[Math.floor(rand()*starts.length)];for(let j=0;j<pattern.length;j++)key[phase+j]=(pattern.charCodeAt(j)-plain.charCodeAt(start+j)+26)%26;phase+=pattern.length;}
  const obs=encode(enc(plain,key));let split=Math.floor(obs.rs.length*2/3);if(obs.rs[split-1]===5&&obs.rs[split]===7)split++;const cut=obs.offset[split],n=obs.rs.slice(0,split).filter(v=>v===21).length;
  const lengths=obs.lengths.slice(0,n),mask=lengths.reduce((m,b,j)=>m+(b<<j),0);
  if(n>=9&&n<=12&&lengths.filter(x=>x).length>=3)plant={seed,key,obs,split,cut,n,mask};
 }
 if(!plant)throw Error("no high-ambiguity plant in fixed seed budget");
 const {seed,key,obs,split,cut,n,mask}=plant;
 const a=fit(obs.rs.slice(0,split),mask),b=hold(obs.rs.slice(split),a.key,a.latinLength%q,a.plain.slice(-3));
 return {seed,forcedNG:n,trueMask:mask,trueKey:key,keyExact:a.key.filter((k,i)=>k===key[i]).length,fit:a,test:b,fitEdit:edit(a.plain,plain.slice(0,cut)),testEdit:edit(b.plain,plain.slice(cut)),testTrueLength:plain.length-cut};

}
console.log(JSON.stringify(experiment(inputs),null,2));
