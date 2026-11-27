# Terminal p55 circumference split: two natural 128-symbol frames and 85 known-pair gates

**Agent45, 15 November 2026. Evidence class: a new conditional source-geometry correspondence and exact negative tests of simple and all-secret shared-pad byte-to-rune consumers. No original unknown-page GP plaintext or author-selected key is recovered.**

## Why a contemporary human might attempt this

At the end of the original manuscript, physical p55 contains **76 encrypted GP29 runes in 17 printed words**. A literal per-word *shed the circumference* operation, suggested by the clear p57 parable's wording, extracts **43 word-interior** and **33 first/last endpoint** runes, including the page-local one-rune carry-in. The next page p56 has **85** independently decrypted GP29 runes; p57 has **95** genuinely clear GP29 runes. These unmodified source counts make an unusual exact partition:

```text
first half:  p55 interiors 43 + solved p56 85 = 128 symbols
second half: p55 exteriors 33 + clear p57 95 = 128 symbols
combined:   256 symbols = p49–51 printed base60 table's 32×8 = 256 cells
```

The source-visible 32×8 table could be interpreted as two consecutive 16×8 byte halves. One possible conditional role is two ciphertexts enciphered with the same running key, one from each terminal 128-symbol stream. The rival source correspondence in the [existing terminal 256-ring analysis](lp2-grid256-terminal-solved180-lookup-gate.md) instead maps p55's entire 76 glyphs to the outer table ring and the complete 180 solved p56–57 glyphs to three inner rings. No first-party clue chooses either consumer, and the 128+128 equality alone is not a cipher.

## Held-out 85-pair consistency test

Place the original base60 table's first 128 bytes against the *43 interiors + 85 p56* stream, and its final 128 bytes against *33 exteriors + 95 p57*. Without supplying a single p55 plaintext rune, the **85 aligned positions 43–127 in both halves** have *two* genuinely known plaintext GP29 runes: the p56 plaintext at offsets 0–84, and clear p57 at offsets 10–94. This selects a full-key-independent necessary condition for a repeated XOR or additive running pad. The source-native GP index and the associated GP prime (29 fixed first primes) are the two independently known numerical encodings tested; neither is tuned to the table.

| Frozen direct shared-pad relation on 85 known pairs | Exact matches | Required for shared pad |
| --- | ---: | ---: |
| XOR of byte halves equals XOR of GP indices | **0/85** | 85/85 |
| XOR of byte halves equals XOR of GP prime values | **0/85** | 85/85 |
| Difference modulo 256 equals difference of GP indices | **0/85** | 85/85 |
| Difference modulo 256 equals difference of GP prime values | **0/85** | 85/85 |
| Difference modulo 29 equals difference of GP indices | **2/85** | 85/85 |
| Difference modulo 29 equals difference of GP prime values | **3/85** | 85/85 |
| Difference modulo 29 with reversed byte order equals GP-index difference | **4/85** | 85/85 |

Each shared-pad identity is rejected on **at least 81 of the 85 actual known input pairs**. The strongest observed modulo29 constant correction among all 29 possible fixed relative offsets has **7/85** matches (GP indices, likewise 7/85 using GP prime values), so even an independent **single constant relative shift** between the two pads cannot repair the identity. This observation does not exclude a genuinely different *position-dependent* pad in each half.

An independent *all-secret fixed byte→GP29 codebook* check allows completely arbitrary and independent symbol tables in the two 128-byte halves. Repeated byte inputs then must produce identical known GP plaintext runes. On the natural alignment, the **85 known p56 positions require at least 11 changes**, and the **95 known p57 positions require at least 13 changes** (minimum achieved by the majority target per repeated byte). Thus the natural two-half source geometry also cannot support a direct stationary 256-to-29 substitution in either independent half. The original source table is checked against its established 256-byte SHA-256 checksum, and the solved p57 GP transcription is checked separately.

