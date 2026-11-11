# Cross-release red dot stencils: 13-dot template and four 10-dot block markers

**10 November 2026, source-image finding.** The supposedly separate red “3×3” motifs on LP2 physical pp7 and56 are repetitions of the standard **13-dot, 3-column × 5-row punctuation glyph**. Their normalized dot coordinates are identical across both pages and all 31 LP2 13-dot marks. This closes the *page-distinctive red constellation-shape* premise; it neither supplies plaintext nor excludes a hypothetical global star-name convention.

## Exact source results

The 75 original JPEG scans are numbered 00–74. LP1 occupies archive scans 00–16; LP2 physical page p is archive p+17. A separate, earlier LP1 image called “page 7” in some historical numbering is **archive 05**, while LP2 physical p7 is **archive 24**. Distinguishing them is essential.

A read-only OpenCV scan, using the same connected-component thresholds and 31-pixel dot clustering as the established LP2 red-shape census, gives:

| Release | Top-to-bottom occupancy | Red instances |
| --- | --- | ---: |
| LP1 | .#. / ### / ### / ### / .#. | **20** (11-dot) |
| LP1 | ### / .#. / ### / ### | **9** (10-dot) |
| LP2 | .#. / ### / ### / ### / ### | **30** (13-dot) |
| LP2 | ### / .#. / ### / ### | **4** (10-dot) |
| LP2 | .###. / ##### / ##### / ##### / ##### | **1** (23-dot) |

The LP2 inventory additionally identifies one **black** 13-dot glyph on p7; that makes 31 total 13-dot marks, without altering this red-only table. The LP2 13-dot glyph contains the LP1 11-dot occupancy plus the two lower-corner dots. The 10-dot stencil remains the same across releases. Its four LP2 placements are structural block boundaries (the p36/p38 numbered passage, p49 table, and p56 digest), while the solved p56 control rejects a universal cipher reset. All findings concern printed layout; no authenticated 10-dot cipher operation is established.

| Original file (native 2400×3600) | SHA-256 | Red groups, dot count and minimum dot-center (x,y) |
| --- | --- | --- |
| 05.jpg (LP1) | 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7 | 11: (1068, 691.5); 11: (882, 2014.5) |
| 24.jpg (LP2 p7) | 91a726a7dd59c6caa4d736b9ce72ceba0a2fa827d6b69a2d4057562b9303636c | 13: (727, 2477); 13: (1637.5, 2477) |
| 73.jpg (LP2 p56) | a4c1c9ae1246c3197fc1d7bd0155cbc97f60d4bba84a104d45f180feab1814dc | 13: (968, 691.5); 10: (1058.5, 1080.5); 13: (1562, 2096) |

## Four LP2 10-dot marks: identical glyph and structural block edges

The four red 10-dot marks are one repeated source stencil, not four page-specific shapes. On the original 2400×3600 JPEGs each is the same upright **3-column × 4-row** occupancy **###/.#./###/###**; every dot is a 9–10 px square. The center spans are approximately 29–30 px horizontally by 51–52 px vertically. The normalized occupancy, dot size, and orientation are identical in all four images; each marker sits at a text-block edge rather than as an arbitrary in-line glyph.

| Physical LP2 page | Original JPEG | Rune offset after mark | Minimum → maximum dot-center (x,y) | Center span (px) | Dot width × height (px) | Visible baseline / block role |
| ---: | --- | ---: | --- | --- | --- | --- |
| **p36** | 53.jpg | **99** | (978, 1456.5) → (1008, 1508) | 30 × 51.5 | 9 × 9–10 | At the right edge of the preceding line, immediately before red paragraph number **1**; opens the five-numbered cuneiform passage |
| **p38** | 55.jpg | **186** | (605, 2545) → (634, 2596) | 29 × 51 | 9–10 × 9–10 | At the left edge of the next block after numbered paragraph **5**; following text shares the printed line, so this is not a literal LF control |
| **p49** | 66.jpg | **66** | (1695.5, 1080.5) → (1725, 1132) | 29.5 × 51.5 | 9–10 × 9–10 | At the right edge of the 66-rune text lead-in, immediately before the **32×8 numeric table** |
| **p56** | 73.jpg | **45** | (1058.5, 1080.5) → (1088, 1132) | 29.5 × 51.5 | 9–10 × 9–10 | At the right edge after the first 45 plaintext runes, immediately before the non-runic **128-hex-digit SHA-512 digest**; 40 prose runes resume after it |

