# P28 literal DH line reconstructs the full DH23 tuple from visible line structure

**Agent2, 19 November 2026. Classification: source-derived cryptographic reconstruction. This result does not use the rejected p50-numeral-to-LP-offset coercion. P28 line6 is the sole physical unknown-page rune line beginning literal `DH`. The independently calibrated outer-pair H operation, the line's visible fragment count, its line number, and the literal DH fragment's own H output recover `p=23,g=5,a=6,b=15,A=8,B=19,K=2` under exactly one member of a charged source-visible family. The selection does not require all seven fields to be distinct.**

## Source selector: the manuscript literally says DH

Across the 55 rune-bearing unknown pages there are **594 physical rune lines** in the canonical transcription.

Exactly one begins with the literal GP transliteration:

`DH`.

It is **p28 line6**.

Its printed hyphen/period fragments are:

1. `DH`
2. `NPA`
3. `EORHNNGEAFNF`
4. `OMSN`
5. `EAAIUL`

The source therefore supplies two simple visible integers without cryptanalysis:

- one-based line number **6**;
- fragment count **5**.

The literal `DH` supplies the cryptosystem label before any tuple is fitted.

## Frozen outer-pair operation

Use the already source-calibrated pair operation

`H(x,y)=(x-y,x+y) mod29`.

Its sign and output order were fixed independently from solved `OUR OWN` evidence. The broader outer-shell/circumference interpretation is also motivated by solved p57 material, so the tuple reconstruction does not need `READ OUT` to choose the H sign or pair order.

Apply H to the first and last rune of each printed fragment of length at least two:

| fragment | outer pair | H output |
| --- | --- | --- |
| `DH` | `[23,8]` | **`[15,2]`** |
| `NPA` | `[9,24]` | `[14,4]` |
| `EORHNNGEAFNF` | `[12,0]` | `[12,12]` |
| `OMSN` | `[3,9]` | `[23,12]` |
| `EAAIUL` | `[28,20]` | `[8,19]` |

The complete outer-H stream is:

`15,2,14,4,12,12,23,12,8,19`.

The most source-local pair is the H output of the literal `DH` fragment itself:

`H(D,H)=[15,2]`.

## Charged source-visible family

Do not assume in advance how the two visible counts map to the conventional DH labels or how the literal-DH pair is ordered.

Charge:

- line-number origin: one-based or zero-based;
- count assignment:
  - `g = fragment count, a = line number`;
  - `g = line number, a = fragment count`;
- literal-DH H-pair order:
  - `[b,K]`;
  - `[K,b]`.

For each of these **2 x 2 x 2 = 8** structural variants:

1. choose `p` only from the same line's outer-H outputs and require it to be prime;
2. use the literal-DH pair to fix `b` and `K` in the charged order;
3. derive `A=g^a mod p` and `B=g^b mod p`;
4. require `K=A^b mod p=B^a mod p`;
5. require the derived `A` and `B` to occur in the same line's outer-H output set.

Exactly **one** variant survives:

- one-based line number;
- `g = fragment count = 5`;
- `a = line number = 6`;
- literal-DH pair ordered `[b,K]=[15,2]`;
- `p=23`.

It yields:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

All standard equations verify:

`5^6 mod23 = 8 = A`

`5^15 mod23 = 19 = B`

`8^15 mod23 = 2 = K`

`19^6 mod23 = 2 = K`.

No field-distinctness condition is needed to select this tuple.

## Broad manuscript control

A broader secondary census asks how often any physical rune line can support a seven-distinct-field DH tuple when `p` and `b` are allowed to come from any outer-H output, while line origin and the `g/a` count assignment are charged.

Across the **594** physical rune lines:

- **31** lines admit at least one such seven-distinct-field tuple;
- there are **60** tuple variants total;
- exactly **one** line begins literal `DH`;
- on that literal-DH line, the source-visible 2 x 2 x 2 family above has exactly **one** solution.

This broader control is descriptive only. The primary reconstruction is the literal-DH-fragment family, which does not depend on field distinctness.

## Why the tuple matters

This reconstructs the same DH23 state that earlier repository work reached through several conditional numeric routes, but here the tuple comes from a single source object:

- literal cryptosystem label `DH`;
- printed fragment boundaries;
- one-based physical line number;
- fragment count;
- independently fixed outer-H operation;
- exact standard DH equations.

It avoids the p50 numeral output-type problem identified by Director #1725.

The result also supplies a new source-level way to address the p28 exponent-direction ambiguity. For the recovered standard DH exchange:

`p-1=22`.

The private exponent `a=6` is not invertible modulo22, while `b=15` is:

`15^{-1} mod22 = 3`.

Therefore standard DH inversion gives:

`B^3 mod23 = 19^3 mod23 = 5 = g`.

This selects exponent **3** from the labeled DH algebra without choosing the English output first. It directly addresses the Critic's earlier symmetry between the GP29 cube exponents 3 and19.

A separate report should charge the remaining visible-layer count convention before treating the full p28 `READ OUT` transform as established.

## Human solve-path hypothesis

A plausible source-directed sequence is now:

1. notice p28's unique literal `DH` line;
2. use the already motivated outer-pair H operation on its printed fragments;
3. use the fragment count and physical line number as the two small DH parameters;
4. verify the complete standard DH exchange;
5. invert Bob's secret exponent in the DH group to obtain exponent3;
6. use that exponent in the independently selected p28 center/page-word object;
7. test whether the resulting instruction explains how the line itself should be read.

Steps 1 through 5 are source-derived without p50 numeral coercion or unknown plaintext scoring. Step 6 still needs the already documented visible-layer convention gate.

## Reproduction

Run:

`node sims/lp2_p28_dh_line6_outer_count_sft.cjs`.

The SFT reconstructs all rune-bearing physical lines, verifies the unique literal-DH selector, applies the fixed outer-H operation, exhausts the source-visible 2 x 2 x 2 family, recovers the unique DH23 tuple without a distinctness assumption, and retains the broad manuscript census as a secondary control.
