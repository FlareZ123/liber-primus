'use strict';
// All-ID bytewise Shamir test for LP2 original printed 32x8 byte table.
// Eight fixed column IDs may be any ordered subset of 1..10.
// Node 22, CommonJS. Executes original source + planted two-row controls.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus','base60-grid.json'),'utf8')).byte_rows;
assert.equal(rows.length,32);
assert.deepEqual(rows[0],[203,231,167,186,97,237,126,183]);
assert.deepEqual(rows[1],[92,249,156,222,247,4,183,212]);

/** @param {'aes'|'rs'|'gf29'} kind */
function field(kind){
 const p=kind==='gf29',n=p?29:256,m=kind==='aes'?0x11b:0x11d;
 const mul=Array.from({length:n},()=>new Uint8Array(n));
 const add=Array.from({length:n},()=>new Uint8Array(n));
 const sub=Array.from({length:n},()=>new Uint8Array(n));
 for(let a=0;a<n;a++)for(let b=0;b<n;b++){
  add[a][b]=p?(a+b)%29:a^b;sub[a][b]=p?(a+29-b)%29:a^b;
  if(p)mul[a][b]=a*b%29;
  else{let x=a,y=b,v=0;for(let k=0;k<8;k++){if(y&1)v^=x;y>>=1;x<<=1;if(x&256)x^=m;}mul[a][b]=v;}
 }
 const inv=new Uint8Array(n),fifth=new Uint8Array(11);
 for(let a=1;a<n;a++){for(let b=1;b<n;b++)if(mul[a][b]===1){inv[a]=b;break;}assert.ok(inv[a]);}
 for(let x=1;x<=10;x++){let v=1;for(let k=0;k<5;k++)v=mul[v][x];fifth[x]=v;}
 return{kind,add,sub,mul,inv,fifth,coerce:x=>p?x%29:x};
}
/** @param {ReturnType<typeof field>} f @param {number[]} xs @param {number[]} ys @param {number} x @param {boolean} monic */
function pred(f,xs,ys,x,monic){
 let sum=0;
 for(let j=0;j<5;j++){
  let v=monic?f.sub[ys[j]][f.fifth[xs[j]]]:ys[j];
  for(let k=0;k<5;k++)if(k!==j)v=f.mul[v][f.mul[f.sub[x][xs[k]]][f.inv[f.sub[xs[j]][xs[k]]]]];
  sum=f.add[sum][v];
 }
 return monic?f.add[sum][f.fifth[x]]:sum;
}
/** @param {number[][]} twoRows @param {ReturnType<typeof field>} f @param {boolean} monic */
function search(twoRows,f,monic){
 const ids=[1,2,3,4,5,6,7,8,9,10],xs=[0,0,0,0,0,0],used=new Set();
 const out={tested:0,six:0,eight:0,two:0,sample:null};
 function visit(d){
  if(d===6){
   out.tested++;
   if(pred(f,xs,twoRows[0],xs[5],monic)!==twoRows[0][5])return;
   out.six++;
   const remain=ids.filter(x=>!used.has(x));
   for(const a of remain)if(pred(f,xs,twoRows[0],a,monic)===twoRows[0][6])
    for(const b of remain)if(a!==b&&pred(f,xs,twoRows[0],b,monic)===twoRows[0][7]){
     out.eight++;const full=[...xs,a,b];if(!out.sample)out.sample=full;
     if(full.slice(5).every((x,k)=>pred(f,full,twoRows[1],x,monic)===twoRows[1][k+5]))out.two++;
    }
   return;
  }
  for(const x of ids)if(!used.has(x)){used.add(x);xs[d]=x;visit(d+1);used.delete(x);}
 }
 visit(0);assert.equal(out.tested,151200);return out;
}
/** @param {ReturnType<typeof field>} f @param {number[]} xs @param {number[]} coef @param {boolean} monic */
function plant(f,xs,coef,monic){
 return xs.map(x=>{let v=0,p=1;for(const c of coef){v=f.add[v][f.mul[c][p]];p=f.mul[p][x];}return monic?f.add[v][p]:v;});
}
const cases=[
 ['aes',false,579,0,0],['aes',true,641,0,0],
 ['rs',false,653,0,0],['rs',true,606,1,0],
 ['gf29',false,5106,84,0],['gf29',true,5367,128,0],
];
const x=[9,3,2,4,10,6,8,1],results=[];
for(const [name,monic,six,eight,two] of cases){
 const f=field(name);
 const original=rows.slice(0,2).map(r=>r.map(f.coerce));
 const t=search(original,f,monic);
 assert.deepEqual([t.six,t.eight,t.two],[six,eight,two]);
 const positive=[plant(f,x,[2,5,7,9,13],monic),plant(f,x,[13,4,11,8,1],monic)];
 for(const row of positive)for(let j=5;j<8;j++)assert.equal(pred(f,x,row,x[j],monic),row[j]);
 const pass=search(positive,f,monic);assert.ok(pass.two>0);
 results.push({field:name,monic,firstSix:t.six,firstRow:t.eight,secondRow:t.two,firstExample:t.sample,plantedSurvivors:pass.two});
}
console.log(JSON.stringify({description:'Original 32x8 grid, 10P8=1814400 column-ID assignments per case, six cases',results},null,2));
