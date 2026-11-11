#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..'),MOD=29,TARGET=[22,25],HORIZONTAL_MASK=4;
const EXPECTED_RING=[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107];
const INTERIORS=[[1,2,3],[5,6,7],[9,10,11],[13,14,15]],CORNERS=[0,4,8,12],CORNER_SIDES=[[0,3],[0,1],[1,2],[2,3]];
const trials=Number(process.argv[2]||200000),seed=Number(process.argv[3]||'0x56356929')>>>0,mod=x=>((x%MOD)+MOD)%MOD;
const geometry=JSON.parse(execFileSync('python3',[path.join(__dirname,'p32_red13_mark_geometry_sft.py')],{cwd:ROOT,encoding:'utf8'}));
if(geometry.red_components!==13||JSON.stringify(geometry.row_occupancy_top_to_bottom)!==JSON.stringify([1,2,1,2,1,2,1,2,1])||JSON.stringify(geometry.column_occupancy_left_to_right)!==JSON.stringify([4,5,4]))throw Error('unexpected p32 red-mark geometry');
const bits=geometry.row_occupancy_top_to_bottom.map(n=>n===1?'1':'0').join(''),value=parseInt(bits,2),complement=(1<<bits.length)-1-value,binaryPair=[value%MOD,complement%MOD].sort((a,b)=>a-b);
if(JSON.stringify(binaryPair)!==JSON.stringify(TARGET))throw Error('row-code pair mismatch');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')),page32=corpus.pages.find(p=>p.page===32),p32=page32.indices.map(i=>corpus.prime[i]);
if(p32.length!==121)throw Error('p32 grid is not 11x11');
const ringOffsets=[...Array.from({length:5},(_,i)=>36+i),...[4,5,6,7].map(r=>11*r+7),...[6,5,4,3].map(c=>77+c),...[6,5,4].map(r=>11*r+3)],ring=ringOffsets.map(i=>p32[i]);
if(JSON.stringify(ring)!==JSON.stringify(EXPECTED_RING))throw Error('p32 ring changed');
function sideSums(v,mask){const sums=INTERIORS.map(g=>g.reduce((n,i)=>n+v[i],0));for(let k=0;k<4;k++)sums[CORNER_SIDES[k][(mask>>>k)&1]]+=v[CORNERS[k]];return sums;}
function fixedPoints(M){const [a,b,c,d]=M,out=[];for(let x=0;x<MOD;x++){const den=mod(c*x+d);if(den!==0&&mod(a*x+b)===mod(x*den))out.push(x);}if(c===0)out.push('infinity');return out;}
function det(M){return mod(M[0]*M[3]-M[1]*M[2]);}
function hasTarget(M){return det(M)!==0&&JSON.stringify(fixedPoints(M))===JSON.stringify(TARGET);}
function pglOrder(M){let P=[1,0,0,1];for(let n=1;n<=60;n++){const [p,q,r,s]=P,[a,b,c,d]=M;P=[mod(p*a+q*c),mod(p*b+q*d),mod(r*a+s*c),mod(r*b+s*d)];if(P[1]===0&&P[2]===0&&P[0]===P[3]&&P[0]!==0)return n;}return null;}
const assignments=[];for(let mask=0;mask<16;mask++){const raw=sideSums(ring,mask),M=raw.map(mod);assignments.push({mask,raw_sides_NESW:raw,matrix:[[M[0],M[1]],[M[2],M[3]]],determinant:det(M),fixed_points:fixedPoints(M),projective_order:pglOrder(M),target_pair_match:hasTarget(M)});}
const matches=assignments.filter(x=>x.target_pair_match);if(matches.length!==1||matches[0].mask!==HORIZONTAL_MASK||matches[0].projective_order!==7)throw Error('corner selector did not uniquely select mask 4');
const freeOffsets=[];for(let r=1;r<11;r++)for(let c=1;c<11;c++)freeOffsets.push(11*r+c);
const sample=freeOffsets.map(i=>p32[i]),ringIndices=ringOffsets.map(i=>freeOffsets.indexOf(i));let rngState=seed;
function randomBelow(n){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;return(rngState>>>0)%n;}
let horizontal=0,anyPair=0,anyPairOrder7=0,totalMatchingAssignments=0;
for(let t=0;t<trials;t++){for(let i=sample.length-1;i>0;i--){const j=randomBelow(i+1);[sample[i],sample[j]]=[sample[j],sample[i]];}const v=ringIndices.map(i=>sample[i]);let pairCount=0,pairOrder7=false;for(let mask=0;mask<16;mask++){const M=sideSums(v,mask).map(mod);if(hasTarget(M)){pairCount++;if(pglOrder(M)===7)pairOrder7=true;}}if(pairCount){anyPair++;totalMatchingAssignments+=pairCount;}if(pairOrder7)anyPairOrder7++;if(hasTarget(sideSums(v,HORIZONTAL_MASK).map(mod)))horizontal++;}
const output={geometry,row_code:{bits,value,complement_bits:complement.toString(2).padStart(bits.length,'0'),complement,mod29_pair:binaryPair},ring_prime_values_clockwise:ring,corner_assignments:assignments,unique_match_mask:HORIZONTAL_MASK,selected_matrix:matches[0].matrix,selected_fixed_points:matches[0].fixed_points,selected_projective_order:7,conditional_null:{trials,seed_hex:'0x'+seed.toString(16),horizontal_pair:horizontal,any_corner_pair:anyPair,any_corner_pair_order7:anyPairOrder7,total_matching_assignments:totalMatchingAssignments,add_one_p_horizontal:(horizontal+1)/(trials+1),add_one_p_any_pair:(anyPair+1)/(trials+1),add_one_p_any_pair_order7:(anyPairOrder7+1)/(trials+1)},interpretation:'Candidate cross-page selector, not a plaintext decryption. The same 5+8 stencil recurs on p53 and solved p56; binary coding/polarity is not explicitly prescribed.'};
console.log(JSON.stringify(output,null,2));
