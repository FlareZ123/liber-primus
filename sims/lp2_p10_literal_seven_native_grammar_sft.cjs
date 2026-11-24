'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const chart=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const source=read('resources/transcriptions/lp2-image-corrected.txt');
const gp=new Map(chart.runes.map((x,i)=>[x,i]));
const runes=s=>[...s].filter(x=>gp.has(x));
const p=source.split('%')[10],pos=p.indexOf('7'),l=p.lastIndexOf('.',pos),r=p.indexOf('.',pos);
assert.equal([...source.matchAll(/7/g)].length,1);
const clause=p.slice(l+1,r).replace(/[\/\n]/g,''),groups=clause.split('-'),at=groups.indexOf('7');
const local=runes(p.slice(0,pos)).length;
const global=chart.pages.slice(0,10).reduce((s,x)=>s+x.indices.length,0)+local;
const clauseStart=global-runes(groups.slice(0,at).join('')).length;
const next=p.slice(r+1,p.indexOf('.',r+1)).replace(/[\/\n]/g,'');
const lengths=groups.map(x=>runes(x).length),ct=gp.get(groups[at+1]);
const targets=new Set(['ONE','TWO','THREE','FOUR','FIVE','SIX','SEUEN','SEVEN','EIGHT','NINE','TEN','ZERO','FIRST','SECOND','THIRD','FOURTH','SINGLE','DOUBLE','TWELUE','TWELVE']);
const singleton=new Map(),numeric=[];
for(const s of native.sections){
  // Exclude separately printed numerical tables and digest lines.
  const raw=s.source_text.split('\n').filter(l=>!/\b\d{2,}\b/.test(l)&&!/[0-9a-f]{20,}/i.test(l)).join('\n');
  const words=[...raw.matchAll(/[\u16a0-\u16ff]+|[0-9]+/g)].map(m=>{
    const w=m[0],rs=runes(w);
    if(rs.length===1)singleton.set(rs[0],(singleton.get(rs[0])||0)+1);
    return {w,lat:rs.map(x=>chart.translit[gp.get(x)]).join('').toUpperCase()||w,n:rs.length};
  });
  for(let i=0;i<words.length;i++) if(targets.has(words[i].lat)||/^\d+$/.test(words[i].w)){
    numeric.push({section:s.name,center:words[i].lat,context:words.slice(Math.max(0,i-2),i+4).map(x=>x.lat),near:words.slice(Math.max(0,i-1),i+3).map(x=>x.n)});
  }
}
const singles=[...singleton].map(([r,n])=>({r,gp:gp.get(r),latin:chart.translit[gp.get(r)],n,shift:(ct-gp.get(r)+29)%29}));
assert.equal(local,169);assert.equal(global,2566);assert.equal(clauseStart,2503);
assert.equal(runes(clause).length,68);assert.equal(ct,6);
assert.deepEqual(lengths,[3,4,2,3,7,4,8,3,3,5,5,8,2,3,3,0,1,4]);
assert.deepEqual(next.split('-').map(x=>runes(x).length),[5,2]);
assert.deepEqual(singles.map(x=>[x.gp,x.n,x.shift]),[[24,19,11],[10,8,25],[16,1,19]]);
assert.deepEqual(numeric.map(x=>x.center),['ONE','FOUR','THREE','TWO','1','2']);
assert.equal(numeric.filter(x=>x.near[0]===3&&x.near[2]===1&&x.near[3]===4).length,0);
console.log(JSON.stringify({local,global,clauseStart,clause,groups,lengths,next,singles,numeric},null,2));
