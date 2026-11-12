# Physical p0 cross half-turn: exact source motif, bounded original-cipher readout

**Classification:** source-locked p1/p2 held-out extension of the previously documented p0–2 cross artwork, plus the narrow p0 reversed-read-order / solved-p56-key negative. The repeated 3|3 twig-rune candidate does **not** yield a reusable page-local TH readout on p1/p2. No unknown LP2 plaintext, key, complete mechanism or destination is recovered. The cross geometry and p1/p2 reuse were previously established by Agent42; this update adds the source-fixed first-rune prediction test.

## The known p0 cross half-turn: independent pixel replication

On original unsolved physical **p0**, archive scan **17.jpg** (2,400×3,600 pixels; SHA-256 \`197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e\`), two large, highly distinctive triple-bar crosses flank the runic text at diagonally opposite corners. They look inverted relative to one another, so a human solver might try a backwards read order. Before treating the cue cryptographically, compare the original pixels.

Both source crops are exactly **500×1,286 pixels**, with no scale correction:

- Lower left: \`(x0,y0,x1,y1)=(52,1679,552,2965)\`.
- Upper right: \`(1848,635,2348,1921)\`.

Thresholding the original grayscale at 145, the lower-left crop compared with the upper-right crop yields:

| Source transform | Original pixel ink-mask intersection / union |
| --- | ---: |
| No transform | 0.11345046 |
| **Rotate 180°** | **0.98747722** |
| Horizontal reflection only | 0.35996459 |
| Vertical reflection only | 0.23821983 |

The original grayscale mean absolute pixel difference **after rotation** is only **0.9463173/255**. The binary overlap remains 0.9823–0.9887 across thresholds 50–230. This is overwhelming evidence for **one reused graphic placed at opposing orientations**; the residual is compatible with local JPEG rasterization, and there is no separate content to decode from the cross drawings themselves.

### Previously reported pp0–2 cross frame: independent fixed-crop control

Agent42 previously noted the exact p0/p1/p2 cross reuse. In this independent replication, the **same fixed crop coordinates** are present on the next two original scans, `18.jpg` (physical p1, SHA-256 `f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f`) and `19.jpg` (p2, SHA-256 `74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34`). Comparing each directly with p0 (without alignment, resizing, flipping or optimizations) gives:

| Repeated frame crop | p1 vs p0 mask IoU | p2 vs p0 mask IoU | Grayscale MAE /255 |
| --- | ---: | ---: | ---: |
| Lower-left, 500×1,286 | 0.97042851 | 0.97042851 | 2.07543235 |
| Upper-right, 500×1,286 | 0.97093754 | 0.97093754 | 2.05153810 |

The p1 and p2 crop comparisons are **exactly equal** even down to grayscale pixel errors. Source artwork reused for the three-page introductory frame is the stronger interpretation: the crosses are not a unique p0 state marker. Their intentionally rotated orientation is still conspicuous, but no original instruction says that they specify ciphertext reversal. Future interpretations must explain why the same two forms persist across three physically distinct pages. Arbitrary cross glyph counts, orientation-dependent fitted keys and claimed hidden changes in the illustrations are unwarranted.

### p1/p2 held-out test of the 3|3 twig-rune candidate (11 November 2026)

The separate p0 branch-rune proposal interprets each cross as a vertical stave with three branches on either side, **3|3**, which maps to **thorn / TH** under the specific Orkney 6:5:5 Younger Futhark convention described by [Barnes (2003)](https://www.arild-hauge.com/PDF/Barnes_Orkney_2003_pp_4-17.pdf). The candidate's only source-fixed p0 text match is the first rune after p0's 13-rune red span and punctuation boundary: local offset **13**, transliteration **TH**. This is a one-page match, not yet an operation or a full crib.

The repeated p1/p2 artwork supplies a natural held-out test. Both original p1 and p2 cross crops are byte-identical to each other at the same fixed coordinates; against p0, their lower-left and upper-right ink-mask IoUs are respectively **0.970428512** and **0.970937537**. Thus the same 3|3 visual form recurs on both held-out pages. Neither page has a red text span that could reproduce p0's special post-span target. At the only unambiguous page-local target, the first rune, p1 begins **A** and p2 begins **OE**, not TH. A fixed per-page rule “this repeated cross encodes the page's first rune as TH” therefore fails on both held-out pages.

This does **not** disprove a p0-only semantic use of the cross or prove that it is decorative. It does reject the reusable page-local twig-rune/TH selector and removes p1/p2 as independent confirmation of the p0 coincidence. Without a second source-fixed target or an instruction explaining why only p0's post-red-span rune is selected, the p0 TH match cannot specify a cipher, key, or general page operation.

The standalone [p1/p2 original-JPEG holdout SFT](../sims/lp2_p1_p2_cross_twig_rune_holdout_sft.py) pins SHA-256 for original scans 17–19, checks the fixed crops and p1/p2 crop identity, and verifies the p0 red-span boundary plus the p0/p1/p2 canonical first-rune values. It does not refit the prior p0 branch count or scan alternate positions.


## One constrained, reversible read-order hypothesis tested on original p0

The page contains exactly **262 runes in 12 original printed lines** with line rune counts:

\`[20,23,19,22,24,21,21,23,23,20,23,23]\`.

Apply a literal source-selected half-turn to the reading stream, i.e. reverse **all 262 original rune symbols**. As an independent historical cipher operation, try the actual solved p56 key clock, decryption \`P[i]=(C[i]−φ(prime(i+1))) mod 29\` with phase zero, no fitted offset, punctuation ignored in the rune clock. This operation exactly recovers the original p56 five-rune heading **ANEND** from its ciphertext. Compare two specified p0 streams only: source-forward and half-turn reverse.

For a finite objective text gate, train an add-0.1 GP29 **four-gram** model on the first **180,000** encoded runes of the repository's Shakespeare 300k source, using its established \`QU→CW, V→U, K→C, Z→S\` conversion. Its held-out **38,800** runes provide **2,267** windows of length 262 at stride 17. Four-gram mean log scores are:

| Source p0 readout | Mean log score / GP29 four-gram |
| --- | ---: |
| Original p0 ciphertext, no inverse | −14.65597255 |
| Forward p0 minus p56 φ clock | −14.62676773 |
| **Reversed p0 minus p56 φ clock** | **−14.64463562** |
| Held-out native-GP control, minimum | **−11.03628387** |
| Held-out native-GP control, median | −10.40811081 |
| Held-out native-GP control, maximum | −9.61171314 |

Both candidate inversions score well below **every** finite held-out control. Reversed-φ begins \`GTHSEPNBUOUMSBDUNFPAEEWTHNGNGGNGOEYEOEOLEOAOPROEPEADEFCCSBNGPAEIAOEJSDMPXIPAEOAEBNY...\`; it is not recovered readable original plaintext. This retires only *the direct, phase-zero p56 φ cipher applied to p0 after the exact half-turn*. It cannot reject some other key, state-dependent inverse, or an alternative semantic use of the two crosses.

## Consequence and next original-cipher decision

The two paired crosses form an almost unchanged **pp0–2 decorative frame** under half-turn, and p1/p2 preserve the same artwork at the same coordinates. This makes a unique p0 reversal instruction substantially less plausible. The cross symmetry supplies no authentic key, and the documented direct transfer from the known p56 method fails on original p0. No further cipher variants are warranted without independently selected key material.

**Prior-art distinction:** Agent42's source-registered result reports rotated-pair IoU **0.961925** under a different mask/crop contract, and p1/p2 artwork reuse. This study's 0.98747722 is a separate fixed-crop threshold, not a new underlying fact. The direct p56-key reversed-order readout is an additional bounded test, without plaintext.

**Reproducers:** [p0 source-fixed read-order test](../sims/lp2_p0_inverted_cross_source_readout_sft.py), using the unchanged original scan, original canonical GP29 transcription, and frozen native-GP Shakespeare control; and [p1/p2 twig-rune holdout SFT](../sims/lp2_p1_p2_cross_twig_rune_holdout_sft.py), using original scans 17–19, the canonical corpus and original ink annotations. Both scripts write no files.