The p36/p38 pair brackets the source-confirmed **553-rune, five-numbered-paragraph** passage: p36's 139-rune suffix + all 228 runes of p37 + p38's 186-rune prefix. The p49 and p56 marks likewise sit at transitions between GP prose and non-rune material (the numeric table and hash digest). This is the useful human-visible distinction from ordinary 13-dot punctuation: the 10-dot class marks **structural block boundaries**. It does not, by itself, specify a cipher reset, a key advance, or a new cipher mode. The p56 13-dot mark after the red AN END heading is inline, whereas its 10-dot mark precedes the inserted digest.

The p56 cryptographic control is already fully tested, not a new search: [the solved-clock report](./lp2-punctuation-solved-clock.md) and [its source-input SFT](../sims/lp2_punctuation_solved_clock_sft.cjs) enumerate all nine pass/advance/reset combinations at the internal 13-dot (offset 5) and 10-dot (offset 45). Only pass/pass recovers **85/85** known runes; resetting at the 10-dot gives **48/85** (only **3/40** after offset 45), and advancing there gives **46/85**. The wrong-13-dot reset control at offset 5 gives **6/85**. All nine models re-encipher their own decoded streams exactly, so round-trip alone cannot select the historical clock. The authentic p56 φ(prime) stream passes both marks without consuming or resetting a prime. Therefore the source evidence supports a structural separator, **not a universal 10-dot cipher delimiter**.

Reproduction: python sims/lp_stencil_cross_release.py resources/liber-primus or the original JPEG ZIP. The script now emits the labelled four-page occurrence table, normalized stencil, center extents, and dot-size ranges, while retaining the all-75-image LP1/LP2 census and existing assertions.
## Key-independent decision before a constellation search

The issue proposed matching distinctive red pp7/56 shapes against a predeclared star catalogue. No such *distinctive* source shapes exist. Each of the four red 13-dot examples on the two pages has the same exact normalized 3×5 occupancy as every LP2 13-dot glyph. It is a typeset punctuation template.

Condition on the 31 source-authenticated LP2 13-dot instances and use any fixed catalogue-fit score that depends on normalized dot occupancy under the issue's permitted similarity/reflection transforms. Every possible choice of two instances as the “p7” and “p56” pair has the same occupancy and the same best catalogue score. The exact page-label matched-null fraction scoring at least as well is **1**, independent of what catalogue is used. Fitting a star name would merely label a repeatedly printed punctuation glyph and cannot supply an independently selected page-to-page correspondence. JPEG compression subpixel differences do not represent intentional new star coordinates.

This is a bounded source-identifiability exclusion, not a universal proof against any astronomical interpretation. It does not alter the separate, already-screened five-black-dot artwork. A different independent visual cue would be needed to select a cipher or key. The known φ(prime) cipher on solved p56 consumes no key steps for its 13-dot and 10-dot punctuation, so that solved page already provides a source-authenticated punctuation-clock control.

## Reproduction and research handoff

Run the read-only **sims/lp_stencil_cross_release.py** with the repository image directory or with the supplied original ZIP path. Its five red-count assertions passed against all 75 original archive JPEGs, and it emits the exact shape cells, positions, and the three selected SHA-256 checksums. It does not modify **resources/liber-primus/lp2-ink-annotations.json**, the 256-event array, or any 32×8 grid data.

Prior LP2 source census and black exception: **im-results/red-microdot-motif-inventory.md**. Prior black-five-dot matched constellation negative: **im-results/black-dot-template-reflections.md**. The observation about a cross-release 11-to-13 redesign is a hypothesis-generating source fact, not a cryptanalytic key or decryption. A next-step test should require an independent source instruction assigning these punctuation counts to an operation before interpreting ciphertext.
