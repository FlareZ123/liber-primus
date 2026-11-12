# Original LP2 p2 and pp23–26: all-secret six-stream binary parity impossibility

**Established original-input conditional exclusion, 12 November 2026.** The original six 201-rune streams cannot obey a six-way positionwise XOR parity law with a **stationary injective binary rune encoding**, even when each of the six strands has its **own entirely arbitrary secret alphabet**, the field GF(2^m) is unconstrained, and each strand can be independently reversed. The stronger lane-specific result subsumes the simpler common-alphabet result. Both have actual original-source and genuine encrypted synthetic controls. **Neither result authenticates a historical LP2 operation, recovers unknown plaintext or identifies a final destination.**

## Actual original visible source and proposed solve path

The physical original LP2 **p2** has exactly **201 Gematria Primus runes**. Physical **pp23–26** have a 16-rune red heading followed by exactly **1,005 GP runes**, divisible into five 201-rune streams. Two simple ways for a contemporary human to read the five strands are consecutive 201-rune blocks or interleaving every fifth rune. The matching p2 length gives an affordable, falsifiable hypothesis: p2 might be one parity strand that permits recovery/validation of the five streams in pp23–26, like a bytewise XOR parity or systematic redundancy code. No source actually says that, and identical five-dot ornament geometry on p7/p23/p56 is compatible with decorative reuse.

For each layout, test all **2^6 = 64 independent rune-direction choices**, including independent reversal of p2 and each one of the five body strands. These exhaustive geometric orientations are source-bound; there are no chosen glyph values, guessed keys, fitted plaintext or additional offsets.

## Model A: one unknown stationary codebook shared across all six strands

Let \(g\) assign each of the 29 possible GP rune identities a distinct element of **any GF(2^m)**. At each of the 201 original columns \(j\), six-way parity demands

\[
\bigoplus_{k=0}^5 g(s_k[j]) = 0.
\]

Form a **201×29 binary incidence matrix** where the entry for rune \(t\) in row \(j\) is the parity of its occurrences among the six original symbols. For any output bit coordinate in \(g\), the 29-bit column of its assigned values must lie in the nullspace. The all-ones binary vector always belongs to that nullspace because every row contains six symbols.

Across **both** source strand layouts and **all 64** strand reversal masks per layout, the exact matrix rank is **28**. Thus the nullspace has dimension one, consisting only of the all-ones vector. Every output bit of \(g\) must be constant across the 29 rune identities. The only surviving maps send **all 29 symbols to the same value**, which is incompatible with the demanded injectivity for any choice of binary field degree. A genuine planted six-way parity encoded injectively into GF(32) passes and has rank at most 24. The 28-dimensional obstruction is established after only **28–41 source columns**, depending on reading order.

This reproduces the full prior [common-codebook original SFT](../sims/lp2_p2_p23_sixstrand_xor_allsecret_sft.cjs), with independent original data and plant.

## Model B: six **independent** arbitrary secret binary rune codebooks

The more permissive hypothesis assigns each strand its own injective but unknown function

\[
g_k : \{\text{29 GP runes}\}\longrightarrow GF(2^m).
\]

There is **no shared glyph order or byte mapping**: two identical printed glyphs appearing in different strands may represent completely different field elements. The same six-way parity equation now reads

\[
g_0(s_0[j])\oplus g_1(s_1[j])\oplus\cdots\oplus g_5(s_5[j])=0.
\]

For each bit coordinate of the six maps, construct a **201×174 binary matrix** with six independent 29-column blocks. Row \(j\) has precisely one set bit in each lane's block at the rune printed in that strand. For *every field size m*, all 201 equations must vanish on each bit coordinate of the 174 unknown field-label bits. This is exact linear algebra over GF(2), without ever enumerating the 29! possible rune orders or secret permutations.

A fundamental five-dimensional space of **trivial constant-codebook solutions** always exists: put a constant \(a_k\) into all 29 glyphs of each lane, subject to \(a_0\oplus\cdots\oplus a_5=0\). Those five independent binary vectors are in the kernel of every original candidate matrix. So its rank can never exceed \(174-5=169\). The original rank is nearly this maximum:

| Original five-strand arrangement | Independent six-strand reversals | Exact 201×174 rank for every reversal | Total nullspace dimension | Earliest original prefix reaching full observed rank |
| --- | ---: | ---: | ---: | ---: |
| **Contiguous**, plus p2 | 64/64 | **169** | **5** | 169–175 rune columns |
| **Interleaved**, plus p2 | 64/64 | **168** | **6** | 168–176 rune columns |

For contiguous lanes, the five trivial constant dimensions **exhaust the entire nullspace**. Every possible bit coordinate of all six maps must be constant within its lane. Thus no codebook can encode the 29 distinct glyphs injectively.

For interleaved lanes, there is exactly **one** extra binary degree of freedom beyond the five constant-codebook directions. Consequently, for **each individual lane**, all possible bit-coordinate assignments can distinguish **at most two equivalence classes of rune symbols**, even if m is arbitrarily large and each coordinate uses a different solution vector. A mapping of 29 distinct runes into at most two field values cannot be injective. This excludes interleaved six-way parity even if each lane uses a fully unrelated secret alphabet.

