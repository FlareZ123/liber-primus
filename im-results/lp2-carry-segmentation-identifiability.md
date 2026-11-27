# Carry geometry cannot identify variable-length source units

**Decision, #3153 (27 November 2026).** No independent source-selected GP29 variable-length representation has been identified. Exact observed-group segmentation supplies a counterexample to identification from carry geometry and adjacent-repeat suppression: there are **363,377,703,347,701,376,755,078,255,104,139,198,464** distinct refinements of the original segmentation that preserve every printed group endpoint, every one of the 388 line and 32 page carry positions, and the exact 12,956-rune tape. In particular, a carry-preserving variable-length interpretation is not identified by its match to the printed geometry. This count is conditional on a deliberately post-selected chapter vocabulary, not a claim of viable historical ciphers or recovered source units.

## Independent source and rival

The [native layout calibration](lp2-layout-order-solved-source-gate.md) already rejects same-font ordinary plaintext-first wrapping: solved LP1 p6 and LP2 p56 are compatible with wrapping the **ciphertext**. The [conditional codex order result](lp2-global-original-visual-section-map.md#conditional-uniqueness-of-the-chapter-internal-codex-order-director-3144-27-november-2026) fixes ordinary chapter-internal order under its observed constraints. Neither result specifies a pre-render source unit. A deterministic renderer takes an output rune tape plus visible punctuation/layout choices. Two latent segmentations of that identical tape, with the same marks and widths, give identical visible geometry and equal-rune events. Consequently a receiver must predict something upstream of the renderer or predict unseen output from independently fixed rules; evaluating the geometry after feeding it the exact output is not independent evidence.

Previous source-selector gates [#895](https://github.com/FlareZ123/liber-primus/issues/895) and [#505](https://github.com/FlareZ123/liber-primus/issues/505) establish that the signed BASE29 command supplies integer conversion, not a manuscript unit grammar. [#2531](https://github.com/FlareZ123/liber-primus/issues/2531) excludes the particular p15-selected five-bit Fibonacci prefix receiver, and [#1223](https://github.com/FlareZ123/liber-primus/issues/1223) rejects the fixed F-pair escape rule even allowing arbitrary secret maps and stop-dependent phases. No need to rerun these. Their closures do not rule out all variable-length encoders.

## Exact conditional ambiguity witness

Read the corrected canonical transcription (blob `f7b534a33edeb212d427329798438325307463d7`) using ordinary physical page order, inserting the rune-free physical p50 and merging carried groups. Use the nine established visual chapters. For chapter c let D_c be the set of distinct *complete printed ciphertext groups* anywhere in that chapter, including merged carried groups. This is a deliberately permissive, original-conditioned finite vocabulary; it is not independently supplied key material. In each original group w, independently allow segmentation into one or more members of D_c. Require every printed group endpoint and forbid any new cut at any observed inside-group line or page carry.

For a group of n runes starting at global offset g, set F(0)=1. For each 0≤i<j≤n, add F(i) to F(j) precisely when w[i:j] is in D_c and either j=n or g+j is not in the set of 420 carry offsets. This recurrence counts all and only the admissible partitions, with exact integer arithmetic. Multiplying counts over groups and chapters is valid because this is a fixed vocabulary and no other state restrictions are imposed. The all-original partition is always feasible. A separate max-plus recurrence yields the maximum count of latent units. For example, physical p25 global offset 6011 is the printed group `ᚣᚷ`; the two single-rune codewords `ᚣ` and `ᚷ` separately occur at offsets 6256 and 5991 on the very same physical page. Both `[ᚣᚷ]` and `[ᚣ,ᚷ]` concatenate identically; the latter requires no break at a line/page carry. A static dictionary assigning distinct source tokens to these strings cannot be uniquely decodable without additional admissibility constraints.

| Physical pages | Printed groups | Exact carry-preserving refinements | Max latent units | Groups with >1 refinement |
|---|---:|---:|---:|---:|
| 0–2 | 158 | 4 | 160 | 2 |
| 3–7 | 255 | 8 | 258 | 3 |
| 8–14 | 383 | 2,048 | 400 | 11 |
| 15–22 | 437 | 201,326,592 | 477 | 27 |
| 23–26 | 224 | 4 | 226 | 2 |
| 27–32 | 326 | 64 | 334 | 6 |
| 33–39 | 378 | 49,152 | 400 | 15 |
| 40–53 | 669 | 2,188,749,418,902,061,056 | 766 | 58 |
| 54–55 | 66 | 1 | 66 | 0 |

The original 2,896 printed groups permit 3,087 latent units under this exact relaxed construction; 124 groups have multiple refinements. Every permitted refinement leaves all ciphertext rune values, repeat events, visible separators and renderer inputs unchanged. In eight chapters at least one observed codeword is the concatenation of shorter observed codewords. The p54–55 chapter has a unique partition of the **observed tape under this post-selected dictionary**, not an identified cipher or source-language alphabet.

A second forward/backward segmentation DP removes the printed endpoint and carry restrictions, permitting the same dictionary to parse the whole chapter. For a chapter tape of length n, the number of full parses that cut at offset k is F(k)B(k). On all 47 chapter-internal physical transitions (including the two boundaries of rune-free p50), this count is either zero or the complete parse count, agreeing with the 32 carry / 15 noncarry geometry. Thus even this less restricted original-conditioned vocabulary reproduces all internal page carry flags, while eight chapters remain ambiguous. This is a conditional combinatorial observation rather than a likelihood test against independent text.

The held-last-page check exposes why this cannot qualify as a frozen original receiver: if D_c is built only from complete groups ending before the chapter's last page, just **4/333** complete groups wholly inside those withheld pages are seen as whole codewords. This is coverage, not a proof that they cannot be parsed as concatenations of known smaller codewords, and not a prediction of source language. Using the complete chapter dictionary to claim successful carry prediction would leak the target.

## Consequence and reopening condition

Do not accept a variable-length receiver solely because it reproduces the native widths, carry flags, length distribution and repeat count after seeing the original tape. It must specify independent source-unit identities, codebook/grammar, state and synchronization (including when a unit is split across a printed line), with a distinguishable prediction on unseen ciphertext or authenticated source text. A dictionary taken from the target cannot supply that. No source-selected candidate meets the prerequisite; no new cipher sweep or original plaintext scoring was performed. A genuine historical variable-length representation selected by a new source cue, with an exact independent state/framing rule, would reopen the branch. The length-preserving rival remains viable.

Reproducer: [sims/lp2_carry_preserving_segmentation_sft.cjs](../sims/lp2_carry_preserving_segmentation_sft.cjs), exact core executed in connected V8 with small ambiguous/unambiguous/carry-fixed controls and source-count assertions. Node standalone wrapper not separately executed. No simulated native plant is claimed: the source-selector gate failed, and the calculation is a structural counterexample rather than a proposed sender/receiver calibration.
