# The blurred page-32 and outlined page-55 trees share a source silhouette

**Evidence: original-image geometric correspondence, 10 November 2026.** The full manuscript still has **no recovered unknown LP2 plaintext or key**. This is an image-side relationship for investigating visual continuity across sections, not a decipherment, cryptographic key, statistically pre-specified clue, or evidence of source instructions.

## Source and method

The archive's original **49.jpg (physical LP2 page 32)** shows an intentionally blurred black tree. Original **72.jpg (physical LP2 page 55)** shows a pale, finely delineated tree over a moth. The corresponding source files are [49.jpg](../resources/liber-primus/49.jpg) and [72.jpg](../resources/liber-primus/72.jpg).

The p55 tree is transformed using **only image operations**, with no ciphertext fitting: extract grayscale, threshold intensity below 240 inside x=[650,1760), y=[1410,2480), retain the largest 8-connected component and fill its single external contour. The p32 source crop is x=[650,1760), y=[2060,3130), then source darkness is `max(0,252-gray)`. Downsample both crops to 30%, apply Gaussian smoothing with sigma=6 low-resolution pixels, and optimize four affine translation/scale parameters against Pearson image correlation (fixed SciPy differential-evolution seed 13 and declared bounds). Pearson is evaluated on an interior crop excluding 20–30 edge pixels. The original p32 blurred tree therefore appears compatible with the **filled silhouette** of the p55 outlined tree under a modest position/scale adjustment.

| Measurement | Observed |
| --- | ---: |
| Unaligned source-image correlation | **0.81454** |
| Affine-aligned source-image correlation | **0.87337** |
| Same search with horizontal reflection of p55 tree | **0.71290** |
| Aligned source-image foreground intersection-over-union (p32 gray<220) | **0.69895** |
| Fitted scales x,y | **0.9561, 0.9779** |
| Fitted shifts in original pixels x,y | **+9.18, +33.83** |
| p55 thresholded outline / filled-silhouette pixel counts | **190,118 / 311,357** |

The identity correlation is already high before optimization; reflected orientation is a **descriptive negative control**, not a formal significance test against all tree art. The two images were selected by visible similarity and the crop, thresholds, fill and Gaussian comparison are analyst-selected. Accordingly, none of the numerical scores should be assigned an independent p-value or used alone to assert Cicada's cryptographic intent.

Exact scans hashed SHA-256:

- `49.jpg`: `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`
- `72.jpg`: `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`

Run [the self-contained geometry reproducer](../sims/tree_outline_blur_registration.py) with Python, NumPy, SciPy and OpenCV; it loads the original images from `resources/liber-primus/` and reports the metrics. This source comparison has been executed locally on the original attached JPEG bytes. No new CI workflow was created.

## Independent historical context: the signed 2016 tree image