This is a **field-size-independent impossibility** for both source-selected layouts and every independent reversal. It is considerably stronger than checking particular GP29, GF32, byte values, or 29-symbol label permutations.

### Algebraic extension: every fixed nonzero **weighted** binary-field parity also fails

This original-input impossibility covers more than equal-weight XOR. Suppose for every original source column we had **any** stationary six-lane affine-linear relation in GF(2^m),

\[
a_0g_0(s_0[j])\oplus\cdots\oplus a_5g_5(s_5[j])=b,
\]

with arbitrary field degree, **six nonzero constant coefficients** \(a_k\), any constant \(b\), and six unrelated secret injective rune encodings \(g_k\). Define \(h_0(r)=a_0g_0(r)\oplus b\) and \(h_k(r)=a_kg_k(r)\) for lanes 1–5. Multiplication by nonzero constants and addition of a constant preserve each codebook's injectivity. Thus the weighted equation is exactly the six-way XOR parity \(h_0(s_0[j])\oplus\cdots\oplus h_5(s_5[j])=0\), which the rank-168/169 original obstruction **proves impossible for all 201 positions**.

Therefore **all fixed-coefficient GF(2^m) symbolwise linear parity codes, affine checksums, and symbolwise Shamir consistency equations** are excluded for either original five-strand partition and all 64 independent reversals, even with six *different* arbitrary secret alphabets. There is no additional weight or byte-alphabet search to perform.

The qualifier **symbolwise** is essential. Packing an entire 201-rune string into one 122-/123-byte field element mixes rune positions through base conversion, so such a *whole-strand* historical SSSS share need not obey the columnwise equation; those two fixed serializers were tested in the [distinct whole-register gate](lp2-p2-p23-201-sixshare-ssss-original-gate.md). Changing per-position alphabets, using zero coefficients that omit a strand, or performing nonlinear/stateful mixing is also outside this proof. No original clue yet selects a sixth-share encoding.

### Independent encrypted positive control

To verify the full **six-independent-codebook** deduction with a real generative example, the new test creates six independently shuffled, **injective 29-element subsets of GF(32)**. For each of 201 synthetic columns, it chooses five runes, computes their actual encoded XOR, and selects the unique sixth rune whose secret lane-specific codebook value gives exact zero parity (resampling until the sixth lies in the 29-value alphabet). The synthetic source therefore has 201/201 exact XOR equations under six unrelated secret glyph-to-field maps.

The true five GF32 output-bit coordinates supply at least five independent **nonconstant** nullspace directions, in addition to the five constant-codebook ones; the synthetic matrix consequently has rank **at most 164**, unlike the original ranks of 168/169. The test asserts both the exact encrypted parity and this detector capacity, without exposing the six shuffled labels to the rank computation. The original rune texts are unchanged.

### Comparison with historical five-of-ten SSSS

A genuine 2013 Cicada source used binary-field secret sharing, but a *monic degree-five Shamir polynomial* produces a **weighted six-point relation** involving each share's numeric identifier. Such shares do **not** have to obey equal-weight per-rune XOR, so the present theorem does not exclude them. Separately, [the historical SSSS six-point original-source experiment](lp2-p2-p23-201-sixshare-ssss-original-gate.md) checked both direct 123-byte positional base29 and reversible 122-byte enumerative-rank whole-strand serializers at all historical 1–10 labels, for **604,800 assignments each**, finding **zero exact complete six-share matches** with positive controls. Those are two different, bounded source interpretations, and neither is an authenticated mechanism.

## Reproducibility and research consequence

- [All-secret **six-independent-alphabet** Node.js 22 single-file SFT](../sims/lp2_p2_p23_sixstrand_multialphabet_allsecret_sft.cjs). Uses only the canonical [original GP29 corpus](../resources/liber-primus/lp2-corpus.json) and Node standard library; tests 128 original matrices, their five-dimensional constant kernels, exact rank/prefix, independent secret positive.
- [Original **shared-alphabet** 29-variable GF2 SFT](../sims/lp2_p2_p23_sixstrand_xor_allsecret_sft.cjs), with 128 additional exact matrices and common-GF32 positive.
- Both attached to [the existing on-demand SSSS original-data workflow](../.github/workflows/lp2-p23-ssss-enumerative.yml). No expensive automatic per-commit jobs.

**Decision:** retire any attempt to interpret p2 as a simple positionwise binary XOR parity check for the five p23 body strands under a stationary rune alphabet, **even with completely different secret alphabets in every strand and arbitrary GF(2^m)**. Key searches over those alphabet permutations cannot rescue the architecture. A different source-authenticated clue would need to prescribe weighted shares, changing per-position alphabets, shifts other than source orientation, or nontrivial enciphering/state that invalidates the tested exact parity equation. The unsolved manuscript remains unsolved; the contribution is a rigorous, broad structural exclusion based on original glyphs.
