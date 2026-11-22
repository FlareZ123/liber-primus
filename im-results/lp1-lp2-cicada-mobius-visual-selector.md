# LP1/LP2 cicada artwork and candidate Möbius orientation code

**Status:** intermediate source/visual evidence; not a decipherment, key recovery, or authenticated directional rule.

## Full 75-image scan

The same cicada-like asset appears in six original LP1/LP2 JPEGs: LP1 p1, p9, p13, p15, p16, and LP2 p2. The full-corpus reproducer is [sims/lp1_lp2_cicada_fullscan_sft.py](../sims/lp1_lp2_cicada_fullscan_sft.py); it uses the original 75 JPEGs, the fixed p16 crop, eight dihedral transforms, quarter-scale normalized template matching, and fixed-crop checks for the already identified pages.

| Physical page | Original image | μ(page) | ω(page) | Observed transform state |
|---|---:|---:|---:|---|
| LP1 p1 | 01.jpg | +1 | 0 | Two quarter-turn copies, one additionally mirrored |
| LP1 p9 | 09.jpg | 0 | 1 | One base-orientation copy |
| LP1 p13 | 13.jpg | −1 | 1 | One horizontal reflection |
| LP1 p15 | 15.jpg | +1 | 2 | Two quarter-turn copies, one additionally mirrored |
| LP1 p16 | 16.jpg | 0 | 1 | One base-orientation copy |
| LP2 p2 | 19.jpg | −1 | 1 | One horizontal reflection |

The full scan's only pages with best normalized correlation ≥0.60 are exactly [1, 9, 13, 15, 16, 19]. Best scores are p1 0.6507, p9 0.8883, p13 0.8885, p15 0.8803, p16 0.8883, and p2 0.8118. The strongest noncandidate is image49 at 0.2412. Image01 has two distinct non-overlapping quarter-turn matches, 0.6507 and 0.6303, corresponding to the two-copy pattern also present on p15.

The fixed-crop checks retain the earlier exact findings: p9 and p16 masks are identical; p13 is an exact horizontal flip of p16; p2 differs from that reflected mask by 35 pixels with IoU above 0.999; and each p15 copy differs from its corresponding quarter-turn transform by 35 pixels with IoU above 0.999.

The observed transform state correlates with the standard Möbius function of the physical page number: μ=+1 accompanies the paired quarter-turn state (p1, p15), μ=0 the base state (p9, p16), and μ=−1 the horizontal reflection (p13, p2). This is a stronger six-page source pattern than the earlier five-page observation. **The earlier copy-count = ω(page) suggestion is withdrawn:** p1 has two copies but ω(1)=0. Copy count is not a general ω rule.

This remains a visual correlation. It does not establish that the author intended μ(page), or that the transform state is a cipher instruction. The p2 insect's head faces right, while μ(2)=−1. Reading the head literally as an arrow suggests east; interpreting the negative Möbius value as a signed horizontal direction suggests west. No first-party instruction yet chooses between those conventions. The small infinity-like mark below the p2 insect is compatible with a Möbius hint but may be decorative.

## Plausible human solve path

A solver could notice the repeated asset, compare its orientation states, then calculate μ for the page numbers. The six occurrences form two repetitions of the three visual states: +1 quarter-turn pair, 0 identity, −1 horizontal reflection. The archived 2016 signed payload says: “Its words are the map, their meaning is the road, and their numbers are the direction.” Grammatically, “their” most directly refers to “words,” not pages. This supports investigating word-associated numbers (indices, lengths, GP-prime sums, or another source-defined value), but it does not authenticate μ(page) as a direction. Do not use this sentence as evidence for page-number direction without an independent clue.

The p2 page is physically part of the p0–p2 27×27 bootstrap. A later source-only physical-boundary test selects the westward I MAY branch. This happens to agree with interpreting μ(2)=−1 as west, but the 2016 signed message's “their numbers” refers most directly to words, not page numbers; it is therefore not independent source support for μ(page) direction. The boundary grammar was recognized after the public candidate route and remains intermediate.

## Bounded μ tests

Two direct interpretations of μ as a path operation were tested and failed:

