# Three-page original five-dot reflection family: LP2 p7, p23 and p56

**Decision, 14 November 2026 (Agent42).** The *same original five-dot drawing* occurs at the **end of p7**, **start of p23**, and **end of solved p56** in three distinct geometric orientations. All 58 original LP2 scans, searched under all eight planar square symmetries, contain **exactly these three high-confidence copies**. P7 is a **vertical reflection** of p23; p56 is a **180° rotation** of p23. There is no comparably matched fourth copy in the original corpus under an independent horizontal reflection, quarter-turn, or diagonal reflection.

**Important historical correction:** a participant **phobos** already explicitly reported this three-page relation in the contemporaneous [11 January 2015 original #cicadasolvers log](https://github.com/neuroretransmit/cicada/blob/master/irc-logs/%23cicadasolvers.freenode.2.log), original source line **66584**: p7’s five dots are at its bottom, p23’s are the same dots flipped at the top, and p56’s are mirrored at the bottom. The source measurements below *reproduce and sharpen a previously observed fact*, not a first-world discovery. A 10 January 2016 participant **ronni** at original lines **244067–70** explicitly suggested that the diagrams might specify an inverted Gematria alphabet, an inverted decoding algorithm, or both; another line **244143** mentions reversing the prime-minus-one operation. These were participant hypotheses, not signed Cicada instructions or demonstrated cryptanalysis. The targeted source-exact original IRC scanner is [here](../sims/lp2_p23_p56_halfturn_irc_witness_sft.cjs), with [successful CI run 43634393419](https://github.com/FlareZ123/liber-primus/actions/runs/43634393419).

## Exact original artwork, images, and complete source census

| LP2 page | Source JPEG, SHA-256 | Position and transform relative to p23 |
| --- | --- | --- |
| **p7** | [24.jpg](../resources/liber-primus/24.jpg), 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c | Bottom of prior p3–7 chapter; **vertical flip** |
| **p23** | [40.jpg](../resources/liber-primus/40.jpg), d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee | Top of p23–26 chapter; **reference** |
| **p56** | [73.jpg](../resources/liber-primus/73.jpg), a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc | Bottom of solved **AN END**; **half-turn** |

All images are original 2400×3600 archived scans. They have five comparably sized filled black circles of roughly 3,370–3,560 ink pixels per circle at grayscale threshold 90. Match sites sorted by increasing X on p23. The p7 sites have the *same* X coordinates, and p56’s are matched in decreasing X order. Frozen original-image transforms are:

\[
(x_7,y_7)=(x_{23},\,3674-y_{23}),\qquad
(x_{56},y_{56})=(2401-x_{23},\,3255-y_{23}).
\]

The largest measured p7/p23 site-centroid deviation is **0.093 pixels**; the largest p23/p56 deviation is **0.582 pixels**. Crop p23 (source x=735..1599, y=450..849), reflect the exact corresponding p7 source region vertically (p7 y=2825..3224), and threshold both at grayscale 125. The p23 dark mask is wholly contained in the reflected p7 dark mask: **17,908 / 17,925 = 0.999051604 intersection-over-union**, only **17** changed memberships. Apply the stated half-turn to p56: **17,684 / 18,112 = 0.976369258 ink IoU**, 428 different memberships, all within 1.4143 pixels of circle edges. There is no observed internal dot retouching at this threshold.

For the complete original-page census, resize the source 2400×3600 JPEGs for physical p0–p57 to 600×900; use the frozen p23 image crop (x=184..399, y=113..212). With OpenCV normalized correlation search each page under identity, horizontal flip, vertical flip, 180° rotation, two quarter-turns and two diagonal transposes, the leading matches are:

| Source page | Matched transform | Correlation |
| --- | --- | ---: |
| **p23**, scan40 | Identity | **1.000000** |
| **p7**, scan24 | **Vertical flip** | **0.997057** |
| **p56**, scan73 | **Rotation 180°** | **0.990527** |
| Best unrelated scan **p33**, scan50 | Rotation 180° | **0.398765** |

No additional page in the 58-image source set has a strong stencil match. Full source-byte verification and image/cipher gates are in the [reproducible Windows/Python SFT](../sims/lp2_p23_p56_halfturn_emblem_sft.py), run through the [manual-only Windows workflow](../.github/workflows/agent42-p23-p56-halfturn-manual.yml). An earlier two-orientation search found only p23/p56, because it omitted the vertical reflection that retrieves p7; do **not** repeat its earlier claim that the matched artwork is exclusive to that pair.

## Specific original-source inverse gate: no p23 plaintext recovered

The solved p56 key stream is the consecutive-prime totient \(k_i=(p_i-1)\bmod29\), starting at prime 2, with GP29 decryption \(P=C-k_i\bmod29\) and an optional *literal plaintext F* bypass. A non-F ciphertext rune **cannot** decrypt to literal plaintext F. The SFT reproduces original p56 **ANEND** exactly (5/5) and confirms the full 85-rune solved p56 retains a valid bypass path.

P23’s physical first16 source runes are a red heading, with no ciphertext F. Applying the authentic first16 prime shifts to the unmodified or reversed heading and forward or reversed prime list produces two immediate impossible-F cases; the two F-consistent cases remain nonprose. Original p23–26 is a **1,021-rune** chapter (213+270+273+265). Rather than choose an F-mask, the SFT enumerates **every admissible F-bypass key-clock state** in all four source-finite full-chapter reversal hypotheses, with a prime list of precisely the chapter's original length:

| P23–26 rune order | Prime key order | First forced non-F→plaintext-F contradiction, zero-based |
| --- | --- | ---: |
| Forward | Forward | **0** |
| Forward | Reversed | **7** |
| Reversed | Forward | **162** |
| Reversed | Reversed | **24** |

This **excludes only the four direct zero-offset prime-totient consumers of a full source chapter** under the established p56 F rule. It does not disprove the three-page geometric clue, a separate alphabet inversion, vertical line-order reflection, different source-selected starting prime, extra cipher state, or the possibility that the drawings are reused solely for design. No fresh unknown LP2 plaintext, source-selected key, inverse, digest preimage, or destination has been authenticated.

## Additional source-selected pagewise reflection gate (19 November 2026)

The five-dot image relation also motivates a narrower test than reversing the entire 1,021-rune chapter: vertically reverse the **printed-line order of p23 only**, or rotate **p23 only** by 180 degrees, leaving p24–p26 in their original order. Apply the established p56 prime-totient stream, first 1,021 primes with key (prime−1) mod 29, in forward and reversed order. Enumerate every admissible literal-F bypass clock state; no F mask is chosen.

| p23-only transform | Prime-key order | First forced contradiction, zero-based |
|---|---|---:|
| Vertical line-order reflection | Forward | **0** |
| Vertical line-order reflection | Reversed | **67** |
| 180-degree page rotation | Forward | **17** |
| 180-degree page rotation | Reversed | **143** |

The contradiction occurs within p23, so extending the same pagewise transform to p24–p26 does not change these offsets. This rejects these four source-motivated **direct prime-totient consumers** under the established p56 F rule. It does not reject a navigation-map role for the emblem, a different alphabet permutation, a distinct key schedule, or a layered cipher.

A separate source-constrained interpretation of the same line layout is now recorded in [the H-shell line-length navigation-map report](lp2-hshell-line-length-navigation-map.md). It should be evaluated as a navigation hypothesis, not silently folded into the prime-totient claim.

## Plausible intended route and next decisive input

The **p7 lower** motif ends the preceding p3–7 chapter, **p23 upper** motif opens p23–26, and **p56 lower** motif closes solved AN END. The three authentic image transformations give specific candidates for a creator-selected operation. The new [H-shell line-length navigation-map report](lp2-hshell-line-length-navigation-map.md) supplies a more constrained navigation interpretation of these marks and the original page typography; it is not yet a cipher or plaintext. The fourth independent horizontal reflection is missing in the inspected 58-page corpus, but absence itself is *not* a key, stop instruction or cryptographic proof.

The old period log explicitly shows that human solvers noticed these echoes and guessed both alphabet and algorithm inversions. Their unsuccessful speculations are useful historical context but supply no authentic author-chosen cipher. Search for independent 2014–2016 creator text or a located historical worked example stating *what representation* should be reversed. A 17 January 2015 original message, line **74373**, references an unnamed participant’s **“PAGE 9 comments”** about the dot hint on p56; the exact page, preserved comment archive and author authority remain unresolved, so do not infer an instruction from that anecdote alone. Test a source-selected operation on withheld original ciphertext; demand at least **40 contiguous source-native plaintext runes** or a signed instruction, not an arbitrary key fit.

**Hash-preimage guard:** [the existing source hash ledger](archive-hash-preimage.md) already records 232 direct digest tests of all 58 raw LP2 JPEGs against p56's 128-hex target under four digest families, with no matches. The emblem relation does not justify retesting raw JPEG preimages.

**Status:** Three original-source image placements and their exact symmetries established; the source-selected pagewise vertical/180-degree direct prime-totient variants are rejected; a line-length H-shell navigation interpretation is now under test. Worldwide priority for the emblem relation correctly belongs to archived 2015 solvers. No unknown LP2 plaintext or final destination is established.
