'use strict';
/**
 * Original cuneiform 1033/3301 quartic-character homophonic receiver.
 * Node 22 / Windows 11 / CommonJS, one read-only self-contained SFT.
 * Tests 1033, 3301 individually as 2-bit generators and both jointly
 * as 4-bit hexadecimal/ASCII carrier on the source-marked 1589-rune
 * chapter, the red-numbered five-piece 553-rune enclosure, and the
 * complete 12956 original unknown rune corpus.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const book=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const gpPrime=[
  2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,
  67,71,73,79,83,89,97,101,103,107,109
];
assert.equal(gpPrime.length,29);
const at=n=>book.pages.find(p=>p.page===n).indices;
const whole=book.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>p.indices);
const section=book.pages.filter(p=>p.page>=33&&p.page<=39)
  .map((p,i)=>i===0?p.indices.slice(91):p.indices);
const five=[
  at(36).slice(99,238),at(37).slice(0,91),at(37).slice(91,189),
  at(37).slice(189,228).concat(at(38).slice(0,57)),
  at(38).slice(57,186)
];
assert.deepEqual([whole.length,whole.flat().length,section.flat().length,
  five.flat().length],[55,12956,1589,553]);
assert.deepEqual(five.map(x=>x.length),[139,91,98,96,129]);

/** @param {number} a @param {number} e @param {number} p */
function pow(a,e,p){
  let result=1;
  while(e){if(e%2)result=result*a%p;a=a*a%p;e=Math.floor(e/2);}
  return result;
}
const moduli=[1033,3301];
const roots=moduli.map(p=>{
  for(let r=2;r<p;r++)if(r*r%p===p-1)return r;
  throw Error('source modulus is not 1 modulo 4 prime');
});
assert.deepEqual(roots,[355,1212]);
// χ4(q)=q^((p−1)/4) modp ∈ {1,i,−1,−i}; i=min sqrt(−1).
const quartic=moduli.map((p,j)=>{
  const r=roots[j],values=[1,r,p-1,p-r];
  return gpPrime.map(q=>{
    const v=values.indexOf(pow(q,(p-1)/4,p));
    assert(v>=0);
    return v;
  });
});
const classes=quartic[0].map((v,i)=>4*v+quartic[1][i]);
const classSize=Array(16).fill(0);
for(const c of classes)classSize[c]++;
assert.deepEqual(classSize,[0,2,0,1,0,1,2,2,1,4,3,1,4,3,5,0]);
const reachable=classSize.filter(n=>n>0).length;
assert.equal(reachable,12);
console.log('SOURCE primes=1033/3301 least sqrt(−1)='+JSON.stringify(roots));
console.log('SOURCE 29 rune quartic pair nibble class support='+
  JSON.stringify(classSize)+'; 12/16 populated, 0,2,4,15 absent');

const sourceP57=at(57).map(i=>book.translit[i]).join('');
assert.equal(sourceP57.length,100);
const lowNibble=[...new Set(
  [...sourceP57].map(letter=>letter.charCodeAt(0)&15))].sort((a,b)=>a-b);
assert.deepEqual(lowNibble,[0,1,2,3,4,5,6,7,8,9,12,13,14,15]);
assert(lowNibble.length>reachable);
console.log('SOURCE NATIVE GP p57 100 Latin letters need '+
  lowNibble.length+' distinct low ASCII nibble values; fixed pair-class capacity='+reachable);

/**
 * Simple period-available rotated/reflected quartic class assignment:
 * 4-way Q-class q∈0..3 transformed to ±q+offset (mod4).
 * @param {number} cls @param {-1|1} sign @param {number} offset
 */
function adjust(cls,sign,offset){return ((sign*cls+offset)%4+4)%4;}

/**
 * Pack Q4 digits (4/rune byte) or paired Q4 digits (2/rune byte).
 * @param {number[][]} chunks
 * @param {'1033'|'3301'|'joint'} mode
 * @param {'global'|'unit'} clock
 * @param {-1|1} signA @param {number} offsetA
 * @param {-1|1} signB @param {number} offsetB
 * @param {number} swap @param {number} byteDir
 * @param {number} phase
 * @returns {number[]}
 */
function decode(chunks,mode,clock,signA,offsetA,signB,offsetB,swap,byteDir,phase){
  const native=chunks.map(chunk=>chunk.map(r=>{
    const a=adjust(quartic[0][r],signA,offsetA);
    const b=adjust(quartic[1][r],signB,offsetB);
    if(mode==='1033')return a;
    if(mode==='3301')return b;
    return swap?4*b+a:4*a+b;
  }));
  const streams=clock==='global'?[native.flat()]:native;
  return streams.flatMap(stream=>{
    const bytes=[],radix=mode==='joint'?16:4,group=mode==='joint'?2:4;
    for(let i=phase;i+group-1<stream.length;i+=group){
      let num=0;
      for(let j=0;j<group;j++){
        if(byteDir===0)num=num*radix+stream[i+j];
        else num+=stream[i+j]*radix**j;
      }
      assert(num>=0&&num<=255);
      bytes.push(num);
    }
    return bytes;
  });
}

