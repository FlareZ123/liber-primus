'use strict';

/**
 * Authenticated PGP-fingerprint -> SHA-1 counter stream -> LP2 GP28 chain test.
 *
 * Source path under test:
 *   quote-4 GP-prime sum 2684 = 20*133 + 24
 *   3301                   = 24*133 + 109
 *   historical OpenPGP fingerprint bytes begin [109, 133] and are 20 bytes long
 *
 * The hypothesis is deliberately narrow: the 20-byte authenticated fingerprint
 * seeds SHA-1, OpenPGP's native hash in the 2016 signature, with source-selected
 * counter start 24. Four ordinary counter serializations and one iterated-SHA1
 * control are tested. After taking non-zero GP29 ciphertext differences into
 * the multiplicative group via log_15, an arbitrary secret permutation of the
 * 28 non-EA plaintext runes is allowed. Its unigram IoC is permutation-invariant,
 * so a true key should restore a non-uniform plaintext histogram on heldout data.
 *
 * Node.js 22 CommonJS. No external packages or network.
 */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const text=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
const MOD=29,RADIX=28,TRAIN=300,HOLD=300,MAXKEY=14000;
const FPR=Buffer.from('6D854CD7933322A601C3286D181F01E57A35090F','hex');
assert.equal(FPR.length,20);
assert.equal(FPR[0],109);
assert.equal(FPR[1],133);
assert.equal(Math.floor(2684/133),20);
assert.equal(2684%133,24);
assert.equal(Math.floor(3301/133),24);
assert.equal(3301%133,109);

const lengths=[729,1145,1738,1894,1021,1433,1680,3316];
const pages=data.pages.filter(p=>p.page<=55&&p.indices.length);
const flat=pages.flatMap(p=>p.indices);
assert.equal(flat.length,12956);
let off=0;
const sections=lengths.map(n=>{const s=flat.slice(off,off+n);off+=n;return s;});
assert.equal(off,flat.length);

const exp=[],log=new Int16Array(MOD).fill(-1);
for(let i=0,v=1;i<RADIX;i++,v=v*15%MOD){assert.equal(log[v],-1);exp.push(v);log[v]=i;}
assert.equal(exp.length,RADIX);

/** @param {number} n */
const mod28=n=>(n%RADIX+RADIX)%RADIX;

/** @param {Buffer} seed @param {number} counter @param {'be'|'le'} endian */
function counterBytes(seed,counter,endian,prefix){
  const c=Buffer.alloc(4);
  if(endian==='be')c.writeUInt32BE(counter>>>0,0);
  else c.writeUInt32LE(counter>>>0,0);
  return crypto.createHash('sha1').update(prefix?c:seed).update(prefix?seed:c).digest();
}

/**
 * @param {Buffer} seed
 * @param {{kind:string,start?:number,endian?:'be'|'le',prefix?:boolean}} spec
 * @param {'mod'|'scale'|'reject'} reducer
 */
function stream(seed,spec,reducer){
  const out=new Uint8Array(MAXKEY);
  let j=0,counter=spec.start??0,state=Buffer.from(seed);
  while(j<out.length){
    let block;
    if(spec.kind==='iter'){
      state=crypto.createHash('sha1').update(state).digest();
      block=state;
    }else{
      block=counterBytes(seed,counter++,spec.endian,spec.prefix);
    }
    for(const b of block){
      if(reducer==='reject'&&b>=252)continue;
      out[j++]=reducer==='scale'?Math.floor(RADIX*b/256):b%RADIX;
      if(j===out.length)break;
    }
  }
  return out;
}

const generators=[
  {name:'iter-sha1',kind:'iter'},
  ...[24,0].flatMap(start=>[
    {name:'suffix-be-'+start,kind:'ctr',start,endian:'be',prefix:false},
    {name:'prefix-be-'+start,kind:'ctr',start,endian:'be',prefix:true},
    {name:'suffix-le-'+start,kind:'ctr',start,endian:'le',prefix:false},
    {name:'prefix-le-'+start,kind:'ctr',start,endian:'le',prefix:true},
  ])
];
const reducers=['mod','scale','reject'];
const zeroClocks=['skip-zero','consume-zero'];
const resets=['section','global'];
const signs=[-1,1];

