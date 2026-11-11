# 2013 audio prime-ordinal square and p3/p39 projective conjugacy

**Classification:** bounded positive cross-round structural bridge, not a decryption. The matrix identities are exact; the source choices that construct the matrices remain hypotheses.

## Source-derived arithmetic

The archived 2013 audio user-text value is **1,595,277,641 = 1259 × 1031 × 1229**. Their one-based prime ordinals are **205, 173, 201**. Interpreting those ordinal values directly as zero-based offsets in the canonical 32×8 row-major base60 byte table gives three corners of an axis-aligned 4×4 square: offsets **205=(25,5), 173=(21,5), 201=(25,1)**. Completing the fourth corner gives offset **169=(21,1)**. The four bytes in matrix order are:

```text
[[228,117],[74,76]]
```

Reducing modulo29 gives `G=[[25,1],[16,18]]`. The audio filename identifier gives `761 mod29=7`, so `B=7G=[[1,7],[25,10]]`.

**Indexing sensitivity:** using the conventional one-based-ordinal-to-zero-based-offset conversion (205−1, 173−1, 201−1, 169−1) instead selects offsets `[204,172,200,168]`, bytes `[240,148,110,194]`, and a different matrix. That matrix does **not** satisfy the conjugacy below. The direct ordinal-as-offset convention is therefore essential and remains a hypothesis about intended table indexing.

## p3/p39 field bridge

The p3 red triad gives `u²=3u+8`. Pairing p3's middle red value **23** with p39's first red value **27** gives the candidate field element `z=23+27u`, whose multiplication matrix in basis `(1,u)` is `M0=[[23,13],[27,17]]`. This is a direct red-value pairing hypothesis; the earlier p3/p39 global-offset alignment offered as a selector for z was arithmetically wrong and is not used here.

The source-derived exponent candidate is `φ(761) mod29 = 760 mod29 = 6`, from the 2014 stage03 “Patience is a virtue” value 761. The proposed change of basis is the lower-triangular matrix `S=[[1,0],[27,3]]`, using p39's first red value27 and p3's page number3. Exact arithmetic gives:

```text
M0^6 S = S B = [[1,7],[15,16]]
B^5 = M0^30 = 11 I
```

The scalar `11` is also `1229 mod29`, the third audio factor residue. Thus the audio-derived matrix B is conjugate to the sixth power of the p3/p39 field matrix, and both have the same fifth-power scalar.

### How selective is S?

Enumerating all 2×2 matrices with entries in the source-value set `{0,1,2,3,5,10,13,15,23,27}` finds **12** invertible intertwiners among **10,000** matrices. The candidate S is one of them. In the narrower, human-motivated lower-triangular form `[[1,0],[a,b]]`, with `a` drawn from the p3/p39 red triads `{13,23,2,27,5,15}` and `b` from the page numbers `{3,39 mod29=10}`, **S is the unique intertwiner**.

This is a useful source constraint, not proof: the lower-triangular form itself is not explicitly instructed by the manuscript. The relation is expected once two matrices with the same irreducible characteristic polynomial are conjugate; the evidence lies in the particular source-derived B and S, not merely in the existence of a conjugator.

## B as a 5-cycle on projective states

`S⁻¹(Ac24)=21`. The B action on `P¹(F29)` partitions all 30 projective points into six 5-cycles; the selected cycle is:

```text
21 → 20 → 5 → 22 → 0 → 21
```

Interpreting these five values as zero-based row-major indices in the 2014 5×5 magic square yields GP labels `X, C, R, I, EO`, not a readable word. This is a bounded check, not a proposed plaintext.

## Fragment-permutation test: negative

The corrected p3-u marker map assigns 30 projective states to the 30 nonempty fragments (29 distinct global marker boundaries plus the terminal fragment). A natural use of the audio matrix is to reorder those fragments by the six B-cycles, starting the cycle containing `S⁻¹(Ac24)=21` at21 and starting the remaining cycles at their smallest projective point. The inverse action B⁻¹ is the only directional alternative tested.

| Order | Shakespeare GP trigram score |
|---|---:|
| Physical fragment order | −4.437753 |
| B-cycle order | −4.437224 |
| B⁻¹-cycle order | −4.438261 |

The B order is only 0.00053 above physical order and produces no plaintext. In a deterministic 2,000-permutation null over the same 30 fragment records, **1,773/2,000 (88.65%)** random orders score at least as well as the B order. The cycle permutation is therefore not selective.

## Decision

Retain the exact audio/field conjugacy as a promising cross-round structural relationship, with explicit uncertainty about direct ordinal indexing, square completion, the red-value pairing for z, and the lower-triangular S form. Reject the tested B/B⁻¹ fragment-ordering use. Do not repeat direct Hill, projective substitution, or period-140 matrix-power decryptions already reported negative. The missing step is a source-instructed reversible operation connecting this matrix bridge to unknown LP2 plaintext.

Reproducer: [`sims/audio_prime_square_conjugacy_gate.cjs`](../sims/audio_prime_square_conjugacy_gate.cjs).