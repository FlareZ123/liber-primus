# Independent p28 DH cross-modulus chain audit

**Agent16, 19 November 2026. Classification: independent source-family discriminator supporting the p28 literal-DH reconstruction. No unknown page is decrypted here. The result strengthens the recovered tuple and exponent-3 direction without relying on the seven-fields-distinct control or on p50 numeral-to-LP-offset semantics.**

## Question

Agent2 reconstructed the labeled tuple

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`

from p28 line6, the manuscript's sole rune-bearing physical line beginning literal `DH`. Standard DH inversion gives

`b^-1 mod (p-1) = 15^-1 mod22 = 3`.

The same exponent has an additional property in GP29:

`K=2 -> A=8 -> B=19 -> b=15`

under repeated cubing modulo29.

This audit asks whether that cross-modulus chain is common among the complete manuscript-wide outer-H/count DH family, or whether it independently distinguishes the p28 tuple.

## Source family

The reproducer rebuilds the same source ingredients used by the literal-DH reconstruction:

- every physical p0..p55 transcription line, excluding rune-free p50;
- printed fragment boundaries;
- outer `H(x,y)=(x-y,x+y) mod29`;
- one-based and zero-based physical line number;
- both assignments of line number and fragment count to `a,g`;
- prime `p` and candidate `b` drawn only from that line's outer-H output set;
- exact standard DH closure, with `A,B,K` required to occur in the same output set.

No English score, p0 receiver, READ OUT output, HERE output, ROAD/LEAD chain, p50 value, or target plaintext participates in enumeration.

The canonical transcription has **604 nonblank physical lines**, of which **594 contain runes** and **10 are punctuation-only**. The literal-DH selector remains unique at p28 line6.

## Result

The unrestricted algebra-valid family contains **1,628 variants on 274 rune-bearing lines**. Most of its apparent cross-modulus hits are degenerate identity exchanges with `g=b=A=B=K=1`.

Remove only that trivial case by requiring

`g,b,A,B,K > 1`.

This leaves **711 variants on 212 lines**.

For each variant with invertible `b mod (p-1)`, define

`e = b^-1 mod (p-1)`

and test the exact labeled GP29 chain

`K^e = A, A^e = B, B^e = b (mod29)`.

There is exactly **one** hit:

`p28 line6, one-based, g=fragment-count=5, a=line-number=6`

with

`p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`.

A stricter invertible, nontrivial family contains **289 variants on 133 lines** and has the same sole hit.

The older seven-distinct-field secondary control contains **60 variants on 31 lines** and likewise has the same sole hit.

Thus the discrimination does not depend on requiring all seven DH labels to be distinct.

## Interpretation

The useful causal chain is now narrower than a language fit:

1. p28 visibly labels one line `DH`;
2. the fixed outer-H/count family reconstructs the standard DH23 tuple;
3. standard group inversion derives exponent3 from the labeled private exponent `b=15`;
4. that same exponent uniquely closes the labeled `K -> A -> B -> b` chain in GP29 across the nontrivial manuscript-wide source family;
5. the existing p28 center/page-word action-count transform uses that exponent and yields candidate `READ OUT`.

This is independent evidence for the tuple labeling and cube direction. It does not settle the separate one-based action-count versus zero-index layer convention, and it does not by itself establish READ OUT as recovered plaintext.

The subsequent p28 page-start result `READ OUT -> HERE` is compatible with this route but was discovered later and is deliberately excluded from this audit.

## Line-count reconciliation

The earlier p28 visual audit reports 604 physical lines. The DH-family reports use 594 rune-bearing lines. Both counts are correct for different classes: the transcription has **604 nonblank physical lines total**, with **10 punctuation-only lines** and therefore **594 rune-bearing lines**. The p28 literal-DH uniqueness is unchanged.

## Reproduction

Run:

`node sims/lp2_p28_dh_crossmod_chain_audit_sft.cjs`

The SFT rebuilds the full family from canonical source files, checks the line-class counts, verifies the unique literal-DH selector, and asserts uniqueness of the p28 cross-modulus chain under the 711-variant nontrivial family, the 289-variant invertible nontrivial family, and the 60-variant seven-distinct-field control.
