"use strict";
// Issue #3198: exact occurrence-rank cycle image/preimage count.
// Run: node sims/lp2_inventory_cycle_leader_inverse_sft.cjs
const fs=require("node:fs"),path=require("node:path");
function run(corpus,raw,native){
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const check=(v,m)=>{if(!v)throw Error(m)};
 const map=new Map(corpus.runes.map((c,i)=>[c,String.fromCharCode(65+i)]));
 const ends=[2,7,14,22,26,32,39,53,55], chapters=ends.map(()=>[]);
 let page=0,start=0,last=0,w="",carries=0;const words=[];
 function finish(){if(w){words.push(w);const physical=start>=50?start+1:start;chapters[ends.findIndex(x=>physical<=x)].push(w);if(last!==start)carries++;w=""}}
 for(const c of raw.split("%").slice(0,55).join("%")){
  if(map.has(c)){if(!w)start=page;last=page;w+=map.get(c)}
  else if(c==="%"){page++}
  else if(c!=="/"&&!/\s/u.test(c))finish();
 }finish();
 check(words.length===2896,"word count");
 check(carries===32,"carry count "+carries);
 check(eq(chapters.map(x=>x.length),[158,255,383,437,224,326,378,669,66]),"chapter counts");
 check(words.join("")===corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices).map(i=>String.fromCharCode(65+i)).join(""),"exact corpus tape");
 function send(p){
  const ranks=p.map((_,i)=>i).sort((a,b)=>p[a]<p[b]?-1:p[a]>p[b]?1:a-b);
  const c=p.slice();for(let i=0;i<ranks.length;i++)c[ranks[i]]=p[ranks[(i+1)%ranks.length]];
  return c;
 }
 function inverse(c){
  const pos=new Map();c.forEach((x,i)=>{if(!pos.has(x))pos.set(x,[]);pos.get(x).push(i)});
  const keys=[...pos.keys()].sort(), ps=keys.map(k=>pos.get(k)),d=keys.length;
  if(!d)return {count:1n,witness:[]};
  const choices=(i,a,b)=>{
   const x=ps[i],y=ps[(i+1)%d];
   if(!a&&x.length===1)return [];
   const bound=x.length===1?-1:x[x.length-(a?2:1)];
   return y.filter((p,j)=>Number(j===y.length-1)===b&&p>bound);
  };
  const M=ps.map((_,i)=>[0,1].map(a=>[0,1].map(b=>BigInt(choices(i,a,b).length))));
  let count=0n,witness=null;
  for(let first=0;first<2;first++){
   const suffix=Array(d+1);suffix[d]=[BigInt(first===0),BigInt(first===1)];
   for(let i=d-1;i>=0;i--)suffix[i]=[0,1].map(a=>M[i][a][0]*suffix[i+1][0]+M[i][a][1]*suffix[i+1][1]);
   count+=suffix[0][first];
   if(!witness&&suffix[0][first]>0n){
    const marks=Array(d);let a=first;
    for(let i=0;i<d;i++){
     const b=[0,1].find(b=>M[i][a][b]*suffix[i+1][b]>0n);
     marks[(i+1)%d]=choices(i,a,b)[0];a=b;
    }
    witness=c.slice();for(let i=0;i<d;i++)witness[marks[i]]=keys[(i+d-1)%d];
    check(eq(send(witness),c),"witness forward replay");
   }
  }
  return {count,witness};
 }
 let tested=0,images=0;
 for(let n=1;n<=7;n++){
  const tapes=[],hist=new Map();
  for(let k=0;k<3**n;k++){let z=k,t=[];for(let j=0;j<n;j++){t.push("ABC"[z%3]);z=Math.floor(z/3)}tapes.push(t);let c=send(t).join("");hist.set(c,(hist.get(c)||0)+1)}
  for(const t of tapes){check(inverse(t).count===BigInt(hist.get(t.join(""))||0),"exhaustive count");tested++}images+=hist.size;
 }
 const metrics=(label,c,p=null)=>{let v=inverse(c);const f=new Map();for(const w of c)f.set(w,(f.get(w)||0)+1);return {label,groups:c.length,types:f.size,repeatedTypes:[...f.values()].filter(n=>n>1).length,preimages:v.count.toString(),preimageBits:v.count?Math.log2(Number(v.count)):null,truthRecovered:p?eq(p,v.witness):null,witnessReplay:v.witness!==null}};
 const controls=native.sections.map(s=>{const p=[...s.source_text.matchAll(/[\u16A0-\u16FF]+/gu)].map(m=>[...m[0]].filter(c=>map.has(c)).map(c=>map.get(c)).join("")).filter(Boolean);return metrics(s.name,send(p),p)});
 const original=chapters.map((c,i)=>metrics(`p${i?ends[i-1]+1:0}-${ends[i]}`,c));
 const all=metrics("whole book",words);
 return {definition:"Stable GP lexicographic occurrence ranks, cyclic successor by one, chapter-local, no sidecar. Each rank's group is moved to the predecessor rank's original position.",exhaustive:{tested,images},controls,original,all};
}
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
