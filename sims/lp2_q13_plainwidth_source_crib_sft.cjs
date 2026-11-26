'use strict';
const fs=require('node:fs');
const paths=[
 'resources/liber-primus/lp2-corpus.json','resources/external/relikd-solved-gp29-native-v1.json',
 'resources/external/blake-marriage-1906-gutenberg45315.txt',
 'resources/external/2013-liber-al-bookcode-I.txt','resources/external/2013-liber-al-bookcode-II.txt','resources/external/2013-liber-al-bookcode-III.txt',
 'resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt'];
/** Exact 18-rune source-reuse key nomination, private plaintext-width q13, latent cuts. */
function experiment(raw,which='p54'){
 const gp=JSON.parse(raw[0]),native=JSON.parse(raw[1]),W=gp.translit.map(x=>x.length),q=13,L=18;
 const map=new Map(gp.translit.map((x,i)=>[x,i])),runes=new Map(gp.runes.map((x,i)=>[x,i]));
 const sections=native.sections.map((s,j)=>({name:'native'+j,p:[...s.source_text].filter(x=>runes.has(x)).map(x=>runes.get(x))}));
 function normalize(t){const p=[];for(let w of t.normalize('NFKD').replace(/\p{M}/gu,'').toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,'CW').replace(/ING/g,'NG').replace(/IO/g,'IA').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');for(let i=0;i<w.length;){const z=w.slice(i,i+2);if(z.length===2&&map.has(z)){p.push(map.get(z));i+=2;}else{if(!map.has(w[i]))throw Error('normalization');p.push(map.get(w[i++]));}}}return p;}
 const D=sections.concat(raw.slice(2).map((x,i)=>({name:paths[i+2],p:normalize(x)})));
 if(D.slice(9).map(x=>x.p.length).join(',')!=='18355,6958,7059,7484,41181')throw Error('historical source geometry');
 const mod=x=>(x+29)%29;
 function canonical(k){const s=k.map(x=>x.toString(36)).join('');let best=s;for(let t=1;t<q;t++){const r=s.slice(t)+s.slice(0,t);if(r<best)best=r;}return best;}
 function pattern(p,start){const phase=Array(L),first=Array(q).fill(-1),f=[],edges=[];let t=0;
  for(let i=0;i<L;i++){const x=p[start+i];if(x===0){f.push(i);phase[i]=-1;continue;}phase[i]=t;if(first[t]===-1)first[t]=i;else edges.push([first[t],i,mod(x-p[start+first[t]])]);t=(t+W[x])%q;}
  return {phase,first,f,edges,active:L-f.length,cover:first.filter(x=>x>=0).length};
 }
 function scan(c,donors){
  const n=c.length-L+1,zeros=Array.from({length:L},()=>[]),pair=new Map(),all=Array.from({length:Math.max(0,n)},(_,i)=>i);
  for(let i=0;i<n;i++)for(let j=0;j<L;j++)if(c[i+j]===0)zeros[j].push(i);
  function posting(a,b,d){const id=a*L+b;let bins=pair.get(id);if(!bins){bins=Array.from({length:29},()=>[]);for(let i=0;i<n;i++)bins[mod(c[i+b]-c[i+a])].push(i);pair.set(id,bins);}return bins[d];}
  const matches=[],stats=[];let aligns=0,checked=0;
  for(const d of donors){let windows=0,hits=0,comparisons=0;for(let j=0;j+L<=d.p.length;j++){
   windows++;const a=pattern(d.p,j);let starts=all;
   for(const f of a.f)if(zeros[f].length<starts.length)starts=zeros[f];
   for(const [x,y,z] of a.edges){const p=posting(x,y,z);if(p.length<starts.length)starts=p;}
   comparisons+=starts.length;
   next:for(const i of starts){for(const f of a.f)if(c[i+f]!==0)continue next;for(const [x,y,z] of a.edges)if(mod(c[i+y]-c[i+x])!==z)continue next;
    const partial=a.first.map(t=>t<0?-1:mod(c[i+t]-d.p[j+t]));matches.push({source:d.name,donorStart:j,cipherStart:i,plain:d.p.slice(j,j+L),partial,cover:a.cover,active:a.active});hits++;
   }
  }aligns+=windows*Math.max(0,n);checked+=comparisons;stats.push({name:d.name,windows,hits,comparisons});}
  return {matches,stats,aligns,checked};
 }
 function model(ex=-1){let u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);for(let j=0;j<sections.length;j++)if(j!==ex){const p=sections[j].p;for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)t[(p[i-2]*29+p[i-1])*29+p[i]]++;}}
  let z=u.reduce((a,b)=>a+b,0);u=u.map(x=>x/z);
  for(let a=0;a<29;a++){let n=10;for(let j=0;j<29;j++)n+=b[a*29+j];for(let j=0;j<29;j++)b[a*29+j]=(b[a*29+j]+10*u[j])/n;}
  for(let a=0;a<841;a++){let n=4;for(let j=0;j<29;j++)n+=t[a*29+j];for(let j=0;j<29;j++)t[a*29+j]=(t[a*29+j]+4*b[(a%29)*29+j])/n;}
  return {u:u.map(Math.log),b:b.map(Math.log),t:t.map(Math.log)};
 }
 function encode(p,k,t){const c=[];for(const x of p){if(x===0)c.push(0);else{c.push((x+k[t])%29);t=(t+W[x])%q;}}return {c,t};}
 function decode(c,k,M,initial=null){
  let states=initial?[{phase:initial.phase,a:initial.a,b:initial.b,score:0,node:null,start:initial.phase}]:Array.from({length:q},(_,phase)=>({phase,a:-1,b:-1,score:0,node:null,start:phase}));
  for(const x of c){const next=new Map();for(const s of states){
   const p=mod(x-k[s.phase]);const visit=(z,phase)=>{const add=s.a<0?(s.b<0?M.u[z]:M.b[s.b*29+z]):M.t[(s.a*29+s.b)*29+z],id=phase*900+(s.b+1)*30+z+1,v=s.score+add,old=next.get(id);if(!old||old.score<v)next.set(id,{phase,a:s.b,b:z,score:v,node:{p:z,prev:s.node},start:s.start});};
   if(x===0)visit(0,s.phase);if(p!==0)visit(p,(s.phase+W[p])%q);
  }states=[...next.values()];if(states.length===0)return null;}
  const best=states.reduce((a,b)=>a.score>=b.score?a:b),p=[];for(let x=best.node;x;x=x.prev)p.push(x.p);p.reverse();
  const re=encode(p,k,best.start);if(re.c.join(',')!==c.join(',')||re.t!==best.phase)throw Error('replay failed');
  return {...best,node:undefined,p};
 }
 const cuts=[0,729,1874,3603,5506,6761,7960,9640,12648,12956];
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 if(tape.length!==12956)throw Error('tape geometry');
 if(which==='all')return {which,L,q,...scan(tape,D)};
 let c,P=null,K=null,ex=-1,sourceInfo=null,fit=223;
 if(which.startsWith('plant')){
  const id=Number(which.slice(5));ex=[1,3][id];const source=sections[[4,5][id]];let j=0;
  while(j+L<=source.p.length){const a=pattern(source.p,j);if(a.cover===q&&a.active>=16)break;j++;}
  if(j+L>source.p.length)throw Error('no phase-cover crib');
  P=sections[ex].p.slice(id===0?50:100,(id===0?50:100)+299);const at=[64,100][id];P.splice(at,L,...source.p.slice(j,j+L));let seed=[3301,1033][id];K=Array.from({length:q},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29;});c=encode(P,K,0).c;sourceInfo={name:source.name,donorStart:j,at,key:canonical(K)};
 }else if(which==='p54'){c=gp.pages[54].indices.slice(9).concat(gp.pages[55].indices);}
 else if(/^chapter[0-7]$/.test(which)){const j=Number(which.slice(7));c=tape.slice(cuts[j],cuts[j+1]);fit=Math.floor(c.length*0.75);}
 else throw Error('unknown run');
 const a=c.slice(0,fit),b=c.slice(fit),donors=D.filter(x=>x.name!=='native'+ex),s=scan(a,donors),M=model(ex);
 const candidates=new Map(),unresolved=[];let expansions=0;
 for(const m of s.matches){const missing=q-m.cover;if(missing>3){unresolved.push(m);continue;}const k=m.partial.slice();function complete(i){if(i===q){const id=canonical(k);expansions++;if(!candidates.has(id))candidates.set(id,m);return;}if(k[i]>=0){complete(i+1);return;}for(let x=0;x<29;x++){k[i]=x;complete(i+1);}k[i]=-1;}complete(0);}
 let winner=null,legal=0;for(const [id,crib] of candidates){const k=[...id].map(x=>parseInt(x,36)),v=decode(a,k,M);if(v===null)continue;legal++;if(!winner||v.score>winner.score)winner={...v,key:k,id,crib};}
 let held=null;if(winner){const v=decode(b,winner.key,M,winner);if(v)held={...v,translit:v.p.map(x=>gp.translit[x]).join(''),accuracy:P?v.p.filter((x,i)=>x===P[fit+i]).length:null};winner.translit=winner.p.map(x=>gp.translit[x]).join('');}
 return {which,q,L,fit,heldN:b.length,sourceInfo,aligns:s.aligns,checked:s.checked,stats:s.stats,matches:s.matches,expansions,keys:candidates.size,unresolved,legal,winner,held,keyExact:K&&winner?winner.id===canonical(K):null,trueKeyNominated:K?candidates.has(canonical(K)):null,fitAccuracy:P&&winner?winner.p.filter((x,i)=>x===P[i]).length:null};
}
module.exports={experiment,paths};
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'p54'),null,2));
