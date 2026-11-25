"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function solve(corpus,dict,training,donorA,donorB){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109],index=new Map(code.map((p,i)=>[p,i])),partner=Array.from({length:128},(_,d)=>code.map(x=>index.get(x^d)??-1));
 const tokens=corpus.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
 const enc=word=>{let w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA"),out=[];for(let i=0;i<w.length;){const q=tokens.find(([t])=>w.startsWith(t,i));if(!q)return null;out.push(q[1]);i+=q[0].length;}return out};
 const weights=new Map();
 const add=(w,n)=>{const v=enc(w);if(!v||!v.length)return;const k=String.fromCharCode(...v);weights.set(k,(weights.get(k)||0)+n)};
 for(const row of dict.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(row);if(m)add(m[1],Number(m[2]));}
 for(const w of training.match(/[a-z]+/gi)||[])add(w,1);
 const nodes=[];const node=()=>{nodes.push({children:new Map(),total:0,end:0});return nodes.length-1};const root=node(),suffix=node();
 function insert(start,w,weight){let n=start;nodes[n].total+=weight;for(let i=0;i<w.length;i++){const x=w.charCodeAt(i);let c=nodes[n].children.get(x);if(c===undefined){c=node();nodes[n].children.set(x,c);}n=c;nodes[n].total+=weight;}nodes[n].end+=weight;}
 for(const [w,f] of weights){insert(root,w,f);for(let i=0;i<w.length;i++)insert(suffix,w.slice(i),f);}
 const N=nodes.length;
 const transitions=nodes.map(n=>{const out=Array.from({length:29},()=>[]);for(const [x,dst] of n.children)out[x].push([dst,Math.log(nodes[dst].total/n.total),false]);if(n.end>0){const p=Math.log(n.end/n.total);for(const [x,dst] of nodes[root].children)out[x].push([dst,p+Math.log(nodes[dst].total/nodes[root].total),true]);}return out;});


function decodeHold(tracks,activeLength=240,beamWidth=4096,mask=[0,0,0]){
 const options=Array.from({length:128},(_,d)=>Array.from({length:128},(_,e)=>{const all=[];for(let x=0;x<29;x++){const y=partner[d][x],z=partner[e][x];if(y>=0&&z>=0)all.push([x,y,z]);}return {cost:Math.log(all.length),legal:all.filter(a=>a.every(x=>x!==0))};}));
 function holds(track,pos,n){
  const out=[{pos,n,score:0,em:[]}];let layer=[out[0]];
  while(track[pos]===0){pos++;const next=new Map();for(const s of layer)for(const [dst,l,split] of transitions[s.n][0]){const score=s.score+l,old=next.get(dst);if(!old||old.score<score)next.set(dst,{pos,n:dst,score,em:[...s.em,[0,split]]});}layer=[...next.values()];out.push(...layer);if(!layer.length)break;}
  return out.filter(s=>s.pos<track.length);
 }
 let beam=[{pos:[0,0,0],ns:[suffix,suffix,suffix],score:0,prev:null}],sizes=[],clipped=0;
 for(let t=0;t<activeLength;t++){
  const next=new Map();
  for(const s of beam){
   const h=s.pos.map((p,i)=>holds(tracks[i],p,s.ns[i]));
   for(const A of h[0])for(const B of h[1])for(const C of h[2]){
    const a=tracks[0][A.pos],b=tracks[1][B.pos],c=tracks[2][C.pos],o=options[code[a]^code[b]^mask[1]][code[a]^code[c]^mask[2]],emissionCost=options[code[a]^code[b]][code[a]^code[c]].cost,ta=transitions[A.n],tb=transitions[B.n],tc=transitions[C.n];
    const pos=[A.pos+1,B.pos+1,C.pos+1],base=s.score+A.score+B.score+C.score-emissionCost;
    for(const [x,y,z] of o.legal){if(!ta[x].length||!tb[y].length||!tc[z].length)continue;
     for(const u of ta[x])for(const v of tb[y])for(const w of tc[z]){
      const ns=[u[0],v[0],w[0]],key=pos.join(",")+"|"+ns.join(","),score=base+u[1]+v[1]+w[1],old=next.get(key);
      if(!old||score>old.score)next.set(key,{pos,ns,score,prev:s,em:[[...A.em,[x,u[2]]],[...B.em,[y,v[2]]],[...C.em,[z,w[2]]]]});
     }
    }
   }
  }
  if(next.size>beamWidth)clipped++;beam=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,beamWidth);sizes.push(beam.length);if(!beam.length)return {deadAtActive:t+1,clipped,sizes};
 }
 const best=beam[0],steps=[];for(let s=best;s.prev;s=s.prev)steps.push(s);steps.reverse();
 const plain=[[],[],[]],strings=["","",""],pad=[],held=[[],[],[]],p=[0,0,0];
 for(const s of steps){let k;for(let t=0;t<3;t++){const em=s.em[t];for(let i=0;i<em.length;i++){const [x,split]=em[i];plain[t].push(x);strings[t]+=(split?" ":"")+corpus.translit[x];
    const c=tracks[t][p[t]];if(i<em.length-1){if(x!==0||c!==0)throw Error("hold replay");held[t].push(p[t]);}else{const m=code[c]^code[x]^mask[t];if(t===0)k=m;else if(m!==k)throw Error("active replay");}p[t]++;}}
  pad.push(k);
 }
 return {score:best.score,strings,plain,pad,held,consumed:p,clipped,sizes};
}

