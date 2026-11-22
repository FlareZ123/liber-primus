"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-grid-256.json"),"utf8"));
const mod=x=>((x%29)+29)%29;
const inv2=15;
const H=(a,b)=>[mod(a-b),mod(a+b)];
const Hinv=(u,v)=>[mod((u+v)*inv2),mod((v-u)*inv2)];
const pow=(b,e)=>{let o=1,x=mod(b);while(e>0){if(e&1)o=mod(o*x);x=mod(x*x);e=Math.floor(e/2)}return o};
const shell=v=>{const out=[];for(let l=0,r=v.length-1;l<r;l++,r--)out.push(...H(v[l],v[r]));if(v.length%2)out.push(v[(v.length-1)/2]);return out};

const state={p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3};
const keys={
  FOUND:[12,28,10,1,8],
  GOOD:[18,18,23,20],
  LUCK:[17,16,4,22],
};
const shells=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,shell(key)]));
assert.deepEqual(shells,{
  FOUND:[4,20,27,0,10],
  GOOD:[27,9,24,12],
  LUCK:[24,10,12,20],
});

// The already observed partial recurrence is real but insufficient:
assert.equal(shells.FOUND[2],shells.GOOD[0]);
assert.equal(shells.GOOD[2],shells.LUCK[0]);

function permutations(values){
  if(values.length===0)return [[]];
  const out=[];
  for(let i=0;i<values.length;i++){
    const rest=values.slice(0,i).concat(values.slice(i+1));
    for(const p of permutations(rest))out.push([values[i],...p]);
  }
  return out;
}
const permutations4=permutations([0,1,2,3]);
assert.equal(permutations4.length,24);

// Director #1738 bounded grammar.
//
// Dimension reconciliation is charged, not chosen: FOUND shell has length5,
// while GOOD/LUCK have length4, so every possible one-coordinate deletion from
// FOUND is admitted before applying one uniform four-coordinate rule.
const sourceScalars=[
  0,1,state.K,state.e,state.g,state.a,state.A,
  mod(state.K*state.g),mod(state.K*state.a),
  state.b,state.B,state.p-1,state.p,mod(state.p+state.K),
  mod(-state.K),mod(-1),
];
assert.equal(new Set(sourceScalars).size,sourceScalars.length);

const preOps={
  id:v=>v.slice(),
  H:v=>[...H(v[0],v[1]),...H(v[2],v[3])],
  Hinv:v=>[...Hinv(v[0],v[1]),...Hinv(v[2],v[3])],
  cube3:v=>v.map(x=>pow(x,3)),
  cube19:v=>v.map(x=>pow(x,19)),
};

const fixedUnary=[];
for(const scalar of sourceScalars){
  fixedUnary.push({name:`add(${scalar})`,apply:x=>mod(x+scalar)});
  fixedUnary.push({name:`mul(${scalar})`,apply:x=>mod(x*scalar)});
}
assert.equal(fixedUnary.length,32);

const fixedHits=[];
for(let drop=0;drop<5;drop++){
  const first=shells.FOUND.filter((_,i)=>i!==drop);
  for(const [preName,pre] of Object.entries(preOps)){
    for(const permutation of permutations4){
      for(const unary of fixedUnary){
        const transform=v=>{
          const z=pre(v);
          return permutation.map(i=>unary.apply(z[i]));
        };
        if(
          transform(first).join(",")===shells.GOOD.join(",") &&
          transform(shells.GOOD).join(",")===shells.LUCK.join(",")
        ){
          fixedHits.push({drop,preName,permutation,unary:unary.name});
        }
      }
    }
  }
}
assert.equal(fixedHits.length,0);

