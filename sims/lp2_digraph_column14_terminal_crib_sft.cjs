'use strict';
// Exact terminal row-equality signature gate for hidden digraph column pairing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function terminal(inputs){
 const d=JSON.parse(inputs[0].content),A=29,W=14,R=22,N=W*R,B=841,full=(1<<W)-1;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 const a=d.pages.slice(54,56).flatMap(p=>p.indices);assert(a.length===N,"terminal geometry");
 const donors=inputs.slice(1,4).map(x=>({name:x.path,a:encode(x.content)})).concat(JSON.parse(inputs[4].content).sections.map(s=>({name:s.name,a:Array.from(s.source_text).map(x=>d.runes.indexOf(x)).filter(x=>x>=0)})));
 const rev=Array.from({length:B},(_,i)=>A*(i%A)+Math.floor(i/A));
 const edges=[], id=Array.from({length:W},()=>Array(W).fill(-1));
 for(let a=0;a<W;a++)for(let b=a+1;b<W;b++){id[a][b]=id[b][a]=edges.length;edges.push([a,b])}
 // Signature preserves exact count of equal pairs between every pair of rows,
 // with diagonal counting unordered pairs of positions inside a row.
 function sig(vs,reverse=false){const slots=Array.from({length:B},()=>[]),m=new Uint8Array(R*R);
  for(let i=0;i<vs.length;i++){let r=Math.floor(i/7);if(reverse)r=R-1-r;
   const list=slots[vs[i]];for(const s of list){const lo=Math.min(r,s),hi=Math.max(r,s);m[lo*R+hi]++}list.push(r)}
  return String.fromCharCode(...m)
 }
 const sigs=new Map(), donorStats=[];
 for(const donor of donors){const x=donor.a;let eligible=0,windows=0,minimum=Infinity;
  for(let p=0;p<2;p++){if(p+N>x.length)continue;let h=new Int32Array(B),c=0;
   for(let i=p;i<p+N;i+=2){const v=A*x[i]+x[i+1];c+=2*h[v]++}
   for(let i=p;i+N<=x.length;i+=2){windows++;minimum=Math.min(minimum,c);if(c<=86){eligible++;let vs=Array.from({length:N/2},(_,j)=>A*x[i+2*j]+x[i+2*j+1]);const k=sig(vs);if(!sigs.has(k))sigs.set(k,[]);sigs.get(k).push({name:donor.name,offset:i,collisions:c})}
    if(i+N+2>x.length)break;const v=A*x[i]+x[i+1],q=A*x[i+N]+x[i+N+1];c-=2*--h[v];c+=2*h[q]++}
  }
  assert(windows===Math.max(0,x.length-N+1),"all donor starts");donorStats.push({name:donor.name,length:x.length,windows,minimum:Number.isFinite(minimum)?minimum:null,eligible});
 }
 const min=Math.min(...donorStats.filter(x=>x.eligible).map(x=>x.minimum));assert(Number.isFinite(min),"eligible controls");
 const matches=[],stats=[];
 for(const layout of ["row","column"]){
  const col=Array.from({length:W},(_,j)=>Array.from({length:R},(_,i)=>a[layout==="row"?i*W+j:j*R+i]));
  const vv=edges.map(([x,y])=>Array.from({length:R},(_,r)=>A*col[x][r]+col[y][r]));
  const h=vv.map(v=>{let h=new Int32Array(B);for(const z of v)h[z]++;return h});
  const self=h.map(t=>t.reduce((s,v)=>s+v*(v-1),0)),M=edges.length;
  const same=Array.from({length:M},()=>new Int32Array(M)),opp=Array.from({length:M},()=>new Int32Array(M));
  for(let i=0;i<M;i++)for(let j=i+1;j<M;j++){const [a,b]=edges[i],[c,e]=edges[j];if(a===c||a===e||b===c||b===e)continue;let s=0,o=0;for(let v=0;v<B;v++)if(h[i][v]){s+=h[i][v]*h[j][v];o+=h[i][v]*h[j][rev[v]]}same[i][j]=same[j][i]=2*s;opp[i][j]=opp[j][i]=2*o}
  let count=0,optimisticSurvivors=0,orientationSurvivors=0,signatureMatches=0,max=0;const path=[];
  function walk(remaining,ub){
   if(!remaining){count++;if(ub<min)return;optimisticSurvivors++;
    for(let b=0;b<64;b++){const mask=b<<1;let score=0;for(let i=0;i<7;i++){score+=self[path[i]];for(let j=0;j<i;j++)score+=((((mask>>i)^(mask>>j))&1)?opp:same)[path[i]][path[j]]}max=Math.max(max,score);
     if(score<min||score>86)continue;orientationSurvivors++;
     const tape=[];for(let r=0;r<R;r++)for(let j=0;j<7;j++){let v=vv[path[j]][r];tape.push((mask>>j)&1?rev[v]:v)}
     for(const reverse of [false,true]){const found=sigs.get(sig(tape,reverse));if(found){signatureMatches++;if(matches.length<100)matches.push({layout,mask,pairs:path.map(i=>edges[i]),reverse,score,found})}}
    }return
   }
   const x=31-Math.clz32(remaining&-remaining);let rem=remaining^(1<<x);
   for(let z=rem;z;z&=z-1){const y=31-Math.clz32(z&-z),e=id[x][y];let add=self[e];for(const f of path)add+=Math.max(same[e][f],opp[e][f]);path.push(e);walk(rem^(1<<y),ub+add);path.pop()}
  }
  walk(full,0);assert(count===135135,"matchings");stats.push({layout,count,optimisticSurvivors,orientationSurvivors,signatureMatches,max});
 }
 // Independent simple planted signature control: same fixed row order,
 // arbitrary bijection, arbitrary within-row pair ordering, and global reversal.
 const p=donors[0].a.slice(100,100+N),v=Array.from({length:N/2},(_,i)=>A*p[2*i]+p[2*i+1]);const t=[];
 for(let r=0;r<R;r++)for(let j=6;j>=0;j--)t.push((v[r*7+j]*17+123)%B);
 assert(sig(v)===sig(t),"invariant control");assert(sig(v,true)===sig(t.slice().reverse()),"reverse control");
 return {inputs:inputs.map(({path,sha})=>({path,sha})),donors:donorStats,eligibleUniqueSignatures:sigs.size,min,stats,matches,plantSignatureExact:true};
}
console.log(JSON.stringify(terminal(inputs),null,2));
