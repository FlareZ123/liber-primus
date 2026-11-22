# p50 inner-180 to solved-p56 cipher: direct transfer gate

**Status: negative under the fixed p56 key start and four natural table traversals.** No unknown plaintext or key recovered.

## Source-constrained hypothesis

The p50 original numeric table is 32×8 = 256 cells. The p57 instruction to “shed our own circumferences” naturally selects the 30×6 = 180-cell interior. This length equals the known solved p56+p57 plaintext register (85 + 95 = 180). A simple human attempt is therefore to treat the inner-180 numeric sequence as ciphertext under the already authenticated p56 prime-totient/F-transparent operation.

The p50 table has two competing visible numeral readings: base60 with alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, and base59 with lowercase `f` omitted. No additional radix, key start, sign, or traversal is fitted. The test fixes the p56 key start at its historical first prime (2), and checks the four obvious row/column reading directions.

## Exact operation

For primes (p_0=2,p_1=3,ldots), the p56 stream uses (k_n=(p_n-1)mod29). Decrypt a non-F ciphertext symbol (c) as (m=(c-k_n)mod29), consuming one key only if (m\ne0). At ciphertext F (0), allow both the transparent F/no-consumption branch and the legal encrypted non-F branch. Any branch that consumes a key and yields plaintext F is forbidden. The reachability dynamic program retains every legal consumed-key count; no language-model pruning is used.

## Reproduction

Run from the repository root with Node.js; no dependencies:

```js
const fs = require("node:fs");
const grid = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-grid-256.json", "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  "resources/liber-primus/lp2-corpus.json", "utf8"));
const tokens = grid.pages.flatMap(p => p.tokens);
const A60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const A59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const mod = x => (x % 29 + 29) % 29;

function primeKeys(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) out.push((x - 1) % 29);
  }
  return out;
}
const key = primeKeys(5000);

function reach(cipher) {
  let states = [{ used: 0, out: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const s of states) {
      if (cipher[i] === 0) next.push({ used: s.used, out: [...s.out, 0] });
      const plain = mod(cipher[i] - key[s.used]);
      if (plain !== 0) next.push({ used: s.used + 1, out: [...s.out, plain] });
    }
    const seen = new Set();
    states = next.filter(s => {
      const id = s.used + ":" + s.out.join(",");
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (!states.length) return { complete: false, fail: i };
  }
  return { complete: true, paths: states.length, outputs: states.map(s => s.out) };
}
function ioc(a) {
  const f = Array(29).fill(0);
  for (const x of a) f[x]++;
  return f.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
const row = [];
for (let r = 1; r < 31; r++) for (let c = 1; c < 7; c++) row.push(r * 8 + c);
const column = [];
for (let c = 1; c < 7; c++) for (let r = 1; r < 31; r++) column.push(r * 8 + c);

const results = [];
for (const [order, cells] of [
  ["row", row], ["row-reverse", [...row].reverse()],
  ["column", column], ["column-reverse", [...column].reverse()]
]) {
  for (const [radix, alphabet] of [["base59", A59], ["base60", A60]]) {
    const cipher = cells.map(i => {
      const token = tokens[i];
      return mod(alphabet.indexOf(token[0]) * alphabet.length +
                 alphabet.indexOf(token[1]));
    });
    const result = reach(cipher);
    results.push({
      order, radix, zeroCount: cipher.filter(x => x === 0).length,
      complete: result.complete, fail: result.fail,
      paths: result.paths,
      ioc: result.outputs?.map(ioc),
      firstOutput: result.outputs?.[0]?.map(i => corpus.translit[i]).join("")
    });
  }
}
const p56 = reach(corpus.pages.find(p => p.page === 56).indices);
console.log(JSON.stringify({ interiorCells: row.length, p56Control: {
  complete: p56.complete,
  terminalConsumedKeys: [...new Set(p56.outputs.map(x => x.length))]
}, results }, null, 2));
```

## Results

| Interior order | Radix | Result |
|---|---|---|
| Row-major | base59 | Complete, 3 legal F paths; IoCs 0.03513, 0.03426, 0.03358 |
| Row-major | base60 | Impossible at zero-based offset 26 |
| Row-major reversed | base59 | Impossible at offset 113 |
| Row-major reversed | base60 | Impossible at offset 71 |
| Column-major | base59 | Impossible at offset 26 |
| Column-major | base60 | Impossible at offset 60 |
| Column-major reversed | base59 | Impossible at offset 6 |
| Column-major reversed | base60 | Impossible at offset 8 |

The p56 positive control is complete, with terminal consumed-key counts 81–85. The only p50 candidate that survives the exact arithmetic gate is base59 row-major, but its three full outputs remain near the uniform 29-symbol IoC (1/29\approx0.03448), far below clear p57's 0.06271. The first output begins `EOWJCDDNYJXEFXXEOSPDDEOIAIULAMUHEAULWFP...`; it is not a plaintext reading.

## Decision and limit

Reject the direct p56 prime-totient/F-transparent cipher as the decoder of the p50 inner-180 under the fixed historical start and the four natural traversals. This does not reject the structural perimeter/interior correspondence, a p50-derived key, another source-selected value operation, or a different use of the 180-cell object. Do not rescue this branch with arbitrary prime starts, custom permutations, or language-tuned exceptions.

## DH-state five-value receiver control

The source-derived p57→p28→p6/p7 DH state gives p=23, A=8, B=19, K=2. Its p6/p7 red-product packet is [A⁻¹,B⁻¹,A,K⁻¹,K] mod23 = [3,17,8,12,2]. As a narrow candidate consumer for the 180-cell interior, I reduced the base60 inner values mod29 and tested this period-5 packet under additive and multiplicative/inverse-multiplicative GP29 forms. IoCs are 0.03513, 0.03451, 0.03402 and 0.03371; none yields readable text. This rejects only these direct periodic consumers of the DH packet on p50 inner180; it does not falsify the DH-state reconstruction or other possible roles.

The same DH packet was also tested under its native modulus23 rather than GP29: reduce each base60 inner value mod23, then apply [3,17,8,12,2] as a period-5 additive key and map residues to the first 23 GP symbols. Both signs are uniform-like (IoC 0.04351/0.04395, baseline 1/23≈0.04348) and yield no readable plaintext. This closes the obvious direct mod23 as well as mod29 periodic receiver for this packet.
