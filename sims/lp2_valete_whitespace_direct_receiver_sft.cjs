'use strict';
const fs=require('node:fs'), path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(corpus,solved,source){
  const M=29,mod=x=>(x%M+M)%M,assert=(x,m)=>{if(!x)throw Error(m)};
  const lines=source.split(/\r?\n/),counts=lines.slice(lines.indexOf('Hello.'),lines.findIndex(x=>x.startsWith('-----BEGIN PGP SIGNATURE'))-1).map(x=>x.match(/ *$/)[0].length);
  assert(counts.join(',')==='0,2,3,5,7,11,13,1,1,2,11,0,7,0,5,0,3,2,0,0,0','source counts');
  assert(counts.reduce((a,b)=>a+b,0)===73,'space count');
  const phi=n=>{if(n===0)return 0;let a=0;for(let j=1;j<=n;j++){let x=j,y=n;while(y){const t=x%y;x=y;y=t}if(x===1)a++}return a};
  const variants=[];
  for(const [name,values] of [['lines',counts],['nonzero',counts.filter(x=>x>0)],['multi',counts.filter(x=>x>1)]])for(const mode of ['literal','totient'])variants.push({name:`${name}-${mode}`,key:values.map(x=>mode==='literal'?x:phi(x))});
  const ri=new Map(solved.runes.map((x,i)=>[x,i])), native=Object.fromEntries(solved.sections.map(s=>[s.name,[...s.source_text].filter(x=>ri.has(x)).map(x=>ri.get(x))]));
  const training=Object.entries(native).filter(([n])=>!['0_loss_of_divinity','p56_an_end','p57_parable'].includes(n)).map(([,a])=>a);
  const u=Array(M).fill(0),b=Array(M*M).fill(0),t=Array(M**3).fill(0),bt=Array(M).fill(0),tt=Array(M*M).fill(0);let total=0;
  for(const a of training)for(let i=0;i<a.length;i++){u[a[i]]++;total++;if(i){b[a[i-1]*M+a[i]]++;bt[a[i-1]]++}if(i>1){const k=a[i-2]*M+a[i-1];t[k*M+a[i]]++;tt[k]++}}
  const pu=u.map(x=>(x+.15)/(total+.15*M)),pb=b.map((x,k)=>(x+4*pu[k%M])/(bt[Math.floor(k/M)]+4)),pt=t.map((x,k)=>(x+5*pb[k%(M*M)])/(tt[Math.floor(k/M)]+5));
  const inc=(a,b,c)=>Math.log(a<0?(b<0?pu[c]:pb[b*M+c]):pt[(a*M+b)*M+c]);
  const score=a=>a.reduce((s,x,i)=>s+inc(i>1?a[i-2]:-1,i?a[i-1]:-1,x),0)/a.length;
  const encode=(P,key,sign,phase,hold)=>{let k=phase;return P.map(p=>{if(hold&&p===0)return 0;const c=mod(p+sign*key[k]);k=(k+1)%key.length;return c})};
  const ordinary=(C,key,sign,phase)=>C.map((c,i)=>mod(c-sign*key[(phase+i)%key.length]));
  function inverse(C,key,sign,phases,hold){
    if(!hold){let best=null;for(const phase of phases){const P=ordinary(C,key,sign,phase),s=score(P);if(!best||s>best.score)best={phase,P,score:s}}return {maxPrefix:C.length,fullHistories:String(phases.length),...best}}
    let states=new Map();for(const phase of phases)states.set(`${phase},-1,-1`,{k:phase,a:-1,b:-1,s:0,count:1n,phase,node:null});
    let maxPrefix=0;
    for(const c of C){
      const next=new Map();
      for(const v of states.values()){
        const moves=[],p=mod(c-sign*key[v.k]);
        if(c===0)moves.push([0,v.k]);
        if(p!==0)moves.push([p,(v.k+1)%key.length]);
        for(const [x,k] of moves){const a=v.b,b=x,tag=`${k},${a},${b}`,s=v.s+inc(v.a,v.b,x),old=next.get(tag),count=(old?.count??0n)+v.count;
          if(!old||s>old.s)next.set(tag,{k,a,b,s,count,phase:v.phase,node:{x,prev:v.node}});else old.count=count;
        }
      }
      if(!next.size)return {maxPrefix,fullHistories:'0'};
      states=next;maxPrefix++;
    }
    let best=null,n=0n;for(const v of states.values()){n+=v.count;if(!best||v.s>best.s)best=v}
    const P=[];for(let x=best.node;x;x=x.prev)P.push(x.x);P.reverse();
    return {maxPrefix,fullHistories:String(n),phase:best.phase,score:best.s/C.length,P};
  }
  const page=n=>corpus.pages.find(p=>p.page===n).indices;
  const primes=[];for(let n=2;primes.length<85;n++){let ok=true;for(let d=2;d*d<=n;d++)if(n%d===0){ok=false;break}if(ok)primes.push(n-1)}
  assert(native.p56_an_end.length===85,'native p56 length');
  assert(encode(native.p56_an_end,primes,1,0,true).join(',')===page(56).join(','),'original p56 replay');
  assert(native.p57_parable.join(',')===page(57).join(','),'p57 original');
  const held=['0_loss_of_divinity','p57_parable'],controls=[];
  for(const v of variants)for(const name of held)for(const sign of [1,-1])for(const hold of [false,true]){
    const P=native[name],phase=3%v.key.length,C=encode(P,v.key,sign,phase,hold),d=inverse(C,v.key,sign,Array.from({length:v.key.length},(_,i)=>i),hold);
    assert(d.P&&encode(d.P,v.key,sign,d.phase,hold).join(',')===C.join(','),'control replay');
    controls.push({variant:v.name,name,sign,hold,phaseRecovered:d.phase===phase,n:P.length,correct:d.P.filter((x,i)=>x===P[i]).length,truthScore:score(P),decodedScore:d.score});
  }
  const scopes=[{name:'p0-black',C:page(0).slice(13)},{name:'p1-p2',C:[...page(1),...page(2)]},{name:'p55',C:page(55)}];
  for(const [a,b] of [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]])scopes.push({name:`p${a}-${b}`,C:corpus.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)});
  const records=[];
  for(const s of scopes)for(const v of variants)for(const sign of [1,-1])for(const hold of [false,true]){
    const phases=Array.from({length:v.key.length},(_,i)=>i),d=inverse(s.C,v.key,sign,phases,hold);
    const row={scope:s.name,n:s.C.length,variant:v.name,sign,hold,maxPrefix:d.maxPrefix,fullHistories:d.fullHistories};
    if(d.P){assert(encode(d.P,v.key,sign,d.phase,hold).join(',')===s.C.join(','),'original replay');Object.assign(row,{phase:d.phase,score:d.score,sample:d.P.slice(0,100).map(x=>corpus.translit[x]).join(' ')})}
    records.push(row);
  }
  // Freeze the p0-black optimum and continue the same cipher clock into p1–2.
  const continuity=[];
  for(const v of variants)for(const sign of [1,-1]){
    const C=page(0).slice(13),next=[...page(1),...page(2)],d=inverse(C,v.key,sign,Array.from({length:v.key.length},(_,i)=>i),false),phase=(d.phase+C.length)%v.key.length,P=ordinary(next,v.key,sign,phase);
    continuity.push({variant:v.name,sign,phase,fit:d.score,holdout:score(P),sample:P.slice(0,100).map(x=>corpus.translit[x]).join(' ')});
  }
  const sorted=records.filter(x=>x.score!==undefined).sort((a,b)=>b.score-a.score);
  return {counts,variants,control:{p56Exact:85,p57Exact:95,heldScores:held.map(name=>({name,score:score(native[name])})),plants:controls},summary:{records:records.length,fullF:records.filter(x=>x.hold&&x.score!==undefined).length,bestOrdinary:sorted.filter(x=>!x.hold).slice(0,8),bestF:sorted.filter(x=>x.hold).slice(0,8),bestPrefix:records.filter(x=>x.hold).sort((a,b)=>b.maxPrefix-a.maxPrefix).slice(0,3),controlsExact:controls.filter(x=>x.correct===x.n).length,controlsTotal:controls.length},continuity,records};
}
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/historical/cicada2012-valete-vjuNp.jpg.out')),null,2));