/**
 * @param {number[][]} input
 * @param {'skip-zero'|'consume-zero'} zeroClock
 */
function observations(input,zeroClock){
  let globalBase=0;
  return input.map(section=>{
    const records=[];let local=0;
    for(let i=1;i<section.length;i++){
      const d=(section[i]-section[i-1]+MOD)%MOD;
      if(d!==0)records.push({x:log[d],local,global:globalBase+local});
      if(d!==0||zeroClock==='consume-zero')local++;
    }
    globalBase+=local;
    return records;
  });
}

/** @param {number[]} a */
function ioc(a){
  const h=new Uint32Array(RADIX);
  for(const x of a)h[x]++;
  let pairs=0;for(const n of h)pairs+=n*(n-1);
  return pairs/(a.length*(a.length-1));
}

/**
 * @param {ReturnType<typeof observations>} obs
 * @param {Uint8Array} key
 * @param {number} sign
 * @param {'section'|'global'} reset
 * @param {number} from
 * @param {number} to
 */
function corrected(obs,key,sign,reset,from,to){
  const bySection=[];
  for(const records of obs){
    const vals=[];
    for(let i=from;i<Math.min(to,records.length);i++){
      const r=records[i],ki=reset==='section'?r.local:r.global;
      vals.push(mod28(r.x+sign*key[ki]));
    }
    bySection.push(vals);
  }
  return bySection;
}

/** @param {number[][]} xs */
function meanSectionIoc(xs){
  return xs.reduce((s,x)=>s+ioc(x),0)/xs.length;
}

/** @param {Buffer} seed */
function attack(seed,input=sections){
  const models=[];
  for(const zeroClock of zeroClocks){
    const obs=observations(input,zeroClock);
    assert.ok(obs.every(x=>x.length>=TRAIN+HOLD));
    for(const gen of generators)for(const reducer of reducers){
      const key=stream(seed,gen,reducer);
      for(const reset of resets)for(const sign of signs){
        const train=corrected(obs,key,sign,reset,0,TRAIN);
        const hold=corrected(obs,key,sign,reset,TRAIN,TRAIN+HOLD);
        const tail=corrected(obs,key,sign,reset,TRAIN+HOLD,Number.MAX_SAFE_INTEGER);
        const tailFlat=tail.flat();
        models.push({
          generator:gen.name,reducer,zeroClock,reset,sign,
          trainMean:meanSectionIoc(train),
          trainPooled:ioc(train.flat()),
          heldoutMean:meanSectionIoc(hold),
          heldoutPooled:ioc(hold.flat()),
          tailPooled:tailFlat.length>1?ioc(tailFlat):null,
          tailN:tailFlat.length
        });
      }
    }
  }
  models.sort((a,b)=>b.trainMean-a.trainMean);
  return {champion:models[0],top:models.slice(0,10),models:models.length};
}

/** Deterministic xorshift32. */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** GP tokenize English for the positive control. @param {string} s */
function encode(s){
  const names=data.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  const out=[];
  for(let word of s.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,'CW').replace(/[QK]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');
    for(let i=0;i<word.length;){
      const hit=names.find(x=>word.startsWith(x.t,i));
      assert.ok(hit,'unsupported GP token '+word.slice(i));
      out.push(hit.i);i+=hit.t.length;
    }
  }
  return out;
}

