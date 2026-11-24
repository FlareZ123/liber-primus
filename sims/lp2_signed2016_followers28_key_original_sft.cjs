'use strict';
/** Director #2510: frozen 28-rune signed-follower key on original pp29–31. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const c=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const n=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const body=read('resources/historical/cicada2016-4gq25-outguess.asc').split('Hash: SHA1')[1].split('-----BEGIN PGP SIGNATURE-----')[0].replace(/\b7A35090F\b/g,'');
const words=body.match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
const followers=words.flatMap((w,i)=>w==='THE'?[words[i+1]]:[]);
assert.deepEqual(followers,['PATH','DEVOTED','WAY','MAP','ROAD','DIRECTION']);
// Native LP spelling: V→U, TH and IO are single glyphs. IO is index 27.
const spelled=followers.map(w=>w.replace(/V/g,'U').match(/TH|IO|[A-Z]/g).map(x=>x==='IO'?27:c.translit.indexOf(x)));
assert.deepEqual(spelled.map(x=>x.length),[3,7,3,3,4,8]);
const key=spelled.flat();assert.equal(key.length,28);assert.ok(key.every(x=>x>=0));
const mod=x=>(x%29+29)%29;
/** @param {{source_text:string}} s */
const toSeq=s=>[...s.source_text].filter(x=>n.runes.includes(x)).map(x=>n.runes.indexOf(x));
const train=n.sections.filter(s=>s.name!=='0_loss_of_divinity').map(toSeq);
const plant=toSeq(n.sections.find(s=>s.name==='0_loss_of_divinity'));
const grams=new Map(),contexts=new Map();
for(const a of train)for(let i=0;i<a.length;i++){
  const h=a.slice(Math.max(0,i-2),i).join(','),z=h+'|'+a[i];
  grams.set(z,(grams.get(z)||0)+1);contexts.set(h,(contexts.get(h)||0)+1);
}
function score(a,b,c) {
  const h=[a,b].filter(x=>x>=0).join(',');
  return Math.log(((grams.get(h+'|'+c)||0)+0.1)/((contexts.get(h)||0)+2.9));
}
/** @param {number[]} a */
function stats(a) {
  const f=Array(29).fill(0);let s=0;
  for(let i=0;i<a.length;i++){f[a[i]]++;s+=score(a[i-2]??-1,a[i-1]??-1,a[i]);}
  return {n:a.length,ioc:f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1)),score:s/a.length,preview:a.slice(0,85).map(x=>c.translit[x]).join('')};
}
/** @param {number[]} a @param {boolean} bypass */
function enc(a,bypass){let t=0;return a.map(x=>bypass&&x===0?0:mod(x+key[t++%key.length]));}
/** @param {number[]} a */
function dec(a){return a.map((x,i)=>mod(x-key[i%key.length]));}
/** Exact DP over phase and language contexts; preserve all feasible states.
 * @param {number[]} a
 */
function fDecode(a){
  let states=new Map([['0,-1,-1',{t:0,a:-1,b:-1,s:0,path:null}]]),max=1,at=0;
  for(const x of a){
    const next=new Map();
    for(const v of states.values()){
      const choices=[];
      if(x===0)choices.push([0,v.t]);
      const p=mod(x-key[v.t]);
      if(p!==0)choices.push([p,(v.t+1)%key.length]);
      for(const [p,t] of choices){
        const s=v.s+score(v.a,v.b,p),id=t+','+v.b+','+p,prev=next.get(id);
        if(!prev||s>prev.s)next.set(id,{t,a:v.b,b:p,s,path:{p,prev:v.path}});
      }
    }
    at++;if(!next.size)return{status:'impossible',firstImpossiblePosition1:at,maxStates:max};
    states=next;max=Math.max(max,states.size);
  }
  const best=[...states.values()].sort((a,b)=>b.s-a.s)[0],p=[];
  for(let v=best.path;v;v=v.prev)p.push(v.p);
  p.reverse();
  return {status:'candidate',maxStates:max,finalStates:states.size,p,stats:stats(p),replay:enc(p,true).every((v,i)=>v===a[i])};
}
const orig=c.pages.slice(29,32).flatMap(p=>p.indices),out=dec(orig);
assert.equal(orig.length,809);
const f=fDecode(orig),pc=fDecode(enc(plant,true));
const result={key,original:{ordinary:{whole:stats(out),first:stats(out.slice(0,277)),held:stats(out.slice(277)),replay:enc(out,false).every((x,i)=>x===orig[i])},fBypass:{...f,p:undefined}},positive:{plain:stats(plant),ordinaryExact:dec(enc(plant,false)).every((x,i)=>x===plant[i]),bypass:{...pc,p:undefined,exactRunes:pc.p?.filter((x,i)=>x===plant[i]).length,total:plant.length}}};
assert.equal(f.firstImpossiblePosition1,47);
assert.ok(result.original.ordinary.replay&&result.positive.ordinaryExact&&pc.replay);
console.log(JSON.stringify(result,null,2));
