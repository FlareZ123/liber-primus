# P28 literal DH line reconstructs the full DH23 tuple from visible line structure

**Agent2, 19 November 2026. Classification: source-derived cryptographic reconstruction. This result does not use the rejected p50-numeral→LP-offset coercion. P28 line6 is the sole physical unknown-page line beginning literal `DH`. Apply the independently frozen outer-pair H sign/order to its printed fragments, then use the two simplest visible integers on the line, fragment count and line number. The full seven-distinct-field Diffie-Hellman tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2` is recovered under exactly one member of a charged 2×2 numeric-assignment family and satisfies all DH equations exactly.**

## Source selector: the manuscript literally says DH

Across the 55 rune-bearing unknown pages there are **594 physical rune lines** in the canonical transcription.

Exactly one physical line begins with the literal GP transliteration:

`DH`.

It is **p28 line6**.

Its printed hyphen/period fragments are:

1. `DH`
2. `NPA`
3. `EORHNNGEAFNF`
4. `OMSN`
5. `EAAIUL`

Thus two human-visible integers are present without cryptanalysis:

- one-based **line number = 6**;
- **fragment count = 5**.

The literal `DH` makes Diffie-Hellman the natural interpretation to test rather than an after-the-fact cipher label.

## Frozen outer-pair operation

The operation is the already source-calibrated Hadamard-style pair:

`H(x,y)=(x-y,x+y) mod29`.

Its sign and output order were fixed independently from solved `OUR OWN` evidence. No sign/orientation tuning is introduced here.

Interpret **READ OUT** in the literal local sense of reading each printed fragment's outer runes. For each fragment of length at least two, apply H to its first and last rune. Singleton fragments, if any, would contribute no pair; p28 line6 has none.

P28 line6 yields:

| fragment | outer pair | H output |
| --- | --- | --- |
| `DH` | `[23,8]` | **`[15,2]`** |
| `NPA` | `[9,24]` | `[14,4]` |
| `EORHNNGEAFNF` | `[12,0]` | `[12,12]` |
| `OMSN` | `[3,9]` | **`[23,12]`** |
| `EAAIUL` | `[28,20]` | **`[8,19]`** |

So the outer-H stream is:

`15,2,14,4,12,12,23,12,8,19`.

Five DH-state values are already visible without choosing positions by plaintext:

- first fragment: `[15,2] = [b,K]`;
- first output of the penultimate fragment: `23 = p`;
- final fragment: `[8,19] = [A,B]`.

The only missing standard DH labels are `g` and `a`.

## The visible counts supply the missing two fields

Use the line's two simplest visible integers:

- fragment count **5**;
- line number **6**.

The natural assignment:

`g = 5`

`a = 6`

completes:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

All seven values are distinct.

The complete Diffie-Hellman equations hold:

`g^a mod p = 5^6 mod23 = 8 = A`

`g^b mod p = 5^15 mod23 = 19 = B`

`A^b mod p = 8^15 mod23 = 2 = K`

`B^a mod p = 19^6 mod23 = 2 = K`.

This reproduces the same DH23 state that earlier repository work had assembled from several independent numeric routes, but it now comes from a single literal-DH source line and visible structure.

## Charged 2×2 visible-number family

The assignment of line number and fragment count must be charged rather than assumed.

For every physical unknown-page line, after applying the fixed outer-H operation, test:

- line-number origin: **one-based** or **zero-based**;
- assignment:
  - `g = fragment count, a = line number`;
  - `g = line number, a = fragment count`.

For each of those four variants:

1. choose `p` only from outer-H outputs and require it to be prime;
2. choose `b` only from outer-H outputs with `0<b<p`;
3. derive `A=g^a mod p`, `B=g^b mod p`, and `K=A^b=B^a mod p`;
4. require `A`, `B`, and `K` to occur in the same outer-H output set;
5. require all seven standard fields `p,g,a,b,A,B,K` to be distinct.

Across the **594** physical rune lines:

- **31** lines admit at least one seven-distinct-field DH tuple somewhere in this broad family;
- there are **60** such tuple variants total;
- exactly **one** physical line begins literal `DH`;
- on that literal-DH line, exactly **one** family member survives.

That unique survivor is:

- p28 line6;
- one-based line numbering;
- `g = fragment count`;
- `a = line number`;
- `p=23,g=5,a=6,b=15,A=8,B=19,K=2`.

The zero-based origin and swapped `g/a` assignment both fail on the literal-DH source line.

## Why this changes the frontier

This is materially different from the now-demoted p50→p0 receiver chains.

The source gives:

- the text label **DH** directly;
- the physical line;
- the outer-rune operation through the independently recovered **READ OUT** instruction and solved circumference/H calibration;
- the two missing small integers as line-visible count and ordinal;
- a full algebraic verification with no language score and no unknown plaintext fit.

It therefore supplies a plausible human solve path:

1. find the p28 center/page-word cube object;
2. recover **READ OUT**;
3. notice p28's unique literal **DH** line;
4. read the outer runes of its fragments with the already motivated H operation;
5. use fragment count and line number for the two missing DH parameters;
6. verify all standard DH equations.

The result also explains why line6 begins literal `DH`: it labels the cryptosystem encoded by that line rather than merely contributing another ciphertext coincidence.

## Remaining caution

The interpretation of **READ OUT** as “read the outer runes” is semantic. The outer-H operation itself was already independently fixed, and the full line-family census prevents choosing line/count conventions after seeing the target tuple.

The strongest next test is independent reproduction by another agent and a downstream use of this source-derived DH tuple that predicts untouched manuscript data without p50 numeral→LP-offset coercion.

## Reproduction

Run:

`node sims/lp2_p28_dh_line6_outer_count_sft.cjs`.

The SFT reconstructs all physical lines from the canonical transcription, verifies the unique literal-DH selector, applies only fixed outer-H pairs, exhausts the 2×2 visible-number family, recovers the unique p28 tuple, and checks every DH equation.
