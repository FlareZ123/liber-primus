'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const P = 29, PERIOD = 56, RUNES = 12956;
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const json = p => JSON.parse(read(p));
const mod = x => (x % P + P) % P;
const inv = x => {
  assert.notEqual(mod(x),0);
  for(let y=1;y<P;y++) if(mod(x*y)===1) return y;
  throw new Error('no inverse');
};
const mul = (x,y) => {
  const [a,b]=x,[c,d]=y;
  return [mod(a*c+8*b*d),mod(a*d+b*c+3*b*d)];
};
const pow = (x,n) => {
  let z=[1,0];
  while(n){if(n%2)z=mul(z,x);x=mul(x,x);n=Math.floor(n/2);}
  return z;
};
const frob = x => [mod(x[0]+3*x[1]),mod(-x[1])];
const T = x => mul([0,1],frob(x));
const tr = x => mod(2*x[0]+3*x[1]);
const nm = x => mod(x[0]*x[0]+3*x[0]*x[1]+21*x[1]*x[1]);
const spow = (a,n) => {let z=1;while(n){if(n%2)z=mod(z*a);a=mod(a*a);n=Math.floor(n/2);}return z;};

const corpus=json('resources/liber-primus/lp2-corpus.json');
const ink=json('resources/liber-primus/lp2-ink-annotations.json');
const pages=corpus.pages.filter(p=>p.page<=55).sort((a,b)=>a.page-b.page);
const cipher=pages.flatMap(p=>p.indices);
const p54=pages.find(p=>p.page===54), p57=corpus.pages.find(p=>p.page===57);
assert.equal(pages.length,56);
assert.equal(pages.filter(p=>p.indices.length).length,55);
assert.equal(cipher.length,RUNES);
assert.equal(p54.indices[0],24);
const redTriad=page=>ink.pages.find(p=>p.page===page).red_spans
  .filter(s=>s.length===3).map(s=>s.runes.map(r=>corpus.runes.indexOf(r)));
assert.deepEqual(redTriad(3),[[13,23,2]]);
assert.deepEqual(redTriad(39),[[27,5,15]]);
assert.deepEqual([mod(15*24*24),mod(-30*24),15],[27,5,15]);

const u=[0,1];
assert.deepEqual(pow(u,2),[8,3]);
assert.deepEqual([mod(13+2*8),mod(23+2*3)],[0,0]);
assert.equal(spow(19,14),28);
assert.deepEqual(pow(u,30),[21,0]);
assert.equal(tr(u),3);
assert.equal(nm(u),21);
assert.equal(spow(21,14),28);
assert.equal(spow(21,28),1);
for(const d of [1,2,4,7,14]) assert.notEqual(spow(21,d),1);
for(let a=0;a<P;a++)for(let b=0;b<P;b++){
  assert.deepEqual(T([a,b]),[mod(21*b),a]);
  assert.deepEqual(T(T([a,b])),[mod(21*a),mod(21*b)]);
}
const seed=[24,0], states=[];
let s=seed.slice();
for(let i=0;i<PERIOD;i++){states.push(s);s=T(s);}
assert.deepEqual(s,seed);
let t28=seed.slice();for(let i=0;i<28;i++)t28=T(t28);
assert.deepEqual(t28,[5,0]);
const p54Offset=pages.filter(p=>p.page<54).reduce((n,p)=>n+p.indices.length,0);
assert.equal(p54Offset,12648);

const traceKey=states.map(tr), normKey=states.map(nm);
assert.deepEqual([traceKey[0],traceKey[1]],[19,14]);
assert.deepEqual([normKey[0],normKey[1]],[25,3]);
assert.ok(traceKey.every(x=>x!==0)&&normKey.every(x=>x!==0));

