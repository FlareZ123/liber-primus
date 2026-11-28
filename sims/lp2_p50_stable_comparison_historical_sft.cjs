'use strict';
const fs = require('node:fs');
const path = require('node:path');

/** @param {object} grid Canonical p49–51 grid JSON */
function study(grid) {
  const assert=(condition,message)=>{if(!condition)throw Error(message);};
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const range=n=>Array.from({length:n},(_,i)=>i);
  const order=(keys,indices=range(keys.length))=>indices.map((i,k)=>({i,k})).sort((a,b)=>keys[a.i]-keys[b.i]||a.k-b.k).map(x=>x.i);
  const visit=(key,n,reverseTies=false)=>{
    const ranks=[...key].map(c=>c.charCodeAt(0));
    const columns=order(ranks,reverseTies?range(key.length).reverse():range(key.length));
    const positions=columns.flatMap(c=>range(Math.ceil(Math.max(0,n-c)/key.length)).map(j=>c+j*key.length));
    assert(new Set(positions).size===n,"position coverage");
    return positions;
  };
  const gather=(p,t)=>p.map(i=>t[i]).join("");
  const scatter=(p,t)=>{const a=Array(p.length);p.forEach((i,j)=>{a[i]=t[j];});return a.join("");};
  const p="PROGRAMMINGPRAXIS",k="COACH",k2="STRIPE";
  const v=visit(k,p.length), c=gather(v,p),v2=visit(k2,p.length),c2=gather(v2,c);
  assert(eq(v,[2,7,12,0,5,10,15,3,8,13,4,9,14,1,6,11,16]),"historical visit order");
  assert(c==="OMRPAGIGIARNXRMPS"&&c2==="GNPAPARSRIMOIXMGR","historical published ciphertext");
  assert(scatter(v,scatter(v2,c2))===p,"double inverse");
  const wrong=gather(visit(k,p.length,true),p);
  assert(wrong!==c,"duplicate-key rival");
  const rows=["IDGTKUMLOOARWO","ERTHISUTETLHUT","IATSLLOUIMNITE","LNJ7TFYVOIUAUS","NOCO5JI4MEODZZ"];
  const perm=[2,8,9,1,12,13,11,4,5,7,3,0,6,10];
  const old=rows.map(row=>gather(perm,row)).join("");
  assert(old==="GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO","Cicada historical transfer");
  assert(eq(old.match(/.{14}/g).map(row=>scatter(perm,row)),rows),"Cicada exact inverse");
  const tokens=grid.pages.flatMap(p=>p.tokens),a60=grid.alphabet,a59=a60.replace("f","");
  assert(tokens.length===256&&a60.length===60&&a59.length===59,"grid size");
  const decode=(s,a)=>{const [u,w]=[...s].map(c=>a.indexOf(c));assert(u>=0&&w>=0,"legal digit");return u*a.length+w;};
  const nums60=tokens.map(s=>decode(s,a60)),nums59=tokens.map(s=>decode(s,a59));
  assert(eq(nums60,grid.bytes),"pinned byte parse");
  let pairCount=0, equalCount=0,sameRow=0,crossPage=0,disagree=0;
  const page=i=>i<80?49:i<184?50:51;
  for(let i=0;i<256;i++)for(let j=i+1;j<256;j++){
    pairCount++; if(Math.sign(nums60[i]-nums60[j])!==Math.sign(nums59[i]-nums59[j]))disagree++;
    if(nums60[i]===nums60[j]){equalCount++;if((i>>3)===(j>>3))sameRow++;if(page(i)!==page(j))crossPage++;}
  }
  const groups=new Map();
  tokens.forEach((t,i)=>{if(!groups.has(t))groups.set(t,[]);groups.get(t).push(i);});
  let possibilities=1n;const histogram={};
  for(const xs of groups.values()){histogram[xs.length]=(histogram[xs.length]||0)+1;for(let i=2;i<=xs.length;i++)possibilities*=BigInt(i);}
  const ranks=order(nums60),ranks59=order(nums59),reflected=order(nums60,range(256).map(i=>i^7));
  assert(disagree===0&&sameRow===0&&eq(ranks,ranks59)&&eq(ranks,reflected),"comparison/reflection invariance");
  assert(new Set(ranks).size===256,"complete permutation");
  const inverse=range(256).map(i=>ranks.indexOf(i));
  assert(eq(ranks.map((_,i)=>ranks[inverse[i]]),range(256)),"inverse identity");
  return {historical:{keyword:k,visit:v,single:c,double:c2,reverseTieRival:wrong,exactInverse:true,cicada14Plain:old,cicada14ExactInverse:true},panel:{comparisons:pairCount,radixDisagreements:disagree,distinct:groups.size,histogram,equalCount,sameRowEqualPairs:sameRow,crossPageEqualPairs:crossPage,unconstrainedTiePermutations:possibilities.toString(),tieBits:Math.log2(Number(possibilities)),reflectedPhysicalOrderEqual:eq(ranks,reflected),hypotheticalStableGather:ranks,hypotheticalInverse:inverse}};
}

if (require.main === module) {
  const grid = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/liber-primus/lp2-grid-256.json'), 'utf8'));
  console.log(JSON.stringify(study(grid), null, 2));
}
module.exports = { study };
