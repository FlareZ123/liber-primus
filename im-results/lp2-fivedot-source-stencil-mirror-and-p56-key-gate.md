# One reflected five-dot source stencil: LP2 pp7, 23 and solved p56

**Source decision, 14 November 2026:** The three original occurrences of five large black dots are rotated/reflected reuses of the **same printed image design**. They establish a document-level graphic relationship, but do not supply a distinct cryptographic key, a demonstrable sky constellation or three independent sightings. A frozen transfer of the exact known p56 decryption keystream to the two unknown pages produced **no readable plaintext**.

## Original source and independent prior observation

The community [Uncovering Cicada symbols index](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) previously listed "5 dots" on its **1-based page numbers 7, 24, 57**, corresponding to LP2 **zero-based pp7, 23, 56**; claims that these depict Aquila or a celestial asterism are expressly conjectural. This research's contribution is an **exact source-JPEG registration and an original-cipher consumer test**. The artwork is not newly noticed.

| LP2 page | 2014 source file | Original file SHA-256 | Context |
| --- | --- | --- | --- |
| p7 | `resources/liber-primus/24.jpg` | `91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c` | Five dots **below** the terminal printed text |
| p23 | `resources/liber-primus/40.jpg` | `d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee` | Five dots **above** the new red text |
| p56 | `resources/liber-primus/73.jpg` | `a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc` | Five dots below the solved AN END prose |

All images are native **2400×3600 JPEG**. Source inspection shows that the five disk centers from p7, rounded to integer (x,y), are `(1297,2867), (1527,2936), (797,3106), (1479,3128), (993,3167)`. These register to p23 by the **vertical reflection** `(x,y)→(x,3674−y)`; to p56 by the **horizontal reflection and translation** `(x,y)→(2401−x,y−419)`. These transforms are pinned against whole disk pixels, including uneven antialiasing, rather than fitting five points alone.

The original-image region `x=[740,1620), y=[2800,3260)` contains the complete five disk interiors without adjacent runic text. At the frozen grayscale black threshold 90, the pre-registered transforms predict:

| Source → target | Black source pixels | Black target pixels | Both black | Union | IoU | F1 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| p7 → p23 (vertical) | 17,302 | 17,293 | **17,293** | 17,302 | **0.999480** | 0.999740 |
| p7 → p56 (horizontal) | 17,302 | 17,304 | **17,056** | 17,550 | **0.971852** | 0.985725 |

A strict 99.95% pixel overlap in the p7–23 pair is compelling evidence for literal reuse of a reflected graphic. The p56 pair retains 97.19% overlap. Differences can be due to JPEG or raster resampling, and do not prove any intentional cipher direction. The same simple five-dot drawing should therefore **not be counted as three independent confirmations of a constellation or key**.

### Independently held-out geometric census (Agent26, 21 November 2026)

A separate [source-only all-page detector and original-pixel holdout test](../sims/lp2_fivedot_allpage_centroid_holdout_sft.py) examines **all 58 original LP2 images** at an invariant grayscale threshold90. It finds every isolated original-size approximately 70-pixel filled black circle by connected components in a 4× downsample, then measures the centroid again on the unchanged 2400×3600 JPEG, including its antialiased rim. **Exactly four scans** contain matching disks: `24.jpg` (p7, five), `40.jpg` (p23, five), `50.jpg` (p33, three in a horizontal row), and `73.jpg` (p56, five). The filter is deliberately specific to large circular dots; this is a complete census of comparable *disk* symbols, not a census of noncircular decorative stars.

To rule out transform and landmark postselection, the new SFT charges **all eight axis-aligned rigid rotations/reflections and all 5! point correspondences** without a 180° prior. It independently refits on each of the **ten** three-dot subsets, then scores the two withheld dots under the selected model. The full five-dot RMS and **worst two-dot holdout RMS** are:

| Original source pair | Best map | Full five-dot RMS | Worst held-out RMS |
| --- | --- | ---: | ---: |
| p7 → p23 | vertical mirror | **0.036832 px** | **0.065110 px** |
| p7 → p56 | horizontal mirror | **0.246264 px** | **0.436255 px** |
| p23 → p56 | 180° rotation | **0.263633 px** | **0.444509 px** |

The separate **three-dot original p33 illustration** cannot be registered even as a three-dot subset of any of the five-dot shapes: after charging all original source triples, all destination permutations and all eight rigid maps, the best corresponding RMS is **105.58–105.76 px**. For a supplementary random-geometry null, the report compares p23 to **10,000** independently generated five-dot patterns in the exact p56 bounding rectangle, preserving each approximately 69-pixel dot's nonoverlap. Each control is charged the full 8×5! map/label family. **0/10,000** match the p23→p56 RMS 0.263633 px; the best control is **38.39693 px**, add-one Monte Carlo bound 0.00009999. This null measures how diagnostic literal source artwork copying is under independent point placement; it is **not** a probability that Cicada chose an encryption method.

The physical artwork relationship is thus exceptionally reproducible and survives held-out dots, but **p23→p56 is not a uniquely source-selected pair**: p7→p23 matches *even more closely* and p7→p56 also passes every holdout. The same inherited five-dot stencil is reused at three different textual boundaries. **No printed instruction maps the rotation/reflection to a rune operation or yields a p23/p7 key.** Avoid promoting this source-art match to decryption evidence without a separate, irreversible prediction on original ciphertext.

