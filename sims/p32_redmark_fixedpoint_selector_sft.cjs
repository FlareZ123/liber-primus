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
const transcript=fs.readFileSync(path.join(ROOT,'resources/lp2-transcription.txt'),'utf8');
const clauses=transcript.split('%')[32].replace(/\/\s*/gu,'').split(/[.&$§]/u).map(source=>(source.match(/[\u16A0-\u16FF]+/gu)||[])).filter(words=>words.length);
const totalWords=clauses.reduce((n,words)=>n+words.length,0),firstClauseWords=clauses[0].length,centralCellCount=5*5;
if(p32.length!==121)throw Error('p32 grid is not 11x11');
if(JSON.stringify(clauses.map(words=>words.length))!==JSON.stringify([7,15])||totalWords!==22||centralCellCount!==25)throw Error('p32 source counts changed');
const ringOffsets=[...Array.from({length:5},(_,i)=>36+i),...[4,5,6,7].map(r=>11*r+7),...[6,5,4,3].map(c=>77+c),...[6,5,4].map(r=>11*r+3)],ring=ringOffsets.map(i=>p32[i]);
if(JSON.stringify(ring)!==JSON.stringify(EXPECTED_RING))throw Error('p32 ring changed');
function sideSums(v,mask){const sums=INTERIORS.map(g=>g.reduce((n,i)=>n+v[i],0));for(let k=0;k<4;k++)sums[CORNER_SIDES[k][(mask>>>k)&1]]+=v[CORNERS[k]];return sums;}
function fixedPoints(M){const [a,b,c,d]=M,out=[];for(let x=0;x<MOD;x++){const den=mod(c*x+d);if(den!==0&&mod(a*x+b)===mod(x*den))out.push(x);}if(c===0)out.push('infinity');return out;}
function det(M){return mod(M[0]*M[3]-M[1]*M[2]);}
function hasTarget(M){return det(M)!==0&&JSON.stringify(fixedPoints(M))===JSON.stringify(TARGET);}
function inv(x){for(let y=1;y<MOD;y++)if(mod(x*y)===1)return y;throw Error('noninvertible');}
function applyMobius(M,x){const [a,b,c,d]=M,den=mod(c*x+d);return den===0?null:mod((a*x+b)*inv(den));}
function crossRatioMultiplier(M,alpha,beta){if(!hasTarget(M)||alpha!==TARGET[0]||beta!==TARGET[1])return null;for(let x=0;x<MOD;x++){if(x===alpha||x===beta)continue;const y=applyMobius(M,x);if(y===null||y===alpha||y===beta)continue;const hx=mod((x-alpha)*inv(x-beta)),hy=mod((y-alpha)*inv(y-beta));return mod(hy*inv(hx));}return null;}
function pglOrder(M){let P=[1,0,0,1];for(let n=1;n<=60;n++){const [p,q,r,s]=P,[a,b,c,d]=M;P=[mod(p*a+q*c),mod(p*b+q*d),mod(r*a+s*c),mod(r*b+s*d)];if(P[1]===0&&P[2]===0&&P[0]===P[3]&&P[0]!==0)return n;}return null;}
const assignments=[];for(let mask=0;mask<16;mask++){const raw=sideSums(ring,mask),M=raw.map(mod);assignments.push({mask,raw_sides_NESW:raw,matrix:[[M[0],M[1]],[M[2],M[3]]],determinant:det(M),fixed_points:fixedPoints(M),projective_order:pglOrder(M),target_pair_match:hasTarget(M)});}
const matches=assignments.filter(x=>x.target_pair_match);if(matches.length!==1||matches[0].mask!==HORIZONTAL_MASK||matches[0].projective_order!==7)throw Error('corner selector did not uniquely select mask 4');
const sourceAlpha=totalWords,sourceBeta=centralCellCount,sourceLambda=firstClauseWords;
const countMatrix=[mod(sourceBeta*sourceLambda-sourceAlpha),mod(sourceAlpha*sourceBeta*(1-sourceLambda)),mod(sourceLambda-1),mod(sourceBeta-sourceLambda*sourceAlpha)];
const selectedFlat=matches[0].matrix.flat(),markRows=geometry.row_occupancy_top_to_bottom.length;
if(JSON.stringify(fixedPoints(countMatrix))!==JSON.stringify(TARGET)||crossRatioMultiplier(countMatrix,sourceAlpha,sourceBeta)!==sourceLambda)throw Error('source-count matrix self-description failed');
if(JSON.stringify(countMatrix.map(x=>mod(markRows*x)))!==JSON.stringify(selectedFlat))throw Error('nine mark rows do not scale source-count matrix to ring matrix');
if(applyMobius(selectedFlat,geometry.red_components)!==3301%MOD)throw Error('red-dot seed no longer maps to 3301 residue');
const freeOffsets=[];for(let r=1;r<11;r++)for(let c=1;c<11;c++)freeOffsets.push(11*r+c);
const sample=freeOffsets.map(i=>p32[i]),ringIndices=ringOffsets.map(i=>freeOffsets.indexOf(i));let rngState=seed;
function randomBelow(n){rngState^=rngState<<13;rngState^=rngState>>>17;rngState^=rngState<<5;return(rngState>>>0)%n;}
let horizontal=0,anyPair=0,anyPairOrder7=0,totalMatchingAssignments=0,horizontalSelfDescription=0,anySelfDescription=0;
for(let t=0;t<trials;t++){for(let i=sample.length-1;i>0;i--){const j=randomBelow(i+1);[sample[i],sample[j]]=[sample[j],sample[i]];}const v=ringIndices.map(i=>sample[i]);let pairCount=0,pairOrder7=false,selfDescription=false;for(let mask=0;mask<16;mask++){const M=sideSums(v,mask).map(mod);if(hasTarget(M)){pairCount++;if(pglOrder(M)===7)pairOrder7=true;if(crossRatioMultiplier(M,sourceAlpha,sourceBeta)===sourceLambda){selfDescription=true;if(mask===HORIZONTAL_MASK)horizontalSelfDescription++;}}}if(pairCount){anyPair++;totalMatchingAssignments+=pairCount;}if(pairOrder7)anyPairOrder7++;if(selfDescription)anySelfDescription++;if(hasTarget(sideSums(v,HORIZONTAL_MASK).map(mod)))horizontal++;}
if(horizontalSelfDescription!==6||anySelfDescription!==108)throw Error('source-count self-description null changed');
const output={geometry,row_code:{bits,value,complement_bits:complement.toString(2).padStart(bits.length,'0'),complement,mod29_pair:binaryPair},source_count_self_description:{total_words:totalWords,central_5x5_cells:centralCellCount,first_clause_words:firstClauseWords,cross_ratio_coordinate:'h(x)=(x-22)/(x-25)',multiplier:sourceLambda,count_matrix:[countMatrix.slice(0,2),countMatrix.slice(2)],mark_row_scalar:markRows,scaled_matrix:[countMatrix.slice(0,2).map(x=>mod(markRows*x)),countMatrix.slice(2).map(x=>mod(markRows*x))],red_dot_seed:geometry.red_components,seed_image:applyMobius(selectedFlat,geometry.red_components),cicada_number_residue:3301%MOD},ring_prime_values_clockwise:ring,corner_assignments:assignments,unique_match_mask:HORIZONTAL_MASK,selected_matrix:matches[0].matrix,selected_fixed_points:matches[0].fixed_points,selected_projective_order:7,conditional_null:{trials,seed_hex:'0x'+seed.toString(16),horizontal_pair:horizontal,any_corner_pair:anyPair,any_corner_pair_order7:anyPairOrder7,total_matching_assignments:totalMatchingAssignments,horizontal_self_description:horizontalSelfDescription,any_corner_self_description:anySelfDescription,add_one_p_horizontal:(horizontal+1)/(trials+1),add_one_p_any_pair:(anyPair+1)/(trials+1),add_one_p_any_pair_order7:(anyPairOrder7+1)/(trials+1),add_one_p_horizontal_self_description:(horizontalSelfDescription+1)/(trials+1),add_one_p_any_self_description:(anySelfDescription+1)/(trials+1)},interpretation:'Candidate source self-description and cross-page selector, not a plaintext decryption. Counts 22/25/7 reconstruct the projective map; nine mark rows fix the displayed scalar; 13 red dots map to 3301 mod29. The same 5+8 stencil recurs on p53 and solved p56.'};
console.log(JSON.stringify(output,null,2));
