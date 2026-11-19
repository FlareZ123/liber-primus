# p0 word-indexed duplicate continuation: block13 candidate and block14 node

<badge>Intermediate candidate — not an established decryption</badge>

## Question

Can the authenticated 2016 signed-message word numbers provide a source-constrained continuation of the p0–p2 27×27 route beyond the established block12 fragment?

This note records one narrow candidate. It does **not** establish a reusable route grammar or overturn the earlier failed prospective transition tests.

## Source and indexing

Use the authenticated cleartext in `resources/historical/cicada2016-4gq25-outguess.asc`. Exclude the greeting `Hello.`, the numeric token `3301`, and the PGP key ID `7A35090F`. The remaining 42 content words are numbered 1–42. The first 27 content-word numbers fit the 27×27 p0–p2 grid and are used as one-based row/column coordinates.

Relevant words:

| Number | Word |
|---:|---|
| 2 | PATH |
| 6 | SEEKS |
| 8 | DEVOTED |
| 9 | LIBER |
| 10 | PRIMUS |
| 11 | IS |
| 12 | THE |
| 16 | ARE |
| 17 | THE |
| 19 | THEIR |
| 21 | IS |
| 22 | THE |
| 23 | ROAD |
| 25 | THEIR |
| 27 | ARE |

The underlying grid is the 729-runic concatenation of LP2 pages 0–2, row-major, 27 symbols per row.

## Established control: block12

The repeated word `IS` occurs at positions 11 and 21. The existing block12 rule takes the later occurrence as the row (21), and the two predecessors of the first occurrence (LIBER 9, PRIMUS 10) as columns 9→10.

- Ciphertext at (21,9)→(21,10): [12,23] = [EO,D].
- Existing block12 key: [2,8,8]; first two symbols [2,8].
- Subtraction mod29 gives [10,15] = [I,S].

This reproduces the existing block12 result in `im-results/lp2-p0-state-block12-is.md`.

## Candidate block13: repeated THE

Apply the same *path selector* to the next relevant repeated word:

- `THE` occurs at positions 12 and 22.
- Later occurrence selects row 22.
- The two predecessors of the first occurrence are PRIMUS 10 and IS 11, selecting columns 10→11.
- Ciphertext at (22,10)→(22,11): [28,0] = [EA,F].
- Reusing the established block11 key [11,11,16], first two symbols [11,11], gives [17,18] = [B,E].

So the exact candidate output is **BE**.

The block11 key source is the [11,17,11] node at (19,16),(23,12),(27,8), the same node identified as the actual block13 key source in Agent25's sealed block13/14 precommit. Its key transform is [11,11,16]. The repeated `THEIR` at positions 19 and 25 may explain reuse of the earlier THEIR-associated node, but that key-reuse selector is not yet independently established.

**Status:** a two-rune candidate, not a verified plaintext word. It is particularly weak as standalone linguistic evidence: `BE` is short and also appears in the signed 2016 message itself.

## Block14: a source-indexed key-node candidate

The actual block14 packet reported in `workplace/20261119-agent25-p0-block13-keynode-precommit.md` is [28,11,28] = [EA,J,EA]. In the original 27×27 grid it occurs exactly once among straight H/V/diagonal triples with radii 1–13:

- Coordinates: (25,2),(25,6),(25,10).
- Direction/radius: horizontal, 4.
- Row 25 is the second `THEIR`.
- Columns 2, 6, 10 are `PATH`, `SEEKS`, `PRIMUS`.
- The step 4 is the DH23 state value (q=4).

This gives a source-indexed explanation for the otherwise unexplained EA-J-EA node, distinct from the failed connected-mirror prediction. Applying the already-used center-φ / Möbius-sum / rotate-left transform:

1. Replace center 11 by φ(11)=10: [28,10,28].
2. μ(φ(28))+μ(φ(11))+μ(φ(28)) = 0+1+0 = 1.
3. Rotate left once: key [10,28,28].

A tempting adjacent readout at row 25, columns 11–13 (IS, THE, WAY) gives ciphertext [23,1,23] = [D,U,D]. Subtracting [10,28,28] yields [13,2,24] = [P,TH,A], i.e. **PTHA**, a permutation of the source word PATH, not PATH itself. This is explicitly **not** a plaintext result. It may be a false path, an indication of an unresolved direction/transposition, or coincidence.

