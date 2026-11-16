"use strict";
/**
 * Exact 16x16 ECC200 Reed–Solomon exclusion for LP2's 225 red runes.
 * Node 22 CommonJS standalone test; source corpus is read from the repository.
 * A deliberately stronger test than the existing ECC200 timing-border gate:
 * ignore all timing cells, allow an arbitrary rune-to-bit palette and
 * independent secret row/column XOR masks, then enforce the full ECC.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const atlas=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-ink-annotations.json"),"utf8"));
const pageMap=new Map(corpus.pages.map(p=>[p.page,p]));
const red=atlas.pages.toSorted((a,b)=>a.page-b.page).flatMap(page=>
  (page.red_spans||[]).toSorted((a,b)=>a.start-b.start).flatMap(span=>
    [...span.runes].map((glyph,i)=>{
      const sourceIndex=pageMap.get(page.page).indices[span.start+i];
      assert.equal(corpus.runes[sourceIndex],glyph);
      return sourceIndex;
    })));
assert.equal(red.length,225);
assert.equal(new Set(red).size,29);
assert.equal(atlas.counts.red,225);
assert.equal(atlas.pages.reduce((s,p)=>s+(p.large_punctuation||[]).filter(m=>m[1]===13).length,0),31);

// ECC200 16x16 has a 14x14 interior with 24 codewords, plus four fixed bits.
// The 24x8 ordinary data bits occupy 192/196 modules; the remaining bottom
// right two diagonal modules are black, the two off-diagonal ones are white.
// Placement algorithm is the standard ECC200 Utah/corner routing.
const N=14;
const place=Array.from({length:N},()=>Array(N).fill(null));
/** @param {number} r @param {number} c @param {number} word @param {number} bit */
function put(r,c,word,bit){
 if(r<0){r+=N;c+=4-((N+4)%8);}
 if(c<0){c+=N;r+=4-((N+4)%8);}
 assert(r>=0&&r<N&&c>=0&&c<N);
 assert.equal(place[r][c],null);
 place[r][c]={word,bit};
}
/** @param {number} r @param {number} c @param {number} word */
function utah(r,c,word){
 [[r-2,c-2],[r-2,c-1],[r-1,c-2],[r-1,c-1],
  [r-1,c],[r,c-2],[r,c-1],[r,c]].forEach(([y,x],i)=>put(y,x,word,i));
}
const corners=[
 [[N-1,0],[N-1,1],[N-1,2],[0,N-2],[0,N-1],[1,N-1],[2,N-1],[3,N-1]],
 [[N-3,0],[N-2,0],[N-1,0],[0,N-4],[0,N-3],[0,N-2],[0,N-1],[1,N-1]],
 [[N-3,0],[N-2,0],[N-1,0],[0,N-2],[0,N-1],[1,N-1],[2,N-1],[3,N-1]],
 [[N-1,0],[N-1,N-1],[0,N-3],[0,N-2],[0,N-1],[1,N-3],[1,N-2],[1,N-1]]
];
/** @param {number} kind @param {number} word */
function corner(kind,word){corners[kind].forEach(([r,c],i)=>put(r,c,word,i));}
let row=4,col=0,index=0;
do{
 if(row===N&&col===0)corner(0,index++);
 if(row===N-2&&col===0&&N%4!==0)corner(1,index++);
 if(row===N-2&&col===0&&N%8===4)corner(2,index++);
 if(row===N+4&&col===2&&N%8===0)corner(3,index++);
 do{
  if(row<N&&col>=0&&place[row][col]===null)utah(row,col,index++);
  row-=2;col+=2;
 }while(row>=0&&col<N);
 row++;col+=3;
 do{
  if(row>=0&&col<N&&place[row][col]===null)utah(row,col,index++);
  row+=2;col-=2;
 }while(row<N&&col>=0);
 row+=3;col++;
}while(row<N||col<N);
const ones=[[N-2,N-2],[N-1,N-1]];
const zeros=[[N-2,N-1],[N-1,N-2]];
assert.equal(index,24);
assert.deepEqual(ones.map(([r,c])=>place[r][c]),[null,null]);
assert.deepEqual(zeros.map(([r,c])=>place[r][c]),[null,null]);
for(const [r,c] of ones)place[r][c]={fixed:1};
for(const [r,c] of zeros)place[r][c]={fixed:0};
const words=Array(24).fill(0);
for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(place[r][c].word!==undefined)words[place[r][c].word]++;
assert(words.every(n=>n===8));
const fixed=[...ones.map(([r,c])=>({r,c,rhs:1})),
 ...zeros.map(([r,c])=>({r,c,rhs:0}))];