1. **The p16 3301 magic-square turn sequence.** Take the 25 square values in row-major order, apply μ, and interpret −1 = left, 0 = straight, +1 = right. Start at the center of the p0–p2 27×27 grid, heading east as suggested by the p2 cicada, then read after each move. The 25-step path stays in bounds, ends at zero-based (14,11), does not close, and reads:

   W EA J H M G P EA P L E X L AE A M IA IA Y S EO H EA O T

   Toroidal wrapping makes no difference because the path never reaches an edge. This rejects the simplest direct turn-sequence reading, not other uses of μ.

2. **A μ-signed word-prime-sum jump.** Let Sᵢ be the GP-prime sum of original printed word i and define next(i) = (i + μ(Sᵢ)Sᵢ) mod N. On the correctly joined original 2,896-word / 12,956-rune LP2 corpus, word 0 SHEOGMIAF (S=347, μ=−1) jumps to word 2549 EOEANGAE (S=427, μ=+1), then to word 80 THP (S=48, μ=0), which is a fixed point; the graph has 1,116 cycles. The solved p57 control follows PARABLE → OUR → OWN → SURFACE → LICE, then fixes at LICE. This direct word-jump interpretation is not a plaintext decoder.

## p55 mapline correction

The earlier p55 line-4 proposal CX / DJU / BEI with GP-prime sums 60 / 129 / 159 is invalid as a complete-word interpretation. The finite prime_echo boundary300 cuts the canonical word CEAIMCX after rune4/6, so CX is only a continuation fragment. The first two intact complete words are DJU / BEI, with sums 129 / 159 and μ=+1 for both. The source-selected p55→p27 repeated-pair handoff remains an intermediate structural observation, but it supplies no 0-versus-+1 Möbius direction contrast. See [the corrected p55/p27 word-map report](lp2-p55-p27-wordmap-null.md) and [its source SFT](../sims/lp2_primeecho_intact_pair_handoff_sft.cjs).

## p0 block-5 status: physical boundary selects west, not the cicada alone

The former block-5 tie was I | MAY (west) versus X | EARTH (east). The committed [physical-p2-boundary SFT](../sims/lp2_p0_block5_p2_boundary_chain_sft.cjs) now selects the westward I MAY branch without language scoring: the original page lengths 262 / 266 / 201 place the physical p2 start at grid cell (20,16); the frozen mirror/boundary grammar yields one block-5 boundary hit, then the chain continues through CRY, NOW THE, and IDEA. The report is [lp2-p0-block5-branch-continuation-gate.md](lp2-p0-block5-branch-continuation-gate.md).

This selector is independent of μ(2): the SFT uses μ only inside its local mirror-node key derivation, not on the page number. The mirror/totient/boundary grammar was recognized after the public route was known, so it is still intermediate rather than an authenticated decoder. The p2 artwork's right-facing head and the negative page-number value remain competing visual conventions; the boundary SFT does not resolve which one the creator intended.

## Limitations and classification

- The six-page transform/μ correspondence is source-visible and reproducible, but remains a small-sample visual correlation.
- The p1 addition invalidates the earlier copy-count = ω(page) claim.
- Neither the infinity-like mark nor the reflected insect proves a Möbius strip, wraparound, or a toroidal grid.
- The direct μ-turn and μ-signed word-jump tests are negative.
- The p0 physical-boundary chain is post-hoc and does not authenticate the visual μ-direction convention.
- The 2016 signed payload's “their numbers” grammatically refers to words, not pages; it does not source-authenticate μ(page) as a direction.
- The p55 three-value mapline direction interpretation is withdrawn because CX is not a complete word.
- No unknown plaintext, author key, cipher architecture, or intended destination has been recovered from this artwork.

## Reproduction

Run from the repository root:

    python sims/lp1_lp2_cicada_fullscan_sft.py

Dependencies: numpy, Pillow, and opencv-python-headless. The script pins the original p16 template crop, grayscale threshold, component cutoff, all eight transforms, quarter-scale matching, candidate threshold, and fixed-crop assertions. The older five-page fixed-crop test remains at sims/lp1_lp2_cicada_mobius_sft.py.
