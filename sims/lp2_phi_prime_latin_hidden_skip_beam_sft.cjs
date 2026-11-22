"use strict";
/**
 * Hidden-repeat-skip beam inference for fixed GP29 Quagmire/Latin-square
 * c = alphabetOut(alphabetIn(p) +/- phi(prime)[pointer]).
 * Source-native blind plants with unknown skip history, followed by original
 * LP2 opening and independent next-chapter text. No planted truth to decoder.
 * Windows Node22 CommonJS, no dependencies, read-only.
 */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gibran=read("resources/control/gibran_prophet_58585.txt");
const shakespeare=read("resources/control/shakespeare_first300k.txt");
const N=29,mod=x=>(x%N+N)%N;
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function word(w){
  w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S");
  let result=[];
  for(let i=0;i<w.length;){
    if(w.startsWith("ING",i)){result.push(21);i+=3;}
    else if(w.startsWith("IO",i)){result.push(27);i+=2;}
    else {
      const x=tokens.find(t=>w.startsWith(t.s,i));
      assert(x,"unknown GP character");
      result.push(x.i);i+=x.s.length;
    }
  }
  return result;
}
const toRunes=s=>(s.match(/[A-Za-z]+/g)||[]).flatMap(word);
const native=toRunes(gibran),ref=toRunes(shakespeare);
assert.equal(native.length,62492);assert.equal(ref.length,217106);
const uni=new Uint32Array(N),bi=new Uint32Array(N*N),
  tri=new Uint32Array(N*N*N);
for(let i=0;i<ref.length;i++){
  uni[ref[i]]++;
  if(i)bi[ref[i-1]*N+ref[i]]++;
  if(i>1)tri[(ref[i-2]*N+ref[i-1])*N+ref[i]]++;
}
const lb=Array.from(bi,(n,i)=>Math.log((n+2)/
  (uni[Math.floor(i/N)]+2*N)));
const lt=Array.from(tri,(n,i)=>Math.log((n+1)/
  (bi[Math.floor(i/N)]+N)));
const primeRows=[],sieve=new Uint8Array(700001);
for(let i=2;i<sieve.length&&primeRows.length<45000;i++){
  if(sieve[i])continue;
  primeRows.push((i-1)%N);
  if(i*i<sieve.length)for(let j=i*i;j<sieve.length;j+=i)sieve[j]=1;
}
assert.equal(primeRows.length,45000);
/** @param {string} name */
function permutation(name){
  const arr=name==="identity"?Array.from({length:N},(_,i)=>i)
    :name==="atbash"?Array.from({length:N},(_,i)=>N-1-i)
    :[...new Set([...word(name),...Array(N).keys()])];
  assert.equal(arr.length,N);
  const inv=Array(N);
  arr.forEach((x,i)=>inv[x]=i);
  return {arr,inv};
}
const names=["identity","atbash","DIVINITY","FIRFUMFERENFE"];
const keys=Object.fromEntries(names.map(x=>[x,permutation(x)]));
const rng=seed=>()=>{
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return (seed>>>0)/4294967296;
};
/** @param {number[]} text @param {{arr:number[]}} input
 * @param {{arr:number[]}} output @param {number} sign @param {number} seed */
function plant(text,input,output,sign,seed){
  const random=rng(seed),cipher=[];
  let previous=-1,pointer=0,skips=0;
  for(const p of text){
    let c=output.arr[mod(input.arr[p]+sign*primeRows[pointer])];
    while(c===previous&&random()<.81){
      pointer++;skips++;
      c=output.arr[mod(input.arr[p]+sign*primeRows[pointer])];
    }
    cipher.push(c);previous=c;pointer++;
  }
  return {cipher,pointer,skips};
}
/**
 * Beam state holds last two plaintext symbols and unknown key pointer.
 * Every skipped row is forced to emit the immediately previous ciphertext.
 * @param {number[]} cipher
 * @param {{arr:number[],inv:number[]}} input
 * @param {{arr:number[],inv:number[]}} output
 * @param {number} sign @param {number} width
 */