// The primitive and generator coefficients are published ECC200 constants.
// The coefficients below equal the reverse of ZXing's 12-parity factor set,
// prefixed by 1, independently cross-checking our bit/byte syndrome order.
const exp=[1],log=Array(256).fill(-1);
for(let i=1;i<255;i++){
 const x=exp[i-1]*2;
 exp.push(x>=256?x^0x12d:x);
}
exp.forEach((x,i)=>log[x]=i);
const mul=(a,b)=>a===0||b===0?0:exp[(log[a]+log[b])%255];
let poly=[1];
for(let i=1;i<=12;i++){
 const next=Array(poly.length+1).fill(0);
 for(let j=0;j<poly.length;j++){
  next[j]^=poly[j];next[j+1]^=mul(poly[j],exp[i]);
 }
 poly=next;
}
assert.deepEqual(poly,[1,242,100,178,97,213,142,42,61,91,158,153,41]);
/** @param {number[]} data */
function encode(data){
 assert.equal(data.length,12);
 const buf=[...data,...Array(12).fill(0)];
 for(let i=0;i<12;i++){
  const n=buf[i];
  for(let j=0;j<13;j++)buf[i+j]^=mul(n,poly[j]);
 }
 return buf;
}
/** @param {number[]} data */
function syndrome(data){
 assert.equal(data.length,24);
 return Array.from({length:12},(_,j)=>{
  let x=0;
  for(const byte of data)x=mul(x,exp[j+1])^byte;
  return x;
 });
}
const positive=encode(Array.from({length:12},(_,i)=>(127+i*31)&255));
assert(syndrome(positive).every(x=>x===0),"Valid ECC200 plant rejected");
const corrupted=positive.slice();corrupted[6]^=1;
assert(syndrome(corrupted).some(x=>x!==0),"Corrupted plant accepted");

/** @param {number[]} data @param {number} route */
function layout(data,route){
 if(route===4){
  const out=Array(225).fill(-1);
  let x=7,y=7,dx=1,dy=0,run=1,k=0;
  out[y*15+x]=data[k++];
  while(k<225){
   for(let t=0;t<2;t++){
    for(let j=0;j<run&&k<225;j++){
     x+=dx;y+=dy;
     assert(x>=0&&x<15&&y>=0&&y<15);
     out[y*15+x]=data[k++];
    }
    [dx,dy]=[-dy,dx];
   }
   run++;
  }
  assert(out.every(v=>v>=0));
  return out;
 }
 return Array.from({length:225},(_,i)=>{
  const r=Math.floor(i/15),c=i%15;
  const sourceIndex=route===0?i:route===1?r*15+(r%2===0?c:14-c):
   route===2?c*15+r:c*15+(c%2===0?r:14-r);
  return data[sourceIndex];
 });
}
/**
 * @param {number[]} grid 225 rune IDs row major in 15x15 interior
 * @param {boolean} masks allow 15 secret row and 15 secret column masks
 */