**Independent Windows Python3.12/Pillow11.3.0/NumPy2.2.6 PASS:** [Actions run 44961544889](https://github.com/FlareZ123/liber-primus/actions/runs/44961544889); source centroid output, random seed `0x33012356`, complete comparison family and planted geometric controls are in the reproducible test.

**Reproduction:** [original-image pixel SFT](../sims/lp2_fivedot_original_jpeg_reflection_sft.py), successful [Windows Python3.12/Pillow original-input GitHub Actions job 43534224289](https://github.com/FlareZ123/liber-primus/actions/runs/43534224289), and shared [manual SFT workflow](../.github/workflows/manual-readonly-python-image-sft.yml).

## Source-selected D4-to-rune gate (Agent5, 22 November 2026)

A human-visible use of a reflected stencil must fix **what the five unlabeled dots index**. The unchanged source imagery and canonical ink annotations have different typed adjacent text units:

| Original page | Dots relative to text | Red adjoining span | Original red printed-word lengths | Natural complete-word count |
| --- | --- | --- | --- | ---: |
| p7 (scan 24) | Below terminal red line | rune offsets 194–207, 14 runes | 2, 4, 3, 2, 3 | **5** |
| p23 (scan 40) | Above opening red line | rune offsets 0–15, 16 runes | 1, 8, 2, 5 | **4** |
| p56 (scan 73, solved) | Below hash/body, not immediately adjoining red title | rune offsets 0–4, 5 runes, plaintext **AN END** | 2, 3 | **2** |

The five objects therefore do **not** select a shared, source-visible five-word register on the three pages. Mapping the five dots to p7's five red words would require adding an unmarked black word to p23 or switching from whole words to runes on p56. This would change operand type after seeing each page. All three red spans have independent original red 13-dot punctuation, which marks text boundaries but supplies no dot labels or index rule.

The already established **vertical** reflection p7→p23 preserves horizontal coordinate and therefore preserves left-to-right dot order. The **horizontal** reflection p7→p56 and **180°** rotation p23→p56 reverse left-to-right dot order. Thus the single most natural fixed one-dimensional geometric readout on the three original icons yields only **identity or complete reversal**, with no nontrivial five-way shuffle. Choosing a different ordering (e.g., vertical rank, angular sort, start at a particular disk) requires a source clue that is absent from the original image or known solved p56 text. Even a geometric bijection is only among disks, not rune or word coordinates.

**Decision:** no first-party source instruction assigns an index to the dots, equates their three unmatched red-word registers, chooses a page or 29-rune alphabet map, or fixes a ciphertext inverse. The exact artwork copy is established; a five-symbol D4-driven cipher claim is **not operationally specified**. Close this route at the source-selection gate rather than inventing a dot-to-rune assignment or running a family of fitted permutation decoders. Reopen only if a distinct original inscription supplies the missing typed operand and readout. This preserves the documented direct p56 keystream-transfer negative below without repeating it.

## One frozen reversible p56-key inheritance test

The copied artwork places p7's and p56's five dots **after** text and p23's **before** it. If the reuse signalled shared encryption keys, a solver could transfer the authentic p56 key to the p7 terminal and p23 initial text. This is a concrete reversible original-source test, although no authorial inscription explicitly equates image reuse with a cipher reset.

Authentically solved p56 contains **85 GP29 runes** and decrypts by `C_i−(prime_i−1) mod29` with literal F at p56 rune-offset 56 not advancing the prime clock. Rather than guess a key, the SFT derives all **85** numeric key symbols from exact known ciphertext and independently published solved p56 plaintext; each value is checked against the original prime−1 derivation, including the literal-F exception.

The frozen transfer reads **85 source runes** of each p7/p23 **head and tail**, in both normal and reversed rune order (eight variants, including the natural p7-tail and p23-head motif anchors). All eight inverses recover their respective ciphertext under forward replay, but **none generates English**:

- Authentic p56 plaintext positive control: mean English quadgram log10 **−4.461649**, GP29 rune coincidence **0.070028**.
- All eight unknown-page transfer outputs: mean quadgram log10 range **−8.060621 to −7.082012**, GP29 coincidence **0.033053–0.040056**. Source-selected p7-tail normal scores −7.762858; source-selected p23-head normal scores −7.240132. None approaches the p56 positive.
- The small test excludes only this directly inherited 85-rune pad under these exact physical word orders. It does not exclude independent unknown keys, nonlinear transforms, or the possibility of an actual constellation unrelated to this cipher.

**Reproduction:** [exact GP29 SFT](../sims/lp2_fivedot_p56_derived_key_original_sft.cjs), passing [Windows Node22 source-input run 43534009310](https://github.com/FlareZ123/liber-primus/actions/runs/43534009310).

## Consequence for the solve route

This is an exact **graphic provenance connection**, not recovered ciphertext meaning. Pursuing Aquila, star magnitudes, or reflective Atbash layers still needs a **distinct original clue selecting a star correspondence, transformation and key consumer**. Graphical duplication itself cannot identify any one of them. Before another expensive cipher attempt, require a source-selected operation predicting genuine p7/p23 plaintext or successfully explaining the fully known 85-rune p56 control. There is no new original unknown-page decryption, destination or hidden-message extraction here.
