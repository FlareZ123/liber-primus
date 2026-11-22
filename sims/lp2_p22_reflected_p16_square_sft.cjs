"use strict";
/**
 * Original LP2 p22, source-motivated horizontal-reflection of p16 square.
 * The p2-insect and p22-recliner are each horizontally reflected copies of
 * art on LP1 p16. Their same-reflection coincidence selects one conditional
 * p16 candidate over p15 (whose insect requires a 90-degree rotation).
 * This does not prove that the authors selected a square-key inverse.
 * SFT: node sims/lp2_p22_reflected_p16_square_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));
const original=gp.pages.find(x=>x.page===22).indices;
assert.equal(original.length,131);
const Fpositions=original.flatMap((c,i)=>c===0?[i]:[]);
assert.deepEqual(Fpositions,[13,51,55,119,124,128]);
const square=[
 [434,1311,312,278,966],
 [204,812,934,280,1071],
 [626,620,809,620,626],
 [1071,280,934,812,204],
 [966,278,312,1311,434]
];
/** @param {number} n @returns {number} */
function phi(n) {
 let v=n;
 for(let p=2;p*p<=n;p++)if(n%p===0){while(n%p===0)n/=p;v-=v/p;}
 if(n>1)v-=v/n;
 return v;
}
/** @param {number} n @returns {number} */
function mod29(n){return (n%29+29)%29;}
/** @param {number[]} xs @param {number} sign @param {boolean} totient */
function invert(xs,sign,totient){
 let j=0;
 return xs.map(c=>{
   if(c===0)return 0;
   const value=square[Math.floor((j%25)/5)][4-(j%5)];
   j++;
   return mod29(c+sign*(totient?phi(value):value));
 });
}
/** @param {number[]} values */
function ioc(values) {
 const freq=Array(29).fill(0);
 values.forEach(x=>freq[x]++);
 return freq.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
const outputs=[];
for(const totient of [false,true])for(const sign of [-1,+1]){
 const decoded=invert(original,sign,totient);
 assert.equal(decoded.length,131);
 // Confirm exact backward reconstruction under ORIGINAL ciphertext F mask.
 let j=0;
 const back=decoded.map((v,i)=>{
   if(original[i]===0)return 0;
   const value=square[Math.floor((j%25)/5)][4-(j%5)];
   j++;
   return mod29(v-sign*(totient?phi(value):value));
 });
 assert.deepEqual(back,original);
 // Planted GP-native solved p57 text at all 125 consuming slots.
 const solved=gp.pages.find(x=>x.page===57).indices;
 const plantedPlain=[];
 let used=0;
 const plantedCipher=original.map(c=>{
   if(c===0){plantedPlain.push(0);return 0;}
   const value=square[Math.floor((used%25)/5)][4-(used%5)];
   const key=totient?phi(value):value;
   let p=solved[used%solved.length];
   while(mod29(p-sign*key)===0)p=(p+1)%29;
   used++;
   plantedPlain.push(p);
   return mod29(p-sign*key);
 });
 assert.equal(used,125);
 assert.deepEqual(invert(plantedCipher,sign,totient),plantedPlain);
 const score=ioc(decoded);
 assert.ok(score<0.040,"Only near-uniform original outputs are supported");
 outputs.push({squareEncoding:totient?"phi":"raw",sign,
   outputIoc:score,first60Translit:decoded.slice(0,60).map(n=>gp.translit[n]).join(""),
   positiveControl:plantedPlain.length+" exact recovered original-position GP29 symbols"});
}
console.log(JSON.stringify({page:"LP2 p22",source:"LP1 p16 square mirrored horizontally because both copied pictures are horizontal reflections",consumingRUnes:125,literalFs:Fpositions,outputs,verdict:"All four non-fitted mirror inverses produce near-uniform, nonlinguistic original output. Original source-art p16 selection by matching mirror operator is a hypothesis; no plaintext recovered."},null,2));