function decode(cipher,input,output,sign,width){
  const c=cipher.map(x=>output.inv[x]);
  let states=[{pointer:0,first:-1,second:-1,score:0,parent:null,plain:-1}];
  const logQ=Math.log(.81),logKeep=Math.log(.19);
  for(let i=0;i<c.length;i++){
    const previous=i?c[i-1]:-1,next=new Map();
    for(const s of states)for(let skips=0;skips<=3;skips++){
      const j=s.pointer+skips;if(j>=primeRows.length)continue;
      const raw=mod(c[i]-sign*primeRows[j]),p=input.inv[raw];
      let valid=true;
      for(let k=0;k<skips;k++)
        if(mod(raw+sign*primeRows[s.pointer+k])!==previous){
          valid=false;break;
        }
      if(!valid)continue;
      let score=s.score+(s.second<0
        ? Math.log((uni[p]+1)/(ref.length+N))
        : .55*lb[s.second*N+p]);
      if(s.first>=0)score+=.45*lt[(s.first*N+s.second)*N+p];
      score+=skips*logQ;
      if(c[i]===previous)score+=logKeep;
      const id=(j+1)+":"+s.second+":"+p,old=next.get(id);
      if(!old||score>old.score)
        next.set(id,{pointer:j+1,first:s.second,second:p,score,
          parent:s,plain:p});
    }
    states=[...next.values()].sort((a,b)=>b.score-a.score).slice(0,width);
    assert(states.length,"no viable key pointer");
  }
  const best=states[0],plain=Array(cipher.length);
  let node=best;
  for(let i=plain.length-1;i>=0;i--){
    plain[i]=node.plain;node=node.parent;
  }
  return {plain,pointer:best.pointer,score:best.score/cipher.length};
}
const original=gp.pages.slice(0,56).flatMap(x=>x.indices);
assert.equal(original.length,12956);
const p729=native.slice(4000,4729);
const c729=plant(p729,keys.DIVINITY,keys.FIRFUMFERENFE,1,0x3301abcd);
const d729=decode(c729.cipher,keys.DIVINITY,keys.FIRFUMFERENFE,1,128);
assert.deepEqual(d729.plain,p729);
assert.equal(d729.pointer,c729.pointer);
const pLong=native.slice(5000,17956);
const cLong=plant(pLong,keys.identity,keys.identity,1,0x33014455);
const dLong=decode(cLong.cipher,keys.identity,keys.identity,1,256);
const hits=dLong.plain.reduce((n,p,i)=>n+Number(p===pLong[i]),0);
assert.equal(hits,12954);
assert.equal(cLong.skips,317);
assert.equal(dLong.pointer,cLong.pointer);
const opening=original.slice(0,729),followup=original.slice(729,1874);
const results=[];
for(const input of names)for(const output of names)
  for(const sign of [1,-1]){
    const d=decode(opening,keys[input],keys[output],sign,128);
    results.push({input,output,sign,score:d.score,
      pointer:d.pointer,first40:d.plain.slice(0,40)
        .map(v=>gp.translit[v]).join("")});
  }
results.sort((a,b)=>b.score-a.score);
assert.equal(results.length,32);
assert.equal(results[0].input,"FIRFUMFERENFE");
assert.equal(results[0].output,"DIVINITY");
assert.equal(results[0].sign,-1);
assert(Math.abs(results[0].score+4.101606997477261)<1e-10);
const heldout=results.slice(0,6).map(x=>{
  const d=decode(followup,keys[x.input],keys[x.output],x.sign,128);
  return {input:x.input,output:x.output,sign:x.sign,
    openingScore:x.score,heldoutScore:d.score};
});
assert(heldout.every(x=>x.heldoutScore<-4));
assert(d729.score>-3&&dLong.score>-3);
console.log(JSON.stringify({status:"PASS",
  originalLP2PlaintextRecovered:false,
  knownRowFamily:"GP29 Euler totients of successive primes",
  keySkipRule:"repeat-output rejection with probability 0.81",
  729:{hits:729,total:729,score:d729.score,
    truePointer:c729.pointer,decodedPointer:d729.pointer,
    hiddenSkips:c729.skips},
  12956:{hits,total:12956,score:dLong.score,
    truePointer:cLong.pointer,decodedPointer:dLong.pointer,
    hiddenSkips:cLong.skips},
  original729Top:results.slice(0,6),original1145Heldout:heldout},null,2));
