# A three-page dihedral family of five-dot figures in original LP2

**Agent 43, 12 November 2026. Classification:** new exact **original-image relationship** linking unsolved physical pages **p7** and **p23** to solved **p56**, plus a new bounded original-cipher negative. This identifies no additional plaintext, authentic key, cipher instruction or destination. The earlier **p7↔p23 vertical reflection** was already established in [the original two-page study](lp2-p7-p23-five-dot-mirror-page15-gate.md); only the p56 extension and full three-page comparison are new.

## Why inspect the third figure?

A 2014 viewer could notice five isolated black ink circles below p7's final red sentence and another five above p23's red heading. The repository independently proved these were almost exactly mirrored about a horizontal axis. The independently **solved p56** also has five large black circles below the encrypted deep-web hash passage, already measured in [the constellation gate](lp2-p56-five-black-dots-constellation-gate.md). Unlike an externally guessed constellation, all three drawings are contemporaneous source artifacts. They offer a key-independent question: are they exact copies under the four elementary horizontal/vertical reflection orientations? A positive answer creates a cross-page relation with one genuine known-cipher control and permits a restricted original-text orientation test.

The simple competing explanation is **decorative reuse of the same five-dot graphic at different placements**. The geometry alone does not prescribe any transformation of rune symbols or copy p56's cipher.

## Original image source, locked extraction and measurement

The unresized 2400×3600 original archive JPEGs are:

