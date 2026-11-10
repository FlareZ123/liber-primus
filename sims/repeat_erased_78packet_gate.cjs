'use strict';
/**
 * Original-LP2 repeat-erased phi(79)=78 packet transport gate.
 *
 * Test 77 base29 plaintext digits -> 78 base28 ciphertext digits via
 * a predecessor-excluding output walk, with repeated original ciphertext
 * runes treated as nonconsuming escape markers. Unknown globally FIXED
 * cyclic or sorted 29-rune order is admitted. This is an exact necessary
 * numeric-capacity test, not an attempted decipherment.
 *
 * Original input: resources/liber-primus/lp2-corpus.json.
 * Run: node sims/repeat_erased_78packet_gate.cjs
 * No npm dependencies; no CI workflow required.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ALPHABET = 29;
const PLAIN = 77;
const CIPHER = 78;
const LEADING_DISTANCE = 15;
const FULL = (1 << ALPHABET) - 1;
const FORWARD = Array.from({length:29},(_,a)=>{
  let n=0;
  for(let j=1;j<=LEADING_DISTANCE;j++)n|=1<<((a+j)%29);
  return n;
});
const BACKWARD = Array.from({length:29},(_,a)=>{
  let n=0;
  for(let j=1;j<=LEADING_DISTANCE;j++)n|=1<<((a-j+29)%29);
  return n;
});

/** @param {number} mask */
function count(mask) {
  let n=0;
  while(mask){mask&=mask-1;n++;}
  return n;
}

/** @param {number} mask */
function* bits(mask) {
  while(mask){
    const b=mask&-mask;
    yield 31-Math.clz32(b);
    mask-=b;
  }
}

/**
 * Prove necessary first-digit compatibility under ANY FIXED cyclic
 * permutation of all 29 glyphs. Global rotation is fixed by pi(0)=0.
 * A capped search is explicitly UNKNOWN, never UNSAT.
 *
 * @param {number[][]} pairs Directed observed (previous,current) pairs.
 * @param {number} limit
 */
function gate(pairs, limit=100000) {
  const edges=[...new Set(pairs.map(x=>x.join(',')))]
    .map(x=>x.split(',').map(Number));
  const degree=Array(29).fill(0);
  for(const [a,b] of edges){degree[a]++;degree[b]++;}
  let visited=0,cap=false;
  /** @param {number[]} d */
  function propagate(d) {
    let changed=true;
    while(changed){
      changed=false;
      let singleton=0;
      for(const x of d) {
        if(!x || (count(x)===1 && (singleton&x)))return null;
        if(count(x)===1)singleton|=x;
      }
      for(let i=0;i<29;i++)if(count(d[i])>1){
        const y=d[i]&~singleton;
        if(!y)return null;
        if(y!==d[i]){d[i]=y;changed=true;}
      }
      for(const [a,b] of edges){
        let x=0,y=0;
        for(const v of bits(d[a]))if(FORWARD[v]&d[b])x|=1<<v;
        if(!x)return null;
        for(const v of bits(d[b]))if(BACKWARD[v]&x)y|=1<<v;
        if(!y)return null;
        if(x!==d[a]||y!==d[b]){
          d[a]=x;d[b]=y;changed=true;
        }
      }
    }
    return d;
  }
  /** @param {number[]} d */
  function search(d) {
    if(++visited>limit){cap=true;return null;}
    d=propagate(d);
    if(!d)return null;
    let index=-1,min=30,deg=-1;
    for(let i=0;i<29;i++){
      const k=count(d[i]);
      if(k>1&&(k<min||(k===min&&degree[i]>deg))){
        min=k;deg=degree[i];index=i;
      }
    }
    if(index<0)return d;
    for(const v of bits(d[index])){
      const nd=d.slice();
      nd[index]=1<<v;
      const sol=search(nd);
      if(sol)return sol;
      if(cap)return null;
    }
    return null;
  }
  const start=Array(29).fill(FULL);
  start[0]=1;
  const answer=search(start);
  return {
    status:answer?'SAT':cap?'UNKNOWN':'UNSAT',
    nodes:visited,
    uniqueEdges:edges.length,
    witness:answer?answer.map(x=>[...bits(x)][0]):null
  };
}

/** @param {number[]} cipher Original page-joined ciphertext. */
function observe(cipher) {
  const obs=[],repeat=[];
  for(let i=0;i<cipher.length;i++){
    if(i&&cipher[i]===cipher[i-1]){
      repeat.push(i);
      continue;
    }
    obs.push({prev:i?cipher[i-1]:null,curr:cipher[i]});
  }
  return {obs,repeat};
}

/**
 * @param {{prev:number|null,curr:number}[]} obs
 * @param {number} phase
 * @param {boolean} reverse
 */
function* packetEdges(obs,phase,reverse) {
  for(let j=phase;j+CIPHER<=obs.length;j+=CIPHER){
    const edge=obs[j+(reverse?CIPHER-1:0)];
    if(edge.prev!==null)yield [edge.prev,edge.curr];
  }
}

