"use strict";
/**
 * Exact all-secret pagewise GP29 order-1/2/3 ciphertext-feedback capacity.
 *
 * Per-page model:
 *  C[j] = sigma_page(P[j]) + sum_{t=1..order}(b_page[t]*C[j-t]) (mod 29).
 * Each page may choose ALL 29^order feedback coefficients independently,
 * ANY secret permutation of the 29 rune symbols, and arbitrary first order
 * plaintext symbols. Original text is tested without key or alphabet fitting.
 *
 * Node.js 22 CommonJS SFT. No historical claim that Cicada used this model.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeWords,minimumWindow}=require("./lp2_difference_allletter_capacity_sft.cjs");
const ROOT=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const MOD=29;

/** @param {number} n @returns {number} */
function mod(n){n%=MOD;return n<0?n+MOD:n;}

/**
 * Maximize one and two distinct output-residue occupations over every feedback
 * coefficient tuple. Since the alphabet is bijective, the second-largest
 * residue must differ from the largest; one bin cannot stand for E and O.
 * @param {number[]} a
 * @param {1|2|3} order
 * @returns {{one:number,two:number}}
 */
function pageCapacity(a,order){
 let one=0,two=0;
 for(let b=0;b<MOD;b++)
 for(let c=0;c<(order>1?MOD:1);c++)
 for(let d=0;d<(order>2?MOD:1);d++){
  const hist=new Uint16Array(MOD);
  for(let j=order;j<a.length;j++)
   hist[mod(a[j]-b*a[j-1]-(order>1?c*a[j-2]:0)
     -(order>2?d*a[j-3]:0))]++;
  let x=0,y=0;
  for(const n of hist){
   if(n>x){y=x;x=n;}
   else if(n>y)y=n;
  }
  if(x>one)one=x;
  if(x+y>two)two=x+y;
 }
 return {one,two};
}

/**
 * Exact maximum of a specified one-symbol or two-symbol plaintext set.
 * Page-initial runes are adversarially free regardless of source values.
 * @param {number[][]} streams
 * @param {1|2|3} order
 * @returns {{E:number,EplusO:number,free:number,rows:{one:number,two:number}[]}}
 */
function capacity(streams,order){
 const rows=streams.map(a=>pageCapacity(a,order));
 const free=streams.reduce((n,a)=>n+Math.min(order,a.length),0);
 return {E:free+rows.reduce((n,x)=>n+x.one,0),
   EplusO:free+rows.reduce((n,x)=>n+x.two,0),free,rows};
}

/**
 * Minimum counts of selected rune identities in any exact-length contiguous
 * source-native reference window. The fixed set is E and O, the two most
 * frequent canonical GP symbols in all three independently pinned corpora.
 * @param {number[]} text
 * @param {number} n
 * @param {number[]} symbols
 * @returns {{count:number,offset:number}}
 */
function minimumSetWindow(text,n,symbols){
 assert.ok(text.length>=n);
 const selected=new Set(symbols);
 let count=0,best=Infinity,offset=-1;
 for(let j=0;j<text.length;j++){
  if(selected.has(text[j]))count++;
  if(j>=n&&selected.has(text[j-n]))count--;
  if(j>=n-1&&count<best){best=count;offset=j-n+1;}
 }
 return {count:best,offset};
}

/** @returns {()=>number} */
function seededGenerator(){
 let x=0x33012016;
 return ()=>{
  x^=x<<13;x^=x>>>17;x^=x<<5;
  return x>>>0;
 };
}

/**
 * Independently generated length-matched real GP English, encrypted under
 * 55 distinct SECRET 29-symbol alphabets and arbitrary third-order
 * feedback coefficients, then fully recovered and forward reproduced.
 * @param {number[]} plain
 * @param {number[][]} streams
 * @returns {{runes:number,matches:number,plaintextEO:number,sourceValid:boolean}}
 */
function positiveControl(plain,streams){
 const random=seededGenerator(),E=corpus.translit.indexOf("E"),
   O=corpus.translit.indexOf("O"),cipher=[];
 let offset=0,matches=0;
 for(let page=0;page<streams.length;page++){
  const p=plain.slice(offset,offset+streams[page].length);
  offset+=p.length;
  const sigma=Array.from({length:MOD},(_,i)=>i);
  for(let j=MOD-1;j>0;j--){
   const k=random()%(j+1);
   [sigma[j],sigma[k]]=[sigma[k],sigma[j]];
  }
  const inverse=Array(MOD).fill(-1);
  sigma.forEach((v,i)=>{inverse[v]=i;});
  assert.equal(new Set(sigma).size,MOD);
  const coeff=[mod(page*11+25),mod(page*7+9),mod(page*17+6)];
  const c=new Array(p.length),d=new Array(p.length);
  for(let j=0;j<p.length;j++){
   let v=sigma[p[j]];
   for(let t=1;t<=3&&t<=j;t++)v+=coeff[t-1]*c[j-t];
   c[j]=mod(v);
  }
  for(let j=0;j<c.length;j++){
   let v=c[j];
   for(let t=1;t<=3&&t<=j;t++)v-=coeff[t-1]*c[j-t];
   d[j]=inverse[mod(v)];
  }
  assert.deepEqual(d,p);
  for(let j=0;j<d.length;j++)if(d[j]===p[j])matches++;
  cipher.push(c);
 }
 assert.equal(offset,plain.length);
 assert.equal(matches,plain.length);
 // A single genuine planted page must pass its blind all-secret bound.
 const first=pageCapacity(cipher[0],3);
 const firstEO=plain.slice(0,cipher[0].length).filter(x=>x===E||x===O).length;
 assert.ok(firstEO<=first.two+3);
 return {runes:plain.length,matches,
   plaintextEO:plain.filter(x=>x===E||x===O).length,sourceValid:true};
}

function main(){
 assert.equal(pages.length,55);
 const streams=pages.map(p=>p.indices);
 const n=streams.reduce((sum,a)=>sum+a.length,0);
 assert.equal(n,12956);
 const capacities=[1,2,3].map(order=>({order,...capacity(streams,order)}));
 assert.deepEqual(capacities.map(v=>[v.E,v.EplusO,v.free]),
   [[1048,1842,55],[1299,2104,110],[1489,2348,165]]);
 const named=[
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
 ];
 const E=corpus.translit.indexOf("E"),O=corpus.translit.indexOf("O");
 const control=named.map(([name,file])=>{
  const text=encodeWords(read(file)).flat();
  const counts=Array(MOD).fill(0);
  for(const x of text)counts[x]++;
  const sorted=counts.map((count,i)=>({count,i}))
   .sort((a,b)=>b.count-a.count);
  assert.deepEqual(sorted.slice(0,2).map(x=>x.i),[E,O]);
  return {name,runes:text.length,E:minimumWindow(text,n,E),
   EplusO:minimumSetWindow(text,n,[E,O])};
 });
 assert.deepEqual(control.map(x=>[x.E.count,x.EplusO.count]),
   [[1407,2556],[1397,2430],[1482,2455]]);
 assert.ok(control.every(x=>x.EplusO.count>capacities[2].EplusO));
 const seed=encodeWords(read(named[0][1])).flat().slice(0,n);
 const planted=positiveControl(seed,streams);
 const result={model:"C[j]=sigma_page(P[j])+sum_t b_page[t]*C[j-t] mod29",
   original:{runes:n,pages:streams.length,
    allSecretOrderCapacity:capacities.map(v=>({
     order:v.order,E:v.E,EplusO:v.EplusO,free:v.free}))},
   controls:control,planted};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,mod,pageCapacity,capacity,minimumSetWindow,positiveControl};