const tokens=grid.pages.flatMap(page=>page.tokens);
assert.equal(tokens[36],"0s"); // FOUND -> GOOD navigation token
assert.equal(tokens[35],"0d"); // GOOD -> LUCK navigation token
assert.equal(tokens[31],"2D"); // LUCK next token, held out if a rule survives
const alphabet60=grid.alphabet;
const alphabet59=alphabet60.replace("f","");
const decode=(token,alphabet)=>{
  const hi=alphabet.indexOf(token[0]),lo=alphabet.indexOf(token[1]);
  return hi<0||lo<0?null:hi*alphabet.length+lo;
};

const tokenModes={
  base60:token=>mod(decode(token,alphabet60)),
  base59:token=>mod(decode(token,alphabet59)),
  second60:token=>mod(alphabet60.indexOf(token[1])),
  second59:token=>mod(alphabet59.indexOf(token[1])),
  digitPlusSecond60:token=>mod(Number(token[0])+alphabet60.indexOf(token[1])),
  digitPlusSecond59:token=>mod(Number(token[0])+alphabet59.indexOf(token[1])),
};
const inverse29=value=>{
  const v=mod(value);
  if(v===0)return null;
  for(let candidate=1;candidate<29;candidate++)if(mod(v*candidate)===1)return candidate;
  return null;
};
const tokenBinary={
  add:(x,t)=>mod(x+t),
  sub:(x,t)=>mod(x-t),
  reverseSub:(x,t)=>mod(t-x),
  mul:(x,t)=>mod(x*t),
  div:(x,t)=>{const inv=inverse29(t);return inv===null?null:mod(x*inv)},
};

const tokenHits=[];
for(let drop=0;drop<5;drop++){
  const first=shells.FOUND.filter((_,i)=>i!==drop);
  for(const [preName,pre] of Object.entries(preOps)){
    for(const permutation of permutations4){
      for(const [tokenModeName,tokenMode] of Object.entries(tokenModes)){
        for(const [binaryName,binary] of Object.entries(tokenBinary)){
          const transform=(v,token)=>{
            const z=pre(v),t=tokenMode(token);
            return permutation.map(i=>binary(z[i],t));
          };
          const good=transform(first,tokens[36]);
          const luck=transform(shells.GOOD,tokens[35]);
          if(
            good.every(Number.isInteger) &&
            luck.every(Number.isInteger) &&
            good.join(",")===shells.GOOD.join(",") &&
            luck.join(",")===shells.LUCK.join(",")
          ){
            tokenHits.push({drop,preName,permutation,tokenModeName,binaryName,next:transform(shells.LUCK,tokens[31])});
          }
        }
      }
    }
  }
}
assert.equal(tokenHits.length,0);

const totals={
  fixed:5*Object.keys(preOps).length*permutations4.length*fixedUnary.length,
  tokenDriven:5*Object.keys(preOps).length*permutations4.length*
    Object.keys(tokenModes).length*Object.keys(tokenBinary).length,
};
assert.deepEqual(totals,{fixed:19200,tokenDriven:18000});
assert.equal(totals.fixed+totals.tokenDriven,37200);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "Director #1738 rejection: no compact uniform source-state transition in the charged 37,200-rule grammar maps the published FOUND key shell to GOOD and GOOD to LUCK; retain the shared plaintext H-shell structure and cross-object key bridges, but classify the three exact inverse keys as independently source-constrained/target-conditioned until a new predeclared transition is supplied",
  state,
  keys,
  shells,
  observedPartialRecurrence:{
    found2_to_good0:shells.FOUND[2],
    good2_to_luck0:shells.GOOD[2],
  },
  grammar:{
    foundDimensionChoices:5,
    preOps:Object.keys(preOps),
    permutations:permutations4.length,
    sourceScalars,
    fixedUnary:fixedUnary.length,
    tokenModes:Object.keys(tokenModes),
    tokenBinary:Object.keys(tokenBinary),
    transitionTokens:{FOUND_to_GOOD:tokens[36],GOOD_to_LUCK:tokens[35],LUCK_next:tokens[31]},
    totals,
    total:totals.fixed+totals.tokenDriven,
  },
  hits:{fixed:fixedHits,tokenDriven:tokenHits},
},null,2));
