'use strict';
/**
 * LP2 p7 red quartic -> seven-page tree chapter, exact cyclic-convolution and
 * seven-point finite-field Fourier readout; Windows 11 / Node 22 CommonJS SFT.
 * Read-only; all original inputs are checked-in canonical project sources.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const source = load('resources/liber-primus/lp2-corpus.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');
const mod = (n, q = 29) => ((n % q) + q) % q;
const pow = (a, n) => { let z = 1; for (let k = 0; k < n; k++) z = mod(z * a); return z; };
const inverse = x => { for (let i = 1; i < 29; i++) if (mod(x * i) === 1) return i; throw Error('No inverse ' + x); };
const alphabet = new Map(source.runes.map((r, i) => [r, i]));
const known = solved.sections.flatMap(s => [...s.source_text].filter(r => alphabet.has(r)).map(r => alphabet.get(r))).slice(0, 1729);
const original = source.pages.filter(p => p.page >= 8 && p.page <= 14).flatMap(p => p.indices);
assert.equal(original.length, 1729);
assert.equal(known.length, 1729);
assert.deepEqual(source.pages.filter(p => p.page >= 8 && p.page <= 14).map(p => p.indices.length), [255,268,263,273,261,272,137]);
const ioc = xs => { const bins = Array(29).fill(0); xs.forEach(x => bins[x]++); return bins.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1)); };
const equal = (x, y) => assert.ok(Math.abs(x - y) < 1e-12, x + ' != ' + y);
equal(ioc(original), 0.03446048347364137);
equal(ioc(known), 0.0605185506501296);
const packet = (src, layout, pos) => Array.from({length:7}, (_, j) => src[layout === 'row' ? pos * 7 + j : j * 247 + pos]);
const distribute = (out, layout, pos, xs) => xs.forEach((x, j) => { out[layout === 'row' ? pos * 7 + j : j * 247 + pos] = x; });
const mapPackets = (src, layout, fn) => { const out = Array(src.length); for (let i = 0; i < 247; i++) distribute(out, layout, i, fn(packet(src, layout, i))); return out; };
const dft = (src, layout, gen, scale = 1) => mapPackets(src, layout, xs => Array.from({length:7}, (_, j) => mod(scale * xs.reduce((s,x,k) => s + x * pow(gen, (j * k) % 7), 0))));
const primitive = Array.from({length:28}, (_, i) => i + 1).filter(x => x !== 1 && pow(x, 7) === 1);
assert.deepEqual(primitive, [7,16,20,23,24,25]);
for (const layout of ['row','column']) {
  for (const generator of primitive) {
    const base = dft(original, layout, generator);
    const scaled = dft(original, layout, generator, inverse(7));
    const target = layout === 'row' ? 0.034570266478161214 : 0.034501986804618384;
    equal(ioc(base), target);
    equal(ioc(scaled), target);
    console.log('DFT',layout,'root',generator,'raw',ioc(base).toFixed(12));
  }
  const encrypted = dft(known, layout, 7);
  const clear = dft(encrypted, layout, inverse(7), inverse(7));
  assert.deepEqual(clear, known, 'Seven-point DFT known native ciphertext inversion');
}
const coefficients = [11,26,8,15,2,0,0];
const poly = x => mod(coefficients.reduce((s, a, i) => s + a * pow(x, i), 0));
assert.deepEqual([1,...primitive].map(poly), [4,5,20,2,17,7,22]);
const invertMatrix = mat => {
  const N = mat.length;
  const aug = mat.map((row, i) => [...row,...Array.from({length:N},(_,j)=>Number(i===j))]);
  for (let j=0;j<N;j++) {
    const pivot = aug.findIndex((row,k)=>k>=j && row[j]!==0);
    assert.notEqual(pivot,-1,'Cyclic matrix invertible');
    [aug[j],aug[pivot]] = [aug[pivot],aug[j]];
    const factor = inverse(aug[j][j]);
    aug[j] = aug[j].map(x => mod(x*factor));
    for(let k=0;k<N;k++) if (k!==j) {
      const t=aug[k][j];
      aug[k]=aug[k].map((x,i)=>mod(x-t*aug[j][i]));
    }
  }
  const out=aug.map(row=>row.slice(N));
  for(let i=0;i<N;i++)for(let j=0;j<N;j++)
    assert.equal(mod(mat[i].reduce((s,v,k)=>s+v*out[k][j],0)),Number(i===j));
  return out;
};
const apply = (src,layout,matrix) => mapPackets(src,layout,xs=>matrix.map(row=>mod(row.reduce((s,a,i)=>s+a*xs[i],0))));
const expected = {
  'row:1:forward':0.0345434901355954, 'row:1:inverse':0.034605075723496775,
  'row:-1:forward':0.034551523038365145, 'row:-1:inverse':0.034605075723496775,
  'column:1:forward':0.034204099993573676, 'column:1:inverse':0.03507633935265514,
  'column:-1:forward':0.034320577083734975, 'column:-1:inverse':0.03507633935265514
};
for(const layout of ['row','column']) for (const direction of [1,-1]) {
  const matrix=Array.from({length:7},(_,j)=>Array.from({length:7},(_,k)=>coefficients[mod(j-direction*k,7)]));
  const inverted=invertMatrix(matrix);
  for (const [label,mat] of [['forward',matrix],['inverse',inverted]]) {
    const candidate=apply(original,layout,mat);
    equal(ioc(candidate),expected[layout+':'+direction+':'+label]);
    assert.deepEqual(apply(apply(original,layout,matrix),layout,inverted),original,'Exact original reencryption');
    const native=apply(known,layout,matrix);
    assert.deepEqual(apply(native,layout,inverted),known,'Exact native GP positive inversion');
    console.log('CONV',layout,direction,label,'ioc',ioc(candidate).toFixed(12),'opening',candidate.slice(0,28).map(x=>source.translit[x]).join(''));
  }
}
const sevenMean = (src,layout)=>Array.from({length:247},(_,i)=>mod(packet(src,layout,i).reduce((s,x)=>s+x,0)*inverse(7)));
equal(ioc(sevenMean(original,'row')),0.032684901747802905);
equal(ioc(sevenMean(original,'column')),0.03423192126658109);
const pg=source.pages.filter(p=>p.page>=8 && p.page<=14).map(p=>p.indices);
const aligned=Array.from({length:137},(_,i)=>mod(pg.reduce((s,p)=>s+p[i],0)*inverse(7)));
equal(ioc(aligned),0.033061399742378705);
console.log('PASS: 24 exact NTT readouts, eight cyclic-convolution original inverses and native controls, three literal rune means; no recovered unknown plaintext.');
