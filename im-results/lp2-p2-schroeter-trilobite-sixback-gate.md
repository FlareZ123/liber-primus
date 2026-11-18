# LP2 p2 Schroeter trilobite: source attribution and six-back mechanism gate

**Status: intermediate negative gate. No plaintext, key, or complete cipher inverse recovered.**

## Finding

The illustration at LP2 p2 (original JPEG 19) was originally proposed as a match for the 1774 “leggy trilobite” attributed to J. S. Schroeter. A subsequent direct source-image test found **substantial illustration differences** between original 19.jpg and the specific 250×91 Schroeter/Fortey image on Strange Science; the origin plate remains unauthenticated. See [the direct comparison](lp2-p2-schroeter-source-image-comparison.md). The image identity is weaker than the original conjecture assumed. A historical-image catalogue identifies that figure as appearing in Richard Fortey's *Trilobite! Eyewitness to Evolution* (2000), and describes its unusual speculative legs and extra head. Fortey describes the reconstruction as having two heads, one reversed, and a tail possibly upside down. A later palaeontological review describes Schroeter's reconstruction as showing six pairs of limbs.

Sources:
- [Strange Science: Invertebrates — “Leggy trilobite”, 1774, J. S. Schroeter](https://www.strangescience.net/stinv.htm)
- [Richard Fortey, *Trilobite! Eyewitness to Evolution* (2000), searchable PDF](https://www.geokniga.org/bookfiles/geokniga-trilobiteeywitnesstoevolutionrichardfortey.pdf)
- [Biodiversity Heritage Library catalogue record for Schroeter's 1774 work](https://beta.biodiversitylibrary.org/item/141404)
- [2026 review discussing Schroeter's six pairs of limbs](https://www.sciencedirect.com/science/article/pii/S0012825226002126)

The attribution is **unverified and now visually disfavoured for a literal copy** of the specific source GIF, while a common visual ancestry or redraw remains possible. The exact 1774 plate has not been found. The 2026 paper is used only to corroborate the visible limb count; it cannot be treated as a clue available to a 2014 solver. Fortey (2000), or the original plate, could have been available.

## Solve-path hypothesis and frozen prediction

A solver noticing the unusual double-headed, legged fossil could reasonably identify it as a trilobite and follow the illustration to its source. The most concrete cryptanalytic cue is **six pairs of limbs**, suggesting a six-position relation. The reversed second head and inverted tail suggest a signed/doubled transformation.

The only exact affine six-back map already found in the original ciphertext is **T6(x) = 24 − 2x (mod 29)**. A visual interpretation can be proposed: lag 6 from six limb-pairs; multiplier −2 from a doubled/reversed head; and 24 from two heads times twelve limbs. The last step is weak and not uniquely compelled by the image. This is a candidate source-selection hypothesis, not an independently derived key.

Two narrow, fully specified realizations were tested:
1. **Continuous ciphertext-feedback additive transform:** C[i] = P[i] + T6(C[i−6]) (mod 29), with the first six ciphertext symbols as the fixed seed.
2. **Six-lane substitution transition:** within each printed word, the substitution alphabet advances by T6 every six positions. Undoing T6 to the power floor(j/6) should leave six monoalphabetic English substitution lanes.

No offsets, alternate affine maps, key sweeps, or post-hoc segmentation were tried.

## Original-cipher results

The canonical master transcription contains LP2 p0–p55 in 56 page segments, including numeric-only p50. Its delimiter README specifies that slash and percent are line/page markers and do not necessarily end words. The parser removes line/page markers while preserving word, clause, paragraph, segment, and chapter separators.

Reproduction gives:
- 56 LP2 pages p0–p55;
- 2,896 printed words and 12,956 GP29 runes;
- 1,290 within-word pairs separated by six positions;
- 80 hits for T6 among those 1,290 pairs;
- T6 is the unique best of the 812 invertible affine maps checked;
- the source-bearing p2 itself has only **2 hits among 34** six-back within-word pairs.

The 80 hits are distributed across the manuscript rather than concentrated on p2. The image would therefore have to be a global instruction, not a local encoding on the illustrated page.

### Test 1: ciphertext-feedback additive transform

Applying the frozen continuous-stream transform to all 12,956 original runes produces no readable English. The first six symbols remain the seed; all later symbols use the previous six ciphertext symbols and T6. The output retains a uniform-like index distribution (IC approximately 0.0345); the p2 passage and the withheld first paragraph of p3 remain nonlinguistic. The transform is reversible as specified, but it is not the LP2 inverse.

### Test 2: six-lane substitution transition

For each printed word and position j, compute D[j] = T6^(-floor(j/6))(C[j]); then treat each residue class j mod 6 as one monoalphabetic substitution lane.

The six transformed lanes remain almost uniform: their most frequent symbols range from **4.02% to 4.79%**. The six clear-GP LP1 pages (p3, p8–11, p14) have a top-symbol frequency of **12.29%**. The sorted 29-symbol frequency distributions have large L1 distances (0.56–0.64) from that clear-text control. This rejects the simple six-alphabet English substitution model.

## Interpretation

The image is a plausible historical source match and a human-visible reason to consider a six-position operation. It does **not** currently yield a complete cipher mechanism or plaintext.

There is also a stronger, independent historical explanation for the same affine map: the repository's [2013 signed DH6-to-LP2 source bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md) already connects exponent 6, shared secret 2, and BASE29 value 24 to T6. That source bridge is more specific than counting the trilobite's limbs and heads. The p2 artwork may be a visual echo, but it does not independently validate the cipher.

The 24 = 2 × 12 interpretation is vulnerable to post-selection. The source image does not uniquely specify the intercept, affine operation, state update, or initial key. The continuous feedback realization also fails on the 85 first-per-word and 86 all-event carriers under the same source-selected T6 map; see [the carrier-specific gate](lp2-doublet-gap-source-boundary-conditional-gate.md). Do not rescue this branch by adding another feedback layer or searching more offsets.


## Textual source check: the surrounding Fortey passage is not a direct p2 crib

The p2 page contributes 201 runes across 38 page-local word fragments; the first fragment is only the final two runes of a word begun on p1, leaving 37 complete words. Their lengths are:

2, 1, 2, 7, 3, 6, 7, 3, 5, 4, 7, 10, 7, 2, 7, 7, 5, 4, 7, 6, 9, 3, 2, 1, 8, 9, 6, 10, 4, 3, 8, 8, 3, 2, 2, 10, 2, 9.

The paragraph beginning “Without their limbs these wonderful fossils were geological cyphers” is 48 words, not 38. Comparing the 37 complete p2 lengths with contiguous 37-word windows in the OCR-extracted passage surrounding the figure (ordinary whitespace tokenization; hyphenated compounds split) produced no exact match; the best window matched only 10/37 lengths. This rejects a simple word-preserving quotation of that nearby passage. It does not rule out Fortey as a key text, but no source-selected starting point or extraction rule is established. Do not expand this into an unconstrained book-walk search.

## Strongest unanswered source question

Can the exact LP2 p2 drawing be matched pixel-for-pixel to the Schroeter plate or to the reproduction in Fortey (2000), and is there any contemporaneous Cicada source that points a solver to that book, plate, or caption? Until that link is established, the figure should be treated as a likely art-source attribution, not a cryptographic instruction.

## Reproduction

- [Deterministic Node.js gate](../sims/lp2_p2_trilobite_t6_gate.cjs) reproduces the corpus counts, all 812 affine-map counts, p2's 2/34 result, the continuous feedback output, and the six-lane frequency comparison. [Successful Node22 run 44282695789](https://github.com/FlareZ123/liber-primus/actions/runs/44282695789).
- [Original full-affine Quagmire SFT](../sims/lp2_clock_quagmire_full_affine_motif_sft.cjs) strips slash line markers as well as percent page markers, consistent with [the transcription delimiter specification](../resources/transcriptions/README.md).
- The T6 result remains a ciphertext structural observation, not recovered plaintext. See also [the original-model gate](lp2-clock-quagmire-full-affine-original-model-gate.md).
