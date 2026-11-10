"use strict";
/**
 * Four historical 256-byte artifacts as candidate LP2 section-key material.
 *
 * Three 2013 hidden-service byte strings are stored in
 * resources/cicada-hiddenservice-256-candidates.json. The fourth, observed
 * alongside them in the public source, is the 256-byte LP2 base-60 grid.
 *
 * Frozen hypothesis: form each of the 15 nonempty XOR subsets of four arrays.
 * For each, take either eight vertical 32-byte columns or eight consecutive
 * 32-byte blocks as AES-256-CTR/ChaCha20 source keys. Fit eight manuscript
 * sections on 300 runes each, with globally shared algorithm, key reversal,
 * byte-to-GP reduction and sign. Each section chooses one key independently.
 * Freeze the 16-way model and all eight keys. Check next 300 untouched runes.
 *
 * A new native-GP-English positive plant chooses distinct genuine subset keys
 * and applies 81%-probability no-doublet rewrites. The entire search must
 * recover the planted key family and all eight source keys. Matched nulls
 * shuffle each 256-byte original input separately and refit all keys/models.
 *
 * This tests a constrained source-to-key mechanism, not the separate claim
 * that the four source byte strings actually form a secret-sharing system.
 *
 * Run: node sims/onion256_grid_xor_source_inverse.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {cipherBytes,correctedGridColumns,inputs}=
  require("./grid_section_column_keys.cjs");
const {encode}=require("./grid_keyskip_viterbi.cjs");
const {seededRandom}=require("./outer_permutation_assignment.cjs");

const ROOT=path.join(__dirname,"..");
const TRAIN=300,HOLD=300,THIRD=300,WIDTH=TRAIN+HOLD+THIRD,N=29,SHUFFLES=100;
const mod=x=>(x%N+N)%N;
const textRead=name=>fs.readFileSync(path.join(ROOT,name),"utf8");

/** @returns {number[][]} Four 256-byte arrays, with optional corrected grid. */
function sourceArrays(corrected=true){
  const src=JSON.parse(textRead("resources/cicada-hiddenservice-256-candidates.json"));
  assert.equal(src.sourceServices.length,3);
  const sources=src.sourceServices.map(x=>{
    assert.match(x.hex,/^[0-9a-f]{512}$/);
    return Array.from(Buffer.from(x.hex,"hex"));
  });
  const grid=JSON.parse(textRead("resources/liber-primus/base60-grid.json"));
  const original=grid.byte_rows.flat();
  assert.equal(original.length,256);
  assert.deepEqual([original[45],original[50],original[165],
    original[172],original[246]],[107,47,18,148,198]);
  const last=corrected
    ?Array.from({length:256},(_,i)=>{
      const col=i%8,row=Math.floor(i/8);
      return correctedGridColumns(
        Array.from({length:8},(_,j)=>grid.byte_rows.map(r=>r[j]))
      )[col][row];
    })
    :original;
  sources.push(last);
  return sources;
}

/**
 * Testable exact source-derived 32-byte keys, two geometry conventions.
 * @param {number[][]} sources
 * @returns {{mask:number,layout:string,slot:number,key:number[]}[]}
 */
function candidates(sources){
  assert.equal(sources.length,4);
  const all=[],seen=new Set();
  for(let mask=1;mask<16;mask++){
    const combined=Array.from({length:256},(_,j)=>
      sources.reduce((v,x,k)=>v^((mask>>k)&1 ? x[j]:0),0));
    for(const layout of ["column","block"])for(let slot=0;slot<8;slot++){
      const key=layout==="column"
        ?Array.from({length:32},(_,i)=>combined[i*8+slot])
        :combined.slice(slot*32,(slot+1)*32);
      assert.equal(key.length,32);
      const id=Buffer.from(key).toString("hex");
      assert.ok(!seen.has(id),"unexpected duplicate source key");
      seen.add(id);
      all.push({mask,layout,slot,key});
    }
  }
  assert.equal(all.length,240);
  return all;
}

/** @param {number[][]} groups */
function ciphertextChunks(groups){
  assert.equal(groups.length,8);
  return groups.map(g=>{
    assert.ok(g.length>=TRAIN+HOLD);
    return [g.slice(0,TRAIN),g.slice(TRAIN,TRAIN+HOLD)];
  });
}

