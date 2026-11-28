"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json"),ink=J("resources/liber-primus/lp2-ink-annotations.json");
const segs=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8").split("%");
const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
const mod=x=>((x%29)+29)%29,sum=a=>a.reduce((x,y)=>mod(x+y),0),prod=a=>a.reduce((x,y)=>mod(x*y),1);
const h=v=>{const out=[];for(let i=0;i<Math.floor(v.length/2);i++)out.push(mod(v[i]-v[v.length-1-i]),mod(v[i]+v[v.length-1-i]));if(v.length%2)out.push(v[(v.length-1)/2]);return out;};
const pow=(x,n)=>{let y=1;for(let i=0;i<n;i++)y=y*x%29;return y;},inv=x=>pow(x,27);
function segment(p){return p===50?"":segs[p<50?p:p-1]||"";}
function words(p){
  const pg=corpus.pages.find(x=>x.page===p);assert.ok(pg);
  const out=[];let a=[],o=0;
  const flush=()=>{if(a.length){out.push({page:p,start:o-a.length,end:o,len:a.length,vals:a.slice(),sum:sum(a),product:prod(a)});a=[];}};
  for(const ch of Array.from(segment(p))){const v=glyph.get(ch);if(v!==undefined){a.push(v);o++;}else if("-.$&§".includes(ch))flush();}
  flush();assert.equal(o,pg.runic_count,`physical p${p} rune count`);return out;
}
const all=corpus.pages.flatMap(pg=>words(pg.page));assert.equal(all.length,2973);
function redWords(p,start){
  const ip=ink.pages.find(x=>x.page===p),sp=ip.red_spans.find(x=>x.start===start);assert.ok(sp);
  return words(p).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);
}
const exact=[];
for(const ip of ink.pages)for(const sp of ip.red_spans||[]){
  const ws=words(ip.page).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);
  if(ws.length===4)exact.push({page:ip.page,start:sp.start,end:sp.start+sp.length});
}
assert.deepEqual(exact,[{page:6,start:71,end:82},{page:23,start:0,end:16}]);

const p7=redWords(7,194),pp=p7.map(w=>w.product);
assert.deepEqual(pp,[11,26,8,15,2]);
const p=p7[0].vals[0],e=p7[0].vals[1],g=p7[2].vals[0],a=p7[4].vals[0],
  b=pp[3],A=pp[2],B=inv(pp[1]),K=pp[4],q=pp.reduce((x,y)=>mod(x+y),0),F=0;
assert.deepEqual({p,e,g,a,b,A,B,K,q,F},{p:23,e:3,g:5,a:6,b:15,A:8,B:19,K:2,q:4,F:0});

const successors=exact.map(x=>{const w=words(x.page).find(z=>z.start===x.end);assert.ok(w);return w;});
assert.deepEqual(successors.map(w=>[w.page,w.start,w.len,w.sum,w.product]),[
  [6,82,7,2,3],
  [23,16,8,25,16]
]);
assert.deepEqual(successors[0].vals,[6,9,28,25,6,21,23]);
assert.deepEqual(successors[1].vals,[28,6,15,25,13,7,19,28]);
assert.deepEqual([successors[0].len,successors[0].sum,successors[0].product],[mod(g+K),K,e]);
assert.deepEqual([successors[1].len,successors[1].sum,successors[1].product],[A,mod(-q),mod(A*K)]);
assert.deepEqual(h(successors[0].vals),[mod(a*K),F,mod(K+b),1,mod(p-1),g,mod(-q)]);
assert.deepEqual(h(successors[1].vals),[F,mod(-K),mod(A*K),mod(-q),A,mod(p-1),mod(a*K),mod(A+1)]);

const controls=successors.map(w=>{
  const sameLength=all.filter(x=>x.len===w.len);
  const hits=sameLength.filter(x=>x.sum===w.sum&&x.product===w.product);
  return {page:w.page,length:w.len,sameLengthWords:sameLength.length,hits:hits.map(x=>({page:x.page,start:x.start}))};
});
assert.deepEqual(controls,[
  {page:6,length:7,sameLengthWords:218,hits:[{page:6,start:82}]},
  {page:23,length:8,sameLengthWords:160,hits:[{page:23,start:16}]}
]);
console.log(JSON.stringify({
  status:"PASS",
  classification:"source-selected black successors of the only two four-word red spans carry unique DH-state descriptors",
  dh23:{p,e,g,a,b,A,B,K,q,F},
  successors:successors.map(w=>({page:w.page,start:w.start,values:w.vals,descriptor:[w.len,w.sum,w.product],outsideInH:h(w.vals)})),
  descriptorIdentities:{p6:["g+K","K","e"],p23:["A","-q","A*K"]},
  controls,
  boundary:"state names were recognized retrospectively; adjacency and the (length,sum,product) observable grammar are fixed before the state comparison. No plaintext or body-cipher opcode is recovered."
},null,2));
