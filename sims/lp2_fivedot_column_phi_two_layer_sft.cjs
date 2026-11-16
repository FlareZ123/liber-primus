'use strict';
/**
 * SFT: printed-word five/seven-column transposition composed with
 * authentic p56 plaintext-F-transparent phi(prime) GP29 cipher.
 * Node.js 22: node sims/lp2_fivedot_column_phi_two_layer_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const chunks = fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8').split('%');
const runeIndex = new Map(corpus.runes.map((r,i)=>[r,i]));
const pages = corpus.pages.filter(p=>p.page<56&&p.indices.length);
const groups = [[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const expected = {
  '5/columnToRow':{max:[681,422,620,607,576,671,610,635,308],surv:[0,0,0,0,0,0,0,0,2]},
  '5/rowToColumn':{max:[729,478,547,516,782,631,370,492,308],surv:[2,0,0,0,0,0,0,0,1]},
  '7/columnToRow':{max:[729,530,524,610,604,686,407,549,308],surv:[2,0,0,0,0,0,0,0,5]},
  '7/rowToColumn':{max:[716,445,496,597,582,534,467,689,308],surv:[0,0,0,0,0,0,0,0,1]}
};
const words=[];let pending=[];
for(let k=0;k<pages.length;k++){
  const observed=[...chunks[k]].filter(r=>runeIndex.has(r)).map(r=>runeIndex.get(r));
  assert.deepEqual(observed,pages[k].indices,'original physical page '+pages[k].page);
  for(const ch of [...chunks[k]]){
    if(runeIndex.has(ch))pending.push(runeIndex.get(ch));
    else if('-.$&§'.includes(ch)&&pending.length){words.push(pending);pending=[];}
  }
}
if(pending.length)words.push(pending);
const original=pages.flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(original.length,12956);
assert.deepEqual(words.flat(),original);
function perm(word,width,direction){
  if(word.length<=width)return word.slice();
  if(direction==='rowToColumn'){
    const cols=Array.from({length:width},()=>[]);
    word.forEach((r,i)=>cols[i%width].push(r));
    return cols.flat();
  }
  let at=0;const cols=[];
  for(let c=0;c<width;c++){
    const n=Math.floor(word.length/width)+(c<word.length%width?1:0);
    cols.push(word.slice(at,at+n));at+=n;
  }
  const out=[];
  for(let r=0;r<Math.ceil(word.length/width);r++)
    for(let c=0;c<width;c++)if(r<cols[c].length)out.push(cols[c][r]);
  return out;
}
const inv=d=>d==='rowToColumn'?'columnToRow':'rowToColumn';
const mod=n=>(n%29+29)%29,phi=[],composite=new Uint8Array(180000);
for(let p=2;p<composite.length&&phi.length<9000;p++){
  if(composite[p])continue;
  phi.push((p-1)%29);
  if(p*p<composite.length)for(let k=p*p;k<composite.length;k+=p)composite[k]=1;
}
assert.equal(phi.length,9000);
const encode=(plain,start)=>{
  let used=0;
  return plain.map(p=>p===0?0:mod(p+phi[start+used++]));
};
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gpWord(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C')
    .replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  for(let i=0;i<s.length;){
    const t=tokens.find(x=>s.startsWith(x.s,i));
    assert.ok(t,'unencodable solved word '+s);
    out.push(t.i);i+=t.s.length;
  }
  return out;
}
const p56Words=('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE '+
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE').split(' ').map(gpWord);
const p56Plain=p56Words.flat(),p56Cipher=corpus.pages[56].indices;
assert.equal(p56Plain.length,85);
assert.deepEqual(encode(p56Plain,0),p56Cipher);
function furthest(cipher,start){
  let states=[0];
  for(let i=0;i<cipher.length;i++){
    const c=cipher[i],seen=new Uint8Array(i+2),next=[];
    for(const used of states){
      if(c===0&&!seen[used]){next.push(used);seen[used]=1;}
      if(mod(c-phi[start+used])!==0&&!seen[used+1]){next.push(used+1);seen[used+1]=1;}
    }
    if(!next.length)return i;
    states=next;
  }
  return cipher.length;
}
assert.equal(furthest(p56Cipher,0),85);
const ioc=a=>{
  const f=new Uint32Array(29);a.forEach(x=>f[x]++);
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
};
function recover(cipher,start){
  let states=new Map([[0,null]]);
  for(const c of cipher){
    const next=new Map();
    for(const [used,previous] of states){
      if(c===0&&!next.has(used))next.set(used,{previous,p:0});
      const p=mod(c-phi[start+used]);
      if(p!==0&&!next.has(used+1))next.set(used+1,{previous,p});
    }
    states=next;
  }
  return [...states.values()].map(node=>{
    const plain=[];
    while(node){plain.push(node.p);node=node.previous;}
    plain.reverse();
    assert.deepEqual(encode(plain,start),cipher);
    return {ioc:ioc(plain),first100:plain.slice(0,100).map(x=>corpus.translit[x]).join('')};
  });
}
const ranges=groups.map(([from,to])=>[
  pages.filter(p=>p.page<from).reduce((s,p)=>s+p.indices.length,0),
  pages.filter(p=>p.page<=to).reduce((s,p)=>s+p.indices.length,0)
]);
const results=[];
for(const width of [5,7])for(const direction of ['columnToRow','rowToColumn']){
  // Genuine p56 plaintext, plus both reversible stages as a planted positive.
  let offset=0;
  const planted=p56Words.flatMap(word=>{
    const x=perm(p56Cipher.slice(offset,offset+word.length),width,inv(direction));
    offset+=word.length;return x;
  });
  offset=0;
  const unplanted=p56Words.flatMap(word=>{
    const x=perm(planted.slice(offset,offset+word.length),width,direction);
    offset+=word.length;return x;
  });
  assert.deepEqual(unplanted,p56Cipher);
  assert.equal(furthest(unplanted,0),85);
  const transposedWords=words.map(w=>perm(w,width,direction));
  assert.deepEqual(transposedWords.map(w=>perm(w,width,inv(direction))).flat(),original);
  const tape=transposedWords.flat(),rows=[];
  for(let g=0;g<groups.length;g++){
    const cipher=tape.slice(...ranges[g]);
    const starts=[];let max=0;
    for(let s=0;s<5000;s++){
      const far=furthest(cipher,s);
      if(far>max)max=far;
      if(far===cipher.length)starts.push(s);
    }
    assert.equal(max,expected[width+'/'+direction].max[g]);
    assert.equal(starts.length,expected[width+'/'+direction].surv[g]);
    const candidates=g===0?starts.flatMap(s=>recover(cipher,s).map(p=>({start:s,...p}))):[];
    if(g===0)assert.ok(candidates.every(p=>p.ioc<0.04));
    rows.push({pages:groups[g],runic:cipher.length,maxReachablePrefix:max,primeStarts:starts,candidates});
  }
  assert.ok(rows.slice(1,8).every(x=>x.primeStarts.length===0));
  results.push({width,direction,originalRoundTrip:12956,p56Positive:85,rows});
}
console.log(JSON.stringify({
  method:'two-layer exact original ciphertext test; no plaintext-F consumed a key rune',
  testedStarts:'0..4999 inclusive',
  result:'seven central chapters unreachably encoded for every frozen variant; no unknown GP29 plaintext',
  results
},null,2));
