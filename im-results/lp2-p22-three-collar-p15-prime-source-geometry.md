# Original p22 three-collar spacing and the solved p15 Fibonacci-indexed primes

**13 November 2026, Agent 10. Classification: provisional source-geometry clue, no recovered unknown plaintext, key, or cipher.** This is a two-interval original-image observation with a corresponding independently established numerical sequence. The resemblance was discovered after inspection, so it is not a statistically calibrated discovery.

## A potential 2014-visible solve path

The original p15 [Fibonacci-indexed prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md) establishes, from its printed 4×4 grid, the prime sequence 2,3,5,7,13,23,43,79,149,**263,463**,829,1481,2593,4507,7817. The terms 263 and 463 occur at consecutive spiral steps n9 and n10, corresponding to the **adjacent right-edge cells 3038 and 2838**.

Original physical p22 [scan39.jpg](../resources/liber-primus/39.jpg), at the end of the *same* p15–22 illustrated chapter, has a horizontal black-ink object below six runic text lines and above a reclining human figure. The object has **three large vertical collars**. Its exact pictorial identity (a key, tool, staff, or something else) is unresolved. A solver may compare its two adjacent collar gaps with the numbers just encountered on p15.

## Frozen original-source pixel measurement

The [standalone reproducer](../sims/lp2_p22_p15_prime_collars_original_sft.py) reads the original 2400×3600 source JPEG, never OCR. It isolates the three plainly visible collars in **x=[660,870), [940,1120), [1400,1620)** and **y=[2215,2630)**, thresholds grayscale ink, sums dark pixels per column and takes a weighted x-centroid after subtracting each window's 20th-percentile common shaft/ink background.

| Grayscale threshold | Collar centers x in source pixels | Successive center distances |
| ---: | --- | --- |
| 70 | 765.36, 1032.75, 1492.04 | 267.38, 459.30 |
| 110 | 765.32, 1033.10, 1492.98 | 267.78, 459.88 |
| **130** | **765.97, 1033.33, 1493.42** | **267.36, 460.09** |
| 170 | 766.30, 1034.11, 1494.19 | 267.81, 460.08 |

At threshold 130, the differences from p15's established adjacent pair **[263,463]** are **+4.36 px, −2.91 px**. The total first-to-third center distance 727.45 px differs from 263+463=726 by only 1.45 px. The independent cutoff family 70–170 gives Euclidean paired errors 5.23–5.85 px. The closest *other* adjacent pair in the original p15 series is about 230 px away under the same unscaled comparison. **No independent third prime distance is claimed**: the ink object begins ambiguously relative to the first wide collar, and the right-edge dots obscure the terminal point.

## A concrete conditional word-map readout, including a solved-page landing

A previously proposed, **unproved** book addressing rule uses each number N as a zero-based physical page N mod58 and zero-based printed word floor(N/58), then replaces N with that word's GP-prime sum. Apply **that same fixed rule** to the p15 gap-prime pair selected by the p22 drawing, without changing its page origin or word indexing:

- **263** → original p31 word4, sum246 → p14 word4, sum117 → enters the previously established source-word **33-cycle** at node117. Full route: 263→246→117→604→226→495→162→225→255→522→83→17→78→101→264→191→362→307→384→320→290→563→180→267→66→250→157→276→245→427→211→258→285→227→111→117.
- **463 = 58×7+57** → original solved physical **p57 word7**, clear GP word **SURFACE**, in p57's sentence describing the instar tunneling to the surface.
- Their **sum726** (the source-image full gap span differs by 1.45 source pixels) follows 726→329→183→460→199→203→256→144→495 and joins the *same* 33-cycle. This sum route is a second retrospectively available candidate, not an independent prediction.

This conditional cross-page result is exact in the original 58-page word inventory; the word SURFACE is **already unencrypted** and supplies no unknown plaintext. Many arbitrary starts in this map join its 33-cycle. The proposed pixel-to-prime and prime-to-page-word steps are separately unproven; combining them multiplies unselected assumptions.

One bounded hypothesis makes a complete reversible cipher consumer from the strongest semantic reading. If SURFACE commands use of the **two exterior runes** of each of the 33 words reached from 263's cycle entry117, the result is a 66-rune candidate key. Physical p49, immediately before the 256-cell numeric grid, contains exactly 66 original runes. Apply the historically attested LP1 GP29 Vigenère subtraction to its 66 rune positions, with the cycle starting at117 and no fitted phase. The resulting full p49 stream transliterates:

> CTHTHIDCFFAHIALLTPREOEEAHGIGJEATHRNGXEOGXHYIAMYDIAXAYHBBXEAWWMNWDAECWJHJAEACUNEOI

Its IoC is **0.02937063**, without coherent words; all 66 runes forward-re-encrypt exactly under the same explicit key. A separate 563-start cycle phase likewise produces nonlinguistic output (recorded in the [Agent42 handoff](../communications/agent42/20261113T1230Z_agent10_orbit33_p49_boundary-66.md)). These direct consumers are **negative**. Using SURFACE as an instruction to take word exteriors, applying the key to p49, and using Vigenère are exploratory choices rather than actual source instructions. Do not rotate keys or try alternative scoring to rescue them.

## Mechanism boundary and next decision

The three x windows and decision to compare the original 1-pixel/1-unit gaps with this particular prime sequence were chosen **after** seeing the illustration and recovered p15 arithmetic. The image may have been rescaled from vector artwork; its scale and the intended object identification are unknown. A visually expanding three-band illustration can match some increasing number pairs by chance, and the broader selection opportunity across the book has not been calibrated. Thus the relationship is **a human-parseable clue candidate**, not a confirmed authorial instruction, cryptographic key, or ciphertext decryption.

An approximate direct vertical projection of the three collars onto the six printed text lines does not give a uniform source-selected glyph/gap readout or legible text. Do not rescue it by tuning projection locations, key phases or arbitrary layers.

**The one meaningful successor:** obtain an *independent original mark* that authenticates the pixel scale and/or source word-map rule and specifies a reversible operator and target. Its decoded output must make a withheld original-rune plaintext prediction. Otherwise archive the coincidence. The p15 16-cell numerical decipherment remains established; the surrounding 1,903-rune chapter is still encrypted.

**Reproduction:** Python 3 with NumPy/Pillow, run the linked script against the repository original scan39.jpg or pass --zip with the original 75-JPEG archive. The scan geometry and prime sequence are never optimized to ciphertext language scores.