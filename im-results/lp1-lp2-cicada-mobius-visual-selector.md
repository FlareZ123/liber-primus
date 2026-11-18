# LP1/LP2 cicada artwork and candidate Möbius direction selector

**Status:** intermediate source/visual finding; not a decipherment.

## Observation

The original scans contain the same cicada artwork in five locations. A fixed-crop, grayscale-thresholded, 8-connected-component SFT compares the silhouettes without OCR, resizing, language scoring or cipher fitting. Reproducer: sims/lp1_lp2_cicada_mobius_sft.py.

| Physical page | Original image | μ(page) | ω(page) | Observed copy |
|---|---:|---:|---:|---|
| LP1 p9 | 09.jpg | 0 | 1 | One base-orientation cicada |
| LP1 p13 | 13.jpg | −1 | 1 | One horizontal reflection |
| LP1 p15 | 15.jpg | +1 | 2 | Two 90°-turned copies, one additionally mirrored |
| LP1 p16 | 16.jpg | 0 | 1 | One base-orientation cicada |
| LP2 p2 | 19.jpg | −1 | 1 | One horizontal reflection |

Here μ is the standard Möbius function and ω counts distinct prime factors. The number of copies equals ω(page) for all five observed pages. After thresholding grayscale below 140 and retaining 8-connected components of at least 500 pixels, p9 and p16 are identical; p13 is an exact horizontal flip of p16. LP2 p2 and each p15 insect differ by only 35 pixels from the corresponding transformed p16 mask, with intersection-over-union above 0.999. The original pages are 2400×3600 pixels; exact crop coordinates and assertions are pinned in the SFT.

This is a striking **visual correlation**: μ=0 accompanies the base asset, μ=−1 the horizontal reflection, and μ=+1 the paired quarter-turns. It is compatible with the 2016 signed instruction that “their numbers are the direction”; the small infinity-like mark below the LP2 p2 insect is also compatible with a Möbius hint. Neither establishes that the author intended μ(page), and the small sample leaves decorative layout choices as a live rival. Do not promote the mapping to a cipher rule.

## Plausible human solve path

A solver who recognized the repeated cicada could compare its orientations and then notice the page-number arithmetic. The number-theoretic fit suggests that the page number might control a directional/reflection state. The LP2 p2 instance is horizontally reflected and faces right; μ(2)=−1. The 27×27 bootstrap already uses a Möbius-derived key rotation, so the visual pattern could be an independent clue that μ belongs in the intended directional mechanism. This does not authenticate the totient step or the exact key rotation.

The p2 page also carries a small infinity-like mark below the insect. It may be a Möbius/loop hint, but it may be decorative; no inference about toroidal wrapping is justified from that mark alone.

## Bounded tests

Two natural direct interpretations of μ as a path operation were tested and failed:

1. **The p16 3301 magic-square turn sequence.** Take the 25 square values in row-major order, apply μ, and interpret −1 = left, 0 = straight, +1 = right. Start at the center of the p0–p2 27×27 grid, heading east as suggested by the p2 cicada, then read after each move. The 25-step path stays in bounds, ends at zero-based (14,11), does not close, and reads:

   W EA J H M G P EA P L E X L AE A M IA IA Y S EO H EA O T

   Toroidal wrapping makes no difference because the path never reaches an edge. This rejects the simplest direct turn-sequence reading, not other uses of μ.

2. **A μ-signed word-prime-sum jump.** Let Sᵢ be the GP-prime sum of original printed word i and define next(i) = (i + μ(Sᵢ)Sᵢ) mod N. On the correctly joined original 2,896-word / 12,956-rune LP2 corpus, word 0 SHEOGMIAF (S=347, μ=−1) jumps to word 2549 EOEANGAE (S=427, μ=+1), then to word 80 THP (S=48, μ=0), which is a fixed point; the graph has 1,116 cycles. The solved p57 control follows PARABLE → OUR → OWN → SURFACE → LICE, then fixes at LICE. This direct word-jump interpretation is not a plaintext decoder.

The p55 line-4 mapline sums 60, 129, 159 have μ values 0, +1, +1. Agent2 has been asked whether a fixed coordinate model exists that makes these direction labels testable; none is currently established.

## Actionable block-5 selector hypothesis

In Agent28's current p0–p2 block-5 tie, the I | MAY candidate at source index 693 reads west, while X | EARTH at index 357 reads east (inferred from the original word-boundary crossing after its first output rune). LP2 p2's cicada faces right and has μ(2)=−1; **if** it is a direction marker, it favors the eastward X | EARTH branch.

Agent28 has been asked to confirm the exact path coordinates and test this without language scoring. Acceptance requires forward re-encryption and continuation into the next block under the same frozen operation. If the next block fails, reject the selector rather than rescuing it with a new rule. X | EARTH is not recovered plaintext.

## Limitations and classification

- Five observed pages are a small sample. The transformation-to-μ mapping is an interpretation, not a first-party instruction.
- The p15 pair's two copies match ω(15)=2, and the other four pages each have one copy matching ω=1, but this may be a deliberate visual flourish rather than a cipher.
- The p2 infinity-like mark does not prove a Möbius strip, wraparound, or a toroidal grid.
- The direct μ-turn and μ-signed word-jump tests are negative; they do not falsify every possible use of μ.
- No plaintext, key, cipher architecture, or destination has been recovered from this observation.

## Reproduction

Run from the repository root:

    python sims/lp1_lp2_cicada_mobius_sft.py

Inputs are the original JPEGs under resources/liber-primus. The script pins the crop coordinates, threshold, component-size cutoff, and μ/ω calculations. The word-jump and magic-square turn tests above are separately specified by their exact formula, ordering, start, direction and output.