function run(){
 const encode=t=>(t.match(/[a-z]+/gi)||[]).flatMap(w=>enc(w)||[]),aa=encode(donorA),bb=encode(donorB),len=264,L=240,cut=128;
 const f=new Float64Array(29).fill(.25);f[0]=0;for(const x of encode(training))if(x!==0)f[x]++;const F=f.reduce((s,x)=>s+x,0);for(let i=1;i<29;i++)f[i]/=F;
 const logQ=Array.from({length:128},(_,u)=>Array.from({length:128},(_,v)=>{let p=0;for(let x=1;x<29;x++){const y=partner[u][x],z=partner[v][x];if(y>0&&z>0)p+=f[x]*f[y]*f[z];}return Math.log(p);}));
 const diff=tracks=>{const active=tracks.map(a=>a.filter(x=>x!==0));if(active.some(a=>a.length<L))throw Error("short active");return active[0].slice(0,L).map((x,i)=>[code[x]^code[active[1][i]],code[x]^code[active[2][i]]]);};
 function rank(D){const out=[];for(let a=0;a<128;a+=2)for(let b=0;b<128;b+=2){let s=0;for(let i=0;i<cut;i++){const [u,v]=D[i];s+=logQ[u^a][v^b];if(!Number.isFinite(s))break;}if(Number.isFinite(s)){let h=0;for(let i=cut;i<L;i++){const [u,v]=D[i];h+=logQ[u^a][v^b];if(!Number.isFinite(h))break;}out.push({a,b,score:s,heldout:Number.isFinite(h)?h:null});}}
 out.sort((x,y)=>y.score-x.score||x.a-y.a||x.b-y.b);return out;}
 function infer(tracks){const ranked=rank(diff(tracks)),best=ranked[0],r=best&&best.heldout!==null?decodeHold(tracks,L,4096,[0,best.a,best.b]):null;return {ranked,decoded:r};}
 let seed=0x1b873593;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 const controls=[];
 for(let i=0;i<4;i++){const P=[aa.slice(28000+i*1000,28000+i*1000+len),bb.slice(40000+i*1500,40000+i*1500+len),bb.slice(90000+i*1700,90000+i*1700+len)],act=P.map(a=>a.filter(x=>x!==0)),pos=P.map(a=>a.map((x,j)=>x===0?-1:j).filter(j=>j>=0)),C=P.map(a=>Array(a.length).fill(0));
  const candidates=rank(diff(P)).filter(x=>x.heldout!==null&&(x.a||x.b));if(!candidates.length)throw Error("no nonzero planted mask");const chosen=candidates[rand(candidates.length)],mask=[0,chosen.a,chosen.b];
  for(let j=0;j<Math.max(...act.map(a=>a.length));j++){let keys=Array.from({length:64},(_,k)=>2*k).filter(k=>act.every((a,t)=>j>=a.length||(index.get(k^code[a[j]]^mask[t])??-1)>0));if(!keys.length){if(j<L)throw Error("no legal plant key");keys=Array.from({length:64},(_,k)=>2*k).filter(k=>act.every((a,t)=>j>=a.length||(index.get(k^code[a[j]])??-1)>0));const k=keys[rand(keys.length)];for(let t=0;t<3;t++)if(j<act[t].length)C[t][pos[t][j]]=index.get(k^code[act[t][j]]);continue;}const k=keys[rand(keys.length)];for(let t=0;t<3;t++)if(j<act[t].length)C[t][pos[t][j]]=index.get(k^code[act[t][j]]^mask[t]);}
  const r=infer(C),truth=pos.map(a=>a[L-1]+1),matches=r.decoded?.plain?r.decoded.plain.map((a,t)=>a.filter((x,j)=>x===P[t][j]).length):[0,0,0];controls.push({mask,legalPlantMasks:candidates.length,correctMask:r.ranked[0]?.a===mask[1]&&r.ranked[0]?.b===mask[2],trueConsumed:truth,matches,accuracy:matches.map((m,t)=>m/Math.max(truth[t],r.decoded?.consumed?.[t]??0)),...r});
 }
 const gate=controls.filter(c=>c.correctMask&&c.accuracy.every(x=>x>=.8)).length>=3;
 const originals=[];if(gate)for(const off of [[0,0,0],[3,2,1]]){const tracks=off.map((s,i)=>corpus.pages[24+i].indices.slice(s,s+len));originals.push({off,...infer(tracks)});}
 return {model:"exact-original forced-F phase, all even relative XOR masks; prefix128 select, frozen 112 continuation and trie inverse",len,L,cut,gatePassed:gate,controls,originals};
}
return run();
}
console.log(JSON.stringify(solve(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
