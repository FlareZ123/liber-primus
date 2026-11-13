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

## Mechanism boundary and next decision

The three x windows and decision to compare the original 1-pixel/1-unit gaps with this particular prime sequence were chosen **after** seeing the illustration and recovered p15 arithmetic. The image may have been rescaled from vector artwork; its scale and the intended object identification are unknown. A visually expanding three-band illustration can match some increasing number pairs by chance, and the broader selection opportunity across the book has not been calibrated. Thus the relationship is **a human-parseable clue candidate**, not a confirmed authorial instruction, cryptographic key, or ciphertext decryption.

An approximate direct vertical projection of the three collars onto the six printed text lines does not give a uniform source-selected glyph/gap readout or legible text. Do not rescue it by tuning projection locations, key phases or arbitrary layers.

**The one meaningful successor:** obtain an *independent original mark* that specifies (1) the register/target for applying 263 and 463, (2) a reversible read/decipher operation, and (3) a withheld original-rune plaintext prediction. Otherwise archive the coincidence. The p15 16-cell numerical decipherment remains established; the surrounding 1,903-rune chapter is still encrypted.

**Reproduction:** Python 3 with NumPy/Pillow, run the linked script against the repository original scan39.jpg or pass --zip with the original 75-JPEG archive. The scan geometry and prime sequence are never optimized to ciphertext language scores.