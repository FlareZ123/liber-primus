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

**Reproduction:** [original-image pixel SFT](../sims/lp2_fivedot_original_jpeg_reflection_sft.py), successful [Windows Python3.12/Pillow original-input GitHub Actions job 43534224289](https://github.com/FlareZ123/liber-primus/actions/runs/43534224289), and shared [manual SFT workflow](../.github/workflows/manual-readonly-python-image-sft.yml).

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
