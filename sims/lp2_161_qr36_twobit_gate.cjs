'use strict';
/**
 * Conditional two-bit-per-rune QR version-36 source test.
 *
 * 12,956 original unsolved runes + the next five solved red-title glyphs
 * = 12,961 GP29 symbols; two bits per symbol leave exactly one pad bit
 * beyond the 161^2 QR modules. Allow each GP29 symbol an entirely unknown
 * binary pair, and *also* arbitrary independent QR row/column XOR masks.
 *
 * Two source-defined layouts:
 *  (1) two consecutive row-major QR module bits per rune;
 *  (2) even-even 81^2 and odd-odd 80^2 rune checkerboard, each supplying
 *      its two bits to adjacent QR modules paired along a serpentine path.
 *
 * Reproduction: node sims/lp2_161_qr36_twobit_gate.cjs
 */
const assert=require('node:assert/strict');
const {
  original,fixedCells,oriented
}=require('./lp2_161_checkerboard_qr36_gate.cjs');

const WIDTH=161;
const MODULES=WIDTH*WIDTH;
const SOURCE_SYMBOLS=(MODULES+1)/2;
const VARIABLE_BITS=58+2*WIDTH;

/** @param {number[]} source @returns {Array<[number,number]>} */
function snakePairs(source) {
  assert.equal(source.length,SOURCE_SYMBOLS);
  const scan=[];
  for(let row=0;row<WIDTH;row++)
    if(row%2===0)for(let col=0;col<WIDTH;col++)scan.push([row,col]);
    else for(let col=WIDTH-1;col>=0;col--)scan.push([row,col]);
  const at=Array(MODULES);
  const usedSource=new Set();
  for(let i=0;i<MODULES;i+=2) {
    const [r,c]=scan[i];
    assert.equal((r+c)%2,0);
    const position=r%2===0
      ? r/2*81+c/2
      : 6561+(r-1)/2*80+(c-1)/2;
    const glyph=source[position];
    assert.ok(glyph>=0&&glyph<=28);
    usedSource.add(position);
    at[r*WIDTH+c]=[glyph,0];
    if(i+1<MODULES) {
      const [r1,c1]=scan[i+1];
      assert.equal((r1+c1)%2,1);
      at[r1*WIDTH+c1]=[glyph,1];
    }
  }
  assert.equal(usedSource.size,SOURCE_SYMBOLS);
  assert.equal(at.filter(x=>x!==undefined).length,MODULES);
  return at;
}

/**
 * @param {number[]} source
 * @param {'serial'|'domino'} model
 * @param {number} orientation QR-space D4 orientation.
 * @returns {(q:{row:number,column:number,required:number})=>[number,number]}
 */
function reader(source,model,orientation) {
  assert.equal(source.length,SOURCE_SYMBOLS);
  const paired=model==='domino'?snakePairs(source):null;
  assert.ok(model==='serial'||model==='domino');
  return q=>{
    const [r,c]=oriented(q.row,q.column,WIDTH,orientation);
    const spot=r*WIDTH+c;
    return paired?paired[spot]:
      [source[Math.floor(spot/2)],spot%2];
  };
}

/** Any fixed two-bit glyph map; each output channel optimized independently. */
function errors(map,cells) {
  const count=Array.from({length:58},()=>[0,0]);
  for(const q of cells) {
    const [glyph,channel]=map(q);
    assert.ok(glyph>=0&&glyph<29);
    assert.ok(channel===0||channel===1);
    count[2*glyph+channel][q.required]++;
  }
  return count.reduce((v,[n0,n1])=>v+Math.min(n0,n1),0);
}

/**
 * Exact GF2 rank test of:
 *  glyphBit[2*g+channel] XOR rowMask[r] XOR colMask[c] = QRfunction[r,c].
 *
 * All 58 secret channel values and 322 independent spatial masks are free.
 * The earliest inconsistent linear dependency provides its own witness.
 */
function feasibility(map,cells) {
  const basis=Array(VARIABLE_BITS).fill(0n);
  const rhs=Array(VARIABLE_BITS).fill(0);
  const provenance=Array(VARIABLE_BITS).fill(0n);
  let rank=0,first=null,contradictions=0;
  for(let i=0;i<cells.length;i++) {
    const q=cells[i],[g,channel]=map(q);
    let coeff=(1n<<BigInt(2*g+channel))^
      (1n<<BigInt(58+q.row))^
      (1n<<BigInt(58+WIDTH+q.column));
    let target=q.required,ancestor=1n<<BigInt(i);
    for(let j=VARIABLE_BITS-1;j>=0;j--) {
      if(!((coeff>>BigInt(j))&1n))continue;
      if(basis[j]) {
        coeff^=basis[j];target^=rhs[j];
        ancestor^=provenance[j];
      }else {
        basis[j]=coeff;rhs[j]=target;provenance[j]=ancestor;
        rank++;break;
      }
    }
    if(coeff===0n&&target===1) {
      contradictions++;
      if(!first) {
        const witness=[];
        for(let k=0;k<cells.length;k++)
          if((ancestor>>BigInt(k))&1n) {
            const [glyph,channel]=map(cells[k]);
            witness.push({...cells[k],glyph,channel});
          }
        first={firstContradictionAt:i+1,witness};
      }
    }
  }
  if(first) {
    assert.equal(first.witness.reduce((x,q)=>x^q.required,0),1);
    for(const selector of [
      q=>2*q.glyph+q.channel,q=>q.row,q=>q.column
    ]) {
      const appearances=new Map();
      for(const q of first.witness) {
        const key=selector(q);
        appearances.set(key,(appearances.get(key)||0)+1);
      }
      for(const n of appearances.values())assert.equal(n%2,0);
    }
  }
  return {rank,consistent:contradictions===0,contradictions,...first};
}

