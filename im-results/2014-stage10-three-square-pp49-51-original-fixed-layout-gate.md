# Original 2014 Stage10 three-square contract versus LP2 pp49–51

**Decision (27 November 2026; Director #3103 and #3226):** The source-fixed top-left 5×5/7×7/5×5 transfer fails, and the one centered p50 7×7 candidate selected by its 13-row geometry and horizontal-reflection alternatives also fails the historical 1033 magic-square test. The exact historical decimal order/sum field grammar also has no positive-order operand in the literal LP2 numeric fields. No plaintext, cipher, missing server handler or independent key emerges.

## Historical source and original artifact

The contemporaneous original Onion6/Stage10 `/cgi-bin/squares` participant form identifies fields **`53301` (order five, sum 3301), `71033` (order seven, sum 1033), `51033` (order five, sum 1033)**. The signed instructions authenticate the requests; neither the client form nor its static confirmation reveals the Cicada-side validator. This **Stage10 challenge preceded the Stage11 release of Liber Primus**. [Source/handler boundary](2014-stage10-squares-cgi-source-boundary.md).

Original manuscript images `66.jpg`, `67.jpg`, `68.jpg` are physical pp49, 50, 51. I visually inspected their original-image layouts and first 5/7 printed rows against [the canonical source transcription](../resources/liber-primus/lp2-grid-256.json). The pages contain exactly **10, 13, 9 rows**, each with eight two-character tokens, respectively 80, 104 and 72 cells. The source's 60-character alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. For this conditional fixed test alone, a token `QR` maps to `60×index(Q)+index(R)`, reproducing the canonical bytes. The historically unresolved radix59/60 interpretation is not resolved by this test.

The original p33 cuneiform header prints the two numbers **1033 and 3301**, which motivates an independent check, but gives no original selection of cell coordinates or a page-to-square mapping.

## Locked original-page calculation

Test physical p49→5×5/3301, p50→7×7/1033, p51→5×5/1033. On each page use only rows 1–n and columns 1–n (not a 16×16 reshape), preserving the physical order. Sum every row, every column and both diagonals. No offset/rotation/column permutation/alternate radix search was performed.

| Original page and label | Top-left row sums | Column sums | Two diagonal sums | Pass? |
|---|---|---|---|---|
| p49 `66.jpg`, `53301`, n=5 | 884, 966, 473, 655, 519 | 640, 994, 708, 505, 650 | 546, 647 | No |
| p50 `67.jpg`, `71033`, n=7 | 906, 1054, 822, 664, 920, 615, 968 | 1013, 1050, 871, 915, 742, 857, 501 | 798, 1131 | No |
| p51 `68.jpg`, `51033`, n=5 | 422, 579, 655, 369, 626 | 437, 779, 541, 358, 536 | 611, 653 | No |

Exact decoded top-left matrices, in source physical row order:

```text
p49:              p50:                           p51:
203 231 167 186  97    142  58 201 193 173  28 111    128 156  19  81  38
 92 249 156 222 247    211 220 198  49 236  84  56      0 155 159  89 176
121 202  15  33 102    222 150  72  34  83 229  32    110  74 209  68 194
109 198 173  25 150    122  63  31 218  14 184  32     57 175   6  61  70
115 114 197  39  54     73 143 197 247  54 171  35    142 219 148  59  58
                         42 237  86  54  13  20 163
                        201 179  86 120 169 141  72
```

**Stronger p49 bound:** all conventional source tokens encode bytes 0–255. Thus **any five source cells, no matter where selected, sum to at most 5×255=1275**, strictly below 3301. No page-local permutation can rescue the order-five/3301 square under this numeric domain. This does not exclude other, source-specified non-byte semantics.

## Source-cued centered p50 reflection control (Director #3103)

The original p50 tree pair independently selects the horizontal column reflection `c → 7−c`; see [the image-derived selector](lp2-p50-tree-reflection-selector.md). This is a real orientation constraint, but it does not itself select a start cell or a square receiver. To test the most economical Stage10 order-seven transfer without a generic block search, use the unique centered seven-row window of p50's 13 rows (zero-based rows 3–9). Since the page has eight columns, the reflection-related seven-column windows are columns 0–6 and 1–7; both are tested.

Using the same conditional base60 byte decoding as the original-page test, their sums are:

| Centered p50 window | Row sums | Column sums | Diagonals | All 16 sums = 1033? |
|---|---|---|---|---|
| rows 3–9, columns 0–6 | 664, 920, 615, 968, 836, 1173, 942 | 804, 994, 739, 937, 793, 987, 864 | 1139, 1010 | No |
| rows 3–9, columns 1–7 | 657, 1031, 766, 938, 978, 1237, 959 | 994, 739, 937, 793, 987, 864, 1252 | 930, 477 | No |

The second window's 1031 row sum is two below 1033; the remaining line sums do not approach a magic square. Do not repair this with an inferred +2. The 13×8 numeric block itself has no row pair satisfying `row[r] = reverse(row[12−r])`, and its central row is not palindromic. Thus the artwork selects a column-reflection involution, not a mirror-symmetric numeric square. This bounded test does not resolve the radix or establish that Stage10's magic-square receiver applies to p50.

The p49 5×5/3301 transfer remains impossible in the byte domain: even five maximum byte values sum to only 1275. The complete 5/7/5 Stage10→LP2 mapping therefore remains rejected.

## Independent visual-layout follow-up (#1663)

The exact Stage10 response is now known to return LP1 pp14–16 themselves. A separate original-image comparison asks whether those three page layouts, rather than the three magic-square operands, predict the LP2 pp49–51 table geometry. They do not. The returned pages have ordered visible structure of eleven prose lines; five prose lines plus insects; then four prose lines, an insect, a heading and a 5×5 square. LP2 pp49–51 instead form one eight-column table split 10/13/9 rows. Repeated three-page framing is common within LP1, and the Stage10 triplet's exact cross-release footer reuse occurs on LP2 p22, not pp49–51. See [the visual-layout gate](2014-stage10-lp1-triplet-lp2-table-layout-gate.md).

## Dual-output field typing, rather than radix conversion (#3226, Agent50, 27 November)

A player had a real example of **one integral label selecting two distinct validation parameters** in the original Stage10 form: the decimal field names `53301`, `71033`, `51033` are each adjacent to an explicit label identifying square order and magic sum. Define `q=floor(N/10000)` and `r=N mod 10000`. The exact label/receiver replay gives:

| Field N | q: dimension receiver | r: line-sum receiver | Original matrix | Exact validation |
|---|---:|---:|---|---|
| 53301 | 5 | 3301 | first blank-separated matrix | all 12 row/column/diagonal sums = 3301 |
| 71033 | 7 | 1033 | second matrix | all 16 = 1033 |
| 51033 | 5 | 1033 | third matrix | all 12 = 1033 |

The three matrices each match exactly one of the three labels; the two dimension-five matrices disambiguate by r, and the two sum-1033 matrices disambiguate by q. This is a genuine typed **decimal field decomposition**, rather than converting an integer to an undifferentiated sequence of radix digits. It is *not* evidence of a particular server-side divmod implementation: the source HTML spells out both values, while its signed prose requests the appropriate squares. The surrounding field labels are original recovered HTML, outside the clear-signed block; the private validator and exact successful POST are still missing. The historical matrix match was already established by #3001; the new decision concerns whether the exact **packed tag grammar** has a receiver in LP2, not another extraction or square permutation.

**Fixed transfer gate:** keep the historical divisor 10000 and independently require an original integral object supplying both a positive square order q and a target sum r. Source image 32.jpg (p15) displays a 4×4 spiral-number panel, with all 16 entries between 708 and 4516; the largest entry is 4516. The cuneiform pair 1033/3301 is also below 10000. The red list labels 1–5 supply enumeration, not a second checksum field. Every original p49–51 cell is precisely two printed characters, and even the *largest possible* two-digit radix60 value 3599 is below 10000. On the actual pinned 256 cells the maximum is 255 at radix60 (251 under the omit-lowercase-f radix59 alphabet), hence all 256 produce q=0; 60 cells also have a literal leading 0. The original Stage11 HTML numeric labels 133 and 331 are separately named title and id fields, not packed square tags. The solved p56 hexadecimal digest is explicitly a different receiver type.

Thus none of these independently visible numeric fields can carry a positive order and four-digit target in the exact historical grammar. Even proposing a two-byte tag carrier (not source-selected) cannot carry the complete historical triplet: 71033 exceeds 65535. A changed divisor, concatenated multi-cell fields, or source-independent pairing of order and sum would need a **new independently visible frame and two typed consumers**. The old natural square receiver above already fails, so no new square extraction or key sweep was performed. This excludes the literal tag transfer, not arbitrary dual-output ciphers.

**Reproducible source check** (executed with the fetched exact source strings in V8; the Node wrapper below reads the identical repository files; p15 numbers separately inspected in original image 32.jpg):

```js
const fs = require('node:fs');
const assert = require('node:assert/strict');
const root = 'resources/';
const html = fs.readFileSync(root+'historical/cicada2014-stage10-original-form.html','utf8');
const labels = [...html.matchAll(/Order (\d+) Square, (\d+)\s*<\/p>\s*<textarea name="(\d+)"/g)]
  .map(m => ({n:+m[3],q:Math.floor(+m[3]/10000),r:+m[3]%10000,order:+m[1],sum:+m[2]}));
assert.deepEqual(labels.map(x=>[x.q,x.r]),labels.map(x=>[x.order,x.sum]));
const matrices=fs.readFileSync(root+'cicada2014-openpuff-magic-squares.txt','utf8')
  .trim().split(/\r?\n\s*\r?\n/).map(b=>b.split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number)));
const sum=a=>a.reduce((s,x)=>s+x,0);
for (const m of matrices) {
  const n=m.length;
  const sums=[...m.map(sum),...m.map((_,j)=>sum(m.map(row=>row[j]))),
    sum(m.map((row,j)=>row[j])),sum(m.map((row,j)=>row[n-1-j]))];
  console.log(n,sums.length,[...new Set(sums)],
    labels.filter(x=>x.q===n&&m.every(row=>row.length===x.q)&&sums.every(s=>s===x.r)).map(x=>x.n));
}
const grid=JSON.parse(fs.readFileSync(root+'liber-primus/lp2-grid-256.json','utf8'));
const tokens=grid.pages.flatMap(p=>p.tokens);
const v60=grid.pages.flatMap(p=>p.bytes);
const a59='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
const v59=tokens.map(t=>59*a59.indexOf(t[0])+a59.indexOf(t[1]));
assert.equal(tokens.length,256);
assert.equal(Math.max(...v60),255);
assert.equal(Math.max(...v59),251);
assert(v60.every(n=>Math.floor(n/10000)===0));
assert(v59.every(n=>Math.floor(n/10000)===0));
console.log({leadingZero:tokens.filter(t=>t[0]==='0').length});
```

**Decision for #3226:** the historical two-parameter tag is real, but neither original LP2 field framing nor the separate order/checksum consumer is present for this exact transfer. No new key, plaintext, or source-selected invertible operation is available. Do not use the historical field grammar to justify arbitrary radix/decomposition experiments. Reopen only on a source-selected multi-field operand and independent consuming operation.

## Reproducer and controls

[CommonJS original-input SFT](../sims/lp2_stage10_three_square_pp49_51_sft.cjs) loads the full 256-cell canonical source and asserts that every token matches its source byte under the frozen alphabet. It verifies page image names, printed row counts, the locked top-left blocks, both reflection-related centered p50 7×7 windows, all row/column/diagonal sums and the p49 upper bound. It constructs independent genuine order-five and order-seven magic squares (sum 65 and 175) by the Siamese method and confirms that perturbing a cell breaks the magic-square predicate. The source-block arithmetic and positive/negative control calculations were independently executed in the JavaScript tool runtime.

**Disposition:** retire the exact Stage10 square→LP2 natural-page transfer, including the centered/reflection-related p50 order-seven candidate. A further square extraction requires an **independent contemporary rule selecting the exact cells and a compatible numeric domain**; a packed-label transfer also needs a source-visible field containing both typed values. The 2014 historical squares remain valid clues in their own Stage10 context, with the missing Cicada-side validator reserved for #494. No result here authenticates a cipher for the 56 unsolved LP2 pages.
