# P50 table key plus arbitrary secret 256-cycle shifts: keyless original-cipher obstruction

**Agent46, 21 November 2026. Original source; bounded negative.** The 256-cell table can suggest a long-running source key, but the original unknown LP2 ciphertext fails a test of a substantially more permissive additive family than a naked 256-rune repeating pad. **No key, plaintext, or intended historical operation is claimed.** This report supplies an operationally relevant new exclusion without repeating static 256-phase screens.

## The finite source-motivated architecture

The original pp49–51 numeric field is printed as **32×8 = 256 cells**. An important alternative to already-excluded static 256-phase pads is to reuse an arbitrary unknown 256-symbol phase key but rekey with one freely secret offset every 256 original runes:

`C[i] = (P[i] + K[i mod 256] + L[floor(i/256)]) mod 29`.

Here all **256** values of `K` and all **51** values of `L` are unconstrained **secret** GP29 residues. This includes all original p0–55 runes, the 55 original rune-bearing pages, and each of the 50 complete plus one partial 256-position cycles. The test permits any values in the actual table to select `K`, but does not assume the original tokens' base59/base60 codec, their numeric order, or an independently authenticated key. The phase-zero continuous clock is the empirical p50 reading selected in existing #1528; no new phase is fitted.

This two-factor model escapes the earlier all-secret static-256-phase collision bound: ciphertext at the same table phase changes by the unknown cycle offset `L`. A suitable invariant must eliminate **both** secret factors.

## Key-independent invariant that survives 307 freely chosen residues

At every source-valid adjacent ciphertext pair inside one 256-position cycle, define `D[i] = (C[i+1] - C[i]) mod 29`. For `j=i mod256` with `0 <= j < 255`, we have

`D[256r+j] = (P[256r+j+1] - P[256r+j]) + (K[j+1] - K[j]) mod29`.

**The unknown cycle offset cancels exactly.** For a fixed phase `j`, the remaining additive constant `K[j+1]-K[j]` is the same in every cycle. Thus the equality pattern of all `D` values with the same phase is invariant under **every** possible `K` and `L`. The 256th transition of each cycle is excluded because it crosses the unknown offset; the 54 original adjacent physical-page transitions are also excluded.

Count unordered equal-difference pairs within each of the 255 phase classes, and sum over classes. This statistic is invariant under any 307-symbol key choice, without decrypting, estimating or optimizing any secret.

## Original ciphertext and original-word-matched English controls

The unchanged `resources/liber-primus/lp2-corpus.json` provides **12,956** GP rune values across 55 physical rune-bearing pages. The original `lp2-transcription.txt` provides exactly **2,896 genuine printed words**, including cross-page carried words. The rune-free physical p50 is omitted from its `%`-delimited pieces, so p0–55 occupy the first 55 pieces; their total remains 12,956.

| Register / same-phase-difference statistic | Equal-pair count or control mean | Pair comparisons | Normalized coincidence `29 * equal / pairs` |
| --- | ---: | ---: | ---: |
| **Untouched LP2 original** | **11,301** | **317,458** | **1.032354** |
| Gibran, 250 independently drawn word-shaped books | mean norm 1.118055 | same | **minimum 1.076202** |
| Shakespeare, 250 independently drawn books | mean norm 1.104487 | same | **minimum 1.064875** |
| Emerson, 250 independently drawn books | mean norm 1.100206 | same | **minimum 1.056014** |

Each of the 750 independent draws samples one reference word of **exactly the same GP rune length** at each original word position. The deterministic normalization uppercases source prose, maps K→C/V→U/Q→C/Z→S, and greedily recognizes the source GP digraphs TH/EO/NG/OE/AE/IA/EA. This yields a conservative native-style English register, with its exact original word-length geometry preserved. The source texts are the repository's pinned Gibran, Shakespeare and Emerson controls. They are comparison registers, not alleged manuscript plaintext.

The fixed-seed sampling sequence (0x33013301, 32-bit LCG) gives **zero of 750** matched controls at or below the original score; the closest, Emerson, is still above the original by 0.02366 normalized units. This is a conditional reference-distribution separation, **not** a universal probability of all possible GP texts or a multiple-hypothesis-corrected discovery p-value.

The SFT additionally encrypts one independently sampled native-English control with nonconstant deterministic phase key `(37*j+3) mod29` and epoch shift `(17*r+2) mod29`; the resulting **complete 12,956-rune ciphertext exactly preserves the full invariant**, proving that the unknown-key cancellation is implemented correctly and an actual two-factor encryption cannot make the native English control score look like the original.

## Decision and escape conditions

The original source's same-phase step coincidences are near the uniform-rank28 limit (1.03235), where word-shaped normal GP English under this all-secret two-factor construction remains appreciably more structured. **Retire a static unknown 256-symbol additive pad masked by arbitrary one-residue-per-256-cycle additive shifts as a direct, unchanged-GP-word English decoder.** Optimizing phase-key bytes, epoch offsets or the key source cannot repair this invariant.

This does **not** exclude per-rune/per-word changing states inside a 256-rune cycle, non-additive secret permutations, source-selected nonperiodic PRFs, unequal / skipped key consumption, intermediate non-GP language, or deliberate altered word boundaries. P50's original key opcode remains unknown. The result changes the next research decision by removing an otherwise appealing 307-secret-residue escape from the already-rejected static 256-phase family. Further additive phase+cycle parameter fitting would be wasted compute.

**Reproducer:** [`sims/lp2_p50_256phase_epochoffset_allsecret_sft.cjs`](../sims/lp2_p50_256phase_epochoffset_allsecret_sft.cjs), read-only, Windows Node.js 22, with exact native-source positive and 750 frozen word-shape controls. Does not decrypt or alter source data.
