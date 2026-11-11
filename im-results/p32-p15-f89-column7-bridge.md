# Source-oriented p32 seventh-column and p15 Fibonacci-89 cross-link

**Classification: original-source numerical observation and bounded negative decryption test.** There is no recovered LP2 unknown plaintext, cipher key or demonstrated author-selected operation. This is an intermediate follow-up to the historically signed 2016 tree image's exact p32 11×11 first-row and first-column GP-prime sums **563/569**, and the established p15 Fibonacci-indexed prime spiral.

## Original-source relationship

The p32 matrix (the original 121 runes in row-major order) has **seventh column**, in natural top-down reading, GP-prime values **43, 67, 5, 89, 19, 47, 3, 109, 3, 19, 59**. They sum to **463**. The **fourth row, seventh column** (1-based) is the rune D, whose GP-prime weight is **89**, at p32 zero-based local rune offset **39**.

Independently p15's proven red-start Fibonacci-prime spiral uses **f=89**, then **prime(f+1)=prime(90)=463**, giving the original eleventh spiral cell **3301−463=2838**. Thus the exact p15 pair 89→463 appears as a *cell weight and its column total* on p32; this is an authentic arithmetic correspondence, with the independently known 2016 image dimensions pinning the p32 matrix orientation. It complements the separate candidate p32 numeral F-O-TH = 89, currently investigated in [Issue #289](https://github.com/FlareZ123/liber-primus/issues/289).

**Possible cross-round route to the seventh column (new independent source numbers, operation unproved):** The authenticated 2012 original image measures 509×503, which are ordinary prime ordinals 97 and 96 (width, height). The signed 2016 image is 563×569, ordinals 103 and 104 (width, height). Hence after **swapping horizontal and vertical dimensions**, both source-image prime ordinals advance by **seven**: 2012 height p96→2016 width p103; 2012 width p97→2016 height p104. If “numbers give direction” means seven horizontal prime-ranked steps from the 2016 image's verified first-row axis, this would nominate p32's **seventh column** before reading its contents. This is a plausible hypothesis; no authenticated source explicitly says to apply this cross-year shift to a p32 column.

A second retrospective route gives the same target 463 without reading p15: p32's first-row width 563 is **prime #103**, and p32 ends after 121 runes with one **thirteen-dot marker**; subtracting 13 from prime rank103 yields rank90, whose prime is **463**. The p15 rule independently fixes **prime(F89+1)=prime90=463**. This constructs a coherent cross-artifact chain, but the marker is also ordinary LP2 punctuation and no source says that dot counts subtract from prime rank. It must remain provisional until a new original-cipher prediction succeeds.

There is also a **concrete address consequence** under the same tentative ordinal rule: `103−13=90` selects the **90th GP rune of p32** (one-based, zero-based offset89), original ᛟ / OE. In the original printed transcription, that rune is immediately after a word separator and starts the three-rune word **OE-NG-O**. The next original word, after the line boundary, is **M-B-U-D-S**, whose last four runes transliterate BUDS. The address zero-based89 is also the p15 Fibonacci index89 used in the separately documented p15→p32 candidate. Preserve those original word and line delimiters: the concatenated string `OENGOMBUDS` is *two printed words*, not one original source word. This points to a reproducible original-text location, while supplying no plaintext.

**Missing decisive step:** The sources make the number seven visible, and row4/column7 have the exact stated arithmetic, but they do not establish “use the rank shift to select column 7”, “subtract the 13 dots”, “take the column sum”, or an actual plaintext-generating cipher. Inferring **row 4** from the p15 square dimension or **column 7** from this prime-index shift is still an interpretation. The matched null calibration below should not be presented as a source-preselected discovery-wide probability.

## Conditional chance controls

With NumPy PCG64 seed `0x20163301`, hold p32's 11 original top-row cells and 11 original first-column cells fixed, then independently permute the other 100 GP-prime weights **200,000** times:

| Event | Null hits (200,000) | Add-one frequency |
| --- | ---: | ---: |
| Preselected 7th column total 463 | 741 | 0.003710 |
| Preselected (row4,col7) cell 89 *and* column7 total 463 | 23 | 0.000120 |
| Any of 10 nonfirst columns total 463 | 6,950 | 0.034755 |
| Any of 10 nonfirst rows or columns total 463 | 13,628 | 0.068145 |

The lower preselected figures are conditional on source-fixing both positions *before* using the ciphertext values. As discovered post hoc, the broader comparison is the honest uncertainty diagnostic. The table shows how badly a retrofitted selector can exaggerate evidence.

## Frozen original decoder attempt

The natural source-oriented column sequence as GP indices is **P-E-TH-D-W-X-U-EA-U-W-T** (period 11). Use it with additive GP29 Vigenère on the adjacent original source-delimited pp33–39 body: from p33 local91, ending before p39 local119, **1,468 runes**. Holding key orientation, phase zero, boundary and period fixed:

| Data | GP29 index of coincidence |
| --- | ---: |
| Original ciphertext | 0.03431255096 |
| Decrypt by subtracting column key | 0.03446764328 |
| Decrypt by adding column key | 0.03421689522 |

Neither result is linguistic. An independently generated GP29 positive-control plaintext reencrypts and inverses exactly, but this alone cannot select a historical key. **Retire direct period-11 Vigenère transfer.** Follow up only if another primary clue selects the row/column as a map address and supplies an operation that predicts genuine original plaintext.

**Reproduction:** `python sims/p32_p15_f89_col7_sft.py` reads the repository's canonical GP29 physical-page corpus and prints the exact source values, null counts and frozen original-interval cipher test.