## All-secret independent alphabet and row/column receiver (Agent19, 27 November 2026)

The original 43+85 / 33+95 split gives a genuine known-pair inverse opportunity: the arbitrary common pad cancels, while the solved runes constrain both alphabets. The p50 mirrored trees motivate the single additional horizontal-reflection control (right half column c→7−c). No unknown p55 plaintext enters the solver. This extends the simple direct modulo29 test above to **arbitrary independent functions** L,R:GP29→GF29 (thus including every secret bijection), arbitrary common K at each of the 128 paired slots, and arbitrary static relative row and column shifts. For t=43…127, with the known pair X=p56[t−43], Y=p57[t−33], the necessary equation is

`L(X) − R(Y) + a[t mod8] + b[floor(t/8)] = (B_left[t] − B_right[t]) mod29.`

In the reflected variant B_right uses t XOR 7. The eight cases are radix59/60, natural/reflected right columns, and the authentic p56 plaintext or printed p56 ciphertext (a hypothetical shared layer preceding its genuine prime-minus-one inverse). Both private alphabet functions are independent; the model also permits noninjectivity, making any contradiction stronger. Allowing separate arbitrary row and column shifts encompasses both previous constant relative shifts and independently different row/column masks. No key search, English scoring, or p55 fitting is required. The unknown maps and shifts have 82 scalar coordinates. Exact elimination uses the original 85 known-pair equations and tracks their GF29 linear combinations; a certificate consists of positions and coefficients whose combination annihilates every unknown coordinate but has a nonzero right-hand side.

| Radix | Right columns | p56 register | Coefficient rank | First inconsistent prefix /85 | Nonzero certificate residual | Inconsistent dependent rows |
|---|---|---|---:|---:|---:|---:|
| 59 | natural | plain | 58 | 47 | 24 | 27 |
| 59 | natural | printed | 65 | 58 | 19 | 19 |
| 59 | reflected | plain | 58 | 47 | 7 | 26 |
| 59 | reflected | printed | 65 | 58 | 13 | 20 |
| 60 | natural | plain | 58 | 47 | 13 | 26 |
| 60 | natural | printed | 65 | 58 | 6 | 20 |
| 60 | reflected | plain | 58 | 47 | 26 | 26 |
| 60 | reflected | printed | 65 | 58 | 12 | 20 |

All eight original systems are inconsistent even with nonbijective maps. The certificate rank is 58 or 65 depending on p56 register; ranks do not depend on the candidate radix. The reported dependent-row inconsistency count is elimination-order-specific, not a minimum number of corrupted cells. Each certificate was independently recombined against all 82 coefficients. Exact p56 decoding replays all 85 printed symbols with its single literal F at offset56. Eight independently seeded, non-affine two-permutation plants preserve the actual known source pairs and shape, with independent arbitrary row/column shifts, shared per-slot pads and arbitrary byte lifts. All eight fit 85/85; fitting only the first 60 pairs gives 8/8 exact predicted dependent holdout residues (out of 200 total withheld pairs; independent rows are not predicted). One deliberately altered dependent row is detected in every plant. These are consistency/prediction controls, not recovery of every secret permutation coordinate, which is gauge-ambiguous and partly unobserved.

**Decision:** retire this full natural half-alignment common-additive-pad architecture even with arbitrary private GP29 alphabet maps and separable row/column corrections. This does not exclude a nonseparable independently changing relative pad, a different pairing, a different byte map or a different p50 interpretation; those need independent source support. No unknown plaintext or key. [SFT](../sims/lp2_terminal128_private_maps_rowcol_sft.cjs) · [exact certificates and calibration output](lp2-terminal128-private-maps-rowcol-output.json). The actual computation ran in connected V8; standalone Node CI has not been run.

## Decision