A [contemporaneous January 2016 thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here) explicitly compared the background **oak tree** in 2016 image `4gq25.jpg` with Liber Primus combined archive **49.jpg**. The prior public identification of that relationship must not be presented as a discovery made in this study. The [historical signed-message archive](https://github.com/scream314/cicada3301/blob/master/2016.md) independently documents `4gq25.jpg` as carrying an OutGuess-extracted and PGP-verified message including “Liber Primus is the way” and directions to treat its words, meanings and numbers as a route. The source-image comparison here adds the previously unreported **p55 detailed tree silhouette** to this visual lineage. Neither the text nor original illustration supplies a specified mathematical function mapping tree branches to rune plaintext.

## Specific bookend-phrase OutGuess test

The original ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` is duplicated on p27 and p55. Since historical Cicada used OutGuess and these pages have source-image connections, a finite source-fixed extraction test used six literal and transliterated forms of that pair as candidate passwords across **all 58** original LP2 JPEGs: `DJUBEI`, `djubei`, `DJU-BEI`, `dju-bei`, `DJU BEI`, and `ᛞᛄᚢᛒᛖᛁ`. The existing pinned extractor passed authentic LP1 and synthetic embedded-message controls.

**Outcome:** **348** new password/image combinations produced **zero** recognizable OpenPGP, gzip, ZIP, PNG or printable-text payloads. **213** had internally consistent but unauthenticated OutGuess length/seed headers, illustrating that such headers are unreliable. These exact six passwords have no supported LP2 extraction under the tested standard OutGuess model. Reproducible [completed CI run 42801260989](https://github.com/FlareZ123/liber-primus/actions/runs/42801260989) used [branch-only key variants](https://github.com/FlareZ123/liber-primus/blob/f2a63632e90cb5b911fe21f1b169db1e68155a35/sims/outguess_lp2_keyed_probe.cjs).

## Reversible cross-page stream-key hypothesis

Because the image comparison identifies **p32 and p55 specifically**, a second test treats the original 121-rune p32 ciphertext sequence as a direct GP29 additive running key for the 76-rune p55 ciphertext, retaining p55's **19 actual word boundaries**. Decode `P_i=(C55_i ± Csource_{offset+i}) mod29` with forward/reversed key direction, both signs, and **46 source offsets**. To control the source choice, repeat the *same* 184 variants on each of the **52** eligible original pages (all sources have at least 121 runes; p55 excluded). The identical search size per source avoids favoring longer page streams. In total, **9,568** exact inversions are scored with one frozen, word-local GP-English trigram language model trained on the first 300,000 characters of `resources/control/shakespeare_first300k.txt` (55,407 original Latin word tokens, 218,800 encoded GP runes).

On original p55, the best **p32** key variant ranks **fourth out of 52 source pages**, score **−353.5903** log units (source offset 34, forward, plus sign), and begins `ASHAXNOCMNRDGFTACEYUSDUW`; it is unreadable. The best source is **p40** (−347.4802), also unreadable. The median per-source maximum score is −369.9293. Neither a key nor plaintext was recovered.

**Exact positive control:** encrypt independently sampled original-layout GP-English words with the original p32 stream at offset 17, source-forward, plus encryption sign. The same unmodified scanner ranks **p32 first** and exactly recovers the offset, direction, and inverse sign; true-plaintext trigram score **−154.9158**. This wide source-language score gap is a useful diagnostic of how far real outputs are from the genuine tested GP-English-keyed mechanism. It is *not* a significance test for every possible cipher or for non-GP language.

Run [the full original-corpus inverse with planted control](../sims/tree_linked_crosspage_pad_inverse.cjs), executed successfully in [GitHub Actions run 42803343324](https://github.com/FlareZ123/liber-primus/actions/runs/42803343324). CI reused an existing workflow with a branch-only command substitution; the verified script and all source inputs are committed on main, and no permanent new workflow was created. This source-constrained direct-key model is now closed.

## A separate moth-page and 256-byte-grid structural candidate

The final section's original images **70.jpg (LP2 p53)** and **72.jpg (LP2 p55)** share the moth and ornamental side-panel composition. Independently verified source transcription and red-ink annotations show **p53 = 128 black + 51 red GP runes**, followed (after intervening p54) by **76 runes on p55**. Thus these image-linked pages contain **128 + (51+76) = 255 GP runes**, an exactly balanced **128 + 127** split. The earlier numerical grid in the same section has **256 bytes** (`resources/liber-primus/base60-grid.json`). Exhaustively enumerating all **1,485** unordered pairs of the 55 rune-bearing unsolved physical pages, **p53 and p55 are the sole pair summing to 255**.

This exact numerical correspondence is a **source-supported structural observation**, and a natural candidate for a 256-position cipher schedule with one reserved byte. The pages, motif family, byte count and special integer 255 were all considered during exploration, so the uniqueness count is *not* an independent p-value, and a 256-byte cipher schedule remains hypothetical. The ornament and final red dot do not yet supply a defined assignment to the unused byte. In particular, a graphic motif matching across pages is not evidence of a shared cryptographic key.

**Finite direct inversion tested:** concatenate original p53 and p55 rune streams in source order, preserve their **65 original words**, and attempt `P_i = C_i ± f(grid[(offset ± i) mod256]) mod29` using all 256 phase offsets, two directions, both signs, and three source-defined byte maps (`byte%29`, `floor(29×byte/256)`, `byte%28`). This is **3,072** explicit, reversible candidate decryptions, scored using a frozen, word-local GP-English trigram reference. The best original decoded candidate scored **−1301.2461** nats and is unreadable. A GP-English source-layout synthetic plant using byte-map 2 and offset 27 recovered the original plaintext **exactly** and selected the true key with score **−484.9839**. The original direct-grid model provides no plaintext; longer stateful grid transformations, missing-symbol interpretations or unknown permutations are outside this finite negative gate.

Reproduce with [the committed CJS inverse and source-layout plant](../sims/grid255_alternating_pages_inverse.cjs), executed successfully in [GitHub Actions run 42804256508](https://github.com/FlareZ123/liber-primus/actions/runs/42804256508). The workflow invocation used an existing workflow temporarily modified on an isolated branch, leaving main's CI definitions unchanged.


### Exact unknown byte-to-rune gate for the 255/256 correspondence

A different literal reading of the source numbers is that the 256 printed bytes form a **direct lookup table for the 255 runes on p53 and p55**, with exactly one grid cell omitted. Give this hypothesis a completely unknown, arbitrary fixed function `f: {0,…,255} → {0,…,28}`; no affine, modular, additive, injectivity, secret-key or GP-English assumptions are needed. A repeated source byte must always emit the same ciphertext rune. For an alignment, collect the observed label counts `n[b,r]`; its **exact minimum number of rune substitutions** is `255 − Σ_b max_r n[b,r]`. Every byte's modal rune attains the bound independently, so this is a constructive optimum over all `29^256` possible lookup tables.

The [source-original exact gate](../sims/grid255_unknown_byte_rune_gate.cjs) covers the complete 255-rune p53-then-p55 input and all **4,096** explicitly specified alignments: four natural 32×8 grid traversals (row-major, column-major, alternating row direction, alternating column direction), both grid-reading directions, both rune-reading directions and each of 256 possible omitted grid cells. The **best of every model needs 83 changes among 255 runes**, at column-serpentine, forward grid direction, reverse rune direction and gap 241. This best alignment contains **161 distinct source byte values**, yielding **94 constraints beyond one occurrence per distinct byte**, and **60 byte classes contain conflicting ciphertext glyphs**. The best direct row-major alignment still needs 85 changes. The result is an exact finite contradiction for all fixed lookup maps in the stated alignments, unaffected by an arbitrary secret relabeling of the 29 runes.

A deterministic control first generates a secret 256-entry byte-to-rune lookup, follows the true column-serpentine/reversed table traversal and omits cell 73. Without access to that lookup, the same original-source minimizer finds **zero contradictions** and reproduces every one of **255/255** planted glyphs. That is a recovery-power check for a genuine direct table, and does not authenticate the table interpretation on LP2.

**Multiple-alignment null:** Under 500 seeded shuffles that preserve exactly the original 255-rune histogram, reselect the best of all 4,096 lookup alignments for each shuffled sequence. The minimum-edit null mean is **84.56**, and **110/500** matched shuffles reach **83 or fewer** required changes (add-one lower tail **111/501 ≈ 0.22156**, minimum 78). This refitted source-matched control confirms that even the best original alignment supplies no unusual partial byte-to-rune association. The same [reproducer](../sims/grid255_unknown_byte_rune_gate.cjs) carries the fixed seed `0x533055`, exact shuffler, full-model refit and control assertion. This is a conditional check on a visually motivated, postselected hypothesis, and no discovery-wide p-value is implied.

The direct-table gate is separate from the **two half-message** tests below: those ask whether a 128-symbol latent text is redundantly enciphered across the p53-black and p53-red-plus-p55 halves. The new gate instead asks whether each printed grid byte has a fixed rune output. It closes a source-linked static byte-code interpretation. A stream cipher, position-specific lookup, variable substitution epochs, or other recoverable evolving state remains outside the result.

### Source-fixed parallel-message gate for the 128/127 split

One interpretation of the original **128 black + (51 red + 76 final) = 255** rune structure is a *repeated 128-rune plaintext*: the 128 black p53 symbols and the 127 red-p53-plus-p55 symbols encode the same 128 latent positions, with one position omitted on the second side. Assign the first and second 128 bytes of the printed 256-byte table as independent modulo-29 additive masks, respectively. Exhaust both additive signs, both directions for the 127-rune half, all 128 possible gap positions, whether the table clock skips across the gap, and the three source-bound byte maps (`byte%29`, `floor(29*byte/256)`, `byte%28`). This **6,144-model** family uses the grid in printed order without an analyst-fitted phase rotation. A correct instance must recover **127/127 equal underlying runes** on the original source.

**Observed:** the largest equality count is only **10/127**, so **117/127 plaintext coordinates mismatch** even under the fitted missing-cell interpretation. In 1,000 deterministic segment-preserving null shuffles (51 red and 76 p55 symbols permuted separately), the maximum-equality median is **11/127** and **923/1,000** controls match or exceed the original (add-one 924/1001≈0.9231). This is a finite family exclusion; the null is descriptive and the original section was postselected. An independently generated 128-rune plaintext planted under a true one-missing-cell model returns **127/127** matching coordinates, recovers all **128** source runes, and **exactly re-encrypts all 255** synthetic ciphertext runes. The wrong reversed grid yields only 10/127 for that positive. Source arrays, exact inversion, planted control and fixed-seed shuffles are in [`sims/grid255_paired_shared_plaintext.cjs`](../sims/grid255_paired_shared_plaintext.cjs).

**Stronger, key-independent exclusion from the same fixed 128/127 alignment.** Suppose each half is an *arbitrary unknown bijective substitution* of the same underlying 128-rune text, with a key that is constant globally or independently rekeyed for each physical column of the 8-column original grid. Paired positions within a given key epoch must preserve their equality relation, regardless of unknown alphabet labels. Enumerate the same 128 missing positions and two B reading directions. For each candidate, an **exact maximum-weight bipartite matching** between the observed rune labels finds the largest subset compatible with *some* bijection; its complement is the smallest number of original paired positions that must be changed or discarded.

| Independent substitution epochs, keyed by aligned position mod period | Maximum compatible paired positions (of 127) | Minimum required changed/dropped paired positions |
| --- | ---: | ---: |
| One bookend-wide bijection (period 1) | 37 | **90** |
| Period 2 | 54 | **73** |
| Period 4 | 72 | **55** |
| Eight printed columns (period 8) | 89 | **38** |
| Period 16 | 108 | **19** |

The strongest live source-defined column case has its optimum at reverse B order and a missing symbol at index 67, yet still requires abandoning **38/127 (29.9%)** pairings beyond the supposed single missing location. Key-independent pairwise equality also gives **534 mismatched comparisons out of 8,001** globally in the most favorable alignment and **65 mismatched comparisons out of 945** within the eight columns in their own best alignment. Constructive control ciphertext with independently sampled fixed per-column 29-rune permutations and one true missing position yields an **exact zero-edit** result, and a global-permutation plant likewise yields zero under period 1. The [same reproducible program](../sims/grid255_paired_shared_plaintext.cjs) computes both the additive and unrestricted-bijection gates.

These exact original-input bounds rule out a *single common 128-rune latent message* under either direct printed-grid masking or arbitrary fixed global/column substitution, given source-ordered pairing and one missing B coordinate. Separate messages, position-dependent keys inside columns, transformations changing symbol order and independently determined alternative traversals remain unresolved. The separate **direct 256-byte-to-255-rune lookup** is additionally excluded under four natural grid traversals and one missing byte, even allowing an arbitrary secret lookup table.

## Cryptanalytic meaning and next gate

The source correspondence strengthens a **visual cross-page linkage** between the tree terminating the p27–32 wing-and-tree sequence and the tree near the final unsolved p55 text. The adjacent repeated ciphertext pair `ᛞᛄᚢ ᛒᛖᛁ` occurs on p27 and again as the final unsolved pair on p55; this independent observed recurrence is documented in [the existing bookend-phrase study](lp2-repeated-wordpair-structure.md). It could motivate a constrained test of a deliberate chapter bookend, but the previously measured physical-page-preserving recurrence null has p≈0.025. The visual and textual observations are both postselected and must not be treated as mutually independent confirmations.

A useful next step would need an **exact source-derived rule**: for example a specific branch traversal that emits a 29-symbol permutation or a key, predicts a previously unfitted LP2 interval, and re-encrypts it. Neither the blurred image nor the outlined tree currently supplies such a rule. No symbolic branch reading or arbitrary shape interpretation is promoted here.