function exclude(grid,masks){
 const vars=masks?59:29;
 // For each arbitrary basis bit construct a complete ECC200 source codeword.
 // Linearity of the 12 syndrome roots gives all necessary equations on
 // secret bits without enumerating 2^29 or 2^59 hidden palettes.
 const perVar=[];
 for(let k=0;k<vars;k++){
  const bytes=Array(24).fill(0);
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
   const p=place[r][c];if(p.word===undefined)continue;
   const bit=k<29?grid[(r+1)*15+c]===k:
    k<44?r+1===k-29:c===k-44;
   if(bit)bytes[p.word]^=1<<(7-p.bit);
  }
  perVar.push(syndrome(bytes));
 }
 const eq=[];
 for(let root=0;root<12;root++)for(let bit=0;bit<8;bit++){
  let a=0n;
  for(let k=0;k<vars;k++)if((perVar[k][root]>>bit)&1)a|=1n<<BigInt(k);
  eq.push({a,b:0});
 }
 for(const {r,c,rhs} of fixed){
  let a=0n;
  for(let k=0;k<vars;k++)if(k<29?grid[(r+1)*15+c]===k:
   k<44?r+1===k-29:c===k-44)a|=1n<<BigInt(k);
  eq.push({a,b:rhs});
 }
 // GF2 proof-carrying elimination. Any final 0=1 row is accompanied
 // by a small list of original equations whose XOR equals 0=1.
 const pivots=Array(vars).fill(null);
 let rank=0,contradiction=false,certificate=[];
 for(let i=0;i<eq.length;i++){
  let a=eq[i].a,b=eq[i].b,proof=1n<<BigInt(i),placed=false;
  for(let k=vars-1;k>=0;k--)if((a>>BigInt(k))&1n){
   if(pivots[k]){
    a^=pivots[k].a;b^=pivots[k].b;proof^=pivots[k].proof;
   }else{
    pivots[k]={a,b,proof};rank++;placed=true;break;
   }
  }
  if(!placed&&a===0n&&b){
   contradiction=true;
   const ids=eq.flatMap((_,j)=>(proof>>BigInt(j))&1n?[j]:[]);
   assert.equal(ids.reduce((x,j)=>x^eq[j].a,0n),0n);
   assert.equal(ids.reduce((x,j)=>x^eq[j].b,0),1);
   if(!certificate.length||ids.length<certificate.length)certificate=ids;
  }
 }
 let eccRank=0;const piv=Array(vars).fill(0n);
 for(const q of eq.slice(0,96)){
  let a=q.a;
  for(let k=vars-1;k>=0;k--)if((a>>BigInt(k))&1n){
   if(piv[k])a^=piv[k];else{piv[k]=a;eccRank++;break;}
  }
 }
 return {vars,rank,eccRank,contradiction,certificate};
}

// Positive complete 16x16 source plant, with black/white rune labels 1/0.
// Both secret-bit models must accept this independently encoded source.
const plant=Array(225).fill(0);
for(let r=0;r<N;r++)for(let c=0;c<N;c++){
 const p=place[r][c];
 plant[(r+1)*15+c]=p.word===undefined?p.fixed:
  ((positive[p.word]>>(7-p.bit))&1);
}
for(const masks of [false,true])
 assert.equal(exclude(plant,masks).contradiction,false,"Original-positive ECC200 plant fails");

const cases=[];
for(let route=0;route<5;route++)for(const reverse of [false,true]){
 const grid=layout(reverse?[...red].reverse():red,route);
 for(const masks of [false,true]){
  const result=exclude(grid,masks);
  assert.equal(result.eccRank,masks?55:29,"Original parity rank changed");
  assert(result.contradiction,"A source-original ECC200 case survived");
  assert(result.certificate.some(i=>i>=96),"Contradiction must involve fixed data module");
  cases.push({route,reverse,masks,rank:result.rank,eccRank:result.eccRank,
    vars:result.vars,proofSize:result.certificate.length,
    fixedRows:result.certificate.filter(i=>i>=96).map(i=>i-96),
    proof:route===0&&!reverse?result.certificate:undefined});
 }
}
assert.equal(cases.length,20);
console.log("Verified original 225 red runes, 31 thirteen-dot markers, ECC200 plant and corrupted control");
console.log(JSON.stringify(cases,null,2));
console.log("PASS: zero undamaged 16x16 ECC200 originals under all 20 source layouts and secret-mask models.");
