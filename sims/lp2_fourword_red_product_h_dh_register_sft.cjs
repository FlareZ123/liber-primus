"use strict";
/** Corrected SFT for p6/p23 red product->H relation. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const J=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const corpus=J("resources/liber-primus/lp2-corpus.json");
const ink=J("resources/liber-primus/lp2-ink-annotations.json");
const segs=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8").split("%");
const glyph=new Map(corpus.runes.map((r,i)=>[r,i]));
const m=x=>((x%29)+29)%29, prod=a=>a.reduce((x,y)=>m(x*y),1);
const h4=v=>[m(v[0]-v[1]),m(v[0]+v[1]),m(v[2]-v[3]),m(v[2]+v[3])];
const h2=v=>[m(v[0]-v[1]),m(v[0]+v[1])];
function pow(x,n){let y=1;for(let i=0;i<n;i++)y=y*x%29;return y;}
const inv=x=>pow(x,27);
function segment(p){return p===50?"":segs[p<50?p:p-1]||"";}
function words(p){
  const pg=corpus.pages.find(x=>x.page===p);assert.ok(pg);
  const out=[];let a=[],o=0;
  const flush=()=>{if(a.length){out.push({start:o-a.length,end:o,len:a.length,vals:a.slice(),product:prod(a)});a=[];}};
  for(const ch of Array.from(segment(p))){
    const v=glyph.get(ch);
    if(v!==undefined){a.push(v);o++;}else if("-.$&§".includes(ch))flush();
  }
  flush();assert.equal(o,pg.runic_count,`physical p${p} rune count`);return out;
}
const all=new Map(corpus.pages.map(p=>[p.page,words(p.page)]));
assert.equal([...all.values()].reduce((n,x)=>n+x.length,0),2973);
function red(p,start){
  const ip=ink.pages.find(x=>x.page===p),sp=ip.red_spans.find(x=>x.start===start);
  return all.get(p).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);
}
const exact=[];
for(const ip of ink.pages)for(const sp of ip.red_spans||[]){
  const ws=all.get(ip.page).filter(w=>w.start>=sp.start&&w.end<=sp.start+sp.length);
  if(ws.length===4)exact.push({page:ip.page,start:sp.start,lengths:ws.map(w=>w.len),products:ws.map(w=>w.product)});
}
assert.deepEqual(exact,[
  {page:6,start:71,lengths:[4,1,4,2],products:[13,19,14,23]},
  {page:23,start:0,lengths:[2,6,3,5],products:[24,13,18,13]}
]);
const p7=red(7,194),pp=p7.map(w=>w.product);
assert.deepEqual(pp,[11,26,8,15,2]);
const p=p7[0].vals[0],e=p7[0].vals[1],g=p7[2].vals[0],a=p7[4].vals[0],
  b=pp[3],A=pp[2],B=inv(pp[1]),K=pp[4];
assert.deepEqual({p,e,g,a,b,A,B,K},{p:23,e:3,g:5,a:6,b:15,A:8,B:19,K:2});
assert.equal(pow(g,a),A);assert.equal(pow(g,b),B);assert.equal(pow(B,a),K);
const p6=red(6,71).map(w=>w.product),p23=red(23,0).map(w=>w.product);
assert.deepEqual(p6,[m(b-K),B,m(-b),p]);
assert.deepEqual(p23,[m(-g),m(b-K),m(p-g),m(b-K)]);
const H6=h4(p6),H23=h4(p23);
assert.deepEqual(H6,[23,3,20,8]);assert.deepEqual(H23,[11,8,5,2]);
const p54=red(54,0);
assert.deepEqual(p54.map(w=>w.len),[1,8]);
assert.deepEqual(p54.map(w=>w.product),[24,10]);
assert.deepEqual(h2(p54.map(w=>w.product)),[m(-b),g]);
const windows=[];
for(const [page,ws] of all)for(let i=0;i+4<=ws.length;i++){
  const q=ws.slice(i,i+4);windows.push({page,start:q[0].start,h:h4(q.map(w=>w.product))});
}
assert.equal(windows.length,2802);
const same=(x,y)=>x.every((v,i)=>v===y[i]);
assert.deepEqual(windows.filter(x=>same(x.h,H6)).map(x=>[x.page,x.start]),[[6,71]]);
assert.deepEqual(windows.filter(x=>same(x.h,H23)).map(x=>[x.page,x.start]),[[23,0]]);
console.log(JSON.stringify({classification:"corrected p6/p23 four-word red DH-register relation",dh23:{p,e,g,a,b,A,B,K},exact,H6,H23,p54:{lengths:p54.map(w=>w.len),products:p54.map(w=>w.product),H:h2(p54.map(w=>w.product))},census:{words:2973,windows:2802}},null,2));
