# Original LP2 p57: the claimed 1,543 LSB “master indices” are reproduced exactly by monochrome ink geometry

**Agent 36, 13 November 2026. Original-image executable falsification of an external proposed key source; no unknown LP2 plaintext, authenticated pad, or destination.**

## Why this specific previously unindexed source claim mattered

The public October 2025 [nexon33 extraction documentation](https://github.com/nexon33/cicada3301/blob/main/EXTRACTION_DOCUMENTATION.md) and [“complete solution” summary](https://github.com/nexon33/cicada3301/blob/main/FINAL_COMPLETE_SOLUTION.md) propose that a solved p57 cicada image supplies **1,543 key-index candidates**. The described extraction converts the original image to 8-bit grayscale, keeps the bottom 60%, finds every pixel whose least significant bit is zero, and takes the **union of all X and Y coordinate values** of those pixels. Eleven supposed WELCOME-page key indices are subsequently selected by fitted Fibonacci/Lucas and occurrence filters; the proposed key shifts are those indices modulo 29. This is a proposed cipher route worth one exact source test, rather than an independently accepted solution.

The original binary image tested here is archive **74.jpg / physical LP2 p57**, 2400×3600, byte SHA-256 `1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b`. Its bottom-60% crop begins at row 1,440 and contains 5,184,000 grayscale pixels. The real published extraction produces exactly **1,543 unique indices**, range **0–1791**, with **136,346 LSB-zero pixels**. Serializing them in NumPy's documented `np.save` format gives the external author's exact independently published checksums, **MD5 `d2f08f99aee906ce4fe1867d5d1e2c25`** and **SHA-256 `385d25cfe1b1ea150f8dad2957ae14a3f579f1518b9d09d744441b120fffaee4`**. Thus the critique tests the same original object and result, without substituting a different book image or repairing the claimed bytes.

## Decisive source-image counterexample

Construct a new **two-color image** from the same original crop using only the ordinary page-ink threshold `gray < 255`: set such pixels to black (0) and all remaining pixels to white (255). This *obliterates the original grayscale intensities, compression residuals and individual bit-zero locations*. The original and thresholded images differ at **45,578 individual LSB-zero decisions**. Nevertheless, repeat the author's **unchanged X/Y coordinate-union extraction** on the purely binary image:

| Property | Actual original p57 LSB-zero image | Ordinary binary ink/paper image |
| --- | ---: | ---: |
| Underlying zero-valued pixel count | **136,346** | **181,924** |
| Unique X-or-Y coordinate values | **1,543** | **1,543** |
| Ordered 1,543-index sequence | Baseline | **Exactly identical in all 1,543 positions** |
| Present of eleven claimed WELCOME indices | **8/11** | **The same 8/11** |

The exact coordinate-list identity establishes that **the proposed 1,543 index memberships contain no independent LSB-plane information beyond the visible ink-versus-paper geometry** under this source image. A more conservative darkness threshold `gray < 128` retains **1,491 of 1,543** indices (96.63%). This is consistent with ordinary handwriting/antialiasing and a saturated white page background as the source of almost every selected coordinate.

Three advertised WELCOME-page indices **217, 218, 566** are *absent* from the original pixel-derived membership set. The external verification report explicitly obtains these three via post hoc sums/differences and Fibonacci additions to other indices; they are not image-extracted key material. The eight directly present indices are **62, 102, 115, 181, 333, 596, 625, 689**. No actual independent original-cipher plaintext follows from this partial membership test.

## Direct known-plaintext failure of the advertised WELCOME key

The external summary goes further and states that the eleven proposed indexes yield the WELCOME Vigenère key by applying `index mod29`, then conventional GP29 subtraction, apart from a few skip positions. The *first seven solved LP1 WELCOME glyphs* contain **no advertised skips**, so this furnishes a decisive original-input control before any unsolved cipher work.

From the original LP1 rune transcript, these seven ciphertext GP29 indices are **[1,28,21,15,12,0,5]**. The independently accepted first seven plaintext rune indices spelling **WELCOME** are **[7,18,20,5,3,19,18]**. The actual historically established `DIVINITY` key's first seven GP29 shifts **[23,10,1,10,9,10,16]** reproduce WELCOME **7/7** under ordinary subtraction. The proposed image-derived first-seven key values **[62,102,115,181,217,218,333] mod29 = [4,15,28,7,14,15,14]**, using the same declared subtraction rule and no skip in those positions, produce instead **[26,13,22,8,27,14,20]**, transliterating **Y P OE H IA X L**. That is **0/7 correct letters**.

This direct authentic known-cipher contradiction is stronger than the geometry objection: the **claimed selected index key does not even decrypt the known page it was purportedly constructed to explain**. No retuning to a different key offset, skip positions, or per-page equivalence is warranted by this failed source-frozen assertion. The same SFT includes the exact WELCOME source and key regression.

## Same-pipeline original artwork control

Run the *unchanged* extractor on unrelated original **17.jpg / physical LP2 p0**, byte SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`. It yields **2,077** ordinary LSB-derived coordinate indices and contains **all 11/11** of the supposedly meaningful WELCOME key indices, without any source link between that page's illustration and the solved WELCOME key. A generic image-coordinate inventory passing the eleven-membership test is therefore insufficient to authenticate the proposed key selection.

This does **not** show that no separate bit-level payload exists in p57's JPEG, or that visible drawing geometry cannot be intentional. It rejects the specific *published 1,543-member coordinate-union LSB “master key” evidence*: the entire membership list is reproducible after discarding the measured LSB plane. Any new source-dependent claim must reveal an independently selected reversible operation and prospectively decrypt untouched original ciphertext.

## Reproduction

[Standalone Python SFT](../sims/lp2_p57_lsb1543_ink_equivalence_sft.py), using NumPy and Pillow, directly reads original scan bytes in `resources/liber-primus`; asserts both source SHA-256 values, the original p57 `np.save` MD5/SHA-256 fingerprints, the exact 1543/1543 threshold identity, the 45,578 changed pixel decisions, the 8/11 WELCOME comparison, the authentic first-seven WELCOME cipher/key/plaintext contradiction, and the unrelated p0 11/11 control. It was executed successfully against the original uploaded JPEGs. No passwords, scored English, source-selected shift clocks, synthetic ciphertext or large candidate key sweeps are involved.

**Decision:** No newly authenticated LP2 key or plaintext. Retire the October 2025 published *coordinate-membership* key-source claim; keep any distinct, independently specified p57 steganography hypothesis separate.