/** @param {number} seed */
function rng(seed) {
  let s=seed>>>0;
  return ()=>{
    s^=s<<13;
    s^=s>>>17;
    s^=s<<5;
    return s>>>0;
  };
}

/** Source-native positive with original 86 observed marker coordinates. */
function synthetic(repeatPositions) {
  const next=rng(0x12870f79);
  const permutation=Array.from({length:29},(_,i)=>i);
  for(let i=28;i>=1;i--){
    const j=next()%(i+1);
    [permutation[i],permutation[j]]=[permutation[j],permutation[i]];
  }
  const inverse=Array(29);
  for(let i=0;i<29;i++)inverse[permutation[i]]=i;
  const clean=[],plaintext=[];
  let prev=17;
  for(let k=0;k<165;k++){
    let v=0n;
    const expected=[];
    for(let j=0;j<PLAIN;j++){
      const digit=next()%29;
      expected.push(digit);
      v=v*29n+BigInt(digit);
    }
    const digits=Array(CIPHER).fill(0);
    for(let j=CIPHER-1;j>=0;j--){
      digits[j]=Number(v%28n);
      v/=28n;
    }
    assert.equal(v,0n);
    for(const digit of digits){
      prev=inverse[(permutation[prev]+digit+1)%29];
      clean.push(prev);
    }
    plaintext.push(expected);
  }
  const repeats=new Set(repeatPositions),cipher=[];
  let ci=0;
  for(let i=0;i<12956;i++){
    if(repeats.has(i))cipher.push(cipher.at(-1));
    else cipher.push(clean[ci++]);
  }
  assert.equal(ci,12870);
  const {obs,repeat}=observe(cipher);
  assert.equal(repeat.length,86);
  assert.equal(obs.length,12870);
  let predecessor=17,decoded=0;
  for(let k=0;k<165;k++){
    let value=0n;
    for(let j=0;j<CIPHER;j++){
      const current=obs[k*CIPHER+j].curr;
      const digit=(permutation[current]-permutation[predecessor]+28)%29;
      value=value*28n+BigInt(digit);
      predecessor=current;
    }
    const output=Array(PLAIN);
    for(let j=PLAIN-1;j>=0;j--){
      output[j]=Number(value%29n);
      value/=29n;
    }
    assert.equal(value,0n);
    assert.deepEqual(output,plaintext[k]);
    decoded+=PLAIN;
  }
  const blind=gate([...packetEdges(obs,0,false)]);
  assert.equal(blind.status,'SAT');
  return {cipherLength:cipher.length,markers:repeat.length,
    plaintextRecovered:decoded,packetCount:165,
    blindGate:blind.status,blindNodes:blind.nodes};
}

/** @param {number[]} C Canonical original 12,956 ciphertext indices. */
function analyze(C) {
  assert.equal(C.length,12956);
  assert(C.every(x=>Number.isInteger(x)&&x>=0&&x<29));
  const {obs,repeat}=observe(C);
  assert.equal(obs.length,12870);
  assert.equal(repeat.length,86);
  assert.equal(obs.length/78,165);
  const max=29n**77n-1n;
  const maxLeading=Number(max/(28n**77n));
  assert.equal(maxLeading,14);
  const cases=[];
  for(let phase=0;phase<78;phase++){
    for(const reverse of [false,true]){
      const edges=[...packetEdges(obs,phase,reverse)];
      const leaders=new Set(edges.map(x=>x[1])).size;
      const result=gate(edges);
      cases.push({phase,reverse,knownPacketLeaders:edges.length,
        distinctLeadingRunes:leaders,
        sortedStatus:leaders>maxLeading+2?'UNSAT':'UNKNOWN',
        cyclicStatus:result.status,solverNodes:result.nodes,
        uniqueEdges:result.uniqueEdges});
    }
  }
  assert(cases.every(x=>x.sortedStatus==='UNSAT'));
  assert(cases.every(x=>x.cyclicStatus==='UNSAT'));
  const positive=synthetic(repeat);
  return {inputRunes:C.length,repeatedRuneEvents:repeat.length,
    deduplicatedCipherDigits:obs.length,
    fullPackets:165,outputWidth:78,inputWidth:77,
    maximumLeadingBase28Digit:maxLeading,
    testedPhases:78,testedDirections:2,totalCases:cases.length,
    sortedCasesUNSAT:cases.filter(x=>x.sortedStatus==='UNSAT').length,
    cyclicCasesUNSAT:cases.filter(x=>x.cyclicStatus==='UNSAT').length,
    largestSearchNodes:Math.max(...cases.map(x=>x.solverNodes)),
    smallestLeadingDistinctCount:Math.min(...cases.map(x=>x.distinctLeadingRunes)),
    phase0:cases.filter(x=>x.phase===0),positive,
    cases,
    conclusion:'Fixed 29-rune sorted or cyclic order 77->78 base-radix packing is excluded under all 78 origins and two directions; source-side repeat deletion assumed. No plaintext or historical key recovered.'};
}