/**
 * Plant exact QR function bits, optionally with secret row/column XOR pads,
 * into a source-layout array under a known 2-bit glyph codebook {0,1,2,3}.
 * @param {'serial'|'domino'} model
 * @param {{row:number,column:number,required:number}[]} cells
 * @param {boolean} masks
 */
function plant(model,cells,masks) {
  const bits=Array(MODULES).fill(0);
  for(const q of cells)bits[q.row*WIDTH+q.column]=q.required;
  if(masks)for(let r=0;r<WIDTH;r++)for(let c=0;c<WIDTH;c++)
    bits[r*WIDTH+c]^=((3*r+1)&1)^((7*c+1)&1);
  const source=Array(SOURCE_SYMBOLS).fill(0);
  if(model==='serial') {
    for(let k=0;k<SOURCE_SYMBOLS;k++) {
      const left=bits[2*k],right=2*k+1<MODULES?bits[2*k+1]:0;
      source[k]=left*2+right;
    }
  }else {
    const scan=[];
    for(let r=0;r<WIDTH;r++)
      if(r%2===0)for(let c=0;c<WIDTH;c++)scan.push([r,c]);
      else for(let c=WIDTH-1;c>=0;c--)scan.push([r,c]);
    for(let k=0;k<MODULES;k+=2) {
      const [r,c]=scan[k];
      const idx=r%2===0 ? r/2*81+c/2
        : 6561+(r-1)/2*80+(c-1)/2;
      const [r1,c1]=scan[Math.min(k+1,MODULES-1)];
      const b1=k+1<MODULES?bits[r1*WIDTH+c1]:0;
      source[idx]=2*bits[r*WIDTH+c]+b1;
    }
  }
  return source;
}

/** Full original-source execution and blinded known-bit controls. */
function main() {
  const source=original();
  assert.equal(source.length,SOURCE_SYMBOLS);
  assert.equal(2*source.length,MODULES+1);
  const fixed=fixedCells(true);
  assert.equal(fixed.length,1342);
  const outputs=[],certificates={};
  for(const model of ['serial','domino']) {
    for(let orientation=0;orientation<8;orientation++) {
      const map=reader(source,model,orientation);
      const errorsCount=errors(map,fixed);
      const gate=feasibility(map,fixed);
      outputs.push({model,orientation,minimumUnmaskedBitEdits:errorsCount,
        secretRowColumnXorFeasible:gate.consistent,
        rank:gate.rank,
        firstContradictionAt:gate.firstContradictionAt,
        firstWitnessLength:gate.witness?.length});
      if(orientation===0)certificates[model]=gate.witness;
    }
    const noMask=plant(model,fixed,false);
    assert.equal(errors(reader(noMask,model,0),fixed),0);
    assert.equal(feasibility(reader(noMask,model,0),fixed).consistent,true);
    const secretPads=plant(model,fixed,true);
    assert.equal(feasibility(reader(secretPads,model,0),fixed).consistent,true);
  }
  const minSerial=Math.min(...outputs.filter(x=>x.model==='serial')
    .map(x=>x.minimumUnmaskedBitEdits));
  const minDomino=Math.min(...outputs.filter(x=>x.model==='domino')
    .map(x=>x.minimumUnmaskedBitEdits));
  assert.equal(minSerial,449);
  assert.equal(minDomino,446);
  assert.equal(outputs.filter(x=>x.secretRowColumnXorFeasible).length,0);
  const out={
    evidenceClass:'conditional two-bit-per-rune QR36 structural exclusion',
    sourceLength:source.length,
    qrVersion:36,qrWidth:WIDTH,
    capacityCheck:'2 * 12961 = 161^2 + 1',
    fixedStructuralQrModules:fixed.length,
    freeGlyphChannelBits:58,
    freeRowColumnMaskBits:322,
    testedLayoutOrientationPairs:outputs.length,
    leastUnmaskedBitEdits:{serial:minSerial,domino:minDomino},
    feasibleOriginalConfigurations:0,
    plantedExactTwoBitAndMaskedControls:4,
    details:outputs,unrotatedCertificates:certificates,
    interpretation:'This excludes two source-fixed direct QR layouts under an arbitrary two-bit GP29 codebook, with arbitrary secret row/column XOR. It does not identify a QR, decipher unknown LP2 plaintext, or preclude nonlinear/position-dependent encodings.'
  };
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
module.exports={snakePairs,reader,errors,feasibility,plant,main};
