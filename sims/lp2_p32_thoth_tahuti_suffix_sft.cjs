'use strict';
// Fixed p32 suffix test; no original-fitted key or boundary.
const fs = require('node:fs');
const path = require('node:path');
function run(j,chapterII){
  const assert=(b,m)=>{if(!b)throw Error(m)};
  const mod=x=>(x%29+29)%29;
  const get=n=>j.pages.find(p=>p.page===n).indices;
  const render=p=>p.map(x=>j.translit[x]).join("");
  const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const encode=(p,shift,start=0)=>{let q=start;return p.map(x=>x===0?0:mod(x+shift(q++)))};
  const decode=(c,shift,start=0,base=0)=>{
    let s=[{plain:[],q:start}],counts=[],dead=null;
    for(let i=0;i<c.length;i++){
      let t=[];
      for(const e of s){
        if(c[i]===0)t.push({plain:[...e.plain,0],q:e.q});
        const p=mod(c[i]-shift(e.q));
        if(p!==0)t.push({plain:[...e.plain,p],q:e.q+1});
      }
      s=t;counts.push(s.length);
      if(!s.length){dead=base+i;break}
    }
    for(const e of s)assert(equal(encode(e.plain,shift,start),c),"inverse replay");
    return {dead,counts,paths:s.map(e=>({consumed:e.q-start,plain:e.plain,text:render(e.plain)}))};
  };
  const verse=chapterII.split(/\r?\n/).find(x=>/^39\./.test(x));
  assert(verse&&/\bTahuti\b/.test(verse),"historical source");
  assert(equal(get(32).slice(28,37),[2,0,0,3,2,8,3,19,18]),"original motif");
  const suffix=get(32).slice(37);
  assert(suffix.length===84,"p32 suffix");
  const prime=[];
  for(let n=2;prime.length<85;n++)if(prime.every(p=>p*p>n||n%p!==0))prime.push(n);
  const native=decode(get(56),q=>prime[q]-1);
  const known="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE";
  assert(native.paths.length===22&&native.paths.some(x=>x.text===known&&x.consumed===84),"native p56 control");
  const out={verse,original:{page:32,start:37,end:121,cipher:suffix},nativeControl:{paths:native.paths.length,truth:known},tests:[]};
  for(const [name,key] of [["TAHUTI",[16,24,8,1,16,10]],["THOTH",[2,3,2]]]){
    assert(render(key)===name,"key spelling");
    for(const sign of [1,-1]){
      const shift=q=>sign*key[q%key.length];
      const plant=get(57).slice(0,84),pc=encode(plant,shift),pd=decode(pc,shift);
      assert(pd.paths.some(e=>equal(e.plain,plant)),"planted truth");
      const phases=[];
      for(let phase=0;phase<key.length;phase++){
        const ordinary=suffix.map((v,i)=>mod(v-shift(i+phase)));
        assert(equal(ordinary.map((v,i)=>mod(v+shift(i+phase))),suffix),"ordinary replay");
        const result=decode(suffix,shift,phase,37);
        phases.push({phase,ordinary:render(ordinary),...result});
      }
      out.tests.push({name,key,sign,plantPathCount:pd.paths.length,plantExact:true,phases});
    }
  }
  return out;
}
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const chapter = fs.readFileSync(path.join(root, 'resources/external/2013-liber-al-bookcode-II.txt'), 'utf8');
console.log(JSON.stringify(run(corpus, chapter), null, 2));