/**
 * Find exact minimum invalid 78-packet first digits over all 8! assignments
 * of eight original 32-byte grid columns to eight original text sections.
 * A grid column defines one cyclic rune order by sorting its first 29 bytes;
 * the remaining three bytes per column are not used. Both 8-section bridge
 * conventions and the separately audited five-cell correction are admitted.
 * @param {number[]} C Original 12,956 GP ciphertext rune labels
 * @param {number[][]} grid Original canonical 32x8 grid byte rows
 */
function gridSectionKeyGate(C,grid) {
  assert.equal(grid.length,32);
  assert(grid.every(row=>row.length===8));
  const raw=grid.flat();
  const corrections={45:81,50:21,165:47,172:174,246:224};
  const byteSources=[raw,raw.map((v,i)=>corrections[i]??v)];
  const layouts=[
    [729,1145,1738,1894,1021,1433,1680,3316],
    [729,1145,1729,1903,1021,1524,1589,3316]
  ];
  const {obs}=observe(C);
  const expanded=[];
  let p=0;
  for(let i=0;i<C.length;i++){
    if(i&&C[i]===C[i-1])continue;
    expanded.push({prev:obs[p].prev,curr:obs[p].curr,site:i});
    p++;
  }
  assert.equal(expanded.length,12870);

  /** @param {number[][]} cost A row/column cost matrix */
  function assign(cost) {
    const n=8,full=(1<<n)-1;
    const dp=Array(1<<n).fill(Infinity);
    const ancestor=Array(1<<n);
    dp[0]=0;
    for(let mask=0;mask<full;mask++){
      let row=0;
      for(let bits=mask;bits;bits&=bits-1)row++;
      for(let col=0;col<8;col++)if(!(mask&(1<<col))){
        const next=mask|(1<<col);
        const total=dp[mask]+cost[row][col];
        if(total<dp[next]){
          dp[next]=total;
          ancestor[next]=[mask,col];
        }
      }
    }
    const selection=Array(n);
    let mask=full;
    for(let row=n-1;row>=0;row--){
      const [prior,col]=ancestor[mask];
      selection[row]=col;
      mask=prior;
    }
    return {invalid:dp[full],assignment:selection};
  }

  const plantedMap=[5,0,7,2,1,6,3,4];
  const plantCost=Array.from({length:8},(_,r)=>
    Array.from({length:8},(_,k)=>k===plantedMap[r]?0:7));
  assert.deepEqual(assign(plantCost),{invalid:0,assignment:plantedMap});

  const results=[];
  for(let g=0;g<2;g++)for(let s=0;s<2;s++){
    const ends=[0];
    for(const len of layouts[s])ends.push(ends.at(-1)+len);
    assert.equal(ends.at(-1),C.length);
    const section=expanded.map(e=>ends.findIndex((z,i)=>
      i<8&&e.site>=z&&e.site<ends[i+1]));
    assert(section.every(i=>i>=0));
    for(const descending of [false,true]){
      const orders=Array.from({length:8},(_,col)=>{
        const sorted=Array.from({length:29},(_,i)=>i);
        sorted.sort((a,b)=>{
          const d=byteSources[g][a*8+col]-byteSources[g][b*8+col];
          return descending ? -d||a-b : d||a-b;
        });
        const rank=Array(29);
        sorted.forEach((r,i)=>{rank[r]=i;});
        return rank;
      });
      for(const reverse of [false,true])for(let phase=0;phase<78;phase++){
        const cost=Array.from({length:8},()=>Array(8).fill(0));
        let known=0;
        for(let j=phase;j+78<=expanded.length;j+=78){
          const i=j+(reverse?77:0),e=expanded[i];
          if(e.prev===null)continue;
          known++;
          for(let col=0;col<8;col++){
            const digit=(orders[col][e.curr]-orders[col][e.prev]+28)%29;
            if(digit>14)cost[section[i]][col]++;
          }
        }
        const best=assign(cost);
        results.push({grid:g,sectionLayout:s,descending,reverse,
          phase,knownLeadingPackets:known,
          ...best,identity:cost.reduce((sum,row,i)=>sum+row[i],0)});
      }
    }
  }
  assert.equal(results.length,1248);
  results.sort((a,b)=>a.invalid-b.invalid);
  assert.equal(results[0].invalid,43);
  assert(results.every(r=>r.invalid>0));
  return {testedConfigs:results.length,
    assignmentsPerConfig:40320,lowestForcedInvalidPackets:results[0].invalid,
    best:results.slice(0,8),sourceKeyPlant:{minimum:0,trueAssignmentRecovered:true},
    interpretation:'Eight source-grid-derived, section-variable cyclic rune orders fail the numeric first-digit capacity test under any global 78-packet origin, digit orientation, allowed grid source/section partition and 8! key-column assignment.'};
}

if(require.main===module){
  const filename=path.join(__dirname,'..','resources','liber-primus','lp2-corpus.json');
  const corpus=JSON.parse(fs.readFileSync(filename,'utf8'));
  const source=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  const table=JSON.parse(fs.readFileSync(
    path.join(__dirname,'..','resources','liber-primus','base60-grid.json'),'utf8'));
  const report=analyze(source);
  report.gridSectionKeyGate=gridSectionKeyGate(source,table.byte_rows);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={analyze,observe,packetEdges,gate,synthetic,gridSectionKeyGate};