## Strongest objections

1. The block13 key-reuse rule is not independently selected. The repeated `THEIR` may be relevant, but that is presently an interpretation.
2. `BE` is only two runes and is not independent linguistic validation.
3. The block14 node is source-indexed, but no independently selected ciphertext path has been found for its key.
4. The PTHA near-match must not be rescued by an unconstrained transposition; the signed source explicitly warns about false paths.

## Next decisive test

Freeze a complete rule before looking at more plaintext: specify how repeated source words select rows, how predecessor/successor pairs select columns, how key-node reuse is chosen, and how the state packet selects read direction and length. Apply it to all repeated-word cases in the 42-word register, including negative controls. Require more than a short common fragment. If the rule cannot predict a further contiguous plaintext segment without choosing keys or paths after seeing outputs, retire it.

## Reproduction

The following Node.js snippet uses only the two source files named above and reproduces the control, candidate, node uniqueness, and block14 near-match:

```js
const fs = require("node:fs");
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const asc = fs.readFileSync("resources/historical/cicada2016-4gq25-outguess.asc", "utf8");
const body = asc.slice(asc.indexOf("Hello."), asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words = body.replace(/\\b3301\\b/g, "").replace(/\\b7A35090F\\b/g, "")
  .match(/[A-Za-z]+/g).slice(1).map(x => x.toUpperCase());
const flat = [0,1,2].flatMap(n => corpus.pages.find(p => p.page === n).indices);
if (flat.length !== 729 || words.length !== 42) throw Error("unexpected source dimensions");
const grid = Array.from({length:27}, (_,r) => flat.slice(r*27,(r+1)*27));
const at = (r,c) => grid[r-1][c-1];
const mod = x => (x % 29 + 29) % 29;
const phi = n => { let x=n, out=n; for(let p=2;p*p<=x;p++) if(x%p===0){ while(x%p===0)x/=p; out-=out/p; } if(x>1) out-=out/x; return out; };
const mu = n => { let x=n, count=0; for(let p=2;p*p<=x;p++) if(x%p===0){ x/=p; count++; if(x%p===0)return 0; while(x%p===0)x/=p; } if(x>1)count++; return count%2 ? -1 : 1; };
const derive = packet => {
  const x = packet.slice(); x[1] = phi(x[1]);
  const turns = mod(x.reduce((s,v)=>s+mu(phi(v)),0)) % 3;
  return x.slice(turns).concat(x.slice(0,turns));
};
const decrypt = (cipher,key) => cipher.map((v,i)=>mod(v-key[i%key.length]));
const block12C = [at(21,9),at(21,10)];
const block13C = [at(22,10),at(22,11)];
const block11Key = derive([11,17,11]);
const block12Key = derive([8,4,8]);
const block14Packet = [at(25,2),at(25,6),at(25,10)];
const dirs = [[0,1],[1,0],[1,1],[1,-1]];
const hits = [];
for(let r=1;r<=27;r++) for(let c=1;c<=27;c++) for(const [dr,dc] of dirs) for(let k=1;k<=13;k++){
  const pts=[0,1,2].map(j=>[r+j*k*dr,c+j*k*dc]);
  if(pts.some(([x,y])=>x<1||x>27||y<1||y>27)) continue;
  if(pts.every(([x,y],j)=>at(x,y)===[28,11,28][j])) hits.push({r,c,dr,dc,k});
}
const block14Key = derive(block14Packet);
const block14C = [at(25,11),at(25,12),at(25,13)];
const sym = a => a.map(x=>corpus.translit[x]).join("");
console.log({
  block12: {cipher:block12C, key:block12Key, plain:decrypt(block12C,block12Key), text:sym(decrypt(block12C,block12Key))},
  block13Candidate: {cipher:block13C, key:block11Key, plain:decrypt(block13C,block11Key), text:sym(decrypt(block13C,block11Key))},
  block14Packet, block14Hits:hits, block14Key,
  block14Adjacent: {cipher:block14C, plain:decrypt(block14C,block14Key), text:sym(decrypt(block14C,block14Key))}
});
```
