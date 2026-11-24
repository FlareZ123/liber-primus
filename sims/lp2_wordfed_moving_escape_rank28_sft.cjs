'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const idx=new Map(corpus.runes.map((x,i)=>[x,i])),words=[];let w=[];
for(const c of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%')){
  if(idx.has(c))w.push(idx.get(c));
  else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}
}
if(w.length)words.push(w);
assert.equal(words.length,2896);assert.deepEqual(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
assert.equal(words.flat().length,12956);
const donors=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections.flatMap(s=>
  (s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C')
    .replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const p=[];while(s.length){const m=tok.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;
}
const code=p=>String.fromCharCode(...p),nativeLex=new Set(donors.map(code)),lex=new Set(nativeLex);
for(const l of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const p=encode(m[1]);if(p)lex.add(code(p));}
}
assert.equal(lex.size,29081);
const log=Array(29).fill(-1),exp=[];let x=1;
for(let k=0;k<28;k++){log[x]=k;exp.push(x);x=x*15%29;}
assert.equal(new Set(exp).size,28);
const map=(a,b)=>Array.from({length:29},(_,i)=>(a*i+b)%29);
/** @param {number[]} w @param {number[]} prev @param {number[]} f @param {number} kind */
function inv(w,prev,f,kind){
  return w.map((d,j)=>{const e=f[prev[j%prev.length]];if(!d)return e;
    let rank=kind===0?d-1:log[d];rank=(rank+28-e%28)%28;return rank+ +(rank>=e);});
}
/** @param {number[]} w @param {number[]} prev @param {number[]} f @param {number} kind */
function emit(w,prev,f,kind){
  return w.map((p,j)=>{const e=f[prev[j%prev.length]];if(p===e)return 0;
    const rank=(p- +(p>e)+e)%28;return kind===0?rank+1:exp[rank];});
}
function search(ds,s,split,vocab,keep){
  let top=[];
  for(let kind=0;kind<2;kind++)for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const f=map(a,b);
    for(let seed=0;seed<29;seed++){
      let p=[seed],score=0;
      for(let j=s+1;j<split;j++){p=inv(ds[j],p,f,kind);if(p.length>=4&&vocab.has(code(p)))score+=p.length;}
      if(keep==='ties'){
        if(!top.length||score>top[0].score)top=[];
        if(!top.length||score===top[0].score)top.push({kind,a,b,seed,score});
      }else if(top.length<keep||score>top.at(-1).score){
        top.push({kind,a,b,seed,score});top.sort((a,b)=>b.score-a.score);top.length=Math.min(top.length,keep);
      }
    }
  }return top;
}
function decode(ds,s,end,key){
  let p=[key.seed],out=[];const f=map(key.a,key.b);
  for(let j=s+1;j<end;j++){const old=p;p=inv(ds[j],old,f,key.kind);assert.deepEqual(emit(p,old,f,key.kind),ds[j]);out.push(p);}return out;
}
const deltas=[];let prev=0;
for(const w of words)deltas.push(w.map(c=>{const d=(c-prev+29)%29;prev=c;return d;}));
const eligible=(lo,hi)=>words.slice(lo,hi).filter(w=>w.length>=4).reduce((s,w)=>s+w.length,0);
assert.equal(words.findIndex(w=>w.length===1),39);
const top=search(deltas,39,413,lex,12).map(k=>{
  const p=decode(deltas,39,796,k),holdout=p.slice(413-40);
  return {...k,test:holdout.filter(w=>w.length>=4&&lex.has(code(w))).reduce((s,w)=>s+w.length,0),
    preview:p.slice(0,30).map(w=>w.map(x=>corpus.translit[x]).join('')).join(' ')};
});
assert.equal(eligible(40,413),1299);assert.equal(eligible(413,796),1318);
assert.equal(top[0].score,13);assert(top.every(x=>x.test===0));
const controls=[];
for(const [start,aa,bb,kk] of [[0,12,14,1],[150,8,17,0]]){
  const p=donors.slice(start,start+150),s=p.findIndex(w=>w.length===1),f=map(aa,bb),split=s+80;
  const ds=p.map((w,j)=>j?emit(w,p[j-1],f,kk):w);
  const keys=search(ds,s,split,nativeLex,'ties');assert.equal(keys.length,1);
  const k=keys[0];assert.deepEqual([k.kind,k.a,k.b,k.seed],[kk,aa,bb,p[s][0]]);
  const recovered=decode(ds,s,p.length,k);assert.deepEqual(recovered,p.slice(s+1));
  controls.push({start,s,split,key:k,heldoutRunes:p.slice(split).flat().length});
}
assert.deepEqual(controls.map(c=>c.heldoutRunes),[304,81]);
console.log(JSON.stringify({keys:2*29**3,trainEligible:1299,heldoutEligible:1318,top,controls},null,2));

// Independent spacing-free language recovery, not a word dictionary criterion.
const ref=(read('resources/control/gibran_prophet_58585.txt').match(/[A-Za-z]+/g)||[]).flatMap(encode);
const uni=new Float64Array(29),bi=new Float64Array(841),tri=new Float64Array(24389);
for(let j=0;j<ref.length;j++){
  const z=ref[j];uni[z]++;if(j)bi[ref[j-1]*29+z]++;
  if(j>1)tri[(ref[j-2]*29+ref[j-1])*29+z]++;
}
const L=new Float64Array(24389);
for(let x=0;x<29;x++)for(let y=0;y<29;y++){
  let n=0,m=0;for(let z=0;z<29;z++){n+=tri[(x*29+y)*29+z];m+=bi[y*29+z];}
  for(let z=0;z<29;z++){
    const p2=(bi[y*29+z]+20*(uni[z]+.5)/(ref.length+14.5))/(m+20);
    L[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+10*p2)/(n+10));
  }
}
function table(a,b,kind){
  const tab=new Int8Array(29*29);
  for(let k=0;k<29;k++){const e=(a*k+b)%29;tab[k*29]=e;
    for(let d=1;d<29;d++){const v=((kind?log[d]:d-1)+28-e%28)%28;tab[k*29+d]=v+ +(v>=e);}
  }return tab;
}
function spacingScore(tab,seed,hi){
  let p=new Int8Array(14),next=new Int8Array(14),pn=1,xy=seed,n=1,tr=0,te=0;p[0]=seed;
  for(let j=40;j<hi;j++){
    const w=deltas[j];for(let k=0;k<w.length;k++){
      const z=tab[p[k%pn]*29+w[k]];next[k]=z;
      if(n>1){const q=L[xy*29+z];if(j<413)tr+=q;else te+=q;}
      xy=(xy%29)*29+z;n++;
    }
    pn=w.length;const tmp=p;p=next;next=tmp;
  }return {tr,te};
}
let spacingTop=[];
for(let kind=0;kind<2;kind++)for(let a=0;a<29;a++)for(let b=0;b<29;b++){
  const t=table(a,b,kind);
  for(let seed=0;seed<29;seed++){
    const v=spacingScore(t,seed,413).tr;
    if(spacingTop.length<12||v>spacingTop.at(-1).tr){
      spacingTop.push({kind,a,b,seed,tr:v});spacingTop.sort((a,b)=>b.tr-a.tr);spacingTop.length=Math.min(spacingTop.length,12);
    }
  }
}
const trainN=words.slice(40,413).flat().length,testN=words.slice(413,796).flat().length;
for(const o of spacingTop){const q=spacingScore(table(o.a,o.b,o.kind),o.seed,796);o.train=q.tr/(trainN-1);o.test=q.te/testN;}
assert.equal(ref.length,62492);assert.deepEqual([trainN,testN],[1697,1729]);
assert.deepEqual([spacingTop[0].kind,spacingTop[0].a,spacingTop[0].b,spacingTop[0].seed],[1,27,25,18]);
assert(Math.abs(spacingTop[0].train+5.735327721760974)<1e-8);
assert(Math.abs(spacingTop[0].test+5.969867244976675)<1e-8);
function ll(p){let s=0;for(let i=2;i<p.length;i++)s+=L[(p[i-2]*29+p[i-1])*29+p[i]];return s/(p.length-2);}
const nativeScores=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections.map(s=>{
  const p=[...s.source_text].filter(c=>idx.has(c)).map(c=>idx.get(c));return [p.length,ll(p)];
});
console.log(JSON.stringify({spacingTop,nativeScores,original:ll(words.slice(40,413).flat()),
  uniformExpectation:L.reduce((s,x)=>s+x,0)/L.length},null,2));
