"use strict";
/**
 * The original p40 red clue may identify two transparent plaintext channels:
 * GP EA (28) at original adjacent ciphertext doublets and GP S (15) at the
 * p40-sourced six-back affine echo T(x)=24-2x mod29. The 55 original rune pages
 * have 86 EA candidates and 80 T6 hits (one overlapping), leaving 79 S.
 *
 * This is an exact original marker audit and 3-source independent-word
 * conditional null. It tests GP plaintext with its OWN word boundaries, not
 * the printed cipher's. It does not recover a historical plaintext or key.
 * Run: node sims/red_t6_ea_joint_source_gate.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runes=new Map(corpus.runes.map((r,i)=>[r,i]));
const input=read("resources/lp2-transcription.txt").split("%").slice(0,55).join("%");
const words=input.split(/[-.&$§]/u)
  .map(s=>[...s].filter(x=>runes.has(x)).map(x=>runes.get(x)))
  .filter(w=>w.length);
assert.equal(words.length,2896);
const C=words.flat(),N=C.length;
assert.equal(N,12956);
const P=corpus.pages.filter(p=>p.status==="unsolved"&&p.indices.length);
const first=new Set(),eligible=new Set();
let at=0;for(const p of P){first.add(at);at+=p.indices.length;}
assert.equal(at,N);
at=0;for(const w of words){for(let j=6;j<w.length;j++)eligible.add(at+j);at+=w.length;}
assert.equal(eligible.size,1290);
const mod=x=>(x%29+29)%29;
/** @param {number[]} c */
function sourceMarkers(c) {
  const ea=new Set(),s=new Set();
  for(let i=1;i<N;i++)if(!first.has(i)&&c[i]===c[i-1])ea.add(i);
  for(const i of eligible)if(!ea.has(i)&&c[i]===mod(24-2*c[i-6]))s.add(i);
  return {ea,s};
}
/** @param {{ea:Set<number>,s:Set<number>}} markers */
function features(markers){
  const {ea,s}=markers;
  let near3=0,near6=0,multi=0;
  for(const x of ea){
    let a=false,b=false;
    for(let j=-6;j<=6;j++)if(s.has(x+j)){
      b=true;if(Math.abs(j)<=3)a=true;
    }
    near3+=Number(a);near6+=Number(b);
  }
  let k=0;
  for(const w of words){
    let n=0;
    for(let j=6;j<w.length;j++)n+=Number(s.has(k+j));
    multi+=Number(n>=2);k+=w.length;
  }
  return {ea:ea.size,s:s.size,eaNearS3:near3,eaNearS6:near6,sDoubleWords:multi};
}
const actual=features(sourceMarkers(C));
assert.equal(actual.ea,86);
assert.equal(actual.s,79);
assert.equal(actual.eaNearS3,2);
assert.equal(actual.eaNearS6,5);
const token=new Map(corpus.translit.map((x,i)=>[x,i]));
/** @param {string} str */
function gp(str){
  let s=str.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S"),out=[];
  for(let i=0;i<s.length;){
    const p=token.get(s.slice(i,i+2));
    if(p!==undefined){out.push(p);i+=2;}
    else{const v=token.get(s[i]);assert.notEqual(v,undefined);out.push(v);i++;}
  }
  return out;
}
/** @param {string} s */
function native(s){
  return s.split(/\r?\n/u).filter(l=>{
    const x=l.trim();
    return !x.startsWith("#")&&!x.startsWith("[")&&
      !/^[0-9a-f]{25,}$/iu.test(x);
  }).join(" ");
}
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
/** @param {number[][]} words @param {()=>number} random */
function plant(words,random){
  const a=new Uint8Array(N+64);
  let n=0;
  while(n<a.length){
    const w=words[random()%words.length];
    for(const v of w){if(n>=a.length)break;a[n++]=v;}
  }
  const off=random()%64;
  return a.slice(off,off+N);
}
/** @param {Uint8Array} plain */
function plainMarkers(plain) {
  const ea=new Set(),s=new Set();
  for(let i=0;i<N;i++){
    if(!first.has(i)&&plain[i]===28)ea.add(i);
    if(eligible.has(i)&&plain[i]===15)s.add(i);
  }
  return {ea,s};
}
/**
 * Exact 29-symbol output permutation. Literal EA reserves previous output;
 * literal S reserves T6 at eligible positions and shifts to a free output
 * if EA already occupies T6. Other plaintext symbols use secret rotation.
 * @param {number[]} ciphertext
 * @param {number} i
 * @param {number} secret
 */