/** @param {{key:number[]}[]} pool */
function streams(pool){
  const table={};
  for(const algorithm of ["aes-256-ctr","chacha20"])
    for(const reverse of [false,true]){
      const label=`${algorithm}:${reverse?"rev":"fwd"}`;
      table[label]=pool.map(({key})=>cipherBytes(
        reverse?key.slice().reverse():key,
        algorithm,WIDTH
      ));
    }
  return table;
}

/**
 * Fixed candidate set, global cipher-mode fit, arbitrary per-section keys.
 * @param {number[][]} groups
 * @param {{key:number[]}[]} pool
 */
function invert(groups,pool){
  const obs=ciphertextChunks(groups);
  const pads=streams(pool);
  let overall=null;
  for(const algorithm of ["aes-256-ctr","chacha20"])
    for(const reverse of [false,true]){
      const sameMode=pads[`${algorithm}:${reverse?"rev":"fwd"}`];
      for(const scaled of [false,true])
        for(const sign of [-1,1]){
          let total=0;
          const chosen=[],train=[],held=[],third=[];
          for(let s=0;s<8;s++){
            const [c0,c1]=obs[s];
            let best=-1,bi=-1,be=-1;
            for(let ki=0;ki<pool.length;ki++){
              const pad=sameMode[ki],seen=new Uint16Array(N);
              for(let i=0;i<TRAIN;i++){
                const k=scaled?Math.floor(pad[i]*N/256):pad[i]%N;
                seen[mod(c0[i]+sign*k)]++;
              }
              let num=0;
              for(const cnt of seen)num+=cnt*(cnt-1);
              const tr=num/(TRAIN*(TRAIN-1));
              if(tr>best){
                best=tr;bi=ki;
              }
            }
            const testpad=sameMode[bi],test=new Uint16Array(N);
            for(let i=0;i<HOLD;i++){
              const k=scaled?Math.floor(testpad[TRAIN+i]*N/256):testpad[TRAIN+i]%N;
              test[mod(c1[i]+sign*k)]++;
            }
            let num=0;for(const n of test)num+=n*(n-1);
            be=num/(HOLD*(HOLD-1));
            if(s>0){
              const c2=groups[s].slice(TRAIN+HOLD,WIDTH);
              assert.equal(c2.length,THIRD);
              const next=new Uint16Array(N);
              for(let i=0;i<THIRD;i++){
                const k=scaled?Math.floor(testpad[TRAIN+HOLD+i]*N/256):
                  testpad[TRAIN+HOLD+i]%N;
                next[mod(c2[i]+sign*k)]++;
              }
              let pairs=0;for(const n of next)pairs+=n*(n-1);
              third.push(pairs/(THIRD*(THIRD-1)));
            }else third.push(null);
            chosen.push(bi);train.push(best);held.push(be);total+=best;
          }
          if(!overall||total>overall.train*8){
            overall={algorithm,reverse,scaled,sign,chosen,
              train:total/8,held:held.reduce((a,b)=>a+b,0)/8,
              third:third.slice(1).reduce((a,b)=>a+b,0)/7,
              sectionTrain:train,sectionHeld:held,sectionThird:third};
          }
        }
    }
  return {...overall,keys:overall.chosen.map(i=>{
    const {mask,layout,slot}=pool[i];return {mask,layout,slot};
  })};
}

