#!/usr/bin/env node
"use strict";
/*
 * Exact page-wise copy search with source offset reset independently on every
 * LP2 physical page. Unrestricted, independently secret GP29 bijection chart
 * for each (page, preceding published ciphertext rune) row. Every original
 * within-page repeated-neighbor second glyph is an arbitrary exempt emission.
 *
 * Every GP-native source start is checked for every individual physical page.
 * This is an EXACT ordered-plaintext key-existence test, not a unigram proxy:
 * consistent partial forward and reverse row assignments extend to complete
 * permutations; the source need not align across any two original pages.
 *
 * Run: node sims/lp2_prev_ciph_perpage_anysource_locator_sft.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),A=29;
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const N=pages.reduce((s,p)=>s+p.indices.length,0);
assert.equal(N,12956);assert.equal(pages.length,55);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
function englishGP(text){
  const out=[];
  for(const w of (text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[])){
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){out.push(21);i+=3;}
      else if(w.startsWith("IO",i)){out.push(27);i+=2;}
      else {const item=tokens.find(t=>w.startsWith(t.s,i));
        assert.ok(item,"source GP normalization");out.push(item.i);i+=item.s.length;}
    }
  }
  return Uint8Array.from(out);
}
function latinGP(text){
  const out=[],alpha="0123456789ABCDEFGHIJKLMNOPQRS";
  for(const line of text.split(/\r?\n/)){
    const w=line.trim();if(!w||w.startsWith("#"))continue;
    for(const ch of w){const digit=alpha.indexOf(ch);
      assert.ok(digit>=0,"invalid Latin GP source token");out.push(digit);}
  }
  return Uint8Array.from(out);
}
const inputs=[
  ["Gibran","resources/control/gibran_prophet_58585.txt",62492,englishGP],
  ["Shakespeare","resources/control/shakespeare_first300k.txt",217106,englishGP],
  ["Emerson","resources/control/emerson_essays_2944.txt",321327,englishGP],
  ["Latin Vulgate","resources/control/latin-vulgate-gp-wholewords.txt",204802,latinGP]
];
const references=inputs.map(([name,file,len,translit])=>{
  const gp=translit(read(file));assert.equal(gp.length,len);
  return {name,runes:len,gp};
});
// A complete ordered candidate is compatible exactly when neither a GP
// plaintext index maps to two different ciphertexts, nor the converse,
// for any row selected by an observed predecessor-ciphertext glyph.
function sourceScan(cipher,donor,exceptions=true,collect=3){
  const L=cipher.length;
  const states=new Uint8Array(L-1),targets=new Uint8Array(L-1),skip=new Uint8Array(L-1);
  let repeatEvents=0;
  for(let i=1;i<L;i++){
    states[i-1]=cipher[i-1];targets[i-1]=cipher[i];
    if(cipher[i]===cipher[i-1]){skip[i-1]=1;repeatEvents++;}
  }
  const fMark=new Uint32Array(A*A),rMark=new Uint32Array(A*A);
  const fValue=new Uint8Array(A*A),rValue=new Uint8Array(A*A);
  const matches=[],windows=donor.length-L+1;
  let stamp=0,number=0,maxPrefix=0,maxStart=-1,firstFailSum=0;
  for(let start=0;start<windows;start++){
    stamp++;
    let j=0;
    for(;j<L-1;j++){
      if(exceptions&&skip[j])continue;
      const p=donor[start+j+1],c=targets[j],r=states[j],fs=r*A+p,rs=r*A+c;
      if((fMark[fs]===stamp&&fValue[fs]!==c)||
         (rMark[rs]===stamp&&rValue[rs]!==p))break;
      fMark[fs]=stamp;fValue[fs]=c;
      rMark[rs]=stamp;rValue[rs]=p;
    }
    const prefix=j+1;
    firstFailSum+=prefix;
    if(prefix>maxPrefix){maxPrefix=prefix;maxStart=start;}
    if(prefix===L){
      number++;
      if(matches.length<collect)matches.push(start);
    }
  }
  return {windows,matching_source_windows:number,example_source_offsets:matches,
    furthest_first_conflicting_rune_index:maxPrefix===L?null:maxPrefix,
    max_compatible_runes:maxPrefix,max_source_offset:maxStart,
    average_first_conflict:Math.round(1e3*firstFailSum/windows)/1e3,
    observed_within_page_doublets:repeatEvents};
}
const scan=[];
for(const page of pages){
  const segments=references.map(ref=>({
    name:ref.name,...sourceScan(page.indices,ref.gp,true)
  }));
  scan.push({page:page.page,runes:page.indices.length,donors:segments,
    distinct_matching_source_windows:segments.reduce((a,x)=>a+x.matching_source_windows,0)});
}
// An actual cryptogram whose hidden key is per-page and whose
// plaintext is a nontrivial GP-native Gibran witness. Validate all pages
// and source offsets without using original ciphertext or any original key.
function randGen(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};}
const native=references[0].gp.slice(18000,18000+N),rand=randGen(0x17203301),rare=21;
let at=0,expectedRepeats=0;
const plantCheck=[];
for(const page of pages){
  const L=page.indices.length,
    chart=Array.from({length:A},(_,r)=>{
      const perm=Array.from({length:A},(_,i)=>i);
      for(let i=A-1;i>0;i--){const k=rand()%(i+1);
        [perm[i],perm[k]]=[perm[k],perm[i]];}
      const j=perm.indexOf(r);
      [perm[rare],perm[j]]=[perm[j],perm[rare]];
      return perm;
    });
  const generated=Array(L).fill(-1);
  generated[0]=native[at];
  for(let i=1;i<L;i++){
    const r=generated[i-1],k=chart[r],p=native[at+i];
    generated[i]=k[p];
    assert.equal(k.indexOf(generated[i]),p);
    if(generated[i]===generated[i-1])expectedRepeats++;
  }
  // One full source positive per physical page (potential other matches
  // are outside the scope of the control and not assumed absent).
  const candidate=native.slice(at,at+L);
  let f=Array.from({length:A},()=>new Int16Array(A).fill(-1));
  let b=Array.from({length:A},()=>new Int16Array(A).fill(-1));
  for(let i=1;i<L;i++){
    const r=generated[i-1],p=candidate[i],c=generated[i];
    if(generated[i]===generated[i-1])continue;
    assert.ok(f[r][p]===-1||f[r][p]===c);
    assert.ok(b[r][c]===-1||b[r][c]===p);
    f[r][p]=c;b[r][c]=p;
  }
  plantCheck.push({page:page.page,exact_key_consistent:true,
    source_offset:18000+at,matched_native_runes:L});
  at+=L;
}
assert.equal(at,N);assert.equal(expectedRepeats,100);
const sampled=scan.filter(x=>x.distinct_matching_source_windows>0);
console.log(JSON.stringify({original:{runes:N,pages:pages.length,sources:references.map(x=>({name:x.name,runes:x.runes})),
  total_page_source_windows:scan.reduce((s,p)=>s+p.donors.reduce((a,d)=>a+d.windows,0),0),
  page_level_match_count:sampled.length,pages_with_candidate_source:sampled,
  scan_summary:scan.map(x=>({page:x.page,n:x.runes,source_match_total:x.distinct_matching_source_windows,
    longest_failure_or_success:x.donors.map(y=>[y.name,y.max_compatible_runes,y.matching_source_windows])}))},
  positive:{runes:N,pages:plantCheck.length,exact_runes_recovered:N,source_start:18000,
    actual_equal_neighbors:expectedRepeats,all_page_inverse_rows_consistent:true}},null,2));
