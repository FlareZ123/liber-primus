'use strict';
/**
 * The red title GP quotient 22 identifies prime_22 =79. In F29,
 * g=79 mod 29 =21 is a primitive root (order28), suggesting a
 * fully specified nonzero cyclic stream g^i (mod29). Test additive
 * and multiplicative inversion, with 28 phase options, 2 signs,
 * optional atbash, literal-F preservation and page reset.
 *
 * Fit original LP2 p16..18, freeze and score p19..22.
 * Use GP-encoded source-language positive controls.
 * Node22 CommonJS: node sims/red_prime79_field_cycle.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encode}=require('./affine_echo_literary_control.cjs');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(
  path.join(ROOT,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const train=corpus.pages.filter(p=>p.page>=16&&p.page<=18);
const hold=corpus.pages.filter(p=>p.page>=19&&p.page<=22);
const mod=x=>(x%29+29)%29;
function inverse(x) {for(let i=1;i<29;i++)if(mod(x*i)===1)return i;throw Error('field zero');}
function powers() {
  const title=ink.pages.find(p=>p.page===15).red_spans.find(s=>s.start===0&&s.length===9);
  const indices=[...title.runes].map(r=>corpus.runes.indexOf(r));
  const total=indices.reduce((v,i)=>v+corpus.prime[i],0);
  assert.equal(total,638);
  const q=total/29;
  assert.equal(q,22);
  const primes=[];
  for(let n=2;primes.length<q;n++){
    let p=true;
    for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break;}
    if(p)primes.push(n);
  }
  assert.equal(primes[q-1],79);
  const gen=primes[q-1]%29;
  assert.equal(gen,21);
  const vals=[],set=new Set();
  for(let i=0,x=1;i<28;i++,x=mod(x*gen)){vals.push(x);set.add(x);}
  assert.equal(set.size,28);
  assert.equal(mod(vals.at(-1)*gen),1);
  return {prime:79,generator:gen,values:vals};
}
function transform(groups,stream,config,encrypt=false){
  let clock=0;
  const out=[];
  for(const row of groups){
    if(config.reset)clock=0;
    const a=[];
    for(const x of row){
      const k=stream[(clock+config.phase)%28];
      let val;
      if(config.skip&&x===0&&!encrypt) val=0;
      else if(!encrypt) {
        const carrier=config.flip?28-x:x;
        val=config.operation==='add'?mod(carrier-config.sign*k):
          mod(carrier*inverse(mod(config.sign*k)));
      } else {
        const carrier=config.operation==='add'?mod(x+config.sign*k):
          mod(x*config.sign*k);
        val=config.flip?28-carrier:carrier;
      }
      a.push(val);
      if(!(config.skip&&x===0&&!encrypt))clock++;
    }
    out.push(a);
  }
  return out;
}
function ioc(groups){
  const freq=new Uint32Array(29);
  let n=0;
  for(const row of groups)for(const x of row){freq[x]++;n++;}
  return freq.reduce((z,x)=>z+x*(x-1),0)/(n*(n-1));
}
function plant(stream){
  const source=fs.readFileSync(
    path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const english=(source.match(/[A-Za-z]+/g)||[]).flatMap(w=>encode(w));
  const lens=[...train,...hold].map(p=>p.indices.length);
  let at=0;
  const plain=lens.map(n=>{const x=english.slice(at,at+n);at+=n;return x;});
  assert.equal(at,1744);
  const controls=[];
  for(const operation of ['add','multiply']){
    const config={operation,phase:11,sign:-1,flip:true,skip:false,reset:true};
    const c=transform(plain,stream,config,true);
    const p=transform(c,stream,config);
    assert.deepEqual(p,plain);
    controls.push({operation,roundtrip:true,sourceIoC:ioc(plain),recoveredIoC:ioc(p)});
  }
  return controls;
}
function run(){
  const source=powers();
  const options=[];
  for(const operation of ['add','multiply'])
    for(let phase=0;phase<28;phase++)
      for(const sign of [-1,1])
        for(const flip of[false,true])
          for(const skip of [false,true])
            for(const reset of[false,true]){
              const config={operation,phase,sign,flip,skip,reset};
              const trainIoC=ioc(transform(train.map(p=>p.indices),source.values,config));
              options.push({...config,trainIoC});
            }
  assert.equal(options.length,896);
  options.sort((a,b)=>b.trainIoC-a.trainIoC);
  const top=options.slice(0,5).map(x=>({...x,
    heldoutIoC:ioc(transform(hold.map(p=>p.indices),source.values,x))}));
  assert.ok(top[0].trainIoC<0.05);
  assert.ok(top[0].heldoutIoC<0.05);
  const result={
    source:{redTitlePrimeSum:638,q:22,selectedPrime:source.prime,
      generatorModulo29:source.generator,multiplicativeOrder:source.values.length},
    trainPages:[16,17,18],holdoutPages:[19,20,21,22],
    targetTrainRunes:800,targetHoldoutRunes:944,
    models:options.length,bestFive:top,topHeldoutIoC:top[0].heldoutIoC,
    nullUniformIoC:1/29,positive:plant(source.values),
    outcome:'No source-derived prime79 28-cycle additive or multiplicative key recovers GP-English-like ciphertext on the independently held-out pages.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={powers,transform,ioc,plant,run};
