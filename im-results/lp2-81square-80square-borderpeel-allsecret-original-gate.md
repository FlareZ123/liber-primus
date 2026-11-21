# An 81×81 exterior-row/column peel cannot directly produce the 80×80−5 LP2 remainder

**Evidence class, 18 November 2026:** exact all-secret-map necessary-condition test on the original 12,956 unsolved GP29 ciphertext runes. The proposed geometric interpretation is retrospectively suggested by the repeated final two-word ciphertext marker and solved p57's “shed our own circumferences.” It is a hypothetical source-visible operation, with **no authenticated statement that Cicada designed these squares**. No unknown plaintext or creator-selected key is recovered.

## Specific operator and plaintext route

The authentic LP2 word-pair `DJU BEI` occupies global runes 6,555–6,560 and 12,950–12,955. The first copy ends exactly at rune **6,561 = 81²**, giving an original first block that can be laid out as 81×81 runes. The remainder has **6,395 = 80²−5** runes. These are source counts, not proven cipher block boundaries. A particularly simple human-inferable “shed the circumference” interpretation is to **delete one exterior row and one exterior column**, retaining one of the four 80×80 corner submatrices. This is a genuinely different operator from the already rejected 2×2 mixed finite difference, row/column additive pad and 81/80 crossratio hypotheses.

A cipher built this way, even with an unknown global alphabet substitution, must preserve 6,395 matches after selecting a corner crop, orienting it, transforming its rune symbols and omitting the five absent cells. To make the negative robust to unspecified map and erasure position, grant the strongest useful variant: all four corner crops, all eight square rotations/reflections, **every 6,396 position of five consecutive omitted cells**, and an **arbitrary secret deterministic map of 29 source runes to 29 output runes**, including lossy maps. A secret bijection, Caesar shift, affine transform and GP29 alphabet permutation are strict subsets.

## Exact all-secret upper bound

The new [Windows Node.js source SFT](../sims/lp2_81square_borderpeel_allgap_allsecret_original_sft.cjs) reconstructs the original unmodified 6,561+6,395 runes and optimizes the secret lookup exactly, without testing a word dictionary or supplying any proposed plaintext. For each possible crop/orientation/gap, count the source/output rune pairs and independently assign each source rune its most frequent ciphertext output, giving an absolute **maximum number of matches** over all 29→29 lookup tables. Sliding a five-symbol gap updates only one aligned pair, so the complete test is affordable without enumerating 29²⁹ secret keys.

| Original-source measurement | Exact outcome |
| --- | ---: |
| Source 81×81 symbols | 6,561 |
| Printed subsequent symbols | 6,395 |
| Exterior row/column crops × dihedral orientations | 4 × 8 = **32** |
| Five-symbol contiguous gap placements per orientation | **6,396** |
| Secret rune substitution | Any function GP29 → GP29 |
| Best possible original-source matches | **424 / 6,395** |
| Necessary original-source mismatches | **5,971 / 6,395** |
| Best orientation and erasure | Delete first row and first column, reflect vertically, gap after **5,054** output runes |

The best fit requires changing **93.37%** of the actual second block even after freely fitting the secret rune substitution; this is incompatible with an exact one-layer border-peeling decoder and cannot be repaired by the five omitted cells. A planted positive using a different dihedral crop, invertible affine rune map `y=(7x+11) mod29` and five-symbol gap after index **1,234** recovers all **6,395/6,395** matches with an equivalent detected gap of 1,233 or 1,234, since a source-glyph collision can make adjacent gap registrations indistinguishable. The optimizer therefore recovers an authentic member of the family.

**Reproduction:** [`sims/lp2_81square_borderpeel_allgap_allsecret_original_sft.cjs`](../sims/lp2_81square_borderpeel_allgap_allsecret_original_sft.cjs); GitHub Actions [Windows test #44337396307](https://github.com/FlareZ123/liber-primus/actions/runs/44337087395). No non-standard dependencies.

## Scope of conclusion

The exact **literal border deletion plus one stationary secret output alphabet** route is rejected. The source still allows nonlinear operations on **larger neighborhoods or with changing state**, a changing-key stream, hidden coordinate keys, arbitrary non-consecutive erasures, noncanonical block boundaries, or completely unrelated ciphertexts. A separate [unrestricted 2×2 source-grid test](lp2-bookend-81to80-unrestricted-2x2-allgap-original.md) subsequently excluded **all stationary 29⁴→29 four-corner emitters** on the same 81→80 geometry, under all eight orientations and all 6,396 possible contiguous placements of the missing five output cells (minimum 32 unavoidable original glyph disagreements); this is strictly broader in its *local input function* than the current one-symbol lookup and narrower in its *gap placements* than arbitrary non-consecutive erasures. The existing 81² bookend correspondence may be meaningful, but its geometric appeal alone does not select a cipher, plaintext or key. Future work on these squares needs a new original clue selecting an operator that actually yields consistent original paragraphs, rather than another symmetry or square-size coincidence.