const counts=new Uint32Array(26**4);
let qtotal=0;
for(const line of read('resources/control/duko_round27_english_quadgrams.txt').trim().split(/\r?\n/)){
  const m=line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if(!m)continue;
  const q=m[1],n=Number(m[2]);
  const ix=(((q.charCodeAt(0)-65)*26+q.charCodeAt(1)-65)*26+q.charCodeAt(2)-65)*26+q.charCodeAt(3)-65;
  counts[ix]=n;qtotal+=n;
}
assert.equal(qtotal,7266795);
assert.equal(counts.reduce((n,x)=>n+(x>0?1:0),0),79495);
const logs=new Float64Array(26**4), present=new Uint8Array(26**4);
logs.fill(Math.log(.01/qtotal));
for(let i=0;i<counts.length;i++)if(counts[i]){logs[i]=Math.log(counts[i]/qtotal);present[i]=1;}
const letters=corpus.translit.map(s=>Array.from(s,ch=>ch.charCodeAt(0)-65));
function score(ids){
  let sum=0,missing=0,n=0,filled=0,a=0,b=0,c=0;
  for(const rune of ids)for(const ch of letters[rune]){
    n++;
    if(filled===0){a=ch;filled++;continue;}
    if(filled===1){b=ch;filled++;continue;}
    if(filled===2){c=ch;filled++;continue;}
    const ix=(((a*26+b)*26+c)*26)+ch;
    sum+=logs[ix];if(!present[ix])missing++;
    a=b;b=c;c=ch;
  }
  return {scorePerLetter:sum/Math.max(1,n-3),missingQuadgrams:missing,letters:n};
}
const ioc=ids=>{const h=new Uint32Array(P);for(const x of ids)h[x]++;return h.reduce((n,x)=>n+x*(x-1),0)/(ids.length*(ids.length-1));};
const preview=ids=>ids.slice(0,150).map(i=>corpus.translit[i]).join('').slice(0,180);
const stateIndex=(clock,page,g,local)=>{
  if(clock==='global-rune')return mod(g-p54Offset);
  if(clock==='page-state')return mod(page-54);
  if(clock==='page-reset')return local%PERIOD;
  throw new Error('bad clock');
};
function decodeAdd(key,clock,sign){
  const out=new Uint8Array(RUNES);let pos=0,g=0;
  for(const page of pages)for(let j=0;j<page.indices.length;j++){
    out[pos++]=mod(page.indices[j]+sign*key[stateIndex(clock,page.page,g,j)]);
    g++;
  }
  return out;
}
function encodeAdd(plain,key,clock,sign){
  const out=new Uint8Array(RUNES);let pos=0,g=0;
  for(const page of pages)for(let j=0;j<page.indices.length;j++){
    out[pos]=mod(plain[pos]-sign*key[stateIndex(clock,page.page,g,j)]);
    pos++;g++;
  }
  return out;
}
function decodeAffine(A,B,clock){
  const out=new Uint8Array(RUNES);let pos=0,g=0;
  for(const page of pages)for(let j=0;j<page.indices.length;j++){
    const k=stateIndex(clock,page.page,g,j);
    out[pos++]=mod((page.indices[j]-B[k])*inv(A[k]));g++;
  }
  return out;
}
function encodeAffine(plain,A,B,clock){
  const out=new Uint8Array(RUNES);let pos=0,g=0;
  for(const page of pages)for(let j=0;j<page.indices.length;j++){
    const k=stateIndex(clock,page.page,g,j);
    out[pos]=mod(A[k]*plain[pos]+B[k]);pos++;g++;
  }
  return out;
}

const raw=score(cipher), fixed=[];
for(const [name,key] of [['trace',traceKey],['norm',normKey]]){
  for(const clock of ['global-rune','page-state'])for(const sign of [-1,1]){
    const plain=decodeAdd(key,clock,sign);
    assert.deepEqual(encodeAdd(plain,key,clock,sign),Uint8Array.from(cipher));
    const sc=score(plain);
    fixed.push({type:'additive',projection:name,clock,sign,scorePerLetter:sc.scorePerLetter,ioc:ioc(plain),preview:preview(plain)});
  }
}
for(const [mult,off] of [['norm','trace'],['trace','norm']]){
  const A=mult==='norm'?normKey:traceKey,B=off==='norm'?normKey:traceKey;
  for(const clock of ['global-rune','page-state']){
    const plain=decodeAffine(A,B,clock);
    assert.deepEqual(encodeAffine(plain,A,B,clock),Uint8Array.from(cipher));
    const sc=score(plain);
    fixed.push({type:'affine',multiplier:mult,offset:off,clock,scorePerLetter:sc.scorePerLetter,ioc:ioc(plain),preview:preview(plain)});
  }
}
fixed.sort((a,b)=>b.scorePerLetter-a.scorePerLetter);

