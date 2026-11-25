'use strict';
// Agent22: mapped historical DIVINITY common-cycle exact affine-space anchor test.
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  },
  {
    "path": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  },
  {
    "path": "resources/control/emerson_essays_2944.txt",
    "sha": "a92be8ba5b3511a003a22ba31523c14397aaa83a"
  }
];
function experiment(raw,config={}) {
 const [gp,trans,native,lex,...donors]=raw;
 const G=JSON.parse(gp),N=JSON.parse(native),K=[23,10,1,10,9,10,16,26],W=29,L=28,mod=x=>(x+841)%29;
 const check=(x,m)=>{if(!x)throw Error(m)},key=w=>String.fromCharCode(...w),idx=new Map(G.runes.map((x,i)=>[x,i]));
 const parse=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));
 const all=parse(trans.replace(/[\s/%]/g,"")),C=all.slice(2830,2896);
 check(all.length===2941&&C.length===66&&C.flat().length===308&&C.flat().join()===G.pages.slice(54,56).flatMap(p=>p.indices).join(),"physical source mismatch");
 const alpha=new Map(G.translit.map((x,i)=>[x,i])),dict=new Map();
 function add(w,f){let k=key(w);if(!dict.has(k)||dict.get(k).f<f)dict.set(k,{w,f})}
 function variants(word,fn){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){fn(w);return}for(let n=1;n<=3;n++){let t=s.slice(i,i+n),v=n===3?(t==="ING"?alpha.get("NG"):undefined):alpha.get(t);if(t.length===n&&v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const line of lex.split(/\r?\n/)){let m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],w=>add(w,+m[2]))}
 const pool=N.sections.flatMap(s=>parse(s.source_text));for(const w of pool)add(w,1);
 const by=Array.from({length:40},()=>[]);for(const x of dict.values())by[x.w.length].push(x);

 const Q=8,B=30,S=29,TRAIN=49;
 const counts1=new Float64Array(B),counts2=new Float64Array(B*B),counts3=new Float64Array(B*B*B),tot2=new Float64Array(B),tot3=new Float64Array(B*B);
 const codes=Array.from({length:11},()=>new Set());
 for(const {w,f} of dict.values()){
  const weight=1;let a=S,b=S,n=0;
  for(const c of [...w,S]){counts1[c]+=weight;counts2[b*B+c]+=weight;counts3[(a*B+b)*B+c]+=weight;tot2[b]+=weight;tot3[a*B+b]+=weight;a=b;b=c}
  if(w.length<=10){for(const c of w)n=n*29+c;codes[w.length].add(n)}
 }
 let sum=counts1.reduce((a,b)=>a+b,0);const lm=new Float64Array(B*B*B);
 for(let a=0;a<B;a++)for(let b=0;b<B;b++)for(let c=0;c<B;c++){
  const p1=(counts1[c]+1)/(sum+B),p2=(counts2[b*B+c]+20*p1)/(tot2[b]+20),p3=(counts3[(a*B+b)*B+c]+12*p2)/(tot3[a*B+b]+12);lm[(a*B+b)*B+c]=Math.log(p3);
 }
 function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0}}
 function maps(pi,k){const inv=new Uint8Array(29),m=new Uint8Array(8*29);for(let x=0;x<29;x++)inv[pi[x]]=x;for(let j=0;j<8;j++)for(let c=0;c<29;c++)m[j*29+c]=inv[(pi[c]-k[j]+29)%29];return m}
 function randomPi(rand){const p=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){let j=1+rand()%i;[p[i],p[j]]=[p[j],p[i]]}return p}
 function randomK(rand){return [1,...Array.from({length:7},()=>rand()%29)]}
 function encode(w,pi,k,start){let inv=[];pi.forEach((x,i)=>inv[x]=i);let j=start;return w.map(p=>{if(!p)return 0;let c=inv[(pi[p]+k[j])%29];j=(j+1)%8;return c})}
 function plant(text,seed){const rand=rng(seed),types=Array.from({length:40},()=>new Map());for(const word of new Set(text.toLowerCase().match(/[a-z]+/g)||[]))variants(word,w=>{if(dict.has(key(w)))types[w.length].set(key(w),w)});const pi=randomPi(rand),k=randomK(rand);const truth=C.map(c=>{let a=[...types[c.length].values()];return a[rand()%a.length]});const phases=C.map(()=>rand()%8);return {cipher:truth.map((w,i)=>encode(w,pi,k,phases[i])),truth,pi,k}}
 const same=(a,b)=>a.join()===b.join();
 function sameAction(pi,k,p,q){const a=maps(pi,k),b=maps(p,q);for(let j=0;j<8;j++){let ok=true;for(let i=0;i<a.length;i++)if(a[i]!==b[(i+j*29)%a.length]){ok=false;break}if(ok)return true}return false}
 function decode(c,pi,k){let m=maps(pi,k),ret=new Map();for(let start=0;start<8;start++){function walk(i,j,w){if(i===c.length){if(dict.has(key(w))){check(same(encode(w,pi,k,start),c),"replay");ret.set(key(w),w)}return}if(c[i]===0)walk(i+1,j,[...w,0]);let p=m[j*29+c[i]];if(p)walk(i+1,(j+1)%8,[...w,p])}walk(0,start,[])}return [...ret.values()]}
 function scorer(cipher,bonus){
  const train=cipher.slice(0,TRAIN),simple=train.map(w=>!w.includes(0));
  function score(pi,k){const m=maps(pi,k);let total=0;
   for(let g=0;g<train.length;g++){
    const w=train[g],L=w.length,d=codes[L];let best=-1000;
    const leaf=(a,b,n,s)=>s+lm[(a*B+b)*B+S]+(d.has(n)?bonus+L*.5:0);
    if(simple[g])for(let start=0;start<8;start++){
      let a=S,b=S,n=0,s=0,j=start,ok=true;
      for(let i=0;i<L;i++){let p=m[j*29+w[i]];if(!p){ok=false;break}s+=lm[(a*B+b)*B+p];n=n*29+p;a=b;b=p;j=(j+1)&7}
      if(ok){let z=leaf(a,b,n,s);if(z>best)best=z}
    }else{
      function walk(i,j,a,b,n,s){if(i===L){let z=leaf(a,b,n,s);if(z>best)best=z;return}let c=w[i];if(!c)walk(i+1,j,b,0,n*29,s+lm[(a*B+b)*B]);let p=m[j*29+c];if(p)walk(i+1,(j+1)&7,b,p,n*29+p,s+lm[(a*B+b)*B+p])}
      for(let start=0;start<8;start++)walk(0,start,S,S,0,0)
    }
    total+=best===-1000?-50*L:best;
   }return total;
  }return score;
 }
 function trial(pl,seed,steps,restarts,bonus){
  const rand=rng(seed),score=scorer(pl.cipher,bonus),truthScore=score(pl.pi,pl.k),runs=[];let best=-Infinity,bestPi,bestK;
  for(let r=0;r<restarts;r++){
   let pi=randomPi(rand),k=randomK(rand),s=score(pi,k),initial=s,accepted=0,bestLocal=s;
   for(let i=0;i<steps;i++){
    let mode=rand()%100,a,b,old;const temp=4*Math.pow(.035,i/steps);
    if(mode<65){a=1+rand()%28;b=1+rand()%28;[pi[a],pi[b]]=[pi[b],pi[a]]}
    else if(mode<95){a=1+rand()%7;old=k[a];k[a]=rand()%29}
    else{a=1+rand()%7;b=1+rand()%7;[k[a],k[b]]=[k[b],k[a]]}
    let z=score(pi,k);if(z>=s||(rand()/4294967296)<Math.exp((z-s)/temp)){s=z;accepted++;if(z>bestLocal)bestLocal=z;if(z>best){best=z;bestPi=pi.slice();bestK=k.slice()}}
    else if(mode<65)[pi[a],pi[b]]=[pi[b],pi[a]];else if(mode<95)k[a]=old;else[k[a],k[b]]=[k[b],k[a]];
   }runs.push({initial,best:bestLocal,accepted});
  }
  const found=pl.cipher.map(c=>decode(c,bestPi,bestK)),actual=pl.cipher.map(c=>decode(c,pl.pi,pl.k));
  return {truthScore,best,pi:bestPi,k:bestK,actionExact:sameAction(bestPi,bestK,pl.pi,pl.k),trainSupported:found.slice(0,TRAIN).filter(v=>v.length).length,trainTruth:found.slice(0,TRAIN).filter((v,i)=>v.some(w=>same(w,pl.truth[i]))).length,holdoutSupported:found.slice(TRAIN).filter(v=>v.length).length,holdoutTruth:found.slice(TRAIN).filter((v,i)=>v.some(w=>same(w,pl.truth[TRAIN+i]))).length,plantedSupported:actual.filter(v=>v.length).length,runs};
 }
 const h={rng,scorer,by,TRAIN,mod,maps,dict,key,randomPi,randomK,check,same,encode,decode,sameAction};
 const run=config.project?(pl)=>require('./lp2_shared_gp29_unknown_q8_projection.cjs')(h,pl,config):config.anchorRate?(...args)=>require('./lp2_shared_gp29_unknown_q8_anchored.cjs')(h,...args):trial;
 const seeds=[3301,20141125];return {dictionary:dict.size,training:TRAIN,steps:config.steps??50000,restarts:config.restarts??1,bonus:config.bonus??4,anchorRate:config.anchorRate??0,plants:donors.map((d,i)=>run(plant(d,seeds[i]),seeds[i]^0x12345678,config.steps??50000,config.restarts??1,config.bonus??4,config.anchorRate??0))};
}
const raw=inputs.map(x=>{const b=fs.readFileSync(path.resolve(__dirname,'..',x.path));const sha=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');if(sha!==x.sha)throw Error('input changed: '+x.path);return b.toString('utf8')});
console.log(JSON.stringify(experiment(raw,{steps:Number(process.argv[2]||50000),restarts:Number(process.argv[3]||1),bonus:Number(process.argv[4]||4),anchorRate:Number(process.argv[5]||0),project:process.argv[6]==='project',pairCap:Number(process.argv[7]||100000)}),null,2));