/** @param {number[]} bytes */
function score(bytes){
  let printable=0,run=0,longest=0;
  for(const b of bytes){
    if(b>=32&&b<=126){printable++;run++;longest=Math.max(longest,run);}
    else run=0;
  }
  return {n:bytes.length,printable,ratio:printable/bytes.length,longest,
    head:Buffer.from(bytes.slice(0,16)).toString('hex')};
}
/** @param {string} name @param {number[][]} chunks */
function audit(name,chunks){
  const occ=quartic.map(q=>{
    const counts=Array(4).fill(0);
    for(const r of chunks.flat())counts[q[r]]++;
    return counts;
  });
  console.log('ORIGINAL '+name+' quartic 1033/3301 count='+
    JSON.stringify(occ));
  let bestRatio={ratio:-1},bestRun={longest:-1},tested=0,headerHits=0;
  const magic=['425a68','1f8b08','504b0304','89504e470d0a1a0a','255044462d'];
  for(const mode of ['1033','3301','joint']){
    const signs=mode==='3301'?[1]:[-1,1];
    const offsetValues=mode==='3301'?[0]:[0,1,2,3];
    const bSigns=mode==='joint'?[-1,1]:mode==='3301'?[-1,1]:[1];
    const bOffsets=mode==='joint'||mode==='3301'?[0,1,2,3]:[0];
    for(const signA of signs)for(const offsetA of offsetValues){
      for(const signB of bSigns)for(const offsetB of bOffsets){
        for(const swap of mode==='joint'?[0,1]:[0]){
          for(const clock of ['global','unit'])for(const byteDir of [0,1]){
            for(let phase=0;phase<(mode==='joint'?2:4);phase++){
              const bytes=decode(chunks,mode,clock,signA,offsetA,
                signB,offsetB,swap,byteDir,phase);
              const trial={name,mode,clock,signA,offsetA,
                signB,offsetB,swap,byteDir,phase,...score(bytes)};
              if(trial.ratio>bestRatio.ratio)bestRatio=trial;
              if(trial.longest>bestRun.longest)bestRun=trial;
              if(magic.some(h=>trial.head.startsWith(h)))headerHits++;
              tested++;
            }
          }
        }
      }
    }
  }
  assert.equal(tested,1280,'two 2-bit quartic branches plus joint 4-bit branch');
  assert(bestRatio.ratio<0.78&&bestRun.longest<40);
  assert.equal(headerHits,0,'source-aligned 2014 standard file header');
  console.log('ORIGINAL '+name+' source-fixed candidates='+tested+
    ', standard BZip2/Gzip/ZIP/PNG/PDF starts=0');
  console.log('MAX printable '+JSON.stringify(bestRatio));
  console.log('MAX contiguous printable '+JSON.stringify(bestRun));
}

audit('cuneiform-p33-39',section);
audit('five-numbered',five);
audit('all-unknown',whole);

// Full-sized genuine-source positive test of the *single modulus* 4-class
// carrier. Encode actual p57 solved wording as readable ASCII, repeating it
// to 3239 bytes. The deterministic homophone chooser avoids adjacent glyphs.
const message=Buffer.from(sourceP57.repeat(50).slice(0,3239),'ascii');
assert.equal(message.length,3239);
const groups=Array.from({length:4},()=>[]);
for(let r=0;r<29;r++)groups[quartic[0][r]].push(r);
const cover=[];
for(const octet of message){
  for(let shift=6;shift>=0;shift-=2){
    const target=(octet>>>shift)&3,available=groups[target];
    let chosen=available[cover.length%available.length];
    if(cover.length&&chosen===cover[cover.length-1])
      chosen=available[(cover.length+1)%available.length];
    assert.notEqual(chosen,cover[cover.length-1]);
    cover.push(chosen);
  }
}
assert.equal(cover.length,12956);
const recovered=Buffer.from(decode([cover],'1033','global',1,0,1,0,0,0,0));
assert.deepEqual(recovered,message);
console.log('POSITIVE direct quartic1033: 3239/3239 native solved-wording ASCII bytes exact; 12956 covering runes');
console.log('PASS original 3840 cuneiform quartic-code variants and all-secret 12/16 nibble capacity');
console.log('RESULT no native-source unknown plaintext or source-authorized cipher operator');
