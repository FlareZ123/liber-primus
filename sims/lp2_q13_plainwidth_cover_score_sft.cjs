'use strict';
const fs=require('node:fs');
const {core,paths}=require('./lp2_q8_latent_independent_phase_sft.cjs');
function evaluate(raw,bank,rows){
 return core(raw,({donors,corpus,latin})=>{
  const native=JSON.parse(raw[1]),alphabet=new Map(corpus.runes.map((x,i)=>[x,i])),W=latin.map(x=>x.length);
  const sections=native.sections.map(s=>[...s.source_text].filter(x=>alphabet.has(x)).map(x=>alphabet.get(x)));
  let u=new Float64Array(29).fill(.5),b=new Float64Array(841);
  for(const p of sections)for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;}
  let z=u.reduce((s,v)=>s+v,0);u=u.map(x=>x/z);
  for(let i=0;i<29;i++){let n=10;for(let j=0;j<29;j++)n+=b[i*29+j];for(let j=0;j<29;j++)b[i*29+j]=(b[i*29+j]+10*u[j])/n;}
  u=u.map(Math.log);b=b.map(Math.log);
  const cuts=bank.cuts,c=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),out=[];
  function run(wi,j,at,ks){
   const lo=cuts[j],hi=cuts[j+1],anchor=[...bank.chosen[wi].p].map(x=>parseInt(x,36)),k=[...ks].map(x=>parseInt(x,36)),N=hi-lo;
   let d=new Float64Array(13*30).fill(-Infinity);for(let t=0;t<13;t++)d[t*30+29]=0;
   const backs=[];
   for(let i=lo;i<hi;i++){
    let e=new Float64Array(d.length).fill(-Infinity),back=new Int16Array(d.length).fill(-1);
    for(let s=0;s<d.length;s++)if(Number.isFinite(d[s])){
     const t=Math.floor(s/30),a=s%30;if(i===at&&t!==0)continue;
     function step(p,t2){if(i>=at&&i<at+anchor.length&&p!==anchor[i-at])return;
      const dest=t2*30+p,score=d[s]+(a===29?u[p]:b[a*29+p]);if(score>e[dest]){e[dest]=score;back[dest]=s;}}
     const p=(c[i]-k[t]+29)%29;if(c[i]===0)step(0,t);if(p)step(p,(t+W[p])%13);
    }d=e;backs.push(back);
   }
   let end=0;for(let i=1;i<d.length;i++)if(d[i]>d[end])end=i;
   if(!Number.isFinite(d[end]))throw Error('unreachable supposedly legal anchor');
   const score=d[end],plain=[];for(let i=N-1;i>=0;i--){plain.push(end%30);end=backs[i][end];}
   plain.reverse();let t=Math.floor(end/30);
   for(let i=0;i<N;i++){if(lo+i===at&&t!==0)throw Error('anchor phase');let p=plain[i];if((p===0?0:(p+k[t])%29)!==c[lo+i])throw Error('replay');if(p)t=(t+W[p])%13;}
   if(plain.slice(at-lo,at-lo+anchor.length).join(',')!==anchor.join(','))throw Error('anchor');
   return {wi,j,at,key:ks,score,plain:plain.map(x=>x.toString(36)).join(''),latin:plain.map(x=>latin[x]).join('')};
  }
  for(const row of rows){const [wi,j,at,k]=row;out.push(run(wi,j,at,k));}
  out.sort((a,b)=>b.score-a.score);
  const refs=[];
  for(const j of [...new Set(rows.map(x=>x[1]))]){
   const N=cuts[j+1]-cuts[j],by=[];
   for(const d of donors){
    const p=d.flat(),pref=new Float64Array(p.length);for(let i=1;i<p.length;i++)pref[i]=pref[i-1]+b[p[i-1]*29+p[i]];
    let min=Infinity,max=-Infinity,at=-1;for(let i=0;i+N<=p.length;i++){let s=u[p[i]]+pref[i+N-1]-pref[i];if(s<min){min=s;at=i;}max=Math.max(max,s);}
    by.push({windows:p.length-N+1,min,max,at});
   }refs.push({chapter:j,N,by});
  }
  return {rows:out.length,results:out,refs};
 });
}
module.exports={evaluate};
if(require.main===module){const bank=JSON.parse(fs.readFileSync('im-results/lp2-q13-plainwidth-cover-bank.json','utf8')),rows=fs.readFileSync(process.argv[2],'utf8').split(/\r?\n/).filter(x=>x.startsWith('C ')).map(x=>{const [,w,j,a,k]=x.split(' ');return [+w,+j,+a,k];});console.log(JSON.stringify(evaluate(paths.map(p=>fs.readFileSync(p,'utf8')),bank,rows),null,2));}
