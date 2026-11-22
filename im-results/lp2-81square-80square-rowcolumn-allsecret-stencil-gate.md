# Original bookend square: exact 2D four-tap, all-secret row/column-mask exclusion

**22 November 2026, Agent11. Original-source conditional negative; no plaintext or key recovered.** The unique unchanged two-word cipher phrase `DJU BEI` occurs at full-book rune positions 6,555–6,560 and 12,950–12,955, using zero-based coordinates. Its first occurrence ends at **6,561=81²**, while the remaining **6,395=80²−5** original ciphertext runes end at the second occurrence. These printed-word and exact-count facts are established in [the existing repeated-pair study](lp2-repeated-wordpair-structure.md). They suggest, retrospectively, comparing an 81×81 source lattice with an 80×80 target lattice whose final five cells are unprinted.

## A source-motivated inverse with a concrete plaintext payoff

If the 80×80 target block were generated from the preceding 81×81 block by a simple lattice operation, recovering the operation could reveal a previously missing source-derived relationship across 6,395 encrypted runes. Deleting one row and one column reduces 81×81 to 80×80, so the cheapest natural test is the most general additive four-tap stencil with wholly secret row and column masks. Historical 2014 Cicada square puzzles make a two-dimensional operation plausible to test; the exact 81/80 arrangement is **post hoc** and is not a proven author-selected layout.

For every output site with printed data, test the complete family

    B[i,j] = w00 A[i,j] + w01 A[i,j+1] + w10 A[i+1,j] + w11 A[i+1,j+1] + r[i] + c[j] (mod 29).

All four GF29 coefficients `w` are arbitrary and secret. Every one of the 80 row masks `r` and 80 column masks `c` is independently arbitrary, without any periodicity, source-index guess, or language model. The eight dihedral orientations of each lattice are treated as alternatives, yielding **64 complete orientation pairs**. The five absent target cells are kept at the original terminal positions and are **never filled or guessed**. This family is more permissive than a fixed 2×2 linear stencil because it also allows 160 independently arbitrary local offsets.

## Key-independent inversion argument

Define `ΔiΔj B[i,j] = B[i+1,j+1] − B[i+1,j] − B[i,j+1] + B[i,j] (mod29)` and analogously for `A`. The mixed difference cancels **every** arbitrary row and column mask exactly, leaving a four-unknown linear system:

    ΔiΔj B[i,j] = sum(wab * ΔiΔj A[i+a,j+b]) (mod29).

After removing the five missing target sites, **6,236** complete 2×2 output windows remain for **every** orientation pair. The first 20 source-order equations contain a full-rank four-coefficient design in each of the 64 variants. Therefore an exact solution, if one existed, would have to use the uniquely determined four weights. Compare those coefficients against all 6,236 original equations; any contradiction rigorously excludes the complete corresponding orientation/mask family.

## Original ciphertext result

| Comparison | Result |
| --- | ---: |
| Complete orientation pairs | **64/64 exclude exact fit** |
| Original 2×2 equations in each pair | **6,236** |
| Best first-20-fitted equation agreements | **266/6,236** |
| Best source/target orientations | **5/5** (source-code convention) |
| Best four weights | **[28,16,19,17]** |
| Worst first-20-fitted agreements | **190/6,236** |
| Known planted source-grid positive | **6,236/6,236** |

Each first-20 fit is forced by the original data. The hit count is a diagnostic and **is not a global maximum-agreement optimization** over all conceivable secret weights. The exact exclusion is stronger and simpler: the full-rank first-20 system fixes the only coefficients that could satisfy all original equations, yet every variant produces abundant independent contradictions. The source-index GP29 sequence is locked by FNV-1a32 `fe63c4ed`, its 12,956-rune length and the identical six-rune boundary words. The positive plant uses the full original 81×81 input, secret weights `[3,5,13,23]`, nonlinear row and column pads, an independent dihedral target orientation and the genuine five-cell truncation. It recovers all four weights and satisfies every printed output window.

**Reproducer:** [single runnable Windows Node22/CommonJS SFT](../sims/lp2_81to80_rowcolumn_stencil_sft.cjs), [successful original-source GitHub Actions run 45028879967](https://github.com/FlareZ123/liber-primus/actions/runs/45028879967).

## Cryptanalytic decision

The two bookend-selected blocks are **not** related by any fixed GF29 four-tap 2×2 lattice operation plus arbitrarily secret additive row and column offsets, under any pair of square orientations and the natural five terminal omissions. This is a genuine additional constraint compared with the older stationary nonlinear four-neighbor test, because that test did not permit arbitrary row/column secret pads. The result does not cover nonlinear variable-key stencils, nonlocal transforms, unknown cell permutations, different boundary registration or a second cryptographic layer. Neither the square split nor the lattice operation is independently authenticated by a Cicada source. The result yields **no unknown plaintext**, and does not justify another parameter sweep absent a new instruction selecting a different lattice mechanism.
