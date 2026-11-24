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

function decodeTriple(D,beamWidth=4096){
 let beam=[{a:suffix,b:suffix,c:suffix,score:0,prev:null}],sizes=[],clipped=0;
 for(const [d1,d2] of D){const next=new Map(),valid=partner[d1],valid2=partner[d2];
  const options=[];for(let x=0;x<29;x++){const y=valid[x],z=valid2[x];if(y>=0&&z>=0)options.push([x,y,z]);}
  for(const s of beam){const ta=transitions[s.a],tb=transitions[s.b],tc=transitions[s.c];for(const [x,y,z] of options){if(!ta[x].length||!tb[y].length||!tc[z].length)continue;
   for(const u of ta[x])for(const v of tb[y])for(const w of tc[z]){const a=u[0],b=v[0],c=w[0],k=a+","+b+","+c,score=s.score+u[1]+v[1]+w[1];const old=next.get(k);if(!old||score>old.score)next.set(k,{a,b,c,score,prev:s,x,y,z,splitA:u[2],splitB:v[2],splitC:w[2]});}
  }}
  if(next.size>beamWidth)clipped++;beam=Array.from(next.values()).sort((a,b)=>b.score-a.score).slice(0,beamWidth);sizes.push(beam.length);if(!beam.length)return {deadAt:sizes.length,clipped,sizes};
 }
 const best=beam[0],strings=[[],[],[]],plain=[[],[],[]];for(let s=best;s.prev;s=s.prev){for(const [j,key,split] of [[0,"x","splitA"],[1,"y","splitB"],[2,"z","splitC"]]){strings[j].push((s[split]?" ":"")+corpus.translit[s[key]]);plain[j].push(s[key]);}}
 return {score:best.score,strings:strings.map(a=>a.reverse().join("")),plain:plain.map(a=>a.reverse()),sizes,clipped};
}

function run(){
 const encode=t=>(t.match(/[a-z]+/gi)||[]).flatMap(w=>enc(w)||[]),aa=encode(donorA),bb=encode(donorB),len=264,cut=128;
 const f=new Float64Array(29).fill(.25);for(const x of encode(training))f[x]++;const F=f.reduce((s,x)=>s+x,0);for(let i=0;i<29;i++)f[i]/=F;
 const logQ=Array.from({length:128},(_,u)=>Array.from({length:128},(_,v)=>{let p=0;for(let x=0;x<29;x++){const y=partner[u][x],z=partner[v][x];if(y>=0&&z>=0)p+=f[x]*f[y]*f[z];}return Math.log(p);}));
 const diff=tracks=>tracks[0].map((x,i)=>[code[x]^code[tracks[1][i]],code[x]^code[tracks[2][i]]]);
 function rank(D){
  const survivors=[];for(let a=0;a<128;a++)for(let b=0;b<128;b++){let score=0;for(let i=0;i<cut;i++){const [u,v]=D[i],l=logQ[u^a][v^b];score+=l;if(!Number.isFinite(score))break;}if(Number.isFinite(score))survivors.push({a,b,score});}
  survivors.sort((x,y)=>y.score-x.score||x.a-y.a||x.b-y.b);const held=survivors.map(s=>{let ll=0;for(let i=cut;i<D.length;i++){const [u,v]=D[i];ll+=logQ[u^s.a][v^s.b];}return {...s,heldout:Number.isFinite(ll)?ll:null};});return held;
 }
 function infer(tracks){
  const D=diff(tracks),ranked=rank(D),best=ranked[0];if(!best)return {ranked:[],decoded:null};
  const r=decodeTriple(D.map(([a,b])=>[a^best.a,b^best.b]));
  if(r.plain){const pad=r.plain[0].map((x,i)=>code[x]^code[tracks[0][i]]),masks=[0,best.a,best.b];for(let t=0;t<3;t++)for(let i=0;i<len;i++)if((code[r.plain[t][i]]^pad[i]^masks[t])!==code[tracks[t][i]])throw Error("replay");r.pad=pad;}
  return {ranked,decoded:r};
 }
 let seed=0x2a831d7;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 const controls=[];for(let i=0;i<4;i++){
  const P=[aa.slice(15000+i*1000,15000+i*1000+len),bb.slice(25000+i*1500,25000+i*1500+len),bb.slice(60000+i*1700,60000+i*1700+len)];
  const masks=[0,rand(128),rand(128)];const C=[[],[],[]];
  // For arbitrary masks, a legal shared pad may not exist for a given plaintext triple.
  // Pick a single relative-mask pair that admits all 264 plaintext triples, without altering P.
  const choices=rank(diff(P));const full=choices.filter(x=>x.heldout!==null);const m=full[rand(full.length)];masks[1]=m.a;masks[2]=m.b;
  for(let j=0;j<len;j++){const keys=Array.from({length:128},(_,h)=>h).filter(h=>P.every((a,t)=>index.has(h^code[a[j]]^masks[t])));if(!keys.length)throw Error("no valid pad");const k=keys[rand(keys.length)];for(let t=0;t<3;t++)C[t].push(index.get(k^code[P[t][j]]^masks[t]));}
  const r=infer(C),matches=r.decoded?.plain?r.decoded.plain.map((a,t)=>a.filter((x,j)=>x===P[t][j]).length):[0,0,0];controls.push({masks,legalPlantMaskCount:full.length,correctMasks:r.ranked[0]?.a===masks[1]&&r.ranked[0]?.b===masks[2],matches,...r});
 }
 const gate=controls.filter(c=>c.correctMasks&&c.matches.every(n=>n>=Math.ceil(len*.8))).length>=3;
 const originals=[];if(gate)for(const off of [[0,0,0],[3,2,1]]){const tracks=off.map((s,i)=>corpus.pages[24+i].indices.slice(s,s+len));const r=infer(tracks);originals.push({off,...r});}
 return {model:"three-way arbitrary relative masks, GP prime XOR, prefix-only iid key selection and frozen trie inverse",len,cut,gatePassed:gate,controls,originals};
}
return run();
}
console.log(JSON.stringify(solve(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/english_wordfreq_textblob.txt"),read("resources/control/shakespeare_first300k.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/emerson_essays_2944.txt")),null,2));
