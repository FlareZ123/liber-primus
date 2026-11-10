'use strict';
/** Original LP2 81^2 ternary square and fixed-rune relabeling test.
 * Run: node sims/lp2_81square_ternary_route_invariant.cjs
 * Node 22 / CommonJS. Noninvertible anti-repeat rewrite is a forward control.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const c=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(c.length,12956);assert.deepEqual(c.slice(6555,6561),c.slice(-6));
const original=c.slice(0,6561),names=['row','snake','col','diagonal','morton_lsb','morton_msb','peano','block9','digitreverse'];
const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} raw @returns {number[]} */
function gp(raw){
 const words=raw.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').match(/[A-Z]+/g)||[],out=[];
 for(const w of words)for(let i=0;i<w.length;){const t=tok.find(q=>w.startsWith(q.s,i));if(t){out.push(t.i);i+=t.s.length}else i++}return out;
}
/** @param {number[]} arr */
function mi(arr){
 const n=arr.length-1,joint=new Uint32Array(841),a=new Uint32Array(29),b=new Uint32Array(29);let score=0,equal=0;
 for(let i=1;i<arr.length;i++){const x=arr[i-1],y=arr[i];joint[x*29+y]++;a[x]++;b[y]++;equal+=Number(x===y)}
 for(let x=0;x<29;x++)for(let y=0;y<29;y++){const h=joint[x*29+y];if(h)score+=h/n*Math.log(h*n/(a[x]*b[y]))}
 return{score,equal};
}
/** @param {string} mode @returns {number[]} */
function route(mode){
 const out=[];
 if(mode==='diagonal'){for(let s=0;s<=160;s++)for(let y=0;y<81;y++){const x=s-y;if(x>=0&&x<81)out.push(81*y+x)}return out}
 for(let t=0;t<6561;t++){
  let x=0,y=0;
  if(mode==='row'){x=t%81;y=Math.floor(t/81)}
  else if(mode==='col'){x=Math.floor(t/81);y=t%81}
  else if(mode==='snake'){y=Math.floor(t/81);x=y%2?80-t%81:t%81}
  else if(mode==='block9'){const a=Math.floor(t/81),b=t%81;x=(a%9)*9+b%9;y=Math.floor(a/9)*9+Math.floor(b/9)}
  else if(mode==='digitreverse'){let v=t,k=0;for(let i=0;i<8;i++){k=3*k+v%3;v=Math.floor(v/3)}x=k%81;y=Math.floor(k/81)}
  else if(mode==='morton_lsb'||mode==='morton_msb'){
   let v=t;for(let i=0;i<4;i++){const a=v%3;v=Math.floor(v/3);const b=v%3;v=Math.floor(v/3);const k=mode==='morton_lsb'?i:3-i;x+=a*3**k;y+=b*3**k}
  }else if(mode==='peano'){
   let v=t,h=27;for(let i=0;i<4;i++){const q=Math.floor(v/9**(3-i));v%=9**(3-i);const r=Math.floor(q/3),s=q%3;x+=(r%2?2-s:s)*h;y+=r*h;h/=3}
  }else throw Error(mode);
  out.push(81*y+x);
 }
 assert.equal(new Set(out).size,6561);return out;
}
/** @param {number[]} p @param {number} o @returns {number[]} */
function orient(p,o){return p.map(q=>{let x=q%81,y=Math.floor(q/81);if(o&1)[x,y]=[y,x];if(o&2)x=80-x;if(o&4)y=80-y;return y*81+x})}
/** @param {number} seed @returns {()=>number} */
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}}
/** @param {number[]} plain @param {number[]} p @param {number} seed */
function plant(plain,p,seed){
 const r=rng(seed),perm=Array.from({length:29},(_,i)=>i),raster=new Array(6561);
 for(let i=28;i>0;i--){const j=r()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]]}
 const inv=new Array(29);perm.forEach((v,i)=>inv[v]=i);
 for(let i=0;i<6561;i++)raster[p[i]]=perm[plain[i]];
 assert.deepEqual(p.map(i=>inv[raster[i]]),plain);
 let changed=0;
 for(let i=1;i<6561;i++)if(raster[i]===raster[i-1]&&r()%10000<8100){
  let q=r()%28;if(q>=raster[i-1])q++;raster[i]=q;changed++;
 }
 return{raster,read:p.map(i=>raster[i]),changed};
}
function main(){
 const books=['resources/control/shakespeare_first300k.txt','resources/control/gibran_prophet_58585.txt'].map(p=>gp(read(p)));
 assert.deepEqual(books.map(b=>b.length),[217644,62696]);
 const out={originalRow:mi(original),originalMax:0,plantMin:Infinity,plants:0,
  forwardModel:'Secret monoalphabetic rune substitution plus 81% printed-order noninjective anti-repeat',
  original:'First 6561 LP2 GP runes',routes:[],worst:null};
 for(const name of names){
  const s={name,originalMax:0,plantMin:Infinity,plantMean:0,printedEqualMean:0,count:0},base=route(name);
  for(let o=0;o<8;o++){
   const p=orient(base,o);
   s.originalMax=Math.max(s.originalMax,mi(p.map(i=>original[i])).score);
   for(let author=0;author<2;author++)for(let j=0;j<12;j++){
    const offset=j*2500+(author?11:0),plain=books[author].slice(offset,offset+6561);
    assert.equal(plain.length,6561);
    const seed=(0x330181+j+author*1000+o*107+names.indexOf(name)*10333)>>>0;
    const sample=plant(plain,p,seed),z=mi(sample.read).score;
    const repeats=mi(sample.raster).equal;
    s.plantMin=Math.min(s.plantMin,z);s.plantMean+=z;s.printedEqualMean+=repeats;s.count++;
    if(z<out.plantMin){out.plantMin=z;out.worst={name,orientation:o,author,offset,score:z,overwritten:sample.changed,printedAdjacentEqual:repeats}}
   }
  }
  s.plantMean/=s.count;s.printedEqualMean/=s.count;
  out.plants+=s.count;out.originalMax=Math.max(out.originalMax,s.originalMax);out.routes.push(s);
 }
 assert.equal(out.plants,1728);
 assert(Math.abs(out.originalRow.score-0.07973851996452605)<1e-10);
 assert(Math.abs(out.plantMin-0.3186640189243091)<1e-10);
 console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
module.exports={gp,mi,route,orient,plant};