const keyFromPair=(x,y)=>{
  const k=new Uint8Array(PERIOD);k[0]=x;k[1]=y;
  for(let i=2;i<PERIOD;i++)k[i]=mod(21*k[i-2]);
  return k;
};
const exhaustive=[];
for(const clock of ['global-rune','page-reset']){
  const rows=[],seen=new Set();
  for(let x=0;x<P;x++)for(let y=0;y<P;y++){
    if(!x&&!y)continue;
    const key=keyFromPair(x,y);seen.add(Array.from(key).join(','));
    const plain=decodeAdd(key,clock,-1),sc=score(plain);
    rows.push({x,y,scorePerLetter:sc.scorePerLetter,missingQuadgrams:sc.missingQuadgrams,ioc:ioc(plain)});
  }
  assert.equal(rows.length,840);assert.equal(seen.size,840);
  rows.sort((a,b)=>b.scorePerLetter-a.scorePerLetter);
  const t=rows.find(r=>r.x===19&&r.y===14),n=rows.find(r=>r.x===25&&r.y===3);
  const bestPlain=decodeAdd(keyFromPair(rows[0].x,rows[0].y),clock,-1);
  const sorted=rows.map(r=>r.scorePerLetter).sort((a,b)=>a-b);
  exhaustive.push({
    clock,tested:rows.length,
    best:{k0:rows[0].x,k1:rows[0].y,scorePerLetter:rows[0].scorePerLetter,
      missingQuadgrams:rows[0].missingQuadgrams,ioc:rows[0].ioc,preview:preview(bestPlain)},
    second:{k0:rows[1].x,k1:rows[1].y,scorePerLetter:rows[1].scorePerLetter},
    meanScore:rows.reduce((z,r)=>z+r.scorePerLetter,0)/rows.length,
    medianScore:sorted[Math.floor(sorted.length/2)],
    trace:{rank:rows.indexOf(t)+1,scorePerLetter:t.scorePerLetter},
    norm:{rank:rows.indexOf(n)+1,scorePerLetter:n.scorePerLetter}
  });
}
assert.ok(exhaustive.every(x=>x.best.scorePerLetter<raw.scorePerLetter));

const plant=p57.indices,keyPlant=keyFromPair(7,19);
const plantC=plant.map((x,i)=>mod(x+keyPlant[i%PERIOD]));
assert.deepEqual(plantC.map((x,i)=>mod(x-keyPlant[i%PERIOD])),plant);

console.log(JSON.stringify({
  source:{pages:pages.length,runeBearingPages:pages.filter(p=>p.indices.length).length,
    runes:cipher.length,p54GlobalRuneOffset:p54Offset,p54FirstRune:p54.indices[0],
    quadgramEntries:present.reduce((n,x)=>n+x,0),quadgramTotal:qtotal},
  field:{p3:[13,23,2],p39:[27,5,15],seedAtP54:seed,normU:21,
    T:'T(a,b)=(21b,a)',T2:'21I',order21:28,orderT:56,T28Seed:t28,
    traceSeedPair:[traceKey[0],traceKey[1]],normSeedPair:[normKey[0],normKey[1]]},
  raw:{...raw,ioc:ioc(cipher),preview:preview(cipher)},
  solvedP57:{...score(p57.indices),preview:preview(p57.indices)},
  fixedSourceProjections:{tested:fixed.length,best:fixed[0],all:fixed},
  allSecretLinearObservationPads:exhaustive,
  positiveControl:{solvedP57Runes:plant.length,exactRecovery:true},
  conclusion:'No authentic LP2 plaintext or key. The exact order-56 twisted-Frobenius state is a source-motivated hypothesis; all 840 direct-additive linear-observation keys fail to improve the original English-quadgram score.'
},null,2));
