'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/external/2014-onion2-timing-tail-v1.json'),'utf8'));
const A=data.five_minute_units_A_positions_143_189;
const B=data.five_minute_units_B_positions_192_256;
const bridges=data.bridge_positions_190_191.variants;

function expand(k){
  const bits=[];
  for(const g of k){for(let i=1;i<g;i++)bits.push(0);bits.push(1);}
  return bits;
}
function bytes(bits){
  const out=[];
  for(let i=0;i+7<bits.length;i+=8){
    let v=0;for(let j=0;j<8;j++)v=(v<<1)|bits[i+j];out.push(v);
  }
  return out;
}
function five(bits){
  const out=[];
  for(let i=0;i+4<bits.length;i+=5){
    let v=0;for(let j=0;j<5;j++)v=(v<<1)|bits[i+j];out.push(v);
  }
  return out;
}
const variants=bridges.map(br=>{
  const bits=expand([...A,...br,...B]);
  const b=bytes(bits), f=five(bits);
  return {
    bridge:br,bits:bits.length,
    raw_hex:b.map(x=>x.toString(16).padStart(2,'0')).join(''),
    ascii:b.map(x=>x>=32&&x<=126?String.fromCharCode(x):'.').join(''),
    five_bit_values:f,
    five_bit_invalid_gp29:f.filter(x=>x>=29).length,
    terminal_five_bit:f[f.length-1]
  };
});
if(variants.some(v=>v.bits!==240))throw Error('expected 240 bits');
if(variants.some(v=>v.five_bit_invalid_gp29!==1||v.terminal_five_bit!==29))throw Error('observed 47-valid + terminal29 signature changed');

// The visually tempting prefix 0x414e is determined before interval position 150.
// Positions 143..149 are entirely inside the upstream "unconfirmed-by-witness" block.
if(variants.some(v=>!v.raw_hex.startsWith('414e')))throw Error('prefix changed');

console.log(JSON.stringify({
  sums:{A:A.reduce((a,b)=>a+b,0),B:B.reduce((a,b)=>a+b,0),bridge:6,total:240},
  variants,
  warning:'The 0x414e (AN) prefix depends entirely on upstream positions 143-149, which are explicitly unconfirmed-by-witness. It is not admissible as authenticated plaintext evidence.',
  exact_suffix_note:'Starting at the first multi-witness exact interval (position 152), the remaining span through 256 including the bridge totals 219 five-minute slots, so it has neither an 8-bit nor a 5-bit exact boundary.'
},null,2));