/** @param {number[][]} sources */
function planted(sources){
  const pool=candidates(sources);
  const choose=[
    [1,"column",0],[2,"block",1],[4,"column",2],[8,"block",3],
    [7,"column",4],[11,"block",5],[13,"column",6],[15,"block",7]
  ];
  const indices=choose.map(([mask,layout,slot])=>{
    const at=pool.findIndex(p=>p.mask===mask&&p.layout===layout&&p.slot===slot);
    assert.ok(at>=0);return at;
  });
  const known=encode(textRead("resources/control/shakespeare_first300k.txt"));
  const rng=seededRandom(0x3301a951);
  let offset=0,rewrites=0;
  const fake=[];
  for(let s=0;s<8;s++){
    const pad=cipherBytes(pool[indices[s]].key,"aes-256-ctr",WIDTH);
    const p=known.slice(offset,offset+WIDTH);
    assert.equal(p.length,WIDTH);
    const ct=p.map((v,i)=>mod(v+pad[i]%N));
    for(let i=1;i<ct.length;i++)
      if(ct[i]===ct[i-1]&&rng()<.81){
        ct[i]=mod(ct[i]+1+Math.floor(rng()*28));
        rewrites++;
      }
    fake.push(ct);offset+=WIDTH;
  }
  const found=invert(fake,pool);
  const matched=found.chosen.filter((id,i)=>id===indices[i]).length;
  assert.equal(matched,8,"all eight planted source keys must be recovered");
  assert.ok(found.algorithm==="aes-256-ctr"&&!found.reverse&&
    !found.scaled&&found.sign===-1,
    "positive must recover planted cryptographic mode");
  assert.ok(found.held>0.045&&found.third>0.045,"planted independent continuations must be English-like");
  return {sourceKeysRecovered:matched,modeRecovered:true,rewrites,
    fitted:found.train,held:found.held,third:found.third,keys:found.keys};
}

/** @param {number[][]} sources @param {()=>number} rng */
function shuffleSources(sources,rng){
  return sources.map(arr=>{
    const b=arr.slice();
    for(let i=b.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [b[i],b[j]]=[b[j],b[i]];
    }
    return b;
  });
}

function main(){
  const {groups}=inputs();
  const actualArrays=sourceArrays(true);
  const native=planted(actualArrays);
  const actual=invert(groups,candidates(actualArrays));
  const prior=invert(groups,candidates(sourceArrays(false)));
  const rng=seededRandom(0x3301eed5);
  const nullHeld=[],nullTrain=[],nullThird=[];
  for(let i=0;i<SHUFFLES;i++){
    const controls=shuffleSources(actualArrays,rng);
    const row=invert(groups,candidates(controls));
    nullHeld.push(row.held);nullTrain.push(row.train);nullThird.push(row.third);
  }
  const outrank=nullHeld.filter(x=>x>=actual.held).length;
  const thirdOutrank=nullThird.filter(x=>x>=actual.third).length;
  const jointOutrank=nullThird.filter((x,i)=>
    x>=actual.third&&nullHeld[i]>=actual.held).length;
  console.log(JSON.stringify({
    hypothesis:"15 XOR subsets of 4 historical 256B sources, 240 AES/ChaCha section keys",
    sources:["onion2","onion3","onion4","LP2 numerical grid"],
    sourceVariants:"five-cell corrected LP2 grid; canonical alternative",
    search:{families:16,candidateKeysPerFamily:240,sections:8,
      trainingRunes:8*TRAIN,heldoutRunes:8*HOLD,thirdBlockRunes:7*THIRD},
    positive:native,
    authenticCorrected:actual,
    authenticCanonical:{train:prior.train,held:prior.held,mode:{
      algorithm:prior.algorithm,reverse:prior.reverse,scaled:prior.scaled,sign:prior.sign
    },keys:prior.keys},
    matchedNull:{shuffles:SHUFFLES,
      trainMean:nullTrain.reduce((a,b)=>a+b,0)/SHUFFLES,
      heldMean:nullHeld.reduce((a,b)=>a+b,0)/SHUFFLES,
      thirdMean:nullThird.reduce((a,b)=>a+b,0)/SHUFFLES,
      thirdMin:Math.min(...nullThird),thirdMax:Math.max(...nullThird),
      thirdOutrank,thirdUpperTail:(thirdOutrank+1)/(SHUFFLES+1),
      jointlyOutrank:jointOutrank,jointUpperTail:(jointOutrank+1)/(SHUFFLES+1),
      heldMax:Math.max(...nullHeld),heldMin:Math.min(...nullHeld),
      outrank,empiricalUpperTail:(outrank+1)/(SHUFFLES+1)},
    outputRestriction:"no authentic plaintext is claimed unless heldout statistics and direct rune reading actually warrant it"
  },null,2));
}

if(require.main===module)main();
module.exports={sourceArrays,candidates,invert,planted,main};
