"use strict";
/**
 * One-file original-cipher GP29 all-secret previous-output capacity gate.
 * node sims/lp2_prevcipher_allsecret_capacity_sft.cjs
 * Node 22; CommonJS; no external deps; read only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
const root=path.resolve(__dirname,"..");
const read=(f)=>fs.readFileSync(path.join(root,f),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages=gp.pages.filter((p)=>p.page<56&&p.indices.length);
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const chapters=ranges.map(([a,b])=>pages.filter((p)=>p.page>=a&&p.page<=b));
const E=gp.translit.indexOf("E"),O=gp.translit.indexOf("O");
const mod=(n)=>(n%29+29)%29;
assert.deepEqual([E,O,pages.length,pages.reduce((n,p)=>n+p.indices.length,0)],[18,3,55,12956]);
assert.deepEqual(chapters.map((c)=>c.reduce((n,p)=>n+p.indices.length,0)),
  [729,1145,1729,1903,1021,1433,1680,3008,308]);
/**
 * Bijection invariant: for any single plaintext letter, any given state
 * can use only one ciphertext symbol. For two distinct plaintext letters,
 * it can use at most two. Counts optimize every unknown secret alphabet.
 * State 29 is a separate sentinel at every physical-page start.
 * @param {Array<Array<{page:number,indices:number[]}>>} groups
 * @param {1|2} order
 * @returns {{E:number,EO:number,states:number}}
 */
function cap(groups,order){
 let Ecap=0,EOcap=0,states=0;
 for(const group of groups){
  const hist=new Map();
  for(const page of group){
   const a=page.indices;
   for(let i=0;i<a.length;i++){
    const state=[];
    for(let k=1;k<=order;k++)state.push(i>=k?a[i-k]:29);
    const key=state.join(",");
    let h=hist.get(key);
    if(!h){h=new Uint32Array(29);hist.set(key,h);}
    h[a[i]]++;
   }
  }
  states+=hist.size;
  for(const row of hist.values()){
   let a=0,b=0;
   for(const n of row){if(n>a){b=a;a=n;}else if(n>b)b=n;}
   Ecap+=a;EOcap+=a+b;
  }
 }
 return {E:Ecap,EO:EOcap,states};
}
/** @param {number[]} a @param {(c:number)=>boolean} f */
function minWindow(a,f){
 assert.ok(a.length>=12956);
 let count=0,best=Infinity,offset=-1;
 for(let i=0;i<a.length;i++){
  if(f(a[i]))count++;
  if(i>=12956&&f(a[i-12956]))count--;
  if(i>=12955&&count<best){best=count;offset=i-12955;}
 }
 return {count:best,offset};
}
/** @param {number[]} native */
function plant(native){
 assert.equal(native.length,12956);
 const planted=[];let index=0;
 for(let chapter=0;chapter<chapters.length;chapter++){
  for(const page of chapters[chapter]){
   let previous=29;
   const cipher=[];
   for(let i=0;i<page.indices.length;i++){
    const c=mod(11*native[index+i]+7*(previous%29)+3*chapter);
    cipher.push(c);previous=c;
   }
   previous=29;
   for(let i=0;i<cipher.length;i++){
    assert.equal(mod(8*(cipher[i]-7*(previous%29)-3*chapter)),native[index+i]);
    previous=cipher[i];
   }
   planted.push({page:page.page,indices:cipher});
   index+=page.indices.length;
  }
 }
 assert.equal(index,12956);
 const g=ranges.map(([a,b])=>planted.filter((p)=>p.page>=a&&p.page<=b));
 const bound=cap(g,1);
 const nativeE=native.filter((n)=>n===E).length;
 const nativeEO=native.filter((n)=>n===E||n===O).length;
 assert.ok(bound.E>=nativeE&&bound.EO>=nativeEO);
 return {exactInverse:true,nativeE,nativeEO,bound};
}
function main(){
 const global=cap([pages],1),nine=cap(chapters,1);
 const global2=cap([pages],2),nine2=cap(chapters,2);
 const byPage=cap(pages.map((p)=>[p]),1);
 assert.deepEqual(global,{E:719,EO:1368,states:30});
 assert.deepEqual(nine,{E:1269,EO:2314,states:270});
 assert.deepEqual(global2,{E:2041,EO:3650,states:865});
 assert.deepEqual(nine2,{E:6150,EO:9678,states:5699});
 assert.deepEqual(byPage,{E:2790,EO:4787,states:1645});
 const corpora=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",1416,2548],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",1408,2441],
  ["Emerson","resources/control/emerson_essays_2944.txt",1491,2408]
 ];
 const controls=corpora.map(([name,file,expectedE,expectedEO])=>{
  const native=encodeSourceNativeGP(read(file));
  const mE=minWindow(native,(n)=>n===E),mEO=minWindow(native,(n)=>n===E||n===O);
  assert.equal(mE.count,expectedE);assert.equal(mEO.count,expectedEO);
  assert.ok(mE.count>nine.E&&mEO.count>nine.EO);
  return {name,minimumE:mE,minimumEO:mEO};
 });
 const native=encodeSourceNativeGP(read(corpora[0][1])).slice(0,12956);
 const positive=plant(native);
 assert.deepEqual([positive.nativeE,positive.nativeEO],[1529,2661]);
 const result={original:12956,global,nine,
  escapeControls:{lastTwoGlobal:global2,lastTwoNine:nine2,perPage:byPage},
  controls,positive,
  interpretation:"No direct GP29 English possible under a stationary previous-cipher-symbol-only bijective state with global or nine-chapter secret alphabet maps. No unknown plaintext."};
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={cap,minWindow,plant,main};