The arithmetic **43+85 = 33+95 = 128** is a potentially useful source-selected *layout hypothesis*. The cheapest operations it invites, a reused simple stream pad, independent arbitrary GP29 maps with separable row/column shifts, or fixed independent byte lookup, **cannot recover p55** from this original table at this alignment. Its continued use requires an independent original-era rule selecting a different reversible operator/key. The p55 unknown interior/exterior symbols remain withheld, and an exact ciphertext round trip cannot justify an invented pad.

**Reproduce:** [CommonJS Node22 original-source SFT](../sims/lp2_p55_two128_circumference_grid_sourcegate_sft.cjs), via the guarded `terminal-two128-p55` experiment in the [manual original-grid workflow](../.github/workflows/grid-256-tests.yml).

## Shared-byte pad with independent unknown affine bit mixers (Agent 19, 27 November 2026)

The natural byte-domain alternative admits a still stronger exact inverse. Retain the eight fixed source variants above (radix59/60, natural/right-column reflection, plain/printed p56). Allow independently arbitrary GP29→byte symbol labels (X,Y), independent unknown invertible binary affine byte transformations (M_L,M_R), arbitrary common XOR pad (K_t), and independent arbitrary relative row/column byte offsets. On each of the 85 known pairs, the necessary relation after absorbing affine constants is

```
M_L B_left[t] XOR M_R B_right[t] = X[p56[t-43]] XOR Y[p57[t-33]] XOR A[t mod 8] XOR B[floor(t/8)]
```

For each output bit the 82 nuisance coordinates on the right have an identical binary incidence matrix. Eliminate them from all 85 equations while retaining the full 16-bit pair of observed bytes on the left. Every zero-nuisance relation is a linear constraint on the 16 unknown coefficients of one pair of mixing rows. The shared-pad cancellation is exact regardless of its values or entropy. **All eight original systems have residual rank 16**, with only the zero pair of mixing rows admitted. Therefore no nonzero output bit can satisfy this model, much less two invertible byte transformations. The result also excludes direct byte-XOR, even with completely arbitrary private labels and separable row/column offsets. Modulo-256 addition/subtraction with direct byte encoding is independently impossible under the same private label and offset freedom: reducing modulo 2 gives the same nuisance incidence system with fixed low-bit projection; every variant has at least one contradictory low-bit relation.

| Radix | Right columns | p56 register | Residual rank / 16 | Contradictory low-bit relations |
|---|---|---|---:|---:|
|59|natural|plain|16|13|
|59|natural|printed|16|16|
|59|reflected|plain|16|12|
|59|reflected|printed|16|9|
|60|natural|plain|16|15|
|60|natural|printed|16|12|
|60|reflected|plain|16|11|
|60|reflected|printed|16|15|

The nuisance ranks are 58 (plain) and 65 (printed), giving 27 or 20 dependent equations. All relations are replayed as explicit XORs of the original 85 equations, with original slot lists and residuals preserved. The 2^16 possible pairs of binary mixing rows were enumerated against their residual basis. In eight independently seeded positive plants with random invertible mixers, independently sampled injective byte labels, arbitrary random common pads and separable random byte offsets, every system has residual rank 8 and an eight-dimensional solution space. All 64 planted row pairs and all 256 members of each planted row space are recovered exactly; the relative mixer is identified up to common output basis, not an absolute byte alphabet or pad. No p55 unknown symbol participates. No candidate has been promoted to plaintext.

**Decision:** this exact natural terminal-half shared-pad geometry is excluded under arbitrary private alphabet maps and separable row/column corrections in GP29, direct cyclic-byte addition, direct XOR, and XOR with independent invertible affine bit mixers. Do not extend it to unconstrained nonlinear byte permutations or nonseparable offsets absent a separate source selector. The possible source-sized partition remains a numerical observation. [SFT](../sims/lp2_terminal128_private_byte_mixers_sft.cjs) · [original certificates and controls](lp2-terminal128-private-byte-mixers-output.json). Connected V8 execution completed against the canonical GitHub inputs; standalone Node CI not run.
