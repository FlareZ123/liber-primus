# P6/p7 original 28×11 finite-field Fourier receiver: bounded negative

**Classification (21 November 2026, Agent35): new source-motivated operation test; no unknown plaintext, original-cipher key, or decoded LP2 continuation.** The result is an exclusion for a specific, reversible 28-point mixing architecture. The existing red/DH field packet remains a structural candidate.

## Source-selected operands and proposed inverse

The consecutive original physical p6/p7 scans show an 11-rune red opening at p6 offsets 71–81 (GP0 sum **181**), followed by 308 black runes at p6 offsets 82–195 plus p7 offsets 0–193, then a 14-rune red colophon at p7 offsets 194–207 (GP0 sum **209**). Hence **308 = 11×28**, with **209−181=28**. The final printed red word's GF29 rune product is **2**, which has multiplicative order **28** modulo29.

This supplies a natural, though unauthenticated, **28-point number-theoretic transform over GF(29)**, in eleven adjacent columns and with no guessed primitive root. For a column vector `x` of 28 symbols, define `F(x)[k]=Σ_{r=0}^{27} x[r]·2^{kr} (mod29)`. Its exact inverse is `F⁻¹(x)[k]=28·Σ_{r=0}^{27} x[r]·2^{-kr} (mod29)`; the scalar 28 is the inverse of28 mod29. The 11 columns can be serialized from the original 308 runes row-major or as 11 contiguous 28-rune columns. We test both DFT and inverse DFT (four fixed source-typed readouts). The operation differs materially from the previously rejected position-wise `2^r` multipliers: every output digit mixes all 28 original positions within its column.

The minimal unkeyed readouts recover no native-GP passage. To allow the red11 to be a missing cipher secret rather than assume its literal values are the key, the stronger gate grants an **arbitrary independently chosen invertible affine output map per column**, `P[r,j]=a_j·X[r,j]+b_j mod29`, where `a_j=1..28`, `b_j=0..28`. These **812^11** possible eleven-column key vectors are optimized exactly by independent enumeration of all812 affine choices per column, under the frozen native-GP unigram likelihood. This is not a heuristic search over guessed password words.

## Authentic original readouts versus positive controls

The first 14 output rows (154 runes) choose each key; the untouched final 14 rows are scored with the chosen key. As an optimistic separate upper bound, all28 rows are allowed to optimize the key. The language distribution comes from the checked-in 62,492-rune Gibran source-native GP encoder. **72 planted native-GP English controls** use 24 disjoint 308-rune windows each from Gibran, Shakespeare, and Emerson. Each plant is encrypted through a fixed nonzero column affine map derived from the original p6 red11 indices and the matching forward/inverse GF29 transform; every original-size plant recovers its pre-DFT input exactly. GP source-orthography checks are inherited from the shared source-native encoder.

| Original original-body inverse | Original held-out log/rune | Lowest of72 native controls | Original full308 key-oracle | Lowest of72 native oracles |
|---|---:|---:|---:|---:|
| Row-major, inverse DFT | **−3.99213210** | −3.97194485 | **−3.30885147** | −3.03592662 |
| Row-major, forward DFT | **−4.12942919** | −3.97194485 | **−3.30885147** | −3.03592662 |
| Column chunks, inverse DFT | **−4.25402061** | −3.97194485 | **−3.30409165** | −3.03592662 |
| Column chunks, forward DFT | **−4.07849551** | −3.97194485 | **−3.30409165** | −3.03592662 |

All four original-body holdouts score worse than every native plant. Even with the entire original 308-rune body exposed to optimal secret-key selection, each output remains well below the weakest native plant. For the most favorable original heldout, the inverse-DFT row-major inferred plaintext begins `TUUDUTHATHRMTHJRAPRTHTLIMNNHOALESUBBDBEMATTHHEENOUABSCR...`; it does not provide a credible instruction. The exact GF29 forward/inverse and the 72 positive-control reconstructions verify the algorithm rather than validate its historical use.

**Decision:** retire only a straightforward 28-point GF29 DFT or inverse DFT on the original p6/p7 black rectangle, including any secret stationary affine alphabet chosen separately for each of the 11 columns, conditional on the manuscript's attested GP-native English register. The original arithmetic packet and other source-selected cipher architectures remain open. The visual text supplies no explicit Fourier instruction; this experiment was an affordable hypothesis test based on the observed full multiplicative cycle. Do not expand into arbitrary roots, offsets, alternate matrix generators, or further secret substitutions without another independent source instruction.

## Reproduction

`node sims/lp2_p6_p7_dh2_field_fourier_allsecret_sft.cjs` on Node.js22, CommonJS, with the repository's original `lp2-corpus.json`, `lp2-ink-annotations.json`, `lp2_native_gp_source_orthography_sft.cjs`, and three preserved control corpora. No external network, randomness, file writes or credentials. The complete SFT asserts the exact p6/p7 original offsets, two GF29 multiplicative-state facts, planted Fourier inversions, and that all four original readouts score below every native control under both heldout and oracle criteria.