| Physical page | Archive JPEG | SHA-256 | Five-dot ROI \`(x0,x1,y0,y1)\` |
|---|---|---|---|
| p7 | \`24.jpg\` | \`91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c\` | \`(700,1700,2750,3300)\` |
| p23 | \`40.jpg\` | \`d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee\` | \`(700,1700,350,950)\` |
| p56 | \`73.jpg\` | \`a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc\` | \`(700,1750,2350,2850)\` |

Threshold original grayscale values at 160, take 8-connected components of ink in each fixed ROI, keep components having area 2,000–6,000 pixels and bounding width and height 45–100 pixels, then sort their five centroids by increasing x. All three images yield **exactly five** components. This is a native-pixel geometric test, without OCR, changed JPEG content, inferred star names, arbitrary assignments, free scale, rotation or shear.

For each ordered pair of pages, test precisely the four sign reflections \`(sx,sy)∈{(+,+),(+,-),(-,+),(-,-)}\`. Since points are x-sorted, reverse the five-point ordering whenever \`sx=-1\`, fit only the shared 2D translation (mean displacement), and report root-mean-square residual over five corresponding point centers. A 180° rotation is the combined two-axis reflection.

| Source pair | Best signed transformation | Fitted 2D translation (pixels) | RMS centroid residual | Best of other 3 signs |
|---|---|---|---:|---:|
| **p7→p23** | \`(+1,-1)\`: reflect vertically | \`(-0.0438,+3674.0737)\` | **0.073396 px** | 150.390866 px |
| **p7→p56** | \`(-1,+1)\`: reflect horizontally | \`(+2400.6932,-419.3174)\` | **0.207292 px** | 150.343932 px |
| **p23→p56** | \`(-1,-1)\`: rotate 180° | \`(+2400.6493,+3254.7563)\` | **0.204643 px** | 150.352876 px |

The three transformations compose consistently (p7→p23 followed by p23→p56 gives p7→p56, modulo native-image centroid measurement noise). The third figure is therefore a **geometrically precise new cross-page extension** of the earlier p7/p23 mirror.

**Independent ink-mask check of the new pair.** Reflect the native p7 binary ink ROI \`[2800:3240,720:1660]\` horizontally; apply the centroid-derived integer translation \`(dx=2,dy=-419)\` to the corresponding original p56 ROI. The 440×940 pixel masks have foreground intersection-over-union **0.959188057** and exactly **760 differing binary pixels**, substantially strengthening the point-only comparison. The masks are genuine source raster data, so small differences from antialiasing/JPEG quantization do not imply different drawn symbols.

One-file Python reproducer: [\`sims/lp2_p7_p23_p56_dot_triad_sft.py\`](../sims/lp2_p7_p23_p56_dot_triad_sft.py), requiring NumPy and OpenCV and the three immutable original scans. The script hashes and validates all images, extracts all fifteen centers and asserts the pairwise directions, low RMS, wrong-direction gaps and native-mask overlap; local execution passed.

## Exhaustive original 75-image five-dot stencil census

The exact source geometry supplies a discriminating *cross-volume* prediction. Three source images p7/p23/p56 realize three different axial reflection signs of the same five-circle stencil. If the missing fourth sign corresponds to a solved LP1 page, a human player could potentially derive an additional independently solved-text control. The previous full LP2 census found no fourth copy among 58 physical LP2 pages; this extension tests **all 17 earlier LP1 source scans** as well, without changing a threshold or search parameter.

[The updated original-image SFT](../sims/lp2_all58_fivedot_stencil_census_sft.py) reads **all 75 original 2400×3600 JPEGs, numbered 00.jpg–74.jpg**. Each page is searched in the same source image region `x=600..1899, y=200..3349` by 8-connected ink contours at grayscale threshold 160. An isolated candidate dot must have width/height **45–100 pixels** and contour area **1,900–6,000 square pixels**. The p7 five-point template is held fixed. Exhaust exactly four sign flips and image translations anchored at a source point and candidate center. Count matches at **≤3.0 px**, with no fitted scale, arbitrary rotation, affine/shear distortion or cipher-language score. The local original ZIP reproducer checked the newly added **17 LP1 pages**, and the prior same-method LP2 scan already checked all **58 LP2 pages**; the updated SFT asserts their combined histogram and three originals' signed orientations.

| Template points matched | LP1 archive 00–16 (17) | LP2 archive 17–74 (58) | All original 75 | Matching full-copy pages |
| ---: | ---: | ---: | ---: | --- |
| 5/5 | **0** | **3** | **3** | **24.jpg (p7), 40.jpg (p23), 73.jpg (p56)** |
| 1/5 | 5 | 11 | **16** | Incidental single contours |
| 0/5 | 12 | 44 | **56** | All remaining originals |
| 2/5, 3/5, 4/5 | 0 | 0 | **0** | None |

The exact transformation signs relative to LP2 p7 are identity for p7, vertical reflection for p23 and horizontal reflection for p56. The fourth sign, the **180° rotation relative to p7**, has **no complete same-sized stencil** among either release's 75 preserved scans. A fixed figure may simply have been reused for section framing; the absence of the remaining reflection neither identifies a missing page nor implies an external hidden service. The census excludes complete copies at this original scale under the frozen shape/centroid model, and it does not exclude a differently scaled, modified or partially obscured illustration.

## Source-oriented solved-p56 cipher transfer: original negative

A newly constrained operation can be attempted without free phase or fitting. p56 is a **genuine solved 85-rune cipher** using the prime-totient subtraction \`P_i=(C_i-(prime_i-1)) mod29\`, prime start2, with its one original literal \`F\` at offset56 not consuming a prime key. Decode the authentic p56 and assert its full recovered transliteration:

\`ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE\`

This control recovers **85/85** rune indices and exactly re-encrypts them. It has coincidence index **0.0700280112**, in contrast to the ciphertext's **0.0324929972**.

The figure fixes two *text-traversal* candidates before looking at their decrypted rune text:

- p7→p56 is a **horizontal reflection**. Reverse source rune order within **each printed line**, retaining the original line order; apply the same p56 prime-totient subtraction from its initial key position, consuming one prime per rune (the p56 literal-F exception is not independently specified for p7).
- p23→p56 is a **180° rotation**. Reverse the printed line order and the rune order within each line, then apply the same prime-totient operation. Printed punctuation and line breaks are not silently converted to runes.

The source transcription's printed-line parser is checked rune-for-rune against the unchanged canonical corpus before either transformation. The p7 input is **208** runes and p23 is **213**. Each direct arithmetic inverse reencrypts the exact original oriented ciphertext. Their decoded IoCs are:

| Original source | Source-selected orientation | Plaintext-candidate IoC |
|---|---|---:|
| p7 | horizontal-line reverse | **0.033445** |
| p23 | both line and line-order reverse | **0.036717** |

Both are indistinguishable from random-looking GP29 in this diagnostic and produce no readable sustained passage. The already known p56 cipher control is clearly detectable by the same function.

An even narrower 85-rune transfer uses the **exact first-85 p56 additive shifts**, obtained from its authentic known \`C_i,P_i\` pair including the literal-F event, as an identical fixed pad beginning with the first source-oriented rune of p7/p23. This avoids selecting a distinct prime-clock policy for target pages. The p7/H first85 IoC is **0.03557423**; p23/HV first85 is **0.03613445**. Both decode to nonlinguistic GP rune strings, and forward remasking returns all 85 original source rune indices. These two operations are **finite negatives**, and the pad-copy test is particularly limited by its short 85-rune length.

CommonJS reproducer (with exact known p56 plaintext and forward controls): [\`sims/lp2_dot_triad_p56_prime_transfer_sft.cjs\`](../sims/lp2_dot_triad_p56_prime_transfer_sft.cjs). No unknown LP2 plaintext, source-selected key, cipher architecture or final destination results.

### Conditional solved-p56 plaintext-key transfer (12 November 2026)

One historically demonstrated *distinct* operation remained from the 2014 Stage04 source: a previous **solved GP29 plaintext** served as the repeating Vigenère key for a source-selected subsequent image. The exact p7/p23/p56 five-dot triad independently identifies p56 and each source page's orientation, supplying a narrow test without inventing a ciphertext-derived key. Derive the complete **85-rune solved p56 GP plaintext** by its independently authenticated prime-totient cipher (including the known literal-F exception), then use that GP-index string as an unchanged **period-85 additive key**, starting at zero on both physically oriented p7 and p23. The artwork fixes horizontal line reflection for p7 and 180-degree page rotation for p23. **The key itself contains normal F runes; no F-skip, fitted phase, excerpt or per-page reset is introduced.**

Results on the entire original source-oriented p7 (208 runes) and p23 (213 runes) have IoC **0.035395763657** and **0.034148285942**, respectively, with no readable plaintext. The same key exactly round-trips an authentic p57 GP-text plant of length 213, and forward-masking both candidate outputs reproduces every original source-oriented rune. [One-file SFT](../sims/lp2_dot_triad_solved_p56_plaintext_key_sft.cjs). This excludes this single historically motivated solved-text-key interpretation, **not** other possible uses of the geometric motif. The 2014 solved-text-key precedent does not establish that the authors intended this motif to select that operation.

## Decision for the next solve path

**Established:** these three five-dot source drawings are linked by precise, mutually consistent axial reflections. Earlier work recognized the first mirror; solved p56 supplies a genuinely new third anchor. A contemporary viewer could discover the complete motif by comparing original pages, and this is a reusable visual cross-reference.

**Unsupported:** that their reflection dictates any rune-reading order, key exchange, or reuse of p56's prime-totient schedule. The two most literal source-oriented p56 transfers failed to expose plaintext. The near-identical motif geometry is entirely compatible with a reused illustration.

Do not reuse the p7/p23-centred 16-page Fibonacci, p56 prime-start search or the many unconstrained additive/key-skip tests. The useful reopening gate is an **independently source-visible instruction identifying why the p56 version of the figure is a control rather than decoration**, together with a reversible operation and a prediction on a previously unseen original page or text interval. A new clue about the drawing's identity, or a source-specified reflection operating on a different carrier, would justify one bounded inverse. Until then retain the triad as intermediate original-artifact evidence.