function plant(){
  const source=encode(text);
  assert.ok(source.length>50000);
  const random=rng(0x3301133);
  const sigma=Array.from({length:RADIX},(_,i)=>i);
  for(let i=RADIX-1;i>0;i--){const j=random()%(i+1);[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
  const trueGen=generators.find(x=>x.name==='suffix-be-24');
  const key=stream(FPR,trueGen,'reject');
  let sourceOff=11000;
  const cipher=[];
  for(let s=0;s<lengths.length;s++){
    const p=source.slice(sourceOff,sourceOff+lengths[s]);sourceOff+=lengths[s];
    const c=[(7*s+3)%MOD];let ptr=0;
    for(let i=1;i<p.length;i++){
      if(p[i]===28)c.push(c[i-1]);
      else{
        const e=mod28(sigma[p[i]]-key[ptr++]);
        c.push((c[i-1]+exp[e])%MOD);
      }
    }
    cipher.push(c);
  }
  const fitted=attack(FPR,cipher);
  const win=fitted.champion;
  assert.equal(win.generator,'suffix-be-24');
  assert.equal(win.reducer,'reject');
  assert.equal(win.zeroClock,'skip-zero');
  assert.equal(win.reset,'section');
  assert.equal(win.sign,1);
  assert.ok(win.heldoutPooled>0.05,'positive control must restore non-uniform plaintext IoC');
  return {chosen:win,candidateCount:fitted.models};
}

function shuffledFingerprint(random){
  const a=Array.from(FPR);
  for(let i=a.length-1;i>0;i--){const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return Buffer.from(a);
}

function main(){
  const actual=attack(FPR);
  const positive=plant();
  const trials=Number(process.env.PGP_CHAIN_NULLS||50);
  assert.ok(Number.isInteger(trials)&&trials>=0&&trials<=500);
  const random=rng(0x6d854cd7);
  const nulls=[];
  for(let i=0;i<trials;i++)nulls.push(attack(shuffledFingerprint(random)).champion);
  const hold=actual.champion.heldoutPooled;
  const tail=actual.champion.tailPooled;
  const holdEx=nulls.filter(x=>x.heldoutPooled>=hold).length;
  const tailEx=nulls.filter(x=>x.tailPooled>=tail).length;
  console.log(JSON.stringify({
    hypothesis:'20-byte authenticated Cicada OpenPGP fingerprint -> SHA1 stream -> GP28 multiplicative chain, arbitrary secret 28-rune permutation',
    sourceArithmetic:{
      quote4:'2684 = 20*133 + 24',
      cicada:'3301 = 24*133 + 109',
      fingerprintPrefixBytes:[FPR[0],FPR[1]],
      fingerprintLength:FPR.length,
      path:[20,24,109,133]
    },
    family:{
      generators:generators.map(x=>x.name),reducers,zeroClocks,resets,signs,
      candidateCount:actual.models,
      trainNonzeroPerSection:TRAIN,heldoutNonzeroPerSection:HOLD,
      selection:'maximize mean per-section GP28 IoC on train only',
      test:'frozen champion heldout pooled IoC and remaining-tail pooled IoC'
    },
    original:{champion:actual.champion,top:actual.top},
    null:{
      trials,seed:'0x6d854cd7',fingerprintBytePermutation:true,
      heldoutAtLeastOriginal:holdEx,heldoutAddOneP:(holdEx+1)/(trials+1),
      tailAtLeastOriginal:tailEx,tailAddOneP:(tailEx+1)/(trials+1),
      heldoutRange:nulls.length?[Math.min(...nulls.map(x=>x.heldoutPooled)),Math.max(...nulls.map(x=>x.heldoutPooled))]:[],
      tailRange:nulls.length?[Math.min(...nulls.map(x=>x.tailPooled)),Math.max(...nulls.map(x=>x.tailPooled))]:[]
    },
    positiveControl:positive,
    interpretation:'A source-selected key should restore non-uniform GP28 plaintext frequencies despite an unknown alphabet permutation. Failure leaves other KDFs, registers, marker semantics, or non-chain architectures open.'
  },null,2));
}
if(require.main===module)main();
module.exports={attack,stream,observations,plant};
