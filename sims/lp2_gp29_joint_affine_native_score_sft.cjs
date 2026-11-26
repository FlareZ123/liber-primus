'use strict';
function scoreNative(source,dictText,fixture,src,tapes,expected){
 const N=29,Q=8,ALL=(1<<N)-1,SYM="0123456789abcdefghijklmnopqrs",alpha=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const mod=x=>(x%N+N)%N,rot=(m,t)=>t?((m<<t)|(m>>>(N-t)))&ALL:m,assert=(x,m)=>{if(!x)throw Error(m)},encode=x=>x.map(v=>SYM[v]).join("");
 const D=new Set();for(const line of dictText.split(/\r?\n/)){const m=/^([a-z]+) [0-9]+$/.exec(line);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function rec(i,w){if(i===s.length){D.add(w);return}for(let l=1;l<=3&&i+l<=s.length;l++){const t=s.slice(i,i+l),j=l===3?(t==="ING"?21:-1):alpha.indexOf(t);if(j>=0)rec(i+l,w+SYM[j])}}rec(0,"")}
 for(const w of fixture.added.split(/\s+/))if(w)D.add(w);assert(D.size===38938,"dictionary");
 const prefix=new Set([...D].filter(w=>w.length===11).map(w=>w.slice(0,10)));
 const body=src.p54.body_groups;assert(body.length===48&&body[47]==="63g2eis46q"&&body.slice(0,47).join("").length===213,"source");
 function decode(c,pi,k,dict){const ip=Array(N);pi.forEach((v,i)=>ip[v]=i);const out=new Set();function walk(i,j,w){if(i===c.length){if(dict.has(w))out.add(w);return}const x=SYM.indexOf(c[i]);if(!x)walk(i+1,j,w+"0");const p=ip[mod(pi[x]-k[j])];if(p)walk(i+1,(j+1)%Q,w+SYM[p])}for(let j=0;j<Q;j++)walk(0,j,"");return [...out].sort()}
 function fnv(s){let h=14695981039346656037n;for(const c of s)h=BigInt.asUintN(64,(h^BigInt(c.charCodeAt(0)))*1099511628211n);return h.toString(16).padStart(16,"0")}
 const rows=[],all=new Map();
 for(const [i,tape] of Object.entries(tapes)){
  assert(tape.length%7===0,"invalid tape");
  const row=source.states[Number(i)],g=row.symbolic;
  const groups=Array.from(new Set(g.roots)).map(r=>g.roots.map((x,j)=>x===r?j:-1).filter(j=>j>=0)).sort((a,b)=>b.length-a.length||a[0]-b[0]);
  const entries=[],hist={};
  for(let t=0;t<tape.length;t+=7){
   const k=[1,...tape.slice(t,t+7).split("").map(x=>SYM.indexOf(x))];
   assert(k.every(x=>x>=0)&&k.slice(0,4).some((v,j)=>v!==k[j+4]),"key");
   for(const e of g.eq)assert(mod(e.slice(0,Q).reduce((s,v,j)=>s+v*k[j],0)-e[Q])===0,"RREF key");
   const off=g.off.map(a=>mod(a.reduce((s,v,j)=>s+v*k[j],0)));
   const masks=groups.map(a=>a.reduce((s,j)=>s|(1<<off[j]),0)),trans=[0,0,0];
   for(let j=0;j<3;j++)assert(new Set(groups[j].map(x=>off[x])).size===groups[j].length,"internal collision");
   let n=0;
   for(let a=0;a<N;a++){const m=rot(masks[1],a);if(m&masks[0])continue;for(let b=0;b<N;b++){const q=rot(masks[2],b);if(q&(m|masks[0]))continue;assert((q|m|masks[0])===ALL,"coverage");trans[1]=a;trans[2]=b;
    const p=off.slice();groups.forEach((gr,j)=>gr.forEach(x=>p[x]=mod(p[x]+trans[j])));const pi=p.map(x=>mod(x-p[0]));
    for(const [c,p,j] of row.history)assert(mod(pi[c]-pi[p])===k[j],"edge replay");
    const carry=decode(body[47],pi,k,prefix);assert(carry.length,"mandatory carry");
    const hits=body.slice(0,47).map(c=>decode(c,pi,k,D)),support=hits.filter(x=>x.length).length;
    const action=encode(pi)+"|"+encode(k);entries.push({action,support,carry});hist[support]=(hist[support]??0)+1;all.set(action,{action,support,carry,state:Number(i)});n++;
   }}
   assert(n>0,"native key without packing");
  }
  entries.sort((a,b)=>a.action<b.action?-1:a.action>b.action?1:0);
  const hash=fnv(entries.map(x=>`${i}|${x.action}\n`).join(""));
  assert(entries.length===expected[i].actions&&hash===expected[i].fnv64,"native action-set checksum");
  rows.push({index:Number(i),...expected[i],keyCount:tape.length/7,verifiedHash:hash,exhausted:true,histogram:hist,maxSupport:Math.max(...entries.map(x=>x.support)),entries});
 }
 const fit=[...all.values()].sort((a,b)=>b.support-a.support),qualifying=fit.filter(x=>x.support>=44);
 const held=qualifying.map(x=>{const [a,b]=x.action.split("|").map(s=>s.split("").map(v=>SYM.indexOf(v)));return {action:x.action,carry:decode(body[47]+src.p55.groups[0],a,b,D),words:src.p55.groups.slice(1).map(c=>decode(c,a,b,D))}});
 return {schema:"agent46-native-joint-affine-p54-score-v1",nativeKeyTapes:tapes,rows,distinct:fit.length,maxSupport:fit[0]?.support??null,qualifying:qualifying.length,top:fit.slice(0,10),held};
}
const fs=require('node:fs');
const inputs=["im-results/lp2-gp29-three-component-symbolic-states.json","resources/control/english_wordfreq_textblob.txt","im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json","resources/liber-primus/lp2-page-groups-54-55-derived.json"].map(p=>fs.readFileSync(p,'utf8'));
const ref=JSON.parse(fs.readFileSync('im-results/lp2-gp29-joint-affine-permutation-native.json','utf8'));
const expected=Object.fromEntries(ref.rows.map(r=>[r.index,{actions:r.actions,fnv64:r.fnv64,nodes:r.nodes,rotations:r.rotations,ms:r.ms}]));
console.log(JSON.stringify(scoreNative(JSON.parse(inputs[0]),inputs[1],JSON.parse(inputs[2]),JSON.parse(inputs[3]),ref.nativeKeyTapes,expected),null,2));
