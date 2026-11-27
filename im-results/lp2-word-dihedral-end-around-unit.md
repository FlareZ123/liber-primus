# Circular BASE29 end-around unit inverse on the terminal black body

**Decision:** The exact width-private unit multiplier family below requires at least seven out-of-vocabulary fit groups among the 47 complete black-body p54 groups. It fails the frozen three-OOV budget even granting independent circular cuts and reversals on both sides. No unknown plaintext or authentic key recovered. This is not an exclusion of all cyclic integer transforms, nonmultiplicative masks, alternative segmentations or unseen vocabulary.

## Solve path and relation to existing results

The signed 2013 BASE29 example supplies an authentic positional-integer operation. The solved p57 instruction to shed circumferences motivates testing circular digit words: multiplication by 29 modulo 29^L−1 rotates an L-digit word, unlike ordinary arithmetic modulo 29^L. Neither source specifies modular unit multiplication or the actual word segmentation. The strongest rival is that circumference is a visual framing clue, not arithmetic on individual printed words. The distinct [end-around progressing affine receiver](lp2-word-end-around-carry-quadratic-original-gate.md) has already failed the singleton gate; the [ordinary BASE29 and free-cut additive receiver](lp2-word-base29-additive-allsecret-carry.md) and [cyclic convolution receiver](lp2-word-dihedral-cyclic-convolution.md) operate over different rings. This experiment grants independent keys per width and tests the exact circular multiplicative receiver rather than extending a prior clock sweep.

For each width L, let M=29^L−1. Fix an unknown unit K_L in Z/MZ, keep the all-max-digit word (integer M) as its own sentinel, and for all other words decode P=K_L C mod M. Grant independent rotations and reversals of both plaintext and ciphertext, with a direction/cut selector not supplied by the original source. The underlying multiplication is bijective with inverse K_L^−1; the independent orientations are latent choices, so a unique full-text inverse would also need a way to select them. This generous relaxation tests whether a common width-specific key orbit can produce lexical domains at all.

## Exact key inference

For each original word, consider its forward and reversed integer c. For each lexicon word of the same width, consider its forward and reversed integer p. Independent rotations on either side multiply these integers by powers of 29 modulo M. Since 29^L=1 mod M, all resulting keys are covered by the orbit {29^j K mod M : 0≤j<L}; store its minimum representative. For d=gcd(c,M), solve Kc=p mod M only when d divides p. Then K ≡ (c/d)^−1(p/d) mod M/d, with d possible lifts modulo M. Retain only unit lifts and canonicalize each orbit. The implementation grants a free anchor if any d exceeds 2048, or if the reduced modulus is one; none of the twelve original anchors is skipped. A sentinel target is excluded from nonsentinel anchors, as required by the receiver. Each anchor contributes at most one support vote per orbit. Maximizing overlap across all enumerated domains gives the exact maximum lexical coverage of these original anchors for each width.

## Actual original-input result

Canonical corpus parser reproduces all 12,956 rune indices and 2,896 complete groups. Corrected terminal body is 64 groups/299 runes, with the red heading excluded and the cross-page carry complete. Fit: first 47 complete black p54 groups (213 runes); hold: complete 11-rune carry and remaining p55 groups (17 groups/86 runes). Lexicon: 33,278 distinct GP forms from pinned TextBlob and solved-native source, same normalizations as the prior cyclic-convolution receiver. Test widths 6,7,8,10 (12 fit anchors), chosen as in the previous terminal long-anchor experiment.

| Width | Original fit anchors | Union of key orbits | Maximum support | Orbits at maximum | Minimum OOV |
|---|---:|---:|---:|---:|---:|
|6|4|16,984|2|7|2|
|7|1|9,374|1|9,374|0|
|8|5|23,528|1|23,528|4|
|10|2|4,998|1|4,998|1|

At most 5/12 anchors are covered, requiring at least 7/47 fit groups outside the lexicon even if every untested group matches. No width-8 orbit covers two anchors; the occasional representative single-word readings (e.g. ABERDEEN, ABANDON) are post-selected and not plaintext. The original fit gate fails before a continuation is selected; no original held-out decryption claimed. This is a finite lexicon/printed-group/three-OOV decision, not universal English impossibility.

## Hidden-key calibration

Two deterministic matched-width lexical plants independently select secret units and independent dihedral orientations for every word. Every true key orbit is retained in all eight width/plant cases, with all 12 fit anchors covered in each plant. Five of eight width key orbits are uniquely identified; width 7 has one anchor and is expectedly ambiguous, and the second width-10 plant has four tied orbits. The uniquely recovered width-6 keys decode all eight withheld words uniquely (48/48 runes); no eligible width-8 or width-10 held groups exist, so no holdout claim there. Forward multiplication/inverse is asserted on every eligible planted word before recording its independent output orientation. The plants are dictionary samples, not natural contiguous prose or a native historical sender; they calibrate arithmetic inference only.

## Reproduction and next decision

- [Executable SFT](../sims/lp2_word_dihedral_end_around_unit_sft.cjs), commit 30a305b99e4b5b3ed6a23d85ebbadd8c6aafd447.
- [Exact outputs and domain sizes](lp2-word-dihedral-end-around-unit.json), commit fa56966222383f85e7a340387ac6183bfbf4a3ea.
- Executed in V8 against the four pinned repository inputs; no separate Node process or CI dispatch. Run from repo root: `node sims/lp2_word_dihedral_end_around_unit_sft.cjs`.

Retire this precise shared-width unit receiver at the stated budget. Do not add affine, time-varying, or hidden segmentation variants merely to rescue it; require a new independent source selector. No authoritative frontier promotion.