function table(ciphertext,i,secret){
  const row=Array(29).fill(-1),used=new Set();
  if(i>0&&!first.has(i)){row[28]=ciphertext[i-1];used.add(row[28]);}
  if(eligible.has(i)){
    let y=mod(24-2*ciphertext[i-6]);
    while(used.has(y))y=mod(y+1);
    row[15]=y;used.add(y);
  }
  const symbols=[];
  for(let p=0;p<29;p++)if(row[p]<0)symbols.push(p);
  const offset=i?ciphertext[i-1]:0;
  const remaining=Array.from({length:29},(_,j)=>mod(offset+j))
    .filter(v=>!used.has(v));
  assert.equal(symbols.length,remaining.length);
  for(let j=0;j<symbols.length;j++)
    row[symbols[j]]=remaining[(j+secret)%remaining.length];
  return row;
}
/** @param {Uint8Array} source @param {Uint8Array} secret */
function encrypt(source,secret){
  const c=[];
  for(let i=0;i<N;i++)c.push(table(c,i,secret[i])[source[i]]);
  return c;
}
/** @param {number[]} ciphertext @param {Uint8Array} secret */
function decrypt(ciphertext,secret){
  const p=[];
  for(let i=0;i<N;i++)p.push(table(ciphertext,i,secret[i]).indexOf(ciphertext[i]));
  return p;
}
/** @param {number} n */
function run(n=600){
  assert(Number.isSafeInteger(n)&&n>=100);
  const sourceFiles=[
    ["solved-Cicada","resources/liber-primus/lp1-plaintext-reference.txt"],
    ["Shakespeare","resources/control/shakespeare_first300k.txt"],
    ["Gibran","resources/control/gibran_prophet_58585.txt"]
  ];
  const out=[],fields=Object.keys(actual);
  for(let z=0;z<sourceFiles.length;z++){
    const [name,file]=sourceFiles[z],raw=read(file);
    const english=name==="solved-Cicada"?native(raw):raw;
    const pool=(english.match(/[A-Za-z]+/gu)||[]).map(gp);
    const random=rng((0x33011553+z*3301)>>>0);
    const obs=Object.fromEntries(fields.map(k=>[k,{sum:0,sq:0,lt:0,gt:0}]));
    for(let k=0;k<n;k++){
      const p=plant(pool,random),r=features(plainMarkers(p));
      for(const field of fields){
        const x=r[field],cell=obs[field];
        cell.sum+=x;cell.sq+=x*x;
        cell.lt+=Number(x<=actual[field]);
        cell.gt+=Number(x>=actual[field]);
      }
    }
    const entry={source:name,sourceWords:pool.length,seed:(0x33011553+z*3301)>>>0,
      statistics:Object.fromEntries(fields.map(k=>{
        const t=obs[k],mean=t.sum/n;
        return [k,{observed:actual[k],nullMean:mean,
          nullSD:Math.sqrt(t.sq/n-mean*mean),
          upperTail:(t.gt+1)/(n+1),lowerTail:(t.lt+1)/(n+1)}];
      }))};
    if(z===0){
      const d=rng(0x53313301),source=plant(pool,d);
      const secret=Uint8Array.from({length:N},()=>d()%29);
      const cipher=encrypt(source,secret);
      assert.deepEqual(decrypt(cipher,secret),Array.from(source));
      assert.deepEqual(encrypt(source,secret),cipher);
      entry.invertiblePositive={sourceRuneCount:N,correctlyRecovered:N,
        originalShapedSyntheticEA:sourceMarkers(cipher).ea.size,
        originalShapedSyntheticT6NonEA:sourceMarkers(cipher).s.size,
        sourceEA:plainMarkers(source).ea.size,
        sourceEligibleS:plainMarkers(source).s.size};
    }
    out.push(entry);
  }
  return {status:"conditional source-register test, no unknown plaintext or authentic key",
    observed:{runes:N,words:words.length,eligible:eligible.size,...actual},
    sourceModels:{trialsPerRegister:n,sourceWordBoundariesIndependentOfPrintedWords:true,
      results:out},
    limitation:"GP EA and S channel assignments are postselected; arbitrary unknown secret rotation bytes are not recovered; simulated forward cipher exhibits 29 invertible output labels per state; model is only a viable hypothesis"};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,sourceMarkers,features,table,encrypt,decrypt};
