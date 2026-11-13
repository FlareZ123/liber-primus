# Page-conditioned audit of the Round-44 doublet-gap anomaly

**Decision:** the external Round-44 T7 result is not robust evidence for a non-stationary anti-repeat filter. Its headline lag-1 autocorrelation reproduces exactly, but much of the signal is carried by gaps that cross page boundaries. Under a page-aware null that preserves page lengths, per-page doublet counts, and the observed minimum site separation, the centered two-sided p-value is 0.0172, above the external preregistered familywise per-test threshold of 0.00143. Conditioning further on each page's first and last site positions raises it to 0.163. The within-page-only gap-pair autocorrelation is -0.049, and the 1,000-rune block-count series has negative, not positive, lag-1 autocorrelation (-0.190).

This is an intermediate methodological correction, not a plaintext or key discovery. It does not prove the filter is stationary; it removes the evidential basis for promoting T7 as a live generation-process anomaly without a page-aware, independently powered follow-up.

## 1. External claim and exact reproduction

Dukotah's Round 44 (2026-11-09 to 11) reported 86 equal-adjacent sites in the 12,956-rune unsolved stream, 85 inter-site gaps, Pearson lag-1 gap autocorrelation +0.3800196892, and a global site-matched-shuffle p=0.0010. An independent 20,000-draw permutation of the gap sequence gave p=0.00025. The report interpreted this as a smoothly varying slip rate and nominated it as the main Round 45 lane.

Using this repository's page-indexed corpus, independently extracting equal adjacent runes reproduces the exact 86-site census and the exact +0.380019689241 autocorrelation. The unsolved stream is 55 nonempty LP2 pages (physical pages 0–49 and 51–55; page 50 is runeless), 12,956 runes, 86 sites, and 85 gaps. The minimum observed inter-site gap is 6.

The external source computes T7 on the concatenated stream. Its nulls do not condition on the physical page segmentation or the locations of the first/last site on each page.

## 2. Where the autocorrelation lives

Of the 85 gaps, **41 cross a page boundary**. The 84 adjacent gap-pairs divide as follows:

| Pair type | Count | Pearson correlation |
|---|---:|---:|
| Both gaps within the same page (WW) | 21 | -0.0494 |
| Within-page, then cross-page (WX) | 23 | +0.1260 |
| Cross-page, then within-page (XW) | 22 | +0.0682 |
| Both gaps cross page boundaries (XX) | 18 | +0.4231 |

The 18 XX pairs correspond to the 18 interior pages with exactly one doublet site; 19 pages have one site in total, with the last one-site page at the end of the site-bearing sequence. The full +0.380 signal is therefore not a within-page gap process. It is dominated by the geometry of gaps that bridge page boundaries and pages containing a single site.

The per-page site-count distribution is 13 pages with 0 sites, 19 with 1, 10 with 2, 8 with 3, 2 with 4, and 3 with 5. The page-count lag-1 correlation is only +0.124.

The external report's descriptive 1,000-rune block counts reproduce as:

[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]

Their lag-1 correlation is **-0.1900**, not positive. Under the page-conditioned count/minimum-gap null below, the block-count autocorrelation is typical (upper-tail p≈0.50). This does not support the report's description of smoothly adjacent doublet-rich and doublet-poor regions.

## 3. Page-conditioned nulls

The reproducible script runs 100,000 accepted Monte Carlo draws with fixed seed 0x6f6c6453. It conditions on the actual page lengths and exact per-page site counts, and it does not allow the null to invent inter-site gaps shorter than the observed minimum of 6. The count-only simulation rejects candidate placements that would create a cross-page gap below 6.

| Null | Mean gap AC1 | SD | 95th percentile | Upper-tail p | Centered two-sided p |
|---|---:|---:|---:|---:|---:|
| Page lengths + per-page counts + min gap 6 | 0.2404 | 0.0605 | 0.3380 | 0.0086 | 0.0172 |
| Above, also preserve each page's first and last site | 0.3464 | 0.0251 | 0.3843 | 0.0816 | 0.1631 |

The first null already moves the result above the external preregistered Bonferroni threshold 0.01/7 = 0.0014286. The second shows that once the observed page-edge sites are held fixed, the remaining within-page placement does not produce an unusual global gap autocorrelation. This second null is deliberately conditional and should be read as a sensitivity diagnosis, not as a universal model of the cipher.

A direct within-page-only statistic uses just the 21 consecutive gap-pairs whose three sites all lie on the same page; its observed correlation is -0.0494. No positive within-page serial structure is visible in this small sample.

## 4. Transcription/layout cross-check

The 86 equal-rune pairs were also re-counted from the page/line/word-marked transcription. Of these, 60 have no separator between the runes, 21 cross a printed word hyphen, 3 cross a line slash, 1 crosses a line slash plus word hyphen, and 1 crosses a period. This is a check of the repository's two derived representations, not an independent re-transcription of the JPEGs. It reinforces that the gap statistic is measured on a serialization that removes physical layout boundaries.

## 5. Research decision

- Do **not** treat the T7 p=0.0010 / p=0.00025 as evidence that the filter's slip rate drifts smoothly across the manuscript.
- Do **not** commission the proposed non-stationary-filter branch on the present statistic alone.
- If reopened, preregister a page-aware statistic and a smooth-heterogeneity positive plant in the original 55-page layout. The plant must preserve page lengths, page boundaries, site counts where conditioned, and the same gap construction; otherwise the null can rediscover page-boundary geometry rather than a cipher mechanism.
- The doublet-site values, positions, and gaps remain unshown as plaintext or key material. No unknown plaintext, authentic key, or destination was recovered.

## Reproduction

From the repository root:

~~~sh
node sims/lp2_doublet_gap_page_conditioned_audit_sft.cjs
~~~

The script reads only:
- resources/liber-primus/lp2-corpus.json
- resources/lp2-transcription.txt

It verifies the 12,956/86/85 source counts, the exact T7 autocorrelation, the page-pair decomposition, the 1,000-rune blocks, and both deterministic page-conditioned Monte Carlo nulls.

## External source files audited

- Round 44 synthesis: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md
- B3 preregistration: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/PREREG.md
- B3 results: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md
- B3 implementation: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/b3lib.py
- Human-oracle queue note: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/ORACLE-T7-QUEUE.md
